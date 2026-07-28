# Known Debt & Pending Implementations

Living list of deferred work for the PRISM-H demo dashboard. This is a
stakeholder-demo prototype, so items here are intentional trade-offs, not bugs
to fix before the next demo — unless noted. Add to this file when you knowingly
leave something incomplete; remove items when they're done.

Legend: **[demo-ok]** acceptable for demos · **[fix-before-real]** must change
before any non-demo use · **[polish]** nice-to-have.

---

## GBA Central

### GBA sub-level: map child markers still clone Karnataka — [fix-before-real]
District-level data for GBA resolves to the 5 BBMP corporations (East/South/
West/North/Central), so the map choropleth, labels, and KPIs are correct.
The **line listing is now populated for GBA** (B.2 reads the 1,000-case dataset,
~455 GBA cases across the corporations), which resolved the empty-table part of
this item. What remains: **sub-level (block/ward) map child markers still come
from the Karnataka clone** (Bengaluru Urban, Udupi, …). Effect: drilling the map
into a BBMP corporation may show **no child dots** on the
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

## Case Management & overlay (Session B)

### Overlay pattern will get messy with more mutation types — [demo-ok]
`caseStore.ts` uses two parallel localStorage maps (`prismh:case_edits`,
`prismh:case_archives`) merged over the base dataset, with a per-area delta for
aggregations. This is clean for **edit + archive**, but each new mutation type
(merge duplicates, split, bulk reassign, review status…) means another overlay
map, another merge branch, and another delta case. Before adding a third
mutation type, collapse to a **single event log** (`{uhid, op, payload, ts, by}`)
folded into the working set once — it generalizes the delta and undo for free.

### Aggregation delta covers counts, not risk re-classification — [demo-ok]
Edits/archives apply a live +1/−1 to **region `confirmed` and hotspot
`currentCases`** (`getFilteredRegions` / `getFilteredHotspots`). They do NOT
re-run the WHO/ICMR risk-class or forecast math, which read canonical weekly
curves. So a case move shows the count change everywhere, but a hotspot's
risk *label* won't flip from one moved case (it never would at ±1 anyway).
Forecasts and the district-polygon risk-fallback are likewise count-only.
Acceptable for the delta-overlay approach we chose; note it if a demo needs a
class to visibly change.

### Delta keys by area NAME — [demo-ok]
`getCaseDeltasByArea()` maps area name → net change and is applied by matching
`region.name` / `hotspot.area`. Works because district/block/ward names are
distinct strings today. If two levels ever share a name, the delta could double-
apply. A future event-log refactor should key by (level, name).

### One HMR/browser caveat, not code — [demo-ok]
Editing case-store files triggers a Vite full reload, which resets the in-memory
role to the default (Admin tab hides). localStorage overlays persist correctly;
only the selected role resets. To reset demo overlays, clear localStorage keys
`prismh:case_edits` and `prismh:case_archives`.

## Build / tooling

### Main bundle > 500 kB — [demo-ok]
`npm run build` warns that the primary chunk (~2.7 MB / ~618 kB gzip) exceeds
500 kB. No code-splitting yet. Pre-existing; fine for a demo. Revisit with
dynamic `import()` / `manualChunks` if load time becomes a demo concern.

### Browser-automation screenshots flaky on map-heavy pages — [demo-ok]
The Chrome extension's script injection can time out while a Leaflet map + Vite
HMR socket keep the page "busy." Workaround during verification: open a fresh
tab and let it settle before screenshotting. Not an app defect.
