// Operational Action Map (R4.3) — the Response tab's map surface.
//
// One overlay at a time, by design: the design doc is explicit that operations
// staff answer one question at a time, and stacking overlays would make the
// colour vocabulary ambiguous.
//
// Three of the four overlays are ward-grain, so they only render below district
// level. Above that the map greys out and DashboardMap shows a drill hint —
// preferred over painting a stale risk colour under a toggle that no longer
// means risk.
import { useState } from "react";
import DashboardMap from "@/components/DashboardMap";
import { OVERLAY_IDS, OVERLAY_LABELS, type OverlayId } from "@/lib/operationalOverlay";
import type { OperationalWardMap } from "./operationalWards";

interface Props {
  /** Ward scope for the active filters, resolved once by the Response tab (R4.4.4). */
  wards: OperationalWardMap;
  loading?: boolean;
  error?: string | null;
}

// R4.4.4: the ward scope arrives as a prop rather than from an own
// `useOperationalWards` call, so the tiles, the map and the table all read one
// resolve. Overlay behaviour is unchanged from R4.3.
export default function OperationalActionMap({ wards, loading = false, error = null }: Props) {
  const [overlay, setOverlay] = useState<OverlayId>("forecast_risk");

  return (
    <div>
      <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
        <div>
          <h3 className="section-title">Operational Action Map — {OVERLAY_LABELS[overlay]}</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {overlay === "forecast_risk"
              ? "Predicted risk, for comparison against the operational overlays · Click areas to drill down"
              : "Field operations against the forecast · Click areas to drill down"}
            {loading && " · loading operational data…"}
            {error && " · operational data unavailable"}
          </p>
        </div>

        {/* Segmented control — same idiom as the Effectiveness window switcher. */}
        <div className="tab-nav">
          {OVERLAY_IDS.map((id) => (
            <button
              key={id}
              onClick={() => setOverlay(id)}
              className={`tab-nav-item ${overlay === id ? "tab-nav-item-active" : ""}`}
            >
              {OVERLAY_LABELS[id]}
            </button>
          ))}
        </div>
      </div>

      <DashboardMap
        height="380px"
        mode="operational"
        overlay={overlay}
        operationalWards={wards}
      />
    </div>
  );
}
