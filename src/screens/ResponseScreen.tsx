import { useEffect } from "react";
import { loadAllR3 } from "@/data/r3/loader";
import GlobalFilters from "@/components/GlobalFilters";
import { WeeklyResponseProvider } from "@/features/weeklyResponse/WeeklyResponseProvider";
import OperationalActionMap from "@/features/weeklyResponse/OperationalActionMap";
import PriorityAreasSection from "@/features/weeklyResponse/PriorityAreasSection";
import WeeklyOperationalResponseSection from "@/features/weeklyResponse/WeeklyOperationalResponseSection";

// Response tab — operational surface (R2). The operational block relocates here
// from Forecast: Priority Areas (R2.2), Weekly Operational Response +
// Effectiveness (R2.3). Six-tile summary (R3), action map (R4), side panel /
// priority table (R5) land later.
export default function ResponseScreen() {
  // R3: force lazy-load on tab mount. Data is not consumed in R3;
  // R4 will wire recommendations into the six-tile row.
  // Without a real call here Rollup tree-shakes the dynamic imports away and
  // the R3 chunks never get emitted.
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
        <OperationalActionMap />
        <PriorityAreasSection />
        <WeeklyOperationalResponseSection />
      </WeeklyResponseProvider>
    </div>
  );
}
