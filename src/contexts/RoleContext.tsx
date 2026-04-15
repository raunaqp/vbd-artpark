import { createContext, useContext, useState, type ReactNode } from "react";

export type RoleType =
  | "state_officer"
  | "district_visakhapatnam"
  | "district_guntur"
  | "district_kurnool"
  | "block_bheemunipatnam"
  | "block_anakapalle"
  | "block_tenali"
  | "municipality_vizag"
  | "municipality_vijayawada"
  | "analyst";

export interface RoleInfo {
  id: RoleType;
  label: string;
  scope: "state" | "district" | "block" | "municipality";
  location: string;
  roleName: string;
}

export const roles: RoleInfo[] = [
  { id: "state_officer", label: "State Surveillance Officer", scope: "state", location: "Andhra Pradesh", roleName: "State Officer" },
  { id: "district_visakhapatnam", label: "District — Visakhapatnam", scope: "district", location: "Visakhapatnam", roleName: "DHO" },
  { id: "district_guntur", label: "District — Guntur", scope: "district", location: "Guntur", roleName: "DHO" },
  { id: "district_kurnool", label: "District — Kurnool", scope: "district", location: "Kurnool", roleName: "DHO" },
  { id: "block_bheemunipatnam", label: "Block — Bheemunipatnam", scope: "block", location: "Bheemunipatnam", roleName: "Block Worker" },
  { id: "block_anakapalle", label: "Block — Anakapalle", scope: "block", location: "Anakapalle", roleName: "Block Worker" },
  { id: "block_tenali", label: "Block — Tenali", scope: "block", location: "Tenali", roleName: "Block Worker" },
  { id: "municipality_vizag", label: "Municipality — Vizag MC", scope: "municipality", location: "Vizag MC", roleName: "Municipal Officer" },
  { id: "municipality_vijayawada", label: "Municipality — Vijayawada MC", scope: "municipality", location: "Vijayawada MC", roleName: "Municipal Officer" },
  { id: "analyst", label: "Analyst (Full Access)", scope: "state", location: "Andhra Pradesh", roleName: "Analyst" },
];

interface RoleContextType {
  currentRole: RoleInfo;
  setRole: (id: RoleType) => void;
  isAnalyst: boolean;
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [roleId, setRoleId] = useState<RoleType>("state_officer");
  const currentRole = roles.find((r) => r.id === roleId) || roles[0];

  return (
    <RoleContext.Provider value={{ currentRole, setRole: setRoleId, isAnalyst: roleId === "analyst" }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
