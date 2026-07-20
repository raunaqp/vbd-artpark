import { describe, it, expect } from "vitest";
import { getWardsUnderSelection } from "./canonical";
import { MULTI_DISEASE_DATASET } from "./mock_dataset";

describe("getWardsUnderSelection", () => {
  const disease = "dengue" as const;
  const bundle = MULTI_DISEASE_DATASET[disease];
  // A GBA corporation (its sub-level "zones" are stored as municipalities with wards).
  const corpName = Object.keys(bundle).find((k) => bundle[k].state === "GBA Central")!;
  const corp = bundle[corpName];

  it("returns [] when no district/corporation is selected", () => {
    expect(getWardsUnderSelection(disease, "GBA Central")).toEqual([]);
  });

  it("returns [] for an unknown district", () => {
    expect(getWardsUnderSelection(disease, "GBA Central", "Nowhere-District")).toEqual([]);
  });

  it("district-level returns every ward + village across the district", () => {
    const expected =
      corp.municipalities.reduce((n, m) => n + m.wards.length, 0) +
      corp.blocks.reduce((n, b) => n + b.villages.length, 0);
    const res = getWardsUnderSelection(disease, "GBA Central", corpName);
    expect(res.length).toBe(expected);
    expect(res.length).toBeGreaterThan(0);
    // Every entry carries a non-empty parent for the muted "· parent" context.
    expect(res.every((r) => r.ward && r.parent)).toBe(true);
  });

  it("block/municipality-level returns that parent's leaves, tagged with the parent", () => {
    const mun = corp.municipalities[0];
    const res = getWardsUnderSelection(disease, "GBA Central", corpName, mun.name);
    expect(res.map((r) => r.ward)).toEqual(mun.wards.map((w) => w.name));
    expect(res.every((r) => r.parent === mun.name)).toBe(true);
  });

  it("leaf-level returns the same sibling list as its parent (for the add-more flow)", () => {
    const mun = corp.municipalities[0];
    const leaf = mun.wards[0].name;
    const res = getWardsUnderSelection(disease, "GBA Central", corpName, mun.name, leaf);
    expect(res.map((r) => r.ward)).toEqual(mun.wards.map((w) => w.name));
  });

  it("works for a legacy state with block/village geography (Odisha)", () => {
    // Khordha → Bhubaneswar Municipal Corporation has wards under a municipality.
    const khordha = bundle["Khordha"];
    expect(khordha).toBeTruthy();
    const districtLevel = getWardsUnderSelection(disease, "Odisha", "Khordha");
    const expected =
      khordha.municipalities.reduce((n, m) => n + m.wards.length, 0) +
      khordha.blocks.reduce((n, b) => n + b.villages.length, 0);
    expect(districtLevel.length).toBe(expected);
  });
});
