// Monthly Reports panel — sidebar of last 6 months, 5-section report, PDF/CSV export.
import { useMemo, useState } from "react";
import { FileDown, FileText } from "lucide-react";
import { useDisease } from "@/contexts/DiseaseContext";
import { useFilters } from "@/contexts/FilterContext";
import { exportTabAsPDF, type ExportSection } from "@/lib/export_view_pdf";
import {
  getFilteredKpi,
  getFilteredRegions,
  getFilteredHotspots,
  getOutbreakPredictions,
} from "@/data/mockData";
import { canonicalNewEmergence, canonicalRisingClusters } from "@/data/canonical";
import { stateLabelFromId } from "@/data/canonical";
import type { StateId } from "@/data/mockData";

interface Props { stateId: StateId; stateLabel: string }

function lastNMonths(n: number): { iso: string; label: string }[] {
  const out: { iso: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    out.push({ iso, label: d.toLocaleDateString("en-GB", { month: "long", year: "numeric" }) });
  }
  return out;
}

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadCsv(filename: string, rows: (string | number)[][], headers: string[]) {
  const csv = [headers.join(","), ...rows.map(r => r.map(csvEscape).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function MonthlyReportsPanel({ stateId, stateLabel }: Props) {
  const months = useMemo(() => lastNMonths(6), []);
  const [selected, setSelected] = useState(months[0].iso);
  const { diseaseName } = useDisease();
  const { appliedFilters } = useFilters();

  // Build report from current data (mock). Disease + state come from context.
  const stateFilters = { ...appliedFilters, district: "All Districts", block: "All Blocks", ward: "All Wards" };
  const kpi = getFilteredKpi(stateFilters);
  const regions = getFilteredRegions(stateFilters);
  const hotspots = getFilteredHotspots(stateFilters, 4);
  const predictions = getOutbreakPredictions(stateFilters);
  const emerging = canonicalNewEmergence(stateLabelFromId(stateId), stateFilters);
  const declining = regions.filter(r => r.trend === "down").slice(0, 5);

  const monthLabel = months.find(m => m.iso === selected)?.label ?? selected;
  const topHotspots = hotspots.slice(0, 10);

  const sections: ExportSection[] = [
    { title: `${diseaseName} — ${monthLabel} · ${stateLabel}`, type: "kv", lines: [
      `Suspected: ${kpi.suspected}`,
      `Tested: ${kpi.tested}`,
      `Confirmed: ${kpi.confirmed}`,
      `High-risk areas: ${regions.filter(r => r.risk === "high").length}`,
      `Moderate-risk areas: ${regions.filter(r => r.risk === "moderate").length}`,
    ]},
    { title: "Top Hotspots (last 4 weeks)", type: "table",
      headers: ["Area", "Parent District", "Cases", "Prev", "Trend"],
      rows: topHotspots.map(h => [h.area, h.parentDistrict ?? "—", h.currentCases, h.prevCases, h.trend]),
    },
    { title: "Emerging Clusters", type: "table",
      headers: ["Area", "Parent", "Recent", "Prior"],
      rows: emerging.map((e: any) => [e.name, e.parent ?? "—", e.cases, e.prevCases]),
    },
    { title: "Declining Areas", type: "table",
      headers: ["Area", "Cases", "Risk"],
      rows: declining.map(d => [d.name, d.confirmed, d.risk]),
    },
    { title: "Forecast Accuracy (this month)", type: "kv", lines: [
      "Mean absolute percentage error (MAPE): 14.2% (mock)",
      "Outbreak detection precision: 0.78 · recall: 0.71 (mock)",
      `Coverage: ${predictions.length} areas with forecast`,
    ]},
  ];

  const handleDownloadPdf = () => {
    exportTabAsPDF({
      tabName: `Monthly Report ${selected}`,
      state: stateLabel, disease: diseaseName,
      geographyPath: stateLabel,
      asOfDate: new Date().toISOString().split("T")[0],
      sections,
    });
  };

  const handleDownloadCsv = () => {
    const rows: (string | number)[][] = [];
    rows.push(["Section", "Field", "Value"]);
    sections.forEach((s) => {
      if (s.type === "kv") s.lines.forEach((l) => rows.push([s.title, "", l]));
      else { rows.push([s.title, ...s.headers]); s.rows.forEach((r) => rows.push([s.title, ...r])); }
    });
    downloadCsv(`prism-h-monthly-${stateLabel}-${selected}.csv`, rows.slice(1), rows[0] as string[]);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-5">
      <aside className="section-card p-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Months</h4>
        <ul className="space-y-1">
          {months.map((m) => (
            <li key={m.iso}>
              <button
                onClick={() => setSelected(m.iso)}
                className={`w-full text-left text-sm rounded-md px-2 py-1.5 ${selected === m.iso ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                {m.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <div className="section-card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="section-title">Monthly Report — {monthLabel}</h3>
            <p className="text-xs text-muted-foreground">{diseaseName} · {stateLabel} (state-scoped, mock data)</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleDownloadCsv} className="h-8 px-3 rounded-md border border-input text-sm flex items-center gap-1.5 hover:bg-muted">
              <FileDown className="h-3.5 w-3.5" /> CSV
            </button>
            <button onClick={handleDownloadPdf} className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-sm flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" /> PDF
            </button>
          </div>
        </div>

        <div className="space-y-5">
          {sections.map((s, i) => (
            <div key={i}>
              <h4 className="text-sm font-semibold text-foreground mb-2">{s.title}</h4>
              {s.type === "kv" ? (
                <ul className="text-sm text-muted-foreground space-y-1">
                  {s.lines.map((l, j) => <li key={j}>• {l}</li>)}
                </ul>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        {s.headers.map((h) => <th key={h} className="text-left py-1.5 px-2 font-medium text-muted-foreground">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {s.rows.length === 0 ? (
                        <tr><td colSpan={s.headers.length} className="py-2 px-2 text-muted-foreground italic">None this month</td></tr>
                      ) : s.rows.map((r, ri) => (
                        <tr key={ri} className="border-b border-border/50">
                          {r.map((c, ci) => <td key={ci} className="py-1.5 px-2">{String(c)}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
