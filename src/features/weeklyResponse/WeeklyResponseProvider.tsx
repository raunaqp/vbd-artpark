import { useMemo, useState, type ReactNode } from "react";
import { useFilters } from "@/contexts/FilterContext";
import { useStateSelection } from "@/contexts/StateContext";
import { getFilteredRegions, getOutbreakPredictions } from "@/data/mockData";
import { getActiveDisease, stateLabelFromId } from "@/data/canonical";
import { EPI_WEEKS, WEEK_ENDINGS, STATE_HIERARCHY_LABELS } from "@/data/mock_dataset";
import { latestEpiWeek, latestWeekEnding } from "@/lib/epiWeek";
import { useWeeklyResponses } from "./useWeeklyResponses";
import { summarizeRow, buildSummary, sortAreaAggregates, type AreaRow, type AreaAggregate } from "./aggregation";
import { makeGeographyId, type RiskLevel } from "./types";
import { WeeklyResponseContext, type WeeklyResponseCtx, type PriorityRow } from "./weeklyResponseContext";
import WeeklyResponseDrawer from "./WeeklyResponseDrawer";
import NoActivityDialog from "./NoActivityDialog";

export function WeeklyResponseProvider({ children }: { children: ReactNode }) {
  const { appliedFilters } = useFilters();
  const { stateId } = useStateSelection();
  const disease = getActiveDisease();
  const { records, upsert } = useWeeklyResponses(stateId, disease);

  const [epiWeek, setEpiWeek] = useState<string>(latestEpiWeek());
  const [selected, setSelected] = useState<AreaAggregate | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [noActivitySelected, setNoActivitySelected] = useState<AreaAggregate | null>(null);
  const [noActivityOpen, setNoActivityOpen] = useState(false);

  const weekEnding = WEEK_ENDINGS[EPI_WEEKS.indexOf(epiWeek)] || WEEK_ENDINGS[WEEK_ENDINGS.length - 1];
  const forecastGeneratedAt = latestWeekEnding();

  const { rows, areaLabel } = useMemo(() => {
    const regions = getFilteredRegions(appliedFilters);
    const level: AreaRow["level"] =
      appliedFilters.block !== "All Blocks" ? "ward"
      : appliedFilters.district !== "All Districts" ? "block"
      : "district";
    // State-aware area noun (e.g. GBA state level → "corporations", not "districts").
    const hier = STATE_HIERARCHY_LABELS[stateLabelFromId(stateId)] ?? STATE_HIERARCHY_LABELS["Karnataka"];
    const pluralLower = (s: string) =>
      s.split("/").map((t) => t.trim().toLowerCase()).map((w) => (w.endsWith("y") ? `${w.slice(0, -1)}ies` : `${w}s`)).join("/");
    const label = level === "ward" ? pluralLower(hier.level_3) : level === "block" ? pluralLower(hier.level_2) : pluralLower(hier.level_1);

    const rows: AreaRow[] = regions.map((r) => {
      const district = level === "district" ? r.name : appliedFilters.district;
      const block = level === "block" ? r.name : (level === "ward" ? appliedFilters.block : null);
      const ward = level === "ward" ? r.name : null;
      const risk: RiskLevel = (r.risk || "no_data") as RiskLevel;
      return { key: makeGeographyId(stateId, district, block, ward), name: r.name, type: r.type, risk, level, district, block, ward };
    });
    return { rows, areaLabel: label };
  }, [appliedFilters, stateId]);

  // Forecast window + driver per area, joined by name (reuses forecast outputs).
  const predictionByArea = useMemo(() => {
    const map = new Map<string, { window: string; reason: string }>();
    for (const p of getOutbreakPredictions(appliedFilters)) {
      map.set(p.area, { window: p.expectedWeek, reason: p.signal });
    }
    return map;
  }, [appliedFilters]);

  const weekRecords = useMemo(
    () => records.filter((r) => r.state === stateId && r.epidemiological_week === epiWeek),
    [records, stateId, epiWeek],
  );

  const aggregates = useMemo(() => rows.map((row) => summarizeRow(row, weekRecords)), [rows, weekRecords]);
  const summary = useMemo(() => buildSummary(aggregates), [aggregates]);

  const priorityRows: PriorityRow[] = useMemo(() => {
    const priority = aggregates.filter((a) => a.row.risk === "high" || a.row.risk === "moderate");
    return sortAreaAggregates(priority).map((agg) => {
      const p = predictionByArea.get(agg.row.name);
      return {
        agg,
        window: p?.window || "Next 4 weeks",
        reason: p?.reason || (agg.row.risk === "high" ? "High forecast outbreak risk" : "Elevated forecast risk"),
      };
    });
  }, [aggregates, predictionByArea]);

  const scopedRecords = useMemo(
    () => weekRecords.filter((r) => aggregates.some((a) => a.records.includes(r))),
    [weekRecords, aggregates],
  );

  const openDrawer = (agg: AreaAggregate) => { setSelected(agg); setDrawerOpen(true); };
  const openNoActivity = (agg: AreaAggregate) => { setNoActivitySelected(agg); setNoActivityOpen(true); };

  const value: WeeklyResponseCtx = {
    epiWeek, setEpiWeek, weekEnding, forecastGeneratedAt, areaLabel,
    aggregates, priorityRows, summary, scopedRecords, allRecords: records, openDrawer, openNoActivity,
  };

  return (
    <WeeklyResponseContext.Provider value={value}>
      {children}
      <WeeklyResponseDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        agg={selected}
        stateId={stateId}
        epiWeek={epiWeek}
        weekEnding={weekEnding}
        forecastGeneratedAt={forecastGeneratedAt}
        onSave={upsert}
        historyRecords={records.filter((r) => r.state === stateId)}
      />
      <NoActivityDialog
        open={noActivityOpen}
        onOpenChange={setNoActivityOpen}
        agg={noActivitySelected}
        stateId={stateId}
        epiWeek={epiWeek}
        forecastGeneratedAt={forecastGeneratedAt}
        onSave={upsert}
      />
    </WeeklyResponseContext.Provider>
  );
}
