import { describe, it, expect } from "vitest";
import {
  summarizeRow,
  buildSummary,
  recentWardActivity,
  collateDistrict,
  collateState,
  collateRecords,
  actionsByCategory,
  medianDaysForecastToActivity,
  sortAreaAggregates,
  type AreaRow,
} from "./aggregation";
import {
  makeGeographyId,
  makeRecordId,
  reportingStatusFor,
  type WeeklyResponseRecord,
  type FieldActivityStatus,
  type RiskLevel,
  type ActionType,
} from "./types";

// ── Test fixture builder ────────────────────────────────────────────
interface Opts {
  state?: string;
  district: string;
  block?: string | null;
  ward?: string | null;
  week?: string;
  risk: RiskLevel;
  activity: FieldActivityStatus;
  personnel?: number;
  areasCovered?: number;
  sourceReduction?: number;
  actions?: ActionType[];
  activities?: string[];
  activityDate?: string;
  forecastGeneratedAt?: string;
}

function rec(o: Opts): WeeklyResponseRecord {
  const state = o.state ?? "karnataka";
  const block = o.block ?? null;
  const ward = o.ward ?? null;
  const week = o.week ?? "W28";
  const geographyId = makeGeographyId(state, o.district, block, ward);
  return {
    id: makeRecordId(geographyId, week),
    epidemiological_week: week,
    forecast_ref: `FR-${week}`,
    forecast_generated_at: o.forecastGeneratedAt ?? "2026-07-05",
    risk_level_at_capture: o.risk,
    state,
    disease: "dengue",
    district: o.district,
    block_or_mun: block,
    ward_or_village: ward,
    geography_level: ward ? "ward" : block ? "block" : "district",
    geography_id: geographyId,
    geography_name: ward || block || o.district,
    field_activity_status: o.activity,
    reporting_status: reportingStatusFor(o.activity),
    activity_date: o.activity === "yes" ? (o.activityDate ?? "2026-07-12") : undefined,
    personnel_deployed: o.personnel,
    areas_covered: o.areasCovered,
    source_reduction_count: o.sourceReduction,
    actions_taken: o.actions,
    activities_performed: o.activities,
    logged_by_user_id: "u1",
    logged_by_name: "Officer",
    logged_by_role: "Health Supervisor",
    recorded_at: "2026-07-12T00:00:00.000Z",
    logged_at: "2026-07-12T00:00:00.000Z",
    updated_at: "2026-07-12T00:00:00.000Z",
  };
}

function leafRow(district: string, block: string | null, ward: string | null, risk: RiskLevel, state = "karnataka"): AreaRow {
  return {
    key: makeGeographyId(state, district, block, ward),
    name: ward || block || district,
    risk,
    level: ward ? "ward" : block ? "block" : "district",
    district,
    block,
    ward,
  };
}

describe("summarizeRow — one record per geography and week", () => {
  it("resolves a leaf row to its own record", () => {
    const r = rec({ district: "Mysuru", block: "Mysuru City", ward: "Ward 33", risk: "high", activity: "yes", personnel: 5, areasCovered: 3, sourceReduction: 4 });
    const row = leafRow("Mysuru", "Mysuru City", "Ward 33", "high");
    const agg = summarizeRow(row, [r]);
    expect(agg.status).toBe("completed");
    expect(agg.personnel).toBe(5);
    expect(agg.areasCovered).toBe(3);
    expect(agg.sourceReduction).toBe(4);
    expect(agg.hasRecord).toBe(true);
    expect(agg.primary?.id).toBe(r.id);
  });

  it("marks a priority area with no record as pending", () => {
    const row = leafRow("Mysuru", "Nanjangud", null, "high");
    const agg = summarizeRow(row, []);
    expect(agg.status).toBe("pending");
    expect(agg.hasRecord).toBe(false);
  });
});

describe("district aggregation rolls up leaf records", () => {
  const records = [
    rec({ district: "Bengaluru Urban", block: "BBMP East Zone", ward: "Ward 84", risk: "high", activity: "yes", personnel: 4, areasCovered: 2, sourceReduction: 3 }),
    rec({ district: "Bengaluru Urban", block: "BBMP East Zone", ward: "Ward 92", risk: "high", activity: "yes", personnel: 6, areasCovered: 3, sourceReduction: 5 }),
    rec({ district: "Bengaluru Urban", block: "Yelahanka", ward: null, risk: "moderate", activity: "no", personnel: 0 }),
  ];

  it("sums numeric fields from lower-level records for the district row", () => {
    const row = leafRow("Bengaluru Urban", null, null, "high");
    row.level = "district";
    const agg = summarizeRow(row, records);
    expect(agg.personnel).toBe(10);
    expect(agg.areasCovered).toBe(5);
    expect(agg.sourceReduction).toBe(8);
    expect(agg.records).toHaveLength(3);
  });

  it("STRICT rule: district not completed while a priority child is incomplete", () => {
    const row = leafRow("Bengaluru Urban", null, null, "high");
    row.level = "district";
    const agg = summarizeRow(row, records);
    // Yelahanka (moderate) is "no_activity" → district cannot be completed
    expect(agg.status).not.toBe("completed");
  });

  it("STRICT rule: district completed when all priority children completed", () => {
    const allDone = [
      rec({ district: "Udupi", block: "Kundapura", ward: null, risk: "high", activity: "yes" }),
      rec({ district: "Udupi", block: "Udupi City", ward: "Ward 3", risk: "moderate", activity: "yes" }),
      rec({ district: "Udupi", block: "Brahmavara", ward: null, risk: "low", activity: "no" }), // low doesn't block
    ];
    const row = leafRow("Udupi", null, null, "high");
    row.level = "district";
    expect(summarizeRow(row, allDone).status).toBe("completed");
  });
});

describe("priority response coverage + zero-priority handling", () => {
  it("computes coverage from completed / total priority areas", () => {
    const aggs = [
      summarizeRow(leafRow("D", "B1", null, "high"), [rec({ district: "D", block: "B1", risk: "high", activity: "yes" })]),
      summarizeRow(leafRow("D", "B2", null, "high"), [rec({ district: "D", block: "B2", risk: "high", activity: "no" })]),
      summarizeRow(leafRow("D", "B3", null, "moderate"), [rec({ district: "D", block: "B3", risk: "moderate", activity: "yes" })]),
      summarizeRow(leafRow("D", "B4", null, "low"), [rec({ district: "D", block: "B4", risk: "low", activity: "yes" })]),
    ];
    const s = buildSummary(aggs);
    expect(s.priorityAreas).toBe(3);
    expect(s.priorityCompleted).toBe(2);
    expect(s.priorityPending).toBe(1);
    expect(s.priorityCoveragePct).toBe(67); // round(2/3*100)
  });

  it("counts high-risk areas separately from priority areas (summary tile 1)", () => {
    // Priority is high + moderate; tile 1 is high only. A tab that conflated the
    // two would tell an officer four areas need urgent attention when two do.
    const aggs = [
      summarizeRow(leafRow("D", "B1", null, "high"), []),
      summarizeRow(leafRow("D", "B2", null, "high"), []),
      summarizeRow(leafRow("D", "B3", null, "moderate"), []),
      summarizeRow(leafRow("D", "B4", null, "moderate"), []),
      summarizeRow(leafRow("D", "B5", null, "low"), []),
      summarizeRow(leafRow("D", "B6", null, "no_data"), []),
    ];
    const s = buildSummary(aggs);
    expect(s.highRiskAreas).toBe(2);
    expect(s.priorityAreas).toBe(4);
    expect(s.totalAreas).toBe(6);
  });

  it("reports zero high-risk areas when none are forecast high", () => {
    const aggs = [
      summarizeRow(leafRow("D", "B1", null, "moderate"), []),
      summarizeRow(leafRow("D", "B2", null, "low"), []),
    ];
    expect(buildSummary(aggs).highRiskAreas).toBe(0);
  });

  it("returns null coverage when there are no priority areas", () => {
    const aggs = [
      summarizeRow(leafRow("D", "B1", null, "low"), [rec({ district: "D", block: "B1", risk: "low", activity: "yes" })]),
      summarizeRow(leafRow("D", "B2", null, "no_data"), []),
    ];
    const s = buildSummary(aggs);
    expect(s.priorityAreas).toBe(0);
    expect(s.priorityCoveragePct).toBeNull();
  });
});

describe("action-category totals", () => {
  it("counts activities across records (from ACTIVITY_TAXONOMY)", () => {
    const records = [
      rec({ district: "D", risk: "high", activity: "yes", activities: ["Source reduction", "Indoor space sprays"] }),
      rec({ district: "D", block: "B2", risk: "moderate", activity: "yes", activities: ["Source reduction", "Larva surveillance"] }),
    ];
    const cats = actionsByCategory(records);
    const map = Object.fromEntries(cats.map((c) => [c.action, c.count]));
    expect(map["Source reduction"]).toBe(2);
    expect(map["Indoor space sprays"]).toBe(1);
    expect(map["Larva surveillance"]).toBe(1);
    expect(map["Larvicide application"]).toBeUndefined();
  });
});

describe("median forecast-to-activity", () => {
  it("computes the median day gap", () => {
    const records = [
      rec({ district: "D", risk: "high", activity: "yes", forecastGeneratedAt: "2026-07-01", activityDate: "2026-07-04" }), // 3
      rec({ district: "D", block: "B2", risk: "high", activity: "yes", forecastGeneratedAt: "2026-07-01", activityDate: "2026-07-06" }), // 5
      rec({ district: "D", block: "B3", risk: "high", activity: "yes", forecastGeneratedAt: "2026-07-01", activityDate: "2026-07-11" }), // 10
    ];
    expect(medianDaysForecastToActivity(records)).toBe(5);
  });

  it("returns null when no activity dates exist", () => {
    expect(medianDaysForecastToActivity([rec({ district: "D", risk: "high", activity: "no" })])).toBeNull();
  });
});

describe("state aggregation via collation", () => {
  const records = [
    rec({ state: "karnataka", district: "Bengaluru Urban", block: "BBMP East Zone", ward: "Ward 84", risk: "high", activity: "yes", personnel: 4, areasCovered: 2, activities: ["Source reduction"] }),
    rec({ state: "karnataka", district: "Bengaluru Urban", block: "Yelahanka", ward: null, risk: "moderate", activity: "no" }),
    rec({ state: "karnataka", district: "Mysuru", block: "Mysuru City", ward: "Ward 33", risk: "high", activity: "yes", personnel: 6, areasCovered: 4, activities: ["Source reduction", "Indoor space sprays"] }),
    rec({ state: "karnataka", district: "Udupi", block: "Kundapura", ward: null, risk: "low", activity: "yes", personnel: 2, areasCovered: 1 }),
    rec({ state: "odisha", district: "Puri", block: "Brahmagiri", ward: null, risk: "high", activity: "yes", personnel: 9 }), // other state — must be excluded
  ];

  it("collateDistrict rolls up only that district's records", () => {
    const c = collateDistrict(records, "karnataka", "Bengaluru Urban");
    expect(c.totalAreas).toBe(2);
    expect(c.priorityAreas).toBe(2);
    expect(c.priorityCompleted).toBe(1);
    expect(c.priorityCoveragePct).toBe(50);
    expect(c.personnelDeployed).toBe(4);
    expect(c.moderateRiskNoCompleted).toBe(1);
  });

  it("collateState aggregates all districts in the state, excluding other states", () => {
    const c = collateState(records, "karnataka");
    expect(c.totalAreas).toBe(4); // excludes Odisha record
    expect(c.priorityAreas).toBe(3);
    expect(c.priorityCompleted).toBe(2);
    expect(c.personnelDeployed).toBe(12); // 4 + 6 + 2
    expect(c.areasCovered).toBe(7); // 2 + 4 + 1
    expect(c.sourceReductionActivities).toBe(2); // 2 records include "Source reduction"
    const src = c.actionsByCategory.find((a) => a.action === "Source reduction");
    expect(src?.count).toBe(2);
  });
});

describe("sorting by risk then status", () => {
  it("orders high→moderate→low→no_data, then pending/report_pending→no_activity→completed", () => {
    const aggs = [
      summarizeRow(leafRow("D", "Low-done", null, "low"), [rec({ district: "D", block: "Low-done", risk: "low", activity: "yes" })]),
      summarizeRow(leafRow("D", "High-done", null, "high"), [rec({ district: "D", block: "High-done", risk: "high", activity: "yes" })]),
      summarizeRow(leafRow("D", "High-pending", null, "high"), []),
      summarizeRow(leafRow("D", "Mod-noact", null, "moderate"), [rec({ district: "D", block: "Mod-noact", risk: "moderate", activity: "no" })]),
    ];
    const sorted = sortAreaAggregates(aggs).map((a) => a.row.name);
    expect(sorted).toEqual(["High-pending", "High-done", "Mod-noact", "Low-done"]);
  });
});

describe("collateRecords reporting completeness", () => {
  it("counts every stored record as a reporting area", () => {
    const c = collateRecords([
      rec({ district: "D", risk: "high", activity: "yes" }),
      rec({ district: "D", block: "B2", risk: "low", activity: "report_pending" }),
    ]);
    expect(c.totalAreas).toBe(2);
    expect(c.reporting).toBe(2);
    expect(c.reportingPct).toBe(100);
  });
});

describe("recentWardActivity (ward detail sheet, section 3)", () => {
  // Real EPI_WEEKS values — the list runs W36..W52 then W1..W19, so a window is
  // positional, not arithmetic on the week number.
  const at = (week: string, ward: string | null, district = "D") =>
    rec({ district, block: "B1", ward, week, risk: "high", activity: "yes" });

  it("returns only records inside the trailing window, newest week first", () => {
    const all = [at("W16", "W-1"), at("W19", "W-1"), at("W17", "W-1"), at("W13", "W-1")];
    const out = recentWardActivity(all, { district: "D", ward: "W-1" }, "W19", 4);
    expect(out.map((r) => r.epidemiological_week)).toEqual(["W19", "W17", "W16"]);
  });

  it("spans the year boundary, because the week list wraps W52 to W1", () => {
    const all = [at("W51", "W-1"), at("W52", "W-1"), at("W1", "W-1"), at("W2", "W-1")];
    const out = recentWardActivity(all, { district: "D", ward: "W-1" }, "W2", 4);
    expect(out.map((r) => r.epidemiological_week)).toEqual(["W2", "W1", "W52", "W51"]);
  });

  it("excludes other wards and other districts", () => {
    const all = [at("W19", "W-1"), at("W19", "W-2"), at("W19", "W-1", "Other")];
    const out = recentWardActivity(all, { district: "D", ward: "W-1" }, "W19", 4);
    expect(out).toHaveLength(1);
    expect(out[0].ward_or_village).toBe("W-1");
  });

  it("matches a ward named only in wards_affected", () => {
    const r = at("W19", null);
    r.wards_affected = ["W-1"];
    expect(recentWardActivity([r], { district: "D", ward: "W-1" }, "W19", 4)).toHaveLength(1);
  });

  it("returns nothing for an unknown epi week rather than guessing a window", () => {
    expect(recentWardActivity([at("W19", "W-1")], { district: "D", ward: "W-1" }, "W99", 4)).toEqual([]);
  });

  it("returns an empty list when the ward has logged nothing", () => {
    expect(recentWardActivity([], { district: "D", ward: "W-1" }, "W19", 4)).toEqual([]);
  });
});
