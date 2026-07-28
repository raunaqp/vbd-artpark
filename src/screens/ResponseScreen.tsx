import GlobalFilters from "@/components/GlobalFilters";

// Response tab — operational surface (R2 scaffold). The operational block
// (Priority Areas, Weekly Operational Response, Response Effectiveness)
// relocates here from Forecast in R2.2–R2.3. Six-tile summary (R3), action map
// (R4), and side panel / priority table (R5) land later.
export default function ResponseScreen() {
  return (
    <div className="space-y-6">
      <GlobalFilters freshnessLabel="Operational response: this week" />

      <div>
        <h2 className="text-lg font-semibold text-foreground">Response</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Operational response against the forecast — what has happened in high-risk areas, and what still needs to.
        </p>
      </div>

      {/* Placeholder — operational block moves here in R2.2–R2.3 */}
      <div className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
        Operational response sections load here.
      </div>
    </div>
  );
}
