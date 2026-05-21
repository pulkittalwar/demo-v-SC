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
| **SCENARIO** | Jurong-CCGT-1, Block 2 — GT exhaust temperature spread widening + heat rate drift. KG-traced upstream to compressor fouling correlated with last 90 days ambient humidity profile. Single canonical happy-path incident driving the demo end-to-end across all 4 personas. |
| **BRAND_COLOR** | Sembcorp green `#00A651` used as ACCENT (chips, borders, headers, icons, status pills). Stage background = WHITE / very light grey. Tablet content = light theme. Right pane = light grey surface (NOT black). NO black backgrounds anywhere. Brand green is the chromatic identity, not the dominant fill. |

## Vocabulary discipline (HARD)

Use only canonical Sembcorp / P&U industrial vocabulary:

- **Equipment**: GT (gas turbine), CCGT (Combined Cycle Gas Turbine), HRSG (Heat Recovery Steam Generator), boiler feed pump, condenser, cooling tower, generator, transformer, switchyard, GT exhaust temperature, condenser vacuum, fuel gas pressure, heat rate (kJ/kWh)
- **Metrics**: MW output, heat rate, availability factor, capacity factor, EAF (Equivalent Availability Factor), forced outage rate
- **Plant IDs**: Jurong-CCGT-1, Jurong-CCGT-2, Sakra-CCGT-1, Banyan-CHP, Tuas-Power
- **Standards**: IEEE 1159 (power quality), ISO 50001 (energy management), IEC 61850 (substation automation), NERC reliability standards
- **Vendors**: GE 9HA gas turbines, Siemens SGT-800, Mitsubishi Power M701F, ABB drives, Honeywell Experion DCS, Emerson Ovation, OSIsoft PI System
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

Hardcoded KG content for this demo: pre-seed with Jurong-CCGT-1 asset chain (GT-3 → HRSG-3 → BFP-3A/3B → Condenser-3 → Generator-3 → Transformer-3 → Switchyard), 90 days of GT-3 exhaust temperature spread history, 3 prior compressor-fouling RCAs from the Sembcorp fleet, 1 predictive fouling model. ~30-40 nodes total. Demo-scope only — not a real KG.

## Agent + critic mechanics (locked, expanded 2026-05-20)

Architecture mirrors `briefing/overview_hyperspace_os.png`. Agents bucketed against Sembcorp business structure (Orchestration + Reasoning + BU-vertical Critique + Cross-functional Validation), **10 agents total** (expanded from 9 — Inspection Agent added per architecture pivot 2026-05-20).

- **Orchestrator** (always-on, steering). Receives Inspection Agent findings, dispatches downstream sub-agents per workflow, sequences persona handoffs, receives findings back, decides next step.
- **Reasoning agents** (cross-cutting, transient):
  - **Inspection Agent** (added 2026-05-20). Runs FIRST when a sensor anomaly fires. Retrieves sensor metadata, locates sensor's node on the KG, traverses cross-layer (L2 own-layer → L3 historical → L4 predictive → L1 people/process) to surface implications. Passes findings to Orchestrator. This is the "chain-of-thought supercharged by KG node traversal" agent — the unique demo unlock vs vanilla LLM reasoning. Data sources tagged inline in dispatch log: `[OSIsoft PI System]`, `[Maximo]`, `[Honeywell Experion DCS]`, `[Hyperspace UI]`. Role label `KG-LOOKUP`.
  - **Triage Agent** (diagnosis). Pattern-matches against prior RCAs, produces diagnosis hypothesis with confidence %.
  - **Playbook Agent** (remediation). Matches diagnosis to OEM remediation playbook (e.g. compressor wash cycle per GE 9HA manual).
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
| 1 | `TRIAGING` | Initial P1 entry; Inspection + Triage agents running |
| 2 | `REVIEW READY` | Triage Agent + Power Gen Critic complete; diagnosis surfaced |
| 3 | `DISPATCHED TO ONSITE` | P1 clicks dispatch CTA |
| 4 | `ONSITE VERIFYING` | P2 entry; verification checklist active |
| 5 | `DIAGNOSIS CONFIRMED` | P2 clicks Confirm Diagnosis terminal action |
| 6 | `AWAITING EXPERT` | Persona handed off to P3 |
| 7 | `CAPACITY IMPACT — REQUIRES ROUTING` | P3 escalates back to P1 |
| 8 | `ROUTED TO ASSET PERF` | P1 re-engagement; routes to P4 |
| 9 | `HEDGED / CLOSED` | P4 approves hedge + Learning Engine writeback complete |

Pill style: small rounded chip, mono font, contextual color (TRIAGING amber-pulse, REVIEW READY teal, DISPATCHED green, CAPACITY IMPACT amber-bold, HEDGED green-solid). Severity AMBER pill renders to its LEFT, persistent.

## Canonical scenario — layered with IGV root cause (locked 2026-05-20)

Surface story stays: GT-3 exhaust temp spread widening + heat rate drift → compressor fouling correlated with 90-day humidity profile. Layered root cause adds depth for P3/P4 narrative:

- **Surface diagnosis (P1 Triage Agent)**: compressor fouling, humidity-correlated. Confidence ~78%. Recommendation: compressor wash cycle.
- **P2 Onsite verification deepens it**: engineer's IGV position check reveals actuator drift (~3° off command). Wash cycle alone will NOT restore compressor pressure ratio because the fouling pattern is being driven in part by IGV-induced airflow irregularity. Real remediation requires IGV-3 actuator replacement.
- **P3 Offsite consequence**: IGV actuator replacement requires hot shutdown ~6h on GE 9HA (standard hot-section job). PSO commitment window 09:00–18:00 SGT (9h). Shutdown bites into 6h of dispatch capacity = ~50 MW deficit for the bulk of the window. **Sakra-CCGT-1 standby unit** is offline but could ramp in 4h — would only cover the tail 2h. Standby engagement decision: DECLINE (ramp too slow to bridge gap). Approve IGV replacement WO. Escalate capacity impact back to P1.
- **P1 re-engagement**: incident reopens with new `CAPACITY IMPACT` state. Operator routes to Asset Perf.
- **P4 financial action**: 50 MW × 4h shortfall after Sakra ramp covers tail 2h. Forwards/futures hedge bought at prevailing wholesale price. Learning Engine writes refined pattern back to KG L4: "humidity-fouling + IGV-drift co-factor — revised confidence model".

Why IGV actuator drift is the right root-cause choice (Joubert / Asherson pattern-match):
- IGV (Inlet Guide Vane) actuators are documented wear-and-tear failure mode on F-class heavy-duty gas turbines (GE 9HA, Siemens SGT-5, Mitsubishi M701F)
- Actuator drift exacerbating compressor fouling is a known mechanism (compressor stage loading non-uniformity → airflow irregularity → fouling acceleration)
- ~6h hot-section replacement on GE 9HA is plausible (Joubert ran Alstom Power; Asherson ran Rolls-Royce SEA — both will recognize the timeline as realistic)
- Standby unit ramp time + commitment window math creates a genuine financial decision point, not a contrived escalation

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
