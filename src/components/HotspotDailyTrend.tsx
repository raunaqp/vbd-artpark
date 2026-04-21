import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getDailyTimeSeries } from "@/data/mockData";
import { useFilters } from "@/contexts/FilterContext";
import { useDisease } from "@/contexts/DiseaseContext";

interface HotspotDailyTrendProps {
  lookbackDays?: number;
}

/**
 * Aggregated daily trend across the currently filtered scope.
 * Sits at the top of the Hotspots tab to give the "where it's active over time"
 * view, while per-row sparklines show area-level shape.
 */
export default function HotspotDailyTrend({ lookbackDays = 28 }: HotspotDailyTrendProps) {
  const { appliedFilters } = useFilters();
  const { diseaseName, currentDisease } = useDisease();

  const data = useMemo(() => {
    const series = getDailyTimeSeries(appliedFilters);
    const tail = series.slice(-lookbackDays);
    return tail.map((p) => ({
      date: p.date,
      cases: Math.round(p.positive * currentDisease.caseMultiplier),
    }));
  }, [appliedFilters, lookbackDays, currentDisease.caseMultiplier]);

  const total = data.reduce((sum, d) => sum + d.cases, 0);

  if (total === 0) {
    return (
      <div className="section-card p-5">
        <h3 className="section-title mb-1">{diseaseName} Daily Trend — Last {lookbackDays} Days</h3>
        <p className="text-xs text-muted-foreground">No daily case activity in the selected scope.</p>
      </div>
    );
  }

  return (
    <div className="section-card p-5">
      <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
        <h3 className="section-title">{diseaseName} Daily Trend — Last {lookbackDays} Days</h3>
        <span className="text-xs text-muted-foreground">{total} cases · aggregated for current filters</span>
      </div>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="hotspotDailyFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval="preserveStartEnd" tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} allowDecimals={false} width={32} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
              formatter={(value: number) => [`${value} cases`, diseaseName]}
            />
            <Area type="monotone" dataKey="cases" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#hotspotDailyFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
