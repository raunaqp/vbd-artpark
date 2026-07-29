// Ward detail sheet (R5.1) — read-only ward context, opened by row click on the
// Priority Action Table.
//
// The table answers "which wards need attention, in what order". This answers
// the next question an officer asks about any one of them: what is its state,
// and why. Four sections, in the order that question unfolds — who is this
// ward, what is its current state, what is the history behind that state, what
// can I do about it.
//
// Read-only by design. The two action buttons open the existing Log Response
// and No Activity dialogs unchanged; nothing here edits in place.

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { WorklistStatus } from "./aggregation";
import type { PriorityRow } from "./priorityRows";
import { CoveragePill, FoggingCell, RiskPill, TrendCell } from "./wardCells";
import {
  daysSince,
  loadWardHistory,
  EMPTY_WARD_HISTORY,
  LARVAL_WEEKS,
  type WardHistory,
} from "./wardHistory";
import type { WeeklyResponseRecord } from "./types";

const STATUS_META: Record<WorklistStatus, { label: string; cls: string }> = {
  completed: { label: "Completed", cls: "text-risk-low" },
  pending: { label: "Pending", cls: "text-risk-high" },
  no_activity: { label: "No activity", cls: "text-muted-foreground" },
  report_pending: { label: "Report pending", cls: "text-risk-moderate" },
};

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  row: PriorityRow | null;
  /** Display label for the active state — the first breadcrumb crumb. */
  stateLabel: string;
  epiWeek: string;
  /** This ward's worklist status for the selected week. */
  logStatus: WorklistStatus;
  /** Weekly responses against this ward over the last 4 weeks, newest first. */
  recentActivity: WeeklyResponseRecord[];
  onLog: (row: PriorityRow) => void;
  onNoActivity: (row: PriorityRow) => void;
}

// ──────────────── Small layout pieces ────────────────

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="pt-4 mt-4 border-t border-border first:mt-0 first:pt-0 first:border-t-0">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
      {subtitle && <p className="text-[11px] text-muted-foreground/80 mt-0.5">{subtitle}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Field({ label, source, children }: { label: string; source?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <div className="text-xs text-muted-foreground shrink-0">
        {label}
        {source && <span className="block text-[10px] text-muted-foreground/70">{source}</span>}
      </div>
      <div className="text-sm text-right">{children}</div>
    </div>
  );
}

function MiniTable({ head, rows, empty }: { head: string[]; rows: React.ReactNode[][]; empty: string }) {
  if (rows.length === 0) {
    return <p className="text-xs text-muted-foreground italic">{empty}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            {head.map((h) => (
              <th key={h} className="text-left py-1.5 pr-3 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, i) => (
            <tr key={i} className="border-b border-border/50">
              {cells.map((c, j) => <td key={j} className="py-1.5 pr-3 whitespace-nowrap">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ──────────────── Sheet ────────────────

export default function WardDetailSheet({
  open,
  onOpenChange,
  row,
  stateLabel,
  epiWeek,
  logStatus,
  recentActivity,
  onLog,
  onNoActivity,
}: Props) {
  const [history, setHistory] = useState<WardHistory>(EMPTY_WARD_HISTORY);
  const [loading, setLoading] = useState(false);

  const wardKey = row?.wardKey ?? null;

  // Section 3 only. Sections 1-2 come off the row and render immediately, so the
  // sheet is useful before the R3 reads land rather than blank until they do.
  useEffect(() => {
    if (!open || !wardKey) return;
    let cancelled = false;
    setLoading(true);
    setHistory(EMPTY_WARD_HISTORY);

    loadWardHistory(wardKey)
      .then((h) => { if (!cancelled) { setHistory(h); setLoading(false); } })
      .catch((e) => {
        if (cancelled) return;
        console.error("[ward detail] failed to load history", e);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [open, wardKey]);

  if (!row) return null;

  const status = STATUS_META[logStatus];
  const rec = row.recommendation;

  // Closing before opening the drawer: the Log sheet is narrower than this one,
  // and stacking two right-hand sheets reads as a glitch rather than a hierarchy.
  const act = (fn: (r: PriorityRow) => void) => { onOpenChange(false); fn(row); };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
        {/* ── Section 1 — ward header ── */}
        <SheetHeader>
          <SheetTitle className="text-xl">{row.ward}</SheetTitle>
        </SheetHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap mt-1">
          <p className="text-xs text-muted-foreground">
            {stateLabel} › {row.district} › {row.block} › {row.ward}
          </p>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-md border"
            style={{ borderColor: "hsl(var(--risk-high) / 0.4)", color: "hsl(var(--risk-high))" }}
            title="Composite urgency: forecast risk + case trend + fogging + breeding sites + survey coverage"
          >
            Priority score {row.score}
          </span>
        </div>

        {/* ── Section 2 — current state ── */}
        <Section title="Current state" subtitle={`Epidemiological week ${epiWeek}`}>
          <div className="divide-y divide-border/50">
            <Field label="Forecast Risk" source="ARTPARK"><RiskPill row={row} /></Field>
            <Field label="Case Trend" source={`ARTPARK · ${4}-week window`}>
              <span className="inline-flex items-center gap-2">
                <TrendCell trend={row.trend} />
                <span className="text-[11px] text-muted-foreground">
                  {row.windowCases} vs {row.priorCases} prior
                </span>
              </span>
            </Field>
            <Field label="Fogging" source="Khushi Baby">
              <FoggingCell row={row} />
            </Field>
            <Field label="Breeding Sites" source="Government">
              <span className={row.majorOpen > 0 ? "font-medium" : ""}>
                {row.majorOpen} major · {row.minorOpen} minor open
              </span>
              {history.breeding && (
                <span className="block text-[11px] text-muted-foreground">
                  {history.breeding.major_resolved} major + {history.breeding.minor_resolved} minor resolved
                </span>
              )}
            </Field>
            <Field label="Larval Survey Coverage" source="Khushi Baby"><CoveragePill coverage={row.coverage} /></Field>
            <Field label="Recommended Action" source="Dashboard">
              {rec ? (
                <>
                  <span className="block">{rec.action_text}</span>
                  <span className="block text-[11px] text-muted-foreground mt-0.5">{rec.protocol_reference}</span>
                </>
              ) : <span className="text-muted-foreground">—</span>}
            </Field>
            <Field label="Log status this week">
              <span className={`font-medium ${status.cls}`}>{status.label}</span>
            </Field>
          </div>
        </Section>

        {/* ── Section 3 — history & context ── */}
        <Section
          title="History & context"
          subtitle={loading ? "Loading ward history…" : undefined}
        >
          <div className="space-y-5">
            <div>
              <h5 className="text-xs font-medium mb-1.5">Fogging events · last 5</h5>
              <MiniTable
                head={["Date", "Sub-area", "Team", "Personnel"]}
                empty={loading ? "…" : "No fogging events on record for this ward."}
                rows={history.foggingEvents.map((e) => [e.date, e.sub_area_name, e.team_name, e.personnel_count])}
              />
            </div>

            <div>
              <h5 className="text-xs font-medium mb-1.5">Breeding sites · open</h5>
              <MiniTable
                head={["Area", "Magnitude", "First reported", "Last inspected", "Days since"]}
                empty={loading ? "…" : "No open breeding sites."}
                rows={history.openBreedingSites.map((s) => [
                  s.area_name,
                  <span className={s.magnitude === "major" ? "font-medium" : "text-muted-foreground"}>{s.magnitude}</span>,
                  s.first_reported_date,
                  s.last_inspection_date,
                  daysSince(s.last_inspection_date) ?? "—",
                ])}
              />
            </div>

            <div>
              <h5 className="text-xs font-medium mb-1.5">Larval survey trend · last {LARVAL_WEEKS} weeks</h5>
              <MiniTable
                head={["Week", "BI", "HI %", "CI %", "Threshold"]}
                empty={loading ? "…" : "No larval survey records for this ward."}
                rows={history.larval.map((l) => [
                  l.week,
                  l.bi ?? "—",
                  l.hi ?? "—",
                  l.ci ?? "—",
                  l.any_outbreak_threshold_breached
                    ? <span className="text-risk-high font-medium">Breached</span>
                    : <span className="text-muted-foreground">Below</span>,
                ])}
              />
            </div>

            <div>
              <h5 className="text-xs font-medium mb-1.5">Recent activity · last 4 weeks</h5>
              <MiniTable
                head={["Week", "Date", "Status", "Activities"]}
                empty="No response logged against this ward in the last 4 weeks."
                rows={recentActivity.map((r) => [
                  r.epidemiological_week,
                  r.activity_date ?? "—",
                  STATUS_META[
                    r.reporting_status === "completed" ? "completed"
                    : r.reporting_status === "no_activity" ? "no_activity"
                    : r.reporting_status === "report_pending" ? "report_pending" : "pending"
                  ].label,
                  r.activities_performed?.join(", ") || r.no_activity_reason || "—",
                ])}
              />
            </div>
          </div>
        </Section>

        {/* ── Section 4 — actions ── */}
        <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-border sticky bottom-0 bg-background pb-1">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button variant="outline" onClick={() => act(onNoActivity)}>Mark No Activity</Button>
          <Button onClick={() => act(onLog)}>Log Response</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
