import { createContext, useContext } from "react";
import type { AreaAggregate, WeeklySummary } from "./aggregation";
import type { WeeklyResponseRecord } from "./types";

export interface PriorityRow {
  agg: AreaAggregate;
  window: string;   // forecast week / window ("why now")
  reason: string;   // driver / why prioritised
}

export interface WeeklyResponseCtx {
  epiWeek: string;
  setEpiWeek: (w: string) => void;
  weekEnding: string;
  forecastGeneratedAt: string;
  areaLabel: string;
  aggregates: AreaAggregate[];
  priorityRows: PriorityRow[];
  summary: WeeklySummary;
  scopedRecords: WeeklyResponseRecord[];
  allRecords: WeeklyResponseRecord[];
  openDrawer: (agg: AreaAggregate) => void;
  openNoActivity: (agg: AreaAggregate) => void;
}

export const WeeklyResponseContext = createContext<WeeklyResponseCtx | null>(null);

export function useWeeklyResponseContext(): WeeklyResponseCtx {
  const ctx = useContext(WeeklyResponseContext);
  if (!ctx) throw new Error("useWeeklyResponseContext must be used within WeeklyResponseProvider");
  return ctx;
}
