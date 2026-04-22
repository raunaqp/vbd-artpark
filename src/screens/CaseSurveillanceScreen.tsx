import { useEffect, useState } from "react";
import { Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import GlobalFilters from "@/components/GlobalFilters";
import DashboardMap from "@/components/DashboardMap";
import KpiCards from "@/components/KpiCards";
import TablePagination from "@/components/TablePagination";
import { getWeeklyTimeSeries, getDailyTimeSeries, getMonthlyTimeSeries, getLineListing } from "@/data/mockData";
import { useFilters } from "@/contexts/FilterContext";
import { useDisease } from "@/contexts/DiseaseContext";
import { useStateSelection } from "@/contexts/StateContext";
import { exportLineListingCsv } from "@/lib/exportCsv";
import { Download } from "lucide-react";

type TimeRange = "daily" | "weekly" | "monthly";
const PAGE_SIZE = 20;

export default function CaseSurveillanceScreen() {
  const [timeRange, setTimeRange] = useState<TimeRange>("weekly");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { appliedFilters } = useFilters();
  const { diseaseName } = useDisease();
  const { stateId } = useStateSelection();
  void stateId;

  const timeData = (timeRange === "weekly" ? getWeeklyTimeSeries(appliedFilters) : timeRange === "daily" ? getDailyTimeSeries(appliedFilters) : getMonthlyTimeSeries(appliedFilters)) as any[];
  const xKey = timeRange === "weekly" ? "date" : timeRange === "daily" ? "date" : "month";

  const filteredListing = getLineListing(appliedFilters).filter((r) => {
    if (!search) return true;
    return Object.values(r).some((v) => String(v).toLowerCase().includes(search.toLowerCase()));
  });

  // Reset to first page when filters / search change
  useEffect(() => { setPage(1); }, [appliedFilters.district, appliedFilters.block, search]);
  const visibleListing = filteredListing.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <GlobalFilters />
      <KpiCards />

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

      <div className="mb-6">
        <h3 className="section-title mb-3">Geospatial Distribution</h3>
        <DashboardMap height="350px" />
      </div>

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
            <button className="h-8 px-3 rounded-md border border-input text-sm flex items-center gap-1 text-muted-foreground">
              <Download className="h-3 w-3" /> Export
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
    </div>
  );
}
