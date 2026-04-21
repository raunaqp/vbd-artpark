import { addDays, addWeeks, addYears, differenceInCalendarDays, eachDayOfInterval, eachMonthOfInterval, eachWeekOfInterval, format, parseISO, startOfDay, startOfWeek, subMonths } from "date-fns";
import { getSeedDailyDist, getSeedForecastForDistrict, getSeededDistrictsWithActions, walkSeedNodes, type SeedConcernNode } from "./seed";

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
  /**
   * If true, every district polygon (incl. boundary-only ones not in regionData)
   * gets a synthesized risk → fully colored choropleth.
   * If false, boundary-only districts render grey ("Data not available").
   * Default: true. Set false for states with intentionally partial coverage.
   */
  coversAllDistricts?: boolean;
  /** Optional canonical KPIs from seed.ts; if present, overrides regionData totals at state-wide scope. */
  seedKpis?: { suspected: number; tested: number; confirmed: number };
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
  blocks: ["All Blocks", "Brahmagiri", "Talcher", "Nilgiri", "Bhubaneswar MC", "Cuttack MC", "Puri MC", "Rourkela MC", "Sambalpur MC"],
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
    { name: "Puri MC", suspected: 130, tested: 122, confirmed: 14, risk: "moderate", trend: "up", type: "municipality", parentDistrict: "Puri" },
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
    { name: "Bada Danda", suspected: 50, tested: 47, confirmed: 7, risk: "high", trend: "up", type: "ward", parentDistrict: "Puri", parentBlock: "Puri MC" },
    { name: "Chakratirtha", suspected: 40, tested: 37, confirmed: 5, risk: "moderate", trend: "up", type: "ward", parentDistrict: "Puri", parentBlock: "Puri MC" },
    { name: "Sea Beach Road", suspected: 30, tested: 28, confirmed: 3, risk: "moderate", trend: "stable", type: "ward", parentDistrict: "Puri", parentBlock: "Puri MC" },
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
    { area: "Puri MC", probability: 86, risk: "high", expectedWeek: "W+2", signal: "Tourist influx + coastal urban density — sharpest forecast for Puri municipality", parentDistrict: "Puri", areaType: "Municipality" },
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
    { area: "Puri MC", currentCases: 14, prevCases: 9, trend: "up", risk: "moderate", parentDistrict: "Puri" },
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
    "Brahmagiri": [19.85, 85.63], "Puri Sadar": [19.81, 85.83], "Satyabadi": [19.87, 85.71], "Puri MC": [19.81, 85.83],
    "Bada Danda": [19.81, 85.82], "Chakratirtha": [19.80, 85.83], "Sea Beach Road": [19.79, 85.84],
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
  // Odisha intentionally has partial coverage — boundary-only districts render
  // grey ("Data not available") rather than synthesized colors.
  coversAllDistricts: false,
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
  riskForecast: [
    { week: "W+1", risk: "moderate", cases: 38, label: "8–14 Apr 2026" },
    { week: "W+2", risk: "moderate", cases: 55, label: "15–21 Apr 2026" },
    { week: "W+3", risk: "high", cases: 82, label: "22–28 Apr 2026" },
    { week: "W+4", risk: "high", cases: 105, label: "29 Apr–5 May" },
  ],
  weeklyTimeSeries: [
    { week: "W-9", date: "3–9 Feb", positive: 5, samples: 38, tpr: 13.2 },
    { week: "W-8", date: "10–16 Feb", positive: 6, samples: 42, tpr: 14.3 },
    { week: "W-7", date: "17–23 Feb", positive: 8, samples: 48, tpr: 16.7 },
    { week: "W-6", date: "24 Feb–2 Mar", positive: 10, samples: 55, tpr: 18.2 },
    { week: "W-5", date: "3–9 Mar", positive: 12, samples: 62, tpr: 19.4 },
    { week: "W-4", date: "10–16 Mar", positive: 15, samples: 70, tpr: 21.4 },
    { week: "W-3", date: "17–23 Mar", positive: 18, samples: 78, tpr: 23.1 },
    { week: "W-2", date: "24–30 Mar", positive: 22, samples: 88, tpr: 25.0 },
    { week: "W-1", date: "31 Mar–6 Apr", positive: 28, samples: 100, tpr: 28.0 },
    { week: "W0", date: "7–13 Apr", positive: 32, samples: 115, tpr: 27.8 },
  ],
  dailyTimeSeries: Array.from({ length: 30 }, (_, i) => ({ date: `Mar ${i + 1}`, positive: [1,2,1,2,3,2,3,2,3,4,3,3,4,5,4,3,5,4,5,6,5,5,6,7,6,5,7,8,7,6][i], samples: 10 + (i % 5) * 2, tpr: Math.round((12 + (i % 7) * 1.8) * 10) / 10 })),
  monthlyTimeSeries: [
    { month: "Nov", positive: 22, samples: 110, tpr: 20.0 },
    { month: "Dec", positive: 28, samples: 135, tpr: 20.7 },
    { month: "Jan", positive: 38, samples: 175, tpr: 21.7 },
    { month: "Feb", positive: 52, samples: 220, tpr: 23.6 },
    { month: "Mar", positive: 85, samples: 320, tpr: 26.6 },
  ],
  forecastData: [
    { week: "W-11", actual: 3, predicted: null, lower: null, upper: null, type: "Historical" },
    { week: "W-10", actual: 4, predicted: null, lower: null, upper: null, type: "Historical" },
    { week: "W-9", actual: 5, predicted: null, lower: null, upper: null, type: "Historical" },
    { week: "W-8", actual: 6, predicted: null, lower: null, upper: null, type: "Historical" },
    { week: "W-7", actual: 8, predicted: null, lower: null, upper: null, type: "Historical" },
    { week: "W-6", actual: 10, predicted: null, lower: null, upper: null, type: "Historical" },
    { week: "W-5", actual: 12, predicted: null, lower: null, upper: null, type: "Historical" },
    { week: "W-4", actual: 15, predicted: null, lower: null, upper: null, type: "Historical" },
    { week: "W-3", actual: 18, predicted: null, lower: null, upper: null, type: "Historical" },
    { week: "W-2", actual: 22, predicted: null, lower: null, upper: null, type: "Historical" },
    { week: "W-1", actual: 28, predicted: 27, lower: 22, upper: 32, type: "Historical" },
    { week: "W+1", actual: null, predicted: 38, lower: 30, upper: 48, type: "Forecast" },
    { week: "W+2", actual: null, predicted: 55, lower: 42, upper: 70, type: "Forecast" },
    { week: "W+3", actual: null, predicted: 82, lower: 62, upper: 105, type: "Forecast" },
    { week: "W+4", actual: null, predicted: 105, lower: 78, upper: 135, type: "Forecast" },
  ],
  weatherObserved: [
    { week: "W-8", endDate: "10–16 Feb 2026", rainfall: 0.0, temp: 26.0, maxT: 33.0, minT: 18.0, humidity: 60.0 },
    { week: "W-7", endDate: "17–23 Feb 2026", rainfall: 0.2, temp: 27.0, maxT: 34.0, minT: 19.0, humidity: 62.0 },
    { week: "W-6", endDate: "24 Feb–2 Mar 2026", rainfall: 1.5, temp: 28.0, maxT: 35.0, minT: 20.0, humidity: 65.0 },
    { week: "W-5", endDate: "3–9 Mar 2026", rainfall: 3.2, temp: 28.5, maxT: 35.5, minT: 20.5, humidity: 68.0 },
    { week: "W-4", endDate: "10–16 Mar 2026", rainfall: 8.5, temp: 28.8, maxT: 36.0, minT: 21.0, humidity: 72.0 },
    { week: "W-3", endDate: "17–23 Mar 2026", rainfall: 15.2, temp: 28.0, maxT: 35.0, minT: 21.5, humidity: 76.0 },
    { week: "W-2", endDate: "24–31 Mar 2026", rainfall: 22.0, temp: 28.5, maxT: 35.2, minT: 22.0, humidity: 78.0 },
    { week: "W-1", endDate: "1–7 Apr 2026", rainfall: 35.5, temp: 29.0, maxT: 35.8, minT: 22.5, humidity: 82.0 },
  ],
  weatherForecast: [
    { week: "W+1", endDate: "8–14 Apr 2026", rainfall: 48.0, temp: 29.5, maxT: 36.0, minT: 23.0, humidity: 84.0 },
    { week: "W+2", endDate: "15–21 Apr 2026", rainfall: 65.0, temp: 29.8, maxT: 36.0, minT: 23.5, humidity: 85.0 },
    { week: "W+3", endDate: "22–28 Apr 2026", rainfall: 82.0, temp: 30.0, maxT: 36.2, minT: 23.5, humidity: 86.0 },
    { week: "W+4", endDate: "29 Apr–5 May 2026", rainfall: 95.0, temp: 29.8, maxT: 35.8, minT: 23.5, humidity: 87.0 },
    { week: "W+5", endDate: "6–12 May 2026", rainfall: 110.0, temp: 29.5, maxT: 35.5, minT: 23.5, humidity: 88.0 },
    { week: "W+6", endDate: "13–19 May 2026", rainfall: 130.0, temp: 29.0, maxT: 35.0, minT: 23.5, humidity: 89.0 },
    { week: "W+7", endDate: "20–26 May 2026", rainfall: 155.0, temp: 28.5, maxT: 34.5, minT: 23.0, humidity: 90.0 },
    { week: "W+8", endDate: "27 May–2 Jun 2026", rainfall: 180.0, temp: 28.0, maxT: 34.0, minT: 23.0, humidity: 91.0 },
  ],
  dataQualityIssues: [
    { type: "missing_reports", message: "Kundapura and Karkala blocks (Udupi) — no reports in last 5 days", severity: "moderate" },
    { type: "missing_lab", message: "Belagavi — rural PHC lab data incomplete", severity: "moderate" },
    { type: "delayed", message: "BBMP East Zone — ward-level data delayed", severity: "high" },
  ],
};

// ──────────────── State registry & active state ────────────────
export const stateBundles: Record<StateId, StateBundle> = { andhra_pradesh: AP, odisha: ODISHA, karnataka: KARNATAKA };

// Apply canonical seed.ts overlay onto each bundle (cases, risk, coordinates,
// hotspots, predictions, alerts). Non-seeded districts keep synthesized baselines.
import { applySeedOverlayAll } from "./seedOverlay";
applySeedOverlayAll(stateBundles);
export const stateOptions: { id: StateId; label: string }[] = [
  { id: "andhra_pradesh", label: "Andhra Pradesh" },
  { id: "odisha", label: "Odisha" },
  { id: "karnataka", label: "Karnataka" },
];

let activeStateId: StateId = "odisha";
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

// ──────────────── Dynamic filter + date-aware data layer ────────────────
export type DashboardAreaType = "all" | "urban" | "rural";

export interface DashboardFiltersLike {
  district: string;
  block: string;
  ward: string;
  areaType: DashboardAreaType;
  fromDate: string;
  toDate: string;
}

export interface DashboardDateWindow {
  from: Date;
  to: Date;
  forecastStart: Date;
  forecastEnd: Date;
  fromDate: string;
  toDate: string;
  forecastStartDate: string;
  forecastEndDate: string;
  minDate: string;
  maxDate: string;
}

interface TemporalProfile {
  caseSeasonality: number[];
  rainfall: number[];
  humidity: number[];
  temperature: number[];
  weeklyPositiveBase: number;
  sampleMultiplier: number;
  forecastBoost: [number, number, number, number];
  riskCardThresholds: { moderate: number; high: number };
  yearBase: number;
  yearlyGrowth: number;
}

interface DerivedDashboardData {
  filters: DashboardFiltersLike;
  window: DashboardDateWindow;
  scopeScale: number;
  regions: RegionData[];
  hotspots2w: HotspotData[];
  hotspots4w: HotspotData[];
  predictions: OutbreakPrediction[];
  riskForecast: RiskForecastPoint[];
  weeklyTimeSeries: TimeSeriesPoint[];
  dailyTimeSeries: TimeSeriesPoint[];
  monthlyTimeSeries: TimeSeriesPoint[];
  forecastData: ForecastChartPoint[];
  weatherObserved: WeatherPoint[];
  weatherForecast: WeatherPoint[];
  hotspotAlerts: StateBundle["hotspotAlerts"];
  newsAlerts: NewsAlert[];
  geoTaggedAlerts: GeoAlert[];
  lineListing: LineListing[];
  dataQualityIssues: DataIssue[];
}

const DATA_LOOKBACK_YEARS = 6;
const REFERENCE_DATE = startOfDay(new Date("2026-04-07"));
const FIRST_NAMES = ["Aarav", "Aditi", "Anil", "Bhavana", "Charan", "Deepa", "Harsha", "Kiran", "Lakshmi", "Madhav", "Naveen", "Pratima", "Raghav", "Sahana", "Sanjay", "Shreya", "Sujata", "Usha", "Vikram", "Yamini"];
const LAST_NAMES = ["Behera", "Das", "Gowda", "Kamat", "Kumari", "Mahapatra", "Mohanty", "Naidu", "Pai", "Patil", "Pradhan", "Rao", "Reddy", "Rout", "Sahoo", "Sethi", "Shetty", "Swain", "Varma", "Yadav"];
const REFERRAL_SOURCES = ["ASHA", "ANM", "HW", "MO", "PHC", "CHC"];

const temporalProfiles: Record<StateId, TemporalProfile> = {
  andhra_pradesh: {
    caseSeasonality: [0.58, 0.62, 0.78, 1.0, 1.12, 1.28, 1.36, 1.3, 1.12, 0.9, 0.72, 0.62],
    rainfall: [6, 8, 12, 22, 38, 92, 128, 118, 96, 62, 22, 10],
    humidity: [58, 60, 63, 68, 72, 78, 82, 81, 78, 72, 66, 61],
    temperature: [25.8, 27.2, 29.4, 31.2, 32.1, 30.9, 29.6, 29.4, 29.2, 28.4, 27.0, 26.0],
    weeklyPositiveBase: 19,
    sampleMultiplier: 3.55,
    forecastBoost: [2.37, 3.58, 4.84, 3.74],
    riskCardThresholds: { moderate: 24, high: 56 },
    yearBase: 0.8,
    yearlyGrowth: 0.042,
  },
  odisha: {
    caseSeasonality: [0.64, 0.7, 0.88, 1.02, 1.18, 1.38, 1.54, 1.48, 1.28, 1.02, 0.8, 0.68],
    rainfall: [12, 18, 28, 42, 68, 126, 188, 176, 148, 92, 34, 16],
    humidity: [60, 63, 66, 70, 75, 81, 86, 85, 82, 76, 70, 64],
    temperature: [23.8, 25.4, 28.1, 30.2, 31.4, 30.1, 28.8, 28.7, 28.9, 28.0, 26.1, 24.6],
    weeklyPositiveBase: 95,
    sampleMultiplier: 2.58,
    forecastBoost: [1.0, 1.37, 1.74, 1.89],
    riskCardThresholds: { moderate: 42, high: 82 },
    yearBase: 0.86,
    yearlyGrowth: 0.035,
  },
  karnataka: {
    caseSeasonality: [0.54, 0.58, 0.72, 0.88, 1.0, 1.18, 1.36, 1.42, 1.18, 0.94, 0.72, 0.58],
    rainfall: [4, 6, 12, 28, 56, 104, 162, 184, 124, 72, 26, 10],
    humidity: [56, 58, 61, 66, 71, 78, 84, 86, 80, 72, 64, 58],
    temperature: [24.6, 26.1, 28.4, 30.2, 31.1, 29.6, 27.9, 27.8, 28.2, 27.5, 25.9, 24.8],
    weeklyPositiveBase: 32,
    sampleMultiplier: 3.18,
    forecastBoost: [1.19, 1.72, 2.56, 3.28],
    riskCardThresholds: { moderate: 20, high: 58 },
    yearBase: 0.78,
    yearlyGrowth: 0.04,
  },
};

const derivedDashboardCache = new Map<string, DerivedDashboardData>();

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededBetween(key: string, min: number, max: number): number {
  const fraction = (hashSeed(key) % 1000) / 1000;
  return min + (max - min) * fraction;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function formatISODate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function formatRangeLabel(start: Date, end: Date) {
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  return sameMonth ? `${format(start, "d")}–${format(end, "d MMM yyyy")}` : `${format(start, "d MMM")}–${format(end, "d MMM yyyy")}`;
}

function parseDateOr(value: string | undefined, fallback: Date) {
  if (!value) return fallback;
  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? fallback : startOfDay(parsed);
}

export function getDefaultHistoricalDateRange(baseDate = new Date()) {
  const today = startOfDay(baseDate);
  return {
    fromDate: formatISODate(subMonths(today, 3)),
    toDate: formatISODate(today),
  };
}

export function getDateWindow(filters?: Partial<DashboardFiltersLike>, baseDate = new Date()): DashboardDateWindow {
  const today = startOfDay(baseDate);
  const minDate = startOfDay(addYears(today, -DATA_LOOKBACK_YEARS));
  let to = parseDateOr(filters?.toDate, today);
  if (to > today) to = today;
  if (to < minDate) to = minDate;

  let from = parseDateOr(filters?.fromDate, subMonths(today, 3));
  if (from < minDate) from = minDate;
  if (from > to) from = to;

  const forecastStart = addDays(to, 1);
  const forecastEnd = addDays(forecastStart, 27);

  return {
    from,
    to,
    forecastStart,
    forecastEnd,
    fromDate: formatISODate(from),
    toDate: formatISODate(to),
    forecastStartDate: formatISODate(forecastStart),
    forecastEndDate: formatISODate(forecastEnd),
    minDate: formatISODate(minDate),
    maxDate: formatISODate(today),
  };
}

function getDefaultFilters(baseDate = new Date()): DashboardFiltersLike {
  const dates = getDefaultHistoricalDateRange(baseDate);
  return {
    district: "All Districts",
    block: "All Blocks",
    ward: "All Wards",
    areaType: "all",
    ...dates,
  };
}

function resolveFilters(input?: DashboardFiltersLike | string, legacyBlock?: string): DashboardFiltersLike {
  if (typeof input === "string") {
    return {
      ...getDefaultFilters(),
      district: input || "All Districts",
      block: legacyBlock || "All Blocks",
    };
  }

  return {
    ...getDefaultFilters(),
    ...input,
  };
}

function getAreaMode(item: { name?: string; area?: string; type?: string }) {
  const label = item.name || item.area || "";
  if (item.type === "municipality" || item.type === "ward") return "urban" as const;
  if (item.type === "block" || item.type === "village") return "rural" as const;
  if (/\b(MC|City|Zone)\b/i.test(label)) return "urban" as const;
  return "rural" as const;
}

function getDistrictAreaShare(bundle: StateBundle, districtName: string, areaType: DashboardAreaType) {
  if (areaType === "all") return 1;
  const children = bundle.subDistrictData.filter((item) => item.parentDistrict === districtName);
  const total = children.reduce((sum, item) => sum + item.confirmed, 0);
  if (!total) return 0.5;
  const urban = children.filter((item) => getAreaMode(item) === "urban").reduce((sum, item) => sum + item.confirmed, 0);
  const urbanShare = clamp(urban / total, 0.18, 0.82);
  return areaType === "urban" ? urbanShare : 1 - urbanShare;
}

function getAreaShare(bundle: StateBundle, filters: DashboardFiltersLike, item: { name?: string; area?: string; type?: string; parentDistrict?: string; parentBlock?: string }) {
  if (filters.areaType === "all") return 1;
  if (item.type === "district") {
    const districtName = item.name || item.area || "";
    return getDistrictAreaShare(bundle, districtName, filters.areaType);
  }
  return getAreaMode(item) === filters.areaType ? 1 : 0;
}

function getStateBaseConfirmed(bundle: StateBundle) {
  return bundle.regionData.reduce((sum, region) => sum + region.confirmed, 0);
}

// Synthesize a child region for a district that has no explicit children, so drill-down never
// returns "no data" for any selectable / map-visible geography.
function synthesizeDistrictChildren(bundle: StateBundle, districtName: string): RegionData[] {
  const districtRow = bundle.regionData.find((r) => r.name === districtName);
  // If the district itself isn't in regionData (e.g. boundary-only district from GeoJSON), synth a row
  const baseConfirmed = districtRow?.confirmed ?? Math.max(8, (hashSeed(`${bundle.id}:${districtName}`) % 40) + 6);
  const baseSuspected = districtRow?.suspected ?? Math.round(baseConfirmed * 7.2);
  const baseTested = districtRow?.tested ?? Math.round(baseConfirmed * 6.4);
  const trend = districtRow?.trend ?? (hashSeed(`${districtName}:trend`) % 3 === 0 ? "up" : hashSeed(`${districtName}:trend2`) % 2 === 0 ? "stable" : "down");
  const split = [
    { suffix: "Sadar", weight: 0.46, type: "block" as const, mode: "rural" },
    { suffix: "Town", weight: 0.34, type: "municipality" as const, mode: "urban" },
    { suffix: "Rural", weight: 0.20, type: "block" as const, mode: "rural" },
  ];
  return split.map(({ suffix, weight, type }) => ({
    name: `${districtName} ${suffix}`,
    suspected: Math.max(0, Math.round(baseSuspected * weight)),
    tested: Math.max(0, Math.round(baseTested * weight)),
    confirmed: Math.max(0, Math.round(baseConfirmed * weight)),
    risk: districtRow?.risk ?? "moderate",
    trend,
    type,
    parentDistrict: districtName,
  }));
}

// Ensures any district visible on the map (even ones not in regionData) has a row.
function getOrSynthesizeDistrictRow(bundle: StateBundle, districtName: string): RegionData {
  const existing = bundle.regionData.find((r) => r.name === districtName);
  if (existing) return existing;
  const seed = hashSeed(`${bundle.id}:${districtName}`);
  const confirmed = 6 + (seed % 36);
  return {
    name: districtName,
    suspected: Math.round(confirmed * 7.2),
    tested: Math.round(confirmed * 6.4),
    confirmed,
    risk: confirmed >= 36 ? "high" : confirmed >= 18 ? "moderate" : "low",
    trend: seed % 3 === 0 ? "up" : seed % 3 === 1 ? "stable" : "down",
    type: "district",
  };
}

/**
 * Public helper: every map polygon (even ones not present in regionData) gets a
 * deterministic risk + cases value so outer↔inner views never contradict.
 * Looks up the current filtered region first; falls back to a deterministic
 * synthesis seeded by `${activeStateId}:${districtName}`.
 */
export function getDistrictRiskFallback(
  districtName: string,
  input?: DashboardFiltersLike | string,
): { risk: RegionData["risk"]; confirmed: number; trend: RegionData["trend"]; synthesized: boolean } {
  const bundle = S();
  // SINGLE SOURCE OF TRUTH: always derive a district's risk from the state-level
  // transformed regions for the current date window. This guarantees that when a
  // user drills into one district, every other district's polygon retains the
  // exact same risk/cases/trend it had on the state-level map.
  const baseFilters = resolveFilters(input);
  const stateFilters: DashboardFiltersLike = {
    ...baseFilters,
    district: "All Districts",
    block: "All Blocks",
    ward: "All Wards",
  };
  const stateRegions = buildDerivedDashboardData(stateFilters).regions;
  const transformed = stateRegions.find((r) => r.name === districtName);
  if (transformed) {
    return { risk: transformed.risk, confirmed: transformed.confirmed, trend: transformed.trend, synthesized: false };
  }
  // Boundary-only district (not in regionData): deterministic synthesis.
  const row = getOrSynthesizeDistrictRow(bundle, districtName);
  return { risk: row.risk, confirmed: row.confirmed, trend: row.trend, synthesized: true };
}

/**
 * True when the active state is configured to color every district polygon
 * (synthesizing risk for boundary-only districts). False → boundary-only
 * districts must render grey ("Data not available").
 */
export function stateCoversAllDistricts(): boolean {
  return S().coversAllDistricts !== false;
}

/**
 * Resolve a district's hotspot-derived risk for the current date window.
 * Used by the hotspot map so map color ↔ hotspot table always agree.
 */
export function getDistrictHotspotRisk(
  districtName: string,
  input?: DashboardFiltersLike | string,
  lookbackWeeks: 2 | 4 = 4,
): { risk: HotspotData["risk"] | null; cases: number; trend: HotspotData["trend"] | null } {
  const baseFilters = resolveFilters(input);
  const stateFilters: DashboardFiltersLike = {
    ...baseFilters,
    district: "All Districts",
    block: "All Blocks",
    ward: "All Wards",
  };
  const derived = buildDerivedDashboardData(stateFilters);
  const list = lookbackWeeks === 2 ? derived.hotspots2w : derived.hotspots4w;
  const match = list.find((h) => h.area === districtName);
  if (match) return { risk: match.risk, cases: match.currentCases, trend: match.trend };
  return { risk: null, cases: 0, trend: null };
}

function getBaseRegionsForScope(bundle: StateBundle, filters: DashboardFiltersLike) {
  if (filters.block !== "All Blocks") {
    const villages = bundle.villageData.filter((item) => item.parentBlock === filters.block);
    const wardsInBlock = bundle.wardData.filter((item) => item.parentBlock === filters.block);
    const leafNodes = [...villages, ...wardsInBlock];
    if (filters.ward !== "All Wards") return leafNodes.filter((item) => item.name === filters.ward);
    if (leafNodes.length > 0) return leafNodes;
    // Fallback: synth two villages for the block so drill-down never goes blank
    const blockRow = bundle.subDistrictData.find((item) => item.name === filters.block);
    if (blockRow) {
      const base = blockRow.confirmed;
      return [
        { ...blockRow, name: `${filters.block} Village A`, type: "village" as const, parentBlock: filters.block, confirmed: Math.round(base * 0.6), suspected: Math.round(blockRow.suspected * 0.6), tested: Math.round(blockRow.tested * 0.6) },
        { ...blockRow, name: `${filters.block} Village B`, type: "village" as const, parentBlock: filters.block, confirmed: Math.round(base * 0.4), suspected: Math.round(blockRow.suspected * 0.4), tested: Math.round(blockRow.tested * 0.4) },
      ];
    }
    return [];
  }
  if (filters.district !== "All Districts") {
    const children = bundle.subDistrictData.filter((item) => item.parentDistrict === filters.district);
    if (children.length > 0) return children;
    return synthesizeDistrictChildren(bundle, filters.district);
  }
  return bundle.regionData;
}

function getLeafAreasForScope(bundle: StateBundle, filters: DashboardFiltersLike) {
  const source = filters.block !== "All Blocks"
    ? [...bundle.villageData.filter((item) => item.parentBlock === filters.block), ...bundle.wardData.filter((item) => item.parentBlock === filters.block)]
    : filters.district !== "All Districts"
    ? [...bundle.villageData.filter((item) => item.parentDistrict === filters.district), ...bundle.wardData.filter((item) => item.parentDistrict === filters.district)]
    : [...bundle.villageData, ...bundle.wardData];

  return source.filter((item) => {
    if (filters.ward !== "All Wards" && item.name !== filters.ward) return false;
    return getAreaShare(bundle, filters, item) > 0;
  });
}

function getSelectedBaseConfirmed(bundle: StateBundle, filters: DashboardFiltersLike) {
  return getBaseRegionsForScope(bundle, filters).reduce((sum, item) => sum + item.confirmed * getAreaShare(bundle, filters, item), 0);
}

function getRelativeYearFactor(profile: TemporalProfile, date: Date) {
  const minYear = startOfDay(new Date()).getFullYear() - DATA_LOOKBACK_YEARS;
  const absolute = profile.yearBase + (date.getFullYear() - minYear) * profile.yearlyGrowth;
  const reference = profile.yearBase + (REFERENCE_DATE.getFullYear() - minYear) * profile.yearlyGrowth;
  return absolute / reference;
}

function getAverageRelativeCaseFactor(profile: TemporalProfile, start: Date, end: Date) {
  const referenceSeason = profile.caseSeasonality[REFERENCE_DATE.getMonth()];
  const days = eachDayOfInterval({ start, end });
  const seasonal = days.reduce((sum, day) => sum + profile.caseSeasonality[day.getMonth()] / referenceSeason, 0) / Math.max(days.length, 1);
  return seasonal * getRelativeYearFactor(profile, end);
}

function getRangeScalar(profile: TemporalProfile, start: Date, end: Date) {
  const days = differenceInCalendarDays(end, start) + 1;
  return (days / 28) * getAverageRelativeCaseFactor(profile, start, end);
}

function getRiskThresholds(type?: string) {
  if (type === "district") return { moderate: 18, high: 36 };
  if (type === "block" || type === "municipality") return { moderate: 7, high: 15 };
  return { moderate: 3, high: 7 };
}

function getRiskLevel(ratePerFourWeeks: number, type?: string): RegionData["risk"] {
  const thresholds = getRiskThresholds(type);
  if (ratePerFourWeeks >= thresholds.high) return "high";
  if (ratePerFourWeeks >= thresholds.moderate) return "moderate";
  return "low";
}

function getTrend(currentValue: number, previousValue: number): RegionData["trend"] {
  if (previousValue === 0 && currentValue > 0) return "up";
  if (previousValue === 0) return "stable";
  const change = (currentValue - previousValue) / previousValue;
  if (change > 0.12) return "up";
  if (change < -0.12) return "down";
  return "stable";
}

function transformRegion(bundle: StateBundle, profile: TemporalProfile, filters: DashboardFiltersLike, window: DashboardDateWindow, item: RegionData): RegionData | null {
  const share = getAreaShare(bundle, filters, item);
  if (share <= 0) return null;

  const durationDays = differenceInCalendarDays(window.to, window.from) + 1;
  const previousEnd = addDays(window.from, -1);
  const previousStart = addDays(previousEnd, -(durationDays - 1));
  const bias = seededBetween(`${bundle.id}:${item.name}:region`, 0.92, 1.12) * (item.trend === "up" ? 1.08 : item.trend === "down" ? 0.93 : 1) * (item.risk === "high" ? 1.06 : item.risk === "low" ? 0.94 : 1);

  // Per-region asymmetry between current vs previous so trend varies across districts
  // (without it, every district shares the same currentScalar/previousScalar ratio).
  const trendBias = item.trend === "up" ? 1.18 : item.trend === "down" ? 0.82 : 1.0;
  const prevPerturb = seededBetween(`${bundle.id}:${item.name}:region:prev`, 0.85, 1.15);

  const currentScalar = getRangeScalar(profile, window.from, window.to) * bias * share;
  const previousScalar = getRangeScalar(profile, previousStart, previousEnd) * bias * share * prevPerturb / trendBias;

  const suspected = Math.max(0, Math.round(item.suspected * currentScalar));
  const tested = Math.max(0, Math.round(item.tested * currentScalar));
  const confirmed = Math.max(0, Math.round(item.confirmed * currentScalar));
  const previousConfirmed = Math.max(0, Math.round(item.confirmed * previousScalar));
  const ratePerFourWeeks = durationDays > 0 ? confirmed / (durationDays / 28 || 1) : confirmed;

  return {
    ...item,
    suspected,
    tested,
    confirmed,
    trend: getTrend(confirmed, previousConfirmed),
    risk: getRiskLevel(ratePerFourWeeks, item.type),
  };
}

function synthesizeDistrictHotspotChildren(districtName: string, parentRow: HotspotData | undefined): HotspotData[] {
  const base = parentRow?.currentCases ?? Math.max(6, hashSeed(`${districtName}:hot`) % 30);
  const prev = parentRow?.prevCases ?? Math.round(base * 0.78);
  // Inherit parent district risk so inner drill-down never contradicts outer map color.
  const parentRisk: HotspotData["risk"] = parentRow?.risk ?? (base >= 30 ? "high" : base >= 12 ? "moderate" : "low");
  const secondaryRisk: HotspotData["risk"] = parentRisk === "high" ? "moderate" : parentRisk === "moderate" ? "moderate" : "low";
  const tertiaryRisk: HotspotData["risk"] = parentRisk === "high" ? "moderate" : "low";
  return [
    { area: `${districtName} Sadar`, currentCases: Math.round(base * 0.5), prevCases: Math.round(prev * 0.5), trend: "up", risk: parentRisk, parentDistrict: districtName },
    { area: `${districtName} Town`, currentCases: Math.round(base * 0.32), prevCases: Math.round(prev * 0.32), trend: "stable", risk: secondaryRisk, parentDistrict: districtName },
    { area: `${districtName} Rural`, currentCases: Math.round(base * 0.18), prevCases: Math.round(prev * 0.18), trend: "stable", risk: tertiaryRisk, parentDistrict: districtName },
  ];
}

function getBaseHotspotsForScope(bundle: StateBundle, filters: DashboardFiltersLike) {
  if (filters.block !== "All Blocks") {
    const leafHotspots = bundle.hotspotVillageData.filter((item) => item.parentBlock === filters.block);
    return filters.ward !== "All Wards" ? leafHotspots.filter((item) => item.area === filters.ward) : leafHotspots;
  }
  if (filters.district !== "All Districts") {
    const found = bundle.hotspotSubDistrictData.filter((item) => item.parentDistrict === filters.district);
    if (found.length > 0) return found;
    const parent = bundle.hotspotDistrictData.find((h) => h.area === filters.district);
    return synthesizeDistrictHotspotChildren(filters.district, parent);
  }
  return bundle.hotspotDistrictData;
}

function transformHotspot(bundle: StateBundle, profile: TemporalProfile, filters: DashboardFiltersLike, window: DashboardDateWindow, item: HotspotData, lookbackWeeks: 2 | 4): HotspotData | null {
  const share = getAreaShare(bundle, filters, { ...item, name: item.area });
  if (share <= 0) return null;

  const lookbackDays = lookbackWeeks * 7;
  const currentEnd = window.to;
  const currentStart = addDays(currentEnd, -(lookbackDays - 1));
  const previousEnd = addDays(currentStart, -1);
  const previousStart = addDays(previousEnd, -(lookbackDays - 1));
  const bias = seededBetween(`${bundle.id}:${item.area}:hotspot:${lookbackWeeks}`, 0.9, 1.14);
  const currentScalar = getRangeScalar(profile, currentStart, currentEnd) * bias * share;
  const previousScalar = getRangeScalar(profile, previousStart, previousEnd) * bias * share;
  const currentCases = Math.max(0, Math.round(item.currentCases * currentScalar));
  const prevCases = Math.max(0, Math.round(item.prevCases * previousScalar));
  const ratePerFourWeeks = currentCases / (lookbackWeeks / 4);

  return {
    ...item,
    currentCases,
    prevCases,
    trend: getTrend(currentCases, prevCases),
    risk: getRiskLevel(ratePerFourWeeks, filters.block !== "All Blocks" ? "village" : filters.district !== "All Districts" ? "block" : "district"),
  };
}

function synthesizeDistrictPredictions(districtName: string, parentPred: OutbreakPrediction | undefined): OutbreakPrediction[] {
  const baseProb = parentPred?.probability ?? Math.max(20, hashSeed(`${districtName}:pred`) % 70);
  return [
    { area: `${districtName} Sadar`, probability: clamp(baseProb + 4, 5, 99), risk: parentPred?.risk ?? "moderate", expectedWeek: "W+2", signal: parentPred?.signal ?? `${districtName} sub-district risk based on district aggregate.`, parentDistrict: districtName, areaType: "Block" },
    { area: `${districtName} Town`, probability: clamp(baseProb - 6, 5, 99), risk: "moderate", expectedWeek: "W+3", signal: `${districtName} urban-area risk projection.`, parentDistrict: districtName, areaType: "Municipality" },
    { area: `${districtName} Rural`, probability: clamp(baseProb - 18, 5, 99), risk: "low", expectedWeek: "W+4", signal: `${districtName} rural baseline projection.`, parentDistrict: districtName, areaType: "Block" },
  ];
}

function getBasePredictionsForScope(bundle: StateBundle, filters: DashboardFiltersLike) {
  if (filters.block !== "All Blocks") {
    const wardPredictions = bundle.municipalityPredictions.filter((item) => item.parentBlock === filters.block);
    const blockPredictions = bundle.blockPredictions.filter((item) => item.parentBlock === filters.block);
    const source = wardPredictions.length > 0 ? wardPredictions : blockPredictions;
    return filters.ward !== "All Wards" ? source.filter((item) => item.area === filters.ward) : source;
  }
  if (filters.district !== "All Districts") {
    const found = bundle.districtPredictions.filter((item) => item.parentDistrict === filters.district);
    if (found.length > 0) return found;
    const parent = bundle.statePredictions.find((p) => p.area === filters.district);
    return synthesizeDistrictPredictions(filters.district, parent);
  }
  return bundle.statePredictions;
}

function transformPrediction(bundle: StateBundle, profile: TemporalProfile, filters: DashboardFiltersLike, window: DashboardDateWindow, item: OutbreakPrediction): OutbreakPrediction | null {
  const share = getAreaShare(bundle, filters, { ...item, name: item.area, type: item.areaType?.toLowerCase() });
  if (share <= 0) return null;

  const currentFactor = getAverageRelativeCaseFactor(profile, window.from, window.to);
  const futureFactor = getAverageRelativeCaseFactor(profile, window.forecastStart, window.forecastEnd);
  const adjustment = Math.round((futureFactor - currentFactor) * 20 + seededBetween(`${bundle.id}:${item.area}:prediction`, -5, 6) - (share < 1 ? 6 : 0));
  const probability = clamp(Math.round(item.probability + adjustment), 5, 99);
  // Standardised probability → risk mapping (>75 High, 50–75 Moderate, <50 Low)
  const risk: OutbreakPrediction["risk"] = probability > 75 ? "high" : probability >= 50 ? "moderate" : "low";

  // Convert "W+N" to actual date range based on forecast window
  const match = /W\+(\d+)/.exec(item.expectedWeek || "");
  const weekIndex = match ? Math.max(1, parseInt(match[1], 10)) : 1;
  const weekStart = addDays(window.forecastStart, (weekIndex - 1) * 7);
  const weekEnd = addDays(weekStart, 6);
  const expectedWeek = formatRangeLabel(weekStart, weekEnd);

  return {
    ...item,
    probability,
    risk,
    expectedWeek,
  };
}

function generateWeeklyTimeSeries(profile: TemporalProfile, window: DashboardDateWindow, scopeScale: number, seedKey: string): TimeSeriesPoint[] {
  const weekStarts = eachWeekOfInterval({ start: window.from, end: window.to }, { weekStartsOn: 1 });
  const chunkSize = Math.max(1, Math.ceil(weekStarts.length / 52));
  const results: TimeSeriesPoint[] = [];

  for (let index = 0; index < weekStarts.length; index += chunkSize) {
    const start = weekStarts[index];
    const groupEndWeek = weekStarts[Math.min(index + chunkSize - 1, weekStarts.length - 1)];
    const end = groupEndWeek > window.to ? window.to : addDays(groupEndWeek, 6) > window.to ? window.to : addDays(groupEndWeek, 6);
    const scalar = getRangeScalar(profile, start, end);
    const noise = seededBetween(`${seedKey}:weekly:${index}:${formatISODate(end)}`, 0.92, 1.1);
    const positive = Math.max(0, Math.round(profile.weeklyPositiveBase * scopeScale * scalar * noise));
    const samples = Math.max(positive, Math.round(positive * profile.sampleMultiplier * seededBetween(`${seedKey}:weekly:samples:${index}`, 0.96, 1.1)));
    results.push({
      week: format(start, "d MMM"),
      date: formatRangeLabel(start, end),
      positive,
      samples,
      tpr: Number(((positive / Math.max(samples, 1)) * 100).toFixed(1)),
    });
  }

  return results;
}

function generateDailyTimeSeries(profile: TemporalProfile, window: DashboardDateWindow, scopeScale: number, seedKey: string, filters?: DashboardFiltersLike): TimeSeriesPoint[] {
  const dailyStart = differenceInCalendarDays(window.to, window.from) > 59 ? addDays(window.to, -59) : window.from;
  const days = eachDayOfInterval({ start: dailyStart, end: window.to });
  const seedDaily = filters
    ? getSeedDailyDist(activeStateId, { district: filters.district, block: filters.block, ward: filters.ward })
    : undefined;
  const seedTailLen = seedDaily?.length ?? 0;
  const tailStartIdx = seedTailLen > 0 ? Math.max(0, days.length - seedTailLen) : -1;
  return days.map((day, index) => {
    const scalar = getRangeScalar(profile, day, day);
    const weekdayFactor = [0.92, 1.0, 1.08, 1.12, 1.04, 0.94, 0.82][day.getDay()];
    let positive = Math.max(0, Math.round(profile.weeklyPositiveBase * 0.18 * scopeScale * scalar * weekdayFactor * seededBetween(`${seedKey}:daily:${formatISODate(day)}`, 0.9, 1.12)));
    if (seedDaily && index >= tailStartIdx) {
      // Overlay seeded last-14-days positive count for this scope.
      positive = seedDaily[index - tailStartIdx];
    }
    const samples = Math.max(positive, Math.round(positive * profile.sampleMultiplier * seededBetween(`${seedKey}:daily:samples:${index}`, 0.95, 1.1)));
    return {
      date: format(day, "d MMM"),
      positive,
      samples,
      tpr: Number(((positive / Math.max(samples, 1)) * 100).toFixed(1)),
    };
  });
}

function generateMonthlyTimeSeries(profile: TemporalProfile, window: DashboardDateWindow, scopeScale: number, seedKey: string): TimeSeriesPoint[] {
  const months = eachMonthOfInterval({ start: window.from, end: window.to });
  return months.map((monthStart, index) => {
    const monthEnd = index === months.length - 1 ? window.to : addDays(months[index + 1], -1);
    const scalar = getRangeScalar(profile, monthStart, monthEnd);
    const positive = Math.max(0, Math.round(profile.weeklyPositiveBase * 1.05 * scopeScale * scalar * seededBetween(`${seedKey}:monthly:${format(monthStart, "yyyy-MM")}`, 0.92, 1.12)));
    const samples = Math.max(positive, Math.round(positive * profile.sampleMultiplier * seededBetween(`${seedKey}:monthly:samples:${index}`, 0.97, 1.12)));
    return {
      month: format(monthStart, months.length > 12 ? "MMM yyyy" : "MMM"),
      positive,
      samples,
      tpr: Number(((positive / Math.max(samples, 1)) * 100).toFixed(1)),
    };
  });
}

function generateForecastSeries(profile: TemporalProfile, window: DashboardDateWindow, scopeScale: number, seedKey: string, filters?: DashboardFiltersLike) {
  const historyStart = startOfWeek(addWeeks(window.to, -10), { weekStartsOn: 1 });
  const historyWeeks = eachWeekOfInterval({ start: historyStart < window.from ? window.from : historyStart, end: window.to }, { weekStartsOn: 1 });
  const actualHistory = historyWeeks.map((weekStart, index) => {
    const weekEnd = addDays(weekStart, 6) > window.to ? window.to : addDays(weekStart, 6);
    const scalar = getRangeScalar(profile, weekStart, weekEnd);
    return {
      week: format(weekStart, "d MMM"),
      label: formatRangeLabel(weekStart, weekEnd),
      actual: Math.max(0, Math.round(profile.weeklyPositiveBase * scopeScale * scalar * seededBetween(`${seedKey}:actual:${formatISODate(weekEnd)}`, 0.92, 1.08))),
    };
  });

  const currentActual = actualHistory[actualHistory.length - 1]?.actual || Math.max(1, Math.round(profile.weeklyPositiveBase * scopeScale));
  const forecastPoints: ForecastChartPoint[] = [];
  const riskPoints: RiskForecastPoint[] = [];

  // Seed forecast block — only honored at district scope (not All Districts, not drilled below).
  const seedForecast = filters && filters.district !== "All Districts" && filters.block === "All Blocks"
    ? getSeedForecastForDistrict(activeStateId, filters.district)
    : undefined;
  const seedProbs = seedForecast
    ? [seedForecast.w1_probability, seedForecast.w2_probability, seedForecast.w3_probability, seedForecast.w4_probability]
    : undefined;

  profile.forecastBoost.forEach((boost, index) => {
    const weekStart = addWeeks(startOfWeek(window.forecastStart, { weekStartsOn: 1 }), index);
    const weekEnd = addDays(weekStart, 6);
    const futureSeason = getAverageRelativeCaseFactor(profile, weekStart, weekEnd);
    const currentSeason = getAverageRelativeCaseFactor(profile, addDays(window.to, -6), window.to) || 1;
    let predicted = Math.max(0, Math.round(currentActual * boost * (futureSeason / currentSeason) * seededBetween(`${seedKey}:forecast:${index}`, 0.96, 1.05)));
    if (seedProbs && index < seedProbs.length) {
      // Re-anchor the predicted weekly cases to the seed's per-week probability
      // (seed prob is in [0,1]; treat it as a multiplier on currentActual scaled by 1.6 so peak weeks ≈ 1.5–2× baseline).
      predicted = Math.max(0, Math.round(currentActual * (0.6 + seedProbs[index] * 1.6)));
    }
    const lower = Math.max(0, Math.round(predicted * seededBetween(`${seedKey}:forecast:lower:${index}`, 0.76, 0.86)));
    const upper = Math.max(predicted, Math.round(predicted * seededBetween(`${seedKey}:forecast:upper:${index}`, 1.14, 1.26)));
    let risk: RiskForecastPoint["risk"];
    if (seedProbs && index < seedProbs.length) {
      // Seeded probability → risk band: ≥0.6 high, ≥0.4 moderate, else low.
      const p = seedProbs[index];
      risk = p >= 0.6 ? "high" : p >= 0.4 ? "moderate" : "low";
    } else {
      const scaleFloor = Math.max(scopeScale, 0.12);
      const moderateThreshold = Math.max(3, profile.riskCardThresholds.moderate * scaleFloor);
      const highThreshold = Math.max(6, profile.riskCardThresholds.high * scaleFloor);
      risk = predicted >= highThreshold ? "high" : predicted >= moderateThreshold ? "moderate" : "low";
    }
    const weekLabel = format(weekStart, "d MMM");
    const rangeLabel = formatRangeLabel(weekStart, weekEnd);
    forecastPoints.push({ week: weekLabel, actual: null, predicted, lower, upper, type: "Forecast" });
    riskPoints.push({ week: weekLabel, cases: predicted, risk, label: rangeLabel });
  });

  const historyChart: ForecastChartPoint[] = actualHistory.map((point, idx) => ({
    week: point.week,
    actual: point.actual,
    predicted: idx === actualHistory.length - 1 ? point.actual : null,
    lower: null,
    upper: null,
    type: "Historical",
  }));

  return {
    forecastData: [...historyChart, ...forecastPoints],
    riskForecast: riskPoints,
  };
}

function generateWeatherSeries(profile: TemporalProfile, start: Date, end: Date, prefix: "W-" | "W+", seedKey: string) {
  const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 }).slice(-8);
  return weeks.map((weekStart, index) => {
    const weekEnd = addDays(weekStart, 6) > end ? end : addDays(weekStart, 6);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const rainfall = Number((days.reduce((sum, day) => sum + profile.rainfall[day.getMonth()], 0) / Math.max(days.length, 1) * seededBetween(`${seedKey}:rain:${formatISODate(weekEnd)}`, 0.82, 1.18)).toFixed(1));
    const temp = Number((days.reduce((sum, day) => sum + profile.temperature[day.getMonth()], 0) / Math.max(days.length, 1) * seededBetween(`${seedKey}:temp:${formatISODate(weekEnd)}`, 0.97, 1.03)).toFixed(1));
    const humidity = Number((days.reduce((sum, day) => sum + profile.humidity[day.getMonth()], 0) / Math.max(days.length, 1) * seededBetween(`${seedKey}:humidity:${formatISODate(weekEnd)}`, 0.95, 1.05)).toFixed(1));
    return {
      week: format(weekStart, "d MMM"),
      endDate: formatRangeLabel(weekStart, weekEnd),
      rainfall,
      temp,
      maxT: Number((temp + seededBetween(`${seedKey}:max:${index}`, 5.8, 6.9)).toFixed(1)),
      minT: Number((temp - seededBetween(`${seedKey}:min:${index}`, 6.0, 7.4)).toFixed(1)),
      humidity,
    };
  });
}

function shiftAlertDate(window: DashboardDateWindow, index: number) {
  return formatISODate(addDays(window.to, -index));
}

function buildLineListing(bundle: StateBundle, profile: TemporalProfile, filters: DashboardFiltersLike, window: DashboardDateWindow, seedKey: string, scopeScale: number): LineListing[] {
  const templates = getLeafAreasForScope(bundle, filters);
  const days = differenceInCalendarDays(window.to, window.from) + 1;
  const selectedBase = getSelectedBaseConfirmed(bundle, filters);
  const estimate = Math.round((selectedBase / 4) * (days / 30) * getAverageRelativeCaseFactor(profile, window.from, window.to) * seededBetween(`${seedKey}:linelist:size`, 0.75, 1.1));
  const count = templates.length === 0 ? 0 : clamp(estimate, 0, 180);
  if (count <= 0) return [];

  return Array.from({ length: count }, (_, index) => {
    const area = templates[index % templates.length];
    const district = area.parentDistrict || filters.district !== "All Districts" ? area.parentDistrict || filters.district : area.name;
    const block = area.parentBlock || area.name;
    const dateOffset = Math.floor((days - 1) * (1 - seededBetween(`${seedKey}:linelist:date:${index}`, 0, 1) ** 1.6));
    const testDate = addDays(window.from, dateOffset);
    const seed = hashSeed(`${seedKey}:${district}:${block}:${area.name}:${index}`);
    return {
      patient: `${FIRST_NAMES[seed % FIRST_NAMES.length]} ${LAST_NAMES[(seed + index) % LAST_NAMES.length]}`,
      gender: seed % 2 === 0 ? "Male" : "Female",
      age: 6 + (seed % 61),
      subDistrict: block,
      block,
      village: area.name,
      district,
      diagnosis: "Dengue",
      testType: seed % 3 === 0 ? "IgM" : seed % 3 === 1 ? "NS1" : "RDT",
      testResult: "Positive",
      dateOfTesting: formatISODate(testDate),
      urbanRural: getAreaMode(area) === "urban" ? "Urban" : "Rural",
      referredBy: REFERRAL_SOURCES[(seed + 2) % REFERRAL_SOURCES.length],
    };
  }).sort((a, b) => b.dateOfTesting.localeCompare(a.dateOfTesting));
}

function buildDerivedDashboardData(input?: DashboardFiltersLike | string, legacyBlock?: string): DerivedDashboardData {
  const filters = resolveFilters(input, legacyBlock);
  const cacheKey = `${activeStateId}|${filters.district}|${filters.block}|${filters.ward}|${filters.areaType}|${filters.fromDate}|${filters.toDate}`;
  const cached = derivedDashboardCache.get(cacheKey);
  if (cached) return cached;

  const bundle = S();
  const profile = temporalProfiles[bundle.id];
  const window = getDateWindow(filters);
  const scopeScale = clamp(getSelectedBaseConfirmed(bundle, filters) / Math.max(getStateBaseConfirmed(bundle), 1), 0, 1);
  const seedKey = `${bundle.id}:${filters.district}:${filters.block}:${filters.ward}:${filters.areaType}:${window.toDate}`;

  const regions = getBaseRegionsForScope(bundle, filters)
    .map((item) => transformRegion(bundle, profile, filters, window, item))
    .filter((item): item is RegionData => Boolean(item) && (item.confirmed > 0 || item.suspected > 0 || item.tested > 0));

  const hotspots4w = getBaseHotspotsForScope(bundle, filters)
    .map((item) => transformHotspot(bundle, profile, filters, window, item, 4))
    .filter((item): item is HotspotData => Boolean(item) && (item.currentCases > 0 || item.prevCases > 0));

  const hotspots2w = getBaseHotspotsForScope(bundle, filters)
    .map((item) => transformHotspot(bundle, profile, filters, window, item, 2))
    .filter((item): item is HotspotData => Boolean(item) && (item.currentCases > 0 || item.prevCases > 0));

  const rawPredictions = getBasePredictionsForScope(bundle, filters)
    .map((item) => transformPrediction(bundle, profile, filters, window, item))
    .filter((item): item is OutbreakPrediction => Boolean(item))
    .sort((a, b) => b.probability - a.probability);

  // ── Forecast hierarchy clamp ──
  // Predicted weekly cases must respect parent-child totals:
  //   sum(district) ≤ state, sum(block) ≤ district, sum(ward) ≤ block.
  // We approximate "predicted cases" via probability×scale, but the user-facing
  // requirement is on the riskForecast cards (state/district aggregated).
  // Here we ensure no child prediction exceeds its parent by scaling probabilities.
  const predictions = clampPredictionHierarchy(rawPredictions, bundle, filters);

  const weeklyTimeSeries = generateWeeklyTimeSeries(profile, window, scopeScale || 1, seedKey);
  const dailyTimeSeries = generateDailyTimeSeries(profile, window, scopeScale || 1, seedKey, filters);
  const monthlyTimeSeries = generateMonthlyTimeSeries(profile, window, scopeScale || 1, seedKey);
  const { forecastData, riskForecast: rawRiskForecast } = generateForecastSeries(profile, window, scopeScale || 1, seedKey, filters);
  const riskForecast = clampRiskForecastAgainstParent(rawRiskForecast, profile, window, scopeScale || 1, seedKey, filters);

  const observedWeatherStart = addWeeks(startOfWeek(window.to, { weekStartsOn: 1 }), -7);
  const weatherObserved = generateWeatherSeries(profile, observedWeatherStart < window.from ? window.from : observedWeatherStart, window.to, "W-", `${seedKey}:observed`);
  const forecastWeatherEnd = addWeeks(startOfWeek(window.forecastStart, { weekStartsOn: 1 }), 7);
  const weatherForecast = generateWeatherSeries(profile, startOfWeek(window.forecastStart, { weekStartsOn: 1 }), forecastWeatherEnd, "W+", `${seedKey}:forecast-weather`);

  const hotspotAlerts = bundle.hotspotAlerts.filter((alert) => filters.district === "All Districts" || alert.district === filters.district);
  const newsAlerts = bundle.newsAlerts
    .filter((alert) => filters.district === "All Districts" || alert.district === filters.district)
    .map((alert, index) => ({ ...alert, date: shiftAlertDate(window, index + 1) }));
  const geoTaggedAlerts = bundle.geoTaggedAlerts.filter((alert) => filters.district === "All Districts" || alert.district === filters.district);
  const lineListing = buildLineListing(bundle, profile, filters, window, seedKey, scopeScale || 1);

  const derived: DerivedDashboardData = {
    filters,
    window,
    scopeScale,
    regions,
    hotspots2w,
    hotspots4w,
    predictions,
    riskForecast,
    weeklyTimeSeries,
    dailyTimeSeries,
    monthlyTimeSeries,
    forecastData,
    weatherObserved,
    weatherForecast,
    hotspotAlerts,
    newsAlerts,
    geoTaggedAlerts,
    lineListing,
    dataQualityIssues: bundle.dataQualityIssues,
  };

  derivedDashboardCache.set(cacheKey, derived);
  return derived;
}

export function getFilteredRegions(input?: DashboardFiltersLike | string, legacyBlock?: string): RegionData[] {
  return buildDerivedDashboardData(input, legacyBlock).regions;
}

export function getKpiFromRegions(regions: RegionData[]) {
  return {
    suspected: regions.reduce((sum, region) => sum + region.suspected, 0),
    tested: regions.reduce((sum, region) => sum + region.tested, 0),
    confirmed: regions.reduce((sum, region) => sum + region.confirmed, 0),
  };
}

/**
 * Returns the canonical seed KPIs for the active state when filters are state-wide
 * (no district selected). Falls back to summing the filtered regionData otherwise.
 * KpiCards uses this so the headline KPI tiles always match seed.ts at the top level.
 */
export function getFilteredKpi(input?: DashboardFiltersLike | string, legacyBlock?: string) {
  const filters = resolveFilters(input, legacyBlock);
  const regions = getFilteredRegions(filters);
  const isStateWide = (filters?.district ?? "All Districts") === "All Districts";
  const seedKpis = S().seedKpis;
  if (isStateWide && seedKpis) return { ...seedKpis };
  return getKpiFromRegions(regions);
}

export function applyDiseaseMultiplier(regions: RegionData[], multiplier: number): RegionData[] {
  if (multiplier === 1) return regions;
  return regions.map((region) => ({
    ...region,
    suspected: Math.round(region.suspected * multiplier),
    tested: Math.round(region.tested * multiplier),
    confirmed: Math.round(region.confirmed * multiplier),
  }));
}

export function getSituationSummary(regions: RegionData[], diseaseName: string, filters?: DashboardFiltersLike | string, legacyBlock?: string): string[] {
  const resolved = resolveFilters(filters, legacyBlock);
  const window = getDateWindow(resolved);
  if (regions.length === 0) {
    return [`No ${diseaseName.toLowerCase()} data available for ${format(window.from, "d MMM yyyy")} to ${format(window.to, "d MMM yyyy")}.`];
  }

  const kpi = getKpiFromRegions(regions);
  const highRisk = regions.filter((region) => region.risk === "high");
  const rising = regions.filter((region) => region.trend === "up");
  const declining = regions.filter((region) => region.trend === "down");
  const areaLabel = resolved.block !== "All Blocks" ? "villages/wards" : resolved.district !== "All Districts" ? "blocks/municipalities" : "districts";

  if (regions.length === 1) {
    const region = regions[0];
    return [
      `${region.name} recorded ${kpi.confirmed} confirmed ${diseaseName} cases from ${format(window.from, "d MMM yyyy")} to ${format(window.to, "d MMM yyyy")}.`,
      `Risk is ${region.risk} with a ${region.trend === "up" ? "rising" : region.trend === "down" ? "declining" : "stable"} trend against the previous matched period.`,
      `Forecast window ${format(window.forecastStart, "d MMM")}–${format(window.forecastEnd, "d MMM yyyy")} remains ${region.risk === "high" ? "high" : "moderate"} risk.`,
      `Recommended action: ${region.risk === "high" ? "intensified vector control and fever surveys" : "targeted surveillance and rapid response readiness"}.`,
    ];
  }

  const bullets = [
    `${kpi.confirmed} confirmed ${diseaseName} cases across ${regions.length} ${areaLabel} from ${format(window.from, "d MMM yyyy")} to ${format(window.to, "d MMM yyyy")}.`,
    highRisk.length > 0 ? `High risk persists in ${highRisk.slice(0, 3).map((region) => region.name).join(", ")}${highRisk.length > 3 ? ` +${highRisk.length - 3} more` : ""}.` : `No ${areaLabel} are currently classified as high risk.`,
    rising.length > 0 ? `Rising activity is concentrated in ${rising.slice(0, 2).map((region) => region.name).join(", ")}${rising.length > 2 ? ` +${rising.length - 2} more` : ""}.` : `No major rising clusters are visible in the selected period.`,
    declining.length > 0 ? `Declining transmission is visible in ${declining.slice(0, 2).map((region) => region.name).join(", ")}.` : `Most selected areas are holding steady versus the prior matched period.`,
    `Next 4 weeks (${format(window.forecastStart, "d MMM")}–${format(window.forecastEnd, "d MMM yyyy")}) are driven by climate, clustering, and historical seasonal patterns.`,
  ];

  return bullets.slice(0, 5);
}

export function getOutbreakPredictions(input?: DashboardFiltersLike | string, legacyBlock?: string): OutbreakPrediction[] {
  return buildDerivedDashboardData(input, legacyBlock).predictions;
}

export function getFilteredHotspots(input?: DashboardFiltersLike | string, lookbackWeeks: 2 | 4 = 4): HotspotData[] {
  const derived = buildDerivedDashboardData(input);
  return lookbackWeeks === 2 ? derived.hotspots2w : derived.hotspots4w;
}

export function getHotspotAlerts(input?: DashboardFiltersLike | string, legacyBlock?: string) {
  return buildDerivedDashboardData(input, legacyBlock).hotspotAlerts;
}

export function getNewsAlerts(input?: DashboardFiltersLike | string, legacyBlock?: string) {
  return buildDerivedDashboardData(input, legacyBlock).newsAlerts;
}

export function getGeoTaggedAlerts(input?: DashboardFiltersLike | string, legacyBlock?: string) {
  return buildDerivedDashboardData(input, legacyBlock).geoTaggedAlerts;
}

export function getLineListing(input?: DashboardFiltersLike | string, legacyBlock?: string) {
  return buildDerivedDashboardData(input, legacyBlock).lineListing;
}

// ──────────────── State-aware getters (preferred for components that re-render on filters/state change) ────────────────
export const getRiskForecast = (input?: DashboardFiltersLike | string, legacyBlock?: string): RiskForecastPoint[] => buildDerivedDashboardData(input, legacyBlock).riskForecast;
export const getWeeklyTimeSeries = (input?: DashboardFiltersLike | string, legacyBlock?: string): TimeSeriesPoint[] => buildDerivedDashboardData(input, legacyBlock).weeklyTimeSeries;
export const getDailyTimeSeries = (input?: DashboardFiltersLike | string, legacyBlock?: string): TimeSeriesPoint[] => buildDerivedDashboardData(input, legacyBlock).dailyTimeSeries;
export const getMonthlyTimeSeries = (input?: DashboardFiltersLike | string, legacyBlock?: string): TimeSeriesPoint[] => buildDerivedDashboardData(input, legacyBlock).monthlyTimeSeries;
export const getForecastData = (input?: DashboardFiltersLike | string, legacyBlock?: string): ForecastChartPoint[] => buildDerivedDashboardData(input, legacyBlock).forecastData;
export const getWeatherObserved = (input?: DashboardFiltersLike | string, legacyBlock?: string): WeatherPoint[] => buildDerivedDashboardData(input, legacyBlock).weatherObserved;
export const getWeatherForecast = (input?: DashboardFiltersLike | string, legacyBlock?: string): WeatherPoint[] => buildDerivedDashboardData(input, legacyBlock).weatherForecast;
export const getDataQualityIssues = (input?: DashboardFiltersLike | string, legacyBlock?: string): DataIssue[] => buildDerivedDashboardData(input, legacyBlock).dataQualityIssues;

/**
 * Single-sentence interpretation of state-vs-local forecast risk.
 * Used below forecast cards on Home + Forecast tab.
 */
export function getStateLocalRiskNote(input?: DashboardFiltersLike | string): string {
  const filters = resolveFilters(input);
  const stateFilters: DashboardFiltersLike = { ...filters, district: "All Districts", block: "All Blocks", ward: "All Wards" };
  const { riskForecast, predictions } = buildDerivedDashboardData(stateFilters);
  const stateHasHigh = riskForecast.some((r) => r.risk === "high");
  const stateHasMod = riskForecast.some((r) => r.risk === "moderate");
  const localHigh = predictions.filter((p) => p.risk === "high").length;
  const localMod = predictions.filter((p) => p.risk === "moderate").length;

  if (!stateHasHigh && !stateHasMod && localHigh > 0) {
    return "Overall state burden is low, but localized clustering indicates elevated outbreak risk in select districts/blocks.";
  }
  if (!stateHasHigh && localHigh > 0) {
    return `Low overall state burden expected; ${localHigh} district${localHigh > 1 ? "s" : ""} show elevated localized outbreak risk.`;
  }
  if (stateHasHigh) {
    return `Elevated state-level risk expected; high-risk localized clusters in ${localHigh} district${localHigh === 1 ? "" : "s"}.`;
  }
  if (stateHasMod || localMod > 0) {
    return "Moderate localized risk expected in select districts; overall state burden remains contained.";
  }
  return "Low overall state burden expected over the next 4 weeks with no major localized clusters.";
}

// ──────────────── QA / consistency report (debug-only) ────────────────
export interface QAReport {
  state: string;
  windowLabel: string;
  forecastLabel: string;
  stateTotalConfirmed: number;
  sumOfDistrictConfirmed: number;
  cases_diff: number;
  stateForecastSum: number;
  sumOfDistrictForecastSum: number;
  forecast_diff: number;
  perDistrict: Array<{ district: string; confirmed: number; forecastSum: number; childRows: number }>;
  probabilityBands: { high: number; moderate: number; low: number };
  bandConsistencyOk: boolean;
  missingDataDistricts: number;
  stateLocalNote: string;
}

export function getQAReport(input?: DashboardFiltersLike | string): QAReport {
  const bundle = S();
  const baseFilters: DashboardFiltersLike = { ...resolveFilters(input), district: "All Districts", block: "All Blocks", ward: "All Wards" };
  const window = getDateWindow(baseFilters);
  const stateRegions = buildDerivedDashboardData(baseFilters).regions;
  const statePredictions = buildDerivedDashboardData(baseFilters).predictions;

  const stateTotalConfirmed = stateRegions.reduce((s, r) => s + r.confirmed, 0);
  const stateForecastSum = statePredictions.reduce((s, p) => s + p.probability, 0);

  const perDistrict = stateRegions.map((district) => {
    const dFilters: DashboardFiltersLike = { ...baseFilters, district: district.name };
    const childRegions = buildDerivedDashboardData(dFilters).regions;
    const childPreds = buildDerivedDashboardData(dFilters).predictions;
    return {
      district: district.name,
      confirmed: childRegions.reduce((s, r) => s + r.confirmed, 0),
      forecastSum: childPreds.reduce((s, p) => s + p.probability, 0),
      childRows: childRegions.length,
    };
  });

  const sumOfDistrictConfirmed = perDistrict.reduce((s, d) => s + d.confirmed, 0);
  const sumOfDistrictForecastSum = perDistrict.reduce((s, d) => s + d.forecastSum, 0);

  // Probability → risk band consistency check (>75 High, 50–75 Moderate, <50 Low)
  const bands = { high: 0, moderate: 0, low: 0 };
  let bandConsistencyOk = true;
  statePredictions.forEach((p) => {
    bands[p.risk] += 1;
    const expected: OutbreakPrediction["risk"] = p.probability > 75 ? "high" : p.probability >= 50 ? "moderate" : "low";
    if (expected !== p.risk) bandConsistencyOk = false;
  });

  const missingDataDistricts = stateRegions.filter((r) => r.confirmed === 0 && r.suspected === 0).length;

  return {
    state: bundle.label,
    windowLabel: `${format(window.from, "d MMM yyyy")} – ${format(window.to, "d MMM yyyy")}`,
    forecastLabel: `${format(window.forecastStart, "d MMM yyyy")} – ${format(window.forecastEnd, "d MMM yyyy")}`,
    stateTotalConfirmed,
    sumOfDistrictConfirmed,
    cases_diff: sumOfDistrictConfirmed - stateTotalConfirmed,
    stateForecastSum,
    sumOfDistrictForecastSum,
    forecast_diff: sumOfDistrictForecastSum - stateForecastSum,
    perDistrict,
    probabilityBands: bands,
    bandConsistencyOk,
    missingDataDistricts,
    stateLocalNote: getStateLocalRiskNote(baseFilters),
  };
}

// ──────────────── Areas of Concern + Action Focus (Overview tab) ────────────────

export interface ConcernArea {
  name: string;
  cases: number;
  prevCases: number;
  changePct: number; // positive = rising
  parent?: string; // district / block context
  level: "district" | "block" | "ward";
}

function buildWindowFilters(base: DashboardFiltersLike, daysBack: number, offsetDays = 0): DashboardFiltersLike {
  const today = startOfDay(new Date());
  const to = addDays(today, -offsetDays);
  const from = addDays(to, -(daysBack - 1));
  return { ...base, fromDate: formatISODate(from), toDate: formatISODate(to) };
}

function inferLevel(filters: DashboardFiltersLike): "district" | "block" | "ward" {
  if (filters.block !== "All Blocks") return "ward";
  if (filters.district !== "All Districts") return "block";
  return "district";
}

/**
 * Convert a seed-walked node into a ConcernArea, keeping parent/level intact.
 * Used as a guaranteed fallback so every state with seeded signals shows entries.
 */
function seedNodeToConcern(node: SeedConcernNode, mode: "new" | "rising"): ConcernArea {
  const recent = node.cases_2w;
  const prior = Math.max(0, node.cases_4w - node.cases_2w);
  const pct = mode === "new"
    ? (prior === 0 ? 100 : Math.round(((recent - prior) / Math.max(prior, 1)) * 100))
    : (prior === 0 ? 100 : Math.round(((recent - prior) / Math.max(prior, 1)) * 100));
  return {
    name: node.name,
    cases: recent,
    prevCases: prior,
    changePct: Math.max(0, pct),
    parent: node.parent,
    level: node.level,
  };
}

function seedConcernNodesInScope(filters: DashboardFiltersLike): SeedConcernNode[] {
  const nodes = walkSeedNodes(activeStateId);
  // Filter by selected district scope so drill-downs show local concerns.
  if (filters.district !== "All Districts") {
    return nodes.filter((n) => n.parentDistrict === filters.district || n.name === filters.district);
  }
  return nodes;
}

/**
 * Areas with new/sporadic cases in the LAST 14 days that had ~zero in the prior 14-day window.
 * Even small counts (1–3) are surfaced — these are early-warning signals.
 */
export function getNewEmergenceAreas(input?: DashboardFiltersLike | string): ConcernArea[] {
  const base = resolveFilters(input);
  const level = inferLevel(base);
  const recent = getFilteredRegions(buildWindowFilters(base, 14, 0));
  const prior = getFilteredRegions(buildWindowFilters(base, 14, 14));
  const priorByName = new Map(prior.map((r) => [r.name, r.confirmed]));

  const derived: ConcernArea[] = recent
    .sort((a, b) => b.confirmed - a.confirmed)
    .slice(0, 6)
    .map((r) => ({
      name: r.name,
      cases: r.confirmed,
      prevCases: priorByName.get(r.name) ?? 0,
      changePct: 100,
      parent: r.parentBlock || r.parentDistrict,
      level,
    }));

  if (derived.length >= 2) return derived;

  // Seed-driven fallback: surface any seeded node tagged as new_emergence in scope.
  const seedNodes = seedConcernNodesInScope(base)
    .filter((n) => n.signal === "new_emergence")
    .sort((a, b) => b.cases_2w - a.cases_2w);
  const seen = new Set(derived.map((d) => d.name));
  for (const n of seedNodes) {
    if (seen.has(n.name)) continue;
    derived.push(seedNodeToConcern(n, "new"));
    seen.add(n.name);
    if (derived.length >= 6) break;
  }
  return derived;
}

/**
 * Areas where last 14 days > prior 14 days by a meaningful margin (top rising clusters).
 */
export function getRisingClusters(input?: DashboardFiltersLike | string): ConcernArea[] {
  const base = resolveFilters(input);
  const level = inferLevel(base);
  const recent = getFilteredRegions(buildWindowFilters(base, 14, 0));
  const prior = getFilteredRegions(buildWindowFilters(base, 14, 14));
  const priorByName = new Map(prior.map((r) => [r.name, r.confirmed]));

  const derived: ConcernArea[] = recent
    .map((r) => {
      const prev = priorByName.get(r.name) ?? 0;
      const delta = r.confirmed - prev;
      const pct = prev > 0 ? (delta / prev) * 100 : (r.confirmed > 0 ? 100 : 0);
      return { region: r, prev, delta, pct };
    })
    .filter(({ region, prev, delta, pct }) => region.confirmed >= 3 && delta >= 2 && (prev === 0 ? region.confirmed >= 4 : pct >= 30))
    .sort((a, b) => b.pct - a.pct || b.delta - a.delta)
    .slice(0, 5)
    .map(({ region, prev, pct }) => ({
      name: region.name,
      cases: region.confirmed,
      prevCases: prev,
      changePct: Math.round(pct),
      parent: region.parentBlock || region.parentDistrict,
      level,
    }));

  if (derived.length >= 2) return derived;

  // Seed fallback: nodes whose last 2w > prior 2w (cases_4w - cases_2w).
  const seedNodes = seedConcernNodesInScope(base)
    .filter((n) => {
      const prior2w = n.cases_4w - n.cases_2w;
      return n.cases_2w >= 3 && n.cases_2w > prior2w;
    })
    .sort((a, b) => (b.cases_2w - (b.cases_4w - b.cases_2w)) - (a.cases_2w - (a.cases_4w - a.cases_2w)));
  const seen = new Set(derived.map((d) => d.name));
  for (const n of seedNodes) {
    if (seen.has(n.name)) continue;
    derived.push(seedNodeToConcern(n, "rising"));
    seen.add(n.name);
    if (derived.length >= 5) break;
  }
  return derived;
}

// ──────────────── Action Focus engine ────────────────

export interface ActionFocusItem {
  area: string;
  parent?: string;
  geoType: "urban" | "rural" | "coastal" | "industrial" | "periurban" | "construction";
  signal: "new" | "rising" | "persistent";
  actions: string[];
  source: "curated" | "auto";
}

// Curated, location-specific actions. Substring match on area name (case-insensitive).
const CURATED_ACTIONS: Array<{ match: RegExp; entry: Omit<ActionFocusItem, "area" | "parent"> & { parentHint?: string } }> = [
  { match: /gajuwaka/i, entry: { geoType: "urban", signal: "rising", source: "curated", actions: ["Ward-level fogging in Gajuwaka high-density lanes", "Drainage clearing along stormwater channels", "Apartment & commercial container survey"], parentHint: "Visakhapatnam" } },
  { match: /vizag|visakhapatnam/i, entry: { geoType: "urban", signal: "persistent", source: "curated", actions: ["Fogging cycle across Vizag MC wards", "Door-to-door fever surveillance", "Larval source reduction near port area"] } },
  { match: /guntur/i, entry: { geoType: "rural", signal: "rising", source: "curated", actions: ["Canal-side source reduction in irrigated villages", "Larval survey across irrigation-linked sub-centres", "PHC-level fever camps"] } },
  { match: /panposh|chhend|rourkela/i, entry: { geoType: "industrial", signal: "rising", source: "curated", actions: ["Worker-settlement water storage audit", "Industrial drainage inspection", "Worker fever screening at gate clinics"] } },
  { match: /malpe|udupi/i, entry: { geoType: "coastal", signal: "rising", source: "curated", actions: ["Fishing harbor sanitation drive", "Container breeding checks at fish-storage units", "Tourist-area surveillance ramp-up"] } },
  { match: /satapada|bentapur|puri/i, entry: { geoType: "rural", signal: "new", source: "curated", actions: ["Active case search around index households", "Larval survey in low-lying coastal villages", "PHC fever camps in affected GPs"] } },
  { match: /bengaluru.*urban|bbmp/i, entry: { geoType: "urban", signal: "persistent", source: "curated", actions: ["BBMP ward-level fogging cycle", "Construction-site water storage audit", "Apartment-complex container survey"] } },
];

function inferGeoType(name: string): ActionFocusItem["geoType"] {
  if (/coast|port|fish|malpe|udupi|paradip|harbor/i.test(name)) return "coastal";
  if (/steel|industrial|panposh|chhend|rourkela|jharsuguda|industries|estate/i.test(name)) return "industrial";
  if (/construction|site|nagar.*new|peripheral/i.test(name)) return "construction";
  if (/peri[- ]?urban|periphery|outskirt/i.test(name)) return "periurban";
  if (/\b(MC|City|Urban|Municipal|Town|Nagar|BBMP|Ward|Bhubaneswar|Bengaluru|Hyderabad)\b/i.test(name)) return "urban";
  return "rural";
}

function autoActionsFor(geoType: ActionFocusItem["geoType"], signal: ActionFocusItem["signal"], area: string): string[] {
  // 6-key matrix: geoType x signal → 3 differentiated actions per cell.
  const matrix: Record<ActionFocusItem["geoType"], Record<ActionFocusItem["signal"], string[]>> = {
    urban: {
      new: [`Active case search around index households in ${area}`, `Apartment-complex container survey`, `Lane-level larvicidal spray`],
      rising: [`Ward-level fogging in dense ${area} lanes`, `Drainage cleaning along storm channels`, `Apartment container survey & enforcement`],
      persistent: [`Sustained fogging cycle in ${area} MC wards`, `Door-to-door fever surveillance`, `Container index audits in commercial pockets`],
    },
    rural: {
      new: [`Active case search at affected hamlet in ${area}`, `Larval survey of nearby water sources`, `Sub-centre fever camps`],
      rising: [`Canal-side source reduction in ${area}`, `Larval survey in irrigation-linked villages`, `PHC-level fever camps`],
      persistent: [`Vector-control roster across ${area} GPs`, `Routine larval index monitoring`, `ASHA-led fever surveillance`],
    },
    industrial: {
      new: [`Worker fever screening at ${area} gate clinics`, `Container survey in worker housing`, `Source reduction inside premises`],
      rising: [`Construction-site water storage audit in ${area}`, `Enforcement notice for stagnant water`, `Targeted fogging around active sites`],
      persistent: [`Industrial drainage inspection roster`, `Worker settlement sanitation drive`, `Periodic worker fever screening`],
    },
    coastal: {
      new: [`Mobility tracking among visiting fishermen`, `Container breeding checks in fish-storage`, `Beachfront larval survey`],
      rising: [`Fishing harbor sanitation in ${area}`, `Container breeding checks at storage units`, `Tourist-area surveillance ramp-up`],
      persistent: [`Routine harbor sanitation cycle`, `Migrant-population fever screening`, `Coastal drainage clearing`],
    },
    construction: {
      new: [`Notice to ${area} site supervisors`, `Container audit in worker barracks`, `Active case search at site clinics`],
      rising: [`Construction-site water storage audit`, `Enforcement on uncovered tanks`, `Site-perimeter fogging cycle`],
      persistent: [`Weekly site sanitation inspection`, `Worker fever screening roster`, `Larval index monitoring on premises`],
    },
    periurban: {
      new: [`Active case search at peri-urban interface`, `Larval survey in newly developed colonies`, `Mobile fever camps`],
      rising: [`Source reduction in ${area} fringe colonies`, `Drainage cleaning at urban-rural boundary`, `Targeted fogging in growth pockets`],
      persistent: [`Joint MC + PHC vector-control roster`, `Routine container index survey`, `Cross-jurisdiction fever surveillance`],
    },
  };
  return matrix[geoType][signal].slice(0, 3);
}

/**
 * Hybrid action engine: curated entries override auto-derived ones for known geographies.
 * Returns up to 5 location-specific action bundles.
 */
export function getActionFocusAreas(input?: DashboardFiltersLike | string): ActionFocusItem[] {
  const base = resolveFilters(input);
  const recent = getFilteredRegions(buildWindowFilters(base, 14, 0));
  const prior = getFilteredRegions(buildWindowFilters(base, 14, 14));
  const priorByName = new Map(prior.map((r) => [r.name, r.confirmed]));

  // Rank by risk weight + case count
  const ranked = [...recent]
    .map((r) => ({ r, score: (r.risk === "high" ? 1000 : r.risk === "moderate" ? 100 : 10) + r.confirmed }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const out: ActionFocusItem[] = [];
  const seen = new Set<string>();

  // ── Seed-driven entries (highest priority): districts in scope with curated `actions[]`.
  const seedActionDistricts = getSeededDistrictsWithActions(activeStateId);
  const inScope = (name: string) =>
    base.district === "All Districts" || base.district === name;
  const signalToFocusSignal: Record<string, ActionFocusItem["signal"]> = {
    new_emergence: "new",
    rising_cluster: "rising",
    persistent: "persistent",
    moderate: "rising",
    stable_low: "persistent",
  };
  for (const sd of seedActionDistricts) {
    if (!inScope(sd.name)) continue;
    if (seen.has(sd.name)) continue;
    out.push({
      area: sd.name,
      parent: undefined,
      geoType: inferGeoType(sd.name),
      signal: signalToFocusSignal[sd.signal] ?? "persistent",
      actions: sd.actions.slice(0, 3),
      source: "curated",
    });
    seen.add(sd.name);
    if (out.length >= 5) return out;
  }

  for (const { r } of ranked) {
    if (seen.has(r.name)) continue;
    const curated = CURATED_ACTIONS.find((c) => c.match.test(r.name) || (r.parentDistrict && c.match.test(r.parentDistrict)));
    if (curated) {
      out.push({
        area: r.name,
        parent: r.parentBlock || r.parentDistrict || curated.entry.parentHint,
        geoType: curated.entry.geoType,
        signal: curated.entry.signal,
        actions: curated.entry.actions,
        source: "curated",
      });
    } else if (r.risk !== "low" || r.confirmed >= 5) {
      const prev = priorByName.get(r.name) ?? 0;
      const signal: ActionFocusItem["signal"] = prev === 0 && r.confirmed > 0 ? "new" : r.confirmed > prev * 1.3 ? "rising" : "persistent";
      const geoType = inferGeoType(r.name);
      out.push({
        area: r.name,
        parent: r.parentBlock || r.parentDistrict,
        geoType,
        signal,
        actions: autoActionsFor(geoType, signal, r.name),
        source: "auto",
      });
    }
    seen.add(r.name);
    if (out.length >= 5) break;
  }
  return out;
}

// Backwards-compatible live proxies (default state slice with current 3-month window)
export const riskForecast = liveArrayProxy(() => getRiskForecast());
export const weeklyTimeSeries = liveArrayProxy(() => getWeeklyTimeSeries());
export const dailyTimeSeries = liveArrayProxy(() => getDailyTimeSeries());
export const monthlyTimeSeries = liveArrayProxy(() => getMonthlyTimeSeries());
export const forecastData = liveArrayProxy(() => getForecastData());
export const weatherObserved = liveArrayProxy(() => getWeatherObserved());
export const weatherForecast = liveArrayProxy(() => getWeatherForecast());
export const dataQualityIssues = liveArrayProxy(() => getDataQualityIssues());

// Combined weather (observed + forecast) — derived from active state + filters
export const getWeatherData = (input?: DashboardFiltersLike | string, legacyBlock?: string) => [
  ...getWeatherObserved(input, legacyBlock).map((week) => ({ ...week, type: "observed" as const })),
  ...getWeatherForecast(input, legacyBlock).map((week) => ({ ...week, type: "forecast" as const })),
];
export const weatherData = liveArrayProxy(() => getWeatherData());

// ──────────────── Static (truly state-agnostic) ────────────────
export const uploadFormats = [
  { id: "nvbdcp_linelist", name: "NVBDCP Line List", description: "Standard NVBDCP line listing format with patient details, test type, and results", columns: ["SL. NO", "SS Name", "Date of Testing", "Name of Patient", "Sex", "Age", "Address", "Mobile No", "District", "CHC", "SC", "Village", "Travel History", "Urban/Rural", "Referred By", "Test Type (IgM/NS1)", "Positive (Y/N)"] },
  { id: "nvbdcp_daily", name: "NVBDCP Daily Report", description: "Proforma for daily reporting of cases by sentinel site", columns: ["Sl No", "Sentinel Site", "NS1 Tested", "IgM Tested", "Total Tested", "NS1 Positive", "IgM Positive", "Total Positive", "Urban", "Rural", "Others"] },
  { id: "msu_format", name: "MSU / UMSU Format", description: "Municipal surveillance unit reporting format", columns: ["SL. NO", "SS Name", "Date of Testing", "Name of Patient", "Sex", "Age", "Address", "Mobile No", "District", "CHC", "SC", "Village", "Travel History", "Urban/Rural", "Referred By", "Test Type", "Positive (Y/N)"] },
  { id: "lab_report", name: "Lab Reporting", description: "Laboratory test results with NS1/IgM breakdown", columns: ["Sample ID", "Patient Name", "Age", "Gender", "District", "Date Collected", "Date Tested", "NS1 Result", "IgM Result", "Final Result"] },
  { id: "survey_data", name: "Survey Data", description: "Field survey and entomological data", columns: ["Date", "District", "Block", "Ward/Village", "Houses Surveyed", "Containers Found", "Containers Positive", "Breeding Index", "Surveyor Name"] },
];

