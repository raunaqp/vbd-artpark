// Pure classification helpers. NO React, NO mockData imports.
import {
  TREND_THRESHOLDS,
  NEW_EMERGENCE,
  RISING_CLUSTER,
  HOTSPOT,
} from "./definitions";

export type Trend = "Rising" | "Falling" | "Stable" | "NewEmergence" | "Insufficient";
export type WHOClass = "Low" | "Moderate" | "High" | "Very High";
export type ICMRStratum = "A1" | "A2" | "A3" | "A4";
export type ICMRClass = "Critical" | "High Risk" | "Caution" | "Low";
export type HotspotClass = "None" | "Stable" | "Moderate" | "High";

/** Compute trend from a weekly case series. Last 8 weeks expected. */
export function computeTrend(weeklyLast8: number[]): Trend {
  if (weeklyLast8.length < 4) return "Insufficient";
  const recent = weeklyLast8.slice(-2);
  const prior = weeklyLast8.slice(-4, -2);
  const totalRecent4 = weeklyLast8.slice(-4).reduce((a, b) => a + b, 0);

  if (totalRecent4 < TREND_THRESHOLDS.MIN_CASES_FLOOR) return "Insufficient";

  const recentMean = recent.reduce((a, b) => a + b, 0) / 2;
  const priorMean = prior.reduce((a, b) => a + b, 0) / 2;

  if (priorMean === 0 && recentMean >= NEW_EMERGENCE.RECENT_MIN_TOTAL / 2) {
    return "NewEmergence";
  }
  if (priorMean === 0) return "Insufficient";

  const ratio = recentMean / priorMean;
  if (ratio >= TREND_THRESHOLDS.RISING_RATIO) return "Rising";
  if (ratio <= TREND_THRESHOLDS.FALLING_RATIO) return "Falling";
  return "Stable";
}

/** Map our richer Trend type to the legacy three-state trend used by tables. */
export function trendToLegacy(t: Trend): "up" | "down" | "stable" {
  if (t === "Rising" || t === "NewEmergence") return "up";
  if (t === "Falling") return "down";
  return "stable";
}

/** Human label for badges. */
export function trendLabel(t: Trend): string {
  switch (t) {
    case "Rising": return "Rising";
    case "Falling": return "Falling";
    case "NewEmergence": return "New Emergence";
    case "Stable": return "Stable";
    default: return "Insufficient";
  }
}

/** WHO method — used for Karnataka, Odisha forecast risk class. */
export function computeWHOClass(predicted: number, mu: number, sigma: number): WHOClass | "NoData" {
  if (mu === 0 && sigma === 0) return "NoData";
  if (predicted <= mu) return "Low";
  if (predicted <= mu + sigma) return "Moderate";
  if (predicted <= mu + 2 * sigma) return "High";
  return "Very High";
}

/** ICMR method — used for AP forecast risk class AND for High Risk Areas in all states. */
export function computeICMRStrata(allValues: number[]): Record<number, ICMRStratum> {
  const distinctSorted = [...new Set(allValues)].sort((a, b) => b - a);
  const valuesPerStratum = Math.max(1, Math.ceil(distinctSorted.length / 4));

  const stratumMap: Record<number, ICMRStratum> = {};
  distinctSorted.forEach((val, idx) => {
    if (idx < valuesPerStratum) stratumMap[val] = "A1";
    else if (idx < 2 * valuesPerStratum) stratumMap[val] = "A2";
    else if (idx < 3 * valuesPerStratum) stratumMap[val] = "A3";
    else stratumMap[val] = "A4";
  });
  return stratumMap;
}

export function icmrStratumToLabel(s: ICMRStratum): ICMRClass {
  return ({ A1: "Critical", A2: "High Risk", A3: "Caution", A4: "Low" } as const)[s];
}

/** WHO/ICMR class → risk colour level (1=low/green, 4=critical/red). */
export function classToRiskLevel(label: WHOClass | ICMRClass | "NoData"): 1 | 2 | 3 | 4 | 0 {
  switch (label) {
    case "Low": return 1;
    case "Moderate": case "Caution": return 2;
    case "High": case "High Risk": return 3;
    case "Very High": case "Critical": return 4;
    default: return 0;
  }
}

/** Map a risk level (1..4) to our legacy `risk` enum. */
export function levelToLegacyRisk(level: 0 | 1 | 2 | 3 | 4): "low" | "moderate" | "high" {
  if (level >= 3) return "high";
  if (level === 2) return "moderate";
  return "low";
}

/** High Risk Area — consistent across all states. Returns true if geo qualifies. */
export function isHighRiskArea(stratum: ICMRStratum, trend: Trend): boolean {
  return (stratum === "A1" || stratum === "A2") && trend === "Rising";
}

/** New emergence test against an 8-week series. */
export function isNewEmergence(weeklyLast8: number[]): boolean {
  if (weeklyLast8.length < 6) return false;
  const prior4 = weeklyLast8.slice(-6, -2);
  const recent2 = weeklyLast8.slice(-2);
  const priorMaxPerWeek = Math.max(...prior4);
  const recentTotal = recent2.reduce((a, b) => a + b, 0);
  return priorMaxPerWeek <= NEW_EMERGENCE.PRIOR_MAX_PER_WEEK && recentTotal >= NEW_EMERGENCE.RECENT_MIN_TOTAL;
}

/** Rising cluster — population-normalised. */
export function isRisingCluster(
  casesRecent4w: number,
  casesPrior4w: number,
  population: number,
): { isCluster: boolean; changePct: number } {
  const safePop = Math.max(1, population);
  const rateNow = (casesRecent4w / safePop) * RISING_CLUSTER.POP_NORMALIZATION;
  const ratePrior = (casesPrior4w / safePop) * RISING_CLUSTER.POP_NORMALIZATION;
  const changePct = ratePrior === 0 ? (rateNow > 0 ? 999 : 0) : ((rateNow - ratePrior) / ratePrior) * 100;
  return {
    isCluster:
      changePct >= RISING_CLUSTER.CHANGE_PCT_THRESHOLD &&
      casesRecent4w >= RISING_CLUSTER.MIN_ABSOLUTE_FLOOR,
    changePct: Math.round(changePct),
  };
}

/** Hotspot — persistence-based across last N weeks. */
export function computeHotspotClass(weeklyLast8: number[], window: "2W" | "4W" = "4W"): HotspotClass {
  const series = window === "4W" ? weeklyLast8.slice(-4) : weeklyLast8.slice(-2);
  const total = series.reduce((a, b) => a + b, 0);
  if (total === 0) return "None";

  if (window === "2W") {
    if (series.every((v) => v >= 5)) return "High";
    if (total >= 3) return "Moderate";
    return "Stable";
  }
  let maxConsec = 0, cur = 0;
  for (const v of series) {
    if (v >= HOTSPOT.WEEKLY_FLOOR) { cur++; maxConsec = Math.max(maxConsec, cur); }
    else cur = 0;
  }
  if (maxConsec >= HOTSPOT.HIGH_CONSEC_WEEKS) return "High";
  if (maxConsec >= HOTSPOT.MODERATE_CONSEC_WEEKS) return "Moderate";
  return "Stable";
}

export function hotspotClassToLegacyRisk(c: HotspotClass): "low" | "moderate" | "high" {
  if (c === "High") return "high";
  if (c === "Moderate") return "moderate";
  return "low";
}
