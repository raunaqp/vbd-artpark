import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import ResponseSummaryTiles from "./ResponseSummaryTiles";
import type { WeeklySummary } from "./aggregation";
import type { OperationalWardMap, OperationalWardState } from "./operationalWards";

const summary = (over: Partial<WeeklySummary> = {}): WeeklySummary => ({
  totalAreas: 12,
  areasReporting: 8,
  highRiskAreas: 3,
  priorityAreas: 6,
  priorityCompleted: 4,
  priorityPending: 2,
  priorityCoveragePct: 67,
  areasWithFieldActivity: 5,
  personnelDeployed: 40,
  areasCovered: 22,
  sourceReductionActivities: 3,
  highRiskNoCompleted: 1,
  moderateRiskNoCompleted: 1,
  ...over,
});

const ward = (key: string, over: Partial<OperationalWardState> = {}): OperationalWardState => ({
  wardKey: key,
  district: "Mysuru",
  block: "Nanjangud",
  ward: key,
  foggingStatus: "recent",
  daysSinceLastFogging: 3,
  majorOpen: 0,
  minorOpen: 0,
  coverage: "high",
  ...over,
});

const wardMap = (...ws: OperationalWardState[]): OperationalWardMap =>
  new Map(ws.map((w) => [w.wardKey, w]));

const WARDS = wardMap(
  ward("A", { foggingStatus: "overdue", majorOpen: 4 }),
  ward("B", { foggingStatus: "overdue", majorOpen: 1 }),
  ward("C", { foggingStatus: "due", majorOpen: 0 }),
  ward("D", { foggingStatus: null, majorOpen: 2 }),
);

/** The tile whose label matches — value and sub-label live in the same box. */
const tile = (label: string) => screen.getByText(label).closest("div")!.parentElement!;

const setup = (props: Partial<React.ComponentProps<typeof ResponseSummaryTiles>> = {}) =>
  render(
    <ResponseSummaryTiles
      summary={summary()}
      wards={WARDS}
      areaLabel="districts"
      {...props}
    />,
  );

describe("ResponseSummaryTiles", () => {
  it("renders exactly the six tiles the design doc names, in order", () => {
    const { container } = setup();
    const labels = [...container.querySelectorAll(".text-\\[11px\\]")].map((e) => e.textContent);
    expect(labels).toEqual([
      "High-risk Areas",
      "Priority Responses Completed",
      "Priority Responses Pending",
      "Fogging Overdue Wards",
      "Major Breeding Sites Open",
      "Response Coverage",
    ]);
  });

  it("reads tiles 1-3 and 6 straight off the weekly summary", () => {
    setup();
    expect(within(tile("High-risk Areas")).getByText("3")).toBeInTheDocument();
    expect(within(tile("Priority Responses Completed")).getByText("4")).toBeInTheDocument();
    expect(within(tile("Priority Responses Pending")).getByText("2")).toBeInTheDocument();
    expect(within(tile("Response Coverage")).getByText("67%")).toBeInTheDocument();
  });

  it("derives tiles 4 and 5 from the ward scope", () => {
    setup();
    // Two wards overdue; a null fogging status is not overdue.
    expect(within(tile("Fogging Overdue Wards")).getByText("2")).toBeInTheDocument();
    // 4 + 1 + 0 + 2 open major sites.
    expect(within(tile("Major Breeding Sites Open")).getByText("7")).toBeInTheDocument();
  });

  it("distinguishes high-risk from priority areas — high only, not high plus moderate", () => {
    setup({ summary: summary({ highRiskAreas: 3, priorityAreas: 9 }) });
    expect(within(tile("High-risk Areas")).getByText("3")).toBeInTheDocument();
  });

  it("names the grain, because tiles 1-3 and 4-5 count different things", () => {
    setup({ areaLabel: "districts" });
    expect(within(tile("High-risk Areas")).getByText("districts")).toBeInTheDocument();
    expect(within(tile("Fogging Overdue Wards")).getByText("wards")).toBeInTheDocument();
  });

  it("follows the drill grain through areaLabel", () => {
    setup({ areaLabel: "wards" });
    expect(within(tile("High-risk Areas")).getByText("wards")).toBeInTheDocument();
  });
});

describe("ResponseSummaryTiles — loading and empty states", () => {
  it("shows a dash, not a zero, on the ward tiles while R3 resolves", () => {
    setup({ wards: new Map(), loading: true });
    expect(within(tile("Fogging Overdue Wards")).getByText("—")).toBeInTheDocument();
    expect(within(tile("Major Breeding Sites Open")).getByText("—")).toBeInTheDocument();
  });

  it("keeps the summary-derived tiles populated while the ward tiles load", () => {
    setup({ wards: new Map(), loading: true });
    expect(within(tile("High-risk Areas")).getByText("3")).toBeInTheDocument();
    expect(within(tile("Response Coverage")).getByText("67%")).toBeInTheDocument();
  });

  it("shows a real zero once resolved", () => {
    setup({ wards: wardMap(ward("A")), loading: false });
    expect(within(tile("Fogging Overdue Wards")).getByText("0")).toBeInTheDocument();
    expect(within(tile("Major Breeding Sites Open")).getByText("0")).toBeInTheDocument();
  });

  it("dashes coverage when there are no priority areas at all", () => {
    setup({ summary: summary({ priorityCoveragePct: null, priorityAreas: 0 }) });
    const t = tile("Response Coverage");
    expect(within(t).getByText("—")).toBeInTheDocument();
    expect(within(t).getByText("no priority areas")).toBeInTheDocument();
  });
});

describe("ResponseSummaryTiles — header slot", () => {
  it("omits the header entirely when nothing is slotted in", () => {
    setup();
    expect(screen.queryByText("This Week")).not.toBeInTheDocument();
  });

  it("renders the slotted control beside the heading — the Response tab's week selector", () => {
    setup({ headerRight: <button>Reporting week: W19</button> });
    expect(screen.getByText("This Week")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reporting week: W19" })).toBeInTheDocument();
  });
});
