// State-aware risk label helper.
// Karnataka & Odisha → WHO labels; Andhra Pradesh → ICMR labels.
import { STATE_RISK_METHOD } from "./definitions";

const WHO: Record<"low" | "moderate" | "high", string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
};
const ICMR: Record<"low" | "moderate" | "high", string> = {
  low: "Low",
  moderate: "Caution",
  high: "High Risk",
};

const STATE_BY_ID: Record<string, string> = {
  andhra_pradesh: "Andhra Pradesh",
  karnataka: "Karnataka",
  odisha: "Odisha",
};

export function getRiskLabel(stateIdOrLabel: string, risk: "low" | "moderate" | "high"): string {
  const label = STATE_BY_ID[stateIdOrLabel] ?? stateIdOrLabel;
  const method = (STATE_RISK_METHOD as Record<string, string>)[label] ?? "WHO";
  return method === "ICMR" ? ICMR[risk] : WHO[risk];
}
