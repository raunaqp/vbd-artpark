import { FileText, TestTube, CheckCircle, AlertTriangle } from "lucide-react";
import { kpiData } from "@/data/mockData";

const cards = [
  { label: "Suspected", value: kpiData.suspected, sub: "In selected period", className: "kpi-card-suspected", icon: FileText, color: "text-kpi-suspected" },
  { label: "Tested", value: kpiData.tested, sub: "Samples / persons tested", className: "kpi-card-tested", icon: TestTube, color: "text-kpi-tested" },
  { label: "Confirmed", value: kpiData.confirmed, sub: "L Form confirmed", className: "kpi-card-confirmed", icon: CheckCircle, color: "text-kpi-confirmed" },
  { label: "Deaths", value: kpiData.deaths, sub: "In selected period", className: "kpi-card-deaths", icon: AlertTriangle, color: "text-kpi-deaths" },
];

export default function KpiCards() {
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
