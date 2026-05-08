🦟 Early Warning System for Vector-Borne Diseases (VBD-EWS)

A multi-state, decision-support platform for public health officials to monitor, predict, and respond to vector-borne disease risks. Designed for district and block-level action, the system combines surveillance data, climate signals, and forecasting to move from reactive response → proactive intervention.

🌍 Supported States
1. Andhra Pradesh 
2. Odisha 
3. Karnataka 

🎯 What This System Does
The platform enables officials to:
📊 Monitor current case trends
📍 Identify recent hotspots (past 2–4 weeks)
🔮 Predict outbreak risk (next 2–4 weeks)
🌦️ Track weather drivers (last 8 + next 8 weeks)
🧭 Navigate from state → district → block → village/ward
⚡ Take specific, location-based actions


🧠 Core Concept
Data → Trends → Forecast → Signals → Actions

The system is built to answer:
1. Where is risk?
2. Why is risk increasing?
3. What should be done?

🧩 Key Features
1. Multi-Level Map Drill-Down
a. Click district → view blocks + municipalities
b. Click block → view villages
c. Click municipality → view wards

2. Hotspots (Past Analysis)
a. Based on last 2–4 weeks of cases
b. Identifies recent clustering
c. Used for situational awareness

3. Forecast (Future Risk)
a. Predicts outbreak risk for next 4 weeks
b. Displays:
- Probability of outbreak
- Risk level (Low / Moderate / High)
- Signal explanation

4. Weather Intelligence
a. Observed: last 8 weeks (W-1 to W-8)
b. Forecast: next 8 weeks (W+1 to W+8)
c. Includes:
- Rainfall
- Temperature
- Humidity

5. Signals / Field Intelligence
Contextual signals mapped to geography:
- Tourism (Puri)
- Industrial clusters (Sundargarh, Angul)
- Canal irrigation (Guntur)
- Rainfall spikes (Udupi)
- Urban clustering (Vizag, Bengaluru)

6. Action Engine
Provides specific, field-ready recommendations:

Examples:
a. Fogging in specific wards
b. Larval surveys in named villages
c. Canal-side source reduction
d. Industrial sanitation drives
e. Drainage clearing in high-risk areas

7. Role-Based Views
a. Role	Access
b. State Officer	District-level
c. District Officer	Blocks + municipalities
d. Block Officer	Villages
e. Municipality Officer	Wards
f. Analyst	Full access

8. Data Upload & Reporting
a. Excel / CSV upload
b. Manual data entry
c. Multiple report formats:
- Line list
- District summary
- NVBDCP format
- State reports

9. Geography Model
State
 ├── District
 │    ├── Block
 │    │    ├── Village
 │    └── Municipality
 │         ├── Ward

10. State-Specific Context
a. Andhra Pradesh 
Urban clustering (Visakhapatnam)
Canal-driven spread (Guntur)
Rural + seasonal patterns (Kurnool)

b. Odisha 
Puri → tourism-driven risk
Balasore → high case load
Angul → industrial cluster
Sundargarh → industrial + worker settlements

c. Karnataka
Bengaluru → urban + construction-driven risk
Mysuru → peri-urban spread
Belagavi → rural patterns
Udupi → rainfall-driven spikes

10. Data Principles
a. No random / flat data
b. Trends are non-uniform and realistic
c. Forecast is always explainable
d. Hotspots (past) ≠ Forecast (future)
e. Focus is on decision-making, not reporting clutter

11. Testing Checklist
a. State switch updates entire system
b. Role switch updates scope correctly
c. Map click navigates to correct level
d. Forecast and hotspots are not mixed
e. Weather respects filters
f. Actions are location-specific

12. Tech Stack (Suggested)
React / Next.js
Tailwind CSS
Mapbox / Leaflet
State management (Context / Zustand)
Data pipeline (API / batch ingestion)

13. How to Run (Example)
npm install
npm run dev

14. Vision
This system is designed to evolve into a National-scale, configurable early warning platform for vector-borne diseases

Extensible to:
a. Malaria
b. Chikungunya
c. Other climate-sensitive diseases

15. Use Case
Built for:
a. State Health Departments
b. District Surveillance Units
c. Public Health Programs
d. Climate-health initiatives


For more details, contact at: raunaq@artpark.in , https://www.linkedin.com/in/raunaqpradhan/


---

## v3 Handoff (May 2026)

This section captures the state of the dashboard as shipped in v3 — what's in,
what's deferred, and how to demo it honestly.

### What's complete in v3

- **8 tabs**: Overview, Case Surveillance, Forecast, Weather, Hotspots, Signals,
  Data Upload, Admin (admin-only). View Settings is available to admins.
- **Role-based access**: State Officer, DHO (district), Block Worker,
  Municipality Officer, Data Operator, Admin — each scoped to the right
  geography with locked filters where applicable.
- **Hierarchical drill-down**: State → District → Block / Municipality →
  Village / Ward. All KPI tiles, tables, time-series charts, hotspots, and
  forecast cards read from the deepest selected level.
- **State-aware risk classification**: WHO bands for AP and Odisha,
  ICMR strata for Karnataka. Risk labels and forecast classes flow from
  `STATE_RISK_METHOD`.
- **Mock data spans 21 districts × 36 weeks × 4 levels** (district, block,
  municipality, ward / village) with realistic non-uniform trajectories.
  Forecast risk is grounded in each geography's own trajectory vs its WHO
  baseline (μ, σ) — wards in the same district can show different risk classes.
- **Admin tab**: per-state section toggles (hide forecast / hotspots /
  signals / data upload tabs from non-admin roles), user management mock,
  and forecast accuracy panel.
- **Cascading filter reset**: changing state resets district / block / ward;
  changing district resets block / ward; changing block resets ward.
- **Demo affordances**: amber "Demo" pill in the header, "(mock data)"
  footer, persistent banner explaining demo data.

### Deferred (not in v3)

- **MapLibre migration**: blocked on real ward / village GeoJSONs from the
  ARTPARK pipeline. Map currently renders schematic cells.
- **Real backend integration**: separate roadmap, requires API team
  sign-off on the ingestion contract.
- **NVBDCP playbook sign-off**: external dependency; recommended action
  copy is mock until then.
- **ECI 2024 voter-roll population data**: district populations are placeholder
  values from `DISTRICT_POPULATION`. Population-normalised metrics (rising
  cluster detection) will become more accurate once these land.
- **`mockData.ts` helpers → pure functions over `MOCK_DATASET`**: refactor
  deferred; not blocking. Single source of truth via `canonical.ts` is
  already met.

### Demo guidance

- All numbers are **mock**. The Demo pill in the header and the footer
  caveat ("v0.3 (mock data)") are intentional and should stay until real
  data lands.
- The relationships between cases, trends, hotspots and forecasts are
  internally consistent — that's the credibility story. The production
  model will plug into the same logic.
- When showing the demo:
  1. Pick a state → role → district to anchor the scope
  2. Walk Overview → Surveillance → Hotspots → Forecast in that order
  3. Drill into a specific block / ward to show that the dashboard
     reflects the real per-geography trajectory, not a scaled district view

### Known limitations

- **Signals** stops at district level by data design (news / social
  signals are not currently geo-tagged below district). Sub-district
  selections show an explanatory banner and empty state.
- **Weather / Climate** data is at district level only. Sub-district
  selections show an explanatory banner.
- **Mobile**: dashboard is best viewed on desktop (≥1280px). Layout
  remains usable on tablet; on phone screens, horizontal scroll is
  expected for tables.
