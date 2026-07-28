// Demo approximation — replace with real larval survey app data before production use.
//
// Mock larval survey coverage by ward × week. In production this would come from
// the state larval survey app / field officer submissions. Generated
// deterministically at module load so coverage is stable across reloads.
//
// Distribution target: ~40% high / 30% medium / 20% low / 10% null, skewed so
// higher-burden (better-resourced) districts trend "high" and rural/low-burden
// districts trend "medium/low".
import { getDistrictMetrics } from "./canonical";
import { EPI_WEEKS } from "./mock_dataset";

export type SurveyLevel = "high" | "medium" | "low";

// key: "state|district|block_or_mun|ward"  →  { "W36": "high", "W37": null, ... }
export const MOCK_LARVAL_SURVEYS: Record<string, Record<string, SurveyLevel | null>> = {};

/** Canonical key for a ward, shared by the generator and all lookups. */
export function larvalWardKey(state: string, district: string, block: string, ward: string): string {
  return `${state}|${district}|${block}|${ward}`;
}

const STATE_LABELS = ["GBA Central", "Karnataka", "Odisha", "Andhra Pradesh"];

// Explicitly well-resourced districts/corporations (skew high regardless of rank).
const WELL_RESOURCED = new Set([
  "Bengaluru Urban", "Khordha", "Visakhapatnam",
  "BBMP East", "BBMP South", "BBMP West", "BBMP North", "BBMP Central",
]);

type Profile = "high_resource" | "base" | "rural";
// [high, medium, low, null] weights per profile.
const PROFILE_WEIGHTS: Record<Profile, Array<[SurveyLevel | null, number]>> = {
  high_resource: [["high", 0.55], ["medium", 0.25], ["low", 0.12], [null, 0.08]],
  base:          [["high", 0.40], ["medium", 0.30], ["low", 0.20], [null, 0.10]],
  rural:         [["high", 0.22], ["medium", 0.34], ["low", 0.30], [null, 0.14]],
};

// Deterministic PRNG (mulberry32), single stream drawn in fixed order.
function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(0x1a2b3c4d);

function pick(r: number, weights: Array<[SurveyLevel | null, number]>): SurveyLevel | null {
  let acc = 0;
  for (const [level, w] of weights) {
    acc += w;
    if (r <= acc) return level;
  }
  return weights[weights.length - 1][0];
}

function generate() {
  for (const state of STATE_LABELS) {
    const districts = getDistrictMetrics(state);
    if (!districts.length) continue;
    // Rank districts by peak burden → top third "high_resource", bottom third "rural".
    const peaks = districts.map((d) => (d.district.weekly_total.length ? Math.max(...d.district.weekly_total) : 0));
    const sorted = [...peaks].sort((a, b) => a - b);
    const lo = sorted[Math.floor(sorted.length / 3)] ?? 0;
    const hi = sorted[Math.floor((sorted.length * 2) / 3)] ?? 0;

    districts.forEach((dm, di) => {
      const profile: Profile = WELL_RESOURCED.has(dm.name) || peaks[di] >= hi
        ? "high_resource"
        : peaks[di] <= lo
        ? "rural"
        : "base";
      const weights = PROFILE_WEIGHTS[profile];

      const leaves: Array<{ block: string; ward: string }> = [];
      dm.district.municipalities.forEach((m) => m.wards.forEach((w) => leaves.push({ block: m.name, ward: w.name })));
      dm.district.blocks.forEach((b) => b.villages.forEach((v) => leaves.push({ block: b.name, ward: v.name })));

      for (const leaf of leaves) {
        const key = larvalWardKey(state, dm.name, leaf.block, leaf.ward);
        const byWeek: Record<string, SurveyLevel | null> = {};
        for (const wk of EPI_WEEKS) byWeek[wk] = pick(rand(), weights);
        MOCK_LARVAL_SURVEYS[key] = byWeek;
      }
    });
  }
}
generate();

/** Coverage level for a ward on a given epi week, or null when there's no signal. */
export function getLarvalSurveyCoverage(wardKey: string, epiWeek: string): SurveyLevel | null {
  return MOCK_LARVAL_SURVEYS[wardKey]?.[epiWeek] ?? null;
}
