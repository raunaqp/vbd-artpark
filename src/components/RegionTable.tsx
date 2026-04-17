import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown, ArrowRight } from "lucide-react";
import { getFilteredRegions } from "@/data/mockData";
import { useFilters } from "@/contexts/FilterContext";
import TablePagination from "@/components/TablePagination";

const trendIcon = { up: ArrowUp, down: ArrowDown, stable: ArrowRight };
const PAGE_SIZE = 20;

interface Props { maxRows?: number }

export default function RegionTable({ maxRows }: Props = {}) {
  const { appliedFilters } = useFilters();
  const regions = getFilteredRegions(appliedFilters);
  const sorted = [...regions].sort((a, b) => b.confirmed - a.confirmed);
  const limited = maxRows ? sorted.slice(0, maxRows) : sorted;

  const [page, setPage] = useState(1);
  // Reset to page 1 when filtered set changes.
  useEffect(() => { setPage(1); }, [appliedFilters.district, appliedFilters.block]);

  const start = (page - 1) * PAGE_SIZE;
  const visible = maxRows ? limited : sorted.slice(start, start + PAGE_SIZE);

  const areaLabel = appliedFilters.block !== "All Blocks"
    ? "Villages / Wards"
    : appliedFilters.district !== "All Districts"
    ? "Blocks / Municipalities"
    : "Districts";

  return (
    <div className="section-card p-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="section-title">High Risk Areas (Last 4 Weeks)</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">Based on confirmed cases in last 4 weeks · Showing {areaLabel.toLowerCase()}</p>
      <div className="overflow-auto max-h-[340px]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Area</th>
              <th className="text-right py-2 px-2 text-xs font-medium text-muted-foreground">Cases</th>
              <th className="text-center py-2 px-2 text-xs font-medium text-muted-foreground">Trend</th>
              <th className="text-center py-2 px-2 text-xs font-medium text-muted-foreground">Risk</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => {
              const TrendIcon = trendIcon[r.trend];
              return (
                <tr key={r.name} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2 px-2 font-medium">
                    {r.name}
                    {r.type && r.type !== "district" && (
                      <span className="text-[10px] text-muted-foreground ml-1.5 capitalize">({r.type})</span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-right">{r.confirmed}</td>
                  <td className="py-2 px-2 text-center">
                    <span className="inline-flex items-center gap-1 text-xs">
                      <TrendIcon className={`h-4 w-4 ${r.trend === "up" ? "text-risk-high" : r.trend === "down" ? "text-risk-low" : "text-muted-foreground"}`} />
                      <span className="text-muted-foreground capitalize">{r.trend === "up" ? "Rising" : r.trend === "down" ? "Falling" : "Stable"}</span>
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center"><span className={`risk-badge-${r.risk}`}>{r.risk}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!maxRows && <TablePagination page={page} pageSize={PAGE_SIZE} total={sorted.length} onPageChange={setPage} />}
    </div>
  );
}
