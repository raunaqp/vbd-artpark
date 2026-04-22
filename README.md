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

