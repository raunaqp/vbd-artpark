// R3 operational data — lazy-load boundary and app→manifest ward re-key.
//
// The four generated datasets in this directory total ~10 MB of literal data
// (fogging events, breeding sites, larval indices, ward manifest). Only the
// Response and Admin surfaces need them, so they are pulled in on demand rather
// than bundled into the entry chunk — the same treatment `src/data/boundaries.ts`
// gets in `src/lib/boundaryLayers.ts`.
//
// These dynamic imports must stay the *only* imports of the four modules. A
// single static `import { ... } from "./mock_fogging_events"` anywhere in the
// app would fold 2 MB straight back into the main bundle. Type-only imports are
// erased at compile time and are safe (see the re-exports below).
//
// Each promise is cached, so a module is fetched and parsed once per session
// however many times it is asked for.

import type {
  FoggingEvent,
  FoggingStatus,
  BreedingSite,
  BreedingAggregation,
  LarvalIndicesRecord,
} from "./mock_fogging_events";
import type { WardManifest } from "./wards_manifest";

// ──────────────── Type re-exports ────────────────
// The three big generated files each re-declare the same five interfaces. Rather
// than leave three structurally-identical copies of `FoggingEvent` floating
// around for callers to pick between, the whole app imports them from here.
export type {
  FoggingEvent,
  FoggingStatus,
  BreedingSite,
  BreedingAggregation,
  LarvalIndicesRecord,
} from "./mock_fogging_events";
export type { WardManifest } from "./wards_manifest";
export type { AssumptionEntry } from "./config_assumptions";

// ──────────────── Module promises ────────────────
type FoggingModule = typeof import("./mock_fogging_events");
type BreedingModule = typeof import("./mock_breeding_sites");
type LarvalModule = typeof import("./mock_larval_indices");
type ManifestModule = typeof import("./wards_manifest");
type ConfigModule = typeof import("./config_assumptions");

export type ConfigAssumptions = ConfigModule["CONFIG_ASSUMPTIONS"];
export type RecommendationRule = ConfigModule["RECOMMENDATION_RULES"][number];

let foggingModule: Promise<FoggingModule> | null = null;
let breedingModule: Promise<BreedingModule> | null = null;
let larvalModule: Promise<LarvalModule> | null = null;
let manifestModule: Promise<ManifestModule> | null = null;
let configModule: Promise<ConfigModule> | null = null;

function loadFoggingModule(): Promise<FoggingModule> {
  if (!foggingModule) foggingModule = import("./mock_fogging_events");
  return foggingModule;
}

function loadBreedingModule(): Promise<BreedingModule> {
  if (!breedingModule) breedingModule = import("./mock_breeding_sites");
  return breedingModule;
}

function loadLarvalModule(): Promise<LarvalModule> {
  if (!larvalModule) larvalModule = import("./mock_larval_indices");
  return larvalModule;
}

function loadManifestModule(): Promise<ManifestModule> {
  if (!manifestModule) manifestModule = import("./wards_manifest");
  return manifestModule;
}

function loadConfigModule(): Promise<ConfigModule> {
  if (!configModule) configModule = import("./config_assumptions");
  return configModule;
}

// ──────────────── Whole-dataset loaders ────────────────

export async function loadFoggingEvents(): Promise<readonly FoggingEvent[]> {
  return (await loadFoggingModule()).MOCK_FOGGING_EVENTS;
}

export async function loadBreedingSites(): Promise<readonly BreedingSite[]> {
  return (await loadBreedingModule()).MOCK_BREEDING_SITES;
}

export async function loadLarvalIndices(): Promise<readonly LarvalIndicesRecord[]> {
  return (await loadLarvalModule()).MOCK_LARVAL_INDICES;
}

export async function loadWardsManifest(): Promise<readonly WardManifest[]> {
  return (await loadManifestModule()).WARDS_MANIFEST;
}

export async function loadConfigAssumptions(): Promise<ConfigAssumptions> {
  return (await loadConfigModule()).CONFIG_ASSUMPTIONS;
}

export async function loadRecommendationRules(): Promise<readonly RecommendationRule[]> {
  return (await loadConfigModule()).RECOMMENDATION_RULES;
}

/**
 * Warm every R3 dataset at once.
 *
 * Callers that will need more than one dataset (the recommendation engine does)
 * should use this so the fetches overlap instead of waterfalling.
 */
export async function loadAllR3(): Promise<void> {
  await Promise.all([
    loadFoggingModule(),
    loadBreedingModule(),
    loadLarvalModule(),
    ensureManifestIndex(),
    loadConfigModule(),
  ]);
}

/** True once every R3 dataset is at least in flight — lets callers skip a spinner. */
export function r3Loaded(): boolean {
  return (
    foggingModule !== null &&
    breedingModule !== null &&
    larvalModule !== null &&
    manifestModule !== null &&
    configModule !== null
  );
}

// ──────────────── app ward key → manifest ward key ────────────────
//
// The generated datasets are keyed on a synthetic ward hierarchy that only
// overlaps the app's canonical hierarchy by ~3% (37 of 1,286 wards). The key
// *format* matches — `state|district|block|ward`, same as `larvalWardKey()` —
// but the names inside do not: GBA is shifted a level (manifest district is
// "GBA Central", block is the corporation), and most Odisha / AP districts and
// blocks are spelled differently ("Balasore" vs "Baleshwar").
//
// Rather than edit the canonical generated data, every app ward is mapped onto
// a manifest ward by hashing its key. This is deterministic and stateless: the
// same app ward always draws the same synthetic fogging / breeding / larval
// profile, in this session and every future one. Mapping is scoped per state,
// so a Karnataka ward always lands on Karnataka data.
//
// Where a state has more app wards than manifest wards (Odisha: 481 vs 241) the
// modulo wraps and several app wards share one profile. That is acceptable for
// a demo — the data is synthetic either way.
//
// DEBT: retire this layer once the mock datasets are regenerated from the app's
// canonical hierarchy. See KNOWN_DEBT.md.

interface ManifestIndex {
  /** state → manifest ward_keys, in manifest order (the hash bucket list). */
  byState: Record<string, readonly string[]>;
  /** manifest ward_key → full manifest row. */
  byKey: Record<string, WardManifest>;
}

let manifestIndex: ManifestIndex | null = null;

/**
 * Load the ward manifest and precompute the per-state bucket lists that
 * `appWardKeyToManifestKey` hashes into.
 *
 * Await this (or any of the per-ward getters, which await it for you) before
 * calling the synchronous mapping function.
 */
export async function ensureManifestIndex(): Promise<ManifestIndex> {
  if (manifestIndex) return manifestIndex;
  const { WARDS_MANIFEST } = await loadManifestModule();
  const byState: Record<string, string[]> = {};
  const byKey: Record<string, WardManifest> = {};
  for (const w of WARDS_MANIFEST) {
    if (!byState[w.state]) byState[w.state] = [];
    byState[w.state].push(w.ward_key);
    byKey[w.ward_key] = w;
  }
  manifestIndex = { byState, byKey };
  return manifestIndex;
}

/**
 * djb2 (xor variant), clamped to unsigned 32-bit each round.
 *
 * App ward keys share long prefixes ("Karnataka|Mysuru|Nanjangud|..."), so the
 * hash has to keep mixing to the very last character. Every step stays inside
 * 32-bit integer arithmetic, which makes the result identical across engines
 * and across sessions — no `Math.random`, no `Date`, nothing environmental.
 */
function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i += 1) {
    h = (((h << 5) + h) ^ s.charCodeAt(i)) >>> 0;
  }
  return h;
}

const warnedStates = new Set<string>();

/**
 * Map an app ward key onto its manifest ward key. Deterministic and stable.
 *
 * Requires the manifest index — `await ensureManifestIndex()` (or any per-ward
 * getter below) first. Throws rather than silently returning a wrong key, since
 * a wrong key here would quietly produce a wrong recommendation.
 */
export function appWardKeyToManifestKey(appKey: string): string {
  if (!manifestIndex) {
    throw new Error(
      "appWardKeyToManifestKey: ward manifest not loaded. " +
        "Await ensureManifestIndex() or loadAllR3() first.",
    );
  }
  const state = appKey.split("|")[0];
  const pool = manifestIndex.byState[state];
  if (!pool || pool.length === 0) {
    // Unknown state — pass the key through untouched so the dataset getters
    // return null rather than serving another state's data.
    if (!warnedStates.has(state)) {
      warnedStates.add(state);
      console.warn(`[r3] no manifest wards for state "${state}" — ward lookups will return null`);
    }
    return appKey;
  }
  return pool[djb2(appKey) % pool.length];
}

/** The manifest row an app ward maps onto, including its advisory forecast_risk. */
export async function getWardManifestEntry(appWardKey: string): Promise<WardManifest | null> {
  const index = await ensureManifestIndex();
  return index.byKey[appWardKeyToManifestKey(appWardKey)] ?? null;
}

// ──────────────── Per-ward getters ────────────────
//
// Each takes an *app* ward key and applies the re-key transparently, then defers
// to the sync getter the generated file already ships.

export async function getFoggingEventsForWard(
  appWardKey: string,
  sinceDaysAgo?: number,
): Promise<FoggingEvent[]> {
  const [mod] = await Promise.all([loadFoggingModule(), ensureManifestIndex()]);
  return mod.getFoggingEventsForWard(appWardKeyToManifestKey(appWardKey), sinceDaysAgo);
}

export async function getFoggingStatus(appWardKey: string): Promise<FoggingStatus | null> {
  const [mod] = await Promise.all([loadFoggingModule(), ensureManifestIndex()]);
  return mod.getFoggingStatus(appWardKeyToManifestKey(appWardKey));
}

export async function getBreedingSitesForWard(
  appWardKey: string,
  status?: "open" | "resolved",
): Promise<BreedingSite[]> {
  const [mod] = await Promise.all([loadBreedingModule(), ensureManifestIndex()]);
  return mod.getBreedingSitesForWard(appWardKeyToManifestKey(appWardKey), status);
}

export async function getBreedingAggregation(
  appWardKey: string,
): Promise<BreedingAggregation | null> {
  const [mod] = await Promise.all([loadBreedingModule(), ensureManifestIndex()]);
  return mod.getBreedingAggregation(appWardKeyToManifestKey(appWardKey));
}

export async function getLarvalIndicesForWard(
  appWardKey: string,
  weeksBack?: number,
): Promise<LarvalIndicesRecord[]> {
  const [mod] = await Promise.all([loadLarvalModule(), ensureManifestIndex()]);
  return mod.getLarvalIndicesForWard(appWardKeyToManifestKey(appWardKey), weeksBack);
}

export async function getLatestLarvalIndices(
  appWardKey: string,
): Promise<LarvalIndicesRecord | null> {
  const [mod] = await Promise.all([loadLarvalModule(), ensureManifestIndex()]);
  return mod.getLatestLarvalIndices(appWardKeyToManifestKey(appWardKey));
}
