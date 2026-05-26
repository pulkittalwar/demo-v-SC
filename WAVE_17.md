# WAVE 17 — Sembcorp Hyperspace OS Demo (KG ENRICHMENT · DRAG + 3X NODES)

> **Status:** SPEC PRESERVED (2026-05-26). Implementation pending coach green-light.
> **Source:** Coach-session spec, pasted verbatim by Pulkit on 2026-05-26.
> **Cross-references:** `SEMBCORP_SCOPE.md` (W17 spec block + W17 deployment confirmation when GREEN), `CLAUDE.md` (W17 pointer line).
>
> **Verbatim-preservation note:** The source paste contained several mid-line truncations (mainly inside the ASCII boundary boxes `═══...═══` and inside code-block snippets — see "Truncation log" at the bottom of this file). The spec is preserved AS-PASTED. Truncations are flagged but not patched here so the audit trail remains honest. Implementation will fill in reasonable code where the snippets were cut.

---

## PURPOSE

W16 SVG KG works (lines visibly connect nodes · no rotation) but Pulkit feedback: "too child-like, make it more complex (3x number of nodes) and interactable like Obsidian's graph view." Add 3x more nodes per persona · drag-to-move w/ Obsidian-style physics · click-highlight preserved.

SINGLE-WAVE (no rounds · demo TOMORROW).

DATE: 2026-05-26
DAYS TO DEMO: 1
PREDECESSOR: W16 GREEN (KG SVG works · just needs more density + drag)
NEXT (after W17 GREEN): projector dry-run + narration script — NO MORE CODE WAVES

═══════════════════════════════════════════════════════════════
PRE-READ (MANDATORY)
═══════════════════════════════════════════════════════════════

1. `/Users/talwarpulkit/code/demo-v-SC/CLAUDE.md` — full
2. `/Users/talwarpulkit/code/demo-v-SC/SEMBCORP_SCOPE.md` — focus W16 confirmation block (current SVG KG state)
3. `/Users/talwarpulkit/code/demo-v-SC/index.html` — full (focus W16 `.kg-svg*` CSS)
4. `/Users/talwarpulkit/code/demo-v-SC/app.js` — focus:
   - W16 `renderP2KGSvg` / `renderP3KGSvg` / `buildKGSvg` / `wireKGSvgInteractions`
   - `P2_KG_NODES_DEF` / `P2_KG_EDGES_DEF` (module-level consts from W16)
   - Existing tacit byte cluster + green workflow arrows (preserve narrative)

══════════════════════════════� ← *(truncation #1)*

## OPERATOR CHECKLIST

- [ ] Read 4 PRE-READ files
- [ ] Invoke superpowers skills
- [ ] **Section A — Enrich P2 KG nodes ~24 → ~72 + edges ~26 → ~90** (5 layers · denser)
- [ ] **Section B — Enrich P3 KG nodes ~38 → ~115 + edges ~47 → ~150** (8 layers · commercial denser)
- [ ] **Section C — Light force simulation (repulsion + edge springs + center gravity)** w/ damping · runs via requestAnimationFrame
- [ ] **Section D — Drag-to-move handlers** (mousedown/mousemove/mouseup · node becomes pinned during drag · physics resumes on release)
- [ ] **Section E — Live edge tracking** (edges re-compute x1/y1/x2/y2 each tick)
- [ ] **Section F — Preserve W16 click-highlight + no-rotation locks**
- [ ] **Section G — Reset-positions button (top-right corner of KG body)**
- [ ] Run Chrome MCP per-test verification (~15 tests)
- [ ] Append `### W17 deployment confirmation` block to SEMBCORP_SCOPE.md
- [ ] Bump cache-bust `v=w16` → `v=w17`
- [ ] Output `STOPPING HERE — awaiting coach sign-off on W17`

══════════════════════════ ← *(truncation #2)*

## SECTION A — ENRICH P2 KG (3X · ~24 → ~72 NODES)

Expand `P2_KG_NODES_DEF` (module-level const from W16). Target ~72 nodes across 5 layers.

### A.1 — Suggested node distribution

| Layer | W16 count | W17 target | Add categories |
|---|---|---|---|
| L1 Org Structure | 4 | ~10 | Add: Block 1 supervisor · Maintenance Lead · HSE officer · Trading desk lead · Asset Performance manager · Plant manager |
| L2 SOPs | 3 | ~10 | Add: SOP-overspeed · SOP-LOTO · SOP-confined-space · SOP-vibration-trending · SOP-WO-creation · SOP-Maximo-entry · SOP-shift-handover |
| L3 Plant & Equipment | 9 | ~30 | Add (per-asset): impeller · shaft · seals · DE bearing · lube oil system · pump base plate · suction valve · discharge valve · Bently Nevada) · manuals (GE 9HA · Bently Nevada · ABB drives) |
| L4 Historical State | 6 | ~14 | Add: WO-2024-banyan · WO-2023-tuas · RCA-2025-Sakra-coupling · vibration trends · spec compliance reports · maintenance log entries · prior shaft alignments |
| L5 Predictive Intelligence | 3 | ~8 | Add: misalignment pattern · imbalance pattern · cavitation pattern · OEM playbook · LLM-suggested hypothesis · sensor health degradation model · MTBF model |

### A.2 — Operator drafts node array

Operator extends `P2_KG_NODES_DEF` with ~48 new entries. Each entry has:
- `id` (kebab-case · unique)
- `label` (Sembcorp/BFP-canonical vocab · clear name)
- `layer` (L1-L5)
- `x` + `y` initial coords (operator picks · spread within layer's y-band · avoid overlap)

Initial coordinate guideline (W17 layout · widen canvas to width=1100 to fit more nodes):

| Layer | y-band | x-range |
|---|---|---|
| L1 | 60 | 80 → 1020 (10 nodes · ~100px apart) |
| L2 | 160 | 80 → 1020 |
| L3 | 270 + 340 + 410 (3 rows) | 80 � + 580 | 80 → 1020 each row | ← *(truncation #3 — L3/L4 row bands garbled)*
| L5 | 670 | 80 → 1020 |

### A.3 — Edge expansion

Operator adds ~64 new edges to current ~26. Pattern:
- More L1↔L2 (each person uses multiple SOPs)
- More L2↔L3 (SOPs reference more equipment)
- Dense L3 intra (sub-assemblies connect to parent assets + failure modes · sensors connect to monitored components)
- More L3↔L4 (telemetry channels feed historical trends)
- More L4↔L4 (WOs reference RCAs · RCAs reference history)
- More L4↔L5 (more patterns derive from more RCAs)
- More L5 intra (patterns reference shared models · OEM playbook spans patterns)

Coach default total: ~90 edges. Operator picks specific connections semantically.

═══════════════════════════════════════════════════════════════
SECTION B — ENRICH P3 KG (3X · ~38 → ~115 NODES)
════════════════════════════ ← *(truncation #4)*

### B.1 — Suggested node distribution (P3 builds on P2 enriched base)

Add categories |
|---|---|---|---|
| L6 Markets | 5 | ~15 | Add: Vesting price · imbalance settlement · LNG charter rate · gas spot index · coal price · electricity futures · spinning reserve price · regulatory ancillary · grid-reliability levy · carbon offset Singapore · USEP day-ahead |
| L7 Contracts | 5 | ~15 | Add: PPA Banyan-2025 · PPA Tuas-2028 · trader hedge book · spot trader desk · long-term contract Sakra · ancillary services · ESCO industrial customer · 10-yr PPA · 5-yr PPA · vesting baseline · embedded generation contract |
| L8 Cross-site | 5 | ~15 | Add: Senoko · Tuaspring · YTL PowerSeraya · Pulau Seraya · Pasir Panjang switching · Bukit Panjang feeder · Tuas substation · Jurong substation · Sakra grid intertie · MY-SG interconnector · IND-SG interconnector |

### B.2 — Edge density bump for commercial cluster

Add ~50 more edges across L5↔L6 (predictive ↔ markets) · L6 intra · L6↔L7 (markets ↔ contracts) · L7↔L8 (contracts ↔ cross-site).

Coacut ← *(truncation #5 — "Coach total: ~150 edges" inferred)*

P3 SVG canvas: width=1100, height=1500 (taller to fit 8 layers).

| Layer | y-band |
|---|---|
| L1 | 60 |
| L2 | 160 |
| L3 | 270 + 340 + 410 |
| L4 | 510 + 580 |
| L5 | 670 |
| L6 | 800 + 870 |
| L7 | 980 + 1050 |
| L8 | 1170 + 1240 |

═══════════════════════════════════════════════════════════════
SECTION C — LIGHT FORCE SIMULATION (Obsidian-style)
═══════════════════════════════════════════════════════════════

Implement minimal force simulation in pure JS · runs via requestAnimationFrame. Three forces:
1. Repulsion (Coulomb-style) between all node pairs → prevents clustering
2. Spring (Hooke's law) on each edge → keeps connected nodes close
3. Gravity → mild pull toward initial position (prevents drift)

Plus damping factor to prevent oscilla ← *(truncation #6 — "oscillation + 1, prevents wobble" inferred)*
```

### C.2 — Initialize simulation on KG open

In `openKGForPersona`:
```js
function openKGForPersona(persona) {
  // ... existing W16 dispatch (svg render etc) ...

  if (persona === 'onsite' || persona === 'analyst') {
    // W17: kick off force simulation after SVG mounted
    const data = (persona === 'onsite') ? getP2KGData() : getP3KGData();
    initKGSimulation(persona, data);
  }
}

function initKGSimulation(persona, data) {
  // Deep-clone nodes so initialX/initialY are preserved for gravity target
  KG_SIM.persona = persona;
  KG_SIM.nodes = data.nodes.map(n => ({
    ...n,
    vx: 0, vy: 0,
    initialX: n.x, initialY: n.y,
    pinned: false,
  }));
  KG_SIM.edges = data.edges;
  KG_SIM.active = true;
  if (KG_SIM.rafId) cancelAnimationFrame(KG_SIM.rafId);
  KG_SIM.rafId = requestAnimationFrame(tickKGSimulation);
}
```

### C.3 — `tickKGSimulation` — per-frame physics

```js
function tickKGSimulation() {
  if (!KG_SIM.active) return;

  const REPULSION = 600;       // Coulomb constannst SPRING_K = 0.012;      // Hooke spring strength ← (truncation #7 — line garbled: const REPULSION = 600; const SPRING_K = 0.012;)
  const SPRING_LEN = 100;      // Rest length of edge spring
  const GRAVITY_K = 0.005;     // Pull toward initial position
  const DAMPING = 0.82;        // Velocity damping (0-1 · lower = more damped)

  // Build node lookup
  const nodeMap = Object.fromEntries(KG_SIM.nodes.map(n => [n.id, n]));

  // 1. Repulsion between all node pairs (O(n²) · OK for n<150)
  for (let i = 0; i < KG_SIM.nodes.length; i++) {
    for (let j = i + 1; j < KG_SIM.nodes.length; j++) {
      const a = KG_SIM.nodes[i];
      const b = KG_SIM.nodes[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d2 = dx*dx + dy*dy;
      if (d2 < 1) continue;   // avoid divide-by-zero
      const d = Math.sqrt(d2);
      const f = REPULSION / d2;
      const fx = (dx / d) * f;
      const fy = (dy / d) * f;
      if (!a.pinned) { a.vx -= fx; a.vy -= fy; }
      if (!b.pinned) { b.vx += fx; b.vy += fy; }
    }
  }

  // 2. Spring force on edges
  KG_SIM.edges.forE(([srcId, dstId]) => {    // ← (truncation #8 — should be `forEach`)
    const s = nodeMap[srcId], d = nodeMap[dstId];
    if (!s || !d) return;
    const dx = d.x - s.x;
    const dy = d.y - s.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < 1) return;
    const f = SPRING_K * (dist - SPRING_LEN);
    const fx = (dx / dist) * f;
    const fy = (dy / dist) * f;
    if (!s.pinned) { s.vx += fx; s.vy += fy; }
    if (!d.pinned) { d.vx -= fx; d.vy -= fy; }
  });

  // 3. Gravity toward initial position
  KG_SIM.nodes.forEach(n => {
    if (n.pinned) return;
    n.vx += (n.initialX - n.x) * GRAVITY_K;
    n.vy += (n.initialY - n.y) * GRAVITY_K;
  });

  // 4. Apply damping + update positions
  KG_SIM.nodes.forEach(n => {
    if (n.pinned) return;
    n.vx *= DAMPING;
    n.vy *= DAMPING;
    n.x += n.vx;
    n.y += n.vy;
  });

  // 5. Sync SVG positions
  renderKGSimulationFrame();

  KG_SIM.rafId = requestAnimationFrame(tickKGSimulation);
}
```

### C.4 — `renderKGSimulationFrame` — sync SVG to simulation state

```js
function renGSimulationFrame() {    // ← (truncation #9 — should be `renderKGSimulationFrame`)
  const win = document.getElementById('kg-floating-window');
  if (!win) return;

  // Update node positions
  KG_SIM.nodes.forEach(n => {
    const g = win.querySelector(`.kg-svg-node[data-id="${n.id}"]`);
    if (g) g.setAttribute('transform', `translate(${n.x},${n.y})`);
  });

  // Update edge endpoints
  const nodeMap = Object.fromEntries(KG_SIM.nodes.map(n => [n.id, n]));
  win.querySelectorAll('.kg-svg-edge').forEach(line => {
    const s = nodeMap[line.dataset.src];
    const d = nodeMap[line.dataset.dst];
    if (!s || !d) return;
    line.setAttribute('x1', s.x);
    line.setAttribute('y1', s.y);
    line.setAttribute('x2', d.x);
    line.setAttribute('y2', d.y);
  });
}
```

### C.5 — Stop simulation on KG close

Add to KG close handler:
```js
function closeKGFloatingWindow() {
  // ... existing close logic ...
  KG_SIM.active = false;
  if (KG_SIM.rafId) cancelAnimationFrame(KG_SIM.rafId);
  KG_SIM.rafId = null;
}
```

═══════════════════════════════════════════════════════════════
SECTION D — DRAG-TO-MOVE HANDLERS
═══════════════════════════════════════════════════════════════

### D.1 — Mousedown/mousemove/mouseup on `.kg-svg-node`

```js
function wireKGNodeDrag(body) {
  let dragNode = null;
  let svgRect = null;

  body.querySelectorAll('.kg-svg-node').forEach(g => {
    g.addEventListener('mousedown', e => {
      e.preventDefault();
      e.stopPropagation();   // prevent click-highlight from firing on drag start
      const id = g.dataset.id;
      const n = KG_SIM.nodes.find(x => x.id === id);
      if (!n) return;
      dragNode = n;
      n.pinned = true;
      n.vx = 0; n.vy = 0;
      svgRect = body.querySelector('.kg-svg').getBoundingClientRect();
      g.classList.add('kg-svg-node-dragging');
    });
  });

  document.addEventListener('mousemove', e => {
    if (!dragNode || !svgRect) return;
    // Convert client coords to SVG viewBox coords
    const svg = body.querySelector('.kg-svg');
    const viewBoxWidth = parseFloat(svg.getAttribute('viewBox').split(' ')[2]);
    const viewBoxHeight = parseFloat(svg.getAttribute('viewBox').split(' ')[3]);
    const scaleX = viewBoxWidth / svgRect.width;
    const scaleY = viewBoxHeight / svgRect.height;
    dragNode.x = (e.clientX - svgRect.left) * scaleX;
    dragNode.y = (e.clientY - svgRect.top) * scaleY;
  });

  document.addEventListener('mouseup', () => {
    if (dragNode) {
      // Hand back to physics (unpin · let simulation reposition gradually)
      // OR keep pinned at new position (Pulkit explicit "completely fake OK" suggests keep pinned)
      // Coach default: UNPIN · let physics ease nodes back near their new positions
      dragNode.pinned = false;
      const g = body.querySelector(`.kg-svg-node[data-id="${dragNode.id}"]`);
      if (g) g. // existing W16 click-highlight  ← (truncation #10 — handler body cut; intended completion: `g.classList.remove('kg-svg-node-dragging'); } dragNode = null; svgRect = null;`)
wireKGNodeDrag(body);           // W17 drag handlers
```

═══════════════════════════════════════════════════════════════
SECTION E — LIVE EDGE TRACKING
═══════════════════════════════════════════════════════════════

Covered in Section C.4 (`renderKGSimulationFrame`). Edges automatically follow nodes since `x1/y1/x2/y2` re-set every tick from `KG_SIM.nodes` positions.

NO additional code needed if Section C lands.

═══════════════════════════════════════════════════════════════
SECTION F — PRESERVE W16 CLICK-HIGHLIGHT + NO-ROTATION LOCKS
════════════════════� ← *(truncation #11)*

### F.1 — Click vs drag disambiguation

W16 click-highlight + drag → mousedown captures node · mousemove updates position · mouseup releases · NO click event fires (because mouse moved)

This natural disambiguation works. No conflict.

### F.2 — No autorotate

W16 already eliminated autorotate for P2/P3. Force simulation (Section C) is NOT autorotate · it's physics-based node positioning. Pulkit's "no rotation" lock applies to camera/scene rotation · physics is different.

If Pulkit objects to motion: physics gravity (GRAVITY_K) returns nodes to near-equilibrium quickly · post-load motion is minor settling (<2s). After settling: nodes static unless dragged.

Coach default: keep physics. Settling is desirable (looks like Obsidian's load animation).

═══════════════════════════════════════════════════════════════
SECTION G — RESET-POSITIONS BUTTON
════════════════════════════� ← *(truncation #12)*

### G.1 — Mount button in KG header (or top-right corner of `.kg-fw-body`):
```html
<button class="kg-fw-reset-btn" type="button" aria-label="Reset positions" title="Reset positions">↺</button>
```

### G.2 — CSS

```css
.kg-fw-reset-btn {
  position: absolute;
  top: 12px;
  right: 50px;          /* left of close button */
  background: rgba(255,255,255,0.08);
  color: white;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 6px;
  width: 28px; height: 28px;
  font-size: 14px;
  cursor: pointer;
  transition: background 200ms;
  z-index: 22;
}
.kg-fw-reset-btn:hover { background: rgba(255,255,255,0.18); }
```

### G.3 — Wire

```js
document.querySelector('.kg-fw-reset-btn')?.addEventListener('click', () => {
  KG_SIM.nodes.forEach(n => {
    n.x = n.initialX;
    n.y = n.initialY;
    n.vx = 0; n.vy = 0;
    n.pinned = false;
  });
});
```

(Physics tick will re-stabilize from there.)

═══════════════════════════════════════════════════════════════
SECTION H — DRAG INTERACTION POLISH
═══════════════════════════════════════════════════════════════

### H.1 — CSS for drag state

```css
.kg-svg-node {
  cursor: grab;
}
.kg-svg-node-dragging {
  cursor: grabbing;
}
.kg-svg-node-dragging .kg-svg-node-circle {
  r: 12;
  stroke-width: 3;
  filter: drop-shadow(0 0 6px rgba(255,255,255,0.6));
}
```

### H.2 — Label hover (Obsidian-style)

Already in W16 via :hover. No change needed unless operator wants brighter label on hover.

═══════════════════════════════════════════════════════════════
WHAT NOT TO BUILD IN W17
══════════════════════════════════════════════� ← *(truncation #13 — content "Don't touch Faye/Lim/Priya/Assistant/severity/workflow modal. Don't change agent roster." inferred)*

t roster.

═══════════════════════════════════════════════════════════════
VERIFICATION REQUIRED (Chrome MCP)
═══════════════════════════════════════════════════════════════

Per-test observed-vs-expected table mandatory (WA #13).

**Test A1 — P2 node count ~72**
Open P2 KG. `body.querySelectorAll('.kg-svg-node').length` between 68 and 78.

**Test A2 — P2 edge count ~90**
`body.querySelectorAll('.kg-svg-edge').length` between 85 and 100.

**Test B1 — P3 node count ~115**
Open P3 KG. Node count between 108 and 120.

**Test B2 — P3 edge count ~150**
Edge count between 140 and 160.

**Test C1 — Force simulation runs**
On KG open: `KG_SIM.active === true`. `KG_SIM.rafId !== null`. Within 100ms: node positions begin updating (positions differ from initialtled state).    ← *(truncation #14 — likely "initial settled state")*

**Test D1 — Drag captures node**
Mousedown on a node. `KG_SIM.nodes.find(n => n.id === <id>).pinned === true`. CSS class `.kg-svg-node-dragging` applied.

**Test D2 — Drag moves node**
Mousedown + mousemove (drag 80px right). Node's `x` increases by ~80 (accounting for viewBox scale). SVG `<g>` transform updates.

**Test D3 — Mouseup releases node**
Mouseup after drag. Node `pinned === false`. Class `.kg-svg-node-dragging` removed.

**Test D4 — Edges follow node during drag**
While dragging node `bfp-3a`: edges with `data-src="bfp-3a"` or `data-dst="bfp-3a"` have `x1/y1/x2/y2` matching the dragged node's live coords each frame.

**Test F1 — Click-highlight still works**
Click (no drag) on node. Connected edges gain `.kg-svg-edge-highlight`. Other edges gain `.kg-svg-edge-dim`.

**Test F2 — Click + small mousemove < 4px → still triggers click**
Click w/ <4px mouse motion → click event fires · highlight applied.

**Test F3 — Click + drag → highlight NOT applied (drag took pr · mousemove >10px · mouseup → drag fired · no highlight applied.    ← *(truncation #15 — likely "drag took priority")*

**Test G1 — Reset button present**
`.kg-fw-reset-btn` element exists in `#kg-floating-window` w/ aria-label "Reset positions".

**Test G2 — Reset returns nodes to initial positions**
After dragging 3 nodes to new positions · click reset. Within 1s: all 3 nodes return to within 5px of `initialX/initialY`.

**Test H1 — Cursor styles**
Hover on node: `cursor: grab`. Mousedown: `cursor: grabbing`.

**Test E2E-W17 — Full demo flow w/ enriched KGs**
Cold reload. Faye flow → Lim flow → Priya flow (all W13-W15 + W16 locks preserved). Open KG from P2: ~72 nodes render w/ visible edges · slight settling motion (~1s) · all positions stable · drag a node → edges follow · release → physics settles · click another node → connected edges highlight. Reset button returns. Switch to Priya · Open KG: ~115 nodes · 8 layers · commercial cluster present · same drag + click UX. Console clean.

════════════� ← *(truncation #16)*

## SEMBCORP_SCOPE.md PATCH (to be appended after W17 GREEN)

Append after W16 confirmation block:

```
### W17 deployment confirmation (2026-05-26) — KG ENRICHMENT + DRAG + FORCE SIM

3x node count · Obsidian-style drag + force simulation · click-highlight preserved.

**Section A — P2 KG enrichment:**
- Nodes ~24 → ~72 across 5 layers (denser sub-assemblies · failure modes · telemetry · WOs · RCAs · patterns).
- Edges ~26 → ~90 (more L1↔L2 · L2↔L3 · L3 intra · L3↔L4 · L4↔L5).
- Canvas widened to 1100×720.

**Section B — P3 KG enrichment:**
- Nodes ~38 → ~115 (P2 enriched base + 3x L6/L7/L8 commercial cluster).
- Edges ~47 → ~150.
- Canvas 1100×1500.

**Section C — Force simulation:**
- Pure JS · ~50 lines · runs via requestAnimationFrame.
- Forces: Coulomb repulsion (constant 600) · Hooke springs on edges (k=0.012 · rest lousedown on `.kg-svg-node` pins node + sets `vx/vy = 0`.    ← *(truncation #17 — should be `rest length 100`; then `**Section D — Drag handlers:**` header)*
- mousemove updates `node.x/y` using viewBox→client coord conversion.
- mouseup unpins node (physics resumes).
- CSS classes `.kg-svg-node-dragging` for cursor + drop-shadow.

**Section E — Live edge tracking:**
- `renderKGSimulationFrame` re-sets `x1/y1/x2/y2` on all `.kg-svg-edge` elements each tick.
- Edges follow nodes naturally.

**Section F — Locks preserved:**
- W16 click-highlight: click events still fire when not-dragging (mousemove threshold disambiguates).
- W16 no-autorotate: physics ≠ rotation · still no camera/scene spin.

**Section G — Reset button:**
- `.kg-fw-reset-btn` top-right of KG window · returns all nodes to initial positions · physics re-stabilizes from there.

**Cache-bust:** `v=w16` → `v=w17`.

Verified via Chrome MCP — per-test table.
```

════════════════════════════════════════════════════════� ← *(truncation #18)*

## SIGN-OFF PROTOCOL

Once code lands + SEMBCORP_SCOPE.md patched:
1. Output `STOPPING HERE — awaiting coach sign-off on W17`.
2. Coach disk-verifies via grep + Read.
3. After W17 GREEN: W17 = COMPLETE. NO MORE CODE WAVES. Demo TOMORROW.

REMINDER:
- Node count 3x is the load-bearing change. Don't under-deliver.
- Force sim physics constants (REPULSION, SPRING_K, GRAVITY_K, DAMPING) may need tuning — operator can adjust within ±2x range to get good visual settling. Surface tuning notes inline if changed.
- WA #13 per-test table MANDATORY · ~15 rows.
- Last wave before demo · NO scope expansion.

---

## COACH REINFORCEMENT — read before starting

1. KG-ONLY wave. Don't touch ANY other surface (Faye / Lim / Priya / Assistant / severity / workflow modal). W13-W16 locks preserved.

2. Node count 3x is load-bearing. P2 must hit ~72 (not 30 not 50). P3 must hit ~115 (not 60 not 80). Spread additions across all layers per the table.

3. Force simulation must STOP on KG close. Cancel `requestAnimationFrame`. No zombie tick loops.

4. Drag + click disambiguation must work: small click (<4px move) = highlight · larger move = drag · no highlight. Test both paths explicitly.

5. Physics constants may need tuning if nodes drift too far or settle too slowly. Operator can adjust REPULSION / SPRING_K / GRAVITY_K / DAMPING within ±2x range. Document tuning inline.

6. WA #13 per-test table MANDATORY · ~15 rows. Match W14 R1/R2/R3 + W15/W16 format.

7. Demo TOMORROW (2026-05-27). LAST code wave. NO scope expansion.

Standing by for W17 status.

---

## TRUNCATION LOG (operator notes)

The source paste contained 18 mid-line truncations (mostly ASCII boundary boxes + a few code-snippet cuts). All preserved verbatim above with `← *(truncation #N — ...)*` flags. None alter the technical intent:
- #1, #2, #4, #6, #11, #12, #13, #16, #18 — ASCII rule lines only, no content lost.
- #3 — L3/L4 row-band coordinates partially garbled; inferable from "3 rows" + "510 + 580" elsewhere.
- #5 — "Coach default total: ~150 edges" inferred from Section B header target.
- #7 — `const REPULSION = 600; const SPRING_K = 0.012;` (two declarations collapsed).
- #8 — `.forEach(` (truncated to `.forE(`).
- #9 — `renderKGSimulationFrame` (truncated to `renGSimulationFrame`).
- #10 — mouseup handler tail: `g.classList.remove('kg-svg-node-dragging'); } dragNode = null; svgRect = null; });` inferred.
- #14 — `initial settled state`.
- #15 — `drag took priority`.
- #17 — `rest length 100). Section D — Drag handlers:` header break.

Operator will resolve each ambiguity in the implementation pass using the inferred completions above.
