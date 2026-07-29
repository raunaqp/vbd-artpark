// Priority Action Table rows (R4.4.1) — one row per ward, four data streams
// joined, one composite urgency score.
//
// This is the Response tab's primary action surface. It answers the loop the
// design doc describes (docs/design/PREDICTION_VS_OPERATIONS.md): the forecast
// said this ward was at risk — did fogging happen, are breeding sites open, did
// surveys cover it, and what should the officer do about it.
//
// Two things this module deliberately owns:
//
//  1. **One resolve, two scopes.** The table enumerates every ward in the state
//     regardless of drill state; the summary tiles and the map follow the
//     district/block filters. Rather than resolve the R3 datasets twice, the
//     unfiltered set is built once and `scopeRows` narrows it synchronously —
//     every row already carries its district/block/ward.
//
//  2. **Score is precomputed, not derived at render.** Sorting 481 wards is
//     cheap; resolving them is not (`getWardRecommendation` runs a linear scan
//     of the larval dataset per ward). Measured at ~40 ms for Odisha's 481
//     wards, so it belongs in the async pass, once, alongside the rest.
//
// Row grain is always ward — never district or block. Rows are not clickable in
// R4.4; the side panel is R5.

import {
  getDistrictMetric,
  getForecastForGeography,
  labelForLevel,
  type HForecastLevel,
} from "@/data/canonical";
import { larvalWardKey } from "@/data/mock_larval_surveys";
import type { DashboardFiltersLike } from "@/data/mockData";
import { getWardRecommendation, type WardRecommendation } from "@/data/recommendations";
import type { FoggingStatus } from "@/data/r3/loader";
import { computeCaseRise } from "./effectiveness";
import { enumerateWards } from "./effectiveness";
import {
  buildOperationalWardMap,
  type CoverageLevel,
  type OperationalWardMap,
  type OperationalWardState,
} from "./operationalWards";

/**
 * Case-trend window, in weeks.
 *
 * Matched to the forecast horizon so the Case Trend column and the Forecast
 * Risk column next to it describe the same four weeks. The deleted
 * Effectiveness panel let the user pick 2/4/8/12; the table fixes it.
 */
export const TREND_WINDOW_WEEKS = 4;

/**
 * Raw 4-tier forecast level, plus an explicit bucket for wards with no forecast
 * and no district fallback.
 *
 * Deliberately *not* the 3-tier legacy risk: `levelToLegacy` folds `very_high`
 * into `high`, which would hide the top tier from the officer. The map still
 * paints on the 3-tier palette, so a `very_high` ward's pill and its polygon
 * can disagree — tracked in known_debt.md.
 */
export type RiskTier = HForecastLevel | "no_data";

/** Case direction over TREND_WINDOW_WEEKS. `none` = no cases in either window. */
export type TrendTier = "rising" | "steady" | "falling" | "none";

/** Fogging state, with `null` folded into `no_record` for scoring purposes. */
export type FoggingTier = FoggingStatus["fogging_status"];

export interface PriorityRow {
  /** App ward key (`state|district|block|ward`) — also the React row key. */
  wardKey: string;
  district: string;
  block: string;
  ward: string;

  /** Column 2 — ARTPARK model. */
  risk: RiskTier;
  /** State-aware display label ("Critical" / "Very High" / "High" / …). */
  riskLabel: string;

  /** Column 3 — ARTPARK case surveillance. */
  trend: TrendTier;
  windowCases: number;
  priorCases: number;

  /** Column 4 — Khushi Baby. `null` fogging status means no record at all. */
  foggingStatus: FoggingTier | null;
  daysSinceLastFogging: number | null;

  /** Column 5 — Government data. */
  majorOpen: number;
  minorOpen: number;

  /** Column 6 — Khushi Baby. */
  coverage: CoverageLevel;

  /** Column 7 — dashboard engine. Null only if the ward key is malformed. */
  recommendation: WardRecommendation | null;

  /** Composite urgency, 0–225. Higher is worse. */
  score: number;
}

// ──────────────── Composite priority score ────────────────
//
// Five independent signals, summed. A ward carrying every worst signal scores
// 225; a ward with everything clear scores 0. The weights put forecast risk
// first (it is the only forward-looking signal), then overdue fogging, then the
// observed field gaps.
//
// `no_record` fogging scores *above* `due` and below `overdue`: a ward nobody
// has ever fogged is a worse operational state than one that is merely due, but
// we can't claim it is overdue without a cadence to measure against.

const RISK_SCORE: Record<RiskTier, number> = {
  very_high: 100,
  high: 75,
  moderate: 40,
  low: 10,
  no_data: 0,
};

const TREND_SCORE: Record<TrendTier, number> = {
  rising: 30,
  steady: 10,
  falling: 0,
  none: 0,
};

const FOGGING_SCORE: Record<FoggingTier, number> = {
  overdue: 40,
  no_record: 30,
  due: 20,
  recent: 0,
};

const COVERAGE_SCORE: Record<CoverageLevel, number> = {
  low: 25,
  no_data: 20,
  medium: 10,
  high: 0,
};

/** Highest score any ward can reach — every signal at its worst. */
export const MAX_PRIORITY_SCORE = 225;

/** The fields the score reads. Kept narrow so it is testable without a resolve. */
export type PriorityScoreInput = Pick<
  PriorityRow,
  "risk" | "trend" | "foggingStatus" | "majorOpen" | "coverage"
>;

/** Breeding contribution — three or more open major sites is the urgent band. */
function breedingScore(majorOpen: number): number {
  if (majorOpen >= 3) return 30;
  if (majorOpen >= 1) return 15;
  return 0;
}

/**
 * Composite urgency for one ward, 0–`MAX_PRIORITY_SCORE`. Higher is worse.
 *
 * Pure and synchronous — the table's default sort, and the only thing the
 * sort comparator reads.
 */
export function getPriorityScore(row: PriorityScoreInput): number {
  return (
    RISK_SCORE[row.risk] +
    TREND_SCORE[row.trend] +
    FOGGING_SCORE[row.foggingStatus ?? "no_record"] +
    breedingScore(row.majorOpen) +
    COVERAGE_SCORE[row.coverage]
  );
}

// ──────────────── Per-column derivation ────────────────

/**
 * The ward's forecast tier, at full 4-tier resolution.
 *
 * Falls back the same way `getAppWardRisk` does — ward forecast, then the
 * district's legacy risk — so the table can never disagree with the
 * recommendation engine about *which* tier a ward is in, only about how finely
 * the top of the scale is labelled. `no_data` fires only when the ward has no
 * forecast and its district has no metrics at all.
 */
export function resolveRiskTier(
  stateLabel: string,
  district: string,
  block: string,
  ward: string,
): RiskTier {
  const forecast = getForecastForGeography(district, block, ward);
  if (forecast?.level) return forecast.level;
  return getDistrictMetric(stateLabel, district)?.legacyRisk ?? "no_data";
}

/** `computeCaseRise` trend vocabulary → the table's column-3 vocabulary. */
export function toTrendTier(trend: "up" | "down" | "stable" | "none"): TrendTier {
  if (trend === "up") return "rising";
  if (trend === "down") return "falling";
  if (trend === "stable") return "steady";
  return "none";
}

// ──────────────── Resolver ────────────────

/** Every-ward scope — the sentinel values `enumerateWards` treats as "no filter". */
const UNFILTERED: DashboardFiltersLike = {
  district: "All Districts",
  block: "All Blocks",
  ward: "All Wards",
  areaType: "all",
  fromDate: "",
  toDate: "",
} as DashboardFiltersLike;

/** Score descending, then ward name — so equal-score rows keep a stable order. */
export function comparePriorityRows(a: PriorityRow, b: PriorityRow): number {
  if (a.score !== b.score) return b.score - a.score;
  return a.ward.localeCompare(b.ward);
}

/**
 * Resolve a Priority Action Table row for every ward in the state.
 *
 * Ignores drill filters by design — the table always shows the whole state and
 * narrows via its own search and column filters instead. Callers that need the
 * filtered scope (tiles, map) pass the result through `scopeRows`.
 *
 * Returns rows pre-sorted worst-first.
 */
export async function buildPriorityRows(
  stateLabel: string,
  epiWeek: string,
): Promise<PriorityRow[]> {
  const wards = enumerateWards(stateLabel, UNFILTERED);

  // Reuses R4.1's resolver for fogging / breeding / coverage rather than
  // re-reading the three datasets here, so the table and the map overlays can
  // never disagree about a ward's operational state.
  const operational = await buildOperationalWardMap(stateLabel, UNFILTERED, epiWeek);

  const rows = await Promise.all(
    wards.map(async (w) => {
      const wardKey = larvalWardKey(stateLabel, w.district, w.block, w.ward);
      const op = operational.get(wardKey);
      const rise = computeCaseRise(w.weekly, TREND_WINDOW_WEEKS);
      const risk = resolveRiskTier(stateLabel, w.district, w.block, w.ward);
      const recommendation = await getWardRecommendation(wardKey);

      const row: Omit<PriorityRow, "score"> = {
        wardKey,
        district: w.district,
        block: w.block,
        ward: w.ward,
        risk,
        riskLabel: risk === "no_data" ? "No Data" : labelForLevel(stateLabel, risk),
        trend: toTrendTier(rise.trend),
        windowCases: rise.windowCases,
        priorCases: rise.priorCases,
        foggingStatus: op?.foggingStatus ?? null,
        daysSinceLastFogging: op?.daysSinceLastFogging ?? null,
        majorOpen: op?.majorOpen ?? 0,
        minorOpen: op?.minorOpen ?? 0,
        coverage: op?.coverage ?? "no_data",
        recommendation,
      };

      return { ...row, score: getPriorityScore(row) };
    }),
  );

  return rows.sort(comparePriorityRows);
}

// ──────────────── Derived scopes (one resolve, two consumers) ────────────────

/**
 * Narrow the state-wide rows to the active district / block / ward filters.
 *
 * Synchronous: every row already carries its geography, so the summary tiles
 * and the map can follow the filter bar without a second async resolve.
 */
export function scopeRows(rows: PriorityRow[], filters: DashboardFiltersLike): PriorityRow[] {
  const { district, block, ward } = filters;
  const all = (v: string, sentinel: string) => !v || v === sentinel;
  if (all(district, "All Districts") && all(block, "All Blocks") && all(ward, "All Wards")) {
    return rows;
  }
  return rows.filter(
    (r) =>
      (all(district, "All Districts") || r.district === district) &&
      (all(block, "All Blocks") || r.block === block) &&
      (all(ward, "All Wards") || r.ward === ward),
  );
}

/**
 * Project rows back onto the shape the map overlays and the R4.1 tile counters
 * read, so `DashboardMap` keeps its existing prop contract.
 */
export function toOperationalWardMap(rows: PriorityRow[]): OperationalWardMap {
  const map = new Map<string, OperationalWardState>();
  for (const r of rows) {
    map.set(r.wardKey, {
      wardKey: r.wardKey,
      district: r.district,
      block: r.block,
      ward: r.ward,
      foggingStatus: r.foggingStatus,
      daysSinceLastFogging: r.daysSinceLastFogging,
      majorOpen: r.majorOpen,
      minorOpen: r.minorOpen,
      coverage: r.coverage,
    });
  }
  return map;
}
