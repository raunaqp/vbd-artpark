// Mock data for Dengue EWS Dashboard — Hierarchical Role-Based

// ── Geography hierarchy ──
export const districts = ["All Districts", "East Godavari", "Krishna", "Guntur", "Kurnool", "Visakhapatnam", "Prakasam", "S.P.S. Nellore", "Srikakulam", "Vizianagaram", "West Godavari", "Anakapalli", "Eluru"];
export const blocks = ["All Blocks", "Bheemunipatnam", "Anakapalle", "Tenali", "Vizag MC", "Vijayawada MC", "Mangalagiri", "Amaravathi", "Gajuwaka", "Nandyal", "Adoni", "Kallur", "Pendurthi"];
export const wards = ["All Wards", "Ward 1", "Ward 2", "Ward 3", "Ward 4", "Ward 5", "Ward 11", "Ward 12", "Ward 18", "Ward 19", "Ward 22"];

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

// ── Village data (within blocks) ──
export const villageData: RegionData[] = [
  // Tenali block
  { name: "Village A", suspected: 48, tested: 44, confirmed: 9, deaths: 0, risk: "high", trend: "up", type: "village", parentDistrict: "Guntur", parentBlock: "Tenali" },
  { name: "Village B", suspected: 42, tested: 38, confirmed: 7, deaths: 0, risk: "moderate", trend: "up", type: "village", parentDistrict: "Guntur", parentBlock: "Tenali" },
  { name: "Village C", suspected: 30, tested: 28, confirmed: 4, deaths: 0, risk: "moderate", trend: "stable", type: "village", parentDistrict: "Guntur", parentBlock: "Tenali" },
  { name: "Village D", suspected: 25, tested: 22, confirmed: 2, deaths: 0, risk: "low", trend: "down", type: "village", parentDistrict: "Guntur", parentBlock: "Tenali" },
  // Bheemunipatnam block
  { name: "Village X", suspected: 62, tested: 58, confirmed: 12, deaths: 1, risk: "high", trend: "up", type: "village", parentDistrict: "Visakhapatnam", parentBlock: "Bheemunipatnam" },
  { name: "Village Y", suspected: 50, tested: 45, confirmed: 9, deaths: 0, risk: "high", trend: "up", type: "village", parentDistrict: "Visakhapatnam", parentBlock: "Bheemunipatnam" },
  { name: "Village Z", suspected: 38, tested: 34, confirmed: 5, deaths: 0, risk: "moderate", trend: "stable", type: "village", parentDistrict: "Visakhapatnam", parentBlock: "Bheemunipatnam" },
  { name: "Village W", suspected: 30, tested: 28, confirmed: 2, deaths: 0, risk: "low", trend: "down", type: "village", parentDistrict: "Visakhapatnam", parentBlock: "Bheemunipatnam" },
  // Anakapalle block
  { name: "Village P", suspected: 20, tested: 18, confirmed: 2, deaths: 0, risk: "low", trend: "stable", type: "village", parentDistrict: "Visakhapatnam", parentBlock: "Anakapalle" },
  { name: "Village Q", suspected: 18, tested: 17, confirmed: 1, deaths: 0, risk: "low", trend: "down", type: "village", parentDistrict: "Visakhapatnam", parentBlock: "Anakapalle" },
  // Nandyal block
  { name: "Village N1", suspected: 40, tested: 36, confirmed: 6, deaths: 0, risk: "high", trend: "up", type: "village", parentDistrict: "Kurnool", parentBlock: "Nandyal" },
  { name: "Village N2", suspected: 35, tested: 32, confirmed: 4, deaths: 0, risk: "moderate", trend: "stable", type: "village", parentDistrict: "Kurnool", parentBlock: "Nandyal" },
  { name: "Village N3", suspected: 25, tested: 22, confirmed: 3, deaths: 0, risk: "moderate", trend: "stable", type: "village", parentDistrict: "Kurnool", parentBlock: "Nandyal" },
];

// ── Ward data (within municipalities) ──
export const wardData: RegionData[] = [
  // Vizag MC
  { name: "Ward 12", suspected: 55, tested: 50, confirmed: 8, deaths: 0, risk: "high", trend: "up", type: "ward", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
  { name: "Ward 18", suspected: 42, tested: 38, confirmed: 5, deaths: 0, risk: "moderate", trend: "up", type: "ward", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
  { name: "Ward 22", suspected: 35, tested: 32, confirmed: 4, deaths: 0, risk: "moderate", trend: "stable", type: "ward", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
  { name: "Ward 3", suspected: 28, tested: 30, confirmed: 2, deaths: 0, risk: "low", trend: "down", type: "ward", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
  { name: "Ward 7", suspected: 22, tested: 20, confirmed: 1, deaths: 0, risk: "low", trend: "stable", type: "ward", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
  // Vijayawada MC
  { name: "Ward 5", suspected: 58, tested: 55, confirmed: 9, deaths: 0, risk: "high", trend: "up", type: "ward", parentDistrict: "Krishna", parentBlock: "Vijayawada MC" },
  { name: "Ward 11", suspected: 45, tested: 42, confirmed: 6, deaths: 0, risk: "moderate", trend: "stable", type: "ward", parentDistrict: "Krishna", parentBlock: "Vijayawada MC" },
  { name: "Ward 19", suspected: 38, tested: 36, confirmed: 4, deaths: 0, risk: "moderate", trend: "stable", type: "ward", parentDistrict: "Krishna", parentBlock: "Vijayawada MC" },
  { name: "Ward 2", suspected: 30, tested: 28, confirmed: 2, deaths: 0, risk: "low", trend: "down", type: "ward", parentDistrict: "Krishna", parentBlock: "Vijayawada MC" },
  // Mangalagiri
  { name: "Ward 1", suspected: 40, tested: 38, confirmed: 6, deaths: 0, risk: "high", trend: "up", type: "ward", parentDistrict: "Guntur", parentBlock: "Mangalagiri" },
  { name: "Ward 4", suspected: 35, tested: 32, confirmed: 4, deaths: 0, risk: "moderate", trend: "stable", type: "ward", parentDistrict: "Guntur", parentBlock: "Mangalagiri" },
  { name: "Ward 8", suspected: 25, tested: 22, confirmed: 3, deaths: 0, risk: "moderate", trend: "up", type: "ward", parentDistrict: "Guntur", parentBlock: "Mangalagiri" },
];

// ── Get regions at the correct hierarchy level based on role/filters ──
export function getFilteredRegions(district: string, block?: string): RegionData[] {
  // If a block/municipality is selected → show villages/wards within it
  if (block && block !== "All Blocks") {
    const villages = villageData.filter(v => v.parentBlock === block);
    const wardsInBlock = wardData.filter(w => w.parentBlock === block);
    const result = [...villages, ...wardsInBlock];
    return result.length > 0 ? result : subDistrictData.filter(s => s.name === block);
  }
  // If a district is selected → show blocks/municipalities within it
  if (district && district !== "All Districts") {
    const subs = subDistrictData.filter(s => s.parentDistrict === district);
    return subs.length > 0 ? subs : regionData.filter(r => r.name === district);
  }
  // State level → show all districts
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

export function getSituationSummary(regions: RegionData[], district?: string, block?: string) {
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
    return `${r.name} has recorded ${kpi.confirmed} confirmed dengue cases with ${kpi.deaths} death(s). Risk level: ${r.risk}. Trend: ${r.trend === "up" ? "increasing" : r.trend === "down" ? "declining" : "stable"}.`;
  }
  return `${kpi.confirmed} confirmed dengue cases across ${regions.length} ${areaLabel} with ${kpi.deaths} deaths. ${highRisk.length > 0 ? `High-risk areas: ${highNames}.` : "No areas at high risk currently."} Forecast indicates projected increase in weeks W2–W3.`;
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
  { area: "Guntur", probability: 78, risk: "high", expectedWeek: "W3", signal: "Cases rising + TPR spike + Historical trend" },
  { area: "Krishna", probability: 72, risk: "high", expectedWeek: "W2", signal: "Cases rising + Climate conditions favorable" },
  { area: "Visakhapatnam", probability: 61, risk: "moderate", expectedWeek: "W3", signal: "TPR spike + High humidity corridor" },
  { area: "East Godavari", probability: 55, risk: "moderate", expectedWeek: "W3", signal: "Historical trend + Post-rainfall breeding" },
  { area: "West Godavari", probability: 48, risk: "moderate", expectedWeek: "W4", signal: "Climate conditions + Moderate case load" },
  { area: "S.P.S. Nellore", probability: 35, risk: "moderate", expectedWeek: "W4", signal: "Seasonal pattern" },
  { area: "Kurnool", probability: 30, risk: "moderate", expectedWeek: "W3", signal: "Historical trend + Moderate humidity" },
  { area: "Prakasam", probability: 18, risk: "low", expectedWeek: "W4", signal: "Low case load + Declining trend" },
  { area: "Srikakulam", probability: 12, risk: "low", expectedWeek: "W4", signal: "Low baseline + No climate trigger" },
  { area: "Anakapalli", probability: 15, risk: "low", expectedWeek: "W4", signal: "Declining cases + Stable climate" },
  { area: "Eluru", probability: 10, risk: "low", expectedWeek: "W4", signal: "Low baseline" },
  { area: "Vizianagaram", probability: 22, risk: "low", expectedWeek: "W4", signal: "Seasonal pattern" },
];

// District-level (block/municipality predictions)
export const districtPredictions: OutbreakPrediction[] = [
  // Guntur
  { area: "Tenali", probability: 82, risk: "high", expectedWeek: "W2", signal: "Cases rising + TPR spike", parentDistrict: "Guntur", areaType: "Block" },
  { area: "Mangalagiri", probability: 70, risk: "high", expectedWeek: "W3", signal: "Climate conditions + Hospital OPD spike", parentDistrict: "Guntur", areaType: "Municipality" },
  { area: "Amaravathi", probability: 55, risk: "moderate", expectedWeek: "W3", signal: "Historical trend + Stagnant water", parentDistrict: "Guntur", areaType: "Block" },
  { area: "Pedakakani", probability: 28, risk: "low", expectedWeek: "W4", signal: "Low baseline", parentDistrict: "Guntur", areaType: "Block" },
  { area: "Guntur West", probability: 18, risk: "low", expectedWeek: "W4", signal: "Declining cases", parentDistrict: "Guntur", areaType: "Block" },
  // Visakhapatnam
  { area: "Bheemunipatnam", probability: 85, risk: "high", expectedWeek: "W2", signal: "Cases rising + Post-rainfall breeding", parentDistrict: "Visakhapatnam", areaType: "Block" },
  { area: "Vizag MC", probability: 75, risk: "high", expectedWeek: "W3", signal: "Waterlogging + OPD spike", parentDistrict: "Visakhapatnam", areaType: "Municipality" },
  { area: "Gajuwaka", probability: 60, risk: "moderate", expectedWeek: "W3", signal: "TPR spike + Construction debris", parentDistrict: "Visakhapatnam", areaType: "Block" },
  { area: "Pendurthi", probability: 32, risk: "moderate", expectedWeek: "W4", signal: "Moderate humidity", parentDistrict: "Visakhapatnam", areaType: "Block" },
  { area: "Anakapalle", probability: 15, risk: "low", expectedWeek: "W4", signal: "Stable climate", parentDistrict: "Visakhapatnam", areaType: "Block" },
  // Kurnool
  { area: "Nandyal", probability: 80, risk: "high", expectedWeek: "W2", signal: "Cases rising + Historical trend", parentDistrict: "Kurnool", areaType: "Block" },
  { area: "Adoni", probability: 65, risk: "moderate", expectedWeek: "W3", signal: "TPR increase + Climate conditions", parentDistrict: "Kurnool", areaType: "Block" },
  { area: "Kallur", probability: 58, risk: "moderate", expectedWeek: "W3", signal: "Historical trend + Moderate case load", parentDistrict: "Kurnool", areaType: "Block" },
  { area: "C.Belagal", probability: 20, risk: "low", expectedWeek: "W4", signal: "Low baseline", parentDistrict: "Kurnool", areaType: "Block" },
  // Krishna
  { area: "Vijayawada MC", probability: 78, risk: "high", expectedWeek: "W2", signal: "Hospital OPD spike + Waterlogging", parentDistrict: "Krishna", areaType: "Municipality" },
  { area: "Machilipatnam", probability: 52, risk: "moderate", expectedWeek: "W3", signal: "Historical trend", parentDistrict: "Krishna", areaType: "Block" },
  { area: "Gudivada", probability: 45, risk: "moderate", expectedWeek: "W3", signal: "Cases rising", parentDistrict: "Krishna", areaType: "Block" },
  { area: "Nuzvid", probability: 20, risk: "low", expectedWeek: "W4", signal: "Low baseline", parentDistrict: "Krishna", areaType: "Block" },
];

// Block-level (village predictions)
export const blockPredictions: OutbreakPrediction[] = [
  // Tenali
  { area: "Village A", probability: 88, risk: "high", expectedWeek: "W2", signal: "Cases rising + Breeding sites found", parentDistrict: "Guntur", parentBlock: "Tenali" },
  { area: "Village B", probability: 66, risk: "moderate", expectedWeek: "W3", signal: "TPR increase + Stagnant water", parentDistrict: "Guntur", parentBlock: "Tenali" },
  { area: "Village C", probability: 52, risk: "moderate", expectedWeek: "W4", signal: "Historical trend", parentDistrict: "Guntur", parentBlock: "Tenali" },
  { area: "Village D", probability: 22, risk: "low", expectedWeek: "W4", signal: "Declining cases", parentDistrict: "Guntur", parentBlock: "Tenali" },
  // Bheemunipatnam
  { area: "Village X", probability: 90, risk: "high", expectedWeek: "W2", signal: "Cases rising + Post-rainfall + Breeding sites", parentDistrict: "Visakhapatnam", parentBlock: "Bheemunipatnam" },
  { area: "Village Y", probability: 70, risk: "high", expectedWeek: "W3", signal: "TPR spike + Community reports", parentDistrict: "Visakhapatnam", parentBlock: "Bheemunipatnam" },
  { area: "Village Z", probability: 55, risk: "moderate", expectedWeek: "W3", signal: "Historical trend + Climate conditions", parentDistrict: "Visakhapatnam", parentBlock: "Bheemunipatnam" },
  { area: "Village W", probability: 20, risk: "low", expectedWeek: "W4", signal: "Low baseline", parentDistrict: "Visakhapatnam", parentBlock: "Bheemunipatnam" },
  // Nandyal
  { area: "Village N1", probability: 82, risk: "high", expectedWeek: "W2", signal: "Cases rising + Field reports", parentDistrict: "Kurnool", parentBlock: "Nandyal" },
  { area: "Village N2", probability: 55, risk: "moderate", expectedWeek: "W3", signal: "Historical trend", parentDistrict: "Kurnool", parentBlock: "Nandyal" },
  { area: "Village N3", probability: 42, risk: "moderate", expectedWeek: "W3", signal: "Moderate case load", parentDistrict: "Kurnool", parentBlock: "Nandyal" },
];

// Municipality-level (ward predictions)
export const municipalityPredictions: OutbreakPrediction[] = [
  // Vizag MC
  { area: "Ward 12", probability: 92, risk: "high", expectedWeek: "W2", signal: "Cases rising + Waterlogging in ward", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
  { area: "Ward 18", probability: 68, risk: "moderate", expectedWeek: "W3", signal: "TPR spike + Construction sites", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
  { area: "Ward 22", probability: 50, risk: "moderate", expectedWeek: "W4", signal: "Historical trend", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
  { area: "Ward 3", probability: 25, risk: "low", expectedWeek: "W4", signal: "Low baseline", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
  // Vijayawada MC
  { area: "Ward 5", probability: 85, risk: "high", expectedWeek: "W2", signal: "Cases rising + Poor drainage", parentDistrict: "Krishna", parentBlock: "Vijayawada MC" },
  { area: "Ward 11", probability: 65, risk: "moderate", expectedWeek: "W3", signal: "TPR increase + Market area breeding", parentDistrict: "Krishna", parentBlock: "Vijayawada MC" },
  { area: "Ward 19", probability: 55, risk: "moderate", expectedWeek: "W4", signal: "Historical trend + Moderate humidity", parentDistrict: "Krishna", parentBlock: "Vijayawada MC" },
  { area: "Ward 2", probability: 18, risk: "low", expectedWeek: "W4", signal: "Low baseline", parentDistrict: "Krishna", parentBlock: "Vijayawada MC" },
  // Mangalagiri
  { area: "Ward 1", probability: 72, risk: "high", expectedWeek: "W2", signal: "Cases rising + Stagnant water", parentDistrict: "Guntur", parentBlock: "Mangalagiri" },
  { area: "Ward 4", probability: 48, risk: "moderate", expectedWeek: "W3", signal: "Historical trend", parentDistrict: "Guntur", parentBlock: "Mangalagiri" },
  { area: "Ward 8", probability: 38, risk: "moderate", expectedWeek: "W3", signal: "Construction debris + Climate", parentDistrict: "Guntur", parentBlock: "Mangalagiri" },
];

// ── Get predictions based on role hierarchy ──
export function getOutbreakPredictions(district: string, block?: string): OutbreakPrediction[] {
  if (block && block !== "All Blocks") {
    // Check municipality predictions first, then block
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
  { area: "Village A", currentCases: 9, prevCases: 5, trend: "up", risk: "high", parentDistrict: "Guntur", parentBlock: "Tenali" },
  { area: "Village B", currentCases: 7, prevCases: 5, trend: "up", risk: "moderate", parentDistrict: "Guntur", parentBlock: "Tenali" },
  { area: "Village C", currentCases: 4, prevCases: 4, trend: "stable", risk: "moderate", parentDistrict: "Guntur", parentBlock: "Tenali" },
  // Bheemunipatnam
  { area: "Village X", currentCases: 12, prevCases: 7, trend: "up", risk: "high", parentDistrict: "Visakhapatnam", parentBlock: "Bheemunipatnam" },
  { area: "Village Y", currentCases: 9, prevCases: 6, trend: "up", risk: "high", parentDistrict: "Visakhapatnam", parentBlock: "Bheemunipatnam" },
  { area: "Village Z", currentCases: 5, prevCases: 4, trend: "stable", risk: "moderate", parentDistrict: "Visakhapatnam", parentBlock: "Bheemunipatnam" },
  // Vizag MC (wards)
  { area: "Ward 12", currentCases: 8, prevCases: 4, trend: "up", risk: "high", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
  { area: "Ward 18", currentCases: 5, prevCases: 4, trend: "up", risk: "moderate", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
  { area: "Ward 22", currentCases: 4, prevCases: 3, trend: "stable", risk: "moderate", parentDistrict: "Visakhapatnam", parentBlock: "Vizag MC" },
  // Vijayawada MC (wards)
  { area: "Ward 5", currentCases: 9, prevCases: 5, trend: "up", risk: "high", parentDistrict: "Krishna", parentBlock: "Vijayawada MC" },
  { area: "Ward 11", currentCases: 6, prevCases: 5, trend: "stable", risk: "moderate", parentDistrict: "Krishna", parentBlock: "Vijayawada MC" },
  { area: "Ward 19", currentCases: 4, prevCases: 4, trend: "stable", risk: "moderate", parentDistrict: "Krishna", parentBlock: "Vijayawada MC" },
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
  { id: 1, district: "Krishna", message: "Unusual spike in confirmed cases — 28 new cases in W3", severity: "high" as const },
  { id: 2, district: "East Godavari", message: "TPR rising above 30% for 2 consecutive weeks", severity: "high" as const },
  { id: 3, district: "Visakhapatnam", message: "New cluster detected in Pendurthi block", severity: "moderate" as const },
  { id: 4, district: "Guntur", message: "Tenali block shows rapid case increase", severity: "high" as const },
  { id: 5, district: "Kurnool", message: "Nandyal block emerging hotspot", severity: "moderate" as const },
];

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
  { patient: "Ravi Kumar", gender: "Male", age: 32, subDistrict: "Bheemunipatnam", block: "Bheemunipatnam", village: "Village X", district: "Visakhapatnam", diagnosis: "Dengue", testType: "NS1", testResult: "Positive", dateOfTesting: "2026-04-02", urbanRural: "Rural", referredBy: "ASHA" },
  { patient: "Lakshmi Devi", gender: "Female", age: 45, subDistrict: "Tenali", block: "Tenali", village: "Village A", district: "Guntur", diagnosis: "Dengue", testType: "IgM", testResult: "Positive", dateOfTesting: "2026-04-03", urbanRural: "Rural", referredBy: "ANM" },
  { patient: "Mohan Rao", gender: "Male", age: 28, subDistrict: "Vizag MC", block: "Vizag MC", village: "Ward 12", district: "Visakhapatnam", diagnosis: "Dengue", testType: "NS1", testResult: "Positive", dateOfTesting: "2026-04-04", urbanRural: "Urban", referredBy: "MO" },
  { patient: "Padma K", gender: "Female", age: 36, subDistrict: "Vijayawada MC", block: "Vijayawada MC", village: "Ward 5", district: "Krishna", diagnosis: "Dengue", testType: "NS1", testResult: "Positive", dateOfTesting: "2026-04-05", urbanRural: "Urban", referredBy: "HW" },
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
  // Village/ward approximate coordinates
  "Village A": [16.22, 80.62],
  "Village B": [16.26, 80.66],
  "Village C": [16.23, 80.60],
  "Village D": [16.25, 80.68],
  "Village X": [17.91, 83.47],
  "Village Y": [17.87, 83.43],
  "Village Z": [17.90, 83.41],
  "Village W": [17.85, 83.45],
  "Village P": [17.70, 83.02],
  "Village Q": [17.68, 82.98],
  "Village N1": [15.50, 78.50],
  "Village N2": [15.46, 78.46],
  "Village N3": [15.52, 78.44],
  "Ward 12": [17.74, 83.32],
  "Ward 18": [17.71, 83.28],
  "Ward 22": [17.73, 83.26],
  "Ward 3": [17.70, 83.34],
  "Ward 7": [17.72, 83.30],
  "Ward 5": [16.53, 80.67],
  "Ward 11": [16.50, 80.63],
  "Ward 19": [16.49, 80.61],
  "Ward 2": [16.52, 80.65],
  "Ward 1": [16.44, 80.59],
  "Ward 4": [16.42, 80.55],
  "Ward 8": [16.45, 80.57],
};
