import { useState } from "react";
import { LayoutDashboard, Activity, TrendingUp, CloudRain, MapPin, Upload } from "lucide-react";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "surveillance", label: "Case Surveillance", icon: Activity },
  { id: "forecast", label: "Forecast", icon: TrendingUp },
  { id: "weather", label: "Weather", icon: CloudRain },
  { id: "hotspots", label: "Hotspots", icon: MapPin },
  { id: "upload", label: "Data Upload", icon: Upload },
] as const;

export type TabId = (typeof tabs)[number]["id"];

interface Props {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  children: React.ReactNode;
}

export default function DashboardLayout({ activeTab, onTabChange, children }: Props) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="dashboard-header px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Dengue Early Warning System</h1>
          <p className="text-xs opacity-80">Department of Health · Andhra Pradesh</p>
        </div>
        <div className="text-xs opacity-70">Latest data: 07-04-2026</div>
      </header>

      {/* Tab Navigation */}
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

      {/* Content */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
