import { regionData } from "@/data/mockData";

export default function RegionTable() {
  return (
    <div className="section-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="section-title">Top Hotspots</h3>
      </div>
      <div className="overflow-auto max-h-[340px]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Region</th>
              <th className="text-right py-2 px-2 text-xs font-medium text-muted-foreground">Suspected</th>
              <th className="text-right py-2 px-2 text-xs font-medium text-muted-foreground">Confirmed</th>
              <th className="text-right py-2 px-2 text-xs font-medium text-muted-foreground">Deaths</th>
              <th className="text-center py-2 px-2 text-xs font-medium text-muted-foreground">Risk</th>
            </tr>
          </thead>
          <tbody>
            {regionData.slice(0, 5).map((r) => (
              <tr key={r.name} className="border-b border-border/50 hover:bg-muted/30">
                <td className="py-2 px-2 font-medium">{r.name}</td>
                <td className="py-2 px-2 text-right">{r.suspected}</td>
                <td className="py-2 px-2 text-right">{r.confirmed}</td>
                <td className="py-2 px-2 text-right">{r.deaths}</td>
                <td className="py-2 px-2 text-center"><span className={`risk-badge-${r.risk}`}>{r.risk}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
