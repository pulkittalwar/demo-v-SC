// ─────────────────────────────────────────────
// Hyperspace OS — Sembcorp Demo · Wave 1.5
// LIGHT THEME · personas panel external above tablet · Ops Control Tower view.
// render() is PURE PAINT — no timers, no animation kickoffs.
// ─────────────────────────────────────────────

const state = {
  screen: 'monitoring',          // 'monitoring' | 'monitoring-notify' | 'monitoring-landed' | 'incident-detail'
  history: [],                   // nav stack
  activePersona: 'ops',          // 'ops' | 'onsite' | 'offsite' | 'analyst'
  bannerVisible: false,          // true during banner-display phase
  bannerKey: 'ops',              // W3.9 — which BANNER_COPY variant to render
  notifyTimer: null,             // setTimeout handle for banner fade
  incidentLanded: false,         // W3.10 — INC row no longer auto-visible; gated by byPersona[pKey].seen
  // ── Wave 3.2 — state pill state machine (W3.9 — TRIAGING/REVIEW_READY folded into TRIAGE_READY) ──
  incidentPhase: 'TRIAGE_READY', // 'TRIAGE_READY' | 'DISPATCHED_TO_ONSITE' | 'ONSITE_CONFIRMED' | 'AWAITING_ASSET_PERF'
  activeAgentId: null,
  agentStepIndex: {},
  arcTimers: [],                 // setTimeout handles for the sequencer (cleared on re-fire)
  // ── Wave 3.4 — right-pane toolbar + floating KG window ──
  logDropdownOpen: false,
  graphWinOpen: false,
  graphWinPos: { x: null, y: null },
  graphWinSize: { w: 460, h: 360 },
  // ── Wave 3.8 — right-pane drawer ──
  drawerOpen: false,
  // ── Wave 3.7 — Screen D tiered reveal + dispatch note ──
  screenDRevealStarted: false,
  assetChainRevealed: false,
  opsImpactRevealed: false,
  recommendationRevealed: false,
  dispatchNote: '',
  revealTimers: [],              // W3.9 — setTimeout handles for Screen D reveal (cleared on persona switch)
  // ── Wave 3.9 — per-persona ticket state model ──
  tickets: {
    'INC-2026-0537': {
      statePill: 'TRIAGE_READY', // mirrors state.incidentPhase via setStatePill()
      handoffPending: { ops: true, onsite: false, offsite: false, analyst: false },
      byPersona: {
        ops:     { seen: false, opened: false, actioned: false },
        onsite:  { seen: false, opened: false, actioned: false },
        offsite: { seen: false, opened: false, actioned: false },
        analyst: { seen: false, opened: false, actioned: false },
      },
    },
  },
  // ── Wave 3.9 — Screen D action-steps per persona ──
  actionSteps: {
    step1: { status: 'idle' },                                // idle | verifying | done
    step2: { status: 'locked', selectedEngineer: null },      // locked | finding | selecting | selected
    ctaEnabled: false,
  },
  // ── W4 — Lim curated Screen D state ──
  lim: {
    checked: {},                       // map of inspection-item-id → true
    revealStarted: false,
    summaryRevealed: false,
    callStarted: false,
    callEnded: false,
    transcriptAttached: false,
    diagnosisRevised: false,
    revisionTimestamp: null,
    // W4.1 — stage-gated checklist theater flags
    safetyTheaterFired: false,
    instrumentTheaterFired: false,
    rciTheaterFired: false,
    // W7 — Diagnosis Verdict + revised-diagnosis flow
    verdictSpawned: false,
    rejectClicked: false,
    confirmRevisedClicked: false,
  },
  // ── W4 — Wong curated Screen D state ──
  wong: {
    revealStarted: false,
    summaryRevealed: false,
    approvalGiven: false,
    approvalTimestamp: null,
  },
  // ── W6 — KG growth animation (P2 only · 10s after diagnosis-confirmed click) ──
  kgGrowthFired: false,
  // ── W5 — Priya / trading-desk state ──
  priyaUnlocked: false,
  priya: {
    escalationRevealStarted: false,
    escalationSummaryRevealed: false,
    selectedOption: null,
    decisionLocked: false,
    decisionTimestamp: null,
    demoEndBannerShown: false,
  },
};

// ── Wave 3.9 — ticket + persona helpers ──
function getCanonicalTicket() {
  return state.tickets['INC-2026-0537'];
}
function activePersonaTicketState() {
  return getCanonicalTicket().byPersona[state.activePersona];
}
function setStatePill(v) {
  state.incidentPhase = v;
  getCanonicalTicket().statePill = v;
}

const PERSONA_INITIALS = {
  ops:     { initials: 'FS',  name: 'Faye Sit'        },
  onsite:  { initials: 'LWJ', name: 'Lim Wei Jie'    },
  offsite: { initials: 'AW',  name: 'Dr. A. Wong'    },
  analyst: { initials: 'PS',  name: 'Priya Sundaram' },
};

const BANNER_COPY = {
  ops: {
    label: 'NEW INCIDENT · Hyperspace OS',
    body:  'JRG-CCGT-1 · Block 2 · BFP-3A · vibration anomaly · 02:47 SGT',
  },
  opsRouteBack: {
    label: 'ROUTED BACK · Hyperspace OS',
    body:  'INC-2026-0537 · Returned from <span class="dyn-name">Lim Wei Jie</span> · diagnosis revised via expert call · ops + commercial action required',
  },
  opsConfirmedReturn: {
    label: 'WO SUBMITTED · Hyperspace OS',
    body:  'INC-2026-0537 · Returned from <span class="dyn-name">Lim Wei Jie</span> · diagnosis confirmed · WO submitted · ops review required',
  },
  onsite: {
    label: 'INCOMING HANDOFF · Hyperspace OS',
    body:  'INC-2026-0537 · Routed from <span class="dyn-name">Faye Sit</span> · onsite verification requested',
  },
  offsite: {
    label: 'INCOMING HANDOFF · Hyperspace OS',
    body:  'INC-2026-0537 · Routed from <span class="dyn-name">Lim Wei Jie</span> · diagnosis revision + escalation pending sign-off',
  },
  analyst: {
    label: 'INCOMING ESCALATION · Hyperspace OS',
    body:  'INC-2026-0537 · Routed from <span class="dyn-name">Faye Sit</span> · trading desk decision required',
  },
};

// ── W7 — State pill labels (simplified chain · Wong intermediate dropped) ──
const STATE_PILL_LABEL = {
  TRIAGE_READY:                     'TRIAGE READY',
  DISPATCHED_TO_ONSITE:             'DISPATCHED TO ONSITE',
  REVISED_DIAGNOSIS_ROUTED:         'ROUTED BACK · ACTION REQUIRED',
  DIAGNOSIS_CONFIRMED_WO_SUBMITTED: 'WO SUBMITTED · ROUTED',
  ROUTED_TO_TRADING_DESK:           'ROUTED TO TRADING DESK',
  HEDGED:                           'HEDGED · CLOSED',
};

// W5 — option labels for Priya's lock-decision footer
const PRIYA_OPTION_LABEL = {
  'hedge':       'Forward Q3 capacity hedge',
  'cross-site':  'Cross-site balance · Sakra-CCGT-1 standby',
  'spot':        'Spot market purchase · USEP peak',
  'curtailment': 'PSO curtailment notice',
};

// ── W4 — canonical incident row owner per active persona ──
const ROW_OWNER_BY_PERSONA = {
  ops:     { name: 'Faye Sit',         initials: 'FS'  },
  onsite:  { name: 'Lim Wei Jie',      initials: 'LWJ' },
  offsite: { name: 'Dr. A. Wong',      initials: 'AW'  },
  analyst: { name: 'Priya Sundaram',   initials: 'PS'  },
};

const HANDOFF_NEXT = {
  ops:     'onsite',
  onsite:  'offsite',
  offsite: 'analyst',
  analyst: null,
};

const DISPATCH_LABEL = {
  ops:     'Lim Wei Jie',
  onsite:  'Dr. A. Wong',
  offsite: 'Priya Sundaram',
};

const POST_DISPATCH_STATE_PILL = {
  ops:     'DISPATCHED_TO_ONSITE',
  // W7 — onsite/offsite no longer dispatch via this CTA path
};

// ── Hardcoded incident data (Jurong-CCGT-1 BFP-3A) — W3.9 pivot ──
const INCIDENT = {
  id: 'INC-2026-0537',
  asset: 'JRG-CCGT-1 · Block 2 · BFP-3A',
  title: 'BFP-3A vibration RMS drift · NDE bearing housing',
  timestamp: '02:47 SGT · 2026-05-20',
  severity: 'AMBER',
  alarm: 'BFP-3A VIBRATION RMS DRIFT — NDE bearing housing exceeds ISO 10816-7 Zone C threshold (8.4 mm/s vs 7.1 mm/s alarm).',
  alarmSource: 'Bently Nevada 3500 / Honeywell Experion DCS',
  metrics: [
    { lbl: 'VIBRATION RMS · NDE', val: '8.4',   unit: 'mm/s', nom: 'ISO 10816-7 Zone C · alarm', tone: 'amber' },
    { lbl: 'VIBRATION RMS · DE',  val: '7.9',   unit: 'mm/s', nom: 'ISO 10816-7 Zone C · alarm', tone: 'amber' },
    { lbl: 'BEARING TEMP · NDE',  val: '78',    unit: '°C',   nom: 'Normal · trend rising',      tone: 'slate' },
    { lbl: 'SHAFT SPEED',         val: '2 985', unit: 'rpm',  nom: 'Nominal',                    tone: 'slate' },
  ],
  hypothesis: {
    primary: 'NDE bearing race spalling (early-stage)',
    confidence: 78,
    subtitle: 'Pending Onsite verification (Lim Wei Jie)',
  },
  alternates: [
    { name: 'Shaft misalignment', conf: 52 },
    { name: 'Coupling wear',      conf: 31 },
    { name: 'Impeller imbalance', conf: 19 },
  ],
  chain: ['BFP-3A', 'HRSG-3', 'ST-3', 'GENERATOR-3', 'TRANSFORMER-3', 'SWITCHYARD-A'],
  vendor: 'Sulzer (BFP) · Bently Nevada 3500 (machinery protection)',
  historicalWOCount: 3,
};

// ── Persona roster ──
const PERSONAS = [
  { key: 'ops',     role: 'Ops · Control Tower',   name: 'FAYE SIT' },
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
    owner: 'Faye Sit',
    ownerInitials: 'FS',
    clickable: false,
    // W3.6 — inline dynamic content shown next to state pill
    dynamicTagText: { label: 'update expected in', value: '35m', from: 'Lim Wei Jie' },
  },
  {
    id: 'INC-2026-0529',
    asset: 'Sakra-CCGT-1 · ST-1',
    body: 'LP turbine exhaust pressure rise — wash cycle scheduled per OEM PTC.',
    severity: 'AMBER',
    state: 'SCHEDULED',
    age: '58m ago',
    owner: 'Faye Sit',
    ownerInitials: 'FS',
    clickable: false,
    dynamicTagText: { label: 'task scheduled for', value: '06:30 SGT', from: 'M. Lim' },
  },
  {
    id: 'INC-2026-0532',
    asset: 'Banyan-CHP · Cooling Tower 2',
    body: 'CT2 fill media plugging — supplementary cooling engaged.',
    severity: 'RED',
    state: 'MONITORING',
    age: '31m ago',
    owner: 'Faye Sit',
    ownerInitials: 'FS',
    clickable: false,
    dynamicTagText: { label: 'update expected in', value: '12m', from: 'J. Tan' },
  },
];

// ── W3.10 — Per-persona own-task arrays (static theater) ──
const PERSONA_OWN_TASKS = {
  ops: PRE_EXISTING_INCIDENTS, // 3 fleet incidents preserved verbatim
  onsite: [
    {
      id: 'WO-2026-1182',
      asset: 'JRG-CCGT-1 · GT-2',
      body: 'GT-2 borescope inspection · stage 1 compressor',
      severity: 'INFO', state: 'SCHEDULED 09:00 SGT', stateClass: 'info',
      age: '—', owner: 'Lim Wei Jie', ownerInitials: 'LWJ',
      clickable: false, dynamicTagText: null,
    },
    {
      id: 'WO-2026-1156',
      asset: 'JRG-CCGT-1 · BFP-2B',
      body: 'BFP-2B coupling re-greasing',
      severity: 'INFO', state: 'IN PROGRESS', stateClass: 'info',
      age: '—', owner: 'Lim Wei Jie', ownerInitials: 'LWJ',
      clickable: false, dynamicTagText: null,
    },
    {
      id: 'WO-2026-1173',
      asset: 'JRG-CCGT-1 · HRSG-2',
      body: 'HRSG-2 hand valve overhaul · awaiting parts',
      severity: 'INFO', state: 'BLOCKED · PARTS ETA 4D', stateClass: 'info',
      age: '—', owner: 'Lim Wei Jie', ownerInitials: 'LWJ',
      clickable: false, dynamicTagText: null,
    },
  ],
  offsite: [
    {
      id: 'RCA-2026-0034',
      asset: 'Sakra-CCGT-1 · GT-1',
      body: 'Sakra-CCGT-1 GT-1 trip RCA · lead investigator',
      severity: 'INFO', state: 'IN PROGRESS', stateClass: 'info',
      age: '—', owner: 'Dr. A. Wong', ownerInitials: 'AW',
      clickable: false, dynamicTagText: null,
    },
    {
      id: 'ER-2026-0089',
      asset: 'Jurong-CCGT-2 · BFP',
      body: 'Jurong-CCGT-2 BFP overhaul technical review',
      severity: 'INFO', state: 'AWAITING INPUT', stateClass: 'info',
      age: '—', owner: 'Dr. A. Wong', ownerInitials: 'AW',
      clickable: false, dynamicTagText: null,
    },
    {
      id: 'CR-2026-0156',
      asset: 'Tuas-Power · Generator',
      body: 'Tuas-Power generator stator advisory · stakeholder call',
      severity: 'INFO', state: 'SCHEDULED 11:00 SGT', stateClass: 'info',
      age: '—', owner: 'Dr. A. Wong', ownerInitials: 'AW',
      clickable: false, dynamicTagText: null,
    },
  ],
  analyst: [
    {
      id: 'TRD-2026-0218',
      asset: 'Sakra-CCGT-1 · Block 1',
      body: 'Cross-site balancing · Sakra-CCGT-1 standby evaluation · capacity reserve sizing',
      severity: 'INFO', state: 'IN PROGRESS', stateClass: 'info',
      age: '—', owner: 'Priya Sundaram', ownerInitials: 'PS',
      clickable: false, dynamicTagText: null,
    },
    {
      id: 'TRD-2026-0224',
      asset: 'Jurong-CCGT-1 · Forward Curve',
      body: 'USEP forward curve review · Q3 capacity hedge eligibility',
      severity: 'INFO', state: 'IN PROGRESS', stateClass: 'info',
      age: '—', owner: 'Priya Sundaram', ownerInitials: 'PS',
      clickable: false, dynamicTagText: null,
    },
    {
      id: 'TRD-2026-0231',
      asset: 'PSO commitment ledger',
      body: 'PSO dispatch reconciliation · daily close',
      severity: 'INFO', state: 'IN PROGRESS', stateClass: 'info',
      age: '—', owner: 'Priya Sundaram', ownerInitials: 'PS',
      clickable: false, dynamicTagText: null,
    },
  ],
};

function buildPersonaOwnTasks(personaKey) {
  return PERSONA_OWN_TASKS[personaKey] || [];
}

// ── Helpers ──
function el(tag, cls) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  return e;
}

// W3.6 — multi-source caption helpers (3 source styles: hyperspace / knowledge-graph / netzero-os)
function buildHyperspaceCaption(extraClass) {
  const cap = el('div', 'hyperspace-source' + (extraClass ? ' ' + extraClass : ''));
  cap.innerHTML = `<span class="hyperspace-source-icon">✦</span> hyperspace.live`;
  return cap;
}
function buildKGSourceCaption() {
  const cap = el('div', 'kg-source');
  cap.innerHTML = `
    <span class="kg-source-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 3a3 3 0 0 0-3 3v1a3 3 0 0 0-1 5 3 3 0 0 0 1 5v1a3 3 0 0 0 3 3"/>
        <path d="M15 3a3 3 0 0 1 3 3v1a3 3 0 0 1 1 5 3 3 0 0 1-1 5v1a3 3 0 0 1-3 3"/>
        <line x1="12" y1="3" x2="12" y2="21"/>
      </svg>
    </span> knowledge-graph.live`;
  return cap;
}
function buildNetzeroCaption() {
  const cap = el('div', 'nz-source');
  cap.innerHTML = `<span class="nz-source-icon">✦</span> netzero-os.live`;
  return cap;
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

// ── Personas panel (external, above tablet) — W7: Wong tile removed (3 tiles) ──
// W8 Section 0 Part 1 — diff-update (build once, mutate attrs/classes on subsequent calls).
// Preserves in-flight .persona-tile-pulse keyframe — fixes "flash" caused by innerHTML wipe restarting pulse from 0%.
function renderPersonasPanel() {
  const row = document.getElementById('personas-row');
  if (!row) return;
  const ticket = getCanonicalTicket();
  const visiblePersonas = PERSONAS.filter(p => p.key !== 'offsite');

  // Lazy build — first call only.
  if (!row.dataset.built) {
    row.innerHTML = '';
    visiblePersonas.forEach(p => {
      const tile = el('div', 'persona-tile');
      tile.dataset.personaKey = p.key;
      tile.innerHTML = `
        <div class="persona-scene">${PERSONA_SCENES[p.key]}</div>
        <div class="persona-label">
          <span class="persona-role">${p.role}</span>
          <span class="persona-name">${p.name}</span>
        </div>`;
      tile.addEventListener('click', () => onPersonaTileClick(p.key));
      row.appendChild(tile);
    });
    row.dataset.built = '1';
  }

  // Diff-update — runs every render(), only touches attrs/classes.
  visiblePersonas.forEach(p => {
    const tile = row.querySelector(`.persona-tile[data-persona-key="${p.key}"]`);
    if (!tile) return;
    let dataState;
    if (p.key === state.activePersona) dataState = 'active';
    else if (p.key === 'analyst' && !state.priyaUnlocked) dataState = 'locked';
    else                               dataState = 'available';
    if (tile.getAttribute('data-state') !== dataState) {
      tile.setAttribute('data-state', dataState);
    }
    const shouldPulse = dataState !== 'locked' && ticket && ticket.handoffPending[p.key];
    const hasPulse = tile.classList.contains('persona-tile-pulse');
    if (shouldPulse && !hasPulse) {
      tile.classList.add('persona-tile-pulse');
    } else if (!shouldPulse && hasPulse) {
      tile.classList.remove('persona-tile-pulse');
    }
    // If pulse already on + still should be on → leave class untouched (preserves keyframe phase).
  });
}

function onPersonaTileClick(personaKey) {
  if (personaKey === 'analyst' && !state.priyaUnlocked) return;
  if (personaKey === state.activePersona) return;
  switchToPersona(personaKey);
}

function switchToPersona(personaKey) {
  // W7 — offsite tile removed; guard against any stray call
  if (personaKey === 'offsite') return;
  cancelInProgressReveal();
  state.activePersona = personaKey;
  state.screen = 'monitoring';
  state.history = [];
  state.bannerVisible = false;
  if (state.notifyTimer) { clearTimeout(state.notifyTimer); state.notifyTimer = null; }
  // W3.9 — reset Screen D action-steps per persona switch
  state.actionSteps = {
    step1: { status: 'idle' },
    step2: { status: 'locked', selectedEngineer: null },
    ctaEnabled: false,
  };
  render();
  updateAgentDimmingForActivePersona();
}

function cancelInProgressReveal() {
  if (state.revealTimers && state.revealTimers.length) {
    state.revealTimers.forEach(t => clearTimeout(t));
    state.revealTimers = [];
  }
}

// ─────────────────────────────────────────────
// W6 — right-pane agent lifecycle helper + per-persona dim
// ─────────────────────────────────────────────

const AGENT_PERSONA_RELEVANCE = {
  // W7 — offsite persona removed from all relevance arrays
  // W8 — sop-action + audio-transcription added (Section A)
  orchestrator:          ['ops', 'onsite', 'analyst'],
  inspection:            ['ops', 'onsite'],
  triage:                ['ops', 'onsite'],
  'diag-hrsg':           [],
  'diag-electrical':     [],
  playbook:              ['ops', 'onsite'],
  'sop-action':          ['ops', 'onsite'],
  'audio-transcription': ['onsite'],
  'wo-prefill':          ['ops'],
  workflow:              ['ops', 'onsite', 'analyst'],  // a.k.a. A2A Coordination Agent
  learning:              ['analyst'],
  'critic-power-gen':    ['ops', 'onsite'],
  'critic-renewables':   [],
  'critic-networks':     [],
  hse:                   ['onsite'],
  pl:                    ['ops', 'analyst'],
  'market-intelligence': ['analyst'],
};

function fireAgentCardLifecycle(agentId, durationMs = 5000) {
  if (!agentId) return;
  const card = document.querySelector(`.agent-card[data-agent-id="${agentId}"]`);
  if (!card) return;
  card.classList.remove('agent-card-pulse');
  card.dataset.state = 'active';
  void card.offsetWidth; // restart animation
  card.classList.add('agent-card-pulse');
  setTimeout(() => {
    if (card.dataset.state === 'active') {
      card.classList.remove('agent-card-pulse');
      card.dataset.state = 'done';
    }
  }, durationMs);
}

function fireAgentCardsParallel(agentIds, durationMs) {
  (agentIds || []).forEach(id => fireAgentCardLifecycle(id, durationMs));
}

function updateAgentDimmingForActivePersona() {
  const personaKey = state.activePersona;
  document.querySelectorAll('.agent-card').forEach(card => {
    const agentId = card.dataset.agentId;
    const isStandby = card.classList.contains('standby');
    const relevant = (AGENT_PERSONA_RELEVANCE[agentId] || []).includes(personaKey);
    card.classList.toggle('agent-dim', !isStandby && !relevant);
  });
}

function initAgentCardStates() {
  document.querySelectorAll('.agent-card').forEach(card => {
    if (!card.dataset.state) card.dataset.state = 'idle';
  });
}

// ── W4 / W5 — per-persona Screen D dispatcher (state-aware for ops) ──
function renderIncidentDetailView(root) {
  const ticket = getCanonicalTicket();
  switch (state.activePersona) {
    case 'ops': {
      const pill = ticket && ticket.statePill;
      // W7 — Escalation Report fires on revised or confirmed return paths (plus downstream Priya states)
      if (pill === 'REVISED_DIAGNOSIS_ROUTED' ||
          pill === 'DIAGNOSIS_CONFIRMED_WO_SUBMITTED' ||
          pill === 'ROUTED_TO_TRADING_DESK' ||
          pill === 'HEDGED') {
        return renderOpsEscalationReport(root);
      }
      return renderOpsIncidentDetail(root);
    }
    case 'onsite':  return renderOnsiteIncidentDetail(root);
    case 'offsite': return renderOffsiteIncidentDetail(root);  // W7 — tile removed; path dead
    case 'analyst': return renderAnalystIncidentDetail(root);
  }
}

// ── Ops Control Tower incident detail view (Screen D) — W3.9 rewrite ──
// Banner + metrics + 2-stage loading theater + Summary report + Action Steps + Notes.
function renderOpsIncidentDetail(root) {
  const content = el('div', 'tablet-content');
  content.id = 'incident-detail-view';

  // (A) header band — green gradient + back chevron + title/ID/severity
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

  // (B) Metrics card (2×2 grid)
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

  // (C) Summary report slot — placeholder or completed
  const summarySlot = el('div', 'summary-slot');
  summarySlot.id = 'summary-slot';
  content.appendChild(summarySlot);

  // (D) Action Steps slot — W8 B: Notes section now lives INSIDE Step 2 (between Lim row + Confirm CTA).
  const actionSlot = el('div', 'action-steps-slot');
  actionSlot.id = 'action-steps-slot';
  content.appendChild(actionSlot);

  // Back button — pops state.history
  const backBtn = content.querySelector('.inc-back');
  if (backBtn) {
    backBtn.style.cursor = 'pointer';
    backBtn.addEventListener('click', backToMonitoring);
  }

  root.appendChild(content);

  // Drive content into the slots based on per-persona state
  const personaState = activePersonaTicketState();
  if (personaState.actioned) {
    // Already actioned — paint completed Summary + Action Steps + capture footer
    paintSummaryComplete(summarySlot);
    paintActionStepsComplete(actionSlot);
    setTimeout(appendDispatchCaptureFooter, 200);
  } else {
    // First open or in-progress — kick off the 2-stage reveal + Action Steps lifecycle
    startScreenDRevealW39(summarySlot, actionSlot);
  }
}

// ── W3.9 — Standalone Notes section (formerly inside diag-hypothesis-card) ──
function buildNotesSectionStandalone() {
  const wrap = el('div', 'notes-standalone');
  wrap.innerHTML = `
    <div class="notes-section">
      <div class="notes-header">
        <span class="notes-title">Note for onsite engineer</span>
        <button class="notes-mic-btn" data-recording="false" type="button">
          <svg class="mic-ic" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
            <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 1 0 6 0V5a3 3 0 0 0-3-3zm5 9a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z"/>
          </svg>
          <span class="notes-mic-lbl">Record</span>
        </button>
      </div>
      <textarea class="notes-textarea" placeholder="Optional note — voice or type." readonly>${state.dispatchNote || ''}</textarea>
    </div>`;
  return wrap;
}

// ── W3.9 — 2-stage Summary reveal + Action Steps lifecycle ──
function startScreenDRevealW39(summarySlot, actionSlot) {
  // Stage 1: Inspection placeholder paints immediately (t=0)
  summarySlot.innerHTML = `
    <div class="reveal-pending" data-stage="summary">
      <div class="reveal-dots"><span></span><span></span><span></span></div>
      <div class="reveal-msg">
        <span class="reveal-agent">Sensor Anomaly Inspector</span> ·
        Loading incident summary for <strong>Faye Sit</strong>
      </div>
    </div>`;
  // W6 — fire right-pane card lifecycle synced with Loading #1
  fireAgentCardLifecycle('inspection', 5000);

  // Stage 2 at t=5s: swap to Summary report shell + embedded Triage placeholder
  pushReveal(() => {
    summarySlot.innerHTML = `
      <div class="summary-report" data-block-real="summary">
        <div class="sr-heading">Predicted diagnosis</div>
        <div class="sr-body" id="sr-body">
          <div class="reveal-pending" data-stage="hypothesis">
            <div class="reveal-dots"><span></span><span></span><span></span></div>
            <div class="reveal-msg">
              <span class="reveal-agent">Turbine Diagnostic Agent</span> ·
              Loading diagnosis hypothesis
            </div>
          </div>
        </div>
      </div>`;
    // W6 — fire triage + power-gen critic synced with Loading #2
    fireAgentCardsParallel(['triage', 'critic-power-gen'], 5000);
  }, 5000);

  // Stage 3 at t=10s: swap Triage placeholder for diagnosis hypothesis + alternates + HITL pill
  pushReveal(() => {
    paintSummaryComplete(summarySlot);
  }, 10000);

  // Action Steps appear at t=10s; Step 1 starts verifying
  pushReveal(() => {
    paintActionStepsInitial(actionSlot);
    startActionStep1();
  }, 10000);
}

function paintSummaryComplete(summarySlot) {
  // W3.10 — drop duplicate "Summary" subheading, premature engineer subtitle,
  // confidence percentages, HITL pill. Alternative hypotheses become collapsible.
  const hyp = INCIDENT.hypothesis;
  const altsHtml = INCIDENT.alternates.map(a =>
    `<div class="sr-alt-row"><span>${a.name}</span></div>`
  ).join('');
  summarySlot.innerHTML = `
    <div class="summary-report" data-block-real="summary">
      <div class="sr-heading">Predicted diagnosis</div>
      <div class="sr-section">
        <div class="sr-hypothesis">
          <div class="sr-hyp-row">
            <span class="sr-hyp-name">${hyp.primary}</span>
          </div>
        </div>
        <div class="sr-alternates">
          <button class="sr-alt-toggle" data-expanded="false" type="button">
            <span class="sr-alt-toggle-icon">▸</span>
            <span class="sr-alt-toggle-lbl">Alternative hypotheses considered</span>
          </button>
          <div class="sr-alt-list" style="display:none">
            ${altsHtml}
          </div>
        </div>
      </div>
    </div>`;
  wireAltHypothesesToggle();
}

function paintActionStepsInitial(actionSlot) {
  actionSlot.innerHTML = `
    <div class="action-steps">
      <div class="as-heading">Action steps</div>
      <div class="as-step" data-step="1" data-status="idle">
        <div class="as-step-head">
          <span class="as-step-num">○</span>
          <span class="as-step-title">Step 1 · Verify metrics</span>
        </div>
        <div class="as-step-body">
          <span class="as-step-spinner"><span class="reveal-dots"><span></span><span></span><span></span></span></span>
          <span class="as-step-msg">Verifying metrics for INC-2026-0537…</span>
        </div>
      </div>
      <div class="as-step" data-step="2" data-status="locked">
        <div class="as-step-head">
          <span class="as-step-num">○</span>
          <span class="as-step-title">Step 2 · Find available engineer <span class="as-step-optional">(optional)</span></span>
        </div>
        <div class="as-step-body">
          <span class="as-step-msg">Locked — complete Step 1 first.</span>
        </div>
      </div>
      <button class="action-cta" disabled type="button">
        Confirm on-site dispatch
      </button>
    </div>`;
}

function paintActionStepsComplete(actionSlot) {
  // Already actioned (re-render after dispatch). Show both steps ✓.
  actionSlot.innerHTML = `
    <div class="action-steps">
      <div class="as-heading">Action steps</div>
      <div class="as-step" data-step="1" data-status="done">
        <div class="as-step-head">
          <span class="as-step-num">✓</span>
          <span class="as-step-title">Step 1 · Verify metrics</span>
        </div>
        <div class="as-step-body">
          <span class="as-step-msg italic">Metrics for INC-2026-0537 confirmed</span>
          <button class="as-step-attach" type="button" aria-label="View verified metrics">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
              <path d="M16.5 6v11.5a4 4 0 0 1-8 0V5a2.5 2.5 0 0 1 5 0v10a1 1 0 0 1-2 0V6h-1.5v9a2.5 2.5 0 0 0 5 0V5a4 4 0 0 0-8 0v12.5a5.5 5.5 0 0 0 11 0V6z"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="as-step" data-step="2" data-status="selected">
        <div class="as-step-head">
          <span class="as-step-num">✓</span>
          <span class="as-step-title">Step 2 · Find available engineer <span class="as-step-optional">(optional)</span></span>
        </div>
        <div class="as-step-body">
          <span class="as-step-msg">Lim Wei Jie selected</span>
        </div>
      </div>
      <div class="dispatch-confirmed">✓ Dispatched at ${currentSGTTime()} · ${DISPATCH_LABEL[state.activePersona] || 'next persona'} notified</div>
    </div>`;
  // W8 B — Notes tile lives inside the action-steps container even in re-entry view.
  const stepsRoot = actionSlot.querySelector('.action-steps');
  const confirmed = stepsRoot && stepsRoot.querySelector('.dispatch-confirmed');
  if (stepsRoot && confirmed) {
    const notes = buildNotesSectionStandalone();
    notes.classList.add('notes-in-step2');
    stepsRoot.insertBefore(notes, confirmed);
  }
  wireTelemetryModal();
  wireNotesMic();
}

function startActionStep1() {
  const step1 = document.querySelector('.as-step[data-step="1"]');
  if (!step1) return;
  step1.dataset.status = 'verifying';
  state.actionSteps.step1.status = 'verifying';
  // W6 — fire P&L Impact Validator card synced with Step 1 (2s verify)
  fireAgentCardLifecycle('pl', 2000);
  pushReveal(() => {
    step1.dataset.status = 'done';
    step1.querySelector('.as-step-num').textContent = '✓';
    step1.querySelector('.as-step-body').innerHTML = `
      <span class="as-step-msg italic">Metrics for INC-2026-0537 confirmed</span>
      <button class="as-step-attach" type="button" aria-label="View verified metrics">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
          <path d="M16.5 6v11.5a4 4 0 0 1-8 0V5a2.5 2.5 0 0 1 5 0v10a1 1 0 0 1-2 0V6h-1.5v9a2.5 2.5 0 0 0 5 0V5a4 4 0 0 0-8 0v12.5a5.5 5.5 0 0 0 11 0V6z"/>
        </svg>
      </button>`;
    state.actionSteps.step1.status = 'done';
    wireTelemetryModal();
    unlockActionStep2();
  }, 2000);
}

function unlockActionStep2() {
  const step2 = document.querySelector('.as-step[data-step="2"]');
  if (!step2) return;
  step2.dataset.status = 'finding';
  state.actionSteps.step2.status = 'finding';
  step2.querySelector('.as-step-body').innerHTML = `
    <span class="as-step-spinner"><span class="reveal-dots"><span></span><span></span><span></span></span></span>
    <span class="as-step-msg">Hyperspace OS · finding on-duty engineers…</span>`;
  // W6 — fire Workflow Agent card synced with Step 2 (5s find)
  fireAgentCardLifecycle('workflow', 5000);
  pushReveal(() => {
    step2.dataset.status = 'selecting';
    state.actionSteps.step2.status = 'selecting';
    step2.querySelector('.as-step-body').innerHTML = `
      <div class="as-engineer-card" data-engineer="lim-wei-jie">
        <div class="as-eng-status-pill">AVAILABLE</div>
        <div class="as-eng-name">Lim Wei Jie</div>
        <div class="as-eng-meta">Block 2 mechanical maintenance · on-duty · 02:47 SGT</div>
        <div class="as-eng-hint">Click to select</div>
      </div>`;
    wireEngineerCardClick();
    // W8 B — insert Notes tile inside Step 2, between Lim engineer card + Confirm CTA.
    insertOpsNotesIntoStep2();
  }, 5000);
}

// W8 B — Notes tile lives inside Step 2 (between Lim row + Confirm CTA).
function insertOpsNotesIntoStep2() {
  const stepsRoot = document.querySelector('.action-steps');
  if (!stepsRoot) return;
  if (stepsRoot.querySelector('.notes-standalone')) return;
  const cta = stepsRoot.querySelector('.action-cta');
  const notes = buildNotesSectionStandalone();
  notes.classList.add('notes-in-step2');
  if (cta) {
    stepsRoot.insertBefore(notes, cta);
  } else {
    stepsRoot.appendChild(notes);
  }
  wireNotesMic();
}

function wireEngineerCardClick() {
  const card = document.querySelector('.as-engineer-card[data-engineer="lim-wei-jie"]');
  if (!card) return;
  card.addEventListener('click', () => {
    state.actionSteps.step2.selectedEngineer = 'lim-wei-jie';
    state.actionSteps.step2.status = 'selected';
    const step2 = document.querySelector('.as-step[data-step="2"]');
    step2.dataset.status = 'selected';
    step2.querySelector('.as-step-num').textContent = '✓';
    step2.querySelector('.as-step-body').innerHTML = `<span class="as-step-msg">Lim Wei Jie selected</span>`;
    enableActionCTA();
  });
}

function enableActionCTA() {
  const cta = document.querySelector('.action-cta');
  if (!cta) return;
  cta.disabled = false;
  cta.classList.add('action-cta-enabled');
  state.actionSteps.ctaEnabled = true;
  cta.addEventListener('click', onActionCTAClick, { once: true });
}

function onActionCTAClick() {
  const cta = document.querySelector('.action-cta');
  if (cta && cta.disabled) return;
  onDispatchCTA();
}

// ── Section D — Source legend (3-chip row) ──
function buildScreenDSourceLegend() {
  const legend = el('div', 'screen-d-sources');
  legend.innerHTML = `
    <span class="source-chip">
      <svg class="source-ic" viewBox="0 0 24 24" width="18" height="18" fill="#3B82F6" aria-hidden="true">
        <path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2z"/>
      </svg>
      <span>Hyperspace OS</span>
    </span>
    <span class="source-chip">
      <svg class="source-ic" viewBox="0 0 24 24" width="18" height="18" fill="#00A651" aria-hidden="true">
        <path d="M12 2C7 7 4 11 4 15a8 8 0 0 0 16 0c0-4-3-8-8-13zm0 5l4 4-4 4-4-4 4-4z"/>
      </svg>
      <span>NetZeroOS</span>
    </span>
    <span class="source-chip">
      <svg class="source-ic" viewBox="0 0 24 24" width="18" height="18" fill="#F59E0B" aria-hidden="true">
        <circle cx="6" cy="6" r="2.5"/>
        <circle cx="18" cy="6" r="2.5"/>
        <circle cx="12" cy="18" r="2.5"/>
        <path d="M6 6L18 6M6 6L12 18M18 6L12 18" stroke="#F59E0B" stroke-width="1.5" fill="none"/>
      </svg>
      <span>Knowledge-Graph</span>
    </span>`;
  return legend;
}

// ── Block 1 — Asset chain card ──
function buildAssetChainCard() {
  const card = el('div', 'ops-card');
  const chainStr = INCIDENT.chain.map((n, i) =>
    i === 0 ? n : `<span class="arrow">→</span>${n}`
  ).join('');
  card.innerHTML = `
    <div class="ops-card-lbl">Actively monitoring connected asset chain</div>
    <div class="chain-text">${chainStr}</div>
    <div class="chain-note">✦ Connected nodes monitored — chain alerts route here automatically.</div>`;
  return card;
}

// ── Block 2 — Ops impact card (Section M revised content) ──
function buildOpsImpactCard() {
  const card = el('div', 'ops-card');
  // [illustrative — confirm w/ Sembcorp before 2026-05-27]
  const tariff = 'SGD 120/MWh peak';
  const revenueRisk = 'SGD 240k';
  card.innerHTML = `
    <div class="ops-card-lbl">Operational + revenue impact</div>
    <div class="ops-impact-text">
      <ul style="margin: 0 0 0 18px; padding: 0;">
        <li>MW dispatch reliability at risk — <span class="dyn-entity dyn-entity-asset">Block 2</span> derate <span class="dyn-entity dyn-entity-metric">circa 50 MW</span> if unmitigated</li>
        <li>PSO commitment window 09:00–18:00 SGT · 4h peak tariff exposure per <a class="dyn-entity dyn-entity-ref" href="#" data-doc-ref="ieee-1159">IEEE 1159 § 4.2</a></li>
        <li>Revenue at risk: ~<span class="dyn-entity dyn-entity-metric">${revenueRisk}</span> (50 MW × 4h × ${tariff}) <em style="color: var(--text-muted); font-style: italic;">[illustrative]</em></li>
      </ul>
      <div style="margin-top: 8px;">Hedge: forward Q3 capacity contract eligible (P&amp;L Validator confirms)</div>
    </div>
    <div class="ops-impact-action">Action window: 45 min before T-zero PSO breach</div>`;
  return card;
}

// ── History accordion (unchanged from W3.6) ──
function buildHistoryAccordion() {
  const acc = el('div', 'acc-row-w1');
  acc.dataset.open = 'false';
  acc.innerHTML = `
    <div class="acc-row-w1-hdr">
      <span class="acc-row-w1-lbl">Historical work orders for GT-3 (${INCIDENT.historicalWOCount})</span>
      <span class="acc-row-w1-chev">
        <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
          <path d="M1 1l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </div>
    <div class="acc-row-w1-body">
      <div class="acc-wo-row">
        <div class="acc-wo-id">WO-2026-0489</div>
        <div class="acc-wo-detail">Compressor wash cycle · scheduled · 2026-05-18 → 2026-05-19</div>
        <div class="acc-wo-status acc-wo-status-closed">CLOSED</div>
      </div>
      <div class="acc-wo-row">
        <div class="acc-wo-id">WO-2025-3147</div>
        <div class="acc-wo-detail">IGV calibration verification · OEM service bulletin GE-9HA-014</div>
        <div class="acc-wo-status acc-wo-status-closed">CLOSED</div>
      </div>
      <div class="acc-wo-row">
        <div class="acc-wo-id">WO-2025-2814</div>
        <div class="acc-wo-detail">Generator excitation system inspection · annual</div>
        <div class="acc-wo-status acc-wo-status-closed">CLOSED</div>
      </div>
    </div>`;
  acc.querySelector('.acc-row-w1-hdr').addEventListener('click', () => {
    acc.dataset.open = acc.dataset.open === 'true' ? 'false' : 'true';
  });
  return acc;
}

// ── Block 3 — Recommendation (Sections G / H / I / J / CTA) ──
function buildRecommendationBlock() {
  const next = el('div', 'next-action');
  next.innerHTML = `
    <div class="next-action-hdr">
      <span class="hitl-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="8" r="3"/>
          <path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"/>
        </svg>
      </span>
      <span>Next action steps for Faye Sit</span>
      <span class="hitl-tag">Human-in-the-loop</span>
    </div>
    <div class="next-action-step-lbl"><span class="next-action-step-num">1.</span> Verify and confirm diagnosis</div>
    <div class="diag-hypothesis-card">
      <div class="diag-hyp-row">
        <div class="diag-hyp-title">Diagnosis hypothesis · compressor fouling (humidity-correlated)</div>
        <span class="diag-hyp-conf">78% confidence</span>
      </div>
      <div class="diag-hyp-subtitle">Pending Onsite verification (Lim Wei Jie)</div>
      <button class="see-reasoning-toggle" data-expanded="false" type="button">
        <span class="see-reasoning-icon">▸</span>
        <span>See full reasoning</span>
      </button>
      <div class="see-reasoning-panel" style="display:none">
        <div class="reasoning-step">
          <span class="rs-num">1</span>
          <span class="rs-body"><span class="rs-agent">Sensor Anomaly Inspector</span> detected GT-3 exhaust temp spread widening to 8.4&deg;C (target &le;5&deg;C) over rolling 14-day window. Correlated with heat rate drift +2.1% and compressor pressure ratio drop &minus;0.4.</span>
        </div>
        <div class="reasoning-step">
          <span class="rs-num">2</span>
          <span class="rs-body"><span class="rs-agent">Sensor Anomaly Inspector</span> traversed Knowledge-Graph L2 &rarr; L3 &rarr; L4: GT-3 &rarr; compressor stage &rarr; 90-day humidity profile correlation.</span>
        </div>
        <div class="reasoning-step">
          <span class="rs-num">3</span>
          <span class="rs-body"><span class="rs-agent">Turbine Diagnostic Agent</span> pattern-matched against 3 prior RCAs across the fleet (Jurong-CCGT-2 &middot; 2025-08, Sakra-CCGT-1 &middot; 2025-11, Jurong-CCGT-1 &middot; 2024-09 &mdash; all compressor fouling, all humidity-correlated).</span>
        </div>
        <div class="reasoning-step">
          <span class="rs-num">4</span>
          <span class="rs-body"><span class="rs-agent">Power Gen Critic</span> validated KG path backwards. Humidity-fouling pattern matches GE 9HA OEM degradation curve.</span>
        </div>
        <div class="reasoning-step">
          <span class="rs-num">5</span>
          <span class="rs-body">Diagnosis hypothesis: <strong>compressor fouling, humidity-correlated</strong>. 78% confidence. Onsite verification recommended before remediation.</span>
        </div>
      </div>
      <div class="alt-diag-section">
        <div class="alt-diag-header">Alternative diagnoses considered</div>
        <div class="alt-diag-list">
          <div class="alt-diag-row">
            <span class="alt-diag-name">IGV-3 actuator drift</span>
            <span class="alt-diag-conf">52% confidence</span>
          </div>
          <div class="alt-diag-row">
            <span class="alt-diag-name">Inlet filter &Delta;P rising</span>
            <span class="alt-diag-conf">31% confidence</span>
          </div>
          <div class="alt-diag-row">
            <span class="alt-diag-name">HRSG-3 tube degradation</span>
            <span class="alt-diag-conf">19% confidence</span>
          </div>
        </div>
        <div class="alt-diag-note">All considered alongside primary hypothesis. Onsite verification confirms or surfaces co-factors.</div>
      </div>
      <div class="notes-section">
        <div class="notes-header">
          <span class="notes-title">Note for onsite engineer</span>
          <button class="notes-mic-btn" data-recording="false" type="button">
            <svg class="mic-ic" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
              <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 1 0 6 0V5a3 3 0 0 0-3-3zm5 9a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z"/>
            </svg>
            <span class="notes-mic-lbl">Record</span>
          </button>
        </div>
        <textarea class="notes-textarea" placeholder="Optional note — voice or type." readonly>${state.dispatchNote || ''}</textarea>
      </div>
    </div>
  `;

  // W3.9 — CTA vs confirmed driven by per-persona actioned, not global statePill
  const personaState = activePersonaTicketState();
  const persona = PERSONA_INITIALS[state.activePersona] || PERSONA_INITIALS.ops;
  const nextPersona = HANDOFF_NEXT[state.activePersona];
  const nextName = DISPATCH_LABEL[state.activePersona] || 'next persona';
  if (!personaState.actioned) {
    const cta = el('button', 'dispatch-cta');
    cta.innerHTML = `Dispatch for Onsite Inspection <span class="dispatch-cta-arrow">→</span>`;
    cta.addEventListener('click', onDispatchCTA);
    next.appendChild(cta);
    const sub = el('div', 'dispatch-cta-sublbl');
    sub.textContent = `${persona.name} · routes incident to ${nextName} for diagnosis verification`;
    next.appendChild(sub);
  } else {
    const confirm = el('div', 'dispatch-confirmed');
    confirm.innerHTML = `✓ Dispatched at ${currentSGTTime()} · ${nextName} notified`;
    next.appendChild(confirm);
  }

  return next;
}

// ── Section K — Pending placeholder (loading-dots) ──
function buildPendingPlaceholder(blockId) {
  const placeholder = el('div', 'reveal-pending');
  placeholder.setAttribute('data-block', blockId);

  let agentName, msg;
  if (blockId === 'asset-chain') {
    agentName = 'Sensor Anomaly Inspector';
    msg = 'building asset chain for monitoring + RCA';
  } else if (blockId === 'ops-impact') {
    agentName = 'P&amp;L Impact Validator';
    msg = 'reviewing revenue commitment exposure';
  } else if (blockId === 'recommendation') {
    agentName = 'Orchestrator';
    msg = `reviewing SOP + historical next-best-actions for <span class="reveal-alarm-box">DCS ALARM · GT EXHAUST TEMP SPREAD DRIFT</span>`;
  } else {
    agentName = 'Agent';
    msg = 'working';
  }
  placeholder.innerHTML = `
    <div class="reveal-dots"><span></span><span></span><span></span></div>
    <div class="reveal-msg"><span class="reveal-agent">${agentName}</span> ${msg}</div>`;
  return placeholder;
}

// W3.9 — reveal timer tracking (cancellable on persona switch)
function pushReveal(fn, delay) {
  const h = setTimeout(fn, delay);
  state.revealTimers.push(h);
  return h;
}

// ── Section K — reveal driver (W3.7.1 — 10s cadence per Pulkit) ──
function startScreenDReveal() {
  // Block 1: asset chain reveals at t=10s
  pushReveal(() => {
    revealBlock('asset-chain');
    state.assetChainRevealed = true;
    spawnPlaceholderInDOM('ops-impact');
    fireRevealBlock2Agents();
  }, 10000);

  // Block 2: ops impact reveals at t=20s
  pushReveal(() => {
    revealBlock('ops-impact');
    state.opsImpactRevealed = true;
    spawnPlaceholderInDOM('recommendation');
    fireRevealBlock3Agents();
  }, 20000);

  // Block 3: recommendation reveals at t=30s
  pushReveal(() => {
    revealBlock('recommendation');
    state.recommendationRevealed = true;
    wireSeeReasoningToggle();
    wireNotesMic();
  }, 30000);

  // Block 1 agents (Sensor Anomaly Inspector) — runs through t=10s
  fireRevealBlock1Agents();
}

function revealBlock(blockId) {
  const pending = document.querySelector(`.reveal-pending[data-block="${blockId}"]`);
  const real = document.querySelector(`[data-block-real="${blockId}"]`);
  if (pending) pending.remove();
  if (real) {
    real.style.display = '';
    real.classList.add('reveal-in');
  }
}

function spawnPlaceholderInDOM(blockId) {
  // Avoid double-mounting
  if (document.querySelector(`.reveal-pending[data-block="${blockId}"]`)) return;
  const real = document.querySelector(`[data-block-real="${blockId}"]`);
  if (!real || !real.parentNode) return;
  const placeholder = buildPendingPlaceholder(blockId);
  real.parentNode.insertBefore(placeholder, real.nextSibling);
}

// ── Section L — Right-pane agent firings synced w/ reveal blocks ──
function fireRevealBlock1Agents() {
  const agentId = 'inspection';
  setAgentActive(agentId, 'Asset Chain Assembly', 4);
  const lines = [
    { ts: '02:47:12', source: 'inspection', text: 'L2 traverse · compressor stage · IGV-3 actuator · HRSG-3',     dataSource: 'OSIsoft PI System', nodeChain: ['gt-3','igv-3-actuator','hrsg-3'] },
    { ts: '02:47:13', source: 'inspection', text: 'L3 lookup · 90-day humidity profile · degradation curve',       dataSource: 'OSIsoft PI System', nodeChain: ['gt-3-90d-temp','mdl-humidity-v3'] },
    { ts: '02:47:14', source: 'inspection', text: 'L4 traverse · compressor-fouling pattern · humidity-correlated', nodeChain: ['pat-comp-fouling','mdl-humidity-v3'] },
    { ts: '02:47:15', source: 'inspection', text: 'asset chain assembled · 6 nodes · 5 edges',                     nodeChain: ['gt-3','hrsg-3','condenser-3','generator-3','transformer-3','switchyard-a'] },
  ];
  lines.forEach((line, idx) => {
    pushReveal(() => {
      window.LOG.appendLine(line);
      advanceAgentStep(agentId, idx, { log: line });
    }, 1500 + idx * 2000);
  });
  pushReveal(() => teardownAgentTree(agentId), 9800);
}

function fireRevealBlock2Agents() {
  const agentId = 'pl';
  setAgentActive(agentId, 'Revenue Commitment Exposure', 3);
  const lines = [
    { ts: '02:47:16', source: 'pl', text: 'pulling PSO commitment window 09:00–18:00 SGT',         dataSource: 'Hyperspace OS', nodeChain: ['esc-pso','pred-mw-derate'] },
    { ts: '02:47:17', source: 'pl', text: 'revenue at risk · 50MW × 4h × SGD 120/MWh peak tariff', dataSource: 'NetZeroOS',     nodeChain: ['pred-mw-derate'] },
    { ts: '02:47:18', source: 'pl', text: 'exposure ~SGD 240k · forward Q3 capacity hedge eligible', dataSource: 'NetZeroOS',   nodeChain: ['pred-mw-derate','roi-wash'] },
  ];
  lines.forEach((line, idx) => {
    pushReveal(() => {
      window.LOG.appendLine(line);
      advanceAgentStep(agentId, idx, { log: line });
    }, 1500 + idx * 2700);
  });
  pushReveal(() => teardownAgentTree(agentId), 9800);
}

function fireRevealBlock3Agents() {
  // Activate 3 in parallel — bypass setAgentActive (which tears down previous)
  activateAgentParallel('triage',           2);
  activateAgentParallel('playbook',         1);
  activateAgentParallel('critic-power-gen', 1);

  const lines = [
    { ts: '02:47:19', source: 'triage',           text: 'pattern-match · 3 prior RCAs · compressor fouling humidity-correlated', dataSource: 'Hyperspace KG', nodeChain: ['rca-2025-014-sakra','rca-2024-093-jurong','rca-2025-031-jurong2','pat-comp-fouling'] },
    { ts: '02:47:20', source: 'triage',           text: 'diagnosis hypothesis · 78% confidence',                                  dataSource: 'Hyperspace OS', nodeChain: ['pat-comp-fouling'] },
    { ts: '02:47:21', source: 'playbook',         text: 'OEM procedure · GE 9HA compressor offline wash · est 6h',                dataSource: 'Maximo',         nodeChain: ['oem-ge-9ha-manual','rec-oem-playbook'] },
    { ts: '02:47:22', source: 'critic-power-gen', text: 'KG path validated · humidity-fouling matches GE 9HA degradation curve ✓', dataSource: 'Hyperspace KG', nodeChain: ['pat-comp-fouling','mdl-humidity-v3','oem-ge-9ha-manual'] },
    { ts: '02:47:23', source: 'orchestrator',     text: 'recommendation ready · SOP-WASH-001 · awaiting dispatch',                 dataSource: 'Hyperspace OS', nodeChain: ['rec-oem-playbook'] },
  ];
  lines.forEach((line, idx) => {
    pushReveal(() => {
      window.LOG.appendLine(line);
      if (line.source === 'triage' || line.source === 'playbook' || line.source === 'critic-power-gen') {
        const stepIdx = ({ triage: idx < 2 ? idx : 1, playbook: 0, 'critic-power-gen': 0 })[line.source];
        advanceAgentStep(line.source, stepIdx, { log: line });
      }
    }, 1000 + idx * 1800);
  });
  pushReveal(() => {
    teardownAgentTree('triage');
    teardownAgentTree('playbook');
    teardownAgentTree('critic-power-gen');
  }, 9800);
}

// W3.7 helper — parallel agent activation (does not tear down previous active)
function activateAgentParallel(agentId, totalSteps) {
  const card = document.querySelector(`.agent-card[data-agent-id="${agentId}"]`);
  if (!card) return;
  card.classList.add('agent-active');
  card.classList.remove('agent-done');
  state.agentStepIndex[agentId] = 0;
  ensureStepPill(card, 0, totalSteps);
}

// ── Section H — See full reasoning toggle ──
function wireSeeReasoningToggle() {
  const btn = document.querySelector('.see-reasoning-toggle');
  if (!btn || btn.dataset.wired === '1') return;
  btn.dataset.wired = '1';
  btn.addEventListener('click', () => {
    const expanded = btn.dataset.expanded === 'true';
    btn.dataset.expanded = String(!expanded);
    const panel = btn.parentElement.querySelector('.see-reasoning-panel');
    if (panel) panel.style.display = expanded ? 'none' : 'block';
  });
}

// ── W3.10 — Alt-hypotheses collapsible ──
function wireAltHypothesesToggle() {
  const btn = document.querySelector('.sr-alt-toggle');
  if (!btn || btn.dataset.wired === '1') return;
  btn.dataset.wired = '1';
  btn.addEventListener('click', () => {
    const expanded = btn.dataset.expanded === 'true';
    btn.dataset.expanded = String(!expanded);
    const list = btn.parentElement.querySelector('.sr-alt-list');
    if (list) list.style.display = expanded ? 'none' : 'block';
  });
}

// ── W3.10 — Telemetry modal (Step 1 paperclip) ──
function openTelemetryModal() {
  const m = document.getElementById('telemetry-modal');
  if (m) { m.dataset.open = 'true'; m.setAttribute('aria-hidden', 'false'); }
}
function closeTelemetryModal() {
  const m = document.getElementById('telemetry-modal');
  if (m) { m.dataset.open = 'false'; m.setAttribute('aria-hidden', 'true'); }
}
function wireTelemetryModal() {
  const modal = document.getElementById('telemetry-modal');
  const attachBtns = document.querySelectorAll('.as-step-attach');
  if (modal && modal.dataset.wired !== '1') {
    modal.dataset.wired = '1';
    // Delegated close: clicks on backdrop or close-button close the modal;
    // clicks inside the card pass through.
    modal.addEventListener('click', e => {
      if (e.target.closest('.telemetry-modal-close')) { closeTelemetryModal(); return; }
      if (e.target.classList.contains('telemetry-modal-backdrop')) { closeTelemetryModal(); return; }
      if (e.target === modal) { closeTelemetryModal(); }
    });
  }
  attachBtns.forEach(btn => {
    if (btn.dataset.wired === '1') return;
    btn.dataset.wired = '1';
    btn.addEventListener('click', openTelemetryModal);
  });
}

// ── Section J — Mic record + 5s preload ──
const PRELOAD_NOTE = 'Lim — checks rule out simple bearing fault. Inspect casing weld area near discharge flange — fatigue cracking pattern observed on similar Sulzer BFPs across the fleet. Confirm before reporting back.';

function wireNotesMic() {
  const btn = document.querySelector('.notes-mic-btn');
  if (!btn || btn.dataset.wired === '1') return;
  btn.dataset.wired = '1';
  btn.addEventListener('click', e => {
    const target = e.currentTarget;
    if (target.dataset.recording === 'true') return;
    target.dataset.recording = 'true';
    target.querySelector('.notes-mic-lbl').textContent = 'Recording…';
    const textarea = target.closest('.notes-section').querySelector('.notes-textarea');
    textarea.value = '';
    setTimeout(() => {
      textarea.value = PRELOAD_NOTE;
      target.dataset.recording = 'false';
      target.querySelector('.notes-mic-lbl').textContent = 'Record';
      state.dispatchNote = PRELOAD_NOTE;
    }, 5000);
  });
}

// ── Section N — Post-dispatch 3-line capture footer (W3.9: dispatched-to label per persona) ──
function appendDispatchCaptureFooter() {
  const container = document.getElementById('incident-detail-view');
  if (!container) return;
  if (container.querySelector('.dispatch-capture-footer')) return;
  const footer = el('div', 'dispatch-capture-footer');
  footer.innerHTML = `
    <div class="dcf-line">
      <span class="dcf-ic">✓</span>
      <span class="dcf-txt"><strong>Hyperspace OS</strong> confirms SOP followed</span>
    </div>
    <div class="dcf-line">
      <span class="dcf-ic">✓</span>
      <span class="dcf-txt">Notes sent to <strong>A2A Coordination Agent</strong> for review</span>
    </div>
    <div class="dcf-line">
      <span class="dcf-ic">✓</span>
      <span class="dcf-txt"><strong>Knowledge-Graph</strong> · team · incident · workflow enriched</span>
    </div>`;
  container.appendChild(footer);
  const lbl = el('div', 'dispatched-to-label');
  const nextName = DISPATCH_LABEL[state.activePersona] || 'next persona';
  lbl.innerHTML = `Dispatched to <span class="dyn-name">${nextName}</span> · 02:47 SGT`;
  container.appendChild(lbl);
}

// ── W3.9 — Dispatch CTA: per-persona routing, advances statePill + handoffPending ──
function onDispatchCTA() {
  const personaKey = state.activePersona;
  if (personaKey === 'analyst') return;
  const ticket = getCanonicalTicket();
  ticket.byPersona[personaKey].actioned = true;
  const newPill = POST_DISPATCH_STATE_PILL[personaKey];
  if (newPill) setStatePill(newPill);
  const next = HANDOFF_NEXT[personaKey];
  if (next) ticket.handoffPending[next] = true;
  render();
  fireWorkflowAgentArc();
}

// Backwards-compat alias (older callers, defensive) — routes to new handler
function dispatchToOnsite() {
  onDispatchCTA();
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

// ── W7 stub persona renderer ──
function renderAnalystView(root) { stubView(root, 'Asset Perf Analyst view — Wave 7'); }
function stubView(root, label) {
  const s = el('div', 'tablet-content');
  s.style.cssText = 'display:flex;align-items:center;justify-content:center;color:#64748B;font-family:var(--mono);font-size:12px;';
  s.textContent = label;
  root.appendChild(s);
}

// ─────────────────────────────────────────────
// W4 — Lim Wei Jie (Onsite) curated Screen D
// Banner + metrics + summary (loading theater) + diagnosis hypothesis
// + inspection checklist + binary CTAs + call flow + diagnosis morph + escalate
// ─────────────────────────────────────────────

const LIM_INSPECTION_CHECKLIST = [
  {
    group: 'Safety',
    items: [
      { id: 'safety-1', text: 'Check the area for gas leaks before approaching the equipment.' },
      { id: 'safety-2', text: 'Verify there is no active fire, smoke, or overheating around the machine.' },
      { id: 'safety-3', text: 'Confirm vibration levels are stable enough for safe inspection.' },
      { id: 'safety-4', text: 'Check casing temperature is within safe handling range.' },
      { id: 'safety-5', text: 'Confirm lockout/tagout is in place before close inspection.' },
    ],
  },
  {
    group: 'Instrument',
    items: [
      { id: 'instr-1', text: 'Cross-check Bently Nevada 3500 readings against handheld vibration meter.' },
      { id: 'instr-2', text: 'Inspect vibration transducer cabling + mounts for any loose connections.' },
      { id: 'instr-3', text: 'Verify vibration readings using a handheld vibration meter if available.' },
    ],
  },
  {
    group: 'Root cause isolation',
    items: [
      { id: 'rci-1', text: 'Inspect sleeve bearings for clearance issues, oil film condition, wipe damage, and instability.' },
      { id: 'rci-2', text: 'Inspect rolling element bearings for spalling, lubrication condition, cage defects, and preload issues.' },
    ],
  },
];

const LIM_CHECKLIST_THRESHOLD = 10;

// W4.1 — group theater (HSE for Safety, Instrument Diagnostic, Sensor Anomaly Inspector + Turbine Diag for root-cause)
const GROUP_THEATER_AGENT = {
  'Safety': {
    source: 'hse',
    displayName: 'HSE Agent',
    loadingText: 'Loading PPE + gas-leak + thermal safety protocols for BFP-3A approach',
    nodeChain: ['sop-bfp-vibration-investigation'],
    cardAgentIds: ['hse'],
  },
  'Instrument': {
    source: 'inspection',
    displayName: 'Instrument Diagnostic Agent',
    loadingText: 'Loading vibration sensor + cable + grounding inspection protocols',
    nodeChain: ['vt-bfp-3a-nde-x', 'vt-bfp-3a-nde-y', 'vt-bfp-3a-de-x', 'vt-bfp-3a-de-y'],
    cardAgentIds: ['inspection'],
  },
  'Root cause isolation': {
    source: 'triage',
    displayName: 'Sensor Anomaly Inspector + Turbine Diagnostic Agent',
    loadingText: 'Loading sleeve + rolling-element bearing isolation protocols',
    nodeChain: ['bearing-bfp-3a-nde', 'coupling-bfp-3a', 'shaft-bfp-3a'],
    cardAgentIds: ['inspection', 'triage'],
  },
};

const GROUP_LOCKED_HINT = {
  'Safety': '',
  'Instrument': '🔒 awaiting safety completion',
  'Root cause isolation': '🔒 awaiting instrument completion',
};

function buildLimDetailScaffold() {
  const content = el('div', 'tablet-content');
  content.id = 'incident-detail-view';

  // Banner — green gradient + back chevron + state pill
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
        <div class="inc-id">${INCIDENT.id} · routed from Faye Sit</div>
        <div class="inc-ts">${INCIDENT.timestamp}</div>
      </div>
      <span class="sev-pill">▲ Severity: ${INCIDENT.severity}</span>
    </div>`;
  content.appendChild(hdr);

  // Metrics card (re-use Faye layout)
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

  // W4.1 — notes section moved between metrics + summary
  content.appendChild(buildLimNotesSection());

  // Summary report slot
  const summarySlot = el('div', 'summary-slot');
  summarySlot.id = 'lim-summary-slot';
  content.appendChild(summarySlot);

  // Inspection checklist slot
  const checklistSlot = el('div', 'lim-checklist-slot');
  checklistSlot.id = 'lim-checklist-slot';
  content.appendChild(checklistSlot);

  // Binary CTAs slot
  const ctasSlot = el('div', 'lim-ctas-slot');
  ctasSlot.id = 'lim-ctas-slot';
  content.appendChild(ctasSlot);

  const backBtn = content.querySelector('.inc-back');
  if (backBtn) {
    backBtn.style.cursor = 'pointer';
    backBtn.addEventListener('click', backToMonitoring);
  }
  return content;
}

const LIM_INCOMING_NOTE = 'Lim — checks rule out simple bearing fault. Inspect casing weld area near discharge flange — fatigue cracking pattern observed on similar Sulzer BFPs across the fleet. Confirm before reporting back.';

function buildLimNotesSection() {
  // W8 C.3 + C.4 — display-only incoming note (no record affordance, no textarea).
  // 12px top margin separates from metrics 2x2 above.
  const wrap = el('div', 'notes-standalone notes-incoming');
  wrap.innerHTML = `
    <div class="notes-section notes-section-display">
      <div class="notes-header notes-header-display">
        <span class="notes-title">Note from <span class="dyn-name">Faye Sit</span></span>
        <span class="notes-incoming-chip">incoming · 02:48 SGT</span>
      </div>
      <div class="notes-body-display">${LIM_INCOMING_NOTE}</div>
    </div>`;
  return wrap;
}

function renderOnsiteIncidentDetail(root) {
  const content = buildLimDetailScaffold();
  root.appendChild(content);

  const personaState = activePersonaTicketState();
  if (personaState.actioned) {
    // W7 — post-action re-entry. Pick footer per state pill (Confirm path vs Reject/Confirm-revised path).
    const ticket = getCanonicalTicket();
    const pill = ticket.statePill;
    paintLimSummaryComplete(state.lim.diagnosisRevised);
    paintLimChecklistComplete();
    const slot = document.getElementById('lim-ctas-slot');
    if (slot) slot.innerHTML = '';
    setTimeout(() => {
      if (pill === 'DIAGNOSIS_CONFIRMED_WO_SUBMITTED') {
        appendConfirmedCaptureFooter();
      } else {
        appendRevisedDiagnosisCaptureFooter();
      }
    }, 200);
    return;
  }

  // First-open path — paint reveal theater
  if (state.lim.summaryRevealed) {
    paintLimSummaryComplete(state.lim.diagnosisRevised);
    paintLimChecklist();
    // W7 — Diagnosis Verdict re-entry path
    const checkedCount = Object.keys(state.lim.checked).length;
    if (state.lim.diagnosisRevised) {
      // Past the call — show post-call state + Revise diagnosis tile (or footer if already routed)
      spawnInCallStrip();
      paintPostCallStagesFromState();
      spawnReviseDiagnosisTile();
    } else if (state.lim.callEnded) {
      spawnInCallStrip();
      paintPostCallStagesFromState();
    } else if (state.lim.callStarted) {
      spawnInCallStrip();
    } else if (checkedCount >= LIM_CHECKLIST_THRESHOLD) {
      paintDiagnosisVerdict();
    }
  } else {
    startLimScreenDReveal();
  }
}

function startLimScreenDReveal() {
  // W8 C.1 + C.2 — paint Predicted Diagnosis IMMEDIATELY (Faye already revealed it · no 10s reload).
  // Eliminates the W6 dual-stage theater + the double-paint bug where pushReveal Stage 3 fired
  // paintLimSummaryComplete a second time after the section was already painted.
  if (state.lim.summaryRevealed) return;
  state.lim.summaryRevealed = true;
  paintLimSummaryComplete(false);
  // Inspection Workflow checklist spawns at t=2s — gives metrics + notes + diagnosis time to settle.
  pushReveal(() => {
    paintLimChecklist();
  }, 2000);
}

function paintLimSummaryComplete(revised) {
  const slot = document.getElementById('lim-summary-slot');
  if (!slot) return;
  const hyp = INCIDENT.hypothesis;
  const altsHtml = INCIDENT.alternates.map(a =>
    `<div class="sr-alt-row"><span>${a.name}</span></div>`
  ).join('');

  let tileHtml;
  if (revised) {
    tileHtml = buildRevisedDiagnosisTileHTML();
  } else {
    // W8 C.1 — confirmation pill: Faye already passed this through Hyperspace OS · pending onsite verification.
    tileHtml = `
      <div class="sr-hypothesis">
        <div class="sr-hyp-row">
          <span class="sr-hyp-name">${hyp.primary}</span>
          <span class="sr-hyp-status-pill">✓ confirmed by Hyperspace OS · pending onsite verification</span>
        </div>
      </div>
      <div class="sr-alternates">
        <button class="sr-alt-toggle" data-expanded="false" type="button">
          <span class="sr-alt-toggle-icon">▸</span>
          <span class="sr-alt-toggle-lbl">Alternative hypotheses considered</span>
        </button>
        <div class="sr-alt-list" style="display:none">
          ${altsHtml}
        </div>
      </div>`;
  }

  slot.innerHTML = `
    <div class="summary-report">
      <div class="sr-heading">Predicted diagnosis</div>
      <div class="sr-section">
        ${tileHtml}
      </div>
    </div>`;
  wireAltHypothesesToggle();
  wireTranscriptModalLinks();
}

function buildRevisedDiagnosisTileHTML() {
  const hyp = INCIDENT.hypothesis;
  const ts = state.lim.revisionTimestamp || '02:55 SGT';
  return `
    <div class="sr-hypothesis sr-hypothesis-revised">
      <div class="sr-hyp-row sr-hyp-original">
        <span class="sr-hyp-name strikethrough">${hyp.primary}</span>
        <span class="sr-hyp-flag">SUPERSEDED</span>
      </div>
      <div class="sr-hyp-row sr-hyp-revised">
        <span class="sr-hyp-revised-label">Revised diagnosis ·</span>
        <span class="sr-hyp-name"><span class="dyn-name">Crack in pump casing on BFP-3A</span></span>
      </div>
      <div class="sr-hyp-revised-detail">
        Confirmed via expert field-experience pattern + targeted inspection (60mm hairline discontinuity, 4-o'clock on volute, near discharge weld).
        Bearing damage secondary, caused by imbalanced loading under casing fatigue.
        <button class="sr-hyp-transcript-link" type="button">View call transcript · <span class="dyn-name">${ts}</span></button>
      </div>
    </div>`;
}

function buildLimGroupHTML(grp, locked) {
  const checkedCount = grp.items.filter(it => state.lim.checked[it.id]).length;
  if (locked) {
    // W6 — locked groups render header label ONLY (no items in DOM)
    const status = GROUP_LOCKED_HINT[grp.group] || '';
    return `
      <div class="ic-group" data-group="${grp.group}" data-locked="true">
        <div class="ic-group-label ic-group-label-locked">
          <span class="ic-group-label-text">${grp.group}</span>
          <span class="ic-group-label-status">${status}</span>
        </div>
      </div>`;
  }
  const itemsHtml = grp.items.map(it => {
    const isChecked = !!state.lim.checked[it.id];
    return `
      <div class="ic-item" data-item-id="${it.id}" data-checked="${isChecked}">
        <span class="ic-check">${isChecked ? '✓' : '○'}</span>
        <span class="ic-text">${it.text}</span>
      </div>`;
  }).join('');
  return `
    <div class="ic-group" data-group="${grp.group}" data-locked="false">
      <div class="ic-group-label">${grp.group} · ${checkedCount}/${grp.items.length}</div>
      ${itemsHtml}
    </div>`;
}

function paintLimChecklist() {
  const slot = document.getElementById('lim-checklist-slot');
  if (!slot) return;
  const allDone = LIM_INSPECTION_CHECKLIST.every(g => g.items.every(it => state.lim.checked[it.id]));
  const groupsHtml = LIM_INSPECTION_CHECKLIST.map((grp, idx) => {
    let locked;
    if (allDone) {
      locked = false;
    } else if (idx === 0) {
      locked = false;
    } else {
      const prevGrp = LIM_INSPECTION_CHECKLIST[idx - 1];
      const prevDone = prevGrp.items.every(it => state.lim.checked[it.id]);
      locked = !prevDone;
    }
    return buildLimGroupHTML(grp, locked);
  }).join('');
  const total = LIM_INSPECTION_CHECKLIST.reduce((n, g) => n + g.items.length, 0);
  const checked = Object.keys(state.lim.checked).length;
  slot.innerHTML = `
    <div class="inspection-checklist">
      <div class="ic-heading">Inspection workflow (INC-2026-0537 · per the SOP)</div>
      <div class="ic-sub">Complete safety + instrument + root-cause checks sequentially.</div>
      ${groupsHtml}
      <div class="ic-progress"><span class="ic-progress-num">${checked}/${total} checks complete</span></div>
    </div>`;
  wireInspectionChecklist();

  // W4.1 — fire HSE Agent theater on first paint (no items checked yet)
  if (!allDone && checked === 0 && !state.lim.safetyTheaterFired) {
    state.lim.safetyTheaterFired = true;
    triggerGroupTheater('Safety', { skipUnlock: true });
  }
}

function paintLimChecklistComplete() {
  // All items rendered as checked (post-escalation re-entry)
  LIM_INSPECTION_CHECKLIST.forEach(g => g.items.forEach(it => { state.lim.checked[it.id] = true; }));
  paintLimChecklist();
  // W8 C.5 — re-entry path also shows truncated groups.
  truncateInspectionGroupsToCompleted();
}

// W8 C.5 — replace each inspection group's inner content with header-only completed row.
function truncateInspectionGroupsToCompleted() {
  document.querySelectorAll('.ic-group').forEach(grpEl => {
    if (grpEl.dataset.collapsed === 'true') return;
    const groupName = grpEl.dataset.group;
    const grpDef = LIM_INSPECTION_CHECKLIST.find(g => g.group === groupName);
    if (!grpDef) return;
    const total = grpDef.items.length;
    grpEl.innerHTML = `
      <div class="ic-group-label ic-group-label-completed">
        <span class="ic-group-label-text">${groupName}</span>
        <span class="ic-group-label-status">✓ ${total}/${total} completed</span>
      </div>`;
    grpEl.dataset.collapsed = 'true';
    grpEl.dataset.locked = 'false';
  });
  // Also drop any in-flight theater placeholders that would now be orphaned.
  document.querySelectorAll('.ic-group-theater').forEach(t => t.remove());
}

function wireInspectionChecklist() {
  document.querySelectorAll('.ic-item').forEach(item => {
    if (item.dataset.wired === '1') return;
    item.dataset.wired = '1';
    item.addEventListener('click', () => {
      if (item.dataset.checked === 'true') return;
      const group = item.closest('.ic-group');
      if (group && group.dataset.locked === 'true') return;
      const itemId = item.dataset.itemId;
      state.lim.checked[itemId] = true;
      item.dataset.checked = 'true';
      item.querySelector('.ic-check').textContent = '✓';
      logChecklistItem(itemId);
      updateChecklistProgress();
    });
  });
}

// W4.1 — group theater placeholder above the target group.
// On Safety paint: visual flavor only (skipUnlock=true, Safety already unlocked).
// On Instrument/Root cause: fires after prior group complete → 3s later removes + unlocks target.
function triggerGroupTheater(targetGroupName, opts = {}) {
  const { skipUnlock = false } = opts;
  const target = document.querySelector(`.ic-group[data-group="${targetGroupName}"]`);
  if (!target) return;
  if (target.previousElementSibling && target.previousElementSibling.classList.contains('ic-group-theater')) return;

  const meta = GROUP_THEATER_AGENT[targetGroupName];
  const theater = document.createElement('div');
  theater.className = 'ic-group-theater';
  theater.dataset.targetGroup = targetGroupName;
  theater.innerHTML = `
    <span class="reveal-dots"><span></span><span></span><span></span></span>
    <span class="ic-group-theater-msg">
      <span class="ic-group-theater-agent">${meta.displayName}</span> ·
      ${meta.loadingText}
    </span>`;
  target.parentNode.insertBefore(theater, target);

  if (window.LOG) {
    window.LOG.appendLine({
      ts: currentSGTLog(),
      source: meta.source,
      text: `${meta.displayName} · ${meta.loadingText}`,
      dataSource: 'Hyperspace OS',
      nodeChain: meta.nodeChain,
    });
  }

  // W6 — fire right-pane card lifecycle synced with theater duration
  fireAgentCardsParallel(meta.cardAgentIds, 3000);

  setTimeout(() => {
    if (theater.parentNode) theater.parentNode.removeChild(theater);
    if (skipUnlock) return;
    // W6 — locked group was header-only; spawn full items markup now
    const grpDef = LIM_INSPECTION_CHECKLIST.find(g => g.group === targetGroupName);
    if (grpDef) {
      const newHTML = buildLimGroupHTML(grpDef, false);
      const wrapper = document.createElement('div');
      wrapper.innerHTML = newHTML;
      const replacement = wrapper.firstElementChild;
      if (replacement && target.parentNode) {
        target.parentNode.replaceChild(replacement, target);
        wireInspectionChecklist();
      }
    }
  }, 3000);
}

function logChecklistItem(itemId) {
  if (!window.LOG) return;
  window.LOG.appendLine({
    ts: currentSGTLog(),
    source: 'workflow',
    text: `Inspection check · ${itemId} · confirmed by Lim Wei Jie`,
    dataSource: 'Hyperspace OS',
    nodeChain: ['sop-bfp-vibration-investigation'],
  });
}

let _SGT_LOG_SEC = 30;
function currentSGTLog() {
  _SGT_LOG_SEC += 3;
  const m = 51 + Math.floor(_SGT_LOG_SEC / 60);
  const s = _SGT_LOG_SEC % 60;
  return `02:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function updateChecklistProgress() {
  const total = LIM_INSPECTION_CHECKLIST.reduce((n, g) => n + g.items.length, 0);
  const checked = Object.keys(state.lim.checked).length;
  const progNum = document.querySelector('.ic-progress-num');
  if (progNum) progNum.textContent = `${checked}/${total} checks complete`;

  const groupCompleted = {};
  document.querySelectorAll('.ic-group').forEach(grp => {
    const groupName = grp.dataset.group;
    const grpDef = LIM_INSPECTION_CHECKLIST.find(g => g.group === groupName);
    if (!grpDef) return;
    const grpChecked = grpDef.items.filter(it => state.lim.checked[it.id]).length;
    const label = grp.querySelector('.ic-group-label');
    const isLocked = grp.dataset.locked === 'true';
    const hint = isLocked ? ` · ${GROUP_LOCKED_HINT[groupName] || ''}` : '';
    if (label) label.textContent = `${groupName} · ${grpChecked}/${grpDef.items.length}${hint}`;
    if (grpChecked === grpDef.items.length) groupCompleted[groupName] = true;
  });

  // W4.1 — chain theater triggers on prior-group completion
  if (groupCompleted['Safety'] && !state.lim.instrumentTheaterFired) {
    state.lim.instrumentTheaterFired = true;
    triggerGroupTheater('Instrument');
  }
  if (groupCompleted['Instrument'] && !state.lim.rciTheaterFired) {
    state.lim.rciTheaterFired = true;
    triggerGroupTheater('Root cause isolation');
  }

  if (checked >= LIM_CHECKLIST_THRESHOLD) {
    // W7 — spawn Diagnosis Verdict section at 10/10 (replaces W4.1 binary CTAs)
    const slot = document.getElementById('lim-ctas-slot');
    if (slot && !slot.querySelector('.diagnosis-verdict')
             && !slot.querySelector('.sop-routing-theater')
             && !slot.querySelector('.in-call-strip')
             && !slot.querySelector('.post-call-stage')
             && !state.lim.rejectClicked) {
      paintDiagnosisVerdict();
    }
  }
}

// W7 — Diagnosis Verdict section (replaces W4.1 binary-ctas)
// Spawns ONLY when 10/10 inspection checks complete. Reject = main path, Confirm = stub.
// W8 C.5 — truncate inspection groups to header-only at this moment (frees vertical space).
function paintDiagnosisVerdict() {
  const slot = document.getElementById('lim-ctas-slot');
  if (!slot) return;
  if (slot.querySelector('.diagnosis-verdict')) return;
  state.lim.verdictSpawned = true;

  // W8 C.5 — collapse all inspection groups to header-only `✓ <label> · N/N completed`.
  truncateInspectionGroupsToCompleted();

  slot.innerHTML = `
    <div class="diagnosis-verdict">
      <div class="dv-heading">Diagnosis verdict</div>
      <div class="dv-sub">Confirm Hyperspace OS hypothesis OR reject and escalate to senior engineer.</div>
      <div class="dv-buttons">
        <button class="dv-btn dv-reject" type="button">Reject</button>
        <button class="dv-btn dv-confirm" type="button">Confirm</button>
      </div>
    </div>`;
  wireVerdictButtons();
  if (window.LOG) {
    window.LOG.appendLine({
      ts: currentSGTLog(),
      source: 'workflow',
      text: 'Inspection workflow complete · 10/10 checks logged · Diagnosis Verdict gated open',
      dataSource: 'Hyperspace OS',
      nodeChain: ['sop-bfp-vibration-investigation'],
    });
  }
}

function wireVerdictButtons() {
  const reject = document.querySelector('.dv-reject');
  const confirm = document.querySelector('.dv-confirm');
  if (reject && reject.dataset.wired !== '1') {
    reject.dataset.wired = '1';
    reject.addEventListener('click', onVerdictReject);
  }
  if (confirm && confirm.dataset.wired !== '1') {
    confirm.dataset.wired = '1';
    confirm.addEventListener('click', onVerdictConfirm);
  }
}

// W7 — Reject = main path. SOP-routing theater → in-call strip.
// W8 D.1 — theater 3s → 6s. W8 A.6 — fire SOP Action Agent (not workflow).
function onVerdictReject() {
  if (state.lim.rejectClicked) return;
  state.lim.rejectClicked = true;
  state.lim.callStarted = true;

  const slot = document.getElementById('lim-ctas-slot');
  if (!slot) return;
  // Drop verdict section, spawn SOP-routing theater
  slot.innerHTML = `
    <div class="sop-routing-theater">
      <span class="reveal-dots"><span></span><span></span><span></span></span>
      <span class="reveal-msg">
        <span class="reveal-agent">SOP Action Agent</span> · Connecting to <span class="dyn-name">Dr. A. Wong</span> via call · routing through escalation playbook
      </span>
    </div>`;

  if (window.LOG) {
    window.LOG.appendLine({
      ts: currentSGTLog(),
      source: 'sop-action',
      text: 'SOP Action Agent · Connecting to Dr. A. Wong via call · routing through escalation playbook',
      dataSource: 'Hyperspace OS',
      nodeChain: ['dr-wong', 'sop-bfp-vibration-investigation'],
    });
  }
  fireAgentCardLifecycle('sop-action', 6000);

  // After 6s: remove theater, spawn in-call strip
  setTimeout(() => {
    const t = slot.querySelector('.sop-routing-theater');
    if (t) t.remove();
    spawnInCallStrip();
  }, 6000);
}

// W7 — Confirm = alt-path stub (Pulkit won't click in live demo).
function onVerdictConfirm() {
  const ticket = getCanonicalTicket();
  if (ticket.byPersona.onsite.actioned) return;
  ticket.byPersona.onsite.actioned = true;
  setStatePill('DIAGNOSIS_CONFIRMED_WO_SUBMITTED');
  ticket.handoffPending.ops = true;
  ticket.byPersona.ops.seen = false;
  ticket.byPersona.ops.opened = false;

  const slot = document.getElementById('lim-ctas-slot');
  if (slot) slot.innerHTML = '';
  appendConfirmedCaptureFooter();

  if (window.LOG) {
    window.LOG.appendLine({ ts: currentSGTLog(), source: 'workflow', text: 'Hyperspace OS hypothesis confirmed by Lim Wei Jie · WO submitted', dataSource: 'Hyperspace OS', nodeChain: ['sop-bfp-vibration-investigation'] });
    window.LOG.appendLine({ ts: currentSGTLog(), source: 'workflow', text: 'Workflow trace · P2 Onsite → P1 Ops Tower · WO chain enriched · Faye Sit notified', dataSource: 'Hyperspace OS', nodeChain: ['r-kumar'] });
  }
  fireAgentCardLifecycle('workflow', 2000);
  render();
}

function appendConfirmedCaptureFooter() {
  const container = document.getElementById('incident-detail-view');
  if (!container) return;
  if (container.querySelector('.dispatch-capture-footer')) return;
  const footer = el('div', 'dispatch-capture-footer');
  footer.innerHTML = `
    <div class="dcf-line"><span class="dcf-ic">✓</span><span class="dcf-txt"><strong>Hyperspace OS</strong> · diagnosis confirmed · WO submitted</span></div>
    <div class="dcf-line"><span class="dcf-ic">✓</span><span class="dcf-txt">Workflow trace routed to <strong>A2A Coordination Agent</strong></span></div>
    <div class="dcf-line"><span class="dcf-ic">✓</span><span class="dcf-txt"><span class="dyn-name">Faye Sit</span> notified · returned for ops + commercial action</span></div>`;
  container.appendChild(footer);
  const lbl = el('div', 'dispatched-to-label');
  lbl.innerHTML = `WO submitted · returned to <span class="dyn-name">Faye Sit</span> · ${currentSGTLog()}`;
  container.appendChild(lbl);
}

// W7 — spawn in-call strip directly (no top button to morph; replaces W4.1 escalate-cta replacement path)
function spawnInCallStrip() {
  const slot = document.getElementById('lim-ctas-slot');
  if (!slot) return;
  if (slot.querySelector('.in-call-strip')) return;
  const strip = document.createElement('div');
  strip.className = 'in-call-strip';
  strip.innerHTML = buildInCallStripHTML();
  slot.appendChild(strip);
  wireInCallEnd();
  if (state.lim.callEnded) {
    strip.classList.add('call-ended');
    const label = strip.querySelector('.in-call-label');
    if (label) label.textContent = `Call ended · transcript captured · ${state.lim.revisionTimestamp || '02:55 SGT'}`;
    const endBtn = strip.querySelector('.in-call-end-btn');
    if (endBtn) endBtn.remove();
  }
}

function buildInCallStripHTML() {
  return `
    <div class="in-call-status">
      <span class="in-call-phone-ic">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1 1 0 0 0-1.02.24l-2.2 2.2a15.05 15.05 0 0 1-6.59-6.58l2.2-2.21a1 1 0 0 0 .25-1.02A11.36 11.36 0 0 1 8.5 4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1c0 9.39 7.61 17 17 17a1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1z"/></svg>
      </span>
      <span class="in-call-label">On call · Dr. A. Wong</span>
      <span class="in-call-audio-wave"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></span>
    </div>
    <button class="in-call-end-btn" type="button">End</button>`;
}

function wireInCallEnd() {
  const endBtn = document.querySelector('.in-call-end-btn');
  if (!endBtn || endBtn.dataset.wired === '1') return;
  endBtn.dataset.wired = '1';
  endBtn.addEventListener('click', onCallEnd);
}

function onCallEnd() {
  if (state.lim.callEnded) return;
  state.lim.callEnded = true;
  const endBtn = document.querySelector('.in-call-end-btn');
  const strip = document.querySelector('.in-call-strip');
  if (!strip) return;
  strip.classList.add('call-ended');
  const label = strip.querySelector('.in-call-label');
  if (label) label.textContent = `Call ended · transcript captured · ${currentSGTLog()}`;
  if (endBtn) endBtn.remove();

  // Stage 1: generating-transcript (3s · Audio-transcription Agent — W8 A.6)
  spawnPostCallStage('generating-transcript');
  if (window.LOG) {
    window.LOG.appendLine({
      ts: currentSGTLog(),
      source: 'audio-transcription',
      text: 'Audio-transcription Agent · Capturing call audio · generating transcript',
      dataSource: 'Hyperspace OS',
      nodeChain: [],
    });
  }
  fireAgentCardLifecycle('audio-transcription', 3000);
  setTimeout(() => {
    swapPostCallStage('generating-transcript', 'transcript-attached');
    state.lim.transcriptAttached = true;

    // W8 D.4 — drop call-ended strip when Transcript attached appears.
    if (strip) {
      strip.style.transition = 'opacity 0.3s ease-out';
      strip.style.opacity = '0';
      setTimeout(() => strip.remove(), 320);
    }

    if (window.LOG) {
      window.LOG.appendLine({
        ts: currentSGTLog(),
        source: 'audio-transcription',
        text: 'Call transcript generated · 7m 23s · 6 exchanges · auto-attached',
        dataSource: 'Hyperspace OS',
        nodeChain: [],
      });
    }
    spawnPostCallStage('analyzing-transcript');
    // Stage 2: analyzing-transcript (3s · Audio-transcription Agent — W8 A.6)
    fireAgentCardLifecycle('audio-transcription', 3000);
    setTimeout(() => {
      // Remove analyzing-transcript loading visual
      const slot = document.getElementById('lim-ctas-slot');
      const analyzingEl = slot && slot.querySelector('.post-call-stage[data-stage="analyzing-transcript"]');
      if (analyzingEl) analyzingEl.remove();

      if (window.LOG) {
        window.LOG.appendLine({
          ts: currentSGTLog(),
          source: 'audio-transcription',
          text: 'Transcript analysis · diarized speakers · revised diagnosis extracted',
          dataSource: 'Hyperspace OS',
          nodeChain: ['pump-casing-crack-pattern'],
        });
      }
      // W8 E.4 — auto-trigger diagnosis morph + Revise diagnosis tile spawn (no user click).
      onDiagnosisConfirmedClick();
    }, 3000);
  }, 3000);
}

function paintPostCallStagesFromState() {
  // Re-entry mid-flow — show transcript-attached if that stage was reached.
  // W8 E.4 — diagnosis-confirmed-button stage removed; Revise diagnosis tile spawned separately by caller.
  if (state.lim.transcriptAttached) {
    spawnPostCallStage('transcript-attached');
  }
}

function spawnPostCallStage(stage) {
  const slot = document.getElementById('lim-ctas-slot');
  if (!slot) return;
  if (slot.querySelector(`.post-call-stage[data-stage="${stage}"]`)) return;
  const node = document.createElement('div');
  node.className = 'post-call-stage';
  node.dataset.stage = stage;
  node.innerHTML = postCallStageHTML(stage);
  slot.appendChild(node);
  if (stage === 'transcript-attached') wireTranscriptModalLinks();
  // W8 E.4 — diagnosis-confirmed-button stage retired; Revise tile spawned via spawnReviseDiagnosisTile().
}

function swapPostCallStage(fromStage, toStage) {
  const slot = document.getElementById('lim-ctas-slot');
  if (!slot) return;
  const fromEl = slot.querySelector(`.post-call-stage[data-stage="${fromStage}"]`);
  if (fromEl) fromEl.remove();
  spawnPostCallStage(toStage);
}

function postCallStageHTML(stage) {
  // W8 A.6 — generating/analyzing fire Audio-transcription Agent (not workflow).
  switch (stage) {
    case 'generating-transcript':
      return `
        <span class="reveal-dots"><span></span><span></span><span></span></span>
        <span class="post-call-msg">
          <span class="post-call-agent">Audio-transcription Agent</span> · Generating transcript...
        </span>`;
    case 'transcript-attached':
      return `
        <span class="post-call-ok">✓</span>
        <span class="post-call-msg">
          Transcript attached · 7m 23s ·
          <button class="post-call-transcript-link" type="button">View transcript</button>
        </span>`;
    case 'analyzing-transcript':
      return `
        <span class="reveal-dots"><span></span><span></span><span></span></span>
        <span class="post-call-msg">
          <span class="post-call-agent">Audio-transcription Agent</span> · Analyzing transcript...
        </span>`;
    case 'diagnosis-confirmed-button':
      // W8 E.2 — replaced by .revise-diagnosis-tile spawned via spawnReviseDiagnosisTile().
      // This stage no longer renders user-facing content; trigger handled inside onCallEnd timeline.
      return '';
  }
  return '';
}

function onDiagnosisConfirmedClick() {
  if (state.lim.diagnosisRevised) return;
  state.lim.diagnosisRevised = true;
  state.lim.revisionTimestamp = '02:55 SGT';
  // Replace diagnosis hypothesis tile inline
  morphDiagnosisTile();
  // W8 E.2 — spawn Revise diagnosis TILE w/ inline Confirm button (replaces W7 standalone button)
  spawnReviseDiagnosisTile();
  if (window.LOG) {
    window.LOG.appendLine({
      ts: currentSGTLog(),
      source: 'workflow',
      text: `Diagnosis revised at ${state.lim.revisionTimestamp} · pump casing crack confirmed via call + targeted inspection`,
      dataSource: 'Hyperspace OS',
      nodeChain: ['pump-casing-crack-pattern', 'casing-bfp-3a', 'casing-rca-jrg-2023'],
    });
  }
  // W6 — KG growth animation fires 10s later
  setTimeout(triggerKGGrowth, 10000);
}

// W7 — KG growth: nodes already in initial graph; just flash green halo on tacit cluster for 4s.
function triggerKGGrowth() {
  if (state.kgGrowthFired) return;
  state.kgGrowthFired = true;
  if (window.LOG) {
    window.LOG.appendLine({
      ts: currentSGTLog(),
      source: 'workflow',
      text: "Tacit knowledge captured from Dr. A. Wong's expert collaboration · 3 KG nodes refreshed · BFP casing patterns codified",
      dataSource: 'Hyperspace OS',
      nodeChain: ['casing-tacit-knowledge', 'wong-field-experience-2023', 'bfp-casing-inspection-protocol'],
    });
  }
  fireAgentCardLifecycle('workflow', 2000);
  flashKGGrowthHalo();
}

function flashKGGrowthHalo() {
  if (!KG_STATE.graph) return;
  KG_STATE.newlyAddedNodes = new Set(KG_GROWTH_NODE_IDS);
  refreshKGStyles();
  setTimeout(() => {
    KG_STATE.newlyAddedNodes.clear();
    if (KG_STATE.graph && typeof KG_STATE.graph.refresh === 'function') {
      KG_STATE.graph.refresh();
    }
    refreshKGStyles();
  }, 4000);
}

function morphDiagnosisTile() {
  const slot = document.getElementById('lim-summary-slot');
  if (!slot) return;
  const section = slot.querySelector('.sr-section');
  if (!section) return;
  section.innerHTML = buildRevisedDiagnosisTileHTML();
  wireTranscriptModalLinks();
}

// W7 — dead code path (W4.1 escalate-ready morph removed; kept for re-entry safety, no-op).
function morphConfirmCTAToEscalate() {
  spawnReviseDiagnosisTile();
}

// W8 E.2 — Revise diagnosis TILE w/ heading + body + inline Confirm button (replaces W7 standalone button).
function spawnReviseDiagnosisTile() {
  const slot = document.getElementById('lim-ctas-slot');
  if (!slot) return;
  if (slot.querySelector('.revise-diagnosis-tile')) return;
  slot.insertAdjacentHTML('beforeend', `
    <div class="revise-diagnosis-tile">
      <div class="rdt-icon-block">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3,12 6,9 9,12"/>
          <path d="M6 9 v6 a4 4 0 0 0 4 4 h6"/>
          <polyline points="14,16 17,19 20,16"/>
          <path d="M17 19 v-6 a4 4 0 0 0 -4 -4 h-3"/>
        </svg>
      </div>
      <div class="rdt-body">
        <div class="rdt-heading">REVISE DIAGNOSIS</div>
        <div class="rdt-text">
          Hyperspace OS detected the correct diagnosis was <span class="dyn-name">crack in pump casing on BFP-3A</span> based on call with <span class="dyn-name">Dr. A. Wong</span>.
        </div>
      </div>
      <button class="rdt-confirm-btn" type="button">Confirm revised diagnosis</button>
    </div>`);
  wireReviseDiagnosisTile();
}

function wireReviseDiagnosisTile() {
  const btn = document.querySelector('.rdt-confirm-btn');
  if (!btn || btn.dataset.wired === '1') return;
  btn.dataset.wired = '1';
  btn.addEventListener('click', onConfirmRevisedDiagnosisClick);
}

function onConfirmRevisedDiagnosisClick() {
  if (state.lim.confirmRevisedClicked) return;
  state.lim.confirmRevisedClicked = true;
  const btn = document.querySelector('.rdt-confirm-btn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Reviewing...';
  }
  const slot = document.getElementById('lim-ctas-slot');
  if (slot) {
    slot.insertAdjacentHTML('beforeend', `
      <div class="sop-review-theater">
        <span class="reveal-dots"><span></span><span></span><span></span></span>
        <span class="reveal-msg">
          <span class="reveal-agent">SOP Action Agent</span> · Reviewing SOP-BFP-VIBR-001 + cross-checking revised diagnosis against current procedures
        </span>
      </div>`);
  }
  if (window.LOG) {
    window.LOG.appendLine({
      ts: currentSGTLog(),
      source: 'sop-action',
      text: 'SOP Action Agent · Reviewing SOP-BFP-VIBR-001 + cross-checking revised diagnosis · routing to Ops',
      dataSource: 'Hyperspace OS',
      nodeChain: ['sop-bfp-vibration-investigation', 'pump-casing-crack-pattern'],
    });
  }
  fireAgentCardLifecycle('sop-action', 3000);

  setTimeout(() => {
    document.querySelector('.sop-review-theater')?.remove();
    document.querySelector('.revise-diagnosis-tile')?.remove();
    advanceToRoutedRevisedDiagnosis();
  }, 3000);
}

function advanceToRoutedRevisedDiagnosis() {
  const ticket = getCanonicalTicket();
  ticket.byPersona.onsite.actioned = true;
  setStatePill('REVISED_DIAGNOSIS_ROUTED');
  ticket.handoffPending.ops = true;
  ticket.byPersona.ops.seen = false;
  ticket.byPersona.ops.opened = false;
  state.lim.revisionTimestamp = state.lim.revisionTimestamp || '02:55 SGT';

  appendRevisedDiagnosisCaptureFooter();

  if (window.LOG) {
    window.LOG.appendLine({ ts: currentSGTLog(), source: 'workflow', text: 'State advance · REVISED_DIAGNOSIS_ROUTED · routed to Faye Sit for ops + commercial impact', dataSource: 'Hyperspace OS', nodeChain: ['r-kumar'] });
    window.LOG.appendLine({ ts: currentSGTLog(), source: 'workflow', text: 'KG enriched · revised diagnosis + call transcript attached to incident', dataSource: 'Hyperspace OS', nodeChain: ['pump-casing-crack-pattern'] });
  }
  fireAgentCardLifecycle('workflow', 2000);
  render();
}

function appendRevisedDiagnosisCaptureFooter() {
  const container = document.getElementById('incident-detail-view');
  if (!container) return;
  if (container.querySelector('.dispatch-capture-footer')) return;
  const footer = el('div', 'dispatch-capture-footer');
  footer.innerHTML = `
    <div class="dcf-line"><span class="dcf-ic">✓</span><span class="dcf-txt"><strong>Hyperspace OS</strong> · <span class="dyn-name">Faye Sit</span> notified · revised diagnosis routed</span></div>
    <div class="dcf-line"><span class="dcf-ic">✓</span><span class="dcf-txt">Call transcript + revised diagnosis routed to <strong>A2A Coordination Agent</strong> for chain-of-custody</span></div>
    <div class="dcf-line"><span class="dcf-ic">✓</span><span class="dcf-txt"><strong>Knowledge-Graph</strong> · revised diagnosis + transcript enriched · routing recorded</span></div>`;
  container.appendChild(footer);
  const lbl = el('div', 'dispatched-to-label');
  lbl.innerHTML = `Routed back to <span class="dyn-name">Faye Sit</span> · ${currentSGTLog()}`;
  container.appendChild(lbl);
}

function onEscalateForApprovalClick() {
  const ticket = getCanonicalTicket();
  if (ticket.byPersona.onsite.actioned) return;
  ticket.byPersona.onsite.actioned = true;
  setStatePill('ESCALATED_TO_OFFSITE');
  ticket.handoffPending.offsite = true;
  state.lim.revisionTimestamp = state.lim.revisionTimestamp || '02:55 SGT';
  fireWorkflowAgentArcEscalate();
  appendEscalationCaptureFooter();
  paintLimEscalationComplete();
  render();
}

function paintLimEscalationComplete() {
  // Remove binary CTAs + post-call stages (post-escalation view)
  const slot = document.getElementById('lim-ctas-slot');
  if (slot) slot.innerHTML = '';
}

function appendEscalationCaptureFooter() {
  const container = document.getElementById('incident-detail-view');
  if (!container) return;
  if (container.querySelector('.dispatch-capture-footer')) return;
  const footer = el('div', 'dispatch-capture-footer');
  footer.innerHTML = `
    <div class="dcf-line"><span class="dcf-ic">✓</span><span class="dcf-txt"><strong>Hyperspace OS</strong> confirms revised diagnosis SOP followed</span></div>
    <div class="dcf-line"><span class="dcf-ic">✓</span><span class="dcf-txt">Call transcript routed to <strong>A2A Coordination Agent</strong> for review</span></div>
    <div class="dcf-line"><span class="dcf-ic">✓</span><span class="dcf-txt"><strong>Knowledge-Graph</strong> · team · incident · revised diagnosis + transcript enriched</span></div>`;
  container.appendChild(footer);
  const lbl = el('div', 'dispatched-to-label');
  lbl.innerHTML = `Escalated to <span class="dyn-name">Dr. A. Wong</span> · 02:56 SGT`;
  container.appendChild(lbl);
}

function fireWorkflowAgentArcEscalate() {
  // Mini arc — 3 log lines via Workflow Agent capture
  const agentId = 'workflow';
  setAgentActive(agentId, 'Escalation Capture', 3);
  fireAgentCardLifecycle(agentId, 3000);
  const lines = [
    { delay: 200,  line: { ts: '02:56:10', source: 'workflow', text: 'Lim Wei Jie · escalation captured · revised diagnosis pump casing crack', dataSource: 'Hyperspace OS', nodeChain: ['lim-wei-jie', 'pump-casing-crack-pattern', 'casing-bfp-3a'] } },
    { delay: 900,  line: { ts: '02:56:11', source: 'workflow', text: 'handoff sequence recorded · P2 Onsite → P3 Offsite · approval pending', dataSource: 'Hyperspace OS', nodeChain: ['lim-wei-jie', 'dr-wong'] } },
    { delay: 900,  line: { ts: '02:56:12', source: 'workflow', text: 'SOP-BFP-VIBR-001 · revised diagnosis + call transcript attached to KG', dataSource: 'Hyperspace OS', nodeChain: ['sop-bfp-vibration-investigation', 'pump-casing-crack-pattern'] } },
  ];
  let t = 0;
  lines.forEach((entry, idx) => {
    t += entry.delay;
    scheduleArcStep(t, () => {
      window.LOG.appendLine(entry.line);
      advanceAgentStep(agentId, idx, entry.line);
    });
  });
  t += 400;
  scheduleArcStep(t, () => teardownAgentTree(agentId));
}

// ─────────────────────────────────────────────
// W4 — Dr. A. Wong (Offsite) curated Screen D
// Banner + summary (single 5s loading theater) + revised diagnosis read-only
// + transcript link + Approve escalation CTA
// ─────────────────────────────────────────────

function renderOffsiteIncidentDetail(root) {
  const content = el('div', 'tablet-content');
  content.id = 'incident-detail-view';

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
        <div class="inc-id">${INCIDENT.id} · routed from Lim Wei Jie</div>
        <div class="inc-ts">${INCIDENT.timestamp}</div>
      </div>
      <span class="sev-pill">▲ Severity: ${INCIDENT.severity}</span>
    </div>`;
  content.appendChild(hdr);

  const summarySlot = el('div', 'wong-summary-slot');
  summarySlot.id = 'wong-summary-slot';
  content.appendChild(summarySlot);

  const ctaSlot = el('div', 'wong-cta-slot');
  ctaSlot.id = 'wong-cta-slot';
  content.appendChild(ctaSlot);

  const backBtn = content.querySelector('.inc-back');
  if (backBtn) {
    backBtn.style.cursor = 'pointer';
    backBtn.addEventListener('click', backToMonitoring);
  }

  root.appendChild(content);

  const personaState = activePersonaTicketState();
  if (personaState.actioned) {
    paintWongSummaryComplete();
    paintWongCTAApproved();
    setTimeout(appendWongApprovalCaptureFooter, 200);
    return;
  }

  if (state.wong.summaryRevealed) {
    paintWongSummaryComplete();
    paintWongCTAReady();
  } else {
    startWongScreenDReveal();
  }
}

function startWongScreenDReveal() {
  state.wong.revealStarted = true;
  const slot = document.getElementById('wong-summary-slot');
  if (!slot) return;
  // W6 — Wong loading reveal alias: Turbine Diagnostic Agent (institutional rotating-machinery knowledge)
  slot.innerHTML = `
    <div class="reveal-pending wong-loading" data-stage="wong-summary">
      <span class="reveal-dots"><span></span><span></span><span></span></span>
      <span class="reveal-msg"><span class="reveal-agent">Turbine Diagnostic Agent</span> · Loading institutional rotating-machinery knowledge for Dr. A. Wong</span>
    </div>`;
  // W6 — CTA deferred: spawn only on reveal complete (Section A)
  // W6 — fire right-pane card lifecycle (triage + power-gen critic in parallel)
  fireAgentCardsParallel(['triage', 'critic-power-gen'], 5000);
  if (window.LOG) {
    window.LOG.appendLine({
      ts: currentSGTLog(),
      source: 'triage',
      text: 'Turbine Diagnostic Agent · pulling Wong\'s 2023 Jurong-2 BFP casing field-experience pattern + prior RCA traversal',
      dataSource: 'Hyperspace OS',
      nodeChain: ['casing-rca-jrg-2023', 'pump-casing-crack-pattern', 'dr-wong'],
    });
  }
  pushReveal(() => {
    state.wong.summaryRevealed = true;
    paintWongSummaryComplete();
    paintWongCTAReady();
  }, 5000);
}

function paintWongSummaryComplete() {
  const slot = document.getElementById('wong-summary-slot');
  if (!slot) return;
  const ts = state.lim.revisionTimestamp || '02:55 SGT';
  slot.innerHTML = `
    <div class="summary-report wong-summary">
      <div class="sr-heading">Predicted diagnosis</div>
      <div class="wong-fwd-line">
        <span class="dyn-name">Lim Wei Jie</span> has forwarded this incident · diagnosis revision · escalation for offsite sign-off.
      </div>
      <div class="sr-hypothesis sr-hypothesis-revised wong-revised">
        <div class="sr-hyp-row sr-hyp-original">
          <span class="sr-hyp-name strikethrough">${INCIDENT.hypothesis.primary}</span>
          <span class="sr-hyp-flag">SUPERSEDED</span>
        </div>
        <div class="sr-hyp-row sr-hyp-revised">
          <span class="sr-hyp-revised-label">Revised diagnosis ·</span>
          <span class="sr-hyp-name"><span class="dyn-name">Crack in pump casing on BFP-3A</span></span>
        </div>
        <div class="sr-hyp-revised-detail">
          Confirmed via expert field-experience pattern + targeted inspection (60mm hairline discontinuity, 4-o'clock on volute, near discharge weld).
          Bearing damage secondary, caused by imbalanced loading under casing fatigue.
          <button class="wong-tx-link" type="button">View call transcript · <span class="dyn-name">${ts}</span></button>
        </div>
      </div>
      <div class="wong-ask">
        Approval requested: shaft replacement scheduling + capacity impact escalation to Asset Performance.
      </div>
    </div>`;
  wireTranscriptModalLinks();
}

function paintWongCTADisabled() {
  const slot = document.getElementById('wong-cta-slot');
  if (!slot) return;
  slot.innerHTML = `<button class="wong-approve-cta" type="button" disabled>Approve escalation and route back to <span class="dyn-name-on-green">Faye Sit</span></button>`;
}

function paintWongCTAReady() {
  const slot = document.getElementById('wong-cta-slot');
  if (!slot) return;
  slot.innerHTML = `<button class="wong-approve-cta" type="button">Approve escalation and route back to <span class="dyn-name-on-green">Faye Sit</span></button>`;
  wireWongApproveClick();
}

function paintWongCTAApproved() {
  const slot = document.getElementById('wong-cta-slot');
  if (slot) slot.innerHTML = '';
}

function wireWongApproveClick() {
  const cta = document.querySelector('.wong-approve-cta');
  if (!cta || cta.dataset.wired === '1') return;
  cta.dataset.wired = '1';
  cta.addEventListener('click', onWongApproveClick);
}

function onWongApproveClick() {
  const ticket = getCanonicalTicket();
  if (ticket.byPersona.offsite.actioned) return;
  ticket.byPersona.offsite.actioned = true;
  // W5 — Wong routes BACK to Faye (Site Operations Manager), not direct to Priya.
  setStatePill('ROUTED_BACK_TO_OPS');
  ticket.handoffPending.p1 = true;        // legacy key, harmless
  ticket.handoffPending.ops = true;       // Faye re-receives the ticket
  ticket.handoffPending.analyst = false;  // P4 stays locked until Faye notifies trading desk
  // Reset Faye's seen/opened so banner re-fires + dot reappears; actioned preserved (first dispatch).
  ticket.byPersona.ops.seen = false;
  ticket.byPersona.ops.opened = false;
  state.wong.approvalGiven = true;
  state.wong.approvalTimestamp = '02:58 SGT';
  fireWorkflowAgentArcApprove();
  appendWongApprovalCaptureFooter();
  paintWongCTAApproved();
  render();
}

function appendWongApprovalCaptureFooter() {
  const container = document.getElementById('incident-detail-view');
  if (!container) return;
  if (container.querySelector('.dispatch-capture-footer')) return;
  const footer = el('div', 'dispatch-capture-footer');
  footer.innerHTML = `
    <div class="dcf-line"><span class="dcf-ic">✓</span><span class="dcf-txt"><strong>Hyperspace OS</strong> · escalation approval sign-off recorded</span></div>
    <div class="dcf-line"><span class="dcf-ic">✓</span><span class="dcf-txt">Approval + transcript routed to <strong>A2A Coordination Agent</strong> for chain-of-custody</span></div>
    <div class="dcf-line"><span class="dcf-ic">✓</span><span class="dcf-txt"><strong>Knowledge-Graph</strong> · sign-off attached to incident · routed back to Site Operations Manager</span></div>`;
  container.appendChild(footer);
  const lbl = el('div', 'dispatched-to-label');
  lbl.innerHTML = `Routed back to <span class="dyn-name">Faye Sit</span> · ${state.wong.approvalTimestamp || '02:58 SGT'}`;
  container.appendChild(lbl);
}

function fireWorkflowAgentArcApprove() {
  const agentId = 'workflow';
  setAgentActive(agentId, 'Approval Sign-off Capture', 3);
  fireAgentCardLifecycle(agentId, 3000);
  const lines = [
    { delay: 200, line: { ts: '02:58:05', source: 'workflow', text: 'Sign-off recorded · revised diagnosis confirmed · escalation approved', dataSource: 'Hyperspace OS', nodeChain: ['dr-wong', 'pump-casing-crack-pattern'] } },
    { delay: 900, line: { ts: '02:58:06', source: 'workflow', text: 'Workflow trace · P3 Offsite → P1 Ops Tower · route-back for ops + commercial impact action', dataSource: 'Hyperspace OS', nodeChain: ['dr-wong', 'r-kumar'] } },
    { delay: 900, line: { ts: '02:58:07', source: 'workflow', text: 'KG enriched · sign-off attached · routed back to Faye Sit · ops manager action queued', dataSource: 'Hyperspace OS', nodeChain: ['sop-bfp-vibration-investigation', 'r-kumar'] } },
  ];
  let t = 0;
  lines.forEach((entry, idx) => {
    t += entry.delay;
    scheduleArcStep(t, () => {
      window.LOG.appendLine(entry.line);
      advanceAgentStep(agentId, idx, entry.line);
    });
  });
  t += 400;
  scheduleArcStep(t, () => teardownAgentTree(agentId));
}

// ─────────────────────────────────────────────
// W5 — Faye Escalation Report (state-driven Screen D variant)
// Routed to when ticket.statePill ∈ {ROUTED_BACK_TO_OPS, ROUTED_TO_TRADING_DESK, HEDGED}.
// 5s loading theater → 4 sections: revised diagnosis · Lim workflow summary · source transcript link · recommendation + impact + Notify CTA.
// ─────────────────────────────────────────────

function renderOpsEscalationReport(root) {
  const content = el('div', 'tablet-content');
  content.id = 'incident-detail-view';

  // Header band — green gradient + back chevron + state pill
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
        <div class="inc-id">${INCIDENT.id} · returned from Dr. A. Wong</div>
        <div class="inc-ts">${INCIDENT.timestamp}</div>
      </div>
      <span class="sev-pill">▲ Severity: ${INCIDENT.severity}</span>
    </div>`;
  content.appendChild(hdr);

  // W6 — only heading + loading initially. 4 sections + CTA spawn after reveal.
  const wrap = el('div', 'ops-escalation-report');
  wrap.innerHTML = `
    <div class="oer-card">
      <div class="oer-heading">Escalation report</div>

      <div class="reveal-pending oer-loading" data-stage="oer-summary">
        <span class="reveal-dots"><span></span><span></span><span></span></span>
        <span class="reveal-msg"><span class="reveal-agent">A2A Coordination Agent</span> · Loading escalation report for <span class="dyn-name">Faye Sit</span></span>
      </div>
    </div>`;
  content.appendChild(wrap);

  const backBtn = content.querySelector('.inc-back');
  if (backBtn) {
    backBtn.style.cursor = 'pointer';
    backBtn.addEventListener('click', backToMonitoring);
  }

  root.appendChild(content);

  const ticket = getCanonicalTicket();
  const pill = ticket.statePill;

  if (pill === 'ROUTED_TO_TRADING_DESK' || pill === 'HEDGED') {
    // Already actioned — paint completed state immediately + capture footer
    revealEscalationReportInstant();
    paintEscalationReportCTAActioned();
    setTimeout(appendNotifyTradingDeskCaptureFooter, 200);
    return;
  }

  // W7 — First open at REVISED_DIAGNOSIS_ROUTED or DIAGNOSIS_CONFIRMED_WO_SUBMITTED — run loading theater
  startEscalationReportReveal();
}

// W6 — spawn 4 sections + CTA on reveal (deferred from initial paint)
function spawnEscalationReportContent() {
  const card = document.querySelector('.ops-escalation-report .oer-card');
  if (!card) return;
  if (card.querySelector('.oer-content')) return;
  const contentHTML = `
    <div class="oer-content reveal-in">
      <div class="oer-section">
        <div class="oer-section-label">Correct diagnosis (revised)</div>
        <div class="oer-diagnosis"><span class="dyn-name">Crack in pump casing on BFP-3A</span></div>
        <div class="oer-diagnosis-detail">
          Confirmed via expert field-experience pattern + targeted inspection (60mm hairline discontinuity, 4-o'clock on volute, near discharge weld). Bearing damage secondary, caused by imbalanced loading under casing fatigue.
        </div>
      </div>

      <div class="oer-section">
        <div class="oer-section-label"><span class="dyn-name">Lim Wei Jie</span>'s completed workflow</div>
        <div class="oer-workflow-list">
          <div class="oer-wl-item">✓ 5/5 Safety checks</div>
          <div class="oer-wl-item">✓ 3/3 Instrument checks</div>
          <div class="oer-wl-item">✓ 2/2 Root cause isolation checks</div>
          <div class="oer-wl-item">✓ Initial bearing-spalling hypothesis rejected</div>
          <div class="oer-wl-item">✓ Call with <span class="dyn-name">Dr. A. Wong</span> · 7m 23s · transcript captured</div>
          <div class="oer-wl-item">✓ Transcript captured · <span class="dyn-name">Dr. A. Wong</span> + <span class="dyn-name">Lim Wei Jie</span> discussed and agreed <button class="oer-tx-inline" type="button">(see transcript)</button></div>
        </div>
      </div>

      <div class="oer-section">
        <div class="oer-section-label">Source</div>
        <button class="oer-transcript-link" type="button">View call transcript + summary</button>
      </div>

      <div class="oer-section oer-section-action">
        <div class="oer-recommendation">
          <div class="oer-rec-label">Recommendation</div>
          <div class="oer-rec-body">Shut down BFP-3A immediately · isolate Block 2 feedwater</div>
        </div>
        <div class="oer-impact">
          <div class="oer-imp-label">Impact</div>
          <div class="oer-imp-body">50 MW Block 2 derate · PSO commitment window 09:00–18:00 SGT · 4h peak tariff exposure · ~SGD 240k revenue at risk · curtailment / hedge eligible</div>
        </div>
      </div>
    </div>
    <button class="oer-cta" type="button" disabled>
      Notify trading desk · route to <span class="dyn-name-on-green">Priya Sundaram</span>
    </button>`;
  card.insertAdjacentHTML('beforeend', contentHTML);
}

function revealEscalationReportInstant() {
  const loading = document.querySelector('.oer-loading');
  if (loading) loading.remove();
  spawnEscalationReportContent();
  wireTranscriptModalLinks();
}

function paintEscalationReportCTAActioned() {
  const cta = document.querySelector('.oer-cta');
  if (!cta) return;
  cta.disabled = true;
  cta.classList.add('oer-cta-actioned');
  cta.textContent = '✓ Trading desk notified · routed to Priya Sundaram';
}

function startEscalationReportReveal() {
  // W6 — fire Workflow Agent card synced with Escalation Report Loading
  fireAgentCardLifecycle('workflow', 5000);
  pushReveal(() => {
    revealEscalationReportInstant();
    const cta = document.querySelector('.oer-cta');
    if (cta) cta.disabled = false;
    wireNotifyTradingDeskCTA();
  }, 5000);
}

function wireNotifyTradingDeskCTA() {
  const cta = document.querySelector('.oer-cta');
  if (!cta || cta.dataset.wired === '1') return;
  cta.dataset.wired = '1';
  cta.addEventListener('click', onNotifyTradingDeskClick);
}

function onNotifyTradingDeskClick() {
  const cta = document.querySelector('.oer-cta');
  if (cta && cta.disabled) return;
  const ticket = getCanonicalTicket();
  // W7 — guard against re-fire from the two return states
  if (ticket.statePill !== 'REVISED_DIAGNOSIS_ROUTED' &&
      ticket.statePill !== 'DIAGNOSIS_CONFIRMED_WO_SUBMITTED') return;
  setStatePill('ROUTED_TO_TRADING_DESK');
  ticket.handoffPending.analyst = true;
  ticket.handoffPending.ops = false;
  state.priyaUnlocked = true;
  fireWorkflowAgentArcNotify();
  appendNotifyTradingDeskCaptureFooter();
  paintEscalationReportCTAActioned();
  render();
}

function appendNotifyTradingDeskCaptureFooter() {
  const container = document.getElementById('incident-detail-view');
  if (!container) return;
  if (container.querySelector('.dispatch-capture-footer')) return;
  const footer = el('div', 'dispatch-capture-footer');
  footer.innerHTML = `
    <div class="dcf-line"><span class="dcf-ic">✓</span><span class="dcf-txt"><strong>Hyperspace OS</strong> · ops escalation logged · trading desk notification queued</span></div>
    <div class="dcf-line"><span class="dcf-ic">✓</span><span class="dcf-txt">Escalation packet routed to <strong>A2A Coordination Agent</strong> for trading-desk chain</span></div>
    <div class="dcf-line"><span class="dcf-ic">✓</span><span class="dcf-txt"><strong>Knowledge-Graph</strong> · commercial-impact context attached · routed to Trader</span></div>`;
  container.appendChild(footer);
  const lbl = el('div', 'dispatched-to-label');
  lbl.innerHTML = `Routed to <span class="dyn-name">Priya Sundaram</span> · 02:59 SGT`;
  container.appendChild(lbl);
}

function fireWorkflowAgentArcNotify() {
  const agentId = 'workflow';
  setAgentActive(agentId, 'Trading Desk Notification', 3);
  fireAgentCardLifecycle(agentId, 3000);
  const lines = [
    { delay: 200, line: { ts: '02:59:02', source: 'workflow', text: 'Faye Sit · trading desk notification queued · commercial impact context attached', dataSource: 'Hyperspace OS', nodeChain: ['r-kumar', 'pred-mw-derate'] } },
    { delay: 900, line: { ts: '02:59:03', source: 'workflow', text: 'Handoff sequence recorded · P1 Ops Tower → P4 Asset Perf · trading desk action queued', dataSource: 'Hyperspace OS', nodeChain: ['r-kumar', 'p-sundaram'] } },
    { delay: 900, line: { ts: '02:59:04', source: 'workflow', text: 'KG enriched · ~SGD 240k revenue exposure attached · Trader desk routing complete', dataSource: 'Hyperspace OS', nodeChain: ['pred-mw-derate', 'p-sundaram'] } },
  ];
  let t = 0;
  lines.forEach((entry, idx) => {
    t += entry.delay;
    scheduleArcStep(t, () => {
      window.LOG.appendLine(entry.line);
      advanceAgentStep(agentId, idx, entry.line);
    });
  });
  t += 400;
  scheduleArcStep(t, () => teardownAgentTree(agentId));
}

// ─────────────────────────────────────────────
// W5 — Priya (Asset Perf Analyst / Trader) curated Screen D
// Market Intelligence Agent loading theater → operational context · 4 decision options · Lock decision CTA.
// ─────────────────────────────────────────────

function renderAnalystIncidentDetail(root) {
  const content = el('div', 'tablet-content');
  content.id = 'incident-detail-view';

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
        <div class="inc-id">${INCIDENT.id} · routed from Faye Sit</div>
        <div class="inc-ts">${INCIDENT.timestamp}</div>
      </div>
      <span class="sev-pill">▲ Severity: ${INCIDENT.severity}</span>
    </div>`;
  content.appendChild(hdr);

  // W6 — only heading + loading initially. Operational context + decision options + Lock CTA spawn at reveal.
  const wrap = el('div', 'analyst-screen-d');
  wrap.innerHTML = `
    <div class="analyst-card">
      <div class="ac-heading">Trading desk report</div>

      <div class="reveal-pending ac-loading" data-stage="analyst-summary">
        <span class="reveal-dots"><span></span><span></span><span></span></span>
        <span class="reveal-msg"><span class="reveal-agent">Market Intelligence Agent</span> · Loading market position + hedge eligibility for INC-2026-0537</span>
      </div>
    </div>`;
  content.appendChild(wrap);

  const backBtn = content.querySelector('.inc-back');
  if (backBtn) {
    backBtn.style.cursor = 'pointer';
    backBtn.addEventListener('click', backToMonitoring);
  }

  root.appendChild(content);

  if (state.priya.decisionLocked) {
    revealAnalystScreenInstant();
    restoreSelectedOptionUI();
    paintAnalystLockedCTA();
    setTimeout(appendLockDecisionCaptureFooter, 200);
    return;
  }

  if (state.priya.escalationSummaryRevealed) {
    revealAnalystScreenInstant();
    wireDecisionOptions();
    restoreSelectedOptionUI();
    wireLockDecisionCTA();
    if (state.priya.selectedOption) {
      const cta = document.querySelector('.ac-lock-cta');
      if (cta) cta.disabled = false;
    }
    return;
  }

  startAnalystScreenDReveal();
}

// W6 — spawn operational context + decision options + Lock CTA at reveal (deferred)
function spawnAnalystScreenContent() {
  const card = document.querySelector('.analyst-screen-d .analyst-card');
  if (!card) return;
  if (card.querySelector('.ac-content')) return;
  const contentHTML = `
    <div class="ac-content reveal-in">
      <div class="ac-section ac-section-context">
        <div class="ac-context-row ac-context-exposure">
          <div class="ac-ctx-label">EXPOSURE</div>
          <div class="ac-ctx-content">
            <div class="ac-ctx-primary">50 MW derate · SGD 240k revenue at risk</div>
            <div class="ac-ctx-secondary">4× 30-min settlement periods · HH18 (09:00 SGT) → HH21 (10:30 SGT) · PSO commitment window</div>
          </div>
        </div>
        <button class="ac-transcript-link" type="button">View source transcript</button>
      </div>

      <div class="ac-section">
        <div class="ac-section-label">Decision options · select one</div>
        <div class="ac-decision-list">
          <button class="ac-option-card" data-option="hedge" type="button">
            <div class="ac-opt-header">
              <span class="ac-opt-bullet">○</span>
              <div class="ac-opt-body">
                <span class="ac-opt-title">Hedge forward · 4×HH PSO window</span>
                <span class="ac-opt-detail">Lock SGD 120/MWh forward · 50 MW × 4 settlement periods</span>
              </div>
            </div>
            <div class="ac-opt-viz">
              <svg class="ac-opt-spark" viewBox="0 0 120 36" preserveAspectRatio="none" aria-hidden="true">
                <path d="M 0 30 L 20 28 L 40 24 L 60 18 L 80 12 L 100 8 L 120 5 L 120 36 L 0 36 Z" fill="#00A651" opacity="0.15"/>
                <path d="M 0 30 L 20 28 L 40 24 L 60 18 L 80 12 L 100 8 L 120 5" stroke="#00A651" stroke-width="2" fill="none"/>
              </svg>
              <div class="ac-opt-stats">
                <div class="ac-opt-amt-chip ac-opt-amt-positive">+SGD 240k</div>
                <div class="ac-opt-delta-chip ac-opt-delta-positive">+5.7% toward May target</div>
              </div>
            </div>
          </button>
          <button class="ac-option-card" data-option="cross-site" type="button">
            <div class="ac-opt-header">
              <span class="ac-opt-bullet">○</span>
              <div class="ac-opt-body">
                <span class="ac-opt-title">Cross-site balance · Sakra-CCGT-1 standby</span>
                <span class="ac-opt-detail">Dispatch Sakra standby capacity · cover BFP-3A derate</span>
              </div>
            </div>
            <div class="ac-opt-viz">
              <svg class="ac-opt-spark" viewBox="0 0 120 36" preserveAspectRatio="none" aria-hidden="true">
                <path d="M 0 32 L 30 32 L 30 16 L 70 16 L 70 8 L 120 8 L 120 36 L 0 36 Z" fill="#00A651" opacity="0.15"/>
                <path d="M 0 32 L 30 32 L 30 16 L 70 16 L 70 8 L 120 8" stroke="#00A651" stroke-width="2" fill="none"/>
              </svg>
              <div class="ac-opt-stats">
                <div class="ac-opt-amt-chip ac-opt-amt-positive">+SGD 198k</div>
                <div class="ac-opt-delta-chip ac-opt-delta-positive">+4.7% toward May target</div>
              </div>
            </div>
          </button>
          <button class="ac-option-card" data-option="spot" type="button">
            <div class="ac-opt-header">
              <span class="ac-opt-bullet">○</span>
              <div class="ac-opt-body">
                <span class="ac-opt-title">Sell-back to spot · USEP arbitrage</span>
                <span class="ac-opt-detail">Sell uncommitted MW into spot market · capture forecast +20% USEP spike</span>
              </div>
            </div>
            <div class="ac-opt-viz">
              <svg class="ac-opt-spark" viewBox="0 0 120 36" preserveAspectRatio="none" aria-hidden="true">
                <path d="M 0 24 L 30 22 L 50 26 L 70 10 L 90 4 L 100 6 L 120 8 L 120 36 L 0 36 Z" fill="#00A651" opacity="0.15"/>
                <path d="M 0 24 L 30 22 L 50 26 L 70 10 L 90 4 L 100 6 L 120 8" stroke="#00A651" stroke-width="2" fill="none"/>
              </svg>
              <div class="ac-opt-stats">
                <div class="ac-opt-amt-chip ac-opt-amt-positive">+SGD 156k</div>
                <div class="ac-opt-delta-chip ac-opt-delta-positive">+3.7% toward May target</div>
              </div>
            </div>
          </button>
          <button class="ac-option-card" data-option="curtailment" type="button">
            <div class="ac-opt-header">
              <span class="ac-opt-bullet">○</span>
              <div class="ac-opt-body">
                <span class="ac-opt-title">Curtail · accept PSO penalty</span>
                <span class="ac-opt-detail">Accept 4×HH curtailment penalty · preserve BFP for full inspection</span>
              </div>
            </div>
            <div class="ac-opt-viz">
              <svg class="ac-opt-spark" viewBox="0 0 120 36" preserveAspectRatio="none" aria-hidden="true">
                <path d="M 0 14 L 60 14 L 70 32 L 120 32 L 120 36 L 0 36 Z" fill="#DC2626" opacity="0.12"/>
                <path d="M 0 14 L 60 14 L 70 32 L 120 32" stroke="#DC2626" stroke-width="2" fill="none"/>
              </svg>
              <div class="ac-opt-stats">
                <div class="ac-opt-amt-chip ac-opt-amt-negative">-SGD 88k</div>
                <div class="ac-opt-delta-chip ac-opt-delta-negative">-2.1% toward May target</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
    <button class="ac-lock-cta" type="button" disabled>
      Lock decision · Hyperspace OS confirms revenue exposure neutralized
    </button>`;
  card.insertAdjacentHTML('beforeend', contentHTML);
}

function revealAnalystScreenInstant() {
  const loading = document.querySelector('.ac-loading');
  if (loading) loading.remove();
  spawnAnalystScreenContent();
  wireTranscriptModalLinks();
}

function startAnalystScreenDReveal() {
  state.priya.escalationRevealStarted = true;
  // W6 — fire Market Intelligence Agent card synced with Priya Loading
  fireAgentCardLifecycle('market-intelligence', 5000);
  pushReveal(() => {
    state.priya.escalationSummaryRevealed = true;
    revealAnalystScreenInstant();
    wireDecisionOptions();
    wireLockDecisionCTA();
  }, 5000);
}

function wireDecisionOptions() {
  document.querySelectorAll('.ac-option-card').forEach(card => {
    if (card.dataset.wired === '1') return;
    card.dataset.wired = '1';
    card.addEventListener('click', () => {
      if (state.priya.decisionLocked) return;
      document.querySelectorAll('.ac-option-card').forEach(c => {
        c.dataset.selected = 'false';
        const b = c.querySelector('.ac-opt-bullet');
        if (b) b.textContent = '○';
      });
      card.dataset.selected = 'true';
      const bullet = card.querySelector('.ac-opt-bullet');
      if (bullet) bullet.textContent = '✓';
      state.priya.selectedOption = card.dataset.option;
      const cta = document.querySelector('.ac-lock-cta');
      if (cta) cta.disabled = false;
    });
  });
}

function restoreSelectedOptionUI() {
  if (!state.priya.selectedOption) return;
  const card = document.querySelector(`.ac-option-card[data-option="${state.priya.selectedOption}"]`);
  if (!card) return;
  card.dataset.selected = 'true';
  const bullet = card.querySelector('.ac-opt-bullet');
  if (bullet) bullet.textContent = '✓';
}

function wireLockDecisionCTA() {
  const cta = document.querySelector('.ac-lock-cta');
  if (!cta || cta.dataset.wired === '1') return;
  cta.dataset.wired = '1';
  cta.addEventListener('click', onLockDecisionClick);
}

function onLockDecisionClick() {
  const cta = document.querySelector('.ac-lock-cta');
  if (!cta || cta.disabled) return;
  if (state.priya.decisionLocked) return;
  if (!state.priya.selectedOption) return;
  const ticket = getCanonicalTicket();
  ticket.byPersona.analyst.actioned = true;
  setStatePill('HEDGED');
  ticket.handoffPending.analyst = false;
  state.priya.decisionLocked = true;
  state.priya.decisionTimestamp = '03:01 SGT';
  state.priya.demoEndBannerShown = true;
  fireWorkflowAgentArcLock();
  appendLockDecisionCaptureFooter();
  paintAnalystLockedCTA();
  // Lock all option cards
  document.querySelectorAll('.ac-option-card').forEach(c => { c.style.pointerEvents = 'none'; });
  // W8 G.8 — for the laptop modal path, hold the locked CTA visible briefly before closing.
  if (state.activePersona === 'analyst') {
    setTimeout(() => {
      // statePill already HEDGED so syncLaptopModalState() will tear the modal down on render().
      render();
    }, 900);
  } else {
    render();
  }
}

function paintAnalystLockedCTA() {
  const cta = document.querySelector('.ac-lock-cta');
  if (!cta) return;
  cta.disabled = true;
  cta.classList.add('ac-lock-cta-actioned');
  const label = state.priya.selectedOption ? PRIYA_OPTION_LABEL[state.priya.selectedOption] : 'Decision';
  cta.innerHTML = `✓ Decision locked · ${label}`;
}

function appendLockDecisionCaptureFooter() {
  const container = document.getElementById('incident-detail-view');
  if (!container) return;
  if (container.querySelector('.dispatch-capture-footer')) return;
  const footer = el('div', 'dispatch-capture-footer');
  footer.innerHTML = `
    <div class="dcf-line"><span class="dcf-ic">✓</span><span class="dcf-txt"><strong>Hyperspace OS</strong> · trading decision locked · commercial close</span></div>
    <div class="dcf-line"><span class="dcf-ic">✓</span><span class="dcf-txt">Decision audit + lineage routed to <strong>A2A Coordination Agent</strong></span></div>
    <div class="dcf-line"><span class="dcf-ic">✓</span><span class="dcf-txt"><strong>Knowledge-Graph</strong> · trading outcome attached · cycle complete</span></div>`;
  container.appendChild(footer);
  const lbl = el('div', 'dispatched-to-label');
  const optionLabel = state.priya.selectedOption ? PRIYA_OPTION_LABEL[state.priya.selectedOption] : '—';
  lbl.innerHTML = `Decision locked · <span class="dyn-name">${optionLabel}</span> · ${state.priya.decisionTimestamp || '03:01 SGT'}`;
  container.appendChild(lbl);
}

function fireWorkflowAgentArcLock() {
  const agentId = 'workflow';
  setAgentActive(agentId, 'Trading Decision Capture', 3);
  fireAgentCardLifecycle(agentId, 3000);
  const optionLabel = state.priya.selectedOption ? PRIYA_OPTION_LABEL[state.priya.selectedOption] : '—';
  const lines = [
    { delay: 200, line: { ts: '03:01:11', source: 'workflow', text: `Priya Sundaram · trading decision locked · ${optionLabel}`, dataSource: 'Hyperspace OS', nodeChain: ['p-sundaram', 'pred-mw-derate'] } },
    { delay: 900, line: { ts: '03:01:12', source: 'workflow', text: 'Decision audit + market position lineage recorded · cycle close', dataSource: 'Hyperspace OS', nodeChain: ['p-sundaram'] } },
    { delay: 900, line: { ts: '03:01:13', source: 'workflow', text: 'KG · trading outcome attached to INC-2026-0537 · revenue exposure neutralized', dataSource: 'Hyperspace OS', nodeChain: ['pred-mw-derate', 'sop-bfp-vibration-investigation'] } },
  ];
  let t = 0;
  lines.forEach((entry, idx) => {
    t += entry.delay;
    scheduleArcStep(t, () => {
      window.LOG.appendLine(entry.line);
      advanceAgentStep(agentId, idx, entry.line);
    });
  });
  t += 400;
  scheduleArcStep(t, () => teardownAgentTree(agentId));
}

// ─────────────────────────────────────────────
// W4 — Transcript modal (multi-entry-point handlers)
// ─────────────────────────────────────────────

function openTranscriptModal() {
  const m = document.getElementById('transcript-modal');
  if (m) { m.dataset.open = 'true'; m.setAttribute('aria-hidden', 'false'); }
}
function closeTranscriptModal() {
  const m = document.getElementById('transcript-modal');
  if (m) { m.dataset.open = 'false'; m.setAttribute('aria-hidden', 'true'); }
}
function wireTranscriptModalLinks() {
  document.querySelectorAll('.post-call-transcript-link, .sr-hyp-transcript-link, .wong-tx-link, .oer-transcript-link, .ac-transcript-link, .oer-tx-inline').forEach(btn => {
    if (btn.dataset.wired === '1') return;
    btn.dataset.wired = '1';
    btn.addEventListener('click', openTranscriptModal);
  });
}
function initTranscriptModal() {
  const modal = document.getElementById('transcript-modal');
  if (!modal || modal.dataset.wired === '1') return;
  modal.dataset.wired = '1';
  modal.addEventListener('click', e => {
    if (e.target.closest('.transcript-modal-close')) { closeTranscriptModal(); return; }
    if (e.target.classList.contains('transcript-modal-backdrop')) { closeTranscriptModal(); return; }
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (modal.dataset.open === 'true') closeTranscriptModal();
  });
}

// ── Monitoring dashboard (Screens A / B / C) — W2.6 ──
function currentSGTTime() {
  // Hardcoded for demo — 02:47 SGT matches INC-2026-0537 timestamp
  return '02:47 SGT';
}

function buildLandedIncidentRow() {
  let stateText, stateClass, dynamicTagText;
  switch (state.incidentPhase) {
    case 'DISPATCHED_TO_ONSITE':
      stateText = STATE_PILL_LABEL.DISPATCHED_TO_ONSITE;
      stateClass = 'dispatched';
      dynamicTagText = { label: 'dispatched to Lim Wei Jie ·', value: '02:47 SGT', from: null };
      break;
    case 'REVISED_DIAGNOSIS_ROUTED':
      stateText = STATE_PILL_LABEL.REVISED_DIAGNOSIS_ROUTED;
      stateClass = 'revised-diagnosis-routed';
      dynamicTagText = { label: 'returned by Lim Wei Jie ·', value: '02:58 SGT', from: null };
      break;
    case 'DIAGNOSIS_CONFIRMED_WO_SUBMITTED':
      stateText = STATE_PILL_LABEL.DIAGNOSIS_CONFIRMED_WO_SUBMITTED;
      stateClass = 'revised-diagnosis-routed';
      dynamicTagText = { label: 'WO submitted by Lim Wei Jie ·', value: '02:58 SGT', from: null };
      break;
    case 'ROUTED_TO_TRADING_DESK':
      stateText = STATE_PILL_LABEL.ROUTED_TO_TRADING_DESK;
      stateClass = 'routed-to-trading-desk';
      dynamicTagText = { label: 'routed to Priya Sundaram ·', value: '02:59 SGT', from: null };
      break;
    case 'HEDGED':
      stateText = STATE_PILL_LABEL.HEDGED;
      stateClass = 'hedged';
      dynamicTagText = { label: 'cycle closed ·', value: '03:01 SGT', from: null };
      break;
    case 'TRIAGE_READY':
    default:
      stateText = STATE_PILL_LABEL.TRIAGE_READY;
      stateClass = 'triage-ready';
      dynamicTagText = { label: 'onsite verification ·', value: 'pending', from: null };
      break;
  }
  const ticket = getCanonicalTicket();
  const pState = ticket.byPersona[state.activePersona] || { seen: false, opened: false, actioned: false };
  // W5 — unread red dot: tracks handoffPending (incoming unread); cleared on banner consume.
  const showUnreadDot = ticket.handoffPending[state.activePersona] === true || (pState.seen === true && pState.opened === false);
  const ownerInfo = ROW_OWNER_BY_PERSONA[state.activePersona] || ROW_OWNER_BY_PERSONA.ops;
  return {
    id: INCIDENT.id,
    asset: INCIDENT.asset,
    body: 'BFP-3A NDE bearing housing vibration RMS exceeds ISO 10816-7 Zone C threshold. Hyperspace OS hypothesis: NDE bearing race spalling (early-stage). Pending onsite verification.',
    severity: INCIDENT.severity,
    state: stateText,
    stateClass: stateClass,
    age: 'Just now',
    owner: ownerInfo.name,
    ownerInitials: ownerInfo.initials,
    clickable: true,
    highlighted: true,
    isUnread: showUnreadDot,
    dynamicTagText,
  };
}

function renderMonitoringView(root) {
  const content = el('div', 'tablet-content');

  // (A) Header band — Sembcorp-teal, click target. W3.9: clickable per active persona handoff
  const hdr = el('div', 'mon-header');
  const persona = PERSONA_INITIALS[state.activePersona] || PERSONA_INITIALS.ops;
  hdr.innerHTML = `
    <div class="mon-hdr-left">
      <div class="mon-hdr-brand">Hyperspace OS</div>
    </div>
    <div class="mon-hdr-right">
      <div class="mon-hdr-time">${currentSGTTime()}</div>
      <div class="mon-hdr-engineer">
        <span class="mon-hdr-engineer-pill" title="${persona.name}"><span class="mon-hdr-engineer-initials">${persona.initials}</span>My view</span>
        <span class="mon-hdr-engineer-all">Team view</span>
      </div>
    </div>
  `;
  const ticket = getCanonicalTicket();
  const hdrClickable = (state.screen === 'monitoring' || state.screen === 'monitoring-landed') &&
                       ticket && ticket.handoffPending[state.activePersona] === true;
  if (hdrClickable) {
    hdr.classList.add('mon-header-clickable');
    hdr.style.cursor = 'pointer';
    hdr.addEventListener('click', onHeaderClick);
  }
  content.appendChild(hdr);

  // (B) Stat row — 3-up · W5: row gate seen OR opened OR actioned (banner consumes flip seen=true)
  const personaTasks = buildPersonaOwnTasks(state.activePersona);
  const ticketForCounts = getCanonicalTicket();
  const pStateGate = ticketForCounts && ticketForCounts.byPersona[state.activePersona];
  const incShown = !!(pStateGate && (pStateGate.seen || pStateGate.opened || pStateGate.actioned));
  const activeCount     = personaTasks.length + (incShown ? 1 : 0);
  const monitoringCount = 2;
  const archivedCount   = 12;
  const stats = el('div', 'mon-stat-row');
  stats.innerHTML = `
    <div class="mon-stat">
      <div class="mon-stat-val mon-stat-val-active">${activeCount}</div>
      <div class="mon-stat-lbl">Active Tasks</div>
    </div>
    <div class="mon-stat">
      <div class="mon-stat-val mon-stat-val-monitor">${monitoringCount}</div>
      <div class="mon-stat-lbl">Monitoring</div>
    </div>
    <div class="mon-stat">
      <div class="mon-stat-val mon-stat-val-arch">${archivedCount}</div>
      <div class="mon-stat-lbl">Archived</div>
    </div>
  `;
  content.appendChild(stats);

  // (C) Incidents list — W3.6: My Priorities · My tasks for today · n
  const list = el('div', 'mon-incidents');
  const listHdr = el('div', 'mon-incidents-hdr');
  listHdr.innerHTML = `
    <div class="mon-list-title">My Priorities</div>
    <div class="mon-list-sub">My tasks for today · ${activeCount}</div>
  `;
  list.appendChild(listHdr);

  // W5 — Wong post-approval banner (only on offsite monitoring after approve fired)
  if (state.activePersona === 'offsite' && state.wong && state.wong.approvalGiven) {
    const wpab = el('div', 'wong-post-approval-banner');
    wpab.innerHTML = `
      <span class="wpab-ic">✓</span>
      <span class="wpab-txt">
        Approval given · returned to <span class="dyn-name">Faye Sit</span> · <span class="wpab-ts">${state.wong.approvalTimestamp || '02:58 SGT'}</span>
      </span>`;
    list.appendChild(wpab);
  }

  // W5 — Priya demo-end banner (only on analyst monitoring after decision locked)
  if (state.activePersona === 'analyst' && state.priya && state.priya.demoEndBannerShown) {
    const deb = el('div', 'demo-end-banner');
    const optionLabel = state.priya.selectedOption ? PRIYA_OPTION_LABEL[state.priya.selectedOption] : '—';
    deb.innerHTML = `
      <span class="deb-ic">✓</span>
      <span class="deb-txt">
        Cycle complete · <span class="dyn-name">${optionLabel}</span> locked · revenue exposure neutralized · INC-2026-0537 closed · <span class="deb-ts">${state.priya.decisionTimestamp || '03:01 SGT'}</span>
      </span>`;
    list.appendChild(deb);
  }

  // W3.10 — canonical incident only renders if active persona has seen banner.
  // Prepends to persona's own-task list.
  const orderedRows = incShown
    ? [buildLandedIncidentRow(), ...personaTasks]
    : [...personaTasks];

  orderedRows.forEach(row => {
    const card = el('div', 'mon-incident-card');
    if (row.highlighted) card.classList.add('mon-incident-card-highlighted');
    if (row.clickable) {
      card.classList.add('mon-incident-card-clickable');
      card.addEventListener('click', openIncidentDetail);
    }
    const sevPrefix = (row.severity === 'AMBER' || row.severity === 'RED') ? '▲ ' : '';
    const stateClass = row.stateClass || row.state.toLowerCase();
    // W3.6 — inline dynamic content next to state pill
    const dyn = row.dynamicTagText;
    const dynInline = dyn
      ? `<span class="mon-pill-dyn"> · ${dyn.label} <span class="mon-pill-dyn-val">${dyn.value}</span>${dyn.from ? ` from <span class="mon-pill-dyn-from">${dyn.from}</span>` : ''}</span>`
      : '';
    const unreadDot = row.isUnread ? '<span class="mon-unread-dot" aria-label="unread"></span>' : '';
    card.innerHTML = `
      ${unreadDot}
      <div class="mon-card-row mon-card-row-top">
        <span class="mon-card-id">${row.id}</span>
        <div class="mon-card-pills">
          <span class="mon-pill mon-pill-sev mon-pill-sev-${row.severity.toLowerCase()}">${sevPrefix}${row.severity}</span>
          <span class="mon-pill mon-pill-state mon-pill-state-${stateClass}">${row.state}${dynInline}</span>
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

  // (D) Notification banner — rendered when state.bannerVisible. W3.9: copy varies per state.bannerKey
  if (state.bannerVisible) {
    const banner = el('div', 'mon-banner');
    const copy = BANNER_COPY[state.bannerKey] || BANNER_COPY.ops;
    banner.innerHTML = `
      <div class="mon-banner-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <polyline points="12,7 12,12 15,15"/>
        </svg>
      </div>
      <div class="mon-banner-body">
        <div class="mon-banner-lbl">${copy.label}</div>
        <div class="mon-banner-title">${copy.body}</div>
      </div>
      <div class="mon-banner-time">now</div>
    `;
    banner.addEventListener('click', skipBanner);
    content.appendChild(banner);
  }

  root.appendChild(content);
}

// ── W3.9 / W5 — Header click: per-persona banner + arc clone, consumes handoffPending ──
function onHeaderClick() {
  const personaKey = state.activePersona;
  const ticket = getCanonicalTicket();
  if (!ticket.handoffPending[personaKey]) return;

  ticket.handoffPending[personaKey] = false;
  ticket.byPersona[personaKey].seen = true;

  state.bannerVisible = true;
  // W7 — pick return-banner copy when Faye re-receives via Lim (revised or confirmed paths)
  if (personaKey === 'ops' && ticket.statePill === 'REVISED_DIAGNOSIS_ROUTED') {
    state.bannerKey = 'opsRouteBack';
  } else if (personaKey === 'ops' && ticket.statePill === 'DIAGNOSIS_CONFIRMED_WO_SUBMITTED') {
    state.bannerKey = 'opsConfirmedReturn';
  } else {
    state.bannerKey = personaKey;
  }

  if (personaKey === 'ops' && !state.incidentLanded) {
    // P1's first header click — original W3.7 path: 3s notify → land row
    state.history.push('monitoring');
    state.screen = 'monitoring-notify';
    render();
    state.notifyTimer = setTimeout(fadeBannerThenLand, 3000);
  } else {
    // Handoff click — banner only, no screen-state change (row already landed)
    render();
    state.notifyTimer = setTimeout(fadeBannerOnly, 3000);
  }

  fireArc(personaKey);
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

function fadeBannerOnly() {
  const banner = document.querySelector('.mon-banner');
  if (banner) banner.classList.add('mon-banner-out');
  setTimeout(() => {
    state.bannerVisible = false;
    state.notifyTimer = null;
    render();
  }, 500);
}

function skipBanner() {
  if (state.notifyTimer) {
    clearTimeout(state.notifyTimer);
    state.notifyTimer = null;
  }
  if (state.activePersona === 'ops' && !state.incidentLanded) {
    fadeBannerThenLand();
  } else {
    fadeBannerOnly();
  }
}

function openIncidentDetail() {
  const personaKey = state.activePersona;
  const ticket = getCanonicalTicket();
  const personaState = ticket.byPersona[personaKey];
  cancelInProgressReveal();
  state.history.push(state.screen);
  state.screen = 'incident-detail';
  // W3.9 — first-open per persona: reset action steps so reveal re-fires per persona
  if (!personaState.opened && !personaState.actioned) {
    state.actionSteps = {
      step1: { status: 'idle' },
      step2: { status: 'locked', selectedEngineer: null },
      ctaEnabled: false,
    };
  }
  personaState.opened = true;
  render();
}

function backToMonitoring() {
  if (state.history.length === 0) return;
  state.screen = state.history.pop();
  render();
}

// ── Tablet root renderer ──
// W8 Section 0 Part 3 — wipe-guard via tabletCacheKey().
// Skip innerHTML wipe + repaint when no state in the cache key has changed.
// Preserves in-flight reveal-slide animations + imperative DOM mutations done
// outside render() (checklist progression, banner fades, capture footers).
function tabletCacheKey() {
  const ticket = getCanonicalTicket();
  const p = state.activePersona;
  const bp = ticket && ticket.byPersona && ticket.byPersona[p];
  const hp = ticket && ticket.handoffPending;
  return [
    p,
    state.screen,
    state.bannerVisible ? 1 : 0,
    state.bannerKey || '',
    state.incidentLanded ? 1 : 0,
    state.priyaUnlocked ? 1 : 0,
    ticket ? ticket.statePill : '',
    hp ? `${hp.ops?1:0}${hp.onsite?1:0}${hp.analyst?1:0}${hp.offsite?1:0}` : '',
    bp ? `${bp.seen?1:0}${bp.opened?1:0}${bp.actioned?1:0}` : '',
  ].join('|');
}

function renderTablet() {
  const root = document.getElementById('tablet-root');
  if (!root) return;
  const key = tabletCacheKey();
  if (root.dataset.cacheKey === key && root.innerHTML !== '') {
    // No state change relevant to tablet structure — skip wipe.
    return;
  }
  root.innerHTML = '';
  switch (state.screen) {
    case 'monitoring':
    case 'monitoring-notify':
    case 'monitoring-landed':
      renderMonitoringView(root);
      break;
    case 'incident-detail':
      // W5 — Screen D dispatched per persona, including Priya
      renderIncidentDetailView(root);
      break;
  }
  root.dataset.cacheKey = key;
}

// ── render() = pure paint ──
// W8 G — left pane swaps tablet ↔ laptop frame depending on active persona.
function render() {
  renderPersonasPanel();
  renderLeftPane();
  renderRightPane();
}

function renderLeftPane() {
  const tablet = document.getElementById('tablet');
  const laptop = document.getElementById('laptop-frame');
  if (state.activePersona === 'analyst') {
    if (tablet) tablet.style.display = 'none';
    if (laptop) laptop.style.display = '';
    renderLaptopContent();
  } else {
    if (laptop) laptop.style.display = 'none';
    if (tablet) tablet.style.display = '';
    // Tear down any open trader modal on persona switch away.
    const modal = document.getElementById('trader-modal-backdrop');
    if (modal) modal.remove();
    renderTablet();
  }
}

// ─────────────────────────────────────────────
// W8 G — Priya laptop view (MacBook chrome + trading dashboard + 60% modal)
// ─────────────────────────────────────────────

function renderLaptopContent() {
  const content = document.getElementById('laptop-content');
  if (!content) return;
  if (!content.dataset.built) {
    paintLaptopDashboard(content);
    content.dataset.built = '1';
    wireLaptopBellClick();
  }
  updateLaptopBellState();
  updateLaptopDemoEndBanner();
  syncLaptopModalState();
}

function paintLaptopDashboard(content) {
  const tasks = buildPersonaOwnTasks('analyst');
  const tasksHTML = tasks.map(t => `
    <div class="td-task-row">
      <span class="td-task-id">${t.id}</span>
      <span class="td-task-title">${t.body}</span>
      <span class="td-task-meta">${t.state}</span>
    </div>`).join('');

  content.innerHTML = `
    <div class="trader-dash">
      <div class="td-topbar">
        <div class="td-brand">
          <svg class="td-brand-mark" viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M 4 28 Q 12 12, 24 18 T 38 12" stroke="#00A651" stroke-width="3" fill="none" stroke-linecap="round"/>
            <path d="M 4 34 Q 14 22, 26 24 T 38 18" stroke="#00A651" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.65"/>
          </svg>
          <div class="td-brand-text-block">
            <span class="td-brand-text">Sembcorp</span>
            <span class="td-brand-text-sub">Energy Trading · Singapore</span>
          </div>
        </div>
        <div class="td-persona">
          <span class="td-persona-name">Priya Sundaram</span>
          <span class="td-persona-role">Senior Power Trader · Singapore</span>
        </div>
        <button class="td-notification-bell" type="button" data-count="0">
          <svg class="td-bell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span class="td-bell-count">1</span>
        </button>
      </div>

      <div class="td-kpi-strip">
        <div class="td-kpi-card td-kpi-headline">
          <div class="td-kpi-label">
            <svg class="td-kpi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 7v5l3 2"/>
            </svg>
            <span>Next settlement period · HH18 · 09:00–09:30 SGT</span>
          </div>
          <div class="td-kpi-rows">
            <div class="td-kpi-row">
              <span class="td-kpi-row-label">PSO commitment</span>
              <span class="td-kpi-row-value">50 MW @ SGD 120/MWh</span>
            </div>
            <div class="td-kpi-row">
              <span class="td-kpi-row-label">Settlement value</span>
              <span class="td-kpi-row-value">SGD 6,000</span>
            </div>
            <div class="td-kpi-row">
              <span class="td-kpi-row-label">At risk if no action</span>
              <span class="td-kpi-row-value td-kpi-amber">SGD 6,000 · 4 periods (HH18–HH21)</span>
            </div>
          </div>
          <div class="td-kpi-status">
            <span class="td-kpi-status-pill td-kpi-status-at-risk">AT RISK · awaiting decision</span>
          </div>
        </div>

        <div class="td-kpi-card td-kpi-secondary">
          <div class="td-kpi-label">
            <svg class="td-kpi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9"/>
              <circle cx="12" cy="12" r="5"/>
              <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
            </svg>
            <span>May 2026 target · revenue at risk hedged</span>
          </div>
          <div class="td-kpi-target-bar">
            <div class="td-kpi-target-fill" style="width: 74%"></div>
          </div>
          <div class="td-kpi-target-stats">
            <span class="td-kpi-target-mtd"><strong>SGD 3.1M</strong> MTD <span class="td-kpi-target-pct">(74%)</span></span>
            <span class="td-kpi-target-goal">Target SGD 4.2M</span>
          </div>
          <div class="td-kpi-target-delta">
            INC-2026-0537 unlock: <strong class="td-kpi-target-delta-amt">+SGD 240k</strong> · <span class="td-kpi-target-delta-pct">+5.7% toward target</span>
          </div>
        </div>
      </div>

      <div class="td-zone">
        <div class="td-zone-header">
          <span class="td-zone-num">1</span>
          <span class="td-zone-title">Portfolio Overview · Singapore Market</span>
        </div>
        <div class="td-portfolio">
          <div class="td-pf-card"><div class="td-pf-label">Jurong Island CCGT</div><div class="td-pf-value">1,600 MW</div><span class="td-pf-status online">ONLINE</span></div>
          <div class="td-pf-card"><div class="td-pf-label">Tuas Cogen Plant</div><div class="td-pf-value">860 MW</div><span class="td-pf-status online">ONLINE</span></div>
          <div class="td-pf-card"><div class="td-pf-label">Senoko Power Station</div><div class="td-pf-value">560 MW</div><span class="td-pf-status online">ONLINE</span></div>
          <div class="td-pf-card"><div class="td-pf-label">Solar Portfolio (SG)</div><div class="td-pf-value">200 MWp</div><span class="td-pf-status forecast">FORECAST</span></div>
          <div class="td-pf-card"><div class="td-pf-label">Battery Storage (SG)</div><div class="td-pf-value">100 MW / 200 MWh</div><span class="td-pf-status standby">STANDBY</span></div>
        </div>
      </div>

      <div class="td-zone">
        <div class="td-zone-header"><span class="td-zone-num">2</span><span class="td-zone-title">Market Snapshot</span></div>
        <div class="td-market">
          <div class="td-market-card td-market-curve-card">
            <div class="td-mk-label">USEP Forward Curve · 24h</div>
            <div class="td-mk-headline">
              <span class="td-mk-headline-value">$112.45</span>
              <span class="td-mk-headline-unit">SGD/MWh</span>
              <span class="td-mk-headline-delta td-mk-delta-up">+18.30 (19.4%)</span>
            </div>
            <svg class="td-mk-curve" viewBox="0 0 240 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="td-curve-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#00A651" stop-opacity="0.8"/>
                  <stop offset="100%" stop-color="#00A651" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <path d="M 0 48 L 10 46 L 20 47 L 30 44 L 40 42 L 50 40 L 60 38 L 70 36 L 80 34 L 90 33 L 100 35 L 110 32 L 120 28 L 130 26 L 140 24 L 150 22 L 160 20 L 170 18 L 180 19 L 190 16 L 200 14 L 210 12 L 220 10 L 230 8 L 240 6 L 240 60 L 0 60 Z"
                    fill="url(#td-curve-gradient)" opacity="0.20"/>
              <path d="M 0 48 L 10 46 L 20 47 L 30 44 L 40 42 L 50 40 L 60 38 L 70 36 L 80 34 L 90 33 L 100 35 L 110 32 L 120 28 L 130 26 L 140 24 L 150 22 L 160 20 L 170 18 L 180 19 L 190 16 L 200 14 L 210 12 L 220 10 L 230 8 L 240 6"
                    stroke="#00A651" stroke-width="2" fill="none"/>
              <line x1="120" y1="0" x2="120" y2="60" stroke="#64748B" stroke-width="1" stroke-dasharray="2 3" opacity="0.6"/>
              <text x="124" y="10" font-size="8" fill="#64748B">NOW</text>
            </svg>
            <div class="td-mk-curve-axis">
              <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
            </div>
          </div>
          <div class="td-market-card td-market-gauge-card">
            <div class="td-mk-label">Reserve Margin · Singapore</div>
            <div class="td-mk-gauge-wrap">
              <svg class="td-mk-gauge" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="60" cy="60" r="46" stroke="#E5E7EB" stroke-width="10" fill="none"/>
                <circle cx="60" cy="60" r="46" stroke="#00A651" stroke-width="10" fill="none"
                        stroke-dasharray="81 289" stroke-linecap="round"
                        transform="rotate(-90 60 60)"/>
                <text x="60" y="62" text-anchor="middle" font-size="22" font-weight="800" fill="#0F1B3D">28%</text>
                <text x="60" y="78" text-anchor="middle" font-size="9" font-weight="600" fill="#64748B" letter-spacing="0.5">COMFORTABLE</text>
              </svg>
            </div>
            <div class="td-mk-trend">Forecast (Next 6 Hrs) · 22–30%</div>
          </div>
          <div class="td-market-card">
            <div class="td-mk-label">Market Regime</div>
            <div class="td-mk-value normal">▶ NORMAL</div>
            <div class="td-mk-trend">Stable conditions · Adequate supply</div>
          </div>
        </div>
      </div>

      <div class="td-zone">
        <div class="td-zone-header"><span class="td-zone-num">3</span><span class="td-zone-title">Active Tasks</span></div>
        <div class="td-tasks">${tasksHTML}</div>
      </div>
    </div>`;
}

function wireLaptopBellClick() {
  const bell = document.querySelector('.td-notification-bell');
  if (!bell || bell.dataset.wired === '1') return;
  bell.dataset.wired = '1';
  bell.addEventListener('click', onLaptopBellClick);
}

function onLaptopBellClick() {
  const bell = document.querySelector('.td-notification-bell');
  if (!bell || bell.dataset.count === '0') return;
  if (state.priya.decisionLocked) return;
  if (state.screen !== 'incident-detail') {
    state.history.push(state.screen);
    state.screen = 'incident-detail';
  }
  render();
}

function updateLaptopBellState() {
  const bell = document.querySelector('.td-notification-bell');
  if (!bell) return;
  const ticket = getCanonicalTicket();
  const pill = ticket && ticket.statePill;
  const shouldPulse = (pill === 'ROUTED_TO_TRADING_DESK') && !state.priya.decisionLocked;
  const newCount = shouldPulse ? '1' : '0';
  if (bell.dataset.count !== newCount) bell.dataset.count = newCount;
  if (shouldPulse && !bell.classList.contains('td-bell-pulse')) {
    bell.classList.add('td-bell-pulse');
  } else if (!shouldPulse && bell.classList.contains('td-bell-pulse')) {
    bell.classList.remove('td-bell-pulse');
  }
}

const PRIYA_LAPTOP_OPTION_LABEL = {
  hedge:       'Forward Q3 capacity hedge',
  'cross-site':'Cross-site balance',
  spot:        'Spot market purchase',
  curtailment: 'PSO curtailment notice',
};

function updateLaptopDemoEndBanner() {
  const dash = document.querySelector('.trader-dash');
  if (!dash) return;
  const existing = dash.querySelector('.td-demo-end-banner');
  if (state.priya.decisionLocked) {
    if (existing) return;
    const opt = state.priya.selectedOption;
    const optLabel = PRIYA_LAPTOP_OPTION_LABEL[opt] || 'Decision';
    const banner = el('div', 'td-demo-end-banner');
    banner.innerHTML = `
      <span>✓</span>
      <span>Cycle complete · <strong>${optLabel}</strong> locked · revenue exposure neutralized · INC-2026-0537 closed · ${state.priya.decisionTimestamp || '03:01 SGT'}</span>`;
    const topbar = dash.querySelector('.td-topbar');
    if (topbar && topbar.nextSibling) {
      dash.insertBefore(banner, topbar.nextSibling);
    } else {
      dash.appendChild(banner);
    }
  } else if (existing) {
    existing.remove();
  }
}

function syncLaptopModalState() {
  const shouldOpen = state.activePersona === 'analyst'
                  && state.screen === 'incident-detail'
                  && !state.priya.decisionLocked;
  const existing = document.getElementById('trader-modal-backdrop');
  if (shouldOpen && !existing) {
    openTraderModal();
  } else if (!shouldOpen && existing) {
    existing.remove();
  }
}

function openTraderModal() {
  if (document.getElementById('trader-modal-backdrop')) return;
  const backdrop = el('div', 'trader-modal-backdrop');
  backdrop.id = 'trader-modal-backdrop';
  backdrop.innerHTML = `
    <div class="trader-modal" role="dialog" aria-modal="true">
      <div class="trader-modal-header">
        <div class="tm-heading">INC-2026-0537 · Trading Desk Action Required</div>
        <button class="tm-close" type="button" aria-label="Close">×</button>
      </div>
      <div class="trader-modal-body" id="trader-modal-body"></div>
    </div>`;
  backdrop.querySelector('.tm-close').addEventListener('click', closeTraderModal);
  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) closeTraderModal();
  });
  document.body.appendChild(backdrop);

  const body = backdrop.querySelector('#trader-modal-body');
  paintAnalystContentIntoModal(body);
}

function paintAnalystContentIntoModal(container) {
  const wrap = el('div', 'analyst-screen-d');
  wrap.id = 'incident-detail-view';  // re-use ID so existing helpers find this container
  wrap.innerHTML = `
    <div class="analyst-card">
      <div class="reveal-pending ac-loading" data-stage="analyst-summary">
        <span class="reveal-dots"><span></span><span></span><span></span></span>
        <span class="reveal-msg"><span class="reveal-agent">Market Intelligence Agent</span> · Loading market position + hedge eligibility for INC-2026-0537</span>
      </div>
    </div>`;
  container.appendChild(wrap);

  if (state.priya.escalationSummaryRevealed) {
    revealAnalystScreenInstant();
    wireDecisionOptions();
    restoreSelectedOptionUI();
    wireLockDecisionCTA();
    if (state.priya.selectedOption) {
      const cta = document.querySelector('.ac-lock-cta');
      if (cta) cta.disabled = false;
    }
  } else if (!state.priya.escalationRevealStarted) {
    startAnalystScreenDReveal();
  } else {
    // Reveal already in flight from earlier modal open — just rewire when content arrives.
    // The pushReveal timer will paint into the new modal via revealAnalystScreenInstant on completion.
  }
}

function closeTraderModal() {
  const existing = document.getElementById('trader-modal-backdrop');
  if (existing) existing.remove();
  if (state.activePersona === 'analyst' && state.screen === 'incident-detail' && !state.priya.decisionLocked) {
    state.screen = state.history.length ? state.history.pop() : 'monitoring';
    render();
  }
}

// ── W7 — Right pane variant: P2 onsite gets full-pane inline 3D KG ──
function renderRightPane() {
  const rightPane = document.getElementById('right-pane');
  if (!rightPane) return;
  const personaKey = state.activePersona;
  if (personaKey === 'onsite') {
    paintRightPaneInlineKG();
  } else {
    paintRightPaneStandard();
  }
}

function paintRightPaneInlineKG() {
  const rightPane = document.getElementById('right-pane');
  if (!rightPane) return;
  // Hide standard children
  Array.from(rightPane.children).forEach(c => {
    if (c.id === 'right-pane-kg-inline') return;
    c.dataset.rpHidden = '1';
    c.style.display = 'none';
  });
  // Auto-close floating KG window if it's open (mount about to move)
  if (state.graphWinOpen) toggleGraphWindow();
  // Ensure inline container exists
  let inline = document.getElementById('right-pane-kg-inline');
  if (!inline) {
    inline = document.createElement('div');
    inline.id = 'right-pane-kg-inline';
    inline.className = 'right-pane-kg-inline';
    rightPane.appendChild(inline);
  }
  inline.style.display = '';
  // Reparent #kg-3d-mount into the inline container
  const mount = document.getElementById('kg-3d-mount');
  if (mount && mount.parentElement !== inline) {
    inline.appendChild(mount);
  }
  // W8 Section 0 Part 2 — resize cache. Only call three.js .width/.height when dimensions change.
  // Repeated resize on same w/h caused micro canvas-blank flashes on every render().
  if (KG_STATE.graph && inline.clientWidth) {
    const w = inline.clientWidth;
    const h = inline.clientHeight || 600;
    if (KG_STATE._lastInlineW !== w || KG_STATE._lastInlineH !== h) {
      KG_STATE.graph.width(w).height(h);
      KG_STATE._lastInlineW = w;
      KG_STATE._lastInlineH = h;
    }
  }
}

function paintRightPaneStandard() {
  const rightPane = document.getElementById('right-pane');
  if (!rightPane) return;
  // Restore standard children
  Array.from(rightPane.children).forEach(c => {
    if (c.id === 'right-pane-kg-inline') {
      c.style.display = 'none';
      return;
    }
    if (c.dataset.rpHidden === '1') {
      c.style.display = '';
      delete c.dataset.rpHidden;
    }
  });
  // Move #kg-3d-mount back into the floating window body
  // W8 Section 0 Part 2 — only resize on actual reparent (already guarded by mount.parentElement check).
  const mount = document.getElementById('kg-3d-mount');
  const floatingBody = document.querySelector('#kg-floating-window .kg-fw-body');
  if (mount && floatingBody && mount.parentElement !== floatingBody) {
    floatingBody.appendChild(mount);
    if (KG_STATE.graph) {
      const w = floatingBody.clientWidth || 460;
      const h = floatingBody.clientHeight || 320;
      KG_STATE.graph.width(w).height(h);
      KG_STATE._lastInlineW = null; // invalidate inline cache — next inline mount must re-apply
      KG_STATE._lastInlineH = null;
    }
  }
}

// ─────────────────────────────────────────────
// KG 3D rendering module — Wave 2.5
// three.js + 3d-force-graph stratified force-graph.
// Y-axis pinned per layer via fy. Per-node state API for W3+.
// Try/catch fallback to CSS scaffold on failure.
// ─────────────────────────────────────────────

const KG_NODES = [
  // L1 People & Process (green) — y = 90
  { id: 'r-kumar',         label: 'Faye Sit · Ops',           layer: 'L1', x:  20, y: 90, z:  20 },
  { id: 'lim-wei-jie',     label: 'Lim Wei Jie · Onsite',     layer: 'L1', x: -20, y: 90, z: -20 },
  { id: 'dr-wong',         label: 'Dr. A. Wong · Offsite',    layer: 'L1', x: -60, y: 90, z:  20 },
  { id: 'p-sundaram',      label: 'P. Sundaram · Asset Perf', layer: 'L1', x:  60, y: 90, z: -20 },
  { id: 'bu-power-gen',    label: 'BU · Power Gen',           layer: 'L1', x:   0, y: 90, z:  60 },
  { id: 'raci-derate',     label: 'RACI · derate ≥40MW',      layer: 'L1', x: -40, y: 90, z:  60 },
  { id: 'esc-pso',         label: 'Escalation · PSO window',  layer: 'L1', x:  40, y: 90, z:  60 },
  { id: 'sop-bfp-vibration-investigation', label: 'SOP · BFP vibration investigation', layer: 'L1', x: 0, y: 90, z: -60 },

  // L2 Physical Plant (blue) — y = 30
  { id: 'gt-3',                label: 'GT-3',                  layer: 'L2', x: -60, y: 30, z:   0 },
  { id: 'hrsg-3',              label: 'HRSG-3',                layer: 'L2', x:   0, y: 30, z:   0 },
  { id: 'bfp-3a',              label: 'BFP-3A · Sulzer',       layer: 'L2', x:  30, y: 30, z:  20 },
  { id: 'bfp-3b',              label: 'BFP-3B',                layer: 'L2', x:  60, y: 30, z:   0 },
  { id: 'st-3',                label: 'ST-3 (steam turbine)',  layer: 'L2', x: -30, y: 30, z: -20 },
  { id: 'condenser-3',         label: 'Condenser-3',           layer: 'L2', x: -45, y: 30, z: -40 },
  { id: 'generator-3',         label: 'Generator-3',           layer: 'L2', x: -15, y: 30, z: -40 },
  { id: 'transformer-3',       label: 'Transformer-3',         layer: 'L2', x:  15, y: 30, z: -40 },
  { id: 'switchyard-a',        label: 'Switchyard-A',          layer: 'L2', x:  45, y: 30, z: -40 },
  { id: 'vt-bfp-3a-nde-x',     label: 'Vib transducer · NDE X', layer: 'L2', x: 50, y: 30, z:  40 },
  { id: 'vt-bfp-3a-nde-y',     label: 'Vib transducer · NDE Y', layer: 'L2', x: 65, y: 30, z:  40 },
  { id: 'vt-bfp-3a-de-x',      label: 'Vib transducer · DE X',  layer: 'L2', x: 20, y: 30, z:  60 },
  { id: 'vt-bfp-3a-de-y',      label: 'Vib transducer · DE Y',  layer: 'L2', x: 35, y: 30, z:  60 },
  { id: 'bearing-bfp-3a-nde',  label: 'Bearing · NDE (SKF)',    layer: 'L2', x: 75, y: 30, z:  20 },
  { id: 'coupling-bfp-3a',     label: 'BFP-3A coupling',        layer: 'L2', x: 10, y: 30, z:  40 },
  { id: 'shaft-bfp-3a',        label: 'BFP-3A drive shaft',     layer: 'L2', x: 45, y: 30, z:  10 },
  { id: 'casing-bfp-3a',       label: 'BFP-3A pump casing',     layer: 'L2', x: 55, y: 30, z:  30 },
  { id: 'sulzer-bfp-manual',   label: 'OEM · Sulzer BFP manual', layer: 'L2', x: 80, y: 30, z:  -10 },

  // L3 Historical State (amber) — y = -30
  { id: 'vib-rms-90d',         label: 'BFP-3A · 90d vib RMS',           layer: 'L3', x: -60, y: -30, z:   0 },
  { id: 'bearing-temp-30d',    label: 'NDE bearing · 30d temp',         layer: 'L3', x: -45, y: -30, z:  20 },
  { id: 'rca-bfp-jrg-2025',    label: 'RCA · Jurong-2 BFP · 2025-08',   layer: 'L3', x: -15, y: -30, z:  10 },
  { id: 'rca-bfp-skr-2024',    label: 'RCA · Sakra-1 BFP · 2024-11',    layer: 'L3', x:  15, y: -30, z:  10 },
  { id: 'rca-bfp-banyan-2024', label: 'RCA · Banyan BFP · 2024-05',     layer: 'L3', x:  45, y: -30, z:  10 },
  { id: 'casing-rca-jrg-2023', label: 'RCA · Jurong-2 BFP casing · 2023-08', layer: 'L3', x:  30, y: -30, z:  -10 },
  { id: 'wo-log-47',           label: 'WO log · 47 prior',              layer: 'L3', x:  60, y: -30, z:   0 },
  { id: 'pi-18mo',             label: 'PI · 18mo telemetry',            layer: 'L3', x: -15, y: -30, z: -30 },
  { id: 'audit-iso50001',      label: 'Audit · ISO 50001',              layer: 'L3', x:  15, y: -30, z: -30 },

  // L4 Predictive Intelligence (pink) — y = -90
  { id: 'bearing-spalling-pattern',  label: 'Pattern · NDE bearing race spalling', layer: 'L4', x: -45, y: -90, z:   0 },
  { id: 'pump-casing-crack-pattern', label: 'Pattern · pump casing crack',         layer: 'L4', x: -15, y: -90, z:  20 },
  { id: 'iso-10816-7-spec',          label: 'Spec · ISO 10816-7 alarm zones',      layer: 'L4', x:  15, y: -90, z:   0 },
  { id: 'bfp-derate-cascade-model',  label: 'Model · BFP→HRSG→ST derate cascade',  layer: 'L4', x:  45, y: -90, z:  20 },
  { id: 'pred-mw-derate',            label: 'Predictor · MW derate',               layer: 'L4', x:  60, y: -90, z: -10 },
  { id: 'rec-oem-playbook',          label: 'Recommender · OEM playbook',          layer: 'L4', x: -30, y: -90, z: -30 },
];

const KG_LAYER_COLORS = {
  L1: '#00A651',  // green
  L2: '#3B82F6',  // blue
  L3: '#F59E0B',  // amber
  L4: '#EC4899',  // pink
};

const KG_EDGES = [
  // L2 asset cascade (BFP-3A → HRSG-3 → ST-3 → Generator-3 → Transformer-3 → Switchyard-A)
  { source: 'bfp-3a', target: 'hrsg-3' },
  { source: 'gt-3', target: 'hrsg-3' },
  { source: 'hrsg-3', target: 'st-3' },
  { source: 'st-3', target: 'generator-3' },
  { source: 'generator-3', target: 'transformer-3' },
  { source: 'transformer-3', target: 'switchyard-a' },
  { source: 'hrsg-3', target: 'condenser-3' },
  { source: 'hrsg-3', target: 'bfp-3b' },

  // L2 sub-assembly + sensors on BFP-3A
  { source: 'vt-bfp-3a-nde-x', target: 'bfp-3a' },
  { source: 'vt-bfp-3a-nde-y', target: 'bfp-3a' },
  { source: 'vt-bfp-3a-de-x',  target: 'bfp-3a' },
  { source: 'vt-bfp-3a-de-y',  target: 'bfp-3a' },
  { source: 'bearing-bfp-3a-nde', target: 'bfp-3a' },
  { source: 'coupling-bfp-3a',    target: 'bfp-3a' },
  { source: 'shaft-bfp-3a',       target: 'bfp-3a' },
  { source: 'bfp-3a',             target: 'sulzer-bfp-manual' },

  // L2 → L3 history
  { source: 'bfp-3a', target: 'wo-log-47' },
  { source: 'bfp-3a', target: 'pi-18mo' },
  { source: 'vib-rms-90d', target: 'bfp-3a' },
  { source: 'bearing-temp-30d', target: 'bearing-bfp-3a-nde' },
  { source: 'audit-iso50001', target: 'bfp-3a' },

  // L3 RCA → L4 pattern
  { source: 'rca-bfp-jrg-2025',    target: 'bearing-spalling-pattern' },
  { source: 'rca-bfp-skr-2024',    target: 'bearing-spalling-pattern' },
  { source: 'rca-bfp-banyan-2024', target: 'bearing-spalling-pattern' },
  { source: 'vib-rms-90d',         target: 'bearing-spalling-pattern' },

  // L4 patterns → models / SOP
  { source: 'bearing-spalling-pattern', target: 'bfp-derate-cascade-model' },
  { source: 'bearing-spalling-pattern', target: 'sop-bfp-vibration-investigation' },
  { source: 'bfp-derate-cascade-model', target: 'pred-mw-derate' },
  { source: 'bearing-spalling-pattern', target: 'rec-oem-playbook' },
  { source: 'pump-casing-crack-pattern',       target: 'shaft-bfp-3a' },
  // W4.1 — pump casing crack narrative
  { source: 'casing-bfp-3a',            target: 'bfp-3a' },
  { source: 'casing-rca-jrg-2023',      target: 'pump-casing-crack-pattern' },
  { source: 'pump-casing-crack-pattern', target: 'sop-bfp-vibration-investigation' },

  // L4 standard → L2 sensors (ISO 10816-7 governs sensor alarm thresholds)
  { source: 'iso-10816-7-spec', target: 'vt-bfp-3a-nde-x' },
  { source: 'iso-10816-7-spec', target: 'vt-bfp-3a-nde-y' },
  { source: 'iso-10816-7-spec', target: 'vt-bfp-3a-de-x' },
  { source: 'iso-10816-7-spec', target: 'vt-bfp-3a-de-y' },

  // L1 persona → L2 asset + L4
  { source: 'r-kumar',         target: 'bfp-3a' },
  { source: 'lim-wei-jie',     target: 'bearing-bfp-3a-nde' },
  { source: 'dr-wong',         target: 'pump-casing-crack-pattern' },
  { source: 'p-sundaram',      target: 'pred-mw-derate' },
  { source: 'bu-power-gen',    target: 'bfp-3a' },
  { source: 'raci-derate',     target: 'bfp-derate-cascade-model' },
  { source: 'esc-pso',         target: 'r-kumar' },
  { source: 'sop-bfp-vibration-investigation', target: 'bfp-3a' },
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
  // W3.9 — moved from canonical to theater (GT-side OEM ref + wash ROI)
  { id: 'oem-ge-9ha-manual',label: 'OEM · GE 9HA manual',              layer: 'L2', canonical: false },
  { id: 'roi-wash',         label: 'ROI · wash-cycle',                 layer: 'L4', canonical: false },
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
  { source: 't-sb-ge-014',      target: 'pump-casing-crack-pattern', canonical: false },
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
  { source: 't-mdl-heat-rate',  target: 'bfp-derate-cascade-model', canonical: false },
  { source: 't-mdl-emissions',  target: 't-emissions-cert', canonical: false },
  { source: 't-mdl-startup',    target: 't-rec-shutdown',   canonical: false },
  { source: 't-rec-spares',     target: 't-procurement',    canonical: false },
  { source: 't-pred-trip-prob', target: 'bearing-spalling-pattern', canonical: false },
  { source: 't-pred-trip-prob', target: 'pump-casing-crack-pattern',       canonical: false },
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
  newlyAddedNodes: new Set(),   // W6 — green halo on freshly-grown nodes
};

// ── W7 — Bigger KG: Tacit Knowledge cluster + KG Auditor/Updater cluster ──
// 3-tier visual separation along X: main KG (-100..+100) → Auditor cluster (180..260) → Tacit Knowledge cluster (340..420)
// Nodes present from cold load; triggerKGGrowth flashes green halo on tacit cluster 10s post-click.
const KG_TACIT_NODES = [
  { id: 'casing-tacit-knowledge',         label: 'Tacit knowledge · BFP casing fatigue pattern', layer: 'L4', x: 360, y: -90, z:  30, canonical: false, isNew: true, cluster: 'tacit' },
  { id: 'wong-field-experience-2023',     label: 'Field experience · Wong · Jurong BFP 2023',    layer: 'L3', x: 380, y: -30, z:  10, canonical: false, isNew: true, cluster: 'tacit' },
  { id: 'bfp-casing-inspection-protocol', label: 'Updated SOP · BFP casing weld inspection',     layer: 'L1', x: 400, y:  90, z: -20, canonical: false, isNew: true, cluster: 'tacit' },
];
const KG_AUDITOR_NODES = [
  { id: 'kg-auditor-agent',      label: 'KG Auditor Agent · validates new nodes',    layer: 'L1', x: 200, y:  90, z:   0, canonical: false, cluster: 'auditor' },
  { id: 'kg-updater-agent',      label: 'KG Updater Agent · re-wires graph',         layer: 'L4', x: 230, y: -90, z:   0, canonical: false, cluster: 'auditor' },
  { id: 'workflow-rewire-agent', label: 'Workflow Re-wire Agent · SOP updates',      layer: 'L1', x: 240, y:  90, z: -40, canonical: false, cluster: 'auditor' },
];
KG_NODES.push(...KG_TACIT_NODES, ...KG_AUDITOR_NODES);

// W7 cluster-flow edges: tacit → auditor (3) · auditor → main KG (3) · auditor internal cohesion (1)
const KG_CLUSTER_FLOW_EDGES = [
  { source: 'casing-tacit-knowledge',         target: 'kg-auditor-agent',      canonical: false, cluster: 'tk-to-auditor' },
  { source: 'wong-field-experience-2023',     target: 'kg-auditor-agent',      canonical: false, cluster: 'tk-to-auditor' },
  { source: 'bfp-casing-inspection-protocol', target: 'workflow-rewire-agent', canonical: false, cluster: 'tk-to-auditor' },
  { source: 'kg-auditor-agent',               target: 'pump-casing-crack-pattern',          canonical: false, cluster: 'auditor-to-main' },
  { source: 'kg-updater-agent',               target: 'casing-rca-jrg-2023',                canonical: false, cluster: 'auditor-to-main' },
  { source: 'workflow-rewire-agent',          target: 'sop-bfp-vibration-investigation',    canonical: false, cluster: 'auditor-to-main' },
  { source: 'kg-auditor-agent',               target: 'kg-updater-agent',                   canonical: false, cluster: 'auditor-internal' },
];
KG_EDGES.push(...KG_CLUSTER_FLOW_EDGES);

// Tacit cluster node IDs flashed (green halo) 10s after Lim diagnosis-confirmed click — W6 behavior preserved.
const KG_GROWTH_NODE_IDS = KG_TACIT_NODES.map(n => n.id);

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
  const fontSize = 18;
  const padX = 12;
  const padY = 6;

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
  sprite.scale.set(canvasW / 6, canvasH / 6, 1);
  sprite.position.set(15, 0, 0);
  sprite.renderOrder = 10;
  return sprite;
}

function buildLayerTitle(layerId, name, color, yPos) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const padX = 18;
  const padY = 10;
  const layerFontSize = 32;
  const nameFontSize = 18;
  const arrowFontSize = 28;

  ctx.font = `800 ${layerFontSize}px ui-monospace, "SF Mono", monospace`;
  const layerW = ctx.measureText(layerId).width;
  ctx.font = `600 ${nameFontSize}px ui-monospace, "SF Mono", monospace`;
  const nameW = ctx.measureText(name).width;
  ctx.font = `800 ${arrowFontSize}px ui-monospace, "SF Mono", monospace`;
  const arrowW = ctx.measureText('▸').width;
  const textW = Math.max(layerW, nameW);
  const canvasW = Math.ceil(textW + padX * 2 + arrowW + 12);
  const canvasH = layerFontSize + nameFontSize + padY * 3;

  canvas.width = canvasW;
  canvas.height = canvasH;

  ctx.fillStyle = 'rgba(10,15,28,0.92)';
  roundRect(ctx, 0, 0, canvasW, canvasH, 10);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 8, canvasH);

  ctx.font = `800 ${layerFontSize}px ui-monospace, "SF Mono", monospace`;
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(layerId, padX, padY);

  ctx.font = `600 ${nameFontSize}px ui-monospace, "SF Mono", monospace`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(name, padX, padY + layerFontSize + 4);

  ctx.font = `800 ${arrowFontSize}px ui-monospace, "SF Mono", monospace`;
  ctx.fillStyle = color;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText('▸', canvasW - 8, canvasH / 2);

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
  sprite.position.set(-130, yPos, 0);
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
  let angle = KG_STATE.lastAngle || 0;
  // W7 — orbit center shifted to x=200 to fit 3-tier KG (main + auditor + tacit clusters)
  const orbitCenter = { x: 200, y: 0, z: 0 };
  KG_STATE.autoRotateTimer = setInterval(() => {
    angle += 0.003;  // gentle spin
    KG_STATE.lastAngle = angle;
    const cam = KG_STATE.graph.camera();
    const dx = cam.position.x - orbitCenter.x;
    const dz = cam.position.z - orbitCenter.z;
    const radiusXZ = Math.sqrt(dx * dx + dz * dz) || 480;
    const currentY = cam.position.y;
    KG_STATE.graph.cameraPosition({
      x: orbitCenter.x + radiusXZ * Math.sin(angle),
      y: currentY,
      z: orbitCenter.z + radiusXZ * Math.cos(angle),
    }, orbitCenter, 0);
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
        const radius = isInChain(node.id) ? 14 : 9;
        const group = new THREE.Group();
        const sphereGeo = new THREE.SphereGeometry(radius, 32, 20);
        const sphereMat = new THREE.MeshBasicMaterial({
          color: KG_LAYER_COLORS[node.layer],
          transparent: true,
          opacity: nodeOpacityFor(node),
        });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        group.add(sphere);
        // White halo — thicker back-face shell (W3.6b: deeper border)
        // W7 — cluster ring colors:
        //   newly-grown (green halo flash, 4s) > tacit cluster (amber) > auditor cluster (blue) > default (white)
        const isNewlyAdded = KG_STATE.newlyAddedNodes && KG_STATE.newlyAddedNodes.has(node.id);
        let ringColor;
        if (isNewlyAdded)               ringColor = 0x00A651;   // Sembcorp green
        else if (node.cluster === 'auditor') ringColor = 0x3B82F6;   // blue
        else if (node.cluster === 'tacit')   ringColor = 0xF59E0B;   // amber
        else                            ringColor = 0xFFFFFF;
        const ringRadius = isNewlyAdded ? radius * 1.55 : radius * 1.30;
        const ringGeo = new THREE.SphereGeometry(ringRadius, 32, 20);
        const ringMat = new THREE.MeshBasicMaterial({
          color: ringColor,
          transparent: true,
          opacity: nodeOpacityFor(node) * 1.0,
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

    // W7 — widen camera + offset lookAt to fit main KG + auditor + tacit clusters (3-tier X spread).
    graph.cameraPosition({ x: 100, y: 0, z: 480 }, { x: 200, y: 0, z: 0 }, 0);

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

    // Pause rotation on user interaction; resume after a delay so the user's last position settles before spin
    mount.addEventListener('mousedown', stopAutoRotate);
    mount.addEventListener('mouseup', () => {
      if (anyChainActive()) return;
      setTimeout(() => { if (!anyChainActive()) startAutoRotate(); }, 1000);
    });
    mount.addEventListener('wheel', () => {
      stopAutoRotate();
      clearTimeout(KG_STATE.wheelResumeTimer);
      KG_STATE.wheelResumeTimer = setTimeout(() => {
        if (!anyChainActive()) startAutoRotate();
      }, 2000);
    }, { passive: true });
    mount.addEventListener('touchstart', stopAutoRotate, { passive: true });
    mount.addEventListener('touchend', () => {
      if (anyChainActive()) return;
      setTimeout(() => { if (!anyChainActive()) startAutoRotate(); }, 1000);
    });

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
  inspection:            'Sensor Anomaly Inspector',
  triage:                'Turbine Diagnostic Agent',
  'diag-hrsg':           'HRSG · Boiler Diagnostic Agent',
  'diag-electrical':     'Generator · Electrical Diagnostic Agent',
  playbook:              'BFP Maintenance Playbook Agent',
  'sop-action':          'SOP Action Agent',
  'audio-transcription': 'Audio-transcription Agent',
  'wo-prefill':          'Work Order Pre-fill Agent',
  workflow:              'A2A Coordination Agent',
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
  taskTreeLabel: 'BFP-3A Vibration Anomaly · KG Traverse',
  steps: [
    {
      log: { ts: '02:47:12', source: 'inspection', text: 'BFP-3A vibration anomaly detected · NDE RMS 8.4 mm/s · alarm 7.1 mm/s', dataSource: 'Bently Nevada 3500', nodeChain: ['bfp-3a', 'vt-bfp-3a-nde-x', 'vt-bfp-3a-nde-y'] },
      treeLabel: 'Fetch vibration anomaly',
      delayMs: 200,
    },
    {
      log: { ts: '02:47:13', source: 'inspection', text: 'L2 traverse · 4 vibration transducers · 2 bearing housings · coupling + shaft', dataSource: 'Honeywell Experion DCS', nodeChain: ['vt-bfp-3a-nde-x','vt-bfp-3a-nde-y','vt-bfp-3a-de-x','vt-bfp-3a-de-y','bearing-bfp-3a-nde','coupling-bfp-3a','shaft-bfp-3a'] },
      treeLabel: 'L2 · trace BFP sub-assembly',
      delayMs: 800,
    },
    {
      log: { ts: '02:47:14', source: 'inspection', text: 'L3 lookup · 90-day RMS trend · rising past 14 days · ISO 10816-7 Zone C entry', dataSource: 'OSIsoft PI System', nodeChain: ['vib-rms-90d','iso-10816-7-spec'] },
      treeLabel: 'L3 · 90d RMS trend',
      delayMs: 800,
    },
    {
      log: { ts: '02:47:15', source: 'inspection', text: 'asset chain assembled · 6 nodes · BFP-3A → HRSG-3 → ST-3 cascade', dataSource: 'Hyperspace KG', nodeChain: ['bfp-3a','hrsg-3','st-3','generator-3','transformer-3','switchyard-a'] },
      treeLabel: 'Assemble asset chain',
      delayMs: 800,
    },
  ],
};

const ORCHESTRATOR_DISPATCH_LINES = [
  { ts: '02:47:16', source: 'orchestrator', text: 'received inspection findings · handing to Turbine Diagnostic Agent', nodeChain: [] },
];

const TRIAGE_AGENT_SCRIPT = {
  agentId: 'triage',
  durationMs: 3500,
  taskTreeLabel: 'Bearing Hypothesis · Pattern-Match',
  steps: [
    {
      log: { ts: '02:47:19', source: 'triage', text: 'pattern-match · 3 prior BFP bearing failures · Jurong-CCGT-2 / Sakra-CCGT-1 / Banyan-CHP', dataSource: 'Hyperspace KG', nodeChain: ['rca-bfp-jrg-2025','rca-bfp-skr-2024','rca-bfp-banyan-2024','bearing-spalling-pattern'] },
      treeLabel: 'Pattern-match prior RCAs',
      delayMs: 200,
    },
    {
      log: { ts: '02:47:20', source: 'triage', text: 'diagnosis hypothesis · NDE bearing race spalling (early-stage) · 78% confidence', dataSource: 'Hyperspace OS', nodeChain: ['bearing-spalling-pattern','bearing-bfp-3a-nde'] },
      treeLabel: 'Form hypothesis',
      delayMs: 900,
    },
    {
      log: { ts: '02:47:21', source: 'triage', text: 'alternatives considered · shaft misalignment 52% · coupling wear 31% · impeller imbalance 19%', dataSource: 'Hyperspace OS', nodeChain: ['shaft-bfp-3a','coupling-bfp-3a'] },
      treeLabel: 'Consider alternatives',
      delayMs: 900,
    },
    {
      log: { ts: '02:47:22', source: 'triage', text: 'synthesis · 78% confidence · passing to Power Gen Critic', dataSource: 'Hyperspace OS', nodeChain: ['bearing-spalling-pattern'] },
      treeLabel: 'Pass to critic',
      delayMs: 800,
    },
  ],
};

const POWER_GEN_CRITIC_SCRIPT = {
  agentId: 'critic-power-gen',
  durationMs: 2400,
  taskTreeLabel: 'Validate Bearing Hypothesis',
  steps: [
    {
      log: { ts: '02:47:22', source: 'critic-power-gen', text: 'KG path validated · bearing-spalling-pattern matches Sulzer BFP degradation profile ✓', dataSource: 'Hyperspace KG', nodeChain: ['bearing-spalling-pattern','sulzer-bfp-manual'] },
      treeLabel: 'Walk KG path backwards',
      delayMs: 200,
    },
    {
      log: { ts: '02:47:23', source: 'critic-power-gen', text: 'cross-check ISO 10816-7 alarm zone C threshold ✓ · onsite verification recommended', dataSource: 'Hyperspace KG', nodeChain: ['iso-10816-7-spec','sop-bfp-vibration-investigation'] },
      treeLabel: 'Cross-check standard',
      delayMs: 1000,
    },
    {
      log: { ts: '02:47:24', source: 'critic-power-gen', text: 'diagnosis VALIDATED · surfacing to tablet', nodeChain: ['bearing-spalling-pattern','bfp-3a'] },
      treeLabel: 'Validate + surface',
      delayMs: 1000,
    },
  ],
};

const ORCHESTRATOR_CLOSE_LINES = [
  { ts: '02:47:25', source: 'orchestrator', text: 'recommendation ready · SOP-BFP-VIBR-001 · awaiting dispatch · pending onsite verification', nodeChain: [] },
];

// Wave 3.4 — Workflow Agent (fires on Dispatch CTA → captures SOP trace)
const WORKFLOW_AGENT_SCRIPT = {
  agentId: 'workflow',
  durationMs: 2500,
  taskTreeLabel: 'Capture SOP Trace',
  steps: [
    {
      log: { ts: '02:47:48', source: 'workflow', text: 'Sembcorp CCGT-1 · incident workflow trace captured · INC-2026-0537', nodeChain: ['bfp-3a', 'r-kumar'] },
      treeLabel: 'Capture trace',
      delayMs: 200,
    },
    {
      log: { ts: '02:47:49', source: 'workflow', text: 'dispatch sequence recorded · P1 Ops Tower → P2 Onsite · 02:47:48 SGT', nodeChain: ['r-kumar', 'lim-wei-jie'] },
      treeLabel: 'Record dispatch sequence',
      delayMs: 900,
    },
    {
      log: { ts: '02:47:50', source: 'workflow', text: 'SOP-BFP-VIBR-001 registered for process-engineer review · 0 deviations from standard', nodeChain: ['sop-bfp-vibration-investigation', 'raci-derate'] },
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

// ── W3.9 — Arc clone fires for any persona (theater). Only advances state pill when P1 is on first arc. ──
function fireArc(personaKey) {
  dispatchP1Arc(personaKey);
}

// ── Sequencer ──
function dispatchP1Arc(arcPersonaKey) {
  // Re-runnable: clear any prior timers
  state.arcTimers.forEach(t => clearTimeout(t));
  state.arcTimers = [];

  // W3.9 — only advance state pill when this is P1's first arc (TRIAGING in flight)
  const advanceStatePill = (arcPersonaKey === undefined || arcPersonaKey === 'ops') &&
                           (state.incidentPhase === 'TRIAGING');
  if (advanceStatePill) {
    setStatePill('TRIAGING');
  }
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

  // 6. Phase: TRIAGING → REVIEW_READY (only for P1's first arc; clones don't regress)
  t += 300;
  scheduleArcStep(t, () => {
    if (advanceStatePill) setStatePill('REVIEW_READY');
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
    text: 'sensor anomaly · BFP-3A NDE vibration transducer · RMS drift detected',
    dataSource: 'Bently Nevada 3500',
    nodeChain: ['bfp-3a', 'vt-bfp-3a-nde-x'],
  });
  appendLogLine({
    ts: '02:47:08',
    source: 'orchestrator',
    text: 'received INC-2026-0537 · JRG-CCGT-1 · Block 2 · BFP-3A',
    nodeChain: ['bfp-3a', 'r-kumar'],
  });
  appendLogLine({
    ts: '02:47:08',
    source: 'orchestrator',
    text: 'severity AMBER · dispatching Sensor Anomaly Inspector · scope: KG lookup + cross-layer impact',
    nodeChain: ['bfp-3a'],
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

// ─────────────────────────────────────────────
// W3.8 — Right-pane drawer toggle
// ─────────────────────────────────────────────
function toggleDrawer() {
  state.drawerOpen = !state.drawerOpen;
  const stage = document.getElementById('stage');
  const toggleBtn = document.getElementById('drawer-toggle');
  if (!stage || !toggleBtn) return;
  if (state.drawerOpen) {
    stage.setAttribute('data-drawer', 'open');
    toggleBtn.dataset.state = 'open';
  } else {
    stage.removeAttribute('data-drawer');
    toggleBtn.dataset.state = 'closed';
    // Auto-close KG floating window if it's open.
    if (state.graphWinOpen) {
      toggleGraphWindow();
    }
  }
}

function initDrawer() {
  const toggleBtn = document.getElementById('drawer-toggle');
  if (toggleBtn) toggleBtn.addEventListener('click', toggleDrawer);
}

// W3.6 — OCR document modal (IEEE 1159 § 4.2 wired)
function openDocModal(docRef) {
  const modal = document.getElementById('doc-modal');
  if (!modal) return;
  // For W3.6 only IEEE-1159 is wired; future refs can swap modal contents per docRef.
  modal.dataset.open = 'true';
}
function closeDocModal() {
  const modal = document.getElementById('doc-modal');
  if (!modal) return;
  modal.dataset.open = 'false';
}
function initDocModal() {
  // Delegated click on .dyn-entity-ref (rebuilt every render) — bind on body once.
  document.body.addEventListener('click', e => {
    const ref = e.target.closest('.dyn-entity-ref');
    if (ref) {
      e.preventDefault();
      openDocModal(ref.dataset.docRef);
      return;
    }
    if (e.target.closest('#doc-modal-close, #doc-modal-overlay')) {
      closeDocModal();
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDocModal();
  });
}

function init() {
  render();
  initKG3D();
  initFloatingWindowHandlers();
  initRightPaneToolbar();
  initDrawer();
  initDocModal();
  initTranscriptModal();
  // W3.10 — telemetry modal ESC-to-close
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const m = document.getElementById('telemetry-modal');
    if (m && m.dataset.open === 'true') closeTelemetryModal();
  });
  seedLogLines();
  updateLogCountBadge();
  updateGraphCountBadge();
  initAgentCardStates();
  updateAgentDimmingForActivePersona();
}

document.addEventListener('DOMContentLoaded', init);
