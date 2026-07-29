// Unified Priority Action Table (R4.4.2) — the Response tab's primary action
// surface. Replaces the three overlapping tables it succeeds (Priority Areas,
// Area-wise Response, Action-gap wards) with one ward-level list.
//
// Rows are always ward grain and always the whole state: the drill filters
// narrow the map and the tiles, not this table. Officers narrow it here instead,
// with search and column filters, so a supervisor can find their ward without
// first knowing which zone it sits in.
//
// The row is not clickable in R4.4 — the Log button is the only interactive
// element per row. Row click opens the geography side panel in R5.

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUp, ChevronDown, ChevronUp, Minus } from "lucide-react";
import TablePagination from "@/components/TablePagination";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { CoverageLevel, FoggingTier, PriorityRow, TrendTier } from "./priorityRows";
import {
  activeFilterCount,
  applyTableView,
  formatFogging,
  nextSort,
  riskOptions,
  toggleValue,
  uniqueActions,
  DEFAULT_SORT,
  EMPTY_FILTERS,
  type BreedingFilter,
  type SortKey,
  type SortState,
  type TableFilters,
} from "./priorityTableView";

const PAGE_SIZES = [20, 50, 100];

// ──────────────── Column definitions ────────────────
//
// Provenance sits under each column name, muted — the app's existing source
// disclosure pattern. The four streams are distinct products and an officer
// acting on a row needs to know which one told them to.

interface Column {
  key: SortKey;
  label: string;
  source: string;
  align?: "left" | "center" | "right";
}

const COLUMNS: Column[] = [
  { key: "ward", label: "Ward", source: "" },
  { key: "risk", label: "Forecast Risk", source: "ARTPARK", align: "center" },
  { key: "trend", label: "Case Trend", source: "ARTPARK" },
  { key: "fogging", label: "Fogging Done", source: "Khushi Baby" },
  { key: "breeding", label: "Breeding Sites", source: "Government" },
  { key: "coverage", label: "Larval Survey Coverage", source: "Khushi Baby", align: "center" },
  { key: "action", label: "Recommended Action", source: "Dashboard" },
];

// ──────────────── Cell rendering ────────────────

const TREND_META: Record<TrendTier, { label: string; Icon: typeof ArrowUp; cls: string }> = {
  rising: { label: "Rising", Icon: ArrowUp, cls: "text-risk-high font-medium" },
  steady: { label: "Steady", Icon: ArrowRight, cls: "text-muted-foreground" },
  falling: { label: "Falling", Icon: ArrowDown, cls: "text-risk-low" },
  none: { label: "No cases", Icon: Minus, cls: "text-muted-foreground" },
};

// Colour only — the label text lives with the rest of the formatting in
// priorityTableView.ts so it can be tested without a DOM.
const FOGGING_CLS: Record<FoggingTier, string> = {
  overdue: "text-risk-high font-medium",
  due: "text-risk-moderate",
  recent: "text-risk-low",
  no_record: "text-muted-foreground",
};

const COVERAGE_META: Record<CoverageLevel, { label: string; cssVar: string | null }> = {
  high: { label: "High", cssVar: "--risk-low" },
  medium: { label: "Medium", cssVar: "--risk-moderate" },
  low: { label: "Low", cssVar: "--risk-high" },
  no_data: { label: "No data", cssVar: null },
};

function RiskPill({ row }: { row: PriorityRow }) {
  if (row.risk === "no_data") {
    return <span className="text-xs text-muted-foreground">No Data</span>;
  }
  // The palette is deliberately three-colour (see index.css). `very_high` reuses
  // the high hue as a solid fill rather than a tint, so the top tier is
  // distinguishable without inventing a fourth risk colour.
  if (row.risk === "very_high") {
    return (
      <span
        className="px-3 py-1 rounded-full text-xs font-semibold text-white"
        style={{ backgroundColor: "hsl(var(--risk-high))" }}
      >
        {row.riskLabel}
      </span>
    );
  }
  return <span className={`risk-badge-${row.risk}`}>{row.riskLabel}</span>;
}

function CoveragePill({ coverage }: { coverage: CoverageLevel }) {
  const c = COVERAGE_META[coverage];
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${c.cssVar ? "" : "bg-muted text-muted-foreground"}`}
      style={c.cssVar ? { backgroundColor: `hsl(var(${c.cssVar}) / 0.15)`, color: `hsl(var(${c.cssVar}))` } : undefined}
    >
      {c.label}
    </span>
  );
}

// ──────────────── Filter controls ────────────────

function FilterPills<T extends string>({
  label,
  options,
  selected,
  onToggle,
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

const TREND_OPTIONS: Array<{ value: TrendTier; label: string }> = [
  { value: "rising", label: "Rising" },
  { value: "steady", label: "Steady" },
  { value: "falling", label: "Falling" },
  { value: "none", label: "No cases" },
];

const FOGGING_OPTIONS: Array<{ value: FoggingTier; label: string }> = [
  { value: "overdue", label: "Overdue" },
  { value: "due", label: "Due" },
  { value: "recent", label: "Recent" },
  { value: "no_record", label: "No record" },
];

const COVERAGE_OPTIONS: Array<{ value: CoverageLevel; label: string }> = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "no_data", label: "No data" },
];

const BREEDING_OPTIONS: Array<{ value: BreedingFilter; label: string }> = [
  { value: "any", label: "Any" },
  { value: "any_major", label: "Any major open" },
  { value: "none", label: "0 major" },
  { value: "1-2", label: "1-2 major" },
  { value: "3+", label: "3+ major" },
];

// ──────────────── Table ────────────────

interface Props {
  rows: PriorityRow[];
  /** Opens the existing Log Response modal for this ward. */
  onLog: (row: PriorityRow) => void;
  /**
   * Opens the existing "no field activity this week" dialog for this ward.
   *
   * Deleting AreaResponseTable in R4.4.4 removed the only entry point to that
   * workflow — the dialog was still mounted but unreachable. This restores it.
   */
  onNoActivity: (row: PriorityRow) => void;
  /** True until the resolver's first pass lands. */
  loading?: boolean;
  error?: string | null;
}

export default function PriorityActionTable({ rows, onLog, onNoActivity, loading = false, error = null }: Props) {
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);
  const [filters, setFilters] = useState<TableFilters>(EMPTY_FILTERS);
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

  const actions = useMemo(() => uniqueActions(rows), [rows]);
  const risks = useMemo(() => riskOptions(rows), [rows]);
  const visible = useMemo(() => applyTableView(rows, filters, search, sort), [rows, filters, search, sort]);

  // Any change to what is being shown resets to the first page — otherwise a
  // filter that shrinks the set below the current page leaves a blank table.
  useEffect(() => { setPage(1); }, [filters, search, sort, pageSize, rows]);

  const activeCount = activeFilterCount(filters);
  const clearAll = () => { setFilters(EMPTY_FILTERS); setSearch(""); };
  const paged = visible.slice((page - 1) * pageSize, page * pageSize);
  const sortedColumn = COLUMNS.find((c) => c.key === sort.key);

  const setMulti = <K extends "risk" | "trend" | "fogging" | "coverage">(key: K, value: TableFilters[K][number]) =>
    setFilters((f) => ({ ...f, [key]: toggleValue(f[key] as string[], value as string) }) as TableFilters);

  return (
    <div className="section-card p-5">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
        <div>
          <h3 className="section-title">Priority Action Table</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Every ward in the state, ranked by operational urgency
            {sortedColumn ? ` · sorted by ${sortedColumn.label}` : " · sorted by priority"}
            {loading && " · resolving ward data…"}
            {error && " · operational data unavailable"}
            {sort.key !== DEFAULT_SORT.key && (
              <>
                {" · "}
                <button onClick={() => setSort(DEFAULT_SORT)} className="underline underline-offset-2 hover:text-foreground">
                  reset to priority
                </button>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            placeholder="Search ward, zone or block…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search wards"
            className="h-8 rounded-md border border-input px-3 text-sm w-56"
          />
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className="h-8 px-3 inline-flex items-center gap-1.5 rounded-md border border-border text-xs hover:bg-muted/40"
          >
            {filtersOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            Filters{activeCount > 0 && ` (${activeCount})`}
          </button>
          {(activeCount > 0 || search) && (
            <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">
              Clear all
            </button>
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="rounded-md border border-border bg-muted/20 p-4 mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FilterPills
            label="Forecast Risk"
            options={risks.map((r) => ({ value: r.tier, label: r.label }))}
            selected={filters.risk}
            onToggle={(v) => setMulti("risk", v)}
          />
          <FilterPills label="Case Trend" options={TREND_OPTIONS} selected={filters.trend} onToggle={(v) => setMulti("trend", v)} />
          <FilterPills label="Fogging Done" options={FOGGING_OPTIONS} selected={filters.fogging} onToggle={(v) => setMulti("fogging", v)} />
          <FilterPills
            label="Breeding Sites"
            options={BREEDING_OPTIONS}
            selected={[filters.breeding]}
            onToggle={(v) => setFilters((f) => ({ ...f, breeding: f.breeding === v ? "any" : v }))}
          />
          <FilterPills label="Larval Survey Coverage" options={COVERAGE_OPTIONS} selected={filters.coverage} onToggle={(v) => setMulti("coverage", v)} />
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-muted-foreground">Recommended Action</span>
            <select
              value={filters.action}
              onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value }))}
              aria-label="Recommended Action"
              className="h-8 rounded-md border border-input bg-card px-2 text-xs"
            >
              <option value="">All actions</option>
              {actions.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
      )}

      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {COLUMNS.map((c) => {
                const active = sort.key === c.key;
                const align = c.align === "center" ? "text-center" : c.align === "right" ? "text-right" : "text-left";
                return (
                  <th key={c.key} className={`${align} py-2 px-2 align-bottom`}>
                    <button
                      onClick={() => setSort((s) => nextSort(s, c.key))}
                      className="inline-flex flex-col items-start gap-0 hover:text-foreground group"
                      aria-label={`Sort by ${c.label}`}
                    >
                      <span className={`text-xs font-medium whitespace-nowrap ${active ? "text-foreground" : "text-muted-foreground"}`}>
                        {c.label}
                        {active && (sort.dir === "desc" ? " ↓" : " ↑")}
                      </span>
                      {c.source && <span className="text-[10px] text-muted-foreground/70 font-normal">{c.source}</span>}
                    </button>
                  </th>
                );
              })}
              <th className="text-right py-2 px-2 align-bottom text-xs font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((r) => (
              <tr key={r.wardKey} className="border-b border-border/50 hover:bg-muted/30">
                <td className="py-2 px-2">
                  <div className="font-medium text-foreground">{r.ward}</div>
                  <div className="text-[11px] text-muted-foreground">{r.district} · {r.block}</div>
                </td>
                <td className="py-2 px-2 text-center"><RiskPill row={r} /></td>
                <td className="py-2 px-2">
                  {(() => {
                    const t = TREND_META[r.trend];
                    return (
                      <span className={`inline-flex items-center gap-1 text-xs whitespace-nowrap ${t.cls}`}>
                        <t.Icon className="h-3.5 w-3.5" />{t.label}
                      </span>
                    );
                  })()}
                </td>
                <td className={`py-2 px-2 text-xs whitespace-nowrap ${FOGGING_CLS[r.foggingStatus ?? "no_record"]}`}>
                  {formatFogging(r)}
                </td>
                <td className="py-2 px-2 text-xs whitespace-nowrap text-muted-foreground">
                  <span className={r.majorOpen > 0 ? "text-foreground font-medium" : ""}>{r.majorOpen} major</span>
                  {" · "}{r.minorOpen} minor
                </td>
                <td className="py-2 px-2 text-center"><CoveragePill coverage={r.coverage} /></td>
                <td className="py-2 px-2 text-xs max-w-[240px]">
                  {r.recommendation ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="block truncate cursor-default">{r.recommendation.action_text}</span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-medium">{r.recommendation.action_text}</p>
                        <p className="text-xs opacity-80 mt-1">{r.recommendation.protocol_reference}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="py-2 px-2 text-right">
                  {/* Both always enabled — logging is not gated on drilling to a
                      district (Flag B). Equal visual weight: recording that a
                      week had no activity is a first-class outcome, not a
                      lesser one, and understating it is how wards end up
                      looking unreported when they were simply unworkable. */}
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onLog(r)}
                      className="text-xs px-2.5 py-1 rounded-md border border-border hover:bg-muted/40 whitespace-nowrap"
                    >
                      Log Response
                    </button>
                    <button
                      onClick={() => onNoActivity(r)}
                      className="text-xs px-2.5 py-1 rounded-md border border-border hover:bg-muted/40 whitespace-nowrap"
                    >
                      No Activity
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="py-8 text-center text-sm text-muted-foreground">
                  {loading ? "Resolving ward data…" : rows.length === 0 ? "No wards in this state." : "No wards match these filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <TablePagination
        page={page}
        pageSize={pageSize}
        total={visible.length}
        onPageChange={setPage}
        pageSizeOptions={PAGE_SIZES}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
