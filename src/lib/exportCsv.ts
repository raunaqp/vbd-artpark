// Lightweight CSV export utility — no external deps.
// All exports respect active state, filters, disease and (where relevant) duration.

import {
  getFilteredRegions,
  getFilteredKpi,
  getFilteredHotspots,
  getOutbreakPredictions,
  getRiskForecast,
  getLineListing,
  type DashboardFiltersLike,
} from "@/data/mockData";

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows: Array<Record<string, unknown>>, headers?: string[]): string {
  if (rows.length === 0) return (headers ?? []).join(",") + "\n";
  const cols = headers ?? Object.keys(rows[0]);
  const head = cols.join(",");
  const body = rows.map((r) => cols.map((c) => csvEscape(r[c])).join(",")).join("\n");
  return head + "\n" + body + "\n";
}

function triggerDownload(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

interface ExportContext {
  stateLabel: string;
  diseaseName: string;
  filters: DashboardFiltersLike;
  hotspotLookbackWeeks?: 2 | 4;
}

function scopeSlug(ctx: ExportContext): string {
  const parts = [ctx.stateLabel, ctx.diseaseName];
  if (ctx.filters.district && ctx.filters.district !== "All Districts") parts.push(ctx.filters.district);
  if (ctx.filters.block && ctx.filters.block !== "All Blocks") parts.push(ctx.filters.block);
  return parts.map((p) => p.replace(/\s+/g, "_")).join("-");
}

function todayStamp(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

// ─── Exports ──────────────────────────────────────────────────────────

export function exportSummaryCsv(ctx: ExportContext) {
  const kpi = getFilteredKpi(ctx.filters);
  const regions = getFilteredRegions(ctx.filters);
  const meta = [
    { metric: "State", value: ctx.stateLabel },
    { metric: "Disease", value: ctx.diseaseName },
    { metric: "District", value: ctx.filters.district ?? "All Districts" },
    { metric: "Block", value: ctx.filters.block ?? "All Blocks" },
    { metric: "From", value: ctx.filters.fromDate ?? "" },
    { metric: "To", value: ctx.filters.toDate ?? "" },
    { metric: "Suspected", value: kpi.suspected },
    { metric: "Tested", value: kpi.tested },
    { metric: "Confirmed", value: kpi.confirmed },
    { metric: "High-risk areas", value: regions.filter((r) => r.risk === "high").length },
    { metric: "Moderate-risk areas", value: regions.filter((r) => r.risk === "moderate").length },
    { metric: "Areas in scope", value: regions.length },
  ];
  triggerDownload(`summary-${scopeSlug(ctx)}-${todayStamp()}.csv`, toCsv(meta, ["metric", "value"]));
}

export function exportLineListingCsv(ctx: ExportContext) {
  const rows = getLineListing(ctx.filters).map((r) => ({
    patient: r.patient,
    gender: r.gender,
    age: r.age,
    district: r.district,
    block: r.block,
    village: r.village,
    diagnosis: r.diagnosis,
    test_type: r.testType,
    test_result: r.testResult,
    date_of_testing: r.dateOfTesting,
    urban_rural: r.urbanRural,
    referred_by: r.referredBy,
  }));
  const headers = ["patient", "gender", "age", "district", "block", "village", "diagnosis", "test_type", "test_result", "date_of_testing", "urban_rural", "referred_by"];
  triggerDownload(`line-listing-${scopeSlug(ctx)}-${todayStamp()}.csv`, toCsv(rows, headers));
}

export function exportHotspotCsv(ctx: ExportContext) {
  const lookback = ctx.hotspotLookbackWeeks ?? 4;
  const rows = getFilteredHotspots(ctx.filters, lookback).map((h) => ({
    area: h.area,
    parent_district: h.parentDistrict ?? "",
    parent_block: h.parentBlock ?? "",
    cases_current: h.currentCases,
    cases_previous: h.prevCases,
    trend: h.trend,
    risk: h.risk,
    duration_basis: `${lookback}W`,
  }));
  const headers = ["area", "parent_district", "parent_block", "cases_current", "cases_previous", "trend", "risk", "duration_basis"];
  triggerDownload(`hotspots-${lookback}w-${scopeSlug(ctx)}-${todayStamp()}.csv`, toCsv(rows, headers));
}

export function exportForecastCsv(ctx: ExportContext) {
  const weekly = getRiskForecast(ctx.filters);
  const preds = getOutbreakPredictions(ctx.filters);

  const weeklyRows = weekly.map((w) => ({
    section: "weekly_forecast",
    week_label: w.label,
    week_start: w.week,
    projected_cases: w.cases,
    forecast_risk: w.risk,
    area: ctx.filters.district !== "All Districts" ? ctx.filters.district : ctx.stateLabel,
  }));
  const predRows = preds.map((p) => ({
    section: "area_forecast",
    week_label: p.expectedWeek,
    week_start: "",
    projected_cases: "",
    forecast_risk: p.risk,
    area: p.area,
    outbreak_probability: `${p.probability}%`,
    drivers: p.signal,
    parent_district: p.parentDistrict ?? "",
    parent_block: p.parentBlock ?? "",
  }));

  const headers = ["section", "area", "week_label", "week_start", "projected_cases", "forecast_risk", "outbreak_probability", "drivers", "parent_district", "parent_block"];
  triggerDownload(`forecast-${scopeSlug(ctx)}-${todayStamp()}.csv`, toCsv([...weeklyRows, ...predRows], headers));
}
