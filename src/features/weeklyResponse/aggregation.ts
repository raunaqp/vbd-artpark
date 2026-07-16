import type { WeeklyResponseRecord, ActionType, RiskLevel } from "./types";
import { ACTION_TYPES } from "./types";

export interface AreaRow {
  key: string;                       // stable geography id for the row
  name: string;
  type?: string;
  risk: RiskLevel;
  level: "district" | "block" | "ward"; // grain within table
  district: string | null;
  block: string | null;
  ward: string | null;
}

export interface AreaAggregate {
  row: AreaRow;
  records: WeeklyResponseRecord[];
  primary?: WeeklyResponseRecord;    // record matching this exact grain
  fieldActivity: "yes" | "no" | "pending" | "none";
  reporting: "reported" | "not_reported" | "draft";
  personnel: number;
  sourceReduction: number;
  localitiesVisited: number;
  actionsCount: number;
  activityDate?: string;
}

export function summarizeRow(row: AreaRow, records: WeeklyResponseRecord[]): AreaAggregate {
  // Records that fall within this row's geography scope (rollup)
  const scoped = records.filter((r) => matchesScope(row, r));
  // Primary = record at this exact grain
  const primary = scoped.find(
    (r) => r.district === (row.district || r.district) &&
      (r.block_or_municipality || null) === row.block &&
      (r.ward_or_village || null) === row.ward,
  );

  let fieldActivity: AreaAggregate["fieldActivity"] = "none";
  if (primary) fieldActivity = primary.field_activity_status === "yes" ? "yes" : primary.field_activity_status === "no" ? "no" : "pending";
  else if (scoped.some((r) => r.field_activity_status === "yes")) fieldActivity = "yes";

  let reporting: AreaAggregate["reporting"] = "not_reported";
  if (primary) reporting = primary.reporting_status;
  else if (scoped.length) reporting = "reported";

  const personnel = scoped.reduce((s, r) => s + (r.personnel_deployed || 0), 0);
  const sourceReduction = scoped.reduce((s, r) => s + (r.source_reduction_count || 0), 0);
  const localitiesVisited = scoped.reduce((s, r) => s + (r.localities_visited ? r.localities_visited.split(",").filter(Boolean).length : 0), 0);
  const actionsCount = scoped.reduce((s, r) => s + (r.actions_taken?.length || 0), 0);
  const activityDate = primary?.activity_date || scoped.find((r) => r.activity_date)?.activity_date;

  return { row, records: scoped, primary, fieldActivity, reporting, personnel, sourceReduction, localitiesVisited, actionsCount, activityDate };
}

function matchesScope(row: AreaRow, r: WeeklyResponseRecord): boolean {
  if (row.district && r.district !== row.district) return false;
  if (row.block && (r.block_or_municipality || null) !== row.block) return false;
  if (row.ward && (r.ward_or_village || null) !== row.ward) return false;
  return true;
}

export interface WeeklySummary {
  totalAreas: number;
  reporting: number;
  withFieldActivity: number;
  personnel: number;
  sourceReduction: number;
  highRiskNoResponse: number;
}

export function buildSummary(aggs: AreaAggregate[]): WeeklySummary {
  return {
    totalAreas: aggs.length,
    reporting: aggs.filter((a) => a.reporting === "reported" || a.reporting === "draft").length,
    withFieldActivity: aggs.filter((a) => a.fieldActivity === "yes").length,
    personnel: aggs.reduce((s, a) => s + a.personnel, 0),
    sourceReduction: aggs.reduce((s, a) => s + a.sourceReduction, 0),
    highRiskNoResponse: aggs.filter((a) => a.row.risk === "high" && a.fieldActivity !== "yes").length,
  };
}

export function actionsByCategory(records: WeeklyResponseRecord[]): Array<{ action: ActionType; count: number }> {
  const map = new Map<ActionType, number>();
  for (const r of records) for (const a of r.actions_taken || []) map.set(a, (map.get(a) || 0) + 1);
  return ACTION_TYPES.map((a) => ({ action: a, count: map.get(a) || 0 })).filter((x) => x.count > 0);
}

export function medianDaysForecastToActivity(records: WeeklyResponseRecord[]): number | null {
  const days: number[] = [];
  for (const r of records) {
    if (!r.activity_date || !r.forecast_generated_at) continue;
    const a = new Date(r.activity_date).getTime();
    const f = new Date(r.forecast_generated_at).getTime();
    if (isFinite(a) && isFinite(f)) days.push(Math.round((a - f) / 86400000));
  }
  if (!days.length) return null;
  days.sort((x, y) => x - y);
  const mid = Math.floor(days.length / 2);
  return days.length % 2 ? days[mid] : Math.round((days[mid - 1] + days[mid]) / 2);
}
