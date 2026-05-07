import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Lock, Trash2, UserPlus, Settings as SettingsIcon, Users, BarChart3 } from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import { useStateSelection } from "@/contexts/StateContext";
import ViewSettingsScreen from "@/screens/ViewSettingsScreen";

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "State Officer" | "DHO" | "Block Worker" | "Municipal Officer" | "Data Operator";
  scope: string;
  createdAt: string;
}

const USERS_KEY = "prism_admin_users_v1";

function loadUsers(): ManagedUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* */ }
  return [
    { id: "u1", name: "Dr Shariff", email: "shariff@karnataka.gov.in", role: "State Officer", scope: "Karnataka", createdAt: "2026-01-12" },
    { id: "u2", name: "Meena Rao", email: "dho.blr@karnataka.gov.in", role: "DHO", scope: "Bengaluru Urban", createdAt: "2026-02-08" },
    { id: "u3", name: "Data Ops", email: "dataops@karnataka.gov.in", role: "Data Operator", scope: "Karnataka", createdAt: "2026-03-15" },
  ];
}

function saveUsers(users: ManagedUser[]) {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch { /* */ }
}

// ──────────────── Forecast accuracy mock ────────────────
const accuracyHistory = [
  { week: "W-12", mape: 18.4, hit: 72 },
  { week: "W-11", mape: 16.1, hit: 75 },
  { week: "W-10", mape: 14.8, hit: 78 },
  { week: "W-9", mape: 15.5, hit: 76 },
  { week: "W-8", mape: 13.2, hit: 81 },
  { week: "W-7", mape: 12.6, hit: 83 },
  { week: "W-6", mape: 11.9, hit: 85 },
  { week: "W-5", mape: 13.0, hit: 82 },
  { week: "W-4", mape: 10.5, hit: 87 },
  { week: "W-3", mape: 9.8, hit: 89 },
  { week: "W-2", mape: 11.2, hit: 86 },
  { week: "W-1", mape: 9.4, hit: 90 },
];

type AdminTab = "settings" | "users" | "accuracy";

export default function AdminScreen() {
  const { isAdmin, currentRole } = useRole();
  const { stateId, options } = useStateSelection();
  const stateLabel = options.find((s) => s.id === stateId)?.label ?? stateId;
  const [tab, setTab] = useState<AdminTab>("settings");

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
    { id: "settings", label: "Section Visibility", icon: SettingsIcon },
    { id: "users", label: "User Management", icon: Users },
    { id: "accuracy", label: "Forecast Accuracy", icon: BarChart3 },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Admin — {stateLabel}</h2>
        <p className="text-xs text-muted-foreground">Signed in as {currentRole.userName} · {currentRole.roleName}</p>
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

      {tab === "settings" && <ViewSettingsScreen />}
      {tab === "users" && <UsersPanel />}
      {tab === "accuracy" && <AccuracyPanel />}
    </div>
  );
}

function UsersPanel() {
  const [users, setUsers] = useState<ManagedUser[]>(() => loadUsers());
  const [form, setForm] = useState({ name: "", email: "", role: "DHO" as ManagedUser["role"], scope: "" });

  useEffect(() => { saveUsers(users); }, [users]);

  const addUser = () => {
    if (!form.name || !form.email) return;
    const u: ManagedUser = {
      id: `u${Date.now()}`,
      name: form.name,
      email: form.email,
      role: form.role,
      scope: form.scope || "—",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setUsers([u, ...users]);
    setForm({ name: "", email: "", role: "DHO", scope: "" });
  };

  const removeUser = (id: string) => setUsers(users.filter((u) => u.id !== id));

  const roleOptions: ManagedUser["role"][] = ["Admin", "State Officer", "DHO", "Block Worker", "Municipal Officer", "Data Operator"];

  return (
    <div className="space-y-4">
      <div className="section-card p-4">
        <h3 className="section-title mb-3">Add User</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <input className="h-9 rounded-md border border-input bg-card px-3 text-sm" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="h-9 rounded-md border border-input bg-card px-3 text-sm" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <select className="h-9 rounded-md border border-input bg-card px-3 text-sm" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as ManagedUser["role"] })}>
            {roleOptions.map((r) => <option key={r}>{r}</option>)}
          </select>
          <input className="h-9 rounded-md border border-input bg-card px-3 text-sm" placeholder="Scope (district / block)" value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })} />
          <button onClick={addUser} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium inline-flex items-center justify-center gap-1.5">
            <UserPlus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </div>

      <div className="section-card p-4">
        <h3 className="section-title mb-3">Users ({users.length})</h3>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Name", "Email", "Role", "Scope", "Created", ""].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2 px-3 font-medium">{u.name}</td>
                  <td className="py-2 px-3 text-muted-foreground">{u.email}</td>
                  <td className="py-2 px-3">{u.role}</td>
                  <td className="py-2 px-3">{u.scope}</td>
                  <td className="py-2 px-3 text-xs text-muted-foreground">{u.createdAt}</td>
                  <td className="py-2 px-3 text-right">
                    <button onClick={() => removeUser(u.id)} className="text-risk-high hover:bg-risk-high/10 p-1.5 rounded" aria-label={`Remove ${u.name}`}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={6} className="text-center text-muted-foreground py-6 text-sm">No users yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">Stored locally in browser (demo). Production deployment should back this with the user store.</p>
      </div>
    </div>
  );
}

function AccuracyPanel() {
  const metrics = useMemo(() => {
    const avgMape = accuracyHistory.reduce((a, b) => a + b.mape, 0) / accuracyHistory.length;
    const avgHit = accuracyHistory.reduce((a, b) => a + b.hit, 0) / accuracyHistory.length;
    const last = accuracyHistory[accuracyHistory.length - 1];
    return { avgMape: avgMape.toFixed(1), avgHit: avgHit.toFixed(0), lastMape: last.mape, lastHit: last.hit };
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="section-card p-4">
          <div className="text-xs text-muted-foreground">Latest MAPE</div>
          <div className="text-2xl font-bold text-foreground">{metrics.lastMape}%</div>
        </div>
        <div className="section-card p-4">
          <div className="text-xs text-muted-foreground">Latest Hit Rate</div>
          <div className="text-2xl font-bold text-foreground">{metrics.lastHit}%</div>
        </div>
        <div className="section-card p-4">
          <div className="text-xs text-muted-foreground">12-Week Avg MAPE</div>
          <div className="text-2xl font-bold text-foreground">{metrics.avgMape}%</div>
        </div>
        <div className="section-card p-4">
          <div className="text-xs text-muted-foreground">12-Week Avg Hit</div>
          <div className="text-2xl font-bold text-foreground">{metrics.avgHit}%</div>
        </div>
      </div>

      <div className="section-card p-5">
        <h3 className="section-title mb-3">Forecast Accuracy — Last 12 Weeks</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={accuracyHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="mape" name="MAPE %" stroke="hsl(0, 72%, 51%)" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="hit" name="Hit Rate %" stroke="hsl(142, 50%, 45%)" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="section-card p-5">
        <h3 className="section-title mb-3">Archive</h3>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Week", "MAPE %", "Hit Rate %"].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...accuracyHistory].reverse().map((r) => (
                <tr key={r.week} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2 px-3 font-medium">{r.week}</td>
                  <td className="py-2 px-3">{r.mape}</td>
                  <td className="py-2 px-3">{r.hit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
