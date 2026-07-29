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
  /**
   * Every record for this state and reporting week, at any grain.
   *
   * The Priority Action Table is always ward grain while `aggregates` follows
   * the drill level, so it cannot look a ward up there. It summarises against
   * this instead, which is what lets the Log button open an existing entry for
   * editing rather than a blank form that would overwrite it.
   */
  weekRecords: WeeklyResponseRecord[];
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
