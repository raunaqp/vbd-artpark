import { FileText, TestTube, CheckCircle, TrendingUp } from "lucide-react";
import { useFilters } from "@/contexts/FilterContext";
import { useDisease } from "@/contexts/DiseaseContext";
import { getFilteredRegions, getFilteredKpi, applyDiseaseMultiplier } from "@/data/mockData";

interface Props {
  /** Trailing weeks to aggregate. Defaults to 4 (Overview "Last 4 Weeks"). */
  windowWeeks?: number;
  /**
   * Opt-in click-through. When omitted the cards render exactly as before —
   * inert, no pointer cursor — which is how Overview keeps them.
   */
  onTotalClick?: (kpiName: string) => void;
}

export default function KpiCards({ windowWeeks = 4, onTotalClick }: Props = {}) {
  const { appliedFilters } = useFilters();
  const { currentDisease, diseaseName } = useDisease();
  const rawRegions = getFilteredRegions(appliedFilters, windowWeeks);
  const regions = applyDiseaseMultiplier(rawRegions, currentDisease.caseMultiplier);
  const baseKpi = getFilteredKpi(appliedFilters, windowWeeks);
  const kpi = {
    suspected: Math.round(baseKpi.suspected * currentDisease.caseMultiplier),
    tested: Math.round(baseKpi.tested * currentDisease.caseMultiplier),
    confirmed: Math.round(baseKpi.confirmed * currentDisease.caseMultiplier),
  };
  const highRiskAreas = regions.filter((r) => r.risk === "high").length;

  const cards = [
    { label: "Suspected", value: kpi.suspected, sub: `${diseaseName} suspected in period`, className: "kpi-card-suspected", icon: FileText, color: "text-kpi-suspected" },
    { label: "Tested", value: kpi.tested, sub: "Samples / persons tested", className: "kpi-card-tested", icon: TestTube, color: "text-kpi-tested" },
    { label: "Confirmed", value: kpi.confirmed, sub: `Lab confirmed ${diseaseName.toLowerCase()}`, className: "kpi-card-confirmed", icon: CheckCircle, color: "text-kpi-confirmed" },
    { label: "High Risk Areas", value: highRiskAreas, sub: "Areas needing immediate action", className: "kpi-card-deaths", icon: TrendingUp, color: "text-kpi-deaths" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((c) => {
        const body = (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">{c.label}</span>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </div>
            <div className={`text-2xl font-bold ${c.color}`}>{c.value.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">{c.sub}</div>
          </>
        );
        // A real button when clickable, so focus and Enter/Space come for free.
        return onTotalClick ? (
          <button
            key={c.label}
            type="button"
            onClick={() => onTotalClick(c.label)}
            aria-label={`${c.label}: ${c.value.toLocaleString()} — show contributing areas`}
            className={`kpi-card ${c.className} text-left w-full cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
          >
            {body}
          </button>
        ) : (
          <div key={c.label} className={`kpi-card ${c.className}`}>{body}</div>
        );
      })}
    </div>
  );
}
