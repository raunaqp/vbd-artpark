import { useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import GlobalFilters from "@/components/GlobalFilters";
import DashboardMap from "@/components/DashboardMap";
import { weeklyTimeSeries, dailyTimeSeries, monthlyTimeSeries, ageDistribution, genderDistribution, lineListingData } from "@/data/mockData";
import { Download } from "lucide-react";

type TimeRange = "daily" | "weekly" | "monthly";
const GENDER_COLORS = ["hsl(215, 60%, 40%)", "hsl(25, 90%, 50%)"];

export default function CaseSurveillanceScreen() {
  const [timeRange, setTimeRange] = useState<TimeRange>("weekly");
  const [areaType, setAreaType] = useState<"all" | "urban" | "rural">("all");
  const [search, setSearch] = useState("");

  const timeData = timeRange === "weekly" ? weeklyTimeSeries : timeRange === "daily" ? dailyTimeSeries : monthlyTimeSeries;
  const xKey = timeRange === "weekly" ? "date" : timeRange === "daily" ? "date" : "month";

  const filteredListing = lineListingData.filter((r) =>
    Object.values(r).some((v) => String(v).toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <GlobalFilters />

      {/* Time Series Chart */}
      <div className="section-card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">Cases Over Time (Positive, Samples, TPR)</h3>
          <div className="tab-nav">
            {(["daily", "weekly", "monthly"] as TimeRange[]).map((t) => (
              <button key={t} onClick={() => setTimeRange(t)} className={`tab-nav-item capitalize ${timeRange === t ? "tab-nav-item-active" : ""}`}>{t}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={timeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
            <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar yAxisId="left" dataKey="positive" fill="hsl(215, 60%, 40%)" radius={[2, 2, 0, 0]} />
            <Line yAxisId="left" type="monotone" dataKey="samples" stroke="hsl(215, 60%, 65%)" strokeDasharray="5 5" dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="tpr" stroke="hsl(142, 50%, 45%)" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="section-card p-5">
          <h3 className="section-title mb-4">Age Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ageDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="group" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(215, 60%, 40%)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="section-card p-5">
          <h3 className="section-title mb-4">Gender Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={genderDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                {genderDistribution.map((_, i) => <Cell key={i} fill={GENDER_COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="section-card p-5">
          <h3 className="section-title mb-4">Area Type</h3>
          <div className="tab-nav mb-4">
            {(["all", "urban", "rural"] as const).map((t) => (
              <button key={t} onClick={() => setAreaType(t)} className={`tab-nav-item capitalize ${areaType === t ? "tab-nav-item-active" : ""}`}>{t}</button>
            ))}
          </div>
          <div className="text-center py-8">
            <div className="text-3xl font-bold text-foreground">{areaType === "urban" ? "62%" : areaType === "rural" ? "38%" : "100%"}</div>
            <div className="text-sm text-muted-foreground mt-1">{areaType === "all" ? "All areas" : `${areaType.charAt(0).toUpperCase() + areaType.slice(1)} cases`}</div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="mb-6">
        <h3 className="section-title mb-3">Geospatial Distribution</h3>
        <DashboardMap height="350px" />
      </div>

      {/* Line Listing */}
      <div className="section-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">Line Listing</h3>
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
                {["Patient", "Gender", "Age", "Sub District", "Block", "Village / MC", "District", "Diagnosis"].map((h) => (
                  <th key={h} className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredListing.map((r, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2 px-2">{r.patient}</td>
                  <td className="py-2 px-2">{r.gender}</td>
                  <td className="py-2 px-2">{r.age}</td>
                  <td className="py-2 px-2">{r.subDistrict}</td>
                  <td className="py-2 px-2">{r.block}</td>
                  <td className="py-2 px-2">{r.village}</td>
                  <td className="py-2 px-2">{r.district}</td>
                  <td className="py-2 px-2">{r.diagnosis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
