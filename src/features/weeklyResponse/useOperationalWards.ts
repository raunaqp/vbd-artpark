// React binding for the ward-scope operational state (R4.1).
//
// Owns the async → sync handoff: resolves the R3 datasets for the current
// filter scope, then hands consumers a plain Map they can read synchronously.
// `loading` stays true until the first resolve completes, so tiles can render
// "—" rather than a misleading zero.

import { useEffect, useState } from "react";
import { useFilters } from "@/contexts/FilterContext";
import { useStateSelection } from "@/contexts/StateContext";
import { stateLabelFromId } from "@/data/canonical";
import { buildOperationalWardMap, type OperationalWardMap } from "./operationalWards";

const EMPTY: OperationalWardMap = new Map();

export interface UseOperationalWards {
  wards: OperationalWardMap;
  /** True until the first resolve for the current scope lands. */
  loading: boolean;
  /** Set if the R3 chunks failed to load. */
  error: string | null;
}

export function useOperationalWards(epiWeek: string): UseOperationalWards {
  const { appliedFilters } = useFilters();
  const { stateId } = useStateSelection();
  const stateLabel = stateLabelFromId(stateId);

  const [wards, setWards] = useState<OperationalWardMap>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    buildOperationalWardMap(stateLabel, appliedFilters, epiWeek)
      .then((map) => {
        if (cancelled) return;
        setWards(map);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        // Leave the previous map in place rather than blanking the UI on a
        // transient failure; the error surfaces to the caller either way.
        console.error("[operational] failed to resolve ward scope", e);
        setError(String(e));
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [stateLabel, appliedFilters, epiWeek]);

  return { wards, loading, error };
}
