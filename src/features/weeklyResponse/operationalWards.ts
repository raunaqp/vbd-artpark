// Ward-scope operational state (R4.1) — the synchronous lookup the map and the
// summary tiles read from.
//
// Why this exists: every R3 getter is async (the datasets are lazy-loaded), but
// Leaflet calls `styleFeature` / `styleSubFeature` synchronously on every
// repaint and cannot await. So the whole ward scope is resolved once, up front,
// into a plain Map that the style callbacks can read without blocking.
//
// This also keeps `DashboardMap` out of the R3 loader entirely: the map takes
// the resolved Map as a prop, so the only module that reaches into R3 stays on
// the Response side and the lazy-load boundary holds.
//
// Cost note: both R3 lookups here hit prebuilt per-ward maps
// (FOGGING_STATUS_BY_WARD, BREEDING_AGG_BY_WARD), and larval coverage is a plain
// object lookup, so this is O(wards) map reads — not the linear scan that
// getLatestLarvalIndices does. State-wide worst case is Odisha at 481 wards.

import { getLarvalSurveyCoverage, larvalWardKey, type SurveyLevel } from "@/data/mock_larval_surveys";
import type { DashboardFiltersLike } from "@/data/mockData";
import {
  ensureManifestIndex,
  getBreedingAggregation,
  getFoggingStatus,
  type FoggingStatus,
} from "@/data/r3/loader";
import { enumerateWards } from "./effectiveness";

/** Larval survey coverage, with an explicit bucket for "no survey recorded". */
export type CoverageLevel = SurveyLevel | "no_data";

/** Everything the operational overlays and the ward-based tiles need, per ward. */
export interface OperationalWardState {
  wardKey: string;
  district: string;
  block: string;
  ward: string;
  /** null when the ward has no fogging record at all. */
  foggingStatus: FoggingStatus["fogging_status"] | null;
  daysSinceLastFogging: number | null;
  majorOpen: number;
  minorOpen: number;
  coverage: CoverageLevel;
}

export type OperationalWardMap = ReadonlyMap<string, OperationalWardState>;

/**
 * Resolve operational state for every ward in the current filter scope.
 *
 * `filters` is applied by `enumerateWards`, so this returns exactly the wards
 * under the active district/block/ward selection — state-wide when nothing is
 * filtered.
 *
 * Keyed by app ward key (`state|district|block|ward`). The R3 loader re-keys
 * onto the manifest internally; callers never see manifest keys.
 */
export async function buildOperationalWardMap(
  stateLabel: string,
  filters: DashboardFiltersLike,
  epiWeek: string,
): Promise<OperationalWardMap> {
  const wards = enumerateWards(stateLabel, filters);

  // Warm the manifest index once rather than letting each getter await it.
  await ensureManifestIndex();

  const entries = await Promise.all(
    wards.map(async (w) => {
      const wardKey = larvalWardKey(stateLabel, w.district, w.block, w.ward);
      const [fogging, breeding] = await Promise.all([
        getFoggingStatus(wardKey),
        getBreedingAggregation(wardKey),
      ]);
      const state: OperationalWardState = {
        wardKey,
        district: w.district,
        block: w.block,
        ward: w.ward,
        foggingStatus: fogging?.fogging_status ?? null,
        daysSinceLastFogging: fogging?.days_since_last_fogging ?? null,
        majorOpen: breeding?.major_open ?? 0,
        minorOpen: breeding?.minor_open ?? 0,
        coverage: getLarvalSurveyCoverage(wardKey, epiWeek) ?? "no_data",
      };
      return [wardKey, state] as const;
    }),
  );

  return new Map(entries);
}

// ──────────────── Derived counts (summary tiles 4 and 5) ────────────────

/** Tile 4 — wards whose fogging is past its cadence tolerance. */
export function countFoggingOverdue(wards: OperationalWardMap): number {
  let n = 0;
  for (const w of wards.values()) if (w.foggingStatus === "overdue") n += 1;
  return n;
}

/** Tile 5 — total major breeding sites still open across the scope. */
export function sumMajorBreedingOpen(wards: OperationalWardMap): number {
  let n = 0;
  for (const w of wards.values()) n += w.majorOpen;
  return n;
}
