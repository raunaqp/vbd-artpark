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

### ~~Boundary polygons are generated rectangles~~ — RESOLVED
Replaced by the official GBA Dec 2025 delimitation in `src/data/boundaries.ts`
(5 corporations, 369 wards). `src/data/gba_boundaries.ts` is kept but no longer
imported, and is marked DEPRECATED at the top of the file. Delete it once
nothing references it in a demo branch.

### GBA ward case data is joined to polygons by position — [fix-before-real]
Ward polygons are shaded by pairing them with mock ward records **in sort
order** within each corporation, not by name. The official Dec 2025 ward names
("Vinayaka Layout", "Kogilu", "Yamalur") share almost no vocabulary with our
synthetic mock ward names ("East Ward 3", "Hagadur Extension") — a name join
matches roughly 60 of 369 and would leave the map mostly grey.

All 369 polygons render with their real names; the shading behind them is
arbitrary within a corporation. Cosmetic for a demo, wrong for anything real —
a production system would key on official ward IDs.

Because corporations have different polygon and mock-record counts, some of
each is left over. Counts are logged to the console on first render per
corporation:

| Corporation | Polygons | Mock wards | Unshaded polygons | Undrawn mock records |
|---|---|---|---|---|
| BBMP East | 50 | 75 | 0 | 25 |
| BBMP West | 112 | 80 | 32 | 0 |
| BBMP North | 72 | 80 | 0 | 8 |
| BBMP South | 72 | 85 | 0 | 13 |
| BBMP Central | 63 | 47 | 16 | 0 |

- Where: `positionalJoin` in `src/lib/boundaryLayers.ts`.

### GBA zones have no counterpart in the official data — [demo-ok]
Our mock hierarchy puts 4 zones ("East Zone 1"…) between a corporation and its
wards. The Dec 2025 data has no zone field — zones are a mock construct. Zone
membership is therefore inherited from whichever mock ward a polygon was paired
with, so polygons left unpaired by the positional join disappear when a zone is
selected rather than showing as unassigned.

### GBA map center/zoom is inline on the bundle — [demo-ok]
GBA's Bengaluru-city center/zoom lives directly on the `GBA` bundle in
`mockData.ts` rather than a shared `STATE_MAP_CONFIG`. Matches the existing
per-bundle `mapCenter`/`mapZoom` pattern; only worth extracting if a third
city-scale state appears.

---

## Map loader

### Local boundaries bypass the session/CDN cache path — [demo-ok]
`LOCAL_GEOJSON` in `src/components/DashboardMap.tsx` is checked **before** the
`geoCache` / `sessionStorage` / remote-fetch path. Local boundaries are built
from the bundled polygon module on first use and memoised in `geoCache`, so the
remote cache path adds nothing. Noted only so the short-circuit isn't mistaken
for a missed cache.

The `LOCAL_GEOJSON` record is the generalization seam: any future
real-boundary state is a one-line entry, no special-casing needed.

---

## Boundary polygons (`src/data/boundaries.ts`)

Real geometry, ~6 MB, generated externally. **Do not hand-edit** — regenerate it
at source. Sources: GBA from Open City / Oorvani Foundation (Dec 2025
delimitation, public domain); Karnataka from KGIS via the `samashti/KGIS` repo.

### ~~`metadata` key fails typecheck~~ — RESOLVED
The emitted JSON ends with a `"metadata"` block (generated / sources / licenses
/ counts) that `BoundaryCollection` didn't declare, so the assignment failed
excess-property checking with `TS2353`. Fixed by declaring `metadata?` on the
interface — the data was always correct, only the type was incomplete. Keep the
field on the interface if the generator is ever re-run.

- Verify typechecks with `tsc -p tsconfig.app.json --noEmit`. A bare
  `tsc --noEmit` reports nothing here: the root `tsconfig.json` has
  `"files": []` and only project references, so it checks nothing at all.

### Polygon chunk is lazy-loaded — [demo-ok]
`boundaries.ts` is pulled in with a dynamic `import()` from
`src/lib/boundaryLayers.ts`, so it lands in its own chunk instead of the entry
bundle:

| | Entry chunk | Boundaries chunk |
|---|---|---|
| Before | 2,716 kB (gzip 625 kB) | — |
| Bundled in | 8,939 kB (gzip 2,526 kB) | — |
| Lazy-loaded | 2,723 kB (gzip 627 kB) | 6,217 kB (gzip 1,898 kB) |

Fetched on first drill-down into GBA or Karnataka (~1.85 MB over the wire,
~230 ms locally), then cached for the session. A "Loading boundaries…"
indicator covers that first fetch.

**That dynamic import must stay the only import of the module.** A single
static `import ... from "@/data/boundaries"` anywhere folds all 6 MB back into
the entry chunk with no error and no warning — the only symptom is the entry
chunk tripling.

Vite still warns about chunks over 500 kB, but it did before this work too: the
entry chunk was already 2.7 MB, mostly `mock_dataset.ts`.

### No ward polygons for Odisha or Andhra Pradesh — [fix-before-real]
Both states still render district polygons from the datameet mirror (jsDelivr
CDN) and centroid markers below that. No official sub-district geometry has
been sourced for either.
- Effect: drilling into an AP or Odisha district shows dots, not polygons.

### No Karnataka rural village polygons — [demo-ok]
KGIS publishes village-level geometry, but it is ~13k polygons — too heavy to
bundle for a demo. Rural blocks keep centroid markers at ward/village level;
only the 11 municipalities in `KA_DISTRICTS_WITH_WARD_POLYGONS` get real ward
polygons.

### Karnataka municipal wards are joined by position — [fix-before-real]
Same problem as GBA, and worse. Mock municipal ward names are pure placeholders
("Mysuru Ward 1", "Dharwad Ward 3") with no relation to the KGIS names, so the
pairing is positional. Cities also have far more real wards than our mock has
records — BBMP is 198 polygons against 40 mock wards — so most polygons render
unshaded, and the shaded ones cluster wherever ward numbering starts rather
than where cases actually are.

### Bhadravathi has polygons but no municipal records — [demo-ok]
KGIS ships 35 ward polygons for Bhadravathi, but our mock treats Bhadravathi as
a *block* (taluk) of Shivamogga whose children are villages. With no municipal
ward records to shade them, it is deliberately excluded from
`MOCK_TO_KGIS_MUN`.

### The mock→official name maps will sprawl — [polish]
Three reconciliation dictionaries live in three places:

| Dict | Lives in | Maps |
|---|---|---|
| `DISTRICT_ALIASES` | `src/components/DashboardMap.tsx` | GeoJSON district name → mock district |
| `MOCK_TO_KGIS_TALUK_NAME` | `src/data/boundaries.ts` (shipped) | mock block → KGIS taluk |
| `MOCK_TO_KGIS_MUN` | `src/lib/boundaryLayers.ts` | mock municipality → KGIS municipality |

Adding a fifth state means a fourth dict in a fourth place. Collapse to one
per-state reconciliation table when state #5 lands, not before — three is
tolerable, and consolidating early would mean guessing at the shape the fifth
state needs.

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

## Response Effectiveness (Session C)

### Seeded actions never join to canonical wards — [fix-before-real]
The effectiveness panel walks **canonical** wards ("Bengaluru Urban Ward 5"),
but the pre-seeded weekly-response records use **legacy** ward names
("Ward 84", block "BBMP East Zone"). `findWardAction` matches on ward+district,
so seeded ward-level actions never show a checkmark — only actions logged
*through the panel* (C.5) do, because those write the canonical ward name.
- Effect: at first load the Action column is all dashes until an officer logs
  one. This is why the C.5 flow works but pre-seeded coverage looks empty.
- Fix: reconcile seed geography to canonical ward names (or key the seed off the
  canonical hierarchy the way mock_line_listing / mock_larval_surveys do).

### The 3-way join is O(wards) per render — fine now, watch the pattern — [demo-ok]
`buildEffectivenessRows` is O(wards × windowWeeks) and re-runs on every window/
filter change: it enumerates all wards (≤1,286 state-wide), sums two windows,
buckets coverage, and linear-scans `allRecords` per ward for the action join.
At demo scale (state-wide ≤1,286 wards, tens of records) this is a few ms and
memoized on [stateLabel, filters, window, records]. It will get slow if either
side grows large (thousands of records, or joining more sources). The pattern to
extend cleanly: **pre-index records once** (Map keyed by `state|district|ward` →
records) instead of scanning `allRecords` per ward, and add each new data source
as its own `computeX(ward, window)` that the row builder composes — keep the
join a fold over per-ward lookups, not nested scans.

### Larval coverage correlates with burden → few state-level gaps — [demo-ok]
Because C.1 skews well-resourced (high-burden) districts toward high coverage,
rising wards there tend to have coverage, so state-level action gaps are modest
(GBA 2W ≈ 15, KA 2W = 2, longer windows trend to 0). Gaps are most visible at
2W/4W and when drilled into rural districts. Intentional (matches the C.1 spec)
and the demo narrative — "drill in to find the gaps" — but worth knowing when
choosing what to show on stage.

### Logged action uses the reporting-week selector's week — [demo-ok]
C.5 records the response at the provider's current `epiWeek` (defaults to the
latest, which is inside every window). If an officer first switches the
ReportingWeekSelector to an *older* week outside the effectiveness window, the
new checkmark won't appear until they widen the window. Edge case; default path
is fine.

## Forecast / Response redesign (R1–R5)

Driven by `docs/design/PREDICTION_VS_OPERATIONS.md`.

### Priority Forecast Areas: no projected cases below district level — [demo-ok]
`getPriorityForecastAreas` (R1.1) sources `projectedCases` from
`DistrictMetrics.forecast4w`, which exists only at district/corporation level.
Drilling into a corporation returns sub-areas (zones/wards) with
`projectedCases: null`; the table/tooltip shows "—" rather than backfilling a
derived value (deliberate — flagged, not invented). `canonicalPredictions`
*does* compute a per-block `projected` internally, but it's a synthesis from
recent cases × the district forecast ratio, not a real forecast, so it's not
surfaced. If sub-district forecasts are ever mocked, wire them here and the
gap closes.

### Filter simplification deferred to R2 — [planned]
The design doc wants Corporation/Zone/Ward filters with auto-apply, no Apply
button, keep Reset — on **both** Forecast and Response tabs. `GlobalFilters` is
shared across 6 screens (Overview, Forecast, Weather, Hotspots, Signals, Case
Surveillance), so changing it touches all of them. Deferred to **R2** (Response
tab scaffold) to do it once, consistently, for both new tabs rather than as a
cross-cutting change mid-R1. R1 does not touch `GlobalFilters`.

### "Critical" tier is inconsistent across surfaces — [planned]
The app carries **two** risk vocabularies that diverge at the top tier:

- **`risk`** — 3-tier legacy (`high | moderate | low`). Drives the four forecast
  **cards**, the map **polygon colour**, and the map **legend** (hardcoded
  low/moderate/high + no-data).
- **`riskLabel`** — 4-tier WHO/ICMR (WHO: Low/Moderate/High/**Very High**;
  ICMR: Low/Caution/High Risk/**Critical**). Drives **table text** (Priority
  Forecast Areas) and **tooltip text**.

Effect: a GBA (ICMR-method) corporation in stratum A1 shows **"Critical"** in the
table/tooltip, but renders **red (= High)** on the map with the legend saying
"High", and the cards top out at "High Risk" — "Critical"/"Very High" is
structurally unreachable from the card/legend pipeline (`canonicalRiskForecast`
maps only the 3-tier risk). This is **pre-existing**, not introduced by R1; R1.2
only made the table's Forecast Risk column more prominent by removing the
probability column.

Deferred work: promote the 4-tier vocabulary to a first-class tier consistently
across **all** surfaces. That means a data-model change (4th `risk` value), a
colour-palette addition, an updated legend, and a card-label/ceiling update —
real R-work, not a small fix. Deferred until it's the highest-value change to
make.

## R3 debt entries

Landed 29 Jul 2026. Data model + recommendation engine + Admin → Assumptions.
Smoke tests for all of this live in `scripts/r3/smoke/` — run them before
trusting any of the numbers below after a regen.

### mock_larval_indices.ts uses @ts-nocheck — [fix-before-real]
TS2590 union-complexity limit on 14,460-element array literal. Data is
structurally correct; type inference disabled only for compiler perf. Future R3
iteration should split by state or chunk-load per-state to eliminate this
workaround.

Verified structurally correct two ways before suppressing: with the type
annotation removed, the only complaint is string-literal widening, which the
annotation itself resolves. The generator now emits the header, so a regen keeps
it. This is the one line added to an otherwise byte-for-byte generated file.

### Ward-key re-key in loader.ts — [fix-before-real]
R3 uses ~30-line deterministic hash-based mapping from app ward_keys to manifest
ward_keys (`src/data/r3/loader.ts::appWardKeyToManifestKey`). Same app ward
always resolves to the same synthetic fogging/breeding/larval profile. Future
step: regenerate mock datasets from canonical app hierarchy — retire this
re-key layer.

Why it exists: the generated datasets are keyed on a synthetic ward hierarchy
that overlaps the app's canonical hierarchy by only ~3% (37 of 1,286 wards).
The key *format* matches (`state|district|block|ward`, same as `larvalWardKey`)
but the names inside do not — GBA is shifted a level (manifest district is
"GBA Central", block is the corporation), and most Odisha / AP districts and
blocks are spelled differently ("Balasore" vs "Baleshwar"). Without the re-key,
97% of app wards would resolve to `null` in R4's overlays and R5's side panel.

Mapping is djb2-hash-mod, scoped per state, so a Karnataka ward always draws
Karnataka data. Where a state has more app wards than manifest wards (Odisha:
481 vs 241) the modulo wraps and several app wards share one profile. Observed
distribution is Poisson-shaped, as a hash-mod should be — no clustering:

| State | App wards | Manifest wards | Manifest wards used | Busiest |
|---|---|---|---|---|
| GBA Central | 367 | 367 | 235 | 5 |
| Karnataka | 331 | 497 | 246 | 4 |
| Odisha | 481 | 241 | 211 | 8 |
| Andhra Pradesh | 107 | 100 | 71 | 4 |

### Manifest forecast_risk is advisory only — [demo-ok]
R3 manifest carries `forecast_risk` per ward as seed for data-tier distribution.
In `getWardRecommendation`, forecast_risk input comes from app's RiskLevel
derivation, not manifest. Fine for demo; real integration would sync these.

The app-side derivation reuses `levelToLegacy` exported from `canonical.ts`
rather than reimplementing it, so a recommendation can never disagree with the
risk rendered beside it.

### Re-key + app-risk interaction creates demo artifacts — [demo-ok]
Because mapping is a hash, a ward the app calls high-risk may draw a data
profile generated for a low-risk ward — sparse fogging, few breeding sites, low
indices. Recommendations remain internally consistent. Visible artifact only
under close inspection. Vanishes at canonical-hierarchy regen.

### AP never fires rules 1-2 — [demo-ok]
Small-sample artifact: 12 high-risk wards drawing from low-risk-heavy manifest
pool. No high-observation profile gets pulled (max major_open = 2 vs rule
threshold ≥3; max BI = 2.8 vs rule threshold >5). Resolves at
canonical-hierarchy regen.

Every other state fires all 10 rules. `verify_recommendations.ts` reports this
in its verdict line, so a regen that fixes it will say so.

### Assumptions are display-only — [planned]
Admin → Assumptions renders the `editable` flag from the config but binds
nothing to an input. Wiring the fields means deciding where overrides persist
(localStorage per state, matching the other admin panels) and how a changed
threshold reaches the engine, which currently reads the frozen config module.
Deferred to a future release; the tab carries a footnote saying so.

### getWardRecommendation loads full datasets per call — [demo-ok]
Each call awaits the whole fogging / breeding / larval modules (cached after
first load) and `getLatestLarvalIndices` linear-scans all 14,460 index records.
At demo scale that is a full sweep of 1,286 wards in a few seconds from Node,
and single-ward lookups are imperceptible. If R5's Priority Action Table ends up
calling this for every visible row on every filter change, pre-index by ward_key
the way `FOGGING_STATUS_BY_WARD` already does.

### Recommendation rules are hardcoded in config_assumptions.ts — [planned]
`RECOMMENDATION_RULES` ships in the generated config, identical for every state.
State-level rule overrides are deferred. Note the coupling: each condition
string is a key into the `MATCHERS` table in `src/data/recommendations.ts`, so a
generator that emits a new condition also needs a matcher. An unmatched
condition is skipped with a one-time console warning rather than silently never
firing, and `verify_recommendations.ts` catches it as an unreachable rule.

### Signals tab restructure deferred (Reading C) — [planned]
Signals tab currently has three overlapping sections (surveillance signals,
forecast drivers, ground reports). R3 leaves Signals untouched; recommendation
engine reads underlying data directly. Future design session should merge news
feed + surveillance metrics + fogging/breeding indicators into unified feed.

### R3 datasets are ~10 MB combined — [demo-ok]
Lazy-loaded into four separate chunks, so the entry chunk grew 6.64 kB
(2,726.00 → 2,732.64 kB) across all of R3. Verified in-browser that none load at
app boot; all arrive on Response-tab mount. Future iterations should consider
splitting per-state or streaming if the datasets grow — the larval indices chunk
alone is 3.96 MB.

**Those dynamic imports must stay the only imports of the four modules.** Same
trap as `boundaries.ts`: one static import folds megabytes back into the entry
chunk with no error and no warning.

## R4 entries

### Ward-level operational shading inherits the positional join — [fix-before-real]
Ward-level operational shading uses positional matching where geographic joins
are unavailable — same as case-count shading.

Concretely: the overlays added in R4 (fogging status, breeding sites, larval
coverage) resolve their values through the mock ward record a polygon was
*positionally* paired with, so an overlay colour sits on an arbitrary polygon
within a corporation exactly the way the existing case choropleth does. See
"GBA ward case data is joined to polygons by position" above — R4 does not add
a new problem, it inherits the existing one. Both are fixed by the same thing:
keying polygons on official ward IDs.

### Map overlay verification protocol — [process]
Fill-tally alone is insufficient — it counts DOM presence, not visible area.
Any overlay verification must run the area-check script (see
`scripts/r3/smoke/README.md`) and assert widthPct and heightPct both above
~40%. A path with fill colour but 1px² area passes the fill-tally but fails the
user.

Caveat documented in the README: the map card is ~3.7:1 while a city is roughly
square, so a correct fit often fills one axis and not the other. Read it as "at
least one axis above ~40%, neither in single digits".

### Operational overlays need a synchronous lookup — [demo-ok]
Every R3 getter is async, but Leaflet calls `styleFeature` / `styleSubFeature`
synchronously on each repaint. `buildOperationalWardMap`
(`src/features/weeklyResponse/operationalWards.ts`) therefore resolves the whole
ward scope up front into a plain Map that the style callbacks read without
blocking, and `DashboardMap` receives it as a prop rather than importing the R3
loader — which is also what keeps the lazy-load boundary intact.

Cost is O(wards) prebuilt-map reads (worst case Odisha, 481 wards), rebuilt
whenever state / filters / epi-week change. If a future iteration needs this at
finer granularity or higher frequency, memoise per scope rather than widening
the resolver.

## Build / tooling

### Main bundle > 500 kB — [demo-ok]
`npm run build` warns that the primary chunk (~2.7 MB / ~618 kB gzip) exceeds
500 kB. No code-splitting yet. Pre-existing; fine for a demo. Revisit with
dynamic `import()` / `manualChunks` if load time becomes a demo concern.

### Browser-automation screenshots flaky on map-heavy pages — [demo-ok]
The Chrome extension's script injection can time out while a Leaflet map + Vite
HMR socket keep the page "busy." Workaround during verification: open a fresh
tab and let it settle before screenshotting. Not an app defect.
