import { useEffect, useState } from "react";
import { getQAReport, type QAReport } from "@/data/mockData";
import { useFilters } from "@/contexts/FilterContext";
import { useStateSelection } from "@/contexts/StateContext";
import { X } from "lucide-react";

/**
 * Internal QA / data-consistency panel.
 * Toggled by appending `?qa=1` to the URL. Not user-facing.
 */
export default function QADebugPanel() {
  const { appliedFilters } = useFilters();
  const { stateId } = useStateSelection();
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(true);
  const [report, setReport] = useState<QAReport | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEnabled(params.get("qa") === "1");
  }, []);

  useEffect(() => {
    if (!enabled) return;
    try { setReport(getQAReport(appliedFilters)); } catch { setReport(null); }
  }, [enabled, appliedFilters, stateId]);

  if (!enabled || !report) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[2000] w-[420px] max-h-[70vh] overflow-auto bg-card border-2 border-primary/40 rounded-lg shadow-xl text-xs">
      <div className="sticky top-0 bg-primary text-primary-foreground px-3 py-2 flex items-center justify-between">
        <strong>QA · Data Consistency · {report.state}</strong>
        {open ? (
          <button onClick={() => setOpen(false)} className="opacity-80 hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
        ) : (
          <button onClick={() => setOpen(true)} className="opacity-80 hover:opacity-100">expand</button>
        )}
      </div>
      {open && (
        <div className="p-3 space-y-3">
          <div className="text-muted-foreground">
            <div>Window: {report.windowLabel}</div>
            <div>Forecast: {report.forecastLabel}</div>
            <div>State: {report.state}</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="State cases" value={report.stateTotalConfirmed} />
            <Stat label="Σ districts" value={report.sumOfDistrictConfirmed} />
            <Stat label="Δ" value={report.cases_diff} highlight={report.cases_diff !== 0} />
            <Stat label="State fcst" value={report.stateForecastSum} />
            <Stat label="Σ dist fcst" value={report.sumOfDistrictForecastSum} />
            <Stat label="Δ" value={report.forecast_diff} highlight={report.forecast_diff !== 0} />
            <Stat label="High p" value={report.probabilityBands.high} />
            <Stat label="Mod p" value={report.probabilityBands.moderate} />
            <Stat label="Low p" value={report.probabilityBands.low} />
            <Stat label="Band check" value={report.bandConsistencyOk ? 1 : 0} highlight={!report.bandConsistencyOk} />
            <Stat label="Missing data" value={report.missingDataDistricts} highlight={report.missingDataDistricts > 0} />
            <Stat label="# districts" value={report.perDistrict.length} />
          </div>
          <div className="rounded-md border border-border bg-muted/30 px-2 py-1.5 text-[11px] leading-snug">
            <div className="text-muted-foreground mb-0.5">State vs local interpretation</div>
            <div className="text-foreground">{report.stateLocalNote}</div>
          </div>
          <table className="w-full">
            <thead className="text-muted-foreground">
              <tr><th className="text-left py-1">District</th><th className="text-right">Cases</th><th className="text-right">Fcst Σ</th><th className="text-right">Rows</th></tr>
            </thead>
            <tbody>
              {report.perDistrict.map((d) => (
                <tr key={d.district} className="border-t border-border/50">
                  <td className="py-1">{d.district}</td>
                  <td className="text-right">{d.confirmed}</td>
                  <td className="text-right">{d.forecastSum}</td>
                  <td className="text-right">{d.childRows}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-md border px-2 py-1.5 ${highlight ? "border-risk-high bg-risk-high/10 text-risk-high" : "border-border bg-muted/30"}`}>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="font-semibold text-sm">{value}</div>
    </div>
  );
}
