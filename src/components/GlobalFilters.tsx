import { useFilters } from "@/contexts/FilterContext";
import { districts, getDateWindow } from "@/data/mockData";
import { getBlockDropdown, getLeafDropdown } from "@/data/canonical";
import { useStateSelection } from "@/contexts/StateContext";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { getFreshness, freshnessTone } from "@/lib/freshness";

interface GlobalFiltersProps {
  showDates?: boolean;
  freshnessLabel?: string;
}

export default function GlobalFilters({ showDates = false, freshnessLabel }: GlobalFiltersProps = {}) {
  const { filters, setFilters, applyFilters, resetFilters, isLocked, getLabel } = useFilters();
  const { stateId } = useStateSelection();
  void stateId;
  const [collapsed, setCollapsed] = useState(false);
  const window = getDateWindow(filters);

  const availableBlocks = useMemo(() => {
    if (filters.district === "All Districts") return ["All Blocks"];
    return ["All Blocks", ...getBlockDropdown(filters.district)];
  }, [filters.district]);

  const availableWards = useMemo(() => {
    if (filters.block === "All Blocks" || filters.district === "All Districts") return ["All Wards"];
    return ["All Wards", ...getLeafDropdown(filters.district, filters.block)];
  }, [filters.district, filters.block]);

  return (
    <div className="mb-6">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2 hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        Filters
      </button>
      {!collapsed && (
        <div className="filter-bar">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">{getLabel("district")}</label>
            <select
              value={filters.district}
              onChange={(e) => setFilters({ district: e.target.value, block: "All Blocks", ward: "All Wards" })}
              disabled={isLocked("district")}
              className="h-9 rounded-md border border-input bg-card px-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {districts.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">{getLabel("block")}</label>
            <select
              value={filters.block}
              onChange={(e) => setFilters({ block: e.target.value, ward: "All Wards" })}
              disabled={isLocked("block")}
              className="h-9 rounded-md border border-input bg-card px-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {availableBlocks.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Ward / Village</label>
            <select
              value={filters.ward}
              onChange={(e) => setFilters({ ward: e.target.value })}
              className="h-9 rounded-md border border-input bg-card px-3 text-sm"
            >
              {availableWards.map((w) => <option key={w}>{w}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Area Type</label>
            <select
              value={filters.areaType}
              onChange={(e) => setFilters({ areaType: e.target.value as any })}
              className="h-9 rounded-md border border-input bg-card px-3 text-sm"
            >
              <option value="all">All</option>
              <option value="urban">Urban</option>
              <option value="rural">Rural</option>
            </select>
          </div>
          {showDates && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">From</label>
                <input type="date" min={window.minDate} max={filters.toDate || window.maxDate} value={filters.fromDate} onChange={(e) => setFilters({ fromDate: e.target.value })} className="h-9 rounded-md border border-input bg-card px-3 text-sm" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">To</label>
                <input type="date" min={filters.fromDate || window.minDate} max={window.maxDate} value={filters.toDate} onChange={(e) => setFilters({ toDate: e.target.value })} className="h-9 rounded-md border border-input bg-card px-3 text-sm" />
              </div>
            </>
          )}
          <div className="flex gap-2 self-end">
            <button onClick={applyFilters} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium">Apply</button>
            <button onClick={resetFilters} className="h-9 px-4 rounded-md border border-input text-sm font-medium text-muted-foreground">Reset</button>
          </div>
        </div>
      )}
      {(() => {
        const fresh = getFreshness(filters.district);
        if (!fresh) return freshnessLabel ? <p className="text-xs text-muted-foreground mt-2">{freshnessLabel}</p> : null;
        const tone = freshnessTone(fresh.status);
        const Icon = fresh.status === "fresh" || fresh.status === "good" ? CheckCircle2 : AlertTriangle;
        return (
          <div className={`mt-2 inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs ${tone.textClass} ${tone.bgClass} ${tone.borderClass}`}>
            <Icon className="h-3.5 w-3.5" />
            <span>Last reported: {fresh.days_ago} day{fresh.days_ago === 1 ? "" : "s"} ago · {fresh.message}</span>
          </div>
        );
      })()}
    </div>
  );
}
