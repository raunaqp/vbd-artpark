import { useMemo } from "react";
import { Info, TrendingUp, TrendingDown, Minus, Radar, ClipboardList, AlertTriangle, Activity, MapPin, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { getNewsAlerts } from "@/data/mockData";
import { useFilters } from "@/contexts/FilterContext";
import { useStateSelection } from "@/contexts/StateContext";
import { useDisease } from "@/contexts/DiseaseContext";
import { useBlockVisibility } from "@/contexts/BlockVisibilityContext";
import GlobalFilters from "@/components/GlobalFilters";
import Sparkline, { synthSparkSeries } from "@/components/Sparkline";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Severity = "high" | "moderate" | "low";
type Direction = "up" | "down" | "stable";

interface IndicatorCard {
  key: string;
  label: string;
  value: string;
  direction: Direction;
  trendNote: string;
  interpretation: string;
  severity: Severity;
  series: number[];
  formula?: string;
}

interface DriverRow {
  signal: string;
  status: { label: string; severity: Severity };
  impact: string;
  confidence: { label: string; tone: "strengthen" | "weaken" | "neutral" };
  geographies: string;
  updated: string;
}

type SignalType = "VECTOR" | "CLIMATE" | "FIELD" | "OPERATIONS" | "MEDIA" | "SURVEILLANCE";
type Alignment = "STRONG" | "MODERATE" | "WEAK";

interface FieldReport {
  id: string | number;
  severity: Severity;
  signalType: SignalType;
  district: string;
  headline: string;
  bullets: string[];
  implication: string;
  alignment: Alignment;
  source: string;
  date: string;
}

// ──────────────────────────── Deterministic per-state mock ────────────────────────────
const STATE_SIGNAL_PROFILE: Record<string, {
  indicators: Omit<IndicatorCard, "series">[];
  drivers: DriverRow[];
  confidence: { strengthen: string[]; weaken: string[]; level: "High" | "Moderate" | "Low" };
}> = {
  Karnataka: {
    indicators: [
      { key: "hi",  label: "House Index (HI)",       value: "8.2%",  direction: "up",    trendNote: "↑ increasing",    interpretation: "Elevated vector activity", severity: "moderate", formula: "Positive houses ÷ houses inspected × 100" },
      { key: "ci",  label: "Container Index (CI)",   value: "5.6%",  direction: "up",    trendNote: "↑ rising",        interpretation: "Container breeding rising", severity: "moderate", formula: "Positive containers ÷ containers inspected × 100" },
      { key: "bi",  label: "Breteau Index (BI)",     value: "21.4",  direction: "up",    trendNote: "↑↑ sharp rise",   interpretation: "Potential outbreak conditions", severity: "high", formula: "Positive containers ÷ houses inspected × 100" },
      { key: "fc",  label: "Fever Cluster Alerts",   value: "4 wards", direction: "up",  trendNote: "+2 this week",    interpretation: "Emerging transmission",     severity: "high" },
      { key: "rf",  label: "Rainfall Anomaly",       value: "+38%",  direction: "up",    trendNote: "Above seasonal",  interpretation: "Vector suitability elevated", severity: "moderate" },
      { key: "lc",  label: "Larval Survey Coverage", value: "68%",   direction: "down",  trendNote: "↓ below target",  interpretation: "Incomplete surveillance",   severity: "moderate" },
      { key: "uw",  label: "High-Risk Unsurveyed Wards", value: "12", direction: "up",   trendNote: "+3 vs last week", interpretation: "Surveillance gap widening", severity: "high" },
    ],
    drivers: [
      { signal: "BI Increasing",       status: { label: "High", severity: "high" },           impact: "Strengthening outbreak probability",       confidence: { label: "High confidence",      tone: "strengthen" }, geographies: "Bengaluru Urban, Mysuru",   updated: "24 May 2026" },
      { signal: "Rainfall Anomaly",    status: { label: "Moderate", severity: "moderate" },   impact: "Elevated vector suitability",              confidence: { label: "Moderate confidence",  tone: "strengthen" }, geographies: "Coastal Karnataka",         updated: "24 May 2026" },
      { signal: "Fever Clusters Emerging", status: { label: "High", severity: "high" },       impact: "Possible transmission onset",              confidence: { label: "High confidence",      tone: "strengthen" }, geographies: "Dakshina Kannada",          updated: "23 May 2026" },
      { signal: "Low Survey Coverage", status: { label: "High concern", severity: "high" },   impact: "Reduced visibility into low-risk zones",   confidence: { label: "Weakens confidence",   tone: "weaken" },     geographies: "Belagavi rural blocks",     updated: "24 May 2026" },
      { signal: "Construction Activity", status: { label: "Moderate", severity: "moderate" }, impact: "Potential breeding amplification",         confidence: { label: "Moderate confidence",  tone: "neutral" },    geographies: "Urban wards",               updated: "22 May 2026" },
    ],
    confidence: {
      level: "High",
      strengthen: ["↑ BI across urban wards", "↑ rainfall accumulation", "↑ fever clusters in 4 wards"],
      weaken: ["↓ larval survey coverage (68%)", "12 high-risk wards unsurveyed"],
    },
  },
  Odisha: {
    indicators: [
      { key: "hi", label: "House Index (HI)",       value: "6.4%",  direction: "up",    trendNote: "↑ rising",       interpretation: "Vector activity climbing",    severity: "moderate", formula: "Positive houses ÷ houses inspected × 100" },
      { key: "ci", label: "Container Index (CI)",   value: "4.2%",  direction: "stable", trendNote: "→ stable",      interpretation: "Container breeding contained", severity: "low", formula: "Positive containers ÷ containers inspected × 100" },
      { key: "bi", label: "Breteau Index (BI)",     value: "14.8",  direction: "up",    trendNote: "↑ moderate rise", interpretation: "Watch threshold approached", severity: "moderate", formula: "Positive containers ÷ houses inspected × 100" },
      { key: "fc", label: "Fever Cluster Alerts",   value: "2 blocks", direction: "up", trendNote: "+1 this week",   interpretation: "Localised signal",            severity: "moderate" },
      { key: "rf", label: "Rainfall Anomaly",       value: "+22%",  direction: "up",    trendNote: "Above seasonal", interpretation: "Breeding window extended",    severity: "moderate" },
      { key: "lc", label: "Larval Survey Coverage", value: "74%",   direction: "stable", trendNote: "→ near target", interpretation: "Adequate coverage",           severity: "low" },
      { key: "uw", label: "High-Risk Unsurveyed Wards", value: "6", direction: "down",  trendNote: "−2 vs last week", interpretation: "Gap narrowing",              severity: "moderate" },
    ],
    drivers: [
      { signal: "BI Approaching Threshold", status: { label: "Moderate", severity: "moderate" }, impact: "Early warning indicator",            confidence: { label: "Moderate confidence", tone: "strengthen" }, geographies: "Khordha, Cuttack",   updated: "24 May 2026" },
      { signal: "Rainfall Anomaly",         status: { label: "Moderate", severity: "moderate" }, impact: "Extended breeding window",           confidence: { label: "Moderate confidence", tone: "strengthen" }, geographies: "Coastal Odisha",      updated: "24 May 2026" },
      { signal: "Fever Clusters",           status: { label: "Moderate", severity: "moderate" }, impact: "Localised transmission likely",      confidence: { label: "Moderate confidence", tone: "strengthen" }, geographies: "Ganjam",              updated: "23 May 2026" },
      { signal: "Survey Coverage Improving", status: { label: "Adequate", severity: "low" },     impact: "Improved visibility",                confidence: { label: "Strengthens confidence", tone: "strengthen" }, geographies: "Statewide",          updated: "24 May 2026" },
    ],
    confidence: {
      level: "Moderate",
      strengthen: ["↑ BI in coastal districts", "↑ rainfall accumulation", "↑ survey coverage statewide"],
      weaken: ["Sparse signals from tribal blocks", "Delay in lab confirmation in 2 districts"],
    },
  },
  "Andhra Pradesh": {
    indicators: [
      { key: "hi", label: "House Index (HI)",       value: "7.1%",  direction: "up",     trendNote: "↑ rising",       interpretation: "Vector activity elevated",   severity: "moderate", formula: "Positive houses ÷ houses inspected × 100" },
      { key: "ci", label: "Container Index (CI)",   value: "4.9%",  direction: "up",     trendNote: "↑ slight rise",  interpretation: "Container breeding watch",   severity: "moderate", formula: "Positive containers ÷ containers inspected × 100" },
      { key: "bi", label: "Breteau Index (BI)",     value: "17.6",  direction: "up",     trendNote: "↑ rising",       interpretation: "Watch threshold crossed",    severity: "high", formula: "Positive containers ÷ houses inspected × 100" },
      { key: "fc", label: "Fever Cluster Alerts",   value: "3 mandals", direction: "up", trendNote: "+1 this week",   interpretation: "Emerging transmission",      severity: "high" },
      { key: "rf", label: "Rainfall Anomaly",       value: "+14%",  direction: "stable", trendNote: "Near seasonal",  interpretation: "Marginal influence",         severity: "low" },
      { key: "lc", label: "Larval Survey Coverage", value: "71%",   direction: "down",   trendNote: "↓ slipping",     interpretation: "Coverage gap emerging",      severity: "moderate" },
      { key: "uw", label: "High-Risk Unsurveyed Wards", value: "9", direction: "up",     trendNote: "+2 vs last week", interpretation: "Surveillance gap growing",  severity: "high" },
    ],
    drivers: [
      { signal: "BI Crossed Watch Threshold", status: { label: "High", severity: "high" },        impact: "Outbreak probability rising",         confidence: { label: "High confidence",     tone: "strengthen" }, geographies: "Vizag, Krishna",      updated: "24 May 2026" },
      { signal: "Fever Clusters Emerging",   status: { label: "High", severity: "high" },         impact: "Possible transmission onset",         confidence: { label: "High confidence",     tone: "strengthen" }, geographies: "East Godavari",       updated: "23 May 2026" },
      { signal: "Coverage Slipping",         status: { label: "Concern", severity: "moderate" },  impact: "Reduced ward-level visibility",       confidence: { label: "Weakens confidence",  tone: "weaken" },     geographies: "Rayalaseema blocks",  updated: "24 May 2026" },
      { signal: "Construction Activity",     status: { label: "Moderate", severity: "moderate" }, impact: "Potential breeding amplification",    confidence: { label: "Moderate confidence", tone: "neutral" },    geographies: "Urban mandals",       updated: "22 May 2026" },
    ],
    confidence: {
      level: "High",
      strengthen: ["↑ BI in coastal districts", "↑ fever clusters in 3 mandals", "Stable rainfall conditions"],
      weaken: ["↓ survey coverage in Rayalaseema", "9 high-risk wards unsurveyed"],
    },
  },
};

function getProfile(stateLabel: string) {
  return STATE_SIGNAL_PROFILE[stateLabel] ?? STATE_SIGNAL_PROFILE.Karnataka;
}

function severityClass(s: Severity) {
  return s === "high" ? "risk-badge-high" : s === "moderate" ? "risk-badge-moderate" : "risk-badge-low";
}
function severityBar(s: Severity) {
  if (s === "high") return "border-l-4 border-risk-high";
  if (s === "moderate") return "border-l-4 border-risk-moderate";
  return "border-l-4 border-risk-low";
}
function DirIcon({ d, severity }: { d: Direction; severity: Severity }) {
  const color =
    d === "up" ? (severity === "high" ? "text-risk-high" : "text-risk-moderate") :
    d === "down" ? "text-risk-low" :
    "text-muted-foreground";
  const Icon = d === "up" ? TrendingUp : d === "down" ? TrendingDown : Minus;
  return <Icon className={`h-3.5 w-3.5 ${color}`} />;
}

// ──────────────────────────── News-media source attribution ────────────────────────────
// All field-intelligence cards are surfaced via news reports. Real Indian news outlets
// (national, regional and city desks) mapped per state. Disease appended for realism.
const NEWS_OUTLETS: Record<string, string[]> = {
  Karnataka: [
    "The Hindu — Bengaluru",
    "Deccan Herald — Health",
    "The Times of India — Bengaluru",
    "The Indian Express — Karnataka",
    "Bangalore Mirror",
    "The New Indian Express — Bengaluru",
    "Hindustan Times — Karnataka",
    "News18 Kannada",
  ],
  Odisha: [
    "The New Indian Express — Bhubaneswar",
    "The Times of India — Bhubaneswar",
    "The Hindu — Odisha",
    "OdishaTV",
    "Sambad English",
    "Pragativadi",
    "Hindustan Times — Odisha",
    "The Indian Express — Odisha",
  ],
  "Andhra Pradesh": [
    "The Hindu — Vijayawada",
    "Deccan Chronicle — AP",
    "The Times of India — Amaravati",
    "The New Indian Express — Vijayawada",
    "Eenadu English",
    "The Hans India",
    "Sakshi Post",
    "News18 Andhra Pradesh",
  ],
};

const HEADLINE_SLUG: Record<SignalType, string> = {
  VECTOR:       "rising vector activity",
  CLIMATE:      "weather-driven outbreak risk",
  FIELD:        "ground surveillance report",
  OPERATIONS:   "vector control operations",
  MEDIA:        "community health concern",
  SURVEILLANCE: "surveillance coverage gaps",
};

function pickSource(state: string, type: SignalType, disease: string, seed: number): string {
  const list = NEWS_OUTLETS[state] ?? NEWS_OUTLETS.Karnataka;
  const outlet = list[seed % list.length];
  const topic = HEADLINE_SLUG[type];
  return `${outlet} — "${disease} ${topic}" report`;
}
}

export default function SignalsScreen() {
  const { appliedFilters } = useFilters();
  const { diseaseName } = useDisease();
  const { stateId, options } = useStateSelection();
  const { isVisible } = useBlockVisibility();
  const show = (id: string) => isVisible("signals", id);

  const stateLabel = options.find((o) => o.id === stateId)?.label ?? "Karnataka";
  const profile = useMemo(() => getProfile(stateLabel), [stateLabel]);

  const indicators: IndicatorCard[] = useMemo(
    () =>
      profile.indicators.map((i) => ({
        ...i,
        series: synthSparkSeries(`${stateLabel}-${i.key}`, 60, i.direction === "down" ? 80 : 40, i.direction),
      })),
    [profile, stateLabel],
  );

  const isSubDistrict =
    (appliedFilters.block && appliedFilters.block !== "All Blocks") ||
    (appliedFilters.ward && appliedFilters.ward !== "All Wards");

  // Build field reports from existing news alerts but enriched into operational cards.
  const newsAlerts = getNewsAlerts(appliedFilters);
  const fieldReports: FieldReport[] = useMemo(() => {
    if (!newsAlerts.length) return [];
    const enrichment: { signalType: SignalType; bullets: string[]; implication: string; alignment: Alignment }[] = [
      {
        signalType: "VECTOR",
        bullets: [
          "elevated BI across 3 wards",
          "repeated larval positivity in construction corridors",
          "rainfall accumulation above seasonal trend",
          "emerging fever clusters detected",
        ],
        implication: "Targeted fogging and repeat surveillance recommended.",
        alignment: "STRONG",
      },
      {
        signalType: "CLIMATE",
        bullets: [
          "sustained increase in case growth",
          "vector activity rising in coastal blocks",
          "moderate rainfall anomaly detected",
        ],
        implication: "Increase larval surveillance in coastal blocks.",
        alignment: "MODERATE",
      },
      {
        signalType: "FIELD",
        bullets: [
          "waterlogging reported in low-lying wards",
          "stagnant water near construction sites",
          "container breeding signal rising",
        ],
        implication: "Source reduction drive and ward-level inspection required.",
        alignment: "STRONG",
      },
      {
        signalType: "SURVEILLANCE",
        bullets: [
          "delayed line-list submissions from 2 PHCs",
          "low surveillance coverage in tribal blocks",
        ],
        implication: "Reinforce data discipline; assign supervisory visits.",
        alignment: "WEAK",
      },
      {
        signalType: "OPERATIONS",
        bullets: [
          "fogging cycle gap in 2 urban wards",
          "anti-larval staff shortage reported",
        ],
        implication: "Reallocate vector control teams to priority wards.",
        alignment: "MODERATE",
      },
      {
        signalType: "MEDIA",
        bullets: [
          "local media flags rising fever cases",
          "community concern in 2 colonies",
        ],
        implication: "Issue advisory and verify with PHC line-list.",
        alignment: "MODERATE",
      },
    ];
    return newsAlerts.slice(0, 6).map((n, idx) => {
      const e = enrichment[idx % enrichment.length];
      return {
        id: n.id,
        severity: n.severity,
        signalType: e.signalType,
        district: n.district,
        headline: n.headline,
        bullets: e.bullets,
        implication: e.implication,
        alignment: e.alignment,
        source: pickSource(stateLabel, e.signalType, diseaseName, idx),
        date: n.date,
      };
    });
  }, [newsAlerts, stateLabel, diseaseName]);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-6">
        <GlobalFilters freshnessLabel="Signals — last 4 weeks (locked)" />

        <div>
          <h2 className="text-lg font-semibold text-foreground">Epidemiological Intelligence & Forecast Explainability</h2>
          <p className="text-xs text-muted-foreground">
            Surveillance evidence and reasoning behind {diseaseName.toLowerCase()} early warning — why risk is changing and how confident the forecast is.
          </p>
        </div>

        {isSubDistrict && (
          <div className="rounded-md border border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
            Signal indicators are aggregated at <strong>district level</strong>. Sub-district intelligence (block / ward) is being progressively ingested.
          </div>
        )}

        {/* ─────────────── SECTION 1 — SIGNAL SUMMARY ─────────────── */}
        {show("signal_summary") && (
          <section className="section-card p-5">
            <div className="flex items-center gap-2 mb-1">
              <Radar className="h-4 w-4 text-muted-foreground" />
              <h3 className="section-title">Surveillance & Early Warning Signals</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Field indicators contributing to {diseaseName.toLowerCase()} risk assessment</p>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {indicators.map((ind) => (
                <div key={ind.key} className={`rounded-md bg-card border border-border ${severityBar(ind.severity)} p-3 flex flex-col gap-2`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="text-[11px] font-medium text-muted-foreground truncate">{ind.label}</span>
                      {ind.formula && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" aria-label={`${ind.label} formula`} className="text-muted-foreground/70 hover:text-foreground">
                              <Info className="h-3 w-3" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[220px] text-xs">
                            {ind.formula}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <span className={`${severityClass(ind.severity)} !px-2 !py-0.5 !text-[10px]`}>{ind.severity}</span>
                  </div>

                  <div className="flex items-end justify-between gap-2">
                    <div className="text-xl font-semibold text-foreground leading-none">{ind.value}</div>
                    <Sparkline values={ind.series} width={70} height={22} trend={ind.direction} />
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <DirIcon d={ind.direction} severity={ind.severity} />
                    <span>{ind.trendNote}</span>
                  </div>
                  <div className="text-[11px] text-foreground/80">{ind.interpretation}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─────────────── SECTION 2 — FORECAST DRIVERS ─────────────── */}
        {show("forecast_drivers") && (
          <section className="section-card p-5">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <h3 className="section-title">Forecast Drivers & Surveillance Interpretation</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Signals strengthening or weakening outbreak confidence</p>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-muted/40 text-muted-foreground">
                    <tr className="text-left">
                      <th className="px-3 py-2 font-medium">Signal</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 font-medium">Impact on Risk</th>
                      <th className="px-3 py-2 font-medium">Confidence Effect</th>
                      <th className="px-3 py-2 font-medium">Geographies</th>
                      <th className="px-3 py-2 font-medium whitespace-nowrap">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {profile.drivers.map((d, i) => (
                      <tr key={i} className="hover:bg-muted/30">
                        <td className="px-3 py-2 font-medium text-foreground">{d.signal}</td>
                        <td className="px-3 py-2"><span className={severityClass(d.status.severity)}>{d.status.label}</span></td>
                        <td className="px-3 py-2 text-foreground/80">{d.impact}</td>
                        <td className="px-3 py-2">
                          <span className={
                            d.confidence.tone === "strengthen" ? "text-risk-low font-medium" :
                            d.confidence.tone === "weaken" ? "text-risk-high font-medium" :
                            "text-muted-foreground"
                          }>
                            {d.confidence.label}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-foreground/80">{d.geographies}</td>
                        <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{d.updated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Confidence panel */}
              <aside className="rounded-md border border-border bg-muted/20 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Forecast confidence</span>
                  <span className={severityClass(profile.confidence.level === "High" ? "low" : profile.confidence.level === "Moderate" ? "moderate" : "high")}>
                    {profile.confidence.level}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-risk-low mb-1">
                    <ArrowUpRight className="h-3 w-3" /> Strengthened by
                  </div>
                  <ul className="space-y-1 text-xs text-foreground/85 list-disc list-inside marker:text-risk-low">
                    {profile.confidence.strengthen.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>

                <div>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-risk-high mb-1">
                    <ArrowDownRight className="h-3 w-3" /> Weakened by
                  </div>
                  <ul className="space-y-1 text-xs text-foreground/85 list-disc list-inside marker:text-risk-high">
                    {profile.confidence.weaken.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              </aside>
            </div>
          </section>
        )}

        {/* ─────────────── SECTION 3 — FIELD INTELLIGENCE ─────────────── */}
        {show("field_intelligence") && (
          <section className="section-card p-5">
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              <h3 className="section-title">Field Intelligence — Ground Surveillance Reports</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Operational observations and environmental signals supporting the forecast</p>

            {fieldReports.length === 0 ? (
              <div className="rounded-md border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {isSubDistrict
                  ? `No field intelligence available below district level for ${appliedFilters.block || appliedFilters.ward}.`
                  : `No field intelligence reports for the selected geography.`}
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">
                {fieldReports.map((r) => {
                  const riskLabel = r.severity === "high" ? "HIGH RISK" : r.severity === "moderate" ? "MODERATE RISK" : "LOW RISK";
                  const riskColor = r.severity === "high" ? "text-risk-high" : r.severity === "moderate" ? "text-risk-moderate" : "text-risk-low";
                  const alignColor =
                    r.alignment === "STRONG" ? "text-risk-high" :
                    r.alignment === "MODERATE" ? "text-risk-moderate" :
                    "text-muted-foreground";
                  return (
                    <article key={r.id} className={`rounded-md bg-card border border-border ${severityBar(r.severity)} px-3 py-2.5 flex flex-col gap-1.5`}>
                      <header className="flex items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-1.5 font-semibold uppercase tracking-wide min-w-0">
                          <span className={riskColor}>{riskLabel}</span>
                          <span className="text-muted-foreground/60">·</span>
                          <span className="text-foreground/70">{r.signalType}</span>
                          <span className="text-muted-foreground/60">·</span>
                          <span className="text-foreground/80 normal-case font-medium truncate flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />{r.district}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{r.date}</span>
                      </header>

                      <h4 className="text-[13px] font-semibold text-foreground leading-snug">{r.headline}</h4>

                      <ul className="text-[11.5px] leading-tight text-foreground/85 pl-3.5 list-disc marker:text-muted-foreground/50 space-y-0">
                        {r.bullets.map((b, i) => <li key={i}>{b}</li>)}
                      </ul>

                      <div className="rounded-sm bg-muted/30 px-2 py-1.5 text-[11.5px] leading-snug">
                        <span className="text-[9.5px] font-semibold uppercase tracking-wide text-muted-foreground mr-1.5">Operational interpretation</span>
                        <span className="text-foreground/90">{r.implication}</span>
                        <span className="ml-1.5 text-muted-foreground">·</span>
                        <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Forecast alignment:</span>
                        <span className={`ml-1 text-[10px] font-bold uppercase tracking-wide ${alignColor}`}>{r.alignment}</span>
                      </div>

                      <footer className="text-[10px] text-muted-foreground/80 pt-0.5">
                        Source: {r.source}
                      </footer>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </TooltipProvider>
  );
}
