// Ward enumeration + case-rise derivation.
//
// Originally the Response Effectiveness panel's data layer (Session C). R4.4
// deleted that panel and its three tables; what survives is the part the
// Priority Action Table and the operational ward resolver both build on —
// enumerating the wards under a scope, and reading a case trend off one.
//
// Reads canonical weekly[] arrays — Session B case overlay does not affect
// these trend counts. This matches existing hotspot behavior.
import { getDistrictMetrics } from "@/data/canonical";
import type { DashboardFiltersLike } from "@/data/mockData";

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
