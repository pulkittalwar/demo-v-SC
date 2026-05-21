// ─────────────────────────────────────────────
// Hyperspace OS — Sembcorp Demo · Wave 1.5
// LIGHT THEME · personas panel external above tablet · Ops Control Tower view.
// render() is PURE PAINT — no timers, no animation kickoffs.
// ─────────────────────────────────────────────

const state = {
  screen: 'monitoring',          // 'monitoring' | 'monitoring-notify' | 'monitoring-landed' | 'incident-detail'
  history: [],                   // nav stack
  activePersona: 'ops',          // 'ops' | 'onsite' | 'offsite' | 'analyst'
  bannerVisible: false,          // true during 'monitoring-notify' phase
  notifyTimer: null,             // setTimeout handle for B→C auto-advance
  incidentLanded: false,         // false until banner fires; sticks true once Screen C reached
  // ── Wave 3.2 — P1 arc + state pill state machine ──
  incidentPhase: 'IDLE',         // 'IDLE' | 'TRIAGING' | 'REVIEW_READY' | 'DISPATCHED_TO_ONSITE'
  activeAgentId: null,           // 'inspection' | 'triage' | 'critic-power-gen' | null
  agentStepIndex: {},            // { inspection: 2, triage: 0, ... } per-agent current step (0-indexed)
  arcTimers: [],                 // setTimeout handles for the sequencer (cleared on re-fire)
  // ── Wave 3.4 — right-pane toolbar + floating KG window ──
  logDropdownOpen: false,
  graphWinOpen: false,
  graphWinPos: { x: null, y: null },
  graphWinSize: { w: 460, h: 360 },
};

// ── Hardcoded incident data (Jurong-CCGT-1 GT-3) ──
const INCIDENT = {
  id: 'INC-2026-0537',
  asset: 'JRG-CCGT-1 · Block 2 · GT-3',
  title: 'GT-3 exhaust temp spread + heat-rate drift',
  timestamp: '02:47 SGT · 2026-05-20',
  severity: 'AMBER',
  bmsAlarm: 'GT EXHAUST TEMP SPREAD DRIFT — Block 2 GT-3 outside operating band per IEEE 1159 § 4.2 thresholds.',
  opsImpact: {
    body: 'MW dispatch reliability at risk — Block 2 derate ~50 MW if unmitigated. Affects PSO commitment window 09:00–18:00 SGT.',
    action: 'Action required within 45 min.',
  },
  metrics: [
    { lbl: 'GT EXHAUST TEMP SPREAD', val: '+14',   unit: '°C', nom: 'Target ≤ 5°C',              tone: 'amber' },
    { lbl: 'HEAT RATE DRIFT',         val: '+2.1', unit: '%',  nom: 'Baseline 7,180 kJ/kWh',     tone: 'amber' },
    { lbl: 'COMPRESSOR PR RATIO',     val: '15.8', unit: '',   nom: 'Nominal 16.2',              tone: 'red' },
    { lbl: 'AMBIENT HUMIDITY (90d)',  val: '78',   unit: '%',  nom: 'Sustained · informational', tone: 'slate' },
  ],
  chain: ['GT-3', 'HRSG-3', 'CONDENSER-3', 'GENERATOR-3', 'TRANSFORMER-3', 'SWITCHYARD'],
  historicalWOCount: 3,
};

// ── Persona roster ──
const PERSONAS = [
  { key: 'ops',     role: 'Ops · Control Tower',   name: 'R. KUMAR' },
  { key: 'onsite',  role: 'Onsite · Maint',         name: 'LIM WEI JIE' },
  { key: 'offsite', role: 'Offsite · Expert',       name: 'DR. A. WONG' },
  { key: 'analyst', role: 'Asset Perf · Analyst',   name: 'PRIYA SUNDARAM' },
];

// ── Persona scene SVGs (light-theme retuned) ──
// Stroke #475569 (slate-600) for silhouette/structure, #00A651 (Sembcorp green) for active accents,
// #94A3B8 (slate-400) for schematic lines.
const PERSONA_SCENES = {
  ops: `
    <svg viewBox="0 0 140 70" xmlns="http://www.w3.org/2000/svg">
      <!-- 3-monitor wall -->
      <rect x="6"   y="10" width="36" height="22" rx="2" fill="#FFFFFF" stroke="#00A651" stroke-width="0.7"/>
      <rect x="48"  y="6"  width="44" height="26" rx="2" fill="#FFFFFF" stroke="#00A651" stroke-width="0.7"/>
      <rect x="98"  y="10" width="36" height="22" rx="2" fill="#FFFFFF" stroke="#00A651" stroke-width="0.7"/>
      <!-- gridlines in center monitor -->
      <line x1="55" y1="13" x2="86" y2="13" stroke="#94A3B8" stroke-width="0.4" stroke-dasharray="2,2"/>
      <line x1="55" y1="20" x2="86" y2="20" stroke="#94A3B8" stroke-width="0.4" stroke-dasharray="2,2"/>
      <!-- alert dot -->
      <circle cx="68" cy="20" r="2.4" fill="#F59E0B"/>
      <circle cx="68" cy="20" r="5"   fill="none" stroke="#F59E0B" stroke-width="0.5" opacity="0.55"/>
      <!-- silhouette -->
      <circle cx="70" cy="52" r="5.5" fill="#475569"/>
      <path d="M 56 70 Q 70 56 84 70 Z" fill="#475569"/>
    </svg>`,
  onsite: `
    <svg viewBox="0 0 140 70" xmlns="http://www.w3.org/2000/svg">
      <!-- turbine -->
      <ellipse cx="95" cy="36" rx="14" ry="22" fill="#FFFFFF" stroke="#475569" stroke-width="0.7"/>
      <line x1="95" y1="14" x2="95" y2="58" stroke="#94A3B8" stroke-width="0.5"/>
      <line x1="83" y1="36" x2="107" y2="36" stroke="#94A3B8" stroke-width="0.5"/>
      <circle cx="95" cy="36" r="5" fill="none" stroke="#475569" stroke-width="0.6"/>
      <!-- hard hat silhouette -->
      <path d="M 32 28 Q 32 20 44 20 Q 56 20 56 28 L 56 30 L 32 30 Z" fill="#00A651"/>
      <rect x="30" y="29" width="28" height="2" fill="#475569"/>
      <circle cx="44" cy="36" r="4.5" fill="#475569"/>
      <path d="M 30 66 Q 44 44 58 66 Z" fill="#475569"/>
      <!-- tablet -->
      <rect x="56" y="46" width="14" height="10" rx="1" fill="#FFFFFF" stroke="#475569" stroke-width="0.6"/>
    </svg>`,
  offsite: `
    <svg viewBox="0 0 140 70" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="50" width="112" height="3" fill="#94A3B8"/>
      <!-- left monitor: schematic -->
      <rect x="22" y="14" width="42" height="32" rx="2" fill="#FFFFFF" stroke="#475569" stroke-width="0.6"/>
      <line x1="28" y1="22" x2="58" y2="22" stroke="#94A3B8" stroke-width="0.4"/>
      <line x1="28" y1="28" x2="58" y2="28" stroke="#94A3B8" stroke-width="0.4"/>
      <line x1="28" y1="34" x2="58" y2="34" stroke="#94A3B8" stroke-width="0.4"/>
      <rect x="32" y="24" width="6" height="6" fill="#94A3B8"/>
      <rect x="44" y="30" width="6" height="6" fill="#94A3B8"/>
      <line x1="38" y1="27" x2="44" y2="33" stroke="#475569" stroke-width="0.5"/>
      <!-- right monitor -->
      <rect x="76" y="14" width="42" height="32" rx="2" fill="#FFFFFF" stroke="#475569" stroke-width="0.6"/>
      <line x1="80" y1="22" x2="114" y2="22" stroke="#94A3B8" stroke-width="0.4"/>
      <line x1="80" y1="28" x2="114" y2="28" stroke="#94A3B8" stroke-width="0.4"/>
      <line x1="80" y1="34" x2="114" y2="34" stroke="#94A3B8" stroke-width="0.4"/>
      <!-- silhouette -->
      <circle cx="70" cy="58" r="4.5" fill="#475569"/>
      <path d="M 58 70 Q 70 62 82 70 Z" fill="#475569"/>
    </svg>`,
  analyst: `
    <svg viewBox="0 0 140 70" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="50" width="112" height="3" fill="#94A3B8"/>
      <!-- monitor -->
      <rect x="38" y="10" width="64" height="36" rx="2" fill="#FFFFFF" stroke="#475569" stroke-width="0.7"/>
      <!-- bar chart -->
      <rect x="46" y="34" width="6" height="8"  fill="#00A651"/>
      <rect x="56" y="28" width="6" height="14" fill="#00A651"/>
      <rect x="66" y="22" width="6" height="20" fill="#00A651"/>
      <rect x="76" y="18" width="6" height="24" fill="#00A651"/>
      <rect x="86" y="14" width="6" height="28" fill="#00A651"/>
      <line x1="44" y1="42" x2="96" y2="42" stroke="#475569" stroke-width="0.5"/>
      <!-- dollar overlay -->
      <text x="91" y="22" font-family="monospace" font-size="10" fill="#DB2777" font-weight="bold">$</text>
      <!-- silhouette -->
      <circle cx="70" cy="58" r="4.5" fill="#475569"/>
      <path d="M 58 70 Q 70 62 82 70 Z" fill="#475569"/>
    </svg>`,
};

// ── Pre-existing incident roster (locked, Sembcorp-canonical) — W2.6 ──
const PRE_EXISTING_INCIDENTS = [
  {
    id: 'INC-2026-0521',
    asset: 'Jurong-CCGT-2 · BFP-2A',
    body: 'Bearing vibration trending within OEM band — surveillance only.',
    severity: 'GREEN',
    state: 'MONITORING',
    age: '2h 14m ago',
    owner: 'R. Kumar',
    ownerInitials: 'RK',
    clickable: false,
  },
  {
    id: 'INC-2026-0529',
    asset: 'Sakra-CCGT-1 · ST-1',
    body: 'LP turbine exhaust pressure rise — wash cycle scheduled per OEM PTC.',
    severity: 'AMBER',
    state: 'SCHEDULED',
    age: '58m ago',
    owner: 'R. Kumar',
    ownerInitials: 'RK',
    clickable: false,
  },
  {
    id: 'INC-2026-0532',
    asset: 'Banyan-CHP · Cooling Tower 2',
    body: 'CT2 fill media plugging — supplementary cooling engaged.',
    severity: 'RED',
    state: 'MONITORING',
    age: '31m ago',
    owner: 'R. Kumar',
    ownerInitials: 'RK',
    clickable: false,
  },
];

// ── Helpers ──
function el(tag, cls) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  return e;
}

function goto(n) {
  state.history.push(state.screen);
  state.screen = n;
  render();
}

function back() {
  if (!state.history.length) return;
  state.screen = state.history.pop();
  render();
}

// ── Personas panel (external, above tablet) ──
function renderPersonasPanel() {
  const row = document.getElementById('personas-row');
  row.innerHTML = '';
  PERSONAS.forEach(p => {
    const tile = el('div', 'persona-tile ' + (p.key === state.activePersona ? 'active' : 'inactive'));
    tile.innerHTML = `
      <div class="persona-scene">${PERSONA_SCENES[p.key]}</div>
      <div class="persona-label">
        <span class="persona-role">${p.role}</span>
        <span class="persona-name">${p.name}</span>
      </div>`;
    row.appendChild(tile);
  });
}

// ── Ops Control Tower incident detail view (Screen D) ──
function renderIncidentDetailView(root) {
  const content = el('div', 'tablet-content');

  // (A) header band — teal gradient + back chevron + title/ID/severity
  const hdr = el('div', 'inc-header');
  hdr.innerHTML = `
    <span class="inc-back">
      <svg viewBox="0 0 8 13" fill="none">
        <path d="M7 1L1 6.5L7 12" stroke="rgba(255,255,255,0.85)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Back
    </span>
    <div class="inc-hdr-row">
      <div class="inc-hdr-left">
        <div class="inc-title">${INCIDENT.asset}</div>
        <div class="inc-id">${INCIDENT.id}</div>
        <div class="inc-ts">${INCIDENT.timestamp}</div>
      </div>
      <span class="sev-pill">▲ Severity: ${INCIDENT.severity}</span>
    </div>`;
  content.appendChild(hdr);

  // (B) Metrics card — single card, 4 cells, hairline dividers
  const hyperLabel = el('div', 'hyperspace-source');
  hyperLabel.innerHTML = `<span class="hyperspace-source-icon">✦</span> from Hyperspace · live`;
  content.appendChild(hyperLabel);

  const grid = el('div', 'metrics-card');
  INCIDENT.metrics.forEach(m => {
    const cell = el('div', 'metric-cell');
    cell.innerHTML = `
      <div class="mc-lbl">${m.lbl}</div>
      <div class="mc-val ${m.tone}">${m.val}<span class="mc-unit">${m.unit}</span></div>
      <div class="mc-nom">${m.nom}</div>`;
    grid.appendChild(cell);
  });
  content.appendChild(grid);

  // (C) BMS alarm strip
  const bms = el('div', 'bms-alarm');
  bms.innerHTML = `
    <div class="bms-lbl">BMS Alarm</div>
    <div class="bms-text">${INCIDENT.bmsAlarm}</div>`;
  content.appendChild(bms);

  // (D)–(F) ops-section
  const sec = el('div', 'ops-section');

  // (D) Operational Impact
  const impact = el('div', 'ops-card');
  impact.innerHTML = `
    <div class="ops-card-lbl">Operational Impact</div>
    <div class="ops-card-body">${INCIDENT.opsImpact.body}</div>
    <div class="ops-card-action">${INCIDENT.opsImpact.action}</div>`;
  sec.appendChild(impact);

  // (E) Asset chain
  const chain = el('div', 'ops-card');
  const chainStr = INCIDENT.chain.map((n, i) =>
    i === 0 ? n : `<span class="arrow">→</span>${n}`
  ).join('');
  chain.innerHTML = `
    <div class="ops-card-lbl">Actively monitoring connected asset chain</div>
    <div class="chain-text">${chainStr}</div>
    <div class="chain-note">✦ Connected nodes monitored — chain alerts route here automatically.</div>`;
  sec.appendChild(chain);

  // (F) History accordion (collapsed)
  const acc = el('div', 'acc-row-w1');
  acc.innerHTML = `
    <span class="acc-row-w1-lbl">Historical work orders for GT-3 (${INCIDENT.historicalWOCount})</span>
    <span class="acc-row-w1-chev">
      <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
        <path d="M1 1l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>`;
  sec.appendChild(acc);

  content.appendChild(sec);

  // (G) NEXT ACTION STEPS — W3.2. Renders when triage + critic complete.
  if (state.incidentPhase === 'REVIEW_READY' || state.incidentPhase === 'DISPATCHED_TO_ONSITE') {
    const next = el('div', 'next-action');
    next.innerHTML = `
      <div class="next-action-hdr">
        <span class="hitl-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="3"/>
            <path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"/>
          </svg>
        </span>
        <span>Next action steps for R. Kumar</span>
        <span class="hitl-tag">Human-in-the-loop</span>
      </div>
      <div class="next-action-step-lbl"><span class="next-action-step-num">1.</span> Verify and confirm diagnosis</div>
      <div class="diagnosis-card">
        <div class="diagnosis-hdr">
          <span class="diagnosis-lbl">▼ Expected diagnosis · AI-suggested</span>
          <span class="diagnosis-conf">78%</span>
        </div>
        <div class="diagnosis-title">Compressor fouling at GT-3</div>
        <div class="diagnosis-body">
          Pattern matches 3 prior compressor-fouling RCAs from Jurong + Sakra fleet, humidity-correlated against 90d profile. Surface diagnosis — deeper verification may surface co-factors.
        </div>
        <div class="diagnosis-rationale">
          ✦ <span class="diagnosis-rationale-strong">Super Engineer Intelligence</span> pre-filled this diagnosis. Pattern locked via humidity-fouling-v3 model + 3 RCA matches.
        </div>
        <div class="diagnosis-links">
          <span class="diagnosis-link">▾ See full reasoning</span>
          <span class="diagnosis-link">▾ Alternative diagnosis (2)</span>
        </div>
      </div>
    `;

    if (state.incidentPhase === 'REVIEW_READY') {
      const cta = el('button', 'dispatch-cta');
      cta.innerHTML = `Dispatch to Onsite <span class="dispatch-cta-arrow">→</span>`;
      cta.addEventListener('click', dispatchToOnsite);
      next.appendChild(cta);
    } else {
      const confirm = el('div', 'dispatch-confirmed');
      confirm.innerHTML = `✓ Dispatched to Onsite at ${currentSGTTime()} · Lim Wei Jie notified`;
      next.appendChild(confirm);
    }

    content.appendChild(next);
  }

  // Back button (W2.6) — pops state.history → returns to Screen C monitoring-landed
  const backBtn = content.querySelector('.inc-back');
  if (backBtn) {
    backBtn.style.cursor = 'pointer';
    backBtn.addEventListener('click', backToMonitoring);
  }

  root.appendChild(content);
}

// ── Dispatch to Onsite (Wave 3.2 + 3.4 Workflow Agent) ──
function dispatchToOnsite() {
  state.incidentPhase = 'DISPATCHED_TO_ONSITE';
  render();
  pulsePersonaTile('onsite');
  // Wave 3.4 — Workflow Agent captures SOP trace on handoff
  fireWorkflowAgentArc();
}

function fireWorkflowAgentArc() {
  let t = 0;
  t += 200;
  scheduleArcStep(t, () => {
    setAgentActive(WORKFLOW_AGENT_SCRIPT.agentId, WORKFLOW_AGENT_SCRIPT.taskTreeLabel, WORKFLOW_AGENT_SCRIPT.steps.length);
  });
  WORKFLOW_AGENT_SCRIPT.steps.forEach((step, idx) => {
    t += step.delayMs;
    scheduleArcStep(t, () => {
      window.LOG.appendLine(step.log);
      advanceAgentStep(WORKFLOW_AGENT_SCRIPT.agentId, idx, step);
    });
  });
  t += 400;
  scheduleArcStep(t, () => teardownAgentTree(WORKFLOW_AGENT_SCRIPT.agentId));
}

function pulsePersonaTile(personaKey) {
  const row = document.getElementById('personas-row');
  if (!row) return;
  const tiles = row.querySelectorAll('.persona-tile');
  const idx = PERSONAS.findIndex(p => p.key === personaKey);
  if (idx < 0 || !tiles[idx]) return;
  tiles[idx].classList.add('persona-tile-pulse');
  setTimeout(() => tiles[idx].classList.remove('persona-tile-pulse'), 4800);
}

// ── Stub persona renderers (deferred) ──
function renderOnsiteView(root)  { stubView(root, 'Onsite Eng view — Wave 6'); }
function renderOffsiteView(root) { stubView(root, 'Offsite Expert view — Wave 7'); }
function renderAnalystView(root) { stubView(root, 'Asset Perf Analyst view — Wave 7'); }
function stubView(root, label) {
  const s = el('div', 'tablet-content');
  s.style.cssText = 'display:flex;align-items:center;justify-content:center;color:#64748B;font-family:var(--mono);font-size:12px;';
  s.textContent = label;
  root.appendChild(s);
}

// ── Monitoring dashboard (Screens A / B / C) — W2.6 ──
function currentSGTTime() {
  // Hardcoded for demo — 02:47 SGT matches INC-2026-0537 timestamp
  return '02:47 SGT';
}

function buildLandedIncidentRow() {
  let stateText, stateClass;
  switch (state.incidentPhase) {
    case 'REVIEW_READY':           stateText = 'REVIEW READY';         stateClass = 'review-ready'; break;
    case 'DISPATCHED_TO_ONSITE':   stateText = 'DISPATCHED TO ONSITE'; stateClass = 'dispatched';   break;
    case 'IDLE':
    case 'TRIAGING':
    default:                       stateText = 'TRIAGING';             stateClass = 'triaging';     break;
  }
  return {
    id: INCIDENT.id,
    asset: INCIDENT.asset,
    body: 'GT-3 exhaust temperature spread widening — Block 2 cannot maintain heat rate baseline. Pattern suggests compressor fouling correlated with 90d humidity.',
    severity: INCIDENT.severity,
    state: stateText,
    stateClass: stateClass,
    age: 'Just now',
    owner: 'R. Kumar',
    ownerInitials: 'RK',
    clickable: true,
    highlighted: true,
  };
}

function renderMonitoringView(root) {
  const content = el('div', 'tablet-content');

  // (A) Header band — Sembcorp-teal, click target for Screen A → B
  const hdr = el('div', 'mon-header');
  hdr.innerHTML = `
    <div class="mon-hdr-left">
      <div class="mon-hdr-brand">Hyperspace OS</div>
    </div>
    <div class="mon-hdr-right">
      <div class="mon-hdr-time">${currentSGTTime()}</div>
      <div class="mon-hdr-engineer">
        <span class="mon-hdr-engineer-pill"><span class="mon-hdr-engineer-initials">RK</span>R. Kumar</span>
        <span class="mon-hdr-engineer-all">All engineers</span>
      </div>
    </div>
  `;
  if (state.screen === 'monitoring' && !state.incidentLanded) {
    hdr.classList.add('mon-header-clickable');
    hdr.style.cursor = 'pointer';
    hdr.addEventListener('click', triggerNewIncident);
  }
  content.appendChild(hdr);

  // (B) Stat row — 3-up
  const activeCount   = state.incidentLanded ? 4 : 3;
  const awaitingCount = state.incidentLanded ? 1 : 0;
  const slaCount      = 0;
  const stats = el('div', 'mon-stat-row');
  stats.innerHTML = `
    <div class="mon-stat">
      <div class="mon-stat-val mon-stat-val-active">${activeCount}</div>
      <div class="mon-stat-lbl">Active</div>
    </div>
    <div class="mon-stat">
      <div class="mon-stat-val mon-stat-val-await">${awaitingCount}</div>
      <div class="mon-stat-lbl">Awaiting Triage</div>
    </div>
    <div class="mon-stat">
      <div class="mon-stat-val mon-stat-val-sla">${slaCount}</div>
      <div class="mon-stat-lbl">SLA at Risk</div>
    </div>
  `;
  content.appendChild(stats);

  // (C) Incidents list
  const list = el('div', 'mon-incidents');
  const listHdr = el('div', 'mon-incidents-hdr');
  listHdr.textContent = `INCIDENTS (${activeCount})`;
  list.appendChild(listHdr);

  const orderedRows = state.incidentLanded
    ? [buildLandedIncidentRow(), ...PRE_EXISTING_INCIDENTS]
    : [...PRE_EXISTING_INCIDENTS];

  orderedRows.forEach(row => {
    const card = el('div', 'mon-incident-card');
    if (row.highlighted) card.classList.add('mon-incident-card-highlighted');
    if (row.clickable) {
      card.classList.add('mon-incident-card-clickable');
      card.addEventListener('click', openIncidentDetail);
    }
    const sevPrefix = (row.severity === 'AMBER' || row.severity === 'RED') ? '▲ ' : '';
    const stateClass = row.stateClass || row.state.toLowerCase();
    card.innerHTML = `
      <div class="mon-card-row mon-card-row-top">
        <span class="mon-card-id">${row.id}</span>
        <div class="mon-card-pills">
          <span class="mon-pill mon-pill-sev mon-pill-sev-${row.severity.toLowerCase()}">${sevPrefix}${row.severity}</span>
          <span class="mon-pill mon-pill-state mon-pill-state-${stateClass}">${row.state}</span>
        </div>
      </div>
      <div class="mon-card-asset">${row.asset}</div>
      <div class="mon-card-body">${row.body}</div>
      <div class="mon-card-row mon-card-row-btm">
        <span class="mon-card-owner"><span class="mon-card-owner-initials">${row.ownerInitials}</span>${row.owner}</span>
        <span class="mon-card-age">${row.age}</span>
      </div>
    `;
    list.appendChild(card);
  });
  content.appendChild(list);

  // (D) Notification banner — rendered only during 'monitoring-notify'
  if (state.bannerVisible) {
    const banner = el('div', 'mon-banner');
    banner.innerHTML = `
      <div class="mon-banner-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <polyline points="12,7 12,12 15,15"/>
        </svg>
      </div>
      <div class="mon-banner-body">
        <div class="mon-banner-lbl">NEW INCIDENT · Hyperspace OS</div>
        <div class="mon-banner-title">${INCIDENT.asset} · GT exhaust temp anomaly</div>
      </div>
      <div class="mon-banner-time">now</div>
    `;
    banner.addEventListener('click', skipToLanded);
    content.appendChild(banner);
  }

  root.appendChild(content);
}

// ── Screen transition handlers ──
function triggerNewIncident() {
  if (state.screen !== 'monitoring' || state.incidentLanded) return;
  state.history.push('monitoring');
  state.screen = 'monitoring-notify';
  state.bannerVisible = true;
  render();
  state.notifyTimer = setTimeout(fadeBannerThenLand, 3000);
  // Wave 3.2 — fire P1 arc concurrent with banner. Arc continues streaming
  // for ~9s after banner fades + Screen C lands. Intentional.
  dispatchP1Arc();
  // Wave 3.4 — auto-open floating KG window when arc fires (D2 lock)
  if (!state.graphWinOpen) toggleGraphWindow();
}

function fadeBannerThenLand() {
  const banner = document.querySelector('.mon-banner');
  if (banner) banner.classList.add('mon-banner-out');
  setTimeout(() => {
    state.bannerVisible = false;
    state.screen = 'monitoring-landed';
    state.incidentLanded = true;
    state.notifyTimer = null;
    render();
  }, 500);
}

function skipToLanded() {
  if (state.notifyTimer) {
    clearTimeout(state.notifyTimer);
    state.notifyTimer = null;
  }
  fadeBannerThenLand();
}

function openIncidentDetail() {
  state.history.push(state.screen);
  state.screen = 'incident-detail';
  render();
}

function backToMonitoring() {
  if (state.history.length === 0) return;
  state.screen = state.history.pop();
  render();
}

// ── Tablet root renderer ──
function renderTablet() {
  const root = document.getElementById('tablet-root');
  root.innerHTML = '';
  switch (state.screen) {
    case 'monitoring':
    case 'monitoring-notify':
    case 'monitoring-landed':
      renderMonitoringView(root);
      break;
    case 'incident-detail':
      switch (state.activePersona) {
        case 'ops':     renderIncidentDetailView(root); break;
        case 'onsite':  renderOnsiteView(root); break;
        case 'offsite': renderOffsiteView(root); break;
        case 'analyst': renderAnalystView(root); break;
      }
      break;
  }
}

// ── render() = pure paint ──
function render() {
  renderPersonasPanel();
  renderTablet();
}

// ─────────────────────────────────────────────
// KG 3D rendering module — Wave 2.5
// three.js + 3d-force-graph stratified force-graph.
// Y-axis pinned per layer via fy. Per-node state API for W3+.
// Try/catch fallback to CSS scaffold on failure.
// ─────────────────────────────────────────────

const KG_NODES = [
  // L1 People & Process (green) — y = 90
  { id: 'r-kumar',         label: 'R. Kumar · Ops',           layer: 'L1', x:  20, y: 90, z:  20 },
  { id: 'lim-wei-jie',     label: 'Lim Wei Jie · Onsite',     layer: 'L1', x: -20, y: 90, z: -20 },
  { id: 'dr-wong',         label: 'Dr. A. Wong · Offsite',    layer: 'L1', x: -60, y: 90, z:  20 },
  { id: 'p-sundaram',      label: 'P. Sundaram · Asset Perf', layer: 'L1', x:  60, y: 90, z: -20 },
  { id: 'bu-power-gen',    label: 'BU · Power Gen',           layer: 'L1', x:   0, y: 90, z:  60 },
  { id: 'raci-derate',     label: 'RACI · derate ≥40MW',      layer: 'L1', x: -40, y: 90, z:  60 },
  { id: 'esc-pso',         label: 'Escalation · PSO window',  layer: 'L1', x:  40, y: 90, z:  60 },

  // L2 Physical Plant (blue) — y = 30
  { id: 'gt-3',                label: 'GT-3',                layer: 'L2', x: -60, y: 30, z:   0 },
  { id: 'igv-3-actuator',      label: 'IGV-3 actuator',      layer: 'L2', x: -30, y: 30, z:  20 },
  { id: 'hrsg-3',              label: 'HRSG-3',              layer: 'L2', x:   0, y: 30, z:   0 },
  { id: 'bfp-3a',              label: 'BFP-3A',              layer: 'L2', x:  30, y: 30, z:  20 },
  { id: 'bfp-3b',              label: 'BFP-3B',              layer: 'L2', x:  60, y: 30, z:   0 },
  { id: 'condenser-3',         label: 'Condenser-3',         layer: 'L2', x: -45, y: 30, z: -40 },
  { id: 'generator-3',         label: 'Generator-3',         layer: 'L2', x: -15, y: 30, z: -40 },
  { id: 'transformer-3',       label: 'Transformer-3',       layer: 'L2', x:  15, y: 30, z: -40 },
  { id: 'switchyard-a',        label: 'Switchyard-A',        layer: 'L2', x:  45, y: 30, z: -40 },
  { id: 'oem-ge-9ha-manual',   label: 'OEM · GE 9HA manual', layer: 'L2', x:  70, y: 30, z:  40 },

  // L3 Historical State (amber) — y = -30
  { id: 'gt-3-90d-temp',       label: 'GT-3 · 90d exhaust temp',        layer: 'L3', x: -60, y: -30, z:   0 },
  { id: 'rca-2025-014-sakra',  label: 'RCA-2025-014 · Sakra fouling',   layer: 'L3', x: -30, y: -30, z:  20 },
  { id: 'rca-2024-093-jurong', label: 'RCA-2024-093 · Jurong fouling',  layer: 'L3', x:   0, y: -30, z:   0 },
  { id: 'rca-2025-031-jurong2',label: 'RCA-2025-031 · Jurong-2 wash',   layer: 'L3', x:  30, y: -30, z:  20 },
  { id: 'wo-log-47',           label: 'WO log · 47 prior',              layer: 'L3', x:  60, y: -30, z:   0 },
  { id: 'pi-18mo',             label: 'PI · 18mo telemetry',            layer: 'L3', x: -15, y: -30, z: -30 },
  { id: 'audit-iso50001',      label: 'Audit · ISO 50001',              layer: 'L3', x:  15, y: -30, z: -30 },

  // L4 Predictive Intelligence (pink) — y = -90
  { id: 'pat-comp-fouling',    label: 'Pattern · compressor fouling',   layer: 'L4', x: -45, y: -90, z:   0 },
  { id: 'pat-igv-drift',       label: 'Pattern · IGV actuator drift',   layer: 'L4', x: -15, y: -90, z:  20 },
  { id: 'mdl-humidity-v3',     label: 'Model · humidity-fouling v3',    layer: 'L4', x:  15, y: -90, z:   0 },
  { id: 'pred-mw-derate',      label: 'Predictor · MW derate',          layer: 'L4', x:  45, y: -90, z:  20 },
  { id: 'roi-wash',            label: 'ROI · wash-cycle',               layer: 'L4', x: -30, y: -90, z: -30 },
  { id: 'rec-oem-playbook',    label: 'Recommender · OEM playbook',     layer: 'L4', x:  30, y: -90, z: -30 },
];

const KG_LAYER_COLORS = {
  L1: '#00A651',  // green
  L2: '#3B82F6',  // blue
  L3: '#F59E0B',  // amber
  L4: '#EC4899',  // pink
};

const KG_EDGES = [
  // Asset chain L2
  { source: 'gt-3', target: 'igv-3-actuator' },
  { source: 'gt-3', target: 'hrsg-3' },
  { source: 'hrsg-3', target: 'condenser-3' },
  { source: 'condenser-3', target: 'generator-3' },
  { source: 'generator-3', target: 'transformer-3' },
  { source: 'transformer-3', target: 'switchyard-a' },
  { source: 'hrsg-3', target: 'bfp-3a' },
  { source: 'hrsg-3', target: 'bfp-3b' },
  { source: 'gt-3', target: 'oem-ge-9ha-manual' },

  // L2 asset → L3 history
  { source: 'gt-3', target: 'gt-3-90d-temp' },
  { source: 'gt-3', target: 'wo-log-47' },
  { source: 'gt-3', target: 'pi-18mo' },
  { source: 'igv-3-actuator', target: 'audit-iso50001' },

  // L3 RCA → L4 pattern
  { source: 'rca-2025-014-sakra', target: 'pat-comp-fouling' },
  { source: 'rca-2024-093-jurong', target: 'pat-comp-fouling' },
  { source: 'rca-2025-031-jurong2', target: 'pat-comp-fouling' },
  { source: 'gt-3-90d-temp', target: 'pat-comp-fouling' },
  { source: 'pi-18mo', target: 'pat-igv-drift' },
  { source: 'audit-iso50001', target: 'pat-igv-drift' },

  // L4 patterns → L4 models / predictors
  { source: 'pat-comp-fouling', target: 'mdl-humidity-v3' },
  { source: 'pat-igv-drift', target: 'mdl-humidity-v3' },
  { source: 'mdl-humidity-v3', target: 'pred-mw-derate' },
  { source: 'pat-comp-fouling', target: 'roi-wash' },
  { source: 'pat-igv-drift', target: 'rec-oem-playbook' },

  // L1 persona → L2 asset + L4 patterns
  { source: 'r-kumar', target: 'gt-3' },
  { source: 'lim-wei-jie', target: 'igv-3-actuator' },
  { source: 'dr-wong', target: 'pat-igv-drift' },
  { source: 'p-sundaram', target: 'pred-mw-derate' },
  { source: 'bu-power-gen', target: 'gt-3' },
  { source: 'raci-derate', target: 'pred-mw-derate' },
  { source: 'esc-pso', target: 'r-kumar' },
];

// ── Wave 3.4: tag canonical 30 nodes + 30 edges, append theater density ──
KG_NODES.forEach(n => { n.canonical = true; });
KG_EDGES.forEach(e => { e.canonical = true; });

const LAYER_Y = { L1: 90, L2: 30, L3: -30, L4: -90 };

const KG_THEATER_NODES = [
  // L1 People & Process (additional roles)
  { id: 't-supervisor-onsite', label: 'Maint. Supervisor',  layer: 'L1', canonical: false },
  { id: 't-supervisor-shift',  label: 'Shift Supervisor',   layer: 'L1', canonical: false },
  { id: 't-trading-desk',      label: 'Trading Desk',       layer: 'L1', canonical: false },
  { id: 't-compliance',        label: 'Compliance Officer', layer: 'L1', canonical: false },
  { id: 't-vendor-liaison',    label: 'OEM Liaison',        layer: 'L1', canonical: false },
  { id: 't-procurement',       label: 'Procurement',        layer: 'L1', canonical: false },
  { id: 't-bu-renewables',     label: 'BU · Renewables',    layer: 'L1', canonical: false },
  { id: 't-bu-networks',       label: 'BU · Networks',      layer: 'L1', canonical: false },

  // L2 Physical Plant (sister blocks + sub-assemblies)
  { id: 't-gt-1',           label: 'GT-1',           layer: 'L2', canonical: false },
  { id: 't-gt-2',           label: 'GT-2',           layer: 'L2', canonical: false },
  { id: 't-hrsg-1',         label: 'HRSG-1',         layer: 'L2', canonical: false },
  { id: 't-hrsg-2',         label: 'HRSG-2',         layer: 'L2', canonical: false },
  { id: 't-bfp-1a',         label: 'BFP-1A',         layer: 'L2', canonical: false },
  { id: 't-bfp-1b',         label: 'BFP-1B',         layer: 'L2', canonical: false },
  { id: 't-bfp-2a',         label: 'BFP-2A',         layer: 'L2', canonical: false },
  { id: 't-bfp-2b',         label: 'BFP-2B',         layer: 'L2', canonical: false },
  { id: 't-condenser-1',    label: 'Condenser-1',    layer: 'L2', canonical: false },
  { id: 't-condenser-2',    label: 'Condenser-2',    layer: 'L2', canonical: false },
  { id: 't-gas-vlv-1',      label: 'Fuel Gas Valve', layer: 'L2', canonical: false },
  { id: 't-cooling-tower',  label: 'Cooling Tower',  layer: 'L2', canonical: false },
  { id: 't-stack',          label: 'Exhaust Stack',  layer: 'L2', canonical: false },
  { id: 't-instr-pi-tags',  label: 'PI Tag Cluster', layer: 'L2', canonical: false },

  // L3 Historical State
  { id: 't-outage-2025-q3', label: 'Outage · 2025 Q3',            layer: 'L3', canonical: false },
  { id: 't-outage-2024-q2', label: 'Outage · 2024 Q2',            layer: 'L3', canonical: false },
  { id: 't-sb-ge-001',      label: 'GE Service Bulletin 9HA-001', layer: 'L3', canonical: false },
  { id: 't-sb-ge-014',      label: 'GE Service Bulletin 9HA-014', layer: 'L3', canonical: false },
  { id: 't-calib-log',      label: 'Calibration log',             layer: 'L3', canonical: false },
  { id: 't-hse-incidents',  label: 'HSE incident log',            layer: 'L3', canonical: false },
  { id: 't-ops-shift-notes',label: 'Ops shift notes',             layer: 'L3', canonical: false },
  { id: 't-wo-2025',        label: 'WO archive · 2025',           layer: 'L3', canonical: false },
  { id: 't-emissions-cert', label: 'NEA emissions cert',          layer: 'L3', canonical: false },
  { id: 't-iec-61850',      label: 'IEC 61850 audit',             layer: 'L3', canonical: false },

  // L4 Predictive Intelligence
  { id: 't-mdl-plant-mw',   label: 'Plant-wide MW model',              layer: 'L4', canonical: false },
  { id: 't-mdl-demand',     label: 'Singapore demand curve',           layer: 'L4', canonical: false },
  { id: 't-mdl-retail',     label: 'Retail price model',               layer: 'L4', canonical: false },
  { id: 't-mdl-heat-rate',  label: 'Heat rate degradation model',      layer: 'L4', canonical: false },
  { id: 't-mdl-emissions',  label: 'Emissions prediction',             layer: 'L4', canonical: false },
  { id: 't-mdl-startup',    label: 'Cold start ROI model',             layer: 'L4', canonical: false },
  { id: 't-rec-spares',     label: 'Spares replenishment recommender', layer: 'L4', canonical: false },
  { id: 't-pred-trip-prob', label: 'Forced trip probability',          layer: 'L4', canonical: false },
  { id: 't-rec-shutdown',   label: 'Planned shutdown optimizer',       layer: 'L4', canonical: false },
];

// Pin Y per layer for theater nodes (free X/Z)
KG_THEATER_NODES.forEach(n => { n.y = LAYER_Y[n.layer]; });

KG_NODES.push(...KG_THEATER_NODES);

const KG_THEATER_EDGES = [
  // L1 intra
  { source: 't-supervisor-onsite', target: 'lim-wei-jie',       canonical: false },
  { source: 't-supervisor-shift',  target: 'r-kumar',           canonical: false },
  { source: 't-trading-desk',      target: 'p-sundaram',        canonical: false },
  { source: 't-compliance',        target: 't-bu-renewables',   canonical: false },
  { source: 't-vendor-liaison',    target: 'oem-ge-9ha-manual', canonical: false },
  { source: 't-procurement',       target: 't-vendor-liaison',  canonical: false },
  { source: 't-bu-renewables',     target: 'bu-power-gen',      canonical: false },
  { source: 't-bu-networks',       target: 't-bu-renewables',   canonical: false },

  // L2 intra (sister-block asset chains)
  { source: 't-gt-1',       target: 't-hrsg-1',      canonical: false },
  { source: 't-hrsg-1',     target: 't-bfp-1a',      canonical: false },
  { source: 't-hrsg-1',     target: 't-bfp-1b',      canonical: false },
  { source: 't-hrsg-1',     target: 't-condenser-1', canonical: false },
  { source: 't-gt-2',       target: 't-hrsg-2',      canonical: false },
  { source: 't-hrsg-2',     target: 't-bfp-2a',      canonical: false },
  { source: 't-hrsg-2',     target: 't-bfp-2b',      canonical: false },
  { source: 't-hrsg-2',     target: 't-condenser-2', canonical: false },
  { source: 'gt-3',         target: 't-gas-vlv-1',   canonical: false },
  { source: 'gt-3',         target: 't-stack',       canonical: false },
  { source: 'gt-3',         target: 't-instr-pi-tags', canonical: false },
  { source: 'condenser-3',  target: 't-cooling-tower', canonical: false },
  { source: 't-condenser-1',target: 't-cooling-tower', canonical: false },
  { source: 't-condenser-2',target: 't-cooling-tower', canonical: false },

  // L2 cross-block sibling links
  { source: 'gt-3',   target: 't-gt-1', canonical: false },
  { source: 'gt-3',   target: 't-gt-2', canonical: false },
  { source: 't-gt-1', target: 't-gt-2', canonical: false },

  // L3 intra
  { source: 't-outage-2025-q3', target: 't-outage-2024-q2',   canonical: false },
  { source: 't-sb-ge-001',      target: 'oem-ge-9ha-manual',  canonical: false },
  { source: 't-sb-ge-014',      target: 'oem-ge-9ha-manual',  canonical: false },
  { source: 't-sb-ge-014',      target: 'pat-igv-drift',      canonical: false },
  { source: 't-calib-log',      target: 't-instr-pi-tags',    canonical: false },
  { source: 't-hse-incidents',  target: 'audit-iso50001',     canonical: false },
  { source: 't-ops-shift-notes',target: 'r-kumar',            canonical: false },
  { source: 't-wo-2025',        target: 'wo-log-47',          canonical: false },
  { source: 't-emissions-cert', target: 'audit-iso50001',     canonical: false },
  { source: 't-iec-61850',      target: 'switchyard-a',       canonical: false },

  // L4 intra + cross-links
  { source: 't-mdl-plant-mw',   target: 'pred-mw-derate',   canonical: false },
  { source: 't-mdl-demand',     target: 't-mdl-plant-mw',   canonical: false },
  { source: 't-mdl-retail',     target: 't-trading-desk',   canonical: false },
  { source: 't-mdl-heat-rate',  target: 'mdl-humidity-v3',  canonical: false },
  { source: 't-mdl-emissions',  target: 't-emissions-cert', canonical: false },
  { source: 't-mdl-startup',    target: 't-rec-shutdown',   canonical: false },
  { source: 't-rec-spares',     target: 't-procurement',    canonical: false },
  { source: 't-pred-trip-prob', target: 'pat-comp-fouling', canonical: false },
  { source: 't-pred-trip-prob', target: 'pat-igv-drift',    canonical: false },
  { source: 't-rec-shutdown',   target: 'roi-wash',         canonical: false },

  // Cross-layer L1 → L2
  { source: 't-supervisor-onsite', target: 'gt-3',            canonical: false },
  { source: 't-supervisor-shift',  target: 't-instr-pi-tags', canonical: false },
  { source: 't-vendor-liaison',    target: 'gt-3',            canonical: false },
  { source: 't-procurement',       target: 't-bfp-2a',        canonical: false },

  // Cross-layer L2 → L3
  { source: 't-gt-1',   target: 't-outage-2025-q3', canonical: false },
  { source: 't-gt-2',   target: 't-outage-2024-q2', canonical: false },
  { source: 't-hrsg-1', target: 't-wo-2025',        canonical: false },

  // Cross-layer L3 → L4
  { source: 't-outage-2025-q3', target: 't-mdl-plant-mw',   canonical: false },
  { source: 't-sb-ge-014',      target: 't-pred-trip-prob', canonical: false },

  // Cross-layer L4 → L1
  { source: 't-rec-spares',     target: 'p-sundaram',     canonical: false },
  { source: 'rec-oem-playbook', target: 't-vendor-liaison', canonical: false },
];

KG_EDGES.push(...KG_THEATER_EDGES);

const KG_STATE = {
  graph: null,
  activeChain: new Set(),
  pinnedChain: new Set(),
  autoRotateTimer: null,
  layerTitles: [],
};

// ── W3.5: helpers for billboarded canvas-based sprites ──
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function buildNodeLabel(node) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const fontSize = 28;
  const padX = 16;
  const padY = 8;

  ctx.font = `600 ${fontSize}px ui-monospace, "SF Mono", monospace`;
  const textW = ctx.measureText(node.label).width;
  const canvasW = Math.ceil(textW + padX * 2);
  const canvasH = fontSize + padY * 2;

  canvas.width = canvasW;
  canvas.height = canvasH;
  ctx.font = `600 ${fontSize}px ui-monospace, "SF Mono", monospace`;

  ctx.fillStyle = 'rgba(10,15,28,0.78)';
  roundRect(ctx, 0, 0, canvasW, canvasH, 8);
  ctx.fill();

  ctx.fillStyle = KG_LAYER_COLORS[node.layer];
  ctx.fillRect(0, 0, 4, canvasH);

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(node.label, padX, canvasH / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(canvasW / 4, canvasH / 4, 1);
  sprite.position.set(7, 0, 0);
  sprite.renderOrder = 10;
  return sprite;
}

function buildLayerTitle(layerId, name, color, yPos) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const padX = 18;
  const padY = 10;
  const layerFontSize = 38;
  const nameFontSize = 22;

  ctx.font = `800 ${layerFontSize}px ui-monospace, "SF Mono", monospace`;
  const layerW = ctx.measureText(layerId).width;
  ctx.font = `600 ${nameFontSize}px ui-monospace, "SF Mono", monospace`;
  const nameW = ctx.measureText(name).width;
  const textW = Math.max(layerW, nameW);
  const canvasW = Math.ceil(textW + padX * 2);
  const canvasH = layerFontSize + nameFontSize + padY * 3;

  canvas.width = canvasW;
  canvas.height = canvasH;

  ctx.fillStyle = 'rgba(10,15,28,0.85)';
  roundRect(ctx, 0, 0, canvasW, canvasH, 10);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 6, canvasH);

  ctx.font = `800 ${layerFontSize}px ui-monospace, "SF Mono", monospace`;
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(layerId, padX, padY);

  ctx.font = `600 ${nameFontSize}px ui-monospace, "SF Mono", monospace`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(name, padX, padY + layerFontSize + 4);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(canvasW / 3.5, canvasH / 3.5, 1);
  sprite.position.set(-120, yPos, 0);
  sprite.renderOrder = 9;
  return sprite;
}

const KG_LAYER_NAMES = {
  L1: 'People & Process',
  L2: 'Physical Plant',
  L3: 'Historical State',
  L4: 'Predictive Intelligence',
};

function hexWithAlpha(hex, alpha) {
  const m = hex.replace('#', '').match(/.{2}/g);
  return `rgba(${parseInt(m[0], 16)},${parseInt(m[1], 16)},${parseInt(m[2], 16)},${alpha})`;
}

function fallbackToCSS() {
  const mount = document.getElementById('kg-3d-mount');
  const fallback = document.getElementById('kg-css-fallback');
  if (mount) mount.style.display = 'none';
  if (fallback) fallback.style.display = '';
}

function isInChain(id) {
  return KG_STATE.activeChain.has(id) || KG_STATE.pinnedChain.has(id);
}
function anyChainActive() {
  return KG_STATE.activeChain.size > 0 || KG_STATE.pinnedChain.size > 0;
}

function nodeOpacityFor(node) {
  if (isInChain(node.id)) return 1.0;
  if (anyChainActive()) return 0.20;
  return node.canonical ? 0.90 : 0.65;
}

function chainContainsLink(link) {
  const s = link.source.id || link.source;
  const t = link.target.id || link.target;
  const inActive = KG_STATE.activeChain.has(s) && KG_STATE.activeChain.has(t);
  const inPinned = KG_STATE.pinnedChain.has(s) && KG_STATE.pinnedChain.has(t);
  return inActive || inPinned;
}

function startAutoRotate() {
  if (!KG_STATE.graph) return;
  if (KG_STATE.autoRotateTimer) return;
  let angle = 0;
  KG_STATE.autoRotateTimer = setInterval(() => {
    angle += 0.002;  // ~0.3 rpm
    const distance = 280;
    KG_STATE.graph.cameraPosition({
      x: distance * Math.sin(angle),
      y: 0,
      z: distance * Math.cos(angle),
    }, { x: 0, y: 0, z: 0 }, 0);
  }, 40);
}

function stopAutoRotate() {
  if (KG_STATE.autoRotateTimer) {
    clearInterval(KG_STATE.autoRotateTimer);
    KG_STATE.autoRotateTimer = null;
  }
}

function refreshKGStyles() {
  if (!KG_STATE.graph) return;
  // Re-trigger node + link accessors to repaint chain highlight state.
  // nodeThreeObject rebuilds the per-node Group; link accessors repaint edges.
  KG_STATE.graph
    .nodeThreeObject(KG_STATE.graph.nodeThreeObject())
    .linkColor(KG_STATE.graph.linkColor())
    .linkWidth(KG_STATE.graph.linkWidth());
}

function initKG3D() {
  const mount = document.getElementById('kg-3d-mount');
  if (!mount) return;

  if (typeof ForceGraph3D === 'undefined' || typeof THREE === 'undefined') {
    console.warn('[KG] three.js or 3d-force-graph failed to load. Falling back to CSS scaffold.');
    fallbackToCSS();
    return;
  }

  try {
    // Pin Y per layer — 3d-force-graph respects fy on node data
    const nodes = KG_NODES.map(n => ({ ...n, fy: n.y }));

    const graph = ForceGraph3D()(mount)
      .graphData({ nodes, links: KG_EDGES })
      .nodeId('id')
      .nodeLabel(node => `<div style="background:#0A0F1C;color:#fff;padding:5px 9px;border:1px solid rgba(255,255,255,0.35);border-radius:4px;font-size:11px;font-family:'SF Mono',monospace;white-space:nowrap;"><strong>${node.label}</strong><br><span style="color:${KG_LAYER_COLORS[node.layer]};font-weight:700;font-size:9.5px;letter-spacing:.1em;">${node.layer}</span></div>`)
      .nodeThreeObject(node => {
        const radius = isInChain(node.id) ? 4.5 : 3;
        const group = new THREE.Group();
        const sphereGeo = new THREE.SphereGeometry(radius, 24, 16);
        const sphereMat = new THREE.MeshBasicMaterial({
          color: KG_LAYER_COLORS[node.layer],
          transparent: true,
          opacity: nodeOpacityFor(node),
        });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        group.add(sphere);
        // White halo — thin back-face shell (W3.5: deeper border)
        const ringGeo = new THREE.SphereGeometry(radius * 1.18, 24, 16);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xFFFFFF,
          transparent: true,
          opacity: nodeOpacityFor(node) * 0.95,
          side: THREE.BackSide,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        group.add(ring);
        // W3.5: persistent billboarded label sprite to the right of the sphere
        const label = buildNodeLabel(node);
        group.add(label);
        return group;
      })
      .nodeThreeObjectExtend(false)
      .linkColor(link => {
        if (chainContainsLink(link)) return '#FFFFFF';
        return link.canonical ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.10)';
      })
      .linkWidth(link => {
        if (chainContainsLink(link)) return 3.0;
        return link.canonical ? 1.2 : 0.5;
      })
      .linkOpacity(0.85)
      .backgroundColor('#0A0F1C')
      .showNavInfo(false)
      .enableNodeDrag(true)
      .width(mount.clientWidth || 460)
      .height(mount.clientHeight || 320)
      .onNodeClick(node => {
        const dist = 100;
        const hyp = Math.hypot(node.x || 0, node.y || 0, node.z || 0) || 1;
        const ratio = 1 + dist / hyp;
        graph.cameraPosition(
          { x: (node.x || 0) * ratio, y: (node.y || 0) * ratio, z: (node.z || 0) * ratio },
          node,
          800
        );
      });

    // Disable default y force (we pin Y via fy on node data)
    graph.d3Force('y', null);
    if (graph.d3Force('charge')) graph.d3Force('charge').strength(-80);
    if (graph.d3Force('link'))   graph.d3Force('link').distance(35);

    graph.cameraPosition({ x: -20, y: 0, z: 300 }, { x: 0, y: 0, z: 0 }, 0);

    // W3.5: mount 4 floating layer titles to the left of the graph
    const scene = graph.scene();
    KG_STATE.layerTitles = [];
    Object.entries(KG_LAYER_NAMES).forEach(([layerId, name]) => {
      const sprite = buildLayerTitle(layerId, name, KG_LAYER_COLORS[layerId], LAYER_Y[layerId]);
      scene.add(sprite);
      KG_STATE.layerTitles.push(sprite);
    });

    // W3.5: hide node labels when camera zoomed far out (reduces clutter)
    if (typeof graph.onAfterRender === 'function') {
      graph.onAfterRender(() => {
        const cam = graph.camera();
        if (!cam) return;
        const distance = cam.position.length();
        const hideLabels = distance > 700;
        graph.graphData().nodes.forEach(n => {
          if (n.__threeObj) {
            const labelSprite = n.__threeObj.children.find(c => c.isSprite);
            if (labelSprite) labelSprite.visible = !hideLabels;
          }
        });
      });
    }

    KG_STATE.graph = graph;
    startAutoRotate();

    // Pause rotation on user interaction
    mount.addEventListener('mousedown', stopAutoRotate);
    mount.addEventListener('wheel', stopAutoRotate);
    mount.addEventListener('touchstart', stopAutoRotate, { passive: true });

    window.addEventListener('resize', () => {
      graph.width(mount.clientWidth).height(mount.clientHeight);
    });

    console.log('[KG] 3D force-graph initialized.', KG_NODES.length, 'nodes,', KG_EDGES.length, 'edges.');

  } catch (err) {
    console.error('[KG] initKG3D threw — falling back to CSS scaffold.', err);
    fallbackToCSS();
  }
}

// Public API — consumed by W3+ for CoT-line hover/stream → node-chain highlight
window.KG = {
  setNodeChain(nodeIds) {
    KG_STATE.activeChain = new Set(nodeIds);
    stopAutoRotate();
    refreshKGStyles();
  },
  clearNodeChain() {
    KG_STATE.activeChain.clear();
    refreshKGStyles();
    if (KG_STATE.pinnedChain.size === 0) startAutoRotate();
  },
  pinNodeChain(nodeIds) {
    KG_STATE.pinnedChain = new Set(nodeIds);
    stopAutoRotate();
    refreshKGStyles();
  },
  unpinNodeChain() {
    KG_STATE.pinnedChain.clear();
    refreshKGStyles();
    if (KG_STATE.activeChain.size === 0) startAutoRotate();
  },
};

// ─────────────────────────────────────────────
// Orchestrator dispatch log — streaming queue (Wave 3.1)
// Plumbing only. CoT scripts arrive W3.2.
// ─────────────────────────────────────────────

const LOG_STATE = {
  lines: [],
  maxVisible: 5,
  pinnedLineId: null,
  hoveredLineId: null,
  collapsedExpanded: false,
  nextId: 1,
};

const LOG_SOURCE_COLORS = {
  orchestrator:        'var(--green-vivid)',
  inspection:          'var(--blue-vivid)',
  triage:              'var(--blue-vivid)',
  'diag-hrsg':         'var(--blue-vivid)',
  'diag-electrical':   'var(--blue-vivid)',
  playbook:            'var(--blue-vivid)',
  'wo-prefill':        'var(--blue-vivid)',
  workflow:            'var(--blue-vivid)',
  learning:            'var(--blue-vivid)',
  'critic-power-gen':  'var(--amber-vivid)',
  'critic-renewables': 'var(--amber-vivid)',
  'critic-networks':   'var(--amber-vivid)',
  hse:                 'var(--pink-vivid)',
  pl:                  'var(--pink-vivid)',
};

const AGENT_DISPLAY_NAMES = {
  orchestrator:        'Orchestrator',
  inspection:          'Sensor Anomaly Inspector',
  triage:              'Turbine Diagnostic Agent',
  'diag-hrsg':         'HRSG · Boiler Diagnostic Agent',
  'diag-electrical':   'Generator · Electrical Diagnostic Agent',
  playbook:            'Compressor Wash Playbook Agent',
  'wo-prefill':        'Work Order Pre-fill Agent',
  workflow:            'Workflow Agent',
  learning:            'Learning Engine',
  'critic-power-gen':  'Critic · Power Gen',
  'critic-renewables': 'Critic · Renewables',
  'critic-networks':   'Critic · Networks',
  hse:                 'HSE Risk Validator',
  pl:                  'P&L Impact Validator',
};

function visibleLines() {
  return LOG_STATE.lines.slice(-LOG_STATE.maxVisible);
}
function collapsedLines() {
  return LOG_STATE.lines.length > LOG_STATE.maxVisible
    ? LOG_STATE.lines.slice(0, LOG_STATE.lines.length - LOG_STATE.maxVisible)
    : [];
}

function appendLogLine(payload) {
  const { ts, source, text, dataSource, nodeChain = [] } = payload;
  const id = LOG_STATE.nextId++;
  const line = { id, ts, source, text, dataSource, nodeChain, el: null };

  const validIds = new Set(KG_NODES.map(n => n.id));
  const invalidChainIds = nodeChain.filter(nid => !validIds.has(nid));
  if (invalidChainIds.length > 0) {
    console.warn('[LOG] appendLine has nodeChain referencing unknown KG node IDs:', invalidChainIds);
  }

  LOG_STATE.lines.push(line);

  const body = document.getElementById('orch-log-body');
  if (!body) return id;

  // Find the last .log-group (skip the accordion that lives at index 0)
  const groups = body.querySelectorAll('.log-group');
  const lastGroup = groups.length > 0 ? groups[groups.length - 1] : null;

  let group;
  if (lastGroup && lastGroup.dataset.source === source) {
    // Same agent → demote prior active step in this group to done
    const prevActive = lastGroup.querySelector('.log-step[data-state="active"]');
    if (prevActive) prevActive.dataset.state = 'done';
    group = lastGroup;
  } else {
    // New agent group → demote prior group's active step to done
    if (lastGroup) {
      const prevActive = lastGroup.querySelector('.log-step[data-state="active"]');
      if (prevActive) prevActive.dataset.state = 'done';
    }
    group = buildLogGroup(source);
    body.appendChild(group);
  }

  const stepEl = buildLogStep(line);
  group.querySelector('.log-steps').appendChild(stepEl);
  line.el = stepEl;

  reconcileVisibility();
  rerenderAccordion();

  // Pulse the matching agent card
  pulseAgentEngagement(source);

  requestAnimationFrame(() => stepEl.classList.add('orch-line-in'));

  updateLogCountBadge();

  return id;
}

function buildLogGroup(source) {
  const group = document.createElement('div');
  group.className = 'log-group';
  group.dataset.source = source;
  group.style.setProperty('--src-color', LOG_SOURCE_COLORS[source] || 'var(--text-muted)');
  group.innerHTML = `
    <div class="log-group-hdr">
      <span class="log-engage-prefix">engaging</span>
      <span class="log-agent-name">${AGENT_DISPLAY_NAMES[source] || source}</span>
    </div>
    <div class="log-steps"></div>
  `;
  return group;
}

function buildLogStep(line) {
  const el = document.createElement('div');
  el.className = 'log-step';
  el.dataset.lineId = line.id;
  el.dataset.state = 'active';
  el.dataset.source = line.source;

  const tagHtml = line.dataSource
    ? `<span class="log-step-tag">${line.dataSource}</span>`
    : '';
  const nodesHtml = line.nodeChain && line.nodeChain.length > 0
    ? `<span class="log-step-nodes">${line.nodeChain.map(n => `<span class="log-step-node">${n}</span>`).join('')}</span>`
    : '';

  el.innerHTML = `
    <span class="log-step-bullet"></span>
    <span class="log-step-ts">${line.ts}</span>
    <span class="log-step-text">${line.text}</span>
    ${tagHtml}
    ${nodesHtml}
  `;

  el.addEventListener('mouseenter', () => onLineHoverEnter(line.id));
  el.addEventListener('mouseleave', () => onLineHoverLeave(line.id));
  el.addEventListener('click', () => onLineClick(line.id));

  return el;
}

function reconcileVisibility() {
  const all = LOG_STATE.lines;
  const visibleStartIdx = Math.max(0, all.length - LOG_STATE.maxVisible);

  all.forEach((line, idx) => {
    if (!line.el) return;
    if (idx < visibleStartIdx) {
      line.el.dataset.collapsed = 'true';
    } else {
      delete line.el.dataset.collapsed;
    }
  });

  // Hide groups whose ALL steps are collapsed
  document.querySelectorAll('.log-group').forEach(group => {
    const steps = group.querySelectorAll('.log-step');
    const allCollapsed = steps.length > 0 && Array.from(steps).every(s => s.dataset.collapsed === 'true');
    if (allCollapsed) group.dataset.collapsed = 'true';
    else delete group.dataset.collapsed;
  });
}

function rerenderAccordion() {
  const body = document.getElementById('orch-log-body');
  if (!body) return;

  const existing = body.querySelector('.orch-accordion');
  if (existing) existing.remove();

  const collapsed = collapsedLines();
  if (collapsed.length === 0) {
    body.classList.remove('log-accordion-expanded');
    return;
  }

  const acc = document.createElement('div');
  acc.className = 'orch-accordion';
  if (LOG_STATE.collapsedExpanded) {
    acc.classList.add('orch-accordion-expanded');
    body.classList.add('log-accordion-expanded');
  } else {
    body.classList.remove('log-accordion-expanded');
  }

  acc.innerHTML = `
    <div class="orch-accordion-toggle">
      <span class="orch-accordion-chev">▾</span>
      <span class="orch-accordion-lbl">${collapsed.length} earlier step${collapsed.length === 1 ? '' : 's'}</span>
    </div>
  `;

  acc.querySelector('.orch-accordion-toggle').addEventListener('click', () => {
    LOG_STATE.collapsedExpanded = !LOG_STATE.collapsedExpanded;
    acc.classList.toggle('orch-accordion-expanded');
    body.classList.toggle('log-accordion-expanded');
  });

  body.insertBefore(acc, body.firstChild);
}

function onLineHoverEnter(lineId) {
  if (LOG_STATE.pinnedLineId !== null) return;
  const line = LOG_STATE.lines.find(l => l.id === lineId);
  if (!line) return;
  LOG_STATE.hoveredLineId = lineId;
  if (window.KG && line.nodeChain.length > 0) {
    window.KG.setNodeChain(line.nodeChain);
  }
}

function onLineHoverLeave(lineId) {
  if (LOG_STATE.pinnedLineId !== null) return;
  LOG_STATE.hoveredLineId = null;
  if (window.KG) {
    window.KG.clearNodeChain();
  }
}

function onLineClick(lineId) {
  const line = LOG_STATE.lines.find(l => l.id === lineId);
  if (!line) return;

  if (LOG_STATE.pinnedLineId === lineId) {
    LOG_STATE.pinnedLineId = null;
    line.el.classList.remove('log-step-pinned');
    if (window.KG) window.KG.unpinNodeChain();
    return;
  }

  if (LOG_STATE.pinnedLineId !== null) {
    const prev = LOG_STATE.lines.find(l => l.id === LOG_STATE.pinnedLineId);
    if (prev && prev.el) prev.el.classList.remove('log-step-pinned');
  }

  LOG_STATE.pinnedLineId = lineId;
  line.el.classList.add('log-step-pinned');
  if (window.KG && line.nodeChain.length > 0) {
    window.KG.pinNodeChain(line.nodeChain);
  }
}

function pulseAgentEngagement(source) {
  const card = document.querySelector(`.agent-card[data-agent-id="${source}"]`);
  if (!card) return;
  card.classList.remove('agent-engage-pulse');
  void card.offsetWidth;  // force reflow so animation re-triggers
  card.classList.add('agent-engage-pulse');
  setTimeout(() => card.classList.remove('agent-engage-pulse'), 1550);
}

window.LOG = {
  appendLine(payload) { return appendLogLine(payload); },
  clearAll() {
    const body = document.getElementById('orch-log-body');
    if (body) body.querySelectorAll('.log-group, .orch-accordion').forEach(n => n.remove());
    LOG_STATE.lines = [];
    LOG_STATE.pinnedLineId = null;
    LOG_STATE.hoveredLineId = null;
    LOG_STATE.collapsedExpanded = false;
    if (body) body.classList.remove('log-accordion-expanded');
    if (window.KG) {
      window.KG.clearNodeChain();
      window.KG.unpinNodeChain();
    }
  },
  state() {
    return {
      visibleCount: visibleLines().length,
      totalCount: LOG_STATE.lines.length,
      pinned: LOG_STATE.pinnedLineId,
    };
  },
};

// ─────────────────────────────────────────────
// P1 arc — agent CoT scripts + sequencer (Wave 3.2)
// Hardcoded reasoning sequences. Each step = log line payload + tree label.
// Sequencer chains scripts via timed setTimeout.
// ─────────────────────────────────────────────

const INSPECTION_AGENT_SCRIPT = {
  agentId: 'inspection',
  durationMs: 5000,
  taskTreeLabel: 'KG Lookup + Cross-Layer Impact',
  steps: [
    {
      log: { ts: '02:47:10', source: 'inspection', text: 'sensor anomaly · GT-3 exhaust thermocouple TT-3-EXH-B7', dataSource: 'OSIsoft PI System', nodeChain: ['gt-3'] },
      treeLabel: 'Fetch sensor anomaly',
      delayMs: 200,
    },
    {
      log: { ts: '02:47:11', source: 'inspection', text: 'KG lookup · GT-3 node located · 4 inbound connections', nodeChain: ['gt-3'] },
      treeLabel: 'Locate node on KG',
      delayMs: 700,
    },
    {
      log: { ts: '02:47:12', source: 'inspection', text: 'L2 traverse · asset chain confirmed · GT-3 → HRSG-3 → Condenser-3', nodeChain: ['gt-3', 'hrsg-3', 'condenser-3'] },
      treeLabel: 'L2 · trace asset chain',
      delayMs: 700,
    },
    {
      log: { ts: '02:47:13', source: 'inspection', text: 'L3 traverse · 90d exhaust temp · 47 prior WOs', dataSource: 'Maximo', nodeChain: ['gt-3-90d-temp', 'wo-log-47', 'pi-18mo'] },
      treeLabel: 'L3 · retrieve history',
      delayMs: 800,
    },
    {
      log: { ts: '02:47:14', source: 'inspection', text: 'L3 traverse · 3 RCA matches · Sakra + Jurong fouling history', dataSource: 'Maximo', nodeChain: ['rca-2025-014-sakra', 'rca-2024-093-jurong', 'rca-2025-031-jurong2'] },
      treeLabel: 'L3 · match prior RCAs',
      delayMs: 800,
    },
    {
      log: { ts: '02:47:15', source: 'inspection', text: 'L4 traverse · pattern · compressor fouling · humidity-correlated · 78% confidence', nodeChain: ['pat-comp-fouling', 'mdl-humidity-v3'] },
      treeLabel: 'L4 · predictive pattern match',
      delayMs: 800,
    },
  ],
};

const ORCHESTRATOR_DISPATCH_LINES = [
  { ts: '02:47:16', source: 'orchestrator', text: 'received inspection findings · handing to Triage Agent', nodeChain: [] },
];

const TRIAGE_AGENT_SCRIPT = {
  agentId: 'triage',
  durationMs: 3500,
  taskTreeLabel: 'Diagnosis Hypothesis',
  steps: [
    {
      log: { ts: '02:47:17', source: 'triage', text: 'diagnosis hypothesis · compressor fouling at GT-3', nodeChain: ['gt-3', 'pat-comp-fouling'] },
      treeLabel: 'Form hypothesis',
      delayMs: 200,
    },
    {
      log: { ts: '02:47:18', source: 'triage', text: 'pattern-match · 3 prior RCAs validate · humidity-correlated', nodeChain: ['rca-2025-014-sakra', 'rca-2024-093-jurong', 'mdl-humidity-v3'] },
      treeLabel: 'Cross-check prior RCAs',
      delayMs: 800,
    },
    {
      log: { ts: '02:47:19', source: 'triage', text: 'recommendation · compressor wash cycle · per GE 9HA OEM playbook', nodeChain: ['oem-ge-9ha-manual', 'rec-oem-playbook'] },
      treeLabel: 'Generate recommendation',
      delayMs: 800,
    },
    {
      log: { ts: '02:47:20', source: 'triage', text: 'synthesis · 78% confidence · passing to Power Gen Critic', nodeChain: ['pat-comp-fouling'] },
      treeLabel: 'Pass to critic',
      delayMs: 800,
    },
  ],
};

const POWER_GEN_CRITIC_SCRIPT = {
  agentId: 'critic-power-gen',
  durationMs: 2400,
  taskTreeLabel: 'Validate Diagnosis Chain',
  steps: [
    {
      log: { ts: '02:47:21', source: 'critic-power-gen', text: 'backwards KG walk · validating humidity-fouling chain', nodeChain: ['pat-comp-fouling', 'mdl-humidity-v3', 'gt-3-90d-temp'] },
      treeLabel: 'Walk KG path backwards',
      delayMs: 200,
    },
    {
      log: { ts: '02:47:22', source: 'critic-power-gen', text: 'domain rule check · GE 9HA wash-cycle ROI · PASS', nodeChain: ['oem-ge-9ha-manual', 'roi-wash'] },
      treeLabel: 'Domain rule check',
      delayMs: 1000,
    },
    {
      log: { ts: '02:47:23', source: 'critic-power-gen', text: 'diagnosis VALIDATED · surfacing to tablet', nodeChain: ['pat-comp-fouling', 'gt-3'] },
      treeLabel: 'Validate + surface',
      delayMs: 1000,
    },
  ],
};

const ORCHESTRATOR_CLOSE_LINES = [
  { ts: '02:47:24', source: 'orchestrator', text: 'diagnosis ready · INC-2026-0537 · state: REVIEW READY', nodeChain: [] },
];

// Wave 3.4 — Workflow Agent (fires on Dispatch CTA → captures SOP trace)
const WORKFLOW_AGENT_SCRIPT = {
  agentId: 'workflow',
  durationMs: 2500,
  taskTreeLabel: 'Capture SOP Trace',
  steps: [
    {
      log: { ts: '02:47:48', source: 'workflow', text: 'Sembcorp CCGT-1 · incident workflow trace captured · INC-2026-0537', nodeChain: ['gt-3', 'r-kumar'] },
      treeLabel: 'Capture trace',
      delayMs: 200,
    },
    {
      log: { ts: '02:47:49', source: 'workflow', text: 'dispatch sequence recorded · P1 Ops Tower → P2 Onsite · 02:47:48 SGT', nodeChain: ['r-kumar', 'lim-wei-jie'] },
      treeLabel: 'Record dispatch sequence',
      delayMs: 900,
    },
    {
      log: { ts: '02:47:50', source: 'workflow', text: 'SOP registered for process-engineer review · 0 deviations from standard', nodeChain: ['raci-derate', 'esc-pso'] },
      treeLabel: 'Register SOP for review',
      delayMs: 900,
    },
  ],
};

// ── Agent-card helpers (Wave 3.3 — inline task-tree removed; log strip is primary surface) ──
function setAgentActive(agentId, taskTreeLabel, totalSteps) {
  if (state.activeAgentId && state.activeAgentId !== agentId) {
    teardownAgentTree(state.activeAgentId);
  }
  state.activeAgentId = agentId;
  state.agentStepIndex[agentId] = 0;

  const card = document.querySelector(`.agent-card[data-agent-id="${agentId}"]`);
  if (!card) return;
  card.classList.add('agent-active');
  card.classList.remove('agent-done');

  const tree = card.querySelector('.agent-tree');
  if (tree) tree.remove();

  ensureStepPill(card, 0, totalSteps);
}

function ensureStepPill(card, currentStep, totalSteps) {
  let pill = card.querySelector('.agent-step-pill');
  if (!pill) {
    pill = document.createElement('span');
    pill.className = 'agent-step-pill';
    card.appendChild(pill);
  }
  pill.textContent = `${currentStep}/${totalSteps}`;
  pill.classList.remove('idle', 'done');
  pill.dataset.total = totalSteps;
}

function advanceAgentStep(agentId, stepIdx, step) {
  state.agentStepIndex[agentId] = stepIdx + 1;
  const card = document.querySelector(`.agent-card[data-agent-id="${agentId}"]`);
  if (!card) return;

  const pill = card.querySelector('.agent-step-pill');
  const total = pill ? +(pill.dataset.total || 0) : 0;
  if (pill) ensureStepPill(card, stepIdx + 1, total);
}

function teardownAgentTree(agentId) {
  const card = document.querySelector(`.agent-card[data-agent-id="${agentId}"]`);
  if (!card) return;
  card.classList.remove('agent-active');
  card.classList.add('agent-done');

  const tree = card.querySelector('.agent-tree');
  if (tree) tree.remove();

  const pill = card.querySelector('.agent-step-pill');
  if (pill) {
    const total = pill.dataset.total || '';
    pill.textContent = `${total}/${total}`;
    pill.classList.add('done');
  }
}

// ── Sequencer ──
function dispatchP1Arc() {
  // Re-runnable: clear any prior timers
  state.arcTimers.forEach(t => clearTimeout(t));
  state.arcTimers = [];

  state.incidentPhase = 'TRIAGING';
  rerenderMonitoringIfVisible();

  let t = 0;

  // 1. Inspection Agent
  t += 200;
  scheduleArcStep(t, () => {
    setAgentActive(INSPECTION_AGENT_SCRIPT.agentId, INSPECTION_AGENT_SCRIPT.taskTreeLabel, INSPECTION_AGENT_SCRIPT.steps.length);
  });
  INSPECTION_AGENT_SCRIPT.steps.forEach((step, idx) => {
    t += step.delayMs;
    scheduleArcStep(t, () => {
      window.LOG.appendLine(step.log);
      advanceAgentStep(INSPECTION_AGENT_SCRIPT.agentId, idx, step);
    });
  });
  t += 400;
  scheduleArcStep(t, () => teardownAgentTree(INSPECTION_AGENT_SCRIPT.agentId));

  // 2. Orchestrator handoff
  ORCHESTRATOR_DISPATCH_LINES.forEach(line => {
    t += 400;
    scheduleArcStep(t, () => window.LOG.appendLine(line));
  });

  // 3. Triage Agent
  t += 200;
  scheduleArcStep(t, () => {
    setAgentActive(TRIAGE_AGENT_SCRIPT.agentId, TRIAGE_AGENT_SCRIPT.taskTreeLabel, TRIAGE_AGENT_SCRIPT.steps.length);
  });
  TRIAGE_AGENT_SCRIPT.steps.forEach((step, idx) => {
    t += step.delayMs;
    scheduleArcStep(t, () => {
      window.LOG.appendLine(step.log);
      advanceAgentStep(TRIAGE_AGENT_SCRIPT.agentId, idx, step);
    });
  });
  t += 400;
  scheduleArcStep(t, () => teardownAgentTree(TRIAGE_AGENT_SCRIPT.agentId));

  // 4. Power Gen Critic
  t += 200;
  scheduleArcStep(t, () => {
    setAgentActive(POWER_GEN_CRITIC_SCRIPT.agentId, POWER_GEN_CRITIC_SCRIPT.taskTreeLabel, POWER_GEN_CRITIC_SCRIPT.steps.length);
  });
  POWER_GEN_CRITIC_SCRIPT.steps.forEach((step, idx) => {
    t += step.delayMs;
    scheduleArcStep(t, () => {
      window.LOG.appendLine(step.log);
      advanceAgentStep(POWER_GEN_CRITIC_SCRIPT.agentId, idx, step);
    });
  });
  t += 400;
  scheduleArcStep(t, () => teardownAgentTree(POWER_GEN_CRITIC_SCRIPT.agentId));

  // 5. Orchestrator close
  ORCHESTRATOR_CLOSE_LINES.forEach(line => {
    t += 400;
    scheduleArcStep(t, () => window.LOG.appendLine(line));
  });

  // 6. Phase: TRIAGING → REVIEW_READY
  t += 300;
  scheduleArcStep(t, () => {
    state.incidentPhase = 'REVIEW_READY';
    state.activeAgentId = null;
    rerenderMonitoringIfVisible();
  });
}

function scheduleArcStep(delayMs, fn) {
  const handle = setTimeout(fn, delayMs);
  state.arcTimers.push(handle);
}

function rerenderMonitoringIfVisible() {
  // Re-render only when a monitoring screen (or incident detail) is visible
  if (state.screen === 'monitoring-landed' ||
      state.screen === 'monitoring-notify' ||
      state.screen === 'monitoring' ||
      state.screen === 'incident-detail') {
    render();
  }
}

function seedLogLines() {
  appendLogLine({
    ts: '02:47:03',
    source: 'orchestrator',
    text: 'idle · monitoring incident channel',
    nodeChain: [],
  });
  appendLogLine({
    ts: '02:47:07',
    source: 'inspection',
    text: 'sensor anomaly · GT-3 exhaust thermocouple TT-3-EXH-B7',
    dataSource: 'OSIsoft PI System',
    nodeChain: ['gt-3'],
  });
  appendLogLine({
    ts: '02:47:08',
    source: 'orchestrator',
    text: 'received INC-2026-0537 · JRG-CCGT-1 · Block 2 · GT-3',
    nodeChain: ['gt-3', 'r-kumar'],
  });
  appendLogLine({
    ts: '02:47:08',
    source: 'orchestrator',
    text: 'severity AMBER · dispatching Inspection Agent · scope: KG lookup + cross-layer impact',
    nodeChain: ['gt-3'],
  });
  appendLogLine({
    ts: '02:47:09',
    source: 'orchestrator',
    text: 'standby · awaiting inspection findings',
    nodeChain: [],
  });
}

// ─────────────────────────────────────────────
// Right-pane toolbar + floating KG window (Wave 3.4)
// ─────────────────────────────────────────────

function updateLogCountBadge() {
  const badge = document.getElementById('rp-logs-count');
  if (badge) badge.textContent = String(LOG_STATE.lines.length);
}

function updateGraphCountBadge() {
  const badge = document.getElementById('rp-graph-count');
  if (badge) badge.textContent = `${KG_NODES.length} nodes · ${KG_EDGES.length} edges`;
}

function toggleLogDropdown() {
  state.logDropdownOpen = !state.logDropdownOpen;
  const dropdown = document.getElementById('log-dropdown');
  const btn = document.getElementById('btn-display-logs');
  if (!dropdown || !btn) return;
  dropdown.dataset.open = state.logDropdownOpen ? 'true' : 'false';
  btn.classList.toggle('rp-toggle-active', state.logDropdownOpen);
  const icon = btn.querySelector('.rp-toggle-icon');
  if (icon) icon.textContent = state.logDropdownOpen ? '▾' : '▸';
}

function toggleGraphWindow() {
  state.graphWinOpen = !state.graphWinOpen;
  const win = document.getElementById('kg-floating-window');
  const btn = document.getElementById('btn-display-graph');
  if (!win || !btn) return;
  win.dataset.open = state.graphWinOpen ? 'true' : 'false';
  btn.classList.toggle('rp-toggle-active', state.graphWinOpen);
  const icon = btn.querySelector('.rp-toggle-icon');
  if (icon) icon.textContent = state.graphWinOpen ? '◫' : '⊞';

  if (state.graphWinOpen && KG_STATE.graph) {
    const body = win.querySelector('.kg-fw-body');
    const w = body.clientWidth;
    const h = body.clientHeight;
    KG_STATE.graph.width(w).height(h);
  }
}

function initFloatingWindowHandlers() {
  const win = document.getElementById('kg-floating-window');
  if (!win) return;
  const titlebar = win.querySelector('.kg-fw-titlebar');
  const resizeHandle = win.querySelector('.kg-fw-resize');
  const closeBtn = win.querySelector('#kg-fw-close');

  // Drag — title bar
  let dragStart = null;
  titlebar.addEventListener('mousedown', e => {
    if (e.target.closest('.kg-fw-action')) return;
    const rect = win.getBoundingClientRect();
    dragStart = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      winX: rect.left,
      winY: rect.top,
    };
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!dragStart) return;
    const dx = e.clientX - dragStart.mouseX;
    const dy = e.clientY - dragStart.mouseY;
    let newX = dragStart.winX + dx;
    let newY = dragStart.winY + dy;
    const w = win.offsetWidth;
    const h = win.offsetHeight;
    newX = Math.max(-w + 80, Math.min(window.innerWidth - 80, newX));
    newY = Math.max(0, Math.min(window.innerHeight - 40, newY));
    win.style.left = newX + 'px';
    win.style.top = newY + 'px';
    state.graphWinPos = { x: newX, y: newY };
  });

  document.addEventListener('mouseup', () => { dragStart = null; });

  // Resize — bottom-right handle
  let resizeStart = null;
  resizeHandle.addEventListener('mousedown', e => {
    resizeStart = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      winW: win.offsetWidth,
      winH: win.offsetHeight,
    };
    e.preventDefault();
    e.stopPropagation();
  });

  document.addEventListener('mousemove', e => {
    if (!resizeStart) return;
    const dx = e.clientX - resizeStart.mouseX;
    const dy = e.clientY - resizeStart.mouseY;
    const newW = Math.max(280, resizeStart.winW + dx);
    const newH = Math.max(220, resizeStart.winH + dy);
    win.style.width = newW + 'px';
    win.style.height = newH + 'px';
    state.graphWinSize = { w: newW, h: newH };
    if (KG_STATE.graph) {
      const body = win.querySelector('.kg-fw-body');
      KG_STATE.graph.width(body.clientWidth).height(body.clientHeight);
    }
  });

  document.addEventListener('mouseup', () => { resizeStart = null; });

  // Close
  closeBtn.addEventListener('click', () => {
    if (!state.graphWinOpen) return;
    toggleGraphWindow();
  });
}

function initRightPaneToolbar() {
  const logsBtn = document.getElementById('btn-display-logs');
  const graphBtn = document.getElementById('btn-display-graph');
  if (logsBtn) logsBtn.addEventListener('click', toggleLogDropdown);
  if (graphBtn) graphBtn.addEventListener('click', toggleGraphWindow);
  updateLogCountBadge();
  updateGraphCountBadge();
}

function init() {
  render();
  initKG3D();
  initFloatingWindowHandlers();
  initRightPaneToolbar();
  seedLogLines();
  updateLogCountBadge();
  updateGraphCountBadge();
}

document.addEventListener('DOMContentLoaded', init);
