import { FileText, TestTube, CheckCircle, TrendingUp } from "lucide-react";
import { useFilters } from "@/contexts/FilterContext";
import { useDisease } from "@/contexts/DiseaseContext";
import { getFilteredRegions, getFilteredKpi, applyDiseaseMultiplier } from "@/data/mockData";

export default function KpiCards() {
  const { appliedFilters } = useFilters();
  const { currentDisease, diseaseName } = useDisease();
  const rawRegions = getFilteredRegions(appliedFilters);
  const regions = applyDiseaseMultiplier(rawRegions, currentDisease.caseMultiplier);
  const baseKpi = getFilteredKpi(appliedFilters);
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
      {cards.map((c) => (
        <div key={c.label} className={`kpi-card ${c.className}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">{c.label}</span>
            <c.icon className={`h-4 w-4 ${c.color}`} />
          </div>
          <div className={`text-2xl font-bold ${c.color}`}>{c.value.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}
