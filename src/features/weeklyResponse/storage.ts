// LocalStorage abstraction — swap for API later without UI rewrites.
import type { WeeklyResponseRecord } from "./types";

const KEY = "prism_weekly_response_v1";

export interface WeeklyResponseStore {
  getAll(): WeeklyResponseRecord[];
  upsert(record: WeeklyResponseRecord): WeeklyResponseRecord;
  remove(id: string): void;
  seedIfEmpty(records: WeeklyResponseRecord[]): void;
}

function read(): WeeklyResponseRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function write(records: WeeklyResponseRecord[]) {
  localStorage.setItem(KEY, JSON.stringify(records));
  // Fire an event so other hook instances refresh
  window.dispatchEvent(new CustomEvent("prism-weekly-response-changed"));
}

export const weeklyResponseStorage: WeeklyResponseStore = {
  getAll: read,
  upsert(record) {
    const all = read();
    const idx = all.findIndex((r) => r.id === record.id);
    if (idx >= 0) all[idx] = record;
    else all.push(record);
    write(all);
    return record;
  },
  remove(id) {
    write(read().filter((r) => r.id !== id));
  },
  seedIfEmpty(records) {
    if (read().length > 0) return;
    write(records);
  },
};
