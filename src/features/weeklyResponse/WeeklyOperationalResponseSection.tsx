import ReportingWeekSelector from "./ReportingWeekSelector";
import ResponseSummaryCards from "./ResponseSummaryCards";
import AreaResponseTable from "./AreaResponseTable";
import ActionsByCategory from "./ActionsByCategory";
import { useWeeklyResponseContext } from "./weeklyResponseContext";

export default function WeeklyOperationalResponseSection() {
  const { epiWeek, setEpiWeek, aggregates, summary, scopedRecords, areaLabel, openDrawer, openNoActivity } = useWeeklyResponseContext();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="section-title">Weekly Operational Response</h3>
          <p className="text-xs text-muted-foreground">Field activity and response actions recorded for the selected epidemiological week</p>
        </div>
        <ReportingWeekSelector value={epiWeek} onChange={setEpiWeek} />
      </div>

      <div className="rounded-md bg-muted/40 border border-border px-3 py-2 text-xs text-muted-foreground">
        Weekly operational response should be updated every Monday.
      </div>

      <ResponseSummaryCards summary={summary} areaLabel={areaLabel} />

      <ActionsByCategory records={scopedRecords} />

      <AreaResponseTable aggregates={aggregates} areaLabel={areaLabel} onRecord={openDrawer} onNoActivity={openNoActivity} />
    </div>
  );
}
