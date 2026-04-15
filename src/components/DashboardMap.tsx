import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import { mapCenter, mapZoom, districtCoordinates, regionData } from "@/data/mockData";
import "leaflet/dist/leaflet.css";

const riskColor: Record<string, string> = {
  low: "#22c55e",
  moderate: "#eab308",
  high: "#ef4444",
};

const trendArrow: Record<string, string> = { up: "↑", down: "↓", stable: "→" };

export default function DashboardMap({ height = "400px" }: { height?: string }) {
  return (
    <div className="section-card overflow-hidden" style={{ height }}>
      <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {regionData.map((r) => {
          const coords = districtCoordinates[r.name];
          if (!coords) return null;
          return (
            <CircleMarker
              key={r.name}
              center={coords}
              radius={Math.max(8, r.confirmed / 3)}
              pathOptions={{ fillColor: riskColor[r.risk], fillOpacity: 0.7, color: riskColor[r.risk], weight: 2 }}
            >
              <Tooltip>
                <div className="text-xs">
                  <strong>{r.name}</strong><br />
                  Cases (4 wk): {r.confirmed}<br />
                  Trend: {trendArrow[r.trend] || "→"}<br />
                  Risk: {r.risk}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
      {/* Legend */}
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
