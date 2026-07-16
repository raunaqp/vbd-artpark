import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { WeeklyResponseRecord } from "./types";
import { actionsByCategory, medianDaysForecastToActivity } from "./aggregation";

interface Props { records: WeeklyResponseRecord[] }

export default function ActionsByCategory({ records }: Props) {
  const [open, setOpen] = useState(false);
  const rows = actionsByCategory(records);
  const median = medianDaysForecastToActivity(records);
  if (!rows.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium hover:bg-muted/40"
      >
        <span className="flex items-center gap-2">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          Actions by Category
        </span>
        <span className="text-xs text-muted-foreground">
          {median !== null ? `Median forecast→activity: ${median}d` : ""}
        </span>
      </button>
      {open && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 p-4 pt-2 border-t border-border">
          {rows.map((r) => (
            <div key={r.action} className="flex items-baseline justify-between rounded-md bg-muted/40 px-3 py-2">
              <span className="text-xs text-muted-foreground">{r.action}</span>
              <span className="text-lg font-semibold">{r.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
