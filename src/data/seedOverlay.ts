// Seed overlay: mutates a StateBundle in place so seeded districts/blocks/wards/villages
// reflect the canonical seed.ts values, while non-seeded entries keep their synthesized
// baseline (so maps stay populated and existing screens keep working).
//
// Run once at module init from mockData.ts AFTER each StateBundle literal is built.

import type {
  StateBundle,
  RegionData,
  HotspotData,
  OutbreakPrediction,
  NewsAlert,
  GeoAlert,
} from "./mockData";
import {
  seed,
  type SeedDistrict,
  type SeedState,
  type SeedBlock,
  type SeedMunicipality,
  type SeedWard,
  type SeedVillage,
  type SeedRisk,
} from "./seed";

const stateIdToName: Record<string, string> = {
  andhra_pradesh: "Andhra Pradesh",
  odisha: "Odisha",
  karnataka: "Karnataka",
};

// ──────────────── Helpers ────────────────
type Risk = "low" | "moderate" | "high";
type Trend = "up" | "down" | "stable";

const TEST_RATE = 0.92;        // tested / suspected
const CONFIRM_RATE = 0.22;     // confirmed / tested

/** Convert seed cases_4w into suspected / tested / confirmed counts. */
function casesToCounts(cases4w: number) {
  // The seed cases_4w value is "confirmed-equivalent" surveillance cases.
  // Inflate to a realistic suspected / tested funnel.
  const confirmed = Math.max(0, Math.round(cases4w));
  const tested = Math.max(confirmed, Math.round(confirmed / CONFIRM_RATE));
  const suspected = Math.max(tested, Math.round(tested / TEST_RATE));
  return { suspected, tested, confirmed };
}

/** Trend from comparing the recent half (cases_2w) to the older half (cases_4w − cases_2w). */
function deriveTrend(cases2w: number, cases4w: number): Trend {
  const recent = cases2w;
  const previous = Math.max(0, cases4w - cases2w);
  if (previous === 0 && recent === 0) return "stable";
  if (previous === 0) return "up";
  const ratio = recent / previous;
  if (ratio >= 1.15) return "up";
  if (ratio <= 0.85) return "down";
  return "stable";
}

function seedRiskAsRisk(r: SeedRisk): Risk {
  return r;
}

/** Map signal_text → short signal label for predictions; fallback to context summary. */
function buildPredictionSignal(d: SeedDistrict): string {
  return d.forecast?.signal_text || `${d.context} — ${d.signal.replace(/_/g, " ")}`;
}

function probabilityFromForecast(d: SeedDistrict): number {
  if (!d.forecast) {
    // Fallback when forecast block missing: derive from risk.
    return d.risk === "high" ? 70 : d.risk === "moderate" ? 45 : 18;
  }
  const peak = Math.max(
    d.forecast.w1_probability,
    d.forecast.w2_probability,
    d.forecast.w3_probability,
    d.forecast.w4_probability,
  );
  return Math.round(peak * 100);
}

function expectedWeekFromForecast(d: SeedDistrict): string {
  return d.forecast?.expected_peak_week || "W+3";
}

/** Replace entries by name in an array; append new ones if not found. Returns the same array. */
function upsertByName<T extends { name: string }>(arr: T[], next: T): void {
  const idx = arr.findIndex((e) => e.name === next.name);
  if (idx >= 0) arr[idx] = { ...arr[idx], ...next };
  else arr.push(next);
}

function upsertByArea<T extends { area: string }>(arr: T[], next: T): void {
  const idx = arr.findIndex((e) => e.area === next.area);
  if (idx >= 0) arr[idx] = { ...arr[idx], ...next };
  else arr.push(next);
}

// ──────────────── Per-state apply ────────────────
function applyToState(bundle: StateBundle, seedState: SeedState) {
  // 1. Districts list — ensure every seeded district appears in dropdown
  for (const d of seedState.districts) {
    if (!bundle.districts.includes(d.name)) bundle.districts.push(d.name);
  }

  // 2. Coordinates overlay (district + sub-levels)
  const coords = bundle.districtCoordinates;
  for (const d of seedState.districts) {
    coords[d.name] = [d.lat, d.lng];
    d.blocks?.forEach((b) => {
      coords[b.name] = [b.lat, b.lng];
      b.villages?.forEach((v) => { coords[v.name] = [v.lat, v.lng]; });
    });
    d.municipalities?.forEach((m) => {
      coords[m.name] = [m.lat, m.lng];
      m.wards?.forEach((w) => { coords[w.name] = [w.lat, w.lng]; });
    });
  }

  // Map center → seed state centroid
  bundle.mapCenter = [seedState.lat, seedState.lng];

  // 3. regionData (district-level) — overlay seeded districts
  for (const d of seedState.districts) {
    const counts = casesToCounts(d.cases_4w);
    const trend = deriveTrend(d.cases_2w, d.cases_4w);
    const next: RegionData = {
      name: d.name,
      ...counts,
      risk: seedRiskAsRisk(d.risk),
      trend,
      type: "district",
    };
    upsertByName(bundle.regionData, next);
  }

  // 4. subDistrictData — blocks + municipalities
  for (const d of seedState.districts) {
    const blockNames = new Set<string>();

    d.blocks?.forEach((b) => {
      const counts = casesToCounts(b.cases_4w);
      upsertByName(bundle.subDistrictData, {
        name: b.name,
        ...counts,
        risk: seedRiskAsRisk(b.risk),
        trend: deriveTrend(b.cases_2w, b.cases_4w),
        type: "block",
        parentDistrict: d.name,
      });
      if (!bundle.blocks.includes(b.name)) bundle.blocks.push(b.name);
      blockNames.add(b.name);
    });

    d.municipalities?.forEach((m) => {
      const counts = casesToCounts(m.cases_4w);
      upsertByName(bundle.subDistrictData, {
        name: m.name,
        ...counts,
        risk: seedRiskAsRisk(m.risk),
        trend: deriveTrend(m.cases_2w, m.cases_4w),
        type: "municipality",
        parentDistrict: d.name,
      });
      if (!bundle.blocks.includes(m.name)) bundle.blocks.push(m.name);
      blockNames.add(m.name);
    });

    // 5. villageData
    d.blocks?.forEach((b) => {
      b.villages?.forEach((v) => {
        const counts = casesToCounts(v.cases_4w);
        upsertByName(bundle.villageData, {
          name: v.name,
          ...counts,
          risk: seedRiskAsRisk(v.risk),
          trend: deriveTrend(v.cases_2w, v.cases_4w),
          type: "village",
          parentDistrict: d.name,
          parentBlock: b.name,
        });
      });
    });

    // 6. wardData
    d.municipalities?.forEach((m) => {
      m.wards?.forEach((w) => {
        const counts = casesToCounts(w.cases_4w);
        upsertByName(bundle.wardData, {
          name: w.name,
          ...counts,
          risk: seedRiskAsRisk(w.risk),
          trend: deriveTrend(w.cases_2w, w.cases_4w),
          type: "ward",
          parentDistrict: d.name,
          parentBlock: m.name,
        });
      });
    });
  }

  // 7. Hotspot data overlays
  for (const d of seedState.districts) {
    const prev = Math.max(0, d.cases_4w - d.cases_2w);
    upsertByArea<HotspotData>(bundle.hotspotDistrictData, {
      area: d.name,
      currentCases: d.cases_2w,
      prevCases: prev,
      trend: deriveTrend(d.cases_2w, d.cases_4w),
      risk: seedRiskAsRisk(d.risk),
    });

    d.blocks?.forEach((b) => {
      upsertByArea<HotspotData>(bundle.hotspotSubDistrictData, {
        area: b.name,
        currentCases: b.cases_2w,
        prevCases: Math.max(0, b.cases_4w - b.cases_2w),
        trend: deriveTrend(b.cases_2w, b.cases_4w),
        risk: seedRiskAsRisk(b.risk),
        parentDistrict: d.name,
      });
      b.villages?.forEach((v) => {
        upsertByArea<HotspotData>(bundle.hotspotVillageData, {
          area: v.name,
          currentCases: v.cases_2w,
          prevCases: Math.max(0, v.cases_4w - v.cases_2w),
          trend: deriveTrend(v.cases_2w, v.cases_4w),
          risk: seedRiskAsRisk(v.risk),
          parentDistrict: d.name,
          parentBlock: b.name,
        });
      });
    });

    d.municipalities?.forEach((m) => {
      upsertByArea<HotspotData>(bundle.hotspotSubDistrictData, {
        area: m.name,
        currentCases: m.cases_2w,
        prevCases: Math.max(0, m.cases_4w - m.cases_2w),
        trend: deriveTrend(m.cases_2w, m.cases_4w),
        risk: seedRiskAsRisk(m.risk),
        parentDistrict: d.name,
      });
      m.wards?.forEach((w) => {
        upsertByArea<HotspotData>(bundle.hotspotVillageData, {
          area: w.name,
          currentCases: w.cases_2w,
          prevCases: Math.max(0, w.cases_4w - w.cases_2w),
          trend: deriveTrend(w.cases_2w, w.cases_4w),
          risk: seedRiskAsRisk(w.risk),
          parentDistrict: d.name,
          parentBlock: m.name,
        });
      });
    });
  }

  // 8. Predictions — state, district (= block/municipality level), block (= village/ward)
  for (const d of seedState.districts) {
    upsertByArea<OutbreakPrediction>(bundle.statePredictions, {
      area: d.name,
      probability: probabilityFromForecast(d),
      risk: seedRiskAsRisk(d.risk),
      expectedWeek: expectedWeekFromForecast(d),
      signal: buildPredictionSignal(d),
    });

    d.blocks?.forEach((b) => {
      upsertByArea<OutbreakPrediction>(bundle.districtPredictions, {
        area: b.name,
        probability: Math.round((b.cases_2w / Math.max(1, b.cases_4w)) * 90),
        risk: seedRiskAsRisk(b.risk),
        expectedWeek: "W+3",
        signal: `${seedState.name} block — ${b.signal.replace(/_/g, " ")}`,
        parentDistrict: d.name,
        areaType: "Block",
      });
      b.villages?.forEach((v) => {
        upsertByArea<OutbreakPrediction>(bundle.blockPredictions, {
          area: v.name,
          probability: Math.round((v.cases_2w / Math.max(1, v.cases_4w)) * 80),
          risk: seedRiskAsRisk(v.risk),
          expectedWeek: "W+3",
          signal: `Village — ${v.signal.replace(/_/g, " ")}`,
          parentDistrict: d.name,
          parentBlock: b.name,
        });
      });
    });

    d.municipalities?.forEach((m) => {
      upsertByArea<OutbreakPrediction>(bundle.districtPredictions, {
        area: m.name,
        probability: Math.round((m.cases_2w / Math.max(1, m.cases_4w)) * 90),
        risk: seedRiskAsRisk(m.risk),
        expectedWeek: "W+3",
        signal: `${seedState.name} municipality — urban area`,
        parentDistrict: d.name,
        areaType: "Municipality",
      });
      m.wards?.forEach((w) => {
        upsertByArea<OutbreakPrediction>(bundle.municipalityPredictions, {
          area: w.name,
          probability: Math.round((w.cases_2w / Math.max(1, w.cases_4w)) * 85),
          risk: seedRiskAsRisk(w.risk),
          expectedWeek: "W+3",
          signal: `Ward — ${w.signal.replace(/_/g, " ")}`,
          parentDistrict: d.name,
          parentBlock: m.name,
        });
      });
    });
  }

  // 9. Hotspot / news / geo alerts — replace from seed signals
  bundle.hotspotAlerts.length = 0;
  bundle.newsAlerts.length = 0;
  bundle.geoTaggedAlerts.length = 0;

  seedState.signals.forEach((s, i) => {
    const district = seedState.districts.find((d) => d.name === s.geography);
    const severity: Risk = district ? seedRiskAsRisk(district.risk) : "moderate";
    bundle.hotspotAlerts.push({
      id: i + 1,
      district: s.geography,
      message: s.title,
      severity,
    });
    const news: NewsAlert = {
      id: i + 1,
      headline: s.title,
      source: "Field Report",
      date: "2026-04-10",
      district: s.geography,
      severity,
    };
    bundle.newsAlerts.push(news);
    if (district) {
      const geo: GeoAlert = {
        id: i + 1,
        lat: district.lat,
        lng: district.lng,
        message: s.title,
        district: s.geography,
        severity,
      };
      bundle.geoTaggedAlerts.push(geo);
    }
  });

  // 10. Stamp seed KPIs onto bundle (consumed by KPI helpers when present)
  (bundle as StateBundle & { seedKpis?: { suspected: number; tested: number; confirmed: number } })
    .seedKpis = { ...seedState.kpis };
}

// ──────────────── Public entrypoint ────────────────
/** Apply seed overrides to all three state bundles. Idempotent. */
export function applySeedOverlayAll(bundles: Record<string, StateBundle>): void {
  for (const [stateId, bundle] of Object.entries(bundles)) {
    const stateName = stateIdToName[stateId];
    const seedState = seed.states.find((s) => s.name === stateName);
    if (!seedState) continue;
    applyToState(bundle, seedState);
  }
}
