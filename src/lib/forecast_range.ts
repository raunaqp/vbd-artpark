// Forecast display ranges.
//
// Point estimates read as false precision on the dashboard — "1,172 projected
// cases" implies a confidence the model does not have. Until the model emits
// real bounds, every forecast surface renders a mocked ±10% band around the
// point instead.
//
// This is a DISPLAY concern only. Nothing here is stored, and no data model
// carries a range: the band is a pure function of the point estimate that each
// surface already holds. When the real model starts emitting genuine
// (asymmetric) bounds, they belong in the data layer and these helpers should
// take the bounds as input rather than deriving them.

/** Mocked band width. Not config-driven by design — see the module comment. */
const BAND = 0.1;

export interface CaseRange {
  lower: number;
  upper: number;
}

/**
 * The ±10% band around a point estimate, or null when there is no estimate.
 *
 * Null and undefined both mean "no forecast for this area" — sub-district
 * geographies genuinely have none, and callers render an em dash for them
 * rather than backfilling a zero.
 */
export function caseRangeBounds(point: number | null | undefined): CaseRange | null {
  if (point === null || point === undefined || !Number.isFinite(point)) return null;
  return {
    lower: Math.round(point * (1 - BAND)),
    upper: Math.round(point * (1 + BAND)),
  };
}

/**
 * Format a point estimate as its display range — `1,055 – 1,289`, or `—`.
 *
 * `plain` drops the thousands separators, for CSV cells where a grouped number
 * would otherwise have to be quoted and would fight downstream parsing.
 */
export function formatCaseRange(
  point: number | null | undefined,
  opts: { plain?: boolean } = {},
): string {
  const range = caseRangeBounds(point);
  if (!range) return "—";
  const fmt = (n: number) => (opts.plain ? String(n) : n.toLocaleString());
  return `${fmt(range.lower)} – ${fmt(range.upper)}`;
}

/** Caption for forecast surfaces that show a range in place of a point. */
export const CASE_RANGE_CAPTION = "expected case range (4-week horizon)";
