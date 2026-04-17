import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
}

/** Compact pagination control used by long tables (20 rows / page). */
export default function TablePagination({ page, pageSize, total, onPageChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(total, safePage * pageSize);
  if (total <= pageSize) return null;
  return (
    <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
      <span>
        Showing <strong className="text-foreground">{from}-{to}</strong> of <strong className="text-foreground">{total}</strong>
      </span>
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
  );
}
