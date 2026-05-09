import { useEffect, useState } from "react";
import { Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Legend } from "recharts";
import GlobalFilters from "@/components/GlobalFilters";
import DashboardMap from "@/components/DashboardMap";
import KpiCards from "@/components/KpiCards";
import TablePagination from "@/components/TablePagination";
import ExportPdfButton from "@/components/ExportPdfButton";
import { getWeeklyTimeSeries, getDailyTimeSeries, getMonthlyTimeSeries, getLineListing, weeksFromFilters, getWeatherData } from "@/data/mockData";
import { useFilters } from "@/contexts/FilterContext";
import { useDisease } from "@/contexts/DiseaseContext";
import { useStateSelection } from "@/contexts/StateContext";
import { useBlockVisibility } from "@/contexts/BlockVisibilityContext";
import { exportLineListingCsv } from "@/lib/exportCsv";
import { Download } from "lucide-react";
import { getEpiWeekForDate } from "@/lib/epiWeek";
import { getCanonicalWeeklySeries, stateLabelFromId } from "@/data/canonical";
import { WEEK_ENDINGS } from "@/data/mock_dataset";

type TimeRange = "daily" | "weekly" | "monthly";
const PAGE_SIZE = 20;

export default function CaseSurveillanceScreen() {
  const [timeRange, setTimeRange] = useState<TimeRange>("weekly");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { appliedFilters } = useFilters();
  const { diseaseName } = useDisease();
  const { stateId, options: stateOptions } = useStateSelection();
  const { isVisible } = useBlockVisibility();
  const show = (id: string) => isVisible("surveillance", id);
  const stateLabel = stateOptions.find((s) => s.id === stateId)?.label ?? "State";

  const timeData = (timeRange === "weekly" ? getWeeklyTimeSeries(appliedFilters) : timeRange === "daily" ? getDailyTimeSeries(appliedFilters) : getMonthlyTimeSeries(appliedFilters)) as any[];
  const xKey = timeRange === "weekly" ? "date" : timeRange === "daily" ? "date" : "month";

  const filteredListing = getLineListing(appliedFilters).filter((r) => {
    if (!search) return true;
    return Object.values(r).some((v) => String(v).toLowerCase().includes(search.toLowerCase()));
  });

  // Reset to first page when filters / search change
  useEffect(() => { setPage(1); }, [appliedFilters.district, appliedFilters.block, search]);
  const visibleListing = filteredListing.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Weather × Cases overlay (last up to 12 weeks)
  void stateLabelFromId;
  void stateLabel;
  const weatherObs = getWeatherData(appliedFilters).filter((w) => (w as any).type === "observed");
  const weeklyForGeo = getCanonicalWeeklySeries(stateLabel, appliedFilters);
  const overlayN = Math.min(12, weatherObs.length, weeklyForGeo.length);
  const overlayData = Array.from({ length: overlayN }, (_, i) => {
    const wIdx = weatherObs.length - overlayN + i;
    const cIdx = weeklyForGeo.length - overlayN + i;
    const dateIdx = WEEK_ENDINGS.length - overlayN + i;
    const dateStr = WEEK_ENDINGS[dateIdx] ?? "";
    return {
      week: getEpiWeekForDate(dateStr) || `W${i + 1}`,
      date: dateStr,
      cases: weeklyForGeo[cIdx] ?? 0,
      rainfall_mm: weatherObs[wIdx]?.rainfall ?? 0,
    };
  });
  const wardOrVillageSelected = appliedFilters.ward !== "All Wards" || appliedFilters.block !== "All Blocks";

  const buildSections = () => [
    { title: "KPIs (current window)", type: "kv" as const, lines: [
      `Window: ${weeksFromFilters(appliedFilters)} weeks`,
      `Geography: ${[stateLabel, appliedFilters.district !== "All Districts" ? appliedFilters.district : null, appliedFilters.block !== "All Blocks" ? appliedFilters.block : null].filter(Boolean).join(" > ")}`,
    ]},
    { title: `${diseaseName} Cases Over Time (${timeRange})`, type: "table" as const,
      headers: [xKey, "positive", "samples", "tpr"],
      rows: timeData.slice(-12).map((d: any) => [d[xKey], d.positive, d.samples, d.tpr]),
    },
    { title: "Line Listing (sample)", type: "table" as const,
      headers: ["Patient", "District", "Block", "Result", "Date"],
      rows: filteredListing.slice(0, 30).map((r) => [r.patient, r.district, r.block, r.testResult, r.dateOfTesting]),
    },
  ];

  return (
    <div>
      <GlobalFilters showDates freshnessLabel="Data window: user-selected" />
      <div className="flex justify-end -mt-2 mb-3">
        <ExportPdfButton tabName="Case Surveillance" buildSections={buildSections} />
      </div>
      {show("kpis") && <KpiCards windowWeeks={weeksFromFilters(appliedFilters)} />}

      {show("cases_over_time") && (
      <div className="section-card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">{diseaseName} Cases Over Time (Positive, Samples, TPR)</h3>
          <div className="tab-nav">
            {(["daily", "weekly", "monthly"] as TimeRange[]).map((t) => (
              <button key={t} onClick={() => setTimeRange(t)} className={`tab-nav-item capitalize ${timeRange === t ? "tab-nav-item-active" : ""}`}>{t}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={timeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 11 }}
              interval={timeRange === "weekly" ? 1 : timeRange === "daily" ? Math.max(0, Math.floor(timeData.length / 8) - 1) : "preserveStartEnd"}
              minTickGap={24}
            />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar yAxisId="left" dataKey="positive" fill="hsl(215, 60%, 40%)" radius={[2, 2, 0, 0]} />
            <Line yAxisId="left" type="monotone" dataKey="samples" stroke="hsl(215, 60%, 65%)" strokeDasharray="5 5" dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="tpr" stroke="hsl(142, 50%, 45%)" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      )}

      {show("cases_over_time") && overlayData.length > 0 && (
      <div className="section-card p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="section-title">Cases vs. Rainfall — last {overlayN} weeks</h3>
          {wardOrVillageSelected && (
            <span className="text-[11px] text-muted-foreground">Rainfall shown at district level</span>
          )}
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={overlayData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="cases" orientation="left" tick={{ fontSize: 11 }} label={{ value: "Cases", angle: -90, position: "insideLeft", fontSize: 10 }} />
            <YAxis yAxisId="rainfall" orientation="right" tick={{ fontSize: 11 }} label={{ value: "Rainfall (mm)", angle: 90, position: "insideRight", fontSize: 10 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar yAxisId="rainfall" dataKey="rainfall_mm" fill="hsl(212, 90%, 75%)" fillOpacity={0.55} name="Rainfall (mm)" />
            <Line yAxisId="cases" type="monotone" dataKey="cases" stroke="hsl(0, 70%, 50%)" strokeWidth={2} name="Cases" dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
        <p className="text-[11px] text-muted-foreground mt-2">Aedes lag: rainfall typically precedes case rises by 2–3 weeks.</p>
      </div>
      )}

      {show("geospatial") && (
      <div className="mb-6">
        <h3 className="section-title mb-3">Geospatial Distribution</h3>
        <DashboardMap height="350px" />
      </div>
      )}

      {show("line_listing") && (
      <div className="section-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">{diseaseName} Line Listing</h3>
          <div className="flex gap-3">
            <input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 rounded-md border border-input px-3 text-sm w-48"
            />
            <button
              onClick={() => exportLineListingCsv({ stateLabel, diseaseName, filters: appliedFilters })}
              className="h-8 px-3 rounded-md border border-input text-sm flex items-center gap-1 text-foreground hover:bg-muted transition-colors"
            >
              <Download className="h-3 w-3" /> Export CSV
            </button>
          </div>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Patient", "Gender", "Age", "District", "Block", "Village / MC", "Test Type", "Result", "Date", "Urban/Rural", "Referred By"].map((h) => (
                  <th key={h} className="text-left py-2 px-2 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleListing.map((r, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2 px-2">{r.patient}</td>
                  <td className="py-2 px-2">{r.gender}</td>
                  <td className="py-2 px-2">{r.age}</td>
                  <td className="py-2 px-2">{r.district}</td>
                  <td className="py-2 px-2">{r.block}</td>
                  <td className="py-2 px-2">{r.village}</td>
                  <td className="py-2 px-2">{r.testType}</td>
                  <td className="py-2 px-2">{r.testResult}</td>
                  <td className="py-2 px-2 whitespace-nowrap">{r.dateOfTesting}</td>
                  <td className="py-2 px-2">{r.urbanRural}</td>
                  <td className="py-2 px-2">{r.referredBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination page={page} pageSize={PAGE_SIZE} total={filteredListing.length} onPageChange={setPage} />
      </div>
      )}
    </div>
  );
}
