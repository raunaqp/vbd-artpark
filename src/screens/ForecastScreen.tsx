import { useEffect, useState } from "react";
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from "recharts";
import { getForecastData, getRiskForecast, getPriorityForecastAreas, getStateLocalRiskNote } from "@/data/mockData";
import { useRole } from "@/contexts/RoleContext";
import { useFilters } from "@/contexts/FilterContext";
import { useDisease } from "@/contexts/DiseaseContext";
import { useStateSelection } from "@/contexts/StateContext";
import { useBlockVisibility } from "@/contexts/BlockVisibilityContext";
import GlobalFilters from "@/components/GlobalFilters";
import DashboardMap from "@/components/DashboardMap";
import TablePagination from "@/components/TablePagination";
import ExportPdfButton from "@/components/ExportPdfButton";
import { latestEpiWeek, epiWeekRange } from "@/lib/epiWeek";
import { WeeklyResponseProvider } from "@/features/weeklyResponse/WeeklyResponseProvider";
import PriorityAreasSection from "@/features/weeklyResponse/PriorityAreasSection";
import WeeklyOperationalResponseSection from "@/features/weeklyResponse/WeeklyOperationalResponseSection";

const PAGE_SIZE = 20;

export default function ForecastScreen() {
  const { isAnalyst } = useRole();
  const { appliedFilters, dateWindow, levelLabels } = useFilters();
  const { diseaseName } = useDisease();
  const { stateId } = useStateSelection();
  const { isVisible } = useBlockVisibility();
  const show = (id: string) => isVisible("forecast", id);
  void stateId;

  const riskForecast = getRiskForecast(appliedFilters);
  const forecastData = getForecastData(appliedFilters);
  const priorityAreas = getPriorityForecastAreas(appliedFilters);
  const stateLocalNote = getStateLocalRiskNote(appliedFilters);

  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [appliedFilters.district, appliedFilters.block]);
  const visiblePriorityAreas = priorityAreas.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const areaLabel = appliedFilters.block !== "All Blocks"
    ? levelLabels.level_3
    : appliedFilters.district !== "All Districts"
    ? levelLabels.level_2
    : levelLabels.level_1;

  const fmtIso = (iso: string) => {
    const [y, m, d] = iso.split("-");
    return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };
  const forecastRange = `${fmtIso(dateWindow.forecastStartDate)} – ${fmtIso(dateWindow.forecastEndDate)}`;
  const todayLabel = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const epiToday = latestEpiWeek();
  const epiRange = epiWeekRange(dateWindow.forecastStartDate, dateWindow.forecastEndDate);

  // One concise operational sentence, driven by the peak risk across the 4 weeks.
  const riskRank = (r: string) => (r === "high" ? 2 : r === "moderate" ? 1 : 0);
  const peakRisk = riskForecast.reduce<"high" | "moderate" | "low">(
    (acc, f) => (riskRank(f.risk) > riskRank(acc) ? f.risk : acc), "low");
  const disease = diseaseName.toLowerCase();
  const opSentence = peakRisk === "high"
    ? `High ${disease} activity is expected over the next four weeks. Prioritise surveillance and response in high-risk areas.`
    : peakRisk === "moderate"
    ? `Moderate ${disease} activity is expected over the next four weeks. Continue surveillance and prioritise moderate-risk areas.`
    : `Low ${disease} activity is expected over the next four weeks. Maintain routine surveillance.`;

  const buildSections = () => {
    const sections = [
      {
        title: "Forecast — Next 4 Weeks",
        type: "kv" as const,
        lines: riskForecast.map((f, i) => `${f.label}: ${f.cases} projected cases · ${f.riskLabel ?? f.risk}`),
      },
      {
        title: "Priority Forecast Areas",
        type: "table" as const,
        headers: [areaLabel, "Projected Cases", "Forecast Risk"],
        rows: priorityAreas.map((r) => [r.area, r.projectedCases === null ? "—" : r.projectedCases.toLocaleString(), String(r.riskLabel ?? r.risk)]),
      },
    ];
    return sections;
  };

  return (
    <div className="space-y-6">
      <GlobalFilters freshnessLabel="Forecast generated: this week" />

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{diseaseName} Forecast — Predicted Risk</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Forecast generated: <span className="text-foreground font-medium">{todayLabel}{epiToday ? ` (${epiToday})` : ""}</span>
            <span className="mx-2 text-border">·</span>
            Forecast period: <span className="text-foreground font-medium">{forecastRange}{epiRange ? ` · ${epiRange}` : ""}</span>
          </p>
        </div>
        <ExportPdfButton tabName="Forecast" buildSections={buildSections} />
      </div>

      <div className={`rounded-lg border px-4 py-2.5 text-sm ${
        peakRisk === "high" ? "border-risk-high/30 bg-risk-high/5"
        : peakRisk === "moderate" ? "border-risk-moderate/30 bg-risk-moderate/5"
        : "border-border bg-muted/30"
      }`}>
        <span className="text-foreground">{opSentence}</span>
      </div>

      {show("risk_cards") && (
      <div className="grid grid-cols-4 gap-3">
        {riskForecast.map((f) => {
          const riskClass = f.risk === "high" ? "border-risk-high bg-risk-high/5 text-risk-high"
            : f.risk === "moderate" ? "border-risk-moderate bg-risk-moderate/5 text-risk-moderate"
            : "border-risk-low bg-risk-low/5 text-risk-low";
          return (
            <div key={f.week} className={`rounded-lg border-2 p-3 text-center ${riskClass}`}>
              <div className="text-xs font-semibold">{f.label}</div>
              <div className="text-2xl font-bold mt-1">{f.cases}</div>
              <div className="text-[11px] opacity-80">projected cases</div>
              <div className="mt-1.5"><span className={`risk-badge-${f.risk}`}>{f.riskLabel ?? f.risk}</span></div>
            </div>
          );
        })}
      </div>
      )}

      {show("risk_cards") && appliedFilters.district === "All Districts" && (
        <p className="text-xs text-muted-foreground -mt-2">{stateLocalNote}</p>
      )}

      {/* 2–4. Operational layer: Priority Areas → Forecast Risk Map → Weekly Operational Response.
          Wrapped in a provider so both operational sections share one reporting week + drawer. */}
      <WeeklyResponseProvider>
        <PriorityAreasSection />

        {show("forecast_map") && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="section-title">Forecast Risk Map — {forecastRange}</h3>
            <span className="text-[11px] text-muted-foreground">Colors reflect <strong>predicted</strong> outbreak risk · Click areas to drill down</span>
          </div>
          <DashboardMap height="380px" mode="forecast" />
        </div>
        )}

        <WeeklyOperationalResponseSection />
      </WeeklyResponseProvider>

      {/* 5. Forecast Details — technical outputs supporting the operational recommendations above. */}
      {show("actual_vs_predicted") && isAnalyst && (
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

      {show("outbreak_table") && (
      <div className="section-card p-5">
        <h3 className="section-title mb-1">Priority Forecast Areas</h3>
        <p className="text-xs text-muted-foreground mb-4">Projected {diseaseName.toLowerCase()} cases over the 4-week forecast window · Sorted by projected cases · Showing: {areaLabel} level</p>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {[areaLabel, "Projected Cases", "Forecast Risk"].map((h) => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visiblePriorityAreas.map((r) => (
                <tr key={r.area} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2.5 px-3 font-medium">
                    {r.area}
                    {r.areaType && <span className="text-[10px] text-muted-foreground ml-1.5">({r.areaType})</span>}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-foreground tabular-nums">
                    {r.projectedCases === null ? <span className="text-muted-foreground font-normal">—</span> : r.projectedCases.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3"><span className={`risk-badge-${r.risk}`}>{r.riskLabel ?? r.risk}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination page={page} pageSize={PAGE_SIZE} total={priorityAreas.length} onPageChange={setPage} />
      </div>
      )}
    </div>
  );
}
