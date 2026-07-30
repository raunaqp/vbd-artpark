import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HowToUsePanel from "./HowToUsePanel";
import { APP_VERSION, BUILD_SHA } from "@/lib/build_info";

describe("HowToUsePanel — sections", () => {
  it("renders every section the guide promises", () => {
    render(<HowToUsePanel />);
    for (const heading of [
      "What PRISM-H is",
      "The tabs",
      "Data sources",
      "How to log a response",
      "Where recommendations come from",
      "Related tools",
      "Version and build",
    ]) {
      expect(screen.getByText(heading)).toBeInTheDocument();
    }
  });

  it("documents every tab in the navigation, including itself", () => {
    render(<HowToUsePanel />);
    for (const tab of [
      "Overview",
      "Case Surveillance",
      "Forecast",
      "Response",
      "Signals",
      "Weather",
      "Hotspots",
      "Data Upload",
      "Admin",
      "How to use",
    ]) {
      expect(screen.getByRole("heading", { name: tab, level: 4 })).toBeInTheDocument();
    }
  });

  it("lists the four deployed states", () => {
    render(<HowToUsePanel />);
    for (const s of ["Karnataka", "Odisha", "Andhra Pradesh", "Greater Bengaluru Authority (GBA)"]) {
      expect(screen.getByText(s)).toBeInTheDocument();
    }
  });

  it("names the four data sources the app attributes fields to", () => {
    render(<HowToUsePanel />);
    for (const s of ["ARTPARK", "Khushi Baby", "Government", "Dashboard"]) {
      expect(screen.getByRole("heading", { name: s, level: 4 })).toBeInTheDocument();
    }
  });
});

describe("HowToUsePanel — claims that must not drift from the code", () => {
  it("does not state a recommendation rule count", () => {
    // The design doc says 10, the config ships 11. A number here would go stale.
    const { container } = render(<HowToUsePanel />);
    expect(container.textContent).toMatch(/protocol-derived rules/);
    expect(container.textContent).not.toMatch(/\b(10|11|ten|eleven) (protocol-derived )?rules\b/i);
  });

  it("describes Admin → Assumptions as read-only, not editable", () => {
    // AssumptionsPanel carries an `editable` flag but wires no input.
    const { container } = render(<HowToUsePanel />);
    expect(container.textContent).toMatch(/visible in\s*Admin → Assumptions/);
    expect(container.textContent).toMatch(/read-only/);
    expect(container.textContent).not.toMatch(/configurable in/i);
  });

  it("keeps recommended and completed response distinct", () => {
    const { container } = render(<HowToUsePanel />);
    expect(container.textContent).toMatch(/not evidence that work happened/);
  });
});

describe("HowToUsePanel — external link", () => {
  it("opens acestor in a new tab with the security attributes set", () => {
    render(<HowToUsePanel />);
    const link = screen.getByRole("link", { name: /acestor\.artpark\.in/ });
    expect(link).toHaveAttribute("href", "https://acestor.artpark.in");
    expect(link).toHaveAttribute("target", "_blank");
    // Without noreferrer the opened page can reach back via window.opener.
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});

describe("HowToUsePanel — build identity", () => {
  it("shows the same version the footer shows", () => {
    render(<HowToUsePanel />);
    expect(screen.getByText(`v${APP_VERSION}`)).toBeInTheDocument();
  });

  it("shows the injected build SHA rather than a placeholder", () => {
    render(<HowToUsePanel />);
    expect(screen.getByText(BUILD_SHA)).toBeInTheDocument();
  });
});
