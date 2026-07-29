// R3 operational data — lazy-load boundary.
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

let foggingModule: Promise<FoggingModule> | null = null;
let breedingModule: Promise<BreedingModule> | null = null;
let larvalModule: Promise<LarvalModule> | null = null;
let manifestModule: Promise<ManifestModule> | null = null;
let configModule: Promise<ConfigModule> | null = null;

export function loadFoggingModule(): Promise<FoggingModule> {
  if (!foggingModule) foggingModule = import("./mock_fogging_events");
  return foggingModule;
}

export function loadBreedingModule(): Promise<BreedingModule> {
  if (!breedingModule) breedingModule = import("./mock_breeding_sites");
  return breedingModule;
}

export function loadLarvalModule(): Promise<LarvalModule> {
  if (!larvalModule) larvalModule = import("./mock_larval_indices");
  return larvalModule;
}

export function loadManifestModule(): Promise<ManifestModule> {
  if (!manifestModule) manifestModule = import("./wards_manifest");
  return manifestModule;
}

export function loadConfigModule(): Promise<ConfigModule> {
  if (!configModule) configModule = import("./config_assumptions");
  return configModule;
}

/**
 * Warm every R3 dataset at once.
 *
 * Callers that will need more than one dataset (the recommendation engine does)
 * should use this so the four fetches overlap instead of waterfalling.
 */
export function loadAllR3(): Promise<void> {
  return Promise.all([
    loadFoggingModule(),
    loadBreedingModule(),
    loadLarvalModule(),
    loadManifestModule(),
    loadConfigModule(),
  ]).then(() => undefined);
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
