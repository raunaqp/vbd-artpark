// LocalStorage abstraction — swap for API later without UI rewrites.
// Records are partitioned per (state, disease): key `prismh:actions:{state}:{disease}`.
import type { WeeklyResponseRecord } from "./types";

export const actionsKey = (state: string, disease: string) => `prismh:actions:${state}:${disease}`;

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
