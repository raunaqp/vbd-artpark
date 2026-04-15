import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart } from "recharts";
import { districts, forecastData, forecastTableData } from "@/data/mockData";

export default function ForecastScreen() {
  const [district, setDistrict] = useState("Krishna");
  const [startDate, setStartDate] = useState("2026-04-08");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Config Panel */}
      <div className="section-card p-5 lg:col-span-1">
        <h3 className="section-title mb-4">Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Start / reference date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 w-full h-9 rounded-md border border-input px-3 text-sm" />
          </div>
          <div className="border-l-4 border-kpi-tested pl-3">
            <div className="text-xs text-muted-foreground">Input week</div>
            <div className="font-semibold text-sm">Wk 14</div>
            <div className="text-xs text-kpi-tested">2 Apr – 8 Apr</div>
          </div>
          <div className="border-l-4 border-risk-critical pl-3">
            <div className="text-xs text-muted-foreground">Forecast target (+4 wk)</div>
            <div className="font-semibold text-sm">Wk 18</div>
            <div className="text-xs text-risk-critical">30 Apr – 6 May</div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">District</label>
            <select value={district} onChange={(e) => setDistrict(e.target.value)} className="mt-1 w-full h-9 rounded-md border border-input px-3 text-sm">
              {districts.filter(d => d !== "All Districts").map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <button className="w-full h-10 rounded-md bg-destructive text-destructive-foreground font-semibold text-sm">Run forecast</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3 space-y-6">
        {/* Risk Header */}
        <div className="section-card p-5">
          <h3 className="text-lg font-semibold mb-1">{district}</h3>
          <p className="text-xs text-muted-foreground mb-4">Reference Wk 14 · Target Wk 18 (2026)</p>
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

        {/* Forecast Chart */}
        <div className="section-card p-5">
          <h3 className="section-title mb-1">Dengue Incidence — Actual vs Predicted (20-week)</h3>
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

        {/* Forecast Table */}
        <div className="section-card p-5">
          <h3 className="section-title mb-3">Forecast Table</h3>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["District", "W1", "W2", "W3", "W4", "Risk"].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {forecastTableData.map((r) => (
                  <tr key={r.district} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2 px-3 font-medium">{r.district}</td>
                    <td className="py-2 px-3">{r.w1}</td>
                    <td className="py-2 px-3">{r.w2}</td>
                    <td className="py-2 px-3">{r.w3}</td>
                    <td className="py-2 px-3">{r.w4}</td>
                    <td className="py-2 px-3"><span className={`risk-badge-${r.risk}`}>{r.risk}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
