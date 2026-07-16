import { AlertTriangle } from "lucide-react";
import { useStateSelection } from "@/contexts/StateContext";
import { getRiskLabel } from "@/lib/forecast_labels";
import { useWeeklyResponseContext } from "./weeklyResponseContext";
import type { WorklistStatus } from "./aggregation";

const STATUS_META: Record<WorklistStatus, { label: string; cls: string }> = {
  completed: { label: "Completed", cls: "text-risk-low" },
  pending: { label: "Pending", cls: "text-risk-high" },
  no_activity: { label: "No activity", cls: "text-muted-foreground" },
  report_pending: { label: "Report pending", cls: "text-risk-moderate" },
};

export default function PriorityAreasSection() {
  const { stateId } = useStateSelection();
  const { priorityRows, areaLabel, openDrawer } = useWeeklyResponseContext();

  return (
    <div className="section-card p-5">
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangle className="h-4 w-4 text-risk-high" />
        <h3 className="section-title">Priority Areas for Field Response</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Areas requiring operational attention this epidemiological week · Showing: {areaLabel} level
      </p>

      {priorityRows.length === 0 ? (
        <div className="rounded-md border border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
          No high- or moderate-risk areas in the current forecast for this scope.
        </div>
      ) : (
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="text-left py-2 px-2 font-medium">Area</th>
                <th className="text-center py-2 px-2 font-medium">Forecast Risk</th>
                <th className="text-left py-2 px-2 font-medium">Forecast Window</th>
                <th className="text-left py-2 px-2 font-medium">Why Prioritised</th>
                <th className="text-center py-2 px-2 font-medium">Response Status</th>
                <th className="text-right py-2 px-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {priorityRows.map(({ agg, window, reason }) => {
                const risk = agg.row.risk as "high" | "moderate";
                const sm = STATUS_META[agg.status];
                return (
                  <tr key={agg.row.key} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2 px-2 font-medium">
                      {agg.row.name}
                      {agg.row.type && <span className="text-[10px] text-muted-foreground ml-1.5">({agg.row.type})</span>}
                    </td>
                    <td className="py-2 px-2 text-center"><span className={`risk-badge-${risk}`}>{getRiskLabel(stateId, risk)}</span></td>
                    <td className="py-2 px-2 text-xs text-muted-foreground">{window}</td>
                    <td className="py-2 px-2 text-xs text-muted-foreground max-w-xs">{reason}</td>
                    <td className={`py-2 px-2 text-center text-xs font-medium ${sm.cls}`}>{sm.label}</td>
                    <td className="py-2 px-2 text-right">
                      <button
                        onClick={() => openDrawer(agg)}
                        className="text-xs px-2.5 py-1 rounded-md border border-border hover:bg-muted/40"
                      >
                        {agg.primary ? "View / Edit Response" : "Log Weekly Response"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
