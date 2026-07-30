import { describe, it, expect } from "vitest";
import { caseRangeBounds, formatCaseRange, CASE_RANGE_CAPTION } from "./forecast_range";

describe("caseRangeBounds", () => {
  it("brackets the point estimate by ±10%", () => {
    expect(caseRangeBounds(1172)).toEqual({ lower: 1055, upper: 1289 });
  });

  it("rounds both bounds rather than truncating", () => {
    // 155 × 0.9 = 139.5 → 140; 155 × 1.1 = 170.5 → 171
    expect(caseRangeBounds(155)).toEqual({ lower: 140, upper: 171 });
  });

  it("keeps zero as a zero-width band — an area with no expected cases", () => {
    expect(caseRangeBounds(0)).toEqual({ lower: 0, upper: 0 });
  });

  it("returns null for a missing estimate", () => {
    // Sub-district geographies genuinely have no forecast — distinct from zero.
    expect(caseRangeBounds(null)).toBeNull();
    expect(caseRangeBounds(undefined)).toBeNull();
  });

  it("returns null for non-finite input rather than rendering NaN", () => {
    expect(caseRangeBounds(NaN)).toBeNull();
    expect(caseRangeBounds(Infinity)).toBeNull();
  });
});

describe("formatCaseRange", () => {
  it("renders the band with an en dash", () => {
    expect(formatCaseRange(1172)).toBe("1,055 – 1,289");
  });

  it("groups thousands by default, for on-screen display", () => {
    expect(formatCaseRange(12000)).toBe("10,800 – 13,200");
  });

  it("drops grouping in plain mode, so CSV cells need no quoting", () => {
    expect(formatCaseRange(12000, { plain: true })).toBe("10800 – 13200");
    expect(formatCaseRange(12000, { plain: true })).not.toContain(",");
  });

  it("renders an em dash when there is no estimate", () => {
    expect(formatCaseRange(null)).toBe("—");
    expect(formatCaseRange(undefined)).toBe("—");
    expect(formatCaseRange(null, { plain: true })).toBe("—");
  });

  it("does not collapse a zero estimate into the no-data dash", () => {
    expect(formatCaseRange(0)).toBe("0 – 0");
  });
});

describe("CASE_RANGE_CAPTION", () => {
  it("states the horizon, so the range is not read as a weekly figure", () => {
    expect(CASE_RANGE_CAPTION).toBe("expected case range (4-week horizon)");
  });
});
