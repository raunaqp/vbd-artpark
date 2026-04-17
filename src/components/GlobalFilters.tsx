import { useFilters } from "@/contexts/FilterContext";
import { districts, subDistrictData, villageData, wardData, getDateWindow } from "@/data/mockData";
import { useStateSelection } from "@/contexts/StateContext";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function GlobalFilters() {
  const { filters, setFilters, applyFilters, resetFilters, isLocked, getLabel } = useFilters();
  const { stateId } = useStateSelection();
  void stateId; // re-render on state change so cascading lists refresh
  const [collapsed, setCollapsed] = useState(false);
  const window = getDateWindow(filters);

  const availableBlocks = useMemo(() => {
    if (filters.district === "All Districts") return ["All Blocks"];
    const subs = subDistrictData.filter(s => s.parentDistrict === filters.district);
    return ["All Blocks", ...subs.map(s => s.name)];
  }, [filters.district]);

  const availableWards = useMemo(() => {
    if (filters.block === "All Blocks") return ["All Wards"];
    const villages = villageData.filter(v => v.parentBlock === filters.block);
    const wards = wardData.filter(w => w.parentBlock === filters.block);
    const all = [...villages, ...wards];
    return ["All Wards", ...all.map(a => a.name)];
  }, [filters.block]);

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
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">From</label>
            <input type="date" min={window.minDate} max={filters.toDate || window.maxDate} value={filters.fromDate} onChange={(e) => setFilters({ fromDate: e.target.value })} className="h-9 rounded-md border border-input bg-card px-3 text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">To</label>
            <input type="date" min={filters.fromDate || window.minDate} max={window.maxDate} value={filters.toDate} onChange={(e) => setFilters({ toDate: e.target.value })} className="h-9 rounded-md border border-input bg-card px-3 text-sm" />
          </div>
          {/* Forecast date chip intentionally removed from global filter bar — only shown inside Forecast tab. */}
          <div className="flex gap-2 self-end">
            <button onClick={applyFilters} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium">Apply</button>
            <button onClick={resetFilters} className="h-9 px-4 rounded-md border border-input text-sm font-medium text-muted-foreground">Reset</button>
          </div>
        </div>
      )}
    </div>
  );
}
