import type { TabId } from "@/components/DashboardLayout";

export interface BlockDef {
  id: string;
  label: string;
}

export const BLOCK_REGISTRY: Record<Exclude<TabId, "settings">, BlockDef[]> = {
  overview: [
    { id: "situation_summary", label: "Situation Summary" },
    { id: "kpis", label: "Key Metrics" },
    { id: "high_risk_map", label: "High Risk Areas — Map" },
    { id: "high_risk_table", label: "High Risk Areas — Table" },
    { id: "areas_of_concern", label: "Areas of Concern" },
    { id: "action_focus", label: "Action Focus Areas" },
    { id: "forecast_cards", label: "Forecast — Next 4 Weeks" },
  ],
  surveillance: [
    { id: "kpis", label: "Key Metrics" },
    { id: "cases_over_time", label: "Cases Over Time (Positive, Samples, TPR)" },
    { id: "geospatial", label: "Geospatial Distribution" },
    { id: "line_listing", label: "Line Listing" },
  ],
  forecast: [
    { id: "risk_cards", label: "Forecast Risk Cards (Next 4W)" },
    { id: "forecast_map", label: "Forecasted Risk Map" },
    { id: "actual_vs_predicted", label: "Incidence — Actual vs Predicted" },
    { id: "outbreak_table", label: "Outbreak Prediction Table" },
  ],
  weather: [
    { id: "observed_climate", label: "Observed Climate (Last 8 Weeks)" },
    { id: "forecast_climate", label: "Forecast Climate (Next 8 Weeks)" },
  ],
  hotspots: [
    { id: "hotspot_alerts", label: "Hotspot Alert Cards" },
    { id: "hotspot_map", label: "Hotspot Map" },
    { id: "hotspot_daily_trend", label: "Hotspot Daily Trend" },
    { id: "hotspot_table", label: "Hotspot Analysis Table" },
  ],
  signals: [
    { id: "news_alerts", label: "News / Media Alerts" },
    { id: "geo_signal_map", label: "Geo-tagged Signal Map" },
  ],
  upload: [
    { id: "upload_format", label: "Select Upload Format" },
    { id: "upload_file", label: "Upload Data File" },
    { id: "manual_entry", label: "Manual Entry" },
  ],
} as const;

export const TAB_LABELS: Record<keyof typeof BLOCK_REGISTRY, string> = {
  overview: "Overview",
  surveillance: "Case Surveillance",
  forecast: "Forecast",
  weather: "Weather",
  hotspots: "Hotspots",
  signals: "Signals",
  upload: "Data Upload",
};

export type BlockTabId = keyof typeof BLOCK_REGISTRY;
