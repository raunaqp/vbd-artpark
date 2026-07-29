// R3.3 verification harness — recommendation engine.
//
// Run with:  npx vite-node scripts/r3/verify_r3_3.ts
//
// Browser verification is deferred to R3.5, so this stands in: it runs
// getWardRecommendation over every app ward in all four states and reports
// which rules fire, where, and whether any rule is unreachable.

import { enumerateWards } from "@/features/weeklyResponse/effectiveness";
import { larvalWardKey } from "@/data/mock_larval_surveys";
import type { DashboardFiltersLike } from "@/data/mockData";
import { loadRecommendationRules } from "@/data/r3/loader";
import { getWardContext, getWardRecommendation } from "@/data/recommendations";

const STATES = ["GBA Central", "Karnataka", "Odisha", "Andhra Pradesh"];

const NO_FILTERS: DashboardFiltersLike = {
  district: "All Districts",
  block: "All Blocks",
  ward: "All Wards",
  areaType: "all",
  fromDate: "",
  toDate: "",
} as DashboardFiltersLike;

function appWardKeys(state: string): string[] {
  return enumerateWards(state, NO_FILTERS).map((w) =>
    larvalWardKey(state, w.district, w.block, w.ward),
  );
}

function rule(title: string) {
  console.log(`\n${"─".repeat(76)}\n${title}\n${"─".repeat(76)}`);
}

async function main() {
  const rules = await loadRecommendationRules();

  // ruleId → state → count, plus one example ward per (ruleId, state).
  const tally: Record<number, Record<string, number>> = {};
  const example: Record<number, Record<string, string>> = {};
  for (let i = 0; i < rules.length; i += 1) {
    tally[i] = {};
    example[i] = {};
    for (const s of STATES) tally[i][s] = 0;
  }

  let total = 0;
  let nulls = 0;
  const allKeys: Record<string, string[]> = {};

  for (const state of STATES) {
    const keys = appWardKeys(state);
    allKeys[state] = keys;
    for (const key of keys) {
      const rec = await getWardRecommendation(key);
      total += 1;
      if (!rec) {
        nulls += 1;
        continue;
      }
      const id = rec.triggered_by_rule_id;
      tally[id][state] += 1;
      if (!example[id][state]) example[id][state] = key;
    }
  }

  rule("1. Rule coverage — every rule, every state");
  console.log(`wards evaluated: ${total}   null recommendations: ${nulls}\n`);
  const header = ["rule", "priority", ...STATES.map((s) => s.slice(0, 12)), "total", "action"];
  console.log(
    `${header[0].padEnd(5)}${header[1].padEnd(9)}` +
      STATES.map((s) => s.slice(0, 12).padStart(13)).join("") +
      "  total   action",
  );
  const unreachable: number[] = [];
  for (let i = 0; i < rules.length; i += 1) {
    const perState = STATES.map((s) => tally[i][s]);
    const sum = perState.reduce((a, b) => a + b, 0);
    if (sum === 0) unreachable.push(i);
    console.log(
      `${String(i).padEnd(5)}${rules[i].priority.padEnd(9)}` +
        perState.map((n) => String(n).padStart(13)).join("") +
        `  ${String(sum).padStart(5)}   ${rules[i].action_text}`,
    );
  }

  rule("2. One worked example per rule that fired");
  for (let i = 0; i < rules.length; i += 1) {
    const state = STATES.find((s) => example[i][s]);
    if (!state) {
      console.log(`\n  rule ${i}: NEVER FIRES — ${rules[i].condition}`);
      continue;
    }
    const key = example[i][state];
    const [ctx, rec] = await Promise.all([getWardContext(key), getWardRecommendation(key)]);
    console.log(`\n  rule ${i}  (${rules[i].condition})`);
    console.log(`    ward     : ${key}`);
    console.log(
      `    context  : risk=${ctx?.forecast_risk} fogging=${ctx?.fogging_status}` +
        ` (${ctx?.days_since_last_fogging}d) major_open=${ctx?.major_open}` +
        ` coverage=${ctx?.coverage_tier} BI=${ctx?.bi} breach=${ctx?.any_outbreak_threshold_breached}`,
    );
    console.log(`    action   : ${rec?.action_text}  [${rec?.priority}]`);
    console.log(`    reason   : ${rec?.trigger_reason}`);
    console.log(`    protocol : ${rec?.protocol_reference}`);
  }

  rule("3. Named hand-verification cases from the R3 brief");

  // Case A — BBMP East high-risk ward with overdue fogging → rule 0.
  // Case B — BBMP South high-risk ward with >=3 major breeding sites → rule 1.
  // Case C — Karnataka rural low-risk ward, no anomalies → default rule.
  const findCase = async (
    label: string,
    keys: string[],
    want: (ctx: NonNullable<Awaited<ReturnType<typeof getWardContext>>>) => boolean,
    expectRule: number,
  ) => {
    for (const key of keys) {
      const ctx = await getWardContext(key);
      if (!ctx || !want(ctx)) continue;
      const rec = await getWardRecommendation(key);
      const ok = rec?.triggered_by_rule_id === expectRule;
      console.log(`\n  ${ok ? "PASS" : "FAIL"}  ${label}`);
      console.log(`    ward   : ${key}`);
      console.log(
        `    context: risk=${ctx.forecast_risk} fogging=${ctx.fogging_status}` +
          ` major_open=${ctx.major_open} coverage=${ctx.coverage_tier}` +
          ` BI=${ctx.bi} breach=${ctx.any_outbreak_threshold_breached}`,
      );
      console.log(`    got    : rule ${rec?.triggered_by_rule_id} — "${rec?.action_text}"`);
      console.log(`    want   : rule ${expectRule} — "${rules[expectRule].action_text}"`);
      return;
    }
    console.log(`\n  NOT FOUND  ${label} — no ward in scope matches these conditions`);
  };

  const gba = allKeys["GBA Central"];
  await findCase(
    "BBMP East, high risk + fogging overdue → rule 0",
    gba.filter((k) => k.includes("|BBMP East|")),
    (c) => c.forecast_risk === "high" && c.fogging_status === "overdue",
    0,
  );
  await findCase(
    "BBMP South, high risk + >=3 major breeding sites open → rule 1",
    gba.filter((k) => k.includes("|BBMP South|")),
    (c) => c.forecast_risk === "high" && c.major_open >= 3 && c.fogging_status !== "overdue",
    1,
  );
  // Resolved by condition, not hardcoded — rule indices shift whenever the
  // generator inserts a rule (7b moved `default` from 8 to 9).
  const defaultRuleId = rules.findIndex((r) => r.condition === "default");
  const highFallbackId = rules.findIndex((r) => r.condition === "forecast_risk === 'high'");

  await findCase(
    `Karnataka rural, low risk + no anomalies → rule ${defaultRuleId} (default)`,
    allKeys["Karnataka"],
    (c) =>
      c.forecast_risk === "low" &&
      !c.any_outbreak_threshold_breached &&
      c.fogging_status !== "overdue",
    defaultRuleId,
  );

  if (highFallbackId >= 0) {
    await findCase(
      `High risk, everything current → rule ${highFallbackId} (high-risk fallback)`,
      [...allKeys["GBA Central"], ...allKeys["Karnataka"]],
      (c) =>
        c.forecast_risk === "high" &&
        c.fogging_status !== "overdue" &&
        c.major_open < 3 &&
        c.coverage_tier !== "low" &&
        (c.bi ?? 0) <= 5,
      highFallbackId,
    );
  }

  rule("4. Verdict");
  console.log(`  rules defined     : ${rules.length}`);
  console.log(`  rules that fired  : ${rules.length - unreachable.length}`);
  if (unreachable.length) {
    console.log(`  UNREACHABLE rules : ${unreachable.join(", ")}`);
    for (const i of unreachable) console.log(`      ${i}: ${rules[i].condition}`);
  } else {
    console.log("  UNREACHABLE rules : none");
  }
  const statesMissingAny = STATES.filter((s) =>
    Object.keys(tally).some((i) => tally[Number(i)][s] === 0),
  );
  console.log(
    `  states where some rule never fires: ${statesMissingAny.length ? statesMissingAny.join(", ") : "none"}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
