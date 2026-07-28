// Response Effectiveness derivation — joins case rise (C.3a) with larval survey
// coverage + logged actions (C.3b) per ward.
//
// Reads canonical weekly[] arrays — Session B case overlay does not affect
// these trend counts. This matches existing hotspot behavior.
import { getDistrictMetrics } from "@/data/canonical";
import type { DashboardFiltersLike } from "@/data/mockData";
import { EPI_WEEKS } from "@/data/mock_dataset";
import { getLarvalSurveyCoverage, larvalWardKey } from "@/data/mock_larval_surveys";
import type { WeeklyResponseRecord } from "./types";

export interface WardRef {
  district: string;
  block: string; // block / municipality / zone
  ward: string;  // ward / village
  weekly: number[];
}

// Enumerate every ward under the active state, respecting district/block/ward filters.
export function enumerateWards(stateLabel: string, filters: DashboardFiltersLike): WardRef[] {
  const metrics = getDistrictMetrics(stateLabel);
  const out: WardRef[] = [];
  for (const dm of metrics) {
    if (filters.district && filters.district !== "All Districts" && dm.name !== filters.district) continue;
    const pushLeaf = (block: string, ward: string, weekly: number[]) => {
      if (filters.block && filters.block !== "All Blocks" && block !== filters.block) return;
      if (filters.ward && filters.ward !== "All Wards" && ward !== filters.ward) return;
      out.push({ district: dm.name, block, ward, weekly });
    };
    dm.district.municipalities.forEach((m) => m.wards.forEach((w) => pushLeaf(m.name, w.name, w.weekly)));
    dm.district.blocks.forEach((b) => b.villages.forEach((v) => pushLeaf(b.name, v.name, v.weekly)));
  }
  return out;
}

export type CaseTrend = "up" | "down" | "stable" | "none";

export interface CaseRise {
  windowCases: number;
  priorCases: number;
  risePct: number | null; // null = no cases either window; Infinity = from-zero rise
  rising: boolean;
  trend: CaseTrend;
  spark: number[];
}

const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

// Case count in the last N weeks vs the prior N weeks.
// Rising = rise ≥ 50% AND window cases ≥ 5.
export function computeCaseRise(weekly: number[], windowWeeks: number): CaseRise {
  const len = weekly.length;
  const n = windowWeeks;
  const windowArr = weekly.slice(Math.max(0, len - n));
  const priorArr = weekly.slice(Math.max(0, len - 2 * n), Math.max(0, len - n));
  const windowCases = sum(windowArr);
  const priorCases = sum(priorArr);

  const risePct = priorCases > 0
    ? ((windowCases - priorCases) / priorCases) * 100
    : windowCases > 0 ? Infinity : null;

  const rising = windowCases >= 5 && (priorCases === 0 ? true : (windowCases - priorCases) / priorCases >= 0.5);

  let trend: CaseTrend;
  if (windowCases === 0 && priorCases === 0) trend = "none";
  else if (rising) trend = "up";
  else if (windowCases < priorCases * 0.8) trend = "down";
  else trend = "stable";

  // Show a little context in the sparkline even for short windows.
  const spark = weekly.slice(Math.max(0, len - Math.max(n, 6)));
  return { windowCases, priorCases, risePct, rising, trend, spark };
}

export const trendLabel = (t: CaseTrend): string =>
  t === "up" ? "Rising" : t === "down" ? "Declining" : t === "stable" ? "Stable" : "No cases";

// ── Larval survey coverage (C.3b) ──
export type Coverage = "high" | "medium" | "low" | "no_data";
const LEVEL_NUM: Record<"high" | "medium" | "low", number> = { high: 3, medium: 2, low: 1 };

// Average the last N weeks of larval survey levels for this ward → bucket.
export function computeCoverage(stateLabel: string, w: WardRef, windowWeeks: number): Coverage {
  const key = larvalWardKey(stateLabel, w.district, w.block, w.ward);
  const weeks = EPI_WEEKS.slice(-windowWeeks);
  const nums: number[] = [];
  for (const wk of weeks) {
    const lvl = getLarvalSurveyCoverage(key, wk);
    if (lvl) nums.push(LEVEL_NUM[lvl]);
  }
  if (!nums.length) return "no_data";
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  return avg >= 2.34 ? "high" : avg >= 1.67 ? "medium" : "low";
}

// Most recent logged action targeting this ward within the window, else null.
export function findWardAction(w: WardRef, records: WeeklyResponseRecord[], windowWeeks: number): WeeklyResponseRecord | null {
  const weeks = new Set(EPI_WEEKS.slice(-windowWeeks));
  let best: WeeklyResponseRecord | null = null;
  for (const r of records) {
    if (!weeks.has(r.epidemiological_week)) continue;
    const wardMatch =
      (r.ward_or_village === w.ward && r.district === w.district) ||
      (r.wards_affected?.includes(w.ward) ?? false);
    if (!wardMatch) continue;
    if (!best || (r.recorded_at ?? "") > (best.recorded_at ?? "")) best = r;
  }
  return best;
}

/** A gap ward: cases rising, survey lagging (low/none), and no action logged. */
export function isActionGap(row: EffRow): boolean {
  return row.rise.rising && (row.coverage === "low" || row.coverage === "no_data") && !row.action;
}

export interface EffRow {
  district: string;
  block: string;
  ward: string;
  rise: CaseRise;
  coverage: Coverage;
  action: WeeklyResponseRecord | null;
}

export function buildEffectivenessRows(
  stateLabel: string,
  filters: DashboardFiltersLike,
  windowWeeks: number,
  records: WeeklyResponseRecord[],
): EffRow[] {
  return enumerateWards(stateLabel, filters).map((w) => ({
    district: w.district,
    block: w.block,
    ward: w.ward,
    rise: computeCaseRise(w.weekly, windowWeeks),
    coverage: computeCoverage(stateLabel, w, windowWeeks),
    action: findWardAction(w, records, windowWeeks),
  }));
}

// Rank low/no-survey as most urgent (0), medium (1), high (2).
const coverageRank = (c: Coverage): number => (c === "low" || c === "no_data" ? 0 : c === "medium" ? 1 : 2);

// Sort: rising first, then low/no survey, then no action → action-gap wards top.
export function sortEffRows(rows: EffRow[]): EffRow[] {
  return [...rows].sort((a, b) => {
    if (a.rise.rising !== b.rise.rising) return a.rise.rising ? -1 : 1;
    const ca = coverageRank(a.coverage), cb = coverageRank(b.coverage);
    if (ca !== cb) return ca - cb;
    const aa = a.action ? 1 : 0, ab = b.action ? 1 : 0;
    if (aa !== ab) return aa - ab;
    return b.rise.windowCases - a.rise.windowCases;
  });
}
