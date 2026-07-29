import { describe, it, expect } from "vitest";
import type { DashboardFiltersLike } from "@/data/mockData";
import {
  comparePriorityRows,
  getPriorityScore,
  scopeRows,
  toOperationalWardMap,
  toTrendTier,
  MAX_PRIORITY_SCORE,
  type PriorityRow,
  type PriorityScoreInput,
} from "./priorityRows";

// A ward with every signal clear — the zero baseline every case below perturbs
// one field at a time, so each assertion isolates one term of the sum.
const CLEAR: PriorityScoreInput = {
  risk: "low",
  trend: "falling",
  foggingStatus: "recent",
  majorOpen: 0,
  coverage: "high",
};

const with_ = (over: Partial<PriorityScoreInput>): PriorityScoreInput => ({ ...CLEAR, ...over });

describe("getPriorityScore", () => {
  it("scores an all-clear ward at the risk floor only", () => {
    // 'low' still carries 10 — a low-risk ward is not a zero-risk ward.
    expect(getPriorityScore(CLEAR)).toBe(10);
  });

  it("scores a ward with no signal at all at zero", () => {
    expect(getPriorityScore(with_({ risk: "no_data", foggingStatus: "recent" }))).toBe(0);
  });

  it("scores a ward carrying every worst signal at the documented maximum", () => {
    const worst: PriorityScoreInput = {
      risk: "very_high",
      trend: "rising",
      foggingStatus: "overdue",
      majorOpen: 3,
      coverage: "low",
    };
    expect(getPriorityScore(worst)).toBe(MAX_PRIORITY_SCORE);
    expect(getPriorityScore(worst)).toBe(225);
  });

  it("weights the forecast tier at 100 / 75 / 40 / 10 / 0", () => {
    const base = getPriorityScore(with_({ risk: "no_data" }));
    expect(getPriorityScore(with_({ risk: "very_high" })) - base).toBe(100);
    expect(getPriorityScore(with_({ risk: "high" })) - base).toBe(75);
    expect(getPriorityScore(with_({ risk: "moderate" })) - base).toBe(40);
    expect(getPriorityScore(with_({ risk: "low" })) - base).toBe(10);
  });

  it("weights case trend at 30 rising / 10 steady / 0 otherwise", () => {
    const base = getPriorityScore(CLEAR);
    expect(getPriorityScore(with_({ trend: "rising" })) - base).toBe(30);
    expect(getPriorityScore(with_({ trend: "steady" })) - base).toBe(10);
    expect(getPriorityScore(with_({ trend: "falling" })) - base).toBe(0);
    expect(getPriorityScore(with_({ trend: "none" })) - base).toBe(0);
  });

  it("ranks a never-fogged ward above one merely due, below one overdue", () => {
    const base = getPriorityScore(CLEAR);
    expect(getPriorityScore(with_({ foggingStatus: "overdue" })) - base).toBe(40);
    expect(getPriorityScore(with_({ foggingStatus: "no_record" })) - base).toBe(30);
    expect(getPriorityScore(with_({ foggingStatus: "due" })) - base).toBe(20);
    expect(getPriorityScore(with_({ foggingStatus: "recent" })) - base).toBe(0);
  });

  it("treats a missing fogging record the same as an explicit no_record", () => {
    expect(getPriorityScore(with_({ foggingStatus: null }))).toBe(
      getPriorityScore(with_({ foggingStatus: "no_record" })),
    );
  });

  it("bands open major breeding sites at 3+ / 1-2 / none", () => {
    const base = getPriorityScore(CLEAR);
    expect(getPriorityScore(with_({ majorOpen: 9 })) - base).toBe(30);
    expect(getPriorityScore(with_({ majorOpen: 3 })) - base).toBe(30);
    expect(getPriorityScore(with_({ majorOpen: 2 })) - base).toBe(15);
    expect(getPriorityScore(with_({ majorOpen: 1 })) - base).toBe(15);
    expect(getPriorityScore(with_({ majorOpen: 0 })) - base).toBe(0);
  });

  it("scores an unsurveyed ward below a low-coverage one", () => {
    // Low coverage is a measured failure; no data is an unknown. The measured
    // failure outranks it.
    const base = getPriorityScore(CLEAR);
    expect(getPriorityScore(with_({ coverage: "low" })) - base).toBe(25);
    expect(getPriorityScore(with_({ coverage: "no_data" })) - base).toBe(20);
    expect(getPriorityScore(with_({ coverage: "medium" })) - base).toBe(10);
    expect(getPriorityScore(with_({ coverage: "high" })) - base).toBe(0);
  });
});

// ── Ranking ────────────────────────────────────────────────────────

const row = (ward: string, over: Partial<PriorityRow> = {}): PriorityRow => {
  const base: Omit<PriorityRow, "score"> = {
    wardKey: `Karnataka|Mysuru|Nanjangud|${ward}`,
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

describe("comparePriorityRows", () => {
  it("puts the worst combination first and the all-clear ward last", () => {
    const rows = [
      row("Calm", {}),
      row("Worst", { risk: "very_high", trend: "rising", foggingStatus: "overdue", majorOpen: 4, coverage: "low" }),
      row("Middling", { risk: "moderate", trend: "steady", foggingStatus: "due" }),
      row("HighRiskCovered", { risk: "high" }),
    ].sort(comparePriorityRows);

    expect(rows.map((r) => r.ward)).toEqual(["Worst", "HighRiskCovered", "Middling", "Calm"]);
    expect(rows[0].score).toBe(225);
    expect(rows[rows.length - 1].score).toBe(10);
  });

  it("outranks a quiet high-risk ward with a moderate ward that is failing on every operational signal", () => {
    // The point of the composite: forecast risk is the heaviest single term but
    // it does not dominate a stack of observed field failures.
    const quietHigh = row("QuietHigh", { risk: "high" });
    const failingModerate = row("FailingModerate", {
      risk: "moderate",
      trend: "rising",
      foggingStatus: "overdue",
      majorOpen: 3,
      coverage: "low",
    });
    expect(failingModerate.score).toBeGreaterThan(quietHigh.score);
  });

  it("breaks score ties on ward name so the order is stable across rebuilds", () => {
    const rows = [row("Zeta"), row("Alpha"), row("Mid")].sort(comparePriorityRows);
    expect(rows.map((r) => r.ward)).toEqual(["Alpha", "Mid", "Zeta"]);
  });
});

// ── Trend mapping ──────────────────────────────────────────────────

describe("toTrendTier", () => {
  it("maps the case-rise vocabulary onto the table's", () => {
    expect(toTrendTier("up")).toBe("rising");
    expect(toTrendTier("down")).toBe("falling");
    expect(toTrendTier("stable")).toBe("steady");
    expect(toTrendTier("none")).toBe("none");
  });
});

// ── Scoping (one resolve, two consumers) ───────────────────────────

const filters = (over: Partial<DashboardFiltersLike> = {}): DashboardFiltersLike =>
  ({ district: "All Districts", block: "All Blocks", ward: "All Wards", areaType: "all", fromDate: "", toDate: "", ...over }) as DashboardFiltersLike;

const SCOPED: PriorityRow[] = [
  row("W1", { district: "Mysuru", block: "Nanjangud" }),
  row("W2", { district: "Mysuru", block: "Hunsur" }),
  row("W3", { district: "Ballari", block: "Siruguppa" }),
];

describe("scopeRows", () => {
  it("returns every row untouched when nothing is filtered", () => {
    expect(scopeRows(SCOPED, filters())).toBe(SCOPED);
  });

  it("narrows to a district", () => {
    expect(scopeRows(SCOPED, filters({ district: "Mysuru" })).map((r) => r.ward)).toEqual(["W1", "W2"]);
  });

  it("narrows to a block within a district", () => {
    const out = scopeRows(SCOPED, filters({ district: "Mysuru", block: "Hunsur" }));
    expect(out.map((r) => r.ward)).toEqual(["W2"]);
  });

  it("narrows to a single ward", () => {
    const out = scopeRows(SCOPED, filters({ district: "Mysuru", block: "Nanjangud", ward: "W1" }));
    expect(out.map((r) => r.ward)).toEqual(["W1"]);
  });
});

describe("toOperationalWardMap", () => {
  it("projects rows onto the map's ward-state contract", () => {
    const map = toOperationalWardMap([
      row("W1", { foggingStatus: "overdue", daysSinceLastFogging: 34, majorOpen: 2, minorOpen: 5, coverage: "low" }),
    ]);
    const entry = map.get("Karnataka|Mysuru|Nanjangud|W1");
    expect(entry).toEqual({
      wardKey: "Karnataka|Mysuru|Nanjangud|W1",
      district: "Mysuru",
      block: "Nanjangud",
      ward: "W1",
      foggingStatus: "overdue",
      daysSinceLastFogging: 34,
      majorOpen: 2,
      minorOpen: 5,
      coverage: "low",
    });
  });
});
