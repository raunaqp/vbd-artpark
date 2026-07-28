# Known Debt & Pending Implementations

Living list of deferred work for the PRISM-H demo dashboard. This is a
stakeholder-demo prototype, so items here are intentional trade-offs, not bugs
to fix before the next demo — unless noted. Add to this file when you knowingly
leave something incomplete; remove items when they're done.

Legend: **[demo-ok]** acceptable for demos · **[fix-before-real]** must change
before any non-demo use · **[polish]** nice-to-have.

---

## GBA Central

### GBA sub-level data still clones Karnataka — [fix-before-real]
District-level data for GBA resolves to the 5 BBMP corporations (East/South/
West/North/Central), so the map choropleth, labels, and KPIs are correct. But
the **line-listing rows and sub-level (block/ward) markers still come from the
Karnataka clone** (Bengaluru Urban, Udupi, …). Effect: drilling into a BBMP
corporation shows an **empty line-listing table** and **no child dots** on the
map.
- Where: `src/data/mockData.ts` (`GBA` bundle spreads `KARNATAKA`), canonical
  data in `src/data/mock_dataset.ts`.
- Pre-existing — surfaced (not caused) by the boundary fix, which made drill-down
  reachable.
- Smallest next step: add GBA line-listing rows keyed to the 5 corporations so
  drilling shows records. Self-contained, mock-data only.

### Boundary polygons are generated rectangles — [demo-ok]
`src/data/gba_boundaries.ts` holds 5 axis-aligned rectangular placeholders around
approximate Bengaluru centroids. They read as obviously synthetic (which pairs
with the "Demo boundaries — approximate" note), but are **not official GoK/BBMP
geometry**.
- Replace with real GIS polygons before any production use.
- [polish] Rougher convex hulls would look less synthetic if a nicer demo is
  wanted without real data.

### GBA map center/zoom is inline on the bundle — [demo-ok]
GBA's Bengaluru-city center/zoom lives directly on the `GBA` bundle in
`mockData.ts` rather than a shared `STATE_MAP_CONFIG`. Matches the existing
per-bundle `mapCenter`/`mapZoom` pattern; only worth extracting if a third
city-scale state appears.

---

## Map loader

### Local boundaries bypass the session/CDN cache path — [demo-ok]
`LOCAL_GEOJSON` in `src/components/DashboardMap.tsx` is checked **before** the
`geoCache` / `sessionStorage` / remote-fetch path. Intentional: local boundaries
are already in-memory constants, so caching adds nothing. Noted only so the
short-circuit isn't mistaken for a missed cache.

The `LOCAL_GEOJSON` record is the generalization seam: any future
placeholder-boundary state is a one-line entry, no special-casing needed.

---

## Build / tooling

### Main bundle > 500 kB — [demo-ok]
`npm run build` warns that the primary chunk (~2.7 MB / ~618 kB gzip) exceeds
500 kB. No code-splitting yet. Pre-existing; fine for a demo. Revisit with
dynamic `import()` / `manualChunks` if load time becomes a demo concern.

### Browser-automation screenshots flaky on map-heavy pages — [demo-ok]
The Chrome extension's script injection can time out while a Leaflet map + Vite
HMR socket keep the page "busy." Workaround during verification: open a fresh
tab and let it settle before screenshotting. Not an app defect.
