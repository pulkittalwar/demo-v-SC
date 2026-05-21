# Wave 0 Kickoff — paste into new operator Claude Code session

Open a fresh Claude Code session at `/Users/talwarpulkit/code/demo-v-SC/`. As the FIRST message, paste everything below the line.

---

You are the operator session for a throwaway click-through demo build. The project lives at `/Users/talwarpulkit/code/demo-v-SC/`. You're cloned from the tablet-demo-template (which proved its pattern for the CAG SuperEngineer OS demo, delivered 2026-05-08). This engagement is **Sembcorp Industries — Hyperspace OS demo, delivery 2026-05-27 (7 days)**.

The build is BIGGER than CAG. CAG was single-pane tablet, single persona, no KG visualization. Sembcorp is **dual-pane (tablet + under-the-hood architecture viz), 4-persona handoff, 3D Knowledge Graph with live agent dispatch + critic validation, learning flywheel close**. Scope tier locked at FULL (per coach decision), aggressive 8-wave cadence.

## Read these IN ORDER before responding

1. **`CLAUDE.md`** — template working agreements (hard checkpoints, incremental dispatch, throwaway code conventions, render() purity, etc.). Non-negotiable.
2. **`SEMBCORP_SCOPE.md`** — engagement-specific spec. Engagement parameters, vocabulary, split-pane layout, 4-persona workflow, KG schema, agent+critic mechanics, scope tier, 8-wave plan. ALSO non-negotiable.
3. **`SEED_PROMPT.md`** — template bootstrap (you can skip the parameters block since SEMBCORP_SCOPE.md has them filled in; do still read the working agreements + visual codes + canonical demo flow sections for reinforcement).
4. **`briefing/`** — raw client briefing:
   - `2026.05.27 Sembcorp ITP Presentation v1.pdf` (69 pages, BCG ITP deck — slide 25 is the demo slot)
   - `demo_1.png` + `demo_2.png` — workflow swimlane across 4 personas (5 rows: User/team, Workflow, Pain point, Tacit knowledge capture, HIL Agentic workflow)
   - `overview_hyperspace_os.png` — the architectural visual the right-pane under-the-hood viz should render LIVE during the demo flow (5 horizontal layers: Human Interfaces → Orchestration → Agents/Critics → Harness Foundation → Learning Flywheel)
   - `illustrative_view_tablet.png` — reference shape for the tablet view (translates CAG triage pattern to Sembcorp directly)
   - `illustrative_example_teams.png` — multi-persona handoff visual (engineer at switchgear → escalated to expert with full context → senior corrects/approves → learning compounds)

## Critical scope additions vs the CAG template

The template was built for single-pane tablet. Sembcorp adds:

1. **Split-pane layout** — LEFT 2/3 = tablet view (preserves CAG-style pattern); RIGHT 1/3 = under-the-hood architecture viz with 3 zones (orchestrator log 15% / 3D KG 70% / critic+flywheel 15%).
2. **4-persona top strip** on the tablet pane. CSS-illustration placeholders (no real photos — geometric/silhouette scenes per persona). Active = full color; handoff state = previous persona greyed.
3. **Same tablet "device" re-renders curated content per active persona** as workflow hands off.
4. **3D Knowledge Graph** (4 MECE layers) in right pane via pre-bundled `three.js` + `3d-force-graph`. Hardcoded ~30-40 nodes for the Jurong-CCGT-1 asset chain. Agent-spotlight animation as agents traverse layers.
5. **Critic validation gate** — every agent output passes through a critique agent that walks the KG path backwards; validated paths glow green and surface to tablet, rejected paths glow red and trigger re-dispatch.
6. **Learning flywheel close** — final beat shows correction writing back to KG as a new node, "next decision starts sharper" lands.

## First task — Wave 0 (today)

After reading the files above, do these in this order:

1. **Patch `CLAUDE.md`** — append a new section "## Sembcorp-specific additions" pointing to `SEMBCORP_SCOPE.md` as the load-bearing scope spec. Don't duplicate content — just a pointer + the 5 bullet scope additions listed above.

2. **Set up the split-pane shell** in `index.html` + `app.js`:
   - Fixed 1280×800 viewport
   - LEFT 2/3 pane: tablet bezel frame + empty placeholder
   - RIGHT 1/3 pane: 3 vertical zones (15% / 70% / 15%) with placeholder labels: "ORCHESTRATOR LOG", "KG (3D)", "CRITIC + FLYWHEEL"
   - Sembcorp green primary (`#00A651`) on dark navy (`#0A0E1F`) background
   - All zones empty inside, just bordered + labeled for visual confirmation

3. **Strip out CAG content** that doesn't transfer (the AHU-23 / Gate 23 hardcoded data, Changi teal color, Singapore name set). Leave the state machine, the render() pattern, the back-button pattern — those transfer.

4. **HARD HALT.** Output:
   - What's running at localhost:8000
   - What I should see in the browser (split pane with 3 empty zones on right, empty tablet on left, Sembcorp green accents)
   - "STOPPING HERE — awaiting feedback"

DO NOT start Wave 1 (persona strip + Ops view + Jurong-CCGT vocab) until Pulkit screenshots Wave 0 and gives the green light.

## Process

- Pulkit drives. You implement.
- Default to 1-2 changes per round per CLAUDE.md WA #2.
- Screenshot every meaningful UI change for Pulkit to review.
- When a bug reproduces after a claimed fix, follow CLAUDE.md WA #9 (diagnose first, paste code paths, get confirmation, then edit). This caught the missing-AMBER regression cleanly on the CAG build — same discipline here.
- Output style in chat: terse. Pulkit runs caveman mode. Code/commits/PRs: normal English.
- Commit on wave milestones (W0 lands, W1 lands, W2 lands…) — not after every micro-edit. Use Conventional Commits format.
- The right pane is the wow. Don't deprioritize it. It is NEVER an afterthought.

## Risks to flag early

- **Pre-bundled three.js + 3d-force-graph size** — verify total bundle stays under 5MB; if blow-up, fall back to 2D-parallax SVG per SEMBCORP_SCOPE.md and log decision.
- **Persona handoff re-render** — must preserve KG state on right pane while LEFT tablet re-renders for new persona. Don't blow away KG nodes between personas.
- **Single canonical happy path** — no override / disagree branch (deferred per scope file). If you find yourself building branch state, stop and re-read SEMBCORP_SCOPE.md "Out of scope" section.

## Start now

Read the files, patch CLAUDE.md, build the split-pane shell, halt. Go.
