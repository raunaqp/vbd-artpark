// Single source of truth for thresholds, palettes, and state→method mapping.
// Anything tunable in classification logic must live here, NOT in components.

export const TREND_THRESHOLDS = {
  RISING_RATIO: 1.20,
  FALLING_RATIO: 0.80,
  MIN_CASES_FLOOR: 3,
};

export const NEW_EMERGENCE = {
  PRIOR_MAX_PER_WEEK: 1,
  RECENT_MIN_TOTAL: 3,
  TOP_N: 5,
};

export const RISING_CLUSTER = {
  CHANGE_PCT_THRESHOLD: 50,
  MIN_ABSOLUTE_FLOOR: 5,
  POP_NORMALIZATION: 100_000,
  TOP_N: 5,
};

export const HOTSPOT = {
  WEEKLY_FLOOR: 3,
  MODERATE_CONSEC_WEEKS: 2,
  HIGH_CONSEC_WEEKS: 3,
};

export const STATE_RISK_METHOD = {
  "Andhra Pradesh": "ICMR",
  Karnataka: "WHO",
  Odisha: "WHO",
} as const;

export const WHO_RISK_LEVELS = ["Low", "Moderate", "High", "Very High"] as const;
export const ICMR_RISK_LEVELS = ["Low", "Caution", "High Risk", "Critical"] as const;

export const RISK_COLORS = {
  level1: "#10B981", // green
  level2: "#F59E0B", // amber
  level3: "#F97316", // orange
  level4: "#DC2626", // red
  noData: "#9CA3AF",
};

export const HOTSPOT_COLORS = {
  none: "#E5E7EB",
  stable: "#FBBF24",
  moderate: "#F97316",
  high: "#DC2626",
};

// Action Focus playbook — closed vocabulary for recommendations.
export const ACTION_PLAYBOOK = {
  vector_control: [
    "Source reduction drives in dense localities",
    "Fogging in identified high-risk wards",
    "Larval index monitoring",
    "Anti-larval spraying in stagnant water sites",
  ],
  surveillance: [
    "ASHA-led fever surveillance",
    "Sentinel-site fever camps",
    "Line-list audit and reconciliation",
  ],
  construction_water: [
    "Construction-site inspections in high-risk wards",
    "Drainage clearing and stagnant water mapping",
    "Building-site mosquito breeding audits",
  ],
  community_iec: [
    "Community awareness drives",
    "School IEC sessions",
    "RWA briefings on home-level prevention",
  ],
  coastal_specific: [
    "Fishing harbor sanitation",
    "Peri-urban breeding-site surveys",
    "Coastal drainage clearing",
  ],
};
