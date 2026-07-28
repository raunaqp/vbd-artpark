import { useState } from "react";

// Response Effectiveness — joins case rise × larval survey coverage × logged
// action per ward to surface "action gap" wards. C.2 sets up the shell + time
// window selector; data wiring lands in C.3.
export type EffectivenessWindow = 2 | 4 | 8 | 12;
const WINDOWS: EffectivenessWindow[] = [2, 4, 8, 12];

export default function ResponseEffectivenessPanel() {
  const [windowWeeks, setWindowWeeks] = useState<EffectivenessWindow>(2);

  return (
    <div className="section-card p-5 space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h3 className="section-title">Response Effectiveness</h3>
          <p className="text-xs text-muted-foreground">
            Where did cases rise? Where did surveys happen? Did actions follow?
          </p>
        </div>
        <div className="tab-nav">
          {WINDOWS.map((w) => (
            <button
              key={w}
              onClick={() => setWindowWeeks(w)}
              className={`tab-nav-item ${windowWeeks === w ? "tab-nav-item-active" : ""}`}
            >
              {w}W
            </button>
          ))}
        </div>
      </div>

      {/* Content — populated in C.3 */}
      <div className="rounded-md border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
        Loading effectiveness data…
      </div>
    </div>
  );
}
