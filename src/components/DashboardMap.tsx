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
import "leaflet/dist/leaflet.css";

// ──────────────── Risk colors (semantic but inline-required by leaflet) ────────────────
const riskColor: Record<string, string> = {
  low: "#22c55e",
  moderate: "#eab308",
  high: "#ef4444",
};
const NO_DATA_COLOR = "#cbd5e1"; // neutral slate for unmatched polygons
const trendArrow: Record<string, string> = { up: "↑", down: "↓", stable: "→" };

// ──────────────── GeoJSON URLs (datameet-style mirror via jsDelivr CDN) ────────────────
const GEOJSON_URLS: Record<string, string> = {
  andhra_pradesh:
    "https://cdn.jsdelivr.net/gh/datta07/INDIAN-SHAPEFILES@master/STATES/ANDHRA%20PRADESH/ANDHRA%20PRADESH_DISTRICTS.geojson",
  odisha:
    "https://cdn.jsdelivr.net/gh/datta07/INDIAN-SHAPEFILES@master/STATES/ORISSA/ODISHA_DISTRICTS.geojson",
  karnataka:
    "https://cdn.jsdelivr.net/gh/datta07/INDIAN-SHAPEFILES@master/STATES/KARNATAKA/KARNATAKA_DISTRICTS.geojson",
};

// In-memory cache (lives for the session); also mirrored to sessionStorage so a reload reuses it.
const geoCache = new Map<string, FeatureCollection>();

async function fetchStateGeoJSON(stateId: string): Promise<FeatureCollection | null> {
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
  "balasore": "Baleshwar",
  "baleshwar": "Baleshwar",
  "baleswar": "Baleshwar",
  "jagatsinghpur": "Jagatsinghapur",
  "jagatsinghapur": "Jagatsinghapur",
  "jajapur": "Jajpur",
  "jajpur": "Jajpur",
  "khordha": "Khurda",
  "khurda": "Khurda",
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
      return { risk: null, cases: "—" };
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
  // Raw case views (current + hotspot) MUST NOT use forecast risk colors.
  // Polygons render in neutral grey; case counts are encoded by overlay circles.
  const useNeutralPolygons = mode !== "forecast";
  const styleFeature = (feature?: Feature): PathOptions => {
    if (!feature) return {};
    const name = featureToMockName(feature);
    const { risk } = resolveDistrictRisk(name);
    const isSelected = name === appliedFilters.district;
    const dimmed = hasSelection && !isSelected;
    if (useNeutralPolygons) {
      return {
        fillColor: NO_DATA_COLOR,
        fillOpacity: isSelected ? 0.45 : dimmed ? 0.1 : 0.18,
        color: isSelected ? "#0f172a" : dimmed ? "#94a3b8" : "#94a3b8",
        weight: isSelected ? 2.5 : 1,
        opacity: dimmed ? 0.55 : 1,
      };
    }
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

    // Forecast tooltip → probability + per-prediction expected week (no global range).
    // Observed/Hotspot tooltip → cases + observation date range.
    const tooltip = mode === "forecast"
      ? `
        <div style="font-size:12px;line-height:1.45;min-width:160px">
          <div style="font-weight:700;margin-bottom:2px">${displayName}</div>
          <div>Outbreak Probability: <strong>${risk ? cases : "—"}</strong></div>
          <div>Risk: <strong>${riskLabel}</strong></div>
          ${week ? `<div style="opacity:0.8">Week: ${week}</div>` : ""}
        </div>`
      : `
        <div style="font-size:12px;line-height:1.45;min-width:140px">
          <div style="font-weight:700;margin-bottom:2px">${displayName}</div>
          <div>Risk: <strong>${riskLabel}</strong></div>
          <div>Cases: <strong>${cases}${trendStr ? ` <span style="opacity:0.7">(${trendStr})</span>` : ""}</strong></div>
          <div style="opacity:0.8">Date: ${observedDateRange}</div>
          ${isStateLevel && !isLocked("district") ? `<div style="opacity:0.6;margin-top:3px;font-style:italic">Click to drill down</div>` : ""}
        </div>`;
    layer.bindTooltip(tooltip, { sticky: true });

    layer.on({
      mouseover: (e) => { (e.target as any).setStyle({ weight: 3, color: "#0f172a", fillOpacity: 0.85 }); },
      mouseout: (e) => { (e.target as any).setStyle(styleFeature(feature)); },
      click: () => {
        if (isStateLevel && !isLocked("district") && name) {
          drillDown(name, "district");
        }
      },
    });
  };

  // ─── Child overlays at sub-district / ward levels ───
  // At district view: show block-level points (subDistrictData filtered to this district).
  // At block view: show villages or wards (already returned by getFilteredRegions).
  const childPoints = useMemo(() => {
    if (isStateLevel) return []; // primary layer handles districts
    return regions.filter((r) => r.type && r.type !== "district");
  }, [regions, isStateLevel]);

  // Force GeoJSON layer to re-style when filter changes (key trick).
  const geoKey = `${stateId}-${appliedFilters.district}-${mode}-${regions.length}`;

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
            bounds={selectionBounds}
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

          {/* Raw-case overlay: neutral case-load circles at state level for current/hotspot modes.
              Size encodes case count. Forecast mode keeps polygon coloring instead. */}
          {isStateLevel && useNeutralPolygons && geoData && geoData.features.map((feature) => {
            const name = featureToMockName(feature);
            if (!name) return null;
            const { cases } = resolveDistrictRisk(name);
            const numCases = Number(cases);
            if (!Number.isFinite(numCases) || numCases <= 0) return null;
            // Use polygon centroid (approximation via bounds)
            try {
              const layer = L.geoJSON(feature as any);
              const center = layer.getBounds().getCenter();
              // radius scales with case count (sqrt for area-proportional)
              const radius = Math.max(5, Math.min(22, 4 + Math.sqrt(numCases) * 1.6));
              return (
                <CircleMarker
                  key={`load-${name}`}
                  center={[center.lat, center.lng]}
                  radius={radius}
                  pathOptions={{
                    fillColor: mode === "hotspot" ? "#1e3a8a" : "#475569",
                    fillOpacity: 0.55,
                    color: "#0f172a",
                    weight: 1,
                  }}
                  interactive={false}
                />
              );
            } catch { return null; }
          })}

          {/* Child markers (blocks, wards, villages) at lower levels */}
          {childPoints.map((r) => {
          const coords = districtCoordinates[r.name];
          if (!coords) return null;
          const pred = predByArea.get(r.name);
          const displayRisk = (mode === "forecast" && pred ? pred.risk : r.risk) as "high" | "moderate" | "low";
          return (
            <CircleMarker
              key={`${r.type}-${r.name}`}
              center={coords}
              // Raw case views: size encodes case load with a neutral fill.
              // Forecast view: keep risk-coloured fill.
              radius={
                useNeutralPolygons
                  ? Math.max(5, Math.min(20, 4 + Math.sqrt(Math.max(r.confirmed, 0)) * 1.6))
                  : Math.max(4, Math.min(8, 4 + r.confirmed / 12))
              }
              pathOptions={{
                fillColor: useNeutralPolygons ? (mode === "hotspot" ? "#1e3a8a" : "#475569") : riskColor[displayRisk],
                fillOpacity: useNeutralPolygons ? 0.55 : 0.9,
                color: "#0f172a",
                weight: 1,
              }}
              eventHandlers={
                isDistrictLevel && r.type !== "village" && r.type !== "ward" && !isLocked("block")
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
                    <div>Outbreak Probability: <strong>{pred.probability}%</strong></div>
                    <div>Risk: <strong>{(displayRisk || "data not available").toString().replace(/^./, c => c.toUpperCase())}</strong></div>
                    <div style={{ opacity: 0.8 }}>Week: {pred.expectedWeek}</div>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, lineHeight: 1.45, minWidth: 140 }}>
                    <div style={{ fontWeight: 700, marginBottom: 2 }}>
                      {r.name}{r.type ? ` (${r.type})` : ""}
                    </div>
                    <div>Risk: <strong>{(displayRisk || "data not available").toString().replace(/^./, c => c.toUpperCase())}</strong></div>
                    <div>Cases: <strong>{r.confirmed} {trendArrow[r.trend] || ""}</strong></div>
                    <div style={{ opacity: 0.8 }}>Date: {`${fmtShort(dateWindow.fromDate)} - ${fmtFull(dateWindow.toDate)}`}</div>
                  </div>
                )}
              </Tooltip>
            </CircleMarker>
          );
          })}
        </MapContainer>
      )}

      {/* Legend — risk colours only in forecast mode; raw case views show case-load circles. */}
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
        ) : (
          <>
            <span className="flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: mode === "hotspot" ? "#1e3a8a" : "#475569" }} />
              <span>fewer cases</span>
            </span>
            <span className="flex items-center gap-1.5 text-xs">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: mode === "hotspot" ? "#1e3a8a" : "#475569" }} />
              <span>more cases</span>
            </span>
            <span className="text-xs text-muted-foreground">· circle size = case load</span>
          </>
        )}
      </div>
    </div>
  );
}
