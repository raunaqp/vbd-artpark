import type { WeeklySummary } from "./aggregation";

interface Props { summary: WeeklySummary; areaLabel: string }

export default function ResponseSummaryCards({ summary, areaLabel }: Props) {
  const coverage = summary.priorityCoveragePct === null ? "—" : `${summary.priorityCoveragePct}%`;
  const cards: Array<{ label: string; value: string | number }> = [
    { label: `Total ${areaLabel}`, value: summary.totalAreas },
    { label: "Areas reporting", value: `${summary.areasReporting} of ${summary.totalAreas}` },
    { label: "Priority areas", value: summary.priorityAreas },
    { label: "Priority areas completed", value: summary.priorityCompleted },
    { label: "Priority areas pending", value: summary.priorityPending },
    { label: "Priority response coverage", value: coverage },
    { label: "Areas with field activity", value: summary.areasWithFieldActivity },
    { label: "Field personnel deployed", value: summary.personnelDeployed },
    { label: "Source reduction activities", value: summary.sourceReductionActivities },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="rounded-lg border border-border bg-card p-3">
          <div className="text-[11px] text-muted-foreground leading-tight">{c.label}</div>
          <div className="text-2xl font-bold mt-1 text-foreground">{c.value}</div>
        </div>
      ))}
    </div>
  );
}
