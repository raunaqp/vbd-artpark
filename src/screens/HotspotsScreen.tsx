import { useState } from "react";
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import DashboardMap from "@/components/DashboardMap";
import GlobalFilters from "@/components/GlobalFilters";
import { hotspotAlerts, getFilteredHotspots } from "@/data/mockData";
import { useFilters } from "@/contexts/FilterContext";

const trendIcon = { up: TrendingUp, down: TrendingDown, stable: Minus };

export default function HotspotsScreen() {
  const [timeRange, setTimeRange] = useState<"2weeks" | "4weeks">("4weeks");
  const { appliedFilters } = useFilters();

  const hotspots = getFilteredHotspots(appliedFilters.district, appliedFilters.block);

  const filteredAlerts = appliedFilters.district === "All Districts"
    ? hotspotAlerts
    : hotspotAlerts.filter(a => a.district === appliedFilters.district);

  const displayHotspots = hotspots.map((r) => ({
    ...r,
    currentCases: timeRange === "2weeks" ? Math.round(r.currentCases * 0.55) : r.currentCases,
    prevCases: timeRange === "2weeks" ? Math.round(r.prevCases * 0.55) : r.prevCases,
  }));

  const areaLabel = appliedFilters.block !== "All Blocks"
    ? "Villages / Wards"
    : appliedFilters.district !== "All Districts"
    ? "Blocks / Municipalities"
    : "Districts";

  return (
    <div className="space-y-6">
      <GlobalFilters />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Hotspots — Past Data</h2>
          <p className="text-xs text-muted-foreground">
            Hotspots are based on confirmed cases in the last {timeRange === "4weeks" ? "4" : "2"} weeks · No forecast data shown here · Showing: {areaLabel.toLowerCase()}
          </p>
        </div>
        <div className="tab-nav">
          <button onClick={() => setTimeRange("2weeks")} className={`tab-nav-item ${timeRange === "2weeks" ? "tab-nav-item-active" : ""}`}>2 Weeks</button>
          <button onClick={() => setTimeRange("4weeks")} className={`tab-nav-item ${timeRange === "4weeks" ? "tab-nav-item-active" : ""}`}>4 Weeks</button>
        </div>
      </div>

      {filteredAlerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredAlerts.map((a) => (
            <div key={a.id} className={`section-card p-4 border-l-4 ${
              a.severity === "high" ? "border-risk-high bg-risk-high/5" :
              a.severity === "moderate" ? "border-risk-moderate bg-risk-moderate/5" :
              "border-risk-low bg-risk-low/5"
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className={`h-4 w-4 ${
                  a.severity === "high" ? "text-risk-high" :
                  a.severity === "moderate" ? "text-risk-moderate" :
                  "text-risk-low"
                }`} />
                <span className="font-semibold text-sm">{a.district}</span>
                <span className={`risk-badge-${a.severity} ml-auto`}>{a.severity}</span>
              </div>
              <p className="text-xs text-muted-foreground">{a.message}</p>
            </div>
          ))}
        </div>
      )}

      <DashboardMap height="350px" />

      <div className="section-card p-5">
        <h3 className="section-title mb-3">Hotspot Analysis — Last {timeRange === "4weeks" ? "4" : "2"} Weeks · {areaLabel}</h3>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Area", "Cases", "Prev Period", "Trend", "Risk"].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayHotspots.map((r) => {
                const TrendIcon = trendIcon[r.trend];
                return (
                  <tr key={r.area} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2 px-3 font-medium">{r.area}</td>
                    <td className="py-2 px-3">{r.currentCases}</td>
                    <td className="py-2 px-3 text-muted-foreground">{r.prevCases}</td>
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
