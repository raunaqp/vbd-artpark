import { useState } from "react";
import { districts, blocks, wards } from "@/data/mockData";

export default function GlobalFilters() {
  const [district, setDistrict] = useState("All Districts");
  const [block, setBlock] = useState("All Blocks");
  const [ward, setWard] = useState("All Wards");
  const [areaType, setAreaType] = useState("all");
  const [fromDate, setFromDate] = useState("2026-02-01");
  const [toDate, setToDate] = useState("2026-04-07");

  return (
    <div className="filter-bar mb-6">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">District</label>
        <select value={district} onChange={(e) => setDistrict(e.target.value)} className="h-9 rounded-md border border-input bg-card px-3 text-sm">
          {districts.map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">Block</label>
        <select value={block} onChange={(e) => setBlock(e.target.value)} className="h-9 rounded-md border border-input bg-card px-3 text-sm">
          {blocks.map((b) => <option key={b}>{b}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">Ward</label>
        <select value={ward} onChange={(e) => setWard(e.target.value)} className="h-9 rounded-md border border-input bg-card px-3 text-sm">
          {wards.map((w) => <option key={w}>{w}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">Area Type</label>
        <select value={areaType} onChange={(e) => setAreaType(e.target.value)} className="h-9 rounded-md border border-input bg-card px-3 text-sm">
          <option value="all">All</option>
          <option value="urban">Urban</option>
          <option value="rural">Rural</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">From</label>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="h-9 rounded-md border border-input bg-card px-3 text-sm" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">To</label>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="h-9 rounded-md border border-input bg-card px-3 text-sm" />
      </div>
      <div className="flex gap-2 self-end">
        <button className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium">Apply</button>
        <button className="h-9 px-4 rounded-md border border-input text-sm font-medium text-muted-foreground">Reset</button>
      </div>
    </div>
  );
}
