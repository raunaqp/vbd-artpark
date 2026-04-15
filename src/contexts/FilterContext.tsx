import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useRole } from "./RoleContext";
import { districts, blocks, wards } from "@/data/mockData";

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
}

const defaultFilters: FilterState = {
  district: "All Districts",
  block: "All Blocks",
  ward: "All Wards",
  areaType: "all",
  fromDate: "2026-02-01",
  toDate: "2026-04-07",
};

const FilterContext = createContext<FilterContextType | null>(null);

const roleGeoMap: Record<string, Partial<FilterState>> = {
  district_visakhapatnam: { district: "Visakhapatnam" },
  district_guntur: { district: "Guntur" },
  district_kurnool: { district: "Kurnool" },
  block_bheemunipatnam: { district: "Visakhapatnam", block: "Bheemunipatnam" },
  block_anakapalle: { district: "Visakhapatnam", block: "Anakapalle" },
  block_tenali: { district: "Guntur", block: "Tenali" },
  municipality_vizag: { district: "Visakhapatnam", block: "Vizag MC", areaType: "urban" as const },
  municipality_vijayawada: { district: "Krishna", block: "Vijayawada MC", areaType: "urban" as const },
};

export function FilterProvider({ children }: { children: ReactNode }) {
  const { currentRole } = useRole();
  const [filters, setFiltersState] = useState<FilterState>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(defaultFilters);

  useEffect(() => {
    const geo = roleGeoMap[currentRole.id];
    const next = { ...defaultFilters, ...geo };
    setFiltersState(next);
    setAppliedFilters(next);
  }, [currentRole.id]);

  const setFilters = (partial: Partial<FilterState>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
  };

  const applyFilters = () => setAppliedFilters({ ...filters });
  const resetFilters = () => {
    const geo = roleGeoMap[currentRole.id];
    const next = { ...defaultFilters, ...geo };
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

  const getLabel = (field: "district" | "block") => {
    if (field === "district" && isLocked("district")) return "Your District";
    if (field === "block" && isLocked("block")) {
      return currentRole.scope === "municipality" ? "Your Municipality" : "Your Block";
    }
    return field === "district" ? "District" : "Block / Municipality";
  };

  return (
    <FilterContext.Provider value={{ filters, setFilters, applyFilters, resetFilters, appliedFilters, isLocked, getLabel }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilters must be used within FilterProvider");
  return ctx;
}
