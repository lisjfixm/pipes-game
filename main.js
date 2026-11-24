import * as THREE from './lib/three.module.js';

/* ============================================================
   PIPES — 3D web replica (Three.js). Solo Chapter 1 prototype.
   ============================================================ */

const DIFF = {
  easy:    { battery: 210, warmthDrain: 4.5, monsterRate: 0.75, speed: 0.9, sight: 1, pod: 120 },
  normal:  { battery: 170, warmthDrain: 6.0, monsterRate: 1.0,  speed: 1.0, sight: 1, pod: 90 },
  hard:    { battery: 130, warmthDrain: 8.0, monsterRate: 1.25, speed: 1.12, sight: 1, pod: 60 },
  insane:  { battery: 105, warmthDrain: 11,  monsterRate: 1.5,  speed: 1.25, sight: 1, pod: 45 },
};

const ITEMS = {
  cola:    { name: 'Pipe Cola',  price: 3, desc: 'Restore ~1/3 lamp battery' },
  flare:   { name: 'Flare',      price: 3, desc: 'Burns 15s; keeps things away' },
  warmer:  { name: 'Hand Warmer',price: 3, desc: 'Big chunk of warmth' },
  energy:  { name: 'Energy Drink', price: 4, desc: 'Faster crawl 20s' },
  smoke:   { name: 'Smoke Bomb', price: 6, desc: 'Hidden from everything 8s' },
  wrench:  { name: 'Wrench',     price: 6, desc: 'Instantly finish the open job; repels what lurks' },
  can:     { name: 'Tin Can',    price: 2, desc: 'Clatter pulls Randal/Grinner off your trail' },
  glow:    { name: 'Glow Stick', price: 2, desc: 'Drop green glow; draws moths away 2 min' },
  meat:    { name: 'Mystery Meat', price: 4, desc: 'Teleport to a random spot; shakes followers' },
  mask:    { name: 'Gas Mask',   price: 5, desc: '30s proof against Exterminator gas' },
  map:     { name: 'Extra Map', price: 4, desc: 'Restore your snatched paper map' },
};

// Chapter 1 roster per night (featured first)
const NIGHTS = [
  { jobs: 3, roster: ['maw'] },
  { jobs: 4, roster: ['randal', 'maw'] },
  { jobs: 4, roster: ['drooler', 'maw', 'randal'] },
  { jobs: 4, roster: ['moths', 'maw', 'randal', 'drooler'] },
  { jobs: 5, roster: ['rampage', 'maw', 'randal', 'drooler', 'moths'] },
  { jobs: 5, roster: ['janitor', 'nana', 'maw', 'randal', 'drooler', 'moths', 'rampage'] },
  { jobs: 6, roster: ['burrower', 'maw', 'randal', 'drooler', 'moths', 'rampage', 'janitor'] },
  { jobs: 7, roster: ['lantern', 'maw', 'randal', 'drooler', 'moths', 'rampage', 'janitor', 'burrower'] },
  { jobs: 8, roster: ['tollman', 'maw', 'randal', 'drooler', 'moths', 'rampage', 'janitor', 'burrower', 'lantern'] },
  { jobs: 0, roster: ['foreman', 'maw', 'drooler', 'moths', 'rampage', 'janitor', 'burrower', 'lantern', 'tollman'] },
];

// Chapter 2: The Vents — roster per night (featured first), solo job counts
const NIGHTS2 = [
  { jobs: 5, roster: ['grinner', 'drooler'] },
  { jobs: 5, roster: ['sweeper', 'grinner', 'drooler'] },
  { jobs: 5, roster: ['exterminator', 'grinner', 'sweeper', 'drooler'] },
  { jobs: 5, roster: ['server', 'grinner', 'sweeper', 'exterminator', 'drooler'] },
  { jobs: 7, roster: ['grinner', 'sweeper', 'exterminator', 'server', 'drooler'] },
  { jobs: 7, roster: ['flesh', 'grinner', 'sweeper', 'exterminator', 'server', 'drooler'] },
  { jobs: 7, roster: ['faceling', 'grinner', 'sweeper', 'exterminator', 'server', 'flesh', 'drooler'] },
  { jobs: 6, roster: ['temp', 'grinner', 'sweeper', 'exterminator', 'server', 'flesh', 'faceling', 'drooler'] },
  { jobs: 6, roster: ['drip', 'grinner', 'sweeper', 'exterminator', 'server', 'flesh', 'faceling', 'temp', 'drooler'] },
  { jobs: 5, roster: ['mother', 'young', 'grinner', 'flesh'] },
];

// Chapter 3: The Growth — roster per night (featured first), solo job counts
const NIGHTS3 = [
  { jobs: 3, roster: ['dale', 'drooler'] },
  { jobs: 3, roster: ['marco', 'dale', 'drooler'] },
  { jobs: 4, roster: ['gardener', 'dale', 'marco', 'drooler'] },
  { jobs: 4, roster: ['wrongnook', 'dale', 'marco', 'gardener', 'drooler'] },
  { jobs: 4, roster: ['leeches', 'dale', 'marco', 'gardener', 'wrongnook', 'drooler'] },
  { jobs: 5, roster: ['deadair', 'dale', 'marco', 'gardener', 'wrongnook', 'leeches', 'drooler'] },
  { jobs: 5, roster: ['shiftchange', 'dale', 'marco', 'gardener', 'wrongnook', 'leeches', 'deadair', 'drooler'] },
  { jobs: 5, roster: ['choir', 'dale', 'marco', 'gardener', 'wrongnook', 'leeches', 'deadair', 'shiftchange', 'drooler'] },
  { jobs: 5, roster: ['randalog', 'dale', 'marco', 'gardener', 'wrongnook', 'leeches', 'deadair', 'shiftchange', 'choir', 'drooler'] },
  { jobs: 5, roster: ['twoofthem'] },
];

function nightTable() { return G.chapter === 3 ? NIGHTS3 : G.chapter === 2 ? NIGHTS2 : NIGHTS; }

// ---------- DOM ----------
const $ = (id) => document.getElementById(id);
const hud = $('hud'), batteryEl = $('battery'), warmthEl = $('warmth'), capsEl = $('caps'),
  pocketsEl = $('pockets'), effectsEl = $('effects'), objectiveEl = $('objective'),
  promptEl = $('prompt'), bossKeysEl = $('boss-keys'), mapEl = $('map'), modal = $('modal'), modalBox = $('modal-box'),
  deathEl = $('death'), deathTitle = $('death-title'), deathText = $('death-text'),
  lobbyEl = $('lobby'), nightCard = $('night-card');

// ---------- Game state ----------
const G = {
  state: 'lobby',           // lobby | playing | modal | death | card
  diff: 'normal',
  chapter: 1,
  night: 1,
  nodes: [], edges: [],
  player: null,
  monsters: [],
  jobs: [],
  caps: 0,
  pockets: [],
  effects: {},              // key -> seconds left
  lampOn: true,
  mapUp: false,
  mapTaken: false,
  mapRolled: false,
  reviveUsed: false,
  frozen: null,
  podEscapeUsed: false,
  backStreak: 0,
  behind: null,
  time: 0,
  started: false,
  shiftDone: false,
  keys: {},
  safeNode: 0,
  bossNight: false,
  jobTotal: 0,
  cageNode: null,
  keysHeld: 0,
  locks: 3,
  cureCarry: 0,
  cureDeposited: 0,
  portals: [],
  flareReadyAt: 0,
  bossPhase: 'brew',   // brew | fight | escape  (Ch3 Night 10)
  jar: false,
  splashes: 0,
  escapeAt: 0,
  marcoTimer: 0,
  marcoWindow: 0,
  jarReadyAt: 0,
  dropped: [],
  decoy: null,
  glow: null,
};
window.G = G;  // debug / headless inspection

// ---------- Three setup ----------
let renderer = null;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  $('game').appendChild(renderer.domElement);
} catch (err) {
  const msg = document.createElement('div');
  msg.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;color:#e06c5f;padding:24px;text-align:center';
  msg.textContent = 'WebGL is not available in this browser. Please open this game in a browser with hardware acceleration enabled.';
  document.body.appendChild(msg);
  console.error(err);
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07080a);
scene.fog = new THREE.Fog(0x07080a, 6, 22);

const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.1, 60);
const ambient = new THREE.AmbientLight(0x334455, 0.5);
scene.add(ambient);

const lampLight = new THREE.SpotLight(0xffd9a0, 2.2, 16, Math.PI / 4.5, 0.5, 1.2);
const lampGlow = new THREE.PointLight(0xffc880, 0.6, 6, 1.5);
camera.add(lampLight); camera.add(lampGlow);
lampLight.position.set(0, 0.2, 0); lampLight.target.position.set(0, 0, -1);
camera.add(lampLight.target);
scene.add(camera);

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  if (renderer) renderer.setSize(innerWidth, innerHeight);
});

// ---------- Audio (synthesized, no assets) ----------
let actx = null;
function initAudio() {
  if (actx) return;
  try {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = actx.createOscillator(), gain = actx.createGain();
    osc.type = 'sawtooth'; osc.frequency.value = 52;
    gain.gain.value = 0.025;
    osc.connect(gain); gain.connect(actx.destination); osc.start();
  } catch (e) { actx = null; }
}
function beep(freq, dur = 0.15, type = 'square', vol = 0.12, slide = 0) {
  if (!actx) return;
  try {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.value = freq;
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), actx.currentTime + dur);
    g.gain.setValueAtTime(vol, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
    o.connect(g); g.connect(actx.destination);
    o.start(); o.stop(actx.currentTime + dur);
  } catch (e) { /* ignore */ }
}

// ---------- Map generation ----------
function buildMap() {
  G.nodes = []; G.edges = [];
  const add = (x, z) => { const id = G.nodes.length; G.nodes.push({ id, x, z, neighbors: [], job: null, nook: false, key: false, cage: false, portal: false }); return id; };
  const link = (a, b) => { G.nodes[a].neighbors.push(b); G.nodes[b].neighbors.push(a); G.edges.push([a, b]); };

  const safe = add(0, 0); G.safeNode = safe;
  const ring1 = [], ring2 = [], ends = [];
  const R1 = 7, R2 = 13, N = 6;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    ring1.push(add(Math.cos(a) * R1, Math.sin(a) * R1));
  }
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    ring2.push(add(Math.cos(a) * R2, Math.sin(a) * R2));
  }
  [0, 2, 4].forEach((i) => {
    const a = (i / N) * Math.PI * 2;
    ends.push(add(Math.cos(a) * 18, Math.sin(a) * 18));
  });
  ring1.forEach((n, i) => {
    link(safe, n);
    link(n, ring1[(i + 1) % N]);
    link(n, ring2[i]);
    link(ring2[i], ring2[(i + 1) % N]);
  });
  ends.forEach((e, k) => link(ring2[[0, 2, 4][k]], e));

  const bossNight = nightTable()[G.night - 1].jobs === 0;
  // Ch2: junctions split up to six ways — cross-link the outer ring across the hexagon.
  if (G.chapter === 2) {
    for (let i = 0; i < N; i++) link(ring2[i], ring2[(i + 2) % N]);
  }
  // Boss night: the biggest map — a third outer ring tied to the outer duct ring.
  if (bossNight) {
    const ring3 = [];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      ring3.push(add(Math.cos(a) * 19, Math.sin(a) * 19));
    }
    ring2.forEach((n, i) => { link(n, ring3[i]); link(ring3[i], ring3[(i + 1) % N]); });
  }

  // hiding nooks on some ring1 / ring2 nodes
  ring1.forEach((n, i) => { if (i % 2 === 0) G.nodes[n].nook = true; });

  // jobs
  const night = nightTable()[G.night - 1];
  const candidates = G.nodes.filter(n => n.id !== safe && !G.nodes[n.id].nook);
  shuffle(candidates);
  G.jobs = [];
  for (let i = 0; i < Math.min(night.jobs, candidates.length); i++) {
    const node = candidates[i];
    const POOLS = {
      1: ['pressure', 'valve', 'leaks', 'bleed', 'weld', 'wires'],
      2: ['valve', 'pressure', 'weld', 'leaks', 'bleed'],
      3: ['bleed', 'weld', 'leaks'],
    };
    const pool = POOLS[G.chapter] || POOLS[1];
    const type = pool[Math.floor(Math.random() * pool.length)];
    node.job = { done: false, type, hits: 0 };
    G.jobs.push(node);
  }
  // distance from safe room (BFS)
  G.safeDist = { [safe]: 0 };
  const q = [safe];
  while (q.length) {
    const c = q.shift();
    for (const nb of G.nodes[c].neighbors) if (!(nb in G.safeDist)) {
      G.safeDist[nb] = G.safeDist[c] + 1; q.push(nb);
    }
  }
  // Chapter 3: paired purple portal holes in two far dead ends.
  G.portals = [];
  if (G.chapter === 3) {
    const ends = G.nodes.filter(n => n.neighbors.length === 1 && n.id !== safe);
    const far = G.nodes.filter(n => n.id !== safe && !n.nook)
      .sort((a, b) => (G.safeDist[b.id] ?? 0) - (G.safeDist[a.id] ?? 0));
    const pair = (ends.length >= 2 ? ends : far).slice(0, 2);
    if (pair.length === 2) {
      pair.forEach(n => { n.portal = true; });
      G.portals = [pair[0].id, pair[1].id];
    }
  }
  // Chapter 2 night 8: zap gates wired across some ducts.
  G.gates = [];
  if (G.chapter === 2 && G.night === 8) {
    const midEdges = G.edges.filter(([a, b]) =>
      G.nodes[a].neighbors.length > 1 && G.nodes[b].neighbors.length > 1);
    shuffle(midEdges);
    for (let i = 0; i < Math.min(3, midEdges.length); i++) {
      midEdges[i].gate = true;
      G.gates.push(midEdges[i]);
    }
  }
  // scattered bottle caps
  G.nodes.forEach(n => { n.caps = 0; });
  const capNodes = G.nodes.filter(n => n.id !== safe);
  shuffle(capNodes);
  for (let i = 0; i < 8 && i < capNodes.length; i++) capNodes[i].caps = 2 + Math.floor(Math.random() * 3);

  // Night 10 boss: keys + Randal's cage
  G.bossNight = night.jobs === 0;
  G.jobTotal = G.jobs.length;
  G.keysHeld = 0; G.locks = 3; G.cageNode = null;
  if (G.bossNight) {
    const terminals = G.nodes.filter(n => n.neighbors.length === 1 && n.id !== safe);
    const far = G.nodes.filter(n => n.id !== safe && !n.nook)
      .sort((a, b) => (G.safeDist[b.id] ?? 0) - (G.safeDist[a.id] ?? 0));
    G.cageNode = terminals[0]?.id ?? far[0].id;
    G.nodes[G.cageNode].cage = true;
    const keyPool = [...terminals.slice(1), ...far].filter(n => n.id !== G.cageNode);
    shuffle(keyPool);
    for (let i = 0; i < 3 && i < keyPool.length; i++) keyPool[i].key = true;
    G.locks = 3;
  }
  G.shiftDone = false;
}

function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } }

// ---------- 3D world ----------
const worldGroup = new THREE.Group();
scene.add(worldGroup);

function v(n) { return new THREE.Vector3(G.nodes[n].x, 0, G.nodes[n].z); }

function buildWorld3D() {
  worldGroup.clear();
  const CH = G.chapter;
  const PAL = {
    1: { pipe: 0x2a3038, joint: 0x1c2127 },
    2: { pipe: 0x3a424a, joint: 0x2c333a },
    3: { pipe: 0x1a221a, joint: 0x121a12 },
  }[CH] || { pipe: 0x2a3038, joint: 0x1c2127 };
  const pipeMat = new THREE.MeshStandardMaterial({ color: PAL.pipe, roughness: 0.9, side: THREE.BackSide });
  const jointMat = new THREE.MeshStandardMaterial({ color: PAL.joint, roughness: 0.9, side: THREE.BackSide });

  // Cross-section: Ch1 octagonal pipe (N4/N8 vent nights go square like Ch2),
  // Ch2 square steel duct, Ch3 round growth tube.
  const isVent = CH === 2 || (CH === 1 && (G.night === 4 || G.night === 8));
  function pipeGeometry(len) {
    if (isVent) return new THREE.BoxGeometry(len, 1.8, 1.8);
    const seg = CH === 1 ? 8 : 12;
    return new THREE.CylinderGeometry(1.0, 1.0, len, seg, 1, true);
  }
  function jointGeometry() {
    if (isVent) return new THREE.BoxGeometry(1.9, 2.0, 1.9);
    if (CH === 1) return new THREE.CylinderGeometry(1.05, 1.05, 2.0, 8, 1, false);
    return new THREE.SphereGeometry(1.0, 12, 10);
  }

  for (const [a, b] of G.edges) {
    const pa = v(a), pb = v(b);
    const len = pa.distanceTo(pb);
    const geo = pipeGeometry(len);
    const mesh = new THREE.Mesh(geo, pipeMat);
    mesh.position.copy(pa).add(pb).multiplyScalar(0.5);
    const dir = pb.clone().sub(pa).normalize();
    const axis = isVent ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    mesh.quaternion.setFromUnitVectors(axis, dir);
    worldGroup.add(mesh);
  }
  // Ch2: cold light strips along the duct ceilings (per vent preview art).
  if (CH === 2) {
    const stripMat = new THREE.MeshStandardMaterial({ color: 0xbcd6e8, emissive: 0x9fc6dd, emissiveIntensity: 0.8 });
    for (const n of G.nodes) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 0.18), stripMat);
      strip.position.set(n.x, 1.72, n.z);
      worldGroup.add(strip);
    }
  }
  // Ch2 night 8: charged zap gates across selected ducts.
  for (const [a, b] of (G.gates || [])) {
    const pa = v(a), pb = v(b);
    const mid = pa.clone().add(pb).multiplyScalar(0.5);
    const gateMat = new THREE.MeshStandardMaterial({ color: 0x3a3a22, emissive: 0xd8c83a, emissiveIntensity: 0.6, transparent: true, opacity: 0.55 });
    const gate = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.7, 1.7), gateMat);
    gate.position.copy(mid);
    gate.lookAt(pb.x, 0, pb.z);
    worldGroup.add(gate);
  }
  // Ch3: glowing spores clinging to the round rooms.
  if (CH === 3) {
    const sporeMat = new THREE.MeshStandardMaterial({ color: 0x88cc55, emissive: 0x66aa33, emissiveIntensity: 0.7 });
    for (const n of G.nodes) {
      for (let k = 0; k < 2; k++) {
        const sp = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 5), sporeMat);
        const a = Math.random() * Math.PI * 2, r = 0.7;
        sp.position.set(n.x + Math.cos(a) * r, 0.5 + Math.random() * 0.8, n.z + Math.sin(a) * r);
        worldGroup.add(sp);
      }
    }
  }
  for (const n of G.nodes) {
    const s = new THREE.Mesh(jointGeometry(), jointMat);
    s.position.set(n.x, 0, n.z);
    // Ch3: three-way+ junctions open into round rooms, slightly larger.
    if (CH === 3 && n.neighbors.length >= 3) s.scale.setScalar(1.18);
    worldGroup.add(s);
    if (n.job && !n.job.done) {
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.7, 0.15),
        new THREE.MeshStandardMaterial({ color: 0xe8a13a, emissive: 0xe8a13a, emissiveIntensity: 0.6 })
      );
      panel.position.set(n.x, 0.6, n.z);
      worldGroup.add(panel);
    }
    if (n.nook) {
      if (CH === 2) {
        // louvred service cubby: horizontal slats
        const slatMat = new THREE.MeshStandardMaterial({ color: 0x5a646c, roughness: 0.85 });
        for (let k = 0; k < 4; k++) {
          const slat = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.07, 0.12), slatMat);
          slat.position.set(n.x, 0.55 + k * 0.18, n.z - 0.35);
          worldGroup.add(slat);
        }
      } else if (CH === 3) {
        // grown pocket behind a curtain of vines
        const vineMat = new THREE.MeshStandardMaterial({ color: 0x3f7a2e, roughness: 0.9, emissive: 0x244a18, emissiveIntensity: 0.3 });
        for (let k = -2; k <= 2; k++) {
          const vine = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.2, 0.05), vineMat);
          vine.position.set(n.x + k * 0.13, 0.65, n.z - 0.3);
          worldGroup.add(vine);
        }
      } else {
        const lamp = new THREE.Mesh(
          new THREE.SphereGeometry(0.16, 8, 6),
          new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0xff2222, emissiveIntensity: 0.9 })
        );
        lamp.position.set(n.x, 0.9, n.z);
        worldGroup.add(lamp);
      }
    }
    if (n.portal) {
      const purp = new THREE.MeshStandardMaterial({ color: 0x6a3aa0, emissive: 0x8a4ad0, emissiveIntensity: 0.9, side: THREE.DoubleSide });
      const disc = new THREE.Mesh(new THREE.CircleGeometry(0.55, 18), purp);
      disc.position.set(n.x, 0.8, n.z);
      worldGroup.add(disc);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.05, 8, 22), purp);
      ring.position.set(n.x, 0.8, n.z + 0.02);
      worldGroup.add(ring);
      const pl = new THREE.PointLight(0x8a4ad0, 0.6, 4);
      pl.position.set(n.x, 0.8, n.z);
      worldGroup.add(pl);
    }
    if (n.caps > 0) {
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.1, 8),
        new THREE.MeshStandardMaterial({ color: 0xc9a24a, emissive: 0x8a6a20, emissiveIntensity: 0.4 })
      );
      cap.position.set(n.x, 0.2, n.z);
      worldGroup.add(cap);
    }
    if (n.key) {
      const key = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.18, 0.34),
        new THREE.MeshStandardMaterial({ color: 0xd8b64a, emissive: 0xa88420, emissiveIntensity: 0.7 })
      );
      key.position.set(n.x, 0.25, n.z);
      worldGroup.add(key);
    }
    if (n.cage) {
      const barMat = new THREE.MeshStandardMaterial({ color: 0x4a3b22, roughness: 0.7 });
      for (let k = -2; k <= 2; k++) {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.8, 0.08), barMat);
        bar.position.set(n.x + k * 0.35, 0.9, n.z);
        worldGroup.add(bar);
      }
      const red = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 8, 6),
        new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0xff2222, emissiveIntensity: 0.9 })
      );
      red.position.set(n.x, 1.4, n.z);
      worldGroup.add(red);
    }
  }
  // ---------- Safe room ----------
  const safe = G.nodes[G.safeNode];
  const sx = safe.x, sz = safe.z;
  const room = new THREE.Mesh(
    new THREE.BoxGeometry(4.4, 2.4, 4.4, 1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0x2b2720, roughness: 0.9, side: THREE.BackSide })
  );
  room.position.set(sx, 1.2, sz);
  worldGroup.add(room);
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(4.4, 0.1, 4.4),
    new THREE.MeshStandardMaterial({ color: 0x3a3226, roughness: 0.85 })
  );
  floor.position.set(sx, 0.02, sz);
  worldGroup.add(floor);

  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0xffe6b0, emissive: 0xffd98a, emissiveIntensity: 1.2 })
  );
  bulb.position.set(sx, 2.1, sz);
  worldGroup.add(bulb);
  const roomLight = new THREE.PointLight(0xffe6b0, 1.1, 9);
  roomLight.position.set(sx, 1.9, sz);
  worldGroup.add(roomLight);

  const prop = (w, h, d, color, x, y, z, mat = {}) => {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...mat })
    );
    m.position.set(sx + x, y, sz + z);
    worldGroup.add(m);
    return m;
  };

  // Vending machine against the back wall (salmon body, cream strip, slot grid)
  prop(0.95, 1.9, 0.5, 0xc26a5e, 0.95, 0.95, -1.5);
  prop(0.85, 0.22, 0.06, 0xefe3c4, 0.95, 1.72, -1.23);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
    prop(0.18, 0.16, 0.04, 0xefe3c4, 0.72 + c * 0.23, 1.36 - r * 0.24, -1.23);
  }
  for (let b = 0; b < 3; b++) prop(0.1, 0.1, 0.05, 0x2a2020, 1.3, 1.36 - b * 0.24, -1.22);
  prop(0.7, 0.12, 0.2, 0x8a4a42, 0.95, 0.18, -1.22);

  // Desk with radio and guide book (left wall)
  prop(1.3, 0.08, 0.7, 0x4a3b28, -1.35, 0.74, -1.2);
  prop(0.1, 0.7, 0.1, 0x33291c, -1.9, 0.37, -1.45);
  prop(0.1, 0.7, 0.1, 0x33291c, -0.8, 0.37, -1.45);
  prop(0.34, 0.2, 0.16, 0x222830, -1.55, 0.88, -1.2);
  prop(0.03, 0.3, 0.03, 0x11151a, -1.66, 1.08, -1.2); // radio antenna
  prop(0.22, 0.05, 0.16, 0x8a3a3a, -1.15, 0.82, -1.2); // guide book

  // Map pile by the right wall
  prop(0.4, 0.05, 0.3, 0xe9dfc4, 1.35, 0.08, -1.2);
  prop(0.38, 0.05, 0.28, 0xdcd0ae, 1.35, 0.14, -1.2);

  // Posters on the back wall
  prop(0.7, 0.5, 0.03, 0xd8c9a0, -1.45, 1.4, -2.16);
  prop(0.7, 0.5, 0.03, 0x9fb4c8, 1.45, 1.4, -2.16);

  // Pet bed by the south vent
  prop(0.7, 0.12, 0.5, 0x6b3a3a, 0, 0.08, 1.5);

  if (G.chapter === 3) {
    // Cauldron in the middle, wash barrel beside it
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.45, 0.6, 14),
      new THREE.MeshStandardMaterial({ color: 0x2a2f2a, roughness: 0.7, metalness: 0.3 }));
    pot.position.set(sx, 0.3, sz + 0.7); worldGroup.add(pot);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.08, 14),
      new THREE.MeshStandardMaterial({ color: 0x3a443a, roughness: 0.6, metalness: 0.3 }));
    rim.position.set(sx, 0.62, sz + 0.7); worldGroup.add(rim);
    const beadCol = [0x88cc55, 0xe8c15a, 0xcc66aa];
    for (let i = 0; i < Math.min(G.cureDeposited, 9); i++) {
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6),
        new THREE.MeshStandardMaterial({ color: beadCol[i % 3], emissive: beadCol[i % 3], emissiveIntensity: 0.5 }));
      const a = (i / 9) * Math.PI * 2;
      bead.position.set(sx + Math.cos(a) * 0.5, 0.66, sz + 0.7 + Math.sin(a) * 0.5);
      worldGroup.add(bead);
    }
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.7, 12),
      new THREE.MeshStandardMaterial({ color: 0x5a4630, roughness: 0.85 }));
    barrel.position.set(sx - 1.0, 0.35, sz + 0.7); worldGroup.add(barrel);
  } else if (G.bossNight) {
    // Flare box in the middle for the Night 10 finale
    prop(0.6, 0.5, 0.6, 0x4a5a3a, 0, 0.25, 0.7);
    prop(0.5, 0.08, 0.5, 0x33402a, 0, 0.52, 0.7);
  }
}

// ---------- Player ----------
function resetPlayer() {
  const d = DIFF[G.diff];
  G.player = {
    node: G.safeNode, facing: G.nodes[G.safeNode].neighbors[0] ?? null,
    moving: null,             // {from,to,t,dur,back}
    battery: d.battery, warmth: 100,
    locked: false, hidden: false,
    nookTimer: 0,
    speedBoost: 0, slow: false,
    lookYaw: 0, lookPitch: 0,
  };
  for (const m of G.monsters) scene.remove(m.mesh);
  G.caps = 4; G.pockets = []; G.effects = {};
  G.lampOn = true; G.mapUp = false; G.mapTaken = false; G.mapRolled = false; G.monsters = []; G.time = 0; G.darkTimer = 0;
  G.cureCarry = 0; G.cureDeposited = 0; G.flareReadyAt = 0;
  G.bossPhase = 'brew'; G.jar = false; G.splashes = 0; G.escapeAt = 0;
  G.marcoTimer = 0; G.marcoWindow = 0; G.jarReadyAt = 0;
  G.dropped = [];
  G.decoy = null; G.glow = null;
  G.reviveUsed = false;
  G.frozen = null; G.podEscapeUsed = false;
  G.backStreak = 0; G.behind = null;
}

function placePlayerCamera() {
  const p = G.player;
  let pos;
  if (p.moving) {
    const a = v(p.moving.from), b = v(p.moving.to);
    pos = a.lerp(b, p.moving.t);
  } else pos = v(p.node);
  camera.position.set(pos.x, 0.7, pos.z);
  camera.rotation.order = 'YXZ';
  if (p.facing != null) {
    const f = v(p.facing);
    camera.lookAt(f.x, 0.7, f.z);
  }
  camera.rotation.y += p.lookYaw;
  camera.rotation.x += p.lookPitch;
}

function crawlDuration(back) {
  const base = back ? 0.85 : 0.55;
  const spd = G.player.speedBoost > 0 ? 1.4 : 1;
  return base / spd * (G.player.slow ? 1.7 : 1);
}

function startCrawl(to, back = false) {
  const p = G.player;
  if (p.moving || p.locked) return;
  if (G.behind) return;
  if (back) {
    G.backStreak++;
    if (G.backStreak === 3) promptEl.textContent = 'Something is breathing behind you... back up again and it grabs.';
    if (G.backStreak >= 3 && G.backStreak < 5) { promptEl.textContent = 'Something is in the way. Crawl forward to shake it off.'; return; }
    if (G.backStreak >= 5) {
      G.behind = { struggle: 0, t: 5 };
      p.locked = true;
      promptEl.textContent = 'Hands from both sides! Mash Space to break free!';
      beep(100, 0.5, 'sawtooth', 0.2);
      return;
    }
  } else {
    G.backStreak = 0;
  }
  const toll = G.monsters.find(x => x.kind === 'tollman' && x.node === to && !x.paid);
  if (toll) {
    toll.shove = (toll.shove || 0) + 1;
    if (toll.shove >= 2) return killPlayer(toll);
    promptEl.textContent = 'The Tollman shoves you back — pay 3 caps (E) or go round.';
    return;
  }
  p.moving = { from: p.node, to, t: 0, dur: crawlDuration(back), back };
  beep(60, 0.07, 'square', 0.05, -15);
}

function rotate(dir) {
  const p = G.player;
  if (p.moving || p.locked) return;
  const nb = G.nodes[p.node].neighbors;
  if (nb.length < 2) return;
  let i = nb.indexOf(p.facing);
  i = (i + dir + nb.length) % nb.length;
  p.facing = nb[i];
}

// ---------- Items / effects ----------
function addEffect(k, sec) { G.effects[k] = Math.max(G.effects[k] || 0, sec); }

function useItem(slot) {
  const p = G.player;
  const id = G.pockets[slot];
  if (!id) return;
  const inJob = G.state === 'modal' && pressure && pressure.node;
  if ((G.state !== 'playing' && !(id === 'wrench' && inJob)) || p.locked) return;
  if (id === 'cola') { p.battery = Math.min(DIFF[G.diff].battery, p.battery + DIFF[G.diff].battery / 3); }
  else if (id === 'warmer') { p.warmth = Math.min(100, p.warmth + 45); }
  else if (id === 'energy') { p.speedBoost = 20; addEffect('SPEED', 20); }
  else if (id === 'flare') { addEffect('FLARE', 15); }
  else if (id === 'smoke') { addEffect('SMOKE', 8); }
  else if (id === 'wrench') {
    if (G.state === 'modal' && pressure && pressure.node) {
      G.pockets.splice(slot, 1); renderPockets();
      finishJob(pressure); return;
    }
    for (const m of [...G.monsters]) {
      const nb = G.nodes[m.node].neighbors;
      m.node = nb[Math.floor(Math.random() * nb.length)];
      m.state = 'roam'; m.timer = 10;
    }
    promptEl.textContent = 'The wrench slams the pipe and everything scuttles off.';
    beep(90, 0.3, 'square', 0.2);
  }
  else if (id === 'can') {
    const nb = G.nodes[p.node].neighbors;
    const target = nb.length ? nb[Math.floor(Math.random() * nb.length)] : p.node;
    G.decoy = { node: target, t: 12 };
    promptEl.textContent = 'The tin can clatters down the pipe.';
  }
  else if (id === 'glow') {
    G.glow = { node: p.node, t: 120 };
    promptEl.textContent = 'The glow stick oozes green light into the pipe.';
  }
  else if (id === 'meat') {
    const spots = G.nodes.filter(n => n.id !== G.safeNode);
    p.node = spots[Math.floor(Math.random() * spots.length)].id;
    for (const m of [...G.monsters]) { m.state = 'roam'; m.timer = 6; m.fogNode = null; }
    promptEl.textContent = 'The meat tugs you somewhere random; the pack loses your trail.';
  }
  else if (id === 'mask') { addEffect('MASK', 30); }
  else if (id === 'map') { G.mapTaken = false; promptEl.textContent = 'You unfold a fresh paper map.'; }
  G.pockets.splice(slot, 1);
  renderPockets();
}

function renderPockets() {
  pocketsEl.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    const id = G.pockets[i];
    const el = document.createElement('div');
    el.className = 'slot';
    el.textContent = id ? (ITEMS[id]?.name.split(' ')[0] ?? id) : (i + 1);
    el.onclick = () => useItem(i);
    pocketsEl.appendChild(el);
  }
}

// ---------- Monsters ----------
const MON_DEFS = {
  maw:       { name: 'The Maw' },
  randal:    { name: 'Randal' },
  drooler:   { name: 'The Drooler' },
  moths:     { name: 'The Moths' },
  rampage:   { name: 'Rampage' },
  janitor:   { name: 'The Janitor' },
  nana:      { name: 'Nana' },
  burrower:  { name: 'The Burrower' },
  lantern:   { name: 'The Lantern Man' },
  tollman:   { name: 'The Tollman' },
  foreman:   { name: 'The Foreman' },
  grinner:    { name: 'The Grinner' },
  sweeper:    { name: 'The Sweeper' },
  exterminator: { name: 'The Exterminator' },
  server:     { name: 'The Process Server' },
  flesh:      { name: 'The Flesh' },
  faceling:   { name: 'The Faceling' },
  temp:       { name: 'The Temp' },
  drip:       { name: 'The Drip' },
  mother:     { name: 'The Mother' },
  young:      { name: 'Her Young' },
  dale:       { name: 'Dale' },
  marco:      { name: 'Marco' },
  gardener:   { name: 'The Gardener' },
  wrongnook:  { name: 'The Wrong Nook' },
  leeches:    { name: 'The Leeches' },
  deadair:    { name: 'Dead Air' },
  shiftchange: { name: 'The Shift Change' },
  choir:      { name: 'The Choir' },
  randalog:   { name: 'Randal, Overgrown' },
  twoofthem:  { name: 'The Two of Them' },
};

function spawnMonster(kind) {
  const roster = nightTable()[G.night - 1].roster;
  // place at a node far from safe room / player
  const far = G.nodes.filter(n => n.id !== G.safeNode && n.id !== G.player.node);
  shuffle(far);
  const m = {
    kind, name: MON_DEFS[kind].name,
    node: far[0].id, target: null,
    state: 'idle', timer: 4 + Math.random() * 4, phase: 0,
    mesh: makeMonsterMesh(kind),
  };
  scene.add(m.mesh);
  G.monsters.push(m);
  positionMonster(m);
  return m;
}

const MON_LOOK = {
  maw:       { body: 0x0a0a0c, eye: 0xff6644, scale: 1.0 },
  randal:    { body: 0x111114, eye: 0xffffff, scale: 1.25 },
  drooler:   { body: 0x161310, eye: 0x99cc66, scale: 0.95 },
  moths:     { body: 0x8a8578, eye: 0xddddcc, scale: 0.8 },
  rampage:   { body: 0x2a0d0d, eye: 0xff2222, scale: 1.2 },
  janitor:   { body: 0x1a1d1a, eye: 0x555555, scale: 1.35 },
  nana:      { body: 0x6b5a52, eye: 0xffcccc, scale: 0.8 },
  burrower:  { body: 0x241a12, eye: 0xff8855, scale: 1.3 },
  lantern:   { body: 0x0e1418, eye: 0xffaa33, scale: 1.3 },
  tollman:   { body: 0x2b2418, eye: 0xc9a24a, scale: 0.9 },
  foreman:   { body: 0x22262a, eye: 0xffee88, scale: 1.2 },
  grinner:    { body: 0x141018, eye: 0xff5577, scale: 1.2 },
  sweeper:    { body: 0x3a3f45, eye: 0x9fd8ff, scale: 1.0 },
  exterminator: { body: 0x2c2a12, eye: 0xffcc33, scale: 1.3 },
  server:     { body: 0x1c1c22, eye: 0xccccdd, scale: 1.1 },
  flesh:      { body: 0x5a2020, eye: 0xff8866, scale: 1.35 },
  faceling:   { body: 0x222222, eye: 0x111111, scale: 0.9 },
  temp:       { body: 0x3a3320, eye: 0xe8d88a, scale: 1.0 },
  drip:       { body: 0x10181c, eye: 0x66bbdd, scale: 0.85 },
  mother:     { body: 0x2a1418, eye: 0xff4455, scale: 1.6 },
  young:      { body: 0x0a0a0a, eye: 0x888888, scale: 0.55 },
  dale:       { body: 0x181410, eye: 0xffaa44, scale: 1.1 },
  marco:      { body: 0x101418, eye: 0x4488ff, scale: 1.1 },
  gardener:   { body: 0x1c2a14, eye: 0x88cc55, scale: 1.2 },
  wrongnook:  { body: 0x0c0c0c, eye: 0xff3333, scale: 0.9 },
  leeches:    { body: 0x2a1a2a, eye: 0xcc66aa, scale: 0.6 },
  deadair:    { body: 0x14161a, eye: 0xaaaaaa, scale: 1.0 },
  shiftchange: { body: 0x221a1a, eye: 0xff6644, scale: 1.2 },
  choir:      { body: 0x1a2418, eye: 0x99ddaa, scale: 1.3 },
  randalog:   { body: 0x121a12, eye: 0xccffcc, scale: 1.25 },
  twoofthem:  { body: 0x1a1016, eye: 0xff5599, scale: 1.5 },
};

function makeMonsterMesh(kind) {
  const look = MON_LOOK[kind] ?? MON_LOOK.maw;
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: look.body, roughness: 0.8 });
  const eyeMat = new THREE.MeshBasicMaterial({ color: look.eye });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.55 * look.scale, 12, 10), bodyMat);
  body.position.y = 0.6;
  g.add(body);
  const e1 = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), eyeMat);
  const e2 = e1.clone();
  e1.position.set(-0.16, 0.72, 0.45 * look.scale); e2.position.set(0.16, 0.72, 0.45 * look.scale);
  g.add(e1, e2);
  g.userData.body = body;
  return g;
}

function positionMonster(m) {
  const n = G.nodes[m.node];
  m.mesh.position.set(n.x, 0, n.z);
  // face player
  const pp = v(G.player.node);
  m.mesh.lookAt(pp.x, 0, pp.z);
}

function distNodes(a, b) {
  // graph distance BFS
  const q = [[a, 0]]; const seen = new Set([a]);
  while (q.length) {
    const [cur, d] = q.shift();
    if (cur === b) return d;
    for (const nb of G.nodes[cur].neighbors) if (!seen.has(nb)) { seen.add(nb); q.push([nb, d + 1]); }
  }
  return 99;
}

// ---------- Monster AI ----------
function updateMonsters(dt) {
  const p = G.player;
  for (const m of G.monsters) {
    m.timer -= dt;
    switch (m.kind) {
      case 'maw': aiMaw(m, dt); break;
      case 'randal': aiRandal(m, dt); break;
      case 'drooler': aiDrooler(m, dt); break;
      case 'moths': aiMoths(m, dt); break;
      case 'rampage': aiRampage(m, dt); break;
      case 'janitor': aiJanitor(m, dt); break;
      case 'nana': aiNana(m, dt); break;
      case 'burrower': aiBurrower(m, dt); break;
      case 'lantern': aiLantern(m, dt); break;
      case 'tollman': aiTollman(m, dt); break;
      case 'foreman': aiForeman(m, dt); break;
      case 'grinner': aiGrinner(m, dt); break;
      case 'sweeper': aiSweeper(m, dt); break;
      case 'exterminator': aiExterminator(m, dt); break;
      case 'server': aiServer(m, dt); break;
      case 'flesh': aiFlesh(m, dt); break;
      case 'faceling': aiFaceling(m, dt); break;
      case 'temp': aiTemp(m, dt); break;
      case 'drip': aiDrip(m, dt); break;
      case 'mother': aiMother(m, dt); break;
      case 'young': aiYoung(m, dt); break;
      case 'dale': aiDale(m, dt); break;
      case 'marco': aiMarco(m, dt); break;
      case 'gardener': aiGardener(m, dt); break;
      case 'wrongnook': aiWrongNook(m, dt); break;
      case 'leeches': aiLeeches(m, dt); break;
      case 'deadair': aiDeadAir(m, dt); break;
      case 'shiftchange': aiShiftChange(m, dt); break;
      case 'choir': aiChoir(m, dt); break;
      case 'randalog': aiRandalOG(m, dt); break;
      case 'twoofthem': aiTwoOfThem(m, dt); break;
    }
    positionMonster(m);
  }
}

function playerPinned(m, reason) {
  G.player.locked = true;
  m.state = 'pin'; m.reason = reason;
}

function freezePlayer(monster) {
  if (G.state !== 'playing' || G.frozen) return;
  G.frozen = { t: DIFF[G.diff].pod, monster };
  G.player.locked = true;
  beep(120, 0.5, 'sawtooth', 0.2);
  promptEl.textContent = 'Locked in a freeze pod! Mash E / Space; break out once the light flashes.';
}

function smashPod() {
  if (!G.frozen) return;
  if (G.frozen.t <= 12 && !G.podEscapeUsed) {
    G.frozen = null; G.podEscapeUsed = true;
    G.player.locked = false;
    promptEl.textContent = 'You smash out of the freeze pod!';
    beep(600, 0.15, 'triangle', 0.14);
  } else {
    G.frozen.t -= 3;
    beep(200, 0.05, 'square', 0.08);
  }
}

function struggleBehind() {
  if (!G.behind) return;
  G.behind.struggle++;
  beep(220, 0.05, 'square', 0.08);
  if (G.behind.struggle >= 5) {
    G.behind = null; G.player.locked = false; G.backStreak = 0;
    promptEl.textContent = 'You wrench free of the hands.';
    beep(600, 0.15, 'triangle', 0.14);
  }
}

function killPlayer(monster) {  if (G.state !== 'playing') return;
  if (G.chapter === 3 && G.cureCarry > 0) {
    G.dropped.push(G.player.node);
    G.cureCarry = 0;
  }
  G.state = 'death';
  deathTitle.textContent = `CAUGHT BY ${monster.name.toUpperCase()}`;
  deathText.textContent = journalHint(monster.kind);
  deathEl.classList.remove('hidden');
  $('revive-btn').classList.toggle('hidden', G.reviveUsed);
  beep(150, 0.7, 'sawtooth', 0.22, -110);
}

function journalHint(kind) {  const hints = {
    maw: 'It only comes out while your lamp is on. Switch the heat lamp off and wait for it to sink back.',
    randal: 'Break line of sight down his pipe. He is a little slower than you — round a corner and he loses you.',
    drooler: 'It pins you in a corner. Get your paper map (M) up and hold it there until it leaves.',
    moths: 'Hear wings? Turn your heat lamp off before the swarm reaches you. A lit flare keeps them away.',
    rampage: 'When the pipes shake, get into a hiding nook (E at a red-lit hole) or the safe room.',
    janitor: 'It is blind and hears you. Squeaky bucket close? Stop moving and stay still until it leaves.',
    nana: 'She wants a hug. Press E to hug her — never crawl away while she is talking.',
    burrower: 'Floor grinding under you? Crawl off that spot immediately. It goes for whoever sits still.',
    lantern: 'Near his lantern, keep your heat lamp ON. He turns away from your light.',
    tollman: 'Pay 3 caps, or go round another way. Never crawl into him unpaid twice.',
    foreman: 'Faster than you. Break his sight, hide in a nook, and grab flares from the safe room.',
    grinner: 'Faster than Randal and off the map. Listen for the thuds; break line of sight fast.',
    sweeper: 'It drives one fixed loop all night. Learn the route and step aside to let it pass.',
    exterminator: 'Never crawl through the yellow fog. Leave the gassed junction before it fills.',
    server: 'When served a paper, reach the marked junction before the timer runs out — or get home.',
    flesh: 'It waits at the end of a straight duct, then charges down it. Get off the line into a side duct or nook.',
    faceling: 'It lives in the hiding holes. Never hide in a nook that peeked at you first.',
    temp: 'It undoes finished jobs. Keep your lamp on it to shoo it away; its scream draws others.',
    drip: 'It hangs upside down and drops on whoever stops underneath. Keep crawling.',
    mother: 'Asleep until the work is done, then she hunts your heat. Stay cold (lamp off) and get home.',
    young: 'Little black things latch on and slow you down. Step round them.',
    dale: 'He only sees you when your night vision is glowing. Switch it off and hold still.',
    marco: 'Blind. He yells MARCO and charges to where you answer. Move after you answer POLO.',
    gardener: 'He comes for whoever carries a cure plant nearby. Go round him, or drop the plant.',
    wrongnook: 'A fake hiding hole that is a mouth. Check your map before you hide; not drawn means not a hole.',
    leeches: 'They latch in the goo puddles and drink your battery. Back away to shake them off; a flare clears them.',
    deadair: 'It drifts toward the brightest player. Go dark and listen for the radio static.',
    shiftchange: 'The old crews stampede down one route. When the whistle blows, get off the lit halls.',
    choir: 'Grown into the wall, it freezes and drains you nearby. Keep clear of its ring; a flare jams it.',
    randalog: 'Randal overgrown, now using portals. Break sight, use flares, stay off a spinning portal.',
    twoofthem: 'Plays both Dale\'s and Marco\'s games at once. Fill the cure jar, let it grab you, hit the green, splash it three times, then run home.',
    growth: 'Sitting in the dark too long lets the Growth in. Keep your night vision on.',
    cold: 'You are freezing. Turn your lamp back on and get to the warm safe room.',
    thing: 'It only comes in when you back up too much. Stop backing up; mash Space to break free.',
    nosy: 'It peeks over your map and nooks. Don\'t stare at the map, and don\'t hide in one hole too long.',
  };
  return hints[kind] ?? 'Learn its rule and it cannot touch you.';
}

function aiMaw(m, dt) {
  const p = G.player;
  const nearSafe = p.node === G.safeNode || G.nodes[p.node].neighbors.includes(G.safeNode);
  if (m.state === 'idle') {
    m.timer -= dt;
    if (G.time > 10 && !nearSafe && G.lampOn && !p.moving && m.timer <= 0 &&
        Math.random() < 0.004 * DIFF[G.diff].monsterRate) {
      m.node = p.facing ?? p.node;
      m.state = 'confront'; m.onTime = 0; m.offTime = 0;
    }
  } else if (m.state === 'confront') {
    playerPinned(m, 'maw');
    if (G.lampOn) { m.onTime += dt; m.offTime = 0; }
    else { m.offTime += dt; m.onTime = 0; }
    if (m.offTime >= 2) {
      m.state = 'idle'; p.locked = false; m.timer = 10;
      const far = G.nodes.filter(n => n.id !== p.node);
      m.node = far[0].id;
      return;
    }
    if (m.onTime >= 5) return killPlayer(m);
  }
}

function aiRandal(m, dt) {
  const p = G.player;
  if (G.decoy && G.decoy.t > 0) { m.node = stepToward(m.node, G.decoy.node); m.state = 'roam'; return; }
  if (m.state === 'idle' || m.state === 'roam') {
    m.state = 'roam';
    if (m.timer <= 0) {
      const nb = G.nodes[m.node].neighbors;
      m.node = nb[Math.floor(Math.random() * nb.length)];
      m.timer = 1.6 / DIFF[G.diff].speed;
    }
    const d = distNodes(m.node, p.node);
    const sight = G.lampOn ? 4 : 2;
    if (d <= sight && !G.effects.smoke) { m.state = 'chase'; m.timer = 0; }
  } else if (m.state === 'chase') {
    if (G.effects.smoke) { m.state = 'roam'; return; }
    // step toward player node
    m.node = stepToward(m.node, p.node);
    if (m.node === p.node) return freezePlayer(m);
    if (distNodes(m.node, p.node) > (G.lampOn ? 5 : 3)) m.state = 'roam';
  }
}

function stepToward(from, to) {
  if (from === to) return from;
  // BFS next step
  const prev = { [from]: null }; const q = [from];
  while (q.length) {
    const c = q.shift();
    if (c === to) break;
    for (const nb of G.nodes[c].neighbors) if (!(nb in prev)) { prev[nb] = c; q.push(nb); }
  }
  let cur = to;
  while (prev[cur] !== from && prev[cur] != null) cur = prev[cur];
  return cur;
}

function aiDrooler(m, dt) {
  const p = G.player;
  if (m.state === 'idle') {
    if (!p.moving && Math.random() < 0.008 * DIFF[G.diff].monsterRate) {
      m.node = p.node; m.state = 'pin'; m.timer = 0;
      playerPinned(m, 'drooler');
    }
  } else if (m.state === 'pin') {
    if (G.mapUp) {
      m.timer += dt;
      if (m.timer >= 3) {
        if (!G.mapRolled && !G.mapTaken && Math.random() < 0.15) {
          G.mapRolled = true; G.mapTaken = true; G.mapUp = false;
          mapEl.classList.add('hidden');
          promptEl.textContent = 'It snatched your map and ran! Unfold an extra map.';
        }
        m.state = 'idle'; p.locked = false; removeMonster(m);
      }
    } else m.timer = 0;
  }
}

function aiMoths(m, dt) {
  const p = G.player;
  if (G.glow && G.glow.t > 0) {
    m.node = stepToward(m.node, G.glow.node);
    m.state = 'idle'; p.locked = false; return;
  }
  if (m.state === 'idle') {
    if (Math.random() < 0.01 * DIFF[G.diff].monsterRate) { m.state = 'pass'; m.node = p.node; m.timer = 3; }
  } else if (m.state === 'pass' || m.state === 'pin') {
    if (m.node === p.node) {
      if (G.effects.flare) { m.state = 'idle'; p.locked = false; return; }
      if (G.lampOn) { playerPinned(m, 'moths'); }
      else { m.state = 'idle'; p.locked = false; removeMonster(m); return; }
    }
    m.timer -= dt; if (m.timer <= 0) { m.state = 'idle'; p.locked = false; }
  }
}

function aiRampage(m, dt) {
  const p = G.player;
  if (m.state === 'idle') {
    if (Math.random() < 0.006) { m.state = 'warn'; m.timer = 6; }
  } else if (m.state === 'warn') {
    if (m.timer <= 0) { m.state = 'charge'; m.timer = 5; }
  } else if (m.state === 'charge') {
    m.node = G.nodes[Math.floor(Math.random() * G.nodes.length)].id;
    if (m.node === p.node && !p.hidden && p.node !== G.safeNode) return killPlayer(m);
    m.timer -= dt; if (m.timer <= 0) { m.state = 'idle'; removeMonster(m); }
  }
}

function aiJanitor(m, dt) {
  const p = G.player;
  if (m.state === 'idle' || m.state === 'roam') {
    m.state = 'roam';
    if (m.timer <= 0) { const nb = G.nodes[m.node].neighbors; m.node = nb[Math.floor(Math.random() * nb.length)]; m.timer = 2; }
    const d = distNodes(m.node, p.node);
    if (d <= 3 && (p.moving || p.locked)) { m.state = 'listen'; m.timer = 2.5; m.heard = p.moving; }
  } else if (m.state === 'listen') {
    m.timer -= dt;
    if (p.moving || p.locked) m.heard = true;
    if (m.heard && (p.moving || p.locked)) { m.state = 'chase'; }
    else if (m.timer <= 0) m.state = 'roam';
  } else if (m.state === 'chase') {
    if (!p.moving && !p.locked) { m.state = 'listen'; m.timer = 2; return; }
    m.node = stepToward(m.node, p.node);
    if (m.node === p.node) return killPlayer(m);
  }
}

function aiNana(m, dt) {
  const p = G.player;
  if (m.state === 'idle') {
    if (Math.random() < 0.006) { m.node = p.facing ?? p.node; m.state = 'talk'; m.timer = 4; playerPinned(m, 'nana'); }
  } else if (m.state === 'talk') {
    m.timer -= dt;
    if (m.timer <= 0) return killPlayer(m);
  }
}

function aiBurrower(m, dt) {
  const p = G.player;
  if (m.state === 'idle') {
    if (p.locked || Math.random() < 0.005) { m.node = p.node; m.state = 'crack'; m.timer = 2.2; }
  } else if (m.state === 'crack') {
    if (!p.locked && !p.moving) { m.timer -= dt; if (m.timer <= 0) return killPlayer(m); }
    else { m.state = 'idle'; removeMonster(m); }
  }
}

function aiLantern(m, dt) {
  const p = G.player;
  if (m.state === 'idle' || m.state === 'roam') {
    m.state = 'roam';
    if (m.timer <= 0) { m.node = stepToward(m.node, p.node); m.timer = 2.5; }
    if (distNodes(m.node, p.node) <= 2) {
      if (G.lampOn) { m.state = 'spare'; m.timer = 5; }
      else return killPlayer(m);
    }
  } else if (m.state === 'spare') { m.timer -= dt; if (m.timer <= 0) m.state = 'roam'; }
}

function aiTollman(m, dt) {
  // sits at a junction; paid state handled in interaction
  if (m.paid === undefined) { m.paid = false; m.shove = 0; }
  m.state = 'sit';
}

function aiForeman(m, dt) {
  const p = G.player;
  if (G.effects.smoke || p.node === G.safeNode || p.hidden) { m.state = 'idle'; return; }
  if (m.state === 'idle') m.state = 'chase';
  m.node = stepToward(m.node, p.node);
  if (m.node === p.node) return killPlayer(m);
}

// ---------- Chapter 2: The Vents ----------
function aiGrinner(m, dt) {
  const p = G.player;
  if (G.decoy && G.decoy.t > 0) { m.node = stepToward(m.node, G.decoy.node); m.state = 'roam'; return; }
  if (G.effects.smoke || p.node === G.safeNode) { m.state = 'roam'; return; }
  if (m.state === 'idle' || m.state === 'roam') {
    m.state = 'roam';
    if (m.timer <= 0) { m.node = stepToward(m.node, p.node); m.timer = 1.1 / DIFF[G.diff].speed; }
    const sight = G.lampOn ? 5 : 3;
    if (distNodes(m.node, p.node) <= sight) { m.state = 'chase'; m.timer = 0; }
  } else if (m.state === 'chase') {
    if (G.effects.smoke) { m.state = 'roam'; return; }
    m.node = stepToward(m.node, p.node);
    if (m.node === p.node) return killPlayer(m);
    if (distNodes(m.node, p.node) > (G.lampOn ? 6 : 4)) m.state = 'roam';
  }
}

function aiSweeper(m, dt) {
  const p = G.player;
  if (!m.loop) {
    m.loop = G.nodes.map(n => n.id).filter(id => G.safeDist[id] === 1);
    m.loopIdx = 0;
  }
  m.timer -= dt;
  if (m.timer <= 0) {
    m.loopIdx = (m.loopIdx + 1) % m.loop.length;
    m.node = m.loop[m.loopIdx];
    m.timer = 1.4 / DIFF[G.diff].speed;
  }
  if (m.node === p.node && !p.hidden) return killPlayer(m);
}

function aiExterminator(m, dt) {
  const p = G.player;
  if (m.state === 'idle') {
    m.timer -= dt;
    if (m.timer <= 0) {
      const cands = G.nodes.filter(n => n.id !== G.safeNode);
      m.fogNode = cands[Math.floor(Math.random() * cands.length)].id;
      m.state = 'fog'; m.timer = 4; m.dwell = 0;
    }
  } else if (m.state === 'fog') {
    if (p.node === m.fogNode && !G.effects.smoke && !G.effects.MASK) {
      m.dwell += dt;
      if (m.dwell >= 1.2) return killPlayer(m);
    } else m.dwell = 0;
    if (m.timer <= 0) { m.state = 'idle'; m.timer = 6; m.fogNode = null; }
  }
}

function aiServer(m, dt) {
  const p = G.player;
  if (m.state === 'idle') {
    m.timer -= dt;
    if (m.timer <= 0) {
      const cands = G.nodes.filter(n => n.id !== G.safeNode && n.id !== p.node);
      m.target = cands[Math.floor(Math.random() * cands.length)].id;
      m.state = 'serve'; m.timer = 8;
      promptEl.textContent = 'SERVED PAPER — reach the marked junction in time!';
    }
  } else if (m.state === 'serve') {
    if (p.node === m.target) { m.state = 'idle'; m.timer = 10; promptEl.textContent = 'Paper accepted.'; return; }
    m.timer -= dt;
    if (m.timer <= 0) return killPlayer(m);
  }
}

function aiFlesh(m, dt) {
  const p = G.player;
  if (m.state === 'idle') {
    m.timer -= dt;
    if (m.timer <= 0 && distNodes(m.node, p.node) <= 3) m.state = 'warn';
  } else if (m.state === 'warn') {
    if (m.timer <= 0) m.state = 'charge';
  } else if (m.state === 'charge') {
    m.node = stepToward(m.node, p.node);
    if (m.node === p.node && !p.hidden) return killPlayer(m);
    if (m.timer <= 0) { m.state = 'idle'; m.timer = 6; }
  }
}

function aiFaceling(m, dt) {
  const p = G.player;
  if (m.nookNode === undefined) {
    const nooks = G.nodes.filter(n => n.nook).map(n => n.id);
    m.nookNode = nooks.length ? nooks[Math.floor(Math.random() * nooks.length)] : m.node;
    m.node = m.nookNode;
  }
  if (p.hidden && p.node === m.nookNode) return killPlayer(m);
}

function aiTemp(m, dt) {
  const p = G.player;
  if (G.lampOn && distNodes(m.node, p.node) <= 2) { m.state = 'shoo'; m.timer = 4; m.node = stepToward(m.node, G.safeNode); return; }
  if (m.state === 'shoo') { m.timer -= dt; if (m.timer <= 0) m.state = 'idle'; return; }
  m.timer -= dt;
  if (m.timer <= 0) {
    const done = G.nodes.filter(n => n.job && n.job.done);
    if (done.length) {
      const j = done[0]; j.job.done = false;
      if (!G.jobs.includes(j)) G.jobs.push(j);
      promptEl.textContent = 'The Temp undid a finished job!';
    }
    m.timer = 12;
  }
}

function aiDrip(m, dt) {
  const p = G.player;
  if (m.node === p.node) {
    if (!p.moving) { m.dwell = (m.dwell || 0) + dt; if (m.dwell >= 1.5) return killPlayer(m); }
    else m.dwell = 0;
  } else m.dwell = 0;
}

function aiMother(m, dt) {
  const p = G.player;
  if (!G.shiftDone) { m.state = 'sleep'; return; }
  if (G.effects.smoke || p.node === G.safeNode || !G.lampOn) { m.state = 'idle'; return; }
  m.node = stepToward(m.node, p.node);
  if (m.node === p.node) return killPlayer(m);
}

function aiYoung(m, dt) {
  const p = G.player;
  m.timer -= dt;
  if (m.timer <= 0) {
    const nb = G.nodes[m.node].neighbors;
    m.node = nb[Math.floor(Math.random() * nb.length)]; m.timer = 2;
  }
  p.slow = m.node === p.node;
}

// ---------- Chapter 3: The Growth ----------
function aiDale(m, dt) {
  const p = G.player;
  const blinded = !G.lampOn && !G.effects.goop; // gooped: he knows where you are
  if (blinded || G.effects.smoke || p.node === G.safeNode) { m.state = 'roam'; return; }
  if (m.state !== 'chase') {
    m.timer -= dt;
    if (m.timer <= 0) { m.node = stepToward(m.node, p.node); m.timer = 1.4; }
    if (distNodes(m.node, p.node) <= 4) m.state = 'chase';
  } else {
    m.node = stepToward(m.node, p.node);
    if (m.node === p.node) return killPlayer(m);
    if (distNodes(m.node, p.node) > 6) m.state = 'roam';
  }
}

function aiMarco(m, dt) {
  const p = G.player;
  if (m.state === 'idle' || m.state === 'yell') {
    m.state = 'yell'; m.timer -= dt;
    if (m.timer <= 0) { m.lastSeen = p.node; m.state = 'charge'; m.timer = 2.5; }
  } else if (m.state === 'charge') {
    m.node = stepToward(m.node, m.lastSeen);
    if (m.node === p.node && !p.moving) return killPlayer(m);
    if (m.timer <= 0) m.state = 'idle';
  }
}

function aiGardener(m, dt) {
  const p = G.player;
  if (G.effects.smoke || p.node === G.safeNode) { m.state = 'roam'; return; }
  if (m.state !== 'chase') {
    m.timer -= dt;
    if (m.timer <= 0) { const nb = G.nodes[m.node].neighbors; m.node = nb[Math.floor(Math.random() * nb.length)]; m.timer = 2; }
    if (distNodes(m.node, p.node) <= 2) m.state = 'chase';
  } else {
    m.node = stepToward(m.node, p.node);
    if (m.node === p.node) return killPlayer(m);
    if (distNodes(m.node, p.node) > 4) m.state = 'roam';
  }
}

function aiWrongNook(m, dt) {
  const p = G.player;
  if (m.nookNode === undefined) {
    const nooks = G.nodes.filter(n => n.nook).map(n => n.id);
    m.nookNode = nooks.length ? nooks[Math.floor(Math.random() * nooks.length)] : m.node;
    m.node = m.nookNode;
  }
  if (p.hidden && p.node === m.nookNode) return killPlayer(m);
}

function aiLeeches(m, dt) {
  const p = G.player;
  if (G.effects.flare) { m.state = 'idle'; m.node = stepToward(m.node, G.safeNode); return; }
  if (m.state === 'idle') {
    m.timer -= dt;
    if (m.timer <= 0) {
      const c = G.nodes.filter(n => n.id !== G.safeNode);
      m.node = c[Math.floor(Math.random() * c.length)].id; m.timer = 5;
    }
  }
  if (m.node === p.node) { p.battery -= dt * 8; addEffect('goop', 6); }
}

function aiDeadAir(m, dt) {
  const p = G.player;
  if (!G.lampOn || G.effects.smoke) return;
  m.node = stepToward(m.node, p.node);
  if (m.node === p.node) return killPlayer(m);
}

function aiShiftChange(m, dt) {
  const p = G.player;
  if (!m.loop) { m.loop = G.nodes.map(n => n.id).filter(id => G.safeDist[id] === 1); m.loopIdx = 0; }
  m.timer -= dt;
  if (m.timer <= 0) { m.loopIdx = (m.loopIdx + 1) % m.loop.length; m.node = m.loop[m.loopIdx]; m.timer = 1.0; }
  if (m.node === p.node && !p.hidden) return killPlayer(m);
}

function aiChoir(m, dt) {
  const p = G.player;
  if (G.effects.flare) { m.timer -= dt; return; }
  if (distNodes(m.node, p.node) <= 1) { p.slow = true; p.battery -= dt * 6; }
}

function aiRandalOG(m, dt) {
  const p = G.player;
  if (G.effects.smoke || p.node === G.safeNode) { m.state = 'roam'; return; }
  m.timer -= dt;
  if (m.timer <= 0) {
    const c = G.nodes.filter(n => n.id !== G.safeNode);
    m.node = c[Math.floor(Math.random() * c.length)].id; m.timer = 4;
  }
  if (m.state !== 'chase') {
    if (distNodes(m.node, p.node) <= 4) m.state = 'chase';
  } else {
    m.node = stepToward(m.node, p.node);
    if (m.node === p.node) return freezePlayer(m);
    if (distNodes(m.node, p.node) > 6) m.state = 'roam';
  }
}

function aiTwoOfThem(m, dt) {
  const p = G.player;
  if (G.bossPhase === 'brew' || G.bossPhase === 'escape') { m.state = 'idle'; return; }
  if (G.effects.smoke || p.node === G.safeNode) { m.state = 'idle'; return; }
  // Marco half: periodic MARCO call with a 3 s POLO window.
  G.marcoTimer -= dt;
  if (G.marcoWindow > 0) {
    G.marcoWindow -= dt;
    if (G.marcoWindow <= 0) { initiateGrab(m); return; }
  } else if (G.marcoTimer <= 0) {
    G.marcoWindow = 3;
    G.marcoTimer = 15 + Math.random() * 7;
    promptEl.textContent = 'MARCO! — answer POLO (Space)';
    beep(220, 0.2, 'sawtooth', 0.16);
  }
  // Dale half: it sees the night vision / a lit flare down the hall.
  if (G.lampOn || G.effects.flare) m.node = stepToward(m.node, p.node);
  if (m.node === p.node) initiateGrab(m);
}

// ---------- Two of Them: grab / splash ----------
let grab = null;
let grabTimer = null;

function initiateGrab(m) {
  if (G.state !== 'playing' || grab) return;
  if (!G.jar) return killPlayer(m);
  G.state = 'modal';
  G.player.locked = true;
  grab = { pos: 0.5, band: Math.max(0.14, 0.28 - G.splashes * 0.05), dir: 1, boss: m };
  renderGrab();
  grabTimer = setInterval(() => {
    if (!grab) return;
    grab.pos += grab.dir * 0.016;
    if (grab.pos >= 1) { grab.pos = 1; grab.dir = -1; }
    if (grab.pos <= 0) { grab.pos = 0; grab.dir = 1; }
    const el = document.querySelector('#grab-needle');
    if (el) el.style.top = (grab.pos * 100) + '%';
  }, 30);
}

function renderGrab() {
  const bandTop = 0.5 - grab.band / 2;
  modalBox.innerHTML = `
    <h2>THE TWO OF THEM</h2>
    <p style="color:var(--muted)">Both faces fill the screen — hit the green to splash the cure · splash ${G.splashes}/3</p>
    <div class="needle-wrap">
      <div class="needle-track"></div>
      <div class="needle-green" style="top:${bandTop * 100}%; height:${grab.band * 100}%"></div>
      <div class="needle" id="grab-needle" style="top:${grab.pos * 100}%"></div>
    </div>
    <button id="grab-btn">Splash it (Space)</button>`;
  $('grab-btn').onclick = hitGrab;
}

function hitGrab() {
  if (!grab) return;
  const inGreen = grab.pos >= 0.5 - grab.band / 2 && grab.pos <= 0.5 + grab.band / 2;
  if (!inGreen) { closeGrab(); return killPlayer(grab.boss); }
  G.splashes++;
  G.jar = false;
  const boss = grab.boss;
  closeGrab();
  boss.node = farNodeFrom(G.player.node);
  beep(760, 0.18, 'triangle', 0.16);
  if (G.splashes >= 3) { startEscape(); return; }
  promptEl.textContent = `Splash ${G.splashes}/3! It staggers off — back to the cauldron for another jar.`;
  updateBossBar();
}

function closeGrab() {
  if (grabTimer) { clearInterval(grabTimer); grabTimer = null; }
  grab = null;
  modal.classList.add('hidden');
  G.state = 'playing';
  G.player.locked = false;
}

function startEscape() {
  G.bossPhase = 'escape';
  for (const m of [...G.monsters]) removeMonster(m);
  G.escapeAt = 50;
  showNightCard('THEY COME APART', '50 seconds to get back to the safe room!');
  promptEl.textContent = 'They fell apart — run home!';
  updateBossBar();
}

function finaleWin() {
  G.state = 'card';
  for (const m of [...G.monsters]) removeMonster(m);
  showNightCard('CHAPTER 3 CLEAR', 'You made it home. (Prototype ends here.)');
}

function removeMonster(m) {
  scene.remove(m.mesh);
  G.monsters = G.monsters.filter(x => x !== m);
}

// ---------- Spawn scheduling ----------
let spawnClock = 0;
let proxTimer = 0;
function scheduleMonsters(dt) {
  spawnClock -= dt;
  if (spawnClock > 0) return;
  const roster = nightTable()[G.night - 1].roster;
  const active = new Set(G.monsters.map(m => m.kind));
  const missing = roster.filter(k => !active.has(k));
  const jobsDone = (G.jobTotal || 0) - G.jobs.length;
  const maxOut = Math.max(1, Math.min(roster.length, (G.night >= 3 ? 2 : 1) + Math.floor(jobsDone / 2)) - 1);
  if (!missing.length) { spawnClock = 6; return; }
  if (G.monsters.length < maxOut) {
    spawnMonster(missing[Math.floor(Math.random() * missing.length)]);
    spawnClock = Math.max(4, 12 - jobsDone * 1.5) * 1.15 / DIFF[G.diff].monsterRate;
  } else spawnClock = 4;
}

// ---------- Jobs ----------
function nearestInteractable() {
  const p = G.player;
  if (p.node === G.safeNode) return { kind: 'shop' };
  if (p.node === G.cageNode) return { kind: 'cage' };
  const toll = G.monsters.find(x => x.kind === 'tollman' && !x.paid &&
    (x.node === p.node || x.node === p.facing));
  if (toll) return { kind: 'toll', toll };
  const n = G.nodes[p.node];
  if (n.job && !n.job.done) return { kind: 'job', node: n };
  if (n.portal) return { kind: 'portal', node: n };
  if (n.nook) return { kind: 'nook' };
  return null;
}

function openShop() {
  G.state = 'modal';
  const rows = Object.entries(ITEMS).map(([id, it]) => `
    <div class="shop-item">
      <div><strong>${it.name}</strong><br><span style="color:var(--muted);font-size:12px">${it.desc}</span></div>
      <button data-buy="${id}" ${G.caps < it.price || G.pockets.length >= 4 ? 'disabled' : ''}>${it.price} caps</button>
    </div>`).join('');
  modalBox.innerHTML = `<h2>Vending Machine</h2><p style="color:var(--muted)">You have ${G.caps} caps · ${G.pockets.length}/4 pockets</p>${rows}<button id="close-modal" style="margin-top:14px">Leave</button>`;
  modalBox.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => buyItem(b.dataset.buy));
  $('close-modal').onclick = closeModal;
  modal.classList.remove('hidden');
}

function buyItem(id) {
  const it = ITEMS[id];
  if (G.caps < it.price || G.pockets.length >= 4) return;
  G.caps -= it.price; G.pockets.push(id);
  renderPockets(); openShop();
}

const VENDING_NAMES = { 1: 'PIPE-MART', 2: 'VENT-O-MAT', 3: 'SAP STOP' };

function openSafeRoom() {
  G.state = 'modal';
  const s = G.cureCarry === 1 ? '' : 's';
  const flareReady = performance.now() >= (G.flareReadyAt || 0);
  const rows = [];
  rows.push(`<button id="sr-shop">Vending Machine · ${VENDING_NAMES[G.chapter] || 'PIPE-MART'}</button>`);
  rows.push(`<button id="sr-guide">Radio & How-to Guide</button>`);
  if (G.chapter === 3 && G.cureCarry > 0) {
    rows.push(`<button id="sr-cauldron">Cauldron — deposit ${G.cureCarry} ingredient${s}</button>`);
  }
  if (isFinale() && G.bossPhase === 'fight') {
    if (G.jar) rows.push(`<button id="sr-jar" disabled>Holding a cure jar</button>`);
    else if (G.time < G.jarReadyAt) rows.push(`<button id="sr-jar" disabled>Cauldron refilling…</button>`);
    else rows.push(`<button id="sr-jar">Take a cure jar</button>`);
  }
  if (G.bossNight) {
    rows.push(`<button id="sr-flare" ${flareReady ? '' : 'disabled'}>Flare box — ${flareReady ? 'take a flare' : 'ready soon'}</button>`);
  }
  if (G.effects.goop > 0) {
    rows.push(`<button id="sr-wash">Wash barrel — scrub off the goop</button>`);
  }
  if (G.mapTaken) {
    rows.push(`<button id="sr-mappile">Map pile — take a fresh map</button>`);
  }
  modalBox.innerHTML = `<h2>Safe Room</h2>
    <p style="color:var(--muted)">You are safe here. Nothing gets in. Your lamp charges and you warm up.</p>
    <div class="sr-rows">${rows.join('')}</div>
    <button id="close-modal" style="margin-top:14px">Leave</button>`;
  const shopBtn = $('sr-shop'); if (shopBtn) shopBtn.onclick = openShop;
  const guideBtn = $('sr-guide'); if (guideBtn) guideBtn.onclick = openGuide;
  const cauldronBtn = $('sr-cauldron'); if (cauldronBtn) cauldronBtn.onclick = depositCure;
  const flareBtn = $('sr-flare'); if (flareBtn) flareBtn.onclick = takeFlareBox;
  const jarBtn = $('sr-jar'); if (jarBtn) jarBtn.onclick = takeJar;
  const washBtn = $('sr-wash'); if (washBtn) washBtn.onclick = washGoop;
  const mapBtn = $('sr-mappile'); if (mapBtn) mapBtn.onclick = () => { G.mapTaken = false; promptEl.textContent = 'You grab a fresh paper map from the pile.'; closeModal(); };
  $('close-modal').onclick = closeModal;
  modal.classList.remove('hidden');
}

function depositCure() {
  if (G.cureCarry <= 0) return;
  G.cureDeposited += G.cureCarry; G.cureCarry = 0;
  promptEl.textContent = 'Ingredient into the cauldron.';
  beep(520, 0.12, 'triangle', 0.14);
  if (G.chapter === 3 && G.night === 10 && G.cureDeposited >= G.jobTotal) wakeBoss();
  else openSafeRoom();
}

// Ch3 Night 10 finale: cure brewed → The Two of Them wakes.
function isFinale() { return G.chapter === 3 && G.night === 10; }

function wakeBoss() {
  G.bossPhase = 'fight';
  for (const m of [...G.monsters]) removeMonster(m);
  spawnMonster('twoofthem');
  const boss = G.monsters.find(m => m.kind === 'twoofthem');
  if (boss) boss.node = farNodeFrom(G.safeNode);
  G.marcoTimer = 16;
  showNightCard('THE TWO OF THEM', 'The cure is brewed. Grab a jar from the cauldron.');
  beep(180, 0.5, 'sawtooth', 0.2);
  updateBossBar();
  openSafeRoom();
}

function farNodeFrom(nodeId) {
  let best = G.safeNode, bd = -1;
  for (const n of G.nodes) {
    if (n.id === nodeId) continue;
    const d = G.safeDist[n.id] ?? 0;
    if (d > bd) { bd = d; best = n.id; }
  }
  return best;
}

function takeJar() {
  if (G.jar || G.time < G.jarReadyAt) return;
  G.jar = true;
  G.jarReadyAt = G.time + 8;
  promptEl.textContent = 'Cure jar in hand. Let it grab you, then splash the green.';
  beep(620, 0.1, 'triangle', 0.12);
  openSafeRoom();
}

function washGoop() {
  delete G.effects.goop;
  promptEl.textContent = 'Scrubbed clean at the wash barrel.';
  beep(480, 0.12, 'triangle', 0.12);
  openSafeRoom();
}

function updateBossBar() {
  const el = bossKeysEl;
  if (G.bossPhase === 'fight') {
    const seg = '◼'.repeat(3 - G.splashes) + '◻'.repeat(G.splashes);
    el.textContent = `TWO OF THEM  ${seg}`;
    el.classList.remove('hidden');
  } else if (G.bossPhase === 'escape') {
    el.textContent = `GET HOME  ${Math.max(0, Math.ceil(G.escapeAt))}s`;
    el.classList.remove('hidden');
  } else if (G.bossNight) {
    el.textContent = `KEYS ${G.keysHeld} · LOCKS ${G.locks}`;
    el.classList.remove('hidden');
  } else {
    el.classList.add('hidden');
  }
}

function takeFlareBox() {
  if (performance.now() < (G.flareReadyAt || 0)) return;
  if (G.pockets.length >= 4) { promptEl.textContent = 'Pockets are full.'; return; }
  G.pockets.push('flare');
  G.flareReadyAt = performance.now() + 20000;
  renderPockets();
  beep(600, 0.1, 'triangle', 0.12);
  openSafeRoom();
}

const BESTIARY = {
  1: ['maw', 'randal', 'drooler', 'moths', 'rampage', 'janitor', 'nana', 'burrower', 'lantern', 'tollman', 'foreman'],
  2: ['grinner', 'sweeper', 'exterminator', 'server', 'flesh', 'faceling', 'temp', 'drip', 'mother', 'young'],
  3: ['dale', 'marco', 'gardener', 'wrongnook', 'leeches', 'deadair', 'shiftchange', 'choir', 'randalog', 'twoofthem'],
};

function openGuide() {
  G.state = 'modal';
  const groups = [1, 2, 3].map(ch => `
    <div class="best-group">
      <div class="best-title">Chapter ${ch}</div>
      ${BESTIARY[ch].map(k => `
        <div class="best-entry"><strong>${MON_DEFS[k].name}</strong><span>${journalHint(k)}</span></div>`).join('')}
    </div>`).join('');
  modalBox.innerHTML = `<h2>How to Guide</h2>
    <div class="guide-col">
      <p><strong>Crawl:</strong> W/Up ahead · A/D turn · S back. F lamp · M map · E interact · 1–4 items.</p>
      <p><strong>Vitals:</strong> Lamp battery drains when lit; warmth drops in the cold. Both recover fast in the safe room.</p>
      <p><strong>Shift:</strong> Finish every job, get back here and clock out. In Chapter 3, carry ingredients to the cauldron before you leave.</p>
      <p><strong>Items:</strong> Cola charges the lamp · Warmer restores warmth · Energy speeds you · Flare keeps things away · Smoke hides you.</p>
    </div>
    <div class="guide-best">${groups}</div>
    <button id="close-modal" style="margin-top:14px">Back to the room</button>`;
  $('close-modal').onclick = closeModal;
}

// Pressure mini-game state
let pressure = null, pressureTimer = null;

function pickLeak(g) {
  const open = g.slots.map((s, i) => s === 0 ? i : -1).filter(i => i >= 0);
  g.active = open.length ? open[Math.floor(Math.random() * open.length)] : -1;
}

function openJob(node) {
  if (G.chapter === 3 && !G.lampOn) { promptEl.textContent = 'Too dark to work — turn your night vision on (F).'; return; }
  G.state = 'modal';
  const type = node.job.type || 'pressure';
  const NEED = { pressure: 4, valve: 3, leaks: 3, bleed: 2, weld: 4, wires: 3 };
  const need = NEED[type] ?? 3;
  const wireRight = type === 'wires' ? [0, 1, 2].sort(() => Math.random() - 0.5) : null;
  pressure = { type, hits: 0, need, pos: 0.5, dir: 1, band: 0.30, node,
    slots: type === 'leaks' ? [0, 0, 0] : null, active: -1,
    weld: type === 'weld' ? [0, 0, 0, 0] : null, weldIdx: 0,
    wireLeft: type === 'wires' ? [0, 1, 2] : null, wireRight, wireSel: -1, wireDone: [] };
  if (type === 'leaks') pickLeak(pressure);
  renderJob();
  modal.classList.remove('hidden');
  clearInterval(pressureTimer);
  pressureTimer = setInterval(() => {
    if (!pressure || ['leaks', 'weld', 'wires'].includes(pressure.type)) return;
    pressure.pos += pressure.dir * 0.012;
    if (pressure.pos >= 1) { pressure.pos = 1; pressure.dir = -1; }
    if (pressure.pos <= 0) { pressure.pos = 0; pressure.dir = 1; }
    const el = document.querySelector('.needle');
    if (el) {
      if (pressure.type === 'valve') el.style.left = (pressure.pos * 100) + '%';
      else el.style.top = (pressure.pos * 100) + '%';
    }
  }, 30);
}

function finishJob(g) {
  g.node.job.done = true;
  G.jobs = G.jobs.filter(n => n !== g.node);
  if (G.chapter === 3) G.cureCarry++; // ingredient to carry back to the cauldron
  closeModal();
  checkNightProgress();
  beep(660, 0.12, 'triangle', 0.14);
  setTimeout(() => beep(880, 0.16, 'triangle', 0.14), 120);
}

const WIRE_COL = ['#e06c5f', '#6fa8e0', '#e8c15a'];

// Chapter-specific task names mapped onto the shared mini-game mechanics.
const DISPLAY = {
  2: {
    valve:   { t: 'Filter',    l: 'Pull the dirty filter, slide the clean one in, latch it' },
    pressure:{ t: 'Fan',       l: 'Tap the stalled fan up to speed, keep the needle in the green' },
    weld:    { t: 'Tape',      l: 'Drag along each whistling split to tape it' },
    leaks:   { t: 'Grille',    l: 'Drag all the junk out of the grille' },
    bleed:   { t: 'Panel',     l: 'Unscrew the screws, lift the panel, flip the breaker' },
  },
  3: {
    bleed: { t: 'Sap Pod',     l: 'Jam the spigot, drain the sap, stop in the green' },
    weld:  { t: 'Bound Bloom', l: 'Slash every vine, drop the bloom in the jar' },
    leaks: { t: 'Spore Pod',   l: 'Catch the glowing spores as they float up' },
  },
};

function renderJob() {
  const g = pressure;
  const d = (DISPLAY[G.chapter] || {})[g.type];
  if (g.type === 'wires') {
    const side = (arr, side) => arr.map((c, i) => {
      const connected = side === 'L' ? g.wireDone.includes(i) : g.wireDone.includes(g.wireLeft.indexOf(c));
      const sel = side === 'L' && g.wireSel === i;
      return `<button class="wire-btn ${connected ? 'done' : ''} ${sel ? 'sel' : ''}" data-side="${side}" data-i="${i}">
        <span class="wire-dot" style="background:${WIRE_COL[c]}"></span>${connected ? 'OK' : side + (i + 1)}
      </button>`;
    }).join('');
    modalBox.innerHTML = `
      <h2>Junction Box</h2>
      <p style="color:var(--muted)">Match each coloured wire · ${g.hits}/${g.need}</p>
      <div class="wire-row"><div class="wire-col">${side(g.wireLeft, 'L')}</div>
      <div class="wire-col">${side(g.wireRight, 'R')}</div></div>
      <button id="close-job">Walk away</button>`;
    modalBox.querySelectorAll('[data-side]').forEach(b =>
      b.onclick = () => wirePick(b.dataset.side, Number(b.dataset.i)));
    $('close-job').onclick = closeModal;
    return;
  }
  if (g.type === 'weld') {
    const segs = g.weld.map((s, i) => `
      <button class="weld-seg ${s ? 'done' : ''} ${i === g.weldIdx ? 'hot' : ''}" data-seg="${i}">
        ${s ? 'WELDED' : i === g.weldIdx ? '●' : '—'}
      </button>`).join('');
    modalBox.innerHTML = `
      <h2>${d?.t || 'Weld Seam'}</h2>
      <p style="color:var(--muted)">${d?.l || 'Follow the crack, weld each segment in order'} · ${g.hits}/${g.need}</p>
      <div class="weld-row">${segs}</div>
      <button id="close-job">Walk away</button>`;
    modalBox.querySelectorAll('[data-seg]').forEach(b =>
      b.onclick = () => weldSeg(Number(b.dataset.seg)));
    $('close-job').onclick = closeModal;
    return;
  }
  if (g.type === 'leaks') {
    const slots = g.slots.map((s, i) => `
      <button class="leak-slot ${s ? 'clamped' : ''} ${i === g.active ? 'spurting' : ''}" data-slot="${i}">
        ${s ? 'CLAMPED' : i === g.active ? 'SPURTING' : '—'}
      </button>`).join('');
    modalBox.innerHTML = `
      <h2>${d?.t || 'Leaks'}</h2>
      <p style="color:var(--muted)">${d?.l || 'Clamp each leak as it spurts'} · ${g.hits}/${g.need}</p>
      <div class="leak-row">${slots}</div>
      <button id="close-job">Walk away</button>`;
    modalBox.querySelectorAll('[data-slot]').forEach(b =>
      b.onclick = () => clampLeak(Number(b.dataset.slot)));
    $('close-job').onclick = closeModal;
    return;
  }
  const TITLES = { valve: 'Valve Wheel', bleed: 'Bleed Valve', pressure: 'Pressure Gauge' };
  const title = d?.t || TITLES[g.type] || 'Pressure Gauge';
  const bandTop = 0.5 - g.band / 2;
  const wrapCls = g.type === 'valve' ? 'needle-wrap h' : 'needle-wrap';
  const green = g.type === 'valve'
    ? `left:${bandTop * 100}%; width:${g.band * 100}%`
    : `top:${bandTop * 100}%; height:${g.band * 100}%`;
  const needlePos = g.type === 'valve'
    ? `left:${g.pos * 100}%` : `top:${g.pos * 100}%`;
  const LABELS = { valve: 'Spin the wheel into the green', bleed: 'Close the screw the moment water comes', pressure: 'Stop the needle in the green' };
  const label = d?.l || LABELS[g.type];
  const BTNS = { valve: 'Turn wheel (Space)', bleed: 'Close screw (Space)', pressure: 'Stop needle (Space)' };
  modalBox.innerHTML = `
    <h2>${title}</h2>
    <p style="color:var(--muted)">${label} · hit ${g.hits}/${g.need}</p>
    <div class="${wrapCls}">
      <div class="needle-track"></div>
      <div class="needle-green" style="${green}"></div>
      <div class="needle" style="${needlePos}"></div>
    </div>
    <button id="hit-btn">${BTNS[g.type]}</button>
    <button id="close-job">Walk away</button>`;
  $('hit-btn').onclick = hitNeedle;
  $('close-job').onclick = closeModal;
}

function clampLeak(i) {
  const g = pressure;
  if (!g || g.type !== 'leaks') return;
  if (i !== g.active) return;
  g.slots[i] = 1; g.hits++;
  if (g.hits >= g.need) return finishJob(g);
  pickLeak(g); renderJob();
}

function wirePick(side, i) {
  const g = pressure;
  if (!g || g.type !== 'wires') return;
  if (side === 'L') { g.wireSel = i; renderJob(); return; }
  if (g.wireSel < 0) return;
  const match = g.wireRight[i] === g.wireLeft[g.wireSel] && !g.wireDone.includes(g.wireSel);
  if (match) {
    g.wireDone.push(g.wireSel); g.hits++; g.wireSel = -1;
    if (g.hits >= g.need) return finishJob(g);
  } else g.wireSel = -1;
  renderJob();
}

function weldSeg(i) {
  const g = pressure;
  if (!g || g.type !== 'weld') return;
  if (i !== g.weldIdx) return;
  g.weld[i] = 1; g.weldIdx++; g.hits++;
  if (g.hits >= g.need) return finishJob(g);
  renderJob();
}

function hitNeedle() {
  const g = pressure;
  if (!g) return;
  if (g.type === 'leaks') { clampLeak(g.active); return; }
  if (g.type === 'weld') { weldSeg(g.weldIdx); return; }
  const inGreen = g.pos >= 0.5 - g.band / 2 && g.pos <= 0.5 + g.band / 2;
  if (inGreen) {
    g.hits++; g.band = Math.max(0.12, g.band - 0.05);
    if (g.hits >= g.need) return finishJob(g);
  } else { g.hits = 0; g.band = 0.30; }
  renderJob();
}

function closeModal() {
  modal.classList.add('hidden');
  G.state = 'playing';
  G.player.locked = false;
  pressure = null;
  clearInterval(pressureTimer); pressureTimer = null;
}

// ---------- Night flow ----------
function startNight() {
  buildMap();
  buildWorld3D();
  resetPlayer();
  placePlayerCamera();
  renderPockets();
  G.started = false;
  G.state = 'playing';
  hud.classList.remove('hidden');
  const featured = MON_DEFS[nightTable()[G.night - 1].roster[0]]?.name ?? '';
  showNightCard(`Night ${G.night}`, featured ? `Featured: ${featured}` : objectiveText());
}

function objectiveText() {
  if (!G.started) return 'Clock in at the safe room (E)';
  if (G.bossNight) {
    if (G.locks <= 0) return 'Randal is free';
    if (G.keysHeld > 0) return `Unlock the cage · ${G.keysHeld} key${G.keysHeld === 1 ? '' : 's'} held, ${G.locks} lock${G.locks === 1 ? '' : 's'} left`;
    return `Find ${G.locks} cage keys, then free Randal`;
  }
  if (isFinale()) {
    if (G.bossPhase === 'fight') return G.jar ? 'Hold the jar — let it grab you, splash the green' : 'Grab a cure jar from the cauldron';
    if (G.bossPhase === 'escape') return `Get home in ${Math.max(0, Math.ceil(G.escapeAt))}s`;
    return 'Brew the cure — bring every ingredient to the cauldron';
  }
  if (!G.shiftDone) return `Finish ${G.jobs.length} job${G.jobs.length === 1 ? '' : 's'}`;
  if (G.chapter === 3 && G.cureCarry > 0) return `Carry ${G.cureCarry} ingredient${G.cureCarry === 1 ? '' : 's'} to the cauldron`;
  return 'All jobs done — get back to the safe room';
}

function checkNightProgress() {
  if (G.jobs.length === 0) G.shiftDone = true;
  updateObjective();
}

function updateObjective() { objectiveEl.textContent = objectiveText(); }

function showNightCard(title, sub) {
  nightCard.innerHTML = `<h1>${title}</h1><p>${sub}</p>`;
  nightCard.classList.remove('hidden');
  setTimeout(() => nightCard.classList.add('hidden'), 2600);
}

function bossWin() {
  for (const m of G.monsters) scene.remove(m.mesh);
  G.monsters = [];
  [440, 554, 659, 880].forEach((f, i) => setTimeout(() => beep(f, 0.2, 'triangle', 0.14), i * 140));
  // Chapter 1 finale cleared → carry over to Chapter 2: The Vents
  G.chapter = 2; G.night = 1;
  startNight();
}

function clockOut() {
  if (isFinale()) return; // finale resolves through the boss fight / escape timer
  if (!G.shiftDone) return;
  if (G.chapter === 3 && G.cureCarry > 0) {
    promptEl.textContent = 'Bring the ingredient to the cauldron in the safe room.';
    return;
  }
  G.night++;
  const tbl = nightTable();
  if (G.night > tbl.length) {
    if (G.chapter < 3) { G.chapter++; G.night = 1; startNight(); return; }
    G.state = 'card';
    showNightCard('CHAPTER 3 CLEAR', 'You made it home. (Prototype ends here.)');
    return;
  }
  startNight();
}

// ---------- Interaction key ----------
function interact() {
  const p = G.player;
  if (G.state !== 'playing') return;
  if (p.reason === 'nana') { // hug takes priority
    p.locked = false; p.reason = null;
    const m = G.monsters.find(x => x.kind === 'nana');
    if (m) removeMonster(m);
    p.warmth = Math.min(100, p.warmth + 30);
    p.battery = Math.min(DIFF[G.diff].battery, p.battery + 20);
    return;
  }
  const it = nearestInteractable();
  if (!it) return;
  if (!G.started) {
    G.started = true; updateObjective();
    if (it.kind === 'shop') openSafeRoom();
    return;
  }
  if (it.kind === 'shop') {
    G.shiftDone ? clockOut() : openSafeRoom();
  }
  else if (it.kind === 'cage') {
    if (G.keysHeld > 0) {
      G.keysHeld--; G.locks--;
      if (G.locks <= 0) { bossWin(); return; }
      promptEl.textContent = `Lock off · ${G.locks} lock${G.locks === 1 ? '' : 's'} left`;
    } else promptEl.textContent = 'Locked. FIND A KEY.';
  }
  else if (it.kind === 'toll') {
    if (G.caps >= 3) {
      G.caps -= 3; it.toll.paid = true; removeMonster(it.toll);
      promptEl.textContent = 'FARE PAID';
    } else promptEl.textContent = 'Not enough caps for the toll.';
  }
  else if (it.kind === 'job') openJob(it.node);
  else if (it.kind === 'portal') {
    const twin = G.portals.find(id => id !== it.node.id);
    if (twin != null) {
      p.node = twin; p.moving = null; p.hidden = false;
      p.facing = G.nodes[twin].neighbors[0] ?? null;
      p.lookYaw = 0; p.lookPitch = 0;
      promptEl.textContent = 'You crawl out of the twin portal, across the Growth.';
    }
  }
  else if (it.kind === 'nook') { p.hidden = !p.hidden; promptEl.textContent = p.hidden ? 'Hidden in the nook' : ''; }
}

// ---------- Input ----------
addEventListener('keydown', (e) => {
  G.keys[e.code] = true;
  if (G.state === 'modal' && e.code === 'Space') {
    e.preventDefault();
    if (grab) hitGrab(); else if (pressure) hitNeedle();
    return;
  }
  if (G.state !== 'playing') return;
  if (G.frozen && (e.code === 'Space' || e.code === 'KeyE')) { smashPod(); return; }
  if (G.behind && e.code === 'Space') { struggleBehind(); return; }
  if (e.code === 'Space' && G.marcoWindow > 0) {
    G.marcoWindow = 0;
    promptEl.textContent = 'POLO! It heard you — move away from here.';
    return;
  }
  switch (e.code) {
    case 'KeyW': case 'ArrowUp': { if (G.player.facing != null) startCrawl(G.player.facing); break; }
    case 'KeyS': case 'ArrowDown': { const nb = G.nodes[G.player.node].neighbors; const back = nb.find(n => n !== G.player.facing) ?? G.player.facing; if (back != null) startCrawl(back, true); break; }
    case 'KeyA': case 'ArrowLeft': rotate(-1); break;
    case 'KeyD': case 'ArrowRight': rotate(1); break;
    case 'KeyF': toggleLamp(); break;
    case 'KeyM': toggleMap(); break;
    case 'KeyE': interact(); break;
    case 'Digit1': useItem(0); break;
    case 'Digit2': useItem(1); break;
    case 'Digit3': useItem(2); break;
    case 'Digit4': useItem(3); break;
  }
});
addEventListener('keyup', (e) => { G.keys[e.code] = false; });

// Free-look: drag the view to turn the camera (mouse or touch)
let lookDrag = null;
addEventListener('pointerdown', (e) => {
  if (G.state !== 'playing' || !G.player) return;
  if (e.target.closest('button, select, input, .tbtn, #modal, #map')) return;
  lookDrag = { x: e.clientX, y: e.clientY };
});
addEventListener('pointermove', (e) => {
  if (!lookDrag || !G.player) return;
  const dx = e.clientX - lookDrag.x, dy = e.clientY - lookDrag.y;
  lookDrag.x = e.clientX; lookDrag.y = e.clientY;
  G.player.lookYaw += dx * 0.004;
  G.player.lookPitch = Math.max(-0.6, Math.min(0.6, G.player.lookPitch + dy * 0.004));
});
addEventListener('pointerup', () => { lookDrag = null; });
addEventListener('pointercancel', () => { lookDrag = null; });

function toggleLamp() {
  const p = G.player;
  if (p.battery <= 0) return;
  G.lampOn = !G.lampOn;
  lampLight.visible = lampGlow.visible = G.lampOn;
  beep(G.lampOn ? 700 : 320, 0.06, 'square', 0.08);
}

function toggleMap() {
  if (G.mapTaken) { promptEl.textContent = 'Your map was snatched. Unfold an extra map to get it back.'; return; }
  G.mapUp = !G.mapUp;
  mapEl.classList.toggle('hidden', !G.mapUp);
  if (G.mapUp) drawMap();
}

// ---------- Map overlay ----------
// ---------- Paper map ----------
// Drawn the way the wiki describes it: ink lines on paper, a red arrow for you,
// lettered job badges, and the monsters that are actually "on your map".
const MINK = '#33302a';
const MRED = '#b3372c';
const MORANGE = '#c8752a';
const MGREEN = '#437a3c';
const MPURPLE = '#6b3f8a';
const MBROWN = '#7a5a32';
const MGREY = '#6f6c66';

const JOB_LETTERS = {
  1: { wires: 'W', valve: 'V', pressure: 'G', leaks: 'L', bleed: 'B', weld: 'S' },
  2: { valve: 'F', pressure: 'R', weld: 'T', leaks: 'J', bleed: 'P' },
  3: { bleed: 'A', weld: 'N', leaks: 'H' },
};

function scribbleFace(x, y, col) {
  // a hand-scrawled monster face: circle, cross eyes, zigzag grin
  return `<circle cx="${x}" cy="${y}" r="7" fill="none" stroke="${col}" stroke-width="1.6"/>`
    + `<path d="M${x - 4},${y - 3} l3,3 M${x - 1},${y - 3} l-3,3" stroke="${col}" stroke-width="1.2" fill="none"/>`
    + `<path d="M${x + 1},${y - 3} l3,3 M${x + 4},${y - 3} l-3,3" stroke="${col}" stroke-width="1.2" fill="none"/>`
    + `<path d="M${x - 4},${y + 3} l2,-2 l2,2 l2,-2 l2,2" stroke="${col}" stroke-width="1.2" fill="none"/>`;
}

function drawMap() {
  const p = G.player;
  const xs = G.nodes.map(n => n.x), zs = G.nodes.map(n => n.z);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minZ = Math.min(...zs), maxZ = Math.max(...zs);
  const padL = 26, padR = 26, padT = 30, padB = 66;
  const sx = (x) => padL + (x - minX) / ((maxX - minX) || 1) * (300 - padL - padR);
  const sz = (z) => padT + (z - minZ) / ((maxZ - minZ) || 1) * (300 - padT - padB);

  // pixel length of one crawl, used to scale the threat rings
  let edgeSum = 0;
  for (const [a, b] of G.edges) edgeSum += Math.hypot(sx(G.nodes[a].x) - sx(G.nodes[b].x), sz(G.nodes[a].z) - sz(G.nodes[b].z));
  const crawlPx = Math.max(3, edgeSum / Math.max(1, G.edges.length));
  const ring = (n) => Math.min(crawlPx * n, 112);

  // a wrong nook is not on anybody's map
  const fakeNooks = G.monsters.filter(m => m.kind === 'wrongnook').map(m => m.nookNode).filter(v => v != null);

  let svg = `<svg viewBox="0 0 300 300">`;
  svg += `<defs><clipPath id="plotclip"><rect x="${padL - 6}" y="${padT - 6}" width="${300 - padL - padR + 12}" height="${300 - padT - padB + 12}"/></clipPath></defs>`;
  // title, hand written in the margin
  const cap = G.chapter === 2 ? 'VENT CONTRACT' : G.chapter === 3 ? 'THE GROWTH' : 'PIPE CO.';
  svg += `<text x="26" y="18" font-size="9" fill="${MINK}" opacity="0.75">${cap} · N${G.night}</text>`;
  svg += `<line x1="24" y1="22" x2="276" y2="22" stroke="${MINK}" stroke-width="0.6" opacity="0.35"/>`;

  // pipes, drawn twice with a tiny offset so they read as pencil
  for (const [a, b] of G.edges) {
    const x1 = sx(G.nodes[a].x), y1 = sz(G.nodes[a].z), x2 = sx(G.nodes[b].x), y2 = sz(G.nodes[b].z);
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${MINK}" stroke-width="2.6" opacity="0.12"/>`;
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${MINK}" stroke-width="1.1" opacity="0.8"/>`;
  }

  // threat overlays first, so the pipes and badges sit on top
  svg += `<g clip-path="url(#plotclip)">`;
  for (const m of G.monsters) {
    const x = sx(G.nodes[m.node].x), y = sz(G.nodes[m.node].z);
    if (m.kind === 'janitor') {
      svg += `<circle cx="${x}" cy="${y}" r="${ring(3)}" fill="none" stroke="${MBROWN}" stroke-width="1" stroke-dasharray="3 3" opacity="0.75"/>`;
    } else if (m.kind === 'gardener') {
      svg += `<circle cx="${x}" cy="${y}" r="${ring(2)}" fill="none" stroke="${MGREEN}" stroke-width="1" opacity="0.55"/>`;
    } else if (m.kind === 'choir') {
      svg += `<circle cx="${x}" cy="${y}" r="${ring(1)}" fill="none" stroke="${MGREEN}" stroke-width="1" stroke-dasharray="2 2" opacity="0.6"/>`;
    } else if (m.kind === 'flesh') {
      const tx = sx(G.nodes[p.node].x), ty = sz(G.nodes[p.node].z);
      svg += `<line x1="${x}" y1="${y}" x2="${tx}" y2="${ty}" stroke="${MRED}" stroke-width="1.4" stroke-dasharray="6 4" opacity="0.85"/>`;
    } else if (m.kind === 'sweeper' && m.loop) {
      let d = '';
      m.loop.forEach((id, i) => { d += (i ? ' L' : 'M') + sx(G.nodes[id].x) + ',' + sz(G.nodes[id].z); });
      svg += `<path d="${d} Z" fill="none" stroke="${MORANGE}" stroke-width="3" opacity="0.25"/>`;
      svg += `<path d="${d} Z" fill="none" stroke="${MORANGE}" stroke-width="1.2" opacity="0.9"/>`;
    }
  }
  svg += `</g>`;

  // nodes
  for (const n of G.nodes) {
    const x = sx(n.x), y = sz(n.z);
    const jobOpen = n.job && !n.job.done;
    if (n.id === G.safeNode) {
      svg += `<rect x="${x - 7}" y="${y - 7}" width="14" height="14" fill="none" stroke="${MINK}" stroke-width="1.8"/>`;
      svg += `<rect x="${x - 1.6}" y="${y - 1.6}" width="3.2" height="3.2" fill="${MINK}"/>`;
      svg += `<text x="${x}" y="${y - 11}" font-size="7.5" fill="${MINK}" text-anchor="middle">HOME</text>`;
      svg += `<text x="${x}" y="${y + 17}" font-size="6" fill="${MGREY}" text-anchor="middle">safe room</text>`;
    } else if (n.cage) {
      svg += `<rect x="${x - 7}" y="${y - 7}" width="14" height="14" fill="none" stroke="${MRED}" stroke-width="1.6"/>`;
      for (let k = 0; k < Math.max(0, G.locks); k++) svg += `<circle cx="${x - 4 + k * 4}" cy="${y - 9}" r="1.4" fill="${MRED}"/>`;
    } else if (jobOpen) {
      const L = (JOB_LETTERS[G.chapter] || JOB_LETTERS[1])[n.job.type] || '?';
      svg += `<rect x="${x - 6.5}" y="${y - 5.5}" width="13" height="11" rx="1.5" fill="#efe3c4" stroke="${MORANGE}" stroke-width="1.2"/>`;
      svg += `<text x="${x}" y="${y + 3}" font-size="8" fill="${MORANGE}" text-anchor="middle" font-weight="bold">${L}</text>`;
    } else if (n.key) {
      svg += `<circle cx="${x - 2}" cy="${y - 2}" r="2.4" fill="none" stroke="${MINK}" stroke-width="1.2"/>`;
      svg += `<line x1="${x}" y1="${y}" x2="${x + 3.5}" y2="${y + 3.5}" stroke="${MINK}" stroke-width="1.2"/>`;
    } else if (G.dropped.includes(n.id)) {
      svg += `<circle cx="${x}" cy="${y}" r="2.6" fill="#e8c15a" stroke="#8a6a20" stroke-width="1"/>`;
    } else if (G.frozen && n.id === p.node) {
      svg += `<rect x="${x - 5}" y="${y - 5}" width="10" height="10" rx="1.5" fill="none" stroke="#5aa8ff" stroke-width="1.6"/>`;
      svg += `<text x="${x}" y="${y + 16}" font-size="7" fill="#5aa8ff" text-anchor="middle">${Math.ceil(G.frozen.t)}</text>`;
    } else if (G.glow && G.glow.node === n.id) {
      svg += `<circle cx="${x}" cy="${y}" r="3.2" fill="none" stroke="#5ee87a" stroke-width="1.4"/>`;
      svg += `<circle cx="${x}" cy="${y}" r="1.2" fill="#5ee87a"/>`;
    } else if (G.decoy && G.decoy.node === n.id) {
      svg += `<circle cx="${x}" cy="${y}" r="2.4" fill="#9a9488" stroke="#5c584f" stroke-width="1"/>`;
    } else if (n.portal) {
      svg += `<circle cx="${x}" cy="${y}" r="4.5" fill="none" stroke="#8a4ad0" stroke-width="1.4" stroke-dasharray="2.5 2"/>`;
      svg += `<circle cx="${x}" cy="${y}" r="1.6" fill="#8a4ad0"/>`;
    } else if (n.nook) {
      // a wrong nook is never drawn
      if (!fakeNooks.includes(n.id)) {
        svg += `<polygon points="${x},${y - 4.5} ${x + 4.5},${y} ${x},${y + 4.5} ${x - 4.5},${y}" fill="none" stroke="${MINK}" stroke-width="1.1" opacity="0.85"/>`;
      } else {
        svg += `<circle cx="${x}" cy="${y}" r="2.2" fill="${MINK}"/>`;
      }
    } else {
      svg += `<circle cx="${x}" cy="${y}" r="2.4" fill="${MINK}" opacity="0.7"/>`;
    }
  }

  // monsters that live on the paper map
  for (const m of G.monsters) {
    const x = sx(G.nodes[m.node].x), y = sz(G.nodes[m.node].z);
    if (m.kind === 'randal' || m.kind === 'randalog' || m.kind === 'twoofthem' || m.kind === 'rampage') {
      svg += scribbleFace(x, y, MRED);
      // red dots down the pipe he is looking along
      const nb = G.nodes[m.node].neighbors;
      for (const id of nb.slice(0, 1)) {
        for (let k = 1; k <= 3; k++) {
          const px = x + (sx(G.nodes[id].x) - x) * (k / 3.2);
          const py = y + (sz(G.nodes[id].z) - y) * (k / 3.2);
          svg += `<circle cx="${px}" cy="${py}" r="1.3" fill="${MRED}" opacity="0.9"/>`;
        }
      }
    } else if (m.kind === 'janitor') {
      svg += `<path d="M${x - 4},${y + 4} L${x + 4},${y + 4} L${x + 2.4},${y - 4} L${x - 2.4},${y - 4} Z" fill="none" stroke="${MBROWN}" stroke-width="1.3"/>`;
    } else if (m.kind === 'sweeper') {
      svg += `<rect x="${x - 4}" y="${y - 4}" width="8" height="8" fill="${MORANGE}" opacity="0.7"/>`;
    } else if (m.kind === 'flesh') {
      svg += `<path d="M${x - 5},${y} l10,0 M${x-2},${y-3} l4,0 M${x-2},${y+3} l4,0" stroke="${MRED}" stroke-width="1.4"/>`;
    } else if (m.kind === 'gardener') {
      svg += `<circle cx="${x}" cy="${y}" r="3.4" fill="none" stroke="${MGREEN}" stroke-width="1.2"/>`;
      svg += `<text x="${x + 5}" y="${y + 3}" font-size="6" fill="${MGREEN}">G</text>`;
    } else if (m.kind === 'choir') {
      svg += `<circle cx="${x}" cy="${y}" r="3" fill="${MGREEN}" opacity="0.8"/>`;
      svg += `<text x="${x + 5}" y="${y + 3}" font-size="6" fill="${MGREEN}">CH</text>`;
    } else if (m.kind === 'leeches') {
      svg += `<ellipse cx="${x}" cy="${y}" rx="5" ry="3" fill="${MPURPLE}" opacity="0.55"/>`;
    } else if (m.kind === 'deadair') {
      svg += `<circle cx="${x}" cy="${y}" r="4.5" fill="none" stroke="${MGREY}" stroke-width="1.2" stroke-dasharray="2 2"/>`;
      svg += `<text x="${x + 6}" y="${y + 3}" font-size="6" fill="${MGREY}">NO SIG</text>`;
    } else if (m.kind === 'temp') {
      svg += `<circle cx="${x}" cy="${y}" r="3" fill="none" stroke="${MGREY}" stroke-width="1.2"/>`;
      svg += `<text x="${x}" y="${y + 2.5}" font-size="6" fill="${MGREY}" text-anchor="middle">?</text>`;
    }
    // dale, marco, mother, young, grinner, mother's young etc. stay off the map —
    // the wiki only puts the listed things on it.
  }

  // you: a red arrow pointing down the pipe you are facing
  const ax = sx(p.node), ay = sz(p.node);
  const fn = p.facing != null ? p.facing : p.node;
  let dx = sx(G.nodes[fn].x) - ax, dy = sz(G.nodes[fn].z) - ay;
  if (!dx && !dy) { dx = 0; dy = -1; }
  const len = Math.hypot(dx, dy) || 1;
  dx /= len; dy /= len;
  const tipX = ax + dx * 9, tipY = ay + dy * 9;
  const bx = ax - dx * 3, by = ay - dy * 3;
  const nx = -dy, ny = dx;
  svg += `<polygon points="${tipX},${tipY} ${bx + nx * 4},${by + ny * 4} ${bx - nx * 4},${by - ny * 4}" fill="${MRED}" stroke="#f3ead2" stroke-width="2.2"/>`;
  svg += `<polygon points="${tipX},${tipY} ${bx + nx * 4},${by + ny * 4} ${bx - nx * 4},${by - ny * 4}" fill="${MRED}" stroke="${MRED}" stroke-width="0.8"/>`;

  // legend, pencil notes in the margin
  const ly = 268;
  svg += `<g font-size="6.5" fill="${MGREY}">`;
  svg += `<polygon points="30,${ly - 4} 36,${ly + 3} 32,${ly} " fill="none" stroke="${MRED}" stroke-width="1"/><polygon points="30,${ly - 4} 36,${ly + 3} 28,${ly + 2}" fill="${MRED}"/><text x="39" y="${ly + 2}">YOU (red arrow)</text>`;
  svg += `<rect x="112" y="${ly - 5}" width="9" height="8" fill="none" stroke="${MORANGE}"/><text x="124" y="${ly + 2}">JOB</text>`;
  svg += `<rect x="152" y="${ly - 5}" width="9" height="9" fill="none" stroke="${MINK}"/><text x="164" y="${ly + 2}">HOME</text>`;
  svg += `<polygon points="204,${ly - 5} 209,${ly - 1} 204,${ly + 3} 199,${ly - 1}" fill="none" stroke="${MINK}"/><text x="212" y="${ly + 2}">NOOK</text>`;
  svg += `</g>`;
  svg += `<text x="26" y="284" font-size="6.5" fill="${MGREY}">red scribble = Randal / Rampage · bucket = Janitor · orange = Sweeper route</text>`;
  svg += `<text x="26" y="292" font-size="6.5" fill="${MGREY}">green ring = Gardener · dashed = Choir song · dash red = Flesh charge</text>`;
  svg += `</svg>`;
  mapEl.innerHTML = svg;
}

// ---------- HUD update ----------
function updateHUD(dt) {
  const p = G.player;
  batteryEl.style.width = `${Math.max(0, p.battery / DIFF[G.diff].battery * 100)}%`;
  warmthEl.style.width = `${Math.max(0, p.warmth)}%`;
  capsEl.textContent = `${G.caps} caps`;
  if (G.bossNight) {
    bossKeysEl.classList.remove('hidden');
    bossKeysEl.textContent = `KEYS ${G.keysHeld} · LOCKS ${G.locks}`;
  } else bossKeysEl.classList.add('hidden');
  // effects bar
  const EFFECT_LABEL = { SPEED: 'SPEED', FLARE: 'FLARE', SMOKE: 'SMOKE', MASK: 'MASK', goop: 'GOOP' };
  effectsEl.innerHTML = Object.entries(G.effects).filter(([, s]) => s > 0)
    .map(([k, s]) => `<span class="effect">${EFFECT_LABEL[k] || k} ${Math.ceil(s)}</span>`).join('');
  updateObjective();
  // prompt
  const it = nearestInteractable();
  if (!it) promptEl.textContent = '';
  else if (it.kind === 'shop') promptEl.textContent = G.shiftDone ? 'E — Clock out' : 'E — Safe room';
  else if (it.kind === 'cage') promptEl.textContent = G.keysHeld > 0 ? 'E — Unlock cage' : 'Locked. FIND A KEY.';
  else if (it.kind === 'toll') promptEl.textContent = 'E — Pay toll: 3 caps';
  else if (it.kind === 'job') promptEl.textContent = 'E — Work the job';
  else if (it.kind === 'portal') promptEl.textContent = 'E — Crawl into the purple portal';
  else if (it.kind === 'nook') promptEl.textContent = p.hidden ? 'E — Leave nook' : 'E — Hide in nook';
  if (G.mapUp) drawMap();
}

// ---------- Main loop ----------
let last = performance.now();
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - last) / 1000); last = now;

  if (G.state === 'playing') {
    if (G.debugFreeze) { updateHUD(dt); placePlayerCamera(); if (renderer) renderer.render(scene, camera); return; }
    const p = G.player;
    G.time += dt;
    // movement animation
    if (p.moving) {
      p.moving.t += dt / p.moving.dur;
      if (p.moving.t >= 1) {
        const from = p.moving.from;
        p.node = p.moving.to; p.moving = null;
        const nb = G.nodes[p.node].neighbors;
        const deep = nb.slice().sort((a, b) => (G.safeDist[b] ?? 0) - (G.safeDist[a] ?? 0));
        p.facing = deep.find(n => n !== from) ?? deep[0];
        const arr = G.nodes[p.node];
        const edge = G.edges.find(([a, b]) => (a === from && b === p.node) || (a === p.node && b === from));
        if (edge && edge.gate) {
          p.warmth = Math.max(0, p.warmth - 12);
          p.battery = Math.max(0, p.battery - 6);
          promptEl.textContent = 'Zap gate! You jolt through the charged duct.';
        }
        if (arr.caps > 0) { G.caps += arr.caps; arr.caps = 0; }
        if (arr.key) { arr.key = false; G.keysHeld++; promptEl.textContent = `Cage key picked up · ${G.keysHeld} held`; }
        const di = G.dropped.indexOf(arr.id);
        if (di >= 0) { G.dropped.splice(di, 1); G.cureCarry++; promptEl.textContent = 'Picked up the dropped ingredient.'; }
      }
    }
    // vitals
    const inSafe = p.node === G.safeNode;
    if (inSafe) {
      p.battery = Math.min(DIFF[G.diff].battery, p.battery + 25 * dt);
      p.warmth = Math.min(100, p.warmth + 20 * dt);
    } else {
      if (G.lampOn) { p.battery -= dt; G.darkTimer = 0; }
      else if (G.chapter === 3) {
        G.darkTimer = (G.darkTimer || 0) + dt;
        if (G.darkTimer >= 40) return killPlayer({ name: 'The Growth', kind: 'growth' });
      } else p.warmth -= DIFF[G.diff].warmthDrain * dt;
    }
    if (p.battery <= 0) { G.lampOn = false; lampLight.visible = lampGlow.visible = false; }
    if (p.warmth <= 0) return killPlayer({ name: 'the Cold', kind: 'cold' });
    if (G.frozen) {
      G.frozen.t -= dt;
      promptEl.textContent = `Freeze pod — ${Math.ceil(G.frozen.t)}s · mash E / Space to break out`;
      if (G.frozen.t <= 0) return killPlayer(G.frozen.monster);
    }
    if (G.behind) {
      G.behind.t -= dt;
      if (G.behind.t <= 0) return killPlayer({ name: 'The Thing Behind You', kind: 'thing' });
    }
    if (p.hidden) {
      p.nookTimer += dt;
      if (p.nookTimer > 25) return killPlayer({ name: 'Nosy', kind: 'nosy' });
    } else p.nookTimer = 0;
    // effects timers
    for (const k of Object.keys(G.effects)) { G.effects[k] -= dt; if (G.effects[k] <= 0) delete G.effects[k]; }
    if (G.decoy && --G.decoy.t <= 0) G.decoy = null;
    if (G.glow && --G.glow.t <= 0) G.glow = null;
    if (p.speedBoost > 0) p.speedBoost -= dt;

    // Ch3 finale escape countdown
    if (G.bossPhase === 'escape') {
      G.escapeAt -= dt;
      updateBossBar();
      if (p.node === G.safeNode) { finaleWin(); return; }
      if (G.escapeAt <= 0) return killPlayer({ name: 'The Two of Them', kind: 'twoofthem' });
    }

    if (!G.debugFreeze) { scheduleMonsters(dt); updateMonsters(dt); }
    // proximity cue: a low tick when something is nearby, louder up close
    proxTimer -= dt;
    if (proxTimer <= 0) {
      proxTimer = 1.2;
      let nearest = 99;
      for (const m of G.monsters) {
        nearest = Math.min(nearest, v(m.node).distanceTo(v(p.node)));
      }
      if (nearest < 5) beep(nearest < 2 ? 95 : 70, 0.08, 'sawtooth', nearest < 2 ? 0.1 : 0.04, -20);
    }
    updateHUD(dt);
  }

  placePlayerCamera();
  if (renderer) renderer.render(scene, camera);
}
requestAnimationFrame(loop);

// ---------- Debug export ----------
window.__dbg = {
  startCrawl, rotate, interact, openJob, hitNeedle, closeModal, killPlayer,
  spawnMonster, updateMonsters, startNight, clockOut, checkNightProgress,
  wirePick, weldSeg, clampLeak,
  wakeBoss, initiateGrab, hitGrab, startEscape, finaleWin, takeJar, openGuide, openSafeRoom, washGoop,
  useItem, buyItem, openShop, toggleMap, smashPod, struggleBehind, startCrawl,
  worldGroup, camera,
  get pressure() { return pressure; },
  get grab() { return grab; },
};

// ---------- Buttons ----------
if (window.matchMedia && matchMedia('(pointer: coarse)').matches) document.body.classList.add('touch');

const touchActions = {
  forward: () => { if (G.player && G.player.facing != null) startCrawl(G.player.facing); },
  back: () => { if (!G.player) return; const nb = G.nodes[G.player.node].neighbors; const b = nb.find(n => n !== G.player.facing) ?? G.player.facing; if (b != null) startCrawl(b, true); },
  left: () => rotate(-1),
  right: () => rotate(1),
  interact: () => interact(),
  lamp: () => toggleLamp(),
  map: () => toggleMap(),
};
document.querySelectorAll('#touch [data-act]').forEach((b) => {
  b.addEventListener('pointerdown', (e) => { e.preventDefault(); touchActions[b.dataset.act](); });
});

$('start-btn').onclick = () => {
  G.diff = $('difficulty').value;
  G.chapter = Number($('chapter').value);
  G.night = 1;
  initAudio();
  beep(440, 0.1, 'triangle', 0.12);
  lobbyEl.classList.add('hidden');
  startNight();
};
$('revive-btn').onclick = () => {
  deathEl.classList.add('hidden');
  G.reviveUsed = true;
  for (const m of [...G.monsters]) removeMonster(m);
  const p = G.player;
  p.node = G.safeNode; p.moving = null; p.locked = false; p.hidden = false;
  p.battery = DIFF[G.diff].battery; p.warmth = 100; p.speedBoost = 0;
  G.effects = {};
  G.frozen = null; G.behind = null; G.backStreak = 0;
  if (grab) { clearInterval(grabTimer); grab = null; }
  G.state = 'playing';
  placePlayerCamera();
  beep(520, 0.15, 'triangle', 0.12);
};
$('retry-btn').onclick = () => {
  deathEl.classList.add('hidden');
  startNight();
};
