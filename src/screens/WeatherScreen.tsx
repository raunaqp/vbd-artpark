import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine } from "recharts";
import { weatherObserved, weatherForecast, weatherData } from "@/data/mockData";

function WeatherTable({ data, label }: { data: typeof weatherObserved; label: string }) {
  return (
    <div className="section-card p-5">
      <h3 className="section-title mb-3">{label}</h3>
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
            {data.map((r) => {
              const rainHigh = r.rainfall > 80;
              const tempInRange = r.temp >= 25 && r.temp <= 32;
              const humInRange = r.humidity >= 60 && r.humidity <= 80;
              return (
                <tr key={r.week} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2 px-3 font-medium">{r.week}</td>
                  <td className="py-2 px-3">{r.endDate}</td>
                  <td className={`py-2 px-3 ${rainHigh ? "font-bold text-risk-high" : ""}`}>{r.rainfall}</td>
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
  );
}

export default function WeatherScreen() {
  return (
    <div className="space-y-6">
      {/* Section A: Observed (Past 4 weeks) */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Observed Weather (Last 4 Weeks)</h2>
        <p className="text-xs text-muted-foreground mb-4">Recorded meteorological data from IMD stations</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="section-card p-5">
            <h3 className="section-title mb-4">Rainfall (mm)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weatherObserved}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="rainfall" fill="hsl(215, 70%, 55%)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="section-card p-5">
            <h3 className="section-title mb-4">Temperature (°C)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weatherObserved}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={[10, 40]} />
                <Tooltip />
                <ReferenceArea y1={25} y2={32} fill="hsl(25, 90%, 50%)" fillOpacity={0.08} />
                <Line type="monotone" dataKey="temp" stroke="hsl(25, 90%, 50%)" strokeWidth={2} dot={{ r: 3, fill: "hsl(25, 90%, 50%)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="section-card p-5">
            <h3 className="section-title mb-4">Humidity (%)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weatherObserved}>
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

        <WeatherTable data={weatherObserved} label="Observed Climate Data" />
      </div>

      {/* Section B: Forecast (Next 8 weeks) */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Weather Forecast (Next 8 Weeks)</h2>
        <p className="text-xs text-muted-foreground mb-4">Projected meteorological data — source: IMD extended range forecast</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="section-card p-5">
            <h3 className="section-title mb-4">Forecast Rainfall (mm)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weatherForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <ReferenceLine y={80} stroke="hsl(0, 72%, 51%)" strokeDasharray="3 3" />
                <Bar dataKey="rainfall" fill="hsl(215, 70%, 55%)" radius={[2, 2, 0, 0]} opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="section-card p-5">
            <h3 className="section-title mb-4">Forecast Temperature (°C)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weatherForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={[20, 40]} />
                <Tooltip />
                <ReferenceArea y1={25} y2={32} fill="hsl(25, 90%, 50%)" fillOpacity={0.08} />
                <Line type="monotone" dataKey="temp" stroke="hsl(25, 90%, 50%)" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3, fill: "hsl(25, 90%, 50%)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="section-card p-5">
            <h3 className="section-title mb-4">Forecast Humidity (%)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weatherForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                <Tooltip />
                <ReferenceArea y1={60} y2={80} fill="hsl(142, 50%, 45%)" fillOpacity={0.08} />
                <Area type="monotone" dataKey="humidity" stroke="hsl(142, 50%, 45%)" fill="hsl(142, 50%, 45%)" fillOpacity={0.15} strokeWidth={2} strokeDasharray="6 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <WeatherTable data={weatherForecast} label="Forecast Climate Data" />
      </div>
    </div>
  );
}
