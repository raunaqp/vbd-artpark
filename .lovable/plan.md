
## Plan

### 1. State selector — remove AP-only restriction, default to Karnataka

**`src/data/mockData.ts`**
- Change initial `activeStateId` from `"andhra_pradesh"` to `"karnataka"`.

**`src/components/DashboardLayout.tsx`**
- Remove the `isEnabled = s.id === "andhra_pradesh"` gating in the state dropdown. All three states become selectable. Drop the `(soon)` suffix and disabled tooltip.
- Keep the demo disclaimer banner unchanged.

Result: app loads with Karnataka data across every tab; user can freely switch to Odisha / AP / Karnataka.

---

### 2. Block visibility — Analyst-controlled, per state + per user

#### 2a. Block inventory (canonical IDs)

A central registry defines the blocks in each tab. IDs are stable; labels are user-facing.

```text
overview:
  - situation_summary       → "Situation Summary"
  - kpis                    → "Key Metrics"
  - high_risk_map           → "High Risk Areas — Map"
  - high_risk_table         → "High Risk Areas — Table"
  - areas_of_concern        → "Areas of Concern"
  - action_focus            → "Action Focus Areas"
  - forecast_cards          → "Forecast — Next 4 Weeks"

surveillance:
  - cases_over_time         → "Cases Over Time (Positive, Samples, TPR)"
  - geospatial              → "Geospatial Distribution"
  - line_listing            → "Line Listing"

forecast:
  - forecast_map            → "Forecasted Risk Map"
  - actual_vs_predicted     → "Incidence — Actual vs Predicted"
  - outbreak_table          → "Outbreak Prediction Table"

weather:
  - observed_climate        → "Observed Climate (Last 8 Weeks)"
  - forecast_climate        → "Forecast Climate (Next 8 Weeks)"

hotspots:
  - hotspot_map             → "Hotspot Map"
  - hotspot_table           → "Hotspot Analysis Table"
  - hotspot_daily_trend     → "Hotspot Daily Trend"

signals:
  - news_alerts             → "News / Media Alerts"
  - geo_signal_map          → "Geo-tagged Signal Map"

upload:
  - upload_format           → "Select Upload Format"
  - upload_file             → "Upload Data File"
  - manual_entry            → "Manual Entry"
```

New file **`src/config/blockRegistry.ts`** exporting:
- `TabBlocks` type and the registry above.
- `getBlocksForTab(tab)` and `getAllTabBlocks()`.

#### 2b. Visibility state + persistence

New file **`src/contexts/BlockVisibilityContext.tsx`**:
- Storage key: `block_visibility::<userName>::<stateId>` (per state + per user, localStorage).
- Shape: `Record<TabId, Record<BlockId, boolean>>`. Missing entry = visible (default-on).
- API: `isVisible(tab, blockId)`, `setVisible(tab, blockId, value)`, `setManyVisible(tab, map)`, `resetTab(tab)`, `resetAll()`.
- Reads `currentRole.userName` and `stateId` from existing contexts to scope the key.
- Wrap the app in `<BlockVisibilityProvider>` inside `src/App.tsx` (after Role + State providers).

#### 2c. Hide blocks at render time

Each screen wraps its sections with a tiny helper:

```tsx
const { isVisible } = useBlockVisibility();
{isVisible("overview", "situation_summary") && (<SituationSummaryBlock />)}
```

Edits to each screen file (small, surgical — wrap existing JSX, no logic changes):
- `src/screens/OverviewScreen.tsx` — wrap the 7 sections.
- `src/screens/CaseSurveillanceScreen.tsx` — wrap the 3 sections.
- `src/screens/ForecastScreen.tsx` — wrap the 3 sections.
- `src/screens/WeatherScreen.tsx` — wrap the 2 climate groups.
- `src/screens/HotspotsScreen.tsx` — wrap map / table / daily trend.
- `src/screens/SignalsScreen.tsx` — wrap news / geo map.
- `src/screens/DataUploadScreen.tsx` — wrap format / upload / manual.

Filters bar (`GlobalFilters`) is **not** toggleable — it stays always-on.

#### 2d. Settings page (Analyst only)

New screen **`src/screens/ViewSettingsScreen.tsx`**:
- Header: "View Settings — <state name>" with subtext "Per-user visibility for <userName>. Changes apply only in <state>."
- For each tab: card with tab name, list of blocks (label + `<Switch>`), and a "Show all / Hide all / Reset" row.
- Footer: global "Reset to defaults" + "Done" link back to Overview.

Routing/access:
- Add a new tab entry **"View Settings"** in `DashboardLayout.tsx` `tabs` array, **rendered only when `isAnalyst` is true**.
- Add the corresponding case in `src/pages/Index.tsx` to render `<ViewSettingsScreen />`.
- Non-analyst roles see neither the tab nor the controls — they just see whatever the analyst configured for that state.

---

### 3. Notes / non-goals

- No backend changes; pure client storage.
- No changes to forecast package, data pipelines, or map behavior.
- Demo disclaimer banner kept as-is.
- Filter bar + headers remain always visible (only content blocks are toggleable).

### Files touched

- `src/data/mockData.ts` (1-line default change)
- `src/components/DashboardLayout.tsx` (remove gating, add Analyst-only tab)
- `src/App.tsx` (mount provider)
- `src/pages/Index.tsx` (route the new tab)
- New: `src/config/blockRegistry.ts`
- New: `src/contexts/BlockVisibilityContext.tsx`
- New: `src/screens/ViewSettingsScreen.tsx`
- Wrap edits in 7 screen files listed above.
