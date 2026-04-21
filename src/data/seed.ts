// Canonical seed dataset for the Vector-Borne Disease EWS demo.
// All tabs derive case/forecast/signal/action data from this seed.
// Non-seeded districts in the wider state lists fall back to synthesized baseline values.

export type SeedRisk = "low" | "moderate" | "high";
export type SeedSignal =
  | "new_emergence"
  | "rising_cluster"
  | "persistent"
  | "stable_low"
  | "moderate";

export interface SeedForecast {
  w1_probability: number;
  w2_probability: number;
  w3_probability: number;
  w4_probability: number;
  expected_peak_week: string;
  signal_text: string;
}

export interface SeedWard {
  name: string;
  lat: number;
  lng: number;
  cases_2w: number;
  cases_4w: number;
  signal: SeedSignal;
  risk: SeedRisk;
  daily_14d?: number[];
}

export interface SeedMunicipality {
  name: string;
  lat: number;
  lng: number;
  cases_2w: number;
  cases_4w: number;
  risk: SeedRisk;
  signal?: SeedSignal;
  daily_14d?: number[];
  wards?: SeedWard[];
}

export interface SeedVillage {
  name: string;
  lat: number;
  lng: number;
  cases_2w: number;
  cases_4w: number;
  signal: SeedSignal;
  risk: SeedRisk;
}

export interface SeedBlock {
  name: string;
  lat: number;
  lng: number;
  cases_2w: number;
  cases_4w: number;
  signal: SeedSignal;
  risk: SeedRisk;
  daily_14d?: number[];
  villages?: SeedVillage[];
}

export interface SeedDistrict {
  name: string;
  lat: number;
  lng: number;
  cases_2w: number;
  cases_4w: number;
  signal: SeedSignal;
  context: string;
  risk: SeedRisk;
  forecast?: SeedForecast;
  daily_14d?: number[];
  actions?: string[];
  municipalities?: SeedMunicipality[];
  blocks?: SeedBlock[];
}

export interface SeedSignalEntry {
  title: string;
  geography: string;
  type: string;
}

export interface SeedKpis {
  suspected: number;
  tested: number;
  confirmed: number;
}

export interface SeedState {
  name: string;
  code: string;
  lat: number;
  lng: number;
  disease: string;
  kpis: SeedKpis;
  signals: SeedSignalEntry[];
  districts: SeedDistrict[];
}

export interface SeedUser {
  name: string;
  role: string;
  scope_level: "state" | "district" | "block" | "municipality" | "all";
  scope_name: string;
}

export interface SeedRiskThresholds {
  low: { min: number; max: number };
  moderate: { min: number; max: number };
  high: { min: number; max: number };
}

export interface SeedMeta {
  product_name: string;
  default_state: string;
  supported_diseases: string[];
  notes: string[];
  risk_thresholds: SeedRiskThresholds;
  signal_patterns: Record<string, string>;
}

export interface SeedRoot {
  meta: SeedMeta;
  users: Record<string, SeedUser[]>;
  states: SeedState[];
}

// ──────────────── DATA ────────────────
export const seed: SeedRoot = {
  meta: {
    product_name: "Early Warning System for Vector-Borne Diseases",
    default_state: "Odisha",
    supported_diseases: ["Dengue", "Malaria", "Chikungunya", "Other VBDs"],
    notes: [
      "All coordinates are approximate centroids for demo use.",
      "Non-focus districts use low baseline values (5-15 cases) to avoid empty maps.",
      "Risk logic is demo-oriented and should remain internally consistent across tabs.",
      "Cases represent recent surveillance totals for the selected rolling period, not lifetime totals.",
    ],
    risk_thresholds: {
      low: { min: 0, max: 24 },
      moderate: { min: 25, max: 50 },
      high: { min: 51, max: 9999 },
    },
    signal_patterns: {
      new_emergence: "late_spike",
      rising_cluster: "upward_curve",
      persistent: "flat_noisy_plateau",
      stable_low: "low_flat",
    },
  },
  users: {
    "Andhra Pradesh": [
      { name: "Dr Subramanieswari", role: "State Surveillance Officer", scope_level: "state", scope_name: "Andhra Pradesh" },
      { name: "Lakshmi Prasad", role: "District Officer", scope_level: "district", scope_name: "Visakhapatnam" },
      { name: "Ravi Reddy", role: "District Officer", scope_level: "district", scope_name: "Guntur" },
      { name: "Sudha Naidu", role: "District Officer", scope_level: "district", scope_name: "Kurnool" },
      { name: "Satya Murthy", role: "Block Officer", scope_level: "block", scope_name: "Bheemunipatnam" },
      { name: "Anitha Kumari", role: "Block Officer", scope_level: "block", scope_name: "Anakapalle" },
      { name: "Prasad Varma", role: "Block Officer", scope_level: "block", scope_name: "Tenali" },
      { name: "Padmavathi", role: "Municipality Officer", scope_level: "municipality", scope_name: "Visakhapatnam MC" },
      { name: "Kishore Babu", role: "Municipality Officer", scope_level: "municipality", scope_name: "Vijayawada MC" },
      { name: "Analyst", role: "Analyst", scope_level: "all", scope_name: "Full Access" },
    ],
    Odisha: [
      { name: "Dr Shubhashis Mohanty", role: "State Surveillance Officer", scope_level: "state", scope_name: "Odisha" },
      { name: "P. Mohanty", role: "District Officer", scope_level: "district", scope_name: "Khurda" },
      { name: "R. Das", role: "District Officer", scope_level: "district", scope_name: "Puri" },
      { name: "A. Sahu", role: "District Officer", scope_level: "district", scope_name: "Balasore" },
      { name: "N. Pradhan", role: "District Officer", scope_level: "district", scope_name: "Angul" },
      { name: "T. Behera", role: "District Officer", scope_level: "district", scope_name: "Cuttack" },
      { name: "S. Pattnaik", role: "District Officer", scope_level: "district", scope_name: "Sambalpur" },
      { name: "M. Naik", role: "District Officer", scope_level: "district", scope_name: "Sundargarh" },
      { name: "D. Panigrahi", role: "District Officer", scope_level: "district", scope_name: "Ganjam" },
      { name: "B. Rout", role: "Block Officer", scope_level: "block", scope_name: "Brahmagiri" },
      { name: "G. Swain", role: "Block Officer", scope_level: "block", scope_name: "Talcher" },
      { name: "J. Nayak", role: "Block Officer", scope_level: "block", scope_name: "Nilgiri" },
      { name: "P. Sethi", role: "Municipality Officer", scope_level: "municipality", scope_name: "Bhubaneswar MC" },
      { name: "K. Kar", role: "Municipality Officer", scope_level: "municipality", scope_name: "Cuttack MC" },
      { name: "R. Minz", role: "Municipality Officer", scope_level: "municipality", scope_name: "Rourkela MC" },
      { name: "S. Pradhan", role: "Municipality Officer", scope_level: "municipality", scope_name: "Sambalpur MC" },
      { name: "Analyst", role: "Analyst", scope_level: "all", scope_name: "Full Access" },
    ],
    Karnataka: [
      { name: "Dr Shariff", role: "State Surveillance Officer", scope_level: "state", scope_name: "Karnataka" },
      { name: "Meena Rao", role: "District Officer", scope_level: "district", scope_name: "Bengaluru Urban" },
      { name: "Raghavendra H", role: "District Officer", scope_level: "district", scope_name: "Mysuru" },
      { name: "N. Prakash", role: "District Officer", scope_level: "district", scope_name: "Belagavi" },
      { name: "Usha Pai", role: "District Officer", scope_level: "district", scope_name: "Udupi" },
      { name: "Ashwini K", role: "Block Officer", scope_level: "block", scope_name: "Yelahanka" },
      { name: "Harish P", role: "Block Officer", scope_level: "block", scope_name: "Nanjangud" },
      { name: "Ramesh Shetty", role: "Block Officer", scope_level: "block", scope_name: "Kundapura" },
      { name: "Savita M", role: "Municipality Officer", scope_level: "municipality", scope_name: "BBMP East Zone" },
      { name: "Vinay S", role: "Municipality Officer", scope_level: "municipality", scope_name: "Mysuru City" },
      { name: "Deepa U", role: "Municipality Officer", scope_level: "municipality", scope_name: "Udupi City" },
      { name: "Analyst", role: "Analyst", scope_level: "all", scope_name: "Full Access" },
    ],
  },
  states: [
    {
      name: "Andhra Pradesh", code: "AP", lat: 15.9129, lng: 79.74, disease: "Dengue",
      kpis: { suspected: 1240, tested: 910, confirmed: 287 },
      signals: [
        { title: "Clustering of fever cases reported in Visakhapatnam urban wards", geography: "Visakhapatnam", type: "urban_cluster" },
        { title: "Increased mosquito breeding observed along canal networks in Guntur district", geography: "Guntur", type: "irrigation_breeding" },
        { title: "Rural blocks in Kurnool reporting gradual increase in fever cases", geography: "Kurnool", type: "rural_spread" },
      ],
      districts: [
        {
          name: "Visakhapatnam", lat: 17.6868, lng: 83.2185, cases_2w: 65, cases_4w: 112,
          signal: "rising_cluster", context: "urban_dense", risk: "high",
          forecast: { w1_probability: 0.68, w2_probability: 0.79, w3_probability: 0.74, w4_probability: 0.61, expected_peak_week: "W+2", signal_text: "High risk due to urban clustering (Vizag)" },
          daily_14d: [2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 22, 25],
          actions: [
            "Ward-level fogging in Gajuwaka and MVP Colony",
            "Drainage clearing in dense urban wards",
            "Community awareness drives in high-incidence neighborhoods",
          ],
          municipalities: [
            {
              name: "Visakhapatnam MC", lat: 17.7102, lng: 83.307, cases_2w: 44, cases_4w: 76, risk: "high",
              wards: [
                { name: "MVP Colony", lat: 17.7402, lng: 83.331, cases_2w: 18, cases_4w: 31, signal: "rising_cluster", risk: "high", daily_14d: [1, 1, 2, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
                { name: "Gajuwaka", lat: 17.685, lng: 83.207, cases_2w: 16, cases_4w: 29, signal: "rising_cluster", risk: "high", daily_14d: [1, 2, 2, 3, 3, 4, 5, 6, 6, 7, 8, 9, 10, 11] },
                { name: "Dwaraka Nagar", lat: 17.723, lng: 83.309, cases_2w: 10, cases_4w: 16, signal: "moderate", risk: "moderate", daily_14d: [0, 1, 0, 1, 1, 2, 1, 2, 2, 1, 2, 1, 1, 1] },
              ],
            },
          ],
          blocks: [
            {
              name: "Bheemunipatnam", lat: 17.8902, lng: 83.4523, cases_2w: 12, cases_4w: 20, signal: "moderate", risk: "moderate",
              villages: [
                { name: "Kapuluppada", lat: 17.827, lng: 83.387, cases_2w: 4, cases_4w: 7, signal: "new_emergence", risk: "low" },
                { name: "Paradesipalem", lat: 17.779, lng: 83.357, cases_2w: 5, cases_4w: 8, signal: "moderate", risk: "low" },
                { name: "Thotlakonda", lat: 17.815, lng: 83.391, cases_2w: 3, cases_4w: 5, signal: "new_emergence", risk: "low" },
              ],
            },
            { name: "Anakapalle", lat: 17.6913, lng: 83.0023, cases_2w: 9, cases_4w: 16, signal: "stable_low", risk: "low" },
            { name: "Gajuwaka Rural", lat: 17.669, lng: 83.185, cases_2w: 7, cases_4w: 12, signal: "stable_low", risk: "low" },
          ],
        },
        {
          name: "Guntur", lat: 16.3067, lng: 80.4365, cases_2w: 31, cases_4w: 56, signal: "moderate", context: "irrigation_rural", risk: "moderate",
          forecast: { w1_probability: 0.49, w2_probability: 0.57, w3_probability: 0.61, w4_probability: 0.54, expected_peak_week: "W+3", signal_text: "Moderate risk due to irrigation-driven breeding (Guntur)" },
          daily_14d: [4, 5, 3, 6, 5, 4, 6, 5, 4, 5, 6, 4, 5, 4],
          actions: [
            "Canal-side source reduction in Tenali and Amaravathi belt",
            "Village-level larval surveys in irrigation-linked settlements",
            "Fever camps in moderate-risk rural clusters",
          ],
          municipalities: [
            {
              name: "Mangalagiri Municipality", lat: 16.4304, lng: 80.5681, cases_2w: 10, cases_4w: 17, risk: "low",
              wards: [
                { name: "Mangalagiri Ward 3", lat: 16.4315, lng: 80.566, cases_2w: 3, cases_4w: 5, signal: "new_emergence", risk: "low" },
                { name: "Mangalagiri Ward 7", lat: 16.4298, lng: 80.569, cases_2w: 4, cases_4w: 6, signal: "moderate", risk: "low" },
                { name: "Mangalagiri Ward 12", lat: 16.4284, lng: 80.5711, cases_2w: 3, cases_4w: 6, signal: "moderate", risk: "low" },
              ],
            },
          ],
          blocks: [
            {
              name: "Tenali", lat: 16.239, lng: 80.645, cases_2w: 13, cases_4w: 24, signal: "moderate", risk: "moderate",
              villages: [
                { name: "Kollipara", lat: 16.265, lng: 80.607, cases_2w: 5, cases_4w: 9, signal: "moderate", risk: "low" },
                { name: "Pedaravuru", lat: 16.231, lng: 80.626, cases_2w: 4, cases_4w: 8, signal: "moderate", risk: "low" },
                { name: "Angalakuduru", lat: 16.246, lng: 80.659, cases_2w: 4, cases_4w: 7, signal: "moderate", risk: "low" },
              ],
            },
            { name: "Amaravathi", lat: 16.573, lng: 80.357, cases_2w: 5, cases_4w: 9, signal: "stable_low", risk: "low" },
            { name: "Mangalagiri Rural", lat: 16.401, lng: 80.561, cases_2w: 3, cases_4w: 6, signal: "stable_low", risk: "low" },
          ],
        },
        {
          name: "Kurnool", lat: 15.8281, lng: 78.0373, cases_2w: 28, cases_4w: 46, signal: "moderate", context: "mixed_rural_urban", risk: "moderate",
          forecast: { w1_probability: 0.42, w2_probability: 0.49, w3_probability: 0.53, w4_probability: 0.48, expected_peak_week: "W+3", signal_text: "Rising risk due to rural spread (Kurnool)" },
          actions: [
            "Block-level surveillance in moderate-risk rural blocks",
            "Primary health center preparedness",
            "Targeted awareness campaigns in affected settlements",
          ],
          municipalities: [
            {
              name: "Kurnool Municipality", lat: 15.8281, lng: 78.0373, cases_2w: 8, cases_4w: 14, risk: "low",
              wards: [
                { name: "Kallur Ward", lat: 15.841, lng: 78.018, cases_2w: 3, cases_4w: 5, signal: "new_emergence", risk: "low" },
                { name: "Budhwarpet", lat: 15.826, lng: 78.043, cases_2w: 2, cases_4w: 4, signal: "stable_low", risk: "low" },
                { name: "Nandyal Town Ward", lat: 15.477, lng: 78.483, cases_2w: 3, cases_4w: 5, signal: "moderate", risk: "low" },
              ],
            },
          ],
          blocks: [
            { name: "Nandyal", lat: 15.477, lng: 78.483, cases_2w: 8, cases_4w: 14, signal: "moderate", risk: "low" },
            { name: "Adoni", lat: 15.631, lng: 77.274, cases_2w: 7, cases_4w: 12, signal: "moderate", risk: "low" },
            { name: "Kallur", lat: 15.82, lng: 78.01, cases_2w: 5, cases_4w: 8, signal: "new_emergence", risk: "low" },
          ],
        },
        {
          name: "Krishna", lat: 16.174, lng: 81.134, cases_2w: 49, cases_4w: 81, signal: "rising_cluster", context: "urban_periurban", risk: "moderate",
          forecast: { w1_probability: 0.59, w2_probability: 0.66, w3_probability: 0.63, w4_probability: 0.55, expected_peak_week: "W+2", signal_text: "Moderate-to-high risk due to sustained urban/peri-urban spread" },
        },
        {
          name: "East Godavari", lat: 17.233, lng: 81.722, cases_2w: 47, cases_4w: 76, signal: "persistent", context: "mixed", risk: "moderate",
          forecast: { w1_probability: 0.52, w2_probability: 0.55, w3_probability: 0.57, w4_probability: 0.5, expected_peak_week: "W+3", signal_text: "Persistent moderate risk driven by ongoing transmission" },
        },
        {
          name: "West Godavari", lat: 16.71, lng: 81.1, cases_2w: 12, cases_4w: 21, signal: "stable_low", context: "baseline", risk: "low",
          forecast: { w1_probability: 0.21, w2_probability: 0.24, w3_probability: 0.22, w4_probability: 0.2, expected_peak_week: "W+2", signal_text: "Low baseline risk" },
        },
      ],
    },
    {
      name: "Odisha", code: "OD", lat: 20.9517, lng: 85.0985, disease: "Dengue",
      kpis: { suspected: 980, tested: 710, confirmed: 236 },
      signals: [
        { title: "Tourist influx contributing to risk in Puri", geography: "Puri", type: "mobility" },
        { title: "Industrial worker clustering in Sundargarh", geography: "Sundargarh", type: "industrial" },
        { title: "High case load observed in Balasore", geography: "Balasore", type: "high_caseload" },
      ],
      districts: [
        {
          name: "Khurda", lat: 20.185, lng: 85.622, cases_2w: 18, cases_4w: 38, signal: "moderate", context: "urban", risk: "moderate",
          municipalities: [
            {
              name: "Bhubaneswar MC", lat: 20.2961, lng: 85.8245, cases_2w: 15, cases_4w: 30, risk: "moderate",
              wards: [
                { name: "Saheed Nagar", lat: 20.2967, lng: 85.8465, cases_2w: 6, cases_4w: 11, signal: "moderate", risk: "low" },
                { name: "Nayapalli", lat: 20.2905, lng: 85.8052, cases_2w: 5, cases_4w: 10, signal: "moderate", risk: "low" },
                { name: "Patia", lat: 20.3548, lng: 85.8266, cases_2w: 4, cases_4w: 9, signal: "new_emergence", risk: "low" },
              ],
            },
          ],
          blocks: [
            { name: "Jatni", lat: 20.1596, lng: 85.7074, cases_2w: 5, cases_4w: 9, signal: "stable_low", risk: "low" },
            { name: "Balianta", lat: 20.246, lng: 85.876, cases_2w: 4, cases_4w: 8, signal: "stable_low", risk: "low" },
            { name: "Balipatna", lat: 20.157, lng: 85.942, cases_2w: 4, cases_4w: 7, signal: "stable_low", risk: "low" },
          ],
        },
        {
          name: "Cuttack", lat: 20.4625, lng: 85.8828, cases_2w: 8, cases_4w: 15, signal: "stable_low", context: "baseline", risk: "low",
          municipalities: [
            {
              name: "Cuttack MC", lat: 20.4625, lng: 85.8828, cases_2w: 5, cases_4w: 10, risk: "low",
              wards: [
                { name: "Badambadi", lat: 20.467, lng: 85.893, cases_2w: 2, cases_4w: 4, signal: "stable_low", risk: "low" },
                { name: "Mangalabag", lat: 20.4605, lng: 85.89, cases_2w: 2, cases_4w: 3, signal: "stable_low", risk: "low" },
                { name: "CDA Sector", lat: 20.485, lng: 85.84, cases_2w: 1, cases_4w: 3, signal: "new_emergence", risk: "low" },
              ],
            },
          ],
        },
        {
          name: "Puri", lat: 19.8135, lng: 85.8312, cases_2w: 12, cases_4w: 32, signal: "new_emergence", context: "coastal_mobility", risk: "moderate",
          forecast: { w1_probability: 0.53, w2_probability: 0.72, w3_probability: 0.77, w4_probability: 0.64, expected_peak_week: "W+3", signal_text: "High risk due to mobility + climate, despite lower current cases" },
          daily_14d: [0, 0, 1, 0, 0, 2, 1, 3, 2, 4, 3, 5, 4, 6],
          actions: [
            "Coastal surveillance near tourist-heavy zones",
            "Larval survey in Satapada and surrounding villages",
            "Tourist zone sanitation and fever screening",
          ],
          municipalities: [
            {
              name: "Puri Municipality", lat: 19.8135, lng: 85.8312, cases_2w: 6, cases_4w: 13, risk: "low",
              wards: [
                { name: "Baliapanda", lat: 19.798, lng: 85.83, cases_2w: 2, cases_4w: 5, signal: "new_emergence", risk: "low" },
                { name: "Chakratirtha", lat: 19.808, lng: 85.837, cases_2w: 2, cases_4w: 4, signal: "new_emergence", risk: "low" },
                { name: "Swargadwar", lat: 19.797, lng: 85.824, cases_2w: 2, cases_4w: 4, signal: "stable_low", risk: "low" },
              ],
            },
          ],
          blocks: [
            { name: "Puri Sadar", lat: 19.842, lng: 85.844, cases_2w: 4, cases_4w: 8, signal: "stable_low", risk: "low" },
            {
              name: "Brahmagiri", lat: 19.827, lng: 85.551, cases_2w: 5, cases_4w: 10, signal: "new_emergence", risk: "low",
              villages: [
                { name: "Satapada", lat: 19.831, lng: 85.382, cases_2w: 3, cases_4w: 6, signal: "new_emergence", risk: "low" },
                { name: "Bentapur", lat: 19.844, lng: 85.517, cases_2w: 1, cases_4w: 2, signal: "new_emergence", risk: "low" },
                { name: "Gopinathpur", lat: 19.853, lng: 85.575, cases_2w: 1, cases_4w: 2, signal: "stable_low", risk: "low" },
              ],
            },
            { name: "Kanas", lat: 19.956, lng: 85.733, cases_2w: 3, cases_4w: 5, signal: "stable_low", risk: "low" },
          ],
        },
        {
          name: "Angul", lat: 20.8409, lng: 85.1511, cases_2w: 13, cases_4w: 26, signal: "moderate", context: "industrial", risk: "moderate",
          forecast: { w1_probability: 0.38, w2_probability: 0.43, w3_probability: 0.47, w4_probability: 0.41, expected_peak_week: "W+3", signal_text: "Moderate industrial-cluster risk" },
          actions: [
            "Industrial sanitation drives in worker settlements",
            "Worker health screening near industrial clusters",
            "Targeted container breeding checks",
          ],
        },
        {
          name: "Balasore", lat: 21.4942, lng: 86.9312, cases_2w: 64, cases_4w: 115, signal: "rising_cluster", context: "high_caseload", risk: "high",
          forecast: { w1_probability: 0.69, w2_probability: 0.82, w3_probability: 0.85, w4_probability: 0.71, expected_peak_week: "W+3", signal_text: "High risk due to sustained case load + trend" },
          daily_14d: [8, 10, 12, 13, 14, 16, 18, 19, 21, 23, 25, 27, 29, 31],
          actions: [
            "Intensive fogging in identified hotspots",
            "Hospital preparedness for sustained case rise",
            "Focused vector control in high-case localities",
          ],
        },
        { name: "Ganjam", lat: 19.3149, lng: 84.7941, cases_2w: 10, cases_4w: 19, signal: "stable_low", context: "baseline", risk: "low" },
        { name: "Sambalpur", lat: 21.4669, lng: 83.9812, cases_2w: 7, cases_4w: 13, signal: "stable_low", context: "baseline", risk: "low" },
        {
          name: "Sundargarh", lat: 22.1164, lng: 84.033, cases_2w: 22, cases_4w: 41, signal: "rising_cluster", context: "industrial_worker_settlement", risk: "moderate",
          forecast: { w1_probability: 0.44, w2_probability: 0.56, w3_probability: 0.61, w4_probability: 0.52, expected_peak_week: "W+3", signal_text: "Localized outbreak risk due to industrial clustering" },
          actions: [
            "Fogging in Chhend and Panposh wards",
            "Worker health screening camps near industrial belt",
            "Drainage clearance near plant-linked settlements",
          ],
          municipalities: [
            {
              name: "Rourkela MC", lat: 22.2604, lng: 84.8536, cases_2w: 16, cases_4w: 30, risk: "moderate",
              wards: [
                { name: "Uditnagar", lat: 22.242, lng: 84.857, cases_2w: 4, cases_4w: 7, signal: "moderate", risk: "low" },
                { name: "Chhend", lat: 22.289, lng: 84.873, cases_2w: 5, cases_4w: 10, signal: "rising_cluster", risk: "low" },
                { name: "Panposh", lat: 22.255, lng: 84.86, cases_2w: 7, cases_4w: 13, signal: "rising_cluster", risk: "moderate" },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "Karnataka", code: "KA", lat: 15.3173, lng: 75.7139, disease: "Dengue",
      kpis: { suspected: 1115, tested: 835, confirmed: 264 },
      signals: [
        { title: "Construction-site breeding concerns reported in Bengaluru urban wards", geography: "Bengaluru Urban", type: "construction" },
        { title: "Rain-linked increase in case reports from Mysuru outskirts", geography: "Mysuru", type: "periurban" },
        { title: "Post-rainfall mosquito breeding reported in coastal Udupi belt", geography: "Udupi", type: "coastal_rainfall" },
      ],
      districts: [
        {
          name: "Bengaluru Urban", lat: 12.9716, lng: 77.5946, cases_2w: 72, cases_4w: 126, signal: "rising_cluster", context: "urban", risk: "high",
          forecast: { w1_probability: 0.61, w2_probability: 0.68, w3_probability: 0.64, w4_probability: 0.58, expected_peak_week: "W+2", signal_text: "Moderate-to-high urban clustering risk" },
          actions: [
            "Construction-site inspections in high-risk wards",
            "Ward surveillance and fogging in dense localities",
            "Drainage and stagnant water checks",
          ],
          municipalities: [
            {
              name: "BBMP East Zone", lat: 12.971, lng: 77.64, cases_2w: 24, cases_4w: 42, signal: "rising_cluster", risk: "moderate",
              daily_14d: [2, 3, 3, 4, 5, 6, 7, 9, 11, 13, 15, 18, 20, 22],
              wards: [
                { name: "Indiranagar", lat: 12.9784, lng: 77.6408, cases_2w: 8, cases_4w: 14, signal: "rising_cluster", risk: "low" },
                { name: "CV Raman Nagar", lat: 12.9852, lng: 77.6631, cases_2w: 7, cases_4w: 13, signal: "moderate", risk: "low" },
                { name: "Mahadevapura", lat: 12.991, lng: 77.695, cases_2w: 9, cases_4w: 15, signal: "rising_cluster", risk: "low" },
              ],
            },
            {
              name: "BBMP South Zone", lat: 12.9, lng: 77.6, cases_2w: 22, cases_4w: 40, signal: "persistent", risk: "moderate",
              daily_14d: [12, 13, 11, 12, 13, 12, 14, 13, 12, 13, 12, 14, 13, 12],
            },
          ],
          blocks: [
            { name: "Yelahanka", lat: 13.1007, lng: 77.5963, cases_2w: 9, cases_4w: 18, signal: "new_emergence", risk: "low", daily_14d: [0, 0, 1, 0, 0, 2, 1, 3, 2, 4, 3, 5, 4, 6] },
            { name: "Bengaluru South", lat: 12.9081, lng: 77.593, cases_2w: 14, cases_4w: 24, signal: "moderate", risk: "low" },
            { name: "Anekal", lat: 12.71, lng: 77.7, cases_2w: 13, cases_4w: 25, signal: "rising_cluster", risk: "moderate", daily_14d: [4, 5, 3, 6, 5, 4, 6, 5, 4, 5, 6, 4, 5, 4] },
          ],
        },
        {
          name: "Mysuru", lat: 12.2958, lng: 76.6394, cases_2w: 9, cases_4w: 18, signal: "stable_low", context: "periurban", risk: "low",
          forecast: { w1_probability: 0.24, w2_probability: 0.28, w3_probability: 0.32, w4_probability: 0.27, expected_peak_week: "W+3", signal_text: "Low-to-moderate peri-urban spread" },
        },
        {
          name: "Belagavi", lat: 15.8497, lng: 74.4977, cases_2w: 11, cases_4w: 22, signal: "stable_low", context: "rural", risk: "low",
          forecast: { w1_probability: 0.23, w2_probability: 0.26, w3_probability: 0.29, w4_probability: 0.24, expected_peak_week: "W+3", signal_text: "Low baseline rural vector pattern" },
        },
        {
          name: "Udupi", lat: 13.3409, lng: 74.7421, cases_2w: 26, cases_4w: 43, signal: "moderate", context: "coastal_rainfall", risk: "moderate",
          forecast: { w1_probability: 0.46, w2_probability: 0.69, w3_probability: 0.72, w4_probability: 0.58, expected_peak_week: "W+3", signal_text: "High risk due to recent rainfall + humidity spike" },
          daily_14d: [4, 5, 3, 6, 5, 4, 6, 5, 4, 5, 6, 4, 5, 4],
          actions: [
            "Coastal drainage clearing in Udupi belt",
            "Fishing harbor sanitation in Malpe",
            "Ward-level larval surveys in coastal settlements",
          ],
          municipalities: [
            {
              name: "Udupi City", lat: 13.3409, lng: 74.7421, cases_2w: 10, cases_4w: 17, risk: "low",
              wards: [
                { name: "Kunjibettu", lat: 13.348, lng: 74.75, cases_2w: 3, cases_4w: 5, signal: "new_emergence", risk: "low" },
                { name: "Manipal", lat: 13.3532, lng: 74.786, cases_2w: 4, cases_4w: 6, signal: "moderate", risk: "low" },
                { name: "Bannanje", lat: 13.334, lng: 74.743, cases_2w: 3, cases_4w: 6, signal: "moderate", risk: "low" },
              ],
            },
          ],
          blocks: [
            { name: "Udupi", lat: 13.34, lng: 74.74, cases_2w: 7, cases_4w: 12, signal: "moderate", risk: "low" },
            {
              name: "Kundapura", lat: 13.6316, lng: 74.6902, cases_2w: 5, cases_4w: 9, signal: "moderate", risk: "low",
              villages: [
                { name: "Malpe", lat: 13.349, lng: 74.689, cases_2w: 2, cases_4w: 4, signal: "new_emergence", risk: "low" },
                { name: "Brahmavara", lat: 13.255, lng: 74.749, cases_2w: 2, cases_4w: 3, signal: "moderate", risk: "low" },
                { name: "Hebri", lat: 13.315, lng: 74.993, cases_2w: 1, cases_4w: 2, signal: "new_emergence", risk: "low" },
              ],
            },
            { name: "Karkala", lat: 13.2137, lng: 74.9952, cases_2w: 4, cases_4w: 7, signal: "stable_low", risk: "low" },
          ],
        },
      ],
    },
  ],
};

// ──────────────── Convenience helpers ────────────────
export type SeedStateName = "Andhra Pradesh" | "Odisha" | "Karnataka";

const stateIdToSeedName: Record<string, SeedStateName> = {
  andhra_pradesh: "Andhra Pradesh",
  odisha: "Odisha",
  karnataka: "Karnataka",
};

export function getSeedStateById(stateId: string): SeedState | undefined {
  const name = stateIdToSeedName[stateId];
  return seed.states.find((s) => s.name === name);
}

export function getSeedUsersById(stateId: string): SeedUser[] {
  const name = stateIdToSeedName[stateId];
  return seed.users[name] || [];
}

export function getSeedDistrict(stateId: string, districtName: string): SeedDistrict | undefined {
  return getSeedStateById(stateId)?.districts.find((d) => d.name === districtName);
}

export function classifyRisk(cases: number): SeedRisk {
  const t = seed.meta.risk_thresholds;
  if (cases >= t.high.min) return "high";
  if (cases >= t.moderate.min) return "moderate";
  return "low";
}

/**
 * Walk a seeded state and return the daily_14d array for the deepest matching scope.
 * Lookup priority: ward → village → block → municipality → district.
 * Returns undefined when no match (or no daily_14d on the matched node).
 */
export function getSeedDailyDist(
  stateId: string,
  scope: { district?: string; block?: string; ward?: string },
): number[] | undefined {
  const state = getSeedStateById(stateId);
  if (!state) return undefined;
  const districts = scope.district && scope.district !== "All Districts"
    ? state.districts.filter((d) => d.name === scope.district)
    : state.districts;

  const inBlockScope = scope.block && scope.block !== "All Blocks";
  const inWardScope = scope.ward && scope.ward !== "All Wards";

  for (const d of districts) {
    // Ward / village leaf level
    if (inWardScope) {
      for (const m of d.municipalities ?? []) {
        for (const w of m.wards ?? []) if (w.name === scope.ward && w.daily_14d) return w.daily_14d;
      }
      for (const b of d.blocks ?? []) {
        for (const v of b.villages ?? []) if (v.name === scope.ward && (v as { daily_14d?: number[] }).daily_14d) return (v as { daily_14d?: number[] }).daily_14d;
      }
    }
    // Block / municipality level
    if (inBlockScope) {
      for (const b of d.blocks ?? []) if (b.name === scope.block && b.daily_14d) return b.daily_14d;
      for (const m of d.municipalities ?? []) if (m.name === scope.block && m.daily_14d) return m.daily_14d;
    }
    // District level
    if (!inBlockScope && !inWardScope && d.daily_14d) return d.daily_14d;
  }
  return undefined;
}

/** Return the seed forecast block for a district (when scope is at district level). */
export function getSeedForecastForDistrict(stateId: string, districtName: string): SeedForecast | undefined {
  return getSeedDistrict(stateId, districtName)?.forecast;
}

/** Return the curated `actions[]` for a district (when scope is at district level). */
export function getSeedActionsForDistrict(stateId: string, districtName: string): string[] | undefined {
  return getSeedDistrict(stateId, districtName)?.actions;
}

/** Return all seeded districts for a state that have actions[] defined. */
export function getSeededDistrictsWithActions(stateId: string): Array<{ name: string; actions: string[]; risk: SeedRisk; signal: SeedSignal }> {
  const state = getSeedStateById(stateId);
  if (!state) return [];
  return state.districts
    .filter((d) => d.actions && d.actions.length > 0)
    .map((d) => ({ name: d.name, actions: d.actions!, risk: d.risk, signal: d.signal }));
}

// ──────────────── Areas-of-Concern walker ────────────────

export interface SeedConcernNode {
  name: string;
  cases_2w: number;
  cases_4w: number;
  signal: SeedSignal;
  level: "district" | "block" | "ward";
  parent?: string;
  parentDistrict?: string;
}

/**
 * Walk every seeded geography in a state and emit a flat list of nodes
 * (district / block / municipality / ward / village) with their signal.
 * Used by Areas of Concern to guarantee both buckets are populated for
 * every state where the seed defines them — at any zoom level.
 */
export function walkSeedNodes(stateId: string): SeedConcernNode[] {
  const state = getSeedStateById(stateId);
  if (!state) return [];
  const out: SeedConcernNode[] = [];
  for (const d of state.districts) {
    out.push({
      name: d.name,
      cases_2w: d.cases_2w,
      cases_4w: d.cases_4w,
      signal: d.signal,
      level: "district",
    });
    for (const b of d.blocks ?? []) {
      out.push({
        name: b.name,
        cases_2w: b.cases_2w,
        cases_4w: b.cases_4w,
        signal: b.signal,
        level: "block",
        parent: d.name,
        parentDistrict: d.name,
      });
      for (const v of b.villages ?? []) {
        out.push({
          name: v.name,
          cases_2w: v.cases_2w,
          cases_4w: v.cases_4w,
          signal: v.signal,
          level: "ward",
          parent: b.name,
          parentDistrict: d.name,
        });
      }
    }
    for (const m of d.municipalities ?? []) {
      if (m.signal) {
        out.push({
          name: m.name,
          cases_2w: m.cases_2w,
          cases_4w: m.cases_4w,
          signal: m.signal,
          level: "block",
          parent: d.name,
          parentDistrict: d.name,
        });
      }
      for (const w of m.wards ?? []) {
        out.push({
          name: w.name,
          cases_2w: w.cases_2w,
          cases_4w: w.cases_4w,
          signal: w.signal,
          level: "ward",
          parent: m.name,
          parentDistrict: d.name,
        });
      }
    }
  }
  return out;
}
