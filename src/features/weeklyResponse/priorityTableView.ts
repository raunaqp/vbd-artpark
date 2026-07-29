// Priority Action Table view model (R4.4.2) — sort, filter, search.
//
// Pure and synchronous. `buildPriorityRows` has already done the expensive work
// (see priorityRows.ts); everything here runs over the resolved array on every
// keystroke, so it stays allocation-light and free of data-layer imports.
//
// Split out of the component so the ordering and filtering rules can be tested
// without a DOM — the same split `aggregation.ts` and `effectiveness.ts` use.

import type {
  CoverageLevel,
  FoggingTier,
  PriorityRow,
  RiskTier,
  TrendTier,
} from "./priorityRows";

// ──────────────── Sorting ────────────────

/**
 * `priority` is the default and is not attached to any column header — it is
 * the composite score from the resolver. Every other key is a clickable column.
 */
export type SortKey =
  | "priority"
  | "ward"
  | "risk"
  | "trend"
  | "fogging"
  | "breeding"
  | "coverage"
  | "action";

export type SortDir = "asc" | "desc";

export interface SortState {
  key: SortKey;
  dir: SortDir;
}

export const DEFAULT_SORT: SortState = { key: "priority", dir: "desc" };

// Ranks are "higher is worse", so descending — the default direction on every
// column — always puts the wards needing attention first. That keeps one rule
// in the user's head: first click on any column = most urgent first.
const RISK_RANK: Record<RiskTier, number> = { very_high: 4, high: 3, moderate: 2, low: 1, no_data: 0 };
const TREND_RANK: Record<TrendTier, number> = { rising: 3, steady: 2, falling: 1, none: 0 };
const FOGGING_RANK: Record<FoggingTier, number> = { overdue: 3, no_record: 2, due: 1, recent: 0 };
const COVERAGE_RANK: Record<CoverageLevel, number> = { low: 3, no_data: 2, medium: 1, high: 0 };

/** The value a column sorts on. Strings compare with localeCompare, numbers numerically. */
export function sortValue(row: PriorityRow, key: SortKey): number | string {
  switch (key) {
    case "priority": return row.score;
    case "ward": return row.ward;
    case "risk": return RISK_RANK[row.risk];
    case "trend": return TREND_RANK[row.trend];
    case "fogging": return FOGGING_RANK[row.foggingStatus ?? "no_record"];
    // Major sites dominate; minor sites only break ties between equal majors.
    case "breeding": return row.majorOpen * 1000 + row.minorOpen;
    case "coverage": return COVERAGE_RANK[row.coverage];
    case "action": return row.recommendation?.action_text ?? "";
  }
}

/**
 * Sort rows by the active column.
 *
 * Ties always fall back to ward name ascending, so the order is stable across
 * re-renders and identical between sessions — a table that reshuffles its
 * equal-ranked rows on every repaint is unusable for reading down a list.
 */
export function sortRows(rows: PriorityRow[], sort: SortState): PriorityRow[] {
  const factor = sort.dir === "desc" ? -1 : 1;
  return [...rows].sort((a, b) => {
    const va = sortValue(a, sort.key);
    const vb = sortValue(b, sort.key);
    let cmp: number;
    if (typeof va === "string" || typeof vb === "string") {
      cmp = String(va).localeCompare(String(vb));
    } else {
      cmp = va - vb;
    }
    if (cmp !== 0) return cmp * factor;
    return a.ward.localeCompare(b.ward);
  });
}

/**
 * What clicking a column header does: a new column starts descending (most
 * urgent first); the active column flips direction.
 */
export function nextSort(current: SortState, key: SortKey): SortState {
  if (current.key !== key) return { key, dir: "desc" };
  return { key, dir: current.dir === "desc" ? "asc" : "desc" };
}

// ──────────────── Filtering ────────────────

/** Breeding is a single-choice band, not a multi-select — the bands overlap. */
export type BreedingFilter = "any" | "any_major" | "none" | "1-2" | "3+";

export interface TableFilters {
  risk: RiskTier[];
  trend: TrendTier[];
  fogging: FoggingTier[];
  coverage: CoverageLevel[];
  breeding: BreedingFilter;
  /** Exact action text, or "" for all. */
  action: string;
}

export const EMPTY_FILTERS: TableFilters = {
  risk: [],
  trend: [],
  fogging: [],
  coverage: [],
  breeding: "any",
  action: "",
};

/** An empty multi-select means "no constraint", not "match nothing". */
const passesMulti = <T,>(selected: T[], value: T): boolean =>
  selected.length === 0 || selected.includes(value);

export function passesBreeding(majorOpen: number, filter: BreedingFilter): boolean {
  switch (filter) {
    case "any": return true;
    case "any_major": return majorOpen >= 1;
    case "none": return majorOpen === 0;
    case "1-2": return majorOpen >= 1 && majorOpen <= 2;
    case "3+": return majorOpen >= 3;
  }
}

/** How many filter groups are constraining the table — the "Filters (3)" badge. */
export function activeFilterCount(f: TableFilters): number {
  return (
    (f.risk.length ? 1 : 0) +
    (f.trend.length ? 1 : 0) +
    (f.fogging.length ? 1 : 0) +
    (f.coverage.length ? 1 : 0) +
    (f.breeding !== "any" ? 1 : 0) +
    (f.action ? 1 : 0)
  );
}

/** Toggle one value in a multi-select group. */
export function toggleValue<T>(selected: T[], value: T): T[] {
  return selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value];
}

// ──────────────── Search ────────────────

/**
 * Case-insensitive substring over ward, parent zone (district) and block —
 * the three names the officer can see on the row.
 */
export function matchesSearch(row: PriorityRow, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    row.ward.toLowerCase().includes(q) ||
    row.district.toLowerCase().includes(q) ||
    row.block.toLowerCase().includes(q)
  );
}

// ──────────────── Cell formatting ────────────────

const FOGGING_LABEL: Record<FoggingTier, string> = {
  overdue: "Overdue",
  due: "Due",
  recent: "Recent",
  no_record: "No record",
};

export const foggingLabel = (status: FoggingTier | null): string => FOGGING_LABEL[status ?? "no_record"];

/**
 * "Overdue · 34d".
 *
 * The fogging dataset uses 999 as its no-record sentinel, so the day count is
 * only shown when it is a real measurement — "No record · 999d" would read as a
 * three-year-old fogging round rather than an absent one.
 */
export function formatFogging(row: Pick<PriorityRow, "foggingStatus" | "daysSinceLastFogging">): string {
  const status = row.foggingStatus ?? "no_record";
  const days = row.daysSinceLastFogging;
  if (status === "no_record" || days === null || days >= 999) return FOGGING_LABEL[status];
  return `${FOGGING_LABEL[status]} · ${days}d`;
}

// ──────────────── Combined ────────────────

/** Filter, search, then sort. Returns a new array; never mutates `rows`. */
export function applyTableView(
  rows: PriorityRow[],
  filters: TableFilters,
  search: string,
  sort: SortState,
): PriorityRow[] {
  const filtered = rows.filter(
    (r) =>
      passesMulti(filters.risk, r.risk) &&
      passesMulti(filters.trend, r.trend) &&
      passesMulti(filters.fogging, r.foggingStatus ?? "no_record") &&
      passesMulti(filters.coverage, r.coverage) &&
      passesBreeding(r.majorOpen, filters.breeding) &&
      (!filters.action || r.recommendation?.action_text === filters.action) &&
      matchesSearch(r, search),
  );
  return sortRows(filtered, sort);
}

/** Distinct recommended actions present in the data, for the action dropdown. */
export function uniqueActions(rows: PriorityRow[]): string[] {
  const set = new Set<string>();
  for (const r of rows) if (r.recommendation) set.add(r.recommendation.action_text);
  return [...set].sort((a, b) => a.localeCompare(b));
}

/**
 * Risk tiers present in the data, worst first, each paired with the label the
 * resolver gave it.
 *
 * Built from the rows rather than a constant because the label is state-aware —
 * `very_high` reads "Critical" in ICMR states and "Very High" in WHO states.
 * The filter pills must say what the cells say.
 */
export function riskOptions(rows: PriorityRow[]): Array<{ tier: RiskTier; label: string }> {
  const seen = new Map<RiskTier, string>();
  for (const r of rows) if (!seen.has(r.risk)) seen.set(r.risk, r.riskLabel);
  return [...seen.entries()]
    .map(([tier, label]) => ({ tier, label }))
    .sort((a, b) => RISK_RANK[b.tier] - RISK_RANK[a.tier]);
}
