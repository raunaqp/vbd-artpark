import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip, useMap } from "react-leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import L, { type Layer, type LatLngBounds, type PathOptions } from "leaflet";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { RotateCcw, Crosshair } from "lucide-react";
import {
  getMapCenter,
  getMapZoom,
  districtCoordinates,
  getFilteredRegions,
  getOutbreakPredictions,
  getDistrictRiskFallback,
  getDistrictHotspotRisk,
  getFilteredHotspots,
  stateCoversAllDistricts,
} from "@/data/mockData";
import { Skeleton } from "@/components/ui/skeleton";
import { useFilters } from "@/contexts/FilterContext";
import { useStateSelection } from "@/contexts/StateContext";
import {
  gbaCorporationLayer,
  gbaWardLayer,
  kaTalukLayer,
  kaWardLayer,
  kaWardMunicipality,
  mockBlockToTalukName,
  positionalJoin,
  nameJoin,
  featureKey,
  type PolygonJoin,
} from "@/lib/boundaryLayers";
import type { RegionData } from "@/data/mockData";
import "leaflet/dist/leaflet.css";

// ──────────────── Risk colors (semantic but inline-required by leaflet) ────────────────
// Forecast-only semantic colors (low/moderate/high). Raw case + hotspot maps must NOT use these.
const riskColor: Record<string, string> = {
  low: "#22c55e",
  moderate: "#eab308",
  high: "#ef4444",
};
// Hotspot burden colors — same green/yellow/red palette but represents recent
// hotspot case load (last 2W / 4W), NOT predicted outbreak risk. The map legend
// makes the distinction explicit.
const hotspotBurdenColor: Record<string, string> = {
  low: "#16a34a",
  moderate: "#f59e0b",
  high: "#dc2626",
};
const NO_DATA_COLOR = "#cbd5e1"; // neutral slate for unmatched polygons
const trendArrow: Record<string, string> = { up: "↑", down: "↓", stable: "→" };

// Single-hue blue intensity scale for case-load encoding (Overview "current" mode).
// Light → dark = fewer → more cases.
const BLUE_SCALE = ["#dbeafe", "#bfdbfe", "#93c5fd", "#60a5fa", "#3b82f6", "#1d4ed8"];
function blueForIntensity(value: number, max: number): string {
  if (max <= 0 || value <= 0) return BLUE_SCALE[0];
  // sqrt scaling so a few large districts don't crush smaller ones
  const t = Math.min(1, Math.sqrt(value) / Math.sqrt(max));
  const idx = Math.min(BLUE_SCALE.length - 1, Math.floor(t * BLUE_SCALE.length));
  return BLUE_SCALE[idx];
}
// Sub-linear circle radius (sqrt + log) so big counts don't dominate the map.
function circleRadius(numCases: number): number {
  if (!Number.isFinite(numCases) || numCases <= 0) return 3;
  const r = 3 + Math.sqrt(numCases) * 0.9 + Math.log2(numCases + 1) * 0.6;
  return Math.max(4, Math.min(16, r));
}

// ──────────────── GeoJSON URLs (datameet-style mirror via jsDelivr CDN) ────────────────
const GEOJSON_URLS: Record<string, string> = {
  andhra_pradesh:
    "https://cdn.jsdelivr.net/gh/datta07/INDIAN-SHAPEFILES@master/STATES/ANDHRA%20PRADESH/ANDHRA%20PRADESH_DISTRICTS.geojson",
  odisha:
    "https://cdn.jsdelivr.net/gh/datta07/INDIAN-SHAPEFILES@master/STATES/ORISSA/ODISHA_DISTRICTS.geojson",
  karnataka:
    "https://cdn.jsdelivr.net/gh/datta07/INDIAN-SHAPEFILES@master/STATES/KARNATAKA/KARNATAKA_DISTRICTS.geojson",
};

// Locally-bundled real boundaries (no network fetch), built on first use from
// `src/data/boundaries.ts`. Thunks rather than values so the 6 MB polygon module
// is only walked when a state that needs it is actually selected.
// Checked before GEOJSON_URLS.
const LOCAL_GEOJSON: Record<string, () => FeatureCollection> = {
  gba_central: gbaCorporationLayer,
};

// In-memory cache (lives for the session); also mirrored to sessionStorage so a reload reuses it.
const geoCache = new Map<string, FeatureCollection>();

async function fetchStateGeoJSON(stateId: string): Promise<FeatureCollection | null> {
  // Local real boundaries take precedence over the remote CDN pattern.
  if (LOCAL_GEOJSON[stateId]) {
    if (!geoCache.has(stateId)) geoCache.set(stateId, LOCAL_GEOJSON[stateId]());
    return geoCache.get(stateId)!;
  }
  if (geoCache.has(stateId)) return geoCache.get(stateId)!;
  // sessionStorage backup
  try {
    const cached = sessionStorage.getItem(`geo:${stateId}`);
    if (cached) {
      const parsed = JSON.parse(cached) as FeatureCollection;
      geoCache.set(stateId, parsed);
      return parsed;
    }
  } catch { /* ignore */ }

  const url = GEOJSON_URLS[stateId];
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as FeatureCollection;
    geoCache.set(stateId, data);
    try { sessionStorage.setItem(`geo:${stateId}`, JSON.stringify(data)); } catch { /* quota */ }
    return data;
  } catch {
    return null;
  }
}

// Normalize district names so source GeoJSON ↔ mock data align reliably.
function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Aliases: normalized GeoJSON name → mock-data district name.
// Keeps the same district consistent across map / tables / tooltips.
const DISTRICT_ALIASES: Record<string, string> = {
  // Andhra Pradesh
  "sripottisriramulunell": "S.P.S. Nellore",
  "sripottisriramulunellore": "S.P.S. Nellore",
  "spsnellore": "S.P.S. Nellore",
  "nellore": "S.P.S. Nellore",
  "ysr": "Y.S.R.",
  "ysrkadapa": "Y.S.R.",
  "kadapa": "Y.S.R.",
  // Odisha
  // GeoJSON polygon names (Baleshwar / Baleswar) must resolve to our seed/data
  // district name "Balasore" so the polygon for Balasore picks up the correct
  // hotspot / forecast / case-load values across every tab. Previously these
  // mapped to "Baleshwar", leaving the Balasore polygon unmatched while the
  // adjacent Ganjam polygon (also unmatched/synthesized) appeared to "absorb"
  // the high-risk styling.
  "balasore": "Balasore",
  "baleshwar": "Balasore",
  "baleswar": "Balasore",
  "jagatsinghpur": "Jagatsinghapur",
  "jagatsinghapur": "Jagatsinghapur",
  "jajapur": "Jajpur",
  "jajpur": "Jajpur",
  "khordha": "Khordha",
  "khurda": "Khordha",
  "kendrapara": "Kendrapada",
  "kendrapada": "Kendrapada",
  "subarnapur": "Sonepur",
  "sonepur": "Sonepur",
  "deogarh": "Debagarh",
  "debagarh": "Debagarh",
  "anugul": "Angul",
  // Karnataka
  "bengaluruurban": "Bengaluru Urban",
  "bangaloreurban": "Bengaluru Urban",
  "bengalururural": "Bengaluru Rural",
  "bangalorerural": "Bengaluru Rural",
  "belgaum": "Belagavi",
  "belagavi": "Belagavi",
  "mysore": "Mysuru",
  "mysuru": "Mysuru",
  "tumkur": "Tumakuru",
  "tumakuru": "Tumakuru",
  "shimoga": "Shivamogga",
  "shivamogga": "Shivamogga",
  "bijapur": "Vijayapura",
  "vijayapura": "Vijayapura",
  "gulbarga": "Kalaburagi",
  "kalaburagi": "Kalaburagi",
  "chikmagalur": "Chikkamagaluru",
  "chikkamagaluru": "Chikkamagaluru",
  "chamrajnagar": "Chamarajanagara",
  "chamarajanagara": "Chamarajanagara",
};

function getFeatureDistrictName(feature: Feature): string {
  const props = (feature.properties || {}) as Record<string, unknown>;
  return String(props.dtname || props.DISTRICT || props.district || props.NAME || props.name || "");
}

// ──────────────── Component ────────────────
interface DashboardMapProps {
  height?: string;
  /**
   * "current"  → color polygons by past-cases risk (RegionData)
   * "forecast" → color polygons by predicted outbreak risk (OutbreakPrediction)
   * "hotspot"  → color polygons by hotspot data (HotspotData) — same source as the hotspot table
   */
  mode?: "current" | "forecast" | "hotspot";
  /** Hotspot lookback window. Only used when mode === "hotspot". */
  hotspotLookbackWeeks?: 2 | 4;
}

// Helper: imperatively update the map view when center/zoom inputs change.
// `viewKey` forces a re-fit even if values are referentially equal across renders
// (e.g. after a state change resets to the same default zoom).
function MapViewUpdater({ center, zoom, bounds, viewKey }: { center: [number, number]; zoom: number; bounds?: LatLngBounds | null; viewKey: string }) {
  const map = useMap();
  useEffect(() => {
    // The map is created before its card has settled to full size, so Leaflet's
    // cached container size can be stale — which makes fitBounds compute a far
    // too low zoom and leave a drill-down looking like the state view.
    map.invalidateSize({ animate: false });
    if (bounds) {
      map.fitBounds(bounds, { padding: [24, 24], animate: true });
    } else {
      map.setView(center, zoom, { animate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewKey]);
  return null;
}

export default function DashboardMap({ height = "400px", mode = "current", hotspotLookbackWeeks = 4 }: DashboardMapProps) {
  const { appliedFilters, drillDown, breadcrumb, isLocked, dateWindow } = useFilters();
  const { stateId } = useStateSelection();

  const regions = getFilteredRegions(appliedFilters);
  const predictions = mode === "forecast" ? getOutbreakPredictions(appliedFilters) : [];
  const predByArea = useMemo(() => new Map(predictions.map((p) => [p.area, p])), [predictions]);
  // Hotspot mode → state-level hotspot list, same source the hotspot table reads from.
  const hotspotsForMap = mode === "hotspot" ? getFilteredHotspots({ ...appliedFilters, district: "All Districts", block: "All Blocks", ward: "All Wards" }, hotspotLookbackWeeks) : [];
  const hotspotByArea = useMemo(() => new Map(hotspotsForMap.map((h) => [h.area, h])), [hotspotsForMap]);

  // Build a quick-lookup map: normalized district name → region
  const districtRiskByName = useMemo(() => {
    const map = new Map<string, typeof regions[number]>();
    regions
      .filter((r) => !r.type || r.type === "district")
      .forEach((r) => {
        map.set(normalize(r.name), r);
      });
    return map;
  }, [regions]);

  // ─── Fetch GeoJSON for active state (cached) ───
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
  const [loadingGeo, setLoadingGeo] = useState(true);
  const [geoStateId, setGeoStateId] = useState<string | null>(null);
  // Bumped on Recenter button to force map refit.
  const [recenterTick, setRecenterTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoadingGeo(true);
    // Drop stale geometry immediately so we never paint the previous state's boundaries.
    setGeoData(null);
    setGeoStateId(null);
    fetchStateGeoJSON(stateId).then((data) => {
      if (!cancelled) {
        setGeoData(data);
        setGeoStateId(stateId);
        setLoadingGeo(false);
      }
    });
    return () => { cancelled = true; };
  }, [stateId]);

  // Geo data must match the active state before we render anything.
  const geoReady = !!geoData && geoStateId === stateId;

  // ─── Hierarchy & view computation ───
  const isStateLevel = appliedFilters.district === "All Districts";
  const isDistrictLevel = appliedFilters.district !== "All Districts" && appliedFilters.block === "All Blocks";
  const isBlockLevel = appliedFilters.block !== "All Blocks";

  let center: [number, number] = getMapCenter();
  let zoom: number = getMapZoom();
  if (isBlockLevel && districtCoordinates[appliedFilters.block]) {
    center = districtCoordinates[appliedFilters.block];
    zoom = 12;
  } else if (isDistrictLevel && districtCoordinates[appliedFilters.district]) {
    center = districtCoordinates[appliedFilters.district];
    zoom = 9;
  }

  // Map a polygon feature → mock-data district name (with alias fallback)
  const featureToMockName = (feature: Feature): string | null => {
    const raw = getFeatureDistrictName(feature);
    if (!raw) return null;
    const norm = normalize(raw);
    if (DISTRICT_ALIASES[norm]) return DISTRICT_ALIASES[norm];
    if (districtRiskByName.has(norm)) return districtRiskByName.get(norm)!.name;
    return raw;
  };

  // Compute bounds of selected district polygon (for fitBounds zoom)
  const selectionBounds = useMemo<LatLngBounds | null>(() => {
    if (!geoData || isStateLevel) return null;
    const target = isBlockLevel ? appliedFilters.district : appliedFilters.district;
    const feature = geoData.features.find((f) => featureToMockName(f) === target);
    if (!feature) return null;
    try {
      const layer = L.geoJSON(feature as any);
      const b = layer.getBounds();
      return b.isValid() ? b : null;
    } catch { return null; }
  }, [geoData, isStateLevel, isBlockLevel, appliedFilters.district, appliedFilters.block]);

  // Date range label for tooltip (e.g. "17 Jan - 17 Apr 2026")
  const fmtShort = (iso: string) => {
    const [y, m, d] = iso.split("-");
    return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  };
  const fmtFull = (iso: string) => {
    const [y, m, d] = iso.split("-");
    return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };
  void dateWindow; // used inside tooltips below

  // ─── Polygon style + behavior ───
  // SINGLE SOURCE OF TRUTH:
  //   • current mode  → state-level transformed regions (via getDistrictRiskFallback)
  //   • forecast mode → state-level predictions (predByArea)
  //   • hotspot mode  → state-level hotspots (hotspotByArea), same source as the table
  // This guarantees a district's color/risk never changes between state view,
  // drill-down view, and table view.
  const resolveDistrictRisk = (name: string | null): {
    risk: "high" | "moderate" | "low" | null;
    cases: string;
    week?: string;
    trend?: "up" | "down" | "stable" | null;
  } => {
    if (!name) return { risk: null, cases: "—" };

    if (mode === "forecast") {
      const pred = predByArea.get(name);
      if (pred) return { risk: pred.risk, cases: `${pred.probability}%`, week: pred.expectedWeek };
      // Fallback: synthesize a risk for districts without an explicit forecast
      // entry so every polygon is shaded (mock-data parity across the state).
      const fb = getDistrictRiskFallback(name, appliedFilters);
      if (fb.synthesized && !stateCoversAllDistricts()) return { risk: null, cases: "—" };
      return { risk: fb.risk, cases: `${fb.confirmed}` };
    }


    if (mode === "hotspot") {
      const norm = normalize(name);
      const direct = hotspotByArea.get(name);
      if (direct) return { risk: direct.risk, cases: `${direct.currentCases}`, trend: direct.trend };
      for (const h2 of hotspotsForMap) {
        if (normalize(h2.area) === norm) return { risk: h2.risk, cases: `${h2.currentCases}`, trend: h2.trend };
      }
      return { risk: null, cases: "—" };
    }

    // current mode → always state-level derived district (consistent across drill-downs)
    const fb = getDistrictRiskFallback(name, appliedFilters);
    // For states with partial coverage (e.g. Odisha), boundary-only / synthesized
    // districts render grey ("Data not available") instead of inventing a risk.
    if (fb.synthesized && !stateCoversAllDistricts()) {
      return { risk: null, cases: "—" };
    }
    return { risk: fb.risk, cases: `${fb.confirmed}`, trend: fb.trend };
  };

  const hasSelection = !isStateLevel;
  // Forecast = risk choropleth. Hotspot = grey polygons + sized circles. Current = blue-intensity choropleth.
  const useNeutralPolygons = mode === "hotspot";
  const useBlueChoropleth = mode === "current";



  // Max case count across districts → drives blue intensity scale at state level.
  const maxDistrictCases = useMemo(() => {
    if (!geoData) return 0;
    let max = 0;
    geoData.features.forEach((f) => {
      const name = featureToMockName(f);
      if (!name) return;
      const fb = getDistrictRiskFallback(name, { ...appliedFilters, district: "All Districts", block: "All Blocks", ward: "All Wards" });
      if (fb.synthesized && !stateCoversAllDistricts()) return;
      max = Math.max(max, fb.confirmed || 0);
    });
    return max;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoData, stateId, appliedFilters.fromDate, appliedFilters.toDate]);

  const styleFeature = (feature?: Feature): PathOptions => {
    if (!feature) return {};
    const name = featureToMockName(feature);
    const { risk, cases } = resolveDistrictRisk(name);
    const isSelected = name === appliedFilters.district;
    const dimmed = hasSelection && !isSelected;

    if (useNeutralPolygons) {
      // Hotspots map: light grey base, circles do the work.
      return {
        fillColor: NO_DATA_COLOR,
        fillOpacity: isSelected ? 0.45 : dimmed ? 0.1 : 0.18,
        color: isSelected ? "#0f172a" : "#94a3b8",
        weight: isSelected ? 2.5 : 1,
        opacity: dimmed ? 0.55 : 1,
      };
    }

    if (useBlueChoropleth) {
      // Overview "current" map: single-hue blue scale, light → dark = fewer → more cases.
      const numCases = Number(cases);
      const fill = Number.isFinite(numCases) && numCases > 0
        ? blueForIntensity(numCases, maxDistrictCases)
        : NO_DATA_COLOR;
      return {
        fillColor: fill,
        fillOpacity: isSelected ? 0.9 : dimmed ? 0.2 : 0.78,
        color: isSelected ? "#0f172a" : dimmed ? "#94a3b8" : "#475569",
        weight: isSelected ? 2.5 : 1,
        opacity: dimmed ? 0.55 : 1,
      };
    }

    // Forecast risk choropleth
    return {
      fillColor: risk ? riskColor[risk] : NO_DATA_COLOR,
      fillOpacity: isSelected ? 0.82 : dimmed ? 0.15 : risk ? 0.6 : 0.3,
      color: isSelected ? "#0f172a" : dimmed ? "#94a3b8" : "#475569",
      weight: isSelected ? 3 : 1,
      opacity: dimmed ? 0.55 : 1,
    };
  };

  const trendLabel = (t?: "up" | "down" | "stable" | null) =>
    t === "up" ? "↑ Rising" : t === "down" ? "↓ Falling" : t === "stable" ? "→ Stable" : "";

  const onEachFeature = (feature: Feature<Geometry>, layer: Layer) => {
    const name = featureToMockName(feature);
    const { risk, cases, week, trend } = resolveDistrictRisk(name);
    const riskLabel = risk ? risk.charAt(0).toUpperCase() + risk.slice(1) : "Data not available";
    const displayName = name || getFeatureDistrictName(feature);
    const observedDateRange = `${fmtShort(dateWindow.fromDate)} - ${fmtFull(dateWindow.toDate)}`;
    const trendStr = trendLabel(trend);

    const tooltip = mode === "forecast"
      ? `
        <div style="font-size:12px;line-height:1.45;min-width:180px">
          <div style="font-weight:700;margin-bottom:2px">${displayName}</div>
          <div>Forecast risk: <strong>${riskLabel}</strong></div>
          <div>Outbreak probability: <strong>${risk ? cases : "—"}</strong></div>
          ${week ? `<div style="opacity:0.8">Forecast window: ${week}</div>` : ""}
        </div>`
      : `
        <div style="font-size:12px;line-height:1.45;min-width:160px">
          <div style="font-weight:700;margin-bottom:2px">${displayName}</div>
          <div>Cases (last 4 weeks): <strong>${cases}</strong></div>
          ${trendStr ? `<div style="opacity:0.8">Trend vs prior 4 weeks: ${trendStr}</div>` : ""}
          <div style="opacity:0.7;font-size:11px">Period: ${observedDateRange}</div>
          ${isStateLevel && !isLocked("district") ? `<div style="opacity:0.6;margin-top:3px;font-style:italic">Click to drill down</div>` : ""}
        </div>`;
    layer.bindTooltip(tooltip, { sticky: true });

    layer.on({
      mouseover: (e) => { (e.target as any).setStyle({ weight: 3, color: "#0f172a", fillOpacity: 0.92 }); },
      mouseout: (e) => { (e.target as any).setStyle(styleFeature(feature)); },
      click: () => {
        if (isStateLevel && !isLocked("district") && name) {
          drillDown(name, "district");
        }
      },
    });
  };

  // District-name label centroids (state view only). Rendered as invisible CircleMarkers
  // with a permanent Leaflet Tooltip — keeps district names readable beneath bubbles.
  // Hotspot mode: SKIP permanent labels — names appear in hover tooltip only,
  // keeping the map visually lighter.
  const districtLabelPoints = useMemo(() => {
    if (!isStateLevel || !geoData || mode === "hotspot") return [] as Array<{ name: string; lat: number; lng: number }>;
    const pts: Array<{ name: string; lat: number; lng: number }> = [];
    geoData.features.forEach((f) => {
      const n = featureToMockName(f);
      if (!n) return;
      try {
        const lyr = L.geoJSON(f as any);
        const c = lyr.getBounds().getCenter();
        pts.push({ name: n, lat: c.lat, lng: c.lng });
      } catch { /* ignore */ }
    });
    return pts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoData, isStateLevel, mode]);

  // ─── Real sub-district polygon layer ───
  // States with official geometry render their children as polygons instead of
  // centroid dots. GBA: corporation → official Dec 2025 ward polygons.
  // Everything else falls through to the marker rendering below.
  const subLayer = useMemo<{
    data: FeatureCollection;
    join: PolygonJoin;
    levelLabel: string;
    /** Region types these polygons replace — those markers are suppressed. */
    covers: Array<RegionData["type"]>;
  } | null>(() => {
    if (isStateLevel) return null;
    const district = appliedFilters.district;

    if (stateId === "gba_central") {
      // Mock ward records for the whole corporation, in mock-hierarchy order:
      // zone by zone, wards within each zone. This ordering is what the
      // positional join pairs against, so it must stay deterministic.
      const zones = getFilteredRegions({ ...appliedFilters, district, block: "All Blocks", ward: "All Wards" })
        .filter((r) => r.type === "municipality" || r.type === "block");
      const mockWards = zones.flatMap((z) =>
        getFilteredRegions({ ...appliedFilters, district, block: z.name, ward: "All Wards" }),
      );

      const all = gbaWardLayer(district);
      if (!all.features.length) return null;
      const join = positionalJoin(all, mockWards);

      // Zone (block) selected → show only the wards paired to that zone's mock
      // records. Zones are a mock-hierarchy layer with no counterpart in the
      // official Dec 2025 data, so unpaired polygons have no zone and drop out.
      let data = all;
      if (isBlockLevel) {
        data = {
          type: "FeatureCollection",
          features: all.features.filter((f) => {
            const k = featureKey(f);
            return k ? join.byKey.get(k)?.parentBlock === appliedFilters.block : false;
          }),
        };
      }

      return { data, join, levelLabel: "Ward", covers: ["block", "municipality", "village", "ward"] };
    }

    if (stateId === "karnataka") {
      // A city corporation is selected and we have its ward polygons → drop to
      // municipal ward level. Rural blocks and the cities we have no geometry
      // for fall through to the taluk layer + village markers.
      if (isBlockLevel) {
        const municipality = kaWardMunicipality(district, appliedFilters.block);
        if (municipality) {
          const all = kaWardLayer(municipality);
          if (all.features.length) {
            const mockWards = getFilteredRegions({ ...appliedFilters, ward: "All Wards" })
              .filter((r) => r.type === "ward");
            // Same story as GBA: the mock ward names are placeholders
            // ("Mysuru Ward 1") with no relation to the KGIS names, so pairing
            // is positional. See positionalJoin.
            const join = positionalJoin(all, mockWards);
            return { data: all, join, levelLabel: "Ward", covers: ["ward", "village"] };
          }
        }
      }

      const all = kaTalukLayer(district);
      if (!all.features.length) return null;
      // Only blocks are taluks — city corporations sit alongside them.
      const mockBlocks = getFilteredRegions({ ...appliedFilters, district, block: "All Blocks", ward: "All Wards" })
        .filter((r) => r.type === "block");
      const join = nameJoin(all, mockBlocks, (n) => mockBlockToTalukName(district, n));
      return { data: all, join, levelLabel: "Taluk", covers: ["block"] };
    }

    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateId, isStateLevel, isBlockLevel, appliedFilters.district, appliedFilters.block, appliedFilters.fromDate, appliedFilters.toDate, regions.length]);

  // Report the polygon ↔ mock-data mapping status once per corporation, so the
  // reconciliation gap is visible during demos instead of silently grey.
  const loggedJoinRef = useRef<string | null>(null);
  useEffect(() => {
    if (!subLayer) return;
    const sig = `${stateId}|${appliedFilters.district}`;
    if (loggedJoinRef.current === sig) return;
    loggedJoinRef.current = sig;
    const { polygonCount, mockCount, unmatchedPolygons, unusedMockRecords } = subLayer.join;
    const level = subLayer.levelLabel.toLowerCase();
    console.info(
      `[boundaries] ${appliedFilters.district}: ${polygonCount} official ${level} polygons, ` +
        `${mockCount} mock ${level} records · ${unmatchedPolygons} polygons unshaded (no mock match), ` +
        `${unusedMockRecords} mock records undrawn (no polygon). See known_debt.md.`,
    );
  }, [subLayer, stateId, appliedFilters.district]);

  // Below district level, frame the polygons themselves — fitting the parent
  // district instead leaves a city's wards as an unreadable speck.
  const subBounds = useMemo<LatLngBounds | null>(() => {
    if (!subLayer || !isBlockLevel || !subLayer.data.features.length) return null;
    try {
      const b = L.geoJSON(subLayer.data as any).getBounds();
      return b.isValid() ? b : null;
    } catch { return null; }
  }, [subLayer, isBlockLevel]);

  // Max case count across the sub-layer → drives its blue intensity scale.
  const maxSubCases = useMemo(() => {
    if (!subLayer) return 0;
    let max = 0;
    subLayer.join.byKey.forEach((r) => { max = Math.max(max, r.confirmed || 0); });
    return max;
  }, [subLayer]);

  const styleSubFeature = (feature?: Feature): PathOptions => {
    if (!feature) return {};
    const k = featureKey(feature);
    const rec = k ? subLayer?.join.byKey.get(k) : undefined;
    // The selected child (e.g. the taluk named in the block filter) gets a
    // heavier outline so it reads as the current scope.
    const isSelected = !!rec && rec.name === appliedFilters.block;
    const base: PathOptions = isSelected
      ? { color: "#0f172a", weight: 2.5, opacity: 1 }
      : { color: "#334155", weight: 0.8, opacity: 0.9 };
    if (!rec) {
      // Official polygon with no mock counterpart — drawn, but never shaded.
      return { ...base, fillColor: NO_DATA_COLOR, fillOpacity: 0.25 };
    }
    if (mode === "forecast") return { ...base, fillColor: riskColor[rec.risk], fillOpacity: 0.7 };
    if (mode === "hotspot") return { ...base, fillColor: hotspotBurdenColor[rec.risk], fillOpacity: 0.65 };
    return { ...base, fillColor: blueForIntensity(rec.confirmed, maxSubCases), fillOpacity: 0.8 };
  };

  const onEachSubFeature = (feature: Feature<Geometry>, layer: Layer) => {
    const k = featureKey(feature);
    const rec = k ? subLayer?.join.byKey.get(k) : undefined;
    const props = (feature.properties || {}) as Record<string, unknown>;
    const areaName = String(props.name ?? `Unnamed ${subLayer?.levelLabel.toLowerCase() ?? "area"}`);
    const assembly = props.assembly ? String(props.assembly) : "";
    const parent = rec?.parentBlock ? String(rec.parentBlock) : "";
    const kind = subLayer?.levelLabel ?? "";

    layer.bindTooltip(
      `<div style="font-size:12px;line-height:1.45;min-width:180px">
         <div style="font-weight:700;margin-bottom:2px">${areaName}</div>
         <div style="opacity:0.6;font-size:11px">${[kind, parent].filter(Boolean).join(" · ")}</div>
         ${assembly ? `<div style="opacity:0.6;font-size:11px">${assembly}</div>` : ""}
         ${rec
           ? `<div style="margin-top:3px">Cases: <strong>${rec.confirmed} ${trendArrow[rec.trend] || ""}</strong></div>`
           : `<div style="margin-top:3px;opacity:0.7">Data not available</div>`}
       </div>`,
      { sticky: true },
    );

    layer.on({
      mouseover: (e) => { (e.target as any).setStyle({ weight: 2.5, color: "#0f172a" }); },
      mouseout: (e) => { (e.target as any).setStyle(styleSubFeature(feature)); },
      click: () => {
        // Drill into a taluk/ward the same way its marker used to behave.
        if (isDistrictLevel && rec && !isLocked("block")) drillDown(rec.name, "block");
      },
    });
  };

  // ─── Child overlays at sub-district / ward levels ───
  // STRICT scope rule:
  //  - State view → only district-level data (polygons; no child markers)
  //  - District selected → only block + municipality dots
  //  - Block selected → only village / ward dots
  // We do NOT mix multiple geographic levels in the same view.
  const childPoints = useMemo(() => {
    if (isStateLevel) return [];
    const atLevel = isBlockLevel
      ? regions.filter((r) => r.type === "village" || r.type === "ward")
      : regions.filter((r) => r.type === "block" || r.type === "municipality");
    // Real polygons supersede centroid dots for the levels they cover.
    if (!subLayer) return atLevel;
    return atLevel.filter((r) => !subLayer.covers.includes(r.type));
  }, [regions, isStateLevel, isBlockLevel, subLayer]);

  // Scope label shown above the map.
  const scopeLabel = subLayer
    ? `Showing: ${subLayer.levelLabel} boundaries (${subLayer.data.features.length})`
    : isBlockLevel
    ? "Showing: Village / Ward distribution"
    : !isStateLevel
    ? "Showing: Block & Municipality distribution"
    : "Showing: District-level distribution";

  // Boundary provenance, per state and level. Only GBA and Karnataka have
  // bundled official geometry; AP and Odisha still draw districts from the
  // public datameet mirror and have no sub-district polygons at all. The note
  // says which of those you are looking at rather than one blanket claim.
  const boundaryNote =
    stateId === "gba_central"
      ? "Official GBA boundaries — Dec 2025 delimitation"
      : stateId === "karnataka"
      ? subLayer
        ? `Karnataka ${subLayer.levelLabel === "Ward" ? "municipal ward" : "taluk"} boundaries — KGIS`
        : "Districts: public shapefiles · KGIS geometry on drill-down"
      : "Districts: public shapefiles · no sub-district geometry yet";

  // Force GeoJSON layer to re-style when filter changes (key trick).
  const geoKey = `${stateId}-${appliedFilters.district}-${mode}-${regions.length}-${maxDistrictCases}`;
  const subKey = `${geoKey}-${appliedFilters.block}-${subLayer?.data.features.length ?? 0}-${maxSubCases}`;

  // Breadcrumb navigation
  const handleBreadcrumb = (index: number) => {
    if (index === 0 && !isLocked("district")) {
      drillDown("All Districts", "district");
    } else if (index === 1 && breadcrumb.length > 2 && !isLocked("block")) {
      drillDown(breadcrumb[1], "district");
    }
  };

  return (
    <div className="section-card overflow-hidden relative" style={{ height }}>
      {/* Breadcrumb */}
      {breadcrumb.length > 1 && (
        <div className="absolute top-3 left-3 z-[1000] bg-card/90 backdrop-blur rounded-md border border-border px-3 py-1.5 flex items-center gap-1 text-xs">
          {breadcrumb.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-muted-foreground">›</span>}
              {i < breadcrumb.length - 1 ? (
                <button
                  onClick={() => handleBreadcrumb(i)}
                  className="text-primary hover:underline font-medium"
                >
                  {crumb}
                </button>
              ) : (
                <span className="font-semibold text-foreground">{crumb}</span>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Map controls (top-right): Recenter + Reset to State */}
      {geoReady && (
        <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
          <button
            onClick={() => setRecenterTick((t) => t + 1)}
            className="bg-card/90 backdrop-blur rounded-md border border-border px-3 py-1.5 text-xs flex items-center gap-1.5 hover:bg-card transition-colors"
            title="Recenter on current selection"
          >
            <Crosshair className="h-3 w-3" /> Recenter
          </button>
          {(isDistrictLevel || isBlockLevel) && !isLocked("district") && (
            <button
              onClick={() => drillDown("All Districts", "district")}
              className="bg-card/90 backdrop-blur rounded-md border border-border px-3 py-1.5 text-xs flex items-center gap-1.5 hover:bg-card transition-colors"
              title="Reset to state view"
            >
              <RotateCcw className="h-3 w-3" /> Reset to State
            </button>
          )}
        </div>
      )}

      {/* Loading skeleton — shown until geometry for the active state is ready. */}
      {!geoReady && (
        <div className="absolute inset-0 z-[500] flex flex-col items-center justify-center bg-muted/30 backdrop-blur-sm">
          <Skeleton className="h-full w-full absolute inset-0 opacity-60" />
          <div className="relative z-10 text-xs text-muted-foreground bg-card/90 border border-border rounded-md px-3 py-1.5">
            Loading {stateId.replace("_", " ")} boundaries…
          </div>
        </div>
      )}

      {geoReady && (
        <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
          <MapViewUpdater
            center={center}
            zoom={zoom}
            bounds={subBounds ?? selectionBounds}
            viewKey={`${stateId}-${appliedFilters.district}-${appliedFilters.block}-${recenterTick}`}
          />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          {/* Primary layer: district choropleth (raw case views render neutral grey) */}
          <GeoJSON
            key={geoKey}
            data={geoData!}
            style={styleFeature as any}
            onEachFeature={onEachFeature}
          />

          {/* Real sub-district polygons (GBA wards) — drawn over the dimmed parent layer. */}
          {subLayer && (
            <GeoJSON
              key={subKey}
              data={subLayer.data}
              style={styleSubFeature as any}
              onEachFeature={onEachSubFeature}
            />
          )}

          {/* Permanent district-name labels at state-level view (any mode). */}
          {districtLabelPoints.map((p) => (
            <CircleMarker
              key={`label-${p.name}`}
              center={[p.lat, p.lng]}
              radius={0}
              pathOptions={{ opacity: 0, fillOpacity: 0 }}
              interactive={false}
            >
              <Tooltip
                permanent
                direction="center"
                opacity={1}
                className="district-name-tooltip"
              >
                {p.name}
              </Tooltip>
            </CircleMarker>
          ))}

          {/* Hotspot state-level overlay: neutral blue case-load circles, sized by case count.
              Only shown for "hotspot" mode at state scope. Forecast / Overview do NOT use this. */}
          {isStateLevel && mode === "hotspot" && geoData && geoData.features.map((feature) => {
            const name = featureToMockName(feature);
            if (!name) return null;
            const { cases, trend, risk } = resolveDistrictRisk(name);
            const numCases = Number(cases);
            if (!Number.isFinite(numCases) || numCases <= 0) return null;
            try {
              const layer = L.geoJSON(feature as any);
              const center = layer.getBounds().getCenter();
              const radius = circleRadius(numCases);
              const burdenLabel = risk ? risk.charAt(0).toUpperCase() + risk.slice(1) : "—";
              const fill = risk ? hotspotBurdenColor[risk] : "#1d4ed8";
              return (
                <CircleMarker
                  key={`hot-${name}`}
                  center={[center.lat, center.lng]}
                  radius={radius}
                  pathOptions={{
                    fillColor: fill,
                    fillOpacity: 0.7,
                    color: "#0f172a",
                    weight: 1,
                  }}
                >
                  <Tooltip sticky>
                    <div style={{ fontSize: 12, lineHeight: 1.45, minWidth: 180 }}>
                      <div style={{ fontWeight: 700, marginBottom: 2 }}>{name}</div>
                      <div>Cases ({hotspotLookbackWeeks}W): <strong>{numCases}</strong></div>
                      <div>Hotspot burden: <strong>{burdenLabel}</strong></div>
                      {trend && <div style={{ opacity: 0.8 }}>Trend: {trendLabel(trend)}</div>}
                    </div>
                  </Tooltip>
                </CircleMarker>
              );
            } catch { return null; }
          })}

          {/* Child markers (blocks/municipalities, or villages/wards) — strictly the level of current scope */}
          {childPoints.map((r) => {
            const coords = districtCoordinates[r.name];
            if (!coords) return null;
            const pred = predByArea.get(r.name);
            const displayRisk = (mode === "forecast" && pred ? pred.risk : r.risk) as "high" | "moderate" | "low";
            const useNeutral = mode !== "forecast" && mode !== "hotspot";
            return (
              <CircleMarker
                key={`${r.type}-${r.name}`}
                center={coords}
                radius={
                  mode === "hotspot"
                    ? circleRadius(Math.max(r.confirmed, 0))
                    : useNeutral
                    ? circleRadius(Math.max(r.confirmed, 0))
                    : Math.max(4, Math.min(8, 4 + r.confirmed / 12))
                }
                pathOptions={{
                  fillColor: mode === "hotspot"
                    ? hotspotBurdenColor[displayRisk] || "#1d4ed8"
                    : useNeutral
                    ? "#3b82f6"
                    : riskColor[displayRisk],
                  fillOpacity: mode === "hotspot" ? 0.7 : useNeutral ? 0.6 : 0.9,
                  color: "#0f172a",
                  weight: 1,
                }}
                eventHandlers={
                  isDistrictLevel && (r.type === "block" || r.type === "municipality") && !isLocked("block")
                    ? { click: () => drillDown(r.name, "block") }
                    : {}
                }
              >
                <Tooltip sticky>
                  {mode === "forecast" && pred ? (
                    <div style={{ fontSize: 12, lineHeight: 1.45, minWidth: 160 }}>
                      <div style={{ fontWeight: 700, marginBottom: 2 }}>
                        {r.name}{r.type ? ` (${r.type})` : ""}
                      </div>
                      <div>Forecast risk: <strong>{(displayRisk || "data not available").toString().replace(/^./, c => c.toUpperCase())}</strong></div>
                      <div>Outbreak probability: <strong>{pred.probability}%</strong></div>
                      <div style={{ opacity: 0.8 }}>Forecast window: {pred.expectedWeek}</div>
                    </div>
                  ) : mode === "hotspot" ? (
                    <div style={{ fontSize: 12, lineHeight: 1.45, minWidth: 180 }}>
                      <div style={{ fontWeight: 700, marginBottom: 2 }}>
                        {r.name}{r.type ? ` (${r.type})` : ""}
                      </div>
                      <div>Cases ({hotspotLookbackWeeks}W): <strong>{r.confirmed}</strong></div>
                      <div>Hotspot burden: <strong>{(displayRisk || "—").toString().replace(/^./, c => c.toUpperCase())}</strong></div>
                      <div style={{ opacity: 0.8 }}>Trend: {trendLabel(r.trend)}</div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, lineHeight: 1.45, minWidth: 160 }}>
                      <div style={{ fontWeight: 700, marginBottom: 2 }}>
                        {r.name}{r.type ? ` (${r.type})` : ""}
                      </div>
                      <div>Cases: <strong>{r.confirmed} {trendArrow[r.trend] || ""}</strong></div>
                      <div style={{ opacity: 0.7, fontSize: 11 }}>Period: {`${fmtShort(dateWindow.fromDate)} - ${fmtFull(dateWindow.toDate)}`}</div>
                    </div>
                  )}
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
      )}

      {/* Scope label (top-center) */}
      {geoReady && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-card/90 backdrop-blur rounded-md border border-border px-3 py-1 text-[11px] text-foreground font-medium pointer-events-none">
          {scopeLabel}
        </div>
      )}

      {/* Boundary provenance note — shown for states drawn from the bundled real polygons. */}
      {geoReady && boundaryNote && (
        <div className="absolute bottom-3 right-3 z-[1000] bg-card/80 backdrop-blur rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground pointer-events-none max-w-[48%] text-right">
          {boundaryNote}
        </div>
      )}

      {/* Legend — risk colours only in forecast mode; current = blue intensity; hotspot = blue circles. */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-card/90 backdrop-blur rounded-md border border-border px-3 py-2 flex gap-3 items-center">
        {mode === "forecast" ? (
          <>
            {(["low", "moderate", "high"] as const).map((level) => (
              <div key={level} className="flex items-center gap-1.5 text-xs">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: riskColor[level] }} />
                <span className="capitalize">{level}</span>
              </div>
            ))}
            <span className="flex items-center gap-1.5 text-xs">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: NO_DATA_COLOR }} />
              <span>no data</span>
            </span>
          </>
        ) : mode === "current" ? (
          <>
            <span className="text-[11px] text-muted-foreground mr-1">Cases:</span>
            {BLUE_SCALE.map((c, i) => (
              <span key={c} className="w-4 h-3" style={{ backgroundColor: c, opacity: 0.85, borderRight: i === BLUE_SCALE.length - 1 ? undefined : "1px solid rgba(255,255,255,0.4)" }} />
            ))}
            <span className="text-[11px] text-muted-foreground">fewer → more</span>
          </>
        ) : (
          <>
            <span className="text-[11px] font-medium text-foreground mr-1">
              Hotspot burden (last {hotspotLookbackWeeks} weeks):
            </span>
            {(["low", "moderate", "high"] as const).map((level) => (
              <div key={level} className="flex items-center gap-1.5 text-xs">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: hotspotBurdenColor[level] }} />
                <span className="capitalize">{level}</span>
              </div>
            ))}
            <span className="text-[11px] text-muted-foreground">· circle size = case load</span>
          </>
        )}
      </div>
    </div>
  );
}
