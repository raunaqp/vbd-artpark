// Ward history for the detail sheet (R5.1) — section 3, the credibility layer.
//
// Sections 1 and 2 of the sheet answer "what is this ward's state", and every
// field there is already resolved on the `PriorityRow`. This module answers the
// follow-up an officer asks next: *why* is it in that state — when was it last
// fogged and by whom, which sites are still open and how long they have been
// open, what the larval indices have been doing.
//
// All three R3 getters are async, so this is fetched on sheet open rather than
// resolved with the table. One call, three parallel reads.

import {
  getBreedingAggregation,
  getBreedingSitesForWard,
  getFoggingEventsForWard,
  getLarvalIndicesForWard,
  type BreedingAggregation,
  type BreedingSite,
  type FoggingEvent,
  type LarvalIndicesRecord,
} from "@/data/r3/loader";

/** How many past fogging rounds the sheet lists. */
export const FOGGING_EVENT_LIMIT = 5;
/** How many weeks of larval indices the sheet trends. */
export const LARVAL_WEEKS = 4;

export interface WardHistory {
  /** Most recent first, capped at FOGGING_EVENT_LIMIT. */
  foggingEvents: FoggingEvent[];
  /** Open sites only, longest-open first. */
  openBreedingSites: BreedingSite[];
  /** Carries the resolved counts the open list cannot show. */
  breeding: BreedingAggregation | null;
  /** Most recent week first. */
  larval: LarvalIndicesRecord[];
}

export const EMPTY_WARD_HISTORY: WardHistory = {
  foggingEvents: [],
  openBreedingSites: [],
  breeding: null,
  larval: [],
};

/** Newest first. Dates are ISO (YYYY-MM-DD), so string compare is date compare. */
export function lastFoggingEvents(events: FoggingEvent[], limit = FOGGING_EVENT_LIMIT): FoggingEvent[] {
  return [...events].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
}

/**
 * Longest-open first — the site nobody has been back to is the one worth
 * naming, so it sorts above a site reported yesterday.
 */
export function sortOpenSites(sites: BreedingSite[]): BreedingSite[] {
  return [...sites].sort((a, b) => a.last_inspection_date.localeCompare(b.last_inspection_date));
}

/** Newest week first. Larval weeks are ISO (YYYY-Www), so string compare works. */
export function sortLarvalDesc(records: LarvalIndicesRecord[]): LarvalIndicesRecord[] {
  return [...records].sort((a, b) => b.week.localeCompare(a.week));
}

/**
 * Whole days between an ISO date and `now`.
 *
 * `now` is injectable so tests do not depend on the clock — the R3 data is
 * generated relative to a fixed date, so a test asserting "34 days" would
 * otherwise break tomorrow.
 */
export function daysSince(isoDate: string, now: Date = new Date()): number | null {
  const then = new Date(`${isoDate}T00:00:00Z`).getTime();
  if (!Number.isFinite(then)) return null;
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.max(0, Math.round((today - then) / 86_400_000));
}

/**
 * Everything section 3 renders, for one ward.
 *
 * Takes an *app* ward key (`state|district|block|ward`); the R3 loader re-keys
 * onto the manifest internally, exactly as the table's resolver does, so the
 * sheet and the row it opened from read the same synthetic ward.
 */
export async function loadWardHistory(appWardKey: string): Promise<WardHistory> {
  const [events, openSites, breeding, larval] = await Promise.all([
    getFoggingEventsForWard(appWardKey),
    getBreedingSitesForWard(appWardKey, "open"),
    getBreedingAggregation(appWardKey),
    getLarvalIndicesForWard(appWardKey, LARVAL_WEEKS),
  ]);

  return {
    foggingEvents: lastFoggingEvents(events),
    openBreedingSites: sortOpenSites(openSites),
    breeding,
    larval: sortLarvalDesc(larval).slice(0, LARVAL_WEEKS),
  };
}
