// Mock data for Dengue EWS Dashboard

export const districts = ["All Districts", "East Godavari", "Krishna", "Guntur", "Kurnool", "Visakhapatnam", "Prakasam", "S.P.S. Nellore", "Srikakulam", "Vizianagaram", "West Godavari", "Anakapalli", "Eluru"];
export const blocks = ["All Blocks", "Bheemunipatnam", "Anakapalle", "Tenali", "Vizag MC", "Vijayawada MC", "Block A", "Block B", "Block C"];
export const wards = ["All Wards", "Ward 1", "Ward 2", "Ward 3", "Ward 4", "Ward 5"];

// ── Region-level data (district-level) ──
export const regionData = [
  { name: "East Godavari", suspected: 340, tested: 212, confirmed: 47, deaths: 1, risk: "high" as const, trend: "up" as const },
  { name: "Krishna", suspected: 548, tested: 512, confirmed: 49, deaths: 1, risk: "high" as const, trend: "up" as const },
  { name: "S.P.S. Nellore", suspected: 420, tested: 398, confirmed: 38, deaths: 0, risk: "moderate" as const, trend: "stable" as const },
  { name: "Prakasam", suspected: 312, tested: 290, confirmed: 31, deaths: 0, risk: "moderate" as const, trend: "down" as const },
  { name: "Srikakulam", suspected: 198, tested: 180, confirmed: 22, deaths: 0, risk: "low" as const, trend: "stable" as const },
  { name: "Visakhapatnam", suspected: 620, tested: 580, confirmed: 65, deaths: 2, risk: "high" as const, trend: "up" as const },
  { name: "Vizianagaram", suspected: 245, tested: 230, confirmed: 28, deaths: 0, risk: "moderate" as const, trend: "stable" as const },
  { name: "West Godavari", suspected: 380, tested: 355, confirmed: 42, deaths: 1, risk: "high" as const, trend: "up" as const },
  { name: "Guntur", suspected: 490, tested: 460, confirmed: 52, deaths: 1, risk: "high" as const, trend: "down" as const },
  { name: "Kurnool", suspected: 275, tested: 258, confirmed: 30, deaths: 0, risk: "moderate" as const, trend: "stable" as const },
  { name: "Anakapalli", suspected: 150, tested: 140, confirmed: 18, deaths: 0, risk: "low" as const, trend: "down" as const },
  { name: "Eluru", suspected: 130, tested: 120, confirmed: 12, deaths: 0, risk: "low" as const, trend: "stable" as const },
];

// ── Computed helpers ──
export function getFilteredRegions(district: string) {
  if (district === "All Districts") return regionData;
  return regionData.filter((r) => r.name === district);
}

export function getKpiFromRegions(regions: typeof regionData) {
  return {
    suspected: regions.reduce((s, r) => s + r.suspected, 0),
    tested: regions.reduce((s, r) => s + r.tested, 0),
    confirmed: regions.reduce((s, r) => s + r.confirmed, 0),
    deaths: regions.reduce((s, r) => s + r.deaths, 0),
  };
}

export function getSituationSummary(regions: typeof regionData) {
  const kpi = getKpiFromRegions(regions);
  const highRisk = regions.filter((r) => r.risk === "high");
  const highNames = highRisk.map((r) => r.name).join(", ");
  if (regions.length === 1) {
    const r = regions[0];
    return `${r.name} has recorded ${kpi.confirmed} confirmed dengue cases with ${kpi.deaths} death(s). Risk level: ${r.risk}. Trend: ${r.trend === "up" ? "increasing" : r.trend === "down" ? "declining" : "stable"}.`;
  }
  return `${kpi.confirmed} confirmed dengue cases across ${regions.length} districts with ${kpi.deaths} deaths. ${highRisk.length > 0 ? `High-risk districts: ${highNames}.` : "No districts at high risk currently."} Forecast indicates projected increase in weeks W2–W3.`;
}

// ── Risk forecast (W1–W4) ──
export const riskForecast = [
  { week: "W1", risk: "moderate" as const, cases: 45, label: "Apr 7–13" },
  { week: "W2", risk: "high" as const, cases: 68, label: "Apr 14–20" },
  { week: "W3", risk: "high" as const, cases: 92, label: "Apr 21–27" },
  { week: "W4", risk: "moderate" as const, cases: 71, label: "Apr 28–May 4" },
];

// ── Time series ──
export const weeklyTimeSeries = [
  { week: "W1", date: "Feb 3", positive: 8, samples: 45, tpr: 17.8 },
  { week: "W2", date: "Feb 10", positive: 12, samples: 52, tpr: 23.1 },
  { week: "W3", date: "Feb 17", positive: 10, samples: 48, tpr: 20.8 },
  { week: "W4", date: "Feb 24", positive: 15, samples: 60, tpr: 25.0 },
  { week: "W5", date: "Mar 3", positive: 18, samples: 65, tpr: 27.7 },
  { week: "W6", date: "Mar 10", positive: 14, samples: 58, tpr: 24.1 },
  { week: "W7", date: "Mar 17", positive: 20, samples: 72, tpr: 27.8 },
  { week: "W8", date: "Mar 24", positive: 16, samples: 62, tpr: 25.8 },
  { week: "W9", date: "Mar 31", positive: 22, samples: 78, tpr: 28.2 },
  { week: "W10", date: "Apr 7", positive: 19, samples: 70, tpr: 27.1 },
];

export const dailyTimeSeries = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  date: `Mar ${i + 1}`,
  positive: Math.floor(Math.random() * 8) + 1,
  samples: Math.floor(Math.random() * 15) + 5,
  tpr: Math.round((Math.random() * 30 + 10) * 10) / 10,
}));

export const monthlyTimeSeries = [
  { month: "Nov", positive: 45, samples: 180, tpr: 25.0 },
  { month: "Dec", positive: 38, samples: 160, tpr: 23.8 },
  { month: "Jan", positive: 52, samples: 210, tpr: 24.8 },
  { month: "Feb", positive: 65, samples: 270, tpr: 24.1 },
  { month: "Mar", positive: 90, samples: 350, tpr: 25.7 },
];

// ── Demographics ──
export const ageDistribution = [
  { group: "0–4", count: 3, tpr: 15 },
  { group: "5–14", count: 5, tpr: 22 },
  { group: "15–24", count: 4, tpr: 20 },
  { group: "25–34", count: 4, tpr: 18 },
  { group: "35–44", count: 3, tpr: 25 },
  { group: "45–54", count: 2, tpr: 30 },
  { group: "55+", count: 1, tpr: 28 },
];

export const genderDistribution = [
  { name: "Male", value: 58 },
  { name: "Female", value: 42 },
];

// ── Line listing ──
export const lineListingData = [
  { patient: "Afrid", gender: "Male", age: 10, subDistrict: "Kallur", block: "Kallur", village: "Kallur", district: "Kurnool", diagnosis: "Dengue", testType: "NS1", testResult: "Positive", dateOfTesting: "2026-03-15", urbanRural: "Rural", referredBy: "ASHA" },
  { patient: "Thowdamma B", gender: "Female", age: 53, subDistrict: "Nellimarla", block: "Nellimarla", village: "Nellimarla", district: "Vizianagaram", diagnosis: "Dengue", testType: "IgM", testResult: "Positive", dateOfTesting: "2026-03-18", urbanRural: "Rural", referredBy: "ANM" },
  { patient: "Ganthakarla Srinu", gender: "Male", age: 48, subDistrict: "Devarapalli", block: "Devarapalli", village: "Devarapalli", district: "Anakapalli", diagnosis: "Dengue", testType: "NS1", testResult: "Positive", dateOfTesting: "2026-03-20", urbanRural: "Rural", referredBy: "MO" },
  { patient: "Suresh", gender: "Male", age: 15, subDistrict: "C.Belagal", block: "C.Belagal", village: "C.Belagal", district: "Kurnool", diagnosis: "Dengue", testType: "IgM", testResult: "Positive", dateOfTesting: "2026-03-22", urbanRural: "Rural", referredBy: "ASHA" },
  { patient: "Vani Nethala", gender: "Female", age: 19, subDistrict: "Eluru Urban", block: "Eluru Urban", village: "Eluru Urban", district: "Eluru", diagnosis: "Dengue", testType: "NS1", testResult: "Positive", dateOfTesting: "2026-03-25", urbanRural: "Urban", referredBy: "HW" },
  { patient: "D Umesh Reddy", gender: "Male", age: 21, subDistrict: "Guntur West", block: "Guntur West", village: "Guntur West", district: "Guntur", diagnosis: "Dengue", testType: "NS1", testResult: "Positive", dateOfTesting: "2026-03-28", urbanRural: "Urban", referredBy: "MO" },
  { patient: "P Dhanalakshmi", gender: "Female", age: 39, subDistrict: "Pedakakani", block: "Pedakakani", village: "Pedakakani", district: "Guntur", diagnosis: "Dengue", testType: "IgM", testResult: "Positive", dateOfTesting: "2026-03-30", urbanRural: "Rural", referredBy: "ANM" },
  { patient: "Salomi Ch", gender: "Female", age: 39, subDistrict: "Venkatachalam", block: "Venkatachalam", village: "Venkatachalam", district: "S.P.S. Nellore", diagnosis: "Dengue", testType: "NS1", testResult: "Positive", dateOfTesting: "2026-04-01", urbanRural: "Urban", referredBy: "AWW" },
];

// ── Forecast (actual vs predicted) ──
export const forecastData = [
  { week: "W3", year: 2026, actual: 4, predicted: null, lower: null, upper: null, type: "Historical" },
  { week: "W4", year: 2026, actual: 3, predicted: null, lower: null, upper: null, type: "Historical" },
  { week: "W5", year: 2026, actual: 2, predicted: null, lower: null, upper: null, type: "Historical" },
  { week: "W6", year: 2026, actual: 3, predicted: null, lower: null, upper: null, type: "Historical" },
  { week: "W7", year: 2026, actual: 5, predicted: null, lower: null, upper: null, type: "Historical" },
  { week: "W8", year: 2026, actual: 4, predicted: null, lower: null, upper: null, type: "Historical" },
  { week: "W9", year: 2026, actual: 6, predicted: null, lower: null, upper: null, type: "Historical" },
  { week: "W10", year: 2026, actual: 5, predicted: null, lower: null, upper: null, type: "Historical" },
  { week: "W11", year: 2026, actual: 7, predicted: null, lower: null, upper: null, type: "Historical" },
  { week: "W12", year: 2026, actual: 8, predicted: null, lower: null, upper: null, type: "Historical" },
  { week: "W13", year: 2026, actual: 6, predicted: 6, lower: 4, upper: 8, type: "Historical" },
  { week: "W14", year: 2026, actual: null, predicted: 7, lower: 4, upper: 10, type: "Forecast" },
  { week: "W15", year: 2026, actual: null, predicted: 9, lower: 5, upper: 13, type: "Forecast" },
  { week: "W16", year: 2026, actual: null, predicted: 11, lower: 6, upper: 16, type: "Forecast" },
  { week: "W17", year: 2026, actual: null, predicted: 10, lower: 5, upper: 15, type: "Forecast" },
  { week: "W18", year: 2026, actual: null, predicted: 8, lower: 4, upper: 12, type: "Forecast" },
];

// ── Outbreak Prediction (computed-style, sorted by probability) ──
export const outbreakPredictionData = [
  { district: "Krishna", probability: 87, risk: "high" as const, expectedWeek: "W3", signal: "Cases rising + TPR spike + Historical trend" },
  { district: "Visakhapatnam", probability: 82, risk: "high" as const, expectedWeek: "W3", signal: "Cases rising + Climate conditions favorable" },
  { district: "East Godavari", probability: 74, risk: "high" as const, expectedWeek: "W3", signal: "TPR spike + High humidity corridor" },
  { district: "West Godavari", probability: 68, risk: "high" as const, expectedWeek: "W3", signal: "Cases rising + Post-rainfall breeding" },
  { district: "Guntur", probability: 52, risk: "moderate" as const, expectedWeek: "W2", signal: "Historical trend + Temperature in range" },
  { district: "S.P.S. Nellore", probability: 45, risk: "moderate" as const, expectedWeek: "W2", signal: "Climate conditions + Moderate case load" },
  { district: "Kurnool", probability: 38, risk: "moderate" as const, expectedWeek: "W3", signal: "Historical trend + Moderate humidity" },
  { district: "Vizianagaram", probability: 30, risk: "moderate" as const, expectedWeek: "W4", signal: "Seasonal pattern" },
  { district: "Prakasam", probability: 18, risk: "low" as const, expectedWeek: "W1", signal: "Low case load + Declining trend" },
  { district: "Srikakulam", probability: 12, risk: "low" as const, expectedWeek: "W4", signal: "Low baseline + No climate trigger" },
  { district: "Anakapalli", probability: 15, risk: "low" as const, expectedWeek: "W4", signal: "Declining cases + Stable climate" },
  { district: "Eluru", probability: 10, risk: "low" as const, expectedWeek: "W4", signal: "Low baseline" },
];

// ── Hotspot data ──
export const hotspotAlerts = [
  { id: 1, district: "Krishna", message: "Unusual spike in confirmed cases — 28 new cases in W3", severity: "high" as const },
  { id: 2, district: "East Godavari", message: "TPR rising above 30% for 2 consecutive weeks", severity: "high" as const },
  { id: 3, district: "Visakhapatnam", message: "New cluster detected in Pendurthi block", severity: "moderate" as const },
];

export const hotspotTableData = [
  { district: "Krishna", currentCases: 49, prevCases: 32, trend: "up" as const, risk: "high" as const },
  { district: "Visakhapatnam", currentCases: 65, prevCases: 45, trend: "up" as const, risk: "high" as const },
  { district: "East Godavari", currentCases: 47, prevCases: 44, trend: "stable" as const, risk: "high" as const },
  { district: "West Godavari", currentCases: 42, prevCases: 30, trend: "up" as const, risk: "moderate" as const },
  { district: "Guntur", currentCases: 52, prevCases: 60, trend: "down" as const, risk: "moderate" as const },
  { district: "Prakasam", currentCases: 31, prevCases: 35, trend: "down" as const, risk: "low" as const },
  { district: "Kurnool", currentCases: 30, prevCases: 28, trend: "stable" as const, risk: "moderate" as const },
];

// ── Data quality issues ──
export const dataQualityIssues = [
  { type: "missing_reports", message: "3 blocks have not reported in last 7 days", severity: "high" as const },
  { type: "missing_lab", message: "1 district missing lab confirmation data", severity: "moderate" as const },
  { type: "delayed", message: "Eluru district data delayed by 3 days", severity: "moderate" as const },
];

// ── Granular actions by geography level ──
export const actionsByScope: Record<string, { district: string[]; block: string[]; ward: string[] }> = {
  high: {
    district: [
      "Deploy rapid response teams to affected blocks",
      "Increase hospital preparedness — stock IV fluids, platelets",
      "Activate district-level RRT with epidemiologist",
      "Issue public health advisory for the district",
    ],
    block: [
      "Intensive fogging in all affected wards (daily)",
      "Conduct larval surveys in identified clusters",
      "Set up temporary fever screening camps",
      "Deploy entomological team for vector assessment",
    ],
    ward: [
      "Remove stagnant water from all containers and tyres",
      "Door-to-door fever surveys — identify unreported cases",
      "Source reduction by ASHA / ANM workers",
      "Community mobilisation and IEC activities",
    ],
  },
  moderate: {
    district: [
      "Fogging in hotspot blocks (alternate days)",
      "Increase testing camps at PHCs",
      "Share advisory with block medical officers",
    ],
    block: [
      "Larval surveys in parks, construction sites, water bodies",
      "Strengthen syndromic surveillance at sub-centres",
      "Community awareness drives at schools and markets",
    ],
    ward: [
      "Anti-larval measures in public areas",
      "Monitor fever cases at ASHA level",
      "Distribute mosquito nets to vulnerable households",
    ],
  },
  low: {
    district: ["Routine surveillance and data review", "Preventive messaging via IEC"],
    block: ["Monitor weekly case trends", "Ensure timely data reporting"],
    ward: ["Routine environmental sanitation", "Awareness posters at community centres"],
  },
};

// ── Signals / Field Intelligence ──
export const newsAlerts = [
  { id: 1, headline: "Dengue cases rise sharply in Vijayawada hospitals", source: "The Hindu", date: "2026-04-10", district: "Krishna", severity: "high" as const },
  { id: 2, headline: "Water-logging after rains creates breeding grounds in Vizag", source: "Deccan Chronicle", date: "2026-04-08", district: "Visakhapatnam", severity: "high" as const },
  { id: 3, headline: "Health dept ramps up fumigation drives in East Godavari", source: "Eenadu", date: "2026-04-07", district: "East Godavari", severity: "moderate" as const },
  { id: 4, headline: "Guntur hospitals report increasing OPD for fever cases", source: "Andhra Jyothy", date: "2026-04-06", district: "Guntur", severity: "moderate" as const },
  { id: 5, headline: "Community health workers report poor sanitation in Kurnool villages", source: "Field Report", date: "2026-04-05", district: "Kurnool", severity: "low" as const },
  { id: 6, headline: "Construction debris piling up in Nellore outskirts — potential breeding sites", source: "Local Report", date: "2026-04-04", district: "S.P.S. Nellore", severity: "moderate" as const },
];

export const geoTaggedAlerts = [
  { id: 1, lat: 16.52, lng: 80.63, message: "Hospital OPD spike — 40+ fever cases in 2 days", district: "Krishna", severity: "high" as const },
  { id: 2, lat: 17.72, lng: 83.30, message: "Waterlogging reported in 3 wards post-rain", district: "Visakhapatnam", severity: "high" as const },
  { id: 3, lat: 17.0, lng: 81.78, message: "Fumigation drive underway — 8 wards covered", district: "East Godavari", severity: "moderate" as const },
  { id: 4, lat: 16.30, lng: 80.44, message: "Fever screening camp set up at Guntur bus station", district: "Guntur", severity: "moderate" as const },
  { id: 5, lat: 15.83, lng: 78.04, message: "ASHA reports increased fever in 2 villages", district: "Kurnool", severity: "low" as const },
];

// ── Upload formats ──
export const uploadFormats = [
  { id: "nvbdcp_linelist", name: "NVBDCP Line List", description: "Standard NVBDCP line listing format with patient details, test type, and results", columns: ["SL. NO", "SS Name", "Date of Testing", "Name of Patient", "Sex", "Age", "Address", "Mobile No", "District", "CHC", "SC", "Village", "Travel History", "Urban/Rural", "Referred By", "Test Type (IgM/NS1)", "Dengue Positive (Y/N)", "Death (Y/N)"] },
  { id: "nvbdcp_daily", name: "NVBDCP Daily Report", description: "Proforma for daily reporting of dengue cases/deaths by sentinel site", columns: ["Sl No", "Sentinel Site", "NS1 Tested", "IgM Tested", "Total Tested", "NS1 Positive", "IgM Positive", "Total Positive", "Urban", "Rural", "Others", "Deaths"] },
  { id: "msu_format", name: "MSU / UMSU Format", description: "Municipal surveillance unit reporting format", columns: ["SL. NO", "SS Name", "Date of Testing", "Name of Patient", "Sex", "Age", "Address", "Mobile No", "District", "CHC", "SC", "Village", "Travel History", "Urban/Rural", "Referred By", "Test Type", "Positive (Y/N)"] },
  { id: "lab_report", name: "Lab Reporting", description: "Laboratory test results with NS1/IgM breakdown", columns: ["Sample ID", "Patient Name", "Age", "Gender", "District", "Date Collected", "Date Tested", "NS1 Result", "IgM Result", "Final Result"] },
  { id: "survey_data", name: "Survey Data", description: "Field survey and entomological data", columns: ["Date", "District", "Block", "Ward/Village", "Houses Surveyed", "Containers Found", "Containers Positive", "Breeding Index", "Surveyor Name"] },
];

// ── Weather data (observed + forecast) ──
export const weatherObserved = [
  { week: "W7", endDate: "18 Feb", rainfall: 0.6, temp: 22.8, maxT: 30.1, minT: 15.8, humidity: 47.7 },
  { week: "W8", endDate: "25 Feb", rainfall: 1.3, temp: 22.3, maxT: 31.3, minT: 15.9, humidity: 53.6 },
  { week: "W9", endDate: "4 Mar", rainfall: 0.0, temp: 25.5, maxT: 34.1, minT: 17.5, humidity: 37.0 },
  { week: "W10", endDate: "11 Mar", rainfall: 0.0, temp: 28.0, maxT: 36.8, minT: 19.5, humidity: 28.8 },
  { week: "W11", endDate: "18 Mar", rainfall: 0.0, temp: 28.8, maxT: 37.0, minT: 20.8, humidity: 20.9 },
  { week: "W12", endDate: "25 Mar", rainfall: 3.4, temp: 25.7, maxT: 34.8, minT: 16.9, humidity: 39.7 },
  { week: "W13", endDate: "1 Apr", rainfall: 3.3, temp: 29.9, maxT: 37.0, minT: 21.8, humidity: 32.1 },
  { week: "W14", endDate: "8 Apr", rainfall: 1.7, temp: 27.8, maxT: 36.3, minT: 20.7, humidity: 37.4 },
];

export const weatherForecast = [
  { week: "W15", endDate: "15 Apr", rainfall: 5.2, temp: 30.1, maxT: 37.5, minT: 22.0, humidity: 45.0 },
  { week: "W16", endDate: "22 Apr", rainfall: 12.4, temp: 31.2, maxT: 38.0, minT: 23.5, humidity: 52.0 },
  { week: "W17", endDate: "29 Apr", rainfall: 18.6, temp: 32.0, maxT: 38.5, minT: 24.0, humidity: 58.0 },
  { week: "W18", endDate: "6 May", rainfall: 25.0, temp: 31.5, maxT: 37.8, minT: 24.2, humidity: 62.0 },
  { week: "W19", endDate: "13 May", rainfall: 35.0, temp: 30.8, maxT: 37.0, minT: 24.5, humidity: 68.0 },
  { week: "W20", endDate: "20 May", rainfall: 42.0, temp: 30.2, maxT: 36.5, minT: 24.0, humidity: 72.0 },
  { week: "W21", endDate: "27 May", rainfall: 55.0, temp: 29.5, maxT: 35.8, minT: 23.8, humidity: 75.0 },
  { week: "W22", endDate: "3 Jun", rainfall: 65.0, temp: 28.8, maxT: 34.5, minT: 23.5, humidity: 78.0 },
];

// Combined for charts
export const weatherData = [
  ...weatherObserved.map((w) => ({ ...w, type: "observed" as const })),
  ...weatherForecast.map((w) => ({ ...w, type: "forecast" as const })),
];

// ── Map ──
export const mapCenter: [number, number] = [15.9129, 79.74];
export const mapZoom = 7;

export const districtCoordinates: Record<string, [number, number]> = {
  "East Godavari": [17.0, 81.8],
  "Krishna": [16.6, 80.6],
  "S.P.S. Nellore": [14.4, 79.9],
  "Prakasam": [15.3, 79.4],
  "Srikakulam": [18.3, 84.0],
  "Visakhapatnam": [17.7, 83.3],
  "Vizianagaram": [18.1, 83.4],
  "West Godavari": [16.9, 81.2],
  "Guntur": [16.3, 80.4],
  "Kurnool": [15.8, 78.0],
  "Anakapalli": [17.7, 83.0],
  "Eluru": [16.7, 81.1],
};
