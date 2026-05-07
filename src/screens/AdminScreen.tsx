import { useEffect, useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ComposedChart, Area,
} from "recharts";
import {
  Lock, Trash2, Pencil, UserPlus, Settings as SettingsIcon, Users, BarChart3,
  Download, History, Power, X,
} from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import { useStateSelection } from "@/contexts/StateContext";
import { Switch } from "@/components/ui/switch";
import { SECTION_TOGGLES, useSectionToggles, type SectionToggleKey } from "@/lib/sectionVisibility";
import { FORECAST_ACCURACY, MODEL_RUNS } from "@/data/forecast_accuracy_data";

// ──────────────── Types ────────────────
type AppRole = "admin" | "state_officer" | "district_officer" | "block_officer" | "data_operator";

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Admin",
  state_officer: "State Officer",
  district_officer: "District Officer",
  block_officer: "Block Officer",
  data_operator: "Data Operator",
};

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  geography: string;
  last_active: string;
  status: "active" | "inactive";
}

interface AuditEntry {
  ts: string;
  by: string;
  action: string;
  details: string;
}

const usersKey = (state: string) => `prismh:admin:users:${state}`;
const auditKey = (state: string) => `prismh:admin:audit:${state}`;

const SEED_USERS: ManagedUser[] = [
  { id: "1", name: "Dr Shariff", email: "shariff@health.in", role: "state_officer", geography: "Karnataka", last_active: "2026-05-07", status: "active" },
  { id: "2", name: "Dr Priya Krishnan", email: "priya.k@health.in", role: "district_officer", geography: "Bengaluru Urban", last_active: "2026-05-08", status: "active" },
  { id: "3", name: "Manjunath Rao", email: "manjunath@health.in", role: "block_officer", geography: "BBMP East Zone", last_active: "2026-05-06", status: "active" },
  { id: "4", name: "Anita Desai", email: "anita.d@health.in", role: "district_officer", geography: "Mysuru", last_active: "2026-05-08", status: "active" },
  { id: "5", name: "Ravi Kumar", email: "ravi.k@health.in", role: "data_operator", geography: "Bengaluru Urban", last_active: "2026-05-08", status: "active" },
  { id: "6", name: "Lakshmi Nair", email: "lakshmi.n@health.in", role: "data_operator", geography: "Udupi", last_active: "2026-05-05", status: "active" },
  { id: "7", name: "Suresh Patil", email: "suresh.p@health.in", role: "block_officer", geography: "Belagavi · Khanapur", last_active: "2026-04-28", status: "inactive" },
  { id: "8", name: "Geetha Hegde", email: "geetha.h@health.in", role: "district_officer", geography: "Dakshina Kannada", last_active: "2026-05-07", status: "active" },
  { id: "9", name: "Harish Shenoy", email: "harish.s@health.in", role: "block_officer", geography: "Tumakuru · Sira", last_active: "2026-05-04", status: "active" },
  { id: "10", name: "Deepa Iyer", email: "deepa.i@health.in", role: "data_operator", geography: "Dakshina Kannada", last_active: "2026-05-08", status: "active" },
  { id: "11", name: "Vinod Jain", email: "vinod.j@health.in", role: "admin", geography: "Karnataka", last_active: "2026-05-08", status: "active" },
  { id: "12", name: "Kavita Mehta", email: "kavita.m@health.in", role: "state_officer", geography: "Karnataka", last_active: "2026-04-15", status: "inactive" },
];

function loadUsers(state: string): ManagedUser[] {
  try {
    const raw = localStorage.getItem(usersKey(state));
    if (raw) return JSON.parse(raw);
  } catch { /* */ }
  return SEED_USERS;
}
function saveUsers(state: string, users: ManagedUser[]) {
  try { localStorage.setItem(usersKey(state), JSON.stringify(users)); } catch { /* */ }
}
function loadAudit(state: string): AuditEntry[] {
  try { const raw = localStorage.getItem(auditKey(state)); if (raw) return JSON.parse(raw); } catch { /* */ }
  return [];
}
function appendAudit(state: string, by: string, action: string, details: string) {
  const log = loadAudit(state);
  log.unshift({ ts: new Date().toISOString(), by, action, details });
  try { localStorage.setItem(auditKey(state), JSON.stringify(log.slice(0, 50))); } catch { /* */ }
}

type AdminTab = "sections" | "users" | "accuracy";

export default function AdminScreen() {
  const { isAdmin, currentRole } = useRole();
  const { stateId, options } = useStateSelection();
  const stateLabel = options.find((s) => s.id === stateId)?.label ?? stateId;
  const [tab, setTab] = useState<AdminTab>("sections");

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto mt-12 section-card p-8 text-center">
        <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-foreground mb-1">Restricted</h2>
        <p className="text-sm text-muted-foreground">
          The Admin tab is available only to Admin users. Currently signed in as {currentRole.roleName}.
        </p>
      </div>
    );
  }

  const tabs: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "sections", label: "Section Visibility", icon: SettingsIcon },
    { id: "users", label: "User Management", icon: Users },
    { id: "accuracy", label: "Forecast Accuracy", icon: BarChart3 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Admin — {stateLabel}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Signed in as {currentRole.userName} · {currentRole.roleName}</p>
      </div>

      <div className="tab-nav inline-flex">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`tab-nav-item flex items-center gap-2 ${tab === t.id ? "tab-nav-item-active" : ""}`}
          >
            <t.icon className="h-4 w-4" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div>
        {tab === "sections" && <SectionVisibilityPanel state={stateId} stateLabel={stateLabel} />}
        {tab === "users" && <UserManagementPanel state={stateId} adminName={currentRole.userName} />}
        {tab === "accuracy" && <ForecastAccuracyPanel />}
      </div>
    </div>
  );
}

// ───────────────────────── Section Visibility ─────────────────────────
function SectionVisibilityPanel({ state, stateLabel }: { state: string; stateLabel: string }) {
  const [toggles, setToggles] = useSectionToggles(state);

  return (
    <div className="section-card p-5 space-y-3 max-w-3xl">
      <div>
        <h3 className="section-title">Section Visibility — {stateLabel}</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Hide tabs and sections from non-admin users in this state. Admins always see everything.
        </p>
      </div>
      <div className="divide-y divide-border">
        {SECTION_TOGGLES.map((t) => (
          <div key={t.key} className="flex items-center justify-between py-3">
            <div>
              <div className="text-sm font-medium text-foreground">{t.label}</div>
              <div className="text-xs text-muted-foreground">Affects all users in your state</div>
            </div>
            <Switch
              checked={toggles[t.key]}
              onCheckedChange={(v) => setToggles({ ...toggles, [t.key]: v })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ───────────────────────── User Management ─────────────────────────
function UserManagementPanel({ state, adminName }: { state: string; adminName: string }) {
  const [users, setUsers] = useState<ManagedUser[]>(() => loadUsers(state));
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [audit, setAudit] = useState<AuditEntry[]>(() => loadAudit(state));

  useEffect(() => { setUsers(loadUsers(state)); setAudit(loadAudit(state)); }, [state]);
  useEffect(() => { saveUsers(state, users); }, [state, users]);

  const openAdd = () => { setEditing(null); setShowModal(true); };
  const openEdit = (u: ManagedUser) => { setEditing(u); setShowModal(true); };

  const onSave = (u: ManagedUser) => {
    const isEdit = users.some((x) => x.id === u.id);
    if (isEdit) {
      setUsers(users.map((x) => (x.id === u.id ? u : x)));
      appendAudit(state, adminName, "Edit user", `${u.name} (${u.email})`);
    } else {
      setUsers([{ ...u, id: `u${Date.now()}` }, ...users]);
      appendAudit(state, adminName, "Add user", `${u.name} (${u.email}) · ${ROLE_LABELS[u.role]}`);
    }
    setAudit(loadAudit(state));
    setShowModal(false);
  };

  const toggleStatus = (u: ManagedUser) => {
    const next: ManagedUser["status"] = u.status === "active" ? "inactive" : "active";
    setUsers(users.map((x) => (x.id === u.id ? { ...x, status: next } : x)));
    appendAudit(state, adminName, next === "active" ? "Enable user" : "Disable user", u.name);
    setAudit(loadAudit(state));
  };

  const removeUser = (u: ManagedUser) => {
    setUsers(users.filter((x) => x.id !== u.id));
    appendAudit(state, adminName, "Delete user", u.name);
    setAudit(loadAudit(state));
  };

  return (
    <div className="space-y-4">
      <div className="section-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="section-title">Users ({users.length})</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAudit(true)} className="h-8 px-3 rounded-md border border-input text-xs text-muted-foreground hover:bg-muted/50 inline-flex items-center gap-1.5">
              <History className="h-3.5 w-3.5" /> View Audit Log
            </button>
            <button onClick={openAdd} className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium inline-flex items-center gap-1.5">
              <UserPlus className="h-3.5 w-3.5" /> Add User
            </button>
          </div>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Name", "Email", "Role", "Geography", "Last Active", "Status", ""].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2 px-3 font-medium">{u.name}</td>
                  <td className="py-2 px-3 text-muted-foreground">{u.email}</td>
                  <td className="py-2 px-3">{ROLE_LABELS[u.role]}</td>
                  <td className="py-2 px-3">{u.geography}</td>
                  <td className="py-2 px-3 text-xs text-muted-foreground">{u.last_active}</td>
                  <td className="py-2 px-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.status === "active" ? "bg-risk-low/15 text-risk-low" : "bg-muted text-muted-foreground"}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(u)} className="text-muted-foreground hover:text-foreground hover:bg-muted/50 p-1.5 rounded" aria-label={`Edit ${u.name}`}>
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => toggleStatus(u)} className="text-muted-foreground hover:text-foreground hover:bg-muted/50 p-1.5 rounded" aria-label={`${u.status === "active" ? "Disable" : "Enable"} ${u.name}`}>
                      <Power className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => removeUser(u)} className="text-risk-high hover:bg-risk-high/10 p-1.5 rounded" aria-label={`Remove ${u.name}`}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">Stored locally in browser (demo). Production deployment should back this with the user store.</p>
      </div>

      {showModal && (
        <UserModal
          initial={editing}
          stateLabel={state}
          onCancel={() => setShowModal(false)}
          onSave={onSave}
        />
      )}

      {showAudit && (
        <AuditDrawer entries={audit} onClose={() => setShowAudit(false)} />
      )}
    </div>
  );
}

function UserModal({
  initial, stateLabel, onCancel, onSave,
}: {
  initial: ManagedUser | null;
  stateLabel: string;
  onCancel: () => void;
  onSave: (u: ManagedUser) => void;
}) {
  const [form, setForm] = useState<ManagedUser>(initial ?? {
    id: "",
    name: "",
    email: "",
    role: "district_officer",
    geography: "",
    last_active: new Date().toISOString().slice(0, 10),
    status: "active",
  });
  const [error, setError] = useState("");

  const submit = () => {
    if (!form.name.trim()) return setError("Name is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError("Valid email is required");
    if (!form.geography.trim()) return setError("Geography is required");
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-foreground">{initial ? "Edit User" : "Add User"}</h3>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3">
          <Field label="Name">
            <input className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Email">
            <input type="email" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Role">
            <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as AppRole })}>
              {(Object.keys(ROLE_LABELS) as AppRole[]).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
          </Field>
          <Field label="State">
            <input disabled className="w-full h-9 rounded-md border border-input bg-muted/50 px-3 text-sm text-muted-foreground" value={stateLabel} />
          </Field>
          <Field label="Geography (district / block / ward)">
            <input className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.geography} onChange={(e) => setForm({ ...form, geography: e.target.value })} placeholder="e.g. Bengaluru Urban · BBMP East Zone" />
          </Field>
          {error && <p className="text-xs text-risk-high">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onCancel} className="h-8 px-3 rounded-md border border-input text-xs text-muted-foreground hover:bg-muted/50">Cancel</button>
          <button onClick={submit} className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-xs font-medium">Save</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      {children}
    </div>
  );
}

function AuditDrawer({ entries, onClose }: { entries: AuditEntry[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/40" />
      <div className="w-[400px] max-w-full bg-card border-l border-border h-full overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-card">
          <h3 className="text-sm font-semibold">Audit Log (last 50)</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        {entries.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No changes recorded yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {entries.map((e, i) => (
              <li key={i} className="p-3">
                <div className="text-xs text-muted-foreground">{new Date(e.ts).toLocaleString()}</div>
                <div className="text-sm font-medium text-foreground mt-0.5">{e.action}</div>
                <div className="text-xs text-muted-foreground">by {e.by} · {e.details}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ───────────────────────── Forecast Accuracy ─────────────────────────
type AccTab = "chart" | "metrics" | "archive";

function ForecastAccuracyPanel() {
  const [tab, setTab] = useState<AccTab>("chart");
  const districts = useMemo(() => Object.keys(FORECAST_ACCURACY), []);

  return (
    <div className="space-y-4">
      <div className="tab-nav inline-flex">
        {([
          { id: "chart", label: "Forecast vs. Actual" },
          { id: "metrics", label: "Accuracy Metrics" },
          { id: "archive", label: "Forecast Archive" },
        ] as { id: AccTab; label: string }[]).map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`tab-nav-item ${tab === t.id ? "tab-nav-item-active" : ""}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "chart" && <ForecastVsActual districts={districts} />}
      {tab === "metrics" && <MetricsTable districts={districts} />}
      {tab === "archive" && <ArchiveTable />}
    </div>
  );
}

function ForecastVsActual({ districts }: { districts: string[] }) {
  const [district, setDistrict] = useState(districts[0] ?? "");
  const data = (FORECAST_ACCURACY[district]?.history ?? []).map((h) => ({
    week: h.week_ending.slice(5),
    predicted: h.predicted,
    actual: h.actual,
    upper: Math.round(h.predicted * 1.2),
    lower: Math.round(h.predicted * 0.8),
    band: Math.round(h.predicted * 0.4), // for stacked area visual
  }));

  // Find biggest divergence week
  const worst = (FORECAST_ACCURACY[district]?.history ?? []).reduce(
    (acc, h) => (h.abs_error > (acc?.abs_error ?? -1) ? h : acc),
    null as null | (typeof FORECAST_ACCURACY)[string]["history"][number],
  );

  return (
    <div className="space-y-3">
      <div className="section-card p-4">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <div>
            <h3 className="section-title">Forecast vs. Actual — {district}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Showing model predictions vs. actuals from a 12-week retrospective. The model is in active development; performance varies by geography and disease intensity.
            </p>
          </div>
          <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={district} onChange={(e) => setDistrict(e.target.value)}>
            {districts.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="lower" stackId="band" stroke="none" fill="transparent" />
            <Area type="monotone" dataKey="band" stackId="band" stroke="none" fill="hsl(214, 80%, 56%)" fillOpacity={0.12} name="±20% interval" />
            <Line type="monotone" dataKey="predicted" name="Predicted" stroke="hsl(220, 10%, 50%)" strokeDasharray="4 3" strokeWidth={2} dot={{ r: 2 }} />
            <Line type="monotone" dataKey="actual" name="Actual" stroke="hsl(214, 80%, 56%)" strokeWidth={2} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
        {worst && (
          <p className="text-xs text-muted-foreground mt-2">
            {district} — last 12 weeks: predicted vs. actual diverged most in week of {worst.week_ending}.
          </p>
        )}
      </div>
    </div>
  );
}

function MetricsTable({ districts }: { districts: string[] }) {
  const rows = useMemo(() => {
    const list = districts.map((d) => {
      const m = FORECAST_ACCURACY[d].metrics;
      return { district: d, ...m };
    });
    return list.sort((a, b) => b.hit_rate_pct - a.hit_rate_pct);
  }, [districts]);

  return (
    <div className="section-card p-4">
      <h3 className="section-title mb-3">Accuracy Metrics by District</h3>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">District</th>
              <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground" title="Mean Absolute Error in case count. Lower is better.">MAE</th>
              <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground" title="Mean Absolute Percentage Error. Capped at 100% in display; uncapped values shown in parentheses for low-baseline geographies.">MAPE %</th>
              <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground" title="Percentage of weeks where the predicted risk class matched the actual risk class.">Hit Rate %</th>
              <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">N weeks</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const capped = r.mape_pct > 100;
              const mapeDisplay = capped ? `100% (${r.mape_pct.toFixed(0)}%)` : `${r.mape_pct.toFixed(1)}%`;
              return (
                <tr key={r.district} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2 px-3 font-medium">{r.district}</td>
                  <td className="py-2 px-3 text-right">{r.mae.toFixed(1)}</td>
                  <td className="py-2 px-3 text-right">{mapeDisplay}</td>
                  <td className="py-2 px-3 text-right">{r.hit_rate_pct.toFixed(0)}%</td>
                  <td className="py-2 px-3 text-right text-muted-foreground">{r.n_weeks}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-muted-foreground mt-3">
        Accuracy is computed against retrospective actuals, not real-time data. The model was retrained twice in the last 12 weeks.
      </p>
    </div>
  );
}

function ArchiveTable() {
  const downloadRun = (runDate: string) => {
    const lines = ["district,week,predicted,actual"];
    Object.entries(FORECAST_ACCURACY).forEach(([d, info]) => {
      info.history.forEach((h) => {
        lines.push(`${d},${h.week_ending},${h.predicted},${h.actual}`);
      });
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `prismh-forecast-${runDate}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="section-card p-4">
      <h3 className="section-title mb-3">Forecast Archive</h3>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Run Date", "Forecast Window", "Districts Covered", "Model Version", ""].map((h) => (
                <th key={h} className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODEL_RUNS.map((r) => (
              <tr key={r.run_date} className="border-b border-border/50 hover:bg-muted/30">
                <td className="py-2 px-3 font-medium">{r.run_date}</td>
                <td className="py-2 px-3 text-muted-foreground">{r.window_start} → {r.window_end}</td>
                <td className="py-2 px-3">{r.districts_covered}</td>
                <td className="py-2 px-3">{r.model_version}</td>
                <td className="py-2 px-3 text-right">
                  <button onClick={() => downloadRun(r.run_date)} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-input hover:bg-muted/50">
                    <Download className="h-3.5 w-3.5" /> Download CSV
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
