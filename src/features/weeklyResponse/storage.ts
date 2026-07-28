// LocalStorage abstraction — swap for API later without UI rewrites.
// Records are partitioned per (state, disease): key `prismh:actions:{state}:{disease}`.
import type { WeeklyResponseRecord } from "./types";

export const actionsKey = (state: string, disease: string) => `prismh:actions:${state}:${disease}`;

// ── Seed versioning ──────────────────────────────────────────────────
// Bump SEED_VERSION whenever the seed DATA SHAPE changes (e.g. fde213c
// reconciled ward names to canonical). On boot, migrateSeeds() clears stale
// action seeds so seedIfEmpty regenerates them from the current code. This
// auto-heals returning browsers that were seeded by an older build.
export const SEED_VERSION = 2; // v1 = legacy ward names (pre-fde213c); v2 = canonical
const SEED_VERSION_KEY = "prismh:seed_version";

/**
 * Run once on app boot, BEFORE any seedIfEmpty. If the stored seed version is
 * older than SEED_VERSION, clear every `prismh:actions:*` key (regenerated from
 * code) and record the new version. Never touches case_edits / case_archives /
 * admin:* — that's user-generated data. Silent when already current.
 */
export function migrateSeeds(): void {
  try {
    const raw = localStorage.getItem(SEED_VERSION_KEY);
    // Anything pre-existing without a version marker is treated as v1.
    const old = raw !== null && Number.isFinite(Number(raw)) ? Number(raw) : 1;
    if (old >= SEED_VERSION) return; // up to date → silent
    Object.keys(localStorage)
      .filter((k) => k.startsWith("prismh:actions:"))
      .forEach((k) => localStorage.removeItem(k));
    localStorage.setItem(SEED_VERSION_KEY, String(SEED_VERSION));
    console.log(`[PRISM-H] Seed migrated from v${old} to v${SEED_VERSION}.`);
  } catch { /* storage disabled */ }
}

export interface WeeklyResponseStore {
  getAll(state: string, disease: string): WeeklyResponseRecord[];
  upsert(state: string, disease: string, record: WeeklyResponseRecord): WeeklyResponseRecord;
  remove(state: string, disease: string, id: string): void;
  seedIfEmpty(state: string, disease: string, records: WeeklyResponseRecord[]): void;
}

function read(state: string, disease: string): WeeklyResponseRecord[] {
  try {
    const raw = localStorage.getItem(actionsKey(state, disease));
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function write(state: string, disease: string, records: WeeklyResponseRecord[]) {
  localStorage.setItem(actionsKey(state, disease), JSON.stringify(records));
  // Fire an event so other hook instances refresh
  window.dispatchEvent(new CustomEvent("prism-weekly-response-changed"));
}

export const weeklyResponseStorage: WeeklyResponseStore = {
  getAll: read,
  upsert(state, disease, record) {
    const all = read(state, disease);
    const idx = all.findIndex((r) => r.id === record.id);
    if (idx >= 0) all[idx] = record;
    else all.push(record);
    write(state, disease, all);
    return record;
  },
  remove(state, disease, id) {
    write(state, disease, read(state, disease).filter((r) => r.id !== id));
  },
  seedIfEmpty(state, disease, records) {
    if (read(state, disease).length > 0) return;
    write(state, disease, records);
  },
};
