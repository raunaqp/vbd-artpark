export type FieldActivityStatus = "yes" | "no" | "pending";
export type ReportingStatus = "reported" | "not_reported" | "draft";
export type RiskLevel = "high" | "moderate" | "low" | "unknown";

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
  activity_date?: string;
  personnel_deployed?: number;
  localities_visited?: string;
  actions_taken?: ActionType[];
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
  reporting_status: ReportingStatus;
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
