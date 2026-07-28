// Boundary layer resolver — turns the real polygon dataset in `src/data/boundaries.ts`
// into GeoJSON FeatureCollections the map can render at each drill level, and
// joins each polygon to the mock case record that drives its shading.
//
// Why a join is needed at all: the polygons are official geometry (GBA Dec 2025
// delimitation, KGIS for Karnataka) while the case data is synthetic. The two
// were authored independently, so their area names only partly line up. Each
// level below documents how it bridges that gap.

import type { Feature, FeatureCollection } from "geojson";
import type { BoundaryFeature } from "@/data/boundaries";
import type { RegionData } from "@/data/mockData";

// `boundaries.ts` is ~6 MB and only two of the four states need it, so it is
// pulled in on demand rather than bundled into the entry chunk. This import
// must stay dynamic and stay the *only* import of that module — a single static
// import anywhere would fold it back into the main bundle.
//
// The promise is cached, so the module is fetched and parsed once per session
// however many times a layer is requested.
let boundariesModule: Promise<typeof import("@/data/boundaries")> | null = null;

export function loadBoundaries() {
  if (!boundariesModule) boundariesModule = import("@/data/boundaries");
  return boundariesModule;
}

/** True once the polygon module is in memory — lets callers skip a spinner. */
export function boundariesLoaded(): boolean {
  return boundariesModule !== null;
}

// Stable per-feature identity. Polygon names are not unique (two corporations
// can both have a "Dasarahalli" ward), so the map keys its join on this instead.
export const FEATURE_KEY = "__key";

/**
 * Wrap raw boundary features as a GeoJSON FeatureCollection.
 *
 * Adds two derived properties:
 *  - `dtname`  so the map's existing `getFeatureDistrictName()` resolves the
 *              display name without needing a new lookup branch.
 *  - `__key`   a stable index-based id used as the join key.
 */
export function toFeatureCollection(
  features: BoundaryFeature[],
  keyPrefix: string,
): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: features.map((f, i) => ({
      type: "Feature",
      properties: {
        ...f.properties,
        dtname: f.properties.name,
        [FEATURE_KEY]: `${keyPrefix}:${i}`,
      },
      geometry: f.geometry,
    })) as Feature[],
  };
}

// Deterministic polygon order within a parent. GBA wards carry a string
// `ward_id`, Karnataka wards a numeric `ward_no`; taluks carry neither, so they
// fall through to the name comparison.
function byWardThenName(a: BoundaryFeature, b: BoundaryFeature): number {
  const na = a.properties.ward_no ?? Number(a.properties.ward_id ?? NaN);
  const nb = b.properties.ward_no ?? Number(b.properties.ward_id ?? NaN);
  const aHas = Number.isFinite(na);
  const bHas = Number.isFinite(nb);
  if (aHas && bHas && na !== nb) return na - nb;
  if (aHas !== bHas) return aHas ? -1 : 1;
  return String(a.properties.name).localeCompare(String(b.properties.name));
}

export function sortBoundaries(features: BoundaryFeature[]): BoundaryFeature[] {
  return [...features].sort(byWardThenName);
}

// ──────────────── GBA Central ────────────────

/** The 5 BBMP corporations — GBA's district-equivalent level. */
export async function gbaCorporationLayer(): Promise<FeatureCollection> {
  const { getGbaCorporations } = await loadBoundaries();
  return toFeatureCollection(sortBoundaries(getGbaCorporations()), "gba-corp");
}

/** Official ward polygons for one corporation, in deterministic order. */
export async function gbaWardLayer(corp: string): Promise<FeatureCollection> {
  const { getGbaWards } = await loadBoundaries();
  return toFeatureCollection(sortBoundaries(getGbaWards(corp)), `gba-ward:${corp}`);
}

// ──────────────── Karnataka ────────────────

/** Official KGIS taluk polygons for one district — Karnataka's block level. */
export async function kaTalukLayer(district: string): Promise<FeatureCollection> {
  const { getKaTaluks } = await loadBoundaries();
  return toFeatureCollection(sortBoundaries(getKaTaluks(district)), `ka-taluk:${district}`);
}

/**
 * Mock block name → KGIS taluk name, for one district.
 *
 * Unlike GBA, Karnataka's mock block names are real taluk names, so they mostly
 * match the polygons outright. `MOCK_TO_KGIS_TALUK_NAME` covers the spelling
 * drift KGIS has ("Sullia" → "Sulya", "Sorab" → "Soraba"); anything not listed
 * falls through to the mock name unchanged and is matched case/punctuation
 * insensitively.
 */
export async function talukNameResolver(district: string): Promise<(mockBlock: string) => string> {
  const { MOCK_TO_KGIS_TALUK_NAME } = await loadBoundaries();
  return (mockBlock) => MOCK_TO_KGIS_TALUK_NAME[district]?.[mockBlock] ?? mockBlock;
}

/**
 * Mock municipality name → KGIS municipality name.
 *
 * Not shipped in boundaries.ts, so it lives here. Only the 11 cities that have
 * ward polygons need an entry; every other municipality (Karkala, Kundapura,
 * Puttur, …) is absent on purpose and keeps its marker rendering.
 *
 * Bhadravathi is deliberately omitted: KGIS has 35 ward polygons for it, but in
 * our mock it is a *block* (taluk) whose children are villages, not a
 * municipality — so there are no municipal ward records to shade them with.
 */
const MOCK_TO_KGIS_MUN: Record<string, string> = {
  "BBMP-Legacy": "BBMP",
  "Mysuru City Corporation": "Mysuru",
  "Udupi City Municipal Council": "Udupi",
  "Mangaluru City Corporation": "Manglore",
  "Belagavi City Corporation": "Belagavi",
  "Tumakuru City Corporation": "Tumkur",
  "Shivamogga City Corporation": "Shivamogga",
  "Kalaburagi City Corporation": "Kalaburagi",
  "Hassan City Municipal Council": "Hassan",
  "Hubballi-Dharwad Municipal Corporation": "Hubli Dharwad",
};

/**
 * KGIS municipality for a selected mock block, or null when we have no ward
 * polygons for it — the caller then falls back to marker rendering.
 *
 * Checks `KA_DISTRICTS_WITH_WARD_POLYGONS` as well as the name map, so a
 * mapping alone can't make us ask for polygons that aren't in the dataset.
 */
export async function kaWardMunicipality(district: string, mockBlock: string): Promise<string | null> {
  const kgis = MOCK_TO_KGIS_MUN[mockBlock];
  if (!kgis) return null;
  const { KA_DISTRICTS_WITH_WARD_POLYGONS } = await loadBoundaries();
  return (KA_DISTRICTS_WITH_WARD_POLYGONS[district] ?? []).includes(kgis) ? kgis : null;
}

/** Official KGIS municipal ward polygons for one city. */
export async function kaWardLayer(municipality: string): Promise<FeatureCollection> {
  const { getKaWards } = await loadBoundaries();
  return toFeatureCollection(sortBoundaries(getKaWards(municipality)), `ka-ward:${municipality}`);
}

// ──────────────── Positional join ────────────────

/**
 * Result of pairing polygons with mock case records.
 *
 * `byKey` maps a polygon's `__key` to the mock region whose case counts shade
 * it. Polygons past the end of the mock list stay unmapped and render grey.
 */
export interface PolygonJoin {
  byKey: Map<string, RegionData>;
  polygonCount: number;
  mockCount: number;
  /** Polygons with no mock record — rendered unshaded. */
  unmatchedPolygons: number;
  /** Mock records with no polygon to shade — their cases are not drawn. */
  unusedMockRecords: number;
}

/**
 * Pair polygons to mock records **by position**, not by name.
 *
 * The Dec 2025 GBA ward names ("Vinayaka Layout", "Kogilu") share almost no
 * vocabulary with our synthetic mock ward names ("East Ward 3", "Hagadur
 * Extension") — a name join matches roughly 60 of 369 and would leave the map
 * mostly grey. Since the case data is invented anyway, position within a
 * corporation is no less faithful than a name match and shades far more of the
 * map. Both inputs are sorted deterministically by their callers so the pairing
 * is stable across renders.
 *
 * Tracked in known_debt.md — a real system would key on official ward IDs.
 */
export function positionalJoin(
  layer: FeatureCollection,
  mockRecords: RegionData[],
): PolygonJoin {
  const byKey = new Map<string, RegionData>();
  layer.features.forEach((f, i) => {
    const record = mockRecords[i];
    if (!record) return;
    const key = (f.properties as Record<string, unknown>)[FEATURE_KEY] as string;
    byKey.set(key, record);
  });
  const paired = Math.min(layer.features.length, mockRecords.length);
  return {
    byKey,
    polygonCount: layer.features.length,
    mockCount: mockRecords.length,
    unmatchedPolygons: layer.features.length - paired,
    unusedMockRecords: mockRecords.length - paired,
  };
}

/**
 * Pair polygons to mock records **by name**, after mapping each mock name
 * through `resolveName`. Comparison ignores case, spaces and punctuation, which
 * is enough to absorb "T. Narsipur" / "T.Narasipura"-style drift once the
 * explicit spelling map has run.
 *
 * Used for Karnataka, where mock area names really are the official area names.
 * GBA uses `positionalJoin` instead — see the note there.
 */
export function nameJoin(
  layer: FeatureCollection,
  mockRecords: RegionData[],
  resolveName: (mockName: string) => string,
): PolygonJoin {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const polygonsByName = new Map<string, Feature>();
  layer.features.forEach((f) => {
    const n = (f.properties as Record<string, unknown>)?.name;
    if (typeof n === "string") polygonsByName.set(norm(n), f);
  });

  const byKey = new Map<string, RegionData>();
  let usedRecords = 0;
  mockRecords.forEach((rec) => {
    const f = polygonsByName.get(norm(resolveName(rec.name)));
    if (!f) return;
    const key = featureKey(f);
    if (!key) return;
    byKey.set(key, rec);
    usedRecords += 1;
  });

  return {
    byKey,
    polygonCount: layer.features.length,
    mockCount: mockRecords.length,
    unmatchedPolygons: layer.features.length - byKey.size,
    unusedMockRecords: mockRecords.length - usedRecords,
  };
}

/** Read a feature's stable join key. */
export function featureKey(feature: Feature): string | null {
  const props = (feature.properties || {}) as Record<string, unknown>;
  const k = props[FEATURE_KEY];
  return typeof k === "string" ? k : null;
}
