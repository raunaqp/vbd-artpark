import GlobalFilters from "@/components/GlobalFilters";
import KpiCards from "@/components/KpiCards";
import RiskStrip from "@/components/RiskStrip";
import DashboardMap from "@/components/DashboardMap";
import RegionTable from "@/components/RegionTable";
import RecommendedActions from "@/components/RecommendedActions";
import { useFilters } from "@/contexts/FilterContext";
import { useDisease } from "@/contexts/DiseaseContext";
import { getFilteredRegions, getSituationSummary, applyDiseaseMultiplier } from "@/data/mockData";

export default function OverviewScreen() {
  const { appliedFilters } = useFilters();
  const { currentDisease, diseaseName } = useDisease();
  const rawRegions = getFilteredRegions(appliedFilters.district, appliedFilters.block);
  const regions = applyDiseaseMultiplier(rawRegions, currentDisease.caseMultiplier);
  const summary = getSituationSummary(regions, diseaseName, appliedFilters.district, appliedFilters.block);

  const riskDistribution = {
    high: regions.filter((r) => r.risk === "high").length,
    moderate: regions.filter((r) => r.risk === "moderate").length,
    low: regions.filter((r) => r.risk === "low").length,
  };

  const areaLabel = appliedFilters.block !== "All Blocks"
    ? "village/ward"
    : appliedFilters.district !== "All Districts"
    ? "block/municipality"
    : "district";

  return (
    <div>
      <GlobalFilters />

      <div className="section-card p-4 mb-6">
        <h3 className="section-title mb-2">Situation Summary — {diseaseName}</h3>
        <ul className="space-y-1.5 text-sm text-foreground">
          {summary.map((line, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              <span className="leading-relaxed">{line}</span>
            </li>
          ))}
        </ul>
      </div>

      <RecommendedActions />
      <KpiCards />

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
                <span className="text-sm font-semibold text-foreground">{count} {areaLabel}{count !== 1 ? "s" : ""}</span>
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
