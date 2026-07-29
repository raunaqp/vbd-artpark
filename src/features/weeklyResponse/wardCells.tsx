// Shared ward-cell renderers (R5.1).
//
// The Priority Action Table and the ward detail sheet describe the same ward.
// If each drew its own risk pill they would eventually disagree — the table
// saying "Critical" while the sheet opened on the same row said "High" is
// exactly the kind of drift that surfaces in front of an officer. One
// definition, two consumers.
//
// Presentation only: no data access, no derivation. The vocabulary these render
// comes from `priorityRows.ts`.

import { ArrowDown, ArrowRight, ArrowUp, Minus } from "lucide-react";
import type { CoverageLevel, FoggingTier, PriorityRow, TrendTier } from "./priorityRows";
import { formatFogging } from "./priorityTableView";

const TREND_META: Record<TrendTier, { label: string; Icon: typeof ArrowUp; cls: string }> = {
  rising: { label: "Rising", Icon: ArrowUp, cls: "text-risk-high font-medium" },
  steady: { label: "Steady", Icon: ArrowRight, cls: "text-muted-foreground" },
  falling: { label: "Falling", Icon: ArrowDown, cls: "text-risk-low" },
  // Fourth state, easy to forget: no cases in either window is not "steady".
  none: { label: "No cases", Icon: Minus, cls: "text-muted-foreground" },
};

/** Colour only — the label text comes from `formatFogging`. */
const FOGGING_CLS: Record<FoggingTier, string> = {
  overdue: "text-risk-high font-medium",
  due: "text-risk-moderate",
  recent: "text-risk-low",
  no_record: "text-muted-foreground",
};

const COVERAGE_META: Record<CoverageLevel, { label: string; cssVar: string | null }> = {
  high: { label: "High", cssVar: "--risk-low" },
  medium: { label: "Medium", cssVar: "--risk-moderate" },
  low: { label: "Low", cssVar: "--risk-high" },
  no_data: { label: "No data", cssVar: null },
};

export function TrendCell({ trend }: { trend: TrendTier }) {
  const t = TREND_META[trend];
  return (
    <span className={`inline-flex items-center gap-1 text-xs whitespace-nowrap ${t.cls}`}>
      <t.Icon className="h-3.5 w-3.5" />{t.label}
    </span>
  );
}

export function RiskPill({ row }: { row: Pick<PriorityRow, "risk" | "riskLabel"> }) {
  if (row.risk === "no_data") {
    return <span className="text-xs text-muted-foreground">No Data</span>;
  }
  // The palette is deliberately three-colour (see index.css). `very_high` reuses
  // the high hue as a solid fill rather than a tint, so the top tier is
  // distinguishable without inventing a fourth risk colour.
  if (row.risk === "very_high") {
    return (
      <span
        className="px-3 py-1 rounded-full text-xs font-semibold text-white"
        style={{ backgroundColor: "hsl(var(--risk-high))" }}
      >
        {row.riskLabel}
      </span>
    );
  }
  return <span className={`risk-badge-${row.risk}`}>{row.riskLabel}</span>;
}

export function CoveragePill({ coverage }: { coverage: CoverageLevel }) {
  const c = COVERAGE_META[coverage];
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${c.cssVar ? "" : "bg-muted text-muted-foreground"}`}
      style={c.cssVar ? { backgroundColor: `hsl(var(${c.cssVar}) / 0.15)`, color: `hsl(var(${c.cssVar}))` } : undefined}
    >
      {c.label}
    </span>
  );
}

/**
 * Fogging status and age, e.g. "Overdue · 34d".
 *
 * A component rather than an exported class map so this file exports only
 * components — the map and the label formatter stay together, which is what
 * keeps the 999-day sentinel from leaking into one surface and not the other.
 */
export function FoggingCell({ row }: { row: Pick<PriorityRow, "foggingStatus" | "daysSinceLastFogging"> }) {
  return (
    <span className={`text-xs whitespace-nowrap ${FOGGING_CLS[row.foggingStatus ?? "no_record"]}`}>
      {formatFogging(row)}
    </span>
  );
}
