// Admin → Assumptions (R3.4) — read-only view of the config that drives the
// recommendation engine, plus the rules themselves.
//
// Display-only in R3: every threshold carries an `editable` flag from the
// generated config, but nothing is wired to an input yet. The point of the tab
// is transparency — a state team that disagrees with a threshold can see
// exactly what it is and where it came from before arguing about it.
//
// This is the first surface that actually reads the R3 datasets, so it also
// serves as the runtime check that the lazy-load chunks resolve in the browser.
import { useEffect, useState } from "react";
import { AlertCircle, Info } from "lucide-react";
import {
  loadConfigAssumptions,
  loadRecommendationRules,
  type ConfigAssumptions,
  type RecommendationRule,
} from "@/data/r3/loader";

// ──────────────── Config flattening ────────────────

interface AssumptionRow {
  category: string;
  key: string;
  value: string;
  source: string;
  editable: boolean;
}

// Turn "fogging_cadence" into "Fogging cadence", "bi_threshold" into
// "BI threshold" — the generated config is snake_case throughout.
const ACRONYMS: Record<string, string> = { bi: "BI", hi: "HI", ci: "CI", pct: "%" };

function humanise(s: string): string {
  const words = s.split("_").map((w) => ACRONYMS[w] ?? w);
  const joined = words.join(" ").replace(/ %/g, " %");
  return joined.charAt(0).toUpperCase() + joined.slice(1);
}

function formatValue(v: unknown): string {
  if (Array.isArray(v)) return v.join("\n");
  if (v === null || v === undefined) return "—";
  return String(v);
}

/**
 * CONFIG_ASSUMPTIONS is a map of category → { ...thresholds, source, editable }.
 * `source` and `editable` describe the category rather than being thresholds of
 * their own, so they are lifted onto each row instead of becoming rows.
 */
function flattenConfig(config: ConfigAssumptions): AssumptionRow[] {
  const rows: AssumptionRow[] = [];
  for (const [category, body] of Object.entries(config)) {
    const group = body as Record<string, unknown>;
    const source = String(group.source ?? "—");
    const editable = Boolean(group.editable);
    for (const [key, value] of Object.entries(group)) {
      if (key === "source" || key === "editable") continue;
      rows.push({
        category: humanise(category),
        key,
        value: formatValue(value),
        source,
        editable,
      });
    }
  }
  return rows;
}

// ──────────────── Panel ────────────────

export default function AssumptionsPanel() {
  const [config, setConfig] = useState<ConfigAssumptions | null>(null);
  const [rules, setRules] = useState<readonly RecommendationRule[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadConfigAssumptions(), loadRecommendationRules()])
      .then(([c, r]) => {
        if (cancelled) return;
        setConfig(c);
        setRules(r);
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      });
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div className="section-card p-5 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-risk-high mt-0.5 shrink-0" />
        <div>
          <h3 className="section-title">Assumptions unavailable</h3>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!config || !rules) {
    return (
      <div className="section-card p-5 text-sm text-muted-foreground">
        Loading assumptions…
      </div>
    );
  }

  const rows = flattenConfig(config);

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Why this tab exists — the framing a state team reads first. */}
      <div className="section-card p-4 flex items-start gap-2.5">
        <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          These assumptions drive the recommendation engine. Every threshold is
          documented with its source. When state teams disagree with a threshold,
          they can edit it here (feature coming soon) — the defaults come from
          NVBDCP guidance.
        </p>
      </div>

      {/* ── Config table ── */}
      <div className="section-card p-4">
        <h3 className="section-title mb-3">Configuration ({rows.length})</h3>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Category", "Key", "Current value", "Source", "Editable"].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-medium text-muted-foreground whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.category}|${r.key}`} className="border-b border-border/50 hover:bg-muted/30 align-top">
                  <td className="py-2 px-3 whitespace-nowrap">{r.category}</td>
                  <td className="py-2 px-3 font-medium whitespace-nowrap">{r.key}</td>
                  <td className="py-2 px-3 font-mono text-xs whitespace-pre-line">{r.value}</td>
                  <td className="py-2 px-3 text-muted-foreground text-xs">{r.source}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        r.editable
                          ? "bg-risk-low/15 text-risk-low"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {String(r.editable)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Recommendation rules ── */}
      <div className="section-card p-4">
        <h3 className="section-title mb-1">Recommendation Rules ({rules.length})</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Evaluated top to bottom — the first rule whose condition matches wins, so
          a ward never gets more than one recommended action.
        </p>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["#", "Priority", "Condition", "Action text", "Protocol reference"].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-medium text-muted-foreground whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rules.map((r, i) => (
                <tr key={`${i}|${r.condition}`} className="border-b border-border/50 hover:bg-muted/30 align-top">
                  <td className="py-2 px-3 text-muted-foreground text-xs">{i}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        r.priority === "urgent" ? "" : "bg-muted text-muted-foreground"
                      }`}
                      style={
                        r.priority === "urgent"
                          ? {
                              backgroundColor: "hsl(var(--risk-high) / 0.15)",
                              color: "hsl(var(--risk-high))",
                            }
                          : undefined
                      }
                    >
                      {r.priority}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-mono text-xs">
                    {r.condition === "default" ? (
                      <span className="text-muted-foreground italic">default (always matches)</span>
                    ) : (
                      r.condition
                    )}
                  </td>
                  <td className="py-2 px-3 font-medium">{r.action_text}</td>
                  <td className="py-2 px-3 text-muted-foreground text-xs">{r.protocol_reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Values will be editable in a future release. Currently defaults are baked
        into the config file.
      </p>
    </div>
  );
}
