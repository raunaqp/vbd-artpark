import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip, useMap } from "react-leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import L, { type Layer, type LatLngBounds, type PathOptions } from "leaflet";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { RotateCcw } from "lucide-react";
import {
  getMapCenter,
  getMapZoom,
  districtCoordinates,
  getFilteredRegions,
  getOutbreakPredictions,
} from "@/data/mockData";
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

// Aliases: GeoJSON name → mock-data name
const DISTRICT_ALIASES: Record<string, string> = {
  "sripottisriramulunell": "S.P.S. Nellore",
  "ysr": "Y.S.R.",
};

function getFeatureDistrictName(feature: Feature): string {
  const props = (feature.properties || {}) as Record<string, unknown>;
  return String(props.dtname || props.DISTRICT || props.district || props.NAME || props.name || "");
}

// ──────────────── Component ────────────────
interface DashboardMapProps {
  height?: string;
  /** "current" colors by past-cases risk, "forecast" colors by predicted outbreak risk */
  mode?: "current" | "forecast";
}

// Helper: imperatively update the map view when center/zoom inputs change.
function MapViewUpdater({ center, zoom, bounds }: { center: [number, number]; zoom: number; bounds?: LatLngBounds | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [24, 24], animate: true });
    } else {
      map.setView(center, zoom, { animate: true });
    }
  }, [center[0], center[1], zoom, bounds, map]);
  return null;
}

export default function DashboardMap({ height = "400px", mode = "current" }: DashboardMapProps) {
  const { appliedFilters, drillDown, breadcrumb, isLocked, dateWindow } = useFilters();
  const { stateId } = useStateSelection();

  const regions = getFilteredRegions(appliedFilters);
  const predictions = mode === "forecast" ? getOutbreakPredictions(appliedFilters) : [];
  const predByArea = useMemo(() => new Map(predictions.map((p) => [p.area, p])), [predictions]);

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
  const [loadingGeo, setLoadingGeo] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingGeo(true);
    fetchStateGeoJSON(stateId).then((data) => {
      if (!cancelled) {
        setGeoData(data);
        setLoadingGeo(false);
      }
    });
    return () => { cancelled = true; };
  }, [stateId]);

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
  const tooltipDateRange = mode === "forecast"
    ? `${fmtShort(dateWindow.forecastStartDate)} - ${fmtFull(dateWindow.forecastEndDate)}`
    : `${fmtShort(dateWindow.fromDate)} - ${fmtFull(dateWindow.toDate)}`;

  // ─── Polygon style + behavior ───
  const styleFeature = (feature?: Feature): PathOptions => {
    if (!feature) return {};
    const name = featureToMockName(feature);
    const norm = name ? normalize(name) : "";
    const region = districtRiskByName.get(norm);
    const pred = name ? predByArea.get(name) : undefined;
    const risk = mode === "forecast" && pred ? pred.risk : region?.risk;
    const isSelected = name === appliedFilters.district;
    return {
      fillColor: risk ? riskColor[risk] : NO_DATA_COLOR,
      fillOpacity: isSelected ? 0.75 : risk ? 0.55 : 0.3,
      color: isSelected ? "#0f172a" : "#475569",
      weight: isSelected ? 3 : 1,
      opacity: 1,
    };
  };

  const onEachFeature = (feature: Feature<Geometry>, layer: Layer) => {
    const name = featureToMockName(feature);
    const norm = name ? normalize(name) : "";
    const region = districtRiskByName.get(norm);
    const pred = name ? predByArea.get(name) : undefined;
    const risk = mode === "forecast" && pred ? pred.risk : region?.risk;
    const cases = mode === "forecast" && pred ? `${pred.probability}% (forecast)` : region ? `${region.confirmed}` : "—";
    const riskLabel = risk ? risk.charAt(0).toUpperCase() + risk.slice(1) : "Unknown";

    const tooltip = `
      <div style="font-size:12px;line-height:1.45;min-width:140px">
        <div style="font-weight:700;margin-bottom:2px">${name || getFeatureDistrictName(feature)}</div>
        <div>Risk: <strong>${riskLabel}</strong></div>
        <div>Cases: <strong>${cases}</strong></div>
        <div style="opacity:0.8">Date: ${tooltipDateRange}</div>
        ${isStateLevel && !isLocked("district") ? `<div style="opacity:0.6;margin-top:3px;font-style:italic">Click to drill down</div>` : ""}
      </div>`;
    layer.bindTooltip(tooltip, { sticky: true });

    layer.on({
      mouseover: (e) => { (e.target as any).setStyle({ weight: 3, color: "#0f172a", fillOpacity: 0.8 }); },
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

      {loadingGeo && !geoData && (
        <div className="absolute top-3 right-3 z-[1000] bg-card/90 backdrop-blur rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground">
          Loading boundaries…
        </div>
      )}

      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
        <MapViewUpdater center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {/* Primary layer: district choropleth */}
        {geoData && (
          <GeoJSON
            key={geoKey}
            data={geoData}
            style={styleFeature as any}
            onEachFeature={onEachFeature}
          />
        )}

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
              radius={Math.max(6, Math.min(16, r.confirmed / 2))}
              pathOptions={{
                fillColor: riskColor[displayRisk],
                fillOpacity: 0.85,
                color: "#0f172a",
                weight: 1.5,
              }}
              eventHandlers={
                isDistrictLevel && r.type !== "village" && r.type !== "ward" && !isLocked("block")
                  ? { click: () => drillDown(r.name, "block") }
                  : {}
              }
            >
              <Tooltip>
                <div className="text-xs">
                  <strong>{r.name}</strong>
                  {r.type && <span className="capitalize"> ({r.type})</span>}
                  <br />
                  {mode === "forecast" && pred ? (
                    <>
                      Forecast risk: <strong>{pred.risk}</strong><br />
                      Probability: {pred.probability}% · {pred.expectedWeek}
                    </>
                  ) : (
                    <>
                      Cases: {r.confirmed} {trendArrow[r.trend] || ""}<br />
                      Risk: {r.risk}
                    </>
                  )}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-card/90 backdrop-blur rounded-md border border-border px-3 py-2 flex gap-3 items-center">
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
      </div>
    </div>
  );
}
