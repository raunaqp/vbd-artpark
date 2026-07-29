import { useEffect } from "react";
import { loadAllR3 } from "@/data/r3/loader";
import GlobalFilters from "@/components/GlobalFilters";
import { WeeklyResponseProvider } from "@/features/weeklyResponse/WeeklyResponseProvider";
import PriorityAreasSection from "@/features/weeklyResponse/PriorityAreasSection";
import WeeklyOperationalResponseSection from "@/features/weeklyResponse/WeeklyOperationalResponseSection";

// Response tab — operational surface (R2). The operational block relocates here
// from Forecast: Priority Areas (R2.2), Weekly Operational Response +
// Effectiveness (R2.3). Six-tile summary (R3), action map (R4), side panel /
// priority table (R5) land later.
export default function ResponseScreen() {
  // Warm the R3 operational datasets (~10 MB, lazy chunks) on first visit to
  // this tab, so R4's map overlays and R5's side panel find them already parsed.
  // Nothing on this screen reads them yet — R3 renders no new UI here.
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
        <PriorityAreasSection />
        <WeeklyOperationalResponseSection />
      </WeeklyResponseProvider>
    </div>
  );
}
