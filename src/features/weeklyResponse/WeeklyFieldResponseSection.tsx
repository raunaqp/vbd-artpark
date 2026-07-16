import { useMemo, useState } from "react";
import { useFilters } from "@/contexts/FilterContext";
import { useStateSelection } from "@/contexts/StateContext";
import { getFilteredRegions } from "@/data/mockData";
import { EPI_WEEKS, WEEK_ENDINGS } from "@/data/mock_dataset";
import { latestEpiWeek } from "@/lib/epiWeek";
import ReportingWeekSelector from "./ReportingWeekSelector";
import ResponseSummaryCards from "./ResponseSummaryCards";
import AreaResponseTable from "./AreaResponseTable";
import WeeklyResponseDrawer from "./WeeklyResponseDrawer";
import ActionsByCategory from "./ActionsByCategory";
import { useWeeklyResponses } from "./useWeeklyResponses";
import { buildSummary, summarizeRow, type AreaRow, type AreaAggregate } from "./aggregation";
import { makeGeographyId } from "./types";
import type { RiskLevel } from "./types";

export default function WeeklyFieldResponseSection() {
  const { appliedFilters } = useFilters();
  const { stateId } = useStateSelection();
  const { records, upsert } = useWeeklyResponses();
  const [epiWeek, setEpiWeek] = useState<string>(latestEpiWeek());
  const [selected, setSelected] = useState<AreaAggregate | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const weekEnding = WEEK_ENDINGS[EPI_WEEKS.indexOf(epiWeek)] || WEEK_ENDINGS[WEEK_ENDINGS.length - 1];

  const { rows, areaLabel } = useMemo(() => {
    const regions = getFilteredRegions(appliedFilters);
    const level: AreaRow["level"] =
      appliedFilters.block !== "All Blocks" ? "ward"
      : appliedFilters.district !== "All Districts" ? "block"
      : "district";
    const label = level === "ward" ? "wards/villages" : level === "block" ? "blocks/municipalities" : "districts";

    const rows: AreaRow[] = regions.map((r) => {
      const district = level === "district" ? r.name : appliedFilters.district;
      const block = level === "block" ? r.name : (level === "ward" ? appliedFilters.block : null);
      const ward = level === "ward" ? r.name : null;
      const risk: RiskLevel = (r.risk || "unknown") as RiskLevel;
      return {
        key: makeGeographyId(stateId, district, block, ward),
        name: r.name,
        type: r.type,
        risk,
        level,
        district,
        block,
        ward,
      };
    });
    return { rows, areaLabel: label };
  }, [appliedFilters, stateId]);

  // Records scoped to current week + state
  const weekRecords = useMemo(
    () => records.filter((r) => r.state === stateId && r.epidemiological_week === epiWeek),
    [records, stateId, epiWeek],
  );

  const aggregates = useMemo(() => rows.map((row) => summarizeRow(row, weekRecords)), [rows, weekRecords]);
  const summary = useMemo(() => buildSummary(aggregates), [aggregates]);
  const scopedRecords = useMemo(
    () => weekRecords.filter((r) => aggregates.some((a) => a.records.includes(r))),
    [weekRecords, aggregates],
  );

  const handleRecord = (agg: AreaAggregate) => {
    setSelected(agg);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="section-title">Weekly Field Response</h3>
          <p className="text-xs text-muted-foreground">Field activity and response actions recorded for the current epidemiological week</p>
        </div>
        <ReportingWeekSelector value={epiWeek} onChange={setEpiWeek} />
      </div>

      <div className="rounded-md bg-muted/40 border border-border px-3 py-2 text-xs text-muted-foreground">
        Weekly response information should be updated every Monday.
      </div>

      <ResponseSummaryCards summary={summary} areaLabel={areaLabel} />

      <ActionsByCategory records={scopedRecords} />

      <AreaResponseTable aggregates={aggregates} areaLabel={areaLabel} onRecord={handleRecord} />

      <WeeklyResponseDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        agg={selected}
        stateId={stateId}
        epiWeek={epiWeek}
        weekEnding={weekEnding}
        onSave={upsert}
        historyRecords={records.filter((r) => r.state === stateId)}
      />
    </div>
  );
}
