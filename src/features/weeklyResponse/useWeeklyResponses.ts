import { useCallback, useEffect, useState } from "react";
import { weeklyResponseStorage } from "./storage";
import { buildSeedRecords } from "./mockSeed";
import type { WeeklyResponseRecord } from "./types";

let seeded = false;

export function useWeeklyResponses() {
  const [records, setRecords] = useState<WeeklyResponseRecord[]>(() => {
    if (!seeded) {
      weeklyResponseStorage.seedIfEmpty(buildSeedRecords());
      seeded = true;
    }
    return weeklyResponseStorage.getAll();
  });

  useEffect(() => {
    const refresh = () => setRecords(weeklyResponseStorage.getAll());
    window.addEventListener("prism-weekly-response-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("prism-weekly-response-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const upsert = useCallback((rec: WeeklyResponseRecord) => {
    weeklyResponseStorage.upsert(rec);
  }, []);

  return { records, upsert };
}
