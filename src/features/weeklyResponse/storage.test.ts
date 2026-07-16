import { describe, it, expect, beforeEach } from "vitest";
import { weeklyResponseStorage } from "./storage";
import { makeGeographyId, makeRecordId, reportingStatusFor, type WeeklyResponseRecord } from "./types";

function build(week: string, district: string, block: string | null, activity: WeeklyResponseRecord["field_activity_status"], personnel: number): WeeklyResponseRecord {
  const geographyId = makeGeographyId("karnataka", district, block, null);
  return {
    id: makeRecordId(geographyId, week),
    epidemiological_week: week,
    forecast_ref: `FR-${week}`,
    forecast_generated_at: "2026-07-05",
    risk_level_at_capture: "high",
    state: "karnataka",
    district,
    block_or_municipality: block,
    ward_or_village: null,
    geography_level: block ? "block" : "district",
    geography_id: geographyId,
    geography_name: block || district,
    field_activity_status: activity,
    reporting_status: reportingStatusFor(activity),
    personnel_deployed: personnel,
    logged_by_user_id: "u1",
    logged_by_name: "Officer",
    logged_by_role: "Health Supervisor",
    recorded_at: "2026-07-12T00:00:00.000Z",
    updated_at: "2026-07-12T00:00:00.000Z",
  };
}

describe("weeklyResponseStorage", () => {
  beforeEach(() => localStorage.clear());

  it("stores and reads a record", () => {
    const r = build("W28", "Mysuru", "Nanjangud", "yes", 5);
    weeklyResponseStorage.upsert(r);
    expect(weeklyResponseStorage.getAll()).toHaveLength(1);
    expect(weeklyResponseStorage.getAll()[0].personnel_deployed).toBe(5);
  });

  it("updates the existing record in place — no duplicate for the same geography + week", () => {
    weeklyResponseStorage.upsert(build("W28", "Mysuru", "Nanjangud", "yes", 5));
    weeklyResponseStorage.upsert(build("W28", "Mysuru", "Nanjangud", "yes", 9)); // same id
    const all = weeklyResponseStorage.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].personnel_deployed).toBe(9);
    expect(all[0].reporting_status).toBe("completed");
  });

  it("keeps separate records across different weeks for the same geography", () => {
    weeklyResponseStorage.upsert(build("W27", "Mysuru", "Nanjangud", "yes", 5));
    weeklyResponseStorage.upsert(build("W28", "Mysuru", "Nanjangud", "no", 0));
    expect(weeklyResponseStorage.getAll()).toHaveLength(2);
  });

  it("seedIfEmpty only seeds when the store is empty", () => {
    weeklyResponseStorage.upsert(build("W28", "Mysuru", "Nanjangud", "yes", 5));
    weeklyResponseStorage.seedIfEmpty([build("W28", "Udupi", "Kundapura", "no", 0)]);
    expect(weeklyResponseStorage.getAll()).toHaveLength(1); // not reseeded
  });

  it("removes a record by id", () => {
    const r = build("W28", "Mysuru", "Nanjangud", "yes", 5);
    weeklyResponseStorage.upsert(r);
    weeklyResponseStorage.remove(r.id);
    expect(weeklyResponseStorage.getAll()).toHaveLength(0);
  });
});
