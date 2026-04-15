import { useFilters } from "@/contexts/FilterContext";
import { districts, blocks, wards } from "@/data/mockData";

export default function GlobalFilters() {
  const { filters, setFilters, applyFilters, resetFilters, isLocked, getLabel } = useFilters();

  return (
    <div className="filter-bar mb-6">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">{getLabel("district")}</label>
        <select
          value={filters.district}
          onChange={(e) => setFilters({ district: e.target.value })}
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
          onChange={(e) => setFilters({ block: e.target.value })}
          disabled={isLocked("block")}
          className="h-9 rounded-md border border-input bg-card px-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {blocks.map((b) => <option key={b}>{b}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">Ward</label>
        <select
          value={filters.ward}
          onChange={(e) => setFilters({ ward: e.target.value })}
          className="h-9 rounded-md border border-input bg-card px-3 text-sm"
        >
          {wards.map((w) => <option key={w}>{w}</option>)}
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
        <input type="date" value={filters.fromDate} onChange={(e) => setFilters({ fromDate: e.target.value })} className="h-9 rounded-md border border-input bg-card px-3 text-sm" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">To</label>
        <input type="date" value={filters.toDate} onChange={(e) => setFilters({ toDate: e.target.value })} className="h-9 rounded-md border border-input bg-card px-3 text-sm" />
      </div>
      <div className="flex gap-2 self-end">
        <button onClick={applyFilters} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium">Apply</button>
        <button onClick={resetFilters} className="h-9 px-4 rounded-md border border-input text-sm font-medium text-muted-foreground">Reset</button>
      </div>
    </div>
  );
}
