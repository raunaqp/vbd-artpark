import { useState } from "react";
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from "recharts";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Info } from "lucide-react";
import { districts, forecastData, forecastTableData, riskForecast } from "@/data/mockData";
import { useRole } from "@/contexts/RoleContext";

const trendIcon = { up: TrendingUp, down: TrendingDown, stable: Minus };

export default function ForecastScreen() {
  const [district, setDistrict] = useState("Krishna");
  const { isAnalyst } = useRole();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Forecast — Predicted Risk</h2>
          <p className="text-xs text-muted-foreground">Forecast last updated: 07 Apr 2026 · Next update: 14 Apr 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mr-2">District</label>
            <select value={district} onChange={(e) => setDistrict(e.target.value)} className="h-9 rounded-md border border-input px-3 text-sm">
              {districts.filter(d => d !== "All Districts").map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Missing data alert */}
      <div className="flex items-center gap-2 rounded-lg border border-risk-moderate/30 bg-risk-moderate/5 px-4 py-2.5 text-sm">
        <AlertTriangle className="h-4 w-4 text-risk-moderate flex-shrink-0" />
        <span className="text-foreground">Data missing for 2 blocks in Eluru district and 1 block in Prakasam district.</span>
      </div>

      {/* W1-W4 Risk Strip */}
      <div className="grid grid-cols-4 gap-3">
        {riskForecast.map((f) => {
          const riskClass = f.risk === "high" ? "border-risk-high bg-risk-high/5 text-risk-high"
            : f.risk === "moderate" ? "border-risk-moderate bg-risk-moderate/5 text-risk-moderate"
            : "border-risk-low bg-risk-low/5 text-risk-low";
          return (
            <div key={f.week} className={`rounded-lg border-2 p-3 text-center ${riskClass}`}>
              <div className="text-xs font-semibold uppercase">{f.week}</div>
              <div className="text-lg font-bold">{f.cases}</div>
              <div className="text-xs opacity-80">{f.label}</div>
              <div className="mt-1"><span className={`risk-badge-${f.risk}`}>{f.risk}</span></div>
            </div>
          );
        })}
      </div>

      {/* Risk Summary */}
      <div className="section-card p-5">
        <h3 className="text-lg font-semibold mb-1">{district}</h3>
        <p className="text-xs text-muted-foreground mb-4">Forecast for W15–W18 (2026)</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {[
            { label: "POPULATION", value: "33,95,105" },
            { label: "RISK SCORE", value: "0.8" },
            { label: "THRESHOLD", value: "5" },
            { label: "OVERALL RISK", value: "MODERATE", highlight: true },
            { label: "FORECAST (WK 18)", value: "8" },
            { label: "IR (PER 1 LAKH)", value: "0.24" },
          ].map((m) => (
            <div key={m.label} className="text-center">
              <div className={`text-lg font-bold ${m.highlight ? "text-risk-moderate" : ""}`}>{m.value}</div>
              <div className="text-[10px] text-muted-foreground font-medium">{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Actual vs Predicted Chart — Analyst only */}
      {isAnalyst && (
        <div className="section-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="section-title">Dengue Incidence — Actual vs Predicted (20-week)</h3>
            <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">Analyst View</span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">12 weeks historical, then forecast · {district}</p>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area dataKey="upper" fill="hsl(25, 90%, 50%)" fillOpacity={0.1} stroke="none" />
              <Area dataKey="lower" fill="hsl(0, 0%, 100%)" stroke="none" />
              <Line type="monotone" dataKey="actual" stroke="hsl(215, 60%, 40%)" strokeWidth={2} dot={{ r: 3, fill: "hsl(215, 60%, 40%)" }} connectNulls={false} />
              <Line type="monotone" dataKey="predicted" stroke="hsl(25, 90%, 50%)" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3, fill: "hsl(25, 90%, 50%)" }} />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex gap-6 justify-center mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-chart-actual inline-block" /> Actual</span>
            <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-chart-predicted inline-block border-dashed" /> Predicted</span>
          </div>
        </div>
      )}

      {/* Decision-Ready Forecast Table */}
      <div className="section-card p-5">
        <h3 className="section-title mb-3">Forecast Table — Decision Ready</h3>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["District", "Trend", "Peak Week", "Risk", "Suggested Action"].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {forecastTableData.map((r) => {
                const TrendIcon = trendIcon[r.trend];
                return (
                  <tr key={r.district} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2 px-3 font-medium">{r.district}</td>
                    <td className="py-2 px-3">
                      <TrendIcon className={`h-4 w-4 ${r.trend === "up" ? "text-risk-high" : r.trend === "down" ? "text-risk-low" : "text-muted-foreground"}`} />
                    </td>
                    <td className="py-2 px-3 font-medium">{r.peakWeek}</td>
                    <td className="py-2 px-3"><span className={`risk-badge-${r.risk}`}>{r.risk}</span></td>
                    <td className="py-2 px-3 text-xs text-muted-foreground max-w-xs">{r.action}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
