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

## About Pulkit (project owner)

- **Role**: BCG consultant (Project Leader-track). Owner of the Sembcorp Hyperspace OS engagement. Drives the BCG × Sembcorp ITP presentation on 2026-05-27.
- **Working pattern**: dual-session coach/operator split. Pulkit relays between a *coach* session (architecture + spec) and an *operator* session at `/Users/talwarpulkit/code/demo-v-SC/` (this project). Operator implements + verifies; coach reviews disk vs claims.
- **Strong in**: client framing, demo storytelling, engagement scoping, audience pattern-match. Knows the 6 ITP attendees + their failure modes (Joubert pattern-matches GT vendors; Asherson pattern-matches OEM lifecycle; Charles will scrutinize HyperspaceOS schema fidelity).
- **Still learning**: vanilla-JS DOM micro-management, three.js force-graph internals. Treat layout/CSS/JS implementation details as ones to spell out concretely (file:line refs, exact CSS rule changes); treat scope + narrative decisions as ones to defer to Pulkit.
- **Output preference**: caveman mode in chat (terse fragments, drop articles/filler/pleasantries/hedging). Code/commits/PRs/operator-prompts/durable artifacts (this file, SEMBCORP_SCOPE.md, scope confirmations): **write normal English** — they get read by future-self, by other agents, by audit scripts; byte-perfect matters.
- **Communication preference**: surface running state, never "tested, works" without per-test observed-vs-expected table. Diagnose before fix when bugs reproduce. Confirm before scope expansion.

## Operating principles (Karpathy-aligned · always)

The four rules below override default behavior. They went viral on the Karpathy CLAUDE.md GitHub repo (82k stars) for a reason — they take coding accuracy from ~65% to ~94%.

1. **Ask, don't assume.** If anything about intent, architecture, or requirements is unclear, ASK before writing a single line of code. Never make silent assumptions. (Conflicts with default Auto-mode "make reasonable call and keep going"? In *implementation* tasks default to ask; in *coach-side synthesis* tasks Auto-mode call-and-keep-going is OK.)
2. **Simplest solution first.** Always implement the simplest thing that could work. Do not add abstractions, flexibility, or "future-proof" hooks that weren't explicitly requested. Reinforces working agreement #5 (throwaway code conventions — the demo dies after 2026-05-27, no abstractions for reuse).
3. **Don't touch unrelated code.** If a file or function is not directly part of the current task, do not modify it — even if you think it could be improved. If you spot something worth fixing, mention it in a single-line note at the end of your status report. Do not touch it. Ever. Reinforces working agreement #3.
4. **Flag uncertainty explicitly.** If you are not confident about an approach, a fact, a statistic, a date, or a technical detail, SAY SO before proceeding. "Confidence without certainty causes more damage than admitting a gap." Never fill knowledge gaps with plausible-sounding fabrication.

Additional operating principles for this engagement:

- **Show options before acting on significant tasks.** Before any non-trivial implementation choice, surface 2-3 ways you could approach the work + the tradeoff per option. Wait for Pulkit (or the coach session) to choose before proceeding. Trivial choices (which CSS variable name, which helper function name) don't need a fork.
- **Extended thinking for hard decisions.** For questions involving system architecture, animation timing tradeoffs, KG node-state design, or any decision that ripples across multiple waves: think step by step. Surface tradeoffs the user hasn't considered. Flag assumptions that might not hold (e.g., projector legibility at smaller KG min-height; bundle init time on flaky venue WiFi). Then give your recommendation.
- **Match length to task.** Simple questions get direct, short answers. Complex tasks get full responses. Never pad with restatements of the question or closing sentences that repeat what you just said. Caveman mode in chat enforces this naturally.
- **Source of truth — SEMBCORP_SCOPE.md, NOT MEMORY.md / ERRORS.md / DECISIONS.md.** Throwaway-code convention (WA #5) explicitly skips persistent decision logs. Instead, SEMBCORP_SCOPE.md grows with wave-confirmation blocks (W2.5 / W2.6 / W3.1 / W3.2 / W3.3 / ...) — that IS the decision log + ERRORS log + permanent facts list for this engagement. Append to its existing sections; don't create new top-level memory files. After the meeting on 2026-05-27 this entire repo deletes anyway.

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

- **Equipment:** GT (gas turbine), CCGT (Combined Cycle Gas Turbine), HRSG (Heat Recovery Steam Generator), boiler feed pump (BFP — multi-stage centrifugal, NDE/DE bearing housings), steam turbine (ST), condenser, cooling tower, generator, transformer, switchyard, GT exhaust temperature spread, compressor pressure ratio, heat rate (kJ/kWh), fuel gas pressure, vibration RMS (mm/s), ISO 10816-7 alarm zones (A / B / C / D), 1×RPM (synchronous vibration component), phase angle, bearing temperature (°C)
- **Metrics:** MW output, heat rate, availability factor, capacity factor, EAF (Equivalent Availability Factor), forced outage rate, dispatch reliability, derate
- **Plant IDs:** Jurong-CCGT-1, Jurong-CCGT-2, Sakra-CCGT-1, Banyan-CHP, Tuas-Power
- **Standards:** IEEE 1159 (power quality), ISO 50001 (energy management), ISO 10816-7 (industrial pumps — mechanical vibration), ISO 20816-1 (general machinery vibration), API 670 (machinery protection systems), IEC 61850 (substation automation), NERC reliability standards, ASME PTC (performance test codes)
- **Vendors:** GE 9HA gas turbines, Siemens SGT-800, Mitsubishi Power M701F, Sulzer (BFP — Swiss multi-stage centrifugal), Bently Nevada 3500 series (Emerson — machinery protection / vibration monitoring), SKF (bearings), ABB drives (ACS series), Honeywell Experion DCS, Emerson Ovation, OSIsoft PI System
- **Engineer names (Sembcorp Singapore-flavored):** R. Kumar (Ops Control Tower), Lim Wei Jie (Onsite Eng / Maint), Dr. A. Ismail (Offsite Expert), Priya Sundaram (Asset Perf Analyst). Backup roster: J. Tan, S. Ibrahim, M. Lim, P. Subramaniam

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

### 10. Confirm before destructive
Before any irreversible action — deleting files, overwriting non-trivial blocks of existing code without diff preview, dropping `vendor/` files, killing the running `python -m http.server` instance without a re-start plan, `git reset --hard`, `git push --force` — STOP. List exactly what will be affected. Ask for explicit confirmation. "You mentioned this earlier" is not confirmation. Pulkit must say yes in the current message. (Trivial edits inside files the wave plan already calls out don't need this gate — only out-of-scope or fully destructive ops.)

### 11. Show what changed at task end
Every status report ends with a `Files changed` block:
- **Files changed**: list every file touched, one line each
- **What was modified**: one line per file
- **Files intentionally not touched**: anything the wave plan called out as "don't touch this wave" or anything related you considered but left alone
- **Follow-up needed**: optional one-liner of stuff you noticed but didn't fix (per Karpathy rule 3)

This is the manual diff summary that lets the coach session verify disk vs claims fast without grep-walking the whole repo.

### 12. Show 2-3 options before significant tasks
For any non-trivial implementation fork (state machine shape, animation timing model, KG layout algorithm, persona switching mechanism), surface 2-3 ways you could approach it + the tradeoff per option. Wait for selection before writing code. Cheap forks (variable name, helper function placement) don't need a fork — just pick the cleaner option.

### 13. Per-test observed-vs-expected table required
Every wave verification block ends with a per-test table:
```
#: 1
Test: <name>
Observed: <what you saw>
Expected: <what was specified>
Pass: ✓ / ✗
```
Narrative summaries like "tested, works" without per-test rows get bounced back by the coach session. Chrome MCP browser-driven tests are the default; subjective items (animation timing feel, projector legibility) get flagged as "human check required" instead of claiming pass.

## Tech stack (locked)

- **Form factor:** Full browser viewport `100vw × 100vh` — edge-to-edge, NO centered floating rectangle. Split-pane CSS grid `2fr 1fr` (LEFT = tablet column · RIGHT = under-the-hood). Pane-level scroll on both `#left-pane` and `#right-pane` (W1.5c lock). Body has `overflow: hidden` + `overscroll-behavior: none` so the page itself never bounces. See SEMBCORP_SCOPE.md "## Split-pane layout (locked W1.5c — pane-level scroll)" for canonical layout spec.
- **Tablet bezel:** `max-width: 720px`, centered in LEFT pane with `margin: 0 auto`, charcoal `#1F2937` frame (10px padding, 24px border-radius), NO green glow. `min-height: 110vh` so bottom bezel hangs below initial viewport — scrolling LEFT pane reveals the rest.
- **Personas panel:** External white card ABOVE the tablet (NOT inside the bezel), matches `max-width: 720px` to line up as a centered column.
- **CSS:** Hand-rolled vanilla CSS inside `<style>` block in `index.html`. No Tailwind, no preprocessor.
- **JS:** Vanilla. Single state object + render function. State stack array for back-button reversibility. `init()` runs once on DOMContentLoaded.
- **3D KG library:** `three.js` + `3d-force-graph`, pre-bundled to `vendor/`. NO CDN. If pre-bundle exceeds 5MB or causes init perf issues, fall back to 2D-parallax SVG and log decision.
- **No frameworks:** No React, no Vue, no Alpine. No build step. No `node_modules` (except for one-time download of three.js + 3d-force-graph; those are committed as static `vendor/*.min.js` files).
- **Files:** `index.html` + `app.js` + `vendor/*.min.js` + `briefing/` (gitignored — raw client material). One-off keyframes + non-grid rules go in inline `<style>` block in `index.html`.

## Visual style (locked W1.5 — LIGHT THEME)

Demo is an APP, not a slide. Apps live in light. Calibrated against `briefing/illustrative_view_tablet.png` (CAG reference: light grey stage, subtle dark device bezel, white surfaces, Sembcorp-style green-teal header band, amber alert strip, mono sensor metrics).

NO black backgrounds anywhere. Sembcorp green `#00A651` is the chromatic identity but used as ACCENT (chips, borders, headers, icons, status pills, severity bars), NOT as dominant fill. Stage / panes / cards all on light grey (`#F8FAFC` / `#F1F5F9`) with white card surfaces.

**Canonical palette tokens** live in SEMBCORP_SCOPE.md "## Palette tokens (locked W1.5 — LIGHT THEME)" — that is the source of truth. Do not duplicate the full table here; consult SEMBCORP_SCOPE.md before any palette change.

Quick summary of the light-theme essentials:
- Stage / panes: `#F8FAFC` / `#F1F5F9` (light blue-grey)
- Card surfaces: `#FFFFFF`
- Tablet bezel: `#1F2937` (charcoal device-like edge, NOT black, NOT green glow)
- Sembcorp brand green: `#00A651` (primary accent — headers, borders, icons, active states)
- Tablet incident header band: teal gradient `#00A5A8 → #007A8A`
- Severity AMBER: `#F59E0B` + amber-soft `#FEF3C7` for alarm strip backgrounds
- Text: deep navy `#0F1B3D` primary, slate-700/500 secondary/muted

**Tablet content area** (inside the bezel): white surfaces (`#FFFFFF`) with light-grey dividers, Sembcorp teal header band on incident card, amber `#FEF3C7` alarm strip with 4px amber left bar.

- Generous tablet spacing. Tap targets 44px min.
- Subtle borders + dividers, not heavy boxes.
- Card elevation via `--shadow-card: 0 2px 8px rgba(15,27,61,0.06)` — soft, not heavy.
- Agent-card top-edge (3px in type color) is the strongest chromatic identity cue on white background.

## Two-surface mental model (locked 2026-05-21)

The demo presents ONE product with TWO surfaces:

- **LEFT pane (tablet)** = real production app. Used by Sembcorp operators / engineers doing the work (R. Kumar / Lim Wei Jie / Dr. Ismail / P. Sundaram). Polished customer-facing UX.
- **RIGHT pane** = back-end ops console. Used by the team that MAINTAINS the agentic system + monitors performance. Observability + control. NOT used by frontline workers.

Decouple "sausage making" (right) from "doing your job" (left). Design implications:

- Tablet content reads as a real product — generous spacing, branded headers, polished CTAs, clear action affordances
- Right pane reads as an ops console — tools behind toggle buttons, draggable inspection windows, collapsible audit trails, technical labels OK
- Whole screen = front-end of a single product demo. The story: "we built BOTH the work app AND the agent ops console — same product, two audiences."

The Workflow Agent (added W3.4) embodies the learning narrative: as each persona resolves the incident, the agent captures the workflow trace + SOP adherence + deviations. After the full incident is resolved, traces route to a process engineer who reviews:

- Is the standard operating procedure correct?
- Should a new SOP be recommended (people are working around the procedure)?
- Are there efficiency or safety improvement opportunities?

This is the meta-learning loop: the app learns HOW Sembcorp actually works, not just whether the equipment is healthy.

## Canonical demo scenario (locked — W3.9 pivot)

**Incident:** `JRG-CCGT-1 · Block 2 · BFP-3A` — vibration RMS on NDE bearing housing exceeds ISO 10816-7 Zone C alarm threshold (8.4 mm/s vs 7.1 mm/s). Date stamp `INC-2026-0537 · 02:47 SGT`. Severity **AMBER**.

**Asset chain (KG-traced cascade):**
`BFP-3A → HRSG-3 → ST-3 → GENERATOR-3 → TRANSFORMER-3 → SWITCHYARD-A`

**Hyperspace diagnosis (presented to Faye Sit):**
NDE bearing race spalling (early-stage). 78% confidence. Pattern-matched against 3 prior BFP bearing failures across the Sembcorp fleet (Jurong-CCGT-2 / Sakra-CCGT-1 / Banyan-CHP).

**Alternatives surfaced (view-only):**
- Shaft misalignment · 52%
- Coupling wear · 31%
- Impeller imbalance · 19%

**Actual root cause (W4 reveal — DO NOT spoil in P1/P2/P3 broadcast):**
Bent shaft on BFP-3A. Lim discovers via dial-indicator runout test during onsite inspection. Offsite senior engineer (Dr. A. Ismail) confirms via remote vibration phase analysis (1×RPM dominant + ~180° NDE-DE phase shift = textbook bent shaft signature).

**Operational impact:**
BFP-3A trip risk → HRSG-3 feedwater starvation → ST-3 derate ~50 MW. PSO commitment window 09:00–18:00 SGT affected. Revenue at risk ~SGD 2.4M (50 MW × 4h × SGD 120/MWh peak — illustrative). Action required within 45 min.

**Resolution arc:**
1. **Faye (P1)** verifies metrics + dispatches Lim onsite (W3.9).
2. **Lim (P2)** follows BFP vibration SOP + safety procedures + dial-indicator runout test → discovers shaft bow (W4).
3. **Lim (P2)** calls offsite senior engineer (Dr. A. Ismail) for remote confirmation — phase analysis seals diagnosis (W4).
4. **Asset Perf (P4)** long-term WO + revenue protection writeback (W5 / W7).

## 4-persona workflow (locked)

Same canonical incident flows through 4 personas. Personas panel is an EXTERNAL white card ABOVE the tablet (NOT inside the bezel — W1.5 lock) showing 4 tiles. Active = full color; greyed = handed off / not yet active. Each persona's tablet view is CURATED to their role. See SEMBCORP_SCOPE.md "4-Persona workflow" table for the full handoff contract.

| # | Persona | Engineer | Tablet view essence |
|---|---|---|---|
| 1 | Ops Control Tower | R. Kumar | Incident detection + cross-asset visibility + triage. Hands off to Onsite. |
| 2 | Onsite Eng / Maint | Lim Wei Jie | Mobile-style step-by-step guidance. On-site verification. Immediate remediation. Hands off to Offsite. |
| 3 | Offsite Expert | Dr. A. Ismail | Diagnosis confirmation + WO pre-fill + remediation approval + risk escalation. Hands off to Asset Perf. |
| 4 | Asset Perf Analyst | Priya Sundaram | P&L impact dashboard. Validates financial impact. Writes correction back into KG. Loop closes. |

## Out of scope (DO NOT BUILD)

- No real LLM calls or real agent execution. All "agent work" is scripted animation.
- No real KG database. Hardcoded JSON file describing ~30-40 nodes.
- No user-editable demo paths. Single canonical happy path through all 4 personas.
- No override / disagree workflow on diagnosis (CAG had this; Sembcorp skips for scope).
- No login / auth screens.
- No mobile responsive layout — desktop viewport only (full `100vw × 100vh`, projector at the meeting).
- No multi-incident dashboard — single canonical Jurong-CCGT-1 BFP-3A incident.
- No state machine library, no React, no Vue.
- No tests, no CI, no documentation files beyond this CLAUDE.md + SEMBCORP_SCOPE.md.

## Demo flow (canonical)

1. **Open** — Hyperspace OS tablet view shows Ops Control Tower dashboard with `JRG-CCGT-1 · BFP-3A` incident already detected, AMBER severity, `TRIAGE READY` pill. Right pane Agent View: Orchestrator idle, all reasoning + critic agents idle.
2. **Triage** — Faye clicks the header → Sensor Anomaly Inspector + Turbine Diagnostic Agent + Power Gen Critic fire in right pane. Faye clicks the AMBER row → 2-stage loading theater (Inspection at t=0 → Summary report at t=5s with Triage placeholder → diagnosis hypothesis + alternates + HITL pill at t=10s). Hypothesis: NDE bearing race spalling, 78% confidence. Hands off to Onsite.
3. **Onsite** — Persona strip greys Ops, activates Onsite. Tablet re-renders for Lim Wei Jie. BFP Maintenance Playbook Agent dispatches (Sulzer BFP procedure). Critic validates. Onsite engineer ticks verification steps + initiates immediate remediation (W4 reveals bent-shaft actual root cause via dial-indicator runout test). Hands off to Offsite.
4. **Offsite** — Persona strip handoff. Tablet re-renders for Dr. A. Ismail (Offsite Expert). Senior engineer confirms bent-shaft via remote vibration phase analysis. Long-term WO pre-fill surfaces. HSE Risk Validator + P&L Impact Validator run. Offsite approves WO + escalation memo. Hands off to Asset Perf.
5. **Asset Perf** — Persona strip handoff. Tablet re-renders for Priya Sundaram. P&L dashboard surfaces. $X revenue protected. Learning Engine activates: correction writes back to KG (visible as new green node appearing on L3 bearing-spalling / bent-shaft pattern). Learning Flywheel completes step 5/5.
6. **Close** — "Next decision sharper" beat lands. Demo ends.

## When in doubt

- Ask user before scope expansion
- Surface running state, don't just claim "done"
- Stop at the checkpoint, not "near" the checkpoint
- Use canonical Sembcorp / P&U vocab, not invented
- Keep the demo offline-safe (no CDN at demo time)
- Diagnose before fix when bugs reproduce after claimed fixes
- The 6 ITP attendees will pattern-match every detail — vendor names, standards, asset IDs, sensor units must be exact
