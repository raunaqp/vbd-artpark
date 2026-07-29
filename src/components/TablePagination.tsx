import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
  /**
   * Supply both to show a rows-per-page selector (R4.4.2, Priority Action
   * Table). When present the control also renders for short result sets, so the
   * "Showing 1-8 of 8" count stays visible after a filter narrows the table —
   * without it a user cannot tell an empty page from a filtered one.
   */
  pageSizeOptions?: number[];
  onPageSizeChange?: (n: number) => void;
}

/** Compact pagination control used by long tables (20 rows / page by default). */
export default function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  pageSizeOptions,
  onPageSizeChange,
}: Props) {
  const showSizePicker = Boolean(pageSizeOptions?.length && onPageSizeChange);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(total, safePage * pageSize);
  if (total <= pageSize && !showSizePicker) return null;
  return (
    <div className="flex items-center justify-between flex-wrap gap-2 mt-3 text-xs text-muted-foreground">
      <span>
        Showing <strong className="text-foreground">{from}-{to}</strong> of <strong className="text-foreground">{total}</strong>
      </span>
      <div className="flex items-center gap-3">
        {showSizePicker && (
          <label className="flex items-center gap-1.5">
            Rows per page
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange!(Number(e.target.value))}
              className="h-7 rounded-md border border-input bg-card px-1.5 text-xs"
              aria-label="Rows per page"
            >
              {pageSizeOptions!.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(Math.max(1, safePage - 1))}
            disabled={safePage === 1}
            className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-border disabled:opacity-40 hover:bg-muted/40"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="px-2">
            Page <strong className="text-foreground">{safePage}</strong> / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
            disabled={safePage === totalPages}
            className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-border disabled:opacity-40 hover:bg-muted/40"
            aria-label="Next page"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
