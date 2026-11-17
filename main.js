import * as THREE from './lib/three.module.js';

/* ============================================================
   PIPES — 3D web replica (Three.js). Solo Chapter 1 prototype.
   ============================================================ */

const DIFF = {
  easy:    { battery: 210, warmthDrain: 4.5, monsterRate: 0.75, speed: 0.9, sight: 1 },
  normal:  { battery: 170, warmthDrain: 6.0, monsterRate: 1.0,  speed: 1.0, sight: 1 },
  hard:    { battery: 130, warmthDrain: 8.0, monsterRate: 1.25, speed: 1.12, sight: 1 },
  insane:  { battery: 105, warmthDrain: 11,  monsterRate: 1.5,  speed: 1.25, sight: 1 },
};

const ITEMS = {
  cola:    { name: 'Pipe Cola',  price: 3, desc: 'Restore ~1/3 lamp battery' },
  flare:   { name: 'Flare',      price: 3, desc: 'Burns 15s; keeps things away' },
  warmer:  { name: 'Hand Warmer',price: 3, desc: 'Big chunk of warmth' },
  energy:  { name: 'Energy Drink', price: 4, desc: 'Faster crawl 20s' },
  smoke:   { name: 'Smoke Bomb', price: 6, desc: 'Hidden from everything 8s' },
};

// Chapter 1 roster per night (featured first)
const NIGHTS = [
  { jobs: 3, roster: ['maw'] },
  { jobs: 3, roster: ['randal', 'maw'] },
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
const ambient = new THREE.AmbientLight(0x334455, 0.35);
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
  const add = (x, z) => { const id = G.nodes.length; G.nodes.push({ id, x, z, neighbors: [], job: null, nook: false, key: false, cage: false }); return id; };
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

  // Cross-section per chapter: Ch1 octagonal pipe, Ch2 square duct, Ch3 round tube.
  function pipeGeometry(len) {
    if (CH === 2) return new THREE.BoxGeometry(len, 1.8, 1.8);
    const seg = CH === 1 ? 8 : 12;
    return new THREE.CylinderGeometry(1.0, 1.0, len, seg, 1, true);
  }
  function jointGeometry() {
    if (CH === 2) return new THREE.BoxGeometry(1.9, 2.0, 1.9);
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
    const axis = CH === 2 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    mesh.quaternion.setFromUnitVectors(axis, dir);
    worldGroup.add(mesh);
  }
  for (const n of G.nodes) {
    const s = new THREE.Mesh(jointGeometry(), jointMat);
    s.position.set(n.x, 0, n.z);
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
      const lamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 8, 6),
        new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0xff2222, emissiveIntensity: 0.9 })
      );
      lamp.position.set(n.x, 0.9, n.z);
      worldGroup.add(lamp);
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
  // safe room box
  const safe = G.nodes[G.safeNode];
  const room = new THREE.Mesh(
    new THREE.BoxGeometry(4.4, 2.6, 4.4, 1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0x3a3226, roughness: 0.85, side: THREE.BackSide })
  );
  room.position.set(safe.x, 1.3, safe.z);
  worldGroup.add(room);
  const roomLight = new THREE.PointLight(0xffe6b0, 0.9, 8);
  roomLight.position.set(safe.x, 1.8, safe.z);
  worldGroup.add(roomLight);
}

// ---------- Player ----------
function resetPlayer() {
  const d = DIFF[G.diff];
  G.player = {
    node: G.safeNode, facing: G.nodes[G.safeNode].neighbors[0] ?? null,
    moving: null,             // {from,to,t,dur,back}
    battery: d.battery, warmth: 100,
    locked: false, hidden: false,
    speedBoost: 0, slow: false,
  };
  for (const m of G.monsters) scene.remove(m.mesh);
  G.caps = 4; G.pockets = []; G.effects = {};
  G.lampOn = true; G.mapUp = false; G.monsters = []; G.time = 0; G.darkTimer = 0;
  G.cureCarry = 0; G.cureDeposited = 0;
}

function placePlayerCamera() {
  const p = G.player;
  let pos;
  if (p.moving) {
    const a = v(p.moving.from), b = v(p.moving.to);
    pos = a.lerp(b, p.moving.t);
  } else pos = v(p.node);
  camera.position.set(pos.x, 0.7, pos.z);
  if (p.facing != null) {
    const f = v(p.facing);
    camera.lookAt(f.x, 0.7, f.z);
  }
}

function crawlDuration(back) {
  const base = back ? 0.85 : 0.55;
  const spd = G.player.speedBoost > 0 ? 1.4 : 1;
  return base / spd * (G.player.slow ? 1.7 : 1);
}

function startCrawl(to, back = false) {
  const p = G.player;
  if (p.moving || p.locked) return;
  const toll = G.monsters.find(x => x.kind === 'tollman' && x.node === to && !x.paid);
  if (toll) {
    toll.shove = (toll.shove || 0) + 1;
    if (toll.shove >= 2) return killPlayer(toll);
    promptEl.textContent = 'The Tollman shoves you back — pay 3 caps (E) or go round.';
    return;
  }
  p.moving = { from: p.node, to, t: 0, dur: crawlDuration(back), back };
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
  if (G.state !== 'playing' || p.locked) return;
  const id = G.pockets[slot];
  if (!id) return;
  if (id === 'cola') { p.battery = Math.min(DIFF[G.diff].battery, p.battery + DIFF[G.diff].battery / 3); }
  else if (id === 'warmer') { p.warmth = Math.min(100, p.warmth + 45); }
  else if (id === 'energy') { p.speedBoost = 20; addEffect('SPEED', 20); }
  else if (id === 'flare') { addEffect('FLARE', 15); }
  else if (id === 'smoke') { addEffect('SMOKE', 8); }
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

function killPlayer(monster) {
  if (G.state !== 'playing') return;
  G.state = 'death';
  deathTitle.textContent = `CAUGHT BY ${monster.name.toUpperCase()}`;
  deathText.textContent = journalHint(monster.kind);
  deathEl.classList.remove('hidden');
  beep(150, 0.7, 'sawtooth', 0.22, -110);
}

function journalHint(kind) {
  const hints = {
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
    if (m.node === p.node) return killPlayer(m);
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
    if (G.mapUp) { m.timer += dt; if (m.timer >= 3) { m.state = 'idle'; p.locked = false; removeMonster(m); } }
    else m.timer = 0;
  }
}

function aiMoths(m, dt) {
  const p = G.player;
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
    if (p.node === m.fogNode && !G.effects.smoke) {
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
  if (!G.lampOn || G.effects.smoke || p.node === G.safeNode) { m.state = 'roam'; return; }
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
  if (m.node === p.node) p.battery -= dt * 8;
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
    if (m.node === p.node) return killPlayer(m);
    if (distNodes(m.node, p.node) > 6) m.state = 'roam';
  }
}

function aiTwoOfThem(m, dt) {
  const p = G.player;
  if (!G.shiftDone) { m.state = 'sleep'; return; }
  if (G.effects.smoke || p.node === G.safeNode) { m.state = 'idle'; return; }
  m.node = stepToward(m.node, p.node);
  if (m.node === p.node) return killPlayer(m);
}

function removeMonster(m) {
  scene.remove(m.mesh);
  G.monsters = G.monsters.filter(x => x !== m);
}

// ---------- Spawn scheduling ----------
let spawnClock = 0;
function scheduleMonsters(dt) {
  spawnClock -= dt;
  if (spawnClock > 0) return;
  const roster = nightTable()[G.night - 1].roster;
  const active = new Set(G.monsters.map(m => m.kind));
  const missing = roster.filter(k => !active.has(k));
  const jobsDone = (G.jobTotal || 0) - G.jobs.length;
  const maxOut = Math.min(roster.length, (G.night >= 3 ? 2 : 1) + Math.floor(jobsDone / 2));
  if (!missing.length) { spawnClock = 6; return; }
  if (G.monsters.length < maxOut) {
    spawnMonster(missing[Math.floor(Math.random() * missing.length)]);
    spawnClock = Math.max(4, 12 - jobsDone * 1.5) / DIFF[G.diff].monsterRate;
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
    valve:   { t: 'Air Filter',    l: 'Latch the clean filter in' },
    pressure:{ t: 'Duct Fan',      l: 'Keep the fan needle in the green' },
    weld:    { t: 'Split Duct',    l: 'Drag tape along each whistling split' },
    leaks:   { t: 'Blocked Grille',l: 'Drag the junk out of the grille' },
    bleed:   { t: 'Access Panel', l: 'Close the breaker screw in time' },
  },
  3: {
    bleed: { t: 'Glow Sap',    l: 'Jam the spigot and stop in the green' },
    weld:  { t: 'Bloom Heart', l: 'Slash every vine, drop the bloom in the jar' },
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
    if (it.kind === 'shop') openShop();
    return;
  }
  if (it.kind === 'shop') {
    if (G.chapter === 3 && G.cureCarry > 0) {
      G.cureDeposited += G.cureCarry; G.cureCarry = 0;
      promptEl.textContent = 'Ingredient into the cauldron.';
      beep(520, 0.12, 'triangle', 0.14);
      return;
    }
    G.shiftDone ? clockOut() : openShop();
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
  else if (it.kind === 'nook') { p.hidden = !p.hidden; promptEl.textContent = p.hidden ? 'Hidden in the nook' : ''; }
}

// ---------- Input ----------
addEventListener('keydown', (e) => {
  G.keys[e.code] = true;
  if (G.state === 'modal' && e.code === 'Space') { e.preventDefault(); if (pressure) hitNeedle(); return; }
  if (G.state !== 'playing') return;
  switch (e.code) {
    case 'KeyW': case 'ArrowUp': { if (G.player.facing != null) startCrawl(G.player.facing); break; }
    case 'KeyS': case 'ArrowDown': { const nb = G.nodes[G.player.node].neighbors; const back = nb.find(n => n !== G.player.facing) ?? G.player.facing; if (back != null) startCrawl(back, true); break; }
    case 'KeyA': case 'ArrowLeft': rotate(-1); break;
    case 'KeyD': case 'ArrowRight': rotate(1); break;
    case 'KeyF': toggleLamp(); break;
    case 'KeyM': G.mapUp = !G.mapUp; mapEl.classList.toggle('hidden', !G.mapUp); if (G.mapUp) drawMap(); break;
    case 'KeyE': interact(); break;
    case 'Digit1': useItem(0); break;
    case 'Digit2': useItem(1); break;
    case 'Digit3': useItem(2); break;
    case 'Digit4': useItem(3); break;
  }
});
addEventListener('keyup', (e) => { G.keys[e.code] = false; });

function toggleLamp() {
  const p = G.player;
  if (p.battery <= 0) return;
  G.lampOn = !G.lampOn;
  lampLight.visible = lampGlow.visible = G.lampOn;
  beep(G.lampOn ? 700 : 320, 0.06, 'square', 0.08);
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
  effectsEl.innerHTML = Object.entries(G.effects).filter(([, s]) => s > 0)
    .map(([k, s]) => `<span class="effect">${k} ${Math.ceil(s)}</span>`).join('');
  updateObjective();
  // prompt
  const it = nearestInteractable();
  if (!it) promptEl.textContent = '';
  else if (it.kind === 'shop') promptEl.textContent = G.shiftDone ? 'E — Clock out' : 'E — Vending machine';
  else if (it.kind === 'cage') promptEl.textContent = G.keysHeld > 0 ? 'E — Unlock cage' : 'Locked. FIND A KEY.';
  else if (it.kind === 'toll') promptEl.textContent = 'E — Pay toll: 3 caps';
  else if (it.kind === 'job') promptEl.textContent = 'E — Work the job';
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
        if (arr.caps > 0) { G.caps += arr.caps; arr.caps = 0; }
        if (arr.key) { arr.key = false; G.keysHeld++; promptEl.textContent = `Cage key picked up · ${G.keysHeld} held`; }
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
    // effects timers
    for (const k of Object.keys(G.effects)) { G.effects[k] -= dt; if (G.effects[k] <= 0) delete G.effects[k]; }
    if (p.speedBoost > 0) p.speedBoost -= dt;

    if (!G.debugFreeze) { scheduleMonsters(dt); updateMonsters(dt); }
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
  worldGroup,
  get pressure() { return pressure; },
};

// ---------- Buttons ----------
$('start-btn').onclick = () => {
  G.diff = $('difficulty').value;
  G.chapter = Number($('chapter').value);
  G.night = 1;
  initAudio();
  beep(440, 0.1, 'triangle', 0.12);
  lobbyEl.classList.add('hidden');
  startNight();
};
$('retry-btn').onclick = () => {
  deathEl.classList.add('hidden');
  startNight();
};
