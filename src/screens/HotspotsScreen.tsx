import { useEffect, useState } from "react";
import { AlertTriangle, ArrowUp, ArrowDown, ArrowRight, Info } from "lucide-react";
import DashboardMap from "@/components/DashboardMap";
import GlobalFilters from "@/components/GlobalFilters";
import TablePagination from "@/components/TablePagination";
import HotspotDailyTrend from "@/components/HotspotDailyTrend";
import Sparkline, { synthSparkSeries } from "@/components/Sparkline";
import { getHotspotAlerts, getFilteredHotspots, getOutbreakPredictions } from "@/data/mockData";
import { useFilters } from "@/contexts/FilterContext";
import { useDisease } from "@/contexts/DiseaseContext";

const trendIcon = { up: ArrowUp, down: ArrowDown, stable: ArrowRight };
const PAGE_SIZE = 20;

export default function HotspotsScreen() {
  const [timeRange, setTimeRange] = useState<"2weeks" | "4weeks">("4weeks");
  const [page, setPage] = useState(1);
  const { appliedFilters } = useFilters();
  const { diseaseName, currentDisease } = useDisease();

  const hotspots = getFilteredHotspots(appliedFilters, timeRange === "2weeks" ? 2 : 4);
  const filteredAlerts = getHotspotAlerts(appliedFilters);

  const displayHotspots = hotspots.map((r) => ({
    ...r,
    currentCases: Math.round(r.currentCases * currentDisease.caseMultiplier),
    prevCases: Math.round(r.prevCases * currentDisease.caseMultiplier),
  }));

  // Reset to first page whenever filters or time range change
  useEffect(() => { setPage(1); }, [appliedFilters.district, appliedFilters.block, timeRange]);
  const visibleHotspots = displayHotspots.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const areaLabel = appliedFilters.block !== "All Blocks"
    ? "Villages / Wards"
    : appliedFilters.district !== "All Districts"
    ? "Blocks / Municipalities"
    : "Districts";

  const totalCases = displayHotspots.reduce((sum, h) => sum + h.currentCases, 0);
  const predictions = getOutbreakPredictions(appliedFilters);
  const hasHighForecast = predictions.some(p => p.risk === "high");
  const noCasesButHighForecast = totalCases === 0 && hasHighForecast;

  return (
    <div className="space-y-6">
      <GlobalFilters />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{diseaseName} Hotspots — Past Data</h2>
          <p className="text-xs text-muted-foreground">
            Hotspots are based on confirmed {diseaseName.toLowerCase()} cases in the last {timeRange === "4weeks" ? "4" : "2"} weeks · No forecast data shown here · Showing: {areaLabel.toLowerCase()}
          </p>
        </div>
        <div className="tab-nav">
          <button onClick={() => setTimeRange("2weeks")} className={`tab-nav-item ${timeRange === "2weeks" ? "tab-nav-item-active" : ""}`}>2 Weeks</button>
          <button onClick={() => setTimeRange("4weeks")} className={`tab-nav-item ${timeRange === "4weeks" ? "tab-nav-item-active" : ""}`}>4 Weeks</button>
        </div>
      </div>

      {noCasesButHighForecast && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm">
          <Info className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="text-foreground">
            No significant {diseaseName.toLowerCase()} cases reported in the last {timeRange === "4weeks" ? "4" : "2"} weeks.
            <span className="text-muted-foreground ml-1">However, the Forecast tab shows high risk due to predictive signals (climate / trend / history).</span>
          </span>
        </div>
      )}

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

      <DashboardMap height="350px" mode="hotspot" hotspotLookbackWeeks={timeRange === "2weeks" ? 2 : 4} />

      <HotspotDailyTrend lookbackDays={timeRange === "2weeks" ? 14 : 28} />

      {displayHotspots.length > 0 ? (
        <div className="section-card p-5">
          <h3 className="section-title mb-3">{diseaseName} Hotspot Analysis — Last {timeRange === "4weeks" ? "4" : "2"} Weeks · {areaLabel}</h3>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["District", "Block / Municipality", "Village / Ward", "Cases", "Trend", `Sparkline (${timeRange === "2weeks" ? "14d" : "28d"})`, "Basis"].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleHotspots.map((r) => {
                  const TrendIcon = trendIcon[r.trend];
                  const sparkPoints = timeRange === "2weeks" ? 14 : 28;
                  const sparkValues = synthSparkSeries(r.area, r.currentCases, r.prevCases, r.trend, sparkPoints);
                  // Resolve hierarchy from area metadata where available.
                  const districtCol = r.parentDistrict || (r.areaType === "District" ? r.area : "—");
                  const blockCol = r.parentBlock || (r.areaType === "Block" || r.areaType === "Municipality" ? r.area : "—");
                  const villageCol = (r.areaType === "Village" || r.areaType === "Ward") ? r.area : "—";
                  return (
                    <tr key={r.area} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2 px-3 font-medium">{districtCol}</td>
                      <td className="py-2 px-3">{blockCol}</td>
                      <td className="py-2 px-3">{villageCol}</td>
                      <td className="py-2 px-3 font-semibold">{r.currentCases} <span className="text-muted-foreground text-xs">(prev {r.prevCases})</span></td>
                      <td className="py-2 px-3">
                        <span className="inline-flex items-center gap-1 text-xs">
                          <TrendIcon className={`h-4 w-4 ${r.trend === "up" ? "text-risk-high" : r.trend === "down" ? "text-risk-low" : "text-muted-foreground"}`} />
                          <span className="text-muted-foreground capitalize">{r.trend === "up" ? "Rising" : r.trend === "down" ? "Falling" : "Stable"}</span>
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <Sparkline values={sparkValues} trend={r.trend} width={90} height={22} />
                      </td>
                      <td className="py-2 px-3 text-xs text-muted-foreground">{timeRange === "2weeks" ? "2W" : "4W"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <TablePagination page={page} pageSize={PAGE_SIZE} total={displayHotspots.length} onPageChange={setPage} />
        </div>
      ) : (
        <div className="section-card p-5 text-center text-muted-foreground text-sm">
          No {diseaseName.toLowerCase()} hotspot data available for the selected area and time range.
        </div>
      )}
    </div>
  );
}
