import { Newspaper, MapPin, AlertTriangle, ExternalLink } from "lucide-react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import { newsAlerts, geoTaggedAlerts, mapCenter } from "@/data/mockData";

const severityColor: Record<string, string> = {
  high: "#ef4444",
  moderate: "#eab308",
  low: "#22c55e",
};

export default function SignalsScreen() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Signals / Field Intelligence</h2>
        <p className="text-xs text-muted-foreground">External signals to complement model predictions and ground reality</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* News / Media Alerts */}
        <div className="section-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Newspaper className="h-4 w-4 text-muted-foreground" />
            <h3 className="section-title">News / Media Alerts</h3>
          </div>
          <div className="space-y-3">
            {newsAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                <div className="mt-0.5">
                  <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: severityColor[alert.severity] }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-snug">{alert.headline}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{alert.district}</span>
                    <span>{alert.source}</span>
                    <span>{alert.date}</span>
                  </div>
                </div>
                <span className={`risk-badge-${alert.severity} flex-shrink-0`}>{alert.severity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Geo-tagged Alerts Map */}
        <div className="section-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <h3 className="section-title">Geo-tagged Signal Map</h3>
          </div>
          <div className="rounded-lg overflow-hidden border border-border" style={{ height: "400px" }}>
            <MapContainer center={mapCenter} zoom={7} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
              {geoTaggedAlerts.map((a) => (
                <CircleMarker
                  key={a.id}
                  center={[a.lat, a.lng]}
                  radius={10}
                  pathOptions={{ fillColor: severityColor[a.severity], fillOpacity: 0.7, color: severityColor[a.severity], weight: 2 }}
                >
                  <Tooltip>
                    <div className="text-xs">
                      <strong>{a.district}</strong><br />
                      {a.message}<br />
                      Severity: {a.severity}
                    </div>
                  </Tooltip>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
          {/* Legend */}
          <div className="flex gap-4 mt-3">
            {(["high", "moderate", "low"] as const).map((level) => (
              <div key={level} className="flex items-center gap-1.5 text-xs">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: severityColor[level] }} />
                <span className="capitalize">{level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Future: Social / community signals */}
      <div className="section-card p-4 border-dashed">
        <div className="flex items-center gap-2 text-muted-foreground">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">Community / social signals — planned for future integration</span>
        </div>
      </div>
    </div>
  );
}
