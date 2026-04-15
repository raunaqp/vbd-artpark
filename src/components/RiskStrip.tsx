import { riskForecast } from "@/data/mockData";

const riskColors: Record<string, string> = {
  low: "bg-risk-low/10 border-risk-low text-risk-low",
  moderate: "bg-risk-moderate/10 border-risk-moderate text-risk-moderate",
  high: "bg-risk-high/10 border-risk-high text-risk-high",
};

export default function RiskStrip() {
  return (
    <div>
      <h3 className="section-title mb-3">Weekly Forecast (W1–W4)</h3>
      <div className="grid grid-cols-4 gap-3">
        {riskForecast.map((f) => (
          <div key={f.week} className={`rounded-lg border-2 p-3 text-center ${riskColors[f.risk] || riskColors.moderate}`}>
            <div className="text-xs font-semibold uppercase">{f.week}</div>
            <div className="text-lg font-bold">{f.cases}</div>
            <div className="text-xs opacity-80">{f.label}</div>
            <div className="mt-1">
              <span className={`risk-badge-${f.risk}`}>{f.risk}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
