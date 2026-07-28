// ─────────────────────────────────────────────────────────────────────────
// Case store — localStorage overlay over the base 1,000-case dataset (B.4/B.5)
//
// Two overlays merged over the immutable base cases:
//   • edits    (prismh:case_edits)    — changed fields per UHID
//   • archives (prismh:case_archives) — soft-delete per UHID (B.5)
//
// Accessors:
//   getWorkingCases()   base + edits − archived  → line listing + aggregations
//   getAllCasesMerged() base + edits (incl arch)  → Case Management search
//
// Aggregation refresh uses a DELTA overlay (getCaseDeltasByArea): canonical
// curves stay the base, and edits/archives apply a live +1/−1 per affected
// district/block/ward. Zero when nothing has been changed.
// ─────────────────────────────────────────────────────────────────────────
import { ALL_CASES, type MockCase } from "@/data/mock_line_listing";

const EDITS_KEY = "prismh:case_edits";
const ARCHIVES_KEY = "prismh:case_archives";

// Geography + clinical fields that can be edited, plus optional free-text notes.
export type EditableGeo = Pick<
  MockCase,
  "testType" | "testResult" | "date" | "state" | "stateId" | "district" | "block" | "ward" | "urbanRural"
>;
export type EditFields = Partial<EditableGeo> & { notes?: string };

export interface CaseEdit { edited_at: string; edited_by: string; fields: EditFields; }
export interface CaseArchive { archived_at: string; archived_by: string; }

function load<T>(key: string): Record<string, T> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Record<string, T>) : {};
  } catch {
    return {};
  }
}

let edits = load<CaseEdit>(EDITS_KEY);
let archives = load<CaseArchive>(ARCHIVES_KEY);

const BASE_BY_UHID = new Map(ALL_CASES.map((c) => [c.uhid, c]));

// ── Change notification (components + aggregations re-read on bump) ──
const listeners = new Set<() => void>();
let version = 0;
export function subscribeCaseStore(fn: () => void): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
export function caseStoreVersion(): number { return version; }
function notify() { version++; listeners.forEach((f) => f()); }

function persist() {
  try {
    localStorage.setItem(EDITS_KEY, JSON.stringify(edits));
    localStorage.setItem(ARCHIVES_KEY, JSON.stringify(archives));
  } catch { /* quota / disabled */ }
}

// Merge a single base case with its edit overlay (notes are metadata, not part
// of the case record, so they are dropped from the merged case).
function mergeOne(base: MockCase): MockCase {
  const e = edits[base.uhid];
  if (!e) return base;
  const { notes: _notes, ...geo } = e.fields;
  void _notes;
  return { ...base, ...geo };
}

export function getMergedCase(uhid: string): MockCase | undefined {
  const b = BASE_BY_UHID.get(uhid);
  return b ? mergeOne(b) : undefined;
}
/** Immutable base record — edits are always diffed against this. */
export function getBaseCase(uhid: string): MockCase | undefined {
  return BASE_BY_UHID.get(uhid);
}
export function getCaseNotes(uhid: string): string { return edits[uhid]?.fields.notes ?? ""; }
export function getCaseEdit(uhid: string): CaseEdit | undefined { return edits[uhid]; }
export function isArchived(uhid: string): boolean { return !!archives[uhid]; }

/** Working set for the line listing + aggregations (excludes archived). */
export function getWorkingCases(): MockCase[] {
  return ALL_CASES.filter((c) => !archives[c.uhid]).map(mergeOne);
}

/** Full merged set for Case Management search (includes archived). */
export function getAllCasesMerged(): MockCase[] {
  return ALL_CASES.map(mergeOne);
}

// ── Mutations ──
export function saveCaseEdit(uhid: string, fields: EditFields, editedBy: string) {
  edits[uhid] = { edited_at: new Date().toISOString(), edited_by: editedBy, fields };
  persist();
  notify();
}
export function archiveCase(uhid: string, by: string) {
  archives[uhid] = { archived_at: new Date().toISOString(), archived_by: by };
  persist();
  notify();
}
export function restoreCase(uhid: string) {
  delete archives[uhid];
  persist();
  notify();
}

// ── Delta overlay for aggregations ──
// Net per-area change vs each case's ORIGINAL placement:
//   moved ward A→B  → A: −1, B: +1
//   archived        → effective area: −1
//   unchanged       → cancels to 0
export function getCaseDeltasByArea(): Record<string, number> {
  const delta: Record<string, number> = {};
  const add = (name: string | undefined, n: number) => {
    if (name) delta[name] = (delta[name] || 0) + n;
  };
  const touched = new Set([...Object.keys(edits), ...Object.keys(archives)]);
  for (const uhid of touched) {
    const base = BASE_BY_UHID.get(uhid);
    if (!base) continue;
    // Remove the original placement.
    add(base.district, -1);
    add(base.block, -1);
    add(base.ward, -1);
    // Add back the effective placement unless archived.
    if (!archives[uhid]) {
      const eff = mergeOne(base);
      add(eff.district, 1);
      add(eff.block, 1);
      add(eff.ward, 1);
    }
  }
  return delta;
}
