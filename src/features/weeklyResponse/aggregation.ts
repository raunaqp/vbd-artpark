import type { WeeklyResponseRecord, ActionType, RiskLevel, ReportingStatus } from "./types";
import { ACTION_TYPES } from "./types";

// ── Worklist status ────────────────────────────────────────────────
// The four operational states shown to officers:
//   pending        → priority area with no response logged yet (needs action)
//   report_pending → officer marked the week "report pending"
//   no_activity    → officer recorded "no field activity" (with a reason)
//   completed      → field activity conducted and logged
export type WorklistStatus = "pending" | "report_pending" | "no_activity" | "completed";

export interface AreaRow {
  key: string;                          // stable geography id for the row
  name: string;
  type?: string;
  risk: RiskLevel;
  level: "district" | "block" | "ward"; // grain within the current table
  district: string | null;
  block: string | null;
  ward: string | null;
}

export interface AreaAggregate {
  row: AreaRow;
  records: WeeklyResponseRecord[];   // records rolled up under this row's scope
  primary?: WeeklyResponseRecord;    // record at this exact grain, if any
  hasRecord: boolean;                // any response logged at/under this area
  fieldActivity: "yes" | "no" | "report_pending" | "none";
  status: WorklistStatus;
  reporting: ReportingStatus | "not_reported";
  personnel: number;
  areasCovered: number;
  sourceReduction: number;
  actionsCount: number;
  activityDate?: string;
}

const PRIORITY_RISKS: RiskLevel[] = ["high", "moderate"];

/** Map a stored reporting status to the worklist status used in the UI. */
function statusFromReporting(reporting: ReportingStatus): WorklistStatus {
  switch (reporting) {
    case "completed": return "completed";
    case "no_activity": return "no_activity";
    case "report_pending": return "report_pending";
    default: return "pending"; // draft / unknown → still needs attention
  }
}

function matchesScope(row: AreaRow, r: WeeklyResponseRecord): boolean {
  if (row.district && r.district !== row.district) return false;
  if (row.block && (r.block_or_municipality || null) !== row.block) return false;
  if (row.ward && (r.ward_or_village || null) !== row.ward) return false;
  return true;
}

/**
 * Resolve the worklist status for a display row.
 * Leaf rows use their own record. Parent rows (state→district, block→ward
 * rollups) apply the STRICT rule: completed only when at least one descendant
 * is completed AND no priority descendant is still pending / no-activity /
 * report-pending.
 */
export function resolveRowStatus(row: AreaRow, primary: WeeklyResponseRecord | undefined, scoped: WeeklyResponseRecord[]): WorklistStatus {
  if (primary) return statusFromReporting(primary.reporting_status);
  if (scoped.length === 0) return "pending"; // nothing logged anywhere under this area

  const priorityDesc = scoped.filter((r) => PRIORITY_RISKS.includes(r.risk_level_at_capture));
  const judged = priorityDesc.length ? priorityDesc : scoped;

  const someCompleted = judged.some((r) => r.reporting_status === "completed");
  const anyIncomplete = judged.some((r) => r.reporting_status !== "completed");

  if (someCompleted && !anyIncomplete) return "completed";
  if (judged.some((r) => r.reporting_status === "report_pending" || r.reporting_status === "draft")) return "report_pending";
  if (judged.some((r) => r.reporting_status === "no_activity")) return "no_activity";
  return someCompleted ? "completed" : "pending";
}

export function summarizeRow(row: AreaRow, records: WeeklyResponseRecord[]): AreaAggregate {
  const scoped = records.filter((r) => matchesScope(row, r));
  const primary = scoped.find(
    (r) => r.district === (row.district || r.district) &&
      (r.block_or_municipality || null) === row.block &&
      (r.ward_or_village || null) === row.ward,
  );

  let fieldActivity: AreaAggregate["fieldActivity"] = "none";
  if (primary) fieldActivity = primary.field_activity_status;
  else if (scoped.some((r) => r.field_activity_status === "yes")) fieldActivity = "yes";
  else if (scoped.some((r) => r.field_activity_status === "report_pending")) fieldActivity = "report_pending";
  else if (scoped.length) fieldActivity = "no";

  const reporting: AreaAggregate["reporting"] = primary
    ? primary.reporting_status
    : scoped.length ? "completed" : "not_reported";

  const status = resolveRowStatus(row, primary, scoped);

  const personnel = scoped.reduce((s, r) => s + (r.personnel_deployed || 0), 0);
  const areasCovered = scoped.reduce((s, r) => s + (r.areas_covered || 0), 0);
  const sourceReduction = scoped.reduce((s, r) => s + (r.source_reduction_count || 0), 0);
  const actionsCount = scoped.reduce((s, r) => s + (r.actions_taken?.length || 0), 0);
  const activityDate = primary?.activity_date || scoped.find((r) => r.activity_date)?.activity_date;

  return {
    row,
    records: scoped,
    primary,
    hasRecord: scoped.length > 0,
    fieldActivity,
    status,
    reporting,
    personnel,
    areasCovered,
    sourceReduction,
    actionsCount,
    activityDate,
  };
}

// ── Summary over display rows ──────────────────────────────────────
export interface WeeklySummary {
  totalAreas: number;
  areasReporting: number;
  priorityAreas: number;
  priorityCompleted: number;
  priorityPending: number;
  priorityCoveragePct: number | null; // null when there are no priority areas
  areasWithFieldActivity: number;
  personnelDeployed: number;
  areasCovered: number;
  sourceReductionActivities: number;
  highRiskNoCompleted: number;
  moderateRiskNoCompleted: number;
}

const isPriority = (risk: RiskLevel) => risk === "high" || risk === "moderate";

export function buildSummary(aggs: AreaAggregate[]): WeeklySummary {
  const priority = aggs.filter((a) => isPriority(a.row.risk));
  const priorityCompleted = priority.filter((a) => a.status === "completed").length;
  const priorityAreas = priority.length;

  return {
    totalAreas: aggs.length,
    areasReporting: aggs.filter((a) => a.hasRecord).length,
    priorityAreas,
    priorityCompleted,
    priorityPending: priorityAreas - priorityCompleted,
    priorityCoveragePct: priorityAreas === 0 ? null : Math.round((priorityCompleted / priorityAreas) * 100),
    areasWithFieldActivity: aggs.filter((a) => a.fieldActivity === "yes").length,
    personnelDeployed: aggs.reduce((s, a) => s + a.personnel, 0),
    areasCovered: aggs.reduce((s, a) => s + a.areasCovered, 0),
    sourceReductionActivities: aggs.reduce((s, a) => s + a.sourceReduction, 0),
    highRiskNoCompleted: aggs.filter((a) => a.row.risk === "high" && a.status !== "completed").length,
    moderateRiskNoCompleted: aggs.filter((a) => a.row.risk === "moderate" && a.status !== "completed").length,
  };
}

// ── Sorting (shared by Priority Areas + Area-wise table + tests) ────
const RISK_RANK: Record<RiskLevel, number> = { high: 0, moderate: 1, low: 2, no_data: 3 };
// Within a risk group: pending / report_pending first, then no_activity, then completed.
const STATUS_RANK: Record<WorklistStatus, number> = { pending: 0, report_pending: 0, no_activity: 1, completed: 2 };

export function compareAreaAggregates(a: AreaAggregate, b: AreaAggregate): number {
  const r = RISK_RANK[a.row.risk] - RISK_RANK[b.row.risk];
  if (r !== 0) return r;
  const s = STATUS_RANK[a.status] - STATUS_RANK[b.status];
  if (s !== 0) return s;
  return a.row.name.localeCompare(b.row.name);
}

export function sortAreaAggregates(aggs: AreaAggregate[]): AreaAggregate[] {
  return [...aggs].sort(compareAreaAggregates);
}

// ── Action-category + median (over raw records) ─────────────────────
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

// ── District / State collation (§21) ────────────────────────────────
// Treats each record as one area. Callers pass a set already filtered to a
// single epidemiological week; collateDistrict / collateState pre-filter by
// geography so lower-level records roll up automatically — no manual re-entry.
export interface RecordCollation {
  totalAreas: number;
  reporting: number;
  reportingPct: number;
  priorityAreas: number;
  priorityCompleted: number;
  priorityPending: number;
  priorityCoveragePct: number | null;
  areasWithFieldActivity: number;
  personnelDeployed: number;
  areasCovered: number;
  sourceReductionActivities: number;
  actionsByCategory: Array<{ action: ActionType; count: number }>;
  highRiskNoCompleted: number;
  moderateRiskNoCompleted: number;
  medianForecastToActivityDays: number | null;
}

export function collateRecords(records: WeeklyResponseRecord[]): RecordCollation {
  const total = records.length;
  const priority = records.filter((r) => isPriority(r.risk_level_at_capture));
  const priorityCompleted = priority.filter((r) => r.reporting_status === "completed").length;
  const priorityAreas = priority.length;
  const reporting = records.length; // every stored record is a submitted response

  return {
    totalAreas: total,
    reporting,
    reportingPct: total === 0 ? 0 : Math.round((reporting / total) * 100),
    priorityAreas,
    priorityCompleted,
    priorityPending: priorityAreas - priorityCompleted,
    priorityCoveragePct: priorityAreas === 0 ? null : Math.round((priorityCompleted / priorityAreas) * 100),
    areasWithFieldActivity: records.filter((r) => r.field_activity_status === "yes").length,
    personnelDeployed: records.reduce((s, r) => s + (r.personnel_deployed || 0), 0),
    areasCovered: records.reduce((s, r) => s + (r.areas_covered || 0), 0),
    sourceReductionActivities: records.reduce((s, r) => s + (r.source_reduction_count || 0), 0),
    actionsByCategory: actionsByCategory(records),
    highRiskNoCompleted: records.filter((r) => r.risk_level_at_capture === "high" && r.reporting_status !== "completed").length,
    moderateRiskNoCompleted: records.filter((r) => r.risk_level_at_capture === "moderate" && r.reporting_status !== "completed").length,
    medianForecastToActivityDays: medianDaysForecastToActivity(records),
  };
}

export function collateDistrict(records: WeeklyResponseRecord[], state: string, district: string): RecordCollation {
  return collateRecords(records.filter((r) => r.state === state && r.district === district));
}

export function collateState(records: WeeklyResponseRecord[], state: string): RecordCollation {
  return collateRecords(records.filter((r) => r.state === state));
}
