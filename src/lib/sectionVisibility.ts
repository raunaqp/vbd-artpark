import { useEffect, useState } from "react";

export type SectionToggleKey =
  | "forecast_tab"
  | "hotspots_tab"
  | "signals_tab"
  | "overview_action_focus"
  | "forecast_accuracy"
  | "data_upload";

export const SECTION_TOGGLES: { key: SectionToggleKey; label: string; default: boolean }[] = [
  { key: "forecast_tab", label: "Forecast tab", default: true },
  { key: "hotspots_tab", label: "Hotspots tab", default: true },
  { key: "signals_tab", label: "Signals tab", default: true },
  { key: "overview_action_focus", label: "Action Focus Areas (Overview)", default: true },
  { key: "forecast_accuracy", label: "Forecast Accuracy (Admin only)", default: true },
  { key: "data_upload", label: "Data Upload", default: true },
];

const keyFor = (state: string) => `prismh:admin:sections:${state}`;

export function loadSectionToggles(state: string): Record<SectionToggleKey, boolean> {
  const def = Object.fromEntries(SECTION_TOGGLES.map((t) => [t.key, t.default])) as Record<SectionToggleKey, boolean>;
  try {
    const raw = localStorage.getItem(keyFor(state));
    if (!raw) return def;
    return { ...def, ...JSON.parse(raw) };
  } catch {
    return def;
  }
}

export function saveSectionToggles(state: string, toggles: Record<SectionToggleKey, boolean>) {
  try {
    localStorage.setItem(keyFor(state), JSON.stringify(toggles));
    window.dispatchEvent(new CustomEvent("prismh:section-toggles-changed", { detail: { state } }));
  } catch { /* */ }
}

/** Reactive subscription to toggles for a state. */
export function useSectionToggles(state: string) {
  const [toggles, setToggles] = useState(() => loadSectionToggles(state));
  useEffect(() => {
    setToggles(loadSectionToggles(state));
    const onChange = () => setToggles(loadSectionToggles(state));
    window.addEventListener("prismh:section-toggles-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("prismh:section-toggles-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [state]);
  return [toggles, (next: Record<SectionToggleKey, boolean>) => { saveSectionToggles(state, next); setToggles(next); }] as const;
}

/** Returns true if a section is visible for the current user.
 *  Admins always see everything; toggles only hide content from non-admins. */
export function useIsSectionVisible(section: SectionToggleKey, state: string, isAdmin: boolean): boolean {
  const [toggles] = useSectionToggles(state);
  if (isAdmin) return true;
  return toggles[section] !== false;
}
