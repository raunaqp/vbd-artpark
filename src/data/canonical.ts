// Canonical data adapter — derives all per-tab data structures from MOCK_DATASET so
// trend / risk / hotspot labels match across every screen.
//
// The legacy `mockData.ts` keeps its API surface; key functions delegate here.

import {
  MOCK_DATASET,
  WEEK_ENDINGS,
  DISTRICT_POPULATION,
  WHO_BASELINES,
  FORECAST,
  HIERARCHY_FORECAST,
  type DistrictData,
  type ForecastEntry,
} from "./mock_dataset";
import { STATE_RISK_METHOD } from "@/lib/definitions";
import {
  computeTrend,
  computeWHOClass,
  computeICMRStrata,
  icmrStratumToLabel,
  classToRiskLevel,
  levelToLegacyRisk,
  trendToLegacy,
  computeHotspotClass,
  hotspotClassToLegacyRisk,
  isNewEmergence,
  isRisingCluster,
  type Trend,
  type WHOClass,
  type ICMRClass,
  type ICMRStratum,
  type HotspotClass,
} from "@/lib/classify";
import type {
  RegionData,
  HotspotData,
  OutbreakPrediction,
  RiskForecastPoint,
  StateId,
  DashboardFiltersLike,
} from "./mockData_types";

const STATE_LABEL_BY_ID: Record<StateId, string> = {
  andhra_pradesh: "Andhra Pradesh",
  karnataka: "Karnataka",
  odisha: "Odisha",
};

export interface DistrictMetrics {
  name: string;
  state: string;
  district: DistrictData;
  weeklyLast8: number[];
  trend: Trend;
  cases4w: number;
  casesPrior4w: number;
  forecast4w: number[];
  forecastAvg: number;
  outbreakProb: number;
  population: number;
  icmrStratum: ICMRStratum;
  whoClass: WHOClass | "NoData";
  riskLabel: WHOClass | ICMRClass | "NoData";
  riskLevel: 0 | 1 | 2 | 3 | 4;
  legacyRisk: "high" | "moderate" | "low";
}

const districtCache = new Map<string, DistrictMetrics[]>();

function buildDistrictMetricsForState(stateLabel: string): DistrictMetrics[] {
  const entries = Object.entries(MOCK_DATASET).filter(([, d]) => d.state === stateLabel);
  const method = (STATE_RISK_METHOD as Record<string, string>)[stateLabel] ?? "WHO";

  // First pass — build everything except ICMR stratum + final risk label.
  const partial = entries.map(([name, district]) => {
    const weekly = district.weekly_total;
    const weeklyLast8 = weekly.slice(-8);
    const trend = computeTrend(weeklyLast8);
    const cases4w = weekly.slice(-4).reduce((a, b) => a + b, 0);
    const casesPrior4w = weekly.slice(-8, -4).reduce((a, b) => a + b, 0);
    const fc = FORECAST[name];
    const forecast4w = fc?.weeks ?? [0, 0, 0, 0];
    const forecastAvg = forecast4w.reduce((a, b) => a + b, 0) / Math.max(1, forecast4w.length);
    const outbreakProb = fc?.outbreak_prob ?? 0;
    const baseline = WHO_BASELINES[name] ?? { mu: 0, sigma: 0 };
    const whoClass = computeWHOClass(forecastAvg, baseline.mu, baseline.sigma);
    return {
      name,
      state: stateLabel,
      district,
      weeklyLast8,
      trend,
      cases4w,
      casesPrior4w,
      forecast4w,
      forecastAvg,
      outbreakProb,
      population: DISTRICT_POPULATION[name] ?? 1_000_000,
      whoClass,
    };
  });

  // ICMR stratification — across the state's districts.
  const stratumMap = computeICMRStrata(partial.map((p) => Math.round(p.forecastAvg)));
  const fallbackStratum: ICMRStratum = "A4";

  return partial.map((p) => {
    const stratum: ICMRStratum = stratumMap[Math.round(p.forecastAvg)] ?? fallbackStratum;
    const riskLabel: WHOClass | ICMRClass | "NoData" =
      method === "ICMR" ? icmrStratumToLabel(stratum) : p.whoClass;
    const riskLevel = classToRiskLevel(riskLabel) as 0 | 1 | 2 | 3 | 4;
    const legacyRisk = levelToLegacyRisk(riskLevel);
    return {
      ...p,
      icmrStratum: stratum,
      riskLabel,
      riskLevel,
      legacyRisk,
    };
  });
}

export function getDistrictMetrics(stateLabel: string): DistrictMetrics[] {
  const cached = districtCache.get(stateLabel);
  if (cached) return cached;
  const built = buildDistrictMetricsForState(stateLabel);
  districtCache.set(stateLabel, built);
  return built;
}

export function getDistrictMetric(stateLabel: string, districtName: string): DistrictMetrics | undefined {
  return getDistrictMetrics(stateLabel).find((d) => d.name === districtName);
}

export function stateLabelFromId(id: StateId): string {
  return STATE_LABEL_BY_ID[id];
}

// ──────────────── Per-screen converters ────────────────

function metricToRegion(m: DistrictMetrics): RegionData {
  return {
    name: m.name,
    suspected: Math.round(m.cases4w * 6.5),
    tested: Math.round(m.cases4w * 5.5),
    confirmed: m.cases4w,
    risk: m.legacyRisk,
    trend: trendToLegacy(m.trend),
    type: "district",
  };
}

function municipalityToRegion(parent: DistrictMetrics, mName: string, weekly: number[]): RegionData {
  const cases = weekly.slice(-4).reduce((a, b) => a + b, 0);
  const trend = computeTrend(weekly.slice(-8));
  // Inherit district risk for municipalities (no separate baseline).
  return {
    name: mName,
    suspected: Math.round(cases * 6.5),
    tested: Math.round(cases * 5.5),
    confirmed: cases,
    risk: parent.legacyRisk,
    trend: trendToLegacy(trend),
    type: "municipality",
    parentDistrict: parent.name,
  };
}

function blockToRegion(parent: DistrictMetrics, bName: string, weekly: number[]): RegionData {
  const cases = weekly.slice(-4).reduce((a, b) => a + b, 0);
  const trend = computeTrend(weekly.slice(-8));
  return {
    name: bName,
    suspected: Math.round(cases * 6.5),
    tested: Math.round(cases * 5.5),
    confirmed: cases,
    risk: parent.legacyRisk,
    trend: trendToLegacy(trend),
    type: "block",
    parentDistrict: parent.name,
  };
}

function leafToRegion(
  parent: DistrictMetrics,
  parentBlockName: string,
  leafType: "ward" | "village",
  leafName: string,
  weekly: number[],
): RegionData {
  const cases = weekly.slice(-4).reduce((a, b) => a + b, 0);
  const trend = computeTrend(weekly.slice(-8));
  return {
    name: leafName,
    suspected: Math.round(cases * 6.5),
    tested: Math.round(cases * 5.5),
    confirmed: cases,
    risk: parent.legacyRisk,
    trend: trendToLegacy(trend),
    type: leafType,
    parentDistrict: parent.name,
    parentBlock: parentBlockName,
  };
}

/** Regions visible on Overview / Surveillance for the current scope. */
export function canonicalRegions(stateLabel: string, filters: DashboardFiltersLike): RegionData[] {
  const metrics = getDistrictMetrics(stateLabel);
  if (!metrics.length) return [];

  // Block-level scope → return wards + villages under that block.
  if (filters.block && filters.block !== "All Blocks") {
    const parent = metrics.find(
      (m) =>
        m.district.municipalities.some((x) => x.name === filters.block) ||
        m.district.blocks.some((x) => x.name === filters.block),
    );
    if (!parent) return [];
    const muni = parent.district.municipalities.find((m) => m.name === filters.block);
    if (muni) {
      return muni.wards.map((w) => leafToRegion(parent, muni.name, "ward", w.name, w.weekly));
    }
    const block = parent.district.blocks.find((b) => b.name === filters.block);
    if (block) {
      return block.villages.map((v) => leafToRegion(parent, block.name, "village", v.name, v.weekly));
    }
    return [];
  }

  // District scope → return municipalities + blocks under it.
  if (filters.district && filters.district !== "All Districts") {
    const parent = metrics.find((m) => m.name === filters.district);
    if (!parent) return [];
    const munis = parent.district.municipalities.map((m) => municipalityToRegion(parent, m.name, m.weekly));
    const blocks = parent.district.blocks.map((b) => blockToRegion(parent, b.name, b.weekly));
    return [...munis, ...blocks];
  }

  // State-wide → districts.
  return metrics.map(metricToRegion);
}

/** Hotspots for the current scope, computed via persistence rule. */
export function canonicalHotspots(
  stateLabel: string,
  filters: DashboardFiltersLike,
  lookbackWeeks: 2 | 4 = 4,
): HotspotData[] {
  const window: "2W" | "4W" = lookbackWeeks === 2 ? "2W" : "4W";
  const metrics = getDistrictMetrics(stateLabel);
  const sources: Array<{ name: string; weekly: number[]; parentDistrict?: string; parentBlock?: string }> = [];

  if (filters.block && filters.block !== "All Blocks") {
    const parent = metrics.find(
      (m) =>
        m.district.municipalities.some((x) => x.name === filters.block) ||
        m.district.blocks.some((x) => x.name === filters.block),
    );
    if (parent) {
      const muni = parent.district.municipalities.find((m) => m.name === filters.block);
      if (muni) muni.wards.forEach((w) => sources.push({ name: w.name, weekly: w.weekly, parentDistrict: parent.name, parentBlock: muni.name }));
      const block = parent.district.blocks.find((b) => b.name === filters.block);
      if (block) block.villages.forEach((v) => sources.push({ name: v.name, weekly: v.weekly, parentDistrict: parent.name, parentBlock: block.name }));
    }
  } else if (filters.district && filters.district !== "All Districts") {
    const parent = metrics.find((m) => m.name === filters.district);
    if (parent) {
      parent.district.municipalities.forEach((m) => sources.push({ name: m.name, weekly: m.weekly, parentDistrict: parent.name }));
      parent.district.blocks.forEach((b) => sources.push({ name: b.name, weekly: b.weekly, parentDistrict: parent.name }));
    }
  } else {
    metrics.forEach((m) => sources.push({ name: m.name, weekly: m.district.weekly_total }));
  }

  return sources
    .map((s) => {
      const weekly = s.weekly;
      const cls = computeHotspotClass(weekly.slice(-8), window);
      const recent = weekly.slice(-(lookbackWeeks)).reduce((a, b) => a + b, 0);
      const prev = weekly.slice(-(lookbackWeeks * 2), -(lookbackWeeks)).reduce((a, b) => a + b, 0);
      const trend = computeTrend(weekly.slice(-8));
      return {
        area: s.name,
        currentCases: recent,
        prevCases: prev,
        trend: trendToLegacy(trend),
        risk: hotspotClassToLegacyRisk(cls),
        hotspotClass: cls,
        parentDistrict: s.parentDistrict,
        parentBlock: s.parentBlock,
      } as HotspotData & { hotspotClass: HotspotClass };
    })
    .sort((a, b) => b.currentCases - a.currentCases);
}

/** Outbreak Prediction Table data — uses constrained driver vocabulary. */
export function canonicalPredictions(
  stateLabel: string,
  filters: DashboardFiltersLike,
): OutbreakPrediction[] {
  const metrics = getDistrictMetrics(stateLabel);

  if (filters.district && filters.district !== "All Districts") {
    // Drill into block / municipality level — derive forecast from recent trajectory * rate.
    const parent = metrics.find((m) => m.name === filters.district);
    if (!parent) return [];
    const districtForecastRatio = parent.forecastAvg / Math.max(1, parent.cases4w / 4);
    const buildPred = (
      name: string,
      areaType: string,
      weekly: number[],
    ): OutbreakPrediction => {
      const trend = computeTrend(weekly.slice(-8));
      const recent4 = weekly.slice(-4).reduce((a, b) => a + b, 0);
      const projected = Math.round((recent4 / 4) * districtForecastRatio);
      const probability = Math.min(95, Math.max(5, Math.round(parent.outbreakProb * (recent4 / Math.max(1, parent.cases4w)))));
      return {
        area: name,
        probability,
        risk: parent.legacyRisk,
        riskLabel: String(parent.riskLabel),
        expectedWeek: trend === "Rising" ? "W+2" : trend === "NewEmergence" ? "W+2" : "W+4",
        signal: buildDriverString(parent.district.type, parent.district.characteristic, trend, projected),
        parentDistrict: parent.name,
        areaType,
      };
    };
    const munis = parent.district.municipalities.map((m) => buildPred(m.name, "Municipality", m.weekly));
    const blocks = parent.district.blocks.map((b) => buildPred(b.name, "Block", b.weekly));
    return [...munis, ...blocks].sort((a, b) => b.probability - a.probability);
  }

  return metrics
    .map((m) => ({
      area: m.name,
      probability: m.outbreakProb,
      risk: m.legacyRisk,
      riskLabel: String(m.riskLabel),
      expectedWeek: m.trend === "Rising" ? "W+2" : m.trend === "NewEmergence" ? "W+2" : "W+4",
      signal: buildDriverString(m.district.type, m.district.characteristic, m.trend, Math.round(m.forecastAvg)),
      areaType: "District",
    }))
    .sort((a, b) => b.probability - a.probability);
}

function buildDriverString(
  type: DistrictData["type"],
  characteristic: DistrictData["characteristic"],
  trend: Trend,
  totalRecent: number,
): string {
  if (type === "coastal" && trend === "Rising") {
    return "Rainfall + humidity spike on coastal belt — sustained 2-week surge.";
  }
  if (type === "metro" && trend === "Rising" && totalRecent > 200) {
    return "Persistent urban transmission — sustained dengue burden across wards.";
  }
  if (trend === "Rising") {
    return `Rising hotspot burden — sharp 2-week surge across ${type} areas.`;
  }
  if (trend === "NewEmergence" || characteristic === "emergence") {
    return "Emerging cluster — first cases of new season detected.";
  }
  if (trend === "Falling") {
    return "Declining transmission — trajectory consistent with seasonal decay.";
  }
  return "Moderate persistent risk — stable trajectory.";
}

/** Forecast cards for the next 4 weeks. */
export function canonicalRiskForecast(stateLabel: string, filters: DashboardFiltersLike): RiskForecastPoint[] {
  const metrics = getDistrictMetrics(stateLabel);
  if (!metrics.length) return [];
  const method = (STATE_RISK_METHOD as Record<string, string>)[stateLabel] ?? "WHO";
  const whoLabels: Record<"high" | "moderate" | "low", string> = { low: "Low", moderate: "Moderate", high: "High" };
  const icmrLabels: Record<"high" | "moderate" | "low", string> = { low: "Low", moderate: "Caution", high: "High Risk" };
  const labelFor = (r: "high" | "moderate" | "low") => (method === "ICMR" ? icmrLabels[r] : whoLabels[r]);

  let weeks: number[];
  let summaryRisk: "high" | "moderate" | "low" = "low";

  if (filters.district && filters.district !== "All Districts") {
    const parent = metrics.find((m) => m.name === filters.district);
    if (!parent) return [];
    weeks = parent.forecast4w;
    summaryRisk = parent.legacyRisk;
  } else {
    weeks = [0, 1, 2, 3].map((wi) =>
      metrics.reduce((acc, m) => acc + (m.forecast4w[wi] ?? 0), 0),
    );
    const highCount = metrics.filter((m) => m.legacyRisk === "high").length;
    summaryRisk = highCount >= 3 ? "high" : highCount >= 1 ? "moderate" : "low";
  }

  const labels = ["W+1", "W+2", "W+3", "W+4"];
  return weeks.map((cases, i) => {
    let risk: "high" | "moderate" | "low" = summaryRisk;
    if (i >= 2 && cases > weeks[0] * 1.15) risk = summaryRisk === "low" ? "moderate" : "high";
    return { week: labels[i], label: labels[i], cases, risk, riskLabel: labelFor(risk) };
  });
}

/** Areas of concern: New Emergence (strict). */
export function canonicalNewEmergence(stateLabel: string, filters: DashboardFiltersLike) {
  const regions = candidateLeaves(stateLabel, filters);
  return regions
    .filter((r) => isNewEmergence(r.weeklyLast8))
    .slice(0, 5)
    .map((r) => ({
      name: r.name,
      cases: r.weeklyLast8.slice(-2).reduce((a, b) => a + b, 0),
      prevCases: r.weeklyLast8.slice(-6, -2).reduce((a, b) => a + b, 0),
      changePct: 100,
      parent: r.parentBlock || r.parentDistrict,
      level: r.level,
    }));
}

/** Areas of concern: Rising Cluster (population-normalised). */
export function canonicalRisingClusters(stateLabel: string, filters: DashboardFiltersLike) {
  const regions = candidateLeaves(stateLabel, filters);
  return regions
    .map((r) => {
      const recent4 = r.weeklyLast8.slice(-4).reduce((a, b) => a + b, 0);
      const prior4 = r.weeklyLast8.slice(-8, -4).reduce((a, b) => a + b, 0);
      const { isCluster, changePct } = isRisingCluster(recent4, prior4, r.population);
      return { r, recent4, prior4, isCluster, changePct };
    })
    .filter((x) => x.isCluster)
    .sort((a, b) => b.changePct - a.changePct)
    .slice(0, 5)
    .map(({ r, recent4, prior4, changePct }) => ({
      name: r.name,
      cases: recent4,
      prevCases: prior4,
      changePct,
      parent: r.parentBlock || r.parentDistrict,
      level: r.level,
    }));
}

interface LeafRegion {
  name: string;
  weeklyLast8: number[];
  parentDistrict?: string;
  parentBlock?: string;
  population: number;
  level: "district" | "block" | "ward";
}

function candidateLeaves(stateLabel: string, filters: DashboardFiltersLike): LeafRegion[] {
  const metrics = getDistrictMetrics(stateLabel);
  const out: LeafRegion[] = [];
  if (filters.block && filters.block !== "All Blocks") {
    const parent = metrics.find(
      (m) =>
        m.district.municipalities.some((x) => x.name === filters.block) ||
        m.district.blocks.some((x) => x.name === filters.block),
    );
    if (parent) {
      const muni = parent.district.municipalities.find((m) => m.name === filters.block);
      if (muni) muni.wards.forEach((w) => out.push({ name: w.name, weeklyLast8: w.weekly.slice(-8), parentDistrict: parent.name, parentBlock: muni.name, population: parent.population / 50, level: "ward" }));
      const block = parent.district.blocks.find((b) => b.name === filters.block);
      if (block) block.villages.forEach((v) => out.push({ name: v.name, weeklyLast8: v.weekly.slice(-8), parentDistrict: parent.name, parentBlock: block.name, population: parent.population / 50, level: "ward" }));
    }
  } else if (filters.district && filters.district !== "All Districts") {
    const parent = metrics.find((m) => m.name === filters.district);
    if (parent) {
      parent.district.municipalities.forEach((m) => out.push({ name: m.name, weeklyLast8: m.weekly.slice(-8), parentDistrict: parent.name, population: parent.population / 8, level: "block" }));
      parent.district.blocks.forEach((b) => out.push({ name: b.name, weeklyLast8: b.weekly.slice(-8), parentDistrict: parent.name, population: parent.population / 8, level: "block" }));
    }
  } else {
    metrics.forEach((m) => out.push({ name: m.name, weeklyLast8: m.weeklyLast8, population: m.population, level: "district" }));
  }
  return out;
}

export { WEEK_ENDINGS };
