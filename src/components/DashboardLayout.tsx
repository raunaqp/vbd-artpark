import { LayoutDashboard, Activity, TrendingUp, CloudRain, MapPin, Upload, AlertTriangle, Download, ChevronDown, User, Radio, ChevronRight, Bug, MapPinned } from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import { useDisease, diseases } from "@/contexts/DiseaseContext";
import { useStateSelection } from "@/contexts/StateContext";
import { getDataQualityIssues } from "@/data/mockData";
import { useEffect, useState } from "react";

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
  const { currentRole, setRole, availableRoles } = useRole();
  const { currentDisease, setDisease } = useDisease();
  const { stateId, setStateId, options: stateOptions } = useStateSelection();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [showDiseaseMenu, setShowDiseaseMenu] = useState(false);
  const [showStateMenu, setShowStateMenu] = useState(false);
  const [pendingStateId, setPendingStateId] = useState(stateId);
  const [dataIssuesExpanded, setDataIssuesExpanded] = useState(false);

  const reportOptions = ["Weekly Report", "District Summary", "NVBDCP Format", "Line Listing"];
  const currentStateLabel = stateOptions.find((s) => s.id === stateId)?.label || "State";
  const dataQualityIssues = getDataQualityIssues();
  void stateId; // re-evaluate on state change

  return (
    <div className="min-h-screen flex flex-col">
      <header className="dashboard-header px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Early Warning System for Vector-Borne Diseases</h1>
          <p className="text-xs opacity-80">Department of Health · {currentStateLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* State Selector */}
          <div className="relative">
            <button
              onClick={() => { setShowStateMenu(!showStateMenu); setShowRoleMenu(false); setShowReportMenu(false); setShowDiseaseMenu(false); }}
              className="flex items-center gap-1.5 text-xs bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-md px-3 py-1.5 transition-colors"
            >
              <MapPinned className="h-3.5 w-3.5" />
              {currentStateLabel}
              <ChevronDown className="h-3 w-3" />
            </button>
            {showStateMenu && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-card border border-border rounded-lg shadow-lg z-50 py-1">
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">Select State</div>
                {stateOptions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setPendingStateId(s.id)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center justify-between ${pendingStateId === s.id ? "bg-muted font-medium text-foreground" : "text-foreground"}`}
                  >
                    <span>{s.label}</span>
                    {pendingStateId === s.id && <span className="text-xs text-primary">●</span>}
                  </button>
                ))}
                <div className="px-2 pt-2 pb-1 border-t border-border mt-1 flex gap-2">
                  <button
                    onClick={() => { setPendingStateId(stateId); setShowStateMenu(false); }}
                    className="flex-1 text-xs px-2 py-1.5 rounded-md border border-input text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { setStateId(pendingStateId); setShowStateMenu(false); }}
                    disabled={pendingStateId === stateId}
                    className="flex-1 text-xs px-2 py-1.5 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Disease Selector */}
          <div className="relative">
            <button
              onClick={() => { setShowDiseaseMenu(!showDiseaseMenu); setShowRoleMenu(false); setShowReportMenu(false); }}
              className="flex items-center gap-1.5 text-xs bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-md px-3 py-1.5 transition-colors"
            >
              <Bug className="h-3.5 w-3.5" />
              {currentDisease.label}
              <ChevronDown className="h-3 w-3" />
            </button>
            {showDiseaseMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-50 py-1">
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">Select Disease</div>
                {diseases.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => { setDisease(d.id); setShowDiseaseMenu(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${currentDisease.id === d.id ? "bg-muted font-medium text-foreground" : "text-foreground"}`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Download Report */}
          <div className="relative">
            <button
              onClick={() => { setShowReportMenu(!showReportMenu); setShowRoleMenu(false); setShowDiseaseMenu(false); }}
              className="flex items-center gap-1.5 text-xs bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-md px-3 py-1.5 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download Report
              <ChevronDown className="h-3 w-3" />
            </button>
            {showReportMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-50 py-1">
                {reportOptions.map((r) => (
                  <button key={r} onClick={() => setShowReportMenu(false)} className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => { setShowRoleMenu(!showRoleMenu); setShowReportMenu(false); setShowDiseaseMenu(false); }}
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
                {availableRoles.map((r) => (
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
          <button
            onClick={() => setDataIssuesExpanded(!dataIssuesExpanded)}
            className="flex items-center gap-2 text-sm w-full"
          >
            <AlertTriangle className="h-4 w-4 text-risk-moderate flex-shrink-0" />
            <span className="font-medium text-foreground">⚠ Data Issues ({dataQualityIssues.length})</span>
            <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${dataIssuesExpanded ? "rotate-90" : ""}`} />
          </button>
          {dataIssuesExpanded && (
            <ul className="list-disc list-inside text-muted-foreground text-xs mt-1.5 ml-6">
              {dataQualityIssues.map((d, i) => (
                <li key={i}>{d.message}</li>
              ))}
            </ul>
          )}
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
