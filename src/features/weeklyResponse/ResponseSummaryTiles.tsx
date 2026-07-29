// Six-tile summary row (R4.4.3) — the Response tab's headline numbers.
//
// Replaces the nine-number Weekly Ops block and the three-number Effectiveness
// block with the six the design doc names: High-risk Areas, Responses Completed,
// Responses Pending, Fogging Overdue, Major Breeding Sites Open, Response
// Coverage. See docs/design/PREDICTION_VS_OPERATIONS.md.
//
// The tiles mix two grains and say so. Tiles 1-3 and 6 count areas at the
// current drill level (districts at state level, blocks under a district, wards
// under a block); tiles 4 and 5 are always ward grain, because fogging and
// breeding sites are only recorded per ward. Without the sub-label, "3
// high-risk areas / 71 fogging overdue wards" reads as a contradiction.
//
// Ward-derived tiles show "—" rather than 0 until the R3 datasets resolve. A
// zero that means "still loading" is worse than no number at all — it reads as
// "nothing is overdue".

import type { ReactNode } from "react";
import type { WeeklySummary } from "./aggregation";
import { countFoggingOverdue, sumMajorBreedingOpen, type OperationalWardMap } from "./operationalWards";

interface Props {
  summary: WeeklySummary;
  /** Ward scope for the current filters — tiles 4 and 5. */
  wards: OperationalWardMap;
  /** True until the first R3 resolve lands. */
  loading?: boolean;
  /** Plural area noun for the current grain, e.g. "districts" / "wards". */
  areaLabel: string;
  /** Slot beside the heading — the Response tab drops the week selector here. */
  headerRight?: ReactNode;
}

interface Tile {
  label: string;
  value: string | number;
  /** Muted grain hint, where the number would otherwise be ambiguous. */
  sub?: string;
  /** Draws the eye — the two tiles that mean "work is outstanding". */
  alert?: boolean;
}

export default function ResponseSummaryTiles({ summary, wards, loading = false, areaLabel, headerRight }: Props) {
  // Only the ward-derived tiles wait on R3; the rest come from the already
  // resolved area aggregates, so blanking all six would be a lie.
  const wardValue = (n: number): string | number => (loading ? "—" : n);

  const tiles: Tile[] = [
    { label: "High-risk Areas", value: summary.highRiskAreas, sub: areaLabel, alert: summary.highRiskAreas > 0 },
    { label: "Priority Responses Completed", value: summary.priorityCompleted, sub: `of ${summary.priorityAreas} priority` },
    { label: "Priority Responses Pending", value: summary.priorityPending, sub: `of ${summary.priorityAreas} priority`, alert: summary.priorityPending > 0 },
    { label: "Fogging Overdue Wards", value: wardValue(countFoggingOverdue(wards)), sub: "wards" },
    { label: "Major Breeding Sites Open", value: wardValue(sumMajorBreedingOpen(wards)), sub: "across wards" },
    {
      label: "Response Coverage",
      value: summary.priorityCoveragePct === null ? "—" : `${summary.priorityCoveragePct}%`,
      sub: summary.priorityCoveragePct === null ? "no priority areas" : "of priority areas",
    },
  ];

  return (
    <div>
      {headerRight && (
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div>
            <h3 className="section-title">This Week</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Operational position against the forecast, for the selected scope
            </p>
          </div>
          {headerRight}
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {tiles.map((t) => (
          <div
            key={t.label}
            className="rounded-lg border border-border bg-card p-3"
            style={t.alert ? { borderColor: "hsl(var(--risk-high) / 0.4)" } : undefined}
          >
            <div className="text-[11px] text-muted-foreground leading-tight">{t.label}</div>
            <div
              className="text-2xl font-bold mt-1"
              style={{ color: t.alert ? "hsl(var(--risk-high))" : "hsl(var(--foreground))" }}
            >
              {t.value}
            </div>
            {t.sub && <div className="text-[10px] text-muted-foreground/80 mt-0.5">{t.sub}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
