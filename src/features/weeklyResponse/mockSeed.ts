// Deterministic mock seeds so district totals match underlying leaf records.
import type { WeeklyResponseRecord } from "./types";
import { makeGeographyId, makeRecordId } from "./types";
import { EPI_WEEKS, WEEK_ENDINGS } from "@/data/mock_dataset";

interface SeedLeaf {
  stateId: string;
  district: string;
  block: string | null;
  ward: string | null;
  risk: "high" | "moderate" | "low";
}

// Curated leaves spanning all 3 states — mix of high/moderate/low.
const LEAVES: SeedLeaf[] = [
  // Andhra Pradesh — Visakhapatnam blocks + Vizag MC wards
  { stateId: "andhra_pradesh", district: "Visakhapatnam", block: "Bheemunipatnam", ward: null, risk: "high" },
  { stateId: "andhra_pradesh", district: "Visakhapatnam", block: "Anakapalle", ward: null, risk: "moderate" },
  { stateId: "andhra_pradesh", district: "Visakhapatnam", block: "Vizag MC", ward: "Ward 12", risk: "high" },
  { stateId: "andhra_pradesh", district: "Visakhapatnam", block: "Vizag MC", ward: "Ward 34", risk: "moderate" },
  { stateId: "andhra_pradesh", district: "Visakhapatnam", block: "Vizag MC", ward: "Ward 51", risk: "low" },
  { stateId: "andhra_pradesh", district: "Guntur", block: "Tenali", ward: null, risk: "moderate" },
  { stateId: "andhra_pradesh", district: "Guntur", block: "Bapatla", ward: null, risk: "low" },
  { stateId: "andhra_pradesh", district: "Krishna", block: "Vijayawada MC", ward: "Ward 22", risk: "high" },
  // Odisha
  { stateId: "odisha", district: "Khordha", block: "Bhubaneswar MC", ward: "Ward 07", risk: "high" },
  { stateId: "odisha", district: "Khordha", block: "Bhubaneswar MC", ward: "Ward 45", risk: "moderate" },
  { stateId: "odisha", district: "Puri", block: "Brahmagiri", ward: null, risk: "moderate" },
  { stateId: "odisha", district: "Puri", block: "Sakshigopal", ward: null, risk: "low" },
  { stateId: "odisha", district: "Cuttack", block: "Cuttack MC", ward: "Ward 18", risk: "high" },
  { stateId: "odisha", district: "Angul", block: "Talcher", ward: null, risk: "moderate" },
  { stateId: "odisha", district: "Balasore", block: "Nilgiri", ward: null, risk: "low" },
  // Karnataka
  { stateId: "karnataka", district: "Bengaluru Urban", block: "BBMP East Zone", ward: "Ward 84", risk: "high" },
  { stateId: "karnataka", district: "Bengaluru Urban", block: "BBMP East Zone", ward: "Ward 92", risk: "high" },
  { stateId: "karnataka", district: "Bengaluru Urban", block: "BBMP East Zone", ward: "Ward 110", risk: "moderate" },
  { stateId: "karnataka", district: "Bengaluru Urban", block: "Yelahanka", ward: null, risk: "moderate" },
  { stateId: "karnataka", district: "Mysuru", block: "Nanjangud", ward: null, risk: "low" },
  { stateId: "karnataka", district: "Mysuru", block: "Mysuru City", ward: "Ward 33", risk: "high" },
  { stateId: "karnataka", district: "Udupi", block: "Kundapura", ward: null, risk: "low" },
];

// Deterministic pseudo-random from a string seed
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

const CITY_LOCALITIES = ["Main Road", "Bus Stand area", "Construction sites", "Slum cluster", "Market area", "School zone"];

export function buildSeedRecords(): WeeklyResponseRecord[] {
  const records: WeeklyResponseRecord[] = [];
  const totalWeeks = EPI_WEEKS.length;
  const weeksToSeed = 4; // current + 3 prior
  const startIdx = Math.max(0, totalWeeks - weeksToSeed);

  for (let i = startIdx; i < totalWeeks; i++) {
    const epiWeek = EPI_WEEKS[i];
    const weekEnding = WEEK_ENDINGS[i];
    const isCurrentWeek = i === totalWeeks - 1;

    for (const leaf of LEAVES) {
      const geographyId = makeGeographyId(leaf.stateId, leaf.district, leaf.block, leaf.ward);
      const seed = h(geographyId + epiWeek);
      const officer = OFFICERS[seed % OFFICERS.length];

      // Distribution of activity status by risk
      let status: "yes" | "no" | "pending";
      if (leaf.risk === "high") status = seed % 10 < 8 ? "yes" : seed % 10 < 9 ? "pending" : "no";
      else if (leaf.risk === "moderate") status = seed % 10 < 6 ? "yes" : seed % 10 < 8 ? "no" : "pending";
      else status = seed % 10 < 3 ? "yes" : seed % 10 < 8 ? "no" : "pending";

      // For current week, leave some high-risk unreported (spec asks for that)
      if (isCurrentWeek && leaf.risk === "high" && seed % 7 === 0) continue;

      const level: WeeklyResponseRecord["geography_level"] = leaf.ward
        ? "ward"
        : (leaf.block?.includes("MC") || leaf.block?.includes("Zone") || leaf.block?.includes("City")
            ? "municipality"
            : "block");

      const geography_name = leaf.ward || leaf.block || leaf.district;
      const activityDate = weekEnding;
      const forecastGenAt = WEEK_ENDINGS[Math.max(0, i - 1)] || weekEnding;

      let actions: WeeklyResponseRecord["actions_taken"] = undefined;
      let counts: Partial<WeeklyResponseRecord> = {};
      if (status === "yes") {
        const pool: WeeklyResponseRecord["actions_taken"] = ["Source reduction", "Larval surveillance"];
        if (leaf.risk === "high") pool.push("Fogging / space spraying", "Fever or case surveillance");
        if (leaf.ward) pool.push("Construction-site inspection", "Community awareness / IEC");
        else pool.push("Environmental or drainage inspection");
        actions = pool;
        counts = {
          source_reduction_count: 4 + (seed % 8),
          larval_surveys_count: 1 + (seed % 4),
          fogging_operations_count: pool.includes("Fogging / space spraying") ? 1 + (seed % 3) : undefined,
          construction_sites_inspected_count: pool.includes("Construction-site inspection") ? 1 + (seed % 5) : undefined,
          iec_activities_count: pool.includes("Community awareness / IEC") ? 1 + (seed % 3) : undefined,
        };
      }

      const rec: WeeklyResponseRecord = {
        id: makeRecordId(geographyId, epiWeek),
        epidemiological_week: epiWeek,
        forecast_ref: `FR-${epiWeek}`,
        forecast_generated_at: forecastGenAt,
        risk_level_at_capture: leaf.risk,
        state: leaf.stateId,
        district: leaf.district,
        block_or_municipality: leaf.block,
        ward_or_village: leaf.ward,
        geography_level: level,
        geography_id: geographyId,
        geography_name,
        field_activity_status: status,
        activity_date: status === "yes" ? activityDate : undefined,
        personnel_deployed: status === "yes" ? 2 + (seed % 6) : undefined,
        localities_visited: status === "yes" ? [pick(CITY_LOCALITIES, seed), pick(CITY_LOCALITIES, seed >> 3)].join(", ") : undefined,
        actions_taken: actions,
        ...counts,
        no_activity_reason: status === "no" ? (["No action required this week", "Covered in previous cycle", "Team or resource constraint"] as const)[seed % 3] : undefined,
        notes: undefined,
        logged_by_user_id: officer.id,
        logged_by_name: officer.name,
        logged_by_role: officer.role,
        recorded_at: activityDate,
        updated_at: activityDate,
        reporting_status: status === "pending" ? "draft" : "reported",
      };
      records.push(rec);
    }
  }
  return records;
}
