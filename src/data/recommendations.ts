// Recommendation engine (R3.3) — one recommended action per ward.
//
// Implements the loop the design doc describes: the forecast said this ward was
// high risk; did fogging happen, are breeding sites still open, did surveys
// cover it? The answer is a single action, never a paragraph.
// See docs/design/PREDICTION_VS_OPERATIONS.md.
//
// Two rules about where the inputs come from:
//
//  1. `forecast_risk` is the app's live risk, derived exactly the way the region
//     builders in `canonical.ts` derive it (hierarchy forecast for the ward,
//     falling back to its district's legacy risk). The ward manifest also ships
//     a `forecast_risk`, but that one is advisory — it only records the tier the
//     synthetic observations were generated for. See known_debt.md.
//
//  2. The observations (fogging, breeding, larval indices) come from the R3
//     datasets via `src/data/r3/loader.ts`, which re-keys app wards onto
//     manifest wards. Also in known_debt.md.

import {
  getDistrictMetric,
  getForecastForGeography,
  levelToLegacy,
  type HForecastLevel,
} from "@/data/canonical";
import {
  ensureManifestIndex,
  getBreedingAggregation,
  getFoggingStatus,
  getLatestLarvalIndices,
  loadConfigAssumptions,
  loadRecommendationRules,
  type ConfigAssumptions,
  type RecommendationRule,
} from "@/data/r3/loader";

export interface WardRecommendation {
  action_text: string;
  priority: "urgent" | "routine";
  trigger_reason: string;
  protocol_reference: string;
  /** Index into RECOMMENDATION_RULES. */
  triggered_by_rule_id: number;
}

/** Everything a rule is allowed to look at. */
export interface WardContext {
  ward_key: string;
  /** App-derived, not manifest-derived. */
  forecast_risk: "high" | "moderate" | "low";
  fogging_status: "recent" | "due" | "overdue" | "no_record" | null;
  days_since_last_fogging: number | null;
  major_open: number;
  minor_open: number;
  coverage_tier: "high" | "medium" | "low" | "no_data" | null;
  bi: number | null;
  hi: number | null;
  ci: number | null;
  any_outbreak_threshold_breached: boolean;
}

// ──────────────── Ward risk, app-side ────────────────

/**
 * The app's risk for one ward — the same two lines `leafToRegion` in
 * `canonical.ts` runs, so a recommendation can never disagree with the risk
 * shown next to it on screen.
 */
export function getAppWardRisk(
  stateLabel: string,
  district: string,
  block: string,
  ward: string,
): "high" | "moderate" | "low" {
  const f = getForecastForGeography(district, block, ward);
  if (f?.level) return levelToLegacy(f.level as HForecastLevel);
  return getDistrictMetric(stateLabel, district)?.legacyRisk ?? "low";
}

// ──────────────── Rule matching ────────────────
//
// RECOMMENDATION_RULES stores its conditions as strings
// ("forecast_risk === 'high' && fogging_status === 'overdue'"). Those are never
// evaluated — no `eval`, no `new Function`. Each condition string is instead a
// key into the predicate table below, so the generated config stays canonical
// and untouched while the logic lives in real, typechecked TypeScript.
//
// If the generator ever emits a condition not listed here, that rule is skipped
// and a warning is logged once — a rule that silently matched nothing would be
// much worse than a loud one.

type Predicate = (ctx: WardContext, cfg: ConfigAssumptions) => boolean;

const MATCHERS: Record<string, Predicate> = {
  "forecast_risk === 'high' && fogging_status === 'overdue'": (c) =>
    c.forecast_risk === "high" && c.fogging_status === "overdue",

  "forecast_risk === 'high' && major_open >= 3": (c) =>
    c.forecast_risk === "high" && c.major_open >= 3,

  // The condition string hardcodes `bi > 5`; the same 5 is also in
  // CONFIG_ASSUMPTIONS.vector_index_outbreak.bi_threshold. Read it from config
  // so the Admin → Assumptions tab stays the single source of truth once
  // thresholds become editable.
  "forecast_risk === 'high' && bi > 5": (c, cfg) =>
    c.forecast_risk === "high" && c.bi !== null && c.bi > cfg.vector_index_outbreak.bi_threshold,

  "forecast_risk === 'high' && coverage_tier === 'low'": (c) =>
    c.forecast_risk === "high" && c.coverage_tier === "low",

  "forecast_risk === 'moderate' && fogging_status === 'overdue'": (c) =>
    c.forecast_risk === "moderate" && c.fogging_status === "overdue",

  "forecast_risk === 'moderate' && major_open >= 2": (c) =>
    c.forecast_risk === "moderate" && c.major_open >= 2,

  "forecast_risk === 'moderate' && coverage_tier === 'low'": (c) =>
    c.forecast_risk === "moderate" && c.coverage_tier === "low",

  "forecast_risk === 'low' && any_outbreak_threshold_breached": (c) =>
    c.forecast_risk === "low" && c.any_outbreak_threshold_breached,

  // Terminal rule — always matches, so a ward always gets exactly one action.
  default: () => true,
};

const warnedConditions = new Set<string>();

export function matchRule(
  ctx: WardContext,
  rule: RecommendationRule,
  cfg: ConfigAssumptions,
): boolean {
  const predicate = MATCHERS[rule.condition];
  if (!predicate) {
    if (!warnedConditions.has(rule.condition)) {
      warnedConditions.add(rule.condition);
      console.warn(
        `[recommendations] no matcher for condition "${rule.condition}" — rule skipped. ` +
          "Add it to MATCHERS in src/data/recommendations.ts.",
      );
    }
    return false;
  }
  return predicate(ctx, cfg);
}

// ──────────────── Trigger reason ────────────────
//
// Why this ward, in the officer's words — the observed facts that fired the
// rule, not a restatement of the condition string.

function triggerReason(ctx: WardContext, condition: string): string {
  const risk = `${ctx.forecast_risk} risk`;
  switch (condition) {
    case "forecast_risk === 'high' && fogging_status === 'overdue'":
    case "forecast_risk === 'moderate' && fogging_status === 'overdue'":
      return ctx.days_since_last_fogging !== null
        ? `${risk}; fogging overdue — ${ctx.days_since_last_fogging} days since last round`
        : `${risk}; fogging overdue`;

    case "forecast_risk === 'high' && major_open >= 3":
    case "forecast_risk === 'moderate' && major_open >= 2":
      return `${risk}; ${ctx.major_open} major breeding sites still open`;

    case "forecast_risk === 'high' && bi > 5":
      return `${risk}; Breteau Index ${ctx.bi} above outbreak threshold`;

    case "forecast_risk === 'high' && coverage_tier === 'low'":
    case "forecast_risk === 'moderate' && coverage_tier === 'low'":
      return `${risk}; larval survey coverage low`;

    case "forecast_risk === 'low' && any_outbreak_threshold_breached":
      return `${risk}, but vector indices breached threshold (BI ${ctx.bi}, HI ${ctx.hi}%, CI ${ctx.ci}%)`;

    default:
      return ctx.fogging_status === "no_record"
        ? `${risk}; no anomalies flagged, no fogging on record`
        : `${risk}; no anomalies flagged`;
  }
}

// ──────────────── Ward context assembly ────────────────

/** Parse an app ward key (`state|district|block|ward`). */
function parseWardKey(
  wardKey: string,
): { state: string; district: string; block: string; ward: string } | null {
  const parts = wardKey.split("|");
  if (parts.length !== 4) return null;
  const [state, district, block, ward] = parts;
  if (!state || !district || !block || !ward) return null;
  return { state, district, block, ward };
}

/** Assemble everything the rules read for one ward. Exported for the Admin tab. */
export async function getWardContext(wardKey: string): Promise<WardContext | null> {
  const parsed = parseWardKey(wardKey);
  if (!parsed) return null;

  await ensureManifestIndex();
  const [fogging, breeding, larval] = await Promise.all([
    getFoggingStatus(wardKey),
    getBreedingAggregation(wardKey),
    getLatestLarvalIndices(wardKey),
  ]);

  return {
    ward_key: wardKey,
    forecast_risk: getAppWardRisk(parsed.state, parsed.district, parsed.block, parsed.ward),
    fogging_status: fogging?.fogging_status ?? null,
    days_since_last_fogging: fogging?.days_since_last_fogging ?? null,
    major_open: breeding?.major_open ?? 0,
    minor_open: breeding?.minor_open ?? 0,
    coverage_tier: larval?.coverage_tier ?? null,
    bi: larval?.bi ?? null,
    hi: larval?.hi ?? null,
    ci: larval?.ci ?? null,
    any_outbreak_threshold_breached: larval?.any_outbreak_threshold_breached ?? false,
  };
}

// ──────────────── Public entry point ────────────────

/**
 * The one recommended action for a ward. Rules are evaluated in file order and
 * the first match wins, so urgent rules must precede routine ones in the
 * generated config — they do.
 *
 * Returns null only when the ward key is malformed. A well-formed ward always
 * gets an action, because the terminal `default` rule always matches.
 *
 * `filters` is accepted but unused: the Response tab already filters upstream
 * (`enumerateWards` applies district/block/ward) and calls this per ward. The
 * parameter is kept so callers that want to pass scope don't need a signature
 * change later.
 */
export async function getWardRecommendation(
  wardKey: string,
  filters?: { state?: string; district?: string },
): Promise<WardRecommendation | null> {
  void filters;

  const ctx = await getWardContext(wardKey);
  if (!ctx) return null;

  const [rules, cfg] = await Promise.all([loadRecommendationRules(), loadConfigAssumptions()]);

  for (let i = 0; i < rules.length; i += 1) {
    const rule = rules[i];
    if (!matchRule(ctx, rule, cfg)) continue;
    return {
      action_text: rule.action_text,
      priority: rule.priority === "urgent" ? "urgent" : "routine",
      trigger_reason: triggerReason(ctx, rule.condition),
      protocol_reference: rule.protocol_reference,
      triggered_by_rule_id: i,
    };
  }

  // Unreachable while the config keeps its terminal `default` rule.
  return null;
}
