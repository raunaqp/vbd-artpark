import { useCallback, useEffect, useState } from "react";
import { weeklyResponseStorage } from "./storage";
import { buildSeedRecords } from "./mockSeed";
import type { WeeklyResponseRecord } from "./types";

/**
 * Records for the current (state, disease) scope, persisted under
 * `prismh:actions:{state}:{disease}`. Seeds demo data the first time a scope is
 * opened, then reloads on cross-tab / same-tab change events.
 */
export function useWeeklyResponses(state: string, disease: string) {
  const load = useCallback(() => {
    weeklyResponseStorage.seedIfEmpty(state, disease, buildSeedRecords(state, disease));
    return weeklyResponseStorage.getAll(state, disease);
  }, [state, disease]);

  const [records, setRecords] = useState<WeeklyResponseRecord[]>(load);

  useEffect(() => {
    setRecords(load());
    const refresh = () => setRecords(weeklyResponseStorage.getAll(state, disease));
    window.addEventListener("prism-weekly-response-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("prism-weekly-response-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [state, disease, load]);

  const upsert = useCallback((rec: WeeklyResponseRecord) => {
    weeklyResponseStorage.upsert(state, disease, rec);
  }, [state, disease]);

  return { records, upsert };
}
