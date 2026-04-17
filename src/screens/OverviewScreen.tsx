import { ArrowRight } from "lucide-react";
import GlobalFilters from "@/components/GlobalFilters";
import KpiCards from "@/components/KpiCards";
import DashboardMap from "@/components/DashboardMap";
import RegionTable from "@/components/RegionTable";
import RecommendedActions from "@/components/RecommendedActions";
import { useFilters } from "@/contexts/FilterContext";
import { useDisease } from "@/contexts/DiseaseContext";
import {
  getFilteredRegions,
  getSituationSummary,
  applyDiseaseMultiplier,
  getRiskForecast,
} from "@/data/mockData";
import type { TabId } from "@/components/DashboardLayout";

interface Props {
  onNavigate?: (tab: TabId) => void;
}

export default function OverviewScreen({ onNavigate }: Props) {
  const { appliedFilters } = useFilters();
  const { currentDisease, diseaseName } = useDisease();
  const rawRegions = getFilteredRegions(appliedFilters);
  const regions = applyDiseaseMultiplier(rawRegions, currentDisease.caseMultiplier);
  const summary = getSituationSummary(regions, diseaseName, appliedFilters);

  const highCount = regions.filter((r) => r.risk === "high").length;
  const moderateCount = regions.filter((r) => r.risk === "moderate").length;

  const areaLabel = appliedFilters.block !== "All Blocks"
    ? "village/ward"
    : appliedFilters.district !== "All Districts"
    ? "block/municipality"
    : "district";
  const areaPlural = (n: number) => `${areaLabel}${n !== 1 ? "s" : ""}`;

  const actionLine = highCount === 0 && moderateCount === 0
    ? `No high or moderate-risk ${areaPlural(0)} currently identified`
    : `${highCount} ${areaPlural(highCount)} require immediate attention; ${moderateCount} at moderate risk`;

  // Lightweight forecast for Home
  const riskForecast = getRiskForecast(appliedFilters);
  const forecastHighOrMod = riskForecast.filter((f) => f.risk !== "low").length;
  const forecastInterpretation = forecastHighOrMod === 0
    ? "Low overall state burden expected over the next 4 weeks"
    : forecastHighOrMod >= 3
    ? "Elevated risk expected over the next 4 weeks across multiple districts"
    : "Low overall state burden expected, with moderate localized risk in select districts";

  return (
    <div>
      <GlobalFilters />

      {/* 1. Situation Summary */}
      <div className="section-card p-4 mb-6">
        <h3 className="section-title mb-2">Situation Summary — {diseaseName}</h3>
        <ul className="space-y-1.5 text-sm text-foreground">
          {summary.slice(0, 4).map((line, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              <span className="leading-relaxed">{line}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 2. Key Metrics */}
      <KpiCards />

      {/* 3. Observed Hotspots — single map + summary line + table */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
          <h3 className="section-title">Observed Hotspots (Last 4 Weeks)</h3>
          <span className="text-[11px] text-muted-foreground">Based on confirmed cases and recent trends</span>
        </div>
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2 mb-3 text-sm text-foreground">
          {actionLine}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardMap height="400px" />
          <RegionTable maxRows={8} />
        </div>
      </div>

      {/* 4. Recommended Actions */}
      <RecommendedActions />

      {/* 5. Forecast — lightweight cards only with CTA */}
      <div className="section-card p-5">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h3 className="section-title">Forecast — Next 4 Weeks</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Predicted weekly case counts and risk</p>
          </div>
          <button
            onClick={() => onNavigate?.("forecast")}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View detailed forecast <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {riskForecast.map((f) => {
            const riskClass = f.risk === "high" ? "border-risk-high bg-risk-high/5 text-risk-high"
              : f.risk === "moderate" ? "border-risk-moderate bg-risk-moderate/5 text-risk-moderate"
              : "border-risk-low bg-risk-low/5 text-risk-low";
            return (
              <div key={f.week} className={`rounded-lg border-2 p-3 text-center ${riskClass}`}>
                <div className="text-xs font-semibold">{f.label}</div>
                <div className="text-lg font-bold">{f.cases}</div>
                <div className="text-xs opacity-80">cases (predicted)</div>
                <div className="mt-1"><span className={`risk-badge-${f.risk}`}>{f.risk}</span></div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-3">{forecastInterpretation}</p>
      </div>
    </div>
  );
}
