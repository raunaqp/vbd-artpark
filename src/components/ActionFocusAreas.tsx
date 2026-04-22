import { MapPin, Zap } from "lucide-react";
import { useFilters } from "@/contexts/FilterContext";
import { useDisease } from "@/contexts/DiseaseContext";
import { getActionFocusAreas, type ActionFocusItem, type ActionFocusReason } from "@/data/mockData";

const geoLabel: Record<ActionFocusItem["geoType"], string> = {
  urban: "Urban",
  rural: "Rural",
  industrial: "Industrial",
  coastal: "Coastal",
  periurban: "Peri-urban",
  construction: "Construction",
};

// Cross-panel reason tags — connect Action Focus back to Hotspot/Forecast/etc.
const reasonLabel: Record<ActionFocusReason, string> = {
  new_emergence: "New emergence",
  rising_hotspot_burden: "Rising hotspot burden",
  high_forecast_risk: "High forecast risk",
  persistent_transmission: "Persistent transmission",
  curated_priority: "Curated priority",
};

const reasonClass: Record<ActionFocusReason, string> = {
  new_emergence: "bg-primary/10 text-primary border-primary/30",
  rising_hotspot_burden: "bg-risk-high/10 text-risk-high border-risk-high/30",
  high_forecast_risk: "bg-risk-high/10 text-risk-high border-risk-high/30",
  persistent_transmission: "bg-risk-moderate/10 text-risk-moderate border-risk-moderate/30",
  curated_priority: "bg-muted text-muted-foreground border-border",
};

export default function ActionFocusAreas() {
  const { appliedFilters } = useFilters();
  const { diseaseName } = useDisease();
  const items = getActionFocusAreas(appliedFilters);

  return (
    <div className="section-card p-5 mb-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="section-title">Action Focus Areas — {diseaseName}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Each area carries an explicit reason tag tied to Hotspot, Forecast, or curated signals
          </p>
        </div>
        <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
          {items.length} priorit{items.length === 1 ? "y" : "ies"}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          No priority action areas in the selected scope.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) => (
            <div
              key={`${item.area}-${item.parent || ""}`}
              className="rounded-lg border border-border bg-card p-3 flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="font-semibold text-sm truncate">{item.area}</span>
                  </div>
                  {item.parent && (
                    <div className="text-[11px] text-muted-foreground ml-5 truncate">
                      {item.parent}
                    </div>
                  )}
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${reasonClass[item.reason]} flex-shrink-0 font-medium`}>
                  {reasonLabel[item.reason]}
                </span>
              </div>
              {item.reasonHint && (
                <div className="text-[11px] text-muted-foreground mb-2 leading-snug">
                  Why prioritized: {item.reasonHint}
                </div>
              )}
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-medium">
                  {geoLabel[item.geoType]}
                </span>
                {item.source === "curated" && (
                  <span className="text-[10px] text-primary font-medium">★ Curated</span>
                )}
              </div>
              <ul className="space-y-1.5 mt-auto">
                {item.actions.map((a, i) => (
                  <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                    <Zap className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
