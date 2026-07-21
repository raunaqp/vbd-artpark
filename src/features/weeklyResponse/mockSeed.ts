// Deterministic mock seeds so district / state totals match underlying leaf
// records exactly. Covers the full scenario matrix (§23) for the current
// epidemiological week, with lighter deterministic variety across history.
import type { WeeklyResponseRecord, FieldActivityStatus, ActionType, RiskLevel } from "./types";
import { makeGeographyId, makeRecordId, reportingStatusFor } from "./types";
import { EPI_WEEKS, WEEK_ENDINGS } from "@/data/mock_dataset";

// Scenario forced onto the CURRENT week so the demo shows every state:
//   completed   → field activity Yes, logged
//   no_activity → field activity No
//   report_pending → officer marked report pending
//   pending     → NO record this week (priority area still needs action)
//   routine     → low-risk area with routine field activity (Yes)
//   no_action   → low-risk area, No / "No action required this week"
type Scenario = "completed" | "no_activity" | "report_pending" | "pending" | "routine" | "no_action";

interface SeedLeaf {
  stateId: string;
  district: string;
  block: string | null;
  ward: string | null;
  risk: Exclude<RiskLevel, "no_data">;
  scenario: Scenario; // current-week scenario
}

const LEAVES: SeedLeaf[] = [
  // ── Andhra Pradesh — Visakhapatnam blocks + Vizag MC wards ──
  { stateId: "andhra_pradesh", district: "Visakhapatnam", block: "Bheemunipatnam", ward: null, risk: "high", scenario: "completed" },
  { stateId: "andhra_pradesh", district: "Visakhapatnam", block: "Anakapalle", ward: null, risk: "moderate", scenario: "no_activity" },
  { stateId: "andhra_pradesh", district: "Visakhapatnam", block: "Vizag MC", ward: "Ward 12", risk: "high", scenario: "completed" },
  { stateId: "andhra_pradesh", district: "Visakhapatnam", block: "Vizag MC", ward: "Ward 34", risk: "moderate", scenario: "report_pending" },
  { stateId: "andhra_pradesh", district: "Visakhapatnam", block: "Vizag MC", ward: "Ward 51", risk: "low", scenario: "routine" },
  { stateId: "andhra_pradesh", district: "Guntur", block: "Tenali", ward: null, risk: "moderate", scenario: "completed" },
  { stateId: "andhra_pradesh", district: "Guntur", block: "Bapatla", ward: null, risk: "low", scenario: "no_action" },
  { stateId: "andhra_pradesh", district: "Krishna", block: "Vijayawada MC", ward: "Ward 22", risk: "high", scenario: "pending" },
  // ── Odisha ──
  { stateId: "odisha", district: "Khordha", block: "Bhubaneswar MC", ward: "Ward 07", risk: "high", scenario: "completed" },
  { stateId: "odisha", district: "Khordha", block: "Bhubaneswar MC", ward: "Ward 45", risk: "moderate", scenario: "pending" },
  { stateId: "odisha", district: "Puri", block: "Brahmagiri", ward: null, risk: "moderate", scenario: "completed" },
  { stateId: "odisha", district: "Puri", block: "Sakshigopal", ward: null, risk: "low", scenario: "no_action" },
  { stateId: "odisha", district: "Cuttack", block: "Cuttack MC", ward: "Ward 18", risk: "high", scenario: "report_pending" },
  { stateId: "odisha", district: "Angul", block: "Talcher", ward: null, risk: "moderate", scenario: "no_activity" },
  { stateId: "odisha", district: "Baleshwar", block: "Nilgiri", ward: null, risk: "low", scenario: "routine" },
  // ── Karnataka ──
  { stateId: "karnataka", district: "Bengaluru Urban", block: "BBMP East Zone", ward: "Ward 84", risk: "high", scenario: "completed" },
  { stateId: "karnataka", district: "Bengaluru Urban", block: "BBMP East Zone", ward: "Ward 92", risk: "high", scenario: "pending" },
  { stateId: "karnataka", district: "Bengaluru Urban", block: "BBMP East Zone", ward: "Ward 110", risk: "moderate", scenario: "completed" },
  { stateId: "karnataka", district: "Bengaluru Urban", block: "Yelahanka", ward: null, risk: "moderate", scenario: "no_activity" },
  { stateId: "karnataka", district: "Mysuru", block: "Nanjangud", ward: null, risk: "low", scenario: "routine" },
  { stateId: "karnataka", district: "Mysuru", block: "Mysuru City", ward: "Ward 33", risk: "high", scenario: "completed" },
  { stateId: "karnataka", district: "Udupi", block: "Kundapura", ward: null, risk: "low", scenario: "no_action" },
];

// Deterministic pseudo-random from a string seed (no Math.random — stable).
function h(str: string): number {
  let x = 2166136261;
  for (let i = 0; i < str.length; i++) { x ^= str.charCodeAt(i); x = Math.imul(x, 16777619); }
  return (x >>> 0);
}

function pick<T>(arr: T[], seed: number): T { return arr[seed % arr.length]; }

const OFFICERS = [
  { id: "u_hs01", name: "Health Supervisor A", role: "Health Supervisor" },
  { id: "u_hs02", name: "Health Supervisor B", role: "Health Supervisor" },
  { id: "u_mpw01", name: "MPW field officer", role: "MPW" },
  { id: "u_mo01", name: "Medical Officer", role: "Medical Officer" },
];

const NO_REASONS = ["Staff unavailable", "Access issue", "Data delay", "Public holiday"] as const;

/** Add/subtract whole days from an ISO yyyy-mm-dd date, returning ISO. */
function shiftIso(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function activityStatusFor(scenario: Scenario): FieldActivityStatus | null {
  switch (scenario) {
    case "pending": return null; // no record at all
    case "completed":
    case "routine": return "yes";
    case "no_activity":
    case "no_action": return "no";
    // "report_pending" is retired — treat legacy scenarios as completed.
    case "report_pending": return "yes";
  }
}

// Deterministic historic status (weeks before current) so trends look real.
// (report_pending retired — only yes / no.)
function historicStatus(risk: SeedLeaf["risk"], seed: number): FieldActivityStatus {
  if (risk === "high") return seed % 10 < 8 ? "yes" : "no";
  if (risk === "moderate") return seed % 10 < 6 ? "yes" : "no";
  return seed % 10 < 3 ? "yes" : "no";
}

const DESIGNATIONS = ["ASHA + PHC Nurse", "MO + 2 ASHAs", "Ward Vector Team", "MPW + ASHA"];

// Activities logged for a "yes" record, drawn from ACTIVITY_TAXONOMY names.
function buildActivities(leaf: SeedLeaf, seed: number): string[] {
  const pool: string[] = ["Source reduction", "Larva surveillance"];
  if (leaf.risk === "high") pool.push("Indoor space sprays", "Fever surveillance");
  if (leaf.ward) pool.push("Construction site inspection", "IEC for BCC");
  else pool.push("Environmental modification");
  const picked = pool.filter((_, i) => (seed >> i) % 5 !== 0);
  return picked.length ? picked : ["Source reduction"];
}

function buildActions(leaf: SeedLeaf, seed: number): { actions: ActionType[]; counts: Partial<WeeklyResponseRecord> } {
  const pool: ActionType[] = ["Source reduction", "Larval surveillance"];
  if (leaf.risk === "high") pool.push("Fogging / space spraying", "Fever or case surveillance");
  if (leaf.ward) pool.push("Construction-site inspection", "Community awareness / IEC");
  else pool.push("Environmental or drainage inspection");
  // Trim some variety so combinations differ
  const actions = pool.filter((_, i) => (seed >> i) % 5 !== 0);
  const counts: Partial<WeeklyResponseRecord> = {
    source_reduction_count: 4 + (seed % 8),
    larval_surveys_count: actions.includes("Larval surveillance") ? 1 + (seed % 4) : undefined,
    fogging_operations_count: actions.includes("Fogging / space spraying") ? 1 + (seed % 3) : undefined,
    construction_sites_inspected_count: actions.includes("Construction-site inspection") ? 1 + (seed % 5) : undefined,
    iec_activities_count: actions.includes("Community awareness / IEC") ? 1 + (seed % 3) : undefined,
  };
  return { actions, counts };
}

/** Seed records for the current epi-week + 3 prior. Pass `state`/`disease` to scope. */
export function buildSeedRecords(state?: string, disease = "dengue"): WeeklyResponseRecord[] {
  const records: WeeklyResponseRecord[] = [];
  const leaves = state ? LEAVES.filter((l) => l.stateId === state) : LEAVES;
  const totalWeeks = EPI_WEEKS.length;
  const weeksToSeed = 4; // current + 3 prior
  const startIdx = Math.max(0, totalWeeks - weeksToSeed);

  for (let i = startIdx; i < totalWeeks; i++) {
    const epiWeek = EPI_WEEKS[i];
    const weekEnding = WEEK_ENDINGS[i];
    const isCurrentWeek = i === totalWeeks - 1;
    const forecastGenAt = WEEK_ENDINGS[Math.max(0, i - 1)] || weekEnding;

    for (const leaf of leaves) {
      const geographyId = makeGeographyId(leaf.stateId, leaf.district, leaf.block, leaf.ward);
      const seed = h(geographyId + epiWeek);
      const officer = OFFICERS[seed % OFFICERS.length];

      const status: FieldActivityStatus | null = isCurrentWeek
        ? activityStatusFor(leaf.scenario)
        : historicStatus(leaf.risk, seed);

      if (status === null) continue; // "pending" scenario → deliberately no record

      const level: WeeklyResponseRecord["geography_level"] = leaf.ward
        ? "ward"
        : (leaf.block?.includes("MC") || leaf.block?.includes("Zone") || leaf.block?.includes("City")
            ? "municipality"
            : "block");

      const geography_name = leaf.ward || leaf.block || leaf.district;
      // Vary activity date within the reporting week (different dates per §23)
      const activityDate = shiftIso(weekEnding, -(seed % 6));

      let actions: WeeklyResponseRecord["actions_taken"];
      let counts: Partial<WeeklyResponseRecord> = {};
      let activities: string[] | undefined;
      let households: number | undefined;
      let designation: string | undefined;
      if (status === "yes") {
        const built = buildActions(leaf, seed);
        actions = built.actions;
        counts = built.counts;
        activities = buildActivities(leaf, seed);
        households = 15 + (seed % 60);
        designation = DESIGNATIONS[seed % DESIGNATIONS.length];
      }

      const rec: WeeklyResponseRecord = {
        id: makeRecordId(geographyId, epiWeek),
        epidemiological_week: epiWeek,
        forecast_ref: `FR-${epiWeek}`,
        forecast_generated_at: forecastGenAt,
        risk_level_at_capture: leaf.risk,
        state: leaf.stateId,
        disease,
        district: leaf.district,
        block_or_mun: leaf.block,
        ward_or_village: leaf.ward,
        geography_level: level,
        geography_id: geographyId,
        geography_name,
        field_activity_status: status,
        reporting_status: reportingStatusFor(status),
        activity_date: status === "yes" ? activityDate : undefined,
        personnel_deployed: status === "yes" ? 2 + (seed % 6) : undefined,
        areas_covered: status === "yes" ? 1 + (seed % 5) : undefined,
        localities_visited: undefined,
        actions_taken: actions,
        activities_performed: activities,
        personnel_designation: designation,
        households_covered: households,
        ...counts,
        no_activity_reason: status === "no" ? NO_REASONS[seed % NO_REASONS.length] : undefined,
        notes: undefined,
        logged_by_user_id: officer.id,
        logged_by_name: officer.name,
        logged_by_role: officer.role,
        recorded_at: `${activityDate}T09:00:00.000Z`,
        logged_at: `${activityDate}T09:00:00.000Z`,
        updated_at: `${activityDate}T09:00:00.000Z`,
      };
      records.push(rec);
    }
  }
  return records;
}
