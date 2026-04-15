// Mock data for Vector-Borne Disease EWS Dashboard — Hierarchical Role-Based
// Disease multipliers are applied via getDiseaseRegions / getDiseaseKpi etc.

// ── Geography hierarchy ──
export const districts = ["All Districts", "East Godavari", "Krishna", "Guntur", "Kurnool", "Visakhapatnam", "Prakasam", "S.P.S. Nellore", "Srikakulam", "Vizianagaram", "West Godavari", "Anakapalli", "Eluru"];
export const blocks = ["All Blocks", "Bheemunipatnam", "Anakapalle", "Tenali", "Vizag MC", "Vijayawada MC", "Mangalagiri", "Amaravathi", "Gajuwaka", "Nandyal", "Adoni", "Kallur", "Pendurthi"];
export const wards = ["All Wards"];

// ── Region data (district-level) ──
export interface RegionData {
  name: string;
  suspected: number;
  tested: number;
  confirmed: number;
  deaths: number;
  risk: "high" | "moderate" | "low";
  trend: "up" | "down" | "stable";
  type?: "district" | "block" | "municipality" | "village" | "ward";
  parentDistrict?: string;
  parentBlock?: string;
}

export const regionData: RegionData[] = [
  { name: "East Godavari", suspected: 340, tested: 212, confirmed: 47, deaths: 1, risk: "high", trend: "up", type: "district" },
  { name: "Krishna", suspected: 548, tested: 512, confirmed: 49, deaths: 1, risk: "high", trend: "up", type: "district" },
  { name: "S.P.S. Nellore", suspected: 420, tested: 398, confirmed: 38, deaths: 0, risk: "moderate", trend: "stable", type: "district" },
  { name: "Prakasam", suspected: 312, tested: 290, confirmed: 31, deaths: 0, risk: "moderate", trend: "down", type: "district" },
  { name: "Srikakulam", suspected: 198, tested: 180, confirmed: 22, deaths: 0, risk: "low", trend: "stable", type: "district" },
  { name: "Visakhapatnam", suspected: 620, tested: 580, confirmed: 65, deaths: 2, risk: "high", trend: "up", type: "district" },
  { name: "Vizianagaram", suspected: 245, tested: 230, confirmed: 28, deaths: 0, risk: "moderate", trend: "stable", type: "district" },
  { name: "West Godavari", suspected: 380, tested: 355, confirmed: 42, deaths: 1, risk: "high", trend: "up", type: "district" },
  { name: "Guntur", suspected: 490, tested: 460, confirmed: 52, deaths: 1, risk: "high", trend: "down", type: "district" },
  { name: "Kurnool", suspected: 275, tested: 258, confirmed: 30, deaths: 0, risk: "moderate", trend: "stable", type: "district" },
  { name: "Anakapalli", suspected: 150, tested: 140, confirmed: 18, deaths: 0, risk: "low", trend: "down", type: "district" },
  { name: "Eluru", suspected: 130, tested: 120, confirmed: 12, deaths: 0, risk: "low", trend: "stable", type: "district" },
];

// ── Sub-district data: Blocks/Municipalities within each district ──
export const subDistrictData: RegionData[] = [
  // Guntur
  { name: "Tenali", suspected: 145, tested: 132, confirmed: 22, deaths: 1, risk: "high", trend: "up", type: "block", parentDistrict: "Guntur" },
  { name: "Mangalagiri", suspected: 120, tested: 110, confirmed: 15, deaths: 0, risk: "high", trend: "up", type: "municipality", parentDistrict: "Guntur" },
  { name: "Amaravathi", suspected: 95, tested: 88, confirmed: 10, deaths: 0, risk: "moderate", trend: "stable", type: "block", parentDistrict: "Guntur" },
  { name: "Pedakakani", suspected: 70, tested: 68, confirmed: 5, deaths: 0, risk: "low", trend: "down", type: "block", parentDistrict: "Guntur" },
  { name: "Guntur West", suspected: 60, tested: 62, confirmed: 3, deaths: 0, risk: "low", trend: "stable", type: "block", parentDistrict: "Guntur" },
  // Visakhapatnam
  { name: "Bheemunipatnam", suspected: 180, tested: 165, confirmed: 28, deaths: 1, risk: "high", trend: "up", type: "block", parentDistrict: "Visakhapatnam" },
  { name: "Vizag MC", suspected: 200, tested: 190, confirmed: 20, deaths: 1, risk: "high", trend: "up", type: "municipality", parentDistrict: "Visakhapatnam" },
  { name: "Gajuwaka", suspected: 110, tested: 100, confirmed: 12, deaths: 0, risk: "moderate", trend: "stable", type: "block", parentDistrict: "Visakhapatnam" },
  { name: "Pendurthi", suspected: 80, tested: 78, confirmed: 5, deaths: 0, risk: "low", trend: "down", type: "block", parentDistrict: "Visakhapatnam" },
  { name: "Anakapalle", suspected: 50, tested: 47, confirmed: 3, deaths: 0, risk: "low", trend: "stable", type: "block", parentDistrict: "Visakhapatnam" },
  // Kurnool
  { name: "Nandyal", suspected: 110, tested: 100, confirmed: 14, deaths: 0, risk: "high", trend: "up", type: "block", parentDistrict: "Kurnool" },
  { name: "Adoni", suspected: 80, tested: 75, confirmed: 9, deaths: 0, risk: "moderate", trend: "stable", type: "block", parentDistrict: "Kurnool" },
  { name: "Kallur", suspected: 55, tested: 52, confirmed: 5, deaths: 0, risk: "moderate", trend: "stable", type: "block", parentDistrict: "Kurnool" },
  { name: "C.Belagal", suspected: 30, tested: 31, confirmed: 2, deaths: 0, risk: "low", trend: "down", type: "block", parentDistrict: "Kurnool" },
  // Krishna
  { name: "Vijayawada MC", suspected: 200, tested: 195, confirmed: 22, deaths: 1, risk: "high", trend: "up", type: "municipality", parentDistrict: "Krishna" },
  { name: "Machilipatnam", suspected: 140, tested: 130, confirmed: 14, deaths: 0, risk: "moderate", trend: "stable", type: "block", parentDistrict: "Krishna" },
  { name: "Gudivada", suspected: 100, tested: 95, confirmed: 8, deaths: 0, risk: "moderate", trend: "up", type: "block", parentDistrict: "Krishna" },
  { name: "Nuzvid", suspected: 60, tested: 55, confirmed: 5, deaths: 0, risk: "low", trend: "stable", type: "block", parentDistrict: "Krishna" },
];

// ── Village data (within blocks) — REAL NAMES ──
export const villageData: RegionData[] = [
  // Tenali block villages
  { name: "Kollipara", suspected: 48, tested: 44, confirmed: 9, deaths: 0, risk: "high", trend: "up", type: "village", parentDistrict: "Guntur", parentBlock: "Tenali" },
  { name: "Pedaravuru", suspected: 42, tested: 38, confirmed: 7, deaths: 0, risk: "moderate", trend: "up", type: "village", parentDistrict: "Guntur", parentBlock: "Tenali" },
  { name: "Angalakuduru", suspected: 30, tested: 28, confirmed: 4, deaths: 0, risk: "moderate", trend: "stable", type: "village", parentDistrict: "Guntur", parentBlock: "Tenali" },
  { name: "Duggirala", suspected: 25, tested: 22, confirmed: 2, deaths: 0, risk: "low", trend: "down", type: "village", parentDistrict: "Guntur", parentBlock: "Tenali" },
  // Bheemunipatnam block villages
  { name: "Thagarapuvalasa", suspected: 62, tested: 58, confirmed: 12, deaths: 1, risk: "high", trend: "up", type: "village", parentDistrict: "Visakhapatnam", parentBlock: "Bheemunipatnam" },
  { name: "Anandapuram", suspected: 50, tested: 45, confirmed: 9, deaths: 0, risk: "high", trend: "up", type: "village", parentDistrict: "Visakhapatnam", parentBlock: "Bheemunipatnam" },
  { name: "Rushikonda", suspected: 38, tested: 34, confirmed: 5, deaths: 0, risk: "moderate", trend: "stable", type: "village", parentDistrict: "Visakhapatnam", parentBlock: "Bheemunipatnam" },
  { name: "Kapuluppada", suspected: 30, tested: 28, confirmed: 2, deaths: 0, risk: "low", trend: "down", type: "village", parentDistrict: "Visakhapatnam", parentBlock: "Bheemunipatnam" },
  // Anakapalle block villages
  { name: "Kasimkota", suspected: 20, tested: 18, confirmed: 2, deaths: 0, risk: "low", trend: "stable", type: "village", parentDistrict: "Visakhapatnam", parentBlock: "Anakapalle" },
  { name: "Chodavaram", suspected: 18, tested: 17, confirmed: 1, deaths: 0, risk: "low", trend: "down", type: "village", parentDistrict: "Visakhapatnam", parentBlock: "Anakapalle" },
  // Nandyal block villages
  { name: "Mahanandi", suspected: 40, tested: 36, confirmed: 6, deaths: 0, risk: "high", trend: "up", type: "village", parentDistrict: "Kurnool", parentBlock: "Nandyal" },
  { name: "Banaganapalle", suspected: 35, tested: 32, confirmed: 4, deaths: 0, risk: "moderate", trend: "stable", type: "village", parentDistrict: "Kurnool", parentBlock: "Nandyal" },
  { name: "Koilkuntla", suspected: 25, tested: 22, confirmed: 3, deaths: 0, risk: "moderate", trend: "stable", type: "village", parentDistrict: "Kurnool", parentBlock: "Nandyal" },
  // Amaravathi block villages
  { name: "Undavalli", suspected: 35, tested: 32, confirmed: 5, deaths: 0, risk: "moderate", trend: "up", type: "village", parentDistrict: "Guntur", parentBlock: "Amaravathi" },
  { name: "Tadepalli", suspected: 30, tested: 28, confirmed: 3, deaths: 0, risk: "low", trend: "stable", type: "village", parentDistrict: "Guntur", parentBlock: "Amaravathi" },
  { name: "Penumaka", suspected: 20, tested: 18, confirmed: 2, deaths: 0, risk: "low", trend: "down", type: "village", parentDistrict: "Guntur", parentBlock: "Amaravathi" },
  // Gajuwaka block villages
  { name: "Pedagantyada", suspected: 38, tested: 35, confirmed: 5, deaths: 0, risk: "moderate", trend: "up", type: "village", parentDistrict: "Visakhapatnam", parentBlock: "Gajuwaka" },
  { name: "Nathayyapalem", suspected: 32, tested: 28, confirmed: 4, deaths: 0, risk: "moderate", trend: "stable", type: "village", parentDistrict: "Visakhapatnam", parentBlock: "Gajuwaka" },
  { name: "Aganampudi", suspected: 22, tested: 20, confirmed: 2, deaths: 0, risk: "low", trend: "down", type: "village", parentDistrict: "Visakhapatnam", parentBlock: "Gajuwaka" },
];

// ── Ward data (within municipalities) — REAL NAMES ──
export const wardData: RegionData[] = [
  // Vizag MC wards
  { name: "MVP Colony", suspected: 55, tested: 50, confirmed: 8, deaths: 0, risk: "high", trend: "up", type: "ward", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
  { name: "Gajuwaka", suspected: 42, tested: 38, confirmed: 5, deaths: 0, risk: "moderate", trend: "up", type: "ward", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
  { name: "Dwaraka Nagar", suspected: 35, tested: 32, confirmed: 4, deaths: 0, risk: "moderate", trend: "stable", type: "ward", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
  { name: "Akkayyapalem", suspected: 28, tested: 30, confirmed: 2, deaths: 0, risk: "low", trend: "down", type: "ward", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
  { name: "Seethammadhara", suspected: 22, tested: 20, confirmed: 1, deaths: 0, risk: "low", trend: "stable", type: "ward", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
  // Vijayawada MC wards
  { name: "Benz Circle", suspected: 58, tested: 55, confirmed: 9, deaths: 0, risk: "high", trend: "up", type: "ward", parentDistrict: "Krishna", parentBlock: "Vijayawada MC" },
  { name: "Governorpet", suspected: 45, tested: 42, confirmed: 6, deaths: 0, risk: "moderate", trend: "stable", type: "ward", parentDistrict: "Krishna", parentBlock: "Vijayawada MC" },
  { name: "Patamata", suspected: 38, tested: 36, confirmed: 4, deaths: 0, risk: "moderate", trend: "stable", type: "ward", parentDistrict: "Krishna", parentBlock: "Vijayawada MC" },
  { name: "Gunadala", suspected: 30, tested: 28, confirmed: 2, deaths: 0, risk: "low", trend: "down", type: "ward", parentDistrict: "Krishna", parentBlock: "Vijayawada MC" },
  // Mangalagiri wards
  { name: "Mangalagiri Ward 1", suspected: 40, tested: 38, confirmed: 6, deaths: 0, risk: "high", trend: "up", type: "ward", parentDistrict: "Guntur", parentBlock: "Mangalagiri" },
  { name: "Mangalagiri Ward 4", suspected: 35, tested: 32, confirmed: 4, deaths: 0, risk: "moderate", trend: "stable", type: "ward", parentDistrict: "Guntur", parentBlock: "Mangalagiri" },
  { name: "Mangalagiri Ward 8", suspected: 25, tested: 22, confirmed: 3, deaths: 0, risk: "moderate", trend: "up", type: "ward", parentDistrict: "Guntur", parentBlock: "Mangalagiri" },
];

// ── Get regions at the correct hierarchy level based on role/filters ──
export function getFilteredRegions(district: string, block?: string): RegionData[] {
  if (block && block !== "All Blocks") {
    const villages = villageData.filter(v => v.parentBlock === block);
    const wardsInBlock = wardData.filter(w => w.parentBlock === block);
    const result = [...villages, ...wardsInBlock];
    return result.length > 0 ? result : subDistrictData.filter(s => s.name === block);
  }
  if (district && district !== "All Districts") {
    const subs = subDistrictData.filter(s => s.parentDistrict === district);
    return subs.length > 0 ? subs : regionData.filter(r => r.name === district);
  }
  return regionData;
}

export function getKpiFromRegions(regions: RegionData[]) {
  return {
    suspected: regions.reduce((s, r) => s + r.suspected, 0),
    tested: regions.reduce((s, r) => s + r.tested, 0),
    confirmed: regions.reduce((s, r) => s + r.confirmed, 0),
    deaths: regions.reduce((s, r) => s + r.deaths, 0),
  };
}

// Apply disease multiplier to region data
export function applyDiseaseMultiplier(regions: RegionData[], multiplier: number): RegionData[] {
  if (multiplier === 1) return regions;
  return regions.map(r => ({
    ...r,
    suspected: Math.round(r.suspected * multiplier),
    tested: Math.round(r.tested * multiplier),
    confirmed: Math.round(r.confirmed * multiplier),
    deaths: Math.round(r.deaths * multiplier),
  }));
}

export function getSituationSummary(regions: RegionData[], diseaseName: string, district?: string, block?: string) {
  const kpi = getKpiFromRegions(regions);
  const highRisk = regions.filter(r => r.risk === "high");
  const highNames = highRisk.map(r => r.name).join(", ");
  const areaLabel = block && block !== "All Blocks"
    ? "villages/wards"
    : district && district !== "All Districts"
    ? "blocks/municipalities"
    : "districts";

  if (regions.length === 1) {
    const r = regions[0];
    return `${r.name} has recorded ${kpi.confirmed} confirmed ${diseaseName} cases with ${kpi.deaths} death(s). Risk level: ${r.risk}. Trend: ${r.trend === "up" ? "increasing" : r.trend === "down" ? "declining" : "stable"}.`;
  }
  return `${kpi.confirmed} confirmed ${diseaseName} cases across ${regions.length} ${areaLabel} with ${kpi.deaths} deaths. ${highRisk.length > 0 ? `High-risk areas: ${highNames}.` : "No areas at high risk currently."} Forecast indicates projected increase in weeks W+2 to W+3.`;
}

// ── Outbreak Prediction Data (role-specific) ──
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

// State-level (district predictions)
export const statePredictions: OutbreakPrediction[] = [
  { area: "Guntur", probability: 78, risk: "high", expectedWeek: "W+3", signal: "Cases rising + TPR spike + Historical trend" },
  { area: "Krishna", probability: 72, risk: "high", expectedWeek: "W+2", signal: "Cases rising + Climate conditions favorable" },
  { area: "Visakhapatnam", probability: 61, risk: "moderate", expectedWeek: "W+3", signal: "TPR spike + High humidity corridor" },
  { area: "East Godavari", probability: 55, risk: "moderate", expectedWeek: "W+3", signal: "Historical trend + Post-rainfall breeding" },
  { area: "West Godavari", probability: 48, risk: "moderate", expectedWeek: "W+4", signal: "Climate conditions + Moderate case load" },
  { area: "S.P.S. Nellore", probability: 35, risk: "moderate", expectedWeek: "W+4", signal: "Seasonal pattern" },
  { area: "Kurnool", probability: 30, risk: "moderate", expectedWeek: "W+3", signal: "Historical trend + Moderate humidity" },
  { area: "Prakasam", probability: 18, risk: "low", expectedWeek: "W+4", signal: "Low case load + Declining trend" },
  { area: "Srikakulam", probability: 12, risk: "low", expectedWeek: "W+4", signal: "Low baseline + No climate trigger" },
  { area: "Anakapalli", probability: 15, risk: "low", expectedWeek: "W+4", signal: "Declining cases + Stable climate" },
  { area: "Eluru", probability: 10, risk: "low", expectedWeek: "W+4", signal: "Low baseline" },
  { area: "Vizianagaram", probability: 22, risk: "low", expectedWeek: "W+4", signal: "Seasonal pattern" },
];

// District-level (block/municipality predictions)
export const districtPredictions: OutbreakPrediction[] = [
  // Guntur
  { area: "Tenali", probability: 82, risk: "high", expectedWeek: "W+2", signal: "Cases rising + TPR spike", parentDistrict: "Guntur", areaType: "Block" },
  { area: "Mangalagiri", probability: 70, risk: "high", expectedWeek: "W+3", signal: "Climate conditions + Hospital OPD spike", parentDistrict: "Guntur", areaType: "Municipality" },
  { area: "Amaravathi", probability: 55, risk: "moderate", expectedWeek: "W+3", signal: "Historical trend + Stagnant water", parentDistrict: "Guntur", areaType: "Block" },
  { area: "Pedakakani", probability: 28, risk: "low", expectedWeek: "W+4", signal: "Low baseline", parentDistrict: "Guntur", areaType: "Block" },
  { area: "Guntur West", probability: 18, risk: "low", expectedWeek: "W+4", signal: "Declining cases", parentDistrict: "Guntur", areaType: "Block" },
  // Visakhapatnam
  { area: "Bheemunipatnam", probability: 85, risk: "high", expectedWeek: "W+2", signal: "Cases rising + Post-rainfall breeding", parentDistrict: "Visakhapatnam", areaType: "Block" },
  { area: "Vizag MC", probability: 75, risk: "high", expectedWeek: "W+3", signal: "Waterlogging + OPD spike", parentDistrict: "Visakhapatnam", areaType: "Municipality" },
  { area: "Gajuwaka", probability: 60, risk: "moderate", expectedWeek: "W+3", signal: "TPR spike + Construction debris", parentDistrict: "Visakhapatnam", areaType: "Block" },
  { area: "Pendurthi", probability: 32, risk: "moderate", expectedWeek: "W+4", signal: "Moderate humidity", parentDistrict: "Visakhapatnam", areaType: "Block" },
  { area: "Anakapalle", probability: 15, risk: "low", expectedWeek: "W+4", signal: "Stable climate", parentDistrict: "Visakhapatnam", areaType: "Block" },
  // Kurnool
  { area: "Nandyal", probability: 80, risk: "high", expectedWeek: "W+2", signal: "Cases rising + Historical trend", parentDistrict: "Kurnool", areaType: "Block" },
  { area: "Adoni", probability: 65, risk: "moderate", expectedWeek: "W+3", signal: "TPR increase + Climate conditions", parentDistrict: "Kurnool", areaType: "Block" },
  { area: "Kallur", probability: 58, risk: "moderate", expectedWeek: "W+3", signal: "Historical trend + Moderate case load", parentDistrict: "Kurnool", areaType: "Block" },
  { area: "C.Belagal", probability: 20, risk: "low", expectedWeek: "W+4", signal: "Low baseline", parentDistrict: "Kurnool", areaType: "Block" },
  // Krishna
  { area: "Vijayawada MC", probability: 78, risk: "high", expectedWeek: "W+2", signal: "Hospital OPD spike + Waterlogging", parentDistrict: "Krishna", areaType: "Municipality" },
  { area: "Machilipatnam", probability: 52, risk: "moderate", expectedWeek: "W+3", signal: "Historical trend", parentDistrict: "Krishna", areaType: "Block" },
  { area: "Gudivada", probability: 45, risk: "moderate", expectedWeek: "W+3", signal: "Cases rising", parentDistrict: "Krishna", areaType: "Block" },
  { area: "Nuzvid", probability: 20, risk: "low", expectedWeek: "W+4", signal: "Low baseline", parentDistrict: "Krishna", areaType: "Block" },
];

// Block-level (village predictions)
export const blockPredictions: OutbreakPrediction[] = [
  // Tenali
  { area: "Kollipara", probability: 88, risk: "high", expectedWeek: "W+2", signal: "Cases rising + Breeding sites found", parentDistrict: "Guntur", parentBlock: "Tenali" },
  { area: "Pedaravuru", probability: 66, risk: "moderate", expectedWeek: "W+3", signal: "TPR increase + Stagnant water", parentDistrict: "Guntur", parentBlock: "Tenali" },
  { area: "Angalakuduru", probability: 52, risk: "moderate", expectedWeek: "W+4", signal: "Historical trend", parentDistrict: "Guntur", parentBlock: "Tenali" },
  { area: "Duggirala", probability: 22, risk: "low", expectedWeek: "W+4", signal: "Declining cases", parentDistrict: "Guntur", parentBlock: "Tenali" },
  // Bheemunipatnam
  { area: "Thagarapuvalasa", probability: 90, risk: "high", expectedWeek: "W+2", signal: "Cases rising + Post-rainfall + Breeding sites", parentDistrict: "Visakhapatnam", parentBlock: "Bheemunipatnam" },
  { area: "Anandapuram", probability: 70, risk: "high", expectedWeek: "W+3", signal: "TPR spike + Community reports", parentDistrict: "Visakhapatnam", parentBlock: "Bheemunipatnam" },
  { area: "Rushikonda", probability: 55, risk: "moderate", expectedWeek: "W+3", signal: "Historical trend + Climate conditions", parentDistrict: "Visakhapatnam", parentBlock: "Bheemunipatnam" },
  { area: "Kapuluppada", probability: 20, risk: "low", expectedWeek: "W+4", signal: "Low baseline", parentDistrict: "Visakhapatnam", parentBlock: "Bheemunipatnam" },
  // Nandyal
  { area: "Mahanandi", probability: 82, risk: "high", expectedWeek: "W+2", signal: "Cases rising + Field reports", parentDistrict: "Kurnool", parentBlock: "Nandyal" },
  { area: "Banaganapalle", probability: 55, risk: "moderate", expectedWeek: "W+3", signal: "Historical trend", parentDistrict: "Kurnool", parentBlock: "Nandyal" },
  { area: "Koilkuntla", probability: 42, risk: "moderate", expectedWeek: "W+3", signal: "Moderate case load", parentDistrict: "Kurnool", parentBlock: "Nandyal" },
  // Amaravathi
  { area: "Undavalli", probability: 58, risk: "moderate", expectedWeek: "W+3", signal: "Stagnant water + Construction", parentDistrict: "Guntur", parentBlock: "Amaravathi" },
  { area: "Tadepalli", probability: 35, risk: "low", expectedWeek: "W+4", signal: "Stable climate", parentDistrict: "Guntur", parentBlock: "Amaravathi" },
  { area: "Penumaka", probability: 22, risk: "low", expectedWeek: "W+4", signal: "Low baseline", parentDistrict: "Guntur", parentBlock: "Amaravathi" },
  // Gajuwaka
  { area: "Pedagantyada", probability: 62, risk: "moderate", expectedWeek: "W+3", signal: "TPR spike + Urban density", parentDistrict: "Visakhapatnam", parentBlock: "Gajuwaka" },
  { area: "Nathayyapalem", probability: 48, risk: "moderate", expectedWeek: "W+3", signal: "Historical trend", parentDistrict: "Visakhapatnam", parentBlock: "Gajuwaka" },
  { area: "Aganampudi", probability: 25, risk: "low", expectedWeek: "W+4", signal: "Declining cases", parentDistrict: "Visakhapatnam", parentBlock: "Gajuwaka" },
];

// Municipality-level (ward predictions)
export const municipalityPredictions: OutbreakPrediction[] = [
  // Vizag MC
  { area: "MVP Colony", probability: 92, risk: "high", expectedWeek: "W+2", signal: "Cases rising + Waterlogging in ward", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
  { area: "Gajuwaka", probability: 68, risk: "moderate", expectedWeek: "W+3", signal: "TPR spike + Construction sites", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
  { area: "Dwaraka Nagar", probability: 50, risk: "moderate", expectedWeek: "W+4", signal: "Historical trend", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
  { area: "Akkayyapalem", probability: 25, risk: "low", expectedWeek: "W+4", signal: "Low baseline", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
  // Vijayawada MC
  { area: "Benz Circle", probability: 85, risk: "high", expectedWeek: "W+2", signal: "Cases rising + Poor drainage", parentDistrict: "Krishna", parentBlock: "Vijayawada MC" },
  { area: "Governorpet", probability: 65, risk: "moderate", expectedWeek: "W+3", signal: "TPR increase + Market area breeding", parentDistrict: "Krishna", parentBlock: "Vijayawada MC" },
  { area: "Patamata", probability: 55, risk: "moderate", expectedWeek: "W+4", signal: "Historical trend + Moderate humidity", parentDistrict: "Krishna", parentBlock: "Vijayawada MC" },
  { area: "Gunadala", probability: 18, risk: "low", expectedWeek: "W+4", signal: "Low baseline", parentDistrict: "Krishna", parentBlock: "Vijayawada MC" },
  // Mangalagiri
  { area: "Mangalagiri Ward 1", probability: 72, risk: "high", expectedWeek: "W+2", signal: "Cases rising + Stagnant water", parentDistrict: "Guntur", parentBlock: "Mangalagiri" },
  { area: "Mangalagiri Ward 4", probability: 48, risk: "moderate", expectedWeek: "W+3", signal: "Historical trend", parentDistrict: "Guntur", parentBlock: "Mangalagiri" },
  { area: "Mangalagiri Ward 8", probability: 38, risk: "moderate", expectedWeek: "W+3", signal: "Construction debris + Climate", parentDistrict: "Guntur", parentBlock: "Mangalagiri" },
];

// ── Get predictions based on role hierarchy ──
export function getOutbreakPredictions(district: string, block?: string): OutbreakPrediction[] {
  if (block && block !== "All Blocks") {
    const muniPreds = municipalityPredictions.filter(p => p.parentBlock === block);
    if (muniPreds.length > 0) return muniPreds.sort((a, b) => b.probability - a.probability);
    const blockPreds = blockPredictions.filter(p => p.parentBlock === block);
    return blockPreds.sort((a, b) => b.probability - a.probability);
  }
  if (district && district !== "All Districts") {
    return districtPredictions.filter(p => p.parentDistrict === district).sort((a, b) => b.probability - a.probability);
  }
  return statePredictions.sort((a, b) => b.probability - a.probability);
}

// ── Hotspot data (hierarchical) ──
export interface HotspotData {
  area: string;
  currentCases: number;
  prevCases: number;
  trend: "up" | "down" | "stable";
  risk: "high" | "moderate" | "low";
  parentDistrict?: string;
  parentBlock?: string;
}

export const hotspotDistrictData: HotspotData[] = [
  { area: "Krishna", currentCases: 49, prevCases: 32, trend: "up", risk: "high" },
  { area: "Visakhapatnam", currentCases: 65, prevCases: 45, trend: "up", risk: "high" },
  { area: "Guntur", currentCases: 52, prevCases: 60, trend: "down", risk: "high" },
  { area: "East Godavari", currentCases: 47, prevCases: 44, trend: "stable", risk: "high" },
  { area: "West Godavari", currentCases: 42, prevCases: 30, trend: "up", risk: "moderate" },
  { area: "Kurnool", currentCases: 30, prevCases: 28, trend: "stable", risk: "moderate" },
  { area: "Prakasam", currentCases: 31, prevCases: 35, trend: "down", risk: "low" },
];

export const hotspotSubDistrictData: HotspotData[] = [
  // Guntur
  { area: "Tenali", currentCases: 22, prevCases: 14, trend: "up", risk: "high", parentDistrict: "Guntur" },
  { area: "Mangalagiri", currentCases: 15, prevCases: 10, trend: "up", risk: "high", parentDistrict: "Guntur" },
  { area: "Amaravathi", currentCases: 10, prevCases: 12, trend: "down", risk: "moderate", parentDistrict: "Guntur" },
  // Visakhapatnam
  { area: "Bheemunipatnam", currentCases: 28, prevCases: 18, trend: "up", risk: "high", parentDistrict: "Visakhapatnam" },
  { area: "Vizag MC", currentCases: 20, prevCases: 14, trend: "up", risk: "high", parentDistrict: "Visakhapatnam" },
  { area: "Gajuwaka", currentCases: 12, prevCases: 10, trend: "stable", risk: "moderate", parentDistrict: "Visakhapatnam" },
  // Kurnool
  { area: "Nandyal", currentCases: 14, prevCases: 8, trend: "up", risk: "high", parentDistrict: "Kurnool" },
  { area: "Adoni", currentCases: 9, prevCases: 10, trend: "down", risk: "moderate", parentDistrict: "Kurnool" },
  { area: "Kallur", currentCases: 5, prevCases: 6, trend: "stable", risk: "moderate", parentDistrict: "Kurnool" },
  // Krishna
  { area: "Vijayawada MC", currentCases: 22, prevCases: 15, trend: "up", risk: "high", parentDistrict: "Krishna" },
  { area: "Machilipatnam", currentCases: 14, prevCases: 10, trend: "up", risk: "moderate", parentDistrict: "Krishna" },
];

export const hotspotVillageData: HotspotData[] = [
  // Tenali
  { area: "Kollipara", currentCases: 9, prevCases: 5, trend: "up", risk: "high", parentDistrict: "Guntur", parentBlock: "Tenali" },
  { area: "Pedaravuru", currentCases: 7, prevCases: 5, trend: "up", risk: "moderate", parentDistrict: "Guntur", parentBlock: "Tenali" },
  { area: "Angalakuduru", currentCases: 4, prevCases: 4, trend: "stable", risk: "moderate", parentDistrict: "Guntur", parentBlock: "Tenali" },
  // Bheemunipatnam
  { area: "Thagarapuvalasa", currentCases: 12, prevCases: 7, trend: "up", risk: "high", parentDistrict: "Visakhapatnam", parentBlock: "Bheemunipatnam" },
  { area: "Anandapuram", currentCases: 9, prevCases: 6, trend: "up", risk: "high", parentDistrict: "Visakhapatnam", parentBlock: "Bheemunipatnam" },
  { area: "Rushikonda", currentCases: 5, prevCases: 4, trend: "stable", risk: "moderate", parentDistrict: "Visakhapatnam", parentBlock: "Bheemunipatnam" },
  // Vizag MC (wards)
  { area: "MVP Colony", currentCases: 8, prevCases: 4, trend: "up", risk: "high", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
  { area: "Gajuwaka", currentCases: 5, prevCases: 4, trend: "up", risk: "moderate", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
  { area: "Dwaraka Nagar", currentCases: 4, prevCases: 3, trend: "stable", risk: "moderate", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
  // Vijayawada MC (wards)
  { area: "Benz Circle", currentCases: 9, prevCases: 5, trend: "up", risk: "high", parentDistrict: "Krishna", parentBlock: "Vijayawada MC" },
  { area: "Governorpet", currentCases: 6, prevCases: 5, trend: "stable", risk: "moderate", parentDistrict: "Krishna", parentBlock: "Vijayawada MC" },
  { area: "Patamata", currentCases: 4, prevCases: 4, trend: "stable", risk: "moderate", parentDistrict: "Krishna", parentBlock: "Vijayawada MC" },
  // Nandyal
  { area: "Mahanandi", currentCases: 6, prevCases: 3, trend: "up", risk: "high", parentDistrict: "Kurnool", parentBlock: "Nandyal" },
  { area: "Banaganapalle", currentCases: 4, prevCases: 4, trend: "stable", risk: "moderate", parentDistrict: "Kurnool", parentBlock: "Nandyal" },
];

export function getFilteredHotspots(district: string, block?: string): HotspotData[] {
  if (block && block !== "All Blocks") {
    return hotspotVillageData.filter(h => h.parentBlock === block);
  }
  if (district && district !== "All Districts") {
    return hotspotSubDistrictData.filter(h => h.parentDistrict === district);
  }
  return hotspotDistrictData;
}

export const hotspotAlerts = [
  { id: 1, district: "Krishna", message: "Unusual spike in confirmed cases — 28 new cases in W-1", severity: "high" as const },
  { id: 2, district: "East Godavari", message: "TPR rising above 30% for 2 consecutive weeks", severity: "high" as const },
  { id: 3, district: "Visakhapatnam", message: "New cluster detected in Pendurthi block", severity: "moderate" as const },
  { id: 4, district: "Guntur", message: "Tenali block shows rapid case increase", severity: "high" as const },
  { id: 5, district: "Kurnool", message: "Nandyal block emerging hotspot", severity: "moderate" as const },
];

// ── Risk forecast (W+1 to W+4) with date ranges ──
export const riskForecast = [
  { week: "W+1", risk: "moderate" as const, cases: 45, label: "8–14 Apr 2026" },
  { week: "W+2", risk: "high" as const, cases: 68, label: "15–21 Apr 2026" },
  { week: "W+3", risk: "high" as const, cases: 92, label: "22–28 Apr 2026" },
  { week: "W+4", risk: "moderate" as const, cases: 71, label: "29 Apr–5 May" },
];

// ── Time series with W- labels ──
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
  { patient: "Ravi Kumar", gender: "Male", age: 32, subDistrict: "Bheemunipatnam", block: "Bheemunipatnam", village: "Thagarapuvalasa", district: "Visakhapatnam", diagnosis: "Dengue", testType: "NS1", testResult: "Positive", dateOfTesting: "2026-04-02", urbanRural: "Rural", referredBy: "ASHA" },
  { patient: "Lakshmi Devi", gender: "Female", age: 45, subDistrict: "Tenali", block: "Tenali", village: "Kollipara", district: "Guntur", diagnosis: "Dengue", testType: "IgM", testResult: "Positive", dateOfTesting: "2026-04-03", urbanRural: "Rural", referredBy: "ANM" },
  { patient: "Mohan Rao", gender: "Male", age: 28, subDistrict: "Vizag MC", block: "Vizag MC", village: "MVP Colony", district: "Visakhapatnam", diagnosis: "Dengue", testType: "NS1", testResult: "Positive", dateOfTesting: "2026-04-04", urbanRural: "Urban", referredBy: "MO" },
  { patient: "Padma K", gender: "Female", age: 36, subDistrict: "Vijayawada MC", block: "Vijayawada MC", village: "Benz Circle", district: "Krishna", diagnosis: "Dengue", testType: "NS1", testResult: "Positive", dateOfTesting: "2026-04-05", urbanRural: "Urban", referredBy: "HW" },
];

// ── Forecast (actual vs predicted) with W- / W+ labels ──
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

// ── Weather data (observed + forecast) with W- / W+ labels and dates ──
export const weatherObserved = [
  { week: "W-4", endDate: "17 Mar 2026", rainfall: 0.0, temp: 28.8, maxT: 37.0, minT: 20.8, humidity: 20.9 },
  { week: "W-3", endDate: "24 Mar 2026", rainfall: 3.4, temp: 25.7, maxT: 34.8, minT: 16.9, humidity: 39.7 },
  { week: "W-2", endDate: "31 Mar 2026", rainfall: 3.3, temp: 29.9, maxT: 37.0, minT: 21.8, humidity: 32.1 },
  { week: "W-1", endDate: "7 Apr 2026", rainfall: 1.7, temp: 27.8, maxT: 36.3, minT: 20.7, humidity: 37.4 },
];

export const weatherForecast = [
  { week: "W+1", endDate: "14 Apr 2026", rainfall: 5.2, temp: 30.1, maxT: 37.5, minT: 22.0, humidity: 45.0 },
  { week: "W+2", endDate: "21 Apr 2026", rainfall: 12.4, temp: 31.2, maxT: 38.0, minT: 23.5, humidity: 52.0 },
  { week: "W+3", endDate: "28 Apr 2026", rainfall: 18.6, temp: 32.0, maxT: 38.5, minT: 24.0, humidity: 58.0 },
  { week: "W+4", endDate: "5 May 2026", rainfall: 25.0, temp: 31.5, maxT: 37.8, minT: 24.2, humidity: 62.0 },
  { week: "W+5", endDate: "12 May 2026", rainfall: 35.0, temp: 30.8, maxT: 37.0, minT: 24.5, humidity: 68.0 },
  { week: "W+6", endDate: "19 May 2026", rainfall: 42.0, temp: 30.2, maxT: 36.5, minT: 24.0, humidity: 72.0 },
  { week: "W+7", endDate: "26 May 2026", rainfall: 55.0, temp: 29.5, maxT: 35.8, minT: 23.8, humidity: 75.0 },
  { week: "W+8", endDate: "2 Jun 2026", rainfall: 65.0, temp: 28.8, maxT: 34.5, minT: 23.5, humidity: 78.0 },
];

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
  // Sub-district coordinates
  "Tenali": [16.24, 80.64],
  "Mangalagiri": [16.43, 80.57],
  "Amaravathi": [16.57, 80.36],
  "Pedakakani": [16.25, 80.48],
  "Guntur West": [16.31, 80.38],
  "Bheemunipatnam": [17.89, 83.45],
  "Vizag MC": [17.72, 83.30],
  "Gajuwaka": [17.70, 83.22],
  "Pendurthi": [17.76, 83.21],
  "Anakapalle": [17.69, 83.00],
  "Nandyal": [15.48, 78.48],
  "Adoni": [15.63, 77.28],
  "Kallur": [15.69, 78.05],
  "C.Belagal": [15.70, 78.15],
  "Vijayawada MC": [16.51, 80.65],
  "Machilipatnam": [16.19, 81.14],
  "Gudivada": [16.44, 81.10],
  "Nuzvid": [16.79, 80.85],
  // Village coordinates (real places)
  "Kollipara": [16.22, 80.62],
  "Pedaravuru": [16.26, 80.66],
  "Angalakuduru": [16.23, 80.60],
  "Duggirala": [16.32, 80.58],
  "Thagarapuvalasa": [17.91, 83.47],
  "Anandapuram": [17.87, 83.43],
  "Rushikonda": [17.78, 83.38],
  "Kapuluppada": [17.85, 83.45],
  "Kasimkota": [17.66, 82.97],
  "Chodavaram": [17.83, 82.93],
  "Mahanandi": [15.58, 78.62],
  "Banaganapalle": [15.68, 78.23],
  "Koilkuntla": [15.23, 78.32],
  "Undavalli": [16.50, 80.44],
  "Tadepalli": [16.47, 80.62],
  "Penumaka": [16.52, 80.38],
  "Pedagantyada": [17.75, 83.25],
  "Nathayyapalem": [17.73, 83.20],
  "Aganampudi": [17.68, 83.18],
  // Ward coordinates (approximate within municipalities)
  "MVP Colony": [17.74, 83.32],
  "Dwaraka Nagar": [17.73, 83.26],
  "Akkayyapalem": [17.70, 83.34],
  "Seethammadhara": [17.72, 83.30],
  "Benz Circle": [16.53, 80.67],
  "Governorpet": [16.50, 80.63],
  "Patamata": [16.49, 80.61],
  "Gunadala": [16.52, 80.65],
  "Mangalagiri Ward 1": [16.44, 80.59],
  "Mangalagiri Ward 4": [16.42, 80.55],
  "Mangalagiri Ward 8": [16.45, 80.57],
};
