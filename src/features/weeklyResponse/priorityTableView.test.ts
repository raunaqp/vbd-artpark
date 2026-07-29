import { describe, it, expect } from "vitest";
import { getPriorityScore, type PriorityRow } from "./priorityRows";
import {
  activeFilterCount,
  applyTableView,
  matchesSearch,
  nextSort,
  passesBreeding,
  riskOptions,
  sortRows,
  toggleValue,
  uniqueActions,
  DEFAULT_SORT,
  EMPTY_FILTERS,
  type TableFilters,
} from "./priorityTableView";

const row = (ward: string, over: Partial<PriorityRow> = {}): PriorityRow => {
  const base: Omit<PriorityRow, "score"> = {
    wardKey: `Karnataka|${over.district ?? "Mysuru"}|${over.block ?? "Nanjangud"}|${ward}`,
    district: "Mysuru",
    block: "Nanjangud",
    ward,
    risk: "low",
    riskLabel: "Low",
    trend: "falling",
    windowCases: 0,
    priorCases: 0,
    foggingStatus: "recent",
    daysSinceLastFogging: 2,
    majorOpen: 0,
    minorOpen: 0,
    coverage: "high",
    recommendation: null,
    ...over,
  };
  return { ...base, score: getPriorityScore(base) };
};

const filters = (over: Partial<TableFilters> = {}): TableFilters => ({ ...EMPTY_FILTERS, ...over });

describe("sortRows", () => {
  const rows = [
    row("Beta", { risk: "moderate", trend: "steady", foggingStatus: "due", majorOpen: 1, coverage: "medium" }),
    row("Alpha", { risk: "very_high", trend: "rising", foggingStatus: "overdue", majorOpen: 5, coverage: "low" }),
    row("Gamma", { risk: "low", trend: "falling", foggingStatus: "recent", majorOpen: 0, coverage: "high" }),
  ];

  it("defaults to composite priority, worst first", () => {
    expect(sortRows(rows, DEFAULT_SORT).map((r) => r.ward)).toEqual(["Alpha", "Beta", "Gamma"]);
  });

  it("puts the most urgent first on every column's descending pass", () => {
    for (const key of ["risk", "trend", "fogging", "breeding", "coverage"] as const) {
      expect(sortRows(rows, { key, dir: "desc" })[0].ward).toBe("Alpha");
    }
  });

  it("reverses on ascending", () => {
    expect(sortRows(rows, { key: "risk", dir: "asc" }).map((r) => r.ward)).toEqual(["Gamma", "Beta", "Alpha"]);
  });

  it("sorts ward names alphabetically, not by urgency", () => {
    expect(sortRows(rows, { key: "ward", dir: "asc" }).map((r) => r.ward)).toEqual(["Alpha", "Beta", "Gamma"]);
  });

  it("ranks fogging overdue above never-recorded above due above recent", () => {
    const fog = [
      row("Recent", { foggingStatus: "recent" }),
      row("Overdue", { foggingStatus: "overdue" }),
      row("Missing", { foggingStatus: null }),
      row("Due", { foggingStatus: "due" }),
    ];
    expect(sortRows(fog, { key: "fogging", dir: "desc" }).map((r) => r.ward)).toEqual(["Overdue", "Missing", "Due", "Recent"]);
  });

  it("orders breeding by major sites first, minor only as a tiebreak", () => {
    const breed = [
      row("A", { majorOpen: 1, minorOpen: 99 }),
      row("B", { majorOpen: 2, minorOpen: 0 }),
      row("C", { majorOpen: 1, minorOpen: 100 }),
    ];
    expect(sortRows(breed, { key: "breeding", dir: "desc" }).map((r) => r.ward)).toEqual(["B", "C", "A"]);
  });

  it("breaks ties on ward name so repeated sorts are stable", () => {
    const tied = [row("Zeta"), row("Alpha"), row("Mid")];
    const once = sortRows(tied, DEFAULT_SORT).map((r) => r.ward);
    expect(once).toEqual(["Alpha", "Mid", "Zeta"]);
    expect(sortRows(sortRows(tied, DEFAULT_SORT), DEFAULT_SORT).map((r) => r.ward)).toEqual(once);
  });

  it("does not mutate the input array", () => {
    const input = [row("B"), row("A")];
    const before = input.map((r) => r.ward);
    sortRows(input, { key: "ward", dir: "asc" });
    expect(input.map((r) => r.ward)).toEqual(before);
  });
});

describe("nextSort", () => {
  it("starts a newly clicked column descending — most urgent first", () => {
    expect(nextSort(DEFAULT_SORT, "fogging")).toEqual({ key: "fogging", dir: "desc" });
  });

  it("flips direction when the active column is clicked again", () => {
    expect(nextSort({ key: "fogging", dir: "desc" }, "fogging")).toEqual({ key: "fogging", dir: "asc" });
    expect(nextSort({ key: "fogging", dir: "asc" }, "fogging")).toEqual({ key: "fogging", dir: "desc" });
  });
});

describe("passesBreeding", () => {
  it("bands on open major sites", () => {
    expect([0, 1, 2, 3, 7].map((n) => passesBreeding(n, "any"))).toEqual([true, true, true, true, true]);
    expect([0, 1, 2, 3, 7].map((n) => passesBreeding(n, "any_major"))).toEqual([false, true, true, true, true]);
    expect([0, 1, 2, 3, 7].map((n) => passesBreeding(n, "none"))).toEqual([true, false, false, false, false]);
    expect([0, 1, 2, 3, 7].map((n) => passesBreeding(n, "1-2"))).toEqual([false, true, true, false, false]);
    expect([0, 1, 2, 3, 7].map((n) => passesBreeding(n, "3+"))).toEqual([false, false, false, true, true]);
  });
});

describe("matchesSearch", () => {
  const r = row("New Adugodi", { district: "BBMP South", block: "South Zone 4" });

  it("matches ward, parent zone and block, case-insensitively", () => {
    expect(matchesSearch(r, "adugodi")).toBe(true);
    expect(matchesSearch(r, "BBMP")).toBe(true);
    expect(matchesSearch(r, "zone 4")).toBe(true);
  });

  it("treats an empty or whitespace query as no constraint", () => {
    expect(matchesSearch(r, "")).toBe(true);
    expect(matchesSearch(r, "   ")).toBe(true);
  });

  it("does not match on unrelated text", () => {
    expect(matchesSearch(r, "mysuru")).toBe(false);
  });
});

describe("activeFilterCount", () => {
  it("counts constraining groups, not selected pills", () => {
    expect(activeFilterCount(EMPTY_FILTERS)).toBe(0);
    expect(activeFilterCount(filters({ risk: ["high", "very_high"] }))).toBe(1);
    expect(activeFilterCount(filters({ risk: ["high"], breeding: "3+", action: "Deploy survey teams" }))).toBe(3);
  });
});

describe("toggleValue", () => {
  it("adds then removes", () => {
    expect(toggleValue<string>([], "a")).toEqual(["a"]);
    expect(toggleValue(["a", "b"], "a")).toEqual(["b"]);
  });
});

describe("applyTableView", () => {
  const rows = [
    row("Alpha", { risk: "very_high", trend: "rising", foggingStatus: "overdue", majorOpen: 4, coverage: "low",
      recommendation: { action_text: "Schedule cold fogging within 48hrs", priority: "urgent", trigger_reason: "x", protocol_reference: "NVBDCP 1", triggered_by_rule_id: 0 } }),
    row("Beta", { risk: "moderate", trend: "steady", foggingStatus: "recent", majorOpen: 0, coverage: "high", district: "Ballari",
      recommendation: { action_text: "Continue routine monitoring", priority: "routine", trigger_reason: "y", protocol_reference: "NVBDCP 9", triggered_by_rule_id: 8 } }),
    row("Gamma", { risk: "high", trend: "rising", foggingStatus: null, majorOpen: 2, coverage: "no_data" }),
  ];

  it("returns everything, priority-sorted, with no filters", () => {
    expect(applyTableView(rows, EMPTY_FILTERS, "", DEFAULT_SORT).map((r) => r.ward)).toEqual(["Alpha", "Gamma", "Beta"]);
  });

  it("treats an empty multi-select as no constraint, not match-nothing", () => {
    expect(applyTableView(rows, filters({ risk: [] }), "", DEFAULT_SORT)).toHaveLength(3);
  });

  it("ORs within a group", () => {
    const out = applyTableView(rows, filters({ risk: ["very_high", "high"] }), "", DEFAULT_SORT);
    expect(out.map((r) => r.ward)).toEqual(["Alpha", "Gamma"]);
  });

  it("ANDs across groups", () => {
    const out = applyTableView(rows, filters({ trend: ["rising"], coverage: ["no_data"] }), "", DEFAULT_SORT);
    expect(out.map((r) => r.ward)).toEqual(["Gamma"]);
  });

  it("matches a missing fogging record under the No record filter", () => {
    expect(applyTableView(rows, filters({ fogging: ["no_record"] }), "", DEFAULT_SORT).map((r) => r.ward)).toEqual(["Gamma"]);
  });

  it("applies the breeding band", () => {
    expect(applyTableView(rows, filters({ breeding: "3+" }), "", DEFAULT_SORT).map((r) => r.ward)).toEqual(["Alpha"]);
    expect(applyTableView(rows, filters({ breeding: "none" }), "", DEFAULT_SORT).map((r) => r.ward)).toEqual(["Beta"]);
  });

  it("filters on exact recommended action", () => {
    const out = applyTableView(rows, filters({ action: "Continue routine monitoring" }), "", DEFAULT_SORT);
    expect(out.map((r) => r.ward)).toEqual(["Beta"]);
  });

  it("combines search with filters", () => {
    expect(applyTableView(rows, filters({ trend: ["steady"] }), "ballari", DEFAULT_SORT).map((r) => r.ward)).toEqual(["Beta"]);
    expect(applyTableView(rows, filters({ trend: ["rising"] }), "ballari", DEFAULT_SORT)).toEqual([]);
  });
});

describe("uniqueActions", () => {
  it("lists distinct action texts alphabetically, skipping rows without one", () => {
    const rec = (t: string) => ({ action_text: t, priority: "routine" as const, trigger_reason: "", protocol_reference: "", triggered_by_rule_id: 0 });
    const rows = [
      row("A", { recommendation: rec("Zebra action") }),
      row("B", { recommendation: rec("Alpha action") }),
      row("C", { recommendation: rec("Alpha action") }),
      row("D", { recommendation: null }),
    ];
    expect(uniqueActions(rows)).toEqual(["Alpha action", "Zebra action"]);
  });
});

describe("riskOptions", () => {
  it("lists the tiers present, worst first, with the state-aware label the cells use", () => {
    const rows = [
      row("A", { risk: "moderate", riskLabel: "Caution" }),
      row("B", { risk: "very_high", riskLabel: "Critical" }),
      row("C", { risk: "moderate", riskLabel: "Caution" }),
    ];
    expect(riskOptions(rows)).toEqual([
      { tier: "very_high", label: "Critical" },
      { tier: "moderate", label: "Caution" },
    ]);
  });
});
