import { describe, it, expect } from "vitest";
import {
  breakdownSubtitle,
  breakdownTitle,
  DEFAULT_WINDOW,
  EMPTY_MESSAGE,
  isHighRiskKpi,
  WINDOW_OPTIONS,
} from "./areaBreakdown";

describe("window options", () => {
  it("offers 2/4/8/12 weeks", () => {
    expect([...WINDOW_OPTIONS]).toEqual([2, 4, 8, 12]);
  });

  it("defaults to 4 weeks, matching the dashboard's standard window", () => {
    expect(DEFAULT_WINDOW).toBe(4);
    expect([...WINDOW_OPTIONS]).toContain(DEFAULT_WINDOW);
  });
});

describe("isHighRiskKpi", () => {
  it("singles out the one card that counts areas rather than cases", () => {
    expect(isHighRiskKpi("High Risk Areas")).toBe(true);
  });

  it("treats the three case-count cards the same", () => {
    expect(isHighRiskKpi("Suspected")).toBe(false);
    expect(isHighRiskKpi("Tested")).toBe(false);
    expect(isHighRiskKpi("Confirmed")).toBe(false);
  });
});

describe("breakdownTitle", () => {
  it("names the metric and the window", () => {
    expect(breakdownTitle("Confirmed", 4)).toBe("Areas contributing — Confirmed cases, last 4 weeks");
  });

  it("leaves High Risk Areas as-is — it already reads as a noun", () => {
    expect(breakdownTitle("High Risk Areas", 4)).toBe("Areas contributing — High Risk Areas, last 4 weeks");
  });

  it("gives the terse card labels their noun back", () => {
    expect(breakdownTitle("Suspected", 2)).toBe("Areas contributing — Suspected cases, last 2 weeks");
    expect(breakdownTitle("Tested", 8)).toBe("Areas contributing — Tested samples, last 8 weeks");
  });

  it("tracks the window the picker is on", () => {
    for (const w of WINDOW_OPTIONS) {
      expect(breakdownTitle("Confirmed", w)).toContain(`last ${w} weeks`);
    }
  });

  it("falls back to the raw label rather than rendering undefined", () => {
    // The click handler is typed `string`, so an unmapped card must not break the title.
    expect(breakdownTitle("Deaths", 4)).toBe("Areas contributing — Deaths, last 4 weeks");
  });
});

describe("breakdownSubtitle", () => {
  it("says rows are ranked by confirmed cases, not by the clicked metric", () => {
    // Clicking Tested and getting confirmed-order rows is otherwise confusing.
    expect(breakdownSubtitle("Tested")).toBe("Ranked by confirmed cases in the window.");
  });

  it("also states the risk scope for the High Risk Areas modal", () => {
    expect(breakdownSubtitle("High Risk Areas")).toContain("High-risk areas only");
    expect(breakdownSubtitle("High Risk Areas")).toContain("ranked by confirmed cases");
  });
});

describe("EMPTY_MESSAGE", () => {
  it("is the copy the brief specified", () => {
    expect(EMPTY_MESSAGE).toBe("No areas with cases in this window.");
  });
});
