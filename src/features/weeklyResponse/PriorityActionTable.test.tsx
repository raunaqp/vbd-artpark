import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import PriorityActionTable from "./PriorityActionTable";
import { formatFogging } from "./priorityTableView";
import { getPriorityScore, type PriorityRow } from "./priorityRows";

const rec = (action_text: string, protocol_reference = "NVBDCP: test protocol row") => ({
  action_text,
  priority: "urgent" as const,
  trigger_reason: "high risk; fogging overdue",
  protocol_reference,
  triggered_by_rule_id: 0,
});

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
    recommendation: rec("Continue routine monitoring"),
    ...over,
  };
  return { ...base, score: getPriorityScore(base) };
};

const WORST = row("Alpha Ward", {
  risk: "very_high",
  riskLabel: "Critical",
  trend: "rising",
  foggingStatus: "overdue",
  daysSinceLastFogging: 34,
  majorOpen: 4,
  minorOpen: 2,
  coverage: "low",
  recommendation: rec("Schedule cold fogging within 48hrs", "NVBDCP: high-risk hotspot, weekly fogging protocol"),
});
const MIDDLE = row("Beta Ward", {
  risk: "moderate",
  riskLabel: "Moderate",
  trend: "steady",
  foggingStatus: "due",
  daysSinceLastFogging: 15,
  majorOpen: 1,
  minorOpen: 3,
  coverage: "medium",
  district: "Ballari",
  block: "Siruguppa",
});
const CALM = row("Gamma Ward", { foggingStatus: null, daysSinceLastFogging: 999, coverage: "no_data" });

const ROWS = [MIDDLE, WORST, CALM];

const setup = (rows = ROWS, onLog = vi.fn()) => {
  const utils = render(
    <TooltipProvider>
      <PriorityActionTable rows={rows} onLog={onLog} />
    </TooltipProvider>,
  );
  return { ...utils, onLog };
};

/** Ward names in render order — the first cell of each body row. */
const wardOrder = () =>
  within(screen.getByRole("table"))
    .getAllByRole("row")
    .slice(1)
    .map((tr) => tr.querySelector("td")?.textContent ?? "");

describe("PriorityActionTable — columns and provenance", () => {
  it("renders the eight spec'd columns and nothing else", () => {
    setup();
    const headers = within(screen.getByRole("table")).getAllByRole("columnheader");
    expect(headers.map((h) => h.textContent?.replace(/[↓↑]/g, "").trim())).toEqual([
      "Ward",
      "Forecast RiskARTPARK",
      "Case TrendARTPARK",
      "Fogging DoneKhushi Baby",
      "Breeding SitesGovernment",
      "Larval Survey CoverageKhushi Baby",
      "Recommended ActionDashboard",
      "Log",
    ]);
  });

  it("shows the ward's parent zone and block beneath its name", () => {
    setup();
    const alphaRow = screen.getByText("Alpha Ward").closest("tr")!;
    expect(within(alphaRow).getByText("Mysuru · Nanjangud")).toBeInTheDocument();
    const betaRow = screen.getByText("Beta Ward").closest("tr")!;
    expect(within(betaRow).getByText("Ballari · Siruguppa")).toBeInTheDocument();
  });

  it("renders each data cell in the spec'd format", () => {
    setup();
    // Scoped to one row: "Low" is both a coverage level and a risk label, and
    // several wards share a parent zone.
    const alphaRow = within(screen.getByText("Alpha Ward").closest("tr")!);
    expect(alphaRow.getByText("Critical")).toBeInTheDocument();
    expect(alphaRow.getByText("Rising")).toBeInTheDocument();
    expect(alphaRow.getByText("Overdue · 34d")).toBeInTheDocument();
    expect(alphaRow.getByText("4 major")).toBeInTheDocument();
    expect(alphaRow.getByText("2 minor", { exact: false })).toBeInTheDocument();
    expect(alphaRow.getByText("Low")).toBeInTheDocument();
    expect(alphaRow.getByText("Schedule cold fogging within 48hrs")).toBeInTheDocument();
  });
});

describe("formatFogging", () => {
  it("shows status and days for a real measurement", () => {
    expect(formatFogging(WORST)).toBe("Overdue · 34d");
    expect(formatFogging(MIDDLE)).toBe("Due · 15d");
  });

  it("suppresses the 999-day sentinel rather than printing it as an age", () => {
    expect(formatFogging(CALM)).toBe("No record");
    expect(formatFogging(row("X", { foggingStatus: "no_record", daysSinceLastFogging: 999 }))).toBe("No record");
  });
});

describe("PriorityActionTable — sorting", () => {
  it("defaults to composite priority, worst combination first", () => {
    setup();
    expect(wardOrder().map((t) => t.slice(0, 5))).toEqual(["Alpha", "Beta ", "Gamma"]);
  });

  it("sorts by a column when its header is clicked, and flips on the second click", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Sort by Ward" }));
    expect(wardOrder().map((t) => t.slice(0, 5))).toEqual(["Gamma", "Beta ", "Alpha"]); // desc
    fireEvent.click(screen.getByRole("button", { name: "Sort by Ward" }));
    expect(wardOrder().map((t) => t.slice(0, 5))).toEqual(["Alpha", "Beta ", "Gamma"]); // asc
  });

  it("names the active sort column and offers a reset to priority", () => {
    setup();
    expect(screen.getByText(/sorted by priority/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Sort by Fogging Done" }));
    expect(screen.getByText(/sorted by Fogging Done/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "reset to priority" }));
    expect(screen.getByText(/sorted by priority/)).toBeInTheDocument();
  });
});

describe("PriorityActionTable — search", () => {
  it("narrows on ward, parent zone or block, case-insensitively", () => {
    setup();
    const box = screen.getByLabelText("Search wards");
    fireEvent.change(box, { target: { value: "ballari" } });
    expect(wardOrder()).toHaveLength(1);
    expect(screen.getByText("Beta Ward")).toBeInTheDocument();

    fireEvent.change(box, { target: { value: "siruguppa" } });
    expect(wardOrder()).toHaveLength(1);

    fireEvent.change(box, { target: { value: "alpha" } });
    expect(screen.getByText("Alpha Ward")).toBeInTheDocument();
    expect(screen.queryByText("Beta Ward")).not.toBeInTheDocument();
  });

  it("says so when nothing matches", () => {
    setup();
    fireEvent.change(screen.getByLabelText("Search wards"), { target: { value: "nonexistent" } });
    expect(screen.getByText("No wards match these filters.")).toBeInTheDocument();
  });
});

describe("PriorityActionTable — filters", () => {
  it("keeps the filter row collapsed until asked", () => {
    setup();
    expect(screen.queryByRole("button", { name: "Rising" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Filters/ }));
    expect(screen.getByRole("button", { name: "Rising" })).toBeInTheDocument();
  });

  it("multi-selects within a group and counts active groups on the toggle", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /Filters/ }));
    fireEvent.click(screen.getByRole("button", { name: "Rising" }));
    expect(screen.getByRole("button", { name: /Filters \(1\)/ })).toBeInTheDocument();
    expect(wardOrder()).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Steady" }));
    expect(screen.getByRole("button", { name: /Filters \(1\)/ })).toBeInTheDocument(); // same group
    expect(wardOrder()).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: "3+ major" }));
    expect(screen.getByRole("button", { name: /Filters \(2\)/ })).toBeInTheDocument(); // second group
    expect(wardOrder()).toHaveLength(1);
  });

  it("labels the risk pills with the state-aware labels the cells use", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /Filters/ }));
    expect(screen.getByRole("button", { name: "Critical" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Very High" })).not.toBeInTheDocument();
  });

  it("filters on a recommended action from the dropdown", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /Filters/ }));
    fireEvent.change(screen.getByLabelText("Recommended Action"), {
      target: { value: "Schedule cold fogging within 48hrs" },
    });
    expect(wardOrder()).toHaveLength(1);
    expect(screen.getByText("Alpha Ward")).toBeInTheDocument();
  });

  it("clears every filter and the search box at once", () => {
    setup();
    fireEvent.change(screen.getByLabelText("Search wards"), { target: { value: "alpha" } });
    fireEvent.click(screen.getByRole("button", { name: /Filters/ }));
    fireEvent.click(screen.getByRole("button", { name: "Rising" }));
    expect(wardOrder()).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(wardOrder()).toHaveLength(3);
    expect(screen.getByLabelText("Search wards")).toHaveValue("");
  });
});

describe("PriorityActionTable — pagination", () => {
  const many = Array.from({ length: 45 }, (_, i) =>
    row(`Ward ${String(i + 1).padStart(2, "0")}`, { majorOpen: 45 - i }),
  );

  it("shows 20 rows per page by default with an honest total", () => {
    setup(many);
    expect(wardOrder()).toHaveLength(20);
    expect(screen.getByText(/Showing/)).toHaveTextContent("Showing 1-20 of 45");
  });

  it("pages forward and back", () => {
    setup(many);
    fireEvent.click(screen.getByLabelText("Next page"));
    expect(screen.getByText(/Showing/)).toHaveTextContent("Showing 21-40 of 45");
    fireEvent.click(screen.getByLabelText("Next page"));
    expect(screen.getByText(/Showing/)).toHaveTextContent("Showing 41-45 of 45");
    expect(wardOrder()).toHaveLength(5);
    fireEvent.click(screen.getByLabelText("Previous page"));
    expect(screen.getByText(/Showing/)).toHaveTextContent("Showing 21-40 of 45");
  });

  it("changes rows per page", () => {
    setup(many);
    fireEvent.change(screen.getByLabelText("Rows per page"), { target: { value: "50" } });
    expect(wardOrder()).toHaveLength(45);
    expect(screen.getByText(/Showing/)).toHaveTextContent("Showing 1-45 of 45");
  });

  it("returns to page 1 when a search shrinks the set below the current page", () => {
    setup(many);
    fireEvent.click(screen.getByLabelText("Next page"));
    fireEvent.change(screen.getByLabelText("Search wards"), { target: { value: "Ward 01" } });
    expect(wardOrder()).toHaveLength(1);
    expect(screen.getByText("Ward 01")).toBeInTheDocument();
  });

  it("adapts the total to the active filter", () => {
    setup(many);
    fireEvent.change(screen.getByLabelText("Search wards"), { target: { value: "Ward 1" } });
    // Names are zero-padded, so "Ward 1" matches Ward 10-19 only — not Ward 01.
    expect(screen.getByText(/Showing/)).toHaveTextContent("Showing 1-10 of 10");
  });
});

describe("PriorityActionTable — Log button", () => {
  it("is the only interactive element on a row, and passes the whole row up", () => {
    const { onLog } = setup();
    const alphaRow = screen.getByText("Alpha Ward").closest("tr")!;
    const buttons = within(alphaRow).getAllByRole("button");
    expect(buttons.map((b) => b.textContent)).toEqual(["Log Response"]);

    fireEvent.click(buttons[0]);
    expect(onLog).toHaveBeenCalledTimes(1);
    expect(onLog).toHaveBeenCalledWith(WORST);
  });

  it("stays enabled for every ward — no drill-down requirement", () => {
    setup();
    for (const b of screen.getAllByRole("button", { name: "Log Response" })) {
      expect(b).toBeEnabled();
    }
    expect(screen.getAllByRole("button", { name: "Log Response" })).toHaveLength(3);
  });

  it("does not make the row itself clickable — R5 owns the side panel", () => {
    setup();
    const alphaRow = screen.getByText("Alpha Ward").closest("tr")!;
    expect(alphaRow).not.toHaveAttribute("onclick");
    expect(alphaRow.className).not.toMatch(/cursor-pointer/);
  });
});

describe("PriorityActionTable — empty and loading", () => {
  it("distinguishes an empty state from a filtered-to-nothing one", () => {
    const { rerender } = setup([]);
    expect(screen.getByText("No wards in this state.")).toBeInTheDocument();

    rerender(
      <TooltipProvider>
        <PriorityActionTable rows={[]} onLog={vi.fn()} loading />
      </TooltipProvider>,
    );
    expect(screen.getByText("Resolving ward data…")).toBeInTheDocument();
  });

  it("surfaces a resolver error without blanking the table", () => {
    render(
      <TooltipProvider>
        <PriorityActionTable rows={ROWS} onLog={vi.fn()} error="boom" />
      </TooltipProvider>,
    );
    expect(screen.getByText(/operational data unavailable/)).toBeInTheDocument();
    expect(wardOrder()).toHaveLength(3);
  });
});
