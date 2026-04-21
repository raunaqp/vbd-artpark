import { Sparkles, TrendingUp } from "lucide-react";
import { useFilters } from "@/contexts/FilterContext";
import { useDisease } from "@/contexts/DiseaseContext";
import { getNewEmergenceAreas, getRisingClusters, type ConcernArea } from "@/data/mockData";

function levelLabel(level: ConcernArea["level"]) {
  return level === "ward" ? "Ward / Village" : level === "block" ? "Block / Municipality" : "District";
}

function ConcernList({
  title,
  icon: Icon,
  items,
  emptyText,
  accent,
  showDelta,
}: {
  title: string;
  icon: typeof Sparkles;
  items: ConcernArea[];
  emptyText: string;
  accent: "primary" | "high";
  showDelta: boolean;
}) {
  const accentText = accent === "high" ? "text-risk-high" : "text-primary";
  const accentBg = accent === "high" ? "bg-risk-high/10" : "bg-primary/10";
  const accentBorder = accent === "high" ? "border-risk-high/30" : "border-primary/30";

  return (
    <div className={`rounded-lg border ${accentBorder} bg-card p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`h-7 w-7 rounded-md ${accentBg} ${accentText} flex items-center justify-center`}>
          <Icon className="h-4 w-4" />
        </div>
        <h4 className="font-semibold text-sm">{title}</h4>
        <span className="ml-auto text-[10px] text-muted-foreground uppercase tracking-wide">
          {items.length} area{items.length !== 1 ? "s" : ""}
        </span>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">{emptyText}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={`${it.name}-${it.parent || ""}`} className="flex items-start justify-between gap-3 text-sm">
              <div className="min-w-0">
                <div className="font-medium text-foreground truncate">{it.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {levelLabel(it.level)}
                  {it.parent ? ` · ${it.parent}` : ""}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`text-sm font-semibold ${accentText}`}>{it.cases}</div>
                <div className="text-[10px] text-muted-foreground">
                  {showDelta
                    ? `↑ ${it.changePct}% vs prior 2w`
                    : `prev: ${it.prevCases}`}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AreasOfConcern() {
  const { appliedFilters } = useFilters();
  const { diseaseName } = useDisease();
  const newEmergence = getNewEmergenceAreas(appliedFilters);
  const rising = getRisingClusters(appliedFilters);

  return (
    <div className="section-card p-5 mb-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="section-title">Areas of Concern — {diseaseName}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Early-warning signals from the last 14 days
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ConcernList
          title="New Emergence (Last 2 Weeks)"
          icon={Sparkles}
          items={newEmergence}
          emptyText="No new sporadic case emergence detected in the selected scope."
          accent="primary"
          showDelta={false}
        />
        <ConcernList
          title="Rising Clusters (Trend-Based)"
          icon={TrendingUp}
          items={rising}
          emptyText="No areas show meaningful 2-week-over-2-week growth."
          accent="high"
          showDelta
        />
      </div>
    </div>
  );
}
