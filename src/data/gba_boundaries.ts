// Demo approximation — polygons are generated placeholders, not official
// GoK boundaries. Replace with real GIS data before production use.
//
// Five simplified rectangular polygons standing in for the BBMP corporation
// boundaries (East / South / West / North / Central). Centroids are roughly
// plausible Bengaluru locations; boxes are sized to avoid overlap. The
// `dtname` property matches the canonical GBA district names so the map's
// choropleth, labels, and drill-down resolve without alias tricks.
import type { FeatureCollection } from "geojson";

// Build a closed rectangle ring (GeoJSON [lng, lat] order) centred on
// (cx, cy) with the given half-width / half-height in degrees.
function box(cx: number, cy: number, w = 0.03, h = 0.028): number[][] {
  return [
    [cx - w, cy - h],
    [cx + w, cy - h],
    [cx + w, cy + h],
    [cx - w, cy + h],
    [cx - w, cy - h],
  ];
}

// name → [centroid lng, centroid lat]
const CORPORATIONS: Array<{ name: string; lng: number; lat: number }> = [
  { name: "BBMP East", lng: 77.75, lat: 12.98 },    // Whitefield / Marathahalli
  { name: "BBMP South", lng: 77.60, lat: 12.90 },   // Jayanagar / HSR
  { name: "BBMP West", lng: 77.53, lat: 12.98 },    // Rajajinagar / RR Nagar
  { name: "BBMP North", lng: 77.60, lat: 13.05 },   // Yelahanka / Hebbal
  { name: "BBMP Central", lng: 77.60, lat: 12.985 }, // Shivajinagar / Malleshwaram
];

export const GBA_BOUNDARIES_GEOJSON: FeatureCollection = {
  type: "FeatureCollection",
  features: CORPORATIONS.map((c) => ({
    type: "Feature",
    properties: { dtname: c.name, district: c.name },
    geometry: {
      type: "Polygon",
      coordinates: [box(c.lng, c.lat)],
    },
  })),
};
