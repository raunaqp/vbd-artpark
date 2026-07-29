# Smoke tests & verification protocols

Node smoke tests (run with `npx vite-node <path>`):

| Script | Protects |
|---|---|
| `verify_data_load.ts` | R3 datasets load; app→manifest re-key is deterministic across sessions |
| `verify_recommendations.ts` | Every rule in `RECOMMENDATION_RULES` is reachable; catches a missing `MATCHERS` entry after a config regen |
| `verify_operational_wards.ts` | Ward-scope resolver returns fogging / breeding / coverage per ward and shrinks with filters |
| `verify_priority_rows.ts` | Priority Action Table rows enumerate the whole state regardless of drill state; composite score stays in range, sorts descending, and is identical on rebuild; `scopeRows` reproduces a filtered async resolve exactly |

---

## Map overlay verification protocol

**Fill-tally alone is insufficient — it counts DOM presence, not visible area.**
Any overlay verification must run the area-check script below and assert
`widthPct` and `heightPct` are both above ~40%. A path with fill colour but
1 px² area passes the fill-tally but fails the user.

This is not hypothetical. R4.3 was reported as verified on the strength of a
fill tally showing `#22c55e ×13 / #ef4444 ×5`. Those fills were real and still
are — but the whole ward layer was rendering at **16 × 14 px inside a
1900 × 379 viewport**, so the map read as uniformly grey to anyone looking at
it. The tally was true and the conclusion was wrong. See the
`Map zoom: fit to sub-layer bounds at block level` commit.

### The check

Drill to ward level, select a non-Forecast overlay, then run in DevTools:

```js
const OP=['#22c55e','#eab308','#ef4444','#94a3b8'];
const el=document.querySelector('.leaflet-container');
const v=el.getBoundingClientRect();
// The ward sub-layer is every ward polygon, NOT just the coloured ones:
// unmatched wards render #cbd5e1. Measuring only the coloured subset
// understates the fit — see the R4.4 note below.
const wards=[...el.querySelectorAll('path')].filter(p=>{
  const f=p.getAttribute('fill'); return f==='#cbd5e1'||OP.includes(f);});
const col=wards.filter(p=>OP.includes(p.getAttribute('fill')));
const bb=e=>{let a=1e9,b=1e9,c=-1e9,d=-1e9;e.forEach(p=>{const r=p.getBoundingClientRect();
  a=Math.min(a,r.left);b=Math.min(b,r.top);c=Math.max(c,r.right);d=Math.max(d,r.bottom);});
  return {w:Math.round(c-a),h:Math.round(d-b)};};
const g=bb(wards);
console.log({wardPolygons:wards.length, coloured:col.length, bbox:g,
  viewport:{w:Math.round(v.width),h:Math.round(v.height)},
  widthPct:(100*g.w/v.width).toFixed(1)+'%', heightPct:(100*g.h/v.height).toFixed(1)+'%'});
```

**Cross-check `wardPolygons` against the map's own "Showing: Ward boundaries
(N)" label.** If they disagree, the filter above is picking up the wrong paths
and every percentage below is meaningless.

### Measure the whole ward layer, not the coloured subset (R4.4)

`coloured` will usually be **less** than `wardPolygons`, and that is expected:
operational overlays colour only wards present in the app hierarchy, while the
KGIS boundary files carry many more polygons than that. Hubballi-Dharwad has
**82 ward polygons and 22 coloured**, because the app hierarchy has 22 wards
for that corporation.

Those 22 are geographically clustered, so measuring only them gives
**10.1% x 39.2%** — an apparent failure — while the real ward layer fits
correctly at **23.2% x 73.8%**. The original version of this script measured
the coloured subset and produced exactly that false alarm during R4.4.5
verification.

So: **assert on the ward-layer bbox.** Use `coloured` as a separate sanity
check — it should equal the number of app-hierarchy wards in the current scope
(the Priority Action Table's row count for that scope, which you can read off
its "Showing 1-N of N" line after searching for the block name).

### Reading the result

The ~40% threshold assumes the rendered area and the viewport have similar
aspect ratios. They often do not — the map card is roughly 3.7 : 1 (e.g.
1412 × 378) while a city is roughly square, so a correct fit fills the height
and cannot fill the width. Hubballi-Dharwad fits correctly at
**23.2% × 73.8%**; that is a pass, not a failure.

So: **at least one axis must exceed ~40%, and neither may be in single digits.**
Single-digit percentages on both axes mean the layer is a speck — that is the
failure this protocol exists to catch (the bug measured 1.4% × 4.2%).

Where the two disagree, trust the larger: it is the axis the fit was
constrained by.

### Also worth checking

- Round-trip the zoom: state → district → block → back to state. The zoom must
  return to where it started. An earlier iteration of the fix framed wards
  correctly but left the map stuck at ward zoom on the way back out.
- Compare against a stashed baseline (`git stash`, reload, measure, `git stash
  pop`) when touching shared map code. Four screens use `DashboardMap`.
