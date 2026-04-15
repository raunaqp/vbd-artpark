import { LayoutDashboard, Activity, TrendingUp, CloudRain, MapPin, Upload, AlertTriangle, Download, ChevronDown, User, Radio } from "lucide-react";
import { useRole, roles } from "@/contexts/RoleContext";
import { dataQualityIssues } from "@/data/mockData";
import { useState } from "react";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "surveillance", label: "Case Surveillance", icon: Activity },
  { id: "forecast", label: "Forecast", icon: TrendingUp },
  { id: "weather", label: "Weather", icon: CloudRain },
  { id: "hotspots", label: "Hotspots", icon: MapPin },
  { id: "signals", label: "Signals", icon: Radio },
  { id: "upload", label: "Data Upload", icon: Upload },
] as const;

export type TabId = (typeof tabs)[number]["id"];

interface Props {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  children: React.ReactNode;
}

export default function DashboardLayout({ activeTab, onTabChange, children }: Props) {
  const { currentRole, setRole } = useRole();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="dashboard-header px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Dengue Early Warning System</h1>
          <p className="text-xs opacity-80">Department of Health · Andhra Pradesh</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => { setShowReportMenu(!showReportMenu); setShowRoleMenu(false); }}
              className="flex items-center gap-1.5 text-xs bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-md px-3 py-1.5 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download Report
              <ChevronDown className="h-3 w-3" />
            </button>
            {showReportMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-50 py-1">
                {["Weekly Report", "District Report", "NVBDCP Format"].map((r) => (
                  <button key={r} onClick={() => setShowReportMenu(false)} className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => { setShowRoleMenu(!showRoleMenu); setShowReportMenu(false); }}
              className="flex items-center gap-2 text-xs bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-md px-3 py-1.5 transition-colors"
            >
              <User className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                <span className="font-medium">{currentRole.userName}</span>
                <span className="opacity-70"> · {currentRole.roleName} · {currentRole.location}</span>
              </span>
              <ChevronDown className="h-3 w-3" />
            </button>
            {showRoleMenu && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-card border border-border rounded-lg shadow-lg z-50 py-1 max-h-80 overflow-auto">
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">Switch Role</div>
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { setRole(r.id); setShowRoleMenu(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${currentRole.id === r.id ? "bg-muted font-medium text-foreground" : "text-foreground"}`}
                  >
                    <div>{r.label}</div>
                    <div className="text-xs text-muted-foreground">{r.userName}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {dataQualityIssues.length > 0 && (
        <div className="bg-risk-moderate/10 border-b border-risk-moderate/30 px-6 py-2">
          <div className="flex items-start gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-risk-moderate flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-foreground">Data Issues:</span>
              <ul className="list-disc list-inside text-muted-foreground text-xs mt-0.5">
                {dataQualityIssues.map((d, i) => (
                  <li key={i}>{d.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <nav className="bg-card border-b border-border px-6 py-2">
        <div className="tab-nav inline-flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`tab-nav-item flex items-center gap-2 ${activeTab === tab.id ? "tab-nav-item-active" : ""}`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
