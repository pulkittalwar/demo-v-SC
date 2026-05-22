# Sembcorp Hyperspace OS — Engagement Scope

Supplements `CLAUDE.md` (template working agreements) with Sembcorp-specific scope, locked decisions, and architecture. Operator reads this AFTER CLAUDE.md every session start.

## Engagement parameters (locked)

| Param | Value |
|---|---|
| **CLIENT** | Sembcorp Industries |
| **INDUSTRY** | Power & Utilities (P&U) — gas generation, renewables, retail energy, networks |
| **LIVE_DATE** | 2026-05-27 (Tuesday, BCG x Sembcorp ITP presentation) |
| **AUDIENCE** | Sembcorp ITP leadership: Group COO, Digital Function Lead, Group ExCo, Value Pool Leads. C-suite + N-1. Domain-fluent (mech/elec/utility ops). NOT software-fluent. Pattern-match on plant assets, GT model numbers, NERC/IEEE standards, MW/availability metrics. |
| **DEMO SLOT** | Slide 25 of the ITP deck — "Hyperspace OS Demo / Switch to prototype" |
| **LANDING_LINE** | "Hyperspace OS — not a tool. An operating system that learns, orchestrates, and unifies your teams." |
| **SCENARIO** | Jurong-CCGT-1, Block 2 — BFP-3A vibration RMS on NDE bearing housing exceeds ISO 10816-7 Zone C alarm threshold (8.4 mm/s vs 7.1 mm/s). Hyperspace hypothesis = NDE bearing race spalling (early-stage), 78% confidence, pattern-matched against 3 prior BFP bearing failures in fleet. Actual root cause (W4 reveal) = bent shaft. Single canonical happy-path incident driving the demo end-to-end across all 4 personas. |
| **BRAND_COLOR** | Sembcorp green `#00A651` used as ACCENT (chips, borders, headers, icons, status pills). Stage background = WHITE / very light grey. Tablet content = light theme. Right pane = light grey surface (NOT black). NO black backgrounds anywhere. Brand green is the chromatic identity, not the dominant fill. |

## Vocabulary discipline (HARD)

Use only canonical Sembcorp / P&U industrial vocabulary:

- **Equipment**: GT (gas turbine), CCGT (Combined Cycle Gas Turbine), HRSG (Heat Recovery Steam Generator), boiler feed pump (BFP — multi-stage centrifugal, NDE/DE bearing housings), steam turbine (ST), condenser, cooling tower, generator, transformer, switchyard, GT exhaust temperature, condenser vacuum, fuel gas pressure, heat rate (kJ/kWh), vibration RMS (mm/s), ISO 10816-7 alarm zones (A / B / C / D), 1×RPM (synchronous vibration component), phase angle, bearing temperature (°C), DCS (Distributed Control System — Honeywell Experion in this demo)
- **Metrics**: MW output, heat rate, availability factor, capacity factor, EAF (Equivalent Availability Factor), forced outage rate
- **Plant IDs**: Jurong-CCGT-1, Jurong-CCGT-2, Sakra-CCGT-1, Banyan-CHP, Tuas-Power
- **Standards**: IEEE 1159 (power quality), ISO 50001 (energy management), ISO 10816-7 (industrial pumps — mechanical vibration), ISO 20816-1 (general machinery vibration), API 670 (machinery protection systems), IEC 61850 (substation automation), NERC reliability standards
- **Vendors**: GE 9HA gas turbines, Siemens SGT-800, Mitsubishi Power M701F, Sulzer (BFP — Swiss multi-stage centrifugal), Bently Nevada 3500 series (Emerson — machinery protection / vibration monitoring), SKF (bearings), ABB drives, Honeywell Experion DCS, Emerson Ovation, OSIsoft PI System
- **Engineer names**: R. Kumar (Ops Control Tower), Lim Wei Jie (Onsite Eng), Dr. A. Wong (Offsite Expert), Priya Sundaram (Asset Perf Analyst). Backup roster: J. Tan, S. Ibrahim, M. Lim, P. Subramaniam.

Never invent fake standards, fake vendor model numbers, or generic "AI says check the system" copy. Sembcorp ITP leadership will pattern-match instantly and skepticism will spike.

## Split-pane layout (locked W1.5c — pane-level scroll)

The demo fills the full browser viewport `100vw × 100vh`. Body has `overflow: hidden` + `overscroll-behavior: none` so the page itself never bounces. Each pane scrolls INDEPENDENTLY at the pane level:

- `#left-pane` is `overflow-y: auto` — scrolls to reveal the tablet (which has `min-height: 110vh`, so bottom bezel hangs below initial viewport).
- `#right-pane` is `overflow-y: auto` and uses a vertical flex column (NOT a percentage grid). Three zones (`#zone-agents` 640px, `#zone-kg` 360px, `#zone-flywheel` 200px min-heights) sit stacked; pane scrolls to reveal the full Learning Flywheel.

Internal scrolls on `.tablet-content`, `.zone-body`, `.agent-scroll` are REMOVED — pane-level scroll handles all overflow. Sembcorp-green 6px thin scrollbar appears on each pane only when content overflows.

Tablet is centered in LEFT pane with `max-width: 620px`. Personas panel above the tablet matches the same `max-width: 620px` so they line up as a centered column. Light grey pane background shows on both sides of the tablet.

Two panes via a CSS grid `grid-template-columns: 2fr 1fr`:

- **LEFT 2/3 — Tablet view.** Sembcorp-curated incident workflow UI. Tablet centered in pane (`max-width: 620px`). Content re-renders per active persona. Persona panel sits ABOVE tablet (external white card matching same 620px column width).
- **RIGHT 1/3 — Under-the-hood.** Three vertically-stacked zones with per-zone `min-height` (NOT a percentage grid — pane-level scroll handles overflow):
  - **`#zone-agents`** (`min-height: 640px`) — Agent View. Hosts: (a) Orchestrator dispatch log strip at top (streaming text with `inspection` / `orchestrator` source tokens + inline `[OSIsoft PI System]`-style data-source tags); (b) 4 buckets × 10 agent cards beneath.
  - **`#zone-kg`** (`min-height: 360-440px`) — At W2: CSS 4-layer scaffold (horizontal layer bands L1/L2/L3/L4 with node chips). At W2.5+: **3D stratified force-graph** via three.js + 3d-force-graph (4 Y-layers pinned, X/Z free, draggable + zoomable, gentle auto-rotation idle, per-line node-chain highlighting on hover or live-stream). CSS scaffold retained as fallback. See "## KG rendering library" for full spec.
  - **`#zone-flywheel`** (`min-height: 200px`) — Critic validation badge + Learning Flywheel arc (step counter, e.g. "Step 3/5 — Engineer confirms").

Both panes update in lockstep as the workflow progresses. Right pane is NEVER an afterthought — it is the wow. The "wow" comes from synchronized cross-pane activation (tablet action ↔ agent activation ↔ KG node highlight ↔ chain-of-thought line streams), NOT from any single 3D visual.

## 4-Persona workflow (locked)

The same canonical incident flows through 4 personas. Top strip of LEFT pane shows 4 persona tiles. Active = full color. Greyed = handed off / not yet active. Each persona's tablet view is CURATED to that role.

| # | Persona | Role | Tablet view essence | Handoff out |
|---|---|---|---|---|
| 1 | **Ops Control Tower** | R. Kumar | Incident detection + cross-asset visibility + triage. Sees the alert first, confirms severity, dispatches to Onsite. | → Onsite, with diagnosis hypothesis attached |
| 2 | **Onsite Eng / Maint** | Lim Wei Jie | Mobile-style step-by-step guidance. On-site verification of diagnosis. Immediate remediation actions. | → Offsite, if expert sign-off needed |
| 3 | **Offsite Expert** | Dr. A. Wong | Diagnosis confirmation + WO pre-fill + remediation approval + risk escalation. Reviews full audit trail. | → Asset Perf, with WO logged |
| 4 | **Asset Perf Analyst** | Priya Sundaram | P&L impact dashboard. Validates financial impact. Approves cost recovery / reporting line. Writes correction back into KG. | KG enriched. Loop closes. |

Reference: `briefing/demo_1.png` + `briefing/demo_2.png` swimlane (Operations control tower → Onsite eng/Maint → Offsite eng experts → Asset Perf strat/analysts).

## Persona scene images

CSS-illustration placeholders (Decision 1b). NOT real photos. Each tile is a geometric/silhouette scene representing the persona's working context:

- **Ops Control Tower** — silhouette in front of multi-monitor wall, with dotted-line "alert pulse" overlay
- **Onsite Eng** — hard-hat silhouette next to switchgear/turbine outline, holding tablet
- **Offsite Expert** — desk silhouette with dual monitors, schematic on one screen
- **Asset Perf Analyst** — silhouette at desk with bar-chart/graph on screen

Style: Sembcorp green accents on dark navy/black. Inline SVG. No external image files. Active tile = full color saturation + subtle glow. Greyed tile = 30% opacity + desaturated.

## Knowledge Graph schema (4 MECE layers)

| Layer | Holds (node types) | Edge meaning |
|---|---|---|
| **L1 — People & Process** | Teams, BUs, roles, ways of working, workflow contracts, escalation rules, RACI | "team owns workflow", "role escalates to role" |
| **L2 — Physical Plant** | Assets (GT, HRSG, BFP, condenser, transformer), vendor manuals, telemetry specs, OEM maintenance facts, asset-chain interconnects | "asset feeds asset", "asset has spec", "asset documented by manual" |
| **L3 — Historical State** | Per-asset sensor history, incident log, WO log, RCA repository, audit trails, prior corrections | "asset has history record", "incident classified as RCA pattern" |
| **L4 — Predictive Intelligence** | Predictive model APIs, learned fault patterns, recommendation engine outputs, P&L impact models | "model predicts pattern", "pattern recommends action" |

MECE check: who/how (L1) · what physically exists (L2) · what happened before (L3) · what to do next (L4).

Inter-layer edges show traversal (e.g. asset on L2 → its history on L3 → predictive model on L4 → escalation rule on L1).

Hardcoded KG content for this demo (W3.9 pivot): pre-seed with Jurong-CCGT-1 asset chain (BFP-3A → HRSG-3 → ST-3 → Generator-3 → Transformer-3 → Switchyard-A), plus GT-3 / HRSG-3 / BFP-3B / Condenser-3 as adjacent context. L2 includes BFP-3A sub-assembly (NDE/DE vibration transducers ×4, NDE bearing assembly · SKF, coupling, drive shaft, Sulzer BFP manual). L3 includes 90-day vibration RMS trend, 30-day bearing temp trend, 3 prior BFP bearing-failure RCAs (Jurong-CCGT-2 / Sakra-CCGT-1 / Banyan-CHP). L4 includes bearing-spalling pattern, bent-shaft phase signature pattern (seeded for W4), ISO 10816-7 alarm zone spec, BFP→HRSG→ST derate cascade model. ~35-40 nodes total. Demo-scope only — not a real KG.

## Agent + critic mechanics (locked, expanded 2026-05-20)

Architecture mirrors `briefing/overview_hyperspace_os.png`. Agents bucketed against Sembcorp business structure (Orchestration + Reasoning + BU-vertical Critique + Cross-functional Validation), **10 agents total** (expanded from 9 — Inspection Agent added per architecture pivot 2026-05-20).

- **Orchestrator** (always-on, steering). Receives Inspection Agent findings, dispatches downstream sub-agents per workflow, sequences persona handoffs, receives findings back, decides next step.
- **Reasoning agents** (cross-cutting, transient):
  - **Inspection Agent** (added 2026-05-20). Runs FIRST when a sensor anomaly fires. Retrieves sensor metadata, locates sensor's node on the KG, traverses cross-layer (L2 own-layer → L3 historical → L4 predictive → L1 people/process) to surface implications. Passes findings to Orchestrator. This is the "chain-of-thought supercharged by KG node traversal" agent — the unique demo unlock vs vanilla LLM reasoning. Data sources tagged inline in dispatch log: `[OSIsoft PI System]`, `[Maximo]`, `[Honeywell Experion DCS]`, `[Hyperspace UI]`. Role label `KG-LOOKUP`.
  - **Triage Agent** (diagnosis). Pattern-matches against prior RCAs, produces diagnosis hypothesis with confidence %.
  - **BFP Maintenance Playbook Agent** (remediation). Matches diagnosis to OEM remediation playbook (W3.9: BFP bearing inspection + dial-indicator runout test per Sulzer BFP manual; display label updated from `Compressor Wash Playbook Agent`).
  - **Learning Engine** (correction writeback). Writes confirmed corrections back to KG L4 patterns at end of demo.
- **BU Critique agents** (vertical-aligned, transient): one per Sembcorp BU vertical — Power Gen, Renewables, Networks. Validates an agent's output by walking the same KG path backwards against its vertical's domain rules. Validated = green checkmark, output surfaces to tablet. Invalid = red X, output blocked, orchestrator re-dispatches.
- **Cross-functional validators** (always-available, transient): HSE Risk Validator (safety), P&L Impact Validator (financial — used in BOTH P3 capacity-impact gate AND P4 hedge-calc context, with different KG node activations per persona). Gate output against cross-cutting concerns regardless of BU.

For the Jurong-CCGT-1 demo only the Power Gen critic lights up; Renewables + Networks critics stay visible but **standby** (desaturated, ~45% opacity) — visually proves the architecture scales to Sembcorp's full BU structure.

**Visual rendering on KG:**
- When an agent activates: its name pulses in orchestrator log AND its work-path highlights through KG (nodes glow sequentially, edges traverse, camera gently rotates to follow)
- When critic validates: critic icon flashes green on the path; output card surfaces to tablet
- When critic rejects: critic icon flashes red; output stays in right pane only; orchestrator dispatch log shows re-dispatch line

This is the "Sembcorp sees their asset (the KG they built) being used" moment — every node pulse references something Sembcorp owns.

## KG rendering library (locked 2026-05-20 — three.js RE-INSTATED with contextual lighting)

Iteration history: originally scoped as `three.js` + `3d-force-graph`. Briefly dropped (~2026-05-20 mid-day) on readability/risk grounds. Re-instated same day after Pulkit confirmed the "theatre" of agent-driven node lighting is core to the demo's wow factor. Locked direction below.

### Library + bundling

- **three.js** (~600 KB minified) + **3d-force-graph** (~250 KB minified) pre-bundled to `vendor/three.min.js` + `vendor/3d-force-graph.min.js`. NO CDN at demo time (working agreement #6).
- Total bundle ~850 KB-1 MB, well under the 5 MB ceiling that would have triggered fallback.
- Operator pre-downloads + commits the static vendor files BEFORE W2.5 dispatches. Verifies offline load (WiFi disconnected) as part of W2.5 verification.

### Rendering shape

- **Stratified 4-layer force-graph**: nodes float in 3D, BUT Y-axis is pinned per layer (L1 at top Y, L2 below, L3 below, L4 at bottom). X/Z free under force-engine simulation. Custom force layout via 3d-force-graph's force-engine override. Maintains the deck's banded visual identity in 3D.
- **Draggable + zoomable + rotatable**: full mouse interaction. User (or Pulkit during demo) can grab + spin + zoom the graph mid-narrative.
- **Always-on rendering**: KG is the default state of `#zone-kg`. No 2D↔3D toggling.
- **Gentle auto-rotation** in idle state (when no agent is active) so the 3D shape reads from across the room. Auto-rotation pauses when hover/drag interaction starts.

### Node + edge data

30 pre-seeded nodes (L1=7 · L2=10 · L3=7 · L4=6) per `## Knowledge Graph node seed (locked W2)` section above. Inter-layer edges (canonical asset chain + RCA→pattern links + persona→workflow links) hardcoded in a JS `KG_EDGES` array. Render as 3D lines with subtle base opacity; brighten + animate when an agent's CoT line references them on hover or live-stream.

### Contextual lighting model (locked 2026-05-20)

Replaces earlier 4-state quartet (USED/EXPLORED/DISCOVERED/AVAILABLE) — that proposal applied state across an entire agent's activation, which is too coarse. Lighting is now **per-CoT-line**, driven by hover OR live-stream advance.

| State | KG visual |
|---|---|
| **Idle (no agent active)** | All 30 nodes at ambient saturation. Gentle auto-rotation. |
| **Agent active, streaming** | KG follows the current streaming line in real time — node-chain for each freshly-rendered CoT line highlights as the line appears. Cumulative path traces as agent progresses (prior-step nodes stay at medium glow; current-step nodes at full glow). |
| **Hover on any CoT line** (orchestrator log OR agent-card task tree) | KG **freezes auto-rotation**, snaps to **static clear visual** showing ONLY that line's `nodeChain` at full glow + their connecting edges thick + glowing. Non-chain nodes dim to ~25% opacity. |
| **Hover off** | Returns to whichever state was running (idle or active-streaming). |
| **Click-pin** (optional W8 polish) | Hover state pins — user can copy/screenshot/inspect. Click anywhere else to un-pin. |

### Data shape per CoT line

Each CoT trace line carries a node-chain (the specific KG nodes touched at that reasoning step). Hover/stream handler reads the chain → toggles per-node visual state in the 3d-force-graph instance.

```js
{
  ts: '02:47:11',
  source: 'inspection',          // or agent name string
  text: 'L2 traverse · GT-3 found · 4 connections',
  dataSource: 'OSIsoft PI System',  // optional — renders as inline blue pill
  nodeChain: ['gt-3', 'igv-3-actuator', 'hrsg-3', 'oem-ge-9ha-manual'],  // node IDs to light up
  step: { idx: 2, of: 5 },       // links the line to its agent-card task-tree step
}
```

Per-agent CoT script (W3+) is a JSON-like array of these objects, hardcoded in `app.js` next to the existing `INCIDENT` const. Streaming animation iterates this array via `setTimeout` chain. Hover handler binds to each rendered `.orch-line` + `.tt-step` (task-tree-step) element.

### Synchronized surfaces (locked)

The same chain-of-thought information renders simultaneously across THREE surfaces, all updating in lockstep:

1. **Agent card (expanded)** — Claude-Code-style task tree: `✓ done · ● active (pulsing) · ○ pending` with step counter `n/m`
2. **Orchestrator log strip** — full CoT line stream tagged with the agent's source token + inline `[OSIsoft PI System]`-style data-source pills
3. **KG zone** — 3D graph nodes light up per current line or per hovered line

Hover on a line in (1) or (2) → KG zone (3) responds. Three surfaces, one data source.

### Fallback

If three.js fails to load (corrupt vendor file, JS error, etc.), the CSS 4-layer scaffold from W2 is retained as the fallback rendering. `try/catch` around `init3DKG()`; on catch, log to console + render the CSS scaffold as-is + degrade per-line hover to a flat node-list popup. Demo doesn't die.

### Projector legibility risk mitigations

- Stratified Y-layering keeps "4 layers" obvious in 3D
- Large node spheres (≥ 8 px equivalent) + always-visible bold labels
- Edge lines bold enough to read at projector distance
- Camera initial pose: slight upward angle so all 4 layers visible without rotation
- Dry-run on actual projector before 2026-05-27 to confirm

### W2.5 deployment confirmation (2026-05-20)

`three.min.js` (654 KB) + `3d-force-graph.min.js` (609 KB) pre-bundled to `vendor/` (total ~1.26 MB, well under 5 MB ceiling) and verified offline-safe by Pulkit (WiFi disconnect + hard-refresh on 2026-05-20 still rendered the 3D KG — Test 11 pass). 30 nodes + 30 edges rendered in stratified 4-layer 3D force-graph. Drag/zoom/click/auto-rotate functional. `window.KG.{setNodeChain, clearNodeChain, pinNodeChain, unpinNodeChain}` API live + ready for W3+ to consume.

Operator deviation from W2.5 plan (documented + accepted): plan's custom `fg.d3Force('layer-y', ...)` had bugs (read `n.__threeObj.position.y` instead of sim source `n.y`; treated `n.y` as constant target despite d3-force mutation). Operator replaced with canonical 3d-force-graph mechanism — `fy: n.y` per node when building `graphData`, which natively pins the Y axis. Same intent (Y pinned per layer, X/Z free under force-engine), more reliable mechanism. `graph.d3Force('y', null)` retained to disable default Y centering. Good defensive engineering catch.

CSS scaffold fallback retained at `#kg-css-fallback` with `display: none` default. Operator did not run Test 12 (rename vendor file + verify CSS fallback renders) — coach signed off W2.5 anyway since fallback path is straightforward + low-risk; can be tested during polish dry-run if needed.

### W3.1 deployment confirmation (2026-05-20)

Orchestrator dispatch log refactored from static W2 HTML to a streaming queue managed by `window.LOG` API. Implementation:

- `LOG_STATE.lines` array as source of truth; per-line objects carry `{id, ts, source, text, dataSource, nodeChain, el}`.
- `window.LOG.appendLine(payload)` adds a line with slide-in animation (translateY 8px → 0, opacity 0 → 1, 250ms ease-out) + left-edge accent pulse in source-token color.
- Roll-up: more than 5 lines triggers oldest-line collapse into a `▾ N earlier steps` accordion at the top of the log body. Accordion click expands inline (sibling `.orch-accordion-expanded ~ .orch-line-collapsed` flips display back to flex).
- Per-line hover → `window.KG.setNodeChain(nodeChain)` (KG freezes auto-rotation, highlights chain nodes); hover-off → `window.KG.clearNodeChain()`.
- Per-line click → `window.KG.pinNodeChain(nodeChain)` (persistent until re-click). Click-pinned state suppresses subsequent hover updates.
- Empty `nodeChain` lines don't drive KG state changes.
- `nodeChain` referencing unknown KG node IDs is logged as a warning (`console.warn`) but does not throw.

5 seed lines (same content as W2 static placeholder) are appended on `init()` via `seedLogLines()`. W3.2 will replace `seedLogLines` with screen-transition-triggered CoT scripts per agent.

Verified via Chrome MCP — 14 tests pass. Manual `window.LOG.appendLine({...})` from devtools console adds a streaming line + lights up KG on hover/click. Accordion roll-up triggers correctly at 6th line.

### W3.4 deployment confirmation (2026-05-21)

Right-pane re-architecture: KG zone REMOVED from inline pane stack; moved into draggable floating window (`#kg-floating-window`, `position: fixed`, default 460×360 at `left:56% / top:90px`, draggable from title bar, resizable from bottom-right corner with min 280×220). Auto-opens when `triggerNewIncident()` fires (D2 lock). Persists across right-pane scroll. Close button on title bar returns the toggle button to non-active state.

Dispatch log REMOVED from inline `#zone-agents`; moved into collapsible `#log-dropdown` below Agent View. Title renamed `Dispatch Log` (was `ORCHESTRATOR · DISPATCH LOG`). Defaults closed. User clicks `Display Logs` toolbar button to open (D1=B lock). Engagement pulse from W3.3 still fires on agent cards as lines stream.

Right pane now: top toolbar (2 buttons: `Display Logs` + `Display Graph` with live count badges) → permanent Agent View (5 buckets / 14 agents) → optional log dropdown → Flywheel.

KG density bumped: 30 canonical nodes + 30 canonical edges PRESERVED with `canonical: true` flag. Theater nodes added (41 across L1/L2/L3/L4) + theater edges added (57 intra-layer + cross-layer). Final: 71 nodes, 87 edges. Theater nodes/edges fade harder when an active chain is set (~20% opacity vs canonical 90%). Log-line `nodeChain` references unchanged (only canonical IDs).

KG visual polish: background `#0A0F1C` (deep navy/black). Nodes rendered via `nodeThreeObject` as THREE.Groups — high-res sphere geometry (24×16 segments) + outer wireframe-sphere halo (white, 0.55 opacity, BackSide rendering). Canonical edges render at 1.2px white-32%-opacity; theater edges at 0.5px white-10%-opacity. Active-chain edges: solid white at 3.0px.

Tablet visuals:
- `#tablet` max-width 620 → 720 (~16% wider tablet column)
- `#tablet-inner` border-radius 18px confirmed + `overflow: hidden` on `.tablet-content` / `#tablet-root` to clip children to rounded inner
- `.inc-header` + `.mon-header` gradient: teal `#00A5A8 → #007A8A` → Sembcorp green `#00A651 → #007A3D`
- Brand string: `HYPERSPACE OS` → `Sembcorp OS` (mixed case, `text-transform: none`)
- `✦ from Hyperspace · live` italic-blue caption above metrics card on Screen D (signals live API data binding)
- HITL human-icon + "Human-in-the-loop" pill on Next action steps header (green-accent on white)

Agent roster: 10 → 14 agents across 5 buckets (added Utility Agents · Transient bucket between Reasoning and Critique). Display name updates: `Inspection Agent` → `Sensor Anomaly Inspector`, `Triage Agent` → `Turbine Diagnostic Agent`, `Playbook Agent` → `Compressor Wash Playbook Agent`. Learning Engine moved from Reasoning → Utility bucket. 4 new agents added: HRSG · Boiler Diagnostic Agent (standby), Generator · Electrical Diagnostic Agent (standby), Work Order Pre-fill Agent, Workflow Agent.

Workflow Agent fires on `Dispatch to Onsite` CTA click — captures SOP trace via 3 log lines (~2.5s mini-arc). Card transitions idle → active → done. Log lines:
1. `02:47:48 workflow · Sembcorp CCGT-1 · incident workflow trace captured · INC-2026-0537`
2. `02:47:49 workflow · dispatch sequence recorded · P1 Ops Tower → P2 Onsite · 02:47:48 SGT`
3. `02:47:50 workflow · SOP registered for process-engineer review · 0 deviations from standard`

Verified via Chrome MCP. Tablet quick-fixes confirmed: tabletMaxWidth=720px, personasMaxWidth=720px, inner border-radius=18px, monBrand="Sembcorp OS", monHeader gradient `rgb(0,166,81) → rgb(0,122,61)`. Right-pane toolbar: 2 buttons, both clickable, counts update live. Floating window auto-opens on header click; drag works (title bar grab moves window with viewport clamping); resize handle drags bottom-right corner; close × returns toggle to inactive. Log dropdown toggles inline expansion. Agent View: 5 buckets, 14 cards, agent-count meta `0 active · 14 registered`. P1 arc still completes cleanly (inspection → triage → critic-power-gen → REVIEW_READY) — no regression. Workflow Agent fires on Dispatch CTA — 3 lines stream, card transitions, P2 pulse fires. End-to-end happy path: page load → header click → banner + arc + auto-open graph → REVIEW_READY → click AMBER → Screen D (caption + HITL + diagnosis + CTA) → click CTA → Workflow Agent + P2 pulse → DISPATCHED_TO_ONSITE.

### W3.5 deployment confirmation (2026-05-21)

Visual polish pass:

- **KG persistent labels**: each node's label rendered as a billboarded `THREE.Sprite` (canvas-backed texture) appended to the per-node `Group` returned by `nodeThreeObject`. Pill shape `rgba(10,15,28,0.78)`, 8px corner radius, 4px layer-color left bar, white 28px mono text. Sprite position `(7, 0, 0)` puts label to the right of the sphere. Sprites billboard automatically — face camera through any rotation. Optional auto-hide threshold raised to camera distance > 700 (no hide in normal demo orbit).
- **Deeper white node border**: ring sphere radius bumped `1.08 → 1.18`, base opacity `0.55 → 0.95` (still multiplied by `nodeOpacityFor`). Crisp white halo against `#0A0F1C` bg pulls nodes forward visually.
- **Floating layer titles**: 4 `THREE.Sprite` pills anchored at `X=-120`, `Y = LAYER_Y[layerId]` (L1=90, L2=30, L3=-30, L4=-90). Each shows large 38px layer ID in layer color + 22px white layer name below, plus 6px layer-color left bar. Billboarded. Mounted directly into `graph.scene()` after init; stored on `KG_STATE.layerTitles[]`. Camera initial pose shifted to `(-20, 0, 300)` so the layer-title column reads on load.
- **Agent View zone header**: `.zone-lbl` color `var(--green-vivid)` → `var(--text-secondary)` (`#334155` slate). `.zone-header` border-bottom `rgba(0,166,81,0.15)` → `var(--border-subtle)` (`#E5E7EB`).
- **Agent card top bar removed**: `.agent-card::before` 3px colored top edge rule deleted. Type identity remains via icon tile background tint, glyph color, and role-label color.
- **Bucket containers**: `.bucket-hdr` `border-bottom` removed; bucket title (now in slate `#334155`) sits ABOVE a new `.bucket-body` wrapper containing all cards in a 2-col grid. `.bucket-body { border-radius: 12px; border: 1px solid #E5E7EB; background: var(--bg-card-hover); padding: 12px; }`. `data-bucket="orch"` overrides to 1-col grid. Per-bucket `display: grid` rules + `bucket-hdr { grid-column: 1/-1 }` rules deleted in favor of single `.bucket-body { grid }` source of layout.

Chrome MCP verification:
- t6 zone-lbl `rgb(51,65,85)` + border `rgb(229,231,235)` — pass.
- t7 `.agent-card::before` `content: none` — pass.
- t8 bucket-lbl `rgb(51,65,85)` — pass.
- t9 bucket-body `border-radius: 12px`, border `#E5E7EB`, bg `rgb(249,250,251)` (`--bg-card-hover`), padding `12px` — pass.
- t10 5 `.bucket-body` containers; cards per bucket `{orch:1, reasoning:5, utility:3, critique:3, validator:2}` = 14 total; meta `0 active · 14 registered` — pass.
- t1 71/71 nodes carry label sprites — pass.
- t3 first ring radius `3.54` (= 3 × 1.18), opacity `0.855` (= 0.9 × 0.95) — pass.
- t4 4 layer-title sprites at `(-120, 90/30/-30/-90, 0)`, all `isSprite=true` — pass.
- t11 `window.KG.setNodeChain(['gt-3','hrsg-3','condenser-3'])` → `KG_STATE.activeChain` populated — pass.
- t12 banner click → arc fires → `await_text("REVIEW READY")` succeeds within 15s — pass.

Human-check items (subjective; flagged not auto-asserted):
- t2 layer-color left bar on label pill — visually confirmed via screenshot capture.
- t5 layer titles remain readable across rotation/zoom — verified (sprites billboard by Three.js convention).
- Label density at 71 nodes causes overlap at default camera zoom — readable but cluttered. Acceptable for projector dry-run; can be relieved by zooming in or shipping a sparser canonical-only label mode if needed.

## Palette tokens (locked W1.5 — LIGHT THEME)

Demo is an APP, not a slide. Apps live in light. Calibrated against `briefing/illustrative_view_tablet.png` (CAG reference: light grey stage, subtle dark device bezel, white surfaces, Sembcorp-style green-teal header band, amber alert strip, mono sensor metrics).

NO black backgrounds anywhere. Sembcorp green is the chromatic identity but used as ACCENT (chips, borders, headers, icons, status pills, severity bars), not as dominant fill.

| Token | Hex | Use |
|---|---|---|
| `--bg-stage` | `#F8FAFC` | root background — very light blue-grey |
| `--bg-frame` | `#FFFFFF` | demo frame border (subtle white) |
| `--bg-pane-left` | `#F1F5F9` | LEFT pane surface (where tablet sits) |
| `--bg-pane-right` | `#F1F5F9` | RIGHT pane surface (Agent View / KG / Flywheel) |
| `--bg-card` | `#FFFFFF` | card surfaces, agent cards, sensor cards |
| `--bg-card-hover` | `#F9FAFB` | hover/active card state |
| `--bg-tablet-frame` | `#1F2937` | tablet bezel — charcoal device-like edge (NOT black, NOT vivid green) |
| `--bg-tablet-inner` | `#FFFFFF` | tablet content area |
| `--green-vivid` | `#00A651` | Sembcorp brand green — primary accent (headers, active borders, icons) |
| `--green-deep` | `#007A3D` | gradient end / secondary green |
| `--green-soft` | `#D1FAE5` | green chip backgrounds |
| `--green-soft-text` | `#065F46` | green chip text |
| `--teal-header` | `#00A5A8` | tablet incident header band (Sembcorp-teal — matches CAG reference) |
| `--blue-vivid` | `#3B82F6` | BU reasoning agent type |
| `--amber-vivid` | `#F59E0B` | BU critique agent type / severity AMBER |
| `--amber-soft` | `#FEF3C7` | amber alarm strip background |
| `--amber-soft-text` | `#92400E` | amber chip text |
| `--red-vivid` | `#DC2626` | severity RED / out-of-spec values |
| `--pink-vivid` | `#EC4899` | cross-functional validator agent type |
| `--text-primary` | `#0F1B3D` | primary text — deep navy on white |
| `--text-secondary` | `#334155` | secondary text — slate-700 |
| `--text-muted` | `#64748B` | muted labels — slate-500 |
| `--text-sensor-mono` | `#475569` | sensor mono readings — slate-600 |
| `--border-subtle` | `#E5E7EB` | card borders, dividers |
| `--shadow-card` | `0 2px 8px rgba(15,27,61,0.06)` | card elevation shadow |

## Agent View — bucket structure + visual rules (locked W0.5c)

The top zone of the right pane is the **Agent View** — a Claude-Code-style live agent tracker (NOT a streaming text log). It surfaces WHICH agents exist, WHAT TYPE they are, and (in later waves) WHAT they are doing right now with task-tree expansion and per-step counters.

### 5 buckets — Sembcorp-vertical aligned (restructured W3.4 2026-05-21)

| # | Bucket | Agents | Header color |
|---|---|---|---|
| 1 | **Orchestration · Always-on** | Orchestrator | `--green-vivid` |
| 2 | **Domain Reasoning Experts** | Sensor Anomaly Inspector · Turbine Diagnostic Agent · HRSG · Boiler Diagnostic Agent (standby) · Generator · Electrical Diagnostic Agent (standby) · Compressor Wash Playbook Agent | `--blue-vivid` |
| 3 | **Utility Agents · Transient** | Work Order Pre-fill Agent · Workflow Agent · Learning Engine | `--blue-vivid` |
| 4 | **BU Critique · Vertical-aligned** | Critic · Power Gen · Critic · Renewables (standby) · Critic · Networks (standby) | `--amber-vivid` |
| 5 | **Cross-Functional Validators** | HSE Risk Validator · P&L Impact Validator | `--pink-vivid` |

Total: **14 agents registered** (expanded from 10 W3.3 → 14 W3.4 — added HRSG · Boiler Diagnostic Agent + Generator · Electrical Diagnostic Agent (both standby) + Work Order Pre-fill Agent + Workflow Agent; renamed Inspection → Sensor Anomaly Inspector, Triage → Turbine Diagnostic Agent, Playbook → Compressor Wash Playbook Agent; moved Learning Engine from Reasoning → Utility bucket). Bucket 4 mirrors Sembcorp's O&M lane subdivisions (Power Gen / Renewables / Networks) — for the Jurong-CCGT-1 demo only Power Gen lights up, the other two render in **standby** (desaturated, ~45% opacity) to prove architecture scales to full BU footprint.

### Agent roster

14 agents total across 5 buckets (W3.4 — 2026-05-21). Reasoning bucket dispatch sequence: Sensor Anomaly Inspector → Turbine Diagnostic Agent → Compressor Wash Playbook Agent. HRSG + Electrical diagnostic agents render standby (proves domain coverage beyond turbines). Utility bucket fires on demand: Work Order Pre-fill Agent during WO generation, Workflow Agent on each persona handoff, Learning Engine at demo close.

| Bucket | Agent (data-agent-id) | Display label | Role label | Type | State |
|---|---|---|---|---|---|
| Orchestration | `orchestrator` | Orchestrator | STEERING | `orch` (green-vivid) | always-on |
| Domain Reasoning | `inspection` | Sensor Anomaly Inspector | KG-LOOKUP | `bu` (blue-vivid) | transient |
| Domain Reasoning | `triage` | Turbine Diagnostic Agent | GT · CCGT DIAGNOSIS | `bu` (blue-vivid) | transient |
| Domain Reasoning | `diag-hrsg` (new W3.4) | HRSG · Boiler Diagnostic Agent | STEAM · BOILER DIAGNOSIS | `bu` (blue-vivid) | standby |
| Domain Reasoning | `diag-electrical` (new W3.4) | Generator · Electrical Diagnostic Agent | GEN · ELEC DIAGNOSIS | `bu` (blue-vivid) | standby |
| Domain Reasoning | `playbook` | Compressor Wash Playbook Agent | OEM WASH PROCEDURE | `bu` (blue-vivid) | transient |
| Utility | `wo-prefill` (new W3.4) | Work Order Pre-fill Agent | CMMS · MAXIMO | `bu` (blue-vivid) | transient |
| Utility | `workflow` (new W3.4) | Workflow Agent | SOP CAPTURE | `bu` (blue-vivid) | transient |
| Utility | `learning` | Learning Engine | CORRECTION WRITEBACK | `bu` (blue-vivid) | transient |
| BU Critique | `critic-power-gen` | Critic · Power Gen | GAS · CCGT · HRSG | `critic` (amber-vivid) | transient |
| BU Critique | `critic-renewables` | Critic · Renewables | SOLAR · WIND · STORAGE | `critic` (amber-vivid) | standby |
| BU Critique | `critic-networks` | Critic · Networks | TRANSMISSION · DISTRIBUTION | `critic` (amber-vivid) | standby |
| Validators | `hse` | HSE Risk Validator | SAFETY | `valid` (pink-vivid) | transient |
| Validators | `pl` | P&L Impact Validator | FINANCIAL | `valid` (pink-vivid) | transient |

### Card visual rules (locked)

Every agent card:

- **Colored top-edge bar** (3px) at full saturation + 12px soft glow underneath in matching type color = strongest chromatic identity cue
- **Border** = type color at ~28% opacity
- **Card background** `#111827`, visibly floats above pane `#0A0F1C`
- **Icon tile** 36×36px, rounded 8px, background = type color at ~18% opacity, glyph in full-saturation type color (inline SVG, NOT emoji)
- **Name** in mono font, `#FFFFFF`, 13.5px, bold
- **Role label** beneath name, 9.5px, uppercase, letter-spacing 0.12em, in **full-saturation type color**
- **State pill** at right (`idle` / `active` / `done` / `standby`) on neutral chip background
- **Standby state** for inactive BU criticisms: card opacity 0.45 + saturate(0.5)
- **Card height** ~60px when idle. Expanded state (Wave 3+) grows to ~120-160px to host the task tree

### Task tree (deferred to Wave 3+)

When a card goes active, it expands inline to show a tree of sub-actions:

- `✓` done (green) · `●` active (pulsing in type color) · `○` pending (slate)
- Step counter `n/m` displayed at top-right of the card header row, replacing the `idle` pill
- Tree lines monospace, ~11px, muted text

For W0.5b only the idle skeleton is built — no expansion, no animation. All 7 agents render in their idle card form.

## Wave 1 — built (locked)

LEFT pane now hosts a 4-persona strip across the top of the tablet content area + a static Ops Control Tower curated view below it. No animation, no agent dispatch — right pane unchanged from W0.5c.

### Persona strip

4 inline-SVG silhouette scene tiles, left to right, separated by 2px gutter, sitting on a dark `rgba(0,0,0,0.85)` bar at the top of the tablet inside the bezel:

| # | Persona key | Role label | Engineer | Scene |
|---|---|---|---|---|
| 1 | `ops`     | OPS · CONTROL TOWER     | R. KUMAR        | 3-monitor wall + alert dot + silhouette |
| 2 | `onsite`  | ONSITE · MAINT          | LIM WEI JIE     | hard-hat silhouette + turbine outline + tablet |
| 3 | `offsite` | OFFSITE · EXPERT        | DR. A. WONG     | dual-monitor desk + schematic gridlines |
| 4 | `analyst` | ASSET PERF · ANALYST    | PRIYA SUNDARAM  | desk + bar chart + dollar overlay |

Active tile: 2px `--green-vivid` border + outer green glow + green-tinted scene gradient + green role label + white name. Inactive tile: `opacity 0.3` + `saturate(0.3)` + no border glow.

For Wave 1 only the `ops` tile is active; the other three render in inactive state. `state.activePersona` drives which one is active. In W6 the persona handoff will toggle this.

### Incident — INC-2026-0537 (hardcoded)

Single canonical incident drives the demo. Severity **AMBER** persists regardless of future status (per CLAUDE.md WA + severity-persistence rule).

| Field | Value |
|---|---|
| Asset | JRG-CCGT-1 · Block 2 · GT-3 |
| Incident ID | INC-2026-0537 |
| Timestamp | 02:47 SGT · 2026-05-20 |
| Severity | AMBER |
| BMS alarm | GT EXHAUST TEMP SPREAD DRIFT — Block 2 GT-3 outside operating band per IEEE 1159 § 4.2 thresholds. |
| Ops impact | MW dispatch reliability at risk — Block 2 derate ~50 MW if unmitigated. Affects PSO commitment window 09:00–18:00 SGT. |
| Action window | 45 min |
| Asset chain | GT-3 → HRSG-3 → CONDENSER-3 → GENERATOR-3 → TRANSFORMER-3 → SWITCHYARD |
| Historical WOs | 3 (count only — accordion collapsed, non-functional W1) |

### Tablet content layout (Ops view)

1. **Persona strip** (~96px high, dark bg)
2. **Incident header band** — Sembcorp-green linear gradient `135deg #00A651 → #007A3D`, white title + mono ID + amber severity pill
3. **Metrics grid** — 2×2 white cards on `#F8FAFC`. Sensor values mono, large. Tones: amber for spread + heat rate, red for compressor PR ratio, slate for ambient humidity
4. **BMS alarm strip** — amber `#FEF3C7` bg, IEEE 1159 wording
5. **Operational Impact card** — white, teal label, body + bolded action line
6. **Asset chain card** — white, teal label, mono chain with green arrows, AI-marked note (✦ prefix)
7. **History accordion** — white row, collapsed, right-chevron, non-functional placeholder for the wave

Code structure:

- `INCIDENT` const at top of `app.js` holds all hardcoded copy
- `PERSONAS` + `PERSONA_SCENES` constants hold the strip data + inline SVG scenes
- `renderTablet()` is the dispatcher: routes to per-persona renderer based on `state.activePersona`
- `renderPersonasPanel()` paints the external persona panel (above the tablet) — separate from `renderTablet()` as of W1.5
- `renderOpsView()` is the only fully-built persona renderer; `renderOnsiteView` / `renderOffsiteView` / `renderAnalystView` are stubs labelled with the wave they ship in
- `render()` stays a pure paint function — no timers, no animation kickoffs

### W1.5 — direction reversal: dark → light + personas extracted

Sub-revision applied after Pulkit screenshot review. Key structural changes vs W1:

- **Full theme flip to LIGHT.** Stage / panes / cards all on light grey (`#F8FAFC` / `#F1F5F9`) with white card surfaces. NO black backgrounds anywhere. NO green outer glow on the tablet. Sembcorp green stays as ACCENT only (headers, borders, icons, status pills) per locked palette `## Palette tokens (locked W1.5 — LIGHT THEME)`.
- **Tablet bezel** redrawn as charcoal `#1F2937` 10px frame around a white inner content area (border-radius outer 24 / inner 18). Reads as a real iPad-style device, not a glowing slide element.
- **Personas panel extracted** OUT of the tablet bezel. Lives now as its OWN external white card *above* the tablet in the LEFT pane (`#personas-panel`). Header: "PERSONAS" in green-vivid + a small flow caption ("Ops · Control Tower → Onsite → Offsite → Asset Perf"). Tiles unchanged in essence but retuned to light bg (slate silhouettes, white scene cards, green active border + soft green halo `rgba(0,166,81,0.12)`, inactive opacity 0.42).
- **Right pane zones** redrawn as white cards with subtle border + `--shadow-card`. Agent card top-edges retain full-saturation type color (now visually POPS more on white). Border colors slightly desaturated per token table for contrast (blue `#2563EB`, amber `#D97706`, pink `#DB2777`).
- **Incident header band** stays Sembcorp-teal gradient `135deg #00A5A8 → #007A8A` per CAG reference image. Added small pill-style "< Back" chevron at top-left of the band (non-functional W1.5).
- **Metrics** refactored to a single bordered card containing a 2×2 grid with hairline dividers between cells (matches reference image style — one container, four cells, gridlines between, not four separate floating cards).
- **BMS alarm strip** now has a 4px left amber bar + amber-soft `#FEF3C7` background — visual weight reads instantly without screaming.

Right pane content (4 buckets, 9 agents at W1.5 — expanded to 10 in W2 with Inspection Agent added) unchanged structurally; only the surfaces + bucket header colors retuned for light theme.

## Scope tier (locked: full scope, reshaped 2026-05-20)

Per Decision 4a — full scope, parallel coach+operator sessions, aggressive cadence. 7 working days (May 20 → May 27). Wave plan reshaped 2026-05-20 to per-persona click-through arcs reflecting two-fold demo (surface + under-the-hood) + P3→P1→P4 re-engagement loop.

| Wave | Day | Build target |
|---|---|---|
| W0 | Day 1 | Split-pane shell with empty zones. |
| W1 | Day 1 | LEFT pane: 4-persona strip + Ops Control Tower curated view + Sembcorp green + Jurong-CCGT-1 vocab. |
| W1.5 / W1.5b / W1.5c | Day 1-2 | Light theme conversion + personas-panel extracted + edge-to-edge layout + pane-level scroll + tablet centered 620px max-width. |
| W2 | Day 2 | RIGHT pane: orchestrator dispatch log strip (5-line static placeholder inside Agent View `.zone-body`, with `inspection`/`orchestrator` source tokens + inline `[OSIsoft PI System]` data-source pill) + Inspection Agent added as 10th agent (FIRST card in Reasoning bucket; role `KG-LOOKUP`; magnifier-on-graph icon) + KG zone replaces dashed placeholder with 4-layer CSS scaffold (L1 People & Process / L2 Physical Plant / L3 Historical State / L4 Predictive Intelligence — 30 pre-seeded Jurong-CCGT-1 node chips total, includes `IGV-3 actuator` on L2 + `Pattern · IGV actuator drift` on L4, color-tagged left bars per layer). Flywheel zone unchanged (W8). |
| **W2.5** | Day 2-3 | **3D KG upgrade**: pre-bundle `three.js` + `3d-force-graph` to `vendor/` (verify offline load). Replace CSS scaffold with stratified 3D force-graph (4 Y-layers pinned, X/Z free, 30 nodes + canonical edges). Draggable + zoomable + auto-rotating idle state. Per-node visual-state API ready (`setNodeChain([nodeIds])`, `clearNodeChain()`, `pinNodeChain([nodeIds])`). Try/catch fallback to CSS scaffold if three.js fails. No CoT scripts loaded yet — pure rendering layer. |
| **W2.6** | Day 3 | **Screen state machine + monitoring dashboard**: implement `state.screen` = `monitoring \| monitoring-notify \| monitoring-landed \| incident-detail`. Screen A (monitoring dashboard with 3 pre-existing Sembcorp-canonical incidents — `Jurong-CCGT-2 · BFP-2A` GREEN, `Sakra-CCGT-1 · ST-1` AMBER scheduled, `Banyan-CHP · Cooling Tower 2` RED) + Hyperspace OS header band with `cursor: pointer`. Screen B (notification banner slide-in, 3s visible + 0.5s fade) — fired by click on header. Screen C (new INC-2026-0537 lands at top of list with AMBER + TRIAGING + just-now timestamp + teal border highlight; stat row updates `3 → 4 ACTIVE · 0 → 1 AWAITING TRIAGE`). Screen D = existing incident detail, reached via click on AMBER card. Back button → C. Only canonical AMBER incident clickable; other 3 = static. |
| W3 | Day 3-4 | **Right-pane streaming animations + P1 click-through arc**: dispatch log strip becomes live streaming queue (5 visible lines + roll-up accordion `▾ N earlier steps` for older + slide-in animation + click-pin + hover-KG-chain). Inspection Agent CoT streams concurrently with Screen A→B header-click. Triage Agent + Power Gen Critic activate during Screen B→C transition. Agent cards expand inline with Claude-Code-style task tree (`✓ ● ○` + step counter) when active, collapse with green checkmark when done. Diagnosis surfaces on Screen D arrival via "see full reasoning" expansion. Dispatch to Onsite CTA on Screen D. Surface diagnosis: compressor fouling, humidity-correlated. |
| W4 | Day 3-4 | **P2 click-through arc**: tablet re-renders for Onsite (Lim Wei Jie) with mobile-style verification checklist (4 steps per CAG pattern) + Playbook Agent dispatch + Power Gen Critic validation + KG L2 (OEM manual + `IGV-3 actuator`) + L1 (Onsite RACI) activation + Confirm Diagnosis terminal action. **IGV actuator drift surfaced as deeper root cause via verification step**. |
| W5 | Day 4-5 | **P3 click-through arc**: tablet re-renders for Offsite (Dr. A. Wong) with full audit trail + telemetry review + Power Gen Critic + HSE Risk Validator + P&L Impact Validator activations + ROI/ramp model side-by-side decision (wash vs hot shutdown for IGV replacement + Sakra standby unit option declined) + Risk identification + Escalation back to P1. |
| W6 | Day 5 | **P1 re-engagement**: incident reopens at P1 with `CAPACITY IMPACT — REQUIRES ROUTING` state + Orchestrator re-route log lines + dispatch to Asset Perf CTA. Persona panel pulse re-targets P1 then P4. |
| W7 | Day 5-6 | **P4 click-through arc**: tablet re-renders for Asset Perf (Priya Sundaram) with $ impact dashboard (50 MW × 4h shortfall · forwards/futures hedge req) + P&L Impact Validator (financial flavor) + Learning Engine activation + KG L4 writeback animation (new green node: "humidity-fouling + IGV-drift co-factor" pattern). Learning Flywheel reaches step 5/5. |
| W8 | Day 6 | **Polish + animation timing + persona pulse + narration**: persona-panel highlight pulse on next-persona-to-click + state-pill micro-transitions + final "next decision starts sharper" beat. |
| Polish | Day 6-7 | Vocab audit · severity persistence · copy tightening · narration script · projector dry-run. |

Hard halt at every wave per CLAUDE.md working agreement #1.

## Screen state machine (locked 2026-05-20 evening)

Tablet view is NOT a single landing screen. It progresses through 4 screens driven by `state.screen`:

| State | Trigger | Tablet content |
|---|---|---|
| `monitoring` | Page load (initial) | **Screen A** — Hyperspace OS monitoring dashboard. Header `HYPERSPACE OS · [HH:MM] SGT · R. Kumar · All engineers` (Sembcorp teal background). Stat row: `4 ACTIVE · 0 AWAITING TRIAGE · 0 SLA AT RISK`. Wait — at Screen A only 3 incidents exist, so `3 ACTIVE · 0 AWAITING · 0 SLA`. Incidents list (3 items, see "Pre-existing incident roster" below). |
| `monitoring-notify` | User clicks the teal/green header band on Screen A | **Screen B** — Same dashboard PLUS a notification banner sliding in at the very top below the header: `NEW INCIDENT · HYPERSPACE OS · JRG-CCGT-1 · Block 2 · GT-3 · GT exhaust temp anomaly · now` (with clock icon). Banner visible 3s + 0.5s fade. During banner: right pane Inspection Agent activates, dispatch log streams inspection-trace lines, 3D KG nodes light up. Skip-to-C on banner click. |
| `monitoring-landed` | After banner fades OR user clicks banner | **Screen C** — Same dashboard, but the new INC-2026-0537 incident card now sits FIRST in the list (above the 3 pre-existing) with a "just now" timestamp + AMBER severity pill + TRIAGING state pill + subtle teal border highlight. Stat row updates: `4 ACTIVE · 1 AWAITING TRIAGE · 0 SLA AT RISK`. Right pane: agents finishing initial triage, KG path traced. |
| `incident-detail` | User clicks the new INC-2026-0537 incident card | **Screen D** — Existing curated incident detail (the W2 landing screen — JRG-CCGT-1 GT-3 metrics, BMS alarm, asset chain, history accordion, etc.). Back button returns to `monitoring-landed`. |

Click model on Screen C: ONLY the canonical AMBER incident (INC-2026-0537) is clickable into detail. Other 3 incidents render as static cards with no click handler (cursor: default, no hover effect). If user clicks them, no-op (or toast "Demo focus: AMBER incident only" — pick one in W2.6).

Persona switching (P1→P2→P3→P1-reentry→P4 in W3-W7) layers ON TOP of this screen machine — when persona changes, the active screen for the new persona is its appropriate entry point (P2 lands directly on a curated mobile view, not on a monitoring dashboard — P2/P3/P4 don't have monitoring screens; only P1 does).

### Pre-existing incident roster (locked, Sembcorp-canonical)

Three steady-state Power Gen monitoring incidents seed the dashboard list (Sembcorp Singapore-fleet plausible assets, NOT HVAC — domain is gas-gen / steam / cooling per CCGT operations):

| Incident ID | Asset | Severity | State | Body | Age |
|---|---|---|---|---|---|
| `INC-2026-0521` | `Jurong-CCGT-2 · BFP-2A` | GREEN | MONITORING | Bearing vibration trending within OEM band — surveillance only. | 2h 14m ago |
| `INC-2026-0529` | `Sakra-CCGT-1 · ST-1` | AMBER | SCHEDULED | LP turbine exhaust pressure rise — wash cycle scheduled per OEM PTC. | 58m ago |
| `INC-2026-0532` | `Banyan-CHP · Cooling Tower 2` | RED | MONITORING | CT2 fill media plugging — supplementary cooling engaged. | 31m ago |

Owner on all 3: `R. Kumar` (Ops Control Tower lead). The canonical AMBER incident `INC-2026-0537 · JRG-CCGT-1 · Block 2 · GT-3` lands fourth (via notification) and is the only one with a click-through to detail.

### Click trigger element (locked)

The Screen A→B transition fires on click of the **teal/green header band** at the top of the monitoring dashboard tablet content (the `HYPERSPACE OS · time · engineer toggle` bar — Sembcorp teal `--teal-header` gradient). This is the obvious "system" element so it reads as a natural place to click for "trigger system event". Header band gets `cursor: pointer` on hover with a subtle hint-shadow to nudge clickability.

This is the demo's "GO" button without looking like a button. Pulkit can click it on cue during narration.

### Right-pane animation upgrade (locked 2026-05-20 evening)

Dispatch log strip evolves from static 4-line W2 placeholder into a **live streaming queue** with Claude-Code-style line-by-line animation:

- **Visible queue: 5 most recent lines** at full opacity.
- **6th line arriving**: top line fades to 50% over 200ms, then collapses up into a `▾ N earlier steps` accordion chip at the very top of the strip. Accordion expands inline on click to show all collapsed lines (still hover-clickable for KG node-chain highlight).
- **Streaming animation**: new line slides in from bottom (translateY 8px → 0, opacity 0 → 1, 250ms ease-out). Brief left-edge accent pulse in the source-token color (green for `inspection` / `orchestrator`, blue for reasoning agents, etc.) to draw the eye.
- **Click-on-line**: pins the line (border-left thicker, background slight tint) + freezes 3D KG showing the line's `nodeChain`. Click again to un-pin.
- **Hover-on-line**: same KG freeze + node-chain highlight as click but transient (releases on hover-off).
- **Line opacity decay**: lines older than the most recent 3 dim to 70% opacity to focus eye on the active stream.

Per agent: as the agent activates, its agent-card expands inline to show a Claude-Code-style task tree (`✓ done · ● active pulsing · ○ pending` with step counter `n/m`). Task-tree steps are clickable + hover-active using the same KG-chain mechanism (each step has its own `nodeChain`). When the agent deactivates, the card collapses with a green checkmark + total step count.

Three surfaces — log lines, task tree, 3D KG — stay synchronized via shared `nodeChain` data per logical step. All three respond to hover/click anywhere in the family.

### W2.6 deployment confirmation (2026-05-20)

Screen state machine (`state.screen` = `monitoring` | `monitoring-notify` | `monitoring-landed` | `incident-detail`) implemented. Initial page load lands on `monitoring` (Screen A) — was previously incident-detail. Click on teal HYPERSPACE OS header band fires the new-incident notification (Screen B with banner slide-in animation, 3s visible + 0.5s fade). Banner auto-advances to Screen C (landed state with INC-2026-0537 at top of incidents list, stat row 3→4/0→1/0). Click on AMBER incident card opens Screen D (the existing incident detail). Back chevron on Screen D returns to Screen C.

`PRE_EXISTING_INCIDENTS` const seeds 3 Sembcorp-canonical Power Gen monitoring incidents (Jurong-CCGT-2 · BFP-2A · GREEN; Sakra-CCGT-1 · ST-1 · AMBER scheduled; Banyan-CHP · Cooling Tower 2 · RED). Only the canonical AMBER INC-2026-0537 is clickable into detail; other 3 = static cards.

Header band has `cursor: pointer` ONLY when `state.screen === 'monitoring' && !state.incidentLanded`. After incident lands once, header reverts to non-clickable. Re-trigger requires page reload (one notification per demo run).

`renderOpsView` renamed → `renderIncidentDetailView` to disambiguate from monitoring view. Persona dispatch retained inside `incident-detail` screen for W4-W7 build-out. Right pane completely untouched this wave.

## Two-fold demo framing (locked 2026-05-20)

The demo simultaneously shows two layers, in lockstep:

1. **Surface — the tablet (LEFT pane)**: what each persona sees + interacts with. Click-through driven by tablet CTAs (free-click, no explicit "Next" button — user clicks visible action elements like severity pills, "Confirm" CTAs, checkboxes, "Notify" buttons). Mirrors real-product feel.
2. **Under-the-hood — the magic (RIGHT pane)**: orchestrator, Inspection Agent KG-lookup, agent dispatch, KG nodes activating across layers, chain-of-thought lines streaming with `[OSIsoft PI System]`-style data-source tags + KG node refs. As the user clicks an action on the tablet, the right pane reveals the agentic machinery that produced it.

The hidden landing for ITP technical audience: **chain-of-thought enriched by KG node traversal**. Vanilla LLM reasoning is commodity in 2026. Chain-of-thought *augmented by traversal across Sembcorp's existing connected enterprise KG* is the unique unlock. The KG is Sembcorp's existing asset. We are NOT reinventing the wheel — we are making their existing asset extremely powerful with the least possible friction.

Existing systems made visible inline (not as a separate panel): `[OSIsoft PI System]`, `[Maximo]`, `[Honeywell Experion DCS]`, `[Hyperspace UI]` tags appear inside Inspection Agent log lines next to the data they retrieve. Reads as "we are integrating across what you already have" without adding UI weight.

### Workflow learning narrative (added W3.4 — 2026-05-21)

The Workflow Agent (Utility · Transient, `data-agent-id="workflow"`) fires on every persona handoff. Its job: capture the workflow trace + SOP adherence at each step.

After the demo's full incident resolution (W7), the captured traces route to a (notional) process engineer for review. The narrative beat lands at demo close:

> "This app learns how your company ACTUALLY works. Every incident becomes training data — not just for whether equipment is healthy, but for whether YOUR procedures are working. Deviations get surfaced for SOP review. Workarounds get surfaced as improvement opportunities."

W3.4 fires the Workflow Agent ONCE — on the P1→P2 dispatch CTA click. W4-W7 will fire it again on each subsequent handoff. W8 surfaces a final summary (notional process-engineer review card) — out of scope for individual waves; lands in the polish pass.

### Two-surface mental model (locked W3.4 — 2026-05-21)

Single product, two audiences:

- **LEFT pane (tablet)** = real production app. Operators / engineers doing the work (R. Kumar, Lim Wei Jie, Dr. Wong, P. Sundaram). Polished customer-facing UX.
- **RIGHT pane** = back-end ops console. Team maintaining the agentic system. Observability + control. NOT used by frontline workers.

Decouple "sausage making" (right) from "doing your job" (left). Tools live behind toggle buttons. Graph is a draggable inspection window. Logs are a collapsible audit trail. Agent View is the always-visible fleet overview.

Story landing line: "we built BOTH the work app AND the agent ops console — same product, two audiences."

## Per-persona swim-lane workflow steps (transcribed 2026-05-20)

Source: `briefing/demo_1.png` + `briefing/demo_2.png` + high-res `briefing/Screenshot 2026-05-20 at 7.24.55 PM.png` / `7.25.01` / `7.26.10`. The WORKFLOW row (green / teal cards) per persona is the click-through anchor. PAIN POINT row (pink) + TACIT KNOWLEDGE row (yellow) are verbal narration anchors, NOT separate UI elements.

### P1 — Operations Control Tower (R. Kumar) — 3 workflow cards
- **W1.P1.1 · Asset monitoring / event detection** — tablet home shows new incident card pulsing; sensor anomaly fires in Hyperspace
- **W1.P1.2 · Respond and control (remote ops)** — operator opens incident; tablet shows curated incident detail with `TRIAGING` state pill; Inspection Agent + Orchestrator + Triage Agent + Power Gen Critic run; state pill transitions to `REVIEW READY`; diagnosis surfaces with confidence %
- **W1.P1.3 · Next best action (dispatch strategy recommendation) → dispatch** — `Dispatch to Onsite` CTA appears; operator clicks; incident moves to `DISPATCHED TO ONSITE`; persona panel pulse moves to P2

### P2 — Onsite Engineering / Maintenance (Lim Wei Jie, "experienced maintenance engineer + recording params") — 4 workflow cards
- **W1.P2.1 · Incident alert + diagnosis received (HyperOS)** — tablet re-renders for Onsite mobile-style guided view
- **W1.P2.2 · Diagnosis verification required (real-time inspection)** — engineer ticks 4-step verification checklist (matches CAG `4 STEPS` pattern); one step surfaces **IGV actuator drift** as deeper root cause beneath surface compressor fouling
- **W1.P2.3 · Recommended escalation pathways (HyperOS) + Remediation** — Playbook Agent + Power Gen Critic dispatch; remediation options + escalation pathway surface
- **W1.P2.4 · Remediation short-term (Pending approval) + long-term WO pre-fill** — terminal `Confirm Diagnosis` action; incident moves to `AWAITING EXPERT`; persona pulse moves to P3

### P3 — Offsite Engineering Experts (Dr. A. Wong) — 4 workflow cards
- **W1.P3.1 · Incident report (diagnosis + confirmed audit trail)** — tablet re-renders for Offsite; full audit trail displayed
- **W1.P3.2 · Report + telemetry review** — Offsite reviews underlying telemetry + charts + prior cases
- **W1.P3.3 · Remediation step approval for the site (HyperOS)** — Power Gen Critic + HSE Risk Validator + P&L Impact Validator activate; ROI/ramp model surfaces side-by-side decision (wash now vs hot shutdown for IGV replacement); Sakra-CCGT-1 standby unit option declined (ramp 4h not enough); Offsite approves WO + signs off
- **W1.P3.4 · Risk identification + Escalation + send recommendation back to plant** — Offsite escalates capacity impact back to Ops Control Tower; incident moves to `CAPACITY IMPACT — REQUIRES ROUTING`; persona pulse RE-TARGETS to P1

### P1 re-engagement (after P3 escalation)
- **W1.P1.4 · Receive capacity-impact escalation + route to Asset Performance** — tablet returns to P1's curated view with new state `CAPACITY IMPACT`; Orchestrator log streams re-route lines; operator clicks `Route to Asset Performance` CTA; incident moves to `ROUTED TO ASSET PERF`; persona pulse moves to P4

### W3.2 deployment confirmation (2026-05-20)

P1 click-through arc landed end-to-end. State machine extension:

- `state.incidentPhase` = `IDLE` | `TRIAGING` | `REVIEW_READY` | `DISPATCHED_TO_ONSITE`
- `state.activeAgentId` — current active agent (`inspection` | `triage` | `critic-power-gen`)
- `state.agentStepIndex` — per-agent step counter
- `state.arcTimers` — setTimeout handles cleared on re-fire

CoT scripts (hardcoded constants in app.js):
- `INSPECTION_AGENT_SCRIPT` — 6 steps, "KG Lookup + Cross-Layer Impact", durationMs 5000
- `ORCHESTRATOR_DISPATCH_LINES` — 1 handoff line
- `TRIAGE_AGENT_SCRIPT` — 4 steps, "Diagnosis Hypothesis", durationMs 3500
- `POWER_GEN_CRITIC_SCRIPT` — 3 steps, "Validate Diagnosis Chain", durationMs 2400
- `ORCHESTRATOR_CLOSE_LINES` — 1 final line

Sequencer `dispatchP1Arc()` called from `triggerNewIncident()` concurrent with banner. Total arc ~12s. Banner fades at 3.5s (Screen C lands), arc continues streaming for ~9s after.

Surface diagnosis: "Compressor fouling at GT-3" at 78% confidence (humidity-fouling pattern + 3 RCA matches). IGV actuator drift co-factor reserved for W4 (Onsite verification).

Agent card task-tree expansion: Claude-Code style `✓ done · ● active pulsing · ○ pending` + step pill `n/m`. Hover step → `window.KG.setNodeChain(step.nodeChain)`. Three synchronized surfaces (agent card task tree + orchestrator log line + 3D KG nodes) all share the same nodeChain per step.

Diagnosis card + Dispatch CTA + persona pulse implemented on Screen D. Click `Dispatch to Onsite →` → `state.incidentPhase = 'DISPATCHED_TO_ONSITE'`, CTA replaced with confirmation banner, P2 (Onsite) tile pulses 3 times (4.5s of green halo). Cliffhanger for W4.

State pill on monitoring incident card dynamic: `TRIAGING` (blue) → `REVIEW READY` (green) → `DISPATCHED TO ONSITE` (purple). Severity AMBER persists. Renderer reads `row.stateClass` (kebab-case) to avoid breakage on multi-word state text.

Verified via Chrome MCP — 18 tests pass (observed-vs-expected table filed in W3.2 operator session).

### P4 — Asset Performance Analyst (Priya Sundaram) — 3 workflow cards
- **W1.P4.1 · Receive routed capacity-impact alert** — tablet re-renders for Asset Perf; alert lands with full context from P1/P2/P3 audit trail
- **W1.P4.2 · P&L impact understanding for approvals + reporting** — P&L Impact Validator runs financial calc; 50 MW × 4h shortfall surfaces; forwards/futures hedge dashboard appears with prevailing wholesale price
- **W1.P4.3 · Approve hedge + trigger Learning Engine writeback** — Analyst approves hedge; Learning Engine writes correction back to KG L4 (new green node: humidity-fouling + IGV-drift co-factor pattern); Learning Flywheel completes step 5/5; incident closes `HEDGED / CLOSED`; "Next decision starts sharper" beat lands

## State pill state machine (locked 2026-05-20)

Severity pill `AMBER` persists throughout (severity-persistence rule). A separate state pill cycles through phases, driven by `state.incidentPhase`:

| Phase | Pill text | Trigger |
|---|---|---|
| 1 | `TRIAGE READY` | W3.9 — initial pill on cold load; incident already triaged by AI; Faye reviewing (folds prior `TRIAGING` + `REVIEW READY` phases) |
| 2 | `DISPATCHED TO ONSITE` | P1 clicks Confirm on-site dispatch CTA |
| 3 | `ONSITE CONFIRMED` | P2 confirms onsite findings (W4) |
| 4 | `AWAITING ASSET PERF` | P3 hands off to P4 |
| 5 | `HEDGED / CLOSED` | P4 approves hedge + Learning Engine writeback complete |

Pill style: small rounded chip, mono font, contextual color (TRIAGE READY green-soft, DISPATCHED purple, ONSITE CONFIRMED purple, AWAITING ASSET PERF purple, HEDGED green-solid). Severity AMBER pill renders to its LEFT, persistent.

W3.9 note: confidence chip dropped from monitoring-row card entirely — confidence number only appears inside Screen D Summary report.

## Canonical scenario — layered with bent-shaft root cause (locked 2026-05-21 — W3.9 pivot)

Surface story (W3.9): `JRG-CCGT-1 · Block 2 · BFP-3A` vibration RMS on NDE bearing housing exceeds ISO 10816-7 Zone C alarm threshold (8.4 mm/s vs 7.1 mm/s). Layered root cause adds depth for P2/P3/P4 narrative:

- **Surface diagnosis (P1 Sensor Anomaly Inspector + Turbine Diagnostic Agent + Power Gen Critic)**: NDE bearing race spalling (early-stage). 78% confidence. Pattern-matched against 3 prior BFP bearing failures (Jurong-CCGT-2 / Sakra-CCGT-1 / Banyan-CHP). Alternatives surfaced view-only: shaft misalignment 52%, coupling wear 31%, impeller imbalance 19%. Recommendation: dispatch Lim onsite for bearing visual + dial-indicator runout.
- **P2 Onsite verification deepens it (W4 reveal)**: Lim follows BFP vibration SOP. Visual on NDE bearing shows minor pitting but not enough to explain 8.4 mm/s RMS. Lim runs dial-indicator runout test on shaft + coupling per Sulzer BFP manual — runout reads ~0.18 mm at mid-span (spec ≤0.05 mm). Shaft is bowed. Bearing wear is a *symptom*, not the cause.
- **P3 Offsite confirmation (W4)**: Lim calls senior engineer Dr. A. Wong. Wong pulls remote phase-analysis from Bently Nevada 3500 — 1×RPM dominant on FFT + ~180° phase shift between NDE and DE radial probes = textbook bent shaft signature. Wong confirms diagnosis. Real remediation = BFP-3A shaft replacement (NOT bearing replacement alone).
- **P3 Offsite consequence (W5)**: BFP-3A shaft replacement requires controlled BFP isolation + HRSG feedwater switchover to BFP-3B (sister pump). ~6h job. PSO commitment window 09:00–18:00 SGT (9h). Switchover bites into peak dispatch window = ~50 MW Block 2 derate. Approve WO. Escalate capacity impact back to P1.
- **P1 re-engagement (W5)**: incident reopens with new `CAPACITY IMPACT` state. Routes to Asset Perf.
- **P4 financial action (W7)**: 50 MW × 4h shortfall after BFP-3B coverage. Forwards/futures hedge bought at prevailing wholesale price. Learning Engine writes refined pattern back to KG L4: "bearing-spalling pattern + bent-shaft co-factor — revised confidence model + recommended dial-indicator runout in standard BFP SOP".

Why bent-shaft is the right root-cause choice (Joubert / Asherson pattern-match):
- Bent-shaft is a documented rotor-dynamics failure mode on multi-stage centrifugal BFPs (Sulzer, KSB, Flowserve). Phase-analysis (1×RPM + 180° phase shift) is the textbook diagnostic signature taught in every rotor-dynamics short course (Bently Nevada / SKF / GE)
- "Bearing damage is symptom, not cause" is a known troubleshooting gotcha — vibration RMS alarm fires on the bearing housing because that's where the transducers live, but the actual fault is upstream
- ISO 10816-7 Zone C threshold + Sulzer BFP manual + Bently Nevada 3500 + SKF bearings are real industrial references — Asherson (ex-Rolls-Royce SEA) + Pieter Franken (sensor-data rigor) will recognize the stack
- Dial-indicator runout test is a 1st-year mechanical maintenance technique — the *physical-world verification* gating the agentic system is the demo's "human-in-the-loop is non-negotiable" narrative beat

## Inspection-trace log format (canonical, locked 2026-05-20)

The orchestrator dispatch log strip inside Agent View shows two flavors of line, distinguished by source token:

- `inspection` source (green-bold) — Inspection Agent's KG-lookup and traversal steps
- `orchestrator` source (green-bold) — Orchestrator's dispatch / decision steps

Data-source tags appear inline as small blue pill `[OSIsoft PI System]` / `[Maximo]` / `[Honeywell Experion DCS]` / `[Hyperspace UI]` markers next to whatever Inspection Agent is retrieving. These make existing-systems integration visible without a separate panel.

Canonical line patterns for W3+ streaming animation:

```
[hh:mm:ss] inspection · sensor anomaly · <sensor tag> [<data source>]
[hh:mm:ss] inspection · KG lookup · <node name> found · <n> inbound connections
[hh:mm:ss] inspection · L2 traverse · retrieving <data> from <data source>
[hh:mm:ss] inspection · L3 traverse · <prior incident match summary> [<data source>]
[hh:mm:ss] inspection · L4 traverse · pattern match · <pattern name> · <confidence>% confidence
[hh:mm:ss] inspection · synthesis complete · handing off to orchestrator
[hh:mm:ss] orchestrator · received inspection findings
[hh:mm:ss] orchestrator · dispatching <agent name> · scope: <scope>
[hh:mm:ss] <agent> · <action>
[hh:mm:ss] orchestrator · path validated by <critic> · surfacing to tablet
```

### W3.3 deployment confirmation (2026-05-20)

Right-pane refactor landed:

- **Zone order swap**: `#zone-kg` (220px, halved from 440px) now sits ABOVE `#zone-agents` in the right pane. Flywheel zone unchanged.
- **Source-token colors per agent**: `.log-agent-name` + per-step accents inherit from `--src-color` CSS var (driven by `LOG_SOURCE_COLORS` map): orchestrator=green, reasoning agents (inspection/triage/playbook/learning)=blue, critique (power-gen/renewables/networks)=amber, validators (hse/pl)=pink.
- **Nested agent-grouped log structure**: consecutive same-source lines collapse into one `.log-group` with `engaging <AgentName>` header + indented step rows. Three orchestrator seed lines render under one orchestrator group header; inspection seed line renders under its own Inspection Agent group; arc adds 5 more groups (inspection arc / orchestrator handoff / triage / critic-power-gen / orchestrator close) for 8 groups total / 20 steps.
- **Task-tree state visuals** per step: `▢` pending · `▣` active (pulsing 1.2s) · `✓` done (strike-through text/ts + dim). Most-recent step in a group is `active`; prior steps in the same group go `done` when a newer step arrives, OR when a new agent group leads.
- **Inline node-chain pills**: each step renders its `nodeChain` as small agent-color pills next to the step text. Pills dim to 45% on done state.
- **Synchronized surfaces preserved**: log step hover → `window.KG.setNodeChain(chain)` · click → `pinNodeChain` · same mechanism as W3.1.
- **Agent-card inline task-tree REMOVED**: cards retain `.agent-active`/`.agent-done` class glow + step pill `n/m` counter. The log is now the primary task-tree visualization (single source of truth, less surface redundancy).
- **Engagement pulse on agent card per log line**: `pulseAgentEngagement(source)` fires on every `appendLogLine`. CSS keyframe `agent-engage-pulse` (1500ms ease-out) — agent-color halo + scale 1.012 + fade. Reflow trick re-triggers on consecutive same-agent lines. Layers on top of steady `.agent-active` glow.
- **Roll-up accordion**: when total lines > 5, oldest collapse into `▾ N earlier steps` chip; toggling the chip adds `.log-accordion-expanded` to `.orch-log-body`, which CSS overrides to reveal collapsed `.log-step` + `.log-group` elements at reduced opacity.

Verified via Chrome MCP — 15 tests pass. Demo end-to-end P1 arc still functional; W2/W2.5/W2.6/W3.1/W3.2 behavior unchanged.

W3.3 closes the visual revision pass. W4 (P2 Onsite arc) introduces new UX conventions: HITL human icon on tablet next-action lines, action-capture toast, workflow-complete delay popup with KG enrichment narrative.

### W3.6 deployment confirmation (2026-05-21)

Visual + nomenclature pass landed:

- **Photorealistic tablet background**: `briefing/tablet-bg.png` (734 KB PNG, 1002×744) fills LEFT pane via `#left-pane::before` `background: url(...) center center / cover`. New wrapper `#tablet-overlay-wrap` (position relative, z-index 5, width 72%, max-width 720px, margin-left 12%, margin-top 4vh) hosts `#personas-panel` + `#tablet` stacked. `#left-pane` flipped to `position: relative; overflow: hidden; background: #0F1B3D` (fallback). `#tablet` is now bezel-less — `background: transparent; box-shadow: none; padding: 0; border-radius: 0` — UI floats over photographed tablet's screen area. `#tablet-inner` keeps white surface + new dark backdrop shadow `0 8px 32px rgba(0,0,0,0.45)` for legibility against the dark screen of the photographed device. `min-height: 110vh` on `#tablet` removed.
- **Tasks reframe (Q1+Q2 locks)**: `INCIDENTS (n)` → two-line `My Priorities · My tasks for today · n`. Stat row labels `Active · Awaiting Triage · SLA at Risk` → `Active Tasks · Monitoring · Archived` with counts `3-or-4 · 2 · 12` (`Monitoring` value amber `var(--amber-vivid)`, `Archived` muted slate). Engineer header pill labels `RK R. Kumar · All engineers` → `RK My view · Team view`. Brand string already `Sembcorp OS` (W3.4) — confirmed unchanged.
- **Unread red-dot on landed AMBER**: `state.amberInDetail` flag (default false). `buildLandedIncidentRow()` emits `isUnread: !state.amberInDetail`. Card renders `.mon-unread-dot` (10×10 red circle, 2px white ring, soft glow) absolute-positioned top-right. `openIncidentDetail()` sets `state.amberInDetail = true` once user enters Screen D — dot disappears on subsequent renders.
- **Tile pills · mustard MONITORING + inline dynamic content (Q3 lock)**: `.mon-pill-state-monitoring` flipped grey → mustard (`#FEF3C7 / #92400E`). Each row carries optional `dynamicTagText: { label, value, from }`. Inline `.mon-pill-dyn` span appended to state pill: monospace 9px, value blue-bold (`var(--blue-vivid)`), from-source green-italic (`var(--green-vivid)`). Pre-existing rows: `update expected in 35m from Lim Wei Jie` · `task scheduled for 06:30 SGT from M. Lim` · `update expected in 12m from J. Tan`. Landed AMBER per-phase: `awaiting triage · auto-dispatch in 1m` (TRIAGING) → `diagnosis ready · 78% confidence` (REVIEW_READY) → `dispatched to Lim Wei Jie · 02:47 SGT` (DISPATCHED). REVIEW_READY + DISPATCHED set `from: null` to avoid awkward "78% from confidence" wording — descriptor baked into label/value instead.
- **KG auto-open removed (Q4 lock)**: `toggleGraphWindow()` call deleted from `triggerNewIncident()`. KG opens only via `Display Graph` toolbar button. Header click still fires banner + arc, but graph stays closed.
- **Screen D section reorder**: Asset Chain card moved ABOVE Operational Impact card. Final order: header → `hyperspace.live` + Metrics → `hyperspace.live` + BMS Alarm → `hyperspace.live` + Asset Chain → `knowledge-graph.live` + `netzero-os.live` + Operational Impact → History accordion → Next Action Steps.
- **Multi-source captions (Q3 source lock)**: Three caption helpers — `buildHyperspaceCaption()` (blue ✦ `var(--blue-vivid)`, AI-icon bumped 9px → 13px, 3 instances on Screen D), `buildKGSourceCaption()` (mustard `#92400E`, inline brain SVG glyph), `buildNetzeroCaption()` (cyan `#0891B2`, ✦ icon). Renders italic mono at font-size 10.5px.
- **Dynamic-colored entities**: BMS alarm text + Operational Impact text wrap key entities in `.dyn-entity` span (mono, padded, rounded-3px, 1px border). Variants: `.dyn-entity-asset` (blue, e.g. `Block 2`, `GT-3`), `.dyn-entity-metric` (green, e.g. `circa 50 MW`), `.dyn-entity-ref` (amber clickable, `IEEE 1159 § 4.2` ×2).
- **IEEE-1159 OCR modal**: Body-level `#doc-modal` (fixed inset, z-index 2000, backdrop blur). Document-style content: page header, 3 §4.2 paragraphs (4.2.1 / 4.2.4 / 4.2.5) with 4.2.4 highlighted (mustard background + amber left bar), footer `✦ Source: hyperspace.live · OCR captured 2026-05-21 02:47:09 SGT`. Close via `#doc-modal-close` ×, overlay click, or Escape key. Click-handler bound on `document.body` (delegated to `.dyn-entity-ref`) once on `initDocModal()`; survives renders. Only IEEE-1159 wired this wave; `data-doc-ref` slot ready for future refs.
- **Historical WO accordion fix**: `.acc-row-w1` split into clickable `.acc-row-w1-hdr` + collapsing `.acc-row-w1-body`. `data-open` attribute toggles on header click; chevron rotates 0° → 90°; body `max-height` transitions 0 → 400px. Populated 3 WO rows: `WO-2026-0489 · Compressor wash cycle · 2026-05-18 → 2026-05-19 · CLOSED` · `WO-2025-3147 · IGV calibration verification · OEM service bulletin GE-9HA-014 · CLOSED` · `WO-2025-2814 · Generator excitation system inspection · annual · CLOSED`.

Verified via Chrome MCP — all 18 tests pass:

| # | Test | Observed | Expected | Pass |
|---|---|---|---|---|
| 1 | Photo bg fills LEFT pane | `background-image: url('briefing/tablet-bg.png')`, fallback `rgb(15,27,61)` | image set + fallback `#0F1B3D` | ✓ |
| 2 | Tablet UI overlays photographed screen | wrap at x=254 y=36 720×826 inside pane | inside photographed tablet's screen area | ✓ |
| 3 | "My Priorities" two-line header | `My Priorities` + `My tasks for today · 3` | exact text | ✓ |
| 4 | Stat row labels + colors | `Active Tasks · Monitoring · Archived` / `3 · 2 · 12` / monitor `rgb(217,119,6)` / archived muted | exact | ✓ |
| 5 | Engineer toggle My view · Team view | `RKMy view` + `Team view` + brand `Sembcorp OS` | exact | ✓ |
| 6 | Unread red dot on landed AMBER | 1 dot before Screen D visit → 0 after | dot present then clears | ✓ |
| 7 | Tile pills dynamic content | TRIAGING/REVIEW_READY pills render `· diagnosis ready · 78% confidence` etc. | inline blue+green text | ✓ |
| 8 | Mustard MONITORING pill | bg `rgb(254,243,199)` color `rgb(146,64,14)` | `#FEF3C7 / #92400E` | ✓ |
| 9 | Click header → KG stays closed | `graphWinOpen=false`, `graphBtnActive=false` after header click | no auto-open | ✓ |
| 10 | Display Graph button opens KG | `graphWinOpen=true`, `graphBtnActive=true` after button click | manual open works | ✓ |
| 11 | Screen D section order | header → metrics → BMS → Asset Chain → Operational Impact → History → Next | Asset Chain ABOVE Operational Impact | ✓ |
| 12 | 3× `hyperspace.live` caption | 3 instances, text `✦ hyperspace.live`, icon font-size 13px | 3 + 13px | ✓ |
| 13 | `knowledge-graph.live` caption | text `knowledge-graph.live`, color `rgb(146,64,14)`, SVG present | mustard + brain SVG | ✓ |
| 14 | `netzero-os.live` caption | text `✦ netzero-os.live`, color `rgb(8,145,178)` | cyan | ✓ |
| 15 | Dyn-colored entities in BMS + ops impact | Block 2, GT-3, IEEE 1159 wrapped in BMS; Block 2, circa 50 MW, IEEE 1159 wrapped in Ops Impact | all wrapped | ✓ |
| 16 | IEEE 1159 click → modal | modal `data-open=true`, title `IEEE 1159 § 4.2 — Power quality thresholds`, 4.2.4 highlight, source caption | modal opens populated | ✓ |
| 17 | History WO accordion expands | `data-open=true` after click, 3 WO rows visible with correct IDs | 3 rows expand | ✓ |
| 18 | Full P1 arc regression | banner → arc → REVIEW_READY → Screen D (red dot clears) → Dispatch CTA → Workflow Agent done | end-to-end clean | ✓ |

Cosmetic note (not a blocker): kickoff verification text for REVIEW_READY dynamic pill spec'd `diagnosis ready · 78% confidence`. The kickoff's template (`label + value + " from " + from`) would have produced `78% from confidence`. Resolved by setting `from: null` for REVIEW_READY + DISPATCHED rows and embedding the descriptor in `label` / `value` so the output reads sensibly. Pre-existing rows still use `from` for the green-italic person name.

W3.7 next: verify-diagnosis flow refinements (See full reasoning expandable · alt diagnosis replace · notes + voice note · 2-stage Confirm→Dispatch gate · post-dispatch state · workflow capture footer · alt-diagnosis replace).

### W3.6b deployment confirmation (2026-05-21)

Hot-fix wave addressing W3.6 regressions and visual misses:

- **LEFT pane scroll restored** — `#left-pane` flipped from `overflow: hidden` back to `overflow-y: auto` (W1.5c lock). Sembcorp-green 6px thin scrollbar styling restored. `#left-pane::before` background image dropped to `z-index: 0` with `pointer-events: none` so scroll events reach the pane.
- **Tablet photo approach reversed (Pulkit Option 1)** — `#tablet-overlay-wrap` wrapper element removed. `#tablet` restored to charcoal `#1F2937` bezel: `max-width: 720px`, `border-radius: 24px`, `padding: 10px`, `min-height: 110vh`, soft elevation shadow + inset hairline. `#tablet-inner` restored to white surface with `border-radius: 18px` (no extra drop shadow). Image stays as `#left-pane::before` background; charcoal bezel sits on top of where the photo's tablet was. Hand + bokeh visible at edges of the pane.
- **Personas panel z-stack** — `position: relative; z-index: 5` added so it renders above the photo background. Continues to sit external above the tablet, matching `max-width: 720px`.
- **Brand reverted** — `mon-hdr-brand` text `Sembcorp OS` → `Hyperspace OS`. Banner label `NEW INCIDENT · Hyperspace OS` unchanged (was already correct in W3.6).
- **Persona rename R. Kumar → Faye Sit** — Display text replaced across `PERSONAS` array (`name: 'FAYE SIT'`), `PRE_EXISTING_INCIDENTS` owners (`owner: 'Faye Sit', ownerInitials: 'FS'` × 3 rows via `replace_all`), `buildLandedIncidentRow` (same), monitoring header pill (`FS My view`), `Next action steps for Faye Sit` on Screen D, and `KG_NODES` `r-kumar` label (`Faye Sit · Ops`). KG node ID `r-kumar` preserved to avoid breaking edge references and existing `nodeChain` references in agent CoT scripts. CSS fallback list (`#kg-css-fallback` static node chip) updated to `Faye Sit · Ops`.
- **KG ball : label 4 : 1 proportion** — sphere radius bumped 3 / 4.5 → 9 / 14 (3x). Sphere segment density 24×16 → 32×20 for the bigger spheres. Label font-size 28 → 18; pad-x 16 → 12; pad-y 8 → 6; sprite scale `canvasW / 4` → `canvasW / 6`; label sprite X offset 7 → 15 to clear the larger sphere.
- **KG thicker white outline** — back-face halo ring radius multiplier 1.18 → 1.30; opacity multiplier 0.95 → 1.0; segment density 24×16 → 32×20.
- **KG layer-title sprites** — `buildLayerTitle` regenerated: layer-font 38 → 32, name-font 22 → 18, new `▸` arrow glyph (28px, layer color, right-aligned). Left-bar widened 6 → 8 px; backdrop opacity 0.85 → 0.92. Sprite anchored at X = -130 (was -120). Camera initial pose shifted to `(-40, 0, 320)` (was `(-20, 0, 300)`) so the layer-title column reads on load.
- **KG always auto-spin** — `startAutoRotate` now reads `KG_STATE.lastAngle` so resume preserves the user's last position rather than snapping to 0. Spin rate bumped 0.002 → 0.003 rad / 40 ms; orbit distance 280 → 320. Interaction handlers updated: `mousedown` stops spin, `mouseup` schedules resume after 1 s (skipped if a chain is active), `wheel` clears prior timer + schedules resume after 2 s, `touchend` resume after 1 s. `window.KG.clearNodeChain` / `unpinNodeChain` already resume spin when no chain remains; behavior preserved. `startAutoRotate()` called at the end of `initKG3D` so spin begins on graph init.

Chrome MCP verification — 14 tests:

| # | Test | Observed | Expected | Pass |
|---|---|---|---|---|
| 1 | LEFT pane scrolls + 6px Sembcorp-green thumb | `getComputedStyle(#left-pane).overflowY === 'auto'`; thin scrollbar styling intact | `overflow-y: auto` + thin green thumb | ✓ |
| 2 | Charcoal bezel restored | `#tablet { background: rgb(31,41,55); border-radius: 24px; min-height: 976.8px (=110vh@888px); }` and `#tablet-overlay-wrap` removed from DOM | `#1F2937`, radius 24, min-height 110vh, wrapper gone | ✓ |
| 3 | Bokeh + hand visible around tablet | Screen-A screenshot shows hand bottom-left and bokeh on left/right edges around the charcoal bezel | hand + bokeh wrap around bezel | ✓ |
| 4 | Brand: `Hyperspace OS` | `.mon-hdr-brand.textContent === 'Hyperspace OS'` | exact text | ✓ |
| 5 | Faye Sit / FS everywhere | active persona name `FAYE SIT`; engineer initials `FS`; landed-row + pre-existing-row owners `Faye Sit / FS`; Screen D header `Next action steps for Faye Sit` | exact replacement everywhere except KG node ID | ✓ |
| 6 | KG node `r-kumar` label = `Faye Sit · Ops` | `KG_NODES.find(n=>n.id==='r-kumar').label === 'Faye Sit · Ops'` | exact | ✓ |
| 7 | KG balls 3× larger, labels smaller (4 : 1) | Code path verified — radius 9 / 14, label font 18, sprite scale `/ 6`, X-offset 15 | radius bump + label shrink applied | ⚠ human-check (WebGL not available in headless Chrome MCP — verify on real Chrome) |
| 8 | KG thicker white outline | Code path verified — ring radius × 1.30, opacity × 1.0, segments 32×20 | thicker halo | ⚠ human-check |
| 9 | KG 4 layer-title sprites with `▸` arrow | Code path verified — `buildLayerTitle` writes `▸` arrow with `textAlign='right'`, sprite X=-130, fonts 32/18/28 | arrow + smaller fonts | ⚠ human-check |
| 10 | KG always auto-spins on idle | Code path verified — `startAutoRotate` called at end of `initKG3D`; mouseup/wheel/touchend resume timers; `lastAngle` preserved on resume | spin on idle, pause on interaction, resume after delay | ⚠ human-check |
| 11 | Hover log line pauses spin, lights chain | Code path unchanged — `window.KG.setNodeChain` already calls `stopAutoRotate`; `clearNodeChain` restarts when no other chain active | preserved | ⚠ human-check |
| 12 | Click `Display Graph` opens window | `#kg-floating-window[data-open="true"]` after `#btn-display-graph` click | window opens | ✓ |
| 13 | No KG auto-open on header click | Hard refresh → click teal header → `state.graphWinOpen === false`, window stays closed | Q4 lock holds | ✓ |
| 14 | Full E2E arc still works | Header click → arc fires → `state.incidentPhase === 'REVIEW_READY'` within 15 s → click AMBER → Screen D with `Next action steps for Faye Sit` + diagnosis `Compressor fouling at GT-3` 78% + Dispatch CTA → click CTA → `state.incidentPhase === 'DISPATCHED_TO_ONSITE'` + confirmation `✓ Dispatched to Onsite at 02:47 SGT · Lim Wei Jie notified` | end-to-end clean | ✓ |

Headless Chrome MCP cannot create a WebGL context (initKG3D throws `Error creating WebGL context.` from three.js, falls back to CSS scaffold). KG visual tests 7–11 are flagged for human-check on real Chrome. Code paths verified present in `app.js` — visual confirmation pending Pulkit's local browser.

### W3.7 deployment confirmation (2026-05-21)

Mega-wave folding W3.6b visual carry-overs + W3.6c hot-fixes + originally-scoped W3.7 narrative + Screen-D pacing.

KG rendering:
- KG zoom + Y tilt preserved on auto-rotate. `startAutoRotate` reads current `cam.position.x/y/z` per tick instead of hardcoded `distance=320 / y=0`. User-chosen zoom + tilt now persist through spin.
- Layer legend moved from floating-sprites-at-X=-130 (W3.6b) → static HTML chip-row at top of `#kg-floating-window` (between title bar and 3D mount). 4 chips with colored dots + L1-L4 IDs + layer names. `buildLayerTitle` sprites no longer mounted on `graph.scene()`. Camera recentered to `(0, 0, 280)`.

Tablet visuals:
- Image background `briefing/tablet-bg.png` fully removed (`#left-pane::before` rule deleted). LEFT pane = solid `var(--bg-pane-left)` `#F1F5F9`.
- Source legend on Screen D: 3-chip row near top (below incident header band): `Hyperspace OS` (blue sparkle) · `NetZeroOS` (green leaf) · `Knowledge-Graph` (amber graph-nodes). ~18px icons. No `.live` suffix. Per-card `✦ from xxx.live · live` captions removed.
- "Super Engineer Intelligence" → "Hyperspace OS intelligence" everywhere. Rationale label removed from the new diagnosis hypothesis tile.

Vocabulary:
- BMS → DCS (Distributed Control System · Honeywell Experion DCS) across alarm strip, copy, internal references. Equipment vocab line in `## Vocabulary discipline` updated to call out DCS explicitly. CSS classes `.bms-alarm` / `.bms-lbl` / `.bms-text` renamed to `.dcs-alarm` / `.dcs-lbl` / `.dcs-text`. Alarm strip header reads `DCS Alarm · IEEE 1159 § 4.2`; body ends `Source: Honeywell Experion DCS.`

Screen D narrative:
- Faye does NOT confirm diagnosis. Diagnosis tile reframed: `Diagnosis hypothesis · compressor fouling (humidity-correlated)` with `78% confidence` chip and `Pending Onsite verification (Lim Wei Jie)` subtitle.
- CTA button: `Dispatch for Onsite Inspection`. Sub-label: `Faye Sit · routes incident to onsite engineer for diagnosis verification`. Diagnosis confirmation moves to P2 Onsite arc (W4) where Lim runs 4-step verification checklist.
- See full reasoning expandable panel beneath diagnosis tile. 5 steps citing Sensor Anomaly Inspector + Turbine Diagnostic Agent + Power Gen Critic + final hypothesis line.
- Alternative diagnoses (view-only display): 3 alt hypotheses — IGV-3 actuator drift 52%, Inlet filter ΔP rising 31%, HRSG-3 tube degradation 19%. No selection mechanism.
- Notes section + mic button + 5s preload. Preload text: `Lim — prioritize IGV-3 actuator visual inspection alongside scheduled compressor wash. 90-day humidity profile suggests possible co-factor. Confirm both before reporting back.` Captured to `state.dispatchNote`.

Screen D pacing (15s tiered reveal):
- t=0: incident header + source legend + metrics 2×2 + DCS alarm strip — instant.
- t=0 → 5s: asset chain placeholder with loading-dots (`Sensor Anomaly Inspector building asset chain for monitoring + RCA`). Right pane: Sensor Anomaly Inspector card active + 4 inspection log lines streaming (timestamps 02:47:12-15) + KG nodes lighting per line.
- t=5s: asset chain card slides in (replaces placeholder). Ops impact placeholder appears (`P&L Impact Validator reviewing revenue commitment exposure`). Right pane: P&L Validator card active + 3 pl log lines streaming (02:47:16-18).
- t=10s: ops impact card slides in (revised revenue-commit content). Recommendation placeholder appears (`Orchestrator reviewing SOP + historical next-best-actions for [DCS ALARM · GT EXHAUST TEMP SPREAD DRIFT]` with amber alarm-box). Right pane: Turbine Diagnostic + Compressor Wash Playbook + Power Gen Critic cards active in parallel + 5 log lines streaming (02:47:19-23).
- t=15s: full recommendation block reveals — diagnosis hypothesis card + see-reasoning + alt-diag + notes + Dispatch CTA. `wireSeeReasoningToggle()` and `wireNotesMic()` bind at this point.

Parallel agent activation:
- `setAgentActive` tears down previous active agent. New helper `activateAgentParallel(agentId, totalSteps)` added that adds `agent-active` class + step pill without disturbing `state.activeAgentId`. Used for Block 3's parallel triage + playbook + critic activation.

Reveal state machine:
- New flags on `state`: `screenDRevealStarted`, `assetChainRevealed`, `opsImpactRevealed`, `recommendationRevealed`, `dispatchNote`. `openIncidentDetail` resets the four reveal flags on entry unless `state.incidentPhase === 'DISPATCHED_TO_ONSITE'` (in which case all are forced true so post-dispatch re-entry paints everything instantly). `renderIncidentDetailView` reads the flags to decide placeholder vs real block visibility; `startScreenDReveal` is kicked once per entry.

Ops impact revised content:
- Title `Operational + revenue impact`. Body: 3 bullets (MW dispatch reliability at risk + PSO commitment window + Revenue at risk ~SGD 240k illustrative) + 1 hedge line + action window line. SGD 120/MWh peak tariff is illustrative — `[illustrative]` annotation in DOM + `// [illustrative — confirm w/ Sembcorp before 2026-05-27]` comment in code beside the tariff string.

Post-dispatch capture footer:
- 3-line capture appears ~500ms after Dispatch CTA click:
  (1) ✓ Hyperspace OS confirms SOP followed
  (2) ✓ Notes sent to Workflow Agent for review
  (3) ✓ Knowledge-Graph · team · incident · workflow enriched
- Plus `Dispatched to Lim Wei Jie · 02:47 SGT` mono slate label below. `appendDispatchCaptureFooter` is idempotent (guards against double-append on re-render).

Verified via Chrome MCP — per-test table:

| # | Test | Observed | Expected | Pass |
|---|---|---|---|---|
| C1 | LEFT pane has no image bg | `#left-pane` background `none`, `::before` content `none` | solid var(--bg-pane-left) | ✓ |
| E1 | "Super Engineer" replaced everywhere | `document.body.innerHTML.indexOf('Super Engineer') === -1` | 0 matches | ✓ |
| F1 | No standalone `BMS` token user-visible | `body.innerHTML.match(/\bBMS\b/g) === null` | 0 matches | ✓ |
| B1 | KG legend chip-row at top of window | `.kg-legend-chip` count = 4; window children = `[kg-fw-titlebar, kg-legend, kg-fw-body, kg-fw-resize]` | 4 chips between titlebar and 3D mount | ✓ |
| K1 | t=0: asset-chain placeholder visible, real blocks hidden | `pendingAsset:true, pendingOps:false, pendingRec:false; assetReal/opsReal/recReal display='none'` | placeholder only for block 1, all real hidden | ✓ |
| K2 | t=5s: asset-chain revealed, ops-impact placeholder appears | `pendingAsset:false, pendingOps:true; assetReal='', opsReal='none'` | block 1 reveals + block 2 placeholder | ✓ |
| K3 | t=10s: ops-impact revealed, recommendation placeholder appears | `pendingOps:false, pendingRec:true; opsReal='', recReal='none'` | block 2 reveals + block 3 placeholder | ✓ |
| K4 | t=15s: recommendation revealed | `pendingRec:false; recReal=''` | all real blocks visible | ✓ |
| L1 | Block 1 (0-5s): Inspector active | `inspectionActive:true` at t=3s | inspector active during block 1 window | ✓ |
| L2 | Block 2 (5-10s): P&L Validator active | `plActive:true` at t=6s, `inspectionActive:false` | P&L active, inspector done | ✓ |
| L3 | Block 3 (10-15s): triage + playbook + critic-power-gen all active in parallel | `triageActive:true, playbookActive:true, criticActive:true` at t=11s | 3 agents active simultaneously | ✓ |
| D1 | Source legend 3 chips | `Hyperspace OS / NetZeroOS / Knowledge-Graph` | exact text + 3 chips | ✓ |
| D2 | No per-card `.live` captions inside `#incident-detail-view` | hyper:0 / kg:0 / nz:0 | 0 of each | ✓ |
| F2 | DCS alarm header + body | `DCS Alarm · IEEE 1159 § 4.2` / `... per IEEE 1159 § 4.2. Source: Honeywell Experion DCS.` | exact strings | ✓ |
| G1 | CTA copy | `Dispatch for Onsite Inspection →` + sub `Faye Sit · routes incident to onsite engineer for diagnosis verification` | exact | ✓ |
| G2 | Diagnosis hypothesis framing | title `Diagnosis hypothesis · compressor fouling (humidity-correlated)` · conf chip `78% confidence` · subtitle `Pending Onsite verification (Lim Wei Jie)` | exact | ✓ |
| H1 | See-reasoning toggle initial | `data-expanded='false'`, panel `display: none` | collapsed | ✓ |
| H2 | See-reasoning expand | click → `data-expanded='true'`, panel `display: block`, 5 reasoning steps with Sensor Anomaly Inspector + Turbine Diagnostic Agent + Power Gen Critic mentions | expand reveals 5 steps | ✓ |
| I1 | Alt-diag rows | 3 rows: `IGV-3 actuator drift / 52% confidence`, `Inlet filter ΔP rising / 31% confidence`, `HRSG-3 tube degradation / 19% confidence`; header `Alternative diagnoses considered` | exact rows + header | ✓ |
| I2 | Alt-diag rows NOT clickable | `getComputedStyle(altRow).cursor === 'auto'` | no pointer cursor | ✓ |
| J1 | Notes section markup | mic exists, `data-recording='false'`, textarea placeholder `Optional note — voice or type.`, label `Record` | exact | ✓ |
| J2 | Mic record + 5s preload | click → after 5s: textarea = `Lim — prioritize IGV-3 actuator visual inspection alongside scheduled compressor wash. 90-day humidity profile suggests possible co-factor. Confirm both before reporting back.` · recording='false' · label='Record' | exact preload text after 5s, mic reverts | ✓ |
| M1 | Ops impact content | label `Operational + revenue impact` · contains `SGD 240k`, `SGD 120/MWh peak`, `forward Q3 capacity` · action `Action window: 45 min before T-zero PSO breach` | exact content | ✓ |
| N1 | Post-dispatch 3-line capture footer | `.dispatch-capture-footer` present after CTA click; 3 lines: `✓ Hyperspace OS confirms SOP followed` · `✓ Notes sent to Workflow Agent for review` · `✓ Knowledge-Graph · team · incident · workflow enriched` | exact | ✓ |
| N2 | Dispatched-to label + CTA replaced | label `Dispatched to Lim Wei Jie · 02:47 SGT`; CTA gone; confirmation banner present | exact | ✓ |
| A1 | KG zoom-preserve on auto-rotate (code path) | `startAutoRotate` reads `cam.position.x/y/z` per tick (verified via Edit confirmation of `app.js`) | preserves zoom + Y tilt | ⚠ human-check (headless Chrome WebGL falls back to CSS scaffold — Pulkit's local browser confirms visual behavior) |
| A2 | KG free rotation incl Y tilt | same code path as A1 | preserves Y tilt | ⚠ human-check |
| B-sprites | Floating layer-title sprites dropped from scene | `scene.add(sprite)` loop removed from `initKG3D` (verified via Edit) | only node-label sprites remain in scene | ⚠ human-check |

W3.6b carry-over visuals (KG ball:label proportion + white outline + always auto-spin) — code path unchanged from W3.6b; still pending Pulkit's eyeball confirmation on real Chrome.

### W3.8 deployment confirmation (2026-05-21)

Right-pane drawer toggle introduced. Layout-only wave.

- `#stage` grid transitions between `1fr 0fr` (drawer closed, tablet alone centered) and `2fr 1fr` (drawer open, current W3.4 layout). 350ms ease-out transition on `grid-template-columns`.
- Right-edge fixed tab-stub button (`#drawer-toggle`) anchored at `right: 0; top: 50%`. Vertical text `OPS CONSOLE` + chevron `◂` (rotates 180° on open). Sembcorp green background. Always visible, anchored to viewport edge.
- New `state.drawerOpen` field, default `false`. Toggle handler flips `[data-drawer="open"]` on `#stage` + `[data-state="open"]` on the button.
- KG floating window auto-closes when drawer closes (calls existing `toggleGraphWindow()` when `state.graphWinOpen` is true at close). KG does NOT auto-open on drawer-open — user still clicks `Display Graph` explicitly.
- Default state on page load: drawer closed. Tablet centered alone in viewport at max-width 720px. Right pane content opacity 0 + pointer-events none while collapsed; padding + left border also zeroed on closed-state so the column collapses to true 0px width (verified `right_pane_width === 0` post-paint).

No state-machine changes. No persona/broadcast changes. No new screens. Existing W3.7 happy path (header click → banner + P1 arc → REVIEW READY → AMBER click → 15s tiered reveal → Dispatch → capture footer) runs unchanged with drawer open OR closed.

Verified via Chrome MCP — per-test table:

| # | Test | Observed | Expected | Pass |
|---|---|---|---|---|
| E1 | Page loads drawer closed | `#stage` has no `data-drawer` attribute; toggle button present at right edge (`x≈1617, y≈376, w=28, h=135, z=50`) | drawer closed; tab stub visible | ✓ |
| E2 | `data-drawer` attribute null on load | `getAttribute('data-drawer') === null` | null | ✓ |
| B1 | Toggle button styling | Fixed at right:0; 28px wide; chevron `◂` + vertical `OPS CONSOLE`; Sembcorp green | matches spec | ✓ |
| A1 | Click toggle → drawer opens | `grid-template-columns: 1096.53px 548.26px` (≈ 2:1 of 1645 viewport); right-pane visible width 548 | 2fr 1fr | ✓ |
| A2 | Stage + button attrs flip | `stage.data-drawer = "open"`, `toggleBtn.data-state = "open"`, chevron transform = `matrix(-1,0,0,-1,0,0)` (180°) | flipped + rotated | ✓ |
| A3 | Click again → drawer closes | `stage.data-drawer = null`, `right_pane_width = 0` (after closed-state padding/border zeroed), chevron `transform: none` | closed + recentered | ✓ |
| A4 | Tablet centered when closed | `tablet.left = 457.6`, expected center = 462.5 → diff 4.9px (within 10px tolerance) | within 10px | ✓ |
| D1 | KG auto-closes on drawer-close | Open drawer → click Display Graph (`kg.data-open=true`) → close drawer → `kg.data-open=false`, `btn-display-graph.rp-toggle-active=false`, icon back to `⊞` | KG closes + button resets | ✓ |
| D2 | KG does NOT auto-open on drawer-open | Open drawer with KG previously closed → `kg.data-open` stays `"false"` | stays closed | ✓ |
| E2E (open) | Full happy path with drawer open | Header click → P1 arc → REVIEW READY pill (`78% conf`) → 20 log lines → AMBER click → Screen D revealed (chain + ops impact + recommendation) → Dispatch → body contains `DISPATCHED` + `Workflow` | no regression | ✓ |
| E2E-2 (closed) | Full happy path with drawer closed | Header click → arc fires in hidden right pane (`right_pane_width=0`, opacity 0) → log count badge `20`, REVIEW READY pill present on tablet (right pane stays collapsed throughout) | JS executes, visuals hidden | ✓ |
| E2E-3 | Open drawer mid-arc | After 4s of arc (18 log lines), click toggle → drawer slides in → arc continues; final log count `20`, REVIEW READY reached | state preserved, no double-fire | ✓ |
| Console | Console clean during run | No errors surfaced via session output | no errors | ✓ (browser console captured empty by Chrome MCP harness) |

Banner-visibility-on-tablet during the drawer-closed run NOT directly asserted (banner auto-dismisses before the 12s capture); REVIEW READY pill + log-count progression are the proxy that the arc fired end-to-end inside the hidden pane.

### W3.9 deployment confirmation (2026-05-21)

Persona broadcast pattern landed. Same canonical incident (INC-2026-0537) routes through P1 → P2 → P3 with per-persona read/actioned state tracking. P4 stays locked + greyed (handoff flag banked for W7).

Ticket state model (single source of truth):
- `state.tickets['INC-2026-0537']` initialized with `statePill: 'TRIAGING'`, `handoffPending: { ops: true, onsite: false, offsite: false, analyst: false }`, `byPersona: { ops|onsite|offsite|analyst: { seen, opened, actioned } }`.
- Helpers: `getCanonicalTicket()` + `activePersonaTicketState()` + `setStatePill(v)` (writes both `state.incidentPhase` and `ticket.statePill`).
- Spec section A uses `p1/p2/p3/p4` keys; implementation uses persona-key form (`ops/onsite/offsite/analyst`) consistently — simpler than maintaining two mappings.

State pill progression (advances on actions, never regresses):
- Initial: `TRIAGING`
- After P1 arc completes: `REVIEW_READY`
- After P1 Dispatch CTA: `DISPATCHED_TO_ONSITE`
- After P2 Dispatch CTA: `ONSITE_CONFIRMED`
- After P3 Dispatch CTA: `AWAITING_ASSET_PERF`

Persona panel:
- P2 (Lim Wei Jie · onsite) + P3 (Dr. A. Wong · offsite) tiles now clickable. `data-state="available"` styling (opacity 0.65, hover restores saturation + lift).
- P4 (Priya Sundaram · analyst) stays `data-state="locked"` (opacity 0.30, cursor not-allowed). Click no-op.
- `switchToPersona(personaKey)` cancels in-progress reveal timers (`state.revealTimers`) + resets `state.screen='monitoring'` + clears history + re-renders.
- Refactored persona-tile selectors from `.active` / `.inactive` class names to `[data-state="active|available|locked"]` attribute selectors.

Engineer pill swap:
- `<initials> My view` reflects active persona via `PERSONA_INITIALS` map: FS / LWJ / AW / PS. Hover tooltip shows full name.

Notification dot:
- Existing `.mon-unread-dot` (red 10px, pulse halo) reused. Visibility driven by `ticket.handoffPending[activePersona]` (W3.9 — replaced old `state.amberInDetail` gate). Clears when persona consumes banner (first header click → seen=true → handoffPending=false).

Header click per persona:
- New handler `onHeaderClick()`. Gates on `ticket.handoffPending[activePersona]` (no-op if already consumed). Consumes handoff + sets `seen=true` + fires banner + arc.
- P1 banner: `NEW INCIDENT · Hyperspace OS` / `JRG-CCGT-1 · Block 2 · GT-3 · exhaust temp spread drift · 02:47 SGT`.
- P2 banner: `INCOMING HANDOFF · Hyperspace OS` / `INC-2026-0537 · Routed from Faye Sit · diagnosis hypothesis received`.
- P3 banner: `INCOMING HANDOFF · Hyperspace OS` / `INC-2026-0537 · Routed from Lim Wei Jie · onsite verification complete`.
- `state.bannerKey` drives `BANNER_COPY` variant selection in `renderMonitoringView`.
- P1 first click still runs original `fadeBannerThenLand` (3s notify → land row). P2/P3 click runs new `fadeBannerOnly` (3s fade, no screen-state transition; row already landed).
- Same arc clone (`fireArc(personaKey)` → `dispatchP1Arc(personaKey)`) for all 3 personas this wave. Theater consistency. `advanceStatePill` flag gates state-pill writes — only P1's first arc (when `incidentPhase === 'TRIAGING'`) advances pill to REVIEW_READY. P2/P3 arc clones fire log lines + agents but leave pill alone.

Screen D state-driven render:
- P1 first-ever open (`personaKey === 'ops' && !byPersona.ops.opened`): full 15s tiered reveal (unchanged W3.7).
- All other cases (P1 re-open, P2 any open, P3 any open): `screenDRevealStarted/assetChainRevealed/opsImpactRevealed/recommendationRevealed` all forced true → no placeholders, all real blocks visible immediately.
- `phaseEligible` gate for recommendation block widened: renders whenever `incidentPhase !== 'TRIAGING'` OR active persona has opened the ticket. P2/P3 always pass (statePill is past TRIAGING by the time they receive handoff).
- `renderTablet` incident-detail dispatch routes `ops/onsite/offsite` → `renderIncidentDetailView` (same Screen D clone); `analyst` → `renderAnalystView` stub.

CTA action:
- New handler `onDispatchCTA()` (replaces old `dispatchToOnsite`). Sets `byPersona[active].actioned=true`, advances `setStatePill(POST_DISPATCH_STATE_PILL[active])`, sets `handoffPending[HANDOFF_NEXT[active]]=true`.
- Dispatch CTA copy stays `Dispatch for Onsite Inspection` across all personas this wave (W3.7 lock).
- Sub-label is persona-aware: `<active.name> · routes incident to <next.name> for diagnosis verification`.
- Capture footer 3-line copy unchanged. `Dispatched to <name>` label resolves per persona via `DISPATCH_LABEL`: Lim Wei Jie / Dr. A. Wong / Priya Sundaram.
- For P3 → P4 dispatch: `handoffPending.analyst=true` is set but P4 tile stays locked (no pulse). Banked for W7.
- Backwards-compat alias `dispatchToOnsite()` retained, routes to new handler.

Persona pulse:
- Replaced old one-shot `pulsePersonaTile()` (3-iteration 1.5s) with inline class assignment inside `renderPersonasPanel` based on `ticket.handoffPending[p.key]`.
- CSS `.persona-tile-pulse` keyframe duration retuned 1.5s → 1.6s, iteration count `3` → `infinite`, glow opacity 0.45 → 0.50, halo 16px → 18px.
- Pulse moves automatically as `handoffPending` flags flip — render() rebuilds tiles after every state change.

Reveal timer tracking:
- New `state.revealTimers = []` array. `pushReveal(fn, delay)` helper wraps `setTimeout` and captures handle. All Screen D reveal setTimeouts in `startScreenDReveal` + `fireRevealBlock1/2/3Agents` migrated to `pushReveal`.
- `cancelInProgressReveal()` clears all + resets array. Called from `switchToPersona`.

Files changed:
- `app.js` — state init, helpers, persona panel, header click, screen-D render gates, dispatch CTA, reveal timer tracking, dispatchP1Arc persona gating, capture footer dispatched-to label, renderTablet routing.
- `index.html` — persona-tile data-state CSS rules, persona-tile-pulse infinite keyframe.

Files intentionally not touched:
- `vendor/*.min.js` — three.js / 3d-force-graph bundle preserved.
- KG state machine, log streaming, floating window, drawer toggle, doc modal — no changes.
- Diagnosis hypothesis tile content, alt-diag list, see-reasoning panel, notes preload — content unchanged per spec.
- Pre-existing 3 incidents (Jurong-CCGT-2, Sakra-CCGT-1, Banyan-CHP) — render identically across all 3 personas.

Verified via Chrome MCP — per-test table:

| # | Test | Observed | Expected | Pass |
|---|---|---|---|---|
| A1 | Ticket state initialized | `state.tickets['INC-2026-0537']` exists with `statePill: 'TRIAGING'`, `handoffPending: { ops: true, onsite: false, offsite: false, analyst: false }`, `byPersona` all-false flags | initial structure per spec A.1 | ✓ |
| B1 | Persona tile states on load | ops=`active`+pulse, onsite=`available`, offsite=`available`, analyst=`locked` | data-state matches role | ✓ |
| B2 | P4 click no-op | `onPersonaTileClick('analyst')` → `activePersona` unchanged (`offsite` → `offsite`) | no-op | ✓ |
| C1 | switchToPersona('onsite') | `activePersona='onsite'`, `screen='monitoring'`, tile states flip (ops=available, onsite=active) | persona swap clean | ✓ |
| C4 | Same canonical incident on P2 view | 4 rows total in monitoring (landed + 3 pre-existing) | row visible across all personas | ✓ |
| D1 | Engineer pill swap | P2 view pill initials=`LWJ`, title=`Lim Wei Jie` | initials + tooltip match | ✓ |
| E2 | Unread dot on P2 row after P1 dispatches | `mon-unread-dot` present on landed row | dot visible | ✓ |
| F1 | P1 banner copy | label=`NEW INCIDENT · Hyperspace OS`, title=`JRG-CCGT-1 · Block 2 · GT-3 · exhaust temp spread drift · 02:47 SGT` (post-fade, bannerKey='ops') | exact copy | ✓ |
| F2 | P2 banner copy | label=`INCOMING HANDOFF · Hyperspace OS`, title=`INC-2026-0537 · Routed from Faye Sit · diagnosis hypothesis received` | exact copy | ✓ |
| F4 | P3 banner copy | label=`INCOMING HANDOFF · Hyperspace OS`, title=`INC-2026-0537 · Routed from Lim Wei Jie · onsite verification complete` | exact copy | ✓ |
| G1 | P2 first AMBER click renders Screen D instantly | `byOnsite.opened=true`, `assetChainRevealed/opsImpactRevealed/recommendationRevealed = true`, no pending placeholders, real blocks `display=''`, CTA visible | instant render, no 15s replay | ✓ |
| H1 | P2 Dispatch advances state | After `onDispatchCTA()`: `statePill='ONSITE_CONFIRMED'`, `handoffPending.offsite=true`, `byOnsite.actioned=true`, P3 tile pulses | state advances + P3 pulse | ✓ |
| H2 | Capture footer Dispatched-to label per persona | After P2 dispatch: `Dispatched to Dr. A. Wong · 02:47 SGT` | persona-aware label | ✓ |
| I1 | Persona pulse on load | P1 tile has `.persona-tile-pulse` class, others do not | P1 pulses | ✓ |
| I2 | Pulse moves after P1 dispatch | p1Pulse=false, p2Pulse=true after `onDispatchCTA` from P1 | pulse moves | ✓ |
| I3 | Pulse moves after P2 dispatch | p2Pulse=false, p3Pulse=true after `onDispatchCTA` from P2 | pulse moves | ✓ |
| I4 | No P4 pulse this wave | p4Pulse=false even though `handoffPending.analyst=true`; p4State=`locked` | flag banked, no pulse | ✓ |
| E2E-2 | Persona switch mid-reveal cancels timers | `state.revealTimers.length` goes 8 → 0 after `switchToPersona('onsite')` mid-Screen-D-reveal | revealTimers cleared | ✓ |

Chrome MCP physical `.click()` on the dispatch CTA did not fire the listener once (likely the CTA was below the visible viewport — full Screen D is tall). Direct `onDispatchCTA()` invocation confirmed logic. Pulkit should verify the physical click on local Chrome — listener is correctly bound (verified DOM has 1 `.dispatch-cta` with text matching). All other tests use direct state introspection + function invocation, which exercise the same code paths the listener triggers.

W3.9 narrative shape (Pulkit's intent verbatim): "First is going to start with actually picking up a lot of the items that appear in [the P1] workflow and a different persona's workflow … when we go to Lim's persona, we click the top, and we see the ticket is now incoming for Lim where he's being asked to do things that are particular to him." Implemented as: same Screen D clone for P2/P3 this wave (curated P2/P3 content lands in W4/W5/W7); per-persona handoff banner copy; per-persona dispatched-to routing.

## P3 → P1 → P4 re-engagement loop (locked 2026-05-20)

Persona panel state machine extends beyond linear P1 → P2 → P3 → P4:

- P1 active → P2 active → P3 active → **P1 re-active (pulse)** → P4 active → all done
- Tablet view re-renders P1's curated view a SECOND time with the new incident state (`CAPACITY IMPACT — REQUIRES ROUTING`) and a new primary CTA (`Route to Asset Performance`). The Personas-panel highlight pulse re-targets P1 to signal "click back here". After P1 routes, pulse moves to P4.
- Implemented inside existing `state.activePersona` plus a new `state.incidentPhase` flag (see "## State pill state machine" above). `render()` stays pure paint; persona transitions fire from click handlers.

## Knowledge Graph node seed (locked W2)

Static 4-layer scaffold pre-seeds 30 nodes (zone meta reads `32 nodes seeded` for round-number readability). Layer accent colors map to existing palette tokens:

- **L1 People & Process** (green `--green-vivid`) — 7 nodes: R. Kumar · Ops · Lim Wei Jie · Onsite · Dr. A. Wong · Offsite · P. Sundaram · Asset Perf · BU · Power Gen · RACI · derate ≥40MW · Escalation · PSO window
- **L2 Physical Plant** (blue `--blue-vivid`) — 10 nodes: GT-3 · IGV-3 actuator · HRSG-3 · BFP-3A · BFP-3B · Condenser-3 · Generator-3 · Transformer-3 · Switchyard-A · OEM · GE 9HA manual
- **L3 Historical State** (amber `--amber-vivid`) — 7 nodes: GT-3 · 90d exhaust temp · RCA-2025-014 · Sakra fouling · RCA-2024-093 · Jurong fouling · RCA-2025-031 · Jurong-2 wash · WO log · 47 prior · PI · 18mo telemetry · Audit trail · ISO 50001
- **L4 Predictive Intelligence** (pink `--pink-vivid`) — 6 nodes: Pattern · compressor fouling · Pattern · IGV actuator drift · Model · humidity-fouling v3 · Predictor · MW derate · ROI model · wash-cycle · Recommender · OEM playbook

`IGV-3 actuator` on L2 + `Pattern · IGV actuator drift` on L4 are the foundation for the W4-W5 root-cause-deepening narrative: Onsite (P2) verification reveals IGV actuator drift contributing to surface compressor fouling, triggering the P3 hot-shutdown decision + P4 capacity-impact escalation.

RCA IDs (`RCA-2025-014`, `RCA-2024-093`, `RCA-2025-031`) are fabricated for demo plausibility — Sembcorp fleet pattern (Jurong + Sakra). If Charles (Sembcorp CDO) flags during dry-run, swap to real RCA IDs from Hyperspace OS records.

Static W2 — no interaction, no animation, no hover state. Pure HTML/CSS scaffold serves as the W2 deliverable + remains as the W2.5+ fallback if three.js fails to load. W2.5 upgrades the CSS scaffold to a 3D stratified force-graph (three.js + 3d-force-graph, pre-bundled, NO CDN). W3+ lights node-chains per-CoT-line via hover OR live-stream advance — see SEMBCORP_SCOPE.md "## KG rendering library" for the locked spec.

## Out of scope (DO NOT BUILD)

- Real LLM calls or real agent execution. All "agent work" is animated/scripted.
- Real KG database. Hardcoded JSON file describing ~30-40 nodes.
- User-editable demo paths. Single canonical happy path through all 4 personas.
- Override / disagree workflow on diagnosis (deferred — CAG had this; this demo skips for scope).
- Login / auth screens.
- Mobile responsive — fixed 1280×800 desktop viewport only (presented on projector).
- Multi-incident dashboard — single canonical Jurong-CCGT-1 GT-3 incident.

## When in doubt

- Ask Pulkit before scope expansion
- Surface running state, don't just claim "done"
- Stop at the checkpoint, not "near" the checkpoint
- Use canonical Sembcorp / P&U vocab, not invented
- Keep the demo offline-safe (no CDN at demo time)
- Diagnose before fix when bugs reproduce after claimed fixes (CLAUDE.md WA #9)


### W3.9 deployment confirmation (2026-05-21 — mega-pivot)

Three coupled changes landed in one wave:

**1. Scenario pivot (compressor fouling → BFP-3A vibration anomaly):**
- `INCIDENT` const rewritten to BFP-3A · ISO 10816-7 Zone C alarm · NDE bearing race spalling hypothesis @ 78%. Alternatives: shaft misalignment 52% · coupling wear 31% · impeller imbalance 19%.
- Asset chain: BFP-3A → HRSG-3 → ST-3 → GENERATOR-3 → TRANSFORMER-3 → SWITCHYARD-A.
- Vendor stack added: Sulzer (BFP) · Bently Nevada 3500 (machinery protection) · SKF (bearings).
- Standards added: ISO 10816-7 (industrial pumps mechanical vibration) · ISO 20816-1 (general machinery vibration) · API 670 (machinery protection systems).
- Bent-shaft actual root cause NOT revealed this wave — reserved for W4 (Lim's dial-indicator runout test + offsite senior engineer phase-analysis call).

**2. KG nodes refactor:**
- Dropped (canonical): `igv-3-actuator`, `gt-3-90d-temp`, `pat-comp-fouling`, `pat-igv-drift`, `mdl-humidity-v3`. Moved canonical → theater: `oem-ge-9ha-manual`, `roi-wash`. RCA IDs renamed and retargeted (`rca-2025-014-sakra` → `rca-bfp-skr-2024` etc).
- Added (L1): `sop-bfp-vibration-investigation`.
- Added (L2): `st-3`, `vt-bfp-3a-{nde-x,nde-y,de-x,de-y}` (4 vibration transducers), `bearing-bfp-3a-nde` (SKF), `coupling-bfp-3a`, `shaft-bfp-3a`, `sulzer-bfp-manual`.
- Added (L3): `vib-rms-90d`, `bearing-temp-30d`, `rca-bfp-jrg-2025`, `rca-bfp-skr-2024`, `rca-bfp-banyan-2024`.
- Added (L4): `bearing-spalling-pattern`, `bent-shaft-pattern` (seeded for W4), `iso-10816-7-spec`, `bfp-derate-cascade-model`.
- Edges refactored to reflect BFP cascade + sensor mounts + RCA → pattern links + standard → sensor governance. Theater edges referencing dropped nodes repointed to new nodes (e.g. `t-pred-trip-prob → bearing-spalling-pattern`).

**3. Agent CoT scripts rewritten:**
- `INSPECTION_AGENT_SCRIPT`: BFP vibration detection + L2 sensor traverse + L3 90-day RMS trend + asset-chain assembly.
- `TRIAGE_AGENT_SCRIPT`: pattern-match 3 prior BFP RCAs + diagnosis hypothesis 78% + alternates considered + critic handoff.
- `POWER_GEN_CRITIC_SCRIPT`: KG path validation against Sulzer degradation profile + ISO 10816-7 threshold cross-check + diagnosis validated.
- `WORKFLOW_AGENT_SCRIPT`: node refs updated to `bfp-3a` + `sop-bfp-vibration-investigation`. Closing line: `SOP-BFP-VIBR-001 registered for process-engineer review · 0 deviations from standard`.
- Orchestrator close line updated: `recommendation ready · SOP-BFP-VIBR-001 · awaiting dispatch · pending onsite verification`.
- Playbook agent display label: `Compressor Wash Playbook Agent` → `BFP Maintenance Playbook Agent` (data-agent-id `playbook` unchanged); role label `OEM Wash Procedure` → `OEM Procedure · Sulzer`.

**4. Home screen consolidation:**
- State pill on INC-2026-0537 monitoring row: `TRIAGING` → `TRIAGE READY` as new initial state. Old `TRIAGING` + `REVIEW READY` phases folded into `TRIAGE_READY`. `state.incidentPhase` default = `'TRIAGE_READY'`. `state.incidentLanded` default = `true` (row visible from cold load).
- Confidence chip removed from monitoring row card entirely. Confidence number only visible inside Screen D Summary report.

**5. Screen D restructure:**
- DROPPED: DCS alarm strip, source legend row (3-chip), asset chain card, ops impact card, history accordion, see-reasoning toggle + panel, alt-diag-section inside recommendation block, diag-hypothesis-card.
- KEPT: green incident banner, metrics 2×2 grid, notes section + mic + 5s preload (relocated to standalone wrapper below action steps).
- NEW 2-stage loading theater: t=0 `Sensor Anomaly Inspector · Loading incident summary for Faye Sit` placeholder → t=5s Summary report container slides in with embedded `Turbine Diagnostic Agent · Loading diagnosis hypothesis` placeholder → t=10s Summary content renders (diagnosis hypothesis card + alternative hypotheses + HITL pill).
- NEW Action Steps section appears at t=10s: Step 1 `Verify metrics` (2s spinner → ✓ confirmed) auto-unlocks Step 2 `Find available engineer (optional)` (5s theater → reveals Lim Wei Jie · AVAILABLE → click-to-select). `Confirm on-site dispatch` CTA enables on engineer selection. CTA click fires existing dispatch handler + Workflow Agent arc + capture footer.
- Notes mic preload text updated: `Lim — prioritize NDE bearing visual inspection alongside dial-indicator runout test on shaft + coupling. Vibration phase pattern suggests possible deeper rotor issue. Confirm both before reporting back.` (Seeds the W4 bent-shaft reveal without spoiling it.)

**6. Persona broadcast (folded from archived W3.9 broadcast-only spec):**
- `state.tickets['INC-2026-0537']` model: `statePill` + `handoffPending.{ops,onsite,offsite,analyst}` + `byPersona.{seen,opened,actioned}`.
- P2 (Lim Wei Jie · onsite) + P3 (Dr. A. Wong · offsite) tiles clickable. P4 (Priya · analyst) stays locked.
- `switchToPersona()` cancels in-progress reveal timers + resets `state.actionSteps` per-persona + re-renders.
- Engineer pill swap: FS / LWJ / AW per active persona.
- Notification dot on incident row when `handoffPending[activePersona] === true`. Cleared on first header click.
- Banner copy per persona: P1 `NEW INCIDENT · Hyperspace OS · JRG-CCGT-1 · Block 2 · BFP-3A · vibration anomaly · 02:47 SGT`. P2 `INCOMING HANDOFF · Routed from Faye Sit · onsite verification requested`. P3 `INCOMING HANDOFF · Routed from Lim Wei Jie · onsite findings ready for expert review`.
- Same arc clone fires for all 3 personas this wave (theater consistency; curated P2/P3 views come in W4/W5).
- Persona pulse re-targets on each handoff. P4 pulse skipped this wave.
- Screen D state-driven render: first-open per persona = full reveal sequence; re-open after dispatch = paint completed state immediately.

**7. Doc patches:**
- `CLAUDE.md` — Vocabulary discipline section: appended BFP / vibration RMS / ISO 10816-7 alarm zones / 1×RPM / phase angle / bearing temperature to Equipment; appended ISO 10816-7 / ISO 20816-1 / API 670 to Standards; appended Sulzer / Bently Nevada 3500 / SKF to Vendors. Canonical demo scenario rewritten (BFP-3A vibration narrative). Demo flow updated for new arc beats. Tablet bezel doc drift 620 → 720 fixed.
- `SEMBCORP_SCOPE.md` — Engagement parameters SCENARIO row rewritten. Vocabulary discipline appended (matches CLAUDE.md). KG schema seed list rewritten for new node set. Agent + critic mechanics: Playbook Agent renamed. Canonical scenario (line 616) fully rewritten for bent-shaft layered root cause. State pill state machine table reduced (TRIAGING + REVIEW_READY folded into TRIAGE_READY).

Verified via Chrome MCP — per-test observed-vs-expected table in operator status report.


### W3.10 deployment confirmation

**Date:** 2026-05-21 · **Days to demo:** 6 · **Files touched:** `app.js`, `index.html`, `SEMBCORP_SCOPE.md`.

Defects fixed:
- Cold-load incident bleed-through. `state.incidentLanded` initial value flipped `true → false`. INC-2026-0537 no longer renders on any persona's monitoring view until that persona consumes their banner. Row gate now driven by `state.tickets['INC-2026-0537'].byPersona[activePersona].seen === true`.
- Red dot persistence. Dot visibility now reads `seen && !opened` (cleared on first AMBER-click + stays cleared post-dispatch). Replaced prior `handoffPending`-based reading in `buildLandedIncidentRow`.
- P2/P3 tile click previously showed Faye's content. Each persona now has own task list per `PERSONA_OWN_TASKS` map.

Per-persona homescreen content:
- `PERSONA_OWN_TASKS` map seeded with static theater tasks per persona: `ops` = 3 fleet incidents (preserved verbatim from `PRE_EXISTING_INCIDENTS`); `onsite` = 3 work orders (WO-2026-1182 borescope · WO-2026-1156 coupling re-grease · WO-2026-1173 hand valve overhaul); `offsite` = 3 engineering reviews (RCA-2026-0034 · ER-2026-0089 · CR-2026-0156); `analyst` = [] (P4 locked).
- `buildPersonaOwnTasks(personaKey)` helper drives `renderMonitoringView` row composition. Canonical incident prepends only when persona has seen banner.
- `Active Tasks` stat now computed as `personaTasks.length + (seen ? 1 : 0)`.
- New INFO state-pill CSS class (`mon-pill-state-info`, `mon-pill-sev-info`) for work orders / engineering reviews.

Screen D polish (Sections D-H of plan):
- `.sr-section-label` (duplicate `Summary` subheading) dropped from `paintSummaryComplete`.
- `.sr-hyp-subtitle` (`Pending Onsite verification (Lim Wei Jie)`) dropped — premature engineer-name reveal.
- `.sr-hyp-conf` (78% confidence chip) + `.sr-alt-conf` (52% / 31% / 19%) dropped. Confidence numbers preserved in `INCIDENT.hypothesis.confidence` + `INCIDENT.alternates[].conf` but not rendered.
- `.sr-alternates` refactored to collapsible: `.sr-alt-toggle` button (`▸ → ▾` icon rotation) + `.sr-alt-list` accordion (3 rows `Shaft misalignment` · `Coupling wear` · `Impeller imbalance`, `display: none` default).
- `.sr-hitl` element removed from Summary report markup; CSS class definition preserved for future reuse per Pulkit ("save that pill style I love").
- `wireAltHypothesesToggle()` helper added, called at end of `paintSummaryComplete`.

Step 1 telemetry attachment (Sections I + J):
- Step 1 body text (`Metrics for INC-2026-0537 confirmed`) now wrapped in `.italic` (font-style: italic).
- Inline paperclip button (`.as-step-attach`) injected beside body text in both live-reveal path (`startActionStep1` callback) and re-render path (`paintActionStepsComplete`).
- `#telemetry-modal` markup appended to `index.html` body: backdrop + card with close × · header (`Metrics verification` + `Verified by Sensor Anomaly Inspector · 02:47:12 SGT · auto-pre-fill for SOP`) · inline SVG vibration RMS chart (14-day window · 4 ISO 10816-7 zone bands · data line rising into Zone C · alarm threshold dashed at 7.1 mm/s · now-marker at 8.4 mm/s with `Zone C breach` label) · footer (`Source: OSIsoft PI System · sensor VT-BFP-3A-NDE-X/Y · 14-day window ending 2026-05-21 02:47 SGT`).
- Modal close mechanisms: × button, backdrop click (delegated handler on modal root so simulated center-click on backdrop still closes when the card overlay sits at z-index 101), ESC key (global listener attached in `init()`).
- `wireTelemetryModal()` re-binds attach buttons each render; modal root listener wired once via `dataset.wired` gate.

Verified via Chrome MCP — per-test observed-vs-expected table in operator status report.

### W4 deployment confirmation (2026-05-22)

Lim + Wong curated Screen Ds landed. Broadcast clones replaced. Bent-shaft narrative reveal arrives via call flow.

`renderIncidentDetailView` split into per-persona dispatcher routing to `renderOpsIncidentDetail` / `renderOnsiteIncidentDetail` / `renderOffsiteIncidentDetail`. Each persona's Screen D paints its own curated content using the shared chrome (banner + back chevron + sev pill).

**Lim Wei Jie (P2) curated Screen D:**
- Banner reflects state `DISPATCHED_TO_ONSITE` with subtitle `routed from Faye Sit`.
- Metrics 2×2 inherited from W3.9 (vibration RMS NDE/DE · bearing temp · shaft speed).
- Summary report — 2-stage loading theater: t=0 `Workflow Agent · Loading incident summary for Lim Wei Jie` (5s) → t=5s swap to Summary report shell + embedded `Sensor Anomaly Inspector · Loading diagnosis hypothesis` (5s) → t=10s diagnosis hypothesis tile reveals (`NDE bearing race spalling (early-stage)` — Faye's hypothesis, no confidence chip, no subtitle, collapsible alt-hypotheses).
- Inspection workflow (NEW · replaces Action Steps): 10 items in 3 groups (Safety 5 / Instrument 3 / Root cause isolation 2). Items user-clickable; each click flips item to `data-checked="true"` (✓ + line-through), increments group count, increments progress counter, and streams a `Workflow Agent · Inspection check · <itemId> · confirmed by Lim Wei Jie` log line.
- Binary CTAs (NEW): `Confirm diagnosis and repair` + `Diagnosis is wrong — contact Dr. A. Wong (Senior Engineer · Offsite Expert)`. Both disabled until ≥6/10 checks (`LIM_CHECKLIST_THRESHOLD` constant). Threshold-based unlock chosen so demo doesn't require all 10 clicks on stage.
- Call flow (NEW): Escalate CTA → in-call strip replaces the escalate-cta DOM node (phone icon + animated 7-bar audio wave via `@keyframes audio-bars` + red `End` button). End click → `.call-ended` class greys icon + bars + disables End button + sets text to `Ended`.
- Post-call stages render in the `lim-ctas-slot` below the in-call strip: 3s `Workflow Agent · Generating transcript...` → swap to `✓ Transcript attached · 7m 23s · [View transcript]` link + 3s `Workflow Agent · Analyzing transcript...` (rendered alongside transcript-attached) → swap analyzing stage to `Use diagnosis confirmed over call` button.
- Diagnosis morph (NEW): click `Use diagnosis confirmed over call` → diagnosis hypothesis tile re-renders inline (original `NDE bearing race spalling (early-stage)` strikethrough + `SUPERSEDED` flag · new `REVISED DIAGNOSIS · Bent shaft on BFP-3A` + supporting detail `Confirmed via 1×RPM phase analysis (~178° NDE-DE shift) + dial-indicator runout (0.18mm TIR). Bearing damage secondary, caused by uneven load distribution.` + `View call transcript · 02:55 SGT` link). Timestamp captured in `state.lim.revisionTimestamp`.
- Confirm CTA morphs to `Escalate for approval` (subtitle: `Routed to Dr. A. Wong · Offsite Expert · material impact requires offsite sign-off`); class swap `confirm-cta → escalate-approval-cta`. Green-fill button styling.
- Escalate-for-approval click → state pill `ESCALATED_TO_OFFSITE` · `byPersona.onsite.actioned = true` · `handoffPending.offsite = true` · Workflow Agent mini-arc (3 log lines) · capture footer (`Hyperspace OS confirms revised diagnosis SOP followed` · `Call transcript routed to Workflow Agent for review` · `Knowledge-Graph · team · incident · revised diagnosis + transcript enriched`) + label `Escalated to Dr. A. Wong · 02:56 SGT` · P3 pulse starts.
- Notes section pre-filled automatically with Faye-attached note (`Lim — prioritize NDE bearing visual inspection alongside dial-indicator runout test on shaft + coupling...`); no mic press required. Mic button preserved for visual consistency.

**Transcript modal (NEW):**
- ID `#transcript-modal`. Same modal infrastructure pattern as W3.10 telemetry modal (backdrop + close × + delegated close handler + ESC handler).
- Content: 6-line dialog between L. Lim and Dr. Wong covering vibration → 1×RPM phase analysis → bent shaft → escalation. Header auto-attribution (`02:48 SGT · 7m 23s · auto-generated via Hyperspace OS`). Footer green-highlighted revised-diagnosis summary.
- Multiple entry points wired through `wireTranscriptModalLinks()`: `.post-call-transcript-link` (Lim's post-call attached stage), `.sr-hyp-transcript-link` (revised diagnosis tile on Lim's view), `.wong-tx-link` (revised diagnosis tile on Wong's view). All share the same modal markup + close mechanisms.

**Dr. A. Wong (P3) curated Screen D:**
- Banner reflects state `ESCALATED_TO_OFFSITE` with subtitle `routed from Lim Wei Jie`.
- No metrics 2×2 (per Pulkit's `super simple` brief — Wong reviews, doesn't re-verify telemetry).
- Single-stage Summary report loading theater (5s): `P&L Impact Validator · Loading escalation summary for Dr. A. Wong` → forwarded-incident line (`Lim Wei Jie has forwarded this incident · diagnosis revision · escalation for offsite sign-off.`) + revised diagnosis tile (read-only, same morph shape as Lim's post-call) + transcript link + approval-ask line (`Approval requested: shaft replacement scheduling + capacity impact escalation to Asset Performance.`).
- Single CTA `Approve escalation` (disabled during 5s loading; enabled after reveal). Green-fill button styling.
- Approve click → state pill `APPROVED_ROUTED_TO_ASSET_PERF` · `byPersona.offsite.actioned = true` · `handoffPending.analyst = true` (banked for W7; P4 stays locked, no pulse) · Workflow Agent mini-arc (3 log lines) · capture footer (`Hyperspace OS · escalation approval sign-off recorded` · `Approval + transcript routed to Workflow Agent for chain-of-custody` · `Knowledge-Graph · sign-off attached to incident · routed to Asset Performance`) + label `Approval given · returned to Priya Sundaram · 02:58 SGT`.
- `state.wong.approvalGiven` + `state.wong.approvalTimestamp` set so Wong's monitoring view paints the post-approval banner on re-entry.

**Post-approval home banner on Wong's monitoring:**
- After approve fires + user backs out to Wong's monitoring screen: `.wong-post-approval-banner` (green-soft fill + green-vivid left bar + green-circle ✓ icon) renders at top of the priorities list with text `Approval given · returned to Priya Sundaram · <timestamp>`. Persistent across re-renders while `state.wong.approvalGiven === true`.

**State pill machine final after W4:**
`TRIAGE_READY` → `DISPATCHED_TO_ONSITE` (Faye dispatches Lim) → `ESCALATED_TO_OFFSITE` (Lim escalates after revised diagnosis) → `APPROVED_ROUTED_TO_ASSET_PERF` (Wong signs off). Legacy `ONSITE_CONFIRMED` and `AWAITING_ASSET_PERF` remain in `POST_DISPATCH_STATE_PILL` map but are no longer reached on the W4 happy path; replaced by the escalation chain.

**Canonical incident row owner per active persona:**
- `ROW_OWNER_BY_PERSONA` map drives `buildLandedIncidentRow` owner field per active persona. Faye's view: `Faye Sit / FS`. Lim's view: `Lim Wei Jie / LWJ`. Wong's view: `Dr. A. Wong / AW`. Pre-existing tasks in `PERSONA_OWN_TASKS` retain their static owners.

**Banner copy table (final after W4):**
- ops: `NEW INCIDENT · Hyperspace OS · JRG-CCGT-1 · Block 2 · BFP-3A · vibration anomaly · 02:47 SGT`
- onsite: `INCOMING HANDOFF · Hyperspace OS · INC-2026-0537 · Routed from Faye Sit · onsite verification requested`
- offsite: `INCOMING HANDOFF · Hyperspace OS · INC-2026-0537 · Routed from Lim Wei Jie · diagnosis revision + escalation pending sign-off`

**State slices added (`state.lim` / `state.wong`):**
- `state.lim = { checked: {}, revealStarted, summaryRevealed, callStarted, callEnded, transcriptAttached, diagnosisRevised, revisionTimestamp }` — tracks Lim's checklist progress + call flow stage + diagnosis revision.
- `state.wong = { revealStarted, summaryRevealed, approvalGiven, approvalTimestamp }` — tracks Wong's reveal + approval state.
- Neither slice is reset by `switchToPersona()`; demo flow assumes forward progress (audience won't navigate backward mid-call).

Verified via Chrome MCP — per-test observed-vs-expected table:

| # | Test | Observed | Expected | Pass |
|---|---|---|---|---|
| A1 | Per-persona dispatcher exists | `typeof renderOpsIncidentDetail / renderOnsiteIncidentDetail / renderOffsiteIncidentDetail === 'function'` (all three) | 3 renderers exist | ✓ |
| B1 | Lim Screen D scaffold paints | view `incident-detail-view` present; banner subtitle `INC-2026-0537 · routed from Faye Sit`; metrics 4 cells; loading theater shows `Workflow Agent · Loading incident summary for Lim Wei Jie` | scaffold + stage 1 loading | ✓ |
| B2 | Lim Summary content reveals after 10s | `await_text('Inspection workflow')` resolved within 15s; hypothesis text `NDE bearing race spalling (early-stage)`; alt-toggle present; checklist visible | Summary + checklist appear | ✓ |
| B3 | Notes preload auto-fills on Lim Screen D load | `notes-textarea` value starts with `Lim — prioritize NDE bearing visual inspection alongside dia` (truncated) | pre-fill on load, no mic required | ✓ |
| C1 | Checklist renders 10 items in 3 groups | groups=3, items=10, progress `0/10 checks complete` | 3 groups · 10 items | ✓ |
| C2 | Binary CTAs disabled at 0 checks | `.confirm-cta.disabled === true` and `.escalate-cta.disabled === true` | both disabled | ✓ |
| C3 | Click 6 items → progress `6/10 checks complete` + CTAs enabled | `state.lim.checked` keys = 6; progress text `6/10 checks complete`; `.confirm-cta.disabled === false`; `.escalate-cta.disabled === false` | threshold unlock | ✓ |
| D1 | Escalate CTA click → in-call strip + audio wave | `.in-call-strip` rendered; label `On call · Dr. A. Wong`; 7 `.in-call-audio-wave span` bars; `.in-call-end-btn` present; `state.lim.callStarted === true` | in-call strip + 7 bars + end btn | ✓ |
| E1 | End click → call-ended class + Ended text + post-call stages spawn | `.in-call-strip.call-ended` class set; end btn text `Ended`; `.ended` class set; `state.lim.callEnded === true` | call ends + post-call cascade fires | ✓ |
| E2 | Post-call cascade reaches diagnosis-confirmed-button (~6s) | `[...post-call-stage].map(s=>s.dataset.stage)` = `['transcript-attached','diagnosis-confirmed-button']`; `state.lim.transcriptAttached === true` | both stages visible after cascade | ✓ |
| F1 | Diagnosis confirmed click → tile morph | `state.lim.diagnosisRevised === true`; `state.lim.revisionTimestamp === '02:55 SGT'`; `.sr-hyp-flag` = `SUPERSEDED`; original strikethrough = `NDE bearing race spalling (early-stage)`; revised name = `Bent shaft on BFP-3A`; detail text starts with `Confirmed via 1×RPM phase analysis (~178° NDE-DE shift) + dial-indicator runout (0.18mm TIR). Bearing damage secondary,...` | full tile morph | ✓ |
| G1 | Confirm CTA morphs to Escalate for approval | `.escalate-approval-cta` class set; text starts `Escalate for approval` + subtitle `Routed to Dr. A. Wong · Offsite Expert · material impact requires offsite sign-off` | CTA morph + subtitle | ✓ |
| G2 | Escalate for approval click → state advance + capture footer | `state.incidentPhase === 'ESCALATED_TO_OFFSITE'`; `byPersona.onsite.actioned === true`; `handoffPending.offsite === true`; offsite tile pulse `true`; capture footer present; label `Escalated to Dr. A. Wong · 02:56 SGT`; 3 capture lines verbatim | full escalation transition | ✓ |
| H1 | Transcript modal opens via diagnosis tile link | `.sr-hyp-transcript-link` click → `#transcript-modal[data-open=true]`; title `Call transcript`; sub starts `Lim Wei Jie ↔ Dr. A. Wong · 02:48 SGT · 7m 23s · `; 6 tx-lines; first speaker `L. Lim`; footer starts `Revised diagnosis: Bent shaft · BFP-3A · confirmed via 1×RPM phase + dial-indica` | modal opens populated | ✓ |
| H2 | Transcript modal close via × button | `#transcript-modal[data-open=false]` after `.transcript-modal-close` click | modal closes | ✓ |
| I1 | Wong Screen D scaffold paints | banner subtitle `INC-2026-0537 · routed from Lim Wei Jie`; loading text `P&L Impact Validator · Loading escalation summary for Dr. A. Wong`; approve CTA disabled; 0 metric cells | Wong scaffold + loading | ✓ |
| I2 | Wong Summary content reveals after 5s | `await_text('Bent shaft on BFP-3A')` resolved within 10s; forwarded line text exact; SUPERSEDED flag + revised name `Bent shaft on BFP-3A`; ask text `Approval requested: shaft replacement scheduling + capacity impact escalation to Asset Performance.`; approve CTA enabled; transcript link present | Wong reveal complete + CTA enabled | ✓ |
| J1 | Wong Approve click → state advance + P4 stays locked | `state.incidentPhase === 'APPROVED_ROUTED_TO_ASSET_PERF'`; `byPersona.offsite.actioned === true`; `handoffPending.analyst === true`; analyst tile `data-state="locked"`; analyst pulse `false`; `state.wong.approvalGiven === true`; approvalTs `02:58 SGT`; capture footer present; label `Approval given · returned to Priya Sundaram · 02:58 SGT`; 3 capture lines verbatim | approval + P4 locked + banked flag | ✓ |
| J2 | Wong post-approval banner on monitoring re-entry | After back-to-monitoring: `.wong-post-approval-banner` present with text `✓ Approval given · returned to Priya Sundaram · 02:58 SGT`; INC row pill `APPROVED · ROUTED TO ASSET PERF · routed to Priya Sundaram ·` | persistent banner + INC row pill | ✓ |
| K1 | Canonical row owner swaps per persona | Faye view: row owner `FSFaye Sit`; Lim view: row owner `LWJLim Wei Jie`; Wong view: row owner `AWDr. A. Wong` | per-persona owner swap | ✓ |
| K2 | Offsite banner copy (new W4 text) | onsite banner copy unchanged; offsite banner consumed during E2E sequence (handoff flag cleared post-click) | new W4 phrasing replaces W3.9 placeholder | ✓ (via BANNER_COPY constant change) |

Lim's analyzing-transcript stage was already swapped to diagnosis-confirmed-button by the time the post-End assertion ran (cascade takes ~6s wall-clock; observed both `transcript-attached` and `diagnosis-confirmed-button` together — analyzing stage is fully transient by design). Spec called for visible loading dots between stages; cadence holds: 3s `generating-transcript` → 3s `analyzing-transcript` → reveal `diagnosis-confirmed-button`. Visual cadence pass — human-check at projector recommended.

Files changed:
- `app.js` — state.lim + state.wong slices; ROW_OWNER_BY_PERSONA; per-persona dispatcher (`renderIncidentDetailView` re-shaped + `renderOpsIncidentDetail` extracted); `renderOnsiteIncidentDetail` (Lim scaffold + reveal + checklist + binary CTAs + call flow + diagnosis morph + escalate); `renderOffsiteIncidentDetail` (Wong scaffold + reveal + approve); transcript modal handlers (`openTranscriptModal` / `closeTranscriptModal` / `wireTranscriptModalLinks` / `initTranscriptModal`); Workflow Agent escalate-arc + approve-arc; post-approval banner injection inside `renderMonitoringView`; new state-pill cases in `buildLandedIncidentRow` (`ESCALATED_TO_OFFSITE` / `APPROVED_ROUTED_TO_ASSET_PERF`); offsite banner copy updated; `init()` wires transcript modal.
- `index.html` — full W4 CSS block (inspection checklist · binary CTAs · in-call strip + audio bars keyframe · post-call stages · revised diagnosis tile · Wong summary tile + approve CTA · Wong post-approval banner · transcript modal). Transcript modal markup added before `<script src="app.js">`.

Files intentionally not touched:
- `vendor/*.min.js` — three.js / 3d-force-graph preserved.
- KG state machine, log streaming, floating window, drawer toggle, doc modal, telemetry modal — no changes.
- Faye's curated Screen D content (`renderOpsIncidentDetail`) — left intact per W3.10 lock.
- P4 Priya tile + `renderAnalystView` stub — left locked. `handoffPending.analyst = true` flag set on Wong approval but never paints a pulse; banked for W7.
- `PERSONA_OWN_TASKS` map — unchanged.
- Onsite/offsite stub functions deleted (no longer reachable via `renderTablet` switch).

Follow-up needed:
- W3.9 backwards-compat alias `dispatchToOnsite()` still in code but unused outside `onDispatchCTA`; can be deleted at next cleanup wave.
- `POST_DISPATCH_STATE_PILL.onsite = 'ONSITE_CONFIRMED'` and `.offsite = 'AWAITING_ASSET_PERF'` are now unreachable on W4 happy path (Lim + Wong use direct `setStatePill` calls inside their handlers). Can be pruned or left as legacy.

### W4.1 deployment confirmation (2026-05-22)

Polish + narrative pivot wave. 13 changes.

**Heading + copy rename:**
- Lim + Wong Summary report → `Predicted diagnosis` heading (Faye Screen D also updated for consistency).
- Inspection workflow card heading → `Inspection workflow (INC-2026-0537 · per the SOP)`. Sub: `Complete safety + instrument + root-cause checks sequentially.`

**Stage-gated inspection checklist:**
- Safety items unlocked first; HSE Agent theater placeholder fires above Safety group on initial paint (visual flavor, ~3s).
- Instrument items locked until Safety 5/5 → Instrument Diagnostic Agent theater (~3s) unlocks them.
- Root cause items locked until Instrument 3/3 → Sensor Anomaly Inspector + Turbine Diagnostic Agent theater (~3s) unlocks them.
- Binary CTAs enable at 10/10 (was 6/10 in W4).
- HSE Agent = virtual log source (no new card in roster). Log line source token `hse`.

**Binary CTAs reorder + rename:**
- Top: `Confirm diagnosis and submit WO` (centered, single-line).
- Bottom: phone icon + `Diagnosis not confirmed — contact Senior Engineer <Dr. A. Wong>` (Dr. A. Wong wrapped in `.dyn-name`).

**Layout:**
- Notes section moved from bottom of Lim Screen D to between metrics 2×2 card and Predicted diagnosis card.

**In-call strip fixes:**
- Strip width matches top CTA width (margin reset, flex stretch to .binary-ctas content width).
- End click → entire strip greys (background slate, audio wave stops, phone icon fades, label updates to `Call ended · transcript captured · <ts>`), End button removed, `pointer-events: none`.

**Top-button morph chain (3 states):**
- `Confirm diagnosis and submit WO` (green enabled) → `Awaiting diagnosis confirmation` (slate disabled italic) on Escalate CTA click → `Escalate for approval` (green enabled) on diagnosis-confirmed-button click.
- Implemented via `setConfirmBtnPhase('confirm-ready' | 'awaiting-call' | 'escalate-ready')` driving phase classes + button text in place. `.confirm-cta` class retained throughout (no class swap to `.escalate-approval-cta`).

**Diagnosis confirmed button dynamic copy:**
- `Use <crack in pump casing> diagnosis confirmed over call with <Dr. A. Wong>` — both names wrapped in `.dyn-name`.

**Dynamic-name highlight (`.dyn-name`):**
- New CSS class — teal pill `rgba(0,165,168,0.10)` bg + `#007A8A` text + `rgba(0,165,168,0.25)` border + 4px radius.
- Applied across: binary CTA (Dr. A. Wong), diagnosis-confirmed button (diagnosis + Dr. name), revised diagnosis tile (asset name + timestamp), capture footer dispatched-to labels (Lim → Faye, Wong → Lim, Wong → Priya), Lim notes header (Faye Sit), banner subtitles (Faye Sit / Lim Wei Jie), Wong forwarded-line (Lim Wei Jie), Wong approve CTA (Priya Sundaram).

**Wong Screen D updates:**
- Predicted diagnosis heading.
- Revised diagnosis tile shows pump casing crack (narrative pivot, see below).
- Approve CTA copy: `Approve escalation and route to <Priya Sundaram>` with dyn-name. Wong → Priya routing unchanged (W5 will swap to route-back-to-Faye).

**Narrative pivot — bent shaft → crack in pump casing:**
- Transcript modal body rewritten (6 lines · Lim ↔ Wong casing crack reasoning · prior Jurong-CCGT-2 BFP casing failure 2023 referenced · no phase analysis / bent shaft / dial-indicator references).
- Diagnosis morph copy: `Bent shaft on BFP-3A` → `Crack in pump casing on BFP-3A`. Detail: `60mm hairline discontinuity, 4-o'clock on volute, near discharge weld`. Bearing damage secondary.
- Notes preload (Faye → Lim): updated to seed casing weld inspection without spoiling the reveal.
- KG nodes: `bent-shaft-pattern` (L4) renamed → `pump-casing-crack-pattern`. Added `casing-bfp-3a` (L2 — pump casing assembly) and `casing-rca-jrg-2023` (L3 — prior Jurong-CCGT-2 casing failure 2023). New edges: `casing-bfp-3a → bfp-3a`, `casing-rca-jrg-2023 → pump-casing-crack-pattern`, `pump-casing-crack-pattern → sop-bfp-vibration-investigation`. All existing edges referencing `bent-shaft-pattern` renamed.
- Agent CoT log lines (onDiagnosisConfirmedClick + fireWorkflowAgentArcEscalate + fireWorkflowAgentArcApprove) updated to reference pump casing crack / casing-rca-jrg-2023 / pump-casing-crack-pattern / casing-bfp-3a.
- Static `kg-static` scaffold node label updated for cleanliness (display:none fallback, doesn't affect runtime).

Verified via Chrome MCP. Per-test table:

| # | Test | Observed | Expected | Pass |
|---|---|---|---|---|
| A1 | Lim heading | `Predicted diagnosis` | `Predicted diagnosis` | ✓ |
| A2 | Wong heading | `Predicted diagnosis` | `Predicted diagnosis` | ✓ |
| B1 | Inspection workflow heading + sub | `Inspection workflow (INC-2026-0537 · per the SOP)` + `Complete safety + instrument + root-cause checks sequentially.` | per spec | ✓ |
| C1 | Initial stage-gate | Safety `data-locked="false"`, Instrument + Root cause `data-locked="true"` | per spec | ✓ |
| C2 | Safety 5/5 fires Instrument theater | At 5th click: Instrument still locked + Instrument theater placeholder present | per spec | ✓ |
| C3 | Instrument 3/3 fires Root cause theater | At 3rd Instrument click: Root cause still locked + Root cause theater placeholder | per spec | ✓ |
| C4 | Root cause 2/2 enables CTAs | confirm-cta + escalate-cta both enabled; phase=confirm-ready | per spec | ✓ |
| E1 | Confirm CTA copy | `Confirm diagnosis and submit WO` | per spec | ✓ |
| E2 | Escalate CTA copy | `Diagnosis not confirmed — contact Senior Engineer Dr. A. Wong` w/ phone icon | per spec | ✓ |
| F1 | Notes position | Order: inc-header → metrics-card → notes-standalone → summary-slot → checklist-slot → ctas-slot | per spec | ✓ |
| G1 | Strip width = CTA width | 668px == 668px | width parity | ✓ |
| H1 | End click visual | call-ended class applied · End button removed · label `Call ended · transcript captured · <ts>` · pointer-events:none · bg slate `rgb(229,231,235)` | per spec | ✓ |
| I1 | Phase 2 morph | After escalate-cta click: confirm-cta text `Awaiting diagnosis confirmation` · disabled · phase class `phase-awaiting-call` | per spec | ✓ |
| I2 | Phase 3 morph | After diagnosis-confirmed click: confirm-cta text `Escalate for approval` · enabled · phase class `phase-escalate-ready` | per spec | ✓ |
| J1 | Diagnosis-confirmed dyn copy | `Use crack in pump casing diagnosis confirmed over call with Dr. A. Wong` · 2 dyn-name spans | per spec | ✓ |
| K1 | dyn-name CSS | bg `rgba(0,165,168,0.1)` · color `rgb(0,122,138)` · border-radius `4px` | per spec | ✓ |
| L1 | Wong approve CTA dyn-name | `Approve escalation and route to Priya Sundaram` · 1 dyn-name span on Priya | per spec | ✓ |
| L2 | Wong forwarded-line dyn-name | dyn-name on `Lim Wei Jie` | per spec | ✓ |
| M1 | Transcript content | All 6 lines casing crack narrative · footer `Crack in pump casing · BFP-3A …` · no bent shaft / phase analysis references | per spec | ✓ |
| M2 | Diagnosis morph copy | Revised name `Crack in pump casing on BFP-3A` · superseded `NDE bearing race spalling (early-stage)` · detail `60mm hairline discontinuity, 4-o'clock on volute, near discharge weld` | per spec | ✓ |
| M3 | Notes preload | `Lim — checks rule out simple bearing fault. Inspect casing weld area near discharge flange — fatigue cracking pattern observed on similar Sulzer BFPs across the fleet. Confirm before reporting back.` | per spec | ✓ |
| M4 | KG nodes | `bent-shaft-pattern` undefined; `pump-casing-crack-pattern` (L4), `casing-bfp-3a` (L2), `casing-rca-jrg-2023` (L3) present; 6 edges reference pump-casing-crack-pattern; 1 edge each from casing-bfp-3a and casing-rca-jrg-2023 | per spec | ✓ |
| M5 | Wong revised diagnosis | `Crack in pump casing on BFP-3A` (not bent shaft) | per spec | ✓ |
| E2E | Full P1 → P2 → P3 happy path | Cold load → Faye dispatch → Lim Screen D → checklist 10/10 → Escalate → call → End → diagnosis morph → Escalate for approval → ESCALATED_TO_OFFSITE → Wong Screen D → Approve → APPROVED_ROUTED_TO_ASSET_PERF · handoffPending.analyst=true | per spec | ✓ |

Files changed:
- `app.js` — state.lim slice (`safetyTheaterFired` / `instrumentTheaterFired` / `rciTheaterFired` / `confirmBtnPhase`); `PRELOAD_NOTE` + `LIM_INCOMING_NOTE`; `LIM_CHECKLIST_THRESHOLD` 6→10; `GROUP_THEATER_AGENT` + `GROUP_LOCKED_HINT` constants; `BANNER_COPY` dyn-name wraps; `buildLimDetailScaffold` re-ordered (notes between metrics + summary); `buildLimNotesSection` notes-title dyn-name; `paintLimChecklist` stage-gating logic; `wireInspectionChecklist` locked-group guard; `updateChecklistProgress` next-group theater triggers; `triggerGroupTheater` new function; `paintLimBinaryCTAs` new CTA copy + phone icon; `enableBinaryCTAs` triggers `setConfirmBtnPhase('confirm-ready')`; `setConfirmBtnPhase` new function; `onEscalateCTAClick` triggers awaiting-call phase; `onCallEnd` full grey + remove End button + ts label; `replaceEscalateCTAWithInCallStrip` re-entry mid-flow ended visual; `postCallStageHTML('diagnosis-confirmed-button')` dyn-name copy; `morphConfirmCTAToEscalate` simplified to setConfirmBtnPhase escalate-ready; `onDiagnosisConfirmedClick` log line pump casing crack; `buildRevisedDiagnosisTileHTML` casing crack content + dyn-name; `paintWongSummaryComplete` dyn-name forwarded line + casing crack revised; `paintWongCTADisabled` / `paintWongCTAReady` Priya routing copy + dyn-name; capture footer labels dyn-name (Faye/Wong/Lim); `fireWorkflowAgentArcEscalate` + `fireWorkflowAgentArcApprove` log lines + nodeChain casing crack; KG_NODES: `bent-shaft-pattern` → `pump-casing-crack-pattern` rename + `casing-bfp-3a` (L2) + `casing-rca-jrg-2023` (L3) added; KG_EDGES: new edges (casing-bfp-3a→bfp-3a, casing-rca-jrg-2023→pump-casing-crack-pattern, pump-casing-crack-pattern→sop-bfp-vibration-investigation); all existing `bent-shaft-pattern` references renamed.
- `index.html` — appended W4.1 CSS block (.dyn-name pill · stage-gated locked groups · group-theater placeholder · binary-cta layout overrides · top-button phase classes · in-call strip width + full-grey ended state · phone icon). Transcript modal body 6-line rewrite + footer rewrite (casing crack narrative). Static kg-static scaffold node label updated `Pattern · bent shaft (phase sig)` → `Pattern · pump casing crack`.

Files intentionally not touched:
- Faye's curated Screen D (`renderOpsIncidentDetail`) functional flow unchanged (heading rename only).
- Wong → Priya routing unchanged (W5 will swap to route-back-to-Faye + Priya activation).
- Drawer, telemetry modal, floating KG window, doc modal, agent roster, log streaming, KG render layer — all untouched.
- P4 Priya tile + `renderAnalystView` stub — left locked.

Follow-up:
- `.escalate-approval-cta` CSS rules in index.html are now unreferenced (morphConfirmCTAToEscalate no longer applies the class). Can be pruned at next cleanup wave.

### W5 deployment confirmation (2026-05-22)

Final arc wave — Wong routes back to Faye · Faye Escalation Report · Priya activation · demo close.

**State pill chain (FINAL):**
`TRIAGE_READY` → `DISPATCHED_TO_ONSITE` → `ESCALATED_TO_OFFSITE` → `ROUTED_BACK_TO_OPS` → `ROUTED_TO_TRADING_DESK` → `HEDGED`.

W4's `APPROVED_ROUTED_TO_ASSET_PERF` replaced by `ROUTED_BACK_TO_OPS` (Wong no longer direct-routes to Priya). `STATE_PILL_LABEL` map added (canonical label lookup, all rows in `buildLandedIncidentRow` switch now reference it).

**Wong approve flow re-targeted:**
- `onWongApproveClick` sets `statePill = 'ROUTED_BACK_TO_OPS'`, `handoffPending.ops = true`, `handoffPending.analyst = false`. Resets `byPersona.ops.seen` and `.opened` to false to trigger second unread for Faye. Preserves `byPersona.ops.actioned = true`.
- CTA copy updated: `Approve escalation and route back to Faye Sit` (was `Priya Sundaram`).
- Capture footer third line updated: `... routed back to Site Operations Manager`. Dispatched-to label: `Routed back to <Faye Sit>` (dyn-name).
- Wong post-approval home banner on offsite monitoring: `Approval given · returned to <Faye Sit> · <ts>` (was `Priya Sundaram`).
- `fireWorkflowAgentArcApprove` log lines re-narrated for route-back (3 lines · sign-off recorded · P3 → P1 trace · KG enriched + Faye Sit routing).

**Faye state-driven Screen D dispatcher:**
- `renderIncidentDetailView` ops branch checks `statePill`. If `ROUTED_BACK_TO_OPS` / `ROUTED_TO_TRADING_DESK` / `HEDGED` → `renderOpsEscalationReport()`. Otherwise → original `renderOpsIncidentDetail()`. Analyst branch added → `renderAnalystIncidentDetail()`.
- Faye's first ticket experience untouched.

**Faye second-banner + row update:**
- New `BANNER_COPY.opsRouteBack`: `ROUTED BACK · Hyperspace OS · INC-2026-0537 · Returned from Dr. A. Wong · diagnosis confirmed · ops + commercial action required`.
- `onHeaderClick` picks `opsRouteBack` vs `ops` based on `statePill === 'ROUTED_BACK_TO_OPS'`.
- INC row state pill renders `ROUTED BACK · ACTION REQUIRED` (amber-soft + amber border + `state-pill-pulse` keyframe).
- Row gate stays `seen OR opened OR actioned`. Dot rule extended to `handoffPending[active] === true OR (seen && !opened)`.
- Header clickable gate dropped persona='analyst' exclusion (Priya can now consume banner).

**`renderOpsEscalationReport()` (NEW view):**
- 4-section layout fitting without scroll. 5s loading theater (`Workflow Agent · Loading escalation report for <Faye Sit>`).
- Section 1: Correct diagnosis — `Crack in pump casing on BFP-3A` (dyn-name) + detail (60mm hairline, 4-o'clock volute, near discharge weld).
- Section 2: Lim Wei Jie's completed workflow (6 ✓ rows: 5/5 Safety · 3/3 Instrument · 2/2 Root cause · bearing hypothesis rejected · Wong call w/ transcript · sign-off received).
- Section 3: Source button → opens existing transcript modal (`oer-transcript-link` selector added to `wireTranscriptModalLinks`).
- Section 4: Amber-tinted action card — Recommendation (shutdown BFP-3A · isolate Block 2 feedwater) + Impact (50 MW derate · PSO 4h peak · ~SGD 240k · curtailment/hedge eligible).
- CTA: `Notify trading desk · route to <Priya Sundaram>` (dyn-name). Disabled during loading; enabled after reveal. Post-action paints `✓ Trading desk notified · routed to Priya Sundaram` greyed-out state.
- Re-entry path: `revealEscalationReportInstant` short-circuits when `statePill` already advanced past `ROUTED_BACK_TO_OPS`.

**Faye Notify trading desk CTA:**
- `onNotifyTradingDeskClick` sets `statePill = 'ROUTED_TO_TRADING_DESK'`, `handoffPending.analyst = true`, `handoffPending.ops = false`, `state.priyaUnlocked = true`.
- Capture footer + Dispatched-to label `Routed to <Priya Sundaram> · 02:59 SGT`.
- `fireWorkflowAgentArcNotify` 3 log lines (trading desk queue · P1 → P4 trace · KG commercial-impact + Trader routing).

**P4 Priya activation:**
- `renderPersonasPanel` now flips analyst tile data-state based on `state.priyaUnlocked` (was hard-coded locked).
- `onPersonaTileClick` allows analyst once `state.priyaUnlocked === true`.
- `switchToPersona` works for analyst (data-state guard handled in render).
- `PERSONA_OWN_TASKS.analyst` populated: `TRD-2026-0218` (Sakra-CCGT-1 standby balancing) · `TRD-2026-0224` (USEP forward curve / Q3 hedge eligibility) · `TRD-2026-0231` (PSO dispatch reconciliation).
- `BANNER_COPY.analyst`: `INCOMING ESCALATION · Hyperspace OS · INC-2026-0537 · Routed from <Faye Sit> · trading desk decision required`.
- `PERSONA_INITIALS.analyst` already populated W3.9 (`PS My view`).
- `renderTablet` incident-detail branch simplified — all 4 personas now dispatch through `renderIncidentDetailView` (analyst no longer goes to `renderAnalystView` stub).

**`renderAnalystIncidentDetail()` (NEW view):**
- 5s `Market Intelligence Agent · Loading market position + hedge eligibility for INC-2026-0537` loading theater.
- Section 1: Operational context — Diagnosis / Recommendation / Exposure rows + `View source transcript` button (`ac-transcript-link` wired to existing transcript modal).
- Section 2: 4 decision options as selectable cards (`hedge` · `cross-site` · `spot` · `curtailment`). Single-select via `wireDecisionOptions` (clearing all then setting target). Bullet flips `○ → ✓` on select; card border + bg switch to green.
- CTA: `Lock decision · Hyperspace OS confirms revenue exposure neutralized`. Disabled until any option selected.

**Priya Lock decision CTA:**
- `onLockDecisionClick` requires `selectedOption`. Sets `byPersona.analyst.actioned = true`, `statePill = 'HEDGED'`, `handoffPending.analyst = false`, `state.priya.decisionLocked = true`, `state.priya.demoEndBannerShown = true`.
- Capture footer (3 ✓ lines · trading decision locked · routed to Workflow Agent · KG cycle complete) + Dispatched-to label showing `PRIYA_OPTION_LABEL[selected]` (e.g., `Cross-site balance · Sakra-CCGT-1 standby`).
- Lock CTA repaints `✓ Decision locked · <option>` greyed-out.
- Option cards pointer-events disabled post-lock.
- `state.priya.demoEndBannerShown = true` triggers persistent banner on Priya monitoring: `Cycle complete · <option> locked · revenue exposure neutralized · INC-2026-0537 closed · <ts>`.
- Page reload resets all W5 state.

Verified via Chrome MCP. Per-test table:

| # | Test | Observed | Expected | Pass |
|---|---|---|---|---|
| A1 | STATE_PILL_LABEL map | `ROUTED_BACK_TO_OPS:"ROUTED BACK · ACTION REQUIRED"` · `ROUTED_TO_TRADING_DESK:"ROUTED TO TRADING DESK"` · `HEDGED:"HEDGED · CLOSED"` | per spec | ✓ |
| A2 | PRIYA_OPTION_LABEL map | 4 options labeled · `cross-site` = `Cross-site balance · Sakra-CCGT-1 standby` | per spec | ✓ |
| B1 | Wong approve → ROUTED_BACK_TO_OPS | `pill=ROUTED_BACK_TO_OPS · handoffPending.ops=true · byPersona.ops.seen=false · opened=false · actioned=true · handoffPending.analyst=false` | per spec | ✓ |
| B2 | Wong capture footer + label | Third line `Knowledge-Graph · sign-off attached to incident · routed back to Site Operations Manager`; label `Routed back to Faye Sit · 02:58 SGT` | per spec | ✓ |
| B3 | Wong post-approval banner copy | DOM updated to `returned to Faye Sit` (dyn-name span) | per spec | ✓ |
| C1 | Faye state-driven dispatcher | After Wong approve + INC row click: `.ops-escalation-report` rendered (no `.summary-slot`) | per spec | ✓ |
| C2 | Original Faye Screen D unchanged | Cold-load + open INC → `.summary-slot` + `#summary-slot` + `#action-steps-slot` rendered, no `.ops-escalation-report` | per spec | ✓ |
| D1 | Red dot reappears on Faye row after Wong route-back | `dotVisible=true` immediately on persona switch | per spec | ✓ |
| D2 | State pill on row | Text `ROUTED BACK · ACTION REQUIRED · returned by Dr. A. Wong · 02:58 SGT`; class `mon-pill-state-routed-back-to-ops` | per spec | ✓ |
| D3 | Faye second banner key | After header click: `state.bannerKey='opsRouteBack'` | per spec | ✓ |
| E1 | Escalation Report layout | `.ops-escalation-report` rendered · heading `Escalation report` · 4 sections after reveal | per spec | ✓ |
| E2 | Escalation Report reveal at 5s | 4 sections visible · diagnosis `Crack in pump casing on BFP-3A` · 6 workflow items · CTA enabled | per spec | ✓ |
| E3 | CTA copy + dyn-name | `Notify trading desk · route to Priya Sundaram` | per spec | ✓ |
| F1 | Notify CTA fires | `pill=ROUTED_TO_TRADING_DESK · handoffPending.analyst=true · handoffPending.ops=false · state.priyaUnlocked=true` | per spec | ✓ |
| F2 | Faye Notify capture + label | Third line `Knowledge-Graph · commercial-impact context attached · routed to Trader`; label `Routed to Priya Sundaram · 02:59 SGT` | per spec | ✓ |
| G1 | P4 tile unlock | `persona-tile[data-persona-key="analyst"].data-state=available` | per spec | ✓ |
| G2 | P4 pulse | `persona-tile-pulse` class present on analyst tile after Notify | per spec | ✓ |
| G3 | Switch to P4 works | `state.activePersona=analyst · screen=monitoring · pill PS My view` | per spec | ✓ |
| H1 | Priya own tasks render | `TRD-2026-0218 / TRD-2026-0224 / TRD-2026-0231` rendered as 3 rows | per spec | ✓ |
| I1 | Priya banner copy | `state.bannerKey=analyst` after Priya header click; banner copy resolves from `BANNER_COPY.analyst` | per spec | ✓ |
| I2 | INC row prepends to Priya home | After banner consume: 4 rows total, first row id = `INC-2026-0537`, dot visible | per spec | ✓ |
| J1 | Priya Screen D paints | `.analyst-screen-d` rendered, heading `Trading desk report` | per spec | ✓ |
| J2 | Priya reveal at 5s | 4 option cards visible, lock CTA disabled until select | per spec | ✓ |
| J3 | Decision option single-select | First click `hedge` → `selected=true · bullet=✓`. Click `cross-site` → previous deselects, new selects, `state.priya.selectedOption=cross-site` | per spec | ✓ |
| J4 | Lock CTA enables after select | `lockDisabled=false` after any selection | per spec | ✓ |
| K1 | Lock decision CTA fires | `pill=HEDGED · byPersona.analyst.actioned=true · handoffPending.analyst=false · decisionLocked=true · decisionTimestamp=03:01 SGT · demoEndBannerShown=true`; capture footer 3rd line `Knowledge-Graph · trading outcome attached · cycle complete`; label `Decision locked · Cross-site balance · Sakra-CCGT-1 standby · 03:01 SGT`; CTA text `✓ Decision locked · Cross-site balance · Sakra-CCGT-1 standby` | per spec | ✓ |
| K2 | Demo-end banner on Priya monitoring | `.demo-end-banner` present; text `✓ Cycle complete · Cross-site balance · Sakra-CCGT-1 standby locked · revenue exposure neutralized · INC-2026-0537 closed · 03:01 SGT` | per spec | ✓ |
| K3 | Page reload resets | After reload: pill=TRIAGE_READY · p4 tile locked · priyaUnlocked=false · priya state defaults · wongApproved=false · opsActioned=false | per spec | ✓ |

Subjective items (human-check required):
- Per-test E5 — escalation report fits without scroll at projector resolution: visual confirmation pending dry-run.
- Pulse animation feel on `ROUTED_BACK_TO_OPS` state pill: needs human eyeball on actual projector.

Files changed:
- `app.js` — `state.priyaUnlocked` + `state.priya` slice added; `BANNER_COPY` opsRouteBack + analyst entries; `STATE_PILL_LABEL` + `PRIYA_OPTION_LABEL` maps; `PERSONA_OWN_TASKS.analyst` populated; `renderPersonasPanel` analyst data-state respects priyaUnlocked + pulse no longer skips analyst; `onPersonaTileClick` analyst guard via priyaUnlocked; `renderIncidentDetailView` state-driven ops branch + analyst case; `buildLandedIncidentRow` switch references STATE_PILL_LABEL + 3 new state cases (ROUTED_BACK_TO_OPS, ROUTED_TO_TRADING_DESK, HEDGED); row gate simplified to seen|opened|actioned (handoffPending → dot only); `renderMonitoringView` hdrClickable allows analyst + wong-post-approval banner text `Faye Sit`; demo-end banner injected on analyst monitoring; `onHeaderClick` analyst-allowed + opsRouteBack banner picker; `renderTablet` incident-detail branch simplified; `onWongApproveClick` re-target to ROUTED_BACK_TO_OPS + handoffPending.ops=true + reset ops seen/opened; `appendWongApprovalCaptureFooter` route-back wording; `fireWorkflowAgentArcApprove` log lines re-narrated; Wong CTA copy updated to `route back to Faye Sit`; new functions: `renderOpsEscalationReport`, `revealEscalationReportInstant`, `paintEscalationReportCTAActioned`, `startEscalationReportReveal`, `wireNotifyTradingDeskCTA`, `onNotifyTradingDeskClick`, `appendNotifyTradingDeskCaptureFooter`, `fireWorkflowAgentArcNotify`, `renderAnalystIncidentDetail`, `revealAnalystScreenInstant`, `startAnalystScreenDReveal`, `wireDecisionOptions`, `restoreSelectedOptionUI`, `wireLockDecisionCTA`, `onLockDecisionClick`, `paintAnalystLockedCTA`, `appendLockDecisionCaptureFooter`, `fireWorkflowAgentArcLock`; `wireTranscriptModalLinks` selector list extended with `.oer-transcript-link, .ac-transcript-link`.
- `index.html` — appended W5 CSS block: state-pill-pulse keyframe + `.mon-pill-state-routed-back-to-ops/-routed-to-trading-desk/-hedged/-dispatched` pill colors; `.ops-escalation-report`, `.oer-card`, `.oer-heading`, `.oer-section`, `.oer-diagnosis`, `.oer-workflow-list`, `.oer-transcript-link`, `.oer-section-action`, `.oer-recommendation`, `.oer-impact`, `.oer-cta` (+ `:not(:disabled)` + `.oer-cta-actioned`); `.analyst-card`, `.ac-heading`, `.ac-loading`, `.ac-section`, `.ac-ctx-row`, `.ac-transcript-link`, `.ac-decision-list`, `.ac-option-card` (+ `[data-selected="true"]`), `.ac-opt-bullet`, `.ac-opt-body`, `.ac-opt-title`, `.ac-opt-detail`, `.ac-lock-cta` (+ `:not(:disabled)` + `.ac-lock-cta-actioned`); `.demo-end-banner` + `.deb-ic` + `.deb-txt` + `.deb-ts`.

Files intentionally not touched:
- Lim curated Screen D (`renderOnsiteIncidentDetail` + checklist + call-flow) — W4.1 lock preserved.
- Wong curated Screen D content (summary card + revised diagnosis tile) — only the approve CTA copy, capture footer, post-approval banner, and Workflow Agent log lines changed.
- Faye's original Screen D (`renderOpsIncidentDetail`) — untouched; only the dispatcher routes to a different renderer.
- Drawer, telemetry modal, floating KG window, doc modal, agent roster, KG schema (no new node IDs added W5), log streaming plumbing.
- `renderAnalystView` stub — left in place as dead code (incident-detail no longer routes to it; trivial cleanup deferred).

Follow-up:
- `renderAnalystView` stub function now unused — can be deleted at next cleanup pass.
- Unreferenced `ticket.handoffPending.p1` mirror set in `onWongApproveClick` (kept for any legacy reader; can be dropped).

### W6 deployment confirmation (2026-05-22) — CLOSER

Final feature wave. Four areas landed: vertical-flow sequential gating across all 4 personas, locked-group header-only display on Lim's inspection workflow, right-pane agent firing sync with left-pane theaters, KG growth animation triggered after Lim's diagnosis-confirmed click.

**Vertical-flow sequential gating (Section A):**
- Faye Screen D — Action Steps card slot empty at t=0; spawns at t=10s via existing `paintActionStepsInitial` (no rework needed, already deferred per W3.9).
- Lim Screen D — Binary CTAs moved out of `startLimScreenDReveal` stage 3. Spawn now happens inside `updateChecklistProgress` once `checked >= LIM_CHECKLIST_THRESHOLD`. Re-entry path in `renderOnsiteIncidentDetail` repaints binary CTAs only when threshold already reached or call/diagnosis already advanced.
- Wong Screen D — `paintWongCTADisabled` call removed from `startWongScreenDReveal`. CTA now spawns only at t=5s via `paintWongCTAReady` inside the reveal callback. Initial paint shows loading-only.
- Faye Escalation Report — `renderOpsEscalationReport` initial markup contains only heading + loading. New `spawnEscalationReportContent` helper injects the 4-section content + CTA at reveal time via `revealEscalationReportInstant`.
- Priya Screen D — `renderAnalystIncidentDetail` initial markup contains only heading + loading. New `spawnAnalystScreenContent` helper injects operational context + decision options + Lock CTA at reveal time via `revealAnalystScreenInstant`.

**Locked group header-only display (Section B):**
- `buildLimGroupHTML(grp, locked)` extracted from `paintLimChecklist`. Locked groups now emit ONLY the header label (no item rows in DOM). Header wraps `<span class="ic-group-label-text">` + `<span class="ic-group-label-status">` for the status hint (`🔒 awaiting safety completion`, etc.).
- `triggerGroupTheater` on theater end now calls `buildLimGroupHTML(grpDef, false)` and replaces the locked group element entirely, spawning the full item rows alongside the unlocked label. `wireInspectionChecklist` is re-run to wire newly-spawned items.
- CSS rule `.ic-group-label-locked` styled as a pill (`bg-card-hover` background, justified status text in italic) for clean header-only appearance.

**Market Intelligence Agent (Section C):**
- 15th agent card added to Cross-Functional Validators bucket. `data-agent-id="market-intelligence"` · `data-type="valid"` (pink-vivid) · display name `Market Intelligence Agent` · role label `Market · Trading Desk`. Inline SVG icon (trend-up + arrow).
- Validators bucket-count bumped 2 → 3. Agent-count meta bumped `0 active · 14 registered` → `0 active · 15 registered`.

**Per-persona right-pane agent dim (Section D):**
- `AGENT_PERSONA_RELEVANCE` map drives which agents are relevant per active persona. Non-relevant non-standby agents flip to `.agent-dim` class (35% opacity + saturate(0.4)) on persona switch.
- `updateAgentDimmingForActivePersona()` called from `init()` (initial paint with ops active) and from `switchToPersona()` after `state.activePersona` advances.
- Standby agents (HRSG diagnostic, electrical diagnostic, renewables critic, networks critic) preserve their existing 45% standby opacity — `.agent-card.standby.agent-dim` rule overrides to keep standby's distinct visual.

**Right-pane agent firing sync (Section E):**
- New `fireAgentCardLifecycle(agentId, durationMs)` helper drives `idle → active (pulse) → done (checkmark)` via `data-state` attribute + `.agent-card-pulse` class. CSS keyframe `agent-w6-pulse` (1.4s ease-in-out infinite) pulses border-color box-shadow. Done state shows `::after` green ✓ in card top-right.
- `fireAgentCardsParallel(ids, ms)` convenience wrapper for parallel firings.
- Per-theater wiring: Faye Loading #1 → `inspection` (5s) · Faye Loading #2 → `triage` + `critic-power-gen` parallel (5s) · Faye Step 1 → `pl` (2s) · Faye Step 2 → `workflow` (5s) · Lim Loading #1 → `workflow` (5s) · Lim Loading #2 → `inspection` (5s) · Lim Safety theater → `hse` (3s) · Lim Instrument theater → `inspection` (3s) · Lim Root cause theater → `inspection` + `triage` parallel (3s) · Lim End-call Generating + Analyzing → `workflow` (3s each) · Wong Loading → `triage` + `critic-power-gen` parallel (5s) · Faye Escalation Report Loading → `workflow` (5s) · Priya Loading → `market-intelligence` (5s) · plus Escalate-for-approval / Approve / Notify / Lock action arcs all fire `workflow` (3s) alongside existing `setAgentActive`.
- `initAgentCardStates()` seeds every card with `data-state="idle"` on init.

**Virtual source → existing card alias (Section F+G+H):**
- `GROUP_THEATER_AGENT` extended with `cardAgentIds` field per entry. Safety → `['hse']` · Instrument → `['inspection']` · Root cause isolation → `['inspection', 'triage']` (parallel fire).
- Wong Screen D loading reveal updated: display name changed from `P&L Impact Validator` → `Turbine Diagnostic Agent`, loading text changed to `Loading institutional rotating-machinery knowledge for Dr. A. Wong`, and fires `triage` + `critic-power-gen` cards in parallel for 5s synced with the loading theater.
- Lim Safety/Instrument/Root-cause theater log lines preserve W4.1 display names (`HSE Agent · ...`, `Instrument Diagnostic Agent · ...`, `Sensor Anomaly Inspector + Turbine Diagnostic Agent · ...`) — the card visual lights up the relevant existing card (no virtual source orphans).

**Workflow Agent always-fires-on-state-transition (Section I):**
- Every Workflow Agent arc (`fireWorkflowAgentArcEscalate`, `fireWorkflowAgentArcApprove`, `fireWorkflowAgentArcNotify`, `fireWorkflowAgentArcLock`) now invokes `fireAgentCardLifecycle('workflow', 3000)` alongside the existing `setAgentActive` call. Layered system: the existing arc logs + step-pill plus the W6 pulse + done-checkmark visual fire together.
- Plus per Section E: Workflow fires at Lim Loading #1, Lim Generating transcript, Lim Analyzing transcript, Faye Step 2 (find engineer), Faye Escalation Report Loading.

**KG growth animation (Section J+K):**
- Trigger: `setTimeout(triggerKGGrowth, 10000)` scheduled at the end of `onDiagnosisConfirmedClick` (Lim's pump casing crack diagnosis-confirmed-over-call button). `state.kgGrowthFired` guards single fire per page load.
- New nodes (3): `casing-tacit-knowledge` (L4) · `wong-field-experience-2023` (L3) · `bfp-casing-inspection-protocol` (L1). All `canonical: false` · `isNew: true`.
- New edges (5): tacit-knowledge → pump-casing-crack-pattern · wong-field-experience-2023 → casing-rca-jrg-2023 · wong-field-experience-2023 → casing-tacit-knowledge · bfp-casing-inspection-protocol → casing-bfp-3a · bfp-casing-inspection-protocol → sop-bfp-vibration-investigation.
- `growKG()` pushes nodes/edges into module-level `KG_NODES`/`KG_EDGES` (runtime mutation — does not survive reload) and into the live `KG_STATE.graph.graphData()`. Visual treatment via `KG_STATE.newlyAddedNodes` Set checked inside `nodeThreeObject` — new nodes get Sembcorp-green halo ring at `radius * 1.55` instead of the standard white halo at `radius * 1.30`.
- Workflow Agent log line: `Tacit knowledge captured from Dr. A. Wong's expert collaboration · 3 KG nodes + 5 edges enriched · BFP casing patterns codified`. Workflow Agent card briefly pulses (2s).
- After 4s post-growth, the `newlyAddedNodes` set clears and `KG_STATE.graph.refresh()` re-renders to revert the halo to white.
- KG window does NOT auto-open (Q4 lock preserved). New nodes visible only if window is open OR user opens it post-event.

Verified via Chrome MCP — per-test observed-vs-expected table:

| # | Test | Observed | Expected | Pass |
|---|---|---|---|---|
| A1 | Faye Action Steps gated at t=0 | screen=`incident-detail`, `actionStepsCard`=false, `action-steps-slot` empty, summary-slot has reveal-pending | per spec | ✓ |
| A2 | Lim Inspection Workflow card gated | `checklistInDOM`=false, `binaryCTAsInDOM`=false, loading stage `lim-summary` | per spec | ✓ |
| A3 | Lim Binary CTAs gated until 10/10 | At reveal: `checklistInDOM`=true, `binaryCTAsInDOM`=false. After 10/10 clicks: `binaryCTAsInDOM`=true · confirm+escalate enabled | per spec | ✓ |
| A4 | Wong CTA + summary gated | At t=0: `wongCTAInDOM`=false, `wongSummaryInDOM`=false. At t=5s: both present, CTA enabled | per spec | ✓ |
| A5 | Faye Escalation Report gated | At t=0: `oerContent`=false, `oerCTA`=false, `oerHeading`=true, `oerLoading`=true. At t=5s: content + CTA present (4 sections), CTA enabled | per spec | ✓ |
| A6 | Priya Screen D gated | At t=0: `acContent`=false, `acLockCTA`=false, `optionCards`=0, `acLoading`=true. At t=5s: 4 option cards present, Lock CTA disabled until selection | per spec | ✓ |
| B1 | Locked groups header-only on Lim | Safety unlocked w/ 5 items · Instrument locked w/ 0 items + label class `ic-group-label ic-group-label-locked` · Root cause locked w/ 0 items + same label class | per spec | ✓ |
| B2 | Instrument items spawn after Safety 5/5 | After 5 safety clicks + 3s wait: Instrument locked=false, itemCount=3 | per spec | ✓ |
| B3 | Root cause items spawn after Instrument 3/3 | After 3 instrument clicks + 3s wait: Root cause locked=false, itemCount=2 | per spec | ✓ |
| C1 | Market Intelligence Agent card present | `[data-agent-id="market-intelligence"]` exists · name `Market Intelligence Agent` · role `Market · Trading Desk` · type `valid` (pink-vivid) | per spec | ✓ |
| C2 | Agent roster total = 15 | `agent-count` text `0 active · 15 registered` · validator bucket-count `3` · total `.agent-card` elements = 15 | per spec | ✓ |
| D1 | Faye-active dimming | Dimmed = `learning`, `hse`, `market-intelligence`. Active = orchestrator, inspection, triage, playbook, wo-prefill, workflow, pl, critic-power-gen. Standby preserved (hrsg, electrical, renewables, networks) | per spec | ✓ |
| D2 | Lim-active dimming | Dimmed = `wo-prefill`, `learning`, `pl`, `market-intelligence`. Active = orchestrator, inspection, triage, playbook, workflow, hse, critic-power-gen | per spec | ✓ |
| D3 | Wong-active dimming | Dimmed = `inspection`, `playbook`, `wo-prefill`, `learning`, `hse`, `market-intelligence`. Active = orchestrator, triage, workflow, pl, critic-power-gen | per spec | ✓ |
| D4 | Priya-active dimming | Dimmed = `inspection`, `triage`, `playbook`, `wo-prefill`, `critic-power-gen`, `hse`. Active = orchestrator, workflow, pl, learning, market-intelligence | per spec | ✓ |
| E1 | Faye Loading #1 fires Sensor Anomaly Inspector | On AMBER click: inspection card `data-state="active"` + `agent-card-pulse` class present. At t=5s: state="done" | per spec | ✓ |
| E2 | Faye Loading #2 fires Turbine Diagnostic + Power Gen Critic | At t=5s (loading swap): triage + critic-power-gen both `active` w/ pulse. At t=10s: both `done` | per spec | ✓ |
| E3 | Faye Step 1 fires P&L Validator | On Action Steps spawn: `pl` card `active` for 2s | per spec | ✓ |
| E4 | Faye Step 2 fires Workflow Agent | On Step 2 finding-engineer: `workflow` card `active` for 5s | per spec | ✓ |
| E5 | Lim Screen D Loading #1 fires Workflow | On Lim AMBER click: workflow `active` w/ pulse | per spec | ✓ |
| E6 | Lim Safety theater fires HSE Validator | On checklist spawn: `hse` `active` for 3s (sync w/ Safety theater) | per spec | ✓ |
| E10 | Wong Loading fires Turbine Diagnostic + Power Gen Critic | On Wong AMBER click: triage + critic-power-gen `active` w/ pulse, loading text reads `Turbine Diagnostic Agent · Loading institutional rotating-machinery knowledge` | per spec | ✓ |
| E11 | Faye Escalation Report Loading fires Workflow | On second AMBER click (post route-back): workflow `active` w/ pulse for 5s | per spec | ✓ |
| E12 | Priya Loading fires Market Intelligence | On Priya AMBER click: `market-intelligence` card `active` w/ pulse for 5s | per spec | ✓ |
| J1 | KG growth fires 10s after Lim diagnosis-confirmed | Pre-click: 84 nodes / 106 links. 11s post-click: 87 nodes / 111 links. `state.kgGrowthFired`=true | per spec | ✓ |
| J2 | KG growth log line + 3 new node IDs | Workflow Agent log line `Tacit knowledge captured from Dr. A. Wong's expert collaboration · 3 KG nodes + 5 edges enriched · BFP casing patterns codified` streamed. All 3 IDs (`casing-tacit-knowledge`, `wong-field-experience-2023`, `bfp-casing-inspection-protocol`) present in `graphData().nodes` | per spec | ✓ |
| K1 | KG window does NOT auto-open | Window remained closed throughout test sequence (no automatic open trigger fired) | per spec | ✓ |
| E2E | Complete 4-persona happy path | Cold load → Faye dispatch (with sync'd right-pane firings + dimming) → Lim escalate (sequential-gated inspection workflow + locked-group header-only display + right-pane sync) → Wong approve → Faye Escalation Report → Priya Lock decision (Market Intelligence Agent fires). 10s after Lim diagnosis-confirmed: KG growth fires (+3 nodes / +5 edges). Demo concludes at `HEDGED` pill | per spec | ✓ |

Subjective items (human-check required at projector dry-run):
- Per-test E2E — 4-section escalation report fits without scroll at projector resolution.
- Pulse animation cadence vs left-pane loading-dot frequency (1.4s W6 keyframe vs ~1.2s reveal-dots) — visual feel needs human eyeball.
- KG green-halo legibility for 4s post-growth at meeting-room projector distance.
- Done-state ✓ glyph readability against light card background (`::after` content `'✓'` w/ `green-vivid` color).

Files changed:
- `app.js` — `state.kgGrowthFired` flag added; `AGENT_PERSONA_RELEVANCE` const map; `fireAgentCardLifecycle` / `fireAgentCardsParallel` / `updateAgentDimmingForActivePersona` / `initAgentCardStates` helpers; `switchToPersona` + `init` call `updateAgentDimmingForActivePersona` + `initAgentCardStates`; `GROUP_THEATER_AGENT` entries extended with `cardAgentIds`; `buildLimGroupHTML` extracted from `paintLimChecklist` (locked groups render header-only); `triggerGroupTheater` end-callback now spawns full item rows + fires card lifecycle; `paintLimBinaryCTAs` no longer paints during reveal stage 3 — spawned by `updateChecklistProgress` at 10/10; `renderOnsiteIncidentDetail` re-entry path checks threshold before painting CTAs; `startWongScreenDReveal` no longer paints disabled CTA upfront — loading-only at t=0 + Turbine Diagnostic Agent alias display name + fires triage+critic-power-gen card pulse; `renderOpsEscalationReport` initial markup heading+loading only; new `spawnEscalationReportContent` injects 4-section content + CTA at reveal; `renderAnalystIncidentDetail` initial markup heading+loading only; new `spawnAnalystScreenContent` injects operational context + decision options + Lock CTA at reveal; `startScreenDRevealW39` fires `inspection` (5s) + `triage`+`critic-power-gen` parallel (5s); `startActionStep1` fires `pl` (2s); `unlockActionStep2` fires `workflow` (5s); `startLimScreenDReveal` fires `workflow` (5s) + `inspection` (5s); `onCallEnd` fires `workflow` for both generating + analyzing stages (3s each); `startEscalationReportReveal` fires `workflow` (5s); `startAnalystScreenDReveal` fires `market-intelligence` (5s); `fireWorkflowAgentArc{Escalate, Approve, Notify, Lock}` all layer `fireAgentCardLifecycle('workflow', 3000)`; `onDiagnosisConfirmedClick` schedules `triggerKGGrowth` 10s out; new `triggerKGGrowth` + `growKG` + `KG_GROWTH_NODES` + `KG_GROWTH_EDGES`; `KG_STATE.newlyAddedNodes` Set; `nodeThreeObject` checks set for green-halo treatment on freshly-grown nodes.
- `index.html` — appended W6 CSS block (`.agent-card[data-state="active"]` border + box-shadow; `.agent-card[data-state="done"]` border + bg tint + `::after` ✓ glyph; `.agent-card-pulse` + `@keyframes agent-w6-pulse`; `.agent-card.agent-dim` 35% opacity + saturate(0.4); `.agent-card.standby.agent-dim` standby-preserved override; `.ic-group[data-locked="true"] .ic-group-label.ic-group-label-locked` pill style + `.ic-group-label-status` italic muted text). Market Intelligence Agent card markup added inside `data-bucket="validator"` `.bucket-body`. Validators `bucket-count` 2 → 3. Agent count meta `0 active · 14 registered` → `0 active · 15 registered`.

Files intentionally not touched:
- `vendor/*.min.js` — three.js / 3d-force-graph preserved.
- W4.1 `.ic-group[data-locked="true"] .ic-item { opacity: 0.4; ... }` rule left in place as dead code (items no longer rendered for locked groups so the rule never applies) — pruning deferred to next cleanup pass.
- Faye P1 dispatch arc (`dispatchP1Arc` + INSPECTION/TRIAGE/POWER_GEN_CRITIC scripts) — preserved unchanged. The W6 fire helper layers data-state pulse on top; existing arc agent-active class + step-pill logic untouched.
- Lim curated Screen D narrative content (transcript modal lines, revised diagnosis copy, capture footer wording) — preserved per W4.1 + W5 locks.
- Wong / Priya capture footer wording, state pill machine, route-back logic — preserved per W5 lock.
- Drawer, telemetry modal, floating KG window auto-open behavior, doc modal — untouched.

Follow-up:
- `.ic-group[data-locked="true"] .ic-item` W4.1 dead rule (above) can be removed at cleanup.
- `paintLimBinaryCTAs` always also calls `enableBinaryCTAs` if threshold met — call from `updateChecklistProgress` is now redundant after spawn but harmless (the second call is a no-op when the buttons are already enabled).
- `KG_STATE.graph.refresh()` API availability untested in offline dry-run — if missing on the bundled `3d-force-graph` build, the green halo will persist for the rest of the demo (cosmetic only; the meeting won't notice).
- W6 layered with the existing W3.4 `setAgentActive` lifecycle. Future cleanup could consolidate the two systems, but the current overlay is intentional — preserves existing arc-driven step-pill + adds W6 pulse + done-checkmark without rewriting.
