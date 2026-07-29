import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import WardDetailSheet from "./WardDetailSheet";
import { getPriorityScore, type PriorityRow } from "./priorityRows";
import type { WeeklyResponseRecord } from "./types";

// Section 3 reads the lazy R3 datasets; stub the loader so the render test
// exercises the sheet, not the 10 MB of generated data behind it.
vi.mock("./wardHistory", async () => {
  const actual = await vi.importActual<typeof import("./wardHistory")>("./wardHistory");
  return { ...actual, loadWardHistory: vi.fn() };
});
import { loadWardHistory, EMPTY_WARD_HISTORY } from "./wardHistory";

const mockedLoad = vi.mocked(loadWardHistory);

const rec = {
  action_text: "Schedule cold fogging within 48hrs",
  priority: "urgent" as const,
  trigger_reason: "high risk; fogging overdue — 34 days since last round",
  protocol_reference: "NVBDCP: high-risk hotspot, weekly fogging protocol",
  triggered_by_rule_id: 0,
};

const ROW: PriorityRow = (() => {
  const base = {
    wardKey: "Karnataka|Dharwad|Hubballi-Dharwad Municipal Corporation|Dharwad Ward 3",
    district: "Dharwad",
    block: "Hubballi-Dharwad Municipal Corporation",
    ward: "Dharwad Ward 3",
    risk: "very_high" as const,
    riskLabel: "Very High",
    trend: "rising" as const,
    windowCases: 18,
    priorCases: 7,
    foggingStatus: "overdue" as const,
    daysSinceLastFogging: 34,
    majorOpen: 4,
    minorOpen: 2,
    coverage: "low" as const,
    recommendation: rec,
  };
  return { ...base, score: getPriorityScore(base) };
})();

const HISTORY = {
  foggingEvents: [
    { ward_key: "k", event_id: "e1", date: "2026-06-25", sub_area_name: "Zone A", gps_lat: 0, gps_lng: 0,
      personnel_designation: "Vector Team" as const, team_name: "Team Alpha", supervising_mo: "MO",
      personnel_count: 6, fogging_type: "cold_fogging" as const, coverage_estimate_households: 180, source: "KB_app" as const },
  ],
  openBreedingSites: [
    { ward_key: "k", site_id: "s1", gps_lat: 0, gps_lng: 0, area_name: "Market Lane", magnitude: "major" as const,
      status: "open" as const, first_reported_date: "2026-04-02", last_inspection_date: "2026-05-30",
      resolved_date: null, resolved_by: null },
  ],
  breeding: { major_open: 4, minor_open: 2, major_resolved: 3, minor_resolved: 8, days_since_last_inspection: 12, total_sites_tracked: 17 },
  larval: [
    { ward_key: "k", week: "2026-W19", week_start_date: "2026-05-04", coverage_tier: "low" as const,
      houses_inspected: 40, houses_positive: 9, containers_inspected: 90, containers_positive: 14,
      bi: 15, hi: 22, ci: 16, any_outbreak_threshold_breached: true },
  ],
};

const ACTIVITY: WeeklyResponseRecord[] = [
  {
    id: "r1", epidemiological_week: "W18", forecast_ref: "FR-W18", forecast_generated_at: "2026-07-01",
    risk_level_at_capture: "high", state: "karnataka", disease: "dengue", district: "Dharwad",
    block_or_mun: "Hubballi-Dharwad Municipal Corporation", ward_or_village: "Dharwad Ward 3",
    geography_level: "ward", geography_id: "g1", geography_name: "Dharwad Ward 3",
    field_activity_status: "yes", reporting_status: "completed", activity_date: "2026-07-12",
    activities_performed: ["Source reduction", "Larva surveillance"],
    logged_by_user_id: "u1", logged_by_name: "Dr Shariff", logged_by_role: "State Officer",
    recorded_at: "2026-07-12", logged_at: "2026-07-12", updated_at: "2026-07-12",
  } as WeeklyResponseRecord,
];

/**
 * The action footer. Scoped because Radix's SheetContent ships its own sr-only
 * "Close" button in the corner — two ways to dismiss is correct for a user and
 * ambiguous for a query.
 */
const footer = () => screen.getByRole("button", { name: "Log Response" }).parentElement!;

const setup = (over: Partial<React.ComponentProps<typeof WardDetailSheet>> = {}) => {
  const onLog = vi.fn(), onNoActivity = vi.fn(), onOpenChange = vi.fn();
  render(
    <WardDetailSheet
      open
      onOpenChange={onOpenChange}
      row={ROW}
      stateLabel="Karnataka"
      epiWeek="W19"
      logStatus="pending"
      recentActivity={ACTIVITY}
      onLog={onLog}
      onNoActivity={onNoActivity}
      {...over}
    />,
  );
  return { onLog, onNoActivity, onOpenChange };
};

beforeEach(() => {
  mockedLoad.mockReset();
  mockedLoad.mockResolvedValue(HISTORY);
});

describe("WardDetailSheet — section 1, ward header", () => {
  it("names the ward and its full breadcrumb", async () => {
    setup();
    expect(await screen.findByRole("heading", { name: "Dharwad Ward 3" })).toBeInTheDocument();
    expect(screen.getByText("Karnataka › Dharwad › Hubballi-Dharwad Municipal Corporation › Dharwad Ward 3")).toBeInTheDocument();
  });

  it("shows the composite priority score from the row", () => {
    setup();
    // very_high 100 + rising 30 + overdue 40 + 4 major 30 + low coverage 25
    expect(screen.getByText("Priority score 225")).toBeInTheDocument();
  });

  it("renders nothing at all without a row", () => {
    const { container } = render(
      <WardDetailSheet open onOpenChange={vi.fn()} row={null} stateLabel="Karnataka" epiWeek="W19"
        logStatus="pending" recentActivity={[]} onLog={vi.fn()} onNoActivity={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe("WardDetailSheet — section 2, current state", () => {
  it("renders every field from the row it was opened with", () => {
    setup();
    expect(screen.getByText("Very High")).toBeInTheDocument();
    expect(screen.getByText("Rising")).toBeInTheDocument();
    expect(screen.getByText("18 vs 7 prior")).toBeInTheDocument();
    expect(screen.getByText("Overdue · 34d")).toBeInTheDocument();
    expect(screen.getByText("4 major · 2 minor open")).toBeInTheDocument();
    expect(screen.getByText("Low")).toBeInTheDocument();
  });

  it("shows the recommended action in full, with its NVBDCP protocol", () => {
    setup();
    // Untruncated here — the table truncates, the sheet is where you read it.
    expect(screen.getByText("Schedule cold fogging within 48hrs")).toBeInTheDocument();
    expect(screen.getByText("NVBDCP: high-risk hotspot, weekly fogging protocol")).toBeInTheDocument();
  });

  it("shows this week's log status", () => {
    setup({ logStatus: "no_activity" });
    expect(screen.getByText("No activity")).toBeInTheDocument();
  });

  it("adds resolved breeding counts once the aggregation lands", async () => {
    setup();
    expect(await screen.findByText("3 major + 8 minor resolved")).toBeInTheDocument();
  });

  it("handles a ward with no cases in either window", () => {
    const quiet = { ...ROW, trend: "none" as const, windowCases: 0, priorCases: 0 };
    setup({ row: quiet });
    expect(screen.getByText("No cases")).toBeInTheDocument();
  });

  it("suppresses the 999-day sentinel on a never-fogged ward", () => {
    setup({ row: { ...ROW, foggingStatus: "no_record", daysSinceLastFogging: 999 } });
    expect(screen.getByText("No record")).toBeInTheDocument();
    expect(screen.queryByText(/999/)).not.toBeInTheDocument();
  });
});

describe("WardDetailSheet — section 3, history", () => {
  it("loads history for the ward it was opened with", async () => {
    setup();
    await waitFor(() => expect(mockedLoad).toHaveBeenCalledWith(ROW.wardKey));
  });

  it("renders all four history blocks once loaded", async () => {
    setup();
    expect(await screen.findByText("Team Alpha")).toBeInTheDocument();   // fogging
    expect(screen.getByText("Market Lane")).toBeInTheDocument();          // breeding
    expect(screen.getByText("2026-W19")).toBeInTheDocument();             // larval
    expect(screen.getByText("Breached")).toBeInTheDocument();
    expect(screen.getByText("Source reduction, Larva surveillance")).toBeInTheDocument(); // activity
  });

  it("says so rather than showing an empty table when a ward has no history", async () => {
    mockedLoad.mockResolvedValue(EMPTY_WARD_HISTORY);
    setup({ recentActivity: [] });
    expect(await screen.findByText("No fogging events on record for this ward.")).toBeInTheDocument();
    expect(screen.getByText("No open breeding sites.")).toBeInTheDocument();
    expect(screen.getByText("No larval survey records for this ward.")).toBeInTheDocument();
    expect(screen.getByText("No response logged against this ward in the last 4 weeks.")).toBeInTheDocument();
  });

  it("keeps sections 1-2 readable while section 3 is still loading", () => {
    mockedLoad.mockReturnValue(new Promise(() => {}));
    setup();
    expect(screen.getByText("Loading ward history…")).toBeInTheDocument();
    // The point of the split: the ward is already useful before R3 resolves.
    expect(screen.getByText("Overdue · 34d")).toBeInTheDocument();
    expect(screen.getByText("Priority score 225")).toBeInTheDocument();
  });

  it("survives a failed history load without blanking the sheet", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockedLoad.mockRejectedValue(new Error("chunk failed"));
    setup();
    await waitFor(() => expect(screen.getByText("No fogging events on record for this ward.")).toBeInTheDocument());
    expect(screen.getByText("Overdue · 34d")).toBeInTheDocument();
  });
});

describe("WardDetailSheet — section 4, actions", () => {
  it("offers exactly Close, Mark No Activity and Log Response", () => {
    setup();
    expect(within(footer()).getAllByRole("button").map((b) => b.textContent))
      .toEqual(["Close", "Mark No Activity", "Log Response"]);
  });

  it("closes itself before opening the Log drawer, rather than stacking sheets", () => {
    const { onLog, onOpenChange } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Log Response" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onLog).toHaveBeenCalledWith(ROW);
  });

  it("closes itself before opening the No Activity dialog", () => {
    const { onNoActivity, onOpenChange } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Mark No Activity" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onNoActivity).toHaveBeenCalledWith(ROW);
  });

  it("closes without acting on Close", () => {
    const { onLog, onNoActivity, onOpenChange } = setup();
    fireEvent.click(within(footer()).getByRole("button", { name: "Close" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onLog).not.toHaveBeenCalled();
    expect(onNoActivity).not.toHaveBeenCalled();
  });

  it("passes the ward's real risk through to whichever action is taken", () => {
    const { onLog } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Log Response" }));
    expect(onLog.mock.calls[0][0]).toMatchObject({ ward: "Dharwad Ward 3", risk: "very_high" });
  });
});

describe("WardDetailSheet — read-only", () => {
  it("has no form inputs — nothing here edits in place", () => {
    const { container } = render(
      <WardDetailSheet open onOpenChange={vi.fn()} row={ROW} stateLabel="Karnataka" epiWeek="W19"
        logStatus="pending" recentActivity={ACTIVITY} onLog={vi.fn()} onNoActivity={vi.fn()} />,
    );
    expect(container.querySelectorAll("input, textarea, select")).toHaveLength(0);
  });
});
