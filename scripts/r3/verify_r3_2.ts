// Temporary R3.2 verification harness — not part of the app bundle.
//
// Run with:  npx vite-node scripts/r3/verify_r3_2.ts
//
// Browser verification is deferred to R3.5, so this stands in: it exercises the
// loader wrappers and the app→manifest re-key from Node and prints enough to
// eyeball correctness, determinism and bucket distribution.
//
// Delete once R3.5 confirms the same behaviour in the browser.

import { enumerateWards } from "@/features/weeklyResponse/effectiveness";
import { larvalWardKey } from "@/data/mock_larval_surveys";
import type { DashboardFiltersLike } from "@/data/mockData";
import {
  appWardKeyToManifestKey,
  ensureManifestIndex,
  getBreedingAggregation,
  getFoggingStatus,
  getLatestLarvalIndices,
  getWardManifestEntry,
  loadBreedingSites,
  loadConfigAssumptions,
  loadFoggingEvents,
  loadLarvalIndices,
  loadRecommendationRules,
  loadWardsManifest,
} from "@/data/r3/loader";

const STATES = ["GBA Central", "Karnataka", "Odisha", "Andhra Pradesh"];

const NO_FILTERS: DashboardFiltersLike = {
  district: "All Districts",
  block: "All Blocks",
  ward: "All Wards",
  areaType: "all",
  fromDate: "",
  toDate: "",
} as DashboardFiltersLike;

/** Every app ward key, grouped by state. */
function appWardKeysByState(): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const state of STATES) {
    out[state] = enumerateWards(state, NO_FILTERS).map((w) =>
      larvalWardKey(state, w.district, w.block, w.ward),
    );
  }
  return out;
}

function rule(title: string) {
  console.log(`\n${"─".repeat(72)}\n${title}\n${"─".repeat(72)}`);
}

async function main() {
  await ensureManifestIndex();
  const byState = appWardKeysByState();

  // ── 1. Datasets load, and the counts match the brief ──
  rule("1. Dataset loaders");
  const [fogging, breeding, larval, manifest, config, rules] = await Promise.all([
    loadFoggingEvents(),
    loadBreedingSites(),
    loadLarvalIndices(),
    loadWardsManifest(),
    loadConfigAssumptions(),
    loadRecommendationRules(),
  ]);
  console.log(`fogging events   : ${fogging.length}`);
  console.log(`breeding sites   : ${breeding.length}`);
  console.log(`larval indices   : ${larval.length}`);
  console.log(`manifest wards   : ${manifest.length}`);
  console.log(`config keys      : ${Object.keys(config).join(", ")}`);
  console.log(`recommendation rules: ${rules.length}`);

  // ── 2. Ward context for 3 wards per state (12 total) ──
  // getWardRecommendation lands in R3.3; this prints the inputs it will read.
  rule("2. Ward context — 3 wards per state (recommendation inputs)");
  for (const state of STATES) {
    const keys = byState[state];
    const picks = [keys[0], keys[Math.floor(keys.length / 2)], keys[keys.length - 1]];
    console.log(`\n## ${state}  (${keys.length} app wards)`);
    for (const appKey of picks) {
      const manifestKey = appWardKeyToManifestKey(appKey);
      const [entry, fog, breed, indices] = await Promise.all([
        getWardManifestEntry(appKey),
        getFoggingStatus(appKey),
        getBreedingAggregation(appKey),
        getLatestLarvalIndices(appKey),
      ]);
      console.log(`\n  app     : ${appKey}`);
      console.log(`  manifest: ${manifestKey}`);
      console.log(`  manifest forecast_risk (advisory): ${entry?.forecast_risk ?? "—"}`);
      console.log(
        `  fogging : status=${fog?.fogging_status ?? "—"} ` +
          `days_since=${fog?.days_since_last_fogging ?? "—"} ` +
          `cadence=${fog?.expected_cadence_days ?? "—"}d ` +
          `events_90d=${fog?.event_count_90d ?? "—"}`,
      );
      console.log(
        `  breeding: major_open=${breed?.major_open ?? "—"} ` +
          `minor_open=${breed?.minor_open ?? "—"} ` +
          `major_resolved=${breed?.major_resolved ?? "—"} ` +
          `tracked=${breed?.total_sites_tracked ?? "—"}`,
      );
      console.log(
        `  larval  : week=${indices?.week ?? "—"} ` +
          `tier=${indices?.coverage_tier ?? "—"} ` +
          `BI=${indices?.bi ?? "—"} HI=${indices?.hi ?? "—"} CI=${indices?.ci ?? "—"} ` +
          `breach=${indices?.any_outbreak_threshold_breached ?? "—"}`,
      );
    }
  }

  // ── 3. Determinism ──
  rule("3. Determinism — same appKey mapped twice, and 10 sample mappings");
  const samples: string[] = [];
  for (const state of STATES) {
    const keys = byState[state];
    for (let i = 0; i < 3 && samples.length < 10; i += 1) {
      samples.push(keys[Math.floor((keys.length / 3) * i)]);
    }
  }
  let stable = true;
  for (const appKey of samples) {
    const a = appWardKeyToManifestKey(appKey);
    const b = appWardKeyToManifestKey(appKey);
    if (a !== b) stable = false;
    console.log(`  ${a === b ? "OK " : "FAIL"}  ${appKey}\n        → ${a}`);
  }
  // Re-map every ward twice and compare wholesale, not just the 10 samples.
  let allStable = true;
  for (const state of STATES) {
    for (const k of byState[state]) {
      if (appWardKeyToManifestKey(k) !== appWardKeyToManifestKey(k)) allStable = false;
    }
  }
  console.log(`\n  10 samples stable within process : ${stable}`);
  console.log(`  all 1,286 wards stable within process: ${allStable}`);
  console.log("  (cross-session stability: run this script twice and diff the output)");

  // ── 4. Bucket distribution ──
  rule("4. Distribution — app wards per manifest ward");
  const manifestByState: Record<string, number> = {};
  for (const w of manifest) manifestByState[w.state] = (manifestByState[w.state] ?? 0) + 1;

  for (const state of STATES) {
    const keys = byState[state];
    const counts = new Map<string, number>();
    for (const k of keys) {
      const m = appWardKeyToManifestKey(k);
      counts.set(m, (counts.get(m) ?? 0) + 1);
    }
    const hits = [...counts.values()];
    const poolSize = manifestByState[state] ?? 0;
    const used = counts.size;
    const max = Math.max(...hits);
    const min = Math.min(...hits);
    const mean = keys.length / poolSize;
    const hist: Record<number, number> = {};
    for (const h of hits) hist[h] = (hist[h] ?? 0) + 1;
    // Manifest wards nothing mapped onto.
    hist[0] = poolSize - used;
    console.log(
      `\n  ${state}: ${keys.length} app wards → ${poolSize} manifest wards ` +
        `(ideal ${mean.toFixed(2)} each)`,
    );
    console.log(`    manifest wards used: ${used}/${poolSize}   busiest: ${max}   quietest used: ${min}`);
    console.log(
      "    app-wards-per-manifest-ward histogram: " +
        Object.keys(hist)
          .map(Number)
          .sort((a, b) => a - b)
          .map((n) => `${n}→${hist[n]}`)
          .join("  "),
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
