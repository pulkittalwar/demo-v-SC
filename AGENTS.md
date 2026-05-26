# Sembcorp Hyperspace OS Demo — Click-through Prototype

> **Engagement scope spec:** see `SEMBCORP_SCOPE.md` — the load-bearing spec for this build (engagement params, vocabulary, split-pane layout, persona workflow, KG schema, agent+critic mechanics, scope tier, 8-wave plan). Read AFTER this file every session.
>
> **W17 spec (preserved 2026-05-26):** see `WAVE_17.md` — KG enrichment (3x nodes per persona · P2 ~72 · P3 ~115) + Obsidian-style force simulation + drag-to-move + reset button. Implementation pending coach green-light. KG-only wave · W13-W16 locks preserved · cache-bust `v=w16` → `v=w17` on land.
>
> **Demo architecture deltas this build introduces:**
> 1. **Split-pane layout** — LEFT 2/3 = tablet view; RIGHT 1/3 = under-the-hood architecture viz with 3 zones (Agent View 64% / 3D KG 24% / Learning Flywheel 12%).
> 2. **4-persona top strip** on the tablet pane — Ops Control Tower → Onsite Eng → Offsite Expert → Asset Perf Analyst. CSS-illustration silhouette scenes (no real photos). Active = full color; previous persona greys on handoff.
> 3. **Same tablet "device" re-renders curated content per active persona** as workflow hands off (not separate screens — same frame, new content).
> 4. **3D Knowledge Graph** (4 MECE layers: People & Process / Plant & Equipment / Historical State / Predictive Intelligence) via pre-bundled `three.js` + `3d-force-graph`. Hardcoded ~30-40 nodes for the Jurong-CCGT-1 asset chain. Agent-spotlight animation as agents traverse layers.
> 5. **Agent View** — 4 buckets (Orchestration / Reasoning Agents · Transient / BU Critique · Vertical-aligned / Cross-Functional Validators). 9 agents total. Idle state = colored top-edge + icon + name + role; active state = expanded card with task tree + step counter (Claude-Code-style).
> 6. **Critic validation gate** — every agent output passes through a critique agent that walks the KG path backwards. Validated paths glow green and surface to tablet, rejected paths glow red and trigger re-dispatch. Final beat = Learning Flywheel: correction writes back to KG as a new node.

Throwaway click-through tablet demo for the BCG × Sembcorp ITP presentation on **2026-05-27**. Single canonical happy path, hardcoded data, vanilla JS static build, no backend, runs via `python -m http.server 8000`. Code dies after the meeting.

## Audience (locked)

Demo runs in front of **Sembcorp's International Technology Panel (ITP) + Charles (Sembcorp CDO)** — 6 attendees. ALL heavyweights. ALL technical. Mech eng / physics / materials science / digital architecture / energy industry pedigree.

| # | Attendee | Background | Will pattern-match on |
|---|---|---|---|
| 1 | **Jonathan Asherson, OBE** — ITP Chairman | Ex-chairman Rolls-Royce Southeast Asia (15+ years), OBE 2007, aerospace + energy systems, mechanical engineering pedigree | GT vendor accuracy (GE/Siemens/Mitsubishi), mech eng nomenclature (HRSG, condenser, turbine staging), energy systems lifecycle, OEM maintenance facts |
| 2 | **Pieter Franken** — ITP Member | MD GFTN (Global Finance and Technology Network), ex-Hitachi Central Research Lab, co-founder Safecast (Fukushima radiation IoT/citizen sensors), MAS Singapore advisor, MSc CS Delft | Sensor data integrity, IoT architecture rigor, digital trust + provenance, knowledge-graph schema soundness |
| 3 | **Prof Liu Bin** — ITP Member | Deputy President (Research and Technology) NUS, fellow Singapore Academy of Engineering + Singapore National Academy of Sciences, organic functional materials (hydrogen, photovoltaics), Thomson Reuters World's Most Influential Scientific Mind, President's Science Award 2024 | Energy transition science, materials credibility, scientific rigor in the underlying agent reasoning |
| 4 | **Prof Lui Pao Chuen** — ITP Member | Singapore's first Chief Defence Scientist, NUS Temasek Defence Professor, physics + ops research (MSc Naval Postgraduate School), Defence Technology Medal, Aviation Pioneer Award | Systems engineering rigor, operations research framing of multi-agent dispatch, decision-theoretic soundness |
| 5 | **Philippe Joubert** — ITP Member | Ex-President Alstom Power + ex-Deputy CEO Alstom Group, World Energy Council senior advisor, founder Earth on Board (planet boundaries → corporate governance), ESSEC, Chevalier de la Légion d'Honneur | Power generation industry insider perspective, sustainability framing, P&L narrative for energy assets |
| 6 | **Charles** — Sembcorp Chief Digital Officer | Internal sponsor. Hyperspace OS owner-side. Will scrutinize how we represent THEIR system | Hyperspace KG schema fidelity, internal-org plausibility, "is this what we actually built?" reality check |

**The line that must land for ALL 6:** *"Hyperspace OS — not a tool. An operating system that learns, orchestrates, and unifies your teams."*

This room demands TECHNICAL CREDIBILITY before anything else. Invented vendor names, fake standards, generic "AI says check the system" copy → instant skepticism spike. The audience will pattern-match on every detail.

## Vocabulary discipline (HARD)

Use only canonical Sembcorp / P&U industrial vocabulary (see SEMBCORP_SCOPE.md for the full table):

- **Equipment:** GT (gas turbine), CCGT (Combined Cycle Gas Turbine), HRSG (Heat Recovery Steam Generator), boiler feed pump (BFP), condenser, cooling tower, generator, transformer, switchyard, GT exhaust temperature spread, compressor pressure ratio, heat rate (kJ/kWh), fuel gas pressure
- **Metrics:** MW output, heat rate, availability factor, capacity factor, EAF (Equivalent Availability Factor), forced outage rate, dispatch reliability, derate
- **Plant IDs:** Jurong-CCGT-1, Jurong-CCGT-2, Sakra-CCGT-1, Banyan-CHP, Tuas-Power
- **Standards:** IEEE 1159 (power quality), ISO 50001 (energy management), IEC 61850 (substation automation), NERC reliability standards, ASME PTC (performance test codes)
- **Vendors:** GE 9HA gas turbines, Siemens SGT-800, Mitsubishi Power M701F, ABB drives (ACS series), Honeywell Experion DCS, Emerson Ovation, OSIsoft PI System
- **Engineer names (Sembcorp Singapore-flavored):** R. Kumar (Ops Control Tower), Lim Wei Jie (Onsite Eng / Maint), Dr. A. Wong (Offsite Expert), Priya Sundaram (Asset Perf Analyst). Backup roster: J. Tan, S. Ibrahim, M. Lim, P. Subramaniam

NEVER invent fake standards, fake vendor model numbers, or generic "AI says check the system" copy. The 6 ITP attendees will pattern-match instantly. Joubert was Alstom Power CEO — he knows every gas turbine made in the last 30 years. Asherson ran Rolls-Royce SEA. Get a model number wrong and credibility collapses.

## Working agreements (HARD)

### 1. Hard checkpoints
When user says "stop after X", "build only X", "I want to see X first", "checkpoint at X", or "hard halt at X" — that is a HARD HALT. Do not build the next section preemptively. Do not pre-stub scaffolding for sections beyond the checkpoint. Do not "while I'm at it" wire up future state. After the checkpoint deliverable lands and runs, output an explicit "STOPPING HERE — awaiting feedback" line and wait.

### 2. Incremental dispatch
Default to building 1-2 changes at a time. User runs the demo at localhost:8000, screenshots, gives feedback, then green-lights next batch. If a request implies more than 2 changes, ask before starting — propose split into multiple rounds.

### 3. Confirm before scope expansion
If you think a piece needs work beyond what user requested, surface the proposal first. Do not auto-implement adjacent fixes, refactors, or improvements. Out-of-scope additions = drift; drift on a tight-deadline build is more expensive than avoiding a round-trip.

### 4. Surface running state at every checkpoint
Every checkpoint return ends with:
- (a) what's running at localhost:8000
- (b) what to test in the browser (specific tap targets, expected animations)
- (c) explicit `STOPPING HERE — awaiting feedback` line

### 5. Throwaway code conventions
No tests, no architecture justification, no abstractions for future reuse, no docstrings beyond one-line "what this does", no CHANGELOG, no DECISIONS.md. Inline hardcoded data. Single file where possible. The audience for this code is the 2026-05-27 ITP meeting and then the bin.

### 6. No CDN runtime deps
Demo runs offline-safe on a projector in the Sembcorp meeting room with potentially flaky venue Wi-Fi. All libraries pre-bundled as static files (`vendor/three.min.js`, `vendor/3d-force-graph.min.js`). No CDN. No external font loads. No Google APIs. No analytics. Anything that requires a network call at demo time = blocker.

### 7. State machine via single source of truth (CRITICAL)
`STATE` object + `render()` function pattern. **`render()` is a PURE PAINT function — NO side effects, NO timers, NO setTimeout, NO triggering of animations.** All side-effect setup (notification timers, initial event bindings) lives in a separate `init()` function that runs ONCE on `DOMContentLoaded`. Animation phases use timeline-based `setTimeout` chain progression, but those chains are kicked off from event handlers (e.g., user clicks tap target) or from `init()`, NEVER from render(). Nav-state, animation-state, agent-dispatch-state, KG-state, persona-state are all DIFFERENT concerns — keep them separate. Back-button pops nav stack only.

### 8. Reversibility
Persistent `[Back]` button (top-left chevron) on every tablet screen except the dashboard entry and the terminal "demo end" screen. Pops state stack. User can re-tap any choice (re-pick hypothesis, change WO selection, override diagnosis) until terminal action is fired. Submit is terminal.

### 9. Diagnose before fix
When user reports a bug that you previously claimed to fix, do NOT immediately edit code again. First, paste the actual relevant code paths verbatim. Identify the root cause in one sentence. Propose a specific change. Wait for user confirmation. Only then write code. This avoids "I think I fixed it" loops where the same bug reproduces.

## Tech stack (locked)

- **Form factor:** 1280×800 desktop viewport (projected on screen at the meeting). Stage centered in viewport, split-pane (2/3 tablet · 1/3 under-the-hood).
- **Tablet bezel:** ~760px wide rounded frame inside LEFT pane, vivid green border + glow.
- **CSS:** Hand-rolled vanilla CSS inside `<style>` block in `index.html`. No Tailwind, no preprocessor.
- **JS:** Vanilla. Single state object + render function. State stack array for back-button reversibility. `init()` runs once on DOMContentLoaded.
- **3D KG library:** `three.js` + `3d-force-graph`, pre-bundled to `vendor/`. NO CDN. If pre-bundle exceeds 5MB or causes init perf issues, fall back to 2D-parallax SVG and log decision.
- **No frameworks:** No React, no Vue, no Alpine. No build step. No `node_modules` (except for one-time download of three.js + 3d-force-graph; those are committed as static `vendor/*.min.js` files).
- **Files:** `index.html` + `app.js` + `vendor/*.min.js` + `briefing/` (gitignored — raw client material). One-off keyframes + non-grid rules go in inline `<style>` block in `index.html`.

## Visual style (locked) — DARK THEME with Sembcorp deck-aligned palette

Calibrated against the Sembcorp ITP PDF deck page 1 (title slide) and page 25 (Hyperspace OS Demo slot). Pure black background, vivid almost-fluorescent green energy, white text. NOT Sembcorp logo green (`#00A651` is too dark for digital — use it only as muted accent).

**Palette tokens (already locked in CSS):**
- `--bg-stage`: `#000000` — root background, true black
- `--bg-pane`: `#0A0F1C` — pane surface, subtle lift above stage
- `--bg-card`: `#161E2F` — agent/info card surface, visibly floats above pane
- `--bg-card-elev`: `#1F2941` — active/hovered card
- `--bg-tablet`: `#07090F` — tablet inner surface
- `--green-vivid`: `#00E676` — primary brand green (deck-aligned)
- `--green-glow`: `#39FF88` — highlight + glow color for tablet bezel + active states
- `--green-soft`: `#00A651` — Sembcorp logo green, muted accents only
- `--blue-vivid`: `#60A5FA` — Reasoning Agents (BU · Transient)
- `--amber-vivid`: `#FBBF24` — BU Critique
- `--pink-vivid`: `#F472B6` — Cross-Functional Validators
- `--text-primary`: `#FFFFFF` — primary text
- `--text-secondary`: `#D1D5DB` — secondary text (neutral, not blue-tinted slate)
- `--text-muted`: `#6B7280` — labels, idle states

**Tablet content area** (inside the bezel): renders in LIGHT-on-dark for the persona-curated UI itself, with white cards (`#F8FAFC` bg) for the in-tablet content blocks (sensor metrics, alarm strip, operational impact, asset chain, historical accordion). Sembcorp teal/green header bands inside cards.

- Generous tablet spacing. Tap targets 44px min.
- Subtle borders + dividers, not heavy boxes.
- Tablet bezel glow MUST be visible from across the room — strong outer halo (32px) + diffuse 80px + inner ring.

## Canonical demo scenario (locked)

**Incident:** `JRG-CCGT-1 · Block 2 · GT-3` — GT exhaust temperature spread widening (8.4°C, target ≤5°C) + heat rate drift (+2.1%) + compressor pressure ratio drift (-0.4). Date stamp `INC-2026-0537 · 08:42 SGT`. Severity **AMBER**.

**Asset chain (KG-traced upstream):**
`GT-3 → HRSG-3 → CONDENSER-3 → GENERATOR-3 → TRANSFORMER-3 → SWITCHYARD-A`

**Hyperspace diagnosis (orchestrator + triage agent + Power Gen critic):**
Compressor fouling correlated with last 90 days ambient humidity profile. Validated against 3 prior compressor-fouling RCAs from Jurong + Sakra fleet (KG layer L3 → L4).

**Operational impact:**
MW dispatch reliability at risk — Block 2 derate ~50MW if unmitigated. Affects PSO commitment window 09:00–18:00 SGT. Action required within 45 min.

**Three-tier resolution:**
1. **Immediate remediation** (Onsite Eng): compressor wash cycle initiation per OEM playbook
2. **Short-term WO** (Offsite Expert approval): condenser tube inspection scheduled next shutdown
3. **Long-term feedback to KG** (Asset Perf): update humidity-fouling pattern in L4, write back $X estimated revenue protected

## 4-persona workflow (locked)

Same canonical incident flows through 4 personas. Persona strip at top of tablet shows 4 tiles. Active = full color; greyed = handed off / not yet active. Each persona's tablet view is CURATED to their role. See SEMBCORP_SCOPE.md "4-Persona workflow" table for the full handoff contract.

| # | Persona | Engineer | Tablet view essence |
|---|---|---|---|
| 1 | Ops Control Tower | R. Kumar | Incident detection + cross-asset visibility + triage. Hands off to Onsite. |
| 2 | Onsite Eng / Maint | Lim Wei Jie | Mobile-style step-by-step guidance. On-site verification. Immediate remediation. Hands off to Offsite. |
| 3 | Offsite Expert | Dr. A. Wong | Diagnosis confirmation + WO pre-fill + remediation approval + risk escalation. Hands off to Asset Perf. |
| 4 | Asset Perf Analyst | Priya Sundaram | P&L impact dashboard. Validates financial impact. Writes correction back into KG. Loop closes. |

## Out of scope (DO NOT BUILD)

- No real LLM calls or real agent execution. All "agent work" is scripted animation.
- No real KG database. Hardcoded JSON file describing ~30-40 nodes.
- No user-editable demo paths. Single canonical happy path through all 4 personas.
- No override / disagree workflow on diagnosis (CAG had this; Sembcorp skips for scope).
- No login / auth screens.
- No mobile responsive layout — fixed 1280×800 desktop viewport only.
- No multi-incident dashboard — single canonical Jurong-CCGT-1 GT-3 incident.
- No state machine library, no React, no Vue.
- No tests, no CI, no documentation files beyond this CLAUDE.md + SEMBCORP_SCOPE.md.

## Demo flow (canonical)

1. **Open** — Hyperspace OS tablet view shows Ops Control Tower curated dashboard with `JRG-CCGT-1 · GT-3` incident already detected, AMBER severity, TRIAGING pill. Right pane Agent View: Orchestrator idle, all reasoning + critic agents idle.
2. **Triage** — Orchestrator dispatches Triage Agent (animates in Agent View card + on KG, traversing L2 → L3 → L4 nodes). Triage Agent produces diagnosis. Power Gen Critic validates path (KG path glows green). Diagnosis surfaces to tablet. Ops Control Tower engineer (R. Kumar) confirms. Hands off to Onsite.
3. **Onsite** — Persona strip greys Ops, activates Onsite. Tablet re-renders for Lim Wei Jie. Playbook Agent dispatches (compressor wash procedure). Critic validates. Onsite engineer ticks verification steps + initiates immediate remediation. Hands off to Offsite.
4. **Offsite** — Persona strip handoff. Tablet re-renders for Dr. A. Wong (Offsite Expert). Long-term WO pre-fill surfaces. HSE Risk Validator + P&L Impact Validator run (Cross-Functional Validators bucket activates). Offsite approves WO + escalation memo. Hands off to Asset Perf.
5. **Asset Perf** — Persona strip handoff. Tablet re-renders for Priya Sundaram. P&L dashboard surfaces. $X revenue protected. Learning Engine activates: correction writes back to KG (visible as new green node appearing on L3 humidity-fouling pattern). Learning Flywheel completes step 5/5.
6. **Close** — "Next decision sharper" beat lands. Demo ends.

## When in doubt

- Ask user before scope expansion
- Surface running state, don't just claim "done"
- Stop at the checkpoint, not "near" the checkpoint
- Use canonical Sembcorp / P&U vocab, not invented
- Keep the demo offline-safe (no CDN at demo time)
- Diagnose before fix when bugs reproduce after claimed fixes
- The 6 ITP attendees will pattern-match every detail — vendor names, standards, asset IDs, sensor units must be exact
