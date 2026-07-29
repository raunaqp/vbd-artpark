// Operational overlay resolvers (R4.2) — the single place that decides how a
// ward's operational state becomes a colour, a tooltip and a legend.
//
// Extracted rather than inlined because the same decision is needed at three
// render sites in DashboardMap (ward polygons, district polygons, centroid dots)
// plus two tooltips and the legend. Nine `if (mode === "operational")` branches
// inside a 1,000-line component is how that component stops being editable.
//
// Colours come from the map's existing `riskColor` vocabulary rather than fresh
// hex, so "red" means the same urgency on the operational overlays as it does on
// the forecast one.

import type { PathOptions } from "leaflet";
import type { OperationalWardMap } from "@/features/weeklyResponse/operationalWards";

export type OverlayId = "forecast_risk" | "fogging" | "breeding" | "coverage";

export const OVERLAY_LABELS: Record<OverlayId, string> = {
  forecast_risk: "Forecast Risk",
  fogging: "Fogging Status",
  breeding: "Breeding Sites",
  coverage: "Larval Survey Coverage",
};

export const OVERLAY_IDS: OverlayId[] = ["forecast_risk", "fogging", "breeding", "coverage"];

/** True for the three overlays that need ward-level R3 data to mean anything. */
export const isOperationalOverlay = (o: OverlayId): boolean => o !== "forecast_risk";

// ──────────────── Palette ────────────────
// Same three semantic colours the forecast choropleth uses, so the visual
// language is consistent across overlays.
const GREEN = "#22c55e"; // riskColor.low
const AMBER = "#eab308"; // riskColor.moderate
const RED = "#ef4444"; // riskColor.high

// Two distinct greys, deliberately:
//   NO_RECORD — the ward exists but has no data for this overlay.
//   (DashboardMap's own NO_DATA_COLOR, #cbd5e1, means something different: the
//    polygon has no mock counterpart at all. Keeping them apart stops "never
//    fogged" from reading as "not part of the dataset".)
const NO_RECORD = "#94a3b8";

/** Neutral fill for district polygons while an operational overlay is active. */
export const OPERATIONAL_DIMMED = "#e2e8f0";

// ──────────────── Fill ────────────────

/**
 * Fill colour for one ward under one overlay.
 *
 * Returns NO_RECORD when the ward is absent from the map — which happens while
 * R3 is still loading, and for polygons the positional join left unpaired.
 */
export function resolveOperationalFill(
  wardKey: string | null,
  overlay: OverlayId,
  wards: OperationalWardMap,
): string {
  if (!wardKey) return NO_RECORD;
  const w = wards.get(wardKey);
  if (!w) return NO_RECORD;

  switch (overlay) {
    case "fogging":
      return w.foggingStatus === "recent" ? GREEN
        : w.foggingStatus === "due" ? AMBER
        : w.foggingStatus === "overdue" ? RED
        : NO_RECORD;

    case "breeding":
      // Thresholds mirror the recommendation rules: 3+ major sites open is what
      // triggers "Deploy source reduction team".
      return w.majorOpen === 0 ? GREEN : w.majorOpen <= 2 ? AMBER : RED;

    case "coverage":
      return w.coverage === "high" ? GREEN
        : w.coverage === "medium" ? AMBER
        : w.coverage === "low" ? RED
        : NO_RECORD;

    default:
      return NO_RECORD;
  }
}

/** Merge an overlay fill onto a caller-supplied base style. */
export function resolveOperationalStyle(
  wardKey: string | null,
  overlay: OverlayId,
  wards: OperationalWardMap,
  base: PathOptions,
  fillOpacity = 0.75,
): PathOptions {
  return { ...base, fillColor: resolveOperationalFill(wardKey, overlay, wards), fillOpacity };
}

// ──────────────── Tooltip ────────────────

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * The overlay-specific line of a ward tooltip. Returns "" for forecast_risk,
 * which keeps its existing tooltip, and for wards with no resolved state.
 */
export function resolveOperationalTooltip(
  wardKey: string | null,
  overlay: OverlayId,
  wards: OperationalWardMap,
): string {
  if (!wardKey || overlay === "forecast_risk") return "";
  const w = wards.get(wardKey);
  if (!w) return `<div style="margin-top:3px;opacity:0.7">No operational data</div>`;

  switch (overlay) {
    case "fogging": {
      if (!w.foggingStatus || w.foggingStatus === "no_record") {
        return `<div style="margin-top:3px">Fogging: <strong>no record</strong></div>`;
      }
      const days = w.daysSinceLastFogging;
      const since = days !== null ? ` (${days} ${days === 1 ? "day" : "days"} since last)` : "";
      return `<div style="margin-top:3px">Fogging: <strong>${w.foggingStatus}</strong>${since}</div>`;
    }
    case "breeding":
      return `<div style="margin-top:3px">Major sites open: <strong>${w.majorOpen}</strong></div>` +
        `<div style="opacity:0.8">Minor sites open: ${w.minorOpen}</div>`;
    case "coverage":
      return `<div style="margin-top:3px">Survey coverage: <strong>${
        w.coverage === "no_data" ? "no survey" : titleCase(w.coverage)
      }</strong></div>`;
    default:
      return "";
  }
}

// ──────────────── Legend ────────────────

export interface LegendEntry {
  color: string;
  label: string;
}

export interface OverlayLegend {
  title: string;
  entries: LegendEntry[];
}

export function resolveOperationalLegend(overlay: OverlayId): OverlayLegend {
  switch (overlay) {
    case "fogging":
      return {
        title: "Fogging status",
        entries: [
          { color: GREEN, label: "recent" },
          { color: AMBER, label: "due" },
          { color: RED, label: "overdue" },
          { color: NO_RECORD, label: "no record" },
        ],
      };
    case "breeding":
      return {
        title: "Major breeding sites open",
        entries: [
          { color: GREEN, label: "0" },
          { color: AMBER, label: "1–2" },
          { color: RED, label: "3+" },
          { color: NO_RECORD, label: "no data" },
        ],
      };
    case "coverage":
      return {
        title: "Larval survey coverage",
        entries: [
          { color: GREEN, label: "high" },
          { color: AMBER, label: "medium" },
          { color: RED, label: "low" },
          { color: NO_RECORD, label: "no survey" },
        ],
      };
    default:
      return {
        title: "Forecast risk",
        entries: [
          { color: GREEN, label: "low" },
          { color: AMBER, label: "moderate" },
          { color: RED, label: "high" },
          { color: "#cbd5e1", label: "no data" },
        ],
      };
  }
}
