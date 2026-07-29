// Smoke test: Priority Action Table row resolver (R4.4.1).
//
// Run with:  npx vite-node scripts/r3/smoke/verify_priority_rows.ts
//
// Not part of the app bundle. Builds the state-wide priority rows for each
// state, dumps the top 20 by composite score, and checks the properties the
// table depends on: unfiltered enumeration, score bounds, sort stability,
// determinism, and that `scopeRows` reproduces a filtered resolve exactly.

import { stateLabelFromId } from "@/data/canonical";
import type { DashboardFiltersLike } from "@/data/mockData";
import { latestEpiWeek } from "@/lib/epiWeek";
import { enumerateWards } from "@/features/weeklyResponse/effectiveness";
import {
  buildPriorityRows,
  scopeRows,
  MAX_PRIORITY_SCORE,
  type PriorityRow,
} from "@/features/weeklyResponse/priorityRows";

const STATE_IDS = ["gba_central", "karnataka", "odisha", "andhra_pradesh"];

const filters = (over: Partial<DashboardFiltersLike> = {}): DashboardFiltersLike =>
  ({
    district: "All Districts",
    block: "All Blocks",
    ward: "All Wards",
    areaType: "all",
    fromDate: "",
    toDate: "",
    ...over,
  }) as DashboardFiltersLike;

function line(title: string) {
  console.log(`\n${"─".repeat(96)}\n${title}\n${"─".repeat(96)}`);
}

function dist(rows: PriorityRow[], pick: (r: PriorityRow) => string) {
  const counts: Record<string, number> = {};
  for (const r of rows) {
    const k = pick(r);
    counts[k] = (counts[k] ?? 0) + 1;
  }
  return Object.keys(counts).sort().map((k) => `${k}=${counts[k]}`).join("  ");
}

const pad = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s.padEnd(n));

function fogCell(r: PriorityRow): string {
  if (!r.foggingStatus) return "no record";
  return r.daysSinceLastFogging === null
    ? r.foggingStatus
    : `${r.foggingStatus} ${r.daysSinceLastFogging}d`;
}

function printTop(label: string, rows: PriorityRow[], n = 20) {
  console.log(`\n## ${label} — ${rows.length} wards, top ${n} by composite score\n`);
  console.log(
    `  ${pad("#", 3)}${pad("SCORE", 6)}${pad("WARD", 26)}${pad("BLOCK", 20)}` +
      `${pad("RISK", 11)}${pad("TREND", 8)}${pad("FOGGING", 14)}${pad("BREED", 8)}` +
      `${pad("COVER", 8)}RECOMMENDED ACTION`,
  );
  rows.slice(0, n).forEach((r, i) => {
    console.log(
      `  ${pad(String(i + 1), 3)}${pad(String(r.score), 6)}${pad(r.ward, 26)}${pad(r.block, 20)}` +
        `${pad(r.riskLabel, 11)}${pad(r.trend, 8)}${pad(fogCell(r), 14)}` +
        `${pad(`${r.majorOpen}M/${r.minorOpen}m`, 8)}${pad(r.coverage, 8)}` +
        `${r.recommendation?.action_text ?? "—"}`,
    );
  });
}

async function main() {
  const epiWeek = latestEpiWeek();
  console.log(`epi week: ${epiWeek}   trend window: 4 weeks   max score: ${MAX_PRIORITY_SCORE}`);

  const byState: Record<string, PriorityRow[]> = {};

  line("1. Top 20 wards per state");
  for (const id of STATE_IDS) {
    const label = stateLabelFromId(id as never);
    const t0 = performance.now();
    const rows = await buildPriorityRows(label, epiWeek);
    const ms = Math.round(performance.now() - t0);
    byState[label] = rows;
    printTop(label, rows);
    console.log(`\n  resolved in ${ms} ms`);
  }

  line("2. Enumeration must ignore drill filters — row count == state ward count");
  for (const [label, rows] of Object.entries(byState)) {
    const expected = enumerateWards(label, filters()).length;
    const uniqueKeys = new Set(rows.map((r) => r.wardKey)).size;
    console.log(
      `  ${pad(label, 18)} rows=${pad(String(rows.length), 6)} enumerateWards=${pad(String(expected), 6)}` +
        ` uniqueKeys=${pad(String(uniqueKeys), 6)} match=${rows.length === expected}` +
        ` keysUnique=${uniqueKeys === rows.length}`,
    );
  }

  line("3. Signal distributions — is the score discriminating, or flat?");
  for (const [label, rows] of Object.entries(byState)) {
    const scores = rows.map((r) => r.score);
    const uniqueScores = new Set(scores).size;
    console.log(`\n## ${label}`);
    console.log(`   risk    : ${dist(rows, (r) => r.risk)}`);
    console.log(`   trend   : ${dist(rows, (r) => r.trend)}`);
    console.log(`   fogging : ${dist(rows, (r) => String(r.foggingStatus))}`);
    console.log(`   coverage: ${dist(rows, (r) => r.coverage)}`);
    console.log(
      `   score   : min=${Math.min(...scores)} max=${Math.max(...scores)}` +
        ` median=${scores[Math.floor(scores.length / 2)]} distinct=${uniqueScores}`,
    );
    console.log(`   recommendations resolved: ${rows.filter((r) => r.recommendation).length}/${rows.length}`);
  }

  line("4. Score bounds + sort order");
  let ok = true;
  for (const [label, rows] of Object.entries(byState)) {
    const outOfRange = rows.filter((r) => r.score < 0 || r.score > MAX_PRIORITY_SCORE);
    const misordered = rows.filter((r, i) => i > 0 && rows[i - 1].score < r.score);
    if (outOfRange.length || misordered.length) ok = false;
    console.log(
      `  ${pad(label, 18)} out of [0,${MAX_PRIORITY_SCORE}]: ${outOfRange.length}   descending: ${misordered.length === 0}`,
    );
  }
  console.log(`  all states pass: ${ok}`);

  line("5. Determinism — rebuild and compare row-for-row");
  for (const id of STATE_IDS) {
    const label = stateLabelFromId(id as never);
    const again = await buildPriorityRows(label, epiWeek);
    const prev = byState[label];
    const identical =
      again.length === prev.length &&
      again.every((r, i) => r.wardKey === prev[i].wardKey && r.score === prev[i].score);
    console.log(`  ${pad(label, 18)} identical on rebuild: ${identical}`);
  }

  line("6. scopeRows must equal a filtered resolve — GBA Central, BBMP East");
  const all = byState["GBA Central"];
  const east = scopeRows(all, filters({ district: "BBMP East" }));
  const eastZone1 = scopeRows(all, filters({ district: "BBMP East", block: "East Zone 1" }));
  console.log(`  state-wide        : ${all.length} wards`);
  console.log(`  district BBMP East: ${east.length} wards`);
  console.log(`  block East Zone 1 : ${eastZone1.length} wards`);
  const nested =
    eastZone1.every((r) => east.some((e) => e.wardKey === r.wardKey)) &&
    east.every((r) => all.some((a) => a.wardKey === r.wardKey));
  console.log(`  scopes properly nested: ${nested}`);

  // The whole point of "one resolve, two scopes": the synchronous narrowing has
  // to produce exactly what a second async resolve would have.
  const { buildOperationalWardMap } = await import("@/features/weeklyResponse/operationalWards");
  const asyncEast = await buildOperationalWardMap("GBA Central", filters({ district: "BBMP East" }), epiWeek);
  const sameSize = asyncEast.size === east.length;
  const sameState = east.every((r) => {
    const a = asyncEast.get(r.wardKey);
    return a && a.foggingStatus === r.foggingStatus && a.majorOpen === r.majorOpen && a.coverage === r.coverage;
  });
  console.log(`  matches a filtered async resolve: size=${sameSize} state=${sameState}`);

  line("7. Risk tier — does the raw 4-tier level actually surface a top tier?");
  for (const [label, rows] of Object.entries(byState)) {
    const top = rows.filter((r) => r.risk === "very_high");
    const labels = [...new Set(rows.map((r) => r.riskLabel))].sort();
    console.log(`  ${pad(label, 18)} very_high wards=${pad(String(top.length), 5)} labels seen: ${labels.join(", ")}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
