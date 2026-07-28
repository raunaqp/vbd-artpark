# PRISM-H Dashboard — Prediction vs Operations

**Status:** approved for implementation, phased across Sessions R1–R5
**Author:** Raunaq Pradhan
**Last updated:** 28 Jul 2026

---

## The problem

The Forecast tab had grown to hold both prediction (where dengue is expected) and operations (what field teams have done about it).

For a state surveillance officer, this conflates two questions that should stay distinct:

- **"Where is dengue expected in the next four weeks?"** — a prediction question, answered by the model
- **"Did we act on what the forecast told us?"** — an operational question, answered by field response data

Mixing them clutters both. A commissioner scanning risk sees action logs. A ward supervisor logging fogging sees forecast methodology. Neither is optimised for their decision.

---

## The design principle

**Prediction and operations are separate products, in one dashboard.**

- **Forecast tab** — prediction only
- **Response tab** — operations only

No duplication. If a piece of information belongs on one tab, it does not appear on the other.

---

## Forecast tab

**Answers:** Where is dengue expected?

**Audience:** Commissioner, State Surveillance Officer, Epidemiologist, District Programme Officer

**Content:**

- Four-week projected case counts
- Risk classification per area (Critical / High / Moderate / Low / No Data)
- Risk map showing predicted risk only
- Priority Forecast Areas table (Corporation × Projected Cases × Risk)
- Forecast Methodology (collapsed by default)

**What it does not contain:**

- Operational status
- Response actions
- Fogging, breeding sites, or larval survey overlays
- Outbreak probability percentages (the officer sees "High" not "54%")

**Why probability is hidden:** decisions in field operations are made on categorical risk, not probability. Probability is a technical intermediate — kept in the backend and the methodology section, not in the primary UI.

---

## Response tab

**Answers:** Did the response happen where the forecast said it should?

**Audience:** District Vector Borne Disease Officer, Municipal Health Officer, Ward Supervisor, Field Team

**Content:**

- Summary tiles: High-risk Areas, Responses Completed, Responses Pending, Fogging Overdue, Major Breeding Sites Open, Response Coverage
- Operational Action Map with toggleable overlays (Risk / Fogging / Breeding / Larval Surveys), one active at a time
- Geography side panel showing Forecast context + Fogging + Breeding + Field Activities + one Recommended Action per area
- Priority Action Table sorted by operational urgency
- Response History (collapsed by default)
- Expanded Log Response workflow (records fogging, breeding site counts, source reduction, etc.)

**Input data flowing into Response:**

- **Larval survey coverage** — reported by field teams via the survey app (currently mocked)
- **Breeding site inventory** — provided by state partners at ward level (major / minor / open / resolved)
- **Fogging logs** — recorded by ward supervisors (last date, status, coverage)
- **Forecast risk** — pulled from Forecast tab as the priority signal

---

## The core loop the Response tab enables

The Response tab is designed to close one specific feedback loop:

> The forecast said this ward was high risk.
> Did fogging happen? Was source reduction done? Did we cover the wards where cases are rising?

Answering that in one glance — for a supervisor covering 50 wards or an officer covering a district — is the entire product goal.

The Recommended Action shown per area is a direct output of this loop:

- If fogging is overdue in a high-risk ward → "Schedule fogging within 48 hours"
- If breeding sites remain open → "Conduct source reduction"
- If survey coverage is low in a rising ward → "Deploy survey teams"
- If response completed and effective → "Continue monitoring"

Never more than one recommendation per area. Never a paragraph. Never AI-generated fluff.

---

## Data separation

The dashboard treats four data concepts as strictly distinct:

| Concept | Meaning | Source |
|---|---|---|
| **Forecast** | Predicted future risk | Model output (acestor) |
| **Breeding sites** | Observed field data | State partner reports |
| **Recommended response** | What the system suggests | Rule-based on forecast + observed data |
| **Completed response** | Actual logged intervention | Field team submissions |

**Critical:** a recommendation is not evidence work happened. Completed and recommended are separate columns in the data model and separate cells in the UI.

---

## Filters

Both tabs use minimal filters:

- **Corporation** (level 1)
- **Zone** (level 2, appears after Corporation is set)
- **Ward** (level 3, appears after Zone is set)

Auto-apply on selection. No Apply button. Keep Reset.

---

## Non-goals

To keep the redesign disciplined, these are explicitly out of scope:

- **Adding new metrics.** The redesign moves and organises data. It does not introduce new columns, KPIs, or signals.
- **Replacing the forecast model.** Prediction logic stays as-is. Only the UI restructures.
- **Building real backend integrations.** All new datasets (fogging, breeding sites) remain mocked in this iteration.
- **Redesigning the visual language.** Same colours, typography, iconography. This is a product redesign, not a visual redesign.

---

## Sessions

Implementation phased across five Claude Code sessions:

- **R1: Forecast simplification** — remove probability from UI, rename Prediction Table → Priority Forecast Areas, collapse Methodology, keep Response block visible until R2 relocates it
- **R2: Response tab scaffold** — new tab, relocate existing Session-C Weekly Response + Effectiveness onto it
- **R3: New mock data** — deterministic fogging + breeding sites datasets, generated externally, wired via helpers
- **R4: Operational Action Map** — toggleable overlays, one active at a time
- **R5: Geography side panel + Priority Action Table + expanded Log Response** — final integration

Each session ships 1–3 small commits, verified in the browser, no ambiguity carried into the next session.

---

## Success criteria

The redesign has succeeded when:

- A commissioner can open Forecast and see the four-week outlook in under 10 seconds without scrolling past operational content
- A ward supervisor can open Response, filter to their ward, see one Recommended Action, and know what to do
- No user needs to switch tabs to understand either question
- No stakeholder asks "why is [operational thing] on the forecast tab" or vice versa

If any of the above fails after ship, we've missed the intent.

---

## Rationale for stakeholder framing

If asked "why is it structured this way?", the answer is:

> Prediction and operations are two different questions asked by two different people. Mixing them clutters the interface for both. The Forecast tab is for leaders scanning where risk is heading. The Response tab is for operational managers ensuring the field response matches the forecast. Same dashboard, two clear surfaces.
