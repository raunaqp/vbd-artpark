// "How to use" — in-app documentation (Session D).
//
// Static by design: no data fetches, no context reads, no props. Everything on
// this page is prose about the product, so anything it rendered from live data
// would be a second place for that data to be wrong.
//
// Content is checked against the code rather than the design docs where the two
// disagree — the recommendation rule count and the editability of Admin →
// Assumptions both drifted, so neither is stated in a way that can go stale.

import { ExternalLink } from "lucide-react";
import { APP_VERSION, BUILD_SHA, BUILD_TIME, BUILT_BY } from "@/lib/build_info";

// ──────────────── Content ────────────────

const DEPLOYED_STATES = [
  "Karnataka",
  "Odisha",
  "Andhra Pradesh",
  "Greater Bengaluru Authority (GBA)",
];

const AUDIENCES = [
  "State surveillance officers",
  "UPHC medical officers",
  "Entomologists",
  "District vector-borne disease teams",
];

const TABS: { name: string; body: string }[] = [
  { name: "Overview", body: "State-wide summary, current week signals, and the top hotspots for the selected scope." },
  { name: "Case Surveillance", body: "Historical case counts by district and week, with a line listing of individual records. Click any total to see which areas contribute to it." },
  { name: "Forecast", body: "Model-generated four-week case forecasts by district, shown as expected ranges rather than single numbers." },
  { name: "Response", body: "Operational status per ward, one recommended action per area, and field response logging." },
  { name: "Signals", body: "Early warning surveillance signals, forecast drivers, and ground reports." },
  { name: "Weather", body: "Observed and forecast climate indicators, used as leading signals for case rises." },
  { name: "Hotspots", body: "Case density concentrations over a selectable lookback window." },
  { name: "Data Upload", body: "Bulk data entry for state teams, by file upload or manual entry." },
  { name: "Admin", body: "Configuration, view settings, assumptions, and case management. Admin sign-in only." },
  { name: "How to use", body: "This page." },
];

const SOURCES: { name: string; body: string }[] = [
  { name: "ARTPARK", body: "Case data, model forecasts, and risk classifications." },
  { name: "Khushi Baby", body: "Larval survey app data, fogging events, and larval indices." },
  { name: "Government", body: "Entomological survey data and breeding site records." },
  { name: "Dashboard", body: "Recommended actions, derived here from the sources above rather than reported by a field team." },
];

// ──────────────── Layout primitives ────────────────

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="section-card p-5">
      <h3 className="section-title">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-foreground leading-relaxed">{children}</p>;
}

/** Name + one line, as a bordered tile. Used for the tab and source grids. */
function DefCard({ name, body }: { name: string; body: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <h4 className="text-xs font-semibold text-foreground">{name}</h4>
      <p className="text-xs text-muted-foreground leading-relaxed mt-1">{body}</p>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5 text-sm text-foreground leading-relaxed">
      <span className="flex-shrink-0 mt-0.5 h-5 w-5 rounded-full bg-muted text-[11px] font-semibold flex items-center justify-center">
        {n}
      </span>
      <span>{children}</span>
    </li>
  );
}

// ──────────────── Page ────────────────

export default function HowToUsePanel() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">How to use PRISM-H</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          What this dashboard is, what each tab answers, and where its numbers come from.
        </p>
      </div>

      <Section title="What PRISM-H is">
        <div className="space-y-3">
          <Prose>
            PRISM-H is an early warning dashboard for vector-borne diseases. It brings case
            surveillance, model forecasts and field response into one place, so the question
            "where is disease expected?" and the question "did we act on it?" can be answered
            from the same screen without being confused with each other.
          </Prose>
          <Prose>
            Prediction and operations stay on separate tabs on purpose. Forecast is for scanning
            where risk is heading; Response is for checking that field activity matched it.
          </Prose>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-1.5">Who it is for</h4>
              <ul className="space-y-1">
                {AUDIENCES.map((a) => (
                  <li key={a} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-1.5">Currently deployed in</h4>
              <ul className="space-y-1">
                {DEPLOYED_STATES.map((s) => (
                  <li key={s} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      <Section title="The tabs" subtitle="What each one answers. Some are hidden for non-admin users or by state configuration.">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TABS.map((t) => <DefCard key={t.name} {...t} />)}
        </div>
      </Section>

      <Section title="Data sources" subtitle="Every figure on the dashboard traces to one of these. The ward detail sheet labels each field with its source.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SOURCES.map((s) => <DefCard key={s.name} {...s} />)}
        </div>
      </Section>

      <Section title="How to log a response">
        <div className="space-y-4">
          <ol className="space-y-2">
            <Step n={1}>Open the <strong>Response</strong> tab.</Step>
            <Step n={2}>Find the ward in the <strong>Priority Action Table</strong>. The table is always ward-level and always state-wide, so you can search for a ward without first knowing which zone it sits in.</Step>
            <Step n={3}>Click <strong>Log Response</strong> on that row.</Step>
            <Step n={4}>Fill in what was done — fogging, breeding site counts, source reduction.</Step>
            <Step n={5}>Save. The row's status updates for the selected reporting week.</Step>
          </ol>

          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
            <p className="text-xs text-foreground">
              <strong>Log Response</strong> records activity that happened.
              {" "}
              <strong>Mark No Activity</strong> records that a week passed with none — which is
              different from a ward nobody has got to yet, and is what stops an untouched ward
              from looking the same as a deliberately skipped one.
            </p>
            <p className="text-xs text-muted-foreground">
              Both actions are also available from the ward detail sheet, which opens when you
              click a row in the Priority Action Table.
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            Editing an already-logged ward reopens the saved entry rather than a blank form, so
            saving again corrects the record instead of overwriting it with empty fields.
          </p>
        </div>
      </Section>

      <Section title="Where recommendations come from">
        <div className="space-y-3">
          <Prose>
            Each area shows one recommended action, never more. It is produced by protocol-derived
            rules evaluated against the ward's current state: forecast risk, case trend, fogging
            status, open breeding sites, and larval survey coverage.
          </Prose>
          <Prose>
            Each rule cites its NVBDCP protocol reference, shown beneath the recommendation, so a
            recommendation can be traced back to the guideline it came from rather than being
            taken on trust.
          </Prose>
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs text-foreground">
              A recommendation is not evidence that work happened. What the system suggests and
              what a field team logged are separate columns in the data, and separate cells in
              the interface.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            The thresholds behind these rules are visible in <strong>Admin → Assumptions</strong>,
            which shows each value and where it came from. That view is read-only.
          </p>
        </div>
      </Section>

      <Section title="Related tools">
        <div className="rounded-lg border border-border bg-card p-3">
          <a
            href="https://acestor.artpark.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1.5"
          >
            acestor.artpark.in
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1">
            The evaluation engine behind the forecasts. It runs and scores the outbreak models,
            and its configuration files are the source of truth for the risk-classification
            thresholds each state uses.
          </p>
        </div>
      </Section>

      <Section title="Version and build">
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg border border-border bg-card p-3">
            <dt className="text-[11px] text-muted-foreground">Version</dt>
            <dd className="text-sm font-medium text-foreground mt-0.5 tabular-nums">v{APP_VERSION}</dd>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <dt className="text-[11px] text-muted-foreground">Build</dt>
            <dd className="text-sm font-medium text-foreground mt-0.5 font-mono">{BUILD_SHA}</dd>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <dt className="text-[11px] text-muted-foreground">Built</dt>
            <dd className="text-sm font-medium text-foreground mt-0.5 tabular-nums">{BUILD_TIME}</dd>
          </div>
        </dl>
        <p className="text-xs text-muted-foreground mt-3">
          Built by {BUILT_BY}. Quote the build reference when reporting an issue — it identifies
          the exact code you were looking at.
        </p>
      </Section>
    </div>
  );
}
