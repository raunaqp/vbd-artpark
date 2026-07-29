import { describe, it, expect } from "vitest";
import type { BreedingSite, FoggingEvent, LarvalIndicesRecord } from "@/data/r3/loader";
import { daysSince, lastFoggingEvents, sortLarvalDesc, sortOpenSites, FOGGING_EVENT_LIMIT } from "./wardHistory";

const ev = (date: string, sub = "A"): FoggingEvent => ({
  ward_key: "k", event_id: `${date}-${sub}`, date, sub_area_name: sub,
  gps_lat: 0, gps_lng: 0, personnel_designation: "Vector Team", team_name: "T1",
  supervising_mo: "MO", personnel_count: 4, fogging_type: "cold_fogging",
  coverage_estimate_households: 100, source: "KB_app",
});

const site = (area: string, lastInspection: string, magnitude: "major" | "minor" = "major"): BreedingSite => ({
  ward_key: "k", site_id: area, gps_lat: 0, gps_lng: 0, area_name: area, magnitude,
  status: "open", first_reported_date: "2026-01-01", last_inspection_date: lastInspection,
  resolved_date: null, resolved_by: null,
});

const larval = (week: string): LarvalIndicesRecord => ({
  ward_key: "k", week, week_start_date: "2026-01-01", coverage_tier: "high",
  houses_inspected: 10, houses_positive: 1, containers_inspected: 20, containers_positive: 2,
  bi: 5, hi: 10, ci: 10, any_outbreak_threshold_breached: false,
});

describe("lastFoggingEvents", () => {
  it("returns most recent first", () => {
    const out = lastFoggingEvents([ev("2026-03-01"), ev("2026-07-15"), ev("2026-05-02")]);
    expect(out.map((e) => e.date)).toEqual(["2026-07-15", "2026-05-02", "2026-03-01"]);
  });

  it("caps at five rounds", () => {
    const many = Array.from({ length: 12 }, (_, i) => ev(`2026-06-${String(i + 1).padStart(2, "0")}`));
    const out = lastFoggingEvents(many);
    expect(out).toHaveLength(FOGGING_EVENT_LIMIT);
    expect(out[0].date).toBe("2026-06-12");
  });

  it("does not mutate the input", () => {
    const input = [ev("2026-01-01"), ev("2026-09-09")];
    lastFoggingEvents(input);
    expect(input[0].date).toBe("2026-01-01");
  });

  it("handles a ward with no fogging on record", () => {
    expect(lastFoggingEvents([])).toEqual([]);
  });
});

describe("sortOpenSites", () => {
  it("puts the longest-uninspected site first", () => {
    const out = sortOpenSites([site("Recent", "2026-07-20"), site("Stale", "2026-02-11"), site("Mid", "2026-05-05")]);
    expect(out.map((s) => s.area_name)).toEqual(["Stale", "Mid", "Recent"]);
  });
});

describe("sortLarvalDesc", () => {
  it("returns newest week first", () => {
    const out = sortLarvalDesc([larval("2026-W12"), larval("2026-W19"), larval("2026-W15")]);
    expect(out.map((l) => l.week)).toEqual(["2026-W19", "2026-W15", "2026-W12"]);
  });
});

describe("daysSince", () => {
  // Injected clock: the R3 data is generated against a fixed date, so a test
  // asserting a day count would otherwise start failing tomorrow.
  const now = new Date("2026-07-29T00:00:00Z");

  it("counts whole days back", () => {
    expect(daysSince("2026-07-29", now)).toBe(0);
    expect(daysSince("2026-07-28", now)).toBe(1);
    expect(daysSince("2026-06-25", now)).toBe(34);
  });

  it("never returns a negative for a future inspection date", () => {
    expect(daysSince("2026-08-10", now)).toBe(0);
  });

  it("returns null for an unparseable date rather than NaN days", () => {
    expect(daysSince("not-a-date", now)).toBeNull();
  });
});
