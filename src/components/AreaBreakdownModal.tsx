// KPI click-through modal (Session B).
//
// The Case Surveillance tab shows aggregate totals with no way to see which
// areas produce them. Clicking a KPI card opens this: the same areas the rest
// of the dashboard ranks, scoped to a window the officer picks.
//
// Centred Dialog rather than the right-hand Sheet the Response tab uses. The
// ward detail sheet (R5.1) is a drill-down into one row of a table you are
// already reading, so it sits beside it. This is a breakdown of a single
// number with no row context to preserve, so it takes the centre.
//
// Read-only by design: no row click, no navigation, no logging. It answers
// "which areas" and closes.

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import RegionTable from "@/components/RegionTable";
import {
  breakdownSubtitle,
  breakdownTitle,
  DEFAULT_WINDOW,
  EMPTY_MESSAGE,
  isHighRiskKpi,
  WINDOW_OPTIONS,
  type WindowWeeks,
} from "@/components/areaBreakdown";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Label of the card that was clicked. Null when nothing is open. */
  kpiName: string | null;
}

export default function AreaBreakdownModal({ open, onOpenChange, kpiName }: Props) {
  const [weeks, setWeeks] = useState<WindowWeeks>(DEFAULT_WINDOW);

  // Each open starts at the default window. Carrying the last pick over means a
  // card clicked from a "Last 4 Weeks" page can silently open on 12W.
  useEffect(() => {
    if (open) setWeeks(DEFAULT_WINDOW);
  }, [open]);

  if (!kpiName) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Wider than the default max-w-lg — four columns of area data need it. */}
      <DialogContent
        // No ring on the panel itself — focus lands here programmatically, not
        // by tabbing, so the outline would just be decoration.
        className="max-w-3xl focus:outline-none"
        // Radix focuses the first focusable child, which is the 2W button. Its
        // focus ring then reads as a second selection next to the actually
        // selected window. Focus the dialog itself instead; Escape and tabbing
        // still work, and the picker shows one state.
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLElement).focus();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-base">{breakdownTitle(kpiName, weeks)}</DialogTitle>
          <DialogDescription className="text-xs">{breakdownSubtitle(kpiName)}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Window</span>
          <div className="tab-nav">
            {WINDOW_OPTIONS.map((w) => (
              <button
                key={w}
                onClick={() => setWeeks(w)}
                aria-pressed={weeks === w}
                className={`tab-nav-item ${weeks === w ? "tab-nav-item-active" : ""}`}
              >
                {w}W
              </button>
            ))}
          </div>
        </div>

        <RegionTable
          embedded
          windowWeeks={weeks}
          onlyHighRisk={isHighRiskKpi(kpiName)}
          emptyMessage={EMPTY_MESSAGE}
        />
      </DialogContent>
    </Dialog>
  );
}
