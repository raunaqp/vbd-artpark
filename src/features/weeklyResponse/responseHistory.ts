// Response History view model (R6.1) — describe, sort, filter.
//
// Pure and synchronous, split out of the panel so the rules can be tested
// without a DOM — the same split priorityTableView.ts uses, and the same reason
// the panel itself exports only a component.

import { EPI_WEEKS } from "@/data/mock_dataset";
import type { FieldActivityStatus, WeeklyResponseRecord } from "./types";

// ──────────────── Vocabulary ────────────────

/** The officer-facing name for each logged outcome. Colours live in the panel. */
export const TYPE_LABEL: Record<FieldActivityStatus, string> = {
  yes: "Field activity",
  no: "No activity",
  report_pending: "Report pending",
};

export const TYPE_ORDER: FieldActivityStatus[] = ["yes", "no", "report_pending"];

/**
 * What actually happened, in one cell.
 *
 * Every detail field on the record is optional, so a legitimately sparse row
 * renders "—" rather than a fabricated zero — a logged response with no
 * personnel count recorded is not a response with zero personnel.
 */
export function describeRecord(r: WeeklyResponseRecord): string {
  if (r.field_activity_status === "no") {
    if (r.no_activity_reason === "Other" && r.no_activity_reason_other) return r.no_activity_reason_other;
    return r.no_activity_reason ?? "No reason recorded";
  }
  if (r.field_activity_status === "report_pending") return "—";

  const bits: string[] = [];
  if (r.personnel_deployed) bits.push(`${r.personnel_deployed} personnel`);
  const activities = r.activities_performed?.length ? r.activities_performed : r.actions_taken;
  if (activities?.length) bits.push(activities.join(", "));
  return bits.length ? bits.join(" · ") : "—";
}

/** Ward with its parent geography beneath, where the record carries one. */
export function describeArea(r: WeeklyResponseRecord): { name: string; parent: string | null } {
  const parent = [r.district, r.block_or_mun].filter(Boolean).join(" · ");
  return { name: r.geography_name, parent: parent || null };
}

/** Timestamps are ISO; the date is the part an officer reads. */
export const loggedDate = (r: WeeklyResponseRecord): string => (r.recorded_at || r.logged_at || "").slice(0, 10);

// ──────────────── Sorting ────────────────

export type HistorySortKey = "week" | "area" | "type" | "loggedBy" | "date";
export type SortDir = "asc" | "desc";
export interface HistorySort { key: HistorySortKey; dir: SortDir }

export const DEFAULT_HISTORY_SORT: HistorySort = { key: "date", dir: "desc" };

function sortValue(r: WeeklyResponseRecord, key: HistorySortKey): number | string {
  switch (key) {
    // Positional in EPI_WEEKS: the list runs W36..W52 then W1..W19, so the
    // week number does not order chronologically on its own.
    case "week": return EPI_WEEKS.indexOf(r.epidemiological_week);
    case "area": return r.geography_name;
    case "type": return TYPE_ORDER.indexOf(r.field_activity_status);
    case "loggedBy": return r.logged_by_name;
    case "date": return loggedDate(r);
  }
}

export function sortRecords(records: WeeklyResponseRecord[], sort: HistorySort): WeeklyResponseRecord[] {
  const factor = sort.dir === "desc" ? -1 : 1;
  return [...records].sort((a, b) => {
    const va = sortValue(a, sort.key);
    const vb = sortValue(b, sort.key);
    const cmp = typeof va === "string" || typeof vb === "string"
      ? String(va).localeCompare(String(vb))
      : va - vb;
    // Stable tiebreak so equal-ranked rows keep a fixed order between repaints.
    return cmp !== 0 ? cmp * factor : a.id.localeCompare(b.id);
  });
}

export function nextHistorySort(current: HistorySort, key: HistorySortKey): HistorySort {
  if (current.key !== key) return { key, dir: "desc" };
  return { key, dir: current.dir === "desc" ? "asc" : "desc" };
}

// ──────────────── Filtering ────────────────

export interface HistoryFilters {
  weeks: string[];
  types: FieldActivityStatus[];
}

export const EMPTY_HISTORY_FILTERS: HistoryFilters = { weeks: [], types: [] };

const passes = <T,>(selected: T[], value: T) => selected.length === 0 || selected.includes(value);

export function matchesAreaSearch(r: WeeklyResponseRecord, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [r.geography_name, r.district, r.block_or_mun, r.ward_or_village]
    .filter(Boolean)
    .some((v) => String(v).toLowerCase().includes(q));
}

export function applyHistoryView(
  records: WeeklyResponseRecord[],
  filters: HistoryFilters,
  search: string,
  sort: HistorySort,
): WeeklyResponseRecord[] {
  return sortRecords(
    records.filter(
      (r) =>
        passes(filters.weeks, r.epidemiological_week) &&
        passes(filters.types, r.field_activity_status) &&
        matchesAreaSearch(r, search),
    ),
    sort,
  );
}

/** Weeks present in the data, most recent first. */
export function weekOptions(records: WeeklyResponseRecord[]): string[] {
  const seen = new Set(records.map((r) => r.epidemiological_week));
  return [...seen].sort((a, b) => EPI_WEEKS.indexOf(b) - EPI_WEEKS.indexOf(a));
}

export const toggle = <T,>(list: T[], v: T): T[] => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
