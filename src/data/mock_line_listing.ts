// ─────────────────────────────────────────────────────────────────────────
// Mock line listing — 1,000 demo dengue cases (B.2)
//
// Cases are GENERATED DETERMINISTICALLY at module load (seeded PRNG + fixed
// epi-week dates), so UHIDs and every field are stable across reloads. That
// stability is required for case management (edit/archive keyed by UHID).
//
// Distribution:
//   • Cases are allocated across districts proportional to each district's
//     dengue PEAK intensity (max weekly_total) — higher-burden districts get
//     more cases.
//   • Within a district, cases fall on wards/villages weighted by leaf burden,
//     and the case date is sampled from that leaf's weekly curve — so the
//     date spread matches each area's temporal shape across the 36-week window.
//   • Urban wards come from municipalities; rural villages from blocks.
//
// This is mock demo data — not real patient records. Contains NO PII (no
// names, no phone); UHID is a synthetic identifier.
// ─────────────────────────────────────────────────────────────────────────
import { getDistrictMetrics } from "./canonical";
import { WEEK_ENDINGS } from "./mock_dataset";
import type { StateId, LineListing } from "./mockData";

export interface MockCase {
  uhid: string;
  stateId: StateId;
  state: string;        // display label, e.g. "Karnataka"
  district: string;
  block: string;        // block / municipality / zone
  ward: string;         // ward / village
  age: number;
  gender: "Male" | "Female";
  testType: "NS1" | "IgM" | "RDT";
  testResult: "Positive" | "Negative";
  date: string;         // ISO yyyy-mm-dd, within the 36-week window
  urbanRural: "Urban" | "Rural";
  diagnosis: "Dengue";
  referredBy: string;
}

const TOTAL_CASES = 1000;

const STATES: Array<{ id: StateId; label: string; code: string; base: number }> = [
  { id: "gba_central", label: "GBA Central", code: "GBA", base: 39000 },
  { id: "karnataka", label: "Karnataka", code: "KA", base: 84000 },
  { id: "odisha", label: "Odisha", code: "OD", base: 12000 },
  { id: "andhra_pradesh", label: "Andhra Pradesh", code: "AP", base: 60000 },
];

const REFERRAL_SOURCES = ["ASHA", "ANM", "MO", "HW", "PHC", "CHC"];

// ── Deterministic PRNG (mulberry32), single stream drawn in fixed order ──
function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260728);
const randInt = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];

const peak = (w: number[]) => (w.length ? Math.max(...w) : 0);

// Largest-remainder apportionment so allocations sum EXACTLY to `total`.
function apportion(weights: number[], total: number): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum <= 0) return weights.map(() => 0);
  const raw = weights.map((w) => (w / sum) * total);
  const floors = raw.map(Math.floor);
  let remaining = total - floors.reduce((a, b) => a + b, 0);
  const order = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);
  const out = [...floors];
  for (let k = 0; remaining > 0 && k < order.length; k++, remaining--) out[order[k].i]++;
  return out;
}

// Sample a week index in [0, len) weighted by the weekly curve.
function sampleWeek(weekly: number[]): number {
  const len = Math.min(weekly.length, WEEK_ENDINGS.length);
  if (len <= 0) return 0;
  const total = weekly.slice(0, len).reduce((a, b) => a + Math.max(0, b), 0);
  if (total <= 0) return randInt(0, len - 1);
  let r = rand() * total;
  for (let i = 0; i < len; i++) {
    r -= Math.max(0, weekly[i]);
    if (r <= 0) return i;
  }
  return len - 1;
}

// Epi-week ending date minus 0–6 days → a plausible test date in that week.
function dateInWeek(weekIdx: number): string {
  const iso = WEEK_ENDINGS[Math.min(weekIdx, WEEK_ENDINGS.length - 1)];
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d - randInt(0, 6));
  const p = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`;
}

interface Leaf { block: string; ward: string; weekly: number[]; urbanRural: "Urban" | "Rural"; }

function leavesForDistrict(district: { municipalities: Array<{ name: string; wards: Array<{ name: string; weekly: number[] }> }>; blocks: Array<{ name: string; villages: Array<{ name: string; weekly: number[] }> }> }): Leaf[] {
  const leaves: Leaf[] = [];
  district.municipalities.forEach((m) =>
    m.wards.forEach((w) => leaves.push({ block: m.name, ward: w.name, weekly: w.weekly, urbanRural: "Urban" })),
  );
  district.blocks.forEach((b) =>
    b.villages.forEach((v) => leaves.push({ block: b.name, ward: v.name, weekly: v.weekly, urbanRural: "Rural" })),
  );
  return leaves;
}

function testType(): MockCase["testType"] {
  const r = rand();
  return r < 0.4 ? "NS1" : r < 0.8 ? "IgM" : "RDT"; // 40 / 40 / 20
}

// Age skewed toward younger-working ages but spanning all groups.
function sampleAge(): number {
  const r = rand();
  if (r < 0.18) return randInt(1, 14);
  if (r < 0.72) return randInt(15, 45);
  if (r < 0.92) return randInt(46, 65);
  return randInt(66, 88);
}

function generate(): MockCase[] {
  const cases: MockCase[] = [];

  // Collect each state's districts + district-peak weights.
  const perState = STATES.map((st) => {
    const districts = getDistrictMetrics(st.label);
    const weights = districts.map((d) => peak(d.district.weekly_total));
    return { st, districts, weights, stateWeight: weights.reduce((a, b) => a + b, 0) };
  }).filter((s) => s.districts.length > 0);

  // Apportion the 1,000 total across states by summed district peak,
  // then within each state across its districts.
  const stateTotals = apportion(perState.map((s) => s.stateWeight), TOTAL_CASES);

  perState.forEach((entry, si) => {
    const { st, districts, weights } = entry;
    const stateN = stateTotals[si];
    const perDistrict = apportion(weights, stateN);
    let uhidSeq = 0;

    districts.forEach((dm, di) => {
      const n = perDistrict[di];
      if (n <= 0) return;
      const leaves = leavesForDistrict(dm.district);
      if (!leaves.length) return;
      const leafAlloc = apportion(leaves.map((l) => peak(l.weekly) || 1), n);

      leaves.forEach((leaf, li) => {
        for (let c = 0; c < leafAlloc[li]; c++) {
          const wk = sampleWeek(leaf.weekly);
          const num = st.base + uhidSeq;
          uhidSeq++;
          cases.push({
            uhid: `UHID-${st.code}-${String(num % 1000000).padStart(6, "0")}`,
            stateId: st.id,
            state: st.label,
            district: dm.name,
            block: leaf.block,
            ward: leaf.ward,
            age: sampleAge(),
            gender: rand() < 0.5 ? "Male" : "Female",
            testType: testType(),
            testResult: rand() < 0.82 ? "Positive" : "Negative",
            date: dateInWeek(wk),
            urbanRural: leaf.urbanRural,
            diagnosis: "Dengue",
            referredBy: pick(REFERRAL_SOURCES),
          });
        }
      });
    });
  });

  return cases;
}

/** The full generated base dataset (1,000 cases). Stable across reloads. */
export const ALL_CASES: MockCase[] = generate();

/** Convert a case to the LineListing shape the surveillance table consumes. */
export function caseToLineListing(c: MockCase): LineListing {
  return {
    uhid: c.uhid,
    gender: c.gender,
    age: c.age,
    subDistrict: c.block,
    block: c.block,
    village: c.ward,
    district: c.district,
    diagnosis: c.diagnosis,
    testType: c.testType,
    testResult: c.testResult,
    dateOfTesting: c.date,
    urbanRural: c.urbanRural,
    referredBy: c.referredBy,
  };
}
