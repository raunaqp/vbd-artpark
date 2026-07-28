import { useMemo, useState } from "react";
import { Check, Minus } from "lucide-react";
import Sparkline from "@/components/Sparkline";
import { useFilters } from "@/contexts/FilterContext";
import { useStateSelection } from "@/contexts/StateContext";
import { stateLabelFromId } from "@/data/canonical";
import { buildEffectivenessRows, sortEffRows, trendLabel, isActionGap, type Coverage, type EffRow } from "./effectiveness";
import { useWeeklyResponseContext } from "./weeklyResponseContext";
import { makeGeographyId } from "./types";
import type { AreaAggregate } from "./aggregation";

// Response Effectiveness — joins case rise × larval survey coverage × logged
// action per ward to surface "action gap" wards.
export type EffectivenessWindow = 2 | 4 | 8 | 12;
const WINDOWS: EffectivenessWindow[] = [2, 4, 8, 12];
const ROW_CAP = 30;

// green = high, amber = medium, red = low, grey = no data.
const COVERAGE: Record<Coverage, { label: string; cssVar: string | null }> = {
  high: { label: "High", cssVar: "--risk-low" },
  medium: { label: "Medium", cssVar: "--risk-moderate" },
  low: { label: "Low", cssVar: "--risk-high" },
  no_data: { label: "No data", cssVar: null },
};

function CoveragePill({ coverage }: { coverage: Coverage }) {
  const c = COVERAGE[coverage];
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${c.cssVar ? "" : "bg-muted text-muted-foreground"}`}
      style={c.cssVar ? { backgroundColor: `hsl(var(${c.cssVar}) / 0.15)`, color: `hsl(var(${c.cssVar}))` } : undefined}
    >
      {c.label}
    </span>
  );
}

function actionTooltip(row: EffRow): string {
  const r = row.action;
  if (!r) return "";
  const type = r.activities_performed?.[0] ?? r.actions_taken?.[0] ?? "Response logged";
  const date = r.activity_date ?? r.epidemiological_week;
  return `${type} · ${date}`;
}

export default function ResponseEffectivenessPanel() {
  const [windowWeeks, setWindowWeeks] = useState<EffectivenessWindow>(2);
  const { appliedFilters } = useFilters();
  const { stateId } = useStateSelection();
  const { allRecords, openDrawer } = useWeeklyResponseContext();
  const stateLabel = stateLabelFromId(stateId);

  // Open the existing Log Response drawer pre-filled with this gap ward.
  const logResponse = (r: EffRow) => {
    const key = makeGeographyId(stateId, r.district, r.block, r.ward);
    const agg: AreaAggregate = {
      row: { key, name: r.ward, risk: "high", level: "ward", district: r.district, block: r.block, ward: r.ward },
      records: [],
      hasRecord: false,
      fieldActivity: "none",
      status: "pending",
      reporting: "not_reported",
      personnel: 0,
      areasCovered: 0,
      householdsCovered: 0,
      sourceReduction: 0,
      actionsCount: 0,
    };
    openDrawer(agg);
  };

  const rows = useMemo(
    () => sortEffRows(buildEffectivenessRows(stateLabel, appliedFilters, windowWeeks, allRecords)),
    [stateLabel, appliedFilters, windowWeeks, allRecords],
  );
  const shown = rows.slice(0, ROW_CAP);
  const overflow = rows.length > ROW_CAP;
  const risingCount = rows.filter((r) => r.rise.rising).length;
  const coverageGaps = rows.filter((r) => r.rise.rising && (r.coverage === "low" || r.coverage === "no_data")).length;
  const actionGaps = rows.filter(isActionGap).length;

  return (
    <div className="section-card p-5 space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h3 className="section-title">Response Effectiveness</h3>
          <p className="text-xs text-muted-foreground">
            Where did cases rise? Where did surveys happen? Did actions follow?
          </p>
        </div>
        <div className="tab-nav">
          {WINDOWS.map((w) => (
            <button
              key={w}
              onClick={() => setWindowWeeks(w)}
              className={`tab-nav-item ${windowWeeks === w ? "tab-nav-item-active" : ""}`}
            >
              {w}W
            </button>
          ))}
        </div>
      </div>

      {/* Summary strip — Action Gaps is the headline signal. */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-md border border-border bg-muted/30 px-4 py-3">
          <div className="text-2xl font-semibold text-foreground">{risingCount}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Rising wards · cases rising in the window</div>
        </div>
        <div className="rounded-md border border-border bg-muted/30 px-4 py-3">
          <div className="text-2xl font-semibold text-foreground">{coverageGaps}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Coverage gaps · rising wards with low or no survey</div>
        </div>
        <div
          className="rounded-md border-2 px-4 py-3"
          style={{ borderColor: "hsl(var(--risk-high))", backgroundColor: "hsl(var(--risk-high) / 0.08)" }}
        >
          <div className="text-3xl font-bold" style={{ color: "hsl(var(--risk-high))" }}>{actionGaps}</div>
          <div className="text-xs font-medium text-foreground mt-0.5">Action gaps · rising + low survey + no action logged</div>
        </div>
      </div>

      {actionGaps > 0 ? (
        <p className="text-xs text-muted-foreground">
          Action gap wards are the highest priority for the coming week — cases are rising, surveys are lagging, and no operational response has been logged.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          No action gaps in this window. All rising wards have either survey coverage or logged action.
        </p>
      )}

      {risingCount === 0 && (
        <div className="rounded-md bg-muted/40 border border-border px-3 py-2 text-xs text-muted-foreground">
          No rising cases in the selected window.
        </div>
      )}

      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Ward", "Parent", "Case trend", "Survey coverage", "Action logged"].map((h) => (
                <th key={h} className="text-left py-2 px-2 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={`${r.district}|${r.block}|${r.ward}`} className="border-b border-border/50 hover:bg-muted/30">
                <td className="py-2 px-2 whitespace-nowrap font-medium text-foreground">{r.ward}</td>
                <td className="py-2 px-2 whitespace-nowrap text-muted-foreground">{r.block}</td>
                <td className="py-2 px-2">
                  <div className="flex items-center gap-2">
                    <Sparkline
                      values={r.rise.spark}
                      trend={r.rise.trend === "none" ? "stable" : r.rise.trend}
                      width={64}
                      height={20}
                    />
                    <span className={`text-xs ${r.rise.rising ? "text-risk-high font-medium" : "text-muted-foreground"}`}>
                      {trendLabel(r.rise.trend)}
                    </span>
                  </div>
                </td>
                <td className="py-2 px-2"><CoveragePill coverage={r.coverage} /></td>
                <td className="py-2 px-2">
                  {r.action ? (
                    <span className="inline-flex items-center gap-1 text-risk-low cursor-default" title={actionTooltip(r)}>
                      <Check className="h-4 w-4" />
                    </span>
                  ) : isActionGap(r) ? (
                    <button
                      onClick={() => logResponse(r)}
                      className="inline-flex items-center h-7 px-2 rounded-md text-xs font-medium text-white hover:opacity-90"
                      style={{ backgroundColor: "hsl(var(--risk-high))" }}
                    >
                      Log Response
                    </button>
                  ) : (
                    <Minus className="h-4 w-4 text-muted-foreground" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {overflow && (
        <p className="text-[11px] text-muted-foreground">
          Showing top {ROW_CAP} wards. Filter or drill down to see more.
        </p>
      )}
    </div>
  );
}
