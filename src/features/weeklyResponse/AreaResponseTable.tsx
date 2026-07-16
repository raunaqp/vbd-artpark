import { useMemo, useState } from "react";
import type { AreaAggregate } from "./aggregation";
import { getRiskLabel } from "@/lib/forecast_labels";
import { useStateSelection } from "@/contexts/StateContext";
import TablePagination from "@/components/TablePagination";

const PAGE_SIZE = 15;

type Chip = "all" | "high" | "moderate" | "low" | "not_reported" | "activity";

interface Props {
  aggregates: AreaAggregate[];
  areaLabel: string;
  onRecord: (agg: AreaAggregate) => void;
}

export default function AreaResponseTable({ aggregates, areaLabel, onRecord }: Props) {
  const { stateId } = useStateSelection();
  const [chip, setChip] = useState<Chip>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = aggregates;
    if (chip === "high" || chip === "moderate" || chip === "low") list = list.filter((a) => a.row.risk === chip);
    else if (chip === "not_reported") list = list.filter((a) => a.reporting === "not_reported");
    else if (chip === "activity") list = list.filter((a) => a.fieldActivity === "yes");

    // Sort: risk order, then not_reported first within category
    const riskOrder: Record<string, number> = { high: 0, moderate: 1, low: 2, unknown: 3 };
    return [...list].sort((a, b) => {
      const d = riskOrder[a.row.risk] - riskOrder[b.row.risk];
      if (d !== 0) return d;
      const ra = a.reporting === "not_reported" ? 0 : 1;
      const rb = b.reporting === "not_reported" ? 0 : 1;
      return ra - rb;
    });
  }, [aggregates, chip]);

  const start = (page - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  const chips: Array<{ id: Chip; label: string }> = [
    { id: "all", label: "All areas" },
    { id: "high", label: "High risk" },
    { id: "moderate", label: "Moderate risk" },
    { id: "low", label: "Low risk" },
    { id: "not_reported", label: "Not reported" },
    { id: "activity", label: "Field activity completed" },
  ];

  return (
    <div className="section-card p-4">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
        <div>
          <h3 className="section-title">Area-wise Response Status</h3>
          <p className="text-xs text-muted-foreground">Showing: {areaLabel} level</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <button
              key={c.id}
              onClick={() => { setChip(c.id); setPage(1); }}
              className={`text-xs px-2.5 py-1 rounded-full border ${chip === c.id ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-muted/40"}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="text-left py-2 px-2 font-medium">Area</th>
              <th className="text-center py-2 px-2 font-medium">Forecast Risk</th>
              <th className="text-center py-2 px-2 font-medium">Field Activity</th>
              <th className="text-right py-2 px-2 font-medium">Personnel</th>
              <th className="text-right py-2 px-2 font-medium">Localities</th>
              <th className="text-right py-2 px-2 font-medium">Source Reduction</th>
              <th className="text-right py-2 px-2 font-medium">Other Actions</th>
              <th className="text-left py-2 px-2 font-medium">Activity Date</th>
              <th className="text-center py-2 px-2 font-medium">Reporting</th>
              <th className="text-right py-2 px-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((a) => {
              const riskLabel = a.row.risk === "unknown" ? "No forecast" : getRiskLabel(stateId, a.row.risk as "high"|"moderate"|"low");
              const activityLabel = a.fieldActivity === "yes" ? "Yes" : a.fieldActivity === "no" ? "No" : a.fieldActivity === "pending" ? "Report pending" : "—";
              const activityCls = a.fieldActivity === "yes" ? "text-risk-low" : a.fieldActivity === "no" ? "text-risk-high" : "text-muted-foreground";
              const reportLabel = a.reporting === "reported" ? "Reported" : a.reporting === "draft" ? "Draft" : "Not reported";
              const reportCls = a.reporting === "reported" ? "text-risk-low" : a.reporting === "draft" ? "text-risk-moderate" : "text-muted-foreground";
              return (
                <tr key={a.row.key} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2 px-2 font-medium">
                    {a.row.name}
                    {a.row.type && <span className="text-[10px] text-muted-foreground ml-1.5">({a.row.type})</span>}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {a.row.risk === "unknown"
                      ? <span className="text-xs text-muted-foreground">—</span>
                      : <span className={`risk-badge-${a.row.risk}`}>{riskLabel}</span>}
                  </td>
                  <td className={`py-2 px-2 text-center text-xs ${activityCls}`}>{activityLabel}</td>
                  <td className="py-2 px-2 text-right">{a.personnel || "—"}</td>
                  <td className="py-2 px-2 text-right">{a.localitiesVisited || "—"}</td>
                  <td className="py-2 px-2 text-right">{a.sourceReduction || "—"}</td>
                  <td className="py-2 px-2 text-right">{a.actionsCount || "—"}</td>
                  <td className="py-2 px-2 text-xs text-muted-foreground">{a.activityDate || "—"}</td>
                  <td className={`py-2 px-2 text-center text-xs ${reportCls}`}>{reportLabel}</td>
                  <td className="py-2 px-2 text-right">
                    <button
                      onClick={() => onRecord(a)}
                      className="text-xs px-2.5 py-1 rounded-md border border-border hover:bg-muted/40"
                    >
                      {a.primary ? "View / Edit" : "Record Response"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr><td colSpan={10} className="py-6 text-center text-sm text-muted-foreground">No areas match this filter</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <TablePagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
    </div>
  );
}
