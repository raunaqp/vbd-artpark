import { useCallback, useEffect, useMemo } from "react";
import { useFilters } from "@/contexts/FilterContext";
import { useStateSelection } from "@/contexts/StateContext";
import { levelToLegacy } from "@/data/canonical";
import { loadAllR3 } from "@/data/r3/loader";
import GlobalFilters from "@/components/GlobalFilters";
import { WeeklyResponseProvider } from "@/features/weeklyResponse/WeeklyResponseProvider";
import OperationalActionMap from "@/features/weeklyResponse/OperationalActionMap";
import PriorityActionTable from "@/features/weeklyResponse/PriorityActionTable";
import ReportingWeekSelector from "@/features/weeklyResponse/ReportingWeekSelector";
import ResponseSummaryTiles from "@/features/weeklyResponse/ResponseSummaryTiles";
import { summarizeRow, type AreaRow } from "@/features/weeklyResponse/aggregation";
import { scopeRows, toOperationalWardMap, type PriorityRow } from "@/features/weeklyResponse/priorityRows";
import { usePriorityRows } from "@/features/weeklyResponse/usePriorityRows";
import { makeGeographyId, type RiskLevel } from "@/features/weeklyResponse/types";
import { useWeeklyResponseContext } from "@/features/weeklyResponse/weeklyResponseContext";

// Response tab — operational surface.
//
// R4.4 replaced three overlapping tables (Priority Areas, Area-wise Response,
// Action-gap wards) with one ward-level Priority Action Table, and folded two
// summary blocks into the six-tile row. The order below is the reading order the
// design doc asks for: how are we doing → where → what to do about it.
export default function ResponseScreen() {
  // Force the lazy R3 chunks to start loading on tab mount, in parallel with
  // the resolver's own await. Without a real call here Rollup tree-shakes the
  // dynamic imports away and the chunks never get emitted.
  useEffect(() => { void loadAllR3(); }, []);

  return (
    <div className="space-y-6">
      <GlobalFilters freshnessLabel="Operational response: this week" />

      <div>
        <h2 className="text-lg font-semibold text-foreground">Response</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Operational response against the forecast — what has happened in high-risk areas, and what still needs to.
        </p>
      </div>

      <WeeklyResponseProvider>
        <ResponseTabContent />
      </WeeklyResponseProvider>
    </div>
  );
}

/**
 * Everything inside the provider, so it can read the weekly-response context.
 *
 * Owns the one-resolve-two-scopes split: `usePriorityRows` resolves the whole
 * state once (it does not depend on the filter bar), then `scopeRows` narrows it
 * synchronously for the tiles and the map. The table gets the unscoped rows —
 * it always lists every ward and narrows via its own search and filters.
 */
function ResponseTabContent() {
  const { appliedFilters } = useFilters();
  const { stateId } = useStateSelection();
  const { epiWeek, setEpiWeek, summary, areaLabel, weekRecords, openDrawer } = useWeeklyResponseContext();
  const { rows, loading, error } = usePriorityRows(epiWeek);

  const scoped = useMemo(() => scopeRows(rows, appliedFilters), [rows, appliedFilters]);
  const wards = useMemo(() => toOperationalWardMap(scoped), [scoped]);

  /**
   * Open the existing Log Response modal for one ward.
   *
   * The table is ward grain at every drill level, so there is no matching entry
   * in `aggregates` to hand over — the row is summarised against this week's
   * records instead. Two things that buys us over the old action-gap button:
   * the ward's real forecast risk is captured with the record rather than a
   * hardcoded "high", and an already-logged ward opens for editing instead of
   * as a blank form that would overwrite it on save.
   */
  const handleLog = useCallback(
    (r: PriorityRow) => {
      // The record model is 3-tier; `very_high` captures as `high`.
      const risk: RiskLevel = r.risk === "no_data" ? "no_data" : levelToLegacy(r.risk);
      const row: AreaRow = {
        key: makeGeographyId(stateId, r.district, r.block, r.ward),
        name: r.ward,
        risk,
        level: "ward",
        district: r.district,
        block: r.block,
        ward: r.ward,
      };
      openDrawer(summarizeRow(row, weekRecords));
    },
    [stateId, weekRecords, openDrawer],
  );

  return (
    <div className="space-y-6">
      <ResponseSummaryTiles
        summary={summary}
        wards={wards}
        loading={loading}
        areaLabel={areaLabel}
        headerRight={<ReportingWeekSelector value={epiWeek} onChange={setEpiWeek} />}
      />

      <OperationalActionMap wards={wards} loading={loading} error={error} />

      <PriorityActionTable rows={rows} onLog={handleLog} loading={loading} error={error} />
    </div>
  );
}
