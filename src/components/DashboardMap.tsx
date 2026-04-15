import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import { mapCenter, mapZoom, districtCoordinates, getFilteredRegions, subDistrictData } from "@/data/mockData";
import { useFilters } from "@/contexts/FilterContext";
import "leaflet/dist/leaflet.css";

const riskColor: Record<string, string> = {
  low: "#22c55e",
  moderate: "#eab308",
  high: "#ef4444",
};

const trendArrow: Record<string, string> = { up: "↑", down: "↓", stable: "→" };

export default function DashboardMap({ height = "400px" }: { height?: string }) {
  const { appliedFilters, drillDown, breadcrumb, isLocked } = useFilters();
  const regions = getFilteredRegions(appliedFilters.district, appliedFilters.block);

  // Compute center/zoom based on filter level
  let center = mapCenter;
  let zoom = mapZoom;

  if (appliedFilters.block !== "All Blocks" && districtCoordinates[appliedFilters.block]) {
    center = districtCoordinates[appliedFilters.block];
    zoom = 12;
  } else if (appliedFilters.district !== "All Districts" && districtCoordinates[appliedFilters.district]) {
    center = districtCoordinates[appliedFilters.district];
    zoom = 9;
  }

  // Determine if clicking should drill down
  const handleClick = (name: string) => {
    if (appliedFilters.block !== "All Blocks") return; // Already at village/ward level
    if (appliedFilters.district !== "All Districts") {
      // We're at district level viewing blocks — drill into block
      if (!isLocked("block")) {
        drillDown(name, "block");
      }
    } else {
      // We're at state level viewing districts — drill into district
      if (!isLocked("district")) {
        drillDown(name, "district");
      }
    }
  };

  // Breadcrumb navigation
  const handleBreadcrumb = (index: number) => {
    if (index === 0) {
      // Go to state
      if (!isLocked("district")) {
        drillDown("All Districts", "district");
      }
    } else if (index === 1 && breadcrumb.length > 2) {
      // Go to district
      if (!isLocked("block")) {
        const next = { district: breadcrumb[1], block: "All Blocks" } as any;
        drillDown(breadcrumb[1], "district");
      }
    }
  };

  const isBottomLevel = appliedFilters.block !== "All Blocks";
  const isDistrictLevel = appliedFilters.district !== "All Districts" && appliedFilters.block === "All Blocks";

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

      <MapContainer key={`${center[0]}-${center[1]}-${zoom}`} center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {regions.map((r) => {
          const coords = districtCoordinates[r.name];
          if (!coords) return null;
          const isClickable = !isBottomLevel;
          return (
            <CircleMarker
              key={r.name}
              center={coords}
              radius={Math.max(6, Math.min(20, r.confirmed / 2))}
              pathOptions={{
                fillColor: riskColor[r.risk],
                fillOpacity: isBottomLevel ? 0.5 : 0.7,
                color: riskColor[r.risk],
                weight: 2,
              }}
              eventHandlers={isClickable ? { click: () => handleClick(r.name) } : {}}
            >
              <Tooltip>
                <div className="text-xs">
                  <strong>{r.name}</strong>
                  {r.type && r.type !== "district" && <span className="capitalize"> ({r.type})</span>}
                  <br />
                  Cases (4 wk): {r.confirmed}<br />
                  Trend: {trendArrow[r.trend] || "→"}<br />
                  Risk: {r.risk}
                  {isClickable && <><br /><em className="text-[10px]">Click to drill down</em></>}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
      <div className="absolute bottom-3 left-3 z-[1000] bg-card/90 backdrop-blur rounded-md border border-border px-3 py-2 flex gap-3">
        {(["low", "moderate", "high"] as const).map((level) => (
          <div key={level} className="flex items-center gap-1.5 text-xs">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: riskColor[level] }} />
            <span className="capitalize">{level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
