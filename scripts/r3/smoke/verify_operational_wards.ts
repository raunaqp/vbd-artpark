// Smoke test: ward-scope operational resolver (R4.1).
//
// Run with:  npx vite-node scripts/r3/smoke/verify_operational_wards.ts
//
// Not part of the app bundle. Builds the operational ward map for each state,
// dumps sample entries, and checks the two derived tile counts. Also exercises
// a filtered scope, since the map must shrink to the active district.

import { stateLabelFromId } from "@/data/canonical";
import type { DashboardFiltersLike } from "@/data/mockData";
import { latestEpiWeek } from "@/lib/epiWeek";
import {
  buildOperationalWardMap,
  countFoggingOverdue,
  sumMajorBreedingOpen,
  type OperationalWardMap,
} from "@/features/weeklyResponse/operationalWards";

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
  console.log(`\n${"─".repeat(76)}\n${title}\n${"─".repeat(76)}`);
}

function dist(wards: OperationalWardMap, pick: (w: OperationalWardMap extends ReadonlyMap<string, infer T> ? T : never) => string) {
  const counts: Record<string, number> = {};
  for (const w of wards.values()) {
    const k = pick(w);
    counts[k] = (counts[k] ?? 0) + 1;
  }
  return Object.keys(counts)
    .sort()
    .map((k) => `${k}=${counts[k]}`)
    .join("  ");
}

async function main() {
  const epiWeek = latestEpiWeek();
  console.log(`epi week: ${epiWeek}`);

  line("1. State-wide scope — map size, distributions, tile counts");
  const maps: Record<string, OperationalWardMap> = {};
  for (const id of STATE_IDS) {
    const label = stateLabelFromId(id as never);
    const wards = await buildOperationalWardMap(label, filters(), epiWeek);
    maps[label] = wards;
    console.log(`\n## ${label} — ${wards.size} wards`);
    console.log(`   fogging : ${dist(wards, (w) => String(w.foggingStatus))}`);
    console.log(`   coverage: ${dist(wards, (w) => w.coverage)}`);
    console.log(`   tile 4 (fogging overdue wards): ${countFoggingOverdue(wards)}`);
    console.log(`   tile 5 (major breeding sites open): ${sumMajorBreedingOpen(wards)}`);
  }

  line("2. Sample entries — first 2 wards per state");
  for (const [label, wards] of Object.entries(maps)) {
    console.log(`\n## ${label}`);
    for (const w of [...wards.values()].slice(0, 2)) {
      console.log(`   ${w.wardKey}`);
      console.log(
        `     fogging=${w.foggingStatus} (${w.daysSinceLastFogging}d)  ` +
          `major_open=${w.majorOpen}  minor_open=${w.minorOpen}  coverage=${w.coverage}`,
      );
    }
  }

  line("3. Filtered scope must shrink — GBA Central, BBMP East");
  const all = maps["GBA Central"];
  const east = await buildOperationalWardMap("GBA Central", filters({ district: "BBMP East" }), epiWeek);
  const eastZone1 = await buildOperationalWardMap(
    "GBA Central",
    filters({ district: "BBMP East", block: "East Zone 1" }),
    epiWeek,
  );
  console.log(`  state-wide        : ${all.size} wards`);
  console.log(`  district BBMP East: ${east.size} wards`);
  console.log(`  block East Zone 1 : ${eastZone1.size} wards`);
  const nested = [...eastZone1.keys()].every((k) => east.has(k)) && [...east.keys()].every((k) => all.has(k));
  console.log(`  scopes properly nested: ${nested}`);
  console.log(`  tile 4 state-wide=${countFoggingOverdue(all)} district=${countFoggingOverdue(east)} block=${countFoggingOverdue(eastZone1)}`);
  console.log(`  tile 5 state-wide=${sumMajorBreedingOpen(all)} district=${sumMajorBreedingOpen(east)} block=${sumMajorBreedingOpen(eastZone1)}`);

  line("4. Determinism — rebuild state-wide and compare");
  let stable = true;
  for (const id of STATE_IDS) {
    const label = stateLabelFromId(id as never);
    const again = await buildOperationalWardMap(label, filters(), epiWeek);
    const a = maps[label];
    if (again.size !== a.size) { stable = false; continue; }
    for (const [k, v] of again) {
      const prev = a.get(k);
      if (!prev || prev.foggingStatus !== v.foggingStatus || prev.majorOpen !== v.majorOpen || prev.coverage !== v.coverage) {
        stable = false;
        break;
      }
    }
  }
  console.log(`  identical on rebuild: ${stable}`);

  line("5. Key format check");
  const bad = [...all.keys()].filter((k) => k.split("|").length !== 4);
  console.log(`  keys not in state|district|block|ward form: ${bad.length}`);
  console.log(`  sample key: ${[...all.keys()][0]}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
