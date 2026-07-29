import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import ResponseHistoryPanel from "./ResponseHistoryPanel";
import {
  applyHistoryView,
  describeArea,
  describeRecord,
  loggedDate,
  nextHistorySort,
  sortRecords,
  weekOptions,
  DEFAULT_HISTORY_SORT,
  EMPTY_HISTORY_FILTERS,
} from "./responseHistory";
import type { FieldActivityStatus, WeeklyResponseRecord } from "./types";

let seq = 0;
const rec = (over: Partial<WeeklyResponseRecord> = {}): WeeklyResponseRecord => {
  seq += 1;
  const status: FieldActivityStatus = over.field_activity_status ?? "yes";
  return {
    id: `r${seq}`,
    epidemiological_week: "W19",
    forecast_ref: "FR-W19",
    forecast_generated_at: "2026-07-01",
    risk_level_at_capture: "high",
    state: "karnataka",
    disease: "dengue",
    district: "Dharwad",
    block_or_mun: "Hubballi-Dharwad Municipal Corporation",
    ward_or_village: "Dharwad Ward 3",
    geography_level: "ward",
    geography_id: "g1",
    geography_name: "Dharwad Ward 3",
    field_activity_status: status,
    reporting_status: status === "yes" ? "completed" : status === "no" ? "no_activity" : "report_pending",
    logged_by_user_id: "u1",
    logged_by_name: "Dr Shariff",
    logged_by_role: "State Officer",
    recorded_at: "2026-07-20T00:00:00.000Z",
    logged_at: "2026-07-20T00:00:00.000Z",
    updated_at: "2026-07-20T00:00:00.000Z",
    ...over,
  } as WeeklyResponseRecord;
};

const expand = () => fireEvent.click(screen.getByRole("button", { name: /Response History/ }));
const bodyRows = () => within(screen.getByRole("table")).getAllByRole("row").slice(1);

describe("ResponseHistoryPanel — collapsed by default", () => {
  it("shows only its header until expanded", () => {
    render(<ResponseHistoryPanel records={[rec()]} />);
    const toggle = screen.getByRole("button", { name: /Response History/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("expands and collapses on the header", () => {
    render(<ResponseHistoryPanel records={[rec()]} />);
    expand();
    expect(screen.getByRole("button", { name: /Response History/ })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("table")).toBeInTheDocument();
    expand();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("counts the records in the header", () => {
    render(<ResponseHistoryPanel records={[rec(), rec(), rec()]} />);
    expect(screen.getByText("· 3 logged")).toBeInTheDocument();
  });
});

describe("ResponseHistoryPanel — empty state", () => {
  it("says so rather than showing an empty table", () => {
    render(<ResponseHistoryPanel records={[]} />);
    expand();
    expect(screen.getByText("No responses logged for this state yet.")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("does not claim a count when there is nothing logged", () => {
    render(<ResponseHistoryPanel records={[]} />);
    expect(screen.queryByText(/logged/)).not.toBeInTheDocument();
  });
});

describe("describeRecord", () => {
  it("summarises a field activity from personnel and activities", () => {
    expect(describeRecord(rec({ personnel_deployed: 6, activities_performed: ["Source reduction", "Fogging"] })))
      .toBe("6 personnel · Source reduction, Fogging");
  });

  it("falls back to actions_taken when no activities were recorded", () => {
    expect(describeRecord(rec({ personnel_deployed: 2, activities_performed: [], actions_taken: ["fogging"] as never })))
      .toBe("2 personnel · fogging");
  });

  it("gives the reason for a no-activity record", () => {
    expect(describeRecord(rec({ field_activity_status: "no", no_activity_reason: "Public holiday" }))).toBe("Public holiday");
  });

  it("prefers the free-text reason when the officer chose Other", () => {
    expect(describeRecord(rec({
      field_activity_status: "no", no_activity_reason: "Other", no_activity_reason_other: "Weekly holiday",
    }))).toBe("Weekly holiday");
  });

  it("renders a dash rather than inventing a zero when details are absent", () => {
    // Every detail field is optional. A response with no personnel recorded is
    // not a response with zero personnel.
    expect(describeRecord(rec())).toBe("—");
    expect(describeRecord(rec({ field_activity_status: "report_pending" }))).toBe("—");
  });

  it("says so when a no-activity record has no reason at all", () => {
    expect(describeRecord(rec({ field_activity_status: "no", no_activity_reason: undefined })))
      .toBe("No reason recorded");
  });
});

describe("describeArea + loggedDate", () => {
  it("pairs the area with its parent geography", () => {
    expect(describeArea(rec())).toEqual({
      name: "Dharwad Ward 3",
      parent: "Dharwad · Hubballi-Dharwad Municipal Corporation",
    });
  });

  it("omits the parent when the record has none", () => {
    expect(describeArea(rec({ district: "", block_or_mun: null }))).toEqual({ name: "Dharwad Ward 3", parent: null });
  });

  it("reduces an ISO timestamp to the date an officer reads", () => {
    expect(loggedDate(rec({ recorded_at: "2026-07-20T13:45:02.000Z" }))).toBe("2026-07-20");
  });
});

describe("sortRecords", () => {
  const a = rec({ epidemiological_week: "W16", geography_name: "Alpha", logged_by_name: "Anita", recorded_at: "2026-05-01" });
  const b = rec({ epidemiological_week: "W19", geography_name: "Zeta", logged_by_name: "Zara", recorded_at: "2026-07-20", field_activity_status: "no" });
  const c = rec({ epidemiological_week: "W52", geography_name: "Mid", logged_by_name: "Mohan", recorded_at: "2026-06-10", field_activity_status: "report_pending" });

  it("defaults to newest logged first", () => {
    expect(sortRecords([a, b, c], DEFAULT_HISTORY_SORT).map((r) => r.recorded_at.slice(0, 10)))
      .toEqual(["2026-07-20", "2026-06-10", "2026-05-01"]);
  });

  it("orders weeks by position in the season, not by number", () => {
    // EPI_WEEKS runs W36..W52 then W1..W19, so W52 precedes W16 and W19.
    expect(sortRecords([a, b, c], { key: "week", dir: "asc" }).map((r) => r.epidemiological_week))
      .toEqual(["W52", "W16", "W19"]);
  });

  it("sorts areas and people alphabetically", () => {
    expect(sortRecords([b, a, c], { key: "area", dir: "asc" }).map((r) => r.geography_name)).toEqual(["Alpha", "Mid", "Zeta"]);
    expect(sortRecords([b, a, c], { key: "loggedBy", dir: "asc" }).map((r) => r.logged_by_name)).toEqual(["Anita", "Mohan", "Zara"]);
  });

  it("groups by action type", () => {
    expect(sortRecords([c, b, a], { key: "type", dir: "asc" }).map((r) => r.field_activity_status))
      .toEqual(["yes", "no", "report_pending"]);
  });

  it("does not mutate its input", () => {
    const input = [b, a];
    sortRecords(input, { key: "area", dir: "asc" });
    expect(input[0]).toBe(b);
  });
});

describe("nextHistorySort", () => {
  it("starts a new column descending, then flips", () => {
    expect(nextHistorySort(DEFAULT_HISTORY_SORT, "area")).toEqual({ key: "area", dir: "desc" });
    expect(nextHistorySort({ key: "area", dir: "desc" }, "area")).toEqual({ key: "area", dir: "asc" });
  });
});

describe("applyHistoryView + weekOptions", () => {
  const rows = [
    rec({ epidemiological_week: "W19", geography_name: "Alpha Ward" }),
    rec({ epidemiological_week: "W18", geography_name: "Beta Ward", field_activity_status: "no" }),
    rec({ epidemiological_week: "W19", geography_name: "Gamma Ward", district: "Ballari" }),
  ];

  it("returns everything when nothing is filtered", () => {
    expect(applyHistoryView(rows, EMPTY_HISTORY_FILTERS, "", DEFAULT_HISTORY_SORT)).toHaveLength(3);
  });

  it("filters by week and by action type, ANDed across groups", () => {
    expect(applyHistoryView(rows, { weeks: ["W19"], types: [] }, "", DEFAULT_HISTORY_SORT)).toHaveLength(2);
    expect(applyHistoryView(rows, { weeks: [], types: ["no"] }, "", DEFAULT_HISTORY_SORT)).toHaveLength(1);
    expect(applyHistoryView(rows, { weeks: ["W19"], types: ["no"] }, "", DEFAULT_HISTORY_SORT)).toHaveLength(0);
  });

  it("searches area name and its parent geography, case-insensitively", () => {
    expect(applyHistoryView(rows, EMPTY_HISTORY_FILTERS, "gamma", DEFAULT_HISTORY_SORT)).toHaveLength(1);
    expect(applyHistoryView(rows, EMPTY_HISTORY_FILTERS, "ballari", DEFAULT_HISTORY_SORT)).toHaveLength(1);
    // All three fixtures share the default block, so this matches every row.
    expect(applyHistoryView(rows, EMPTY_HISTORY_FILTERS, "hubballi", DEFAULT_HISTORY_SORT)).toHaveLength(3);
  });

  it("lists the weeks present, most recent first", () => {
    expect(weekOptions(rows)).toEqual(["W19", "W18"]);
  });
});

describe("ResponseHistoryPanel — table, filters and paging", () => {
  const many = Array.from({ length: 23 }, (_, i) =>
    rec({
      geography_name: `Ward ${String(i + 1).padStart(2, "0")}`,
      epidemiological_week: i % 2 === 0 ? "W19" : "W18",
      field_activity_status: i % 3 === 0 ? "no" : "yes",
      no_activity_reason: "Access issue",
      recorded_at: `2026-07-${String(i + 1).padStart(2, "0")}`,
    }),
  );

  it("renders the six spec'd columns", () => {
    render(<ResponseHistoryPanel records={[rec()]} />);
    expand();
    const heads = within(screen.getByRole("table")).getAllByRole("columnheader").map((h) => h.textContent?.replace(/[↓↑]/g, "").trim());
    expect(heads).toEqual(["Week", "Area", "Action type", "Logged by", "Date logged", "Details"]);
  });

  it("shows 10 rows per page with an honest total", () => {
    render(<ResponseHistoryPanel records={many} />);
    expand();
    expect(bodyRows()).toHaveLength(10);
    expect(screen.getByText(/Showing/)).toHaveTextContent("Showing 1-10 of 23");
  });

  it("pages forward", () => {
    render(<ResponseHistoryPanel records={many} />);
    expand();
    fireEvent.click(screen.getByLabelText("Next page"));
    expect(screen.getByText(/Showing/)).toHaveTextContent("Showing 11-20 of 23");
  });

  it("narrows by an action-type pill", () => {
    render(<ResponseHistoryPanel records={many} />);
    expand();
    fireEvent.click(screen.getByRole("button", { name: "No activity" }));
    // every third record, i = 0,3,...,21 → 8, which fits on one page
    expect(bodyRows()).toHaveLength(8);
    for (const row of bodyRows()) expect(within(row).getByText("No activity")).toBeInTheDocument();
  });

  it("drops the pagination bar once the result set fits on one page", () => {
    // TablePagination hides itself below one page — the app's existing
    // behaviour everywhere except the Priority Action Table, which opts into a
    // rows-per-page selector this panel does not need.
    render(<ResponseHistoryPanel records={many} />);
    expand();
    expect(screen.getByText(/Showing/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Search areas"), { target: { value: "Ward 07" } });
    expect(bodyRows()).toHaveLength(1);
    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
  });

  it("narrows by week and resets to the first page", () => {
    render(<ResponseHistoryPanel records={many} />);
    expand();
    fireEvent.click(screen.getByLabelText("Next page"));
    fireEvent.click(screen.getByRole("button", { name: "W18" }));
    expect(screen.getByText(/Showing/)).toHaveTextContent("Showing 1-10 of 11");
  });

  it("searches by area and clears everything at once", () => {
    render(<ResponseHistoryPanel records={many} />);
    expand();
    fireEvent.change(screen.getByLabelText("Search areas"), { target: { value: "Ward 07" } });
    expect(bodyRows()).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(screen.getByText(/Showing/)).toHaveTextContent("Showing 1-10 of 23");
  });

  it("says so when filters match nothing", () => {
    render(<ResponseHistoryPanel records={many} />);
    expand();
    fireEvent.change(screen.getByLabelText("Search areas"), { target: { value: "nowhere" } });
    expect(screen.getByText("No responses match these filters.")).toBeInTheDocument();
  });

  it("re-sorts when a column header is clicked", () => {
    render(<ResponseHistoryPanel records={many} />);
    expand();
    fireEvent.click(screen.getByRole("button", { name: "Sort by Area" }));
    const first = bodyRows()[0].textContent;
    expect(first).toContain("Ward 23");
    fireEvent.click(screen.getByRole("button", { name: "Sort by Area" }));
    expect(bodyRows()[0].textContent).toContain("Ward 01");
  });

  it("renders a no-activity row with its reason and no personnel figure", () => {
    render(<ResponseHistoryPanel records={[rec({ field_activity_status: "no", no_activity_reason: "Public holiday" })]} />);
    expand();
    const row = bodyRows()[0];
    expect(within(row).getByText("No activity")).toBeInTheDocument();
    expect(within(row).getByText("Public holiday")).toBeInTheDocument();
  });

  it("is read-only — no action controls on a row", () => {
    render(<ResponseHistoryPanel records={[rec()]} />);
    expand();
    expect(within(bodyRows()[0]).queryAllByRole("button")).toHaveLength(0);
  });
});

describe("ResponseHistoryPanel — no context required", () => {
  it("renders from a plain records array", () => {
    // Standalone by construction: the panel takes records as a prop and owns no
    // shared state, so nothing here needs a provider.
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<ResponseHistoryPanel records={[rec()]} />);
    expand();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
