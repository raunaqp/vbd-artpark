import GlobalFilters from "@/components/GlobalFilters";
import KpiCards from "@/components/KpiCards";
import RiskStrip from "@/components/RiskStrip";
import DashboardMap from "@/components/DashboardMap";
import RegionTable from "@/components/RegionTable";
import RecommendedActions from "@/components/RecommendedActions";
import { useFilters } from "@/contexts/FilterContext";
import { getFilteredRegions, getSituationSummary } from "@/data/mockData";

export default function OverviewScreen() {
  const { appliedFilters } = useFilters();
  const regions = getFilteredRegions(appliedFilters.district);
  const summary = getSituationSummary(regions);

  const riskDistribution = {
    high: regions.filter((r) => r.risk === "high").length,
    moderate: regions.filter((r) => r.risk === "moderate").length,
    low: regions.filter((r) => r.risk === "low").length,
  };

  return (
    <div>
      <GlobalFilters />

      {/* Situation Summary */}
      <div className="section-card p-4 mb-6">
        <h3 className="section-title mb-2">Situation Summary</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
      </div>

      <RecommendedActions />
      <KpiCards />

      {/* Risk Distribution + W1–W4 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="section-card p-4">
          <h3 className="section-title mb-3">Risk Distribution</h3>
          <div className="space-y-2">
            {([
              { level: "high", label: "High Risk", count: riskDistribution.high },
              { level: "moderate", label: "Moderate Risk", count: riskDistribution.moderate },
              { level: "low", label: "Low Risk", count: riskDistribution.low },
            ] as const).map(({ level, label, count }) => (
              <div key={level} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full bg-risk-${level}`} />
                  <span className="text-sm text-foreground">{label}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{count} district{count !== 1 ? "s" : ""}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2">
          <RiskStrip />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardMap height="400px" />
        <RegionTable />
      </div>
    </div>
  );
}
