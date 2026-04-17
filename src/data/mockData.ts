// Mock data for Vector-Borne Disease EWS Dashboard — Multi-State (AP / Odisha / Karnataka)
// Active state is set via setActiveState(); all getters/proxies read from the active bundle.

// ──────────────── Types ────────────────
export type StateId = "andhra_pradesh" | "odisha" | "karnataka";

export interface RegionData {
  name: string;
  suspected: number;
  tested: number;
  confirmed: number;
  risk: "high" | "moderate" | "low";
  trend: "up" | "down" | "stable";
  type?: "district" | "block" | "municipality" | "village" | "ward";
  parentDistrict?: string;
  parentBlock?: string;
}

export interface OutbreakPrediction {
  area: string;
  probability: number;
  risk: "high" | "moderate" | "low";
  expectedWeek: string;
  signal: string;
  parentDistrict?: string;
  parentBlock?: string;
  areaType?: string;
}

export interface HotspotData {
  area: string;
  currentCases: number;
  prevCases: number;
  trend: "up" | "down" | "stable";
  risk: "high" | "moderate" | "low";
  parentDistrict?: string;
  parentBlock?: string;
}

export interface NewsAlert { id: number; headline: string; source: string; date: string; district: string; severity: "high" | "moderate" | "low"; }
export interface GeoAlert { id: number; lat: number; lng: number; message: string; district: string; severity: "high" | "moderate" | "low"; }
export interface LineListing { patient: string; gender: string; age: number; subDistrict: string; block: string; village: string; district: string; diagnosis: string; testType: string; testResult: string; dateOfTesting: string; urbanRural: string; referredBy: string; }

export interface TimeSeriesPoint { week?: string; date?: string; month?: string; positive: number; samples: number; tpr: number; }
export interface RiskForecastPoint { week: string; risk: "high" | "moderate" | "low"; cases: number; label: string; }
export interface ForecastChartPoint { week: string; actual: number | null; predicted: number | null; lower: number | null; upper: number | null; type: string; }
export interface WeatherPoint { week: string; endDate: string; rainfall: number; temp: number; maxT: number; minT: number; humidity: number; }
export interface DataIssue { type: string; message: string; severity: "high" | "moderate" | "low"; }

export interface StateBundle {
  id: StateId;
  label: string;
  districts: string[];
  blocks: string[];
  regionData: RegionData[];
  subDistrictData: RegionData[];
  villageData: RegionData[];
  wardData: RegionData[];
  statePredictions: OutbreakPrediction[];
  districtPredictions: OutbreakPrediction[];
  blockPredictions: OutbreakPrediction[];
  municipalityPredictions: OutbreakPrediction[];
  hotspotDistrictData: HotspotData[];
  hotspotSubDistrictData: HotspotData[];
  hotspotVillageData: HotspotData[];
  hotspotAlerts: { id: number; district: string; message: string; severity: "high" | "moderate" | "low" }[];
  newsAlerts: NewsAlert[];
  geoTaggedAlerts: GeoAlert[];
  lineListingData: LineListing[];
  districtCoordinates: Record<string, [number, number]>;
  mapCenter: [number, number];
  mapZoom: number;
  // Time-series & forecast (state-specific)
  riskForecast: RiskForecastPoint[];
  weeklyTimeSeries: TimeSeriesPoint[];
  dailyTimeSeries: TimeSeriesPoint[];
  monthlyTimeSeries: TimeSeriesPoint[];
  forecastData: ForecastChartPoint[];
  weatherObserved: WeatherPoint[];
  weatherForecast: WeatherPoint[];
  dataQualityIssues: DataIssue[];
}

// ──────────────── ANDHRA PRADESH ────────────────
const AP: StateBundle = {
  id: "andhra_pradesh", label: "Andhra Pradesh",
  districts: ["All Districts", "East Godavari", "Krishna", "Guntur", "Kurnool", "Visakhapatnam", "Prakasam", "S.P.S. Nellore", "Srikakulam", "Vizianagaram", "West Godavari", "Anakapalli", "Eluru"],
  blocks: ["All Blocks", "Bheemunipatnam", "Anakapalle", "Tenali", "Vizag MC", "Vijayawada MC", "Mangalagiri", "Amaravathi", "Gajuwaka", "Nandyal", "Adoni", "Kallur", "Pendurthi"],
  regionData: [
    { name: "East Godavari", suspected: 340, tested: 212, confirmed: 47, risk: "high", trend: "up", type: "district" },
    { name: "Krishna", suspected: 548, tested: 512, confirmed: 49, risk: "high", trend: "up", type: "district" },
    { name: "S.P.S. Nellore", suspected: 420, tested: 398, confirmed: 38, risk: "moderate", trend: "stable", type: "district" },
    { name: "Prakasam", suspected: 312, tested: 290, confirmed: 31, risk: "moderate", trend: "down", type: "district" },
    { name: "Srikakulam", suspected: 198, tested: 180, confirmed: 22, risk: "low", trend: "stable", type: "district" },
    { name: "Visakhapatnam", suspected: 620, tested: 580, confirmed: 65, risk: "high", trend: "up", type: "district" },
    { name: "Vizianagaram", suspected: 245, tested: 230, confirmed: 28, risk: "moderate", trend: "stable", type: "district" },
    { name: "West Godavari", suspected: 380, tested: 355, confirmed: 42, risk: "high", trend: "up", type: "district" },
    { name: "Guntur", suspected: 490, tested: 460, confirmed: 52, risk: "high", trend: "down", type: "district" },
    { name: "Kurnool", suspected: 275, tested: 258, confirmed: 30, risk: "moderate", trend: "stable", type: "district" },
    { name: "Anakapalli", suspected: 150, tested: 140, confirmed: 18, risk: "low", trend: "down", type: "district" },
    { name: "Eluru", suspected: 130, tested: 120, confirmed: 12, risk: "low", trend: "stable", type: "district" },
  ],
  subDistrictData: [
    { name: "Tenali", suspected: 145, tested: 132, confirmed: 22, risk: "high", trend: "up", type: "block", parentDistrict: "Guntur" },
    { name: "Mangalagiri", suspected: 120, tested: 110, confirmed: 15, risk: "high", trend: "up", type: "municipality", parentDistrict: "Guntur" },
    { name: "Amaravathi", suspected: 95, tested: 88, confirmed: 10, risk: "moderate", trend: "stable", type: "block", parentDistrict: "Guntur" },
    { name: "Pedakakani", suspected: 70, tested: 68, confirmed: 5, risk: "low", trend: "down", type: "block", parentDistrict: "Guntur" },
    { name: "Guntur West", suspected: 60, tested: 62, confirmed: 3, risk: "low", trend: "stable", type: "block", parentDistrict: "Guntur" },
    { name: "Bheemunipatnam", suspected: 180, tested: 165, confirmed: 28, risk: "high", trend: "up", type: "block", parentDistrict: "Visakhapatnam" },
    { name: "Vizag MC", suspected: 200, tested: 190, confirmed: 20, risk: "high", trend: "up", type: "municipality", parentDistrict: "Visakhapatnam" },
    { name: "Gajuwaka", suspected: 110, tested: 100, confirmed: 12, risk: "moderate", trend: "stable", type: "block", parentDistrict: "Visakhapatnam" },
    { name: "Pendurthi", suspected: 80, tested: 78, confirmed: 5, risk: "low", trend: "down", type: "block", parentDistrict: "Visakhapatnam" },
    { name: "Anakapalle", suspected: 50, tested: 47, confirmed: 3, risk: "low", trend: "stable", type: "block", parentDistrict: "Visakhapatnam" },
    { name: "Nandyal", suspected: 110, tested: 100, confirmed: 14, risk: "high", trend: "up", type: "block", parentDistrict: "Kurnool" },
    { name: "Adoni", suspected: 80, tested: 75, confirmed: 9, risk: "moderate", trend: "stable", type: "block", parentDistrict: "Kurnool" },
    { name: "Kallur", suspected: 55, tested: 52, confirmed: 5, risk: "moderate", trend: "stable", type: "block", parentDistrict: "Kurnool" },
    { name: "C.Belagal", suspected: 30, tested: 31, confirmed: 2, risk: "low", trend: "down", type: "block", parentDistrict: "Kurnool" },
    { name: "Vijayawada MC", suspected: 200, tested: 195, confirmed: 22, risk: "high", trend: "up", type: "municipality", parentDistrict: "Krishna" },
    { name: "Machilipatnam", suspected: 140, tested: 130, confirmed: 14, risk: "moderate", trend: "stable", type: "block", parentDistrict: "Krishna" },
    { name: "Gudivada", suspected: 100, tested: 95, confirmed: 8, risk: "moderate", trend: "up", type: "block", parentDistrict: "Krishna" },
    { name: "Nuzvid", suspected: 60, tested: 55, confirmed: 5, risk: "low", trend: "stable", type: "block", parentDistrict: "Krishna" },
  ],
  villageData: [
    { name: "Kollipara", suspected: 48, tested: 44, confirmed: 9, risk: "high", trend: "up", type: "village", parentDistrict: "Guntur", parentBlock: "Tenali" },
    { name: "Pedaravuru", suspected: 42, tested: 38, confirmed: 7, risk: "moderate", trend: "up", type: "village", parentDistrict: "Guntur", parentBlock: "Tenali" },
    { name: "Angalakuduru", suspected: 30, tested: 28, confirmed: 4, risk: "moderate", trend: "stable", type: "village", parentDistrict: "Guntur", parentBlock: "Tenali" },
    { name: "Duggirala", suspected: 25, tested: 22, confirmed: 2, risk: "low", trend: "down", type: "village", parentDistrict: "Guntur", parentBlock: "Tenali" },
    { name: "Thagarapuvalasa", suspected: 62, tested: 58, confirmed: 12, risk: "high", trend: "up", type: "village", parentDistrict: "Visakhapatnam", parentBlock: "Bheemunipatnam" },
    { name: "Anandapuram", suspected: 50, tested: 45, confirmed: 9, risk: "high", trend: "up", type: "village", parentDistrict: "Visakhapatnam", parentBlock: "Bheemunipatnam" },
    { name: "Rushikonda", suspected: 38, tested: 34, confirmed: 5, risk: "moderate", trend: "stable", type: "village", parentDistrict: "Visakhapatnam", parentBlock: "Bheemunipatnam" },
    { name: "Kapuluppada", suspected: 30, tested: 28, confirmed: 2, risk: "low", trend: "down", type: "village", parentDistrict: "Visakhapatnam", parentBlock: "Bheemunipatnam" },
    { name: "Kasimkota", suspected: 20, tested: 18, confirmed: 2, risk: "low", trend: "stable", type: "village", parentDistrict: "Visakhapatnam", parentBlock: "Anakapalle" },
    { name: "Chodavaram", suspected: 18, tested: 17, confirmed: 1, risk: "low", trend: "down", type: "village", parentDistrict: "Visakhapatnam", parentBlock: "Anakapalle" },
    { name: "Mahanandi", suspected: 40, tested: 36, confirmed: 6, risk: "high", trend: "up", type: "village", parentDistrict: "Kurnool", parentBlock: "Nandyal" },
    { name: "Banaganapalle", suspected: 35, tested: 32, confirmed: 4, risk: "moderate", trend: "stable", type: "village", parentDistrict: "Kurnool", parentBlock: "Nandyal" },
    { name: "Koilkuntla", suspected: 25, tested: 22, confirmed: 3, risk: "moderate", trend: "stable", type: "village", parentDistrict: "Kurnool", parentBlock: "Nandyal" },
    { name: "Undavalli", suspected: 35, tested: 32, confirmed: 5, risk: "moderate", trend: "up", type: "village", parentDistrict: "Guntur", parentBlock: "Amaravathi" },
    { name: "Tadepalli", suspected: 30, tested: 28, confirmed: 3, risk: "low", trend: "stable", type: "village", parentDistrict: "Guntur", parentBlock: "Amaravathi" },
    { name: "Penumaka", suspected: 20, tested: 18, confirmed: 2, risk: "low", trend: "down", type: "village", parentDistrict: "Guntur", parentBlock: "Amaravathi" },
    { name: "Pedagantyada", suspected: 38, tested: 35, confirmed: 5, risk: "moderate", trend: "up", type: "village", parentDistrict: "Visakhapatnam", parentBlock: "Gajuwaka" },
    { name: "Nathayyapalem", suspected: 32, tested: 28, confirmed: 4, risk: "moderate", trend: "stable", type: "village", parentDistrict: "Visakhapatnam", parentBlock: "Gajuwaka" },
    { name: "Aganampudi", suspected: 22, tested: 20, confirmed: 2, risk: "low", trend: "down", type: "village", parentDistrict: "Visakhapatnam", parentBlock: "Gajuwaka" },
  ],
  wardData: [
    { name: "MVP Colony", suspected: 55, tested: 50, confirmed: 8, risk: "high", trend: "up", type: "ward", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
    { name: "Gajuwaka", suspected: 42, tested: 38, confirmed: 5, risk: "moderate", trend: "up", type: "ward", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
    { name: "Dwaraka Nagar", suspected: 35, tested: 32, confirmed: 4, risk: "moderate", trend: "stable", type: "ward", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
    { name: "Akkayyapalem", suspected: 28, tested: 30, confirmed: 2, risk: "low", trend: "down", type: "ward", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
    { name: "Seethammadhara", suspected: 22, tested: 20, confirmed: 1, risk: "low", trend: "stable", type: "ward", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
    { name: "Benz Circle", suspected: 58, tested: 55, confirmed: 9, risk: "high", trend: "up", type: "ward", parentDistrict: "Krishna", parentBlock: "Vijayawada MC" },
    { name: "Governorpet", suspected: 45, tested: 42, confirmed: 6, risk: "moderate", trend: "stable", type: "ward", parentDistrict: "Krishna", parentBlock: "Vijayawada MC" },
    { name: "Patamata", suspected: 38, tested: 36, confirmed: 4, risk: "moderate", trend: "stable", type: "ward", parentDistrict: "Krishna", parentBlock: "Vijayawada MC" },
    { name: "Gunadala", suspected: 30, tested: 28, confirmed: 2, risk: "low", trend: "down", type: "ward", parentDistrict: "Krishna", parentBlock: "Vijayawada MC" },
    { name: "Mangalagiri Ward 1", suspected: 40, tested: 38, confirmed: 6, risk: "high", trend: "up", type: "ward", parentDistrict: "Guntur", parentBlock: "Mangalagiri" },
    { name: "Mangalagiri Ward 4", suspected: 35, tested: 32, confirmed: 4, risk: "moderate", trend: "stable", type: "ward", parentDistrict: "Guntur", parentBlock: "Mangalagiri" },
    { name: "Mangalagiri Ward 8", suspected: 25, tested: 22, confirmed: 3, risk: "moderate", trend: "up", type: "ward", parentDistrict: "Guntur", parentBlock: "Mangalagiri" },
  ],
  statePredictions: [
    { area: "Visakhapatnam", probability: 78, risk: "high", expectedWeek: "W+2", signal: "High risk due to urban clustering in dense Vizag wards (MVP Colony, Gajuwaka)" },
    { area: "Guntur", probability: 70, risk: "high", expectedWeek: "W+3", signal: "Moderate–high risk due to irrigation-driven mosquito breeding along canal networks" },
    { area: "Krishna", probability: 72, risk: "high", expectedWeek: "W+2", signal: "Urban clustering in Vijayawada wards + drainage-linked breeding" },
    { area: "East Godavari", probability: 55, risk: "moderate", expectedWeek: "W+3", signal: "Post-rainfall breeding in delta region + rising OPD trend" },
    { area: "West Godavari", probability: 48, risk: "moderate", expectedWeek: "W+4", signal: "Climate conditions favourable + moderate baseline cases" },
    { area: "Kurnool", probability: 42, risk: "moderate", expectedWeek: "W+3", signal: "Rising risk due to gradual rural spread in select blocks" },
    { area: "S.P.S. Nellore", probability: 35, risk: "moderate", expectedWeek: "W+4", signal: "Seasonal pattern + early breeding-site reports" },
    { area: "Prakasam", probability: 18, risk: "low", expectedWeek: "W+4", signal: "Low case load + declining trend" },
    { area: "Srikakulam", probability: 12, risk: "low", expectedWeek: "W+4", signal: "Low baseline + no climate trigger" },
    { area: "Anakapalli", probability: 15, risk: "low", expectedWeek: "W+4", signal: "Declining cases + stable climate" },
    { area: "Eluru", probability: 10, risk: "low", expectedWeek: "W+4", signal: "Low baseline" },
    { area: "Vizianagaram", probability: 22, risk: "low", expectedWeek: "W+4", signal: "Routine seasonal pattern" },
  ],
  districtPredictions: [
    { area: "Tenali", probability: 82, risk: "high", expectedWeek: "W+2", signal: "Cases rising near canal-fed villages; breeding sites confirmed in field surveys", parentDistrict: "Guntur", areaType: "Block" },
    { area: "Mangalagiri", probability: 70, risk: "high", expectedWeek: "W+3", signal: "Semi-urban clustering + hospital OPD spike for fever cases", parentDistrict: "Guntur", areaType: "Municipality" },
    { area: "Amaravathi", probability: 55, risk: "moderate", expectedWeek: "W+3", signal: "Stagnant water near construction sites + canal-side breeding", parentDistrict: "Guntur", areaType: "Block" },
    { area: "Pedakakani", probability: 28, risk: "low", expectedWeek: "W+4", signal: "Low baseline; routine surveillance sufficient", parentDistrict: "Guntur", areaType: "Block" },
    { area: "Guntur West", probability: 18, risk: "low", expectedWeek: "W+4", signal: "Declining cases", parentDistrict: "Guntur", areaType: "Block" },
    { area: "Vizag MC", probability: 85, risk: "high", expectedWeek: "W+2", signal: "Dense urban clustering across wards + waterlogging post-rain + OPD spike", parentDistrict: "Visakhapatnam", areaType: "Municipality" },
    { area: "Bheemunipatnam", probability: 75, risk: "high", expectedWeek: "W+2", signal: "Peri-urban breeding sites + post-rainfall mosquito density rise", parentDistrict: "Visakhapatnam", areaType: "Block" },
    { area: "Gajuwaka", probability: 60, risk: "moderate", expectedWeek: "W+3", signal: "Construction debris + industrial-area stagnant water + TPR spike", parentDistrict: "Visakhapatnam", areaType: "Block" },
    { area: "Pendurthi", probability: 32, risk: "moderate", expectedWeek: "W+4", signal: "Moderate humidity + emerging cluster reports", parentDistrict: "Visakhapatnam", areaType: "Block" },
    { area: "Anakapalle", probability: 15, risk: "low", expectedWeek: "W+4", signal: "Stable climate + low baseline", parentDistrict: "Visakhapatnam", areaType: "Block" },
    { area: "Nandyal", probability: 72, risk: "high", expectedWeek: "W+2", signal: "Rural blocks reporting gradual increase in fever cases + historical April pattern", parentDistrict: "Kurnool", areaType: "Block" },
    { area: "Adoni", probability: 55, risk: "moderate", expectedWeek: "W+3", signal: "TPR increase + favourable climate for vector breeding", parentDistrict: "Kurnool", areaType: "Block" },
    { area: "Kallur", probability: 48, risk: "moderate", expectedWeek: "W+3", signal: "Historical trend + moderate case load in PHC data", parentDistrict: "Kurnool", areaType: "Block" },
    { area: "C.Belagal", probability: 20, risk: "low", expectedWeek: "W+4", signal: "Low baseline; routine PHC monitoring", parentDistrict: "Kurnool", areaType: "Block" },
    { area: "Vijayawada MC", probability: 80, risk: "high", expectedWeek: "W+2", signal: "Urban ward-level spikes + drainage-linked breeding + hospital OPD surge", parentDistrict: "Krishna", areaType: "Municipality" },
    { area: "Machilipatnam", probability: 52, risk: "moderate", expectedWeek: "W+3", signal: "Coastal humidity + historical pattern", parentDistrict: "Krishna", areaType: "Block" },
    { area: "Gudivada", probability: 45, risk: "moderate", expectedWeek: "W+3", signal: "Cases rising in semi-urban pockets", parentDistrict: "Krishna", areaType: "Block" },
    { area: "Nuzvid", probability: 20, risk: "low", expectedWeek: "W+4", signal: "Low baseline", parentDistrict: "Krishna", areaType: "Block" },
  ],
  blockPredictions: [
    { area: "Kollipara", probability: 88, risk: "high", expectedWeek: "W+2", signal: "Canal-side breeding confirmed + cases rising in last 2 weeks", parentDistrict: "Guntur", parentBlock: "Tenali" },
    { area: "Pedaravuru", probability: 66, risk: "moderate", expectedWeek: "W+3", signal: "Stagnant irrigation water + TPR increase at PHC", parentDistrict: "Guntur", parentBlock: "Tenali" },
    { area: "Angalakuduru", probability: 52, risk: "moderate", expectedWeek: "W+4", signal: "Historical trend + moderate breeding index", parentDistrict: "Guntur", parentBlock: "Tenali" },
    { area: "Duggirala", probability: 22, risk: "low", expectedWeek: "W+4", signal: "Declining cases", parentDistrict: "Guntur", parentBlock: "Tenali" },
    { area: "Thagarapuvalasa", probability: 90, risk: "high", expectedWeek: "W+2", signal: "Cases rising + peri-urban breeding sites + post-rainfall density", parentDistrict: "Visakhapatnam", parentBlock: "Bheemunipatnam" },
    { area: "Anandapuram", probability: 70, risk: "high", expectedWeek: "W+3", signal: "TPR spike + ASHA fever-cluster reports", parentDistrict: "Visakhapatnam", parentBlock: "Bheemunipatnam" },
    { area: "Rushikonda", probability: 55, risk: "moderate", expectedWeek: "W+3", signal: "Coastal humidity + tourism-area construction debris", parentDistrict: "Visakhapatnam", parentBlock: "Bheemunipatnam" },
    { area: "Kapuluppada", probability: 20, risk: "low", expectedWeek: "W+4", signal: "Low baseline", parentDistrict: "Visakhapatnam", parentBlock: "Bheemunipatnam" },
    { area: "Mahanandi", probability: 78, risk: "high", expectedWeek: "W+2", signal: "Rural fever-case rise + ASHA field reports of breeding sites", parentDistrict: "Kurnool", parentBlock: "Nandyal" },
    { area: "Banaganapalle", probability: 55, risk: "moderate", expectedWeek: "W+3", signal: "Historical April pattern + moderate climate trigger", parentDistrict: "Kurnool", parentBlock: "Nandyal" },
    { area: "Koilkuntla", probability: 42, risk: "moderate", expectedWeek: "W+3", signal: "Moderate case load + seasonal pattern", parentDistrict: "Kurnool", parentBlock: "Nandyal" },
    { area: "Undavalli", probability: 58, risk: "moderate", expectedWeek: "W+3", signal: "Construction-area stagnant water + canal-side breeding", parentDistrict: "Guntur", parentBlock: "Amaravathi" },
    { area: "Tadepalli", probability: 35, risk: "low", expectedWeek: "W+4", signal: "Stable climate + routine surveillance", parentDistrict: "Guntur", parentBlock: "Amaravathi" },
    { area: "Penumaka", probability: 22, risk: "low", expectedWeek: "W+4", signal: "Low baseline", parentDistrict: "Guntur", parentBlock: "Amaravathi" },
    { area: "Pedagantyada", probability: 62, risk: "moderate", expectedWeek: "W+3", signal: "Industrial-area density + construction debris + TPR spike", parentDistrict: "Visakhapatnam", parentBlock: "Gajuwaka" },
    { area: "Nathayyapalem", probability: 48, risk: "moderate", expectedWeek: "W+3", signal: "Historical trend + moderate humidity", parentDistrict: "Visakhapatnam", parentBlock: "Gajuwaka" },
    { area: "Aganampudi", probability: 25, risk: "low", expectedWeek: "W+4", signal: "Declining cases", parentDistrict: "Visakhapatnam", parentBlock: "Gajuwaka" },
  ],
  municipalityPredictions: [
    { area: "MVP Colony", probability: 92, risk: "high", expectedWeek: "W+2", signal: "Dense urban clustering + waterlogging in low-lying ward areas", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
    { area: "Gajuwaka", probability: 68, risk: "moderate", expectedWeek: "W+3", signal: "Industrial-area construction debris + TPR spike at urban PHC", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
    { area: "Dwaraka Nagar", probability: 50, risk: "moderate", expectedWeek: "W+4", signal: "Commercial-zone density + historical trend", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
    { area: "Akkayyapalem", probability: 25, risk: "low", expectedWeek: "W+4", signal: "Low baseline", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
    { area: "Benz Circle", probability: 85, risk: "high", expectedWeek: "W+2", signal: "Urban clustering + poor drainage in commercial ward + OPD spike", parentDistrict: "Krishna", parentBlock: "Vijayawada MC" },
    { area: "Governorpet", probability: 65, risk: "moderate", expectedWeek: "W+3", signal: "Market-area breeding + TPR increase", parentDistrict: "Krishna", parentBlock: "Vijayawada MC" },
    { area: "Patamata", probability: 55, risk: "moderate", expectedWeek: "W+4", signal: "Residential density + moderate humidity + historical trend", parentDistrict: "Krishna", parentBlock: "Vijayawada MC" },
    { area: "Gunadala", probability: 18, risk: "low", expectedWeek: "W+4", signal: "Low baseline", parentDistrict: "Krishna", parentBlock: "Vijayawada MC" },
    { area: "Mangalagiri Ward 1", probability: 72, risk: "high", expectedWeek: "W+2", signal: "Stagnant water + dense semi-urban clustering", parentDistrict: "Guntur", parentBlock: "Mangalagiri" },
    { area: "Mangalagiri Ward 4", probability: 48, risk: "moderate", expectedWeek: "W+3", signal: "Historical trend + moderate case load", parentDistrict: "Guntur", parentBlock: "Mangalagiri" },
    { area: "Mangalagiri Ward 8", probability: 38, risk: "moderate", expectedWeek: "W+3", signal: "Construction debris + climate conditions favourable", parentDistrict: "Guntur", parentBlock: "Mangalagiri" },
  ],
  hotspotDistrictData: [
    { area: "Krishna", currentCases: 49, prevCases: 32, trend: "up", risk: "high" },
    { area: "Visakhapatnam", currentCases: 65, prevCases: 45, trend: "up", risk: "high" },
    { area: "Guntur", currentCases: 52, prevCases: 60, trend: "down", risk: "high" },
    { area: "East Godavari", currentCases: 47, prevCases: 44, trend: "stable", risk: "high" },
    { area: "West Godavari", currentCases: 42, prevCases: 30, trend: "up", risk: "moderate" },
    { area: "Kurnool", currentCases: 30, prevCases: 28, trend: "stable", risk: "moderate" },
    { area: "Prakasam", currentCases: 31, prevCases: 35, trend: "down", risk: "low" },
  ],
  hotspotSubDistrictData: [
    { area: "Tenali", currentCases: 22, prevCases: 14, trend: "up", risk: "high", parentDistrict: "Guntur" },
    { area: "Mangalagiri", currentCases: 15, prevCases: 10, trend: "up", risk: "high", parentDistrict: "Guntur" },
    { area: "Amaravathi", currentCases: 10, prevCases: 12, trend: "down", risk: "moderate", parentDistrict: "Guntur" },
    { area: "Bheemunipatnam", currentCases: 28, prevCases: 18, trend: "up", risk: "high", parentDistrict: "Visakhapatnam" },
    { area: "Vizag MC", currentCases: 20, prevCases: 14, trend: "up", risk: "high", parentDistrict: "Visakhapatnam" },
    { area: "Gajuwaka", currentCases: 12, prevCases: 10, trend: "stable", risk: "moderate", parentDistrict: "Visakhapatnam" },
    { area: "Nandyal", currentCases: 14, prevCases: 8, trend: "up", risk: "high", parentDistrict: "Kurnool" },
    { area: "Adoni", currentCases: 9, prevCases: 10, trend: "down", risk: "moderate", parentDistrict: "Kurnool" },
    { area: "Kallur", currentCases: 5, prevCases: 6, trend: "stable", risk: "moderate", parentDistrict: "Kurnool" },
    { area: "Vijayawada MC", currentCases: 22, prevCases: 15, trend: "up", risk: "high", parentDistrict: "Krishna" },
    { area: "Machilipatnam", currentCases: 14, prevCases: 10, trend: "up", risk: "moderate", parentDistrict: "Krishna" },
  ],
  hotspotVillageData: [
    { area: "Kollipara", currentCases: 9, prevCases: 5, trend: "up", risk: "high", parentDistrict: "Guntur", parentBlock: "Tenali" },
    { area: "Pedaravuru", currentCases: 7, prevCases: 5, trend: "up", risk: "moderate", parentDistrict: "Guntur", parentBlock: "Tenali" },
    { area: "Angalakuduru", currentCases: 4, prevCases: 4, trend: "stable", risk: "moderate", parentDistrict: "Guntur", parentBlock: "Tenali" },
    { area: "Thagarapuvalasa", currentCases: 12, prevCases: 7, trend: "up", risk: "high", parentDistrict: "Visakhapatnam", parentBlock: "Bheemunipatnam" },
    { area: "Anandapuram", currentCases: 9, prevCases: 6, trend: "up", risk: "high", parentDistrict: "Visakhapatnam", parentBlock: "Bheemunipatnam" },
    { area: "Rushikonda", currentCases: 5, prevCases: 4, trend: "stable", risk: "moderate", parentDistrict: "Visakhapatnam", parentBlock: "Bheemunipatnam" },
    { area: "MVP Colony", currentCases: 8, prevCases: 4, trend: "up", risk: "high", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
    { area: "Gajuwaka", currentCases: 5, prevCases: 4, trend: "up", risk: "moderate", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
    { area: "Dwaraka Nagar", currentCases: 4, prevCases: 3, trend: "stable", risk: "moderate", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
    { area: "Benz Circle", currentCases: 9, prevCases: 5, trend: "up", risk: "high", parentDistrict: "Krishna", parentBlock: "Vijayawada MC" },
    { area: "Governorpet", currentCases: 6, prevCases: 5, trend: "stable", risk: "moderate", parentDistrict: "Krishna", parentBlock: "Vijayawada MC" },
    { area: "Patamata", currentCases: 4, prevCases: 4, trend: "stable", risk: "moderate", parentDistrict: "Krishna", parentBlock: "Vijayawada MC" },
    { area: "Mahanandi", currentCases: 6, prevCases: 3, trend: "up", risk: "high", parentDistrict: "Kurnool", parentBlock: "Nandyal" },
    { area: "Banaganapalle", currentCases: 4, prevCases: 4, trend: "stable", risk: "moderate", parentDistrict: "Kurnool", parentBlock: "Nandyal" },
  ],
  hotspotAlerts: [
    { id: 1, district: "Visakhapatnam", message: "Clustering of fever cases reported in Visakhapatnam urban wards (MVP Colony, Gajuwaka)", severity: "high" },
    { id: 2, district: "Guntur", message: "Increased mosquito breeding observed along canal networks in Guntur district", severity: "high" },
    { id: 3, district: "Krishna", message: "Urban clustering reported in Vijayawada wards — drainage-linked breeding suspected", severity: "high" },
    { id: 4, district: "Kurnool", message: "Rural blocks in Kurnool reporting gradual increase in fever cases", severity: "moderate" },
  ],
  newsAlerts: [
    { id: 1, headline: "Clustering of fever cases reported in Visakhapatnam urban wards", source: "The Hindu", date: "2026-04-10", district: "Visakhapatnam", severity: "high" },
    { id: 2, headline: "Increased mosquito breeding observed along canal networks in Guntur district", source: "Eenadu", date: "2026-04-09", district: "Guntur", severity: "high" },
    { id: 3, headline: "Urban clustering and drainage issues drive case rise in Vijayawada wards", source: "Deccan Chronicle", date: "2026-04-08", district: "Krishna", severity: "high" },
    { id: 4, headline: "Rural blocks in Kurnool reporting gradual increase in fever cases", source: "Andhra Jyothy", date: "2026-04-07", district: "Kurnool", severity: "moderate" },
    { id: 5, headline: "Post-rainfall breeding sites flagged in East Godavari delta", source: "Field Report", date: "2026-04-06", district: "East Godavari", severity: "moderate" },
  ],
  geoTaggedAlerts: [
    { id: 1, lat: 17.74, lng: 83.32, message: "Urban ward clustering — MVP Colony fever cluster reported", district: "Visakhapatnam", severity: "high" },
    { id: 2, lat: 16.24, lng: 80.64, message: "Canal-side breeding sites confirmed in Tenali villages", district: "Guntur", severity: "high" },
    { id: 3, lat: 16.53, lng: 80.67, message: "Drainage-linked breeding + OPD spike near Benz Circle", district: "Krishna", severity: "high" },
    { id: 4, lat: 15.48, lng: 78.48, message: "ASHA reports gradual fever rise in Nandyal rural pockets", district: "Kurnool", severity: "moderate" },
    { id: 5, lat: 17.0, lng: 81.78, message: "Post-rainfall breeding flagged in delta region", district: "East Godavari", severity: "moderate" },
  ],
  lineListingData: [
    { patient: "Afrid", gender: "Male", age: 10, subDistrict: "Kallur", block: "Kallur", village: "Kallur", district: "Kurnool", diagnosis: "Dengue", testType: "NS1", testResult: "Positive", dateOfTesting: "2026-03-15", urbanRural: "Rural", referredBy: "ASHA" },
    { patient: "Suresh", gender: "Male", age: 15, subDistrict: "C.Belagal", block: "C.Belagal", village: "C.Belagal", district: "Kurnool", diagnosis: "Dengue", testType: "IgM", testResult: "Positive", dateOfTesting: "2026-03-22", urbanRural: "Rural", referredBy: "ASHA" },
    { patient: "D Umesh Reddy", gender: "Male", age: 21, subDistrict: "Guntur West", block: "Guntur West", village: "Guntur West", district: "Guntur", diagnosis: "Dengue", testType: "NS1", testResult: "Positive", dateOfTesting: "2026-03-28", urbanRural: "Urban", referredBy: "MO" },
    { patient: "Lakshmi Devi", gender: "Female", age: 45, subDistrict: "Tenali", block: "Tenali", village: "Kollipara", district: "Guntur", diagnosis: "Dengue", testType: "IgM", testResult: "Positive", dateOfTesting: "2026-04-03", urbanRural: "Rural", referredBy: "ANM" },
    { patient: "Mohan Rao", gender: "Male", age: 28, subDistrict: "Vizag MC", block: "Vizag MC", village: "MVP Colony", district: "Visakhapatnam", diagnosis: "Dengue", testType: "NS1", testResult: "Positive", dateOfTesting: "2026-04-04", urbanRural: "Urban", referredBy: "MO" },
    { patient: "Padma K", gender: "Female", age: 36, subDistrict: "Vijayawada MC", block: "Vijayawada MC", village: "Benz Circle", district: "Krishna", diagnosis: "Dengue", testType: "NS1", testResult: "Positive", dateOfTesting: "2026-04-05", urbanRural: "Urban", referredBy: "HW" },
  ],
  mapCenter: [15.9129, 79.74],
  mapZoom: 7,
  districtCoordinates: {
    "East Godavari": [17.0, 81.8], "Krishna": [16.6, 80.6], "S.P.S. Nellore": [14.4, 79.9], "Prakasam": [15.3, 79.4],
    "Srikakulam": [18.3, 84.0], "Visakhapatnam": [17.7, 83.3], "Vizianagaram": [18.1, 83.4], "West Godavari": [16.9, 81.2],
    "Guntur": [16.3, 80.4], "Kurnool": [15.8, 78.0], "Anakapalli": [17.7, 83.0], "Eluru": [16.7, 81.1],
    "Tenali": [16.24, 80.64], "Mangalagiri": [16.43, 80.57], "Amaravathi": [16.57, 80.36], "Pedakakani": [16.25, 80.48],
    "Guntur West": [16.31, 80.38], "Bheemunipatnam": [17.89, 83.45], "Vizag MC": [17.72, 83.30], "Gajuwaka": [17.70, 83.22],
    "Pendurthi": [17.76, 83.21], "Anakapalle": [17.69, 83.00], "Nandyal": [15.48, 78.48], "Adoni": [15.63, 77.28],
    "Kallur": [15.69, 78.05], "C.Belagal": [15.70, 78.15], "Vijayawada MC": [16.51, 80.65], "Machilipatnam": [16.19, 81.14],
    "Gudivada": [16.44, 81.10], "Nuzvid": [16.79, 80.85], "Kollipara": [16.22, 80.62], "Pedaravuru": [16.26, 80.66],
    "Angalakuduru": [16.23, 80.60], "Duggirala": [16.32, 80.58], "Thagarapuvalasa": [17.91, 83.47], "Anandapuram": [17.87, 83.43],
    "Rushikonda": [17.78, 83.38], "Kapuluppada": [17.85, 83.45], "Kasimkota": [17.66, 82.97], "Chodavaram": [17.83, 82.93],
    "Mahanandi": [15.58, 78.62], "Banaganapalle": [15.68, 78.23], "Koilkuntla": [15.23, 78.32],
    "Undavalli": [16.50, 80.44], "Tadepalli": [16.47, 80.62], "Penumaka": [16.52, 80.38],
    "Pedagantyada": [17.75, 83.25], "Nathayyapalem": [17.73, 83.20], "Aganampudi": [17.68, 83.18],
    "MVP Colony": [17.74, 83.32], "Dwaraka Nagar": [17.73, 83.26], "Akkayyapalem": [17.70, 83.34], "Seethammadhara": [17.72, 83.30],
    "Benz Circle": [16.53, 80.67], "Governorpet": [16.50, 80.63], "Patamata": [16.49, 80.61], "Gunadala": [16.52, 80.65],
    "Mangalagiri Ward 1": [16.44, 80.59], "Mangalagiri Ward 4": [16.42, 80.55], "Mangalagiri Ward 8": [16.45, 80.57],
  },
  riskForecast: [
    { week: "W+1", risk: "moderate", cases: 45, label: "8–14 Apr 2026" },
    { week: "W+2", risk: "high", cases: 68, label: "15–21 Apr 2026" },
    { week: "W+3", risk: "high", cases: 92, label: "22–28 Apr 2026" },
    { week: "W+4", risk: "moderate", cases: 71, label: "29 Apr–5 May" },
  ],
  weeklyTimeSeries: [
    { week: "W-9", date: "3–9 Feb", positive: 8, samples: 45, tpr: 17.8 },
    { week: "W-8", date: "10–16 Feb", positive: 12, samples: 52, tpr: 23.1 },
    { week: "W-7", date: "17–23 Feb", positive: 10, samples: 48, tpr: 20.8 },
    { week: "W-6", date: "24 Feb–2 Mar", positive: 15, samples: 60, tpr: 25.0 },
    { week: "W-5", date: "3–9 Mar", positive: 18, samples: 65, tpr: 27.7 },
    { week: "W-4", date: "10–16 Mar", positive: 14, samples: 58, tpr: 24.1 },
    { week: "W-3", date: "17–23 Mar", positive: 20, samples: 72, tpr: 27.8 },
    { week: "W-2", date: "24–30 Mar", positive: 16, samples: 62, tpr: 25.8 },
    { week: "W-1", date: "31 Mar–6 Apr", positive: 22, samples: 78, tpr: 28.2 },
    { week: "W0", date: "7–13 Apr", positive: 19, samples: 70, tpr: 27.1 },
  ],
  dailyTimeSeries: Array.from({ length: 30 }, (_, i) => ({ date: `Mar ${i + 1}`, positive: [2,3,2,4,3,5,4,3,5,6,4,5,7,6,5,4,6,7,8,6,5,7,8,9,7,6,8,9,10,8][i], samples: 12 + (i % 5) * 3, tpr: Math.round((15 + (i % 7) * 2.5) * 10) / 10 })),
  monthlyTimeSeries: [
    { month: "Nov", positive: 45, samples: 180, tpr: 25.0 },
    { month: "Dec", positive: 38, samples: 160, tpr: 23.8 },
    { month: "Jan", positive: 52, samples: 210, tpr: 24.8 },
    { month: "Feb", positive: 65, samples: 270, tpr: 24.1 },
    { month: "Mar", positive: 90, samples: 350, tpr: 25.7 },
  ],
  forecastData: [
    { week: "W-11", actual: 4, predicted: null, lower: null, upper: null, type: "Historical" },
    { week: "W-10", actual: 3, predicted: null, lower: null, upper: null, type: "Historical" },
    { week: "W-9", actual: 2, predicted: null, lower: null, upper: null, type: "Historical" },
    { week: "W-8", actual: 3, predicted: null, lower: null, upper: null, type: "Historical" },
    { week: "W-7", actual: 5, predicted: null, lower: null, upper: null, type: "Historical" },
    { week: "W-6", actual: 4, predicted: null, lower: null, upper: null, type: "Historical" },
    { week: "W-5", actual: 6, predicted: null, lower: null, upper: null, type: "Historical" },
    { week: "W-4", actual: 5, predicted: null, lower: null, upper: null, type: "Historical" },
    { week: "W-3", actual: 7, predicted: null, lower: null, upper: null, type: "Historical" },
    { week: "W-2", actual: 8, predicted: null, lower: null, upper: null, type: "Historical" },
    { week: "W-1", actual: 6, predicted: 6, lower: 4, upper: 8, type: "Historical" },
    { week: "W+1", actual: null, predicted: 7, lower: 4, upper: 10, type: "Forecast" },
    { week: "W+2", actual: null, predicted: 9, lower: 5, upper: 13, type: "Forecast" },
    { week: "W+3", actual: null, predicted: 11, lower: 6, upper: 16, type: "Forecast" },
    { week: "W+4", actual: null, predicted: 10, lower: 5, upper: 15, type: "Forecast" },
  ],
  weatherObserved: [
    { week: "W-8", endDate: "10–16 Feb 2026", rainfall: 0.0, temp: 24.5, maxT: 32.0, minT: 17.0, humidity: 28.0 },
    { week: "W-7", endDate: "17–23 Feb 2026", rainfall: 0.5, temp: 25.8, maxT: 33.5, minT: 18.5, humidity: 30.0 },
    { week: "W-6", endDate: "24 Feb–2 Mar 2026", rainfall: 1.2, temp: 27.0, maxT: 35.0, minT: 19.5, humidity: 33.0 },
    { week: "W-5", endDate: "3–9 Mar 2026", rainfall: 0.8, temp: 27.8, maxT: 36.2, minT: 20.0, humidity: 35.5 },
    { week: "W-4", endDate: "10–16 Mar 2026", rainfall: 0.0, temp: 28.8, maxT: 37.0, minT: 20.8, humidity: 20.9 },
    { week: "W-3", endDate: "17–23 Mar 2026", rainfall: 3.4, temp: 25.7, maxT: 34.8, minT: 16.9, humidity: 39.7 },
    { week: "W-2", endDate: "24–31 Mar 2026", rainfall: 3.3, temp: 29.9, maxT: 37.0, minT: 21.8, humidity: 32.1 },
    { week: "W-1", endDate: "1–7 Apr 2026", rainfall: 1.7, temp: 27.8, maxT: 36.3, minT: 20.7, humidity: 37.4 },
  ],
  weatherForecast: [
    { week: "W+1", endDate: "8–14 Apr 2026", rainfall: 5.2, temp: 30.1, maxT: 37.5, minT: 22.0, humidity: 45.0 },
    { week: "W+2", endDate: "15–21 Apr 2026", rainfall: 12.4, temp: 31.2, maxT: 38.0, minT: 23.5, humidity: 52.0 },
    { week: "W+3", endDate: "22–28 Apr 2026", rainfall: 18.6, temp: 32.0, maxT: 38.5, minT: 24.0, humidity: 58.0 },
    { week: "W+4", endDate: "29 Apr–5 May 2026", rainfall: 25.0, temp: 31.5, maxT: 37.8, minT: 24.2, humidity: 62.0 },
    { week: "W+5", endDate: "6–12 May 2026", rainfall: 35.0, temp: 30.8, maxT: 37.0, minT: 24.5, humidity: 68.0 },
    { week: "W+6", endDate: "13–19 May 2026", rainfall: 42.0, temp: 30.2, maxT: 36.5, minT: 24.0, humidity: 72.0 },
    { week: "W+7", endDate: "20–26 May 2026", rainfall: 55.0, temp: 29.5, maxT: 35.8, minT: 23.8, humidity: 75.0 },
    { week: "W+8", endDate: "27 May–2 Jun 2026", rainfall: 65.0, temp: 28.8, maxT: 34.5, minT: 23.5, humidity: 78.0 },
  ],
  dataQualityIssues: [
    { type: "missing_reports", message: "Kallur and C.Belagal blocks (Kurnool) — no reports in last 7 days", severity: "high" },
    { type: "missing_lab", message: "East Godavari — lab confirmation data delayed by 4 days", severity: "moderate" },
    { type: "delayed", message: "Vizianagaram — PHC submissions delayed (>3 days)", severity: "moderate" },
  ],
};

// ──────────────── ODISHA ────────────────
const ODISHA: StateBundle = {
  id: "odisha", label: "Odisha",
  districts: ["All Districts", "Khurda", "Cuttack", "Puri", "Angul", "Balasore", "Ganjam", "Sambalpur", "Sundargarh"],
  blocks: ["All Blocks", "Brahmagiri", "Talcher", "Nilgiri", "Bhubaneswar MC", "Cuttack MC", "Rourkela MC", "Sambalpur MC"],
  regionData: [
    { name: "Balasore", suspected: 720, tested: 680, confirmed: 95, risk: "high", trend: "up", type: "district" },
    { name: "Khurda", suspected: 540, tested: 510, confirmed: 58, risk: "high", trend: "up", type: "district" },
    { name: "Cuttack", suspected: 480, tested: 450, confirmed: 50, risk: "high", trend: "up", type: "district" },
    { name: "Puri", suspected: 210, tested: 200, confirmed: 18, risk: "moderate", trend: "stable", type: "district" },
    { name: "Sundargarh", suspected: 380, tested: 360, confirmed: 44, risk: "high", trend: "up", type: "district" },
    { name: "Angul", suspected: 290, tested: 270, confirmed: 32, risk: "moderate", trend: "stable", type: "district" },
    { name: "Sambalpur", suspected: 220, tested: 205, confirmed: 24, risk: "moderate", trend: "stable", type: "district" },
    { name: "Ganjam", suspected: 260, tested: 240, confirmed: 26, risk: "moderate", trend: "down", type: "district" },
  ],
  subDistrictData: [
    { name: "Nilgiri", suspected: 220, tested: 205, confirmed: 35, risk: "high", trend: "up", type: "block", parentDistrict: "Balasore" },
    { name: "Soro", suspected: 180, tested: 168, confirmed: 28, risk: "high", trend: "up", type: "block", parentDistrict: "Balasore" },
    { name: "Balasore Sadar", suspected: 160, tested: 150, confirmed: 22, risk: "high", trend: "up", type: "block", parentDistrict: "Balasore" },
    { name: "Basta", suspected: 90, tested: 85, confirmed: 10, risk: "moderate", trend: "stable", type: "block", parentDistrict: "Balasore" },
    { name: "Bhubaneswar MC", suspected: 280, tested: 265, confirmed: 32, risk: "high", trend: "up", type: "municipality", parentDistrict: "Khurda" },
    { name: "Jatni", suspected: 110, tested: 102, confirmed: 12, risk: "moderate", trend: "stable", type: "block", parentDistrict: "Khurda" },
    { name: "Banapur", suspected: 80, tested: 75, confirmed: 8, risk: "moderate", trend: "stable", type: "block", parentDistrict: "Khurda" },
    { name: "Begunia", suspected: 60, tested: 56, confirmed: 5, risk: "low", trend: "down", type: "block", parentDistrict: "Khurda" },
    { name: "Cuttack MC", suspected: 240, tested: 225, confirmed: 28, risk: "high", trend: "up", type: "municipality", parentDistrict: "Cuttack" },
    { name: "Salepur", suspected: 100, tested: 95, confirmed: 10, risk: "moderate", trend: "stable", type: "block", parentDistrict: "Cuttack" },
    { name: "Niali", suspected: 80, tested: 75, confirmed: 8, risk: "moderate", trend: "up", type: "block", parentDistrict: "Cuttack" },
    { name: "Brahmagiri", suspected: 60, tested: 56, confirmed: 6, risk: "moderate", trend: "stable", type: "block", parentDistrict: "Puri" },
    { name: "Puri Sadar", suspected: 80, tested: 76, confirmed: 7, risk: "moderate", trend: "stable", type: "block", parentDistrict: "Puri" },
    { name: "Satyabadi", suspected: 50, tested: 47, confirmed: 4, risk: "low", trend: "stable", type: "block", parentDistrict: "Puri" },
    { name: "Rourkela MC", suspected: 220, tested: 210, confirmed: 28, risk: "high", trend: "up", type: "municipality", parentDistrict: "Sundargarh" },
    { name: "Bonai", suspected: 90, tested: 85, confirmed: 10, risk: "moderate", trend: "stable", type: "block", parentDistrict: "Sundargarh" },
    { name: "Rajgangpur", suspected: 70, tested: 66, confirmed: 6, risk: "moderate", trend: "stable", type: "block", parentDistrict: "Sundargarh" },
    { name: "Talcher", suspected: 160, tested: 150, confirmed: 20, risk: "high", trend: "up", type: "block", parentDistrict: "Angul" },
    { name: "Angul Sadar", suspected: 80, tested: 75, confirmed: 8, risk: "moderate", trend: "stable", type: "block", parentDistrict: "Angul" },
    { name: "Kaniha", suspected: 50, tested: 47, confirmed: 4, risk: "low", trend: "down", type: "block", parentDistrict: "Angul" },
    { name: "Sambalpur MC", suspected: 130, tested: 122, confirmed: 14, risk: "moderate", trend: "stable", type: "municipality", parentDistrict: "Sambalpur" },
    { name: "Maneswar", suspected: 50, tested: 47, confirmed: 5, risk: "low", trend: "stable", type: "block", parentDistrict: "Sambalpur" },
    { name: "Berhampur MC", suspected: 150, tested: 140, confirmed: 16, risk: "moderate", trend: "down", type: "municipality", parentDistrict: "Ganjam" },
    { name: "Chatrapur", suspected: 60, tested: 56, confirmed: 5, risk: "low", trend: "down", type: "block", parentDistrict: "Ganjam" },
  ],
  villageData: [
    { name: "Nilgiri Town", suspected: 80, tested: 75, confirmed: 14, risk: "high", trend: "up", type: "village", parentDistrict: "Balasore", parentBlock: "Nilgiri" },
    { name: "Oupada", suspected: 60, tested: 56, confirmed: 10, risk: "high", trend: "up", type: "village", parentDistrict: "Balasore", parentBlock: "Nilgiri" },
    { name: "Berhampur Sasan", suspected: 45, tested: 42, confirmed: 6, risk: "moderate", trend: "up", type: "village", parentDistrict: "Balasore", parentBlock: "Nilgiri" },
    { name: "Kuamara", suspected: 30, tested: 28, confirmed: 3, risk: "low", trend: "stable", type: "village", parentDistrict: "Balasore", parentBlock: "Nilgiri" },
    { name: "Satapada", suspected: 22, tested: 20, confirmed: 3, risk: "moderate", trend: "stable", type: "village", parentDistrict: "Puri", parentBlock: "Brahmagiri" },
    { name: "Bishweswar", suspected: 18, tested: 17, confirmed: 2, risk: "low", trend: "stable", type: "village", parentDistrict: "Puri", parentBlock: "Brahmagiri" },
    { name: "Alarnatha", suspected: 14, tested: 13, confirmed: 1, risk: "low", trend: "down", type: "village", parentDistrict: "Puri", parentBlock: "Brahmagiri" },
    { name: "Nalco Nagar", suspected: 70, tested: 66, confirmed: 10, risk: "high", trend: "up", type: "village", parentDistrict: "Angul", parentBlock: "Talcher" },
    { name: "Talcher Town", suspected: 55, tested: 52, confirmed: 7, risk: "moderate", trend: "up", type: "village", parentDistrict: "Angul", parentBlock: "Talcher" },
    { name: "Hingula", suspected: 30, tested: 28, confirmed: 3, risk: "moderate", trend: "stable", type: "village", parentDistrict: "Angul", parentBlock: "Talcher" },
  ],
  wardData: [
    { name: "Old Town", suspected: 70, tested: 66, confirmed: 10, risk: "high", trend: "up", type: "ward", parentDistrict: "Khurda", parentBlock: "Bhubaneswar MC" },
    { name: "Saheed Nagar", suspected: 55, tested: 52, confirmed: 8, risk: "high", trend: "up", type: "ward", parentDistrict: "Khurda", parentBlock: "Bhubaneswar MC" },
    { name: "Patia", suspected: 45, tested: 42, confirmed: 6, risk: "moderate", trend: "stable", type: "ward", parentDistrict: "Khurda", parentBlock: "Bhubaneswar MC" },
    { name: "Chandrasekharpur", suspected: 35, tested: 32, confirmed: 4, risk: "moderate", trend: "stable", type: "ward", parentDistrict: "Khurda", parentBlock: "Bhubaneswar MC" },
    { name: "Buxi Bazaar", suspected: 60, tested: 56, confirmed: 9, risk: "high", trend: "up", type: "ward", parentDistrict: "Cuttack", parentBlock: "Cuttack MC" },
    { name: "Mangalabag", suspected: 45, tested: 42, confirmed: 6, risk: "moderate", trend: "stable", type: "ward", parentDistrict: "Cuttack", parentBlock: "Cuttack MC" },
    { name: "Bidanasi", suspected: 30, tested: 28, confirmed: 3, risk: "moderate", trend: "stable", type: "ward", parentDistrict: "Cuttack", parentBlock: "Cuttack MC" },
    { name: "Chhend", suspected: 75, tested: 70, confirmed: 12, risk: "high", trend: "up", type: "ward", parentDistrict: "Sundargarh", parentBlock: "Rourkela MC" },
    { name: "Panposh", suspected: 60, tested: 56, confirmed: 9, risk: "high", trend: "up", type: "ward", parentDistrict: "Sundargarh", parentBlock: "Rourkela MC" },
    { name: "Sector 19", suspected: 40, tested: 37, confirmed: 5, risk: "moderate", trend: "stable", type: "ward", parentDistrict: "Sundargarh", parentBlock: "Rourkela MC" },
    { name: "Civil Township", suspected: 30, tested: 28, confirmed: 3, risk: "moderate", trend: "stable", type: "ward", parentDistrict: "Sundargarh", parentBlock: "Rourkela MC" },
    { name: "Modipara", suspected: 40, tested: 37, confirmed: 5, risk: "moderate", trend: "stable", type: "ward", parentDistrict: "Sambalpur", parentBlock: "Sambalpur MC" },
    { name: "Budharaja", suspected: 30, tested: 28, confirmed: 3, risk: "moderate", trend: "stable", type: "ward", parentDistrict: "Sambalpur", parentBlock: "Sambalpur MC" },
  ],
  statePredictions: [
    { area: "Balasore", probability: 88, risk: "high", expectedWeek: "W+2", signal: "Highest case load in state — sustained rise (180→240→310→420 in last 4 weeks)" },
    { area: "Puri", probability: 82, risk: "high", expectedWeek: "W+2", signal: "High forecast risk despite low current cases — tourist influx + coastal mobility + climate" },
    { area: "Khurda", probability: 75, risk: "high", expectedWeek: "W+2", signal: "Urban clustering in Bhubaneswar + drainage-linked breeding" },
    { area: "Cuttack", probability: 70, risk: "high", expectedWeek: "W+3", signal: "Old-town drainage issues + ward-level clustering in Buxi Bazaar" },
    { area: "Sundargarh", probability: 72, risk: "high", expectedWeek: "W+2", signal: "Industrial worker clustering in Rourkela (Chhend, Panposh)" },
    { area: "Angul", probability: 58, risk: "moderate", expectedWeek: "W+3", signal: "Industrial clusters in Talcher (Nalco Nagar) — moderate steady cases" },
    { area: "Sambalpur", probability: 38, risk: "moderate", expectedWeek: "W+4", signal: "Stable trend; routine surveillance" },
    { area: "Ganjam", probability: 30, risk: "low", expectedWeek: "W+4", signal: "Declining cases + low climate trigger" },
  ],
  districtPredictions: [
    { area: "Nilgiri", probability: 90, risk: "high", expectedWeek: "W+2", signal: "Sharpest rise in state — fever cases doubling weekly + ASHA cluster reports", parentDistrict: "Balasore", areaType: "Block" },
    { area: "Soro", probability: 78, risk: "high", expectedWeek: "W+2", signal: "Sustained case rise + breeding sites confirmed in field surveys", parentDistrict: "Balasore", areaType: "Block" },
    { area: "Balasore Sadar", probability: 72, risk: "high", expectedWeek: "W+3", signal: "Urban-periphery clustering + OPD spike at district hospital", parentDistrict: "Balasore", areaType: "Block" },
    { area: "Basta", probability: 45, risk: "moderate", expectedWeek: "W+3", signal: "Moderate baseline + climate favourable", parentDistrict: "Balasore", areaType: "Block" },
    { area: "Bhubaneswar MC", probability: 84, risk: "high", expectedWeek: "W+2", signal: "Dense urban wards (Old Town, Saheed Nagar) + drainage-linked breeding", parentDistrict: "Khurda", areaType: "Municipality" },
    { area: "Jatni", probability: 50, risk: "moderate", expectedWeek: "W+3", signal: "Peri-urban density + historical April pattern", parentDistrict: "Khurda", areaType: "Block" },
    { area: "Banapur", probability: 38, risk: "moderate", expectedWeek: "W+4", signal: "Moderate climate trigger + low baseline", parentDistrict: "Khurda", areaType: "Block" },
    { area: "Begunia", probability: 18, risk: "low", expectedWeek: "W+4", signal: "Declining cases", parentDistrict: "Khurda", areaType: "Block" },
    { area: "Cuttack MC", probability: 80, risk: "high", expectedWeek: "W+2", signal: "Old-city drainage issues + Buxi Bazaar ward clustering + OPD surge", parentDistrict: "Cuttack", areaType: "Municipality" },
    { area: "Salepur", probability: 48, risk: "moderate", expectedWeek: "W+3", signal: "Riverine humidity + moderate baseline", parentDistrict: "Cuttack", areaType: "Block" },
    { area: "Niali", probability: 42, risk: "moderate", expectedWeek: "W+3", signal: "Cases rising in semi-urban pockets", parentDistrict: "Cuttack", areaType: "Block" },
    { area: "Brahmagiri", probability: 78, risk: "high", expectedWeek: "W+2", signal: "Tourist influx + coastal humidity — high forecast despite low current cases", parentDistrict: "Puri", areaType: "Block" },
    { area: "Puri Sadar", probability: 82, risk: "high", expectedWeek: "W+2", signal: "Tourist mobility + religious gathering season — vector exposure rising", parentDistrict: "Puri", areaType: "Block" },
    { area: "Satyabadi", probability: 35, risk: "moderate", expectedWeek: "W+4", signal: "Coastal humidity + low baseline", parentDistrict: "Puri", areaType: "Block" },
    { area: "Rourkela MC", probability: 82, risk: "high", expectedWeek: "W+2", signal: "Industrial worker clustering in Chhend + Panposh — localized ward spikes", parentDistrict: "Sundargarh", areaType: "Municipality" },
    { area: "Bonai", probability: 45, risk: "moderate", expectedWeek: "W+3", signal: "Mining-area stagnant water + moderate climate trigger", parentDistrict: "Sundargarh", areaType: "Block" },
    { area: "Rajgangpur", probability: 35, risk: "moderate", expectedWeek: "W+4", signal: "Industrial peri-urban density + historical pattern", parentDistrict: "Sundargarh", areaType: "Block" },
    { area: "Talcher", probability: 70, risk: "high", expectedWeek: "W+2", signal: "Coal-belt industrial clustering (Nalco Nagar) + worker-camp density", parentDistrict: "Angul", areaType: "Block" },
    { area: "Angul Sadar", probability: 45, risk: "moderate", expectedWeek: "W+3", signal: "Moderate baseline + favourable climate", parentDistrict: "Angul", areaType: "Block" },
    { area: "Kaniha", probability: 22, risk: "low", expectedWeek: "W+4", signal: "Declining cases", parentDistrict: "Angul", areaType: "Block" },
    { area: "Sambalpur MC", probability: 42, risk: "moderate", expectedWeek: "W+3", signal: "Urban density + riverine humidity", parentDistrict: "Sambalpur", areaType: "Municipality" },
    { area: "Maneswar", probability: 22, risk: "low", expectedWeek: "W+4", signal: "Low baseline", parentDistrict: "Sambalpur", areaType: "Block" },
    { area: "Berhampur MC", probability: 40, risk: "moderate", expectedWeek: "W+3", signal: "Coastal humidity + stable baseline", parentDistrict: "Ganjam", areaType: "Municipality" },
    { area: "Chatrapur", probability: 18, risk: "low", expectedWeek: "W+4", signal: "Low baseline", parentDistrict: "Ganjam", areaType: "Block" },
  ],
  blockPredictions: [
    { area: "Nilgiri Town", probability: 92, risk: "high", expectedWeek: "W+2", signal: "Sharp rise in fever cases — village-level cluster confirmed", parentDistrict: "Balasore", parentBlock: "Nilgiri" },
    { area: "Oupada", probability: 80, risk: "high", expectedWeek: "W+2", signal: "Breeding sites confirmed in field surveys + ASHA cluster reports", parentDistrict: "Balasore", parentBlock: "Nilgiri" },
    { area: "Berhampur Sasan", probability: 60, risk: "moderate", expectedWeek: "W+3", signal: "Moderate rise + favourable climate", parentDistrict: "Balasore", parentBlock: "Nilgiri" },
    { area: "Kuamara", probability: 25, risk: "low", expectedWeek: "W+4", signal: "Stable baseline", parentDistrict: "Balasore", parentBlock: "Nilgiri" },
    { area: "Satapada", probability: 78, risk: "high", expectedWeek: "W+2", signal: "Coastal mobility + tourist influx via Chilika lake — high forecast", parentDistrict: "Puri", parentBlock: "Brahmagiri" },
    { area: "Bishweswar", probability: 50, risk: "moderate", expectedWeek: "W+3", signal: "Coastal humidity + moderate baseline", parentDistrict: "Puri", parentBlock: "Brahmagiri" },
    { area: "Alarnatha", probability: 22, risk: "low", expectedWeek: "W+4", signal: "Low baseline", parentDistrict: "Puri", parentBlock: "Brahmagiri" },
    { area: "Nalco Nagar", probability: 78, risk: "high", expectedWeek: "W+2", signal: "Industrial worker camps + dense housing — Aedes density rising", parentDistrict: "Angul", parentBlock: "Talcher" },
    { area: "Talcher Town", probability: 60, risk: "moderate", expectedWeek: "W+3", signal: "Coal-belt urban density + moderate baseline", parentDistrict: "Angul", parentBlock: "Talcher" },
    { area: "Hingula", probability: 35, risk: "moderate", expectedWeek: "W+4", signal: "Mining-area stagnant water", parentDistrict: "Angul", parentBlock: "Talcher" },
  ],
  municipalityPredictions: [
    { area: "Old Town", probability: 88, risk: "high", expectedWeek: "W+2", signal: "Dense ward + heritage-area drainage issues + waterlogging", parentDistrict: "Khurda", parentBlock: "Bhubaneswar MC" },
    { area: "Saheed Nagar", probability: 75, risk: "high", expectedWeek: "W+2", signal: "Commercial-zone clustering + construction debris", parentDistrict: "Khurda", parentBlock: "Bhubaneswar MC" },
    { area: "Patia", probability: 50, risk: "moderate", expectedWeek: "W+3", signal: "IT-corridor density + moderate baseline", parentDistrict: "Khurda", parentBlock: "Bhubaneswar MC" },
    { area: "Chandrasekharpur", probability: 40, risk: "moderate", expectedWeek: "W+4", signal: "Residential density + climate favourable", parentDistrict: "Khurda", parentBlock: "Bhubaneswar MC" },
    { area: "Buxi Bazaar", probability: 84, risk: "high", expectedWeek: "W+2", signal: "Old-town drainage + commercial-area density + OPD spike", parentDistrict: "Cuttack", parentBlock: "Cuttack MC" },
    { area: "Mangalabag", probability: 55, risk: "moderate", expectedWeek: "W+3", signal: "Market-area breeding + moderate baseline", parentDistrict: "Cuttack", parentBlock: "Cuttack MC" },
    { area: "Bidanasi", probability: 35, risk: "moderate", expectedWeek: "W+4", signal: "Riverine humidity + low baseline", parentDistrict: "Cuttack", parentBlock: "Cuttack MC" },
    { area: "Chhend", probability: 88, risk: "high", expectedWeek: "W+2", signal: "Industrial worker clustering + dense housing — sharpest ward-level spike", parentDistrict: "Sundargarh", parentBlock: "Rourkela MC" },
    { area: "Panposh", probability: 78, risk: "high", expectedWeek: "W+2", signal: "Worker-camp density + stagnant water near steel plant", parentDistrict: "Sundargarh", parentBlock: "Rourkela MC" },
    { area: "Sector 19", probability: 50, risk: "moderate", expectedWeek: "W+3", signal: "Township density + moderate baseline", parentDistrict: "Sundargarh", parentBlock: "Rourkela MC" },
    { area: "Civil Township", probability: 35, risk: "moderate", expectedWeek: "W+4", signal: "Stable baseline", parentDistrict: "Sundargarh", parentBlock: "Rourkela MC" },
    { area: "Modipara", probability: 45, risk: "moderate", expectedWeek: "W+3", signal: "Urban density + riverine humidity", parentDistrict: "Sambalpur", parentBlock: "Sambalpur MC" },
    { area: "Budharaja", probability: 35, risk: "moderate", expectedWeek: "W+4", signal: "Moderate baseline", parentDistrict: "Sambalpur", parentBlock: "Sambalpur MC" },
  ],
  hotspotDistrictData: [
    { area: "Balasore", currentCases: 95, prevCases: 62, trend: "up", risk: "high" },
    { area: "Khurda", currentCases: 58, prevCases: 42, trend: "up", risk: "high" },
    { area: "Cuttack", currentCases: 50, prevCases: 38, trend: "up", risk: "high" },
    { area: "Sundargarh", currentCases: 44, prevCases: 30, trend: "up", risk: "high" },
    { area: "Angul", currentCases: 32, prevCases: 30, trend: "stable", risk: "moderate" },
    { area: "Sambalpur", currentCases: 24, prevCases: 22, trend: "stable", risk: "moderate" },
    { area: "Ganjam", currentCases: 26, prevCases: 32, trend: "down", risk: "moderate" },
    { area: "Puri", currentCases: 18, prevCases: 20, trend: "stable", risk: "moderate" },
  ],
  hotspotSubDistrictData: [
    { area: "Nilgiri", currentCases: 35, prevCases: 18, trend: "up", risk: "high", parentDistrict: "Balasore" },
    { area: "Soro", currentCases: 28, prevCases: 16, trend: "up", risk: "high", parentDistrict: "Balasore" },
    { area: "Balasore Sadar", currentCases: 22, prevCases: 14, trend: "up", risk: "high", parentDistrict: "Balasore" },
    { area: "Bhubaneswar MC", currentCases: 32, prevCases: 22, trend: "up", risk: "high", parentDistrict: "Khurda" },
    { area: "Jatni", currentCases: 12, prevCases: 10, trend: "stable", risk: "moderate", parentDistrict: "Khurda" },
    { area: "Cuttack MC", currentCases: 28, prevCases: 18, trend: "up", risk: "high", parentDistrict: "Cuttack" },
    { area: "Salepur", currentCases: 10, prevCases: 9, trend: "stable", risk: "moderate", parentDistrict: "Cuttack" },
    { area: "Brahmagiri", currentCases: 6, prevCases: 7, trend: "stable", risk: "moderate", parentDistrict: "Puri" },
    { area: "Puri Sadar", currentCases: 7, prevCases: 8, trend: "stable", risk: "moderate", parentDistrict: "Puri" },
    { area: "Rourkela MC", currentCases: 28, prevCases: 16, trend: "up", risk: "high", parentDistrict: "Sundargarh" },
    { area: "Bonai", currentCases: 10, prevCases: 9, trend: "stable", risk: "moderate", parentDistrict: "Sundargarh" },
    { area: "Talcher", currentCases: 20, prevCases: 14, trend: "up", risk: "high", parentDistrict: "Angul" },
    { area: "Angul Sadar", currentCases: 8, prevCases: 9, trend: "stable", risk: "moderate", parentDistrict: "Angul" },
    { area: "Sambalpur MC", currentCases: 14, prevCases: 12, trend: "stable", risk: "moderate", parentDistrict: "Sambalpur" },
    { area: "Berhampur MC", currentCases: 16, prevCases: 22, trend: "down", risk: "moderate", parentDistrict: "Ganjam" },
  ],
  hotspotVillageData: [
    { area: "Nilgiri Town", currentCases: 14, prevCases: 6, trend: "up", risk: "high", parentDistrict: "Balasore", parentBlock: "Nilgiri" },
    { area: "Oupada", currentCases: 10, prevCases: 5, trend: "up", risk: "high", parentDistrict: "Balasore", parentBlock: "Nilgiri" },
    { area: "Berhampur Sasan", currentCases: 6, prevCases: 4, trend: "up", risk: "moderate", parentDistrict: "Balasore", parentBlock: "Nilgiri" },
    { area: "Satapada", currentCases: 3, prevCases: 4, trend: "stable", risk: "moderate", parentDistrict: "Puri", parentBlock: "Brahmagiri" },
    { area: "Bishweswar", currentCases: 2, prevCases: 2, trend: "stable", risk: "low", parentDistrict: "Puri", parentBlock: "Brahmagiri" },
    { area: "Old Town", currentCases: 10, prevCases: 5, trend: "up", risk: "high", parentDistrict: "Khurda", parentBlock: "Bhubaneswar MC" },
    { area: "Saheed Nagar", currentCases: 8, prevCases: 5, trend: "up", risk: "high", parentDistrict: "Khurda", parentBlock: "Bhubaneswar MC" },
    { area: "Patia", currentCases: 6, prevCases: 5, trend: "stable", risk: "moderate", parentDistrict: "Khurda", parentBlock: "Bhubaneswar MC" },
    { area: "Buxi Bazaar", currentCases: 9, prevCases: 5, trend: "up", risk: "high", parentDistrict: "Cuttack", parentBlock: "Cuttack MC" },
    { area: "Mangalabag", currentCases: 6, prevCases: 5, trend: "stable", risk: "moderate", parentDistrict: "Cuttack", parentBlock: "Cuttack MC" },
    { area: "Chhend", currentCases: 12, prevCases: 5, trend: "up", risk: "high", parentDistrict: "Sundargarh", parentBlock: "Rourkela MC" },
    { area: "Panposh", currentCases: 9, prevCases: 5, trend: "up", risk: "high", parentDistrict: "Sundargarh", parentBlock: "Rourkela MC" },
    { area: "Sector 19", currentCases: 5, prevCases: 4, trend: "stable", risk: "moderate", parentDistrict: "Sundargarh", parentBlock: "Rourkela MC" },
    { area: "Nalco Nagar", currentCases: 10, prevCases: 5, trend: "up", risk: "high", parentDistrict: "Angul", parentBlock: "Talcher" },
    { area: "Talcher Town", currentCases: 7, prevCases: 5, trend: "up", risk: "moderate", parentDistrict: "Angul", parentBlock: "Talcher" },
  ],
  hotspotAlerts: [
    { id: 1, district: "Balasore", message: "High case load observed in Balasore — sustained rise across Nilgiri & Soro blocks", severity: "high" },
    { id: 2, district: "Sundargarh", message: "Industrial worker clustering in Sundargarh — Chhend & Panposh wards (Rourkela)", severity: "high" },
    { id: 3, district: "Khurda", message: "Urban clustering in Bhubaneswar Old Town — drainage-linked breeding suspected", severity: "high" },
    { id: 4, district: "Puri", message: "Tourist influx contributing to risk in Puri — high forecast despite low current cases", severity: "moderate" },
  ],
  newsAlerts: [
    { id: 1, headline: "Balasore reports sharp rise in fever cases — health teams deployed", source: "OdishaTV", date: "2026-04-10", district: "Balasore", severity: "high" },
    { id: 2, headline: "Industrial worker clusters in Rourkela flagged by district surveillance", source: "Sambad", date: "2026-04-09", district: "Sundargarh", severity: "high" },
    { id: 3, headline: "Bhubaneswar Old Town drainage issues drive urban dengue clustering", source: "The Pioneer", date: "2026-04-08", district: "Khurda", severity: "high" },
    { id: 4, headline: "Tourist influx to Puri raises vector-borne disease concerns", source: "Dharitri", date: "2026-04-07", district: "Puri", severity: "moderate" },
    { id: 5, headline: "Talcher coal belt: industrial-area larval surveys intensified", source: "Field Report", date: "2026-04-06", district: "Angul", severity: "moderate" },
  ],
  geoTaggedAlerts: [
    { id: 1, lat: 21.50, lng: 86.93, message: "Cluster of fever cases in Nilgiri block villages", district: "Balasore", severity: "high" },
    { id: 2, lat: 22.22, lng: 84.86, message: "Industrial worker clustering — Chhend & Panposh wards", district: "Sundargarh", severity: "high" },
    { id: 3, lat: 20.27, lng: 85.84, message: "Old Town drainage hotspot + urban clustering", district: "Khurda", severity: "high" },
    { id: 4, lat: 19.81, lng: 85.83, message: "Tourist mobility risk — coastal Puri", district: "Puri", severity: "moderate" },
    { id: 5, lat: 20.95, lng: 85.22, message: "Industrial-area breeding flagged in Talcher (Nalco Nagar)", district: "Angul", severity: "moderate" },
  ],
  lineListingData: [
    { patient: "Sanjay Sahoo", gender: "Male", age: 24, subDistrict: "Nilgiri", block: "Nilgiri", village: "Nilgiri Town", district: "Balasore", diagnosis: "Dengue", testType: "NS1", testResult: "Positive", dateOfTesting: "2026-03-28", urbanRural: "Rural", referredBy: "ASHA" },
    { patient: "Pratima Das", gender: "Female", age: 31, subDistrict: "Nilgiri", block: "Nilgiri", village: "Oupada", district: "Balasore", diagnosis: "Dengue", testType: "IgM", testResult: "Positive", dateOfTesting: "2026-03-30", urbanRural: "Rural", referredBy: "ANM" },
    { patient: "Manoj Mohanty", gender: "Male", age: 42, subDistrict: "Bhubaneswar MC", block: "Bhubaneswar MC", village: "Old Town", district: "Khurda", diagnosis: "Dengue", testType: "NS1", testResult: "Positive", dateOfTesting: "2026-04-01", urbanRural: "Urban", referredBy: "MO" },
    { patient: "Rashmi Pradhan", gender: "Female", age: 28, subDistrict: "Cuttack MC", block: "Cuttack MC", village: "Buxi Bazaar", district: "Cuttack", diagnosis: "Dengue", testType: "NS1", testResult: "Positive", dateOfTesting: "2026-04-02", urbanRural: "Urban", referredBy: "HW" },
    { patient: "Bikash Minz", gender: "Male", age: 36, subDistrict: "Rourkela MC", block: "Rourkela MC", village: "Chhend", district: "Sundargarh", diagnosis: "Dengue", testType: "NS1", testResult: "Positive", dateOfTesting: "2026-04-03", urbanRural: "Urban", referredBy: "MO" },
    { patient: "Sushant Sethi", gender: "Male", age: 29, subDistrict: "Rourkela MC", block: "Rourkela MC", village: "Panposh", district: "Sundargarh", diagnosis: "Dengue", testType: "IgM", testResult: "Positive", dateOfTesting: "2026-04-04", urbanRural: "Urban", referredBy: "MO" },
    { patient: "Ranjan Kar", gender: "Male", age: 34, subDistrict: "Talcher", block: "Talcher", village: "Nalco Nagar", district: "Angul", diagnosis: "Dengue", testType: "NS1", testResult: "Positive", dateOfTesting: "2026-04-05", urbanRural: "Urban", referredBy: "ASHA" },
    { patient: "Lipika Behera", gender: "Female", age: 22, subDistrict: "Brahmagiri", block: "Brahmagiri", village: "Satapada", district: "Puri", diagnosis: "Dengue", testType: "IgM", testResult: "Positive", dateOfTesting: "2026-04-06", urbanRural: "Rural", referredBy: "ANM" },
  ],
  mapCenter: [20.95, 85.10],
  mapZoom: 7,
  districtCoordinates: {
    "Khurda": [20.18, 85.62], "Cuttack": [20.46, 85.88], "Puri": [19.81, 85.83],
    "Angul": [20.84, 85.10], "Balasore": [21.49, 86.93], "Ganjam": [19.39, 84.88],
    "Sambalpur": [21.47, 83.97], "Sundargarh": [22.12, 84.03],
    "Nilgiri": [21.46, 86.78], "Soro": [21.28, 86.69], "Balasore Sadar": [21.49, 86.93], "Basta": [21.66, 86.97],
    "Bhubaneswar MC": [20.27, 85.84], "Jatni": [20.17, 85.70], "Banapur": [19.78, 85.16], "Begunia": [20.21, 85.36],
    "Cuttack MC": [20.46, 85.88], "Salepur": [20.55, 86.07], "Niali": [20.30, 85.93],
    "Brahmagiri": [19.85, 85.63], "Puri Sadar": [19.81, 85.83], "Satyabadi": [19.87, 85.71],
    "Rourkela MC": [22.22, 84.86], "Bonai": [21.83, 85.14], "Rajgangpur": [22.19, 84.59],
    "Talcher": [20.95, 85.22], "Angul Sadar": [20.84, 85.10], "Kaniha": [21.10, 85.18],
    "Sambalpur MC": [21.47, 83.97], "Maneswar": [21.45, 83.92],
    "Berhampur MC": [19.31, 84.79], "Chatrapur": [19.36, 85.02],
    "Nilgiri Town": [21.46, 86.78], "Oupada": [21.51, 86.65], "Berhampur Sasan": [21.40, 86.85], "Kuamara": [21.55, 86.80],
    "Satapada": [19.65, 85.46], "Bishweswar": [19.82, 85.65], "Alarnatha": [19.88, 85.75],
    "Nalco Nagar": [20.99, 85.20], "Talcher Town": [20.95, 85.22], "Hingula": [21.01, 85.15],
    "Old Town": [20.24, 85.83], "Saheed Nagar": [20.29, 85.83], "Patia": [20.35, 85.81], "Chandrasekharpur": [20.32, 85.81],
    "Buxi Bazaar": [20.46, 85.88], "Mangalabag": [20.46, 85.87], "Bidanasi": [20.50, 85.86],
    "Chhend": [22.20, 84.85], "Panposh": [22.24, 84.83], "Sector 19": [22.24, 84.86], "Civil Township": [22.21, 84.88],
  },
  riskForecast: [
    { week: "W+1", risk: "high", cases: 95, label: "8–14 Apr 2026" },
    { week: "W+2", risk: "high", cases: 130, label: "15–21 Apr 2026" },
    { week: "W+3", risk: "high", cases: 165, label: "22–28 Apr 2026" },
    { week: "W+4", risk: "high", cases: 180, label: "29 Apr–5 May" },
  ],
  weeklyTimeSeries: [
    { week: "W-9", date: "3–9 Feb", positive: 28, samples: 95, tpr: 29.5 },
    { week: "W-8", date: "10–16 Feb", positive: 35, samples: 110, tpr: 31.8 },
    { week: "W-7", date: "17–23 Feb", positive: 42, samples: 125, tpr: 33.6 },
    { week: "W-6", date: "24 Feb–2 Mar", positive: 50, samples: 145, tpr: 34.5 },
    { week: "W-5", date: "3–9 Mar", positive: 58, samples: 160, tpr: 36.3 },
    { week: "W-4", date: "10–16 Mar", positive: 62, samples: 175, tpr: 35.4 },
    { week: "W-3", date: "17–23 Mar", positive: 70, samples: 190, tpr: 36.8 },
    { week: "W-2", date: "24–30 Mar", positive: 78, samples: 210, tpr: 37.1 },
    { week: "W-1", date: "31 Mar–6 Apr", positive: 88, samples: 230, tpr: 38.3 },
    { week: "W0", date: "7–13 Apr", positive: 95, samples: 245, tpr: 38.8 },
  ],
  dailyTimeSeries: Array.from({ length: 30 }, (_, i) => ({ date: `Mar ${i + 1}`, positive: [6,7,8,7,9,10,8,9,11,12,10,11,13,12,11,10,12,13,14,12,13,14,15,14,13,15,16,17,15,16][i], samples: 25 + (i % 5) * 4, tpr: Math.round((28 + (i % 7) * 2) * 10) / 10 })),
  monthlyTimeSeries: [
    { month: "Nov", positive: 95, samples: 320, tpr: 29.7 },
    { month: "Dec", positive: 110, samples: 360, tpr: 30.6 },
    { month: "Jan", positive: 145, samples: 430, tpr: 33.7 },
    { month: "Feb", positive: 195, samples: 540, tpr: 36.1 },
    { month: "Mar", positive: 280, samples: 720, tpr: 38.9 },
  ],
  forecastData: [
    { week: "W-11", actual: 18, predicted: null, lower: null, upper: null, type: "Historical" },
    { week: "W-10", actual: 22, predicted: null, lower: null, upper: null, type: "Historical" },
    { week: "W-9", actual: 28, predicted: null, lower: null, upper: null, type: "Historical" },
    { week: "W-8", actual: 35, predicted: null, lower: null, upper: null, type: "Historical" },
    { week: "W-7", actual: 42, predicted: null, lower: null, upper: null, type: "Historical" },
    { week: "W-6", actual: 50, predicted: null, lower: null, upper: null, type: "Historical" },
    { week: "W-5", actual: 58, predicted: null, lower: null, upper: null, type: "Historical" },
    { week: "W-4", actual: 62, predicted: null, lower: null, upper: null, type: "Historical" },
    { week: "W-3", actual: 70, predicted: null, lower: null, upper: null, type: "Historical" },
    { week: "W-2", actual: 78, predicted: null, lower: null, upper: null, type: "Historical" },
    { week: "W-1", actual: 88, predicted: 86, lower: 78, upper: 95, type: "Historical" },
    { week: "W+1", actual: null, predicted: 100, lower: 88, upper: 115, type: "Forecast" },
    { week: "W+2", actual: null, predicted: 130, lower: 110, upper: 155, type: "Forecast" },
    { week: "W+3", actual: null, predicted: 165, lower: 140, upper: 195, type: "Forecast" },
    { week: "W+4", actual: null, predicted: 180, lower: 150, upper: 215, type: "Forecast" },
  ],
  weatherObserved: [
    { week: "W-8", endDate: "10–16 Feb 2026", rainfall: 2.0, temp: 23.0, maxT: 30.5, minT: 16.0, humidity: 55.0 },
    { week: "W-7", endDate: "17–23 Feb 2026", rainfall: 4.5, temp: 24.5, maxT: 31.5, minT: 17.5, humidity: 58.0 },
    { week: "W-6", endDate: "24 Feb–2 Mar 2026", rainfall: 8.2, temp: 26.0, maxT: 33.0, minT: 18.5, humidity: 62.0 },
    { week: "W-5", endDate: "3–9 Mar 2026", rainfall: 6.8, temp: 27.0, maxT: 34.5, minT: 19.5, humidity: 64.5 },
    { week: "W-4", endDate: "10–16 Mar 2026", rainfall: 12.0, temp: 27.5, maxT: 35.0, minT: 20.0, humidity: 68.0 },
    { week: "W-3", endDate: "17–23 Mar 2026", rainfall: 18.5, temp: 26.8, maxT: 33.8, minT: 19.5, humidity: 72.0 },
    { week: "W-2", endDate: "24–31 Mar 2026", rainfall: 22.3, temp: 28.2, maxT: 35.2, minT: 21.0, humidity: 70.0 },
    { week: "W-1", endDate: "1–7 Apr 2026", rainfall: 15.7, temp: 29.0, maxT: 36.0, minT: 22.0, humidity: 73.5 },
  ],
  weatherForecast: [
    { week: "W+1", endDate: "8–14 Apr 2026", rainfall: 28.0, temp: 29.5, maxT: 36.8, minT: 22.5, humidity: 76.0 },
    { week: "W+2", endDate: "15–21 Apr 2026", rainfall: 42.0, temp: 30.0, maxT: 37.0, minT: 23.0, humidity: 78.0 },
    { week: "W+3", endDate: "22–28 Apr 2026", rainfall: 58.0, temp: 30.2, maxT: 36.8, minT: 23.5, humidity: 80.0 },
    { week: "W+4", endDate: "29 Apr–5 May 2026", rainfall: 72.0, temp: 30.0, maxT: 36.0, minT: 23.5, humidity: 82.0 },
    { week: "W+5", endDate: "6–12 May 2026", rainfall: 88.0, temp: 29.5, maxT: 35.5, minT: 23.8, humidity: 84.0 },
    { week: "W+6", endDate: "13–19 May 2026", rainfall: 105.0, temp: 29.0, maxT: 34.8, minT: 23.5, humidity: 86.0 },
    { week: "W+7", endDate: "20–26 May 2026", rainfall: 125.0, temp: 28.5, maxT: 34.0, minT: 23.2, humidity: 87.0 },
    { week: "W+8", endDate: "27 May–2 Jun 2026", rainfall: 145.0, temp: 28.0, maxT: 33.5, minT: 23.0, humidity: 88.0 },
  ],
  dataQualityIssues: [
    { type: "missing_reports", message: "Satyabadi and Krushnaprasad blocks (Puri) — no reports in last 7 days", severity: "high" },
    { type: "missing_lab", message: "Sundargarh — Rourkela lab confirmation backlog", severity: "high" },
    { type: "delayed", message: "Ganjam — PHC submissions delayed (>3 days)", severity: "moderate" },
    { type: "incomplete", message: "Sambalpur — incomplete entomological survey data", severity: "moderate" },
  ],
};

// ──────────────── KARNATAKA ────────────────
const KARNATAKA: StateBundle = {
  id: "karnataka", label: "Karnataka",
  districts: ["All Districts", "Bengaluru Urban", "Mysuru", "Belagavi", "Udupi"],
  blocks: ["All Blocks", "Yelahanka", "Nanjangud", "Kundapura", "BBMP East Zone", "Mysuru City", "Udupi City"],
  regionData: [
    { name: "Bengaluru Urban", suspected: 820, tested: 780, confirmed: 110, risk: "high", trend: "up", type: "district" },
    { name: "Mysuru", suspected: 420, tested: 395, confirmed: 48, risk: "high", trend: "up", type: "district" },
    { name: "Udupi", suspected: 180, tested: 170, confirmed: 22, risk: "high", trend: "up", type: "district" },
    { name: "Belagavi", suspected: 310, tested: 290, confirmed: 32, risk: "moderate", trend: "stable", type: "district" },
  ],
  subDistrictData: [
    { name: "BBMP East Zone", suspected: 320, tested: 305, confirmed: 42, risk: "high", trend: "up", type: "municipality", parentDistrict: "Bengaluru Urban" },
    { name: "BBMP South Zone", suspected: 260, tested: 248, confirmed: 32, risk: "high", trend: "up", type: "municipality", parentDistrict: "Bengaluru Urban" },
    { name: "Yelahanka", suspected: 140, tested: 132, confirmed: 18, risk: "high", trend: "up", type: "block", parentDistrict: "Bengaluru Urban" },
    { name: "Anekal", suspected: 80, tested: 75, confirmed: 8, risk: "moderate", trend: "stable", type: "block", parentDistrict: "Bengaluru Urban" },
    { name: "Mysuru City", suspected: 220, tested: 210, confirmed: 28, risk: "high", trend: "up", type: "municipality", parentDistrict: "Mysuru" },
    { name: "Nanjangud", suspected: 120, tested: 112, confirmed: 14, risk: "moderate", trend: "up", type: "block", parentDistrict: "Mysuru" },
    { name: "Hunsur", suspected: 80, tested: 75, confirmed: 6, risk: "moderate", trend: "stable", type: "block", parentDistrict: "Mysuru" },
    { name: "Udupi City", suspected: 90, tested: 85, confirmed: 12, risk: "high", trend: "up", type: "municipality", parentDistrict: "Udupi" },
    { name: "Kundapura", suspected: 60, tested: 56, confirmed: 7, risk: "high", trend: "up", type: "block", parentDistrict: "Udupi" },
    { name: "Karkala", suspected: 30, tested: 28, confirmed: 3, risk: "moderate", trend: "up", type: "block", parentDistrict: "Udupi" },
    { name: "Belagavi City", suspected: 140, tested: 132, confirmed: 16, risk: "moderate", trend: "stable", type: "municipality", parentDistrict: "Belagavi" },
    { name: "Bailhongal", suspected: 80, tested: 75, confirmed: 8, risk: "moderate", trend: "stable", type: "block", parentDistrict: "Belagavi" },
    { name: "Khanapur", suspected: 50, tested: 47, confirmed: 4, risk: "low", trend: "down", type: "block", parentDistrict: "Belagavi" },
  ],
  villageData: [
    { name: "Jakkur", suspected: 40, tested: 38, confirmed: 6, risk: "high", trend: "up", type: "village", parentDistrict: "Bengaluru Urban", parentBlock: "Yelahanka" },
    { name: "Attur", suspected: 32, tested: 30, confirmed: 4, risk: "moderate", trend: "up", type: "village", parentDistrict: "Bengaluru Urban", parentBlock: "Yelahanka" },
    { name: "Bagalur", suspected: 20, tested: 18, confirmed: 2, risk: "moderate", trend: "stable", type: "village", parentDistrict: "Bengaluru Urban", parentBlock: "Yelahanka" },
    { name: "Hadinaru", suspected: 35, tested: 32, confirmed: 5, risk: "moderate", trend: "up", type: "village", parentDistrict: "Mysuru", parentBlock: "Nanjangud" },
    { name: "Kalale", suspected: 28, tested: 26, confirmed: 3, risk: "moderate", trend: "stable", type: "village", parentDistrict: "Mysuru", parentBlock: "Nanjangud" },
    { name: "Devanur", suspected: 18, tested: 17, confirmed: 2, risk: "low", trend: "down", type: "village", parentDistrict: "Mysuru", parentBlock: "Nanjangud" },
    { name: "Malpe", suspected: 28, tested: 26, confirmed: 5, risk: "high", trend: "up", type: "village", parentDistrict: "Udupi", parentBlock: "Kundapura" },
    { name: "Gangolli", suspected: 20, tested: 18, confirmed: 3, risk: "moderate", trend: "up", type: "village", parentDistrict: "Udupi", parentBlock: "Kundapura" },
    { name: "Maravanthe", suspected: 14, tested: 13, confirmed: 1, risk: "moderate", trend: "up", type: "village", parentDistrict: "Udupi", parentBlock: "Kundapura" },
  ],
  wardData: [
    { name: "Whitefield", suspected: 80, tested: 76, confirmed: 14, risk: "high", trend: "up", type: "ward", parentDistrict: "Bengaluru Urban", parentBlock: "BBMP East Zone" },
    { name: "Mahadevapura", suspected: 70, tested: 66, confirmed: 11, risk: "high", trend: "up", type: "ward", parentDistrict: "Bengaluru Urban", parentBlock: "BBMP East Zone" },
    { name: "K.R. Puram", suspected: 55, tested: 52, confirmed: 8, risk: "high", trend: "up", type: "ward", parentDistrict: "Bengaluru Urban", parentBlock: "BBMP East Zone" },
    { name: "Hoodi", suspected: 40, tested: 38, confirmed: 5, risk: "moderate", trend: "stable", type: "ward", parentDistrict: "Bengaluru Urban", parentBlock: "BBMP East Zone" },
    { name: "Vijayanagar", suspected: 60, tested: 56, confirmed: 9, risk: "high", trend: "up", type: "ward", parentDistrict: "Mysuru", parentBlock: "Mysuru City" },
    { name: "Kuvempunagar", suspected: 45, tested: 42, confirmed: 6, risk: "moderate", trend: "stable", type: "ward", parentDistrict: "Mysuru", parentBlock: "Mysuru City" },
    { name: "Saraswathipuram", suspected: 30, tested: 28, confirmed: 3, risk: "moderate", trend: "stable", type: "ward", parentDistrict: "Mysuru", parentBlock: "Mysuru City" },
    { name: "Manipal", suspected: 32, tested: 30, confirmed: 5, risk: "high", trend: "up", type: "ward", parentDistrict: "Udupi", parentBlock: "Udupi City" },
    { name: "Brahmagiri (Udupi)", suspected: 22, tested: 20, confirmed: 3, risk: "moderate", trend: "up", type: "ward", parentDistrict: "Udupi", parentBlock: "Udupi City" },
    { name: "Indrali", suspected: 18, tested: 17, confirmed: 2, risk: "moderate", trend: "stable", type: "ward", parentDistrict: "Udupi", parentBlock: "Udupi City" },
  ],
  statePredictions: [
    { area: "Bengaluru Urban", probability: 90, risk: "high", expectedWeek: "W+2", signal: "Construction-site breeding in Bengaluru wards + dense urban clustering" },
    { area: "Udupi", probability: 84, risk: "high", expectedWeek: "W+2", signal: "Rainfall-driven spike in Udupi coastal belt — rising trend post-rainfall" },
    { area: "Mysuru", probability: 70, risk: "high", expectedWeek: "W+3", signal: "Peri-urban spread observed in Mysuru outskirts (Nanjangud, Hunsur)" },
    { area: "Belagavi", probability: 38, risk: "moderate", expectedWeek: "W+4", signal: "Rural vector patterns + stable baseline" },
  ],
  districtPredictions: [
    { area: "BBMP East Zone", probability: 92, risk: "high", expectedWeek: "W+2", signal: "Construction-site breeding (Whitefield, Mahadevapura) + IT-corridor density", parentDistrict: "Bengaluru Urban", areaType: "Municipality" },
    { area: "BBMP South Zone", probability: 78, risk: "high", expectedWeek: "W+2", signal: "Urban density + storm-water drain breeding", parentDistrict: "Bengaluru Urban", areaType: "Municipality" },
    { area: "Yelahanka", probability: 70, risk: "high", expectedWeek: "W+3", signal: "Peri-urban construction + airport-corridor density", parentDistrict: "Bengaluru Urban", areaType: "Block" },
    { area: "Anekal", probability: 38, risk: "moderate", expectedWeek: "W+4", signal: "Peri-urban moderate baseline", parentDistrict: "Bengaluru Urban", areaType: "Block" },
    { area: "Mysuru City", probability: 78, risk: "high", expectedWeek: "W+2", signal: "Urban ward clustering (Vijayanagar) + drainage-linked breeding", parentDistrict: "Mysuru", areaType: "Municipality" },
    { area: "Nanjangud", probability: 60, risk: "moderate", expectedWeek: "W+3", signal: "Peri-urban spread + industrial-area stagnant water", parentDistrict: "Mysuru", areaType: "Block" },
    { area: "Hunsur", probability: 38, risk: "moderate", expectedWeek: "W+4", signal: "Rural baseline + moderate climate trigger", parentDistrict: "Mysuru", areaType: "Block" },
    { area: "Udupi City", probability: 86, risk: "high", expectedWeek: "W+2", signal: "Coastal humidity + rainfall-driven Aedes density rise (Manipal area)", parentDistrict: "Udupi", areaType: "Municipality" },
    { area: "Kundapura", probability: 80, risk: "high", expectedWeek: "W+2", signal: "Coastal fishing harbour breeding (Malpe) + post-rainfall spike", parentDistrict: "Udupi", areaType: "Block" },
    { area: "Karkala", probability: 45, risk: "moderate", expectedWeek: "W+3", signal: "Hinterland humidity + rising trend", parentDistrict: "Udupi", areaType: "Block" },
    { area: "Belagavi City", probability: 45, risk: "moderate", expectedWeek: "W+3", signal: "Urban density + moderate baseline", parentDistrict: "Belagavi", areaType: "Municipality" },
    { area: "Bailhongal", probability: 38, risk: "moderate", expectedWeek: "W+4", signal: "Rural vector patterns + stable trend", parentDistrict: "Belagavi", areaType: "Block" },
    { area: "Khanapur", probability: 18, risk: "low", expectedWeek: "W+4", signal: "Declining cases", parentDistrict: "Belagavi", areaType: "Block" },
  ],
  blockPredictions: [
    { area: "Jakkur", probability: 80, risk: "high", expectedWeek: "W+2", signal: "Construction-site breeding + IT-corridor density", parentDistrict: "Bengaluru Urban", parentBlock: "Yelahanka" },
    { area: "Attur", probability: 60, risk: "moderate", expectedWeek: "W+3", signal: "Peri-urban density + moderate baseline", parentDistrict: "Bengaluru Urban", parentBlock: "Yelahanka" },
    { area: "Bagalur", probability: 35, risk: "moderate", expectedWeek: "W+4", signal: "Rural-urban edge baseline", parentDistrict: "Bengaluru Urban", parentBlock: "Yelahanka" },
    { area: "Hadinaru", probability: 60, risk: "moderate", expectedWeek: "W+3", signal: "Peri-urban spread + canal-side breeding", parentDistrict: "Mysuru", parentBlock: "Nanjangud" },
    { area: "Kalale", probability: 45, risk: "moderate", expectedWeek: "W+3", signal: "Stable trend + moderate humidity", parentDistrict: "Mysuru", parentBlock: "Nanjangud" },
    { area: "Devanur", probability: 22, risk: "low", expectedWeek: "W+4", signal: "Declining cases", parentDistrict: "Mysuru", parentBlock: "Nanjangud" },
    { area: "Malpe", probability: 88, risk: "high", expectedWeek: "W+2", signal: "Fishing harbour stagnant water + post-rainfall mosquito density", parentDistrict: "Udupi", parentBlock: "Kundapura" },
    { area: "Gangolli", probability: 65, risk: "moderate", expectedWeek: "W+3", signal: "Coastal humidity + estuarine breeding sites", parentDistrict: "Udupi", parentBlock: "Kundapura" },
    { area: "Maravanthe", probability: 50, risk: "moderate", expectedWeek: "W+3", signal: "Coastal-belt rainfall-driven density", parentDistrict: "Udupi", parentBlock: "Kundapura" },
  ],
  municipalityPredictions: [
    { area: "Whitefield", probability: 92, risk: "high", expectedWeek: "W+2", signal: "Construction sites + IT-corridor density — sharpest ward spike", parentDistrict: "Bengaluru Urban", parentBlock: "BBMP East Zone" },
    { area: "Mahadevapura", probability: 84, risk: "high", expectedWeek: "W+2", signal: "Storm-water drain breeding + dense apartment clusters", parentDistrict: "Bengaluru Urban", parentBlock: "BBMP East Zone" },
    { area: "K.R. Puram", probability: 72, risk: "high", expectedWeek: "W+3", signal: "Urban-village mix + drainage issues", parentDistrict: "Bengaluru Urban", parentBlock: "BBMP East Zone" },
    { area: "Hoodi", probability: 45, risk: "moderate", expectedWeek: "W+4", signal: "Tech-park density + moderate baseline", parentDistrict: "Bengaluru Urban", parentBlock: "BBMP East Zone" },
    { area: "Vijayanagar", probability: 78, risk: "high", expectedWeek: "W+2", signal: "Dense ward + drainage-linked breeding + OPD spike", parentDistrict: "Mysuru", parentBlock: "Mysuru City" },
    { area: "Kuvempunagar", probability: 55, risk: "moderate", expectedWeek: "W+3", signal: "Residential density + moderate humidity", parentDistrict: "Mysuru", parentBlock: "Mysuru City" },
    { area: "Saraswathipuram", probability: 35, risk: "moderate", expectedWeek: "W+4", signal: "Stable baseline", parentDistrict: "Mysuru", parentBlock: "Mysuru City" },
    { area: "Manipal", probability: 84, risk: "high", expectedWeek: "W+2", signal: "Student-housing density + rainfall-driven breeding", parentDistrict: "Udupi", parentBlock: "Udupi City" },
    { area: "Brahmagiri (Udupi)", probability: 55, risk: "moderate", expectedWeek: "W+3", signal: "Coastal humidity + moderate baseline", parentDistrict: "Udupi", parentBlock: "Udupi City" },
    { area: "Indrali", probability: 38, risk: "moderate", expectedWeek: "W+4", signal: "Stable trend", parentDistrict: "Udupi", parentBlock: "Udupi City" },
  ],
  hotspotDistrictData: [
    { area: "Bengaluru Urban", currentCases: 110, prevCases: 78, trend: "up", risk: "high" },
    { area: "Mysuru", currentCases: 48, prevCases: 32, trend: "up", risk: "high" },
    { area: "Udupi", currentCases: 22, prevCases: 12, trend: "up", risk: "high" },
    { area: "Belagavi", currentCases: 32, prevCases: 30, trend: "stable", risk: "moderate" },
  ],
  hotspotSubDistrictData: [
    { area: "BBMP East Zone", currentCases: 42, prevCases: 26, trend: "up", risk: "high", parentDistrict: "Bengaluru Urban" },
    { area: "BBMP South Zone", currentCases: 32, prevCases: 22, trend: "up", risk: "high", parentDistrict: "Bengaluru Urban" },
    { area: "Yelahanka", currentCases: 18, prevCases: 12, trend: "up", risk: "high", parentDistrict: "Bengaluru Urban" },
    { area: "Anekal", currentCases: 8, prevCases: 8, trend: "stable", risk: "moderate", parentDistrict: "Bengaluru Urban" },
    { area: "Mysuru City", currentCases: 28, prevCases: 18, trend: "up", risk: "high", parentDistrict: "Mysuru" },
    { area: "Nanjangud", currentCases: 14, prevCases: 9, trend: "up", risk: "moderate", parentDistrict: "Mysuru" },
    { area: "Udupi City", currentCases: 12, prevCases: 6, trend: "up", risk: "high", parentDistrict: "Udupi" },
    { area: "Kundapura", currentCases: 7, prevCases: 4, trend: "up", risk: "high", parentDistrict: "Udupi" },
    { area: "Karkala", currentCases: 3, prevCases: 2, trend: "up", risk: "moderate", parentDistrict: "Udupi" },
    { area: "Belagavi City", currentCases: 16, prevCases: 16, trend: "stable", risk: "moderate", parentDistrict: "Belagavi" },
    { area: "Bailhongal", currentCases: 8, prevCases: 8, trend: "stable", risk: "moderate", parentDistrict: "Belagavi" },
  ],
  hotspotVillageData: [
    { area: "Jakkur", currentCases: 6, prevCases: 3, trend: "up", risk: "high", parentDistrict: "Bengaluru Urban", parentBlock: "Yelahanka" },
    { area: "Attur", currentCases: 4, prevCases: 3, trend: "up", risk: "moderate", parentDistrict: "Bengaluru Urban", parentBlock: "Yelahanka" },
    { area: "Whitefield", currentCases: 14, prevCases: 7, trend: "up", risk: "high", parentDistrict: "Bengaluru Urban", parentBlock: "BBMP East Zone" },
    { area: "Mahadevapura", currentCases: 11, prevCases: 6, trend: "up", risk: "high", parentDistrict: "Bengaluru Urban", parentBlock: "BBMP East Zone" },
    { area: "K.R. Puram", currentCases: 8, prevCases: 5, trend: "up", risk: "high", parentDistrict: "Bengaluru Urban", parentBlock: "BBMP East Zone" },
    { area: "Hadinaru", currentCases: 5, prevCases: 3, trend: "up", risk: "moderate", parentDistrict: "Mysuru", parentBlock: "Nanjangud" },
    { area: "Kalale", currentCases: 3, prevCases: 3, trend: "stable", risk: "moderate", parentDistrict: "Mysuru", parentBlock: "Nanjangud" },
    { area: "Vijayanagar", currentCases: 9, prevCases: 5, trend: "up", risk: "high", parentDistrict: "Mysuru", parentBlock: "Mysuru City" },
    { area: "Kuvempunagar", currentCases: 6, prevCases: 5, trend: "stable", risk: "moderate", parentDistrict: "Mysuru", parentBlock: "Mysuru City" },
    { area: "Malpe", currentCases: 5, prevCases: 2, trend: "up", risk: "high", parentDistrict: "Udupi", parentBlock: "Kundapura" },
    { area: "Gangolli", currentCases: 3, prevCases: 2, trend: "up", risk: "moderate", parentDistrict: "Udupi", parentBlock: "Kundapura" },
    { area: "Manipal", currentCases: 5, prevCases: 2, trend: "up", risk: "high", parentDistrict: "Udupi", parentBlock: "Udupi City" },
    { area: "Brahmagiri (Udupi)", currentCases: 3, prevCases: 2, trend: "up", risk: "moderate", parentDistrict: "Udupi", parentBlock: "Udupi City" },
  ],
  hotspotAlerts: [
    { id: 1, district: "Bengaluru Urban", message: "Construction-site breeding in Bengaluru wards (Whitefield, Mahadevapura) — sharp ward-level spike", severity: "high" },
    { id: 2, district: "Udupi", message: "Rainfall-driven spike in Udupi coastal belt — rising trend (Malpe, Manipal)", severity: "high" },
    { id: 3, district: "Mysuru", message: "Peri-urban spread observed in Mysuru outskirts (Nanjangud)", severity: "high" },
  ],
  newsAlerts: [
    { id: 1, headline: "Bengaluru construction sites flagged as dengue breeding hotspots", source: "Deccan Herald", date: "2026-04-10", district: "Bengaluru Urban", severity: "high" },
    { id: 2, headline: "Udupi coastal belt sees post-rainfall fever surge — health teams deployed", source: "The Hindu", date: "2026-04-09", district: "Udupi", severity: "high" },
    { id: 3, headline: "Mysuru city wards report peri-urban dengue clustering", source: "Vijaya Karnataka", date: "2026-04-08", district: "Mysuru", severity: "high" },
    { id: 4, headline: "Malpe fishing harbour drainage issues raise vector-borne concerns", source: "Udayavani", date: "2026-04-07", district: "Udupi", severity: "moderate" },
    { id: 5, headline: "Belagavi rural blocks under routine surveillance", source: "Field Report", date: "2026-04-06", district: "Belagavi", severity: "moderate" },
  ],
  geoTaggedAlerts: [
    { id: 1, lat: 12.97, lng: 77.75, message: "Whitefield construction-site breeding cluster", district: "Bengaluru Urban", severity: "high" },
    { id: 2, lat: 12.30, lng: 76.65, message: "Vijayanagar urban ward clustering", district: "Mysuru", severity: "high" },
    { id: 3, lat: 13.35, lng: 74.70, message: "Malpe harbour breeding hotspot — post-rainfall spike", district: "Udupi", severity: "high" },
    { id: 4, lat: 13.35, lng: 74.79, message: "Manipal student-housing density + rainfall-driven density", district: "Udupi", severity: "high" },
    { id: 5, lat: 15.85, lng: 74.50, message: "Belagavi rural baseline — routine surveillance", district: "Belagavi", severity: "moderate" },
  ],
  lineListingData: [
    { patient: "Arjun Rao", gender: "Male", age: 28, subDistrict: "BBMP East Zone", block: "BBMP East Zone", village: "Whitefield", district: "Bengaluru Urban", diagnosis: "Dengue", testType: "NS1", testResult: "Positive", dateOfTesting: "2026-03-30", urbanRural: "Urban", referredBy: "MO" },
    { patient: "Priya Shetty", gender: "Female", age: 34, subDistrict: "BBMP East Zone", block: "BBMP East Zone", village: "Mahadevapura", district: "Bengaluru Urban", diagnosis: "Dengue", testType: "IgM", testResult: "Positive", dateOfTesting: "2026-04-01", urbanRural: "Urban", referredBy: "HW" },
    { patient: "Suresh Kumar", gender: "Male", age: 42, subDistrict: "Yelahanka", block: "Yelahanka", village: "Jakkur", district: "Bengaluru Urban", diagnosis: "Dengue", testType: "NS1", testResult: "Positive", dateOfTesting: "2026-04-02", urbanRural: "Urban", referredBy: "MO" },
    { patient: "Lakshmi Iyer", gender: "Female", age: 26, subDistrict: "Mysuru City", block: "Mysuru City", village: "Vijayanagar", district: "Mysuru", diagnosis: "Dengue", testType: "NS1", testResult: "Positive", dateOfTesting: "2026-04-03", urbanRural: "Urban", referredBy: "HW" },
    { patient: "Ramesh Gowda", gender: "Male", age: 38, subDistrict: "Nanjangud", block: "Nanjangud", village: "Hadinaru", district: "Mysuru", diagnosis: "Dengue", testType: "IgM", testResult: "Positive", dateOfTesting: "2026-04-04", urbanRural: "Rural", referredBy: "ASHA" },
    { patient: "Vinod Pai", gender: "Male", age: 31, subDistrict: "Udupi City", block: "Udupi City", village: "Manipal", district: "Udupi", diagnosis: "Dengue", testType: "NS1", testResult: "Positive", dateOfTesting: "2026-04-05", urbanRural: "Urban", referredBy: "MO" },
    { patient: "Deepa Kamath", gender: "Female", age: 24, subDistrict: "Kundapura", block: "Kundapura", village: "Malpe", district: "Udupi", diagnosis: "Dengue", testType: "NS1", testResult: "Positive", dateOfTesting: "2026-04-06", urbanRural: "Rural", referredBy: "ANM" },
    { patient: "Mahesh Patil", gender: "Male", age: 45, subDistrict: "Belagavi City", block: "Belagavi City", village: "Belagavi City", district: "Belagavi", diagnosis: "Dengue", testType: "IgM", testResult: "Positive", dateOfTesting: "2026-04-07", urbanRural: "Urban", referredBy: "MO" },
  ],
  mapCenter: [13.50, 76.50],
  mapZoom: 7,
  districtCoordinates: {
    "Bengaluru Urban": [12.97, 77.59], "Mysuru": [12.30, 76.65], "Belagavi": [15.85, 74.50], "Udupi": [13.34, 74.74],
    "BBMP East Zone": [12.98, 77.70], "BBMP South Zone": [12.91, 77.58], "Yelahanka": [13.10, 77.59], "Anekal": [12.71, 77.69],
    "Mysuru City": [12.30, 76.65], "Nanjangud": [12.12, 76.68], "Hunsur": [12.30, 76.29],
    "Udupi City": [13.34, 74.74], "Kundapura": [13.62, 74.69], "Karkala": [13.21, 74.99],
    "Belagavi City": [15.85, 74.50], "Bailhongal": [15.81, 74.85], "Khanapur": [15.64, 74.51],
    "Jakkur": [13.07, 77.61], "Attur": [13.10, 77.65], "Bagalur": [13.13, 77.65],
    "Hadinaru": [12.10, 76.66], "Kalale": [12.14, 76.62], "Devanur": [12.05, 76.72],
    "Malpe": [13.35, 74.70], "Gangolli": [13.66, 74.66], "Maravanthe": [13.71, 74.65],
    "Whitefield": [12.97, 77.75], "Mahadevapura": [12.99, 77.69], "K.R. Puram": [13.01, 77.69], "Hoodi": [12.99, 77.71],
    "Vijayanagar": [12.32, 76.62], "Kuvempunagar": [12.30, 76.62], "Saraswathipuram": [12.32, 76.65],
    "Manipal": [13.35, 74.79], "Brahmagiri (Udupi)": [13.34, 74.75], "Indrali": [13.32, 74.74],
  },
};

// ──────────────── State registry & active state ────────────────
export const stateBundles: Record<StateId, StateBundle> = { andhra_pradesh: AP, odisha: ODISHA, karnataka: KARNATAKA };
export const stateOptions: { id: StateId; label: string }[] = [
  { id: "andhra_pradesh", label: "Andhra Pradesh" },
  { id: "odisha", label: "Odisha" },
  { id: "karnataka", label: "Karnataka" },
];

let activeStateId: StateId = "andhra_pradesh";
const stateChangeListeners = new Set<() => void>();
export function setActiveState(id: StateId) {
  if (id === activeStateId) return;
  activeStateId = id;
  stateChangeListeners.forEach((fn) => fn());
}
export function getActiveStateId(): StateId { return activeStateId; }
export function subscribeStateChange(fn: () => void): () => void { stateChangeListeners.add(fn); return () => { stateChangeListeners.delete(fn); }; }
function S(): StateBundle { return stateBundles[activeStateId]; }

// ──────────────── Live proxies (active-state aware) ────────────────
function liveArrayProxy<T>(getter: () => T[]): T[] {
  return new Proxy([] as T[], {
    get(_t, prop) { return Reflect.get(getter(), prop); },
    has(_t, prop) { return Reflect.has(getter(), prop); },
    ownKeys() { return Reflect.ownKeys(getter()); },
    getOwnPropertyDescriptor(_t, prop) { return Reflect.getOwnPropertyDescriptor(getter(), prop); },
  }) as T[];
}

export const districts = liveArrayProxy(() => S().districts);
export const blocks = liveArrayProxy(() => S().blocks);
export const wards = ["All Wards"];
export const regionData = liveArrayProxy(() => S().regionData);
export const subDistrictData = liveArrayProxy(() => S().subDistrictData);
export const villageData = liveArrayProxy(() => S().villageData);
export const wardData = liveArrayProxy(() => S().wardData);
export const hotspotAlerts = liveArrayProxy(() => S().hotspotAlerts);
export const newsAlerts = liveArrayProxy(() => S().newsAlerts);
export const geoTaggedAlerts = liveArrayProxy(() => S().geoTaggedAlerts);
export const lineListingData = liveArrayProxy(() => S().lineListingData);

export const districtCoordinates: Record<string, [number, number]> = new Proxy({} as Record<string, [number, number]>, {
  get(_t, prop: string) { return S().districtCoordinates[prop]; },
  has(_t, prop: string) { return prop in S().districtCoordinates; },
  ownKeys() { return Object.keys(S().districtCoordinates); },
  getOwnPropertyDescriptor(_t, prop: string) {
    if (prop in S().districtCoordinates) return { enumerable: true, configurable: true, value: S().districtCoordinates[prop] };
    return undefined;
  },
});

export const getMapCenter = (): [number, number] => S().mapCenter;
export const getMapZoom = (): number => S().mapZoom;
// Initial fallback exports (used only at module init)
export const mapCenter: [number, number] = AP.mapCenter;
export const mapZoom: number = AP.mapZoom;

// ──────────────── Filter functions ────────────────
export function getFilteredRegions(district: string, block?: string): RegionData[] {
  const s = S();
  if (block && block !== "All Blocks") {
    const villages = s.villageData.filter((v) => v.parentBlock === block);
    const wardsInBlock = s.wardData.filter((w) => w.parentBlock === block);
    const result = [...villages, ...wardsInBlock];
    return result.length > 0 ? result : s.subDistrictData.filter((sb) => sb.name === block);
  }
  if (district && district !== "All Districts") {
    const subs = s.subDistrictData.filter((sb) => sb.parentDistrict === district);
    return subs.length > 0 ? subs : s.regionData.filter((r) => r.name === district);
  }
  return s.regionData;
}

export function getKpiFromRegions(regions: RegionData[]) {
  return {
    suspected: regions.reduce((s, r) => s + r.suspected, 0),
    tested: regions.reduce((s, r) => s + r.tested, 0),
    confirmed: regions.reduce((s, r) => s + r.confirmed, 0),
  };
}

export function applyDiseaseMultiplier(regions: RegionData[], multiplier: number): RegionData[] {
  if (multiplier === 1) return regions;
  return regions.map((r) => ({ ...r, suspected: Math.round(r.suspected * multiplier), tested: Math.round(r.tested * multiplier), confirmed: Math.round(r.confirmed * multiplier) }));
}

export function getSituationSummary(regions: RegionData[], diseaseName: string, district?: string, block?: string): string[] {
  const kpi = getKpiFromRegions(regions);
  const highRisk = regions.filter((r) => r.risk === "high");
  const rising = regions.filter((r) => r.trend === "up");
  const declining = regions.filter((r) => r.trend === "down");
  const areaLabel = block && block !== "All Blocks" ? "villages/wards" : district && district !== "All Districts" ? "blocks/municipalities" : "districts";
  const bullets: string[] = [];
  if (regions.length === 1) {
    const r = regions[0];
    bullets.push(`${r.name} has ${kpi.confirmed} confirmed ${diseaseName} cases · risk: ${r.risk}`);
    bullets.push(`Trend: ${r.trend === "up" ? "rising" : r.trend === "down" ? "declining" : "stable"} over last 4 weeks`);
    bullets.push(`Forecast indicates continued ${r.risk === "high" ? "high" : "moderate"} risk over W+2 to W+3`);
    bullets.push(`Recommended: ${r.risk === "high" ? "intensified vector control + fever surveys" : "routine surveillance + targeted action"}`);
    return bullets;
  }
  bullets.push(`${kpi.confirmed} confirmed ${diseaseName} cases across ${regions.length} ${areaLabel} (last 4 weeks)`);
  if (highRisk.length > 0) bullets.push(`High risk in ${highRisk.slice(0, 3).map((r) => r.name).join(", ")}${highRisk.length > 3 ? ` +${highRisk.length - 3} more` : ""}`);
  else bullets.push(`No ${areaLabel} currently classified as high risk`);
  if (rising.length > 0) bullets.push(`Rising trend observed in ${rising.slice(0, 2).map((r) => r.name).join(", ")}${rising.length > 2 ? ` +${rising.length - 2} more` : ""}`);
  if (declining.length > 0 && bullets.length < 4) bullets.push(`Declining cases in ${declining.slice(0, 2).map((r) => r.name).join(", ")}`);
  bullets.push(`Forecast: projected increase in W+2 to W+3 driven by climate + clustering signals`);
  return bullets.slice(0, 5);
}

export function getOutbreakPredictions(district: string, block?: string): OutbreakPrediction[] {
  const s = S();
  if (block && block !== "All Blocks") {
    const muniPreds = s.municipalityPredictions.filter((p) => p.parentBlock === block);
    if (muniPreds.length > 0) return muniPreds.sort((a, b) => b.probability - a.probability);
    const blockPreds = s.blockPredictions.filter((p) => p.parentBlock === block);
    return blockPreds.sort((a, b) => b.probability - a.probability);
  }
  if (district && district !== "All Districts") return s.districtPredictions.filter((p) => p.parentDistrict === district).sort((a, b) => b.probability - a.probability);
  return [...s.statePredictions].sort((a, b) => b.probability - a.probability);
}

export function getFilteredHotspots(district: string, block?: string): HotspotData[] {
  const s = S();
  if (block && block !== "All Blocks") return s.hotspotVillageData.filter((h) => h.parentBlock === block);
  if (district && district !== "All Districts") return s.hotspotSubDistrictData.filter((h) => h.parentDistrict === district);
  return s.hotspotDistrictData;
}

// ──────────────── Shared (state-agnostic) ────────────────
export const riskForecast = [
  { week: "W+1", risk: "moderate" as const, cases: 45, label: "8–14 Apr 2026" },
  { week: "W+2", risk: "high" as const, cases: 68, label: "15–21 Apr 2026" },
  { week: "W+3", risk: "high" as const, cases: 92, label: "22–28 Apr 2026" },
  { week: "W+4", risk: "moderate" as const, cases: 71, label: "29 Apr–5 May" },
];

export const weeklyTimeSeries = [
  { week: "W-9", date: "3–9 Feb", positive: 8, samples: 45, tpr: 17.8 },
  { week: "W-8", date: "10–16 Feb", positive: 12, samples: 52, tpr: 23.1 },
  { week: "W-7", date: "17–23 Feb", positive: 10, samples: 48, tpr: 20.8 },
  { week: "W-6", date: "24 Feb–2 Mar", positive: 15, samples: 60, tpr: 25.0 },
  { week: "W-5", date: "3–9 Mar", positive: 18, samples: 65, tpr: 27.7 },
  { week: "W-4", date: "10–16 Mar", positive: 14, samples: 58, tpr: 24.1 },
  { week: "W-3", date: "17–23 Mar", positive: 20, samples: 72, tpr: 27.8 },
  { week: "W-2", date: "24–30 Mar", positive: 16, samples: 62, tpr: 25.8 },
  { week: "W-1", date: "31 Mar–6 Apr", positive: 22, samples: 78, tpr: 28.2 },
  { week: "W0", date: "7–13 Apr", positive: 19, samples: 70, tpr: 27.1 },
];

export const dailyTimeSeries = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1, date: `Mar ${i + 1}`,
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

export const forecastData = [
  { week: "W-11", actual: 4, predicted: null, lower: null, upper: null, type: "Historical" },
  { week: "W-10", actual: 3, predicted: null, lower: null, upper: null, type: "Historical" },
  { week: "W-9", actual: 2, predicted: null, lower: null, upper: null, type: "Historical" },
  { week: "W-8", actual: 3, predicted: null, lower: null, upper: null, type: "Historical" },
  { week: "W-7", actual: 5, predicted: null, lower: null, upper: null, type: "Historical" },
  { week: "W-6", actual: 4, predicted: null, lower: null, upper: null, type: "Historical" },
  { week: "W-5", actual: 6, predicted: null, lower: null, upper: null, type: "Historical" },
  { week: "W-4", actual: 5, predicted: null, lower: null, upper: null, type: "Historical" },
  { week: "W-3", actual: 7, predicted: null, lower: null, upper: null, type: "Historical" },
  { week: "W-2", actual: 8, predicted: null, lower: null, upper: null, type: "Historical" },
  { week: "W-1", actual: 6, predicted: 6, lower: 4, upper: 8, type: "Historical" },
  { week: "W+1", actual: null, predicted: 7, lower: 4, upper: 10, type: "Forecast" },
  { week: "W+2", actual: null, predicted: 9, lower: 5, upper: 13, type: "Forecast" },
  { week: "W+3", actual: null, predicted: 11, lower: 6, upper: 16, type: "Forecast" },
  { week: "W+4", actual: null, predicted: 10, lower: 5, upper: 15, type: "Forecast" },
];

export const dataQualityIssues = [
  { type: "missing_reports", message: "3 blocks have not reported in last 7 days", severity: "high" as const },
  { type: "missing_lab", message: "1 district missing lab confirmation data", severity: "moderate" as const },
  { type: "delayed", message: "Some districts have delayed data (>3 days)", severity: "moderate" as const },
];

export const uploadFormats = [
  { id: "nvbdcp_linelist", name: "NVBDCP Line List", description: "Standard NVBDCP line listing format with patient details, test type, and results", columns: ["SL. NO", "SS Name", "Date of Testing", "Name of Patient", "Sex", "Age", "Address", "Mobile No", "District", "CHC", "SC", "Village", "Travel History", "Urban/Rural", "Referred By", "Test Type (IgM/NS1)", "Positive (Y/N)"] },
  { id: "nvbdcp_daily", name: "NVBDCP Daily Report", description: "Proforma for daily reporting of cases by sentinel site", columns: ["Sl No", "Sentinel Site", "NS1 Tested", "IgM Tested", "Total Tested", "NS1 Positive", "IgM Positive", "Total Positive", "Urban", "Rural", "Others"] },
  { id: "msu_format", name: "MSU / UMSU Format", description: "Municipal surveillance unit reporting format", columns: ["SL. NO", "SS Name", "Date of Testing", "Name of Patient", "Sex", "Age", "Address", "Mobile No", "District", "CHC", "SC", "Village", "Travel History", "Urban/Rural", "Referred By", "Test Type", "Positive (Y/N)"] },
  { id: "lab_report", name: "Lab Reporting", description: "Laboratory test results with NS1/IgM breakdown", columns: ["Sample ID", "Patient Name", "Age", "Gender", "District", "Date Collected", "Date Tested", "NS1 Result", "IgM Result", "Final Result"] },
  { id: "survey_data", name: "Survey Data", description: "Field survey and entomological data", columns: ["Date", "District", "Block", "Ward/Village", "Houses Surveyed", "Containers Found", "Containers Positive", "Breeding Index", "Surveyor Name"] },
];

export const weatherObserved = [
  { week: "W-8", endDate: "10–16 Feb 2026", rainfall: 0.0, temp: 24.5, maxT: 32.0, minT: 17.0, humidity: 28.0 },
  { week: "W-7", endDate: "17–23 Feb 2026", rainfall: 0.5, temp: 25.8, maxT: 33.5, minT: 18.5, humidity: 30.0 },
  { week: "W-6", endDate: "24 Feb–2 Mar 2026", rainfall: 1.2, temp: 27.0, maxT: 35.0, minT: 19.5, humidity: 33.0 },
  { week: "W-5", endDate: "3–9 Mar 2026", rainfall: 0.8, temp: 27.8, maxT: 36.2, minT: 20.0, humidity: 35.5 },
  { week: "W-4", endDate: "10–16 Mar 2026", rainfall: 0.0, temp: 28.8, maxT: 37.0, minT: 20.8, humidity: 20.9 },
  { week: "W-3", endDate: "17–23 Mar 2026", rainfall: 3.4, temp: 25.7, maxT: 34.8, minT: 16.9, humidity: 39.7 },
  { week: "W-2", endDate: "24–31 Mar 2026", rainfall: 3.3, temp: 29.9, maxT: 37.0, minT: 21.8, humidity: 32.1 },
  { week: "W-1", endDate: "1–7 Apr 2026", rainfall: 1.7, temp: 27.8, maxT: 36.3, minT: 20.7, humidity: 37.4 },
];

export const weatherForecast = [
  { week: "W+1", endDate: "8–14 Apr 2026", rainfall: 5.2, temp: 30.1, maxT: 37.5, minT: 22.0, humidity: 45.0 },
  { week: "W+2", endDate: "15–21 Apr 2026", rainfall: 12.4, temp: 31.2, maxT: 38.0, minT: 23.5, humidity: 52.0 },
  { week: "W+3", endDate: "22–28 Apr 2026", rainfall: 18.6, temp: 32.0, maxT: 38.5, minT: 24.0, humidity: 58.0 },
  { week: "W+4", endDate: "29 Apr–5 May 2026", rainfall: 25.0, temp: 31.5, maxT: 37.8, minT: 24.2, humidity: 62.0 },
  { week: "W+5", endDate: "6–12 May 2026", rainfall: 35.0, temp: 30.8, maxT: 37.0, minT: 24.5, humidity: 68.0 },
  { week: "W+6", endDate: "13–19 May 2026", rainfall: 42.0, temp: 30.2, maxT: 36.5, minT: 24.0, humidity: 72.0 },
  { week: "W+7", endDate: "20–26 May 2026", rainfall: 55.0, temp: 29.5, maxT: 35.8, minT: 23.8, humidity: 75.0 },
  { week: "W+8", endDate: "27 May–2 Jun 2026", rainfall: 65.0, temp: 28.8, maxT: 34.5, minT: 23.5, humidity: 78.0 },
];

export const weatherData = [
  ...weatherObserved.map((w) => ({ ...w, type: "observed" as const })),
  ...weatherForecast.map((w) => ({ ...w, type: "forecast" as const })),
];
