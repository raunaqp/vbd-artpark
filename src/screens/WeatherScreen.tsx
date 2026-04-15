import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from "recharts";
import { weatherData } from "@/data/mockData";

export default function WeatherScreen() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rainfall */}
        <div className="section-card p-5">
          <h3 className="section-title mb-4">Weekly Rainfall (mm)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weatherData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <ReferenceLine y={80} stroke="hsl(0, 72%, 51%)" strokeDasharray="3 3" label={{ value: "80mm", fontSize: 10, fill: "hsl(0,72%,51%)" }} />
              <Bar dataKey="rainfall" fill="hsl(215, 70%, 55%)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Temperature */}
        <div className="section-card p-5">
          <h3 className="section-title mb-4">Weekly Mean Temperature (°C)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weatherData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={[10, 40]} />
              <Tooltip />
              <ReferenceArea y1={25} y2={32} fill="hsl(25, 90%, 50%)" fillOpacity={0.08} />
              <Line type="monotone" dataKey="temp" stroke="hsl(25, 90%, 50%)" strokeWidth={2} dot={{ r: 3, fill: "hsl(25, 90%, 50%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Humidity */}
        <div className="section-card p-5">
          <h3 className="section-title mb-4">Weekly Mean Humidity (%)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weatherData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
              <Tooltip />
              <ReferenceArea y1={60} y2={80} fill="hsl(142, 50%, 45%)" fillOpacity={0.08} />
              <Area type="monotone" dataKey="humidity" stroke="hsl(142, 50%, 45%)" fill="hsl(142, 50%, 45%)" fillOpacity={0.2} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <div className="section-card p-5">
        <h3 className="section-title mb-3">Climate Data Table</h3>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Wk", "End Date", "Rain (mm)", "Temp (°C)", "Max T", "Min T", "Humidity %"].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weatherData.map((r) => {
                const rainHigh = r.rainfall > 80;
                const tempInRange = r.temp >= 25 && r.temp <= 32;
                const humInRange = r.humidity >= 60 && r.humidity <= 80;
                return (
                  <tr key={r.week} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2 px-3 font-medium">{r.week}</td>
                    <td className="py-2 px-3">{r.endDate}</td>
                    <td className={`py-2 px-3 ${rainHigh ? "font-bold text-risk-critical" : ""}`}>{r.rainfall}</td>
                    <td className={`py-2 px-3 ${tempInRange ? "font-bold text-chart-temperature" : ""}`}>{r.temp}</td>
                    <td className="py-2 px-3">{r.maxT}</td>
                    <td className="py-2 px-3">{r.minT}</td>
                    <td className={`py-2 px-3 ${humInRange ? "font-bold text-chart-humidity" : ""}`}>{r.humidity}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
