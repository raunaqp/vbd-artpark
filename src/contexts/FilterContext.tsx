import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useRole } from "./RoleContext";
import { useStateSelection } from "./StateContext";
import { getDefaultHistoricalDateRange, getDateWindow, normalizeDistrictName } from "@/data/mockData";
import { STATE_HIERARCHY_LABELS, type StateHierarchyLabels } from "@/data/mock_dataset";

interface FilterState {
  district: string;
  block: string;
  ward: string;
  areaType: "all" | "urban" | "rural";
  fromDate: string;
  toDate: string;
}

interface FilterContextType {
  filters: FilterState;
  setFilters: (f: Partial<FilterState>) => void;
  applyFilters: () => void;
  resetFilters: () => void;
  appliedFilters: FilterState;
  isLocked: (field: "district" | "block" | "ward") => boolean;
  getLabel: (field: "district" | "block") => string;
  /** State-aware hierarchy labels (level_1/2/3) for the currently selected state. */
  levelLabels: StateHierarchyLabels;
  drillDown: (area: string, level: "district" | "block") => void;
  breadcrumb: string[];
  dateWindow: ReturnType<typeof getDateWindow>;
}

function buildDefaultFilters(): FilterState {
  const { fromDate, toDate } = getDefaultHistoricalDateRange();
  return {
    district: "All Districts",
    block: "All Blocks",
    ward: "All Wards",
    areaType: "all",
    fromDate,
    toDate,
  };
}

const FilterContext = createContext<FilterContextType | null>(null);

const stateLabels: Record<string, string> = {
  gba_central: "GBA Central",
  andhra_pradesh: "Andhra Pradesh",
  odisha: "Odisha",
  karnataka: "Karnataka",
};

export function FilterProvider({ children }: { children: ReactNode }) {
  const { currentRole } = useRole();
  const { stateId } = useStateSelection();
  const [filters, setFiltersState] = useState<FilterState>(() => buildDefaultFilters());
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(() => buildDefaultFilters());

  // Reset filters whenever state OR role changes — geo bindings flow from role
  useEffect(() => {
    const next: FilterState = {
      ...buildDefaultFilters(),
      district: currentRole.district || "All Districts",
      block: currentRole.block || "All Blocks",
      areaType: currentRole.areaType || "all",
    };
    setFiltersState(next);
    setAppliedFilters(next);
  }, [currentRole.id, stateId]);

  const setFilters = (partial: Partial<FilterState>) => {
    setFiltersState((prev) => {
      const next: FilterState = { ...prev, ...partial };
      if (partial.district !== undefined) {
        next.district = normalizeDistrictName(partial.district);
        // Cascade reset: changing district clears block+ward unless caller already provided them.
        if (partial.block === undefined) next.block = "All Blocks";
        if (partial.ward === undefined) next.ward = "All Wards";
      }
      if (partial.block !== undefined && partial.ward === undefined) {
        // Cascade reset: changing block clears ward.
        next.ward = "All Wards";
      }
      return next;
    });
  };

  const applyFilters = () => setAppliedFilters({ ...filters, district: normalizeDistrictName(filters.district) });
  const resetFilters = () => {
    const next: FilterState = {
      ...buildDefaultFilters(),
      district: currentRole.district || "All Districts",
      block: currentRole.block || "All Blocks",
      areaType: currentRole.areaType || "all",
    };
    setFiltersState(next);
    setAppliedFilters(next);
  };

  const isLocked = (field: "district" | "block" | "ward") => {
    const scope = currentRole.scope;
    if (scope === "district" && field === "district") return true;
    if (scope === "block" && (field === "district" || field === "block")) return true;
    if (scope === "municipality" && (field === "district" || field === "block")) return true;
    return false;
  };

  const levelLabels: StateHierarchyLabels =
    STATE_HIERARCHY_LABELS[stateLabels[stateId]] ?? STATE_HIERARCHY_LABELS["Karnataka"];

  const getLabel = (field: "district" | "block") => {
    if (field === "district" && isLocked("district")) return `Your ${levelLabels.level_1}`;
    if (field === "block" && isLocked("block")) {
      return currentRole.scope === "municipality" ? "Your Municipality" : "Your Block";
    }
    return field === "district" ? levelLabels.level_1 : levelLabels.level_2;
  };

  const drillDown = (area: string, level: "district" | "block") => {
    if (level === "district") {
      const next = { ...filters, district: normalizeDistrictName(area), block: "All Blocks", ward: "All Wards" };
      setFiltersState(next);
      setAppliedFilters(next);
    } else if (level === "block") {
      const next = { ...filters, block: area, ward: "All Wards" };
      setFiltersState(next);
      setAppliedFilters(next);
    }
  };

  const breadcrumb: string[] = [stateLabels[stateId] || "State"];
  if (appliedFilters.district !== "All Districts") breadcrumb.push(appliedFilters.district);
  if (appliedFilters.block !== "All Blocks") breadcrumb.push(appliedFilters.block);

  const dateWindow = getDateWindow(appliedFilters);

  return (
    <FilterContext.Provider value={{ filters, setFilters, applyFilters, resetFilters, appliedFilters, isLocked, getLabel, levelLabels, drillDown, breadcrumb, dateWindow }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters(): FilterContextType {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilters must be used within FilterProvider");
  return ctx;
}
