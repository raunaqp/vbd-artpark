import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from "recharts";
import { AlertTriangle } from "lucide-react";
import { getForecastData, getRiskForecast, getOutbreakPredictions } from "@/data/mockData";
import { useRole } from "@/contexts/RoleContext";
import { useFilters } from "@/contexts/FilterContext";
import { useDisease } from "@/contexts/DiseaseContext";
import { useStateSelection } from "@/contexts/StateContext";
import GlobalFilters from "@/components/GlobalFilters";
import DashboardMap from "@/components/DashboardMap";

export default function ForecastScreen() {
  const { isAnalyst } = useRole();
  const { appliedFilters } = useFilters();
  const { diseaseName } = useDisease();
  const { stateId } = useStateSelection();
  void stateId;

  const riskForecast = getRiskForecast();
  const forecastData = getForecastData();
  const predictions = getOutbreakPredictions(appliedFilters.district, appliedFilters.block);

  const areaLabel = appliedFilters.block !== "All Blocks"
    ? "Village / Ward"
    : appliedFilters.district !== "All Districts"
    ? "Block / Municipality"
    : "District";

  return (
    <div className="space-y-6">
      <GlobalFilters />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{diseaseName} Forecast — Predicted Risk (Next 4 Weeks)</h2>
          <p className="text-xs text-muted-foreground">Forecast last updated: 07 Apr 2026 · Next update: 14 Apr 2026</p>
        </div>
      </div>

      {predictions.length > 0 && predictions.every(p => p.risk === "high" || p.risk === "moderate") && (
        <div className="flex items-center gap-2 rounded-lg border border-risk-high/30 bg-risk-high/5 px-4 py-2.5 text-sm">
          <AlertTriangle className="h-4 w-4 text-risk-high flex-shrink-0" />
          <span className="text-foreground">High {diseaseName.toLowerCase()} risk detected due to predictive signals (climate conditions / rising trend / historical patterns).</span>
        </div>
      )}

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

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="section-title">Forecasted Risk Map — Next 4 Weeks</h3>
          <span className="text-[11px] text-muted-foreground">Colors reflect <strong>predicted</strong> outbreak risk · Click areas to drill down</span>
        </div>
        <DashboardMap height="380px" mode="forecast" />
      </div>

      {isAnalyst && (
        <div className="section-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="section-title">{diseaseName} Incidence — Actual vs Predicted</h3>
            <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">Analyst View</span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Past weeks (W-) and forecast (W+) with confidence interval</p>
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
            <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-chart-predicted inline-block" /> Predicted</span>
          </div>
        </div>
      )}

      <div className="section-card p-5">
        <h3 className="section-title mb-1">{diseaseName} Outbreak Prediction Table</h3>
        <p className="text-xs text-muted-foreground mb-4">Sorted by probability of outbreak · highest first · Showing: {areaLabel} level</p>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {[areaLabel, "Probability (%)", "Risk Level", "Expected Week", "Signal"].map((h) => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {predictions.map((r) => (
                <tr key={r.area} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2.5 px-3 font-medium">
                    {r.area}
                    {r.areaType && <span className="text-[10px] text-muted-foreground ml-1.5">({r.areaType})</span>}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            r.risk === "high" ? "bg-risk-high" :
                            r.risk === "moderate" ? "bg-risk-moderate" :
                            "bg-risk-low"
                          }`}
                          style={{ width: `${r.probability}%` }}
                        />
                      </div>
                      <span className="font-semibold text-foreground">{r.probability}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3"><span className={`risk-badge-${r.risk}`}>{r.risk}</span></td>
                  <td className="py-2.5 px-3 font-medium">{r.expectedWeek}</td>
                  <td className="py-2.5 px-3 text-xs text-muted-foreground max-w-xs">{r.signal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
