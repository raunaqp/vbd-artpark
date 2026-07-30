import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AreaBreakdownModal from "./AreaBreakdownModal";

// RegionTable reads FilterContext, StateContext and the (large) mock dataset.
// None of that is what this file is testing — the props it receives are.
const tableProps = vi.fn();
vi.mock("./RegionTable", () => ({
  default: (props: Record<string, unknown>) => {
    tableProps(props);
    return <div data-testid="region-table" />;
  },
}));

beforeEach(() => tableProps.mockClear());

const open = (kpi: string = "Confirmed") =>
  render(<AreaBreakdownModal open onOpenChange={() => {}} kpiName={kpi} />);

const lastProps = () => tableProps.mock.calls.at(-1)![0];

describe("AreaBreakdownModal — rendering", () => {
  it("renders nothing when no KPI has been clicked", () => {
    const { container } = render(<AreaBreakdownModal open={false} onOpenChange={() => {}} kpiName={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("titles itself after the clicked KPI and the current window", () => {
    open("Confirmed");
    expect(screen.getByText("Areas contributing — Confirmed cases, last 4 weeks")).toBeInTheDocument();
  });

  it("explains the ranking, which the columns do not make obvious", () => {
    open("Tested");
    expect(screen.getByText("Ranked by confirmed cases in the window.")).toBeInTheDocument();
  });
});

describe("AreaBreakdownModal — window picker", () => {
  it("offers all four windows", () => {
    open();
    for (const w of [2, 4, 8, 12]) {
      expect(screen.getByRole("button", { name: `${w}W` })).toBeInTheDocument();
    }
  });

  it("opens on 4W", () => {
    open();
    expect(screen.getByRole("button", { name: "4W" })).toHaveAttribute("aria-pressed", "true");
    expect(lastProps().windowWeeks).toBe(4);
  });

  it("re-runs the query when the window changes", () => {
    open();
    fireEvent.click(screen.getByRole("button", { name: "12W" }));
    expect(lastProps().windowWeeks).toBe(12);
  });

  it("moves the pressed state with the selection", () => {
    open();
    fireEvent.click(screen.getByRole("button", { name: "2W" }));
    expect(screen.getByRole("button", { name: "2W" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "4W" })).toHaveAttribute("aria-pressed", "false");
  });

  it("retitles itself as the window changes", () => {
    open("Confirmed");
    fireEvent.click(screen.getByRole("button", { name: "8W" }));
    expect(screen.getByText("Areas contributing — Confirmed cases, last 8 weeks")).toBeInTheDocument();
  });

  it("reopens at 4W rather than carrying the last pick over", () => {
    const { rerender } = render(<AreaBreakdownModal open onOpenChange={() => {}} kpiName="Confirmed" />);
    fireEvent.click(screen.getByRole("button", { name: "12W" }));
    rerender(<AreaBreakdownModal open={false} onOpenChange={() => {}} kpiName="Confirmed" />);
    rerender(<AreaBreakdownModal open onOpenChange={() => {}} kpiName="Confirmed" />);
    expect(lastProps().windowWeeks).toBe(4);
  });
});

describe("AreaBreakdownModal — risk scoping", () => {
  it("restricts the High Risk Areas breakdown to high-risk areas", () => {
    open("High Risk Areas");
    expect(lastProps().onlyHighRisk).toBe(true);
  });

  it("leaves the case-count breakdowns unscoped", () => {
    for (const kpi of ["Suspected", "Tested", "Confirmed"]) {
      tableProps.mockClear();
      open(kpi);
      expect(lastProps().onlyHighRisk).toBe(false);
    }
  });
});

describe("AreaBreakdownModal — embedding contract", () => {
  it("renders the table without its own card chrome and heading", () => {
    // The modal supplies the title; a second one inside would duplicate it.
    open();
    expect(lastProps().embedded).toBe(true);
  });

  it("hands the table the empty-state copy", () => {
    open();
    expect(lastProps().emptyMessage).toBe("No areas with cases in this window.");
  });
});

describe("AreaBreakdownModal — closing", () => {
  it("closes on Escape", () => {
    const onOpenChange = vi.fn();
    render(<AreaBreakdownModal open onOpenChange={onOpenChange} kpiName="Confirmed" />);
    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape", code: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("offers an explicit close control", () => {
    open();
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });
});
