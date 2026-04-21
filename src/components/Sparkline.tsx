interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  trend?: "up" | "down" | "stable";
  className?: string;
}

/**
 * Tiny inline SVG sparkline. No deps. Themed via currentColor.
 * Used inside hotspot table rows to show 14-day case shape per area.
 */
export default function Sparkline({ values, width = 80, height = 24, trend = "stable", className }: SparklineProps) {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  const stepX = values.length > 1 ? width / (values.length - 1) : 0;

  const points = values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height - 2) - 1;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const colorClass =
    trend === "up" ? "text-risk-high" : trend === "down" ? "text-risk-low" : "text-muted-foreground";

  const lastX = (values.length - 1) * stepX;
  const lastY = height - ((values[values.length - 1] - min) / range) * (height - 2) - 1;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`${colorClass} ${className ?? ""}`}
      aria-hidden="true"
    >
      <polyline fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" points={points} />
      <circle cx={lastX} cy={lastY} r="1.8" fill="currentColor" />
    </svg>
  );
}

/**
 * Deterministically synthesize a short daily series for a given area
 * based on its current/previous totals and trend. Keeps sparklines
 * cheap (no extra data-layer calls per row) while staying plausible.
 */
export function synthSparkSeries(seed: string, currentCases: number, prevCases: number, trend: "up" | "down" | "stable", points = 14): number[] {
  // Simple deterministic hash → [0,1)
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rand = (i: number) => {
    const x = Math.sin((h ^ (i * 9301 + 49297)) >>> 0) * 43758.5453;
    return x - Math.floor(x);
  };

  // Daily mean shifts from prev → current across the window
  const prevDaily = prevCases / Math.max(points, 1);
  const currDaily = currentCases / Math.max(points, 1);

  return Array.from({ length: points }, (_, i) => {
    const t = i / Math.max(points - 1, 1);
    // Bias curve based on trend
    const curve =
      trend === "up" ? Math.pow(t, 1.4) :
      trend === "down" ? Math.pow(1 - t, 1.4) :
      0.5;
    const base = prevDaily * (1 - curve) + currDaily * curve;
    const jitter = 0.75 + rand(i) * 0.5;
    return Math.max(0, Math.round(base * jitter * 1.6));
  });
}
