import { AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import DashboardMap from "@/components/DashboardMap";
import { hotspotAlerts, hotspotTableData } from "@/data/mockData";

const trendIcon = { up: TrendingUp, down: TrendingDown, stable: Minus };
const severityClass: Record<string, string> = {
  critical: "border-risk-critical bg-risk-critical/5",
  high: "border-risk-high bg-risk-high/5",
};

export default function HotspotsScreen() {
  return (
    <div className="space-y-6">
      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {hotspotAlerts.map((a) => (
          <div key={a.id} className={`section-card p-4 border-l-4 ${severityClass[a.severity]}`}>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className={`h-4 w-4 ${a.severity === "critical" ? "text-risk-critical" : "text-risk-high"}`} />
              <span className="font-semibold text-sm">{a.district}</span>
              <span className={`risk-badge-${a.severity} ml-auto`}>{a.severity}</span>
            </div>
            <p className="text-xs text-muted-foreground">{a.message}</p>
          </div>
        ))}
      </div>

      {/* Map */}
      <DashboardMap height="350px" />

      {/* Hotspot Table */}
      <div className="section-card p-5">
        <h3 className="section-title mb-3">Hotspot Analysis</h3>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["District", "Current Cases", "Trend", "W1", "W2", "W3", "W4", "Risk", "Action"].map((h) => (
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
                    <td className="py-2 px-3"><TrendIcon className={`h-4 w-4 ${r.trend === "up" ? "text-risk-critical" : r.trend === "down" ? "text-risk-low" : "text-muted-foreground"}`} /></td>
                    <td className="py-2 px-3">{r.w1}</td>
                    <td className="py-2 px-3">{r.w2}</td>
                    <td className="py-2 px-3">{r.w3}</td>
                    <td className="py-2 px-3">{r.w4}</td>
                    <td className="py-2 px-3"><span className={`risk-badge-${r.risk}`}>{r.risk}</span></td>
                    <td className="py-2 px-3">
                      <button className="text-xs text-primary underline">View</button>
                    </td>
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
