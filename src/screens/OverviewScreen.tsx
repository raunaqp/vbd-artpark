import GlobalFilters from "@/components/GlobalFilters";
import KpiCards from "@/components/KpiCards";
import RiskStrip from "@/components/RiskStrip";
import DashboardMap from "@/components/DashboardMap";
import RegionTable from "@/components/RegionTable";

export default function OverviewScreen() {
  return (
    <div>
      <GlobalFilters />

      {/* TLDR Summary */}
      <div className="section-card p-4 mb-6">
        <h3 className="section-title mb-2">Situation Summary</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          As of the latest reporting period, <strong>1,291 confirmed dengue cases</strong> have been recorded across Andhra Pradesh with <strong>24 deaths</strong>.
          Krishna and Visakhapatnam districts show the highest case concentrations. The forecast indicates a projected increase in weeks W2–W3, with Krishna district at <strong>critical risk</strong>.
          Immediate surveillance intensification is recommended for high-risk blocks.
        </p>
      </div>

      <KpiCards />
      <RiskStrip />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardMap height="400px" />
        <RegionTable />
      </div>
    </div>
  );
}
