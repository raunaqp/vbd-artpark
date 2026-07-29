// Response History (R6) — every response logged in this state, across all weeks.
//
// The rest of the Response tab answers "what needs doing now". This answers
// "what have we already done", which is a different question asked less often —
// so it sits at the bottom and stays collapsed until asked for, the same
// progressive-disclosure treatment Forecast Methodology gets.
//
// Read-only and additive: it surfaces `allRecords` from the weekly-response
// context and introduces no record types, fields, or state of its own.

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import TablePagination from "@/components/TablePagination";
import type { FieldActivityStatus, WeeklyResponseRecord } from "./types";
import {
  applyHistoryView,
  describeArea,
  describeRecord,
  loggedDate,
  nextHistorySort,
  toggle,
  weekOptions,
  DEFAULT_HISTORY_SORT,
  EMPTY_HISTORY_FILTERS,
  TYPE_LABEL,
  TYPE_ORDER,
  type HistoryFilters,
  type HistorySort,
  type HistorySortKey,
} from "./responseHistory";

const PAGE_SIZE = 10;

/** Colour only — labels live with the rest of the vocabulary in responseHistory.ts. */
const TYPE_CLS: Record<FieldActivityStatus, string> = {
  yes: "text-risk-low",
  no: "text-muted-foreground",
  report_pending: "text-risk-moderate",
};

// ──────────────── Pills ────────────────
//
// A local copy of the Priority Action Table's filter-pill idiom. Sharing it
// would mean editing that component, which this session does not touch — the
// duplication is logged in known_debt.md.

function Pills<T extends string>({
  label, options, selected, onToggle,
}: {
  label: string;
  options: Array<{ value: T; label: string }>;
  selected: T[];
  onToggle: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onToggle(o.value)}
            aria-pressed={selected.includes(o.value)}
            className={`text-xs px-2.5 py-1 rounded-full border ${
              selected.includes(o.value)
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border bg-background hover:bg-muted/40"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ──────────────── Panel ────────────────

const COLUMNS: Array<{ key: HistorySortKey; label: string; align?: "right" }> = [
  { key: "week", label: "Week" },
  { key: "area", label: "Area" },
  { key: "type", label: "Action type" },
  { key: "loggedBy", label: "Logged by" },
  { key: "date", label: "Date logged" },
];

interface Props {
  /** Every response logged for the active state, any week. */
  records: WeeklyResponseRecord[];
}

export default function ResponseHistoryPanel({ records }: Props) {
  const [open, setOpen] = useState(false);
  const [sort, setSort] = useState<HistorySort>(DEFAULT_HISTORY_SORT);
  const [filters, setFilters] = useState<HistoryFilters>(EMPTY_HISTORY_FILTERS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const weeks = useMemo(() => weekOptions(records), [records]);
  const visible = useMemo(() => applyHistoryView(records, filters, search, sort), [records, filters, search, sort]);

  useEffect(() => { setPage(1); }, [filters, search, sort, records]);

  const activeFilters = (filters.weeks.length ? 1 : 0) + (filters.types.length ? 1 : 0) + (search ? 1 : 0);
  const paged = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="rounded-lg border border-border bg-card">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium hover:bg-muted/40"
      >
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        Response History
        <span className="text-xs font-normal text-muted-foreground">
          {records.length === 0 ? "" : `· ${records.length} logged`}
        </span>
      </button>

      {open && (
        <div className="border-t border-border p-4">
          {records.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No responses logged for this state yet.
            </p>
          ) : (
            <>
              <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                <div className="flex flex-wrap gap-6">
                  <Pills
                    label="Week"
                    options={weeks.map((w) => ({ value: w, label: w }))}
                    selected={filters.weeks}
                    onToggle={(v) => setFilters((f) => ({ ...f, weeks: toggle(f.weeks, v) }))}
                  />
                  <Pills
                    label="Action type"
                    options={TYPE_ORDER.map((t) => ({ value: t, label: TYPE_LABEL[t] }))}
                    selected={filters.types}
                    onToggle={(v) => setFilters((f) => ({ ...f, types: toggle(f.types, v) }))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    placeholder="Search area…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search areas"
                    className="h-8 rounded-md border border-input px-3 text-sm w-48"
                  />
                  {activeFilters > 0 && (
                    <button
                      onClick={() => { setFilters(EMPTY_HISTORY_FILTERS); setSearch(""); }}
                      className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {COLUMNS.map((c) => {
                        const active = sort.key === c.key;
                        return (
                          <th key={c.key} className="text-left py-2 px-2">
                            <button
                              onClick={() => setSort((s) => nextHistorySort(s, c.key))}
                              aria-label={`Sort by ${c.label}`}
                              className={`text-xs font-medium whitespace-nowrap hover:text-foreground ${active ? "text-foreground" : "text-muted-foreground"}`}
                            >
                              {c.label}{active && (sort.dir === "desc" ? " ↓" : " ↑")}
                            </button>
                          </th>
                        );
                      })}
                      <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((r) => {
                      const area = describeArea(r);

                      return (
                        <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2 px-2 whitespace-nowrap">{r.epidemiological_week}</td>
                          <td className="py-2 px-2">
                            <div className="font-medium text-foreground">{area.name}</div>
                            {area.parent && <div className="text-[11px] text-muted-foreground">{area.parent}</div>}
                          </td>
                          <td className={`py-2 px-2 text-xs whitespace-nowrap font-medium ${TYPE_CLS[r.field_activity_status]}`}>
                            {TYPE_LABEL[r.field_activity_status]}
                          </td>
                          <td className="py-2 px-2 text-xs whitespace-nowrap">{r.logged_by_name}</td>
                          <td className="py-2 px-2 text-xs whitespace-nowrap text-muted-foreground">{loggedDate(r) || "—"}</td>
                          <td className="py-2 px-2 text-xs text-muted-foreground max-w-xs">{describeRecord(r)}</td>
                        </tr>
                      );
                    })}
                    {paged.length === 0 && (
                      <tr>
                        <td colSpan={COLUMNS.length + 1} className="py-6 text-center text-sm text-muted-foreground">
                          No responses match these filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <TablePagination page={page} pageSize={PAGE_SIZE} total={visible.length} onPageChange={setPage} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
