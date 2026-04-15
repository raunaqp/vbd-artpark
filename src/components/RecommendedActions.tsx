import { Shield, AlertTriangle, Info } from "lucide-react";
import { recommendedActions, regionData } from "@/data/mockData";

const riskIcons = { high: AlertTriangle, moderate: Shield, low: Info };
const riskHeadings: Record<string, string> = {
  high: "High Risk Areas",
  moderate: "Moderate Risk Areas",
  low: "Low Risk Areas",
};

export default function RecommendedActions() {
  const grouped = {
    high: regionData.filter((r) => r.risk === "high"),
    moderate: regionData.filter((r) => r.risk === "moderate"),
    low: regionData.filter((r) => r.risk === "low"),
  };

  return (
    <div className="section-card p-5 mb-6">
      <h3 className="section-title mb-4">Recommended Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["high", "moderate", "low"] as const).map((level) => {
          const Icon = riskIcons[level];
          const areas = grouped[level];
          if (areas.length === 0) return null;
          return (
            <div key={level} className={`rounded-lg border p-4 border-risk-${level}/30 bg-risk-${level}/5`}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`h-4 w-4 text-risk-${level}`} />
                <span className="font-semibold text-sm">{riskHeadings[level]}</span>
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                {areas.map((a) => a.name).join(", ")}
              </div>
              <ul className="space-y-1.5">
                {recommendedActions[level].map((action, i) => (
                  <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                    <span className={`mt-1 w-1.5 h-1.5 rounded-full bg-risk-${level} flex-shrink-0`} />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
