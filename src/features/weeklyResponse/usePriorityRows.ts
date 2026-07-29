// React binding for the Priority Action Table resolver (R4.4.4).
//
// Succeeds `useOperationalWards`: one async resolve now feeds all three
// surfaces on the Response tab — the summary tiles, the map overlays, and the
// table. Consumers narrow it synchronously with `scopeRows` / `toOperationalWardMap`.
//
// Note what this does *not* depend on: `appliedFilters`. The resolve is
// state-wide by design, so changing district or block no longer re-reads the R3
// datasets — it just re-slices an array already in memory.
//
// `loading` stays true until the first resolve for the current state and week
// lands, so ward-derived tiles can render "—" rather than a misleading zero.

import { useEffect, useState } from "react";
import { useStateSelection } from "@/contexts/StateContext";
import { stateLabelFromId } from "@/data/canonical";
import { buildPriorityRows, type PriorityRow } from "./priorityRows";

const EMPTY: PriorityRow[] = [];

export interface UsePriorityRows {
  /** Every ward in the active state, pre-sorted worst-first. */
  rows: PriorityRow[];
  /** True until the first resolve for the current state + week lands. */
  loading: boolean;
  /** Set if the R3 chunks failed to load. */
  error: string | null;
}

export function usePriorityRows(epiWeek: string): UsePriorityRows {
  const { stateId } = useStateSelection();
  const stateLabel = stateLabelFromId(stateId);

  const [rows, setRows] = useState<PriorityRow[]>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    buildPriorityRows(stateLabel, epiWeek)
      .then((next) => {
        if (cancelled) return;
        setRows(next);
        setLoading(false);
      })
      .catch((e) => {
        // Leave the previous rows in place rather than blanking the table on a
        // transient failure; the error surfaces to the caller either way.
        if (cancelled) return;
        console.error("[response] failed to resolve priority rows", e);
        setError(String(e));
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [stateLabel, epiWeek]);

  return { rows, loading, error };
}
