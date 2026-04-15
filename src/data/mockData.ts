// Mock data for Dengue EWS Dashboard

export const districts = ["All Districts", "East Godavari", "Krishna", "Guntur", "Kurnool", "Visakhapatnam", "Prakasam", "S.P.S. Nellore", "Srikakulam", "Vizianagaram", "West Godavari", "Anakapalli", "Eluru"];
export const blocks = ["All Blocks", "Block A", "Block B", "Block C"];
export const wards = ["All Wards", "Ward 1", "Ward 2", "Ward 3"];

export const kpiData = {
  suspected: 14890,
  tested: 13907,
  confirmed: 1291,
  deaths: 24,
};

export const riskForecast = [
  { week: "W1", risk: "moderate" as const, cases: 45, label: "Apr 7–13" },
  { week: "W2", risk: "high" as const, cases: 68, label: "Apr 14–20" },
  { week: "W3", risk: "high" as const, cases: 92, label: "Apr 21–27" },
  { week: "W4", risk: "moderate" as const, cases: 71, label: "Apr 28–May 4" },
];

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
];

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

export const lineListingData = [
  { patient: "Afrid", gender: "Male", age: 10, subDistrict: "Kallur", block: "Kallur", village: "Kallur", district: "Kurnool", diagnosis: "Dengue" },
  { patient: "Thowdamma B", gender: "Female", age: 53, subDistrict: "Nellimarla", block: "Nellimarla", village: "Nellimarla", district: "Vizianagaram", diagnosis: "Dengue" },
  { patient: "Ganthakarla Srinu", gender: "Male", age: 48, subDistrict: "Devarapalli", block: "Devarapalli", village: "Devarapalli", district: "Anakapalli", diagnosis: "Dengue" },
  { patient: "Suresh", gender: "Male", age: 15, subDistrict: "C.Belagal", block: "C.Belagal", village: "C.Belagal", district: "Kurnool", diagnosis: "Dengue" },
  { patient: "Vani Nethala", gender: "Female", age: 19, subDistrict: "Eluru Urban", block: "Eluru Urban", village: "Eluru Urban", district: "Eluru", diagnosis: "Dengue" },
  { patient: "D Umesh Reddy", gender: "Male", age: 21, subDistrict: "Guntur West", block: "Guntur West", village: "Guntur West", district: "Guntur", diagnosis: "Dengue" },
  { patient: "P Dhanalakshmi", gender: "Female", age: 39, subDistrict: "Pedakakani", block: "Pedakakani", village: "Pedakakani", district: "Guntur", diagnosis: "Dengue" },
  { patient: "Salomi Ch", gender: "Female", age: 39, subDistrict: "Venkatachalam", block: "Venkatachalam", village: "Venkatachalam", district: "S.P.S. Nellore", diagnosis: "Dengue" },
];

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

export const forecastTableData = [
  { district: "Krishna", trend: "up" as const, peakWeek: "W3", risk: "high" as const, action: "Intensive fogging in affected wards; deploy rapid response teams" },
  { district: "Visakhapatnam", trend: "up" as const, peakWeek: "W3", risk: "high" as const, action: "Door-to-door fever surveys; eliminate breeding sites" },
  { district: "East Godavari", trend: "stable" as const, peakWeek: "W3", risk: "high" as const, action: "Fogging in hotspots; increase testing camps" },
  { district: "West Godavari", trend: "up" as const, peakWeek: "W3", risk: "high" as const, action: "Larval surveys; community awareness drives" },
  { district: "Guntur", trend: "down" as const, peakWeek: "W2", risk: "moderate" as const, action: "Fogging alternate days; increase testing camps" },
  { district: "S.P.S. Nellore", trend: "stable" as const, peakWeek: "W2", risk: "moderate" as const, action: "Larval surveys in parks, construction sites" },
  { district: "Kurnool", trend: "stable" as const, peakWeek: "W3", risk: "moderate" as const, action: "Community awareness drives; increase testing" },
  { district: "Prakasam", trend: "down" as const, peakWeek: "W1", risk: "low" as const, action: "Routine surveillance; preventive messaging" },
];

export const weatherData = [
  { week: "W3", endDate: "21 Jan", rainfall: 0.2, temp: 19.0, maxT: 28.1, minT: 10.6, humidity: 59.7 },
  { week: "W4", endDate: "28 Jan", rainfall: 2.2, temp: 19.9, maxT: 27.5, minT: 13.8, humidity: 63.0 },
  { week: "W5", endDate: "4 Feb", rainfall: 1.6, temp: 18.9, maxT: 27.3, minT: 10.6, humidity: 72.2 },
  { week: "W6", endDate: "11 Feb", rainfall: 0.0, temp: 20.6, maxT: 29.2, minT: 13.4, humidity: 59.2 },
  { week: "W7", endDate: "18 Feb", rainfall: 0.6, temp: 22.8, maxT: 30.1, minT: 15.8, humidity: 47.7 },
  { week: "W8", endDate: "25 Feb", rainfall: 1.3, temp: 22.3, maxT: 31.3, minT: 15.9, humidity: 53.6 },
  { week: "W9", endDate: "4 Mar", rainfall: 0.0, temp: 25.5, maxT: 34.1, minT: 17.5, humidity: 37.0 },
  { week: "W10", endDate: "11 Mar", rainfall: 0.0, temp: 28.0, maxT: 36.8, minT: 19.5, humidity: 28.8 },
  { week: "W11", endDate: "18 Mar", rainfall: 0.0, temp: 28.8, maxT: 37.0, minT: 20.8, humidity: 20.9 },
  { week: "W12", endDate: "25 Mar", rainfall: 3.4, temp: 25.7, maxT: 34.8, minT: 16.9, humidity: 39.7 },
  { week: "W13", endDate: "1 Apr", rainfall: 3.3, temp: 29.9, maxT: 37.0, minT: 21.8, humidity: 32.1 },
  { week: "W14", endDate: "8 Apr", rainfall: 1.7, temp: 27.8, maxT: 36.3, minT: 20.7, humidity: 37.4 },
];

export const hotspotAlerts = [
  { id: 1, district: "Krishna", message: "Unusual spike in confirmed cases — 28 new cases in W3", severity: "high" as const },
  { id: 2, district: "East Godavari", message: "TPR rising above 30% for 2 consecutive weeks", severity: "high" as const },
  { id: 3, district: "Visakhapatnam", message: "New cluster detected in Pendurthi block", severity: "moderate" as const },
];

export const hotspotTableData = [
  { district: "Krishna", currentCases: 49, trend: "up" as const, risk: "high" as const },
  { district: "Visakhapatnam", currentCases: 65, trend: "up" as const, risk: "high" as const },
  { district: "East Godavari", currentCases: 47, trend: "stable" as const, risk: "high" as const },
  { district: "West Godavari", currentCases: 42, trend: "up" as const, risk: "moderate" as const },
  { district: "Guntur", currentCases: 52, trend: "down" as const, risk: "moderate" as const },
  { district: "Prakasam", currentCases: 31, trend: "down" as const, risk: "low" as const },
  { district: "Kurnool", currentCases: 30, trend: "stable" as const, risk: "moderate" as const },
];

export const dataQualityIssues = [
  { type: "missing_reports", message: "3 blocks have not reported in last 7 days", severity: "high" as const },
  { type: "missing_lab", message: "1 district missing lab confirmation data", severity: "moderate" as const },
  { type: "delayed", message: "Eluru district data delayed by 3 days", severity: "moderate" as const },
];

export const recommendedActions = {
  high: [
    "Intensive fogging in affected wards (daily)",
    "Door-to-door fever surveys",
    "Deploy rapid response teams",
    "Eliminate breeding sites (stagnant water, containers)",
    "Increase hospital preparedness",
  ],
  moderate: [
    "Fogging in hotspots (alternate days)",
    "Larval surveys in parks, construction sites",
    "Increase testing camps",
    "Community awareness drives",
  ],
  low: [
    "Routine surveillance",
    "Preventive messaging",
    "Monitor trends",
  ],
};

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
