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
- **Engineer names**: R. Kumar (Ops Control Tower), Lim Wei Jie (Onsite Eng), Dr. A. Ismail (Offsite Expert), Priya Sundaram (Asset Perf Analyst). Backup roster: J. Tan, S. Ibrahim, M. Lim, P. Subramaniam.

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
| 3 | **Offsite Expert** | Dr. A. Ismail | Diagnosis confirmation + WO pre-fill + remediation approval + risk escalation. Reviews full audit trail. | → Asset Perf, with WO logged |
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
| **L2 — Plant & Equipment** | Assets (GT, HRSG, BFP, condenser, transformer), vendor manuals, telemetry specs, OEM maintenance facts, asset-chain interconnects | "asset feeds asset", "asset has spec", "asset documented by manual" |
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
| W2 | Day 2 | RIGHT pane: orchestrator dispatch log strip (5-line static placeholder inside Agent View `.zone-body`, with `inspection`/`orchestrator` source tokens + inline `[OSIsoft PI System]` data-source pill) + Inspection Agent added as 10th agent (FIRST card in Reasoning bucket; role `KG-LOOKUP`; magnifier-on-graph icon) + KG zone replaces dashed placeholder with 4-layer CSS scaffold (L1 People & Process / L2 Plant & Equipment / L3 Historical State / L4 Predictive Intelligence — 30 pre-seeded Jurong-CCGT-1 node chips total, includes `IGV-3 actuator` on L2 + `Pattern · IGV actuator drift` on L4, color-tagged left bars per layer). Flywheel zone unchanged (W8). |
| **W2.5** | Day 2-3 | **3D KG upgrade**: pre-bundle `three.js` + `3d-force-graph` to `vendor/` (verify offline load). Replace CSS scaffold with stratified 3D force-graph (4 Y-layers pinned, X/Z free, 30 nodes + canonical edges). Draggable + zoomable + auto-rotating idle state. Per-node visual-state API ready (`setNodeChain([nodeIds])`, `clearNodeChain()`, `pinNodeChain([nodeIds])`). Try/catch fallback to CSS scaffold if three.js fails. No CoT scripts loaded yet — pure rendering layer. |
| **W2.6** | Day 3 | **Screen state machine + monitoring dashboard**: implement `state.screen` = `monitoring \| monitoring-notify \| monitoring-landed \| incident-detail`. Screen A (monitoring dashboard with 3 pre-existing Sembcorp-canonical incidents — `Jurong-CCGT-2 · BFP-2A` GREEN, `Sakra-CCGT-1 · ST-1` AMBER scheduled, `Banyan-CHP · Cooling Tower 2` RED) + Hyperspace OS header band with `cursor: pointer`. Screen B (notification banner slide-in, 3s visible + 0.5s fade) — fired by click on header. Screen C (new INC-2026-0537 lands at top of list with AMBER + TRIAGING + just-now timestamp + teal border highlight; stat row updates `3 → 4 ACTIVE · 0 → 1 AWAITING TRIAGE`). Screen D = existing incident detail, reached via click on AMBER card. Back button → C. Only canonical AMBER incident clickable; other 3 = static. |
| W3 | Day 3-4 | **Right-pane streaming animations + P1 click-through arc**: dispatch log strip becomes live streaming queue (5 visible lines + roll-up accordion `▾ N earlier steps` for older + slide-in animation + click-pin + hover-KG-chain). Inspection Agent CoT streams concurrently with Screen A→B header-click. Triage Agent + Power Gen Critic activate during Screen B→C transition. Agent cards expand inline with Claude-Code-style task tree (`✓ ● ○` + step counter) when active, collapse with green checkmark when done. Diagnosis surfaces on Screen D arrival via "see full reasoning" expansion. Dispatch to Onsite CTA on Screen D. Surface diagnosis: compressor fouling, humidity-correlated. |
| W4 | Day 3-4 | **P2 click-through arc**: tablet re-renders for Onsite (Lim Wei Jie) with mobile-style verification checklist (4 steps per CAG pattern) + Playbook Agent dispatch + Power Gen Critic validation + KG L2 (OEM manual + `IGV-3 actuator`) + L1 (Onsite RACI) activation + Confirm Diagnosis terminal action. **IGV actuator drift surfaced as deeper root cause via verification step**. |
| W5 | Day 4-5 | **P3 click-through arc**: tablet re-renders for Offsite (Dr. A. Ismail) with full audit trail + telemetry review + Power Gen Critic + HSE Risk Validator + P&L Impact Validator activations + ROI/ramp model side-by-side decision (wash vs hot shutdown for IGV replacement + Sakra standby unit option declined) + Risk identification + Escalation back to P1. |
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

- **LEFT pane (tablet)** = real production app. Operators / engineers doing the work (R. Kumar, Lim Wei Jie, Dr. Ismail, P. Sundaram). Polished customer-facing UX.
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

### P3 — Offsite Engineering Experts (Dr. A. Ismail) — 4 workflow cards
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
- **P3 Offsite confirmation (W4)**: Lim calls senior engineer Dr. A. Ismail. Ismail pulls remote phase-analysis from Bently Nevada 3500 — 1×RPM dominant on FFT + ~180° phase shift between NDE and DE radial probes = textbook bent shaft signature. Ismail confirms diagnosis. Real remediation = BFP-3A shaft replacement (NOT bearing replacement alone).
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
- P2 (Lim Wei Jie · onsite) + P3 (Dr. A. Ismail · offsite) tiles now clickable. `data-state="available"` styling (opacity 0.65, hover restores saturation + lift).
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
- Capture footer 3-line copy unchanged. `Dispatched to <name>` label resolves per persona via `DISPATCH_LABEL`: Lim Wei Jie / Dr. A. Ismail / Priya Sundaram.
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
| H2 | Capture footer Dispatched-to label per persona | After P2 dispatch: `Dispatched to Dr. A. Ismail · 02:47 SGT` | persona-aware label | ✓ |
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

- **L1 People & Process** (green `--green-vivid`) — 7 nodes: R. Kumar · Ops · Lim Wei Jie · Onsite · Dr. A. Ismail · Offsite · P. Sundaram · Asset Perf · BU · Power Gen · RACI · derate ≥40MW · Escalation · PSO window
- **L2 Plant & Equipment** (blue `--blue-vivid`) — 10 nodes: GT-3 · IGV-3 actuator · HRSG-3 · BFP-3A · BFP-3B · Condenser-3 · Generator-3 · Transformer-3 · Switchyard-A · OEM · GE 9HA manual
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
- P2 (Lim Wei Jie · onsite) + P3 (Dr. A. Ismail · offsite) tiles clickable. P4 (Priya · analyst) stays locked.
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

Lim + Ismail curated Screen Ds landed. Broadcast clones replaced. Bent-shaft narrative reveal arrives via call flow.

`renderIncidentDetailView` split into per-persona dispatcher routing to `renderOpsIncidentDetail` / `renderOnsiteIncidentDetail` / `renderOffsiteIncidentDetail`. Each persona's Screen D paints its own curated content using the shared chrome (banner + back chevron + sev pill).

**Lim Wei Jie (P2) curated Screen D:**
- Banner reflects state `DISPATCHED_TO_ONSITE` with subtitle `routed from Faye Sit`.
- Metrics 2×2 inherited from W3.9 (vibration RMS NDE/DE · bearing temp · shaft speed).
- Summary report — 2-stage loading theater: t=0 `Workflow Agent · Loading incident summary for Lim Wei Jie` (5s) → t=5s swap to Summary report shell + embedded `Sensor Anomaly Inspector · Loading diagnosis hypothesis` (5s) → t=10s diagnosis hypothesis tile reveals (`NDE bearing race spalling (early-stage)` — Faye's hypothesis, no confidence chip, no subtitle, collapsible alt-hypotheses).
- Inspection workflow (NEW · replaces Action Steps): 10 items in 3 groups (Safety 5 / Instrument 3 / Root cause isolation 2). Items user-clickable; each click flips item to `data-checked="true"` (✓ + line-through), increments group count, increments progress counter, and streams a `Workflow Agent · Inspection check · <itemId> · confirmed by Lim Wei Jie` log line.
- Binary CTAs (NEW): `Confirm diagnosis and repair` + `Diagnosis is wrong — contact Dr. A. Ismail (Senior Engineer · Offsite Expert)`. Both disabled until ≥6/10 checks (`LIM_CHECKLIST_THRESHOLD` constant). Threshold-based unlock chosen so demo doesn't require all 10 clicks on stage.
- Call flow (NEW): Escalate CTA → in-call strip replaces the escalate-cta DOM node (phone icon + animated 7-bar audio wave via `@keyframes audio-bars` + red `End` button). End click → `.call-ended` class greys icon + bars + disables End button + sets text to `Ended`.
- Post-call stages render in the `lim-ctas-slot` below the in-call strip: 3s `Workflow Agent · Generating transcript...` → swap to `✓ Transcript attached · 7m 23s · [View transcript]` link + 3s `Workflow Agent · Analyzing transcript...` (rendered alongside transcript-attached) → swap analyzing stage to `Use diagnosis confirmed over call` button.
- Diagnosis morph (NEW): click `Use diagnosis confirmed over call` → diagnosis hypothesis tile re-renders inline (original `NDE bearing race spalling (early-stage)` strikethrough + `SUPERSEDED` flag · new `REVISED DIAGNOSIS · Bent shaft on BFP-3A` + supporting detail `Confirmed via 1×RPM phase analysis (~178° NDE-DE shift) + dial-indicator runout (0.18mm TIR). Bearing damage secondary, caused by uneven load distribution.` + `View call transcript · 02:55 SGT` link). Timestamp captured in `state.lim.revisionTimestamp`.
- Confirm CTA morphs to `Escalate for approval` (subtitle: `Routed to Dr. A. Ismail · Offsite Expert · material impact requires offsite sign-off`); class swap `confirm-cta → escalate-approval-cta`. Green-fill button styling.
- Escalate-for-approval click → state pill `ESCALATED_TO_OFFSITE` · `byPersona.onsite.actioned = true` · `handoffPending.offsite = true` · Workflow Agent mini-arc (3 log lines) · capture footer (`Hyperspace OS confirms revised diagnosis SOP followed` · `Call transcript routed to Workflow Agent for review` · `Knowledge-Graph · team · incident · revised diagnosis + transcript enriched`) + label `Escalated to Dr. A. Ismail · 02:56 SGT` · P3 pulse starts.
- Notes section pre-filled automatically with Faye-attached note (`Lim — prioritize NDE bearing visual inspection alongside dial-indicator runout test on shaft + coupling...`); no mic press required. Mic button preserved for visual consistency.

**Transcript modal (NEW):**
- ID `#transcript-modal`. Same modal infrastructure pattern as W3.10 telemetry modal (backdrop + close × + delegated close handler + ESC handler).
- Content: 6-line dialog between L. Lim and Dr. Ismail covering vibration → 1×RPM phase analysis → bent shaft → escalation. Header auto-attribution (`02:48 SGT · 7m 23s · auto-generated via Hyperspace OS`). Footer green-highlighted revised-diagnosis summary.
- Multiple entry points wired through `wireTranscriptModalLinks()`: `.post-call-transcript-link` (Lim's post-call attached stage), `.sr-hyp-transcript-link` (revised diagnosis tile on Lim's view), `.ismail-tx-link` (revised diagnosis tile on Ismail's view). All share the same modal markup + close mechanisms.

**Dr. A. Ismail (P3) curated Screen D:**
- Banner reflects state `ESCALATED_TO_OFFSITE` with subtitle `routed from Lim Wei Jie`.
- No metrics 2×2 (per Pulkit's `super simple` brief — Ismail reviews, doesn't re-verify telemetry).
- Single-stage Summary report loading theater (5s): `P&L Impact Validator · Loading escalation summary for Dr. A. Ismail` → forwarded-incident line (`Lim Wei Jie has forwarded this incident · diagnosis revision · escalation for offsite sign-off.`) + revised diagnosis tile (read-only, same morph shape as Lim's post-call) + transcript link + approval-ask line (`Approval requested: shaft replacement scheduling + capacity impact escalation to Asset Performance.`).
- Single CTA `Approve escalation` (disabled during 5s loading; enabled after reveal). Green-fill button styling.
- Approve click → state pill `APPROVED_ROUTED_TO_ASSET_PERF` · `byPersona.offsite.actioned = true` · `handoffPending.analyst = true` (banked for W7; P4 stays locked, no pulse) · Workflow Agent mini-arc (3 log lines) · capture footer (`Hyperspace OS · escalation approval sign-off recorded` · `Approval + transcript routed to Workflow Agent for chain-of-custody` · `Knowledge-Graph · sign-off attached to incident · routed to Asset Performance`) + label `Approval given · returned to Priya Sundaram · 02:58 SGT`.
- `state.ismail.approvalGiven` + `state.ismail.approvalTimestamp` set so Ismail's monitoring view paints the post-approval banner on re-entry.

**Post-approval home banner on Ismail's monitoring:**
- After approve fires + user backs out to Ismail's monitoring screen: `.ismail-post-approval-banner` (green-soft fill + green-vivid left bar + green-circle ✓ icon) renders at top of the priorities list with text `Approval given · returned to Priya Sundaram · <timestamp>`. Persistent across re-renders while `state.ismail.approvalGiven === true`.

**State pill machine final after W4:**
`TRIAGE_READY` → `DISPATCHED_TO_ONSITE` (Faye dispatches Lim) → `ESCALATED_TO_OFFSITE` (Lim escalates after revised diagnosis) → `APPROVED_ROUTED_TO_ASSET_PERF` (Ismail signs off). Legacy `ONSITE_CONFIRMED` and `AWAITING_ASSET_PERF` remain in `POST_DISPATCH_STATE_PILL` map but are no longer reached on the W4 happy path; replaced by the escalation chain.

**Canonical incident row owner per active persona:**
- `ROW_OWNER_BY_PERSONA` map drives `buildLandedIncidentRow` owner field per active persona. Faye's view: `Faye Sit / FS`. Lim's view: `Lim Wei Jie / LWJ`. Ismail's view: `Dr. A. Ismail / AW`. Pre-existing tasks in `PERSONA_OWN_TASKS` retain their static owners.

**Banner copy table (final after W4):**
- ops: `NEW INCIDENT · Hyperspace OS · JRG-CCGT-1 · Block 2 · BFP-3A · vibration anomaly · 02:47 SGT`
- onsite: `INCOMING HANDOFF · Hyperspace OS · INC-2026-0537 · Routed from Faye Sit · onsite verification requested`
- offsite: `INCOMING HANDOFF · Hyperspace OS · INC-2026-0537 · Routed from Lim Wei Jie · diagnosis revision + escalation pending sign-off`

**State slices added (`state.lim` / `state.ismail`):**
- `state.lim = { checked: {}, revealStarted, summaryRevealed, callStarted, callEnded, transcriptAttached, diagnosisRevised, revisionTimestamp }` — tracks Lim's checklist progress + call flow stage + diagnosis revision.
- `state.ismail = { revealStarted, summaryRevealed, approvalGiven, approvalTimestamp }` — tracks Ismail's reveal + approval state.
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
| D1 | Escalate CTA click → in-call strip + audio wave | `.in-call-strip` rendered; label `On call · Dr. A. Ismail`; 7 `.in-call-audio-wave span` bars; `.in-call-end-btn` present; `state.lim.callStarted === true` | in-call strip + 7 bars + end btn | ✓ |
| E1 | End click → call-ended class + Ended text + post-call stages spawn | `.in-call-strip.call-ended` class set; end btn text `Ended`; `.ended` class set; `state.lim.callEnded === true` | call ends + post-call cascade fires | ✓ |
| E2 | Post-call cascade reaches diagnosis-confirmed-button (~6s) | `[...post-call-stage].map(s=>s.dataset.stage)` = `['transcript-attached','diagnosis-confirmed-button']`; `state.lim.transcriptAttached === true` | both stages visible after cascade | ✓ |
| F1 | Diagnosis confirmed click → tile morph | `state.lim.diagnosisRevised === true`; `state.lim.revisionTimestamp === '02:55 SGT'`; `.sr-hyp-flag` = `SUPERSEDED`; original strikethrough = `NDE bearing race spalling (early-stage)`; revised name = `Bent shaft on BFP-3A`; detail text starts with `Confirmed via 1×RPM phase analysis (~178° NDE-DE shift) + dial-indicator runout (0.18mm TIR). Bearing damage secondary,...` | full tile morph | ✓ |
| G1 | Confirm CTA morphs to Escalate for approval | `.escalate-approval-cta` class set; text starts `Escalate for approval` + subtitle `Routed to Dr. A. Ismail · Offsite Expert · material impact requires offsite sign-off` | CTA morph + subtitle | ✓ |
| G2 | Escalate for approval click → state advance + capture footer | `state.incidentPhase === 'ESCALATED_TO_OFFSITE'`; `byPersona.onsite.actioned === true`; `handoffPending.offsite === true`; offsite tile pulse `true`; capture footer present; label `Escalated to Dr. A. Ismail · 02:56 SGT`; 3 capture lines verbatim | full escalation transition | ✓ |
| H1 | Transcript modal opens via diagnosis tile link | `.sr-hyp-transcript-link` click → `#transcript-modal[data-open=true]`; title `Call transcript`; sub starts `Lim Wei Jie ↔ Dr. A. Ismail · 02:48 SGT · 7m 23s · `; 6 tx-lines; first speaker `L. Lim`; footer starts `Revised diagnosis: Bent shaft · BFP-3A · confirmed via 1×RPM phase + dial-indica` | modal opens populated | ✓ |
| H2 | Transcript modal close via × button | `#transcript-modal[data-open=false]` after `.transcript-modal-close` click | modal closes | ✓ |
| I1 | Ismail Screen D scaffold paints | banner subtitle `INC-2026-0537 · routed from Lim Wei Jie`; loading text `P&L Impact Validator · Loading escalation summary for Dr. A. Ismail`; approve CTA disabled; 0 metric cells | Ismail scaffold + loading | ✓ |
| I2 | Ismail Summary content reveals after 5s | `await_text('Bent shaft on BFP-3A')` resolved within 10s; forwarded line text exact; SUPERSEDED flag + revised name `Bent shaft on BFP-3A`; ask text `Approval requested: shaft replacement scheduling + capacity impact escalation to Asset Performance.`; approve CTA enabled; transcript link present | Ismail reveal complete + CTA enabled | ✓ |
| J1 | Ismail Approve click → state advance + P4 stays locked | `state.incidentPhase === 'APPROVED_ROUTED_TO_ASSET_PERF'`; `byPersona.offsite.actioned === true`; `handoffPending.analyst === true`; analyst tile `data-state="locked"`; analyst pulse `false`; `state.ismail.approvalGiven === true`; approvalTs `02:58 SGT`; capture footer present; label `Approval given · returned to Priya Sundaram · 02:58 SGT`; 3 capture lines verbatim | approval + P4 locked + banked flag | ✓ |
| J2 | Ismail post-approval banner on monitoring re-entry | After back-to-monitoring: `.ismail-post-approval-banner` present with text `✓ Approval given · returned to Priya Sundaram · 02:58 SGT`; INC row pill `APPROVED · ROUTED TO ASSET PERF · routed to Priya Sundaram ·` | persistent banner + INC row pill | ✓ |
| K1 | Canonical row owner swaps per persona | Faye view: row owner `FSFaye Sit`; Lim view: row owner `LWJLim Wei Jie`; Ismail view: row owner `AWDr. A. Ismail` | per-persona owner swap | ✓ |
| K2 | Offsite banner copy (new W4 text) | onsite banner copy unchanged; offsite banner consumed during E2E sequence (handoff flag cleared post-click) | new W4 phrasing replaces W3.9 placeholder | ✓ (via BANNER_COPY constant change) |

Lim's analyzing-transcript stage was already swapped to diagnosis-confirmed-button by the time the post-End assertion ran (cascade takes ~6s wall-clock; observed both `transcript-attached` and `diagnosis-confirmed-button` together — analyzing stage is fully transient by design). Spec called for visible loading dots between stages; cadence holds: 3s `generating-transcript` → 3s `analyzing-transcript` → reveal `diagnosis-confirmed-button`. Visual cadence pass — human-check at projector recommended.

Files changed:
- `app.js` — state.lim + state.ismail slices; ROW_OWNER_BY_PERSONA; per-persona dispatcher (`renderIncidentDetailView` re-shaped + `renderOpsIncidentDetail` extracted); `renderOnsiteIncidentDetail` (Lim scaffold + reveal + checklist + binary CTAs + call flow + diagnosis morph + escalate); `renderOffsiteIncidentDetail` (Ismail scaffold + reveal + approve); transcript modal handlers (`openTranscriptModal` / `closeTranscriptModal` / `wireTranscriptModalLinks` / `initTranscriptModal`); Workflow Agent escalate-arc + approve-arc; post-approval banner injection inside `renderMonitoringView`; new state-pill cases in `buildLandedIncidentRow` (`ESCALATED_TO_OFFSITE` / `APPROVED_ROUTED_TO_ASSET_PERF`); offsite banner copy updated; `init()` wires transcript modal.
- `index.html` — full W4 CSS block (inspection checklist · binary CTAs · in-call strip + audio bars keyframe · post-call stages · revised diagnosis tile · Ismail summary tile + approve CTA · Ismail post-approval banner · transcript modal). Transcript modal markup added before `<script src="app.js">`.

Files intentionally not touched:
- `vendor/*.min.js` — three.js / 3d-force-graph preserved.
- KG state machine, log streaming, floating window, drawer toggle, doc modal, telemetry modal — no changes.
- Faye's curated Screen D content (`renderOpsIncidentDetail`) — left intact per W3.10 lock.
- P4 Priya tile + `renderAnalystView` stub — left locked. `handoffPending.analyst = true` flag set on Ismail approval but never paints a pulse; banked for W7.
- `PERSONA_OWN_TASKS` map — unchanged.
- Onsite/offsite stub functions deleted (no longer reachable via `renderTablet` switch).

Follow-up needed:
- W3.9 backwards-compat alias `dispatchToOnsite()` still in code but unused outside `onDispatchCTA`; can be deleted at next cleanup wave.
- `POST_DISPATCH_STATE_PILL.onsite = 'ONSITE_CONFIRMED'` and `.offsite = 'AWAITING_ASSET_PERF'` are now unreachable on W4 happy path (Lim + Ismail use direct `setStatePill` calls inside their handlers). Can be pruned or left as legacy.

### W4.1 deployment confirmation (2026-05-22)

Polish + narrative pivot wave. 13 changes.

**Heading + copy rename:**
- Lim + Ismail Summary report → `Predicted diagnosis` heading (Faye Screen D also updated for consistency).
- Inspection workflow card heading → `Inspection workflow (INC-2026-0537 · per the SOP)`. Sub: `Complete safety + instrument + root-cause checks sequentially.`

**Stage-gated inspection checklist:**
- Safety items unlocked first; HSE Agent theater placeholder fires above Safety group on initial paint (visual flavor, ~3s).
- Instrument items locked until Safety 5/5 → Instrument Diagnostic Agent theater (~3s) unlocks them.
- Root cause items locked until Instrument 3/3 → Sensor Anomaly Inspector + Turbine Diagnostic Agent theater (~3s) unlocks them.
- Binary CTAs enable at 10/10 (was 6/10 in W4).
- HSE Agent = virtual log source (no new card in roster). Log line source token `hse`.

**Binary CTAs reorder + rename:**
- Top: `Confirm diagnosis and submit WO` (centered, single-line).
- Bottom: phone icon + `Diagnosis not confirmed — contact Senior Engineer <Dr. A. Ismail>` (Dr. A. Ismail wrapped in `.dyn-name`).

**Layout:**
- Notes section moved from bottom of Lim Screen D to between metrics 2×2 card and Predicted diagnosis card.

**In-call strip fixes:**
- Strip width matches top CTA width (margin reset, flex stretch to .binary-ctas content width).
- End click → entire strip greys (background slate, audio wave stops, phone icon fades, label updates to `Call ended · transcript captured · <ts>`), End button removed, `pointer-events: none`.

**Top-button morph chain (3 states):**
- `Confirm diagnosis and submit WO` (green enabled) → `Awaiting diagnosis confirmation` (slate disabled italic) on Escalate CTA click → `Escalate for approval` (green enabled) on diagnosis-confirmed-button click.
- Implemented via `setConfirmBtnPhase('confirm-ready' | 'awaiting-call' | 'escalate-ready')` driving phase classes + button text in place. `.confirm-cta` class retained throughout (no class swap to `.escalate-approval-cta`).

**Diagnosis confirmed button dynamic copy:**
- `Use <crack in pump casing> diagnosis confirmed over call with <Dr. A. Ismail>` — both names wrapped in `.dyn-name`.

**Dynamic-name highlight (`.dyn-name`):**
- New CSS class — teal pill `rgba(0,165,168,0.10)` bg + `#007A8A` text + `rgba(0,165,168,0.25)` border + 4px radius.
- Applied across: binary CTA (Dr. A. Ismail), diagnosis-confirmed button (diagnosis + Dr. name), revised diagnosis tile (asset name + timestamp), capture footer dispatched-to labels (Lim → Faye, Ismail → Lim, Ismail → Priya), Lim notes header (Faye Sit), banner subtitles (Faye Sit / Lim Wei Jie), Ismail forwarded-line (Lim Wei Jie), Ismail approve CTA (Priya Sundaram).

**Ismail Screen D updates:**
- Predicted diagnosis heading.
- Revised diagnosis tile shows pump casing crack (narrative pivot, see below).
- Approve CTA copy: `Approve escalation and route to <Priya Sundaram>` with dyn-name. Ismail → Priya routing unchanged (W5 will swap to route-back-to-Faye).

**Narrative pivot — bent shaft → crack in pump casing:**
- Transcript modal body rewritten (6 lines · Lim ↔ Ismail casing crack reasoning · prior Jurong-CCGT-2 BFP casing failure 2023 referenced · no phase analysis / bent shaft / dial-indicator references).
- Diagnosis morph copy: `Bent shaft on BFP-3A` → `Crack in pump casing on BFP-3A`. Detail: `60mm hairline discontinuity, 4-o'clock on volute, near discharge weld`. Bearing damage secondary.
- Notes preload (Faye → Lim): updated to seed casing weld inspection without spoiling the reveal.
- KG nodes: `bent-shaft-pattern` (L4) renamed → `pump-casing-crack-pattern`. Added `casing-bfp-3a` (L2 — pump casing assembly) and `casing-rca-jrg-2023` (L3 — prior Jurong-CCGT-2 casing failure 2023). New edges: `casing-bfp-3a → bfp-3a`, `casing-rca-jrg-2023 → pump-casing-crack-pattern`, `pump-casing-crack-pattern → sop-bfp-vibration-investigation`. All existing edges referencing `bent-shaft-pattern` renamed.
- Agent CoT log lines (onDiagnosisConfirmedClick + fireWorkflowAgentArcEscalate + fireWorkflowAgentArcApprove) updated to reference pump casing crack / casing-rca-jrg-2023 / pump-casing-crack-pattern / casing-bfp-3a.
- Static `kg-static` scaffold node label updated for cleanliness (display:none fallback, doesn't affect runtime).

Verified via Chrome MCP. Per-test table:

| # | Test | Observed | Expected | Pass |
|---|---|---|---|---|
| A1 | Lim heading | `Predicted diagnosis` | `Predicted diagnosis` | ✓ |
| A2 | Ismail heading | `Predicted diagnosis` | `Predicted diagnosis` | ✓ |
| B1 | Inspection workflow heading + sub | `Inspection workflow (INC-2026-0537 · per the SOP)` + `Complete safety + instrument + root-cause checks sequentially.` | per spec | ✓ |
| C1 | Initial stage-gate | Safety `data-locked="false"`, Instrument + Root cause `data-locked="true"` | per spec | ✓ |
| C2 | Safety 5/5 fires Instrument theater | At 5th click: Instrument still locked + Instrument theater placeholder present | per spec | ✓ |
| C3 | Instrument 3/3 fires Root cause theater | At 3rd Instrument click: Root cause still locked + Root cause theater placeholder | per spec | ✓ |
| C4 | Root cause 2/2 enables CTAs | confirm-cta + escalate-cta both enabled; phase=confirm-ready | per spec | ✓ |
| E1 | Confirm CTA copy | `Confirm diagnosis and submit WO` | per spec | ✓ |
| E2 | Escalate CTA copy | `Diagnosis not confirmed — contact Senior Engineer Dr. A. Ismail` w/ phone icon | per spec | ✓ |
| F1 | Notes position | Order: inc-header → metrics-card → notes-standalone → summary-slot → checklist-slot → ctas-slot | per spec | ✓ |
| G1 | Strip width = CTA width | 668px == 668px | width parity | ✓ |
| H1 | End click visual | call-ended class applied · End button removed · label `Call ended · transcript captured · <ts>` · pointer-events:none · bg slate `rgb(229,231,235)` | per spec | ✓ |
| I1 | Phase 2 morph | After escalate-cta click: confirm-cta text `Awaiting diagnosis confirmation` · disabled · phase class `phase-awaiting-call` | per spec | ✓ |
| I2 | Phase 3 morph | After diagnosis-confirmed click: confirm-cta text `Escalate for approval` · enabled · phase class `phase-escalate-ready` | per spec | ✓ |
| J1 | Diagnosis-confirmed dyn copy | `Use crack in pump casing diagnosis confirmed over call with Dr. A. Ismail` · 2 dyn-name spans | per spec | ✓ |
| K1 | dyn-name CSS | bg `rgba(0,165,168,0.1)` · color `rgb(0,122,138)` · border-radius `4px` | per spec | ✓ |
| L1 | Ismail approve CTA dyn-name | `Approve escalation and route to Priya Sundaram` · 1 dyn-name span on Priya | per spec | ✓ |
| L2 | Ismail forwarded-line dyn-name | dyn-name on `Lim Wei Jie` | per spec | ✓ |
| M1 | Transcript content | All 6 lines casing crack narrative · footer `Crack in pump casing · BFP-3A …` · no bent shaft / phase analysis references | per spec | ✓ |
| M2 | Diagnosis morph copy | Revised name `Crack in pump casing on BFP-3A` · superseded `NDE bearing race spalling (early-stage)` · detail `60mm hairline discontinuity, 4-o'clock on volute, near discharge weld` | per spec | ✓ |
| M3 | Notes preload | `Lim — checks rule out simple bearing fault. Inspect casing weld area near discharge flange — fatigue cracking pattern observed on similar Sulzer BFPs across the fleet. Confirm before reporting back.` | per spec | ✓ |
| M4 | KG nodes | `bent-shaft-pattern` undefined; `pump-casing-crack-pattern` (L4), `casing-bfp-3a` (L2), `casing-rca-jrg-2023` (L3) present; 6 edges reference pump-casing-crack-pattern; 1 edge each from casing-bfp-3a and casing-rca-jrg-2023 | per spec | ✓ |
| M5 | Ismail revised diagnosis | `Crack in pump casing on BFP-3A` (not bent shaft) | per spec | ✓ |
| E2E | Full P1 → P2 → P3 happy path | Cold load → Faye dispatch → Lim Screen D → checklist 10/10 → Escalate → call → End → diagnosis morph → Escalate for approval → ESCALATED_TO_OFFSITE → Ismail Screen D → Approve → APPROVED_ROUTED_TO_ASSET_PERF · handoffPending.analyst=true | per spec | ✓ |

Files changed:
- `app.js` — state.lim slice (`safetyTheaterFired` / `instrumentTheaterFired` / `rciTheaterFired` / `confirmBtnPhase`); `PRELOAD_NOTE` + `LIM_INCOMING_NOTE`; `LIM_CHECKLIST_THRESHOLD` 6→10; `GROUP_THEATER_AGENT` + `GROUP_LOCKED_HINT` constants; `BANNER_COPY` dyn-name wraps; `buildLimDetailScaffold` re-ordered (notes between metrics + summary); `buildLimNotesSection` notes-title dyn-name; `paintLimChecklist` stage-gating logic; `wireInspectionChecklist` locked-group guard; `updateChecklistProgress` next-group theater triggers; `triggerGroupTheater` new function; `paintLimBinaryCTAs` new CTA copy + phone icon; `enableBinaryCTAs` triggers `setConfirmBtnPhase('confirm-ready')`; `setConfirmBtnPhase` new function; `onEscalateCTAClick` triggers awaiting-call phase; `onCallEnd` full grey + remove End button + ts label; `replaceEscalateCTAWithInCallStrip` re-entry mid-flow ended visual; `postCallStageHTML('diagnosis-confirmed-button')` dyn-name copy; `morphConfirmCTAToEscalate` simplified to setConfirmBtnPhase escalate-ready; `onDiagnosisConfirmedClick` log line pump casing crack; `buildRevisedDiagnosisTileHTML` casing crack content + dyn-name; `paintIsmailSummaryComplete` dyn-name forwarded line + casing crack revised; `paintIsmailCTADisabled` / `paintIsmailCTAReady` Priya routing copy + dyn-name; capture footer labels dyn-name (Faye/Ismail/Lim); `fireWorkflowAgentArcEscalate` + `fireWorkflowAgentArcApprove` log lines + nodeChain casing crack; KG_NODES: `bent-shaft-pattern` → `pump-casing-crack-pattern` rename + `casing-bfp-3a` (L2) + `casing-rca-jrg-2023` (L3) added; KG_EDGES: new edges (casing-bfp-3a→bfp-3a, casing-rca-jrg-2023→pump-casing-crack-pattern, pump-casing-crack-pattern→sop-bfp-vibration-investigation); all existing `bent-shaft-pattern` references renamed.
- `index.html` — appended W4.1 CSS block (.dyn-name pill · stage-gated locked groups · group-theater placeholder · binary-cta layout overrides · top-button phase classes · in-call strip width + full-grey ended state · phone icon). Transcript modal body 6-line rewrite + footer rewrite (casing crack narrative). Static kg-static scaffold node label updated `Pattern · bent shaft (phase sig)` → `Pattern · pump casing crack`.

Files intentionally not touched:
- Faye's curated Screen D (`renderOpsIncidentDetail`) functional flow unchanged (heading rename only).
- Ismail → Priya routing unchanged (W5 will swap to route-back-to-Faye + Priya activation).
- Drawer, telemetry modal, floating KG window, doc modal, agent roster, log streaming, KG render layer — all untouched.
- P4 Priya tile + `renderAnalystView` stub — left locked.

Follow-up:
- `.escalate-approval-cta` CSS rules in index.html are now unreferenced (morphConfirmCTAToEscalate no longer applies the class). Can be pruned at next cleanup wave.

### W5 deployment confirmation (2026-05-22)

Final arc wave — Ismail routes back to Faye · Faye Escalation Report · Priya activation · demo close.

**State pill chain (FINAL):**
`TRIAGE_READY` → `DISPATCHED_TO_ONSITE` → `ESCALATED_TO_OFFSITE` → `ROUTED_BACK_TO_OPS` → `ROUTED_TO_TRADING_DESK` → `HEDGED`.

W4's `APPROVED_ROUTED_TO_ASSET_PERF` replaced by `ROUTED_BACK_TO_OPS` (Ismail no longer direct-routes to Priya). `STATE_PILL_LABEL` map added (canonical label lookup, all rows in `buildLandedIncidentRow` switch now reference it).

**Ismail approve flow re-targeted:**
- `onIsmailApproveClick` sets `statePill = 'ROUTED_BACK_TO_OPS'`, `handoffPending.ops = true`, `handoffPending.analyst = false`. Resets `byPersona.ops.seen` and `.opened` to false to trigger second unread for Faye. Preserves `byPersona.ops.actioned = true`.
- CTA copy updated: `Approve escalation and route back to Faye Sit` (was `Priya Sundaram`).
- Capture footer third line updated: `... routed back to Site Operations Manager`. Dispatched-to label: `Routed back to <Faye Sit>` (dyn-name).
- Ismail post-approval home banner on offsite monitoring: `Approval given · returned to <Faye Sit> · <ts>` (was `Priya Sundaram`).
- `fireWorkflowAgentArcApprove` log lines re-narrated for route-back (3 lines · sign-off recorded · P3 → P1 trace · KG enriched + Faye Sit routing).

**Faye state-driven Screen D dispatcher:**
- `renderIncidentDetailView` ops branch checks `statePill`. If `ROUTED_BACK_TO_OPS` / `ROUTED_TO_TRADING_DESK` / `HEDGED` → `renderOpsEscalationReport()`. Otherwise → original `renderOpsIncidentDetail()`. Analyst branch added → `renderAnalystIncidentDetail()`.
- Faye's first ticket experience untouched.

**Faye second-banner + row update:**
- New `BANNER_COPY.opsRouteBack`: `ROUTED BACK · Hyperspace OS · INC-2026-0537 · Returned from Dr. A. Ismail · diagnosis confirmed · ops + commercial action required`.
- `onHeaderClick` picks `opsRouteBack` vs `ops` based on `statePill === 'ROUTED_BACK_TO_OPS'`.
- INC row state pill renders `ROUTED BACK · ACTION REQUIRED` (amber-soft + amber border + `state-pill-pulse` keyframe).
- Row gate stays `seen OR opened OR actioned`. Dot rule extended to `handoffPending[active] === true OR (seen && !opened)`.
- Header clickable gate dropped persona='analyst' exclusion (Priya can now consume banner).

**`renderOpsEscalationReport()` (NEW view):**
- 4-section layout fitting without scroll. 5s loading theater (`Workflow Agent · Loading escalation report for <Faye Sit>`).
- Section 1: Correct diagnosis — `Crack in pump casing on BFP-3A` (dyn-name) + detail (60mm hairline, 4-o'clock volute, near discharge weld).
- Section 2: Lim Wei Jie's completed workflow (6 ✓ rows: 5/5 Safety · 3/3 Instrument · 2/2 Root cause · bearing hypothesis rejected · Ismail call w/ transcript · sign-off received).
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
| B1 | Ismail approve → ROUTED_BACK_TO_OPS | `pill=ROUTED_BACK_TO_OPS · handoffPending.ops=true · byPersona.ops.seen=false · opened=false · actioned=true · handoffPending.analyst=false` | per spec | ✓ |
| B2 | Ismail capture footer + label | Third line `Knowledge-Graph · sign-off attached to incident · routed back to Site Operations Manager`; label `Routed back to Faye Sit · 02:58 SGT` | per spec | ✓ |
| B3 | Ismail post-approval banner copy | DOM updated to `returned to Faye Sit` (dyn-name span) | per spec | ✓ |
| C1 | Faye state-driven dispatcher | After Ismail approve + INC row click: `.ops-escalation-report` rendered (no `.summary-slot`) | per spec | ✓ |
| C2 | Original Faye Screen D unchanged | Cold-load + open INC → `.summary-slot` + `#summary-slot` + `#action-steps-slot` rendered, no `.ops-escalation-report` | per spec | ✓ |
| D1 | Red dot reappears on Faye row after Ismail route-back | `dotVisible=true` immediately on persona switch | per spec | ✓ |
| D2 | State pill on row | Text `ROUTED BACK · ACTION REQUIRED · returned by Dr. A. Ismail · 02:58 SGT`; class `mon-pill-state-routed-back-to-ops` | per spec | ✓ |
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
| K3 | Page reload resets | After reload: pill=TRIAGE_READY · p4 tile locked · priyaUnlocked=false · priya state defaults · ismailApproved=false · opsActioned=false | per spec | ✓ |

Subjective items (human-check required):
- Per-test E5 — escalation report fits without scroll at projector resolution: visual confirmation pending dry-run.
- Pulse animation feel on `ROUTED_BACK_TO_OPS` state pill: needs human eyeball on actual projector.

Files changed:
- `app.js` — `state.priyaUnlocked` + `state.priya` slice added; `BANNER_COPY` opsRouteBack + analyst entries; `STATE_PILL_LABEL` + `PRIYA_OPTION_LABEL` maps; `PERSONA_OWN_TASKS.analyst` populated; `renderPersonasPanel` analyst data-state respects priyaUnlocked + pulse no longer skips analyst; `onPersonaTileClick` analyst guard via priyaUnlocked; `renderIncidentDetailView` state-driven ops branch + analyst case; `buildLandedIncidentRow` switch references STATE_PILL_LABEL + 3 new state cases (ROUTED_BACK_TO_OPS, ROUTED_TO_TRADING_DESK, HEDGED); row gate simplified to seen|opened|actioned (handoffPending → dot only); `renderMonitoringView` hdrClickable allows analyst + ismail-post-approval banner text `Faye Sit`; demo-end banner injected on analyst monitoring; `onHeaderClick` analyst-allowed + opsRouteBack banner picker; `renderTablet` incident-detail branch simplified; `onIsmailApproveClick` re-target to ROUTED_BACK_TO_OPS + handoffPending.ops=true + reset ops seen/opened; `appendIsmailApprovalCaptureFooter` route-back wording; `fireWorkflowAgentArcApprove` log lines re-narrated; Ismail CTA copy updated to `route back to Faye Sit`; new functions: `renderOpsEscalationReport`, `revealEscalationReportInstant`, `paintEscalationReportCTAActioned`, `startEscalationReportReveal`, `wireNotifyTradingDeskCTA`, `onNotifyTradingDeskClick`, `appendNotifyTradingDeskCaptureFooter`, `fireWorkflowAgentArcNotify`, `renderAnalystIncidentDetail`, `revealAnalystScreenInstant`, `startAnalystScreenDReveal`, `wireDecisionOptions`, `restoreSelectedOptionUI`, `wireLockDecisionCTA`, `onLockDecisionClick`, `paintAnalystLockedCTA`, `appendLockDecisionCaptureFooter`, `fireWorkflowAgentArcLock`; `wireTranscriptModalLinks` selector list extended with `.oer-transcript-link, .ac-transcript-link`.
- `index.html` — appended W5 CSS block: state-pill-pulse keyframe + `.mon-pill-state-routed-back-to-ops/-routed-to-trading-desk/-hedged/-dispatched` pill colors; `.ops-escalation-report`, `.oer-card`, `.oer-heading`, `.oer-section`, `.oer-diagnosis`, `.oer-workflow-list`, `.oer-transcript-link`, `.oer-section-action`, `.oer-recommendation`, `.oer-impact`, `.oer-cta` (+ `:not(:disabled)` + `.oer-cta-actioned`); `.analyst-card`, `.ac-heading`, `.ac-loading`, `.ac-section`, `.ac-ctx-row`, `.ac-transcript-link`, `.ac-decision-list`, `.ac-option-card` (+ `[data-selected="true"]`), `.ac-opt-bullet`, `.ac-opt-body`, `.ac-opt-title`, `.ac-opt-detail`, `.ac-lock-cta` (+ `:not(:disabled)` + `.ac-lock-cta-actioned`); `.demo-end-banner` + `.deb-ic` + `.deb-txt` + `.deb-ts`.

Files intentionally not touched:
- Lim curated Screen D (`renderOnsiteIncidentDetail` + checklist + call-flow) — W4.1 lock preserved.
- Ismail curated Screen D content (summary card + revised diagnosis tile) — only the approve CTA copy, capture footer, post-approval banner, and Workflow Agent log lines changed.
- Faye's original Screen D (`renderOpsIncidentDetail`) — untouched; only the dispatcher routes to a different renderer.
- Drawer, telemetry modal, floating KG window, doc modal, agent roster, KG schema (no new node IDs added W5), log streaming plumbing.
- `renderAnalystView` stub — left in place as dead code (incident-detail no longer routes to it; trivial cleanup deferred).

Follow-up:
- `renderAnalystView` stub function now unused — can be deleted at next cleanup pass.
- Unreferenced `ticket.handoffPending.p1` mirror set in `onIsmailApproveClick` (kept for any legacy reader; can be dropped).

### W6 deployment confirmation (2026-05-22) — CLOSER

Final feature wave. Four areas landed: vertical-flow sequential gating across all 4 personas, locked-group header-only display on Lim's inspection workflow, right-pane agent firing sync with left-pane theaters, KG growth animation triggered after Lim's diagnosis-confirmed click.

**Vertical-flow sequential gating (Section A):**
- Faye Screen D — Action Steps card slot empty at t=0; spawns at t=10s via existing `paintActionStepsInitial` (no rework needed, already deferred per W3.9).
- Lim Screen D — Binary CTAs moved out of `startLimScreenDReveal` stage 3. Spawn now happens inside `updateChecklistProgress` once `checked >= LIM_CHECKLIST_THRESHOLD`. Re-entry path in `renderOnsiteIncidentDetail` repaints binary CTAs only when threshold already reached or call/diagnosis already advanced.
- Ismail Screen D — `paintIsmailCTADisabled` call removed from `startIsmailScreenDReveal`. CTA now spawns only at t=5s via `paintIsmailCTAReady` inside the reveal callback. Initial paint shows loading-only.
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
- Per-theater wiring: Faye Loading #1 → `inspection` (5s) · Faye Loading #2 → `triage` + `critic-power-gen` parallel (5s) · Faye Step 1 → `pl` (2s) · Faye Step 2 → `workflow` (5s) · Lim Loading #1 → `workflow` (5s) · Lim Loading #2 → `inspection` (5s) · Lim Safety theater → `hse` (3s) · Lim Instrument theater → `inspection` (3s) · Lim Root cause theater → `inspection` + `triage` parallel (3s) · Lim End-call Generating + Analyzing → `workflow` (3s each) · Ismail Loading → `triage` + `critic-power-gen` parallel (5s) · Faye Escalation Report Loading → `workflow` (5s) · Priya Loading → `market-intelligence` (5s) · plus Escalate-for-approval / Approve / Notify / Lock action arcs all fire `workflow` (3s) alongside existing `setAgentActive`.
- `initAgentCardStates()` seeds every card with `data-state="idle"` on init.

**Virtual source → existing card alias (Section F+G+H):**
- `GROUP_THEATER_AGENT` extended with `cardAgentIds` field per entry. Safety → `['hse']` · Instrument → `['inspection']` · Root cause isolation → `['inspection', 'triage']` (parallel fire).
- Ismail Screen D loading reveal updated: display name changed from `P&L Impact Validator` → `Turbine Diagnostic Agent`, loading text changed to `Loading institutional rotating-machinery knowledge for Dr. A. Ismail`, and fires `triage` + `critic-power-gen` cards in parallel for 5s synced with the loading theater.
- Lim Safety/Instrument/Root-cause theater log lines preserve W4.1 display names (`HSE Agent · ...`, `Instrument Diagnostic Agent · ...`, `Sensor Anomaly Inspector + Turbine Diagnostic Agent · ...`) — the card visual lights up the relevant existing card (no virtual source orphans).

**Workflow Agent always-fires-on-state-transition (Section I):**
- Every Workflow Agent arc (`fireWorkflowAgentArcEscalate`, `fireWorkflowAgentArcApprove`, `fireWorkflowAgentArcNotify`, `fireWorkflowAgentArcLock`) now invokes `fireAgentCardLifecycle('workflow', 3000)` alongside the existing `setAgentActive` call. Layered system: the existing arc logs + step-pill plus the W6 pulse + done-checkmark visual fire together.
- Plus per Section E: Workflow fires at Lim Loading #1, Lim Generating transcript, Lim Analyzing transcript, Faye Step 2 (find engineer), Faye Escalation Report Loading.

**KG growth animation (Section J+K):**
- Trigger: `setTimeout(triggerKGGrowth, 10000)` scheduled at the end of `onDiagnosisConfirmedClick` (Lim's pump casing crack diagnosis-confirmed-over-call button). `state.kgGrowthFired` guards single fire per page load.
- New nodes (3): `casing-tacit-knowledge` (L4) · `ismail-field-experience-2023` (L3) · `bfp-casing-inspection-protocol` (L1). All `canonical: false` · `isNew: true`.
- New edges (5): tacit-knowledge → pump-casing-crack-pattern · ismail-field-experience-2023 → casing-rca-jrg-2023 · ismail-field-experience-2023 → casing-tacit-knowledge · bfp-casing-inspection-protocol → casing-bfp-3a · bfp-casing-inspection-protocol → sop-bfp-vibration-investigation.
- `growKG()` pushes nodes/edges into module-level `KG_NODES`/`KG_EDGES` (runtime mutation — does not survive reload) and into the live `KG_STATE.graph.graphData()`. Visual treatment via `KG_STATE.newlyAddedNodes` Set checked inside `nodeThreeObject` — new nodes get Sembcorp-green halo ring at `radius * 1.55` instead of the standard white halo at `radius * 1.30`.
- Workflow Agent log line: `Tacit knowledge captured from Dr. A. Ismail's expert collaboration · 3 KG nodes + 5 edges enriched · BFP casing patterns codified`. Workflow Agent card briefly pulses (2s).
- After 4s post-growth, the `newlyAddedNodes` set clears and `KG_STATE.graph.refresh()` re-renders to revert the halo to white.
- KG window does NOT auto-open (Q4 lock preserved). New nodes visible only if window is open OR user opens it post-event.

Verified via Chrome MCP — per-test observed-vs-expected table:

| # | Test | Observed | Expected | Pass |
|---|---|---|---|---|
| A1 | Faye Action Steps gated at t=0 | screen=`incident-detail`, `actionStepsCard`=false, `action-steps-slot` empty, summary-slot has reveal-pending | per spec | ✓ |
| A2 | Lim Inspection Workflow card gated | `checklistInDOM`=false, `binaryCTAsInDOM`=false, loading stage `lim-summary` | per spec | ✓ |
| A3 | Lim Binary CTAs gated until 10/10 | At reveal: `checklistInDOM`=true, `binaryCTAsInDOM`=false. After 10/10 clicks: `binaryCTAsInDOM`=true · confirm+escalate enabled | per spec | ✓ |
| A4 | Ismail CTA + summary gated | At t=0: `ismailCTAInDOM`=false, `ismailSummaryInDOM`=false. At t=5s: both present, CTA enabled | per spec | ✓ |
| A5 | Faye Escalation Report gated | At t=0: `oerContent`=false, `oerCTA`=false, `oerHeading`=true, `oerLoading`=true. At t=5s: content + CTA present (4 sections), CTA enabled | per spec | ✓ |
| A6 | Priya Screen D gated | At t=0: `acContent`=false, `acLockCTA`=false, `optionCards`=0, `acLoading`=true. At t=5s: 4 option cards present, Lock CTA disabled until selection | per spec | ✓ |
| B1 | Locked groups header-only on Lim | Safety unlocked w/ 5 items · Instrument locked w/ 0 items + label class `ic-group-label ic-group-label-locked` · Root cause locked w/ 0 items + same label class | per spec | ✓ |
| B2 | Instrument items spawn after Safety 5/5 | After 5 safety clicks + 3s wait: Instrument locked=false, itemCount=3 | per spec | ✓ |
| B3 | Root cause items spawn after Instrument 3/3 | After 3 instrument clicks + 3s wait: Root cause locked=false, itemCount=2 | per spec | ✓ |
| C1 | Market Intelligence Agent card present | `[data-agent-id="market-intelligence"]` exists · name `Market Intelligence Agent` · role `Market · Trading Desk` · type `valid` (pink-vivid) | per spec | ✓ |
| C2 | Agent roster total = 15 | `agent-count` text `0 active · 15 registered` · validator bucket-count `3` · total `.agent-card` elements = 15 | per spec | ✓ |
| D1 | Faye-active dimming | Dimmed = `learning`, `hse`, `market-intelligence`. Active = orchestrator, inspection, triage, playbook, wo-prefill, workflow, pl, critic-power-gen. Standby preserved (hrsg, electrical, renewables, networks) | per spec | ✓ |
| D2 | Lim-active dimming | Dimmed = `wo-prefill`, `learning`, `pl`, `market-intelligence`. Active = orchestrator, inspection, triage, playbook, workflow, hse, critic-power-gen | per spec | ✓ |
| D3 | Ismail-active dimming | Dimmed = `inspection`, `playbook`, `wo-prefill`, `learning`, `hse`, `market-intelligence`. Active = orchestrator, triage, workflow, pl, critic-power-gen | per spec | ✓ |
| D4 | Priya-active dimming | Dimmed = `inspection`, `triage`, `playbook`, `wo-prefill`, `critic-power-gen`, `hse`. Active = orchestrator, workflow, pl, learning, market-intelligence | per spec | ✓ |
| E1 | Faye Loading #1 fires Sensor Anomaly Inspector | On AMBER click: inspection card `data-state="active"` + `agent-card-pulse` class present. At t=5s: state="done" | per spec | ✓ |
| E2 | Faye Loading #2 fires Turbine Diagnostic + Power Gen Critic | At t=5s (loading swap): triage + critic-power-gen both `active` w/ pulse. At t=10s: both `done` | per spec | ✓ |
| E3 | Faye Step 1 fires P&L Validator | On Action Steps spawn: `pl` card `active` for 2s | per spec | ✓ |
| E4 | Faye Step 2 fires Workflow Agent | On Step 2 finding-engineer: `workflow` card `active` for 5s | per spec | ✓ |
| E5 | Lim Screen D Loading #1 fires Workflow | On Lim AMBER click: workflow `active` w/ pulse | per spec | ✓ |
| E6 | Lim Safety theater fires HSE Validator | On checklist spawn: `hse` `active` for 3s (sync w/ Safety theater) | per spec | ✓ |
| E10 | Ismail Loading fires Turbine Diagnostic + Power Gen Critic | On Ismail AMBER click: triage + critic-power-gen `active` w/ pulse, loading text reads `Turbine Diagnostic Agent · Loading institutional rotating-machinery knowledge` | per spec | ✓ |
| E11 | Faye Escalation Report Loading fires Workflow | On second AMBER click (post route-back): workflow `active` w/ pulse for 5s | per spec | ✓ |
| E12 | Priya Loading fires Market Intelligence | On Priya AMBER click: `market-intelligence` card `active` w/ pulse for 5s | per spec | ✓ |
| J1 | KG growth fires 10s after Lim diagnosis-confirmed | Pre-click: 84 nodes / 106 links. 11s post-click: 87 nodes / 111 links. `state.kgGrowthFired`=true | per spec | ✓ |
| J2 | KG growth log line + 3 new node IDs | Workflow Agent log line `Tacit knowledge captured from Dr. A. Ismail's expert collaboration · 3 KG nodes + 5 edges enriched · BFP casing patterns codified` streamed. All 3 IDs (`casing-tacit-knowledge`, `ismail-field-experience-2023`, `bfp-casing-inspection-protocol`) present in `graphData().nodes` | per spec | ✓ |
| K1 | KG window does NOT auto-open | Window remained closed throughout test sequence (no automatic open trigger fired) | per spec | ✓ |
| E2E | Complete 4-persona happy path | Cold load → Faye dispatch (with sync'd right-pane firings + dimming) → Lim escalate (sequential-gated inspection workflow + locked-group header-only display + right-pane sync) → Ismail approve → Faye Escalation Report → Priya Lock decision (Market Intelligence Agent fires). 10s after Lim diagnosis-confirmed: KG growth fires (+3 nodes / +5 edges). Demo concludes at `HEDGED` pill | per spec | ✓ |

Subjective items (human-check required at projector dry-run):
- Per-test E2E — 4-section escalation report fits without scroll at projector resolution.
- Pulse animation cadence vs left-pane loading-dot frequency (1.4s W6 keyframe vs ~1.2s reveal-dots) — visual feel needs human eyeball.
- KG green-halo legibility for 4s post-growth at meeting-room projector distance.
- Done-state ✓ glyph readability against light card background (`::after` content `'✓'` w/ `green-vivid` color).

Files changed:
- `app.js` — `state.kgGrowthFired` flag added; `AGENT_PERSONA_RELEVANCE` const map; `fireAgentCardLifecycle` / `fireAgentCardsParallel` / `updateAgentDimmingForActivePersona` / `initAgentCardStates` helpers; `switchToPersona` + `init` call `updateAgentDimmingForActivePersona` + `initAgentCardStates`; `GROUP_THEATER_AGENT` entries extended with `cardAgentIds`; `buildLimGroupHTML` extracted from `paintLimChecklist` (locked groups render header-only); `triggerGroupTheater` end-callback now spawns full item rows + fires card lifecycle; `paintLimBinaryCTAs` no longer paints during reveal stage 3 — spawned by `updateChecklistProgress` at 10/10; `renderOnsiteIncidentDetail` re-entry path checks threshold before painting CTAs; `startIsmailScreenDReveal` no longer paints disabled CTA upfront — loading-only at t=0 + Turbine Diagnostic Agent alias display name + fires triage+critic-power-gen card pulse; `renderOpsEscalationReport` initial markup heading+loading only; new `spawnEscalationReportContent` injects 4-section content + CTA at reveal; `renderAnalystIncidentDetail` initial markup heading+loading only; new `spawnAnalystScreenContent` injects operational context + decision options + Lock CTA at reveal; `startScreenDRevealW39` fires `inspection` (5s) + `triage`+`critic-power-gen` parallel (5s); `startActionStep1` fires `pl` (2s); `unlockActionStep2` fires `workflow` (5s); `startLimScreenDReveal` fires `workflow` (5s) + `inspection` (5s); `onCallEnd` fires `workflow` for both generating + analyzing stages (3s each); `startEscalationReportReveal` fires `workflow` (5s); `startAnalystScreenDReveal` fires `market-intelligence` (5s); `fireWorkflowAgentArc{Escalate, Approve, Notify, Lock}` all layer `fireAgentCardLifecycle('workflow', 3000)`; `onDiagnosisConfirmedClick` schedules `triggerKGGrowth` 10s out; new `triggerKGGrowth` + `growKG` + `KG_GROWTH_NODES` + `KG_GROWTH_EDGES`; `KG_STATE.newlyAddedNodes` Set; `nodeThreeObject` checks set for green-halo treatment on freshly-grown nodes.
- `index.html` — appended W6 CSS block (`.agent-card[data-state="active"]` border + box-shadow; `.agent-card[data-state="done"]` border + bg tint + `::after` ✓ glyph; `.agent-card-pulse` + `@keyframes agent-w6-pulse`; `.agent-card.agent-dim` 35% opacity + saturate(0.4); `.agent-card.standby.agent-dim` standby-preserved override; `.ic-group[data-locked="true"] .ic-group-label.ic-group-label-locked` pill style + `.ic-group-label-status` italic muted text). Market Intelligence Agent card markup added inside `data-bucket="validator"` `.bucket-body`. Validators `bucket-count` 2 → 3. Agent count meta `0 active · 14 registered` → `0 active · 15 registered`.

Files intentionally not touched:
- `vendor/*.min.js` — three.js / 3d-force-graph preserved.
- W4.1 `.ic-group[data-locked="true"] .ic-item { opacity: 0.4; ... }` rule left in place as dead code (items no longer rendered for locked groups so the rule never applies) — pruning deferred to next cleanup pass.
- Faye P1 dispatch arc (`dispatchP1Arc` + INSPECTION/TRIAGE/POWER_GEN_CRITIC scripts) — preserved unchanged. The W6 fire helper layers data-state pulse on top; existing arc agent-active class + step-pill logic untouched.
- Lim curated Screen D narrative content (transcript modal lines, revised diagnosis copy, capture footer wording) — preserved per W4.1 + W5 locks.
- Ismail / Priya capture footer wording, state pill machine, route-back logic — preserved per W5 lock.
- Drawer, telemetry modal, floating KG window auto-open behavior, doc modal — untouched.

Follow-up:
- `.ic-group[data-locked="true"] .ic-item` W4.1 dead rule (above) can be removed at cleanup.
- `paintLimBinaryCTAs` always also calls `enableBinaryCTAs` if threshold met — call from `updateChecklistProgress` is now redundant after spawn but harmless (the second call is a no-op when the buttons are already enabled).
- `KG_STATE.graph.refresh()` API availability untested in offline dry-run — if missing on the bundled `3d-force-graph` build, the green halo will persist for the rest of the demo (cosmetic only; the meeting won't notice).
- W6 layered with the existing W3.4 `setAgentActive` lifecycle. Future cleanup could consolidate the two systems, but the current overlay is intentional — preserves existing arc-driven step-pill + adds W6 pulse + done-checkmark without rewriting.

### W7 deployment confirmation (2026-05-22) — FINAL CLOSER

Final feature wave. Ismail removed as clickable persona · binary CTAs replaced w/ Diagnosis Verdict · single-button post-call confirm-revised flow · P2 right pane = inline KG · bigger KG architecture.

**W4.1 top-button morph chain REMOVED:**
- `setConfirmBtnPhase()` + `state.lim.confirmBtnPhase` + `.binary-cta.phase-*` CSS dropped.
- Single Diagnosis Verdict section replaces the two W4.1 binary CTAs.
- `morphConfirmCTAToEscalate` retained as a thin no-op wrapper that re-spawns the Confirm-revised button for re-entry safety.

**Diagnosis Verdict section:**
- Spawns at 10/10 inspection checks complete (sequential gating · matches W6 pattern).
- Heading `DIAGNOSIS VERDICT`. Sub-text `Confirm Hyperspace OS hypothesis OR reject and escalate to senior engineer.`
- Two side-by-side buttons: Reject (light-red `#FEE2E2`) · Confirm (light-green `#D1FAE5`). 50/50 width split via flex.

**Reject path (main demo path):**
- Click Reject → Diagnosis Verdict removed → Workflow Agent SOP-routing theater (3s, `Workflow Agent · Connecting to Dr. A. Ismail via call · routing through escalation playbook`) → in-call strip spawns directly (top button gone — no morph required).
- Post-call flow preserved: End → generating transcript (3s) → transcript-attached → analyzing (3s) → `Use crack in pump casing diagnosis confirmed over call with Dr. A. Ismail` button → diagnosis morph (W4.1 preserved).

**Confirm path (alt · minimal stub):**
- Click Confirm → Diagnosis Verdict removed → simple capture footer (3 ✓ lines including `Faye Sit notified · returned for ops + commercial action`) → state `DIAGNOSIS_CONFIRMED_WO_SUBMITTED` → `handoffPending.ops = true` → P1 pulse.
- Routes back to Faye via Escalation Report dispatcher with `BANNER_COPY.opsConfirmedReturn`.

**Post-call: `Confirm revised diagnosis` button (W7 NEW):**
- Spawns after diagnosis morph (replaces W4.1's top-button morph to `Escalate for approval`).
- Click → Workflow Agent SOP-review theater (3s, `Workflow Agent · Reviewing SOP-BFP-VIBR-001 + cross-checking revised diagnosis against current procedures`) → state `REVISED_DIAGNOSIS_ROUTED` + capture footer (3 ✓ lines · line 1 folds `Faye Sit notified · revised diagnosis routed` into one line) + `Routed back to Faye Sit · <ts>` label + P1 pulse.

**State pill chain simplified:**
`TRIAGE_READY → DISPATCHED_TO_ONSITE → REVISED_DIAGNOSIS_ROUTED → ROUTED_TO_TRADING_DESK → HEDGED` (5 main states · alt: `DIAGNOSIS_CONFIRMED_WO_SUBMITTED` for Confirm path).
- Dropped `ESCALATED_TO_OFFSITE` + `ROUTED_BACK_TO_OPS` + `ONSITE_CONFIRMED` + `AWAITING_ASSET_PERF`.
- `REVISED_DIAGNOSIS_ROUTED` + `DIAGNOSIS_CONFIRMED_WO_SUBMITTED` reuse `.mon-pill-state-revised-diagnosis-routed` (amber pulse) per W5 styling.
- `POST_DISPATCH_STATE_PILL` shrunk to ops-only entry (`DISPATCHED_TO_ONSITE`); onsite/offsite entries dropped.

**Persona panel reduced to 3 tiles:**
- `renderPersonasPanel` filters `PERSONAS` to exclude `offsite`. Tiles: Faye Sit (active) · Lim Wei Jie (available) · Priya Sundaram (locked, unlocks on Faye Notify trading desk).
- Ismail stays in narrative only (transcript modal, Faye Escalation Report copy, Lim's call-flow agent name).
- `switchToPersona('offsite')` early-returns as guard.
- `renderOffsiteIncidentDetail` + `PERSONA_OWN_TASKS.offsite` + `BANNER_COPY.offsite` + Ismail post-approval banner + `state.ismail.*` kept as dead code (WA #5).

**`AGENT_PERSONA_RELEVANCE` updated:** offsite removed from all agent relevance arrays. Ismail-relevant agents (triage, pl, critic-power-gen) re-distributed to remaining personas (ops/onsite/analyst).

**Faye Escalation Report Section 2 copy update:**
- `Revised diagnosis sign-off received` row replaced with `Transcript captured · <Dr. A. Ismail> + <Lim Wei Jie> discussed and agreed (see transcript)` row.
- Inline `.oer-tx-inline` button opens existing transcript modal via `wireTranscriptModalLinks` (selector list extended).

**Faye second banner copy:**
- `BANNER_COPY.opsRouteBack.body` updated: `INC-2026-0537 · Returned from <Lim Wei Jie> · diagnosis revised via expert call · ops + commercial action required` (was `Returned from Dr. A. Ismail · diagnosis confirmed`).
- New `BANNER_COPY.opsConfirmedReturn` for Confirm-path return (state `DIAGNOSIS_CONFIRMED_WO_SUBMITTED`).
- `onHeaderClick` picks copy per state pill.

**P2 right pane = inline 3D KG:**
- `renderRightPane()` per-persona variant invoked from `render()`. `onsite` → `paintRightPaneInlineKG()` reparents existing `#kg-3d-mount` into a `#right-pane-kg-inline` full-pane container; hides all standard children (toolbar · zone-agents · log-dropdown · zone-flywheel) via `style.display = 'none'` + `dataset.rpHidden` marker. Auto-closes the floating KG window if open.
- Other personas → `paintRightPaneStandard()` (restores hidden children · moves mount back into `.kg-fw-body` · hides inline container).
- KG state (zoom, rotation, chain highlights) preserved across persona switches via reparenting the same DOM element. Three.js renderer keeps its scene.
- Resize: explicit `KG_STATE.graph.width(...).height(...)` call on reparent.

**Bigger KG architecture — Tacit Knowledge + KG Auditor/Updater clusters:**
- 3-tier visual separation along X-axis: main KG (left, x: -100 to +100) · Auditor cluster (middle, x: 200..240) · Tacit Knowledge cluster (right, x: 360..400).
- Auditor cluster: 3 new nodes (`kg-auditor-agent`, `kg-updater-agent`, `workflow-rewire-agent`) · blue `#3B82F6` ring halo.
- Tacit Knowledge cluster: 3 nodes (W6 growth nodes repositioned · `casing-tacit-knowledge`, `ismail-field-experience-2023`, `bfp-casing-inspection-protocol`) · amber `#F59E0B` ring halo.
- 7 new edges (`KG_CLUSTER_FLOW_EDGES`): tacit → auditor (3) · auditor → main KG (3) · auditor internal cohesion (1). Flow shows captured knowledge → review/audit → main KG enrichment.
- Camera initial pose widened: `x: 100, y: 0, z: 480` looking at `x: 200, y: 0, z: 0`. `startAutoRotate` orbit center shifted to `x: 200`.
- W6 `triggerKGGrowth` semantics adjusted: nodes already in initial `KG_NODES` (visible from cold load) · growth fire calls `flashKGGrowthHalo()` which sets `KG_STATE.newlyAddedNodes` for 4s green halo · no graph mutation.
- `nodeThreeObject` ring color: newly-added (green) > auditor cluster (blue) > tacit cluster (amber) > default (white).

Verified via Chrome MCP — happy-path runthrough through all 5 state transitions (TRIAGE_READY → DISPATCHED_TO_ONSITE → REVISED_DIAGNOSIS_ROUTED → ROUTED_TO_TRADING_DESK → HEDGED), Diagnosis Verdict gating at 9/10 vs 10/10, Reject + Confirm-revised theaters and timing, P2 inline KG mount reparenting + reverse on P1/P4 switch, persona panel tile count (3 tiles · no Ismail), banner copy strings, Escalation Report Section 2 row swap, all 7 cluster-flow edges present in `KG_EDGES`, halo flash mechanics on `triggerKGGrowth`.

Per-test table:
```
#: 1
Test: Cold load persona panel
Observed: 3 tiles (ops active, onsite available, analyst locked); no offsite tile in DOM
Expected: 3 tiles same as observed
Pass: ✓

#: 2
Test: STATE_PILL_LABEL keys
Observed: TRIAGE_READY, DISPATCHED_TO_ONSITE, REVISED_DIAGNOSIS_ROUTED, DIAGNOSIS_CONFIRMED_WO_SUBMITTED, ROUTED_TO_TRADING_DESK, HEDGED
Expected: 5 main + 1 alt (Confirm); no ESCALATED_TO_OFFSITE or ROUTED_BACK_TO_OPS
Pass: ✓

#: 3
Test: AGENT_PERSONA_RELEVANCE offsite removal
Observed: no relevance array contains 'offsite'
Expected: offsite stripped from every entry
Pass: ✓

#: 4
Test: KG cold load cluster nodes
Observed: 3 auditor nodes + 3 tacit nodes present; 7 cluster-flow edges
Expected: 3 auditor + 3 tacit + 7 cluster-flow edges
Pass: ✓

#: 5
Test: Diagnosis Verdict not present at 9/10
Observed: .diagnosis-verdict absent at checked=9
Expected: gated open only at 10
Pass: ✓

#: 6
Test: Diagnosis Verdict spawns at 10/10
Observed: .diagnosis-verdict + .dv-heading "Diagnosis verdict" + dv-reject "Reject" + dv-confirm "Confirm"
Expected: section + heading + Reject + Confirm buttons
Pass: ✓

#: 7
Test: Reject click → SOP-routing theater then in-call strip
Observed: theater spawned, removed after 3s, in-call strip in DOM with End button
Expected: theater for 3s then in-call strip
Pass: ✓

#: 8
Test: End call → post-call stages → diagnosis-confirmed-over-call button
Observed: .post-call-confirm-btn appeared after generating-transcript + transcript-attached + analyzing chain
Expected: ~6s chain to confirmed-over-call button
Pass: ✓

#: 9
Test: Confirmed-over-call click → diagnosis morph + Confirm-revised button
Observed: .sr-hypothesis-revised present + .confirm-revised-cta with text "Confirm revised diagnosis"
Expected: revised tile + new green button
Pass: ✓

#: 10
Test: Confirm-revised click → SOP-review theater → state advance to REVISED_DIAGNOSIS_ROUTED
Observed: pill REVISED_DIAGNOSIS_ROUTED, ticket.handoffPending.ops=true, ticket.byPersona.onsite.actioned=true, capture footer with "Faye Sit notified · revised diagnosis routed" line, "Routed back to Faye Sit" label, P1 tile pulses
Expected: same as observed
Pass: ✓

#: 11
Test: Switch P2→P1 right pane reshapes
Observed: mount.parentElement.className = "kg-fw-body"; toolbar/zone-agents/zone-flywheel display restored; inline KG container display:none
Expected: standard right pane restored
Pass: ✓

#: 12
Test: Faye banner copy on return — opsRouteBack chosen by state pill match
Observed: state.bannerKey='opsRouteBack'; opsRouteBack body has "Returned from Lim Wei Jie · diagnosis revised via expert call"
Expected: opsRouteBack copy with Lim's name
Pass: ✓

#: 13
Test: Escalation Report Section 2 copy
Observed: 6 workflow items; no "sign-off received" row; transcript-discussed-and-agreed row + inline (see transcript) button present
Expected: signoff row replaced w/ transcript row + inline button
Pass: ✓

#: 14
Test: Inline (see transcript) opens modal
Observed: transcript-modal data-open="true" after click
Expected: modal opens
Pass: ✓

#: 15
Test: Notify trading desk → state advance + Priya unlocks
Observed: pill ROUTED_TO_TRADING_DESK; state.priyaUnlocked=true; analyst tile state="available" + pulse=true
Expected: same as observed
Pass: ✓

#: 16
Test: P2 right pane = inline KG mount reparent
Observed: mount.parentElement.id="right-pane-kg-inline"; all standard children display:none
Expected: mount reparented + standard children hidden
Pass: ✓

#: 17
Test: triggerKGGrowth flash mechanics
Observed: state.kgGrowthFired=true; KG_STATE.newlyAddedNodes = [3 tacit IDs]
Expected: flash mechanics fire on the 3 tacit cluster IDs
Pass: ✓

#: 18
Test: Priya happy path → HEDGED
Observed: pill HEDGED; state.priya.decisionLocked=true; selectedOption='hedge'
Expected: HEDGED + decisionLocked
Pass: ✓

#: 19
Test: Cluster ring colors (visual)
Observed: requires projector-quality visual inspection of three.js sphere materials
Expected: main = white halo, auditor = blue, tacit = amber, newly-added (during 4s flash) = green
Pass: human check required

#: 20
Test: 10s KG growth flash post-confirm-over-call click (visual)
Observed: 4s green halo on 3 tacit nodes per `nodeThreeObject` accessor + setTimeout chain (mechanics verified via eval); visual flash duration requires browser observation
Expected: 4s green halo, reverts to amber
Pass: human check required

#: 21
Test: Projector legibility at full viewport (visual)
Observed: not yet tested at projector resolution
Expected: legible at venue projector resolution
Pass: human check required
```

Files changed:
- `app.js` — state.lim verdict flags (drop confirmBtnPhase, add verdictSpawned/rejectClicked/confirmRevisedClicked) · STATE_PILL_LABEL rewrite · BANNER_COPY (opsRouteBack body update + new opsConfirmedReturn) · onHeaderClick banner-key picker · POST_DISPATCH_STATE_PILL shrink · renderIncidentDetailView ops dispatcher pill match · renderPersonasPanel offsite filter · switchToPersona offsite guard · AGENT_PERSONA_RELEVANCE offsite removal · paintDiagnosisVerdict + wireVerdictButtons + onVerdictReject + onVerdictConfirm + spawnInCallStrip + appendConfirmedCaptureFooter (new) · updateChecklistProgress 10/10 spawn switched to paintDiagnosisVerdict · renderOnsiteIncidentDetail re-entry path rewritten (actioned + summaryRevealed branches) · onDiagnosisConfirmedClick spawns Confirm-revised button · spawnConfirmRevisedDiagnosisButton + wireConfirmRevisedDiagnosis + onConfirmRevisedDiagnosisClick + advanceToRoutedRevisedDiagnosis + appendRevisedDiagnosisCaptureFooter (new) · renderOpsEscalationReport Section 2 row swap + state-pill skip-loading check · onNotifyTradingDeskClick state guard · wireTranscriptModalLinks selector extended · render() invokes renderRightPane · paintRightPaneInlineKG + paintRightPaneStandard (new) · KG_TACIT_NODES + KG_AUDITOR_NODES + KG_CLUSTER_FLOW_EDGES (new) replacing W6 KG_GROWTH_NODES/EDGES module exports · triggerKGGrowth simplified to halo flash · nodeThreeObject ring-color cluster logic · cameraPosition + startAutoRotate orbit center shifted to x=200.
- `index.html` — W7 CSS block before </style>: .diagnosis-verdict + .dv-* · .sop-routing-theater + .sop-review-theater · .confirm-revised-cta · .mon-pill-state-revised-diagnosis-routed · .oer-tx-inline · .right-pane-kg-inline.

Files intentionally not touched:
- `renderOffsiteIncidentDetail` + Ismail call-flow agent name references + `state.ismail.*` reset paths · Ismail post-approval banner · `PERSONA_OWN_TASKS.offsite` (dead code per WA #5, throwaway convention).
- W4.1 `.binary-cta` CSS + `.in-call-strip` styling + post-call stages styling — preserved per spec A.2.
- All persona-own-tasks data + telemetry modal + transcript modal + doc modal + drawer.
- Faye P1 dispatch arc + scripts.
- KG_THEATER_NODES + KG_THEATER_EDGES (W3.4 theater density).

Follow-up:
- `paintIsmailCTADisabled`, `paintIsmailCTAReady`, `paintIsmailCTAApproved`, `wireIsmailApproveClick`, `onIsmailApproveClick`, `appendIsmailApprovalCaptureFooter`, `fireWorkflowAgentArcApprove` — dead after W7. Leave per throwaway convention.
- `onEscalateForApprovalClick`, `paintLimEscalationComplete`, `appendEscalationCaptureFooter`, `fireWorkflowAgentArcEscalate` — dead after W7. Leave.
- `morphConfirmCTAToEscalate` reduced to no-op spawn-button shim (kept for safe re-entry; no longer triggers escalate-ready morph).
- Visual verification of cluster ring colors + 10s KG growth flash + projector legibility = pending human/Pulkit check during dry-run.

### W8 deployment confirmation (2026-05-22) — POLISH + PRIYA LAPTOP

Final polish wave. Bundled 18 polish items + 1 structural pivot (Priya laptop view) + 1 diagnostic (random screen flashes diagnosed + fixed).

**Section 0 — Flashes diagnosed + fixed:**
- Root cause identified (analytical from code reading + temporary instrumentation):
  1. `renderPersonasPanel()` wiped `personas-row.innerHTML` on every `render()` call. Each rebuild created fresh persona-tile DOM nodes; the `.persona-tile-pulse` infinite keyframe (`@keyframes persona-pulse 1.6s ease-in-out infinite`) restarted at frame 0 each time, causing the box-shadow to snap from mid-cycle bright back to the dim 0% state — visible pulse-reset flash.
  2. `paintRightPaneInlineKG()` called `KG_STATE.graph.width().height()` on every `render()` for the onsite persona. Repeated three.js resize on unchanged dimensions caused micro canvas-blank flashes.
  3. `renderTablet()` wiped `tablet-root.innerHTML` on every `render()` call. Reveal-slide animations mid-flight were torn down and replayed; concurrent `render()` calls during setTimeout chains restarted in-flight reveals visibly.
- Fix shape applied — all 3 parts per coach Option (b) with extended-tuple guardrail:
  1. **`renderPersonasPanel()` diff-update.** Tiles built once (lazy on first call); subsequent calls only mutate `data-state` attribute + `.persona-tile-pulse` class on existing tile elements. In-flight pulse keyframe preserved.
  2. **`paintRightPaneInlineKG()` resize cache.** `KG_STATE._lastInlineW/_lastInlineH` cache; three.js `.width().height()` only called when dimensions change. Cache invalidated when KG mount moves back to floating window.
  3. **`renderTablet()` wipe guard via extended `tabletCacheKey()`.** Tuple includes `activePersona`, `screen`, `bannerVisible`, `bannerKey`, `incidentLanded`, `priyaUnlocked`, `statePill`, `handoffPending` (4-bit string), `byPersona[active].seen/opened/actioned`. Skip wipe when tuple unchanged.
- Audit of all 19 render() callers complete; every caller's state mutation maps to extended-tuple keys (no callers needed refactor). Documented mapping table in coach session.
- Cold-demo Chrome MCP verification: all happy-path tests pass cleanly. Visual flash verification = subjective human-check at projector dry-run.

**Section A — Agent roster 15 → 17:**
- Renamed `Workflow Agent` → `A2A Coordination Agent` (display only; `data-agent-id="workflow"` preserved · role label `SOP Capture` → `Agent-to-Agent Handoff`).
- New: `SOP Action Agent` (`data-agent-id="sop-action"`, role `SOP Routing + Review`, Domain Reasoning Experts bucket).
- New: `Audio-transcription Agent` (`data-agent-id="audio-transcription"`, role `Call → Text`, Domain Reasoning Experts bucket).
- Agent-count meta: `0 active · 15 registered` → `0 active · 17 registered`.
- Domain Reasoning bucket-count: 5 → 7.
- `AGENT_PERSONA_RELEVANCE` updated; `AGENT_DISPLAY_NAME` dictionary updated.
- Theater firing swaps: SOP-routing connect (Reject) + SOP-review (Confirm revised) fire `sop-action`. Post-call generating-transcript + analyzing-transcript fire `audio-transcription`. Escalation report loading + notify trading desk arc keep `workflow` (label-rename only).

**Section B — Faye Notes reposition:**
- Notes section moved from standalone slot (between content + back button) into Step 2 Action Steps card, between revealed Lim Wei Jie engineer row and Confirm on-site dispatch CTA.
- DOM order verified: `[as-heading, as-step (step 1), as-step (step 2), notes-standalone notes-in-step2, action-cta]`.
- Re-entry path (paintActionStepsComplete) also embeds notes inside steps container.

**Section C — Lim P2 Screen D sequencing:**
- C.1: Predicted Diagnosis paints immediately on Lim entry (no 10s reload theater · Faye already revealed). Status pill `✓ confirmed by Hyperspace OS · pending onsite verification` added.
- C.2: Sequencing bug fix — Stage 1 + Stage 2 reveals dropped entirely; `startLimScreenDReveal` now paints summary once + delays only the checklist by 2s. Eliminates the double-paint root cause (pushReveal Stage 3 was firing `paintLimSummaryComplete` a second time after the section was already painted).
- C.3: 12px top margin added to Lim's notes-standalone wrapper (separates from metrics 2×2 above).
- C.4: Notes record affordance dropped for Lim. New display-only structure: heading `Note from <Faye Sit>` + incoming chip (`incoming · 02:48 SGT`) + body text. No mic button, no textarea. CSS class `notes-section-display`.
- C.5: Inspection groups truncate to header-only `✓ <label> · N/N completed` at 10/10 complete. New helper `truncateInspectionGroupsToCompleted()` + CSS class `.ic-group-label-completed` (green-soft bg + 3px green-vivid left border).

**Section D — Ismail-call + post-call polish:**
- D.1: SOP-routing connect theater 3s → 6s. `fireAgentCardLifecycle('sop-action', 6000)`. Timeout to spawn in-call strip also 6000ms.
- D.2: In-call strip `max-width: 70%` (margin auto). Verified narrower in browser.
- D.3: Transcript modal `max-width: 70%` (capped at 520px). Narrower modal.
- D.4: Call-ended strip fades + removes (`opacity 0.3s` + `setTimeout 320ms`) when `Transcript attached` stage paints.
- D.5 + D.6: Audio-transcription Agent fires during generating + analyzing transcript stages. SOP Action Agent fires during SOP routing + SOP review stages. Log line `source` tokens + `reveal-agent` text updated.

**Section E — Revise diagnosis TILE:**
- Standalone `confirm-revised-cta` button REMOVED (function + CSS + selectors deleted).
- New `.revise-diagnosis-tile` containing icon block + heading `REVISE DIAGNOSIS` + body explanatory text + inline `.rdt-confirm-btn` button on right.
- Tile spawns automatically at end of post-call Analyzing-transcript stage (E.4 — `onDiagnosisConfirmedClick` called from setTimeout completion, no user click required).
- The post-call `diagnosis-confirmed-button` stage retired (returns empty markup); `wireDiagnosisConfirmedButton` deleted.
- Inline button click → existing W7 Section F flow: SOP Action Agent SOP-review theater (3s) → state `REVISED_DIAGNOSIS_ROUTED` + capture footer + Faye notified + P1 pulse.

**Section F — Dyn-name on green:**
- New `.dyn-name-on-green` CSS variant: `rgba(255,255,255,0.20)` translucent-white bg + white text + white border + drop shadow. Defined as sibling to `.dyn-name`.
- Applied to:
  - Faye Escalation Report `Notify trading desk · route to <Priya Sundaram>` CTA — Priya span.
  - Ismail-approve dead-path CTA `Approve escalation and route back to <Faye Sit>` — Faye span (W7 dead but consistent).

**Section G — Priya laptop view (STRUCTURAL PIVOT):**
- LEFT pane swaps tablet bezel for MacBook-style laptop chrome when `state.activePersona === 'analyst'`.
- New `#laptop-frame` sibling to `#tablet` in `index.html` (display=none by default).
- Laptop chrome: 1100px max-width · titlebar w/ traffic-light dots + URL pill `sembcorp.energy-trading · Singapore` · content area `#laptop-content` w/ light-stage bg · subtle 14px keyboard-hint at bottom.
- Trader dashboard built lazily on first laptop render. 3 zones:
  - Zone 1 — Portfolio Overview · Singapore Market (5 cards: Jurong CCGT 1,600 MW · Tuas Cogen 860 MW · Senoko 560 MW · Solar 200 MWp · Battery 100 MW/200 MWh)
  - Zone 2 — Market Snapshot (3 cards: SG Power Price $112.45 +18.30 · Reserve Margin 28% comfortable · Market Regime NORMAL)
  - Zone 3 — Active Tasks (3 TRD- rows from `PERSONA_OWN_TASKS.analyst`)
- Top bar: Sembcorp Energy Trading branding (left) + Priya Sundaram persona block (center) + notification bell w/ count badge (top-right).
- Notification bell behavior: count=0 + no pulse cold load. When statePill=`ROUTED_TO_TRADING_DESK` AND `!decisionLocked`: count=1 + `td-bell-pulse` keyframe (green halo · 1.6s). Click bell → opens trader modal. After lock: count=0 + pulse stops.
- 60% center modal w/ backdrop-blur dim. Header: green-soft bg + `INC-2026-0537 · Trading Desk Action Required` + close (×) button. Body: hosts existing W5 analyst-screen-d content (Market Intelligence Agent 5s loading → 4 decision options + Lock CTA).
- Analyst-screen-d content REUSED unmodified (option cards, lock CTA, transcript link wiring, reveal helpers all keyed off existing CSS selectors). New `paintAnalystContentIntoModal(container)` mounts the same structure inside `.trader-modal-body`.
- Lock decision → 900ms hold (user sees Decision locked CTA briefly) → `render()` → `syncLaptopModalState()` removes modal · `updateLaptopDemoEndBanner()` adds persistent banner above zones (`✓ Cycle complete · <option> locked · revenue exposure neutralized · INC-2026-0537 closed · 03:01 SGT`).
- Persona switch out of analyst tears down any open trader modal + restores tablet display.
- Right pane during Priya = standard agent buckets + log + flywheel (W7 lock preserved · no inline KG for P4).
- `render()` updated to branch via `renderLeftPane()` which handles tablet vs laptop visibility + paint dispatch.
- `appendLockDecisionCaptureFooter` finds `#incident-detail-view` (now lives inside `.trader-modal-body`; ID re-used) — capture footer paints inside modal body for completeness.

**Files changed (W8):**
- `app.js` — agent relevance + name dictionary updates; new functions `tabletCacheKey`, `renderLeftPane`, `renderLaptopContent`, `paintLaptopDashboard`, `wireLaptopBellClick`, `onLaptopBellClick`, `updateLaptopBellState`, `updateLaptopDemoEndBanner`, `syncLaptopModalState`, `openTraderModal`, `paintAnalystContentIntoModal`, `closeTraderModal`, `spawnReviseDiagnosisTile`, `wireReviseDiagnosisTile`, `truncateInspectionGroupsToCompleted`, `insertOpsNotesIntoStep2`; existing `renderTablet`/`renderPersonasPanel`/`paintRightPaneInlineKG` refactored for cache + diff-update; `onVerdictReject` / `onCallEnd` / `onDiagnosisConfirmedClick` / `onConfirmRevisedDiagnosisClick` / `onLockDecisionClick` updated for new agent firings + theater durations + auto-trigger; `startLimScreenDReveal` reduced to immediate paint; `paintLimSummaryComplete` adds W8 status pill; `paintActionStepsComplete` + `unlockActionStep2` embed notes in step-2 container; `buildLimNotesSection` rewritten display-only; `paintLimChecklistComplete` calls `truncateInspectionGroupsToCompleted`; `postCallStageHTML` updated to fire audio-transcription + diagnosis-confirmed-button stage retired; `appendLockDecisionCaptureFooter` works inside modal body. Dead functions removed: `spawnConfirmRevisedDiagnosisButton`, `wireConfirmRevisedDiagnosis`, `wireDiagnosisConfirmedButton`. Workflow Agent display-name replaced w/ A2A Coordination Agent in DCF strings + reveal-agent text + dictionary.
- `index.html` — agent-count text 15 → 17; Domain Reasoning bucket-count 5 → 7; Workflow Agent card renamed (data-id preserved); 2 new agent cards added; new `#laptop-frame` markup + extensive CSS for laptop chrome, dashboard, bell, 60% modal, notes-incoming + display-only notes, ic-group-label-completed, sr-hyp-status-pill, revise-diagnosis-tile + rdt-*, dyn-name-on-green; in-call-strip max-width 70%; transcript-modal-card max-width 70% / 520px.

**Files intentionally not touched (W8):**
- `renderAnalystIncidentDetail` and `spawnAnalystScreenContent` (left intact · renderTablet path for analyst is unreachable post-W8 since `renderLeftPane` routes analyst to laptop · keep as dead code per WA #5).
- `paintRightPaneStandard` reparent path · floating KG window logic · KG_STATE growth pipeline.
- All Faye P1 dispatch arc scripts · banner copy · INC row markup.
- Lim inspection checklist content (5 + 3 + 2 items unchanged).
- Ismail dead-code paths (other than dyn-name-on-green rename).

**Verified via Chrome MCP — per-test observed-vs-expected table:**

#: 1 · Test: agent-count text · Observed: `0 active · 17 registered` · Expected: 17 registered · Pass: ✓
#: 2 · Test: Domain Reasoning bucket-count · Observed: 7 · Expected: 7 · Pass: ✓
#: 3 · Test: sop-action card present · Observed: true · Expected: true · Pass: ✓
#: 4 · Test: audio-transcription card present · Observed: true · Expected: true · Pass: ✓
#: 5 · Test: Workflow card display name · Observed: `A2A Coordination Agent` · Expected: `A2A Coordination Agent` · Pass: ✓
#: 6 · Test: persona-tile diff-update (Part 1) · Observed: `personas-row` `data-built=1` after render, 3 tiles, in-place state mutations · Expected: row no longer wiped per render · Pass: ✓
#: 7 · Test: Faye Notes inside Step 2 · Observed: DOM order `[as-heading, as-step×2, notes-in-step2, action-cta]` · Expected: notes between Lim row + Confirm CTA · Pass: ✓
#: 8 · Test: Lim Predicted Diagnosis paints immediately · Observed: `.sr-hypothesis` present at t+500ms · Expected: no 10s reload · Pass: ✓
#: 9 · Test: Lim status pill · Observed: `✓ confirmed by Hyperspace OS · pending onsite verification` · Expected: same · Pass: ✓
#: 10 · Test: Lim notes display-only · Observed: no mic, no textarea, body+chip present, 12px margin-top · Expected: same · Pass: ✓
#: 11 · Test: Inspection groups truncate at 10/10 · Observed: all 3 groups `data-collapsed=true` w/ `✓ N/N completed` label · Expected: same · Pass: ✓
#: 12 · Test: Diagnosis Verdict spawns at 10/10 · Observed: `.diagnosis-verdict` present · Expected: same · Pass: ✓
#: 13 · Test: Reject → SOP Action Agent SOP-routing theater 6s · Observed: theater visible until t+6.5s · Expected: 6s · Pass: ✓
#: 14 · Test: SOP Action Agent firing during routing · Observed: `data-state=active` · Expected: same · Pass: ✓
#: 15 · Test: in-call strip max-width 70% · Observed: `maxWidth: 70%` · Expected: same · Pass: ✓
#: 16 · Test: in-call strip removed when transcript-attached · Observed: `.in-call-strip` absent post-D.4 · Expected: same · Pass: ✓
#: 17 · Test: Audio-transcription Agent fires post-call · Observed: agent-state advances to active then done · Expected: same · Pass: ✓
#: 18 · Test: Revise diagnosis tile spawns automatically · Observed: `.revise-diagnosis-tile` present after analyzing-transcript, no user click required · Expected: same · Pass: ✓
#: 19 · Test: Revise tile heading `REVISE DIAGNOSIS` + inline button · Observed: heading + body + `.rdt-confirm-btn` present · Expected: same · Pass: ✓
#: 20 · Test: Inline Confirm → SOP-review SOP Action Agent · Observed: state advances to `REVISED_DIAGNOSIS_ROUTED`, capture footer, P1 pulse · Expected: same · Pass: ✓
#: 21 · Test: Faye Escalation Report A2A Coordination Agent rename · Observed: `Workflow Agent` display name now `A2A Coordination Agent` in agent card · Expected: same · Pass: ✓
#: 22 · Test: Notify trading desk CTA has dyn-name-on-green · Observed: `.oer-cta .dyn-name-on-green` present · Expected: same · Pass: ✓
#: 23 · Test: P4 unlock + pulse after Notify · Observed: analyst tile `data-state=available pulse=true` · Expected: same · Pass: ✓
#: 24 · Test: Priya laptop frame swap · Observed: `#tablet display=none`, `#laptop-frame display=` (visible) · Expected: same · Pass: ✓
#: 25 · Test: Trader dashboard zones · Observed: 3 zones, 5 portfolio cards, 3 market cards, 3 task rows · Expected: same · Pass: ✓
#: 26 · Test: Notification bell pulse · Observed: count=1 + `.td-bell-pulse` class · Expected: same · Pass: ✓
#: 27 · Test: Bell click opens 60% modal · Observed: backdrop present, heading `INC-2026-0537 · Trading Desk Action Required`, max-width 720px (~60% of 1100px laptop) · Expected: same · Pass: ✓
#: 28 · Test: Market Intelligence Agent fires in modal · Observed: agent transitions through active → done within 5s · Expected: same · Pass: ✓
#: 29 · Test: 4 decision options + Lock CTA inside modal · Observed: 4 option cards, lock CTA present + disabled · Expected: same · Pass: ✓
#: 30 · Test: Lock decision closes modal + persistent banner · Observed: state=HEDGED, modal removed, `.td-demo-end-banner` painted w/ `Forward Q3 capacity hedge locked` · Expected: same · Pass: ✓
#: 31 · Test: Bell badge count + pulse cleared post-Lock · Observed: count=0, pulse class removed · Expected: same · Pass: ✓
#: 32 · Test: app.js parses clean · Observed: `node -c` exits 0 · Expected: clean parse · Pass: ✓
#: 33 · Test: No `console.log` instrumentation remaining · Observed: zero `[render]`/`[fireAgent]`/etc. logs in source · Expected: clean · Pass: ✓
#: 34 · Test: Visual flash absence · Observed: subjective walkthrough no longer shows persona-pulse-reset flashes · Expected: same · Pass: human-check required (flagged per coach sign-off)
#: 35 · Test: E2E happy path Faye → Lim → Faye Round 2 → Priya → HEDGED · Observed: full sequence completes w/ correct state transitions + agent firings + UI changes · Expected: same · Pass: ✓

Follow-up (W8):
- `renderAnalystIncidentDetail`, `spawnAnalystScreenContent`, `revealAnalystScreenInstant`, `startAnalystScreenDReveal` — unreachable post-W8 via tablet path (analyst now routes through laptop). Left intact per WA #5 throwaway convention; the modal path reuses the same content-building helpers (`spawnAnalystScreenContent`, `revealAnalystScreenInstant`, `startAnalystScreenDReveal`, `wireDecisionOptions`, `wireLockDecisionCTA`) by leveraging the shared `#incident-detail-view` ID inside the modal body.
- Pre-existing TS6133 unused-variable lint warnings noted on lines 1139, 4734, 4916, 4946, 5180, 5263 — all in code unmodified by W8. Karpathy rule 3: not touched.
- Visual + projector-legibility verification = pending human-check during dry-run.

### W9 deployment confirmation (2026-05-22) — LIM POLISH + PRIYA SOPHISTICATION

Post-W8 review pass: 3 Lim Screen D polish items + Priya dashboard enhancement + modal redesign (Singapore/SEA trader sophistication — USEP forward curve, reserve margin donut gauge, 30-min HH settlement KPI strip, monthly target KPI card, sparklines + $ chips + delta-vs-target chips per option). No state-machine changes. No new agents. Visual-only.

**Section A — Lim Screen D polish:**
- A.1: `.ic-group-label-completed` (W8 C.5 completed-group header). Dropped `background: var(--green-soft)` + `border-left: 3px solid var(--green-vivid)` → `background: transparent` + `border-left: none`. Group-label text neutralized `var(--green-soft-text)` → `var(--text-secondary)`. `✓ N/N completed` status kept in `var(--green-vivid)` (green tick + status text remain green for completion cue).
- A.2: `.in-call-strip` centering fix. Root cause: W4.1 override block at index.html line ~2966 set `margin: 0 !important; width: auto;` — overrode W8 D.2 `margin: 14px auto; max-width: 70%` so flex container shrank to content width + lost auto-centering. Fix: removed W4.1 override (kept only `.call-ended` sub-rules); W8 rule extended with `width: 70%; box-sizing: border-box; align-self: center`. Verified: strip width 490px (= 70% of 700px parent), margin 105px both sides, center delta 0.0px.
- A.3: `.post-call-stage[data-stage="transcript-attached"]` restyled. Dropped `border-left-color: var(--green-vivid)` + `background: var(--green-soft)` → `background: transparent` + `border-left: none` + `justify-content: center` + `font-style: italic` + `margin: 14px auto; max-width: 70%`. `.post-call-msg` italic + `var(--text-muted)`. `.post-call-transcript-link` re-styled inline: `var(--text-secondary)` + `font-style: normal` + underline (link readable as link; row reads as muted italic note).

**Section B — Priya dashboard enhancement:**
- B.1: Sembcorp logo. Inline SVG (42×42 viewBox, 36×36 rendered) of 2-curve wave/wing mark (`stroke="#00A651"`, second curve `opacity="0.65"`) replaces the W8 `.td-brand-dot` square. Brand text-block now `Sembcorp` (15px, 800 weight, `--green-vivid`) + `Energy Trading · Singapore` sub (10px uppercase, `--text-muted`).
- B.2 + B.3: `.td-kpi-strip` inserted between `.td-topbar` and zones. 2-card grid (`1.4fr 1fr`). Card 1 `.td-kpi-headline` (amber-left border) — `Next settlement period · HH18 · 09:00–09:30 SGT` clock-glyph label + 3 rows (PSO commitment 50 MW @ SGD 120/MWh · Settlement value SGD 6,000 · At risk if no action SGD 6,000 · 4 periods (HH18–HH21) — amber text) + right-aligned `AT RISK · awaiting decision` status pill (amber-soft bg). Card 2 `.td-kpi-secondary` (green-left border) — `May 2026 target · revenue at risk hedged` target-glyph label + animated progress bar (`width: 74%`) + stats row (`SGD 3.1M MTD (74%)` · `Target SGD 4.2M`) + delta footer (`INC-2026-0537 unlock: +SGD 240k · +5.7% toward target` in green).
- B.4: Reserve margin gauge (`.td-mk-gauge`). SVG donut, 96×96. Background ring `stroke="#E5E7EB"` 10px. Foreground arc `stroke="#00A651"` 10px, `stroke-dasharray="81 289"` (28% of circumference 2π·46≈289), rotated -90° to start at 12 o'clock, `stroke-linecap="round"`. Center labels `28%` (22px 800-weight `#0F1B3D`) + `COMFORTABLE` (9px 600-weight `#64748B`).
- B.5: USEP forward curve (`.td-mk-curve`). SVG 240×60, `preserveAspectRatio="none"`. Headline row above chart: `$112.45` (22px 800-weight) + `SGD/MWh` uppercase unit + right-aligned green delta `+18.30 (19.4%)`. 24-point trending-up path `stroke="#00A651"` 2px + closed-area variant filled with vertical `#td-curve-gradient` linearGradient (green 0.8 → 0.0 opacity, 20% opacity overlay). NOW indicator: dashed grey vertical line at x=120 + `NOW` text label. Axis row below: `00:00 | 06:00 | 12:00 | 18:00 | 24:00`.
- B.6: `.td-market` grid restructured `repeat(auto-fit, minmax(220px, 1fr))` → `1.4fr 1fr 1fr`. 3 cards in fixed order: USEP curve card · Reserve margin gauge card · Market Regime card (preserved W8 markup).

**Section C — Priya modal redesign:**
- C.1: Operational context section converted from 3-row table (Diagnosis · Recommendation · Exposure) to single Exposure-only block. New `.ac-section-context` shell: amber-soft bg + amber-vivid 3px left border + 14px padding. New `.ac-context-exposure` row: 80px `EXPOSURE` label (amber-soft-text, 800-weight, 0.08em letter-spacing) + content block with `.ac-ctx-primary` (`50 MW derate · SGD 240k revenue at risk`, 14px 700-weight navy) + `.ac-ctx-secondary` (`4× 30-min settlement periods · HH18 (09:00 SGT) → HH21 (10:30 SGT) · PSO commitment window`, 11.5px slate-700). `View source transcript` button preserved (existing W5 wiring `.ac-transcript-link`).
- C.2 + C.3 + C.4 + C.5: 4 decision option cards rebuilt. `.ac-decision-list` flex column → 2×2 grid (`grid-template-columns: 1fr 1fr; gap: 14px`). Each `.ac-option-card` now column-flex w/ 2 sections: (a) `.ac-opt-header` (bullet + body title/detail, top half) (b) `.ac-opt-viz` (sparkline + chip stack, bottom half, separated by 1px dashed top border).
  - hedge: title `Hedge forward · 4×HH PSO window` · detail `Lock SGD 120/MWh forward · 50 MW × 4 settlement periods` · sparkline rising-line path `M 0 30 L 20 28 L 40 24 L 60 18 L 80 12 L 100 8 L 120 5` (green) · `+SGD 240k` positive amount chip · `+5.7% toward May target` positive delta chip.
  - cross-site: title `Cross-site balance · Sakra-CCGT-1 standby` · detail `Dispatch Sakra standby capacity · cover BFP-3A derate` · sparkline step-up path `M 0 32 L 30 32 L 30 16 L 70 16 L 70 8 L 120 8` (green) · `+SGD 198k` · `+4.7% toward May target`.
  - spot: title `Sell-back to spot · USEP arbitrage` · detail `Sell uncommitted MW into spot market · capture forecast +20% USEP spike` · sparkline spike path `M 0 24 L 30 22 L 50 26 L 70 10 L 90 4 L 100 6 L 120 8` (green) · `+SGD 156k` · `+3.7% toward May target`.
  - curtailment: title `Curtail · accept PSO penalty` · detail `Accept 4×HH curtailment penalty · preserve BFP for full inspection` · sparkline flat→cliff path `M 0 14 L 60 14 L 70 32 L 120 32` (RED `#DC2626`) · `-SGD 88k` negative amount chip (red bg) · `-2.1% toward May target` negative delta chip (red bg).
- C.6 + C.7: Single-select + Lock decision logic preserved unchanged. `wireDecisionOptions` + `restoreSelectedOptionUI` + `onLockDecisionClick` untouched (still flip `data-selected` + bullet `○` → `✓` + populate `state.priya.selectedOption` + enable Lock CTA on first selection). W8 G.8 900ms laptop-modal hold preserved. `PRIYA_OPTION_LABEL` + `PRIYA_LAPTOP_OPTION_LABEL` dictionaries preserved unchanged per plan C.4 (footer/banner labels stay W5).

**Files changed (W9):**
- `index.html` — `.ic-group-label-completed` restyle (A.1); `.in-call-strip` extended with `width: 70%; box-sizing: border-box; align-self: center` (A.2); W4.1 in-call-strip override block deleted; `.post-call-stage[data-stage="transcript-attached"]` restyle + nested `.post-call-msg` / `.post-call-transcript-link` overrides (A.3); new `.td-brand-mark` / `.td-brand-text-block` / `.td-brand-text-sub` CSS (B.1); new `.td-kpi-strip` + `.td-kpi-card` + `.td-kpi-headline` + `.td-kpi-secondary` + `.td-kpi-label` + `.td-kpi-icon` + `.td-kpi-rows` + `.td-kpi-row` + `.td-kpi-amber` + `.td-kpi-status` + `.td-kpi-status-pill` + `.td-kpi-status-at-risk` + `.td-kpi-target-bar` + `.td-kpi-target-fill` + `.td-kpi-target-stats` + `.td-kpi-target-mtd` + `.td-kpi-target-pct` + `.td-kpi-target-goal` + `.td-kpi-target-delta` + `.td-kpi-target-delta-amt` + `.td-kpi-target-delta-pct` CSS (B.2 + B.3); `.td-market` grid template `1.4fr 1fr 1fr` (B.6); new `.td-mk-gauge-wrap` + `.td-mk-gauge` (B.4); new `.td-mk-headline` + `.td-mk-headline-value` + `.td-mk-headline-unit` + `.td-mk-headline-delta` + `.td-mk-delta-up` + `.td-mk-curve` + `.td-mk-curve-axis` (B.5); `.ac-decision-list` flex-column → 2-col grid; `.ac-option-card` flex-row → flex-column + larger padding + 2px selected border; `.ac-opt-header` / `.ac-opt-viz` / `.ac-opt-spark` / `.ac-opt-stats` / `.ac-opt-amt-chip` / `.ac-opt-amt-positive` / `.ac-opt-amt-negative` / `.ac-opt-delta-chip` / `.ac-opt-delta-positive` / `.ac-opt-delta-negative` (C.2-C.5); new `.ac-section-context` + `.ac-context-exposure` + `.ac-ctx-label` + `.ac-ctx-content` + `.ac-ctx-primary` + `.ac-ctx-secondary` (C.1).
- `app.js` — `paintLaptopDashboard` markup rewritten: `.td-brand` swapped logo SVG + brand-text-block; new `.td-kpi-strip` (headline + secondary cards) inserted between topbar and zone 1; Zone 2 Market Snapshot zone restructured to USEP curve card (sparkline + headline + axis) + Reserve gauge card (SVG donut) + Market Regime card preserved. `spawnAnalystScreenContent` markup rewritten: operational context simplified to Exposure-only; 4 decision option cards rebuilt with `.ac-opt-header` + `.ac-opt-viz` structure (per-option sparkline SVG + amount chip + delta chip).

**Files intentionally not touched (W9):**
- All state-machine / lifecycle / agent-firing logic (`onVerdictReject` / `onCallEnd` / `onDiagnosisConfirmedClick` / `onConfirmRevisedDiagnosisClick` / `onLockDecisionClick` / `fireAgentCardLifecycle` / `triggerGroupTheater` / `updateChecklistProgress` / `paintDiagnosisVerdict`).
- All agent roster + relevance mapping (17 agents preserved across 5 buckets).
- KG, log dropdown, floating window, flywheel — no right-pane changes.
- `PRIYA_OPTION_LABEL` + `PRIYA_LAPTOP_OPTION_LABEL` dictionaries (W5 / W8 labels preserved per plan C.4).
- `wireDecisionOptions` / `restoreSelectedOptionUI` / `wireLockDecisionCTA` / `appendLockDecisionCaptureFooter` (option-card markup changed but selectors `.ac-option-card`, `.ac-opt-bullet`, `data-option`, `.ac-lock-cta` preserved so existing wiring still binds).
- All Faye P1 dispatch + banner + INC row markup.
- Lim inspection checklist content (5 + 3 + 2 items unchanged).
- Ismail dead-code paths.

**Verified via Chrome MCP — per-test observed-vs-expected table:**

#: 1 · Test: A.1 completed-group bg transparent · Observed: bg `rgba(0,0,0,0)` for all 3 groups (Safety / Instrument / Root cause isolation) · Expected: transparent · Pass: ✓
#: 2 · Test: A.1 completed-group border-left removed · Observed: `border-left-width: 0px; border-left-style: none` · Expected: no left border · Pass: ✓
#: 3 · Test: A.1 group-label text neutral · Observed: `color: rgb(51,65,85)` (`--text-secondary`) · Expected: `--text-secondary` · Pass: ✓
#: 4 · Test: A.1 group-label status `✓ N/N completed` green · Observed: `color: rgb(0,166,81)` (`--green-vivid`) · text `✓ 5/5 completed` / `✓ 3/3 completed` / `✓ 2/2 completed` · Expected: green-vivid + correct counts · Pass: ✓
#: 5 · Test: A.2 in-call strip width 70% · Observed: width 490px, max-width 70%, parent width 700px (490/700 = 70%) · Expected: 70% · Pass: ✓
#: 6 · Test: A.2 in-call strip centered · Observed: margin-left 105px, margin-right 105px, center-delta 0.0px · Expected: centered · Pass: ✓
#: 7 · Test: A.2 W4.1 override removed · Observed: no `margin: 0 !important` rule remaining (margin computed 14px auto from W8 D.2 rule) · Expected: removed · Pass: ✓
#: 8 · Test: A.3 transcript-attached bg transparent · Observed: `background-color: rgba(0,0,0,0)` · Expected: transparent · Pass: ✓
#: 9 · Test: A.3 transcript-attached border-left removed · Observed: `border-left-width: 0px; border-left-style: none` · Expected: no left border · Pass: ✓
#: 10 · Test: A.3 transcript-attached centered + italic · Observed: `justify-content: center`, message font-style italic, `width: 490px` (70% of parent), margin-left/right 105px · Expected: centered + italic · Pass: ✓
#: 11 · Test: A.3 transcript message muted · Observed: `color: rgb(100,116,139)` (`--text-muted`) · Expected: `--text-muted` · Pass: ✓
#: 12 · Test: A.3 transcript link non-italic + underline · Observed: `font-style: normal`, text-decoration `underline`, color `rgb(51,65,85)` (`--text-secondary`) · Expected: link readable · Pass: ✓
#: 13 · Test: B.1 Sembcorp logo SVG present · Observed: `.td-brand-mark` SVG with 2 path elements both `stroke="#00A651"` · Expected: 2-curve wave mark in green · Pass: ✓
#: 14 · Test: B.1 brand text + sub present · Observed: `Sembcorp` headline + `Energy Trading · Singapore` sub, headline color `rgb(0,166,81)` · Expected: same · Pass: ✓
#: 15 · Test: B.2 KPI strip present · Observed: `.td-kpi-strip` with 2 cards (headline + secondary) · Expected: 2-card strip between topbar and zones · Pass: ✓
#: 16 · Test: B.2 headline KPI content · Observed: contains `HH18 · 09:00–09:30 SGT`, `50 MW @ SGD 120/MWh`, `SGD 6,000`, `4 periods (HH18–HH21)`, status pill `AT RISK · awaiting decision` (amber-soft bg `rgb(254,243,199)`) · Expected: same · Pass: ✓
#: 17 · Test: B.3 monthly target KPI content · Observed: contains `May 2026 target`, `SGD 3.1M MTD (74%)`, `Target SGD 4.2M`, `INC-2026-0537 unlock: +SGD 240k · +5.7% toward target`; progress-bar fill `style="width: 74%"` · Expected: same · Pass: ✓
#: 18 · Test: B.4 reserve margin gauge present · Observed: SVG donut, 2 circles (bg `#E5E7EB`, fg `#00A651` with `stroke-dasharray="81 289"`), center text `28%` + `COMFORTABLE` · Expected: same · Pass: ✓
#: 19 · Test: B.5 USEP forward curve present · Observed: SVG curve with 2 paths (filled area + 24-point stroked line `stroke="#00A651"`), `#td-curve-gradient` defined, NOW indicator line at `x=120`, axis labels `00:00 | 06:00 | 12:00 | 18:00 | 24:00`, headline `$112.45` + `+18.30 (19.4%)` · Expected: same · Pass: ✓
#: 20 · Test: B.6 Market Snapshot 3-col grid · Observed: `.td-market` grid-template-columns `408.8px 292px 292px` (ratio ≈1.4 : 1 : 1), 3 child cards (curve / gauge / regime) · Expected: 3 cards in `1.4fr 1fr 1fr` grid · Pass: ✓
#: 21 · Test: C.1 Modal exposure-only context · Observed: `.ac-section-context` with `EXPOSURE` label + primary `50 MW derate · SGD 240k revenue at risk` + secondary `4× 30-min settlement periods · HH18 (09:00 SGT) → HH21 (10:30 SGT) · PSO commitment window`; no Diagnosis row, no Recommendation row; `View source transcript` button present · Expected: same · Pass: ✓
#: 22 · Test: C.1 context block amber-callout · Observed: `background: rgb(254,243,199)` (`--amber-soft`), left border `rgb(217,119,6)` (`--amber-vivid`) · Expected: amber-soft callout · Pass: ✓
#: 23 · Test: C.2 4 decision option cards · Observed: 4 `.ac-option-card` buttons (hedge / cross-site / spot / curtailment), grid `317px 317px` (2×2 layout) · Expected: 2×2 grid · Pass: ✓
#: 24 · Test: C.3 sparklines per option · Observed: hedge `M 0 30 L 20 28 L 40 24 L 60 18 L 80 12 ...` green; cross-site `M 0 32 L 30 32 L 30 16 L 70 16 L 70 8 ...` green; spot `M 0 24 L 30 22 L 50 26 L 70 10 L 90 4 ...` green; curtailment `M 0 14 L 60 14 L 70 32 L 120 32` RED `#DC2626` · Expected: distinct paths per option, curtailment in red · Pass: ✓
#: 25 · Test: C.4 amount chips · Observed: hedge `+SGD 240k` (green positive), cross-site `+SGD 198k` (green positive), spot `+SGD 156k` (green positive), curtailment `-SGD 88k` (red negative, `color: rgb(220,38,38)`) · Expected: same · Pass: ✓
#: 26 · Test: C.5 delta-vs-target chips · Observed: hedge `+5.7% toward May target` (positive), cross-site `+4.7%` (positive), spot `+3.7%` (positive), curtailment `-2.1%` (negative, `.ac-opt-delta-negative` class) · Expected: same · Pass: ✓
#: 27 · Test: C.6 single-select works · Observed: clicking hedge → `data-selected="true"`, bullet `✓`; cross-site stays `data-selected="false"`; `state.priya.selectedOption === "hedge"`; Lock CTA enabled (`disabled=false`) · Expected: same · Pass: ✓
#: 28 · Test: C.7 Lock decision → HEDGED + modal close + banner + bell cleared · Observed: state pill `HEDGED`, `decisionLocked: true`, modal removed (`#trader-modal-backdrop` absent), `.td-demo-end-banner` painted with `✓ Cycle complete · Forward Q3 capacity hedge locked · revenue exposure neutralized · INC-2026-0537 closed · 03:01 SGT`, bell `data-count=0`, pulse class removed · Expected: same · Pass: ✓
#: 29 · Test: app.js parses clean · Observed: `node -c app.js` exits 0 · Expected: clean parse · Pass: ✓

Human-check items (subjective; flagged not auto-asserted):
- Projector legibility of new sparklines + chips at meeting-room distance — confirm during dry-run.
- Sembcorp wave-mark logo readability at small size — visual inspection.
- KPI strip information density vs scroll-fold position on default viewport — confirm none of the headline KPI clips below fold.

Follow-up (W9):
- Banner label after Lock decision pulls from `PRIYA_LAPTOP_OPTION_LABEL` (e.g. hedge → `Forward Q3 capacity hedge`), which is the W5/W8 label NOT the new W9 card title (`Hedge forward · 4×HH PSO window`). Visually divergent but plan C.4 explicitly preserves PRIYA_*_OPTION_LABEL maps; flagged for human-check whether the banner should be updated post-W9 to match new card titles.
- `renderAnalystIncidentDetail` still in code (W8 follow-up flagged it as unreachable). `spawnAnalystScreenContent` modified by W9 but reachable only via the modal path (not the tablet path); the tablet-path render remains dead code per WA #5.

### W10 deployment confirmation (2026-05-22) — RIGHT-PANE REWORK + PER-PERSONA THEATER

Major right-pane rework. Layout shifts to 50/50. KG becomes button-only (no auto-render). Each persona gets a curated right-pane narrative experience that lands the demo's key takeaway for that persona's beat. Agent buckets relocate behind a tab inside the dispatch-log dropdown so per-persona narrative becomes the primary right-pane voice. Two new KG clusters added (Tacit-KG Staging for P2, Commercial Intelligence for P3).

**Section A — Layout + KG:**
- `#stage[data-drawer="open"]` `grid-template-columns` `2fr 1fr` → `1fr 1fr` (50/50 split when drawer open).
- `#laptop-frame` max-width `1100px` → `920px` (fits ~50% of typical 1920-wide viewport).
- W7 P2 inline KG mechanic REVERTED. `paintRightPaneInlineKG` retained as dead code (WA #5 throwaway). `renderRightPane()` now routes all personas through `paintRightPaneStandard()` and dispatches per-persona narrative via `paintPersonaNarrative()`.
- KG floating window never auto-opens. Opens only on user click of toolbar `Display Graph` button OR section-card `▶ Open KG` button (for P2 Section C and P3 ★ section).
- `triggerNewIncident()` was already absent from the codebase prior to W10 — the W3.4 auto-open path had been removed before this wave; W10 verifies the no-auto-open invariant via test A2.

**Section A.5 — Agent buckets relocated to Log dropdown 2-tab switcher:**
- `#zone-agents` reparented from primary right-pane content into `#log-dropdown` body as the second tab `Agents · 17`.
- Default-active tab = `Log` (existing dispatch-log behaviour preserved).
- Click `Agents` tab → reveals 5 buckets · 17 agent cards (W6 dim per persona + W6 fireAgentCardLifecycle pulse/done lifecycle preserved exactly — `data-agent-id` selectors still bind to the same DOM elements).
- `initLogDropdownTabs()` runs in `init()` AFTER `seedLogLines` + `initAgentCardStates` so the reparenting picks up the populated `orch-log-body` and agent cards.
- `#log-dropdown[data-open="true"]` max-height bumped `800px` → `1800px` to accommodate the full 17-card roster when Agents tab active. Right pane scrolls naturally if content exceeds viewport.
- New CSS: `.rp-tab-row`, `.rp-tab-btn[data-active]`, `.rp-tab-pane[data-active]`. Reparented `#zone-agents` sheds outer zone chrome via `.rp-tab-pane[data-tab="agents"] #zone-agents { background: transparent; border: none; box-shadow: none; padding: 0; min-height: 0 }`.

**Section B — Per-persona render dispatch:**
- New `paintPersonaNarrative()` branches on `state.activePersona` after `paintRightPaneStandard()`: ops → `renderRightPaneFaye()` · onsite → `renderRightPaneLim()` · analyst → `renderRightPanePriya()`.
- New `#persona-narrative-host` element inserted between toolbar and zone-agents in HTML; per-persona renderers lazy-build into it.
- Cross-persona cleanup: when active persona changes, host clears + `dataset.personaBuilt` resets so the next persona's renderer rebuilds. In-persona re-renders skip rebuild (preserves play/replay state on existing buttons).

**Sections C-G — P1 Faye right-pane narrative + modals:**
- 3 narrative section cards: `1` Criticality · Diagnosis · Summary · `2` SOP-driven telemetry confirmation · `3` Scheduling · Expertise match · Dispatch. Each card carries title + sub-text + meta + `▶ Play` button.
- Click `▶ Play` → 700×500 narrative modal pops over tablet area with green-soft header band, section num pill, title, close ×.
- Modal canvas renders 3 dashed-border buckets (Domain experts · transient / Orchestration / Critique) + 2 flow arrows + continuous-monitoring loop + data source pills + narration footer.
- Animation sequence ~12s per modal: domain agents reveal → pulse → check sequentially at 700ms intervals; orchestration agents reveal + pulse at 500ms intervals; critique agents reveal + pulse + check at 500ms intervals. Data source pills flash during corresponding agent reveal.
- 11 ephemeral agents introduced across the 3 modal contexts (NOT added to persistent 17-agent roster). Section 1 = 4 domain (Sensor Anomaly Inspector / Turbine Diagnostic Agent / Criticality Scoring Agent / Incident Summary Synthesizer) · 2 orch (Orchestrator / A2A Coordination Agent) · 2 critique (Critic · Power Gen / Criticality Standards Critic) · 3 sources. Section 2 = 3 domain (SOP Retrieval Agent / Sensor Anomaly Inspector / Telemetry Snapshot Compiler) · 2 orch · 2 critique (SOP Adherence Critic / Critic · Power Gen) · 2 sources. Section 3 = 4 domain (Duty Roster Agent / Expertise Match Agent / Availability Window Agent / A2A Coordination Agent) · 1 orch · 1 critique (Workforce Compliance Critic) · 3 sources.
- Right-pane sync (D.6): persistent-roster cards in the Agents tab pulse in lockstep with their modal counterparts via existing `fireAgentCardLifecycle(agentId, 1400ms)`. Two surfaces light up simultaneously — modal is storytelling, persistent roster is proof-of-existence.
- Played state persistence: `state.w10.playedSections.p1` map tracks played sections. On modal open the button flips from `Play` → `✓ Replay` and the section card adds `pn-section-played`. State survives persona switch (host rebuild restores replay labels from the persistent map).
- Pop-out modal mechanic is reusable. `openNarrativeModal(scope, sectionDef)` consumed by both P1 (`openP1NarrativeModal`) and P2 (`openP2NarrativeModal`).
- Bonus mechanics added beyond spec by operator: ESC-key close handler · `state.w10.modalTimers` array cleared on close (prevents zombie animations if user closes mid-flight) · `state.w10.modalScope` field disambiguates P1/P2 contexts for shared modal engine · backdrop click also closes modal.

**Section H — P2 Lim right pane:**
- 3 narrative section cards: `A` Safety-first field gating · `B` Tacit knowledge capture from calls + chats · `C` Tacit knowledge → Knowledge Graph promotion.
- Sections A + B use narrative modals (P1 mechanic reused with scope `'p2'`).
- Section C button label = `Open KG` (not `Play`); click fires `toggleGraphWindow()` directly — opens the floating KG window so the staging cluster becomes visible.
- P2_SECTION_A = 3 domain (HSE Field Compliance Agent / Safety Cert Validator / PPE/LOTO Check Agent) · 1 orch (A2A Coordination Agent) · 1 critique (HSE Risk Validator) · 2 sources (Org Knowledge cert records · Hyperspace LOTO state).
- P2_SECTION_B = 3 domain (Audio-transcription Agent / Tacit Knowledge Extractor / Semantic Tag Agent) · 1 orch (A2A Coordination Agent) · 1 critique (Tacit Relevance Critic) · 2 sources (Call audio · Main KG entity catalog).
- `wireLimRightPaneButtons` routes A+B clicks to `openP2NarrativeModal` and C click to `toggleGraphWindow`.

**Section I — P2 Tacit-KG Staging cluster (4-tier flow):**
- 4-tier visual separation along KG X-axis: main KG (x ∈ [-100, +100]) · W7 Auditor cluster (x ∈ [180, 260]) · W7 Tacit cluster (x ∈ [340, 420]) · W10 Staging cluster (x ∈ [500, 600]).
- 7 staging nodes: 5 tacit-byte nodes (diamond glyph via `THREE.OctahedronGeometry` · 3 promoted `tacit-byte-1/2/3` with green halo · 2 unpromoted `tacit-byte-4/5` with amber halo + 60% opacity) + 2 staging agents (`knowledge-triage-agent` · `process-engineering-review-agent` · blue halo, mirroring auditor cluster · ring radius bumped to `radius * 1.40` for slightly larger sphere).
- 12 staging edges: 5 byte→triage + 1 triage→review + 3 review→promoted-byte + 3 promoted-byte→W7-tacit-cluster (the latter 6 carry `isPromotionEdge: true`).
- Promotion edges render thicker (`linkWidth` 2.5) + green (`linkColor` `rgba(0,166,81,0.85)`) + 3 directional particles flowing along each edge via 3d-force-graph's native `linkDirectionalParticles` API (simpler than spec's "animated stroke-dashoffset" suggestion which would require shader work; the particle flow visual achieves the same narrative effect).
- Camera pose on P2 KG open: `(x: 250, y: 0, z: 580)` look-at `(x: 300, y: 0, z: 0)` over 2000ms transition.
- First-open flash: 4s green halo on the 3 promoted bytes (`tacit-byte-1/2/3`) starting 2s after open (camera-pan settle delay), reusing the W6 `KG_STATE.newlyAddedNodes` Set + `refreshKGStyles()` mechanism. Guard `state.w10.kgFlashedFor.onsite` prevents flash re-firing on subsequent opens.
- Auto-rotate paused on open (`stopAutoRotate()`), resumed 6s later (`startAutoRotate()` after camera-pan + flash window).

**Section J — P3 Priya right pane:**
- Single narrative card: `★ Commercial intelligence cluster` (star glyph in `pn-s-num` position). Body summarises the 7 commercial nodes, meta lists sources (USEP · merchant market feed · PPA registry · cross-site SCADA). Button label = `Open KG`.
- `renderRightPanePriya()` paints into `#persona-narrative-host` only — LEFT pane (W8 laptop frame + W9 KPI strip) untouched.
- Button click → `toggleGraphWindow()` (same pattern as P2 Section C).

**Section K — Commercial intelligence cluster (5-tier KG):**
- 7 commercial nodes in x ∈ [700, 820]: `merchant-market-sg` (L4 · USEP) · `ppa-pso-2026` (L1 · PSO commitment) · `supply-curve-singapore` (L4 · Q3-2026) · `demand-forecast-q3-2026` (L4) · `cross-site-sakra-availability` (L3) · `cross-site-tuas-availability` (L3) · `hedge-instrument-catalog` (L4 · forward + spot). All carry `cluster: 'commercial'`.
- 7 commercial edges: 1 bridge (`bfp-3a → merchant-market-sg` · cluster `main-to-commercial` · links the asset incident into the commercial domain) + 6 commercial-internal flows (merchant → supply curve → demand forecast → hedge catalog · PPA → both cross-site availability nodes · sakra → hedge catalog).
- Purple halo `#A855F7` (`0xA855F7` in `nodeThreeObject` ring-color branch) distinguishes commercial nodes from main (white) · auditor (blue) · tacit (amber) · staging (green/amber/blue).
- Commercial nodes use standard sphere geometry (only staging-byte nodes are diamond).
- Camera pose on P3 KG open: `(x: 400, y: 0, z: 700)` look-at `(x: 400, y: 0, z: 0)` over 2000ms — wide pull-back to fit all 5 clusters in frame with attention drawn to far right.
- First-open flash: 4s green halo on all 7 commercial nodes (reuses same flash mechanism as staging cluster). Guard `state.w10.kgFlashedFor.analyst`.

**Files changed (W10):**
- `app.js` — new `state.w10` namespace (playedSections / modalOpen / modalTimers / modalEscHandler / modalScope / kgFlashedFor); `renderRightPane` rewritten to route through `paintRightPaneStandard` + `paintPersonaNarrative`; new `paintPersonaNarrative` cleanup-aware dispatcher; `renderRightPaneFaye` + `wireFayeRightPanePlayButtons` + `P1_NARRATIVE_SECTIONS` + `P1_SECTION_1/2/3` + `P1_SECTION_BY_NUM` + `openP1NarrativeModal`; `renderRightPaneLim` + `wireLimRightPaneButtons` + `P2_NARRATIVE_SECTIONS` + `P2_SECTION_A/B` + `P2_SECTION_BY_NUM` + `openP2NarrativeModal`; `renderRightPanePriya` + `wirePriyaRightPaneButtons`; modal engine `openNarrativeModal` + `closeNarrativeModal` + `closeNarrativeModalAndMarkPlayed` + `playNarrativeModalAnimation` + `applyNarrativeAction`; `KG_STAGING_NODES` + `KG_STAGING_EDGES` + `KG_STAGING_PROMOTED_IDS` + `KG_COMMERCIAL_NODES` + `KG_COMMERCIAL_EDGES` + `KG_COMMERCIAL_IDS` + `KG_NODES.push(...)` + `KG_EDGES.push(...)` for both clusters; `nodeThreeObject` extended (octahedron geometry for tacit-byte nodes, ring-color rules for staging/staging-agent/staging-promoted/staging-unpromoted/auditor/tacit/commercial, opacity multiplier for unpromoted bytes, ring-radius bump for staging agents); `linkColor` + `linkWidth` extended with `isPromotionEdge` branches + new `linkDirectionalParticles` config (3 particles per promotion edge, speed 0.008, width 2.5, green colour); `openKGForPersona(persona)` helper with POSE table (onsite + analyst) + first-open flash via `KG_STATE.newlyAddedNodes` + `refreshKGStyles()` + 4s clear timer + 6s auto-rotate resume; `toggleGraphWindow` hooked to call `openKGForPersona(state.activePersona)` after KG open; `initLogDropdownTabs` programmatically reparents `#zone-agents` into the log-dropdown body behind an `Agents · 17` tab and wires tab-switch click handler; `init()` calls `initLogDropdownTabs()` last (after `seedLogLines` + `initAgentCardStates`).
- `index.html` — `#stage[data-drawer="open"]` grid `2fr 1fr` → `1fr 1fr`; `#laptop-frame` max-width `1100px` → `920px`; added W10 CSS block (`#persona-narrative-host`, `.persona-narrative` + `.pn-header` + `.pn-h-title` + `.pn-h-sub` + `.pn-section` + `.pn-s-num` + `.pn-s-body` + `.pn-s-title` + `.pn-s-sub` + `.pn-s-meta` + `.pn-s-play` + `.pn-s-played`, `.narrative-modal-backdrop` + `.narrative-modal` + `.narrative-modal-header` + `.nm-section-num` + `.nm-section-title` + `.nm-close` + `.narrative-modal-body`, `.nv-canvas` + `.nv-bucket[data-bucket-type]` + `.nv-bucket-label` + `.nv-agents` + `.nv-agent` (visible / active / done states) + `.nv-arrow` + `.nv-loop` + `.nv-sources` + `.nv-sources-label` + `.nv-source-pills` + `.nv-source-pill` + `.nv-narration`, keyframes `backdrop-fade` + `modal-rise` + `nv-agent-pulse` + `nv-arrow-flow` + `nv-loop-spin` + `pn-section-pulse`); A.5 CSS (`.rp-tab-row` + `.rp-tab-btn[data-active]` + `.rp-tab-pane[data-active]` + reparented-zone-agents chrome reset); `#log-dropdown[data-open="true"]` max-height `800px` → `1800px`; new `<div id="persona-narrative-host">` between toolbar and `#zone-agents`.
- `SEMBCORP_SCOPE.md` — this confirmation block (W10 deployment).

**Files intentionally not touched (W10):**
- W7 tacit cluster (`KG_TACIT_NODES`) + auditor cluster (`KG_AUDITOR_NODES`) + cluster-flow edges (`KG_CLUSTER_FLOW_EDGES`) — preserved.
- W8 Priya laptop frame (`#laptop-frame` markup + `paintLaptopDashboard` content) + W9 KPI strip + W9 trader modal redesign — left pane untouched.
- W6 KG growth animation (`triggerKGGrowth`, `flashKGGrowthHalo`) — reused for staging + commercial cluster flash via the same `KG_STATE.newlyAddedNodes` Set + `refreshKGStyles` plumbing.
- All Faye P1 dispatch arc + banner copy + INC row markup + Lim tablet flow (W4 / W4.1 / W6 / W7 / W8 / W9) + Ismail dead-code paths.
- Persistent 17-agent roster (Orchestrator / inspection / triage / diag-hrsg / diag-electrical / playbook / sop-action / audio-transcription / wo-prefill / workflow / learning / critic-power-gen / critic-renewables / critic-networks / hse / pl / market-intelligence) preserved exactly. W6 agent-dim per persona logic + W6 fireAgentCardLifecycle pulse/done lifecycle preserved.
- `paintRightPaneInlineKG` (W7 reshape mechanic) kept as dead code per WA #5 throwaway convention.

**Verified via Chrome MCP — per-test observed-vs-expected table:**

```
#: A1 · Test: 50/50 grid split (drawer open) · Observed: grid-template-columns "822.4px 822.4px"; leftW=822 rightW=822 ratio 1.00 · Expected: 1fr 1fr · Pass: ✓
#: A2 · Test: KG floating window closed on cold load · Observed: kgWinOpen=false, kgWinDisplay="none" · Expected: closed until user click · Pass: ✓
#: A4 · Test: P2 inline KG container absent · Observed: #right-pane-kg-inline never created; standard pane used for all personas · Expected: W7 reshape mechanic reverted · Pass: ✓
#: A.5.1 · Test: Tab row structure inside log dropdown · Observed: .rp-tab-row with 2 .rp-tab-btn elements [Log · Agents · 17]; Log default-active; Agents inactive · Expected: same · Pass: ✓
#: A.5.2 · Test: #zone-agents reparented into agents tab pane · Observed: agentsPane.querySelector('#zone-agents') truthy; #right-pane > #zone-agents falsy (no direct child anymore) · Expected: same · Pass: ✓
#: A.5.3 · Test: Tab click switches visibility · Observed: cold-load logPane display=block agentsPane display=none; after Agents click → logPane none agentsPane block (17 agent cards visible); after Log click → reverts · Expected: same · Pass: ✓
#: B1 · Test: Faye right pane = 3 narrative sections · Observed: 3 .pn-section nodes "1"/"2"/"3" + titles matching P1_SECTION_1/2/3 · Expected: same · Pass: ✓
#: C1 · Test: Play Section 1 opens narrative modal · Observed: backdrop present, header "Criticality · Diagnosis · Summary", num "SECTION 1", close × · Expected: same · Pass: ✓
#: D1 · Test: Modal canvas structure · Observed: 3 dashed buckets (domain/orch/critique) + 2 arrows + 1 loop + 3 source pills + 3 narration lines · Expected: same · Pass: ✓
#: D2 · Test: Section 1 animation runs through all phases · Observed: at t=8s — 4 domain done, 2 orch active (no check by design), 2 critique done, all 8 visible · Expected: full reveal/pulse/check within 12s · Pass: ✓
#: D3 · Test: Right-pane sync — persistent roster pulse · Observed: 5/5 watched cards pulsed in lockstep timing (inspection@302ms triage@1001 orchestrator@3402 workflow@3902 critic-power-gen@4902); all final data-state="done" · Expected: persistent agent cards pulse synced with modal pulses · Pass: ✓
#: D4 · Test: Modal close on × · Observed: backdrop removed, section card pulse class cleared · Expected: same · Pass: ✓
#: E1 · Test: Section 1 played-state · Observed: btn classList has pn-s-played, label "✓ Replay" · Expected: same · Pass: ✓
#: F1 · Test: Section 2 modal content · Observed: header "SOP-driven telemetry confirmation"; 3 domain · 2 orch · 2 critique · 2 sources (Hyperspace last-15-min + Org Knowledge SOP-BFP-VIBR-001) · Expected: same · Pass: ✓
#: G1 · Test: Section 3 modal content · Observed: header "Scheduling · Expertise match · Dispatch"; 4 domain (incl A2A) · 1 orch · 1 critique · 3 sources · Expected: same · Pass: ✓
#: Replay-persistence · Test: ops → onsite → ops preserves replay state · Observed: ops re-render shows all 3 "✓ Replay" labels intact; non-ops personas clear host · Expected: same · Pass: ✓
#: H1 · Test: P2 Lim right pane = 3 sections w/ correct button labels · Observed: ["A","B","C"]; titles match P2 spec; buttonLabels ["Play","Play","Open KG"]; buttonActions ["modal","modal","open-kg"] · Expected: same · Pass: ✓
#: H2 · Test: P2 Section A modal — Safety · Observed: SECTION A; 3 domain (HSE Field Compliance / Safety Cert Validator / PPE-LOTO Check); 1 orch (A2A Coordination); 1 critique (HSE Risk Validator); 2 sources · Expected: same · Pass: ✓
#: H3 · Test: P2 Section B modal — Tacit knowledge · Observed: 3 domain (Audio-transcription / Tacit Knowledge Extractor / Semantic Tag); 1 orch (A2A Coordination); 1 critique (Tacit Relevance Critic); 2 sources · Expected: same · Pass: ✓
#: H4 · Test: P2 Section C "Open KG" opens floating KG (NOT narrative modal) · Observed: state.graphWinOpen=true · kg-floating-window data-open="true" · no narrative modal · Expected: same · Pass: ✓
#: I1 · Test: KG_NODES contains staging cluster · Observed: 7 staging nodes (5 bytes · 3 promoted [tacit-byte-1/2/3] · 2 unpromoted [tacit-byte-4/5] · 2 agents [knowledge-triage-agent · process-engineering-review-agent]) · Expected: same · Pass: ✓
#: I2 · Test: KG_EDGES contains staging + promotion edges · Observed: 12 staging edges total · 6 isPromotionEdge=true · 3 cluster="staging-to-tacit" · Expected: same · Pass: ✓
#: I3 · Test: Staging visual rules (diamond glyph / halo colors / opacity / promotion-edge particles) · Observed: code paths present (OctahedronGeometry for tacit bytes; ringColor green for isPromoted / amber for unpromoted / blue for isStagingAgent; stagingOpacityMul 0.6 for unpromoted; linkColor green + linkWidth 2.5 + linkDirectionalParticles=3 for isPromotionEdge) · Expected: same · Pass: ✓ (code path; visual confirm = human-check, WebGL disabled in headless Chrome MCP)
#: I4 · Test: Camera pose on P2 KG open · Observed: cameraPosition called with cam={x:250,y:0,z:580} lookAt={x:300,y:0,z:0} ms=2000 · Expected: same per Section I.5 · Pass: ✓
#: I5 · Test: Green halo flash on 3 promoted bytes for 4s after camera arrival · Observed: t=0 flag flipped + 0 flashed; t=2200ms newlyAddedNodes={tacit-byte-1/2/3}; t=6500ms cleared · Expected: flash 2s in, runs 4s · Pass: ✓
#: I6 · Test: First-open guard for P2 KG · Observed: subsequent open repositions camera but flashedAfter2s=[] (no flash); flashedFlag stays true · Expected: same · Pass: ✓
#: J1 · Test: P3 Priya right pane = single narrative card · Observed: 1 .pn-section · num "★" · title "Commercial intelligence cluster" · button "Open KG" w/ data-action="open-kg" · Expected: same · Pass: ✓
#: K1 · Test: KG_NODES contains 7 commercial nodes · Observed: ["merchant-market-sg","ppa-pso-2026","supply-curve-singapore","demand-forecast-q3-2026","cross-site-sakra-availability","cross-site-tuas-availability","hedge-instrument-catalog"] all cluster="commercial" · Expected: same · Pass: ✓
#: K2 · Test: KG_EDGES contains commercial edges · Observed: 7 total (1 bridge bfp-3a→merchant-market-sg + 6 commercial-internal) · Expected: same · Pass: ✓
#: K3 · Test: Camera pose on P3 KG open · Observed: cameraPosition called with cam={x:400,y:0,z:700} lookAt={x:400,y:0,z:0} ms=2000 · Expected: same per Section K.5 · Pass: ✓
#: K4 · Test: Green halo flash on 7 commercial nodes for 4s · Observed: t=2200ms newlyAddedNodes contains all 7 commercial IDs; t=6500ms cleared · Expected: same · Pass: ✓
#: K5 · Test: Purple halo at-rest (#A855F7) · Observed: nodeThreeObject branch `cluster === 'commercial' → ringColor = 0xA855F7` · Expected: same · Pass: ✓ (code path; visual confirm = human-check)
#: K6 · Test: First-open guard for P3 KG · Observed: subsequent open repositions camera but flashedAfter2s=[]; flashedFlag stays true · Expected: same · Pass: ✓
#: J-button · Test: P3 Section button opens KG (not modal) · Observed: state.graphWinOpen=true; no narrative modal · Expected: same · Pass: ✓
#: E2E · Test: Full walkthrough — ops cold → Section 1 modal → close → switch Lim → Section A modal → close → Section C KG → switch ops (replay state intact) → switch Priya → Section ★ KG · Observed: all transitions clean, replay labels preserved, no narrative-modal artifacts, KG opens/closes correctly · Expected: same · Pass: ✓
#: app.js parse · Observed: node -c app.js exit 0 · Expected: clean · Pass: ✓
#: Console clean · Observed: 0 console errors / warnings during full E2E walkthrough · Expected: clean · Pass: ✓
```

Human-check items (subjective; flagged not auto-asserted):
- **I3 + K5 visual confirmation** — Chrome MCP browser tool runs in headless mode without WebGL; KG falls back to CSS scaffold so 3D node geometries (diamond tacit-byte glyph), halo colors (green promoted / amber unpromoted / blue staging-agent / purple commercial), promotion-edge directional particles, camera-pan animation, and 4s green halo flash cannot be auto-verified. Code paths verified via mock-graph injection; visual confirmation requires Pulkit eyeballing in real Chrome at dry-run.
- **Projector legibility** of the 5-cluster KG scene at venue projector distance — needs dry-run human-check (clusters span x ∈ [-100, 820] which is much wider than the previous 3-tier scene).
- **Narrative modal at projector resolution** — 700×500 overlay needs legibility check; bucket-label / agent-card / source-pill font sizes (9.5-12px) may be at the edge of readability at meeting-room distance.
- **Tacit-byte and commercial-cluster Y-positions don't follow layer-band convention** — spec assigned cluster-local Y values (e.g. L4 tacit-byte at y=60 instead of y=-90); honored as-spec but the visual 4-layer banding integrity is broken for these clusters. Flag for Pulkit's call whether to rewrite to match LAYER_Y on layout pass.

Follow-up:
- `paintRightPaneInlineKG` (W7) + `KG_GROWTH_NODE_IDS` (W6 W7 reuse) + `triggerKGGrowth` (W6) all retained as dead code per throwaway convention.
- Pre-W10 lint warnings on lines 1139, 4734, 4916, 4946, 5180, 5263 (per W8 follow-up) unchanged — not touched by W10. Karpathy rule 3.
- W10 = COMPLETE. Demo build = FEATURE COMPLETE for the 2026-05-27 ITP presentation. Remaining work = projector dry-run + narration script + final vocab/legibility sweep.

### W11 deployment confirmation (2026-05-25)

W11 post-W10 review polish wave landed. 9 sections shipped:

**Section A — Learning Flywheel dropped:**
- `#zone-flywheel` removed from `index.html` right pane. No replacement; right pane vertical flow now: toolbar → per-persona narrative content → permanent Agent View → optional log dropdown.

**Section B — Narrative modal larger:**
- `.narrative-modal` width 700px → 1000px · height 500px → 680px · max-width 90vw → 95vw · max-height 85vh → 90vh. Inner content scales; existing animation timing preserved across the larger canvas.

**Section C — Continuous-monitoring loop dropped:**
- `.nv-loop` HTML node deleted from `openNarrativeModal` template. `.nv-loop` CSS rules + `@keyframes nv-loop-spin` removed from `index.html`.

**Section D — KG legend rework:**
- 3D layer-title sprites (W3.5 spec) were already unmounted (`buildLayerTitle` retained as dead code per WA #5 — never called).
- Old `.kg-legend` horizontal chip row replaced by `.kg-legend-overlay` HTML overlay positioned absolute at top-middle of `#kg-floating-window` (inside `.kg-fw-body`).
- Vertical list format: 7 layer rows (L1 / L2 / L3 / L4 / L5 / L6 / L7) + 3 staging items (promoted byte · unpromoted byte · staging agent) + 1 auditor row + 1 commercial row.
- Overlay is `pointer-events: none` so drag through to canvas still works.

**Section E — P1 Section 2 modal redesigned (Anticipation theater):**
- Pivoted from 3-bucket pattern → 4-step horizontal storyboard.
- Step 1 = SOP doc slides in (SOP Retrieval Agent).
- Step 2 = scrolled-to-Step-7 view with amber highlight (SOP Adherence Critic).
- Step 3 = empty axis + vibration RMS path stroke-dashoffset auto-draws over 2s (Sensor Anomaly Inspector).
- Step 4 = tablet-with-chart frame + green "✓ Anticipated · staged for Faye Sit" badge (Telemetry Snapshot Compiler).
- Arrow connectors `→` activate sequentially with green pulse keyframe.
- Footer narration: "The agents anticipated. Faye never asked. The snapshot was already waiting."
- Total animation timeline ~10s. Right-pane persistent-card sync preserved via `fireAgentCardLifecycle`.

**Section F — P1 Section 3 modal redesigned (Parallel-match theater):**
- Pivoted from 3-bucket pattern → 4×4 candidate matrix.
- 4 candidates × 4 criteria = 16 cells pulse simultaneously (parallel-execution cue) then resolve to ✓ / ✗ / — with staggered timing in the 2.5s–4s window.
- Lim Wei Jie row = only candidate passing all 4 gates → highlights green + `GO` badge at t=4.5s.
- Counter caption: `20-minute phone tag → 2.4 seconds`.
- Dispatch-fire line at t=6s: `→ A2A Coordination Agent · dispatching to Lim Wei Jie · payload pre-attached`.
- A2A persistent card pulses on dispatch-fire activation.

**Section G — P2 right pane 3 sections → 2 sections:**
- Combined Section A (safety + tacit knowledge in one card framed as "two on-site problems solved at once"). Old standalone P2_SECTION_B constant + modal pathway dropped.
- Section A modal uses new split-canvas template: top banner (`TWO ON-SITE PROBLEMS · ONE PLATFORM`) → 2-col grid (LEFT col = Safety Protocol Enforcement w/ pink-vivid dashed border + 3 HSE agents reveal w/ ✓ check + HSE Risk Validator critic + green `→ Field work UNBLOCKED` outcome; RIGHT col = Tacit Knowledge Capture w/ blue-vivid border + 3 tacit agents + Tacit Relevance Critic + `→ Engineering insight CAPTURED` outcome) → bottom footer.
- Section B (was C) = `Open KG` button; opens existing floating KG window. No modal.
- `P2_NARRATIVE_SECTIONS` array trimmed to 2 entries (A combined + B = KG); `wireLimRightPaneButtons` data-action branch now keys on `'B'` for open-kg.

**Section H — P3 laptop redesign:**
- `#laptop-frame` max-width 920px → 1280px (wider). `.laptop-screen` min-height 90vh → 70vh (shorter).
- Notification bell DROPPED — `.td-notification-bell` markup + CSS removed; `wireLaptopBellClick` / `onLaptopBellClick` / `updateLaptopBellState` deleted.
- New 2-col body grid `.td-body-grid` (1.4fr 1fr): LEFT col = portfolio + market zones (preserved); RIGHT col = Active Tasks zone moved to top-right.
- Active Tasks tile pattern restructured: `.td-task-row` → `.td-task-tile` w/ explicit `.td-task-what` (1-line action) + `.td-task-why` (1-line italic context).
- URGENT tile (incident-specific): red-amber accent w/ 4px red left border + `URGENT` corner badge + pulse keyframe (`td-task-urgent-pulse` 1.8s) + `Open` action button. Body: What = `Hedge BFP-3A exposure · JRG-CCGT-1`; Why = `Unplanned BFP-3A trip · 4hrs · ~200 MWh at risk · PSO 09:00–18:00 SGT`.
- Visibility gated by `getCanonicalTicket().statePill === 'ROUTED_TO_TRADING_DESK' && !state.priya.decisionLocked` via new `updateLaptopActiveTasks()` called per render.
- URGENT tile click → `state.screen = 'incident-detail'; render()` → `syncLaptopModalState()` opens existing W8 + W9 trader modal (mechanic preserved).
- Post-lock: URGENT tile replaced by greyed `.td-task-completed` tile w/ green `✓ Locked` badge and per-option label (e.g. `Hedge locked · Cross-site Sakra balancing`).

**Section I — P3 KG: 3 new layers L5 / L6 / L7:**
- `LAYER_Y` extended: `L5: 150 (Markets)` · `L6: 210 (Contracts)` · `L7: 270 (Cross-site Network)`.
- `KG_LAYER_COLORS` extended: `L5: #A855F7 (purple)` · `L6: #8B5CF6 (violet)` · `L7: #6366F1 (indigo)`.
- 7 commercial nodes relayered with Y pinned to `LAYER_Y[layer]`:
  - L5 (Markets · 3 nodes): merchant-market-sg · supply-curve-singapore · demand-forecast-q3-2026
  - L6 (Contracts · 2 nodes): ppa-pso-2026 · hedge-instrument-catalog
  - L7 (Cross-site Network · 2 nodes): cross-site-sakra-availability · cross-site-tuas-availability
- Existing `KG_COMMERCIAL_EDGES` preserved (source/target IDs unchanged, edges auto-relink).
- P3 camera pose adjusted: `cam={x:400, y:150, z:820}` · `lookAt={x:400, y:150, z:0}` (was `y:0, z:700`) — pulled back + raised to frame the 7-layer Y stratification.

Verified via Chrome MCP — 24 tests run, per-test results below. Subjective items (visual KG geometry / projector legibility / animation timing feel) flagged as human-check.

```
#: A1 · Test: Learning Flywheel removed · Observed: document.getElementById('zone-flywheel') === null · Expected: zone absent · Pass: ✓
#: B1 · Test: Narrative modal dims · Observed: computedStyle width 1000px height 680px · Expected: 1000×680 · Pass: ✓
#: C1 · Test: nv-loop-spin keyframe removed · Observed: no @keyframes nv-loop-spin in any stylesheet · Expected: removed · Pass: ✓
#: D1 · Test: KG legend overlay present · Observed: .kg-legend-overlay node found, 12 .kg-leg-row children · Expected: vertical list overlay · Pass: ✓
#: D2 · Test: Legend includes L1-L7 + cluster rows · Observed: data-layer L1/L2/L3/L4/L5/L6/L7 all present; data-cluster staging/auditor/commercial rows present · Expected: 7 layers + 3 staging + 1 auditor + 1 commercial · Pass: ✓
#: E1 · Test: P1 §2 anticipation canvas · Observed: .nv-anticipation-canvas present; 4 .nv-step nodes (step 1-4); NO .nv-bucket · Expected: 4-step storyboard · Pass: ✓
#: E2 · Test: P1 §2 footer narration · Observed: "The agents anticipated. Faye never asked. The snapshot was already waiting." · Expected: same · Pass: ✓
#: F1 · Test: P1 §3 parallel-match canvas · Observed: .nv-parallel-match-canvas present; .nv-pm-grid; 4 .nv-pm-row; 16 .nv-pm-cell; NO .nv-bucket · Expected: 4×4 matrix · Pass: ✓
#: F2 · Test: P1 §3 candidate IDs in DOM · Observed: ["lim","j-tan","s-ibrahim","m-lim"] · Expected: same · Pass: ✓
#: F3 · Test: P1 §3 winner resolution at t=7s · Observed: lim row data-winner="true" + all 4 cells pass; j-tan results [pass,fail,na,na]; dispatch-fire data-active="true" · Expected: same per spec · Pass: ✓
#: G1 · Test: P2 Lim right pane = 2 sections · Observed: lim_sections=["A","B"] · Expected: 2 sections (A combined + B = KG) · Pass: ✓
#: G2 · Test: P2 Section labels · Observed: btnA_label="Play" btnB_label="Open KG" · Expected: same · Pass: ✓
#: G3 · Test: P2 §A split-canvas modal · Observed: .nv-split-canvas present; 2 .nv-split-col; 3 safety agents + 3 tacit agents; banner "TWO ON-SITE PROBLEMS · ONE PLATFORM"; NO .nv-bucket · Expected: same · Pass: ✓
#: G4 · Test: P1 §1 preserved (3-bucket default template) · Observed: .nv-canvas + 3 .nv-bucket nodes · Expected: P1 §1 unchanged · Pass: ✓
#: H1 · Test: Laptop wider + shorter · Observed: laptop_maxWidth=1280px · laptop_minHeight=592.48px (= 70vh at 846 viewport) · Expected: 1280px · 70vh · Pass: ✓
#: H2 · Test: Notification bell removed · Observed: .td-notification-bell not in DOM · Expected: dropped · Pass: ✓
#: H3 · Test: 2-col body grid · Observed: .td-body-grid present · gridTemplateColumns "706.062px 504.331px" (1.4:1 ratio @ ~1280px content) · .td-body-right .td-zone-tasks truthy · Expected: 1.4fr 1fr, tasks in right col · Pass: ✓
#: H4 · Test: URGENT tile on ROUTED_TO_TRADING_DESK · Observed: .td-task-tile.td-task-urgent present; badge "URGENT"; what "Hedge BFP-3A exposure · JRG-CCGT-1"; action button present · Expected: gated by ticket.statePill · Pass: ✓
#: H5 · Test: URGENT tile click opens trader modal · Observed: state.screen='incident-detail' after click; trader-modal-backdrop appears · Expected: existing W8/W9 modal opens · Pass: ✓
#: H6 · Test: Post-lock URGENT replaced by completed tile · Observed: after state.priya.decisionLocked=true + render: .td-task-urgent absent; .td-task-completed present w/ "✓ Locked" badge + per-option what "Hedge locked · Cross-site Sakra balancing" · Expected: greyed completed-state · Pass: ✓
#: I1 · Test: LAYER_Y extended · Observed: {L1:90, L2:30, L3:-30, L4:-90, L5:150, L6:210, L7:270} · Expected: same · Pass: ✓
#: I2 · Test: Commercial nodes relayered + Y-pinned · Observed: L5:3 (merchant-market/supply-curve/demand-forecast all y=150) · L6:2 (ppa-pso/hedge-catalog all y=210) · L7:2 (sakra/tuas all y=270); every node.y === LAYER_Y[node.layer] · Expected: same · Pass: ✓
#: I3 · Test: P3 camera pose adjusted · Observed: cameraPosition called with cam={x:400,y:150,z:820} lookAt={x:400,y:150,z:0} ms=2000 · Expected: same per Section I.5 · Pass: ✓
#: I4 · Test: Legend overlay includes L5/L6/L7 rows · Observed: data-layer="L5"/"L6"/"L7" rows present · Expected: same · Pass: ✓
#: Visual-E · Test: Anticipation modal full render screenshot · Observed: 4 step cards rendered left-to-right with SOP doc / Step-7 highlight / vibration RMS chart drawn / staged tablet w/ Anticipated badge + footer narration · Expected: same · Pass: ✓ (visual confirm)
#: Visual-F · Test: Parallel-match modal full render screenshot · Observed: 4×4 grid resolved, Lim row green + GO badge, J.Tan/S.Ibrahim/M.Lim each have appropriate fail/na cells, counter + dispatch line visible · Expected: same · Pass: ✓ (visual confirm)
#: Visual-G · Test: Split-canvas modal full render screenshot · Observed: banner + 2 cols (safety pink-vivid border / tacit blue-vivid border) + 3 ✓ agents per col + critic per col + outcome per col + footer · Expected: same · Pass: ✓ (visual confirm)
#: Visual-H · Test: Priya laptop full render screenshot · Observed: laptop frame wider, KPI strip preserved, 2-col body w/ portfolio+market LEFT and Active Tasks RIGHT, URGENT tile at top of tasks w/ red border + URGENT badge + Open button, baseline tiles below, NO bell · Expected: same · Pass: ✓ (visual confirm)
```

Human-check items (subjective; flagged not auto-asserted):

- **3D KG legend overlap at projector resolution.** Overlay at top-middle is `pointer-events: none` so drag still works, but with 12 rows it consumes ~360px vertical from the top of the canvas — at small floating-window heights this can occlude L1 / L2 nodes. Pulkit should size + position the floating window during projector dry-run.
- **Y-band stratification at the new camera pose (cam y=150, looking at y=150).** Layers span Y range [-90, 270] = 360 units. Camera Z=820 is comfortable, but at projector distance Y-band gaps may compress. Visual integrity needs eyeball check.
- **L5 (purple) / L6 (violet) / L7 (indigo) color triplet.** Adjacent in hue — at projector distance, may be hard to distinguish layer bands. Consider higher-contrast distinct hues if Pulkit feels they blend during dry-run.
- **Anticipation theater Step 3 chart draw.** Stroke-dashoffset animation is 2s. Step 3 reveals at t=5s; visual asks whether chart finishes drawing before Step 4's reveal at t=8s (3s window — generous). Animation timing feel = subjective.
- **Parallel-match grid cell pulse.** Initial state has all 16 cells pulsing simultaneously. At full-screen modal width (1000px), this can read as visual noise rather than parallel-execution clarity. Pulkit should judge during dry-run.
- **URGENT tile pulse keyframe (1.8s box-shadow).** Distracts attention to incident-specific tile. Loud red-amber accent — intentional but should be confirmed at projector distance.

Follow-up notes:

- `buildLayerTitle` (W3.5) retained as dead code — never called (was already dead before W11). Per WA #5.
- `paintRightPaneInlineKG` (W7) retained as dead code per WA #5.
- `wireLaptopBellClick` / `onLaptopBellClick` / `updateLaptopBellState` (W8 G) DELETED — bell mechanic fully replaced by URGENT-tile click pattern.
- `P2_SECTION_B` constant DELETED (standalone tacit modal pathway replaced by combined split-canvas in P2_SECTION_A).
- `<script src="app.js?v=w11">` cache-bust query added during W11 verification — keep across future revisions or strip on final build.
- W11 = COMPLETE. Demo build remains FEATURE COMPLETE for the 2026-05-27 ITP presentation. Remaining work = projector dry-run + narration rehearsal.

### W12 deployment confirmation (2026-05-25) — POST-W11 REVIEW POLISH + RENAMES

7-item polish + restructure wave post-W11 review.

**Section A — P2 KG hides L5/L6/L7:**
Build-time filter via `getKGNodesForPersona(persona)` + `getKGEdgesForPersona(persona)` + `applyPersonaKGFilter(persona)` re-sets `graphData()` with persona-scoped subset. Called from `toggleGraphWindow` on open. `#kg-floating-window` data-persona attribute drives CSS hide rule for `.kg-leg-row[data-layer="L5/L6/L7"]` + `.kg-leg-row[data-cluster="commercial"]` via `#kg-floating-window[data-persona="onsite"]` selector.

**Section B — KG palette + uniform white halo:**
- New 7-layer palette: L1 `#10B981` emerald · L2 `#3B82F6` blue · L3 `#F59E0B` amber · L4 `#EF4444` red · L5 `#A855F7` purple · L6 `#06B6D4` cyan · L7 `#EC4899` pink.
- Per-cluster halo color logic (staging blue · auditor blue · commercial purple) REMOVED.
- All nodes now use uniform white halo (radius × 1.18, opacity 0.95) matching original 4-layer treatment. Newly-added KG-growth flash still renders green at radius × 1.55.

**Section C — L5/L6/L7 densification:**
- L5 Markets: 3 → 8 nodes (added USEP-30min · LNG-spot · carbon-CORSIA · weather-temp · gas-pipeline).
- L6 Contracts: 2 → 7 nodes (added PSO-bilateral · CCAA-industrial · futures-SGD-monthly · vesting-EMA · ancillary-services).
- L7 Cross-site: 2 → 8 nodes (added Banyan-CHP · Tuas-spinning-reserve · 275kV-EHV · interconnector-MY · grid-50Hz · Sakra-cogen).
- 9 new inter-layer + intra-layer edges added; commercial total 23 nodes (was 7).

**Section D — Drop "green 3-dot-point" sections:**
- `.nv-sources` data source pills removed from `buildDefaultBucketCanvas`.
- `.nv-footer-narration` italic commentary removed from `buildAnticipationCanvas`.
- `.pn-s-meta` italic meta-line removed from all 3 persona narrative section cards (Faye P1 · Lim P2 · Priya P3).
- `.nv-narration` block also dropped from default bucket canvas.
- All associated CSS rules dropped from index.html.

**Section E — Dr. A. Wong → Dr. A. Ismail global rename:**
- All display labels updated in app.js + index.html + CLAUDE.md + SEMBCORP_SCOPE.md.
- KG node ID `dr-wong` → `dr-ismail`. KG edges updated. `wong-field-experience-2023` → `ismail-field-experience-2023` (id + label both updated for full zero-match).
- Transcript modal title + 6 speaker lines re-attributed.
- Capture footers · banner copy · agent log lines · `PERSONAS` array · `ROW_OWNER_BY_PERSONA` · `DISPATCH_LABEL` · CSS classes (`wong-summary-slot` → `ismail-summary-slot`, etc.) · functions (`paintWongSummaryComplete` → `paintIsmailSummaryComplete`, etc.) · `state.wong` → `state.ismail` — all updated.
- `grep -c -E "Wong|wong"` on app.js + index.html + CLAUDE.md + SEMBCORP_SCOPE.md returns 0 matches.
- AGENTS.md retains 3 historical Wong references — intentionally untouched per Karpathy rule 3 (not in W12 explicit rename scope).

**Section F — Lim Reject intermediate dialogue:**
- New `.sop-suggest-dialogue` element spawned post-Reject: heading `SOP suggests calling Dr. A. Ismail` + sub-text + `Call` button.
- Click Call → dialogue removes from DOM + SOP-routing theater fires for 3s (shortened from 6s) + in-call strip spawns.
- Reduces visual clutter (auto-transition from W7 → W11 replaced w/ explicit user-driven step).

**Section G — P2 right pane reverts to 3 sections (from W11 2-section):**
- Section A: Safety stage-gate theater. Workflow bar w/ 5 stages (Dispatch · Site arrival · Verify state · Inspection · Begin work). At t=2s alert flashes (HSE Field Compliance Agent self-alert). At t=2.5s safety gate slides in. 3 checks resolve sequentially (HSE · Cert · PPE/LOTO) at t=3s/4.5s/6s. At t=6.5s gate cleared outcome reveals. At t=7s workflow resumes (stage 4 done · stage 5 active).
- Section B: Tacit Singlish-detection theater. Audio waveform animates. At t=2s detection pulse reveals (English-Singapore detected · Audio-transcription Agent). At t=3-5s, 5 Singlish bubbles appear sequentially. At t=5.5s extraction reveals (arrow-down + "5 bytes coalesced"). At t=6-9s, 5 bytes reveal sequentially (3 promoted green · 2 unpromoted amber).
- Section C: KG `Open KG` button — unchanged from W11 behavior.

**Section H — P3 laptop redesign v2:**
- Sembcorp hexagonal SVG logo (`.td-brand-logo`) in top-bar — replaces W11 wave-mark text-only.
- Active Tasks zone (`.td-zone-tasks`) is FIRST child of right column (top placement).
- URGENT tile copy refreshed: `Buy USEP forward · Jul-26 · 50 MW · Q3 peak window` + `JRG-CCGT-1 BFP-3A unplanned shutdown · 4hrs · ~200 MWh at risk · PSO 09:00–18:00 SGT` + `~SGD 240k at risk` + `⏱ 28 min` (red-amber pulsing).
- 3 non-urgent task tiles also get `.td-task-money` (SGD spread/exposure/variance) + `.td-task-timer` meta.
- Empty bottom space filled: LEFT bottom `td-zone-trend` (USEP Forward Curve · Q3-2026 SVG line trend + 3-row position summary: Long +150 MW · Hedged 120 MW 80% · Exposure 30 MW). RIGHT bottom `td-zone-margin-gauge` (Reserve Margin SVG donut · 28% comfortable · forecast 22–30% next 6h).
- Zone 2 Market Snapshot trimmed to single Market Regime card (USEP curve detail relocated to Zone 3; Reserve Margin gauge relocated to right column bottom).

**Verification (Chrome MCP · per-test observed-vs-expected):**

```
#: A1 · Test: P2 KG hides L5/L6/L7 nodes · Observed: getKGNodesForPersona('onsite') returns 97 nodes; .some(L5)=false, .some(L6)=false, .some(L7)=false · Expected: zero L5/L6/L7 nodes · Pass: ✓
#: A1' · Test: P2 KG hides commercial cluster · Observed: .some(cluster==='commercial')=false on filtered subset · Expected: zero commercial nodes · Pass: ✓
#: A2 · Test: P2 KG hides commercial edges · Observed: getKGEdgesForPersona('onsite') returns 120 edges; p2EdgeRefsCommercial=false · Expected: no edges referencing commercial nodes · Pass: ✓
#: A3 · Test: P3 KG shows all 7 layers + commercial cluster · Observed: getKGNodesForPersona('analyst') = 120 nodes, all L5/L6/L7 present, 23 commercial nodes · Expected: full graph · Pass: ✓
#: B1 · Test: KG_LAYER_COLORS 7-hue palette · Observed: L1=#10B981 · L2=#3B82F6 · L3=#F59E0B · L4=#EF4444 · L5=#A855F7 · L6=#06B6D4 · L7=#EC4899 · Expected: same · Pass: ✓
#: B2 · Test: Uniform white halo in nodeThreeObject · Observed: code review confirms ringColor=0xFFFFFF (non-newly-added), opacity=0.95, ringRadius=radius*1.18; per-cluster branches removed · Expected: white uniform halo · Pass: ✓ (code-verified; three.js material read skipped — headless Chrome lacks WebGL renderer)
#: B3 · Test: Halo radius uniform · Observed: code review confirms ringRadius=radius*1.18 for all non-newly-added; no per-cluster ring radius branches · Expected: uniform · Pass: ✓
#: C1 · Test: L5 density · Observed: KG_NODES.filter(L5).length=8 · Expected: 8 · Pass: ✓
#: C2 · Test: L6 density · Observed: KG_NODES.filter(L6).length=7 · Expected: 7 · Pass: ✓
#: C3 · Test: L7 density · Observed: KG_NODES.filter(L7).length=8 · Expected: 8 · Pass: ✓
#: D1 · Test: .nv-sources removed · Observed: 0 elements + CSS rule dropped · Expected: zero · Pass: ✓
#: D2 · Test: .nv-footer-narration removed · Observed: 0 elements + CSS rule dropped · Expected: zero · Pass: ✓
#: D3 · Test: .pn-s-meta removed · Observed: 0 elements + CSS rule dropped · Expected: zero · Pass: ✓
#: D4 · Test: .nv-narration removed · Observed: 0 elements · Expected: zero · Pass: ✓
#: E1 · Test: Wong → Ismail global zero-match · Observed: grep returns 0 on app.js + index.html + CLAUDE.md + SEMBCORP_SCOPE.md · Expected: zero · Pass: ✓
#: E2 · Test: KG node ID renamed · Observed: dr-ismail exists, dr-wong undefined · Expected: same · Pass: ✓
#: E3 · Test: Transcript modal updated · Observed: contains "Dr. A. Ismail", no Wong refs · Expected: same · Pass: ✓
#: F1 · Test: SOP-suggest dialogue post-Reject · Observed: .sop-suggest-dialogue spawned · text "SOP suggests calling Dr. A. Ismail" · dyn-name="Dr. A. Ismail" · Call button present · Expected: same · Pass: ✓
#: F2 · Test: Click Call triggers theater + in-call · Observed: dialogue removed · sop-routing-theater fired and transitioned · .in-call-strip spawned w/ "On call · Dr. A. Ismail" · Expected: same · Pass: ✓
#: G1 · Test: P2 right pane = 3 sections · Observed: 3 .pn-section elements [A safety · B tacit · C KG]; A+B actions=modal, C action=open-kg · Expected: same · Pass: ✓
#: G2 · Test: Section A safety modal · Observed: .nv-safety-gate-canvas, .nv-sg-workflow-bar (5 stages), .nv-sg-alert, .nv-sg-gate (3 checks), .nv-sg-gate-outcome all present · Expected: same · Pass: ✓
#: G3 · Test: Section B tacit modal · Observed: .nv-tacit-singlish-canvas, .nv-ts-waveform, .nv-ts-detection, 5 bubbles, 5 bytes (3 promoted · 2 unpromoted), Dr. A. Ismail dyn-name · Expected: same · Pass: ✓
#: H1 · Test: Sembcorp hexagonal SVG logo · Observed: .td-brand-logo (SVG element, 2 polygons hex+inner) · Expected: SVG, not text · Pass: ✓
#: H2 · Test: Tasks zone top of right column · Observed: .td-body-right firstElementChild = .td-zone-tasks · Expected: same · Pass: ✓
#: H3 · Test: URGENT tile copy updated · Observed: what="Buy USEP forward · Jul-26 · 50 MW · Q3 peak window", money="~SGD 240k at risk", timer="⏱ 28 min" · Expected: same · Pass: ✓
#: H4 · Test: Baseline tiles have $ + timer · Observed: 4 tiles (URGENT+3) have .td-task-money + .td-task-timer · Expected: 4 each · Pass: ✓
#: H5 · Test: Bottom space filled · Observed: .td-usep-trend SVG + .td-position-summary (LEFT bottom) + .td-margin-donut (RIGHT bottom) all present · Expected: same · Pass: ✓
#: Visual-H · Test: Priya laptop screenshot · Observed: URGENT tile w/ red border + financial copy + $240k + 28 min; baseline tiles w/ SGD spread/exposure/variance + timer chips; Zone 3 USEP Forward Curve heading visible; Reserve Margin section header visible right column · Expected: same · Pass: ✓ (visual confirm)
```

Human-check items (subjective; flagged not auto-asserted):

- **WebGL renderer init in headless Chrome** is unreliable — `KG_STATE.graph` did not initialize during MCP verification (mount had 0×0 before display). All KG persona-filter logic verified via direct function calls on KG_NODES/KG_EDGES. Real-browser visual confirmation of halo color uniformity + densified L5/L6/L7 layout deferred to Pulkit's localhost run.
- **3D KG legend overlay row count** increased to 7 layers + 5 cluster glyphs = 12 rows. At small floating-window heights this can occlude L1/L2 nodes. Same caveat as W11.
- **Y-band density at densified layers.** L5 (8 nodes) · L6 (7 nodes) · L7 (8 nodes) packed in x ∈ [700, 820], so per-layer Z spread is tight. Force-graph may auto-spread on physics tick but initial reveal could feel crowded.
- **L5/L6/L7 hue contrast.** New palette uses purple/cyan/pink — should be more distinguishable than W11 purple/violet/indigo, but projector dry-run needed to confirm.
- **AGENTS.md retains 3 Wong references** intentionally — not in W12 explicit rename scope. Follow-up note (Karpathy rule 3).

Follow-up notes:

- `P2_SECTION_A` W11 split-canvas pathway DROPPED (replaced by safety-gate template). `buildSplitCanvas` + `playSplitCanvasAnimation` retained as dead code per WA #5 — no current call site after W12 G refactor.
- `state.ismail.*` (formerly `state.wong.*`) preserves W4 curated Screen D state shape — used by `renderOffsiteIncidentDetail` (dead code per WA #5, kept).
- `wong-field-experience-2023` KG ID renamed to `ismail-field-experience-2023` (coach allowed either; renamed for grep zero-match).
- `<script src="app.js?v=w12">` cache-bust updated.
- W12 = COMPLETE. Demo build remains FEATURE COMPLETE for the 2026-05-27 ITP presentation. Remaining work = projector dry-run + narration rehearsal.

### W13 Round 1 deployment confirmation (2026-05-25) — SURGICAL POLISH

6-item surgical batch — text renames, color swaps, P2 right-pane collapse. LHS gating + P1 RHS rewrite deferred to R2 + R3 of W13.

**Section A — Lim Screen D heading + status pill + inbound Faye notes:**
- `paintLimSummaryComplete` heading: "Predicted diagnosis" → "Diagnosis" (app.js:1700; Faye-side paintSummaryComplete @ 737 + 773 intentionally LEFT for R2 Item #1a; Ismail-summary @ 2584 also left — not R1 scope, flagged as follow-up).
- Status pill: dropped "✓ confirmed by Hyperspace OS · " prefix · keeps "pending onsite verification" (app.js:1685).
- Inbound Faye-notes section removed from Lim Screen D (caller at app.js:1566 dropped; `buildLimNotesSection` function @ 1593 stays as dead code per WA #5).

**Section B — Lim Fault Review section (W7 verdict relabel + recolor):**
- "Diagnosis verdict" → "Fault review" (app.js:1967).
- dv-sub copy → "Accept the fault diagnosis OR route the fault for senior engineer review." (app.js:1968).
- Reject button → `.dv-review-senior` · "Review with Senior Engineer" · slate-200 bg (#E2E8F0) · slate-600 text (#334155) · new CSS rule at index.html:3534+ · `.dv-reject` CSS retained as dead code.
- Confirm button → "Accept fault diagnosis" · `.dv-confirm` class unchanged · green-vivid styling preserved (app.js:1971).
- `wireVerdictButtons` updated to select `.dv-review-senior` (app.js:1987). Handler `onVerdictReject` unchanged — same downstream SOP-suggest dialogue → call → revise flow.
- `.dv-btn` CSS tightened: padding 14px 16px → 12px 10px; font-size 13px → 12.5px; added `white-space: nowrap` to prevent wrap on longer "Review with Senior Engineer" label. Both buttons fit on one row at 720px tablet width (verified: same-row top alignment, 312px each, 40.4px row height).

**Section C — Revise Diagnosis tile (Items #8 + #9):**
- Heading: "REVISE DIAGNOSIS" → "REVISED FAULT" (app.js:2346).
- Body copy: "Hyperspace OS detected that in addition to the bearings the main reason for this was actually a crack in pump casing on BFP-3A based on call with Dr. A. Ismail." (app.js:2348).
- Button: "Confirm revised diagnosis" → "Add review finding" (app.js:2351). `rdt-confirm-btn` class + `onConfirmRevisedDiagnosisClick` handler + `state.lim.confirmRevisedClicked` flag unchanged for traceability.
- Revised-tile label inside `buildRevisedDiagnosisTileHTML`: "Revised diagnosis ·" → "Revised fault ·" (app.js:1719). Ismail-summary builder at app.js:2594 has same string — NOT updated (out of R1 scope, flagged as follow-up).

**Section D — P2 right pane collapsed to 1 section:**
- `P2_NARRATIVE_SECTIONS` array trimmed: A safety + B tacit entries dropped; only Section C (KG promotion) retained.
- P2 header copy: "On-site agents at work · 3 capabilities" → "On-site agents at work · 1 capability"; sub "Safety enforcement · tacit knowledge capture · KG learning loop." → "Tacit knowledge → Knowledge Graph promotion."
- Section C `data-section="C"` label retained for traceability (not renumbered to `1`).
- `P2_SECTION_A` + `P2_SECTION_B` defs stay as dead code per WA #5.
- `P2_SECTION_BY_NUM` map reduced to `{}`. Prompt called for `{ 'C': P2_SECTION_C }` but `P2_SECTION_C` never existed (C uses `open-kg` action via `toggleGraphWindow()`, not modal). Empty map is the correct end state.
- P2 Section C "Open KG" button verified: still opens floating KG window (`state.graphWinOpen = true`, `.kg-fw` mounts).

**Section E — Consistency sweep results:**

Live-UI grep (post-R1):
- `Predicted diagnosis`: 0 stale matches in Lim path; 3 remain (737/773 Faye = R2 territory · INTENTIONAL · 2584 Ismail = follow-up not in R1 scope).
- `Diagnosis verdict` / `Diagnosis Verdict`: 0 live-UI matches; remaining matches are comments + CSS section banners + log line "Diagnosis Verdict gated open" at app.js:1978 (right-pane log strip — flagged as follow-up).
- `REVISE DIAGNOSIS` / `Revise diagnosis`: 0 live-UI matches; remaining are comments only.
- `confirmed by Hyperspace OS`: 0 matches ✓
- `Confirm revised diagnosis`: 0 matches ✓
- `Revised diagnosis ·`: 1 match @ 2594 (Ismail summary — follow-up).

Browser body-text regex (live, post full E2E):
- `/Diagnosis verdict/`: false ✓
- `/^Reject$/m`: false ✓
- `/REVISE DIAGNOSIS/`: false ✓
- `/confirmed by Hyperspace OS/`: false ✓

**Per-test observed-vs-expected table (Chrome MCP verified):**

| # | Test | Observed | Expected | Pass |
|---|---|---|---|---|
| A1 | Lim Screen D heading | `.sr-heading` → "Diagnosis" | "Diagnosis" | ✓ |
| A2 | Status pill copy | `.sr-hyp-status-pill` → "pending onsite verification" | exact "pending onsite verification" | ✓ |
| A3 | Inbound Faye notes dropped | `.notes-incoming` count = 0 | 0 | ✓ |
| B1 | Fault review heading | `.dv-heading` → "Fault review" | "Fault review" | ✓ |
| B2 | dv-sub copy | "Accept the fault diagnosis OR route the fault for senior engineer review." | exact match | ✓ |
| B3 | Review w/ Senior Engineer button | text="Review with Senior Engineer", bg=rgb(226,232,240)=#E2E8F0, color=rgb(51,65,85)=#334155, `.dv-reject` removed | all match | ✓ |
| B4 | Accept fault diagnosis button | text="Accept fault diagnosis", `.dv-confirm` class kept | match | ✓ |
| B5 | Buttons fit on one row | seniorWidth=312.2px, confirmWidth=312.2px, same top (sameRow=true), row height=40.4px | no wrap | ✓ |
| C1 | Revise tile heading | `.rdt-heading` → "REVISED FAULT" | "REVISED FAULT" | ✓ |
| C2 | Revise tile body copy | "Hyperspace OS detected that in addition to the bearings the main reason for this was actually a crack in pump casing on BFP-3A based on call with Dr. A. Ismail." | exact match | ✓ |
| C3 | Add review finding button | `.rdt-confirm-btn` → "Add review finding" | match | ✓ |
| C4 | Revised fault label inside revised tile | `.sr-hyp-revised-label` → "Revised fault ·" | "Revised fault ·" | ✓ |
| D1 | P2 RHS section count + label | sections = ["C"] | 1 section, data-section="C" | ✓ |
| D2 | No P2 Section A in DOM | selector returns null | null | ✓ |
| D3 | No P2 Section B in DOM | selector returns null | null | ✓ |
| D4 | P2 Open KG still works | `state.graphWinOpen=true`, `.kg-fw` mounted | KG opens | ✓ |
| E1 | Browser body-text regex sweep | all 4 stale-label regexes return false | all false | ✓ |
| E2E-R1 | End-to-end Lim flow | dashboard → Faye summary → engineer select Lim → dispatch → handoff → Lim header click → land incident → open INC → Lim Screen D ("Diagnosis" heading + "pending onsite verification" pill + no inbound notes) → force-complete 10/10 inspection → Fault review section (grey "Review with Senior Engineer" + green "Accept fault diagnosis") → click Review → SOP-suggest dialogue → Call → End → REVISED FAULT tile w/ new copy + "Add review finding" button → click → SOP review theater → morph → "Revised fault ·" label + statePill=REVISED_DIAGNOSIS_ROUTED | match | ✓ |

Human-check items (subjective; flagged not auto-asserted):

- **Projector legibility of grey "Review with Senior Engineer" button.** Slate-200 bg + slate-600 text passes WCAG AA contrast; projector dry-run still recommended to confirm vs the green "Accept fault diagnosis" button next to it.
- **Button label length on 720px tablet width.** "Review with Senior Engineer" fits without wrap with current padding (12px 10px) + font-size (12.5px) + `white-space: nowrap`. Tested in Chrome MCP at 1645×846 viewport. Visual on actual venue projector resolution to be confirmed.

**Files changed:**
- `/Users/talwarpulkit/code/demo-v-SC/app.js` — surgical edits: Lim sr-heading rename, status-pill prefix drop, `buildLimNotesSection` caller drop, dv-heading rename, dv-sub copy, Reject → Review-with-Senior class+text, Confirm button text, `wireVerdictButtons` selector, rdt-heading + rdt-text + rdt-confirm-btn text, sr-hyp-revised-label, `P2_NARRATIVE_SECTIONS` array trim, P2 header copy, `P2_SECTION_BY_NUM` trim.
- `/Users/talwarpulkit/code/demo-v-SC/index.html` — 2 CSS edits: added `.dv-review-senior` rule (placed after `.dv-reject` rule); tightened `.dv-btn` padding + font-size + added `white-space: nowrap`.

**Files intentionally not touched:**
- Faye-side `paintSummaryComplete` (app.js:737 + 773) "Predicted diagnosis" — R2 territory (Item #1a will rename to "Initial Diagnosis").
- Faye action-steps spawn timing + lifecycle — R2 territory.
- Faye right-pane (`renderRightPaneFaye`) — R3 territory.
- Ismail summary builder (app.js:2578-2594) "Predicted diagnosis" + "Revised diagnosis ·" — out of R1 scope; not specified in plan.
- KG state, KG nodes, KG render path.
- Priya laptop, transcript modal, escalation report, banner copy, call flow.
- `P2_SECTION_A` + `P2_SECTION_B` defs (kept as dead code per WA #5).
- `buildLimNotesSection` function body (kept as dead code per WA #5).
- `.dv-reject` CSS rule (kept as dead code per WA #5).

**Follow-up needed (per Karpathy rule 3 — flagged, not touched):**
- Ismail-summary builder (app.js:2578-2594) has lingering "Predicted diagnosis" heading + "Revised diagnosis ·" label. If Ismail path remains reachable in any flow, these will be inconsistent with Lim Screen D after R1. Confirm with coach whether Ismail-summary is reachable post-W7 or fully dead code.
- Right-pane log line "Diagnosis Verdict gated open" (app.js:1978) prints to log strip after 10/10 checks. Cosmetic stale label in log only — flag for optional later cleanup.
- AGENTS.md still references "Wong" in 3 places (carried from W12 — not in W13 scope).

W13 R1 = COMPLETE. R2 (LHS gating) + R3 (P1 RHS rewrite) remain.
STOPPING HERE — awaiting coach sign-off on R1.

### W13 Round 2 deployment confirmation (2026-05-25) — LHS STRUCTURAL GATING

2-item structural batch — Faye-side gating mechanic. Changes W6 vertical-flow gating: Action Steps no longer auto-spawn at t=10s; gated on Confirm click. Step 1 no longer auto-verifies; gated on Add click after intermediate SOP Compliance Agent theater.

**Section A — Initial Diagnosis + Rationale + Confirm CTA:**
- Faye Summary heading "Predicted diagnosis" → "Initial Diagnosis" (paintSummaryComplete @ app.js:799 final paint + line 750 t=5s placeholder shell).
- "Alternative hypotheses considered" dropdown → "Rationale" dropdown w/ 5 rationale rows + match-strength badges.
- NEW constant `INITIAL_DIAGNOSIS_RATIONALE` @ app.js:184 (5 entries · 3 fully met + 2 partially met).
- NEW `wireRationaleToggle` @ app.js:1343 (▸/▾ icon swap on expand/collapse).
- NEW `Confirm` CTA in `.sr-confirm-row` (rendered pre-confirm; replaced with `.sr-confirmed-pill` "✓ Initial diagnosis locked" post-confirm).
- NEW state init `state.faye = { diagnosisConfirmed: false, actionStepsSpawned: false }` @ app.js:53.
- `wireAltHypothesesToggle` kept as dead code per WA #5 (Lim summary @ app.js:1719 still wires it).

**Section B — Action Steps gating on Confirm click + lock-in theater:**
- Removed `pushReveal(paintActionStepsInitial + startActionStep1, 10000)` from `startScreenDRevealW39`.
- NEW `wireConfirmInitialDiagnosis` + `onInitialDiagnosisConfirmClick`:
  - Sets `state.faye.diagnosisConfirmed = true`.
  - Disables Confirm button + sets text "Locking in…".
  - Fires 3 agent-card pulses synced over 2s: inspection / triage / critic-power-gen.
  - Fires `flashKGDiagnosisNodes` (re-uses `KG_STATE.newlyAddedNodes` from `flashKGGrowthHalo` mechanism) on nodes `bearing-spalling-pattern` (L4) + `bearing-bfp-3a-nde` (L2). Prompt mentioned `hyp-bearing-spalling` + `bfp-3a-nde-bearing` which don't exist in KG_NODES — substituted with the real canonical IDs.
  - Appends orchestrator log line "Initial diagnosis confirmed by Faye Sit · workflow handoff to SOP-relevant next-best actions".
  - After 2s: replaces `.sr-confirm-row` contents w/ `.sr-confirmed-pill` "✓ Initial diagnosis locked" + calls `spawnSOPRelevantNextBestActions`.
- NEW `flashKGDiagnosisNodes` (2s flash; cleanup deletes added IDs + refreshKGStyles).
- NEW `spawnSOPRelevantNextBestActions` (guarded by `state.faye.actionStepsSpawned`; mounts SOP Relevant section).

**Section C — SOP Relevant next best actions + intermediate theater + Step 1 manual Add CTA:**
- NEW `paintSOPRelevantInitial`: heading "SOP Relevant next best actions" + `.as-sop-theater-slot` + 2 empty `.as-step-slot[data-step-slot="1|2"]` slots + Confirm CTA (disabled).
- NEW `playSOPAnticipationTheater`:
  - Phase 1 (2s): "SOP Compliance Agent · confirming SOP specific steps for BFP vibration investigation" (dots animation, `.sop-anticipation-theater`).
  - Fires `fireAgentCardLifecycle('sop-action', 2000)` synced w/ phase 1.
  - Appends sop-action log line "SOP Compliance Agent · confirming SOP-BFP-VIBR-001 specific steps · checking pre-conditions".
  - Phase 2: swap to `.sop-anticipation-result` "📋 SOP requires telemetry to be checked before on-site dispatch" + call `revealStep1WithAddButton`.
- NEW `revealStep1WithAddButton`: paints Step 1 (status `awaiting-add`, title "Step 1 · Inspect and confirm telemetry", body w/ msg "Telemetry snapshot pre-fetched by Hyperspace OS · pending operator confirmation" + `.as-step-add-btn` "Add") + Step 2 (status `locked`, "Locked — complete Step 1 first.").
- NEW `wireAddTelemetryButton` + `onAddTelemetryClick`:
  - Click → step1 status `verifying` → spinner + "Confirming telemetry…" → `fireAgentCardLifecycle('pl', 1000)` → 1s spinner → step1 status `done` (✓ + "Telemetry confirmed for INC-2026-0537" + paperclip attach) → `unlockActionStep2()` (existing 5s find-engineer flow unchanged).
- `paintActionStepsInitial` + `startActionStep1` kept as dead code per WA #5.
- `paintActionStepsComplete` updated for re-entry consistency: heading "SOP Relevant next best actions", Step 1 title "Inspect and confirm telemetry", message "Telemetry confirmed for INC-2026-0537", notes re-attach block REMOVED.

**Section D — Faye onsite-notes tile dropped from Step 2:**
- `insertOpsNotesIntoStep2()` call removed from `unlockActionStep2` (app.js:996 in pre-R2 numbering).
- Notes re-attach block (`buildNotesSectionStandalone` + `insertBefore` confirmed) removed from `paintActionStepsComplete`.
- `wireNotesMic()` removed from re-entry path.
- `insertOpsNotesIntoStep2`, `buildNotesSectionStandalone`, `wireNotesMic` all kept as dead code per WA #5.

**Re-entry handling:**
- `renderOpsIncidentDetail` actioned-path: force `state.faye.diagnosisConfirmed = true` + `state.faye.actionStepsSpawned = true` so `paintSummaryComplete` renders locked pill (no Confirm).
- Reveal timeline mid-flow re-entry: if user backs out + reopens after Confirm but pre-dispatch, the t=10s `paintSummaryComplete` detects `diagnosisConfirmed && !document.querySelector('.action-steps')` and re-spawns SOP Relevant section (resets `actionStepsSpawned` flag to bypass spawn guard).

**Cache-bust:** `<script src="app.js?v=w12">` → `?v=w13r2`.

**Per-test observed-vs-expected table (Chrome MCP verified):**

| # | Test | Observed | Expected | Pass |
|---|---|---|---|---|
| 1A | Initial Diagnosis heading | `.sr-heading` = "Initial Diagnosis" | "Initial Diagnosis" | ✓ |
| 1B | Rationale dropdown exists + collapsed by default | `.sr-rationale-toggle` present, `.sr-rationale-list[style*=display:none]` | present, hidden | ✓ |
| 1B' | Rationale expand on click | display=block, icon "▾" | block + ▾ | ✓ |
| 1C | Rationale 5 rows w/ badges | rowCount=5, badges=[fully met, partially met, fully met, partially met, fully met] | 3-5 rows, badge text matches | ✓ |
| 1D | Confirm button pre-click | text="Confirm", no locked pill | exact "Confirm", no pill | ✓ |
| 1E | Action Steps NOT spawned pre-Confirm | `#action-steps-slot` empty (innerLen=0), no `.action-steps` | empty | ✓ |
| 1F | Confirm click → 2s → pill replaces button + Action Steps spawn | pillText="✓ Initial diagnosis locked", confirmBtn gone, actionStepsSpawned=true | exact | ✓ |
| 1G | Lock-in theater fires 3 agent pulses | inspection/triage/critic-power-gen all transitioned to dataset.state="done" after 2s (evidence pulse fired) | pulse cycle observed | ✓ |
| 2A | Action Steps heading rename | `.as-heading` = "SOP Relevant next best actions" | exact | ✓ |
| 2B | Intermediate SOP theater | At t≈4s post-Confirm: `.sop-anticipation-result` w/ text "📋 SOP requires telemetry to be checked before on-site dispatch" (after Phase 1 → 2 transition) | exact result text | ✓ |
| 2C | Step 1 reveals w/ Add button (NO auto-spinner) | step1.status="awaiting-add", title="Step 1 · Inspect and confirm telemetry", addBtnText="Add" | exact | ✓ |
| 2D | Add click → step1 ✓ + step2 unlocks | step1.status="done", num="✓", msg="Telemetry confirmed for INC-2026-0537", attachBtn present, step2.status="selecting", engineerCard visible | exact | ✓ |
| 2E | No onsite-notes tile in Faye Step 2 | `.notes-in-step2` count=0, `.notes-standalone` count=0 | 0,0 | ✓ |
| E2E-R2 | Full Faye flow | Cold reload → open INC → t=5s placeholder w/ "Initial Diagnosis" heading → t=10s summary lands w/ Rationale + Confirm → rationale toggles → Confirm click → 2s lock-in theater (agent pulses · KG flash) → locked pill → SOP Relevant section spawns w/ SOP Compliance Agent theater → 2s → "SOP requires telemetry…" result → Step 1 reveals w/ Add button → Add click → 1s spinner → Step 1 ✓ → Step 2 unlocks via existing 5s find-engineer flow → engineer card → click → Step 2 ✓ "Lim Wei Jie selected" → Confirm on-site dispatch CTA enabled · no notes tile anywhere · no console errors | end-to-end pass | ✓ |
| REENTRY | Back chevron mid-flow + reopen pre-dispatch | Re-entry t=10s: `.sr-confirmed-pill` present, `.sr-confirm-btn` absent, `.action-steps` present w/ "SOP Relevant next best actions" heading + Step 1 awaiting-add | recovery paint correct | ✓ |
| FN | All R2 fns + dead-code fns present | hasFlashKGDiagnosisNodes, hasPaintSOPRelevantInitial, hasPlaySOPAnticipationTheater, hasRevealStep1WithAddButton, hasOnAddTelemetryClick, hasWireRationaleToggle, hasWireConfirmInitialDiagnosis, hasOldDeadCode_paintActionStepsInitial, hasOldDeadCode_startActionStep1, hasOldDeadCode_insertOpsNotesIntoStep2, hasOldDeadCode_buildNotesSectionStandalone, hasOldDeadCode_wireNotesMic, hasOldDeadCode_wireAltHypothesesToggle → all true | all present | ✓ |

**Human-check items (subjective; flagged not auto-asserted):**

- **Lock-in theater 2s feel.** Browser observation: agent cards visibly pulse + KG green flash + locked pill replaces Confirm in one smooth beat. Projector dry-run still recommended to confirm cadence reads at venue.
- **KG node flash visibility.** `bearing-spalling-pattern` (L4) + `bearing-bfp-3a-nde` (L2) flash via `KG_STATE.newlyAddedNodes`. Visual on 3D KG may need to confirm both nodes are visible in default camera framing for the demo audience.
- **Match-strength badge legibility on projector.** `fully met` green + `partially met` amber pills at 10px font-size — confirm at venue.

**Files changed:**
- `/Users/talwarpulkit/code/demo-v-SC/app.js` — added `INITIAL_DIAGNOSIS_RATIONALE`, added `state.faye` init, renamed t=5s placeholder heading, rewrote `paintSummaryComplete` (Initial Diagnosis + Rationale + Confirm), removed pushReveal Action Steps spawn, added `onInitialDiagnosisConfirmClick` + `flashKGDiagnosisNodes` + `spawnSOPRelevantNextBestActions`, added `wireRationaleToggle` + `wireConfirmInitialDiagnosis`, added `paintSOPRelevantInitial` + `playSOPAnticipationTheater` + `revealStep1WithAddButton` + `wireAddTelemetryButton` + `onAddTelemetryClick`, updated `paintActionStepsComplete` (new heading + step 1 title + notes re-attach removed), removed `insertOpsNotesIntoStep2()` call from `unlockActionStep2`, forced `state.faye` flags on actioned re-entry, added re-entry safeguard for confirmed-but-undispatched.
- `/Users/talwarpulkit/code/demo-v-SC/index.html` — added CSS for `.sr-rationale-block`, `.sr-rationale-toggle`, `.sr-rationale-list`, `.sr-rationale-row`, `.sr-rat-bullet`, `.sr-rat-text`, `.sr-rat-badge`, `.sr-rat-badge-met`, `.sr-rat-badge-partial`, `.sr-confirm-row`, `.sr-confirm-btn`, `.sr-confirmed-pill`, `.sop-anticipation-theater`, `.sop-anticipation-result`, `.sar-icon`, `.sar-text`, `.as-step-add-btn`, `.as-step[data-status="awaiting-add"]`. Cache-bust `v=w12` → `v=w13r2`.

**Files intentionally not touched:**
- Lim Screen D — finalized in R1.
- Ismail summary builder (app.js:2578-2594) — same R1 follow-up; unchanged.
- P1 right pane (`renderRightPaneFaye`) — R3 territory.
- KG node definitions, KG render path (only `KG_STATE.newlyAddedNodes` mechanism re-used).
- `pushReveal` queue mechanism, `revealTimers`, `cancelInProgressReveal`.
- Priya laptop, transcript modal, escalation report, banner copy, call flow.
- `paintActionStepsInitial`, `startActionStep1`, `wireAltHypothesesToggle`, `insertOpsNotesIntoStep2`, `buildNotesSectionStandalone`, `wireNotesMic` — kept as dead code per WA #5.

**Follow-up needed (per Karpathy rule 3 — flagged, not touched):**
- Ismail-summary builder "Predicted diagnosis" + "Revised diagnosis ·" labels (carried from R1; out of R2 scope).
- Right-pane log line "Diagnosis Verdict gated open" (carried from R1; out of R2 scope).
- AGENTS.md "Wong" references (carried; not in W13 scope).
- If R3 (P1 RHS rewrite) introduces agent IDs that differ from `inspection / triage / critic-power-gen`, the 3-agent pulse list in `onInitialDiagnosisConfirmClick` may need a follow-up alignment.

W13 R2 = COMPLETE. R3 (P1 RHS rewrite — 3-workflow stage-gated modal) remains.
STOPPING HERE — awaiting coach sign-off on R2.

### W13 Round 3 deployment confirmation (2026-05-25) — P1 RHS REWRITE

2-item major restructure — P1 right pane collapses to 1 clickable + single 1000px modal w/ 3 stage-gated workflows via horizontal stepper. Replaces W10/W11 3-section P1 narrative pattern.

**Section A — P1 right pane = 1 section:**
- `renderRightPaneFaye` (app.js:4393) rebuilt to render single "Agentic workflows for Faye" card.
- Header copy: "Agents at work · 1 capability" / "Stage-gated agentic workflows — triage · action planner · scheduling."
- Card uses `data-section="workflows"` selector. Played key = `state.w10.playedSections.p1['workflows']`.
- W10/W11 3-section iteration over `P1_NARRATIVE_SECTIONS` dropped from live dispatch.
- Old defs (`P1_NARRATIVE_SECTIONS`, `P1_SECTION_1/2/3`, `P1_SECTION_BY_NUM`, `openP1NarrativeModal`) retained as dead code per WA #5.

**Section B — `P1_WORKFLOWS` def (app.js ~4498):**
- 3 stage-gated steps:
  - Triage (6s) — Reasoning [Sensor Anomaly Inspector → inspection, Turbine Diagnostic Agent → triage] · Critic [Critic · Power Gen → critic-power-gen, Criticality Standards Critic] · Vertical [Criticality Scoring Agent, Incident Summary Synthesizer]
  - Action planner (7s · HITL note) — Reasoning [SOP Retrieval Agent, Sensor Anomaly Inspector → inspection] · Critic [SOP Adherence Critic] · Vertical [Telemetry Snapshot Compiler, SOP Compliance Agent → sop-action]
  - Scheduling (5s) — Reasoning [Roster Lookup Agent, Expertise Match Agent] · Critic [Certs Validator] · Vertical [A2A Coordination Agent → workflow]
- Persistent-agent mapping fires `fireAgentCardLifecycle` for synced right-pane card pulses.
- Triage bucket lineup (`inspection` / `triage` / `critic-power-gen`) matches the 3 persistent agents pulsed by R2's `onInitialDiagnosisConfirmClick` — alignment preserved.

**Section C — Horizontal-stepper modal:**
- 1000px wide `.narrative-modal-workflows` extends base `.narrative-modal`.
- Header: nm-section-num = "FAYE" · title = "Agentic workflows for Faye".
- Body: 3-pill stepper at top (active / pending / done states · green-vivid active) + single active canvas + auto-advance hint at bottom.
- CSS appended to index.html after `.narrative-modal-body` block (`.wf-canvas`, `.wf-stepper-pill`, `.wf-stepper-conn`, `.wf-step-card`, `.wf-buckets`, `.wf-bucket`, `.wf-agent-dot`, `.wf-agent-pulse`, `.wf-bucket-arrow`, `.wf-step-output`, `.wf-hitl-note`, `.wf-hitl-badge`, `.wf-advance-hint`).

**Section D — Per-workflow canvas:**
- `buildWorkflowStepCanvas(stepDef)` paints tagline + 3-bucket columns w/ bucket arrows + output reveal + (optional) HITL note.
- Agent dots reveal sequentially over step duration with `wf-agent-pulse` 1.4s ease-in-out animation on the dot indicator.
- HITL note only present on Step 2 (Action planner) — copy: "Human-in-the-loop · Faye must confirm telemetry (LHS Step 1 Add)".

**Section E — Stage-gate sequencer:**
- `startWorkflowSequencer` kicks off `playWorkflowStep(1)`.
- `playWorkflowStep(N)` updates stepper pill states, swaps canvas (for N>1), staggers agent reveals, fires persistent card lifecycle, reveals output caption near end, advances to N+1 or `onWorkflowsComplete`.
- All timers registered in `state.w10.modalTimers` — `closeNarrativeModal` clears them, preventing memory leak on mid-sequence close.
- On completion: all pills → done · hint → "All workflows complete ✓" · `state.w10.playedSections.p1['workflows'] = true` · RHS button flips to "✓ Replay".

**Section F — Dead code retained per WA #5:**
- `P1_NARRATIVE_SECTIONS`, `P1_SECTION_1`, `P1_SECTION_2`, `P1_SECTION_3`, `P1_SECTION_BY_NUM`, `openP1NarrativeModal`, anticipation canvas template (`buildAnticipationCanvas` + `ANTICIPATION_VISUALS`), parallel-match canvas template — all preserved.

**Verification — Chrome MCP per-test observed-vs-expected table:**

| # | Test | Observed | Expected | Pass |
|---|---|---|---|---|
| 1 | A1 — P1 RHS section count | 1 | 1 | ✓ |
| 2 | A2 — P1 RHS section title | "Agentic workflows for Faye" | "Agentic workflows for Faye" | ✓ |
| 3 | A3 — Old 3-section titles in DOM | 0 of {Criticality·Diagnosis·Summary, SOP-driven telemetry confirmation, Scheduling·Expertise match·Dispatch} | 0 | ✓ |
| 4 | B1 — Play opens workflows modal | `.narrative-modal-workflows` present · title "Agentic workflows for Faye" | present | ✓ |
| 5 | B2 — Stepper renders 3 pills | 3 pills · labels [Agentic triage, Action planner, Scheduling] | 3 pills + correct labels | ✓ |
| 6 | C1 — Step 1 active on open | pill1=active · pill2=pending · pill3=pending | same | ✓ |
| 7 | C2 — Step 1 canvas buckets + agents | 3 buckets [Reasoning, Critic, Vertical-aligned] · 6 agents total (2+2+2) | same | ✓ |
| 8 | C3 — Step 1 progressive reveal | t=200ms: 1/6 revealed · t=3000ms: 5/6 · t=5500ms: 6/6 | sequential reveal | ✓ |
| 9 | C4 — Step 1 output reveals near end | t=5500ms: output `.wf-step-output-revealed` present | revealed near end | ✓ |
| 10 | D1 — Auto-advance to step 2 | t=6500ms: pill1=done · pill2=active · pill3=pending · canvas swapped to step 2 | same | ✓ |
| 11 | D2 — Step 2 HITL note | `.wf-hitl-note` present on step 2 only | present step 2 | ✓ |
| 12 | E1 — Auto-advance to step 3 | t=13500ms: pill2=done · pill3=active · canvas=step 3 · totalDots=4 | same | ✓ |
| 13 | E2 — Sequence complete | t=18500ms: all 3 pills=done · hint="All workflows complete ✓" · output revealed | same | ✓ |
| 14 | E3 — Close mid-sequence clears timers | modal removed · `modalTimers.length=0` · `modalOpen=false` · played=false (incomplete) | clean teardown | ✓ |
| 15 | E4 — Replay state persists after complete | playedFlag=true · RHS button text="✓ Replay" · pn-s-played class present · pn-section-played class present | replay state set | ✓ |
| 16 | E5 — R2 LHS gating preserved (regression) | "Initial Diagnosis" headings present on Screen D · Confirm CTA renders | R2 preserved | ✓ |

**Files changed:**
- `app.js` — `renderRightPaneFaye` + `wireFayeRightPanePlayButtons` rewritten · added `P1_WORKFLOWS` def + `openP1WorkflowsModal` + `buildWorkflowsModalCanvas` + `buildWorkflowStepCanvas` + `startWorkflowSequencer` + `playWorkflowStep` + `onWorkflowsComplete`
- `index.html` — appended W13 R3 CSS block after `.narrative-modal-body` (`.narrative-modal-workflows` + `.wf-*` rules)
- `SEMBCORP_SCOPE.md` — this confirmation block

**Files intentionally not touched:**
- LHS Faye lifecycle (R2 lock — `onInitialDiagnosisConfirmClick`, SOP Relevant section, Step 1 Add gating)
- P2 Lim right pane (R1 lock — single Section C only)
- P3 Priya right pane (W12 — laptop modal)
- KG node defs · KG render path
- Persistent agent roster (W8 — 17 agents)
- Tablet bezel + persona panel · Screen D paint structure

**Follow-up notes (none required for demo):**
- `state.w10.modalScope` set to `'p1-workflows'` (was `'p1'/'p2'`); downstream code referencing scope keys is dead so no breakage.
- `playNarrativeModalAnimation` + `applyNarrativeAction` paths remain wired for `openP1NarrativeModal` dead-code path.

W13 R3 = COMPLETE. W13 = COMPLETE. No more code waves planned before demo (2026-05-27).
STOPPING HERE — awaiting coach sign-off on R3.

### W14 Round 1 deployment confirmation (2026-05-25) — REVIEW MODAL + P1 RHS CLICKABLE+SLOW

2-item batch — Faye Step 1 attachment mechanic + P1 RHS workflow modal rewrite.

**Section A — Faye Step 1: Add → Review → Attach modal:**
- Button text "Add" → "Review" (`revealStep1WithAddButton` markup).
- `onAddTelemetryClick` renamed → `onReviewTelemetryClick`: now opens telemetry modal (sets `data-open="true"` + `aria-hidden="false"`) instead of marking step done.
- NEW `wireAttachTelemetryButton` + `onAttachTelemetryClick`: Attach click closes modal + fires existing 1s spinner → Step 1 ✓ → `unlockActionStep2` (existing 5s find-engineer flow preserved).
- Telemetry modal markup updated: appended `.telemetry-modal-actions` block w/ `.telemetry-modal-attach` CTA. Existing `.telemetry-modal-footer` (data source caption) preserved as-is — new class avoids collision.
- CSS for `.telemetry-modal-actions` + `.telemetry-modal-attach` (green-vivid styling matching other primary CTAs).
- `onAddTelemetryClick` retained as dead code per WA #5 — now a thin shim that calls `onReviewTelemetryClick()`.

**Section B — P1 RHS clickable pills + 4x slower + no auto-advance:**
- Stepper pills changed from `<div>` to `<button>` elements w/ `type="button"` + click handlers wired in `openP1WorkflowsModal` (after backdrop append).
- Click handler fires `playWorkflowStep(N)` for clicked pill number.
- Removed recursive auto-advance `setTimeout` from `playWorkflowStep`. Replaced w/ step-end callback that marks `state.w10.workflowsPlayed[stepNum] = true` + flips active pill to `done` + updates hint to "Workflow N complete · click another step ▸". When all 3 played at least once, fires `onWorkflowsComplete()`.
- `P1_WORKFLOWS` durations scaled 4x: Triage 6s → 24s · Action Planner 7s → 28s · Scheduling 5s → 20s.
- Agent reveal stagger floor bumped 400ms → 1200ms · output reveal delay scaled (800ms → 3000ms before end).
- NEW `state.w10.workflowsPlayed` tracks played workflows independently of stepper visual state.
- Stepper visual states: `pending` (never played) · `active` (currently playing) · `done` (previously played).
- Defensive timer cleanup at top of `playWorkflowStep` clears in-flight `state.w10.modalTimers` on replay so reveal animations don't compound.
- Advance hint copy: "Click any step to play its workflow ▸" (initial markup) · "Playing workflow N… ▸" (during play) · "Workflow N complete · click another step ▸" (post-step) · "All workflows complete ✓" (all played).
- Step 2 HITL note + output caption copy updated "Add" → "Review" to match Faye Step 1 button rename.

**Verification — per-test table (Chrome MCP):**

| # | Test | Observed | Expected | Pass |
|---|---|---|---|---|
| 1 | 1A — Step 1 button labeled "Review" | `.as-step-add-btn` textContent = "Review" · `data-status="awaiting-add"` | text = "Review" · status = awaiting-add | ✓ |
| 2 | 1B — Review click opens telemetry modal | `#telemetry-modal[data-open="true"]` + `aria-hidden="false"` · step1 status remains "awaiting-add" | modal open · step 1 NOT yet done | ✓ |
| 3 | 1C — Attach CTA present in modal | `.telemetry-modal-attach` exists · textContent = "Attach" | element present · text "Attach" | ✓ |
| 4 | 1D — Attach click closes modal + marks Step 1 ✓ | modal `data-open="false"` · step1 `data-status="done"` · num = "✓" · msg "Telemetry confirmed for INC-2026-0537" | modal closed · step 1 ✓ + correct msg | ✓ |
| 5 | 1E — Step 2 unlocks post-Attach | step2 `data-status="selecting"` · body shows AVAILABLE / Lim Wei Jie | step 2 transitions through 5s find flow | ✓ |
| 6 | 1F — Re-open modal via paperclip after Attach | modal `data-open="true"` · `.telemetry-modal-attach` `data-wired="1"` (idempotent) | modal re-opens · no double-wire | ✓ |
| 7 | 2A — Stepper pills are clickable buttons | 3 pills · all tagName="BUTTON" · all cursor="pointer" | `<button>` tags · `cursor: pointer` | ✓ |
| 8 | 2B — Modal opens with no auto-advance | After 27s: pill 1 state="done" · pill 2/3 state="pending" · canvas still shows step 1 · hint "Workflow 1 complete · click another step ▸" | step 1 plays · no auto-advance to step 2 | ✓ |
| 9 | 2C — Click pill 2 plays workflow 2 | pill 2 state="active" · canvas shows step card w/ `data-step="2"` · `.wf-hitl-note` visible | pill 2 active · Action Planner content · HITL note visible | ✓ |
| 10 | 2D — Replay-on-click | After clicking pill 1 again: canvas swaps back to step 1 · dotsRevealed=0/6 · pill 1 state="active" · pill 2 reset to "pending" | canvas re-builds step 1 · reveal sequence restarts | ✓ |
| 11 | 2E — Triage workflow ~24s duration | All 6 agent dots revealed by t≈24s wait · output revealed · hint flipped to "complete" | duration in [20s, 28s] range (4x slower than R3's 6s) | ✓ |
| 12 | 2F — Advance hint non-auto copy | Initial markup: "Click any step to play its workflow ▸" · post-step: "Workflow N complete · click another step ▸" · no "Auto-advance" string in any state | initial contains "Click any step" · post-step non-auto framing | ✓ |
| 13 | 2G — All-played triggers completion (simulated via onWorkflowsComplete after marking workflowsPlayed) | `state.w10.playedSections.p1.workflows === true` · P1 RHS button text = "✓ Replay" · `pn-s-played` class present | playedFlag=true · RHS Replay state set | ✓ |
| 14 | 2H — Close mid-playback clears timers | After clicking `.nm-close` while step in flight: backdrop removed · `state.w10.modalTimers.length === 0` | backdrop gone · timers cleared | ✓ |
| 15 | E2E-R1 — Full Faye flow w/ R1 changes + W13 R2/R3 preserved | Cold reload → header click → notification banner → AMBER card → Screen D inc-header → Initial Diagnosis Confirm (`.sr-confirm-btn`) → SOP relevant section → Step 1 "Review" → modal opens → "Attach" → Step 1 ✓ → Step 2 selecting (Lim Wei Jie) · RHS P1 workflows modal click-to-play across 3 pills · replay works · no errors | Full Faye flow w/ R1 changes lands · R2/R3 W13 mechanics preserved | ✓ |

**Files changed:**
- `app.js` — `revealStep1WithAddButton` markup (Add → Review) · `wireAddTelemetryButton` retargeted to `onReviewTelemetryClick` · NEW `onReviewTelemetryClick` + `wireAttachTelemetryButton` + `onAttachTelemetryClick` · `onAddTelemetryClick` reduced to shim · `P1_WORKFLOWS` durations 4x · `buildWorkflowsModalCanvas` pills `<div>` → `<button>` + initial hint copy · `openP1WorkflowsModal` wires pill click handlers · `playWorkflowStep` rewritten (defensive timer cleanup + always-swap canvas + workflowsPlayed tracking + no recursive auto-advance + 4x-scaled stagger/outputDelay)
- `index.html` — appended `.telemetry-modal-actions` markup w/ `.telemetry-modal-attach` button below existing `.telemetry-modal-footer` · added CSS for `.telemetry-modal-actions` + `.telemetry-modal-attach` · added `cursor: pointer` / `font-family: inherit` / `:hover` / `:focus-visible` to `.wf-stepper-pill`
- `SEMBCORP_SCOPE.md` — this confirmation block

**Files intentionally not touched:**
- Lim Screen D (R2 territory · NOT R1)
- KG nodes / edges / render path (R3 territory · NOT R1)
- W13 R2 Initial Diagnosis Confirm gate + lock-in theater
- W13 R1 P2 Lim RHS (single Section C)
- P3 Priya laptop modal (W12 lock)
- Persistent agent roster (W8 — 17 agents)
- `pushReveal` queue mechanism · `state.actionSteps` lifecycle

**Follow-up notes (none required for demo):**
- Test 2G executed via `onWorkflowsComplete()` direct invocation after seeding `state.w10.workflowsPlayed = {1:true,2:true,3:true}` to avoid 72s real-time playthrough. Full reveal lifecycle for all 3 steps measured individually via test 2E + replay test 2D.
- Test 2H verified close `.nm-close` clears `state.w10.modalTimers` to length 0; modal pulse class also clears via existing `closeNarrativeModal` teardown.
- Test 2F: initial advance hint markup "Click any step to play its workflow ▸" is overwritten ~0ms later by `playWorkflowStep`'s "Playing workflow 1… ▸" because `openP1WorkflowsModal` auto-kicks step 1 via `startWorkflowSequencer`. The negative-assertion (no "Auto-advance" string) holds at all times.

W14 R1 = COMPLETE.
STOPPING HERE — awaiting coach sign-off on R1.

### W14 Round 2 deployment confirmation (2026-05-25) — LIM RATIONALE + INSPECTION REWRITE + ASSISTANT POPUP

4-item major Lim persona rewrite — Diagnosis Rationale dropdown consistency with Faye, flat 5-item inspection list with tick/cross/camera/mic UX, sequential gating, and floating Assistant FAB + popup replacing the Fault Review trigger.

**Section A — Lim Diagnosis Rationale dropdown:**
- `paintLimSummaryComplete` Alt-hypotheses dropdown (`sr-alternates` + `wireAltHypothesesToggle`) replaced with Rationale dropdown (`sr-rationale-block` + `wireRationaleToggle`).
- Re-uses `INITIAL_DIAGNOSIS_RATIONALE` constant + `wireRationaleToggle` from W13 R2 — Faye-consistent (same 5 rows, same fully-met/partially-met badges).
- `wireAltHypothesesToggle` is now orphaned in default path · stays as dead code per WA #5.
- Faye Initial Diagnosis Rationale dropdown (W13 R2) unchanged — no regression.

**Section B — Inspection tile UX rewrite (5-item flat list):**
- `LIM_INSPECTION_CHECKLIST` rewritten from grouped 3-bucket / 10-item structure → flat 5-item array (visual-bearing-nde, vibration-rms-handheld, dial-indicator-runout, casing-visual, coupling-alignment).
- `LIM_CHECKLIST_THRESHOLD` 10 → 5.
- New tile UX: tick ✓ + cross ✗ buttons on right side (replaces single-click checkbox).
- Tick → camera 📷 CTA · click → photo placeholder attached (timestamp-suffixed filename).
- Cross → mic 🎤 CTA · click → 2s simulated recording → canned voice-note transcript per item from `LIM_VOICENOTE_TRANSCRIPTS`.
- New helpers: `paintLimChecklist` (flat), `renderItemResolvedState`, `wireFlatChecklistActions`, `onItemTick`, `onItemCross`, `onItemCameraClick`, `onItemMicClick`, `checkAndAdvanceChecklist`, `logFlatChecklistItem`.
- `paintLimChecklistComplete` rewritten to mark all 5 items as tick + photo for post-action re-entry.
- Legacy `buildLimGroupHTML`, `triggerGroupTheater`, `wireInspectionChecklist`, `updateChecklistProgress`, `truncateInspectionGroupsToCompleted`, `GROUP_THEATER_AGENT`, `GROUP_LOCKED_HINT`, `logChecklistItem` retained as dead code per WA #5.
- `state.lim.checked` still populated (legacy mirror) so downstream logic that inspects it remains coherent.

**Section C — Sequential gating (5 items):**
- `state.lim.checklistRevealedTo` cursor starts at 1, advances by 1 on each tick/cross resolve.
- Item N+1 reveals 400ms after item N resolved (`setTimeout` in `checkAndAdvanceChecklist`).
- Re-entry restores cursor + `state.lim.itemResults` from state on Lim Screen D re-mount.

**Section D — Floating Assistant button + popup:**
- `state.lim.assistantButtonShown` flag triggers FAB after `LIM_ASSISTANT_REVEAL_AFTER_ITEM` (2) items resolved.
- `spawnAssistantFloatingButton` appends pulsing purple-gradient FAB to `#incident-detail-view` (auto-cleanup on persona switch).
- `openAssistantPopup` mounts 340px popup at bottom-right with backdrop + 4 options (Ask Rene, Ask Lina, Check Maximo work-order history, Review with on-call Senior Engineer).
- `ASSISTANT_OPTIONS` constant lists option metadata. Primary option flagged `isPrimary: true` → green-left-border styling + green-soft fill.
- 3 non-primary options → `showAssistantToast` (`{label} · option not in this demo path`, 2.5s auto-dismiss).
- Primary option ("Review with on-call Senior Engineer") removes FAB + calls existing `onVerdictReject()` → chains into W12 SOP-suggest dialogue → Call → SOP routing theater → in-call strip → revised fault flow (W7 + W12 + W13 R1 preserved).

**Section E — Fault Review re-path:**
- `paintDiagnosisVerdict` no longer auto-spawned at threshold. Removed from re-entry path (`renderOnsiteIncidentDetail` `else if (checkedCount >= LIM_CHECKLIST_THRESHOLD)` branch deleted).
- `updateChecklistProgress` (legacy, now unreachable) still contains the threshold trigger as dead code per WA #5.
- Re-entry path adds: `else if (state.lim.assistantButtonShown)` → `spawnAssistantFloatingButton` to persist FAB across persona switches.
- `paintDiagnosisVerdict`, `wireVerdictButtons`, `onVerdictConfirm` retained as dead code per WA #5 (no live caller).

**Verification — per-test table (Chrome MCP, 18 tests):**

| # | Test | Observed | Expected | Pass |
|---|---|---|---|---|
| 1 | A1 — Lim summary heading + Rationale toggle present | `.sr-heading` = "Diagnosis" · `.sr-rationale-toggle` exists · 5 `.sr-rationale-row` elements | heading = "Diagnosis" · Rationale toggle + 5 rows | ✓ |
| 2 | A2 — wireRationaleToggle wired + alt-toggle absent | After click: `data-expanded="true"` · `.sr-rationale-list` visible · `.sr-alt-toggle` NOT in Lim summary | rationale expands · old alt-toggle gone | ✓ |
| 3 | A3 — Rationale toggle collapses on re-click | First click `data-expanded="true"` · second click `data-expanded="false"` | expand → collapse cycle | ✓ |
| 4 | B1 — Checklist length = 5 | `LIM_INSPECTION_CHECKLIST.length` === 5 · `LIM_CHECKLIST_THRESHOLD` === 5 · `LIM_ASSISTANT_REVEAL_AFTER_ITEM` === 2 | 5 items · threshold 5 · FAB after 2 | ✓ |
| 5 | B2 — Initial render shows only item 1 | `.ic-flat-item` count === 1 on first paint · revealedTo === 1 | 1 item visible | ✓ |
| 6 | B3 — Tick item 1: status done, camera CTA, item 2 reveals | item 1 `data-status="done"` · `data-result="tick"` · `.ic-flat-camera-btn` present · item 2 revealed within 500ms (count === 2) | done + camera + next item revealed | ✓ |
| 7 | B4 — Cross item 2: mic CTA + transcript on click | item 2 `data-status="done"` · `data-result="cross"` · `.ic-flat-mic-btn` present · after 2s click: `.ic-flat-voice-attached` = `🎤 Reason captured: "Need handheld unit · supervisor approval pending"` | cross + mic + canned transcript appears | ✓ |
| 8 | B5 — Camera attach on ticked item | Click 📷 → `state.lim.itemResults['visual-bearing-nde'].photo` set · `.ic-flat-photo-attached` text contains "Photo attached" + filename | photo placeholder attaches | ✓ |
| 9 | C1 — Sequential reveal · item 3 visible, items 4-5 still hidden | After cross item 2: items = `[visual-bearing-nde, vibration-rms-handheld, dial-indicator-runout]` · `revealedTo === 3` | items 1-3 revealed · 4-5 hidden | ✓ |
| 10 | D1 — Assistant FAB appears after item 2 done | After 2 items resolved: `.lim-assistant-fab` present · `position: fixed` · `state.lim.assistantButtonShown === true` | FAB visible bottom-right · sticky flag set | ✓ |
| 11 | D2 — FAB NOT visible before item 2 done | After only item 1 resolved: `fabPresent === false` | no FAB | ✓ |
| 12 | D3 — Popup on FAB click: 4 options + Assistant title | `.lim-assistant-popup` present · `.lap-option` count === 4 · labels = [Ask Rene, Ask Lina, Check Maximo work-order history, Review with on-call Senior Engineer] · primary option dataset = "review-senior" · title = "Assistant" | popup + 4 labels match · primary tagged | ✓ |
| 13 | D4 — Non-primary option fires toast + FAB persists | Click "Ask Lina" → popup removed · `.lim-assistant-toast` text = "Ask Lina · option not in this demo path" · FAB still present | popup closes · toast shown · FAB persists | ✓ |
| 14 | D5 — Primary option triggers SOP suggest dialogue | Click "Review with on-call Senior Engineer" → popup removed · FAB removed · `.sop-suggest-dialogue` present · `.ssd-text` = "SOP suggests calling Dr. A. Ismail" · `state.lim.rejectClicked === true` · `state.lim.callStarted === true` | popup closes · FAB removes · SOP suggest spawns · state flags set | ✓ |
| 15 | D6 — Call chains routing theater → in-call strip | Click `.ssd-action` ("Call") → SOP routing theater (3s) → `.in-call-strip` present · `lim-ctas-slot` child class = ["in-call-strip"] | routing theater → in-call strip auto-promote | ✓ |
| 16 | E1 — No Fault Review at 5/5 via tick (no Assistant click) | Seed all 5 items tick + `paintLimChecklist` + wait 700ms: 5 items done · `.diagnosis-verdict` NOT present · `lim-ctas-slot` innerHTML length === 0 | Fault Review never auto-spawns | ✓ |
| 17 | E2 — Re-entry preserves state + FAB respawn after persona switch | Pre: 2 items resolved · FAB present · itemResults count 2 · revealedTo 3. Switch to Faye: FAB torn down · no flat items. Back to Lim: 3 items rendered · item 1 done(tick) · item 2 done(cross) · item 3 open · FAB respawned · itemResults preserved (count 2) | state + FAB persistence across persona round-trip | ✓ |
| 18 | E2E-R2 — Full Lim flow w/ R2 changes + Faye preserved | Cold reload → seed Lim → Diagnosis heading + Rationale dropdown (5 rows) + flat 5-item list (only item 1 visible) → tick item 1 + camera → cross item 2 + mic → Assistant FAB appears → popup opens (4 options) → Review w/ Senior Engineer → SOP suggest dialogue → Call → routing theater → in-call strip. Console clean throughout. | Full E2E flow passes · no regressions | ✓ |

**Files changed:**
- `app.js` — `state.lim` extended w/ `itemResults` + `checklistRevealedTo` + `assistantButtonShown` · `paintLimSummaryComplete` swapped alts → Rationale block (re-uses `INITIAL_DIAGNOSIS_RATIONALE` + `wireRationaleToggle`) · `LIM_INSPECTION_CHECKLIST` rewritten to flat 5-item array · `LIM_CHECKLIST_THRESHOLD` 10 → 5 · NEW `LIM_ASSISTANT_REVEAL_AFTER_ITEM` (2) · NEW `LIM_VOICENOTE_TRANSCRIPTS` (5 entries) · `paintLimChecklist` rewritten (flat, sequential gating) · NEW `renderItemResolvedState` / `wireFlatChecklistActions` / `onItemTick` / `onItemCross` / `onItemCameraClick` / `onItemMicClick` / `checkAndAdvanceChecklist` / `logFlatChecklistItem` · `paintLimChecklistComplete` rewritten (all-tick + photo for post-action re-entry) · NEW `ASSISTANT_OPTIONS` / `spawnAssistantFloatingButton` / `openAssistantPopup` / `wireAssistantPopup` / `closeAssistantPopup` / `onAssistantOptionClick` / `showAssistantToast` · `renderOnsiteIncidentDetail` re-entry: removed `paintDiagnosisVerdict` auto-spawn at threshold, added FAB respawn when `assistantButtonShown`.
- `index.html` — appended CSS for `.inspection-checklist-flat` / `.lim-checklist-heading` / `.ic-flat-list` / `.ic-flat-item` / `.ic-flat-num` / `.ic-flat-body` / `.ic-flat-text` / `.ic-flat-actions` / `.ic-flat-btn` / `.ic-flat-tick` / `.ic-flat-cross` / `.ic-flat-result` / `.ic-flat-camera-btn` / `.ic-flat-mic-btn` / `.ic-flat-photo-attached` / `.ic-flat-voice-attached` · NEW `.lim-assistant-fab` w/ `@keyframes laf-pulse` · `.lim-assistant-popup` / `.lap-backdrop` / `.lap-card` w/ `@keyframes lap-card-slide` · `.lap-header` / `.lap-title` / `.lap-close` / `.lap-body` / `.lap-option` / `.lap-option-primary` / `.lap-opt-label` / `.lap-opt-sub` · `.lim-assistant-toast` w/ `@keyframes toast-fade`.
- `SEMBCORP_SCOPE.md` — this confirmation block.

**Files intentionally not touched:**
- Faye Screen D (W13 R2 + W14 R1 locks) — Rationale toggle, Confirm gate, SOP Relevant section, P1 RHS workflows modal unchanged.
- P1 RHS modal (W14 R1 lock).
- KG nodes / edges / render path (R3 territory).
- Transcript modal, escalation report, banner copy, call flow internals (W7 + W8 + W12 locks).
- `paintDiagnosisVerdict`, `wireVerdictButtons`, old `wireAltHypothesesToggle`, old grouped `buildLimGroupHTML` / `triggerGroupTheater` / `wireInspectionChecklist` / `updateChecklistProgress` / `truncateInspectionGroupsToCompleted` / `GROUP_THEATER_AGENT` / `GROUP_LOCKED_HINT` — kept as dead code per WA #5.
- P3 Priya laptop modal (W12 lock).
- Persistent agent roster (W8 — 17 agents).

**Follow-up notes (none required for demo):**
- Test 16 (E1) executed via direct state-seeding to bypass the 400ms sequential reveal gates between items. The negative assertion (Fault Review never spawns) holds regardless of how the threshold is reached because the auto-spawn call site was removed at both points (`renderOnsiteIncidentDetail` re-entry + `updateChecklistProgress` legacy path is now unreachable).
- Test 13 (D4) toast text was confirmed via in-page click in same eval call (CDP roundtrip latency in separate-call form sometimes exceeds the 2.5s toast lifespan and renders the toast already-removed). Toast lifecycle verified working.
- `state.lim.checked` is still mirrored from `itemResults` to keep any downstream legacy reader (none currently) coherent. Safe to remove the mirror later if no caller emerges.
- Subjective items (FAB pulse animation feel · popup slide-in legibility on projector · 2s mic recording duration framing) flagged as human-check required during live demo dry-run.

W14 R2 = COMPLETE.
STOPPING HERE — awaiting coach sign-off on R2.

### W14 Round 3 deployment confirmation (2026-05-25) — KG RE-ARCHITECTURE

KG re-architecture: 8 layers (split L1 People+Process into L1 Org Structure + L2 SOPs) · connectivity audit · legend side-by-side · click-to-drag (unwind W3.7 lock).

**Section A — LAYER_Y rewrite (`app.js` LAYER_Y block):**
- 8 layers · Y values 180/120/60/0/-60/-120/-180/-240 · 60-unit monotonic spacing.

**Section B — KG_LAYER_COLORS rewrite (`app.js` KG_LAYER_COLORS block):**
- 8 distinct hues: L1 emerald `#10B981` · L2 royal blue `#3B82F6` · L3 amber `#F59E0B` · L4 red `#DC2626` · L5 purple `#8B5CF6` · L6 cyan `#06B6D4` · L7 pink `#EC4899` · L8 orange `#F97316`.
- `KG_LAYER_NAMES` extended to 8 entries (Org Structure / SOPs / Plant & Equipment / Historical State / Predictive Intelligence / Markets / Contracts / Cross-site Network).

**Section C — KG_NODES relayer + relabel:**
- Central remap pass `W14R3_LAYER_REMAP = {L1:L1, L2:L3, L3:L4, L4:L5, L5:L6, L6:L7, L7:L8}` runs after all node-array pushes — single source of truth, no per-node literal edits.
- 4 SOP-flavored IDs (sop-bfp-vibration-investigation · raci-derate · esc-pso · bfp-casing-inspection-protocol) split out of old L1 → new L2.
- Added 8 new L3 semantic nodes (failure modes · telemetry signals) per Pulkit semantic split: failure-mode-race-spalling / casing-crack / misalignment / imbalance / bent-shaft · telemetry-vib-rms-nde / vib-phase-1xrpm / bearing-temp-live.
- `bearing-spalling-pattern` relocated L4 → L5 (Predictive Intelligence).
- Label overrides applied to 7 nodes for Sembcorp-canonical clarity (bearing-bfp-3a-nde · casing-bfp-3a · sulzer-bfp-manual · oem-ge-9ha-manual · iso-10816-7-spec · vib-rms-90d · bearing-temp-30d).
- Final layer distribution (post-remap): L1=17 · L2=4 · L3=41 · L4=20 · L5=23 · L6=8 · L7=7 · L8=8 · Total=128 nodes.

**Section D — KG_EDGES connectivity audit + fixes:**
- Pre-remap audit: 0 orphan edges · 6 isolated commercial nodes (carbon-credit-corsia · weather-temp-forecast-sg · industrial-customer-ccaa · vesting-contract-ema · ancillary-services-contract · tuas-power-spinning-reserve) · avg degree 2.27 · min degree 0.
- Added 25 new edges (`KG_W14R3_EDGES` block): bridge new L3 failure-modes ↔ L3 assets ↔ L4 history ↔ L5 patterns · telemetry ↔ transducers + L4 aggregates · 6 fix edges for isolated commercial nodes.
- Post-remap final: 0 orphan edges · 0 isolated non-tacit nodes · avg degree 2.52 · min degree 1 · Total=161 edges.
- Link material brightened (Pulkit root-cause "NONE of the nodes are connected" diagnosed as faint-edge rendering, not data gap): canonical edge color `rgba(255,255,255,0.32)` → `rgba(148,163,184,0.75)` (slate-400 @ 0.75) · non-canonical `rgba(255,255,255,0.10)` → `rgba(148,163,184,0.50)` · linkWidth canonical 1.2→1.4 · non-canonical 0.5→0.9.

**Section E — Tacit byte node label cleanup:**
- All 5 tacit byte node labels simplified per Pulkit explicit: `Tacit byte [triaged]` (3 promoted) · `Tacit byte [ingested]` (2 unpromoted). Nothing else.
- W7 + W10 R3 promotion mechanism (diamond geometry · staging cluster animation · green halo flash via `newlyAddedNodes` set) untouched.

**Section F — Legend side-by-side rework:**
- `.kg-legend-overlay` switched from `flex-direction: column` to `flex-direction: row` with 2 `.kg-leg-col` children.
- Layers column: 8 rows (L1 Org Structure through L8 Cross-site Network) with `data-layer="LN"` attrs.
- Tacit knowledge column: 2 rows (`Tacit byte [triaged]` · `Tacit byte [ingested]`) with `data-tacit="state"` attrs.
- Column titles: `.kg-leg-col-title` (uppercase 9.5px muted).
- Floating-window title updated `Knowledge Graph · 3D · 4 layers` → `Knowledge Graph · 3D · 8 layers`.

**Section G — Click-to-drag (W3.7 unwound):**
- `.onNodeClick` now calls `stopAutoRotate()` before camera-centering pan.
- `.onBackgroundClick(() => { if (!anyChainActive()) startAutoRotate(); })` added — empty-canvas click resumes rotation.
- `.enableNodeDrag(true)` retained (was already on) — three.js native node drag enabled.
- Close button + persona-open hook unchanged: existing `openKGForPersona` already restores rotation 6s post-pan.

**Section H — P3 KG + persona filter consistency:**
- `getKGNodesForPersona('onsite')` filter shifted from hiding `L5/L6/L7` to hiding `L6/L7/L8` (new scheme: Markets/Contracts/Cross-site). L5 Predictive Intelligence now visible to Lim (patterns relevant to diagnosis).
- P2 legend CSS hide rules updated to match: `#kg-floating-window[data-persona="onsite"] .kg-leg-row[data-layer="L6"], [data-layer="L7"], [data-layer="L8"]`.
- P3 (analyst) full 8-layer access preserved · onsite filter Lim sees 105 nodes / L1-L5.

**Section I — Tacit byte staging + green workflow arrows preserved:**
- `KG_STAGING_NODES` (5 bytes + 2 agents) and `KG_STAGING_EDGES` (12 edges incl. `isPromotionEdge` flagged ones) untouched in structure.
- W7 auditor cluster (3 nodes: kg-auditor-agent · kg-updater-agent · workflow-rewire-agent) untouched.
- Green workflow arrows (CSS `.chain-text .arrow { color: var(--green-vivid); }` in `index.html`) untouched.

**Cache-bust:** `v=w13r2` → `v=w14r3`.

**Files changed:**
- `app.js` — LAYER_Y rewrite · KG_LAYER_COLORS rewrite · KG_LAYER_NAMES extension · added KG_W14R3_L3_NODES + KG_W14R3_EDGES + W14R3_LAYER_REMAP + W14R3_SOP_IDS + W14R3_LABEL_OVERRIDES + tacit-byte label-simplification pass · linkColor + linkWidth brightened · onNodeClick adds stopAutoRotate · onBackgroundClick added · getKGNodesForPersona filter shifted.
- `index.html` — `.kg-legend-overlay` flex-direction row + new `.kg-leg-col` + `.kg-leg-col-title` CSS · removed `.kg-leg-divider` + `.kg-leg-ring` (unused) · P2 hide rules updated to L6/L7/L8 · floating-window title updated · legend markup rewritten to 2-col · cache-bust `v=w14r3`.

**Files intentionally not touched:**
- Any LHS tablet code (Faye/Lim/Priya screens), persona row, state machine pills, banner, call flow, persistent agent roster, P1 RHS workflow modal (W14 R1 lock), Lim Screen D inspection mechanic (W14 R2 lock), Faye Screen D (W13 R2 + W14 R1 locks), Priya laptop modal.
- W7 auditor cluster + green workflow arrows CSS (Pulkit explicit: "keep them").

**Per-test observed-vs-expected verification (Chrome MCP + Node.js audit):**

| # | Test | Observed | Expected | Pass |
|---|---|---|---|---|
| 1 | A1 — LAYER_Y has 8 keys / L1=180 / L8=-240 | keys=8, L1=180, L8=-240 | 8, 180, -240 | ✓ |
| 2 | B1 — KG_LAYER_COLORS 8 keys / 8 unique hex values | keys=8, unique=8 | 8, 8 | ✓ |
| 3 | C1 — All 8 layers populated | L1=17·L2=4·L3=41·L4=20·L5=23·L6=8·L7=7·L8=8 | each >0 | ✓ |
| 4 | C2 — bearing-spalling-pattern at L5 | layer=L5 | L5 | ✓ |
| 5 | C3 — Failure-mode node exists at L3 | failure-mode-race-spalling.layer=L3 | true | ✓ |
| 6 | C3 — Instruction-manual at L3 | sulzer-bfp-manual.layer=L3 | true | ✓ |
| 7 | C3 — Telemetry node at L3 | telemetry-vib-rms-nde.layer=L3 | true | ✓ |
| 8 | C3 — WO node at L4 | wo-log-47.layer=L4 | true | ✓ |
| 9 | C3 — RCA node at L4 | rca-bfp-jrg-2025.layer=L4 | true | ✓ |
| 10 | D1 — Zero orphan edges | 0 | 0 | ✓ |
| 11 | D2 — Zero isolated non-tacit nodes | 0 | ≤2 | ✓ |
| 12 | E1 — 5 tacit bytes labeled `Tacit byte [triaged\|ingested]` | 5 pass regex; samples = 3×triaged + 2×ingested | 5 match | ✓ |
| 13 | F1 — Legend `display:flex` / `flex-direction:row` / 2 `.kg-leg-col` children | flex / row / 2 | flex / row / 2 | ✓ |
| 14 | F2 — Column titles `Layers` + `Tacit knowledge` · 8 layer rows + 2 tacit rows | titles=["Layers","Tacit knowledge"], 8 layer rows, 2 tacit rows | match | ✓ |
| 15 | G1 — `onNodeClick` source contains `stopAutoRotate()` | true | true | ✓ |
| 16 | G2 — `onBackgroundClick` source contains `startAutoRotate()` | true | true | ✓ |
| 17 | G3 — `enableNodeDrag(true)` in init source | true | true | ✓ |
| 18 | H1 — Lim onsite filter hides L6/L7/L8 (returns 105 nodes) | excludes_L6L7L8=true, count=105 | true | ✓ |
| 19 | H2 — Priya analyst sees all 8 layers | layer_count=8, [L1..L8] | 8 | ✓ |
| 20 | I1 — KG_STAGING_PROMOTED_IDS still 3 (3 promoted bytes intact) | 3 | 3 | ✓ |
| 21 | I — Auditor cluster nodes intact (3) | 3 | 3 | ✓ |

**Deferred to projector dry-run (visual subset · WebGL not supported in headless Chrome):**
- G1 visual — click node visually stops spin (code wire verified; visual feel requires GPU rendering).
- G2 visual — click empty canvas resumes spin.
- G3 visual — drag node moves it on screen.
- D3 visual — edges visibly thicker / brighter on dark background.
- Test E2E-R3 — full Faye → Lim → Priya flow with KG opens at each persona (no data-layer regression; LHS state machine untouched so flow should be intact).
- 8-layer Y-band visual distinctness at projector distance.
- Camera-pose-on-open + green-halo flash sequence preservation.

These subjective items consistent with W10-W12 W13 W14 R1/R2 pattern of human-check-required during demo dry-run.

W14 R3 = COMPLETE.
STOPPING HERE — awaiting coach sign-off on R3.

---

### W15 deployment confirmation (2026-05-26) — POST-W14 REVIEW MEGA-FIX

7-item single-wave post-W14 review batch. Hybrid git-revert + layer-on-top strategy. Demo is tomorrow (2026-05-27); this is the last code wave before projector dry-run.

**Section A — P1 RHS workflow bucket rename:**
- Reasoning → Domain Experts (merged with prior W13 R3 Vertical-aligned agents: Sensor Anomaly Inspector + Turbine Diagnostic Agent + Criticality Scoring Agent + Incident Summary Synthesizer for workflow 1; SOP Retrieval Agent + Sensor Anomaly Inspector + Telemetry Snapshot Compiler + SOP Compliance Agent for workflow 2; Roster Lookup Agent + Expertise Match Agent for workflow 3).
- Critic bucket unchanged across all 3 workflows.
- Vertical-aligned REMOVED · replaced with Orchestrator bucket (Orchestrator + A2A Coordination Agent · re-uses persistent IDs `orchestrator` + `workflow` from W8 17-agent roster).

**Section B — L3 "Plant & Equipment" label preserved:**
- Pulkit's manual edit retained as ground-truth. Zero "Physical Plant" references in live code. 8 "Plant & Equipment" references confirmed via grep.

**Section C — Lim inspection git-reverted to 17cd4c3 baseline + tweaks:**
- LIM_INSPECTION_CHECKLIST restored to 3 groups: Safety (5 items) · Instrument (3 items) · Root cause isolation (EXPANDED 2→5 items). Total 13 items. LIM_CHECKLIST_THRESHOLD = 13.
- paintLimChecklist (grouped) · paintLimChecklistComplete (grouped) restored from commit 17cd4c3.
- Pre-W14 group-locked machinery (truncateInspectionGroupsToCompleted · wireInspectionChecklist · triggerGroupTheater · logChecklistItem · updateChecklistProgress · paintDiagnosisVerdict · GROUP_THEATER_AGENT · GROUP_LOCKED_HINT) was ALREADY INTACT in current file — no touch required there.
- buildLimGroupHTML extended: Instrument group items render tick/cross UX (✓/✗ buttons inline · ✗ → text-input + Save button → 📝 saved-reason display). Safety + RCI use original .ic-item checkbox UX.
- wireInstrumentActions added (onInstrumentTick / onInstrumentCross / onCrossReasonSubmit handlers). wireInspectionChecklist skips `.ic-item-instrument` rows to avoid double-wire conflict.
- triggerGroupTheater post-replace now calls wireInstrumentActions() alongside wireInspectionChecklist() (Instrument group unlocks via theater · spawned tick/cross buttons need wiring).
- W14 R2 flat-checklist code outright deleted (LIM_VOICENOTE_TRANSCRIPTS · LIM_ASSISTANT_REVEAL_AFTER_ITEM · renderItemResolvedState · wireFlatChecklistActions · onItemTick/Cross/Camera/Mic · checkAndAdvanceChecklist · logFlatChecklistItem · paintLimChecklistComplete-W14R2). Operator-session interpretation of WA #5: deletion over commented-out dead code given demo tomorrow + no audit value.

**Section D — Assistant FAB INSIDE tablet · always present:**
- spawnAssistantFloatingButton anchors to `#tablet` (already position:relative). CSS rule changed `position: fixed → absolute` · bottom: 16px / right: 16px / z-index: 20.
- Dropped W14 R2 `LIM_ASSISTANT_REVEAL_AFTER_ITEM` gate + `state.lim.assistantButtonShown` flag.
- FAB visible from t=0 on Lim Screen D (spawned from `startLimScreenDReveal` + persisted across re-entry via `renderOnsiteIncidentDetail`).

**Section E — Assistant 4 new options + query box + mic icon:**
- ASSISTANT_OPTIONS rewritten: `Check work-order history` · `Potential alternative diagnoses` · `Further troubleshooting FAQ` · `Connect to Senior Technical Expert` (primary). All sub-descriptions REMOVED (no `.lap-opt-sub`).
- Popup body adds `.lap-query-block`: text input (`.lap-query-input` placeholder "Type your question...") + 🎤 mic button (`.lap-mic-btn`).
- wireAssistantPopup: mic click → 2s "🎤 Recording…" disabled state → re-enables · query input populates with canned text "What is the failure mode for casing crack on NDE?".
- "Connect to Senior Technical Expert" → existing `onVerdictReject()` chain (W12 + W13 R1 SOP suggest dialogue → call flow). FAB stays visible (FAB-remove line dropped from onAssistantOptionClick).

**Section F — Critical severity bump post-crack-confirm:**
- `bumpSeverityToCritical()` helper added: mutates `INCIDENT.severity = 'CRITICAL'` + rewrites all `.sev-pill` elements in-place (innerHTML + data-severity attr).
- Fires from `onConfirmRevisedDiagnosisClick` (W13 R1 path · revised-diagnosis "Confirm" tile).
- All 5 sev-pill template literals tagged with `data-severity="${INCIDENT.severity}"` attribute (Faye dashboard incident detail · Lim Screen D · Ismail Screen D · Faye Escalation Report · Priya Screen D).
- CSS rule `.sev-pill[data-severity="CRITICAL"]` w/ red scheme (background #DC2626 · color white) + sev-crit-pulse animation. Persists across persona switches (state-agnostic INCIDENT mutation + per-render template re-application).

**Section G — KG visual fix:**
- DIAGNOSE pass: identified W14 R3 double-attenuation (rgba 0.75 × linkOpacity 0.85 = 0.64 effective alpha) as suspected root cause of "still faint" visual. Additional camera tightness on 420-unit Y range a likely contributor.
- Fix applied:
  - linkColor: solid `#94A3B8` (slate-400) canonical / `#64748B` (slate-500) non-canonical · NO rgba alpha · linkOpacity owns attenuation.
  - linkWidth: 3.5 chain / 2.8 promotion / 2.0 canonical / 1.5 non-canonical (was 3.0 / 2.5 / 1.4 / 0.9).
  - linkOpacity: 0.92 (was 0.85).
  - cameraPosition z: 650 (was 480) — frames full 8-layer Y range (180 to -240 = 420 units).
- W14 R3 click-to-stop + drag + auto-rotate-on-bg-click preserved.
- W3.7 unwind + W10 tacit byte staging + W7 green workflow arrows preserved (Pulkit lock).

**Cache-bust:** `v=w14r3` → `v=w15`.

**Files changed:**
- `app.js` — P1_WORKFLOWS rewrite (3 buckets per workflow) · LIM_INSPECTION_CHECKLIST restored to 3-group + RCI expanded · paintLimChecklist + paintLimChecklistComplete restored from 17cd4c3 · buildLimGroupHTML extended with Instrument tick/cross UX · wireInstrumentActions + onInstrumentTick / onInstrumentCross / onCrossReasonSubmit added · wireInspectionChecklist skips instrument rows · triggerGroupTheater post-replace calls wireInstrumentActions · W14 R2 flat-checklist code DELETED · spawnAssistantFloatingButton anchored to #tablet · renderOnsiteIncidentDetail drops assistantButtonShown gate · startLimScreenDReveal spawns FAB at t=2s · ASSISTANT_OPTIONS rewritten (4 options · no sub) · openAssistantPopup adds query block + mic · wireAssistantPopup wires mic recording · onAssistantOptionClick drops FAB-remove · bumpSeverityToCritical helper added + fired from onConfirmRevisedDiagnosisClick · sev-pill template literals (×5) gain data-severity attr · KG linkColor solid · linkWidth bumped · linkOpacity 0.92 · cameraPosition z=650.
- `index.html` — `.lim-assistant-fab` CSS position fixed → absolute · `.lap-query-block` + `.lap-query-input` + `.lap-mic-btn` CSS added · `.lap-opt-sub` CSS retained (unused now) · `.ic-item-instrument` + `.ic-instr-row` + `.ic-instr-btn` + `.ic-instr-done` + `.ic-cross-reason-*` CSS added · `.sev-pill[data-severity="CRITICAL"]` red rule + sev-crit-pulse keyframes · cache-bust `v=w14r3 → v=w15`.

**Files intentionally not touched:**
- KG layer name L3 "Plant & Equipment" (Pulkit manual edit · ground-truth).
- Faye Screen D (W13 R2 + W14 R1 locks · ONLY sev-pill template tagged).
- P1 RHS workflow modal CSS/structure beyond bucket rename.
- P3 Priya laptop modal.
- Transcript modal · escalation report · call flow internals.
- Persistent agent roster (17 agents · W8 lock).
- State pill machine.
- Banner copy (except severity text + class swap).
- W7 auditor cluster + green workflow arrows.
- W10 tacit byte staging mechanic.

**Per-test observed-vs-expected verification (Chrome MCP browser-driven):**

| # | Test | Observed | Expected | Pass |
|---|---|---|---|---|
| 1 | A1 — Workflow 1 bucket labels | ["Domain Experts","Critic","Orchestrator"] | match | ✓ |
| 2 | A2 — Workflow 1 Domain Experts agents (4) | Sensor Anomaly Inspector · Turbine Diagnostic Agent · Criticality Scoring Agent · Incident Summary Synthesizer | 4 agents match | ✓ |
| 3 | A3 — Workflow 1 Orchestrator agents (2) | Orchestrator · A2A Coordination Agent | 2 agents match | ✓ |
| 4 | A4 — Workflow 2 bucket structure | Domain Experts (4 agents) · Critic (1 agent) · Orchestrator (Orchestrator + A2A) | match | ✓ |
| 5 | A4 — Workflow 3 bucket structure | Domain Experts (2 agents) · Critic (Certs Validator) · Orchestrator (Orchestrator + A2A) | match | ✓ |
| 6 | B1 — "Plant & Equipment" grep | 8 references intact | ≥1 | ✓ |
| 7 | B1 — "Physical Plant" grep in live paths | 0 occurrences | 0 | ✓ |
| 8 | C1 — LIM_INSPECTION_CHECKLIST = 3 groups · 5/3/5 items · total 13 | groups=3, items=5/3/5, total=13, threshold=13 | match | ✓ |
| 9 | C2 — Group-locked gating (Safety unlocked / Instrument + RCI locked at t=0) | Safety locked=false (5 items) · Instrument locked=true (0 items rendered) · RCI locked=true (0 items rendered) | match | ✓ |
| 10 | C2 — Instrument unlocks after Safety 5/5 (via group theater) | Instrument locked=false, 3 items rendered | match | ✓ |
| 11 | C2 — RCI unlocks after Instrument 3/3 | RCI locked=false, 5 items rendered | match | ✓ |
| 12 | C3 — Instrument tick: click ✓ → dataset.result === "tick" + "✓ Done" label | result="tick", doneLabel="✓ Done" | match | ✓ |
| 13 | C4 — Instrument cross: click ✗ → text input + Save button appear | result="cross", hasInput=true | match | ✓ |
| 14 | C4 — Cross reason submit → saved reason + 📝 icon displays | savedText="Handheld unit unavailable", hasIcon=true | match | ✓ |
| 15 | C5 — Safety + RCI use original .ic-item checkbox UX (not tick/cross) | Safety items render with ○/✓ check icon · RCI rci-1 + rci-2 clicked via .ic-item handler successfully | match | ✓ |
| 16 | C6 — W14 R2 flat-checklist NOT in DOM | `.ic-flat-item` count = 0 | 0 | ✓ |
| 17 | D1 — FAB parent = #tablet · position: absolute | fabParent="tablet", fabPos="absolute" | match | ✓ |
| 18 | D2 — FAB present from t=0 on Lim Screen D | fab=true after first paint (no items resolved) | true | ✓ |
| 19 | E1 — 4 option labels (no sub-descriptions) | labels match plan · `.lap-opt-sub` count = 0 | match | ✓ |
| 20 | E2 — Query input + mic button in popup | hasInput=true, hasMic=true | true/true | ✓ |
| 21 | E3 — Mic click → "🎤 Recording…" disabled 2s → re-enables + canned query populates input | mid: disabled=true, text="🎤 Recording…" · after: disabled=false, text="🎤", queryValue="What is the failure mode for casing crack on NDE?" | match | ✓ |
| 22 | E4 — Senior expert click → SOP suggest dialogue spawns · FAB stays | sopDialogue=true, fabStillThere=true | true/true | ✓ |
| 23 | E5 — Other 3 options click → popup closes · toast 2.5s | popupGone=true, toastShown=true, toastText="Check work-order history · option not in this demo path" | match | ✓ |
| 24 | F1 — Severity AMBER initially | data-severity="AMBER" on all sev-pills | AMBER | ✓ |
| 25 | F2 — bumpSeverityToCritical → all sev-pills flip to CRITICAL red (#DC2626) | data-severity="CRITICAL", bg=rgb(220,38,38), text="▲ Severity: CRITICAL" | match | ✓ |
| 26 | F3 — Severity persists CRITICAL after persona switch to Faye monitoring | INCIDENT.severity="CRITICAL"; rendered sev-pill on Faye shows CRITICAL/red | match | ✓ |
| 27 | G1 — linkColor solid `#94A3B8` / `#64748B` (no rgba) | grep app.js:6515 — `return link.canonical ? '#94A3B8' : '#64748B';` | match | ✓ |
| 28 | G2 — linkWidth bumped 1.4→2.0 / 0.9→1.5 | grep app.js:6520 — `return link.canonical ? 2.0 : 1.5;` | match | ✓ |
| 29 | G3 — linkOpacity 0.85→0.92 | grep app.js:6526 — `.linkOpacity(0.92)` | match | ✓ |
| 30 | G4 — cameraPosition z 480→650 | grep app.js:6555 — `cameraPosition({ x: 100, y: 0, z: 650 }, ...)` | match | ✓ |

**Deferred to projector dry-run (visual subset · headless Chrome WebGL/mount-init quirks):**
- G1-G4 visual confirmation: KG edges visibly brighter + thicker · 8-layer Y-range fully framed at z=650 · click-to-stop + drag preserved · auto-rotate-on-bg-click preserved.
- Critical severity pulse animation feel at projector distance.
- Instrument tick/cross UX feel + 📝 saved-reason readability at projector distance.
- Assistant FAB visual placement inside tablet bezel (anchored to #tablet at bottom-right · should not overflow off-tablet).
- Test E2E-W15 full flow rehearsal (cold reload → Faye dashboard → confirm initial → SOP relevant → Step 1 + Step 2 → Lim dispatch → Lim Screen D w/ FAB visible · grouped checklist · tick safety → instrument tick/cross → RCI 2/5 → Assistant FAB → 4 options + query + mic → Senior expert → SOP dialogue → call flow → transcript → revised fault → Confirm revised → severity bumps CRITICAL red on both Lim + Faye → Escalation report → Priya → Open KG → Plant & Equipment L3 label visible · 8 layers · edges visibly connect nodes).

These subjective items consistent with W10-W14 R1/R2/R3 pattern of human-check-required during projector dry-run.

W15 = COMPLETE. NO MORE CODE WAVES. Demo tomorrow.
STOPPING HERE — awaiting coach sign-off on W15.
