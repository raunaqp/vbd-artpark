import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { regionData } from "@/data/mockData";

const trendIcon = { up: TrendingUp, down: TrendingDown, stable: Minus };

export default function RegionTable() {
  const highRiskAreas = regionData.filter((r) => r.risk === "high" || r.risk === "moderate").slice(0, 5);

  return (
    <div className="section-card p-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="section-title">High Risk Areas (Last 4 Weeks)</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">Based on confirmed cases in last 4 weeks</p>
      <div className="overflow-auto max-h-[340px]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Area</th>
              <th className="text-right py-2 px-2 text-xs font-medium text-muted-foreground">Cases</th>
              <th className="text-center py-2 px-2 text-xs font-medium text-muted-foreground">Trend</th>
              <th className="text-center py-2 px-2 text-xs font-medium text-muted-foreground">Risk</th>
            </tr>
          </thead>
          <tbody>
            {highRiskAreas.map((r) => {
              const TrendIcon = trendIcon[r.trend];
              return (
                <tr key={r.name} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2 px-2 font-medium">{r.name}</td>
                  <td className="py-2 px-2 text-right">{r.confirmed}</td>
                  <td className="py-2 px-2 text-center">
                    <TrendIcon className={`h-4 w-4 inline ${r.trend === "up" ? "text-risk-high" : r.trend === "down" ? "text-risk-low" : "text-muted-foreground"}`} />
                  </td>
                  <td className="py-2 px-2 text-center"><span className={`risk-badge-${r.risk}`}>{r.risk}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
