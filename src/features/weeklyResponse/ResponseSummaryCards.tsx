import type { WeeklySummary } from "./aggregation";

interface Props { summary: WeeklySummary; areaLabel: string }

export default function ResponseSummaryCards({ summary, areaLabel }: Props) {
  const cards = [
    { label: `Total ${areaLabel}`, value: summary.totalAreas },
    { label: "Reported this week", value: `${summary.reporting} of ${summary.totalAreas}` },
    { label: `${cap(areaLabel)} with field activity`, value: summary.withFieldActivity },
    { label: "Field personnel deployed", value: summary.personnel },
    { label: "Source reduction activities", value: summary.sourceReduction },
    { label: `High-risk ${areaLabel} with no response`, value: summary.highRiskNoResponse, emphasize: summary.highRiskNoResponse > 0 },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c) => (
        <div key={c.label} className={`rounded-lg border p-3 ${c.emphasize ? "border-risk-high/40 bg-risk-high/5" : "border-border bg-card"}`}>
          <div className="text-[11px] text-muted-foreground leading-tight">{c.label}</div>
          <div className={`text-2xl font-bold mt-1 ${c.emphasize ? "text-risk-high" : "text-foreground"}`}>{c.value}</div>
        </div>
      ))}
    </div>
  );
}

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
