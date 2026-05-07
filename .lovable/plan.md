# PRISM-H Dashboard v3 — Implementation Plan

This is a large, multi-area change. I'll execute it in 6 phases. Each phase is independently shippable so we can validate as we go. **Please confirm the phasing — or tell me to do it all in one pass.**

## Phase 1 — Foundations (definitions + data)
1. Create `src/lib/definitions.ts` (thresholds, palettes, state→method map).
2. Create `src/lib/classify.ts` (pure functions: `computeTrend`, `computeWHOClass`, `computeICMRStrata`, `isHighRiskArea`, `isNewEmergence`, `isRisingCluster`, `computeHotspotClass`).
3. Copy uploaded `mock_dataset.ts` → `src/data/mock_dataset.ts`.
4. Delete legacy `src/data/seed.ts` and `src/data/seedOverlay.ts`.
5. Rewrite `src/data/mockData.ts` as a thin adapter that reads from `MOCK_DATASET` and exposes the same function names already used by screens (`getFilteredKpi`, `getFilteredRegions`, `getDailyTimeSeries`, `getWeeklyTimeSeries`, `getForecastData`, `getRiskForecast`, `getOutbreakPredictions`, `getNewEmergenceAreas`, `getRisingClusters`, `getFilteredHotspots`, `getLineListing`, `getWeatherObserved`, `getSituationSummary`, etc.) so existing screens keep working.

## Phase 2 — Filter cleanup
- Remove date picker from Overview, Forecast, Weather, Hotspots, Signals (keep on Case Surveillance only).
- Add freshness labels per spec.
- Keep 2W/4W toggle on Hotspots.

## Phase 3 — Overview, Hotspots, Weather, Signals fixes
- Overview: 4-line situation summary rule, KPI = high-risk count, ICMR-coloured High Risk map (discrete), strict New Emergence + Rising Cluster, Action Focus playbook.
- Hotspots: drop daily trend chart + sparkline column, add Hotspot Class badge, ensure trend matches Overview.
- Weather: add Wet Days column.
- Signals: lock to "Last 4 weeks".

## Phase 4 — Forecast (state-aware)
- WHO labels for KA/OD; ICMR labels for AP. Same 4 colours.
- Constrained Drivers vocabulary via `buildDriverString`.
- Freshness label.

## Phase 5 — Roles + Admin tab
- Replace `Analyst` with `Admin`; add `data_operator`. Tabs filtered by role.
- New `AdminScreen` with: section-visibility toggles (reuse existing `BlockVisibilityContext`), user management table (localStorage), Forecast Accuracy (chart + metrics + archive).

## Phase 6 — MapLibre migration
- `bun add maplibre-gl` / `bun remove leaflet react-leaflet`.
- New `src/components/map/PrismMap.tsx` with `demotiles.maplibre.org` style.
- `src/lib/geojson_sources.ts` with Datameet states/districts + BBMP wards.
- Defensive fallback: if ward GeoJSON missing, show parent boundary + "Ward boundaries pending" overlay.
- Replace usages of existing `DashboardMap` with `PrismMap`.

## Open questions / risks

1. **Scope size.** This is ~15–20 file edits + ~6 new files + a library swap. Do you want it all in one shot, or phase-by-phase with checkpoints? I recommend phase-by-phase.
2. **Mock data adapter vs. rewrite.** The current screens call ~30 functions on `mockData.ts`. I'll keep those signatures and make them read from the new `MOCK_DATASET`, rather than rewriting every screen's data access. Faster and lower-risk. OK?
3. **MapLibre tiles.** I'll wire `demotiles.maplibre.org` as you suggested and document the MapTiler-key swap in README. No secret needed now.
4. **GeoJSON fetch.** First load will pull a few hundred KB from GitHub raw. I'll cache in `sessionStorage`. IndexedDB only if you ask.
5. **`computeICMRStrata` edge case.** With 21 districts the spec gives ~6 per stratum. I'll use `Math.ceil(21/4)=6`, so A1=6, A2=6, A3=6, A4=3. Confirm that's intended.

## Recommended execution order

Start with **Phase 1** only. Once `MOCK_DATASET` is wired and the app still renders (with old map), I'll move to Phases 2–5 (UI/logic), then Phase 6 (MapLibre) last because it's the riskiest.

Reply with **"go phase 1"** (or "go all phases") and I'll start.