// View-model for the KPI click-through modal (Session B).
//
// Kept separate from the modal component for the same reason
// `priorityTableView.ts` is separate from its table: the title and window
// vocabulary are worth testing without mounting a Dialog, a chart library, or
// the mock dataset behind them.
//
// Pure — no React, no data access.

/** The four KPI cards, by the label `KpiCards` renders. */
export type KpiName = "Suspected" | "Tested" | "Confirmed" | "High Risk Areas";

/** Trailing-week windows offered by the picker. */
export const WINDOW_OPTIONS = [2, 4, 8, 12] as const;
export type WindowWeeks = (typeof WINDOW_OPTIONS)[number];

export const DEFAULT_WINDOW: WindowWeeks = 4;

/**
 * The High Risk Areas card counts areas, not cases, so its modal lists only
 * the areas that count towards it. The three case-count cards list everything.
 */
export function isHighRiskKpi(kpi: string): boolean {
  return kpi === "High Risk Areas";
}

// The card labels are terse because they sit above a number. In a sentence they
// need the noun back — "Confirmed" alone does not read as a thing areas
// contribute to.
const TITLE_LABEL: Record<KpiName, string> = {
  Suspected: "Suspected cases",
  Tested: "Tested samples",
  Confirmed: "Confirmed cases",
  "High Risk Areas": "High Risk Areas",
};

/** `Areas contributing — Confirmed cases, last 4 weeks` */
export function breakdownTitle(kpi: string, weeks: number): string {
  const label = TITLE_LABEL[kpi as KpiName] ?? kpi;
  return `Areas contributing — ${label}, last ${weeks} weeks`;
}

/**
 * One line under the title, because the ranking is not self-evident.
 *
 * Every window ranks by confirmed cases — including the Suspected and Tested
 * modals, where the column you clicked is not the column you are sorted by.
 * Saying so is cheaper than an officer wondering why the Tested breakdown is
 * not in tested order.
 */
export function breakdownSubtitle(kpi: string): string {
  return isHighRiskKpi(kpi)
    ? "High-risk areas only, ranked by confirmed cases in the window."
    : "Ranked by confirmed cases in the window.";
}

/** Empty-state copy — one message, whichever KPI opened the modal. */
export const EMPTY_MESSAGE = "No areas with cases in this window.";
