import { useRole } from "@/contexts/RoleContext";
import { useStateSelection } from "@/contexts/StateContext";
import { useBlockVisibility } from "@/contexts/BlockVisibilityContext";
import { BLOCK_REGISTRY, TAB_LABELS, type BlockTabId } from "@/config/blockRegistry";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, RotateCcw, Lock } from "lucide-react";

export default function ViewSettingsScreen() {
  const { currentRole, isAnalyst } = useRole();
  const { stateId, options } = useStateSelection();
  const stateLabel = options.find((s) => s.id === stateId)?.label ?? stateId;
  const { isVisible, setVisible, setAllForTab, resetTab, resetAll } = useBlockVisibility();

  if (!isAnalyst) {
    return (
      <div className="max-w-2xl mx-auto mt-12 section-card p-8 text-center">
        <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-foreground mb-1">Restricted</h2>
        <p className="text-sm text-muted-foreground">
          View Settings are available only to Analyst users. Switch to an Analyst role to manage block visibility.
        </p>
      </div>
    );
  }

  const tabs = Object.keys(BLOCK_REGISTRY) as BlockTabId[];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-foreground">View Settings — {stateLabel}</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Per-user visibility for <span className="font-medium text-foreground">{currentRole.userName}</span>.
            Changes apply only to <span className="font-medium text-foreground">{stateLabel}</span> and persist on this device.
          </p>
        </div>
        <button
          onClick={resetAll}
          className="h-8 px-3 rounded-md border border-input text-xs flex items-center gap-1.5 text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset everything
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {tabs.map((tab) => {
          const blocks = BLOCK_REGISTRY[tab];
          const visibleCount = blocks.filter((b) => isVisible(tab, b.id)).length;
          return (
            <div key={tab} className="section-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="section-title">{TAB_LABELS[tab]}</h3>
                  <p className="text-[11px] text-muted-foreground">{visibleCount} of {blocks.length} visible</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setAllForTab(tab, true)}
                    title="Show all"
                    className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setAllForTab(tab, false)}
                    title="Hide all"
                    className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <EyeOff className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => resetTab(tab)}
                    title="Reset"
                    className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <ul className="divide-y divide-border">
                {blocks.map((b, i) => {
                  const visible = isVisible(tab, b.id);
                  return (
                    <li key={b.id} className="flex items-center justify-between py-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground mr-2">{i + 1}.</span>
                        <span className="text-foreground">{b.label}</span>
                      </div>
                      <Switch
                        checked={visible}
                        onCheckedChange={(v) => setVisible(tab, b.id, v)}
                        aria-label={`Toggle ${b.label}`}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
