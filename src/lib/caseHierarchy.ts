// Cascading hierarchy options for the case-edit modal.
// Reads the SAME canonical hierarchy the 1,000 mock cases were generated from,
// so state → district → block → ward selections always resolve to real areas.
import { getDistrictMetrics } from "@/data/canonical";
import { STATE_HIERARCHY_LABELS } from "@/data/mock_dataset";
import type { StateId } from "@/data/mockData";

export const CASE_STATES: Array<{ id: StateId; label: string }> = [
  { id: "gba_central", label: "GBA Central" },
  { id: "karnataka", label: "Karnataka" },
  { id: "odisha", label: "Odisha" },
  { id: "andhra_pradesh", label: "Andhra Pradesh" },
];

export function stateIdForLabel(label: string): StateId {
  return CASE_STATES.find((s) => s.label === label)?.id ?? "karnataka";
}

export function hierarchyLabels(stateLabel: string) {
  return STATE_HIERARCHY_LABELS[stateLabel] ?? STATE_HIERARCHY_LABELS["Karnataka"];
}

export function districtsForState(stateLabel: string): string[] {
  return getDistrictMetrics(stateLabel).map((m) => m.name);
}

export function blocksForDistrict(stateLabel: string, district: string): string[] {
  const d = getDistrictMetrics(stateLabel).find((m) => m.name === district);
  if (!d) return [];
  return [
    ...d.district.municipalities.map((m) => m.name),
    ...d.district.blocks.map((b) => b.name),
  ];
}

export function wardsForBlock(stateLabel: string, district: string, block: string): string[] {
  const d = getDistrictMetrics(stateLabel).find((m) => m.name === district);
  if (!d) return [];
  const mun = d.district.municipalities.find((m) => m.name === block);
  if (mun) return mun.wards.map((w) => w.name);
  const blk = d.district.blocks.find((b) => b.name === block);
  if (blk) return blk.villages.map((v) => v.name);
  return [];
}

// Municipality wards are Urban; block villages are Rural (same rule the
// generator used). Drives the urbanRural flag when geography is reassigned.
export function urbanRuralForBlock(stateLabel: string, district: string, block: string): "Urban" | "Rural" {
  const d = getDistrictMetrics(stateLabel).find((m) => m.name === district);
  if (d && d.district.municipalities.some((m) => m.name === block)) return "Urban";
  return "Rural";
}
