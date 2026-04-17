import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useStateSelection } from "./StateContext";
import type { StateId } from "@/data/mockData";

export type RoleType = string;

export interface RoleInfo {
  id: RoleType;
  label: string;
  scope: "state" | "district" | "block" | "municipality";
  location: string;
  roleName: string;
  userName: string;
  stateId: StateId;
  /** Geo bindings for FilterContext */
  district?: string;
  block?: string;
  areaType?: "urban" | "rural" | "all";
}

// ──────────────── Per-state roles ────────────────
const apRoles: RoleInfo[] = [
  { id: "ap_state", stateId: "andhra_pradesh", label: "State Surveillance Officer", scope: "state", location: "Andhra Pradesh", roleName: "State Officer", userName: "Dr Subramanieswari" },
  { id: "ap_d_vizag", stateId: "andhra_pradesh", label: "District — Visakhapatnam", scope: "district", location: "Visakhapatnam", roleName: "DHO", userName: "Lakshmi Prasad", district: "Visakhapatnam" },
  { id: "ap_d_guntur", stateId: "andhra_pradesh", label: "District — Guntur", scope: "district", location: "Guntur", roleName: "DHO", userName: "Ravi Reddy", district: "Guntur" },
  { id: "ap_d_kurnool", stateId: "andhra_pradesh", label: "District — Kurnool", scope: "district", location: "Kurnool", roleName: "DHO", userName: "Sudha Naidu", district: "Kurnool" },
  { id: "ap_b_bheem", stateId: "andhra_pradesh", label: "Block — Bheemunipatnam", scope: "block", location: "Bheemunipatnam", roleName: "Block Worker", userName: "Satya Murthy", district: "Visakhapatnam", block: "Bheemunipatnam" },
  { id: "ap_b_anak", stateId: "andhra_pradesh", label: "Block — Anakapalle", scope: "block", location: "Anakapalle", roleName: "Block Worker", userName: "Anitha Kumari", district: "Visakhapatnam", block: "Anakapalle" },
  { id: "ap_b_tenali", stateId: "andhra_pradesh", label: "Block — Tenali", scope: "block", location: "Tenali", roleName: "Block Worker", userName: "Prasad Varma", district: "Guntur", block: "Tenali" },
  { id: "ap_m_vizag", stateId: "andhra_pradesh", label: "Municipality — Visakhapatnam MC", scope: "municipality", location: "Visakhapatnam MC", roleName: "Municipal Officer", userName: "Padmavathi", district: "Visakhapatnam", block: "Vizag MC", areaType: "urban" },
  { id: "ap_m_vij", stateId: "andhra_pradesh", label: "Municipality — Vijayawada MC", scope: "municipality", location: "Vijayawada MC", roleName: "Municipal Officer", userName: "Kishore Babu", district: "Krishna", block: "Vijayawada MC", areaType: "urban" },
  { id: "ap_analyst", stateId: "andhra_pradesh", label: "Analyst (Full Access)", scope: "state", location: "Andhra Pradesh", roleName: "Analyst", userName: "Analyst" },
];

const odishaRoles: RoleInfo[] = [
  { id: "od_state", stateId: "odisha", label: "State Surveillance Officer", scope: "state", location: "Odisha", roleName: "State Officer", userName: "Dr Shubhashis Mohanty" },
  { id: "od_d_khurda", stateId: "odisha", label: "District — Khurda", scope: "district", location: "Khurda", roleName: "DHO", userName: "P. Mohanty", district: "Khurda" },
  { id: "od_d_puri", stateId: "odisha", label: "District — Puri", scope: "district", location: "Puri", roleName: "DHO", userName: "R. Das", district: "Puri" },
  { id: "od_d_bal", stateId: "odisha", label: "District — Balasore", scope: "district", location: "Balasore", roleName: "DHO", userName: "A. Sahu", district: "Balasore" },
  { id: "od_d_angul", stateId: "odisha", label: "District — Angul", scope: "district", location: "Angul", roleName: "DHO", userName: "N. Pradhan", district: "Angul" },
  { id: "od_d_cut", stateId: "odisha", label: "District — Cuttack", scope: "district", location: "Cuttack", roleName: "DHO", userName: "T. Behera", district: "Cuttack" },
  { id: "od_d_sam", stateId: "odisha", label: "District — Sambalpur", scope: "district", location: "Sambalpur", roleName: "DHO", userName: "S. Pattnaik", district: "Sambalpur" },
  { id: "od_d_sun", stateId: "odisha", label: "District — Sundargarh", scope: "district", location: "Sundargarh", roleName: "DHO", userName: "M. Naik", district: "Sundargarh" },
  { id: "od_d_gan", stateId: "odisha", label: "District — Ganjam", scope: "district", location: "Ganjam", roleName: "DHO", userName: "D. Panigrahi", district: "Ganjam" },
  { id: "od_b_brah", stateId: "odisha", label: "Block — Brahmagiri", scope: "block", location: "Brahmagiri", roleName: "Block Worker", userName: "B. Rout", district: "Puri", block: "Brahmagiri" },
  { id: "od_b_tal", stateId: "odisha", label: "Block — Talcher", scope: "block", location: "Talcher", roleName: "Block Worker", userName: "G. Swain", district: "Angul", block: "Talcher" },
  { id: "od_b_nil", stateId: "odisha", label: "Block — Nilgiri", scope: "block", location: "Nilgiri", roleName: "Block Worker", userName: "J. Nayak", district: "Balasore", block: "Nilgiri" },
  { id: "od_m_bbsr", stateId: "odisha", label: "Municipality — Bhubaneswar MC", scope: "municipality", location: "Bhubaneswar MC", roleName: "Municipal Officer", userName: "P. Sethi", district: "Khurda", block: "Bhubaneswar MC", areaType: "urban" },
  { id: "od_m_cut", stateId: "odisha", label: "Municipality — Cuttack MC", scope: "municipality", location: "Cuttack MC", roleName: "Municipal Officer", userName: "K. Kar", district: "Cuttack", block: "Cuttack MC", areaType: "urban" },
  { id: "od_m_rkl", stateId: "odisha", label: "Municipality — Rourkela MC", scope: "municipality", location: "Rourkela MC", roleName: "Municipal Officer", userName: "R. Minz", district: "Sundargarh", block: "Rourkela MC", areaType: "urban" },
  { id: "od_m_sam", stateId: "odisha", label: "Municipality — Sambalpur MC", scope: "municipality", location: "Sambalpur MC", roleName: "Municipal Officer", userName: "S. Pradhan", district: "Sambalpur", block: "Sambalpur MC", areaType: "urban" },
  { id: "od_analyst", stateId: "odisha", label: "Analyst (Full Access)", scope: "state", location: "Odisha", roleName: "Analyst", userName: "Analyst" },
];

const karnatakaRoles: RoleInfo[] = [
  { id: "ka_state", stateId: "karnataka", label: "State Surveillance Officer", scope: "state", location: "Karnataka", roleName: "State Officer", userName: "Dr Shariff" },
  { id: "ka_d_blr", stateId: "karnataka", label: "District — Bengaluru Urban", scope: "district", location: "Bengaluru Urban", roleName: "DHO", userName: "Meena Rao", district: "Bengaluru Urban" },
  { id: "ka_d_mys", stateId: "karnataka", label: "District — Mysuru", scope: "district", location: "Mysuru", roleName: "DHO", userName: "Raghavendra H", district: "Mysuru" },
  { id: "ka_d_bel", stateId: "karnataka", label: "District — Belagavi", scope: "district", location: "Belagavi", roleName: "DHO", userName: "N. Prakash", district: "Belagavi" },
  { id: "ka_d_udu", stateId: "karnataka", label: "District — Udupi", scope: "district", location: "Udupi", roleName: "DHO", userName: "Usha Pai", district: "Udupi" },
  { id: "ka_b_yel", stateId: "karnataka", label: "Block — Yelahanka", scope: "block", location: "Yelahanka", roleName: "Block Worker", userName: "Ashwini K", district: "Bengaluru Urban", block: "Yelahanka" },
  { id: "ka_b_nan", stateId: "karnataka", label: "Block — Nanjangud", scope: "block", location: "Nanjangud", roleName: "Block Worker", userName: "Harish P", district: "Mysuru", block: "Nanjangud" },
  { id: "ka_b_kun", stateId: "karnataka", label: "Block — Kundapura", scope: "block", location: "Kundapura", roleName: "Block Worker", userName: "Ramesh Shetty", district: "Udupi", block: "Kundapura" },
  { id: "ka_m_bbmp", stateId: "karnataka", label: "Municipality — BBMP East Zone", scope: "municipality", location: "BBMP East Zone", roleName: "Municipal Officer", userName: "Savita M", district: "Bengaluru Urban", block: "BBMP East Zone", areaType: "urban" },
  { id: "ka_m_mys", stateId: "karnataka", label: "Municipality — Mysuru City", scope: "municipality", location: "Mysuru City", roleName: "Municipal Officer", userName: "Vinay S", district: "Mysuru", block: "Mysuru City", areaType: "urban" },
  { id: "ka_m_udu", stateId: "karnataka", label: "Municipality — Udupi City", scope: "municipality", location: "Udupi City", roleName: "Municipal Officer", userName: "Deepa U", district: "Udupi", block: "Udupi City", areaType: "urban" },
  { id: "ka_analyst", stateId: "karnataka", label: "Analyst (Full Access)", scope: "state", location: "Karnataka", roleName: "Analyst", userName: "Analyst" },
];

export const allRoles: RoleInfo[] = [...apRoles, ...odishaRoles, ...karnatakaRoles];

export function getRolesForState(stateId: StateId): RoleInfo[] {
  return allRoles.filter((r) => r.stateId === stateId);
}

// Backwards-compat export (some screens may import `roles`)
export const roles = allRoles;

interface RoleContextType {
  currentRole: RoleInfo;
  setRole: (id: RoleType) => void;
  isAnalyst: boolean;
  availableRoles: RoleInfo[];
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const { stateId } = useStateSelection();
  const availableRoles = getRolesForState(stateId);
  const [roleId, setRoleId] = useState<RoleType>(availableRoles[0].id);

  // When state changes, reset role to that state's first role
  useEffect(() => {
    const list = getRolesForState(stateId);
    if (!list.find((r) => r.id === roleId)) {
      setRoleId(list[0].id);
    }
  }, [stateId, roleId]);

  const currentRole = availableRoles.find((r) => r.id === roleId) || availableRoles[0];

  return (
    <RoleContext.Provider value={{ currentRole, setRole: setRoleId, isAnalyst: currentRole.roleName === "Analyst", availableRoles }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
