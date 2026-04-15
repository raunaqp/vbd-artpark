import { useState } from "react";
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import DashboardMap from "@/components/DashboardMap";
import { hotspotAlerts, hotspotTableData } from "@/data/mockData";

const trendIcon = { up: TrendingUp, down: TrendingDown, stable: Minus };

export default function HotspotsScreen() {
  const [timeRange, setTimeRange] = useState<"2weeks" | "4weeks">("4weeks");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Hotspots — Past Data</h2>
          <p className="text-xs text-muted-foreground">Based on confirmed cases in last {timeRange === "4weeks" ? "4" : "2"} weeks</p>
        </div>
        <div className="tab-nav">
          <button onClick={() => setTimeRange("2weeks")} className={`tab-nav-item ${timeRange === "2weeks" ? "tab-nav-item-active" : ""}`}>2 Weeks</button>
          <button onClick={() => setTimeRange("4weeks")} className={`tab-nav-item ${timeRange === "4weeks" ? "tab-nav-item-active" : ""}`}>4 Weeks</button>
        </div>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {hotspotAlerts.map((a) => (
          <div key={a.id} className={`section-card p-4 border-l-4 border-risk-${a.severity} bg-risk-${a.severity}/5`}>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className={`h-4 w-4 text-risk-${a.severity}`} />
              <span className="font-semibold text-sm">{a.district}</span>
              <span className={`risk-badge-${a.severity} ml-auto`}>{a.severity}</span>
            </div>
            <p className="text-xs text-muted-foreground">{a.message}</p>
          </div>
        ))}
      </div>

      {/* Map */}
      <DashboardMap height="350px" />

      {/* Hotspot Table — Past Only */}
      <div className="section-card p-5">
        <h3 className="section-title mb-3">Hotspot Analysis</h3>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Area", "Current Cases", "Trend", "Risk"].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hotspotTableData.map((r) => {
                const TrendIcon = trendIcon[r.trend];
                return (
                  <tr key={r.district} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2 px-3 font-medium">{r.district}</td>
                    <td className="py-2 px-3">{r.currentCases}</td>
                    <td className="py-2 px-3">
                      <TrendIcon className={`h-4 w-4 ${r.trend === "up" ? "text-risk-high" : r.trend === "down" ? "text-risk-low" : "text-muted-foreground"}`} />
                    </td>
                    <td className="py-2 px-3"><span className={`risk-badge-${r.risk}`}>{r.risk}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
