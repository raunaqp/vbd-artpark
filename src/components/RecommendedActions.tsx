import { Shield, AlertTriangle, Info } from "lucide-react";
import { actionsByScope, regionData } from "@/data/mockData";
import { useRole } from "@/contexts/RoleContext";

const riskIcons = { high: AlertTriangle, moderate: Shield, low: Info };
const riskHeadings: Record<string, string> = {
  high: "High Risk Areas",
  moderate: "Moderate Risk Areas",
  low: "Low Risk Areas",
};

export default function RecommendedActions() {
  const { currentRole } = useRole();
  
  const scopeLevel = currentRole.scope === "state" || currentRole.scope === "district" 
    ? "district" 
    : currentRole.scope === "municipality" 
    ? "ward" 
    : "block";

  const grouped = {
    high: regionData.filter((r) => r.risk === "high"),
    moderate: regionData.filter((r) => r.risk === "moderate"),
    low: regionData.filter((r) => r.risk === "low"),
  };

  return (
    <div className="section-card p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title">Recommended Actions</h3>
        <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
          {scopeLevel}-level actions · {currentRole.roleName}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["high", "moderate", "low"] as const).map((level) => {
          const Icon = riskIcons[level];
          const areas = grouped[level];
          const actions = actionsByScope[level]?.[scopeLevel] || [];
          if (areas.length === 0) return null;
          return (
            <div key={level} className={`rounded-lg border p-4 ${
              level === "high" ? "border-risk-high/30 bg-risk-high/5" :
              level === "moderate" ? "border-risk-moderate/30 bg-risk-moderate/5" :
              "border-risk-low/30 bg-risk-low/5"
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`h-4 w-4 ${
                  level === "high" ? "text-risk-high" :
                  level === "moderate" ? "text-risk-moderate" :
                  "text-risk-low"
                }`} />
                <span className="font-semibold text-sm">{riskHeadings[level]}</span>
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                {areas.map((a) => a.name).join(", ")}
              </div>
              <ul className="space-y-1.5">
                {actions.map((action, i) => (
                  <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                    <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      level === "high" ? "bg-risk-high" :
                      level === "moderate" ? "bg-risk-moderate" :
                      "bg-risk-low"
                    }`} />
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
