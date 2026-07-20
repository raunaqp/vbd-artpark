// Field activity answer to "Was any field activity conducted this week?"
export type FieldActivityStatus = "yes" | "no" | "report_pending";

// Derived reporting status persisted with each record.
//   completed      → field activity = yes (with data)
//   no_activity    → field activity = no (with a reason)
//   report_pending → officer marked the week as report pending
//   draft          → reserved for future partial saves (not produced by the drawer today)
export type ReportingStatus = "completed" | "no_activity" | "report_pending" | "draft";

// Forecast risk captured at the moment the response was logged.
// "no_data" = the area had no forecast (kept out of the priority worklist).
export type RiskLevel = "high" | "moderate" | "low" | "no_data";

export const ACTION_TYPES = [
  "Source reduction",
  "Larval surveillance",
  "Fogging / space spraying",
  "Larvicide application",
  "Fever or case surveillance",
  "Construction-site inspection",
  "Environmental or drainage inspection",
  "Community awareness / IEC",
  "Coordination or escalation",
  "Other",
] as const;
export type ActionType = typeof ACTION_TYPES[number];

export const NO_ACTIVITY_REASONS = [
  "No action required this week",
  "Covered in previous cycle",
  "Team or resource constraint",
  "Activity planned but not yet completed",
  "Other",
] as const;
export type NoActivityReason = typeof NO_ACTIVITY_REASONS[number];

export type GeographyLevel = "district" | "block" | "municipality" | "ward" | "village";

export interface WeeklyResponseRecord {
  id: string;
  epidemiological_week: string;

  forecast_ref: string;
  forecast_generated_at: string;
  risk_level_at_capture: RiskLevel;

  state: string;
  district: string;
  block_or_municipality: string | null;
  ward_or_village: string | null;
  geography_level: GeographyLevel;
  geography_id: string;
  geography_name: string;

  field_activity_status: FieldActivityStatus;
  reporting_status: ReportingStatus;

  activity_date?: string;
  personnel_deployed?: number;
  /** Role/designation of personnel, e.g. "ASHA + PHC Nurse" (P2 Weekly Operational Response). */
  personnel_designation?: string;
  areas_covered?: number;
  /** Households covered by the field activity (P2 — replaces the old free-text "areas covered"). */
  households_covered?: number;
  /** Optional free-text locality notes — never a primary metric or table column. */
  localities_visited?: string;

  actions_taken?: ActionType[];
  /** Activities from ACTIVITY_TAXONOMY (P2 Weekly Operational Response Log Response modal). */
  activities_performed?: string[];
  /** Wards/villages where the activities were performed (P2 — mandatory in the modal). */
  wards_affected?: string[];

  source_reduction_count?: number;
  larval_surveys_count?: number;
  fogging_operations_count?: number;
  construction_sites_inspected_count?: number;
  iec_activities_count?: number;

  no_activity_reason?: NoActivityReason;
  no_activity_reason_other?: string;
  notes?: string;

  logged_by_user_id: string;
  logged_by_name: string;
  logged_by_role: string;

  recorded_at: string;
  updated_at: string;
}

/** Map a field-activity answer to the persisted reporting status. */
export function reportingStatusFor(status: FieldActivityStatus): ReportingStatus {
  return status === "yes" ? "completed" : status === "no" ? "no_activity" : "report_pending";
}

export function makeGeographyId(
  stateId: string,
  district: string | null,
  block: string | null,
  ward: string | null,
): string {
  return [stateId, district || "-", block || "-", ward || "-"].join("|");
}

export function makeRecordId(geographyId: string, epiWeek: string): string {
  return `${geographyId}::${epiWeek}`;
}
