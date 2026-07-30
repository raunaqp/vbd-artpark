import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, X, Send, Sparkles, FileText, ChevronRight, RotateCcw, Download, Share2, Loader2, CheckCircle2 } from "lucide-react";
import { useStateSelection } from "@/contexts/StateContext";
import { useDisease } from "@/contexts/DiseaseContext";
import { useFilters } from "@/contexts/FilterContext";
import type { TabId } from "@/components/DashboardLayout";
import jsPDF from "jspdf";

interface Props {
  activeTab: TabId;
}

type Role = "user" | "assistant";
interface Msg {
  id: string;
  role: Role;
  text: string;
  followups?: string[];
  ts: number;
}

const STORAGE_KEY = "ai_copilot_messages_v1";

const TAB_LABELS: Record<TabId, string> = {
  overview: "Overview",
  surveillance: "Case Surveillance",
  forecast: "Forecast",
  response: "Response",
  weather: "Weather",
  hotspots: "Hotspots",
  signals: "Signals",
  upload: "Data Upload",
  howto: "How to use",
  settings: "View Settings",
  admin: "Admin",
};

const SUGGESTED = [
  "Summarize this dashboard",
  "What changed from last week?",
  "Which wards need immediate action?",
  "Why is this zone High Risk?",
  "Compare with last year",
  "Explain this forecast",
  "Which locations are deteriorating?",
  "Recommend interventions",
  "Generate executive report",
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function AiCopilot({ activeTab }: Props) {
  const { stateId, options } = useStateSelection();
  const { currentDisease } = useDisease();
  const { appliedFilters } = useFilters();
  const stateLabel = options.find((o) => o.id === stateId)?.label || "Selected State";

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      /* noop */
    }
    return [];
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-100)));
    } catch {
      /* noop */
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, streaming]);

  const ctx = useMemo(
    () => ({
      tab: TAB_LABELS[activeTab],
      state: stateLabel,
      disease: currentDisease.label,
      district: appliedFilters.district,
      block: appliedFilters.block,
    }),
    [activeTab, stateLabel, currentDisease.label, appliedFilters],
  );

  function answerFor(question: string): { text: string; followups: string[] } {
    const q = question.toLowerCase();
    const where = ctx.district !== "All Districts" ? `${ctx.district}, ${ctx.state}` : ctx.state;
    const scope = `${ctx.disease} · ${where} · ${ctx.tab}`;

    if (q.includes("report") || q.includes("brief")) {
      return {
        text: `I can generate an executive ${ctx.disease} report for ${where} covering the next 4 weeks. Use the **Generate AI Report** button below to choose format, audience, and sections.`,
        followups: ["Open report generator", "Executive summary for Commissioner", "Ward-level technical report"],
      };
    }
    if (q.includes("summari") || q.includes("takeaway") || q.includes("overview")) {
      return {
        text:
          `**Summary — ${scope}**\n\n` +
          `• Reported ${ctx.disease.toLowerCase()} cases trending **upward** week-over-week across high-density wards.\n` +
          `• 3 zones flagged **High Risk** for the upcoming week; 6 wards moved up a risk band.\n` +
          `• Climate signal (rainfall + humidity) remains favourable for vector breeding.\n` +
          `• Forecast confidence: **High** (model agreement across 4-week horizon).\n\n` +
          `**Recommended action:** prioritise larval source reduction in East & South zones and pre-position fogging teams.`,
        followups: ["Which wards moved up?", "Explain this forecast", "Recommend interventions"],
      };
    }
    if (q.includes("changed") || q.includes("last week")) {
      return {
        text:
          `**Week-over-week change — ${where}**\n\n` +
          `• Confirmed cases: **+18%** vs previous week.\n` +
          `• New high-risk wards: **4** (2 in East Zone, 1 South, 1 West).\n` +
          `• Wards de-escalated: **1**.\n` +
          `• Weather: rainfall +22mm, humidity steady at 78%.\n\n` +
          `Most of the increase is concentrated in 6 wards which account for **64%** of new cases.`,
        followups: ["Show those 6 wards", "Why did East Zone worsen?", "Compare with last year"],
      };
    }
    if (q.includes("why") && (q.includes("high") || q.includes("risk"))) {
      return {
        text:
          `**Why ${where} is High Risk**\n\n` +
          `1. **Cases:** 3-week rising trend, exceeding seasonal baseline by 1.4×.\n` +
          `2. **Climate:** rainfall + humidity above vector-suitability threshold for 11 of last 14 days.\n` +
          `3. **Vector indices:** larval positivity 7.8% (warning >5%).\n` +
          `4. **Historical analogue:** similar pattern preceded the 2023 outbreak in this zone.\n\n` +
          `**Confidence:** High. **Action:** intensified surveillance + source reduction within 72 hours.`,
        followups: ["Which interventions are most effective?", "Show historical comparison", "Generate zone report"],
      };
    }
    if (q.includes("ward") && (q.includes("action") || q.includes("immediate") || q.includes("need"))) {
      return {
        text:
          `**Wards needing immediate action — ${where}**\n\n` +
          `1. **Mahadevapura** — Very High · cases +42% · larval +9.2%\n` +
          `2. **Bommanahalli** — Very High · cases +31% · larval +7.8%\n` +
          `3. **HSR Layout** — High · cases +24% · new hotspot\n` +
          `4. **Marathahalli** — High · persistent hotspot (4 weeks)\n` +
          `5. **Whitefield** — High · case doubling time 9 days\n\n` +
          `Deploy fogging + larval surveys in the top 2 within 24 hours.`,
        followups: ["Why Mahadevapura?", "Generate ward report for Mahadevapura", "Recommend interventions"],
      };
    }
    if (q.includes("compare") && q.includes("year")) {
      return {
        text:
          `**${where} — this week vs same week last year**\n\n` +
          `• Cases: **+27%** (412 vs 324).\n` +
          `• High-risk wards: **9 vs 6**.\n` +
          `• Onset 2 weeks earlier than 2024 season.\n` +
          `• Climate driver: monsoon 18% wetter than 2024.\n\n` +
          `The early onset suggests peak risk may arrive in **Week 36** instead of Week 38.`,
        followups: ["What was 2023 peak?", "Show seasonality chart", "Forecast next 4 weeks"],
      };
    }
    if (q.includes("forecast") || q.includes("predict")) {
      return {
        text:
          `**Forecast — ${where}, next 4 weeks**\n\n` +
          `• Week +1: **412** cases · High · 90% CI [368–460]\n` +
          `• Week +2: **478** cases · High · 90% CI [410–552]\n` +
          `• Week +3: **521** cases · Very High · 90% CI [438–612]\n` +
          `• Week +4: **497** cases · Very High · plateau likely\n\n` +
          `**Top drivers:** lagged rainfall (14d), prior-week cases, larval positivity.\n` +
          `**Confidence:** High. **Assumption:** no major intervention scale-up in next 7 days.`,
        followups: ["What drives this forecast?", "Compare with last year", "Generate forecast report"],
      };
    }
    if (q.includes("deterior") || q.includes("worsen") || q.includes("increasing")) {
      return {
        text:
          `**Deteriorating areas — ${where}**\n\n` +
          `• **East Zone** — risk moved Medium → High (2 weeks)\n` +
          `• **Mahadevapura ward** — High → Very High\n` +
          `• **Bommanahalli ward** — Medium → High\n` +
          `• **HSR Layout** — Low → Medium → High (3 weeks)\n\n` +
          `Common pattern: rainfall accumulation + larval index crossing 7%.`,
        followups: ["Why is HSR Layout deteriorating fast?", "Recommend interventions for East Zone"],
      };
    }
    if (q.includes("intervention") || q.includes("fogging") || q.includes("recommend") || q.includes("action")) {
      return {
        text:
          `**Recommended interventions — ${where}**\n\n` +
          `**Very High risk wards**\n• Fogging within 24h · Hospital preparedness · Pre-position ORS & test kits\n\n` +
          `**High risk wards**\n• Larval source reduction · Daily monitoring · Community outreach\n\n` +
          `**Medium risk wards**\n• Weekly larval surveys · IEC campaigns\n\n` +
          `**Resource ask:** 4 fogging teams, 2 entomology squads for 7 days.`,
        followups: ["Generate Commissioner brief", "Which wards get fogging?", "Estimate resource cost"],
      };
    }
    if (q.includes("hotspot") || q.includes("unusual")) {
      return {
        text:
          `**Hotspot analysis — ${where}**\n\n` +
          `• **New:** HSR Layout, Bellandur (emerged this week)\n` +
          `• **Persistent (4+ wk):** Marathahalli, Mahadevapura\n` +
          `• **Largest spike:** Mahadevapura (+42%)\n` +
          `• **Unusual:** Yelahanka — case rise without climate trigger; investigate water storage patterns.`,
        followups: ["Investigate Yelahanka", "Show all persistent hotspots", "Generate hotspot report"],
      };
    }

    // default
    return {
      text:
        `I'm reading the dashboard for **${scope}**. Here's what stands out:\n\n` +
        `• Risk level: **Elevated** with rising trend across 3 zones.\n` +
        `• Forecast confidence: **High** for next 4 weeks.\n` +
        `• 6 wards need attention within 72 hours.\n\n` +
        `Ask me to summarise, explain a forecast, compare time periods, or generate a report.`,
      followups: ["Summarize this dashboard", "Why is risk rising?", "Generate executive report"],
    };
  }

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    const userMsg: Msg = { id: uid(), role: "user", text: trimmed, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setStreaming(true);
    const { text: answer, followups } = answerFor(trimmed);
    const assistantId = uid();
    setMessages((m) => [...m, { id: assistantId, role: "assistant", text: "", followups: [], ts: Date.now() }]);

    // simulate streaming
    let i = 0;
    const chunkSize = 6;
    const interval = window.setInterval(() => {
      i += chunkSize;
      setMessages((m) =>
        m.map((msg) => (msg.id === assistantId ? { ...msg, text: answer.slice(0, i) } : msg)),
      );
      if (i >= answer.length) {
        window.clearInterval(interval);
        setMessages((m) =>
          m.map((msg) => (msg.id === assistantId ? { ...msg, text: answer, followups } : msg)),
        );
        setStreaming(false);
      }
    }, 18);
  }

  function clearChat() {
    setMessages([]);
  }

  function exportChat() {
    const blob = new Blob(
      [messages.map((m) => `[${m.role.toUpperCase()}]\n${m.text}\n`).join("\n---\n")],
      { type: "text/plain" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `copilot-chat-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      {/* Floating launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-primary text-primary-foreground shadow-lg px-4 py-3 hover:opacity-90 transition"
          aria-label="Open AI Copilot"
        >
          <Bot className="h-5 w-5" />
          <span className="text-sm font-semibold hidden sm:inline">AI Copilot</span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <aside
          className="fixed z-40 bg-card border border-border shadow-2xl flex flex-col
            inset-x-0 bottom-0 h-[85vh] rounded-t-2xl
            sm:inset-auto sm:top-20 sm:right-4 sm:bottom-4 sm:h-auto sm:w-[400px] sm:rounded-xl"
        >
          {/* header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-primary/10 to-transparent rounded-t-2xl sm:rounded-t-xl">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold leading-tight">AI Copilot</div>
                <div className="text-[10px] text-muted-foreground leading-tight">
                  {ctx.disease} · {ctx.state} · {ctx.tab}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={exportChat}
                title="Export chat"
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={clearChat}
                title="New conversation"
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setOpen(false)}
                title="Close"
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold">Ask me anything about this dashboard</span>
                  </div>
                  <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                    I'm aware of your current page, geography, disease, and filters. Try one of these:
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="text-[11px] px-2.5 py-1 rounded-full border border-border bg-background hover:bg-muted text-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] ${m.role === "user" ? "" : "w-full"}`}>
                  <div
                    className={`rounded-lg px-3 py-2 text-[12.5px] leading-relaxed whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-foreground border border-border"
                    }`}
                  >
                    {renderMarkdown(m.text)}
                    {m.role === "assistant" && streaming && m.text.length === 0 && (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" /> Thinking…
                      </span>
                    )}
                  </div>
                  {m.followups && m.followups.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {m.followups.map((f) => (
                        <button
                          key={f}
                          onClick={() => (f.toLowerCase().includes("report") ? setReportOpen(true) : sendMessage(f))}
                          className="text-[10.5px] px-2 py-0.5 rounded-full border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                        >
                          <ChevronRight className="h-2.5 w-2.5" />
                          {f}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* report cta */}
          <div className="px-3 py-2 border-t border-border bg-muted/20">
            <button
              onClick={() => setReportOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-primary/40 bg-primary/10 hover:bg-primary/15 text-primary text-xs font-semibold py-1.5"
            >
              <FileText className="h-3.5 w-3.5" />
              Generate AI Report
            </button>
          </div>

          {/* input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="p-2 border-t border-border flex items-end gap-1.5"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Ask about this dashboard…"
              rows={1}
              className="flex-1 resize-none rounded-md border border-input bg-background px-2.5 py-1.5 text-[12.5px] placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring max-h-32"
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              className="h-8 w-8 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </aside>
      )}

      {reportOpen && (
        <ReportModal
          onClose={() => setReportOpen(false)}
          ctx={{ ...ctx, where: ctx.district !== "All Districts" ? `${ctx.district}, ${ctx.state}` : ctx.state }}
        />
      )}
    </>
  );
}

function renderMarkdown(text: string) {
  // very small markdown: **bold** and bullet lines
  const lines = text.split("\n");
  return lines.map((line, idx) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
      p.startsWith("**") && p.endsWith("**") ? (
        <strong key={i}>{p.slice(2, -2)}</strong>
      ) : (
        <span key={i}>{p}</span>
      ),
    );
    return (
      <div key={idx}>
        {parts}
        {idx < lines.length - 1 ? <br /> : null}
      </div>
    );
  });
}

// ---------- Report Modal ----------

type ReportType = "Executive Summary" | "Commissioner Brief" | "Technical Report" | "Zone Report" | "Ward Report" | "Custom Report";
type GeoScope = "Entire city" | "Zone" | "Ward" | "Custom selection";
type TimeScope = "Current week" | "Next 2 weeks" | "Next 4 weeks" | "Custom";
type Audience = "Commissioner" | "Health Officer" | "Field Teams" | "Vector Control Team" | "Technical Team" | "Researchers" | "Public Communication";

const INCLUDE_OPTIONS = [
  "Forecast",
  "Maps",
  "Risk changes",
  "Historical trends",
  "Key hotspots",
  "Interventions",
  "Confidence",
  "Appendix",
] as const;

function ReportModal({
  onClose,
  ctx,
}: {
  onClose: () => void;
  ctx: { disease: string; state: string; tab: string; district: string; block: string; where: string };
}) {
  const [type, setType] = useState<ReportType>("Executive Summary");
  const [geo, setGeo] = useState<GeoScope>("Entire city");
  const [time, setTime] = useState<TimeScope>("Next 4 weeks");
  const [audience, setAudience] = useState<Audience>("Commissioner");
  const [include, setInclude] = useState<Set<string>>(new Set(INCLUDE_OPTIONS));
  const [status, setStatus] = useState<"idle" | "generating" | "ready">("idle");
  const [progress, setProgress] = useState(0);
  const [reportBlob, setReportBlob] = useState<{ pdf: Blob; filename: string } | null>(null);

  function toggleInclude(s: string) {
    setInclude((prev) => {
      const n = new Set(prev);
      if (n.has(s)) n.delete(s);
      else n.add(s);
      return n;
    });
  }

  async function generate() {
    setStatus("generating");
    setProgress(0);
    const start = Date.now();
    const total = 22000 + Math.random() * 10000;
    const tick = window.setInterval(() => {
      const p = Math.min(99, ((Date.now() - start) / total) * 100);
      setProgress(p);
      if (p >= 99) window.clearInterval(tick);
    }, 200);

    await new Promise((r) => setTimeout(r, total));
    window.clearInterval(tick);

    const pdf = buildPdf({ type, geo, time, audience, include, ctx });
    setReportBlob({
      pdf,
      filename: `${ctx.disease}_${type.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`,
    });
    setProgress(100);
    setStatus("ready");
  }

  function download(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Generate AI Report</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-4">
          {status === "idle" && (
            <>
              <Field label="Report Type">
                <div className="grid grid-cols-2 gap-1.5">
                  {(["Executive Summary", "Commissioner Brief", "Technical Report", "Zone Report", "Ward Report", "Custom Report"] as ReportType[]).map(
                    (t) => (
                      <Radio key={t} active={type === t} onClick={() => setType(t)} label={t} />
                    ),
                  )}
                </div>
              </Field>

              <Field label="Geography">
                <div className="grid grid-cols-2 gap-1.5">
                  {(["Entire city", "Zone", "Ward", "Custom selection"] as GeoScope[]).map((g) => (
                    <Radio key={g} active={geo === g} onClick={() => setGeo(g)} label={g} />
                  ))}
                </div>
              </Field>

              <Field label="Time Period">
                <div className="grid grid-cols-2 gap-1.5">
                  {(["Current week", "Next 2 weeks", "Next 4 weeks", "Custom"] as TimeScope[]).map((t) => (
                    <Radio key={t} active={time === t} onClick={() => setTime(t)} label={t} />
                  ))}
                </div>
              </Field>

              <Field label="Audience">
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    ["Commissioner", "Health Officer", "Field Teams", "Vector Control Team", "Technical Team", "Researchers", "Public Communication"] as Audience[]
                  ).map((a) => (
                    <Radio key={a} active={audience === a} onClick={() => setAudience(a)} label={a} />
                  ))}
                </div>
              </Field>

              <Field label="Include sections">
                <div className="grid grid-cols-2 gap-1.5">
                  {INCLUDE_OPTIONS.map((s) => (
                    <label
                      key={s}
                      className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-md border cursor-pointer ${
                        include.has(s) ? "border-primary bg-primary/10 text-foreground" : "border-input text-muted-foreground"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="h-3 w-3"
                        checked={include.has(s)}
                        onChange={() => toggleInclude(s)}
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </Field>
            </>
          )}

          {status === "generating" && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
              <div className="text-sm font-semibold">Generating Report…</div>
              <div className="text-xs text-muted-foreground">Estimated time: 20–40 seconds</div>
              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden max-w-sm mx-auto">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <ul className="text-[11px] text-muted-foreground space-y-0.5 max-w-sm mx-auto text-left">
                <li>{progress > 10 ? "✓" : "…"} Reading dashboard context</li>
                <li>{progress > 35 ? "✓" : "…"} Aggregating forecast & risk data</li>
                <li>{progress > 60 ? "✓" : "…"} Composing executive narrative</li>
                <li>{progress > 85 ? "✓" : "…"} Rendering PDF</li>
              </ul>
            </div>
          )}

          {status === "ready" && reportBlob && (
            <div className="py-8 text-center space-y-4">
              <CheckCircle2 className="h-10 w-10 text-risk-low mx-auto" />
              <div>
                <div className="text-sm font-semibold">Report ready</div>
                <div className="text-xs text-muted-foreground mt-0.5">{reportBlob.filename}</div>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => download(reportBlob.pdf, reportBlob.filename)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-primary text-primary-foreground"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download PDF
                </button>
                <button
                  onClick={() => {
                    const txt = `${ctx.disease} — ${type}\n${ctx.where}\nGenerated ${new Date().toLocaleString()}`;
                    download(new Blob([txt], { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" }), reportBlob.filename.replace(".pdf", ".pptx"));
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md border border-input hover:bg-muted"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download PPT
                </button>
                <button
                  onClick={() => navigator.clipboard?.writeText(window.location.href)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md border border-input hover:bg-muted"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Share Link
                </button>
                <button
                  onClick={() => {
                    setStatus("idle");
                    setReportBlob(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md border border-input hover:bg-muted"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Regenerate
                </button>
              </div>
            </div>
          )}
        </div>

        {status === "idle" && (
          <div className="px-5 py-3 border-t border-border flex justify-end gap-2">
            <button onClick={onClose} className="text-xs px-3 py-1.5 rounded-md border border-input hover:bg-muted">
              Cancel
            </button>
            <button
              onClick={generate}
              className="text-xs font-semibold px-3 py-1.5 rounded-md bg-primary text-primary-foreground inline-flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Generate Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">{label}</div>
      {children}
    </div>
  );
}

function Radio({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs text-left px-2.5 py-1.5 rounded-md border transition ${
        active ? "border-primary bg-primary/10 text-foreground font-semibold" : "border-input text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function buildPdf(opts: {
  type: ReportType;
  geo: GeoScope;
  time: TimeScope;
  audience: Audience;
  include: Set<string>;
  ctx: { disease: string; state: string; where: string };
}): Blob {
  const { type, geo, time, audience, include, ctx } = opts;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const margin = 48;
  let y = margin;

  const checkPage = (needed = 60) => {
    if (y + needed > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Cover
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, W, 140, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(`${ctx.disease} — ${type}`, margin, 60);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(ctx.where, margin, 84);
  doc.text(`Forecast period: ${time}  ·  Audience: ${audience}`, margin, 102);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 120);
  doc.setTextColor(0, 0, 0);
  y = 170;

  const section = (title: string) => {
    checkPage(50);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(title, margin, y);
    y += 8;
    doc.setDrawColor(200);
    doc.line(margin, y, W - margin, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(40, 40, 40);
  };
  const para = (txt: string) => {
    const lines = doc.splitTextToSize(txt, W - margin * 2);
    checkPage(lines.length * 14 + 8);
    doc.text(lines, margin, y);
    y += lines.length * 14 + 6;
  };
  const bullets = (items: string[]) => {
    items.forEach((it) => {
      const lines = doc.splitTextToSize(`•  ${it}`, W - margin * 2 - 12);
      checkPage(lines.length * 14 + 4);
      doc.text(lines, margin + 6, y);
      y += lines.length * 14 + 2;
    });
    y += 4;
  };

  section("Executive Summary");
  para(
    `${ctx.where} is expected to remain at elevated ${ctx.disease.toLowerCase()} risk over the ${time.toLowerCase()}. ` +
      `Three zones are classified as Very High Risk during Week 1, with East Zone expected to worsen in Week 3. ` +
      `Increased surveillance and vector control are recommended.`,
  );

  section("Key Insights");
  bullets([
    "East Zone risk increased by two levels.",
    "Six wards entered Very High Risk.",
    "Historical trend exceeds seasonal baseline by 1.4×.",
    "Cases expected to increase 27% over the forecast horizon.",
    "Model confidence: High.",
  ]);

  if (include.has("Forecast")) {
    section("Forecast");
    bullets([
      "Week +1: 412 cases · High · CI [368–460]",
      "Week +2: 478 cases · High · CI [410–552]",
      "Week +3: 521 cases · Very High · CI [438–612]",
      "Week +4: 497 cases · Very High · plateau likely",
    ]);
    para("Top drivers: lagged rainfall (14d), prior-week cases, larval positivity.");
  }

  if (include.has("Maps") || include.has("Risk changes")) {
    section("Geographic Risk");
    para(`Scope: ${geo}. Weekly progression shown for top wards.`);
    bullets([
      "Very High: Mahadevapura, Bommanahalli",
      "High: HSR Layout, Marathahalli, Whitefield, Bellandur",
      "Medium: Yelahanka, Hebbal, Indiranagar",
    ]);
  }

  if (include.has("Key hotspots")) {
    section("Hotspot Analysis");
    bullets([
      "New: HSR Layout, Bellandur",
      "Persistent (4+ wk): Marathahalli, Mahadevapura",
      "Largest spike: Mahadevapura (+42%)",
      "Unusual: Yelahanka — rise without climate trigger; investigate water storage",
    ]);
  }

  if (include.has("Historical trends")) {
    section("Trend Analysis");
    bullets([
      "Week-over-week: +18%",
      "Month-over-month: +34%",
      "vs same week 2024: +27%",
      "Onset 2 weeks earlier than 2024 season",
    ]);
  }

  if (include.has("Interventions")) {
    section("Recommended Actions");
    para("VERY HIGH");
    bullets(["Fogging within 24h", "Hospital preparedness", "Additional surveillance", "Resource pre-positioning"]);
    para("HIGH");
    bullets(["Source reduction", "Daily monitoring", "Larval surveys"]);
    para("MEDIUM");
    bullets(["Community awareness", "Weekly surveillance"]);
  }

  section("AI Narrative");
  para(
    `The model predicts elevated risk because reported cases have risen for three consecutive weeks, ` +
      `rainfall and humidity remain above vector-suitability thresholds, and larval indices crossed warning levels. ` +
      `Historical analogues from 2023 followed similar patterns before localized outbreaks. ` +
      `Officials should monitor daily case counts, larval indices, and rainfall accumulation. ` +
      `Assumptions: no major intervention scale-up in the next 7 days; reporting lag stable.`,
  );

  if (include.has("Confidence")) {
    section("Confidence");
    bullets([
      "Overall confidence: High",
      "Model uncertainty: moderate at Week +3–4",
      "Known limitations: reporting delays in 2 wards",
      "Data quality: 96% complete (last 4 weeks)",
    ]);
  }

  if (include.has("Appendix")) {
    section("Appendix");
    bullets([
      `Filters: ${ctx.disease} · ${ctx.where}`,
      `Forecast date: ${new Date().toISOString().slice(0, 10)}`,
      "Model version: EWS-v3.2 (ensemble)",
      `Generation timestamp: ${new Date().toISOString()}`,
    ]);
  }

  // footer
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(140);
    doc.text(
      `${ctx.disease} Early Warning System  ·  ${type}  ·  Page ${i} of ${pages}`,
      margin,
      doc.internal.pageSize.getHeight() - 20,
    );
  }

  return doc.output("blob");
}
