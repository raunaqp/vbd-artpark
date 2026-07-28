// Boundary layer resolver — turns the real polygon dataset in `src/data/boundaries.ts`
// into GeoJSON FeatureCollections the map can render at each drill level, and
// joins each polygon to the mock case record that drives its shading.
//
// Why a join is needed at all: the polygons are official geometry (GBA Dec 2025
// delimitation, KGIS for Karnataka) while the case data is synthetic. The two
// were authored independently, so their area names only partly line up. Each
// level below documents how it bridges that gap.

import type { Feature, FeatureCollection } from "geojson";
import {
  getGbaCorporations,
  getGbaWards,
  type BoundaryFeature,
} from "@/data/boundaries";
import type { RegionData } from "@/data/mockData";

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
export function gbaCorporationLayer(): FeatureCollection {
  return toFeatureCollection(sortBoundaries(getGbaCorporations()), "gba-corp");
}

/** Official ward polygons for one corporation, in deterministic order. */
export function gbaWardLayer(corp: string): FeatureCollection {
  return toFeatureCollection(sortBoundaries(getGbaWards(corp)), `gba-ward:${corp}`);
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

/** Read a feature's stable join key. */
export function featureKey(feature: Feature): string | null {
  const props = (feature.properties || {}) as Record<string, unknown>;
  const k = props[FEATURE_KEY];
  return typeof k === "string" ? k : null;
}
