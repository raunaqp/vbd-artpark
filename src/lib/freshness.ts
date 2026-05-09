// Per-district freshness lookup.
import { FRESHNESS_BY_DISTRICT, type FreshnessEntry } from "@/data/mock_dataset";

export function getFreshness(district?: string): FreshnessEntry | undefined {
  if (!district || district === "All Districts") return undefined;
  return FRESHNESS_BY_DISTRICT[district];
}

export function freshnessTone(status: FreshnessEntry["status"]): {
  textClass: string;
  bgClass: string;
  borderClass: string;
} {
  switch (status) {
    case "concerning":
      return { textClass: "text-risk-high", bgClass: "bg-risk-high/10", borderClass: "border-risk-high/40" };
    case "stale":
      return { textClass: "text-risk-moderate", bgClass: "bg-risk-moderate/10", borderClass: "border-risk-moderate/40" };
    case "good":
      return { textClass: "text-muted-foreground", bgClass: "bg-muted/40", borderClass: "border-border" };
    default:
      return { textClass: "text-risk-low", bgClass: "bg-risk-low/10", borderClass: "border-risk-low/30" };
  }
}
