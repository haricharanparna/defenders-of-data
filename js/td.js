// Tower Defense mode: stop the threats before they reach your Data Core.
// Every tower is a real online safety habit, and every threat is weak to one of them.
//
// The learning is built into the game:
//  - Towers are locked until you pass a quick safety challenge (openChallenge)
//  - Threats arrive as unknown 📩 messages. Click one to read it and identify it (openScan).
//    Identify it right and that threat type takes double damage from the right tower.
//  - Between waves you play Real or Scam to earn bytes (runQuiz)
//
// Uses THREATS and TOWERS from threats.js, and the pop-ups from lessons.js.

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

const TILE = 40;
const COLS = 24;
const ROWS = 14;
canvas.width = COLS * TILE;
canvas.height = ROWS * TILE;

const START_DATA = 20;
const START_BYTES = 150;
const SELL_REFUND = 0.7;
const STRONG = 2;         // damage multiplier: the right tower against an identified threat
const NORMAL = 0.75;      // damage multiplier: everything else
const SCAN_REWARD = 10;   // bytes for identifying a threat correctly
const QUIZ_REWARD = 15;   // bytes per right answer in Real or Scam
const QUIZ_SIZE = 3;
const WRONG_SCAN_BOOST = 1.5;  // a threat you misidentify speeds up
const WAVE_BONUS = 10;
const SHOT_SPEED = 420;
const EMOJI_FONT = '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';

// The path threats follow, in tile coordinates. The last point is the Data Core.
const PATH = [[-1, 3], [4, 3], [4, 10], [10, 10], [10, 3], [16, 3], [16, 10], [21, 10]];
const WAYPOINTS = PATH.map(([c, r]) => ({ x: c * TILE + TILE / 2, y: r * TILE + TILE / 2 }));
const CORE = WAYPOINTS[WAYPOINTS.length - 1];

// Tiles you can't build on: the path itself and the area around the core
const blocked = new Set();
for (let i = 0; i < PATH.length - 1; i++) {
  let [c, r] = PATH[i];
  const [c2, r2] = PATH[i + 1];
  while (c !== c2 || r !== r2) {
    blocked.add(`${c},${r}`);
    c += Math.sign(c2 - c);
    r += Math.sign(r2 - r);
  }
}
for (let c = 20; c <= 22; c++) for (let r = 9; r <= 11; r++) blocked.add(`${c},${r}`);

// Each wave is a list of groups: [threat, how many, seconds between each one]
const WAVES = [
  [['phisher', 6, 1.4]],
  [['phisher', 8, 0.9], ['cracker', 2, 2.5]],
  [['cracker', 4, 2], ['phisher', 8, 0.7]],
  [['worm', 12, 0.45], ['phisher', 4, 0.8]],
  [['catfish', 5, 1.6], ['phisher', 6, 0.7]],
  [['phisher', 8, 0.6], ['worm', 10, 0.35], ['cracker', 4, 1.6], ['catfish', 5, 1.2]],
];
const GROUP_GAP = 1.5;  // pause between groups in the same wave

// ---------- Page elements ----------
const el = id => document.getElementById(id);
const dataText = el('data');
const bytesText = el('bytes');
const waveText = el('wave');
const waveButton = el('btn-wave');
const speedButton = el('btn-speed');
const pauseButton = el('btn-pause');
const endDialog = el('dlg-end');
const toast = el('toast');
el('wave-total').textContent = WAVES.length;

const anyDialogOpen = () => document.querySelector('dialog[open]') !== null;

// Towers you've unlocked stay unlocked if you play again
const unlocked = new Set();

let state;

function newGame() {
  state = {
    data: START_DATA,
    bytes: START_BYTES,
    wave: 0,            // index of the next wave to start
    waveActive: false,
    waveTime: 0,
    spawnQueue: [],
    enemies: [],
    towers: [],
    shots: [],
    floaters: [],
    known: new Set(),   // threat types identified during this wave
    index: new Set(),   // threat types ever identified (your Threat Index)
    seen: new Set(),    // threat types that have shown up
    stopped: {},        // how many of each threat you stopped
    leaked: {},         // how many of each threat got through
    stats: { scans: 0, scansRight: 0, quiz: 0, quizRight: 0 },
    tool: null,         // tower being placed, 'sell', or null
    hover: null,
    selected: null,     // tower clicked on (shows its range)
    speed: 1,
    paused: false,
    over: false,
    coreFlash: 0,
    time: 0,
  };
  pauseButton.textContent = '⏸';
  speedButton.textContent = '1x';
  for (const btn of Object.values(toolButtons)) btn.classList.remove('selected');
  canvas.classList.remove('placing');
  updateHud();
}

// ---------- Tower bar ----------
const toolButtons = {};
const costLabels = {};

function beatsText(towerId) {
  return Object.values(THREATS)
    .filter(t => t.weakTo === towerId)
    .map(t => `${t.emoji} ${t.plural}`)
    .join(', ');
}

Object.entries(TOWERS).forEach(([id, tower], i) => {
  const btn = document.createElement('button');
  btn.className = 'tool';
  btn.title = `${tower.name}: ${tower.habit}`;
  btn.innerHTML = `
    <span class="tool-key">${i + 1}</span>
    <span class="tool-emoji">${tower.emoji}</span>
    <span class="tool-name">${tower.name}</span>
    <span class="tool-cost"></span>
    <span class="tool-beats">Beats ${beatsText(id)}</span>`;
  btn.addEventListener('click', () => selectTool(id));
  el('tower-bar').appendChild(btn);
  toolButtons[id] = btn;
  costLabels[id] = btn.querySelector('.tool-cost');
});

const sellButton = document.createElement('button');
sellButton.className = 'tool';
sellButton.innerHTML = `
  <span class="tool-key">S</span>
  <span class="tool-emoji">💰</span>
  <span class="tool-name">Sell</span>
  <span class="tool-cost">Get ${SELL_REFUND * 100}% back</span>
  <span class="tool-beats">Click a tower to sell it</span>`;
sellButton.addEventListener('click', () => selectTool('sell'));
el('tower-bar').appendChild(sellButton);
toolButtons.sell = sellButton;

function selectTool(id) {
  if (state.over) return;

  // Locked towers open their challenge instead
  if (TOWERS[id] && !unlocked.has(id)) {
    openChallenge(id, ok => {
      if (!ok) return;
      unlocked.add(id);
      showToast(`${TOWERS[id].emoji} ${TOWERS[id].name} unlocked! Click it to place one.`);
      updateHud();
    });
    return;
  }
  if (TOWERS[id] && state.tool !== id && state.bytes < TOWERS[id].cost) {
    showToast(`Not enough bytes for ${TOWERS[id].name}. Stop threats and scan messages to earn more!`);
    return;
  }

  state.tool = state.tool === id ? null : id;
  state.selected = null;
  for (const [key, btn] of Object.entries(toolButtons)) {
    btn.classList.toggle('selected', key === state.tool);
  }
  canvas.classList.toggle('placing', state.tool !== null);
}

// ---------- HUD ----------
function updateHud() {
  dataText.textContent = state.data;
  dataText.parentElement.classList.toggle('low', state.data <= 5);
  bytesText.textContent = state.bytes;
  waveText.textContent = Math.min(state.wave + 1, WAVES.length);
  waveButton.disabled = state.waveActive || state.over;
  waveButton.textContent = state.waveActive ? 'Wave in progress...' : `Start Wave ${state.wave + 1} (Space)`;
  for (const [id, tower] of Object.entries(TOWERS)) {
    const locked = !unlocked.has(id);
    toolButtons[id].classList.toggle('locked', locked);
    costLabels[id].textContent = locked ? '🔒 Click to unlock' : `💾 ${tower.cost}`;
    toolButtons[id].disabled = !locked && state.bytes < tower.cost;
  }
  saveGame();
}

let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ---------- Waves ----------
function startWave() {
  if (state.waveActive || state.over || state.wave >= WAVES.length) return;
  let at = 0;
  state.spawnQueue = [];
  for (const [type, count, gap] of WAVES[state.wave]) {
    for (let i = 0; i < count; i++) {
      state.spawnQueue.push({ type, at });
      at += gap;
    }
    at += GROUP_GAP;
  }
  // Every wave starts with all threats unknown again, so you keep reading messages
  state.known = new Set();
  state.waveTime = 0;
  state.waveActive = true;
  updateHud();
}

function finishWave() {
  state.waveActive = false;
  state.wave++;
  if (state.wave >= WAVES.length) {
    endGame(true);
    return;
  }
  state.bytes += WAVE_BONUS;
  updateHud();

  // Real or Scam round between waves: learning earns you bytes for towers
  runQuiz(QUIZ_SIZE, (right, total) => {
    state.stats.quiz += total;
    state.stats.quizRight += right;
    const earned = right * QUIZ_REWARD;
    state.bytes += earned;
    showToast(`Wave cleared! You got ${right} of ${total} right: +${earned + WAVE_BONUS} bytes`);
    updateHud();
  });
}

// ---------- Scanning threats ----------
function isKnown(e) {
  // Verify Beacons expose hidden threats (Catfish) even if you haven't scanned them
  return state.known.has(e.type) || (THREATS[e.type].hidden && e.revealed);
}

function canTarget(e) {
  return !THREATS[e.type].hidden || isKnown(e);
}

function scanEnemy(e) {
  openScan(e.type, !state.index.has(e.type), correct => {
    if (correct === null) return;  // closed without answering
    state.stats.scans++;
    if (correct) {
      state.stats.scansRight++;
      state.known.add(e.type);
      state.index.add(e.type);
      state.bytes += SCAN_REWARD;
      addFloater(e.x, e.y - 20, `Identified! +${SCAN_REWARD}`, '#7cff6b');
    } else {
      e.boost = WRONG_SCAN_BOOST;
      addFloater(e.x, e.y - 20, 'Sped up!', '#ff3d8b');
    }
    updateHud();
  });
}

function enemyAt(x, y) {
  let best = null;
  let bestDist = 22;
  for (const e of state.enemies) {
    const d = Math.hypot(e.x - x, e.y - y);
    if (!e.gone && d < bestDist) { best = e; bestDist = d; }
  }
  return best;
}

// ---------- Placing and selling ----------
function pointFromEvent(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * canvas.width / rect.width,
    y: (e.clientY - rect.top) * canvas.height / rect.height,
  };
}

function tileFromEvent(e) {
  const p = pointFromEvent(e);
  return { c: Math.floor(p.x / TILE), r: Math.floor(p.y / TILE) };
}

function towerAt(c, r) {
  return state.towers.find(t => t.c === c && t.r === r);
}

function canBuild(c, r) {
  return c >= 0 && c < COLS && r >= 0 && r < ROWS && !blocked.has(`${c},${r}`) && !towerAt(c, r);
}

canvas.addEventListener('mousemove', e => {
  state.hover = tileFromEvent(e);
  const p = pointFromEvent(e);
  const target = enemyAt(p.x, p.y);
  canvas.style.cursor = target && !isKnown(target) ? 'help' : '';
});
canvas.addEventListener('mouseleave', () => { state.hover = null; });
canvas.addEventListener('contextmenu', e => { e.preventDefault(); if (state.tool) selectTool(state.tool); });

canvas.addEventListener('click', e => {
  if (state.over) return;

  // Clicking an unknown threat scans it
  const p = pointFromEvent(e);
  const target = enemyAt(p.x, p.y);
  if (target && !isKnown(target)) {
    scanEnemy(target);
    return;
  }

  const { c, r } = tileFromEvent(e);
  const existing = towerAt(c, r);

  if (state.tool === 'sell') {
    if (existing) {
      const refund = Math.floor(TOWERS[existing.type].cost * SELL_REFUND);
      state.towers = state.towers.filter(t => t !== existing);
      state.bytes += refund;
      addFloater(existing.x, existing.y, `+${refund}`, '#ffd23f');
      updateHud();
    }
    return;
  }

  if (state.tool) {
    const tower = TOWERS[state.tool];
    if (!canBuild(c, r)) return;
    if (state.bytes < tower.cost) {
      showToast(`Not enough bytes for ${tower.name}.`);
      return;
    }
    state.bytes -= tower.cost;
    state.towers.push({ type: state.tool, c, r, x: c * TILE + TILE / 2, y: r * TILE + TILE / 2, cooldown: 0 });
    // Keep the tool selected so you can place several, unless you can't afford another
    if (state.bytes < tower.cost) selectTool(state.tool);
    updateHud();
    return;
  }

  // No tool: clicking a tower shows its range
  state.selected = existing || null;
});

// ---------- Keyboard ----------
document.addEventListener('keydown', e => {
  if (anyDialogOpen()) return;
  const towerIds = Object.keys(TOWERS);
  const num = parseInt(e.key, 10);
  if (num >= 1 && num <= towerIds.length) {
    // Stop the number from being typed into a challenge that opens
    e.preventDefault();
    selectTool(towerIds[num - 1]);
  }
  else if (e.key === 's' || e.key === 'S') selectTool('sell');
  else if (e.key === ' ') { e.preventDefault(); startWave(); }
  else if (e.key === 'p' || e.key === 'P') togglePause();
  else if (e.key === 'f' || e.key === 'F') toggleSpeed();
  else if (e.key === 'Escape' && state.tool) selectTool(state.tool);
});

function togglePause() {
  state.paused = !state.paused;
  pauseButton.textContent = state.paused ? '▶' : '⏸';
  if (state.paused) showToast('Paused. Press P to keep playing');
}

function toggleSpeed() {
  state.speed = state.speed === 1 ? 2 : 1;
  speedButton.textContent = `${state.speed}x`;
}

waveButton.addEventListener('click', startWave);
pauseButton.addEventListener('click', togglePause);
speedButton.addEventListener('click', toggleSpeed);

// ---------- Game logic ----------
function spawnEnemy(type) {
  const t = THREATS[type];
  state.seen.add(type);
  state.enemies.push({
    type,
    x: WAYPOINTS[0].x,
    y: WAYPOINTS[0].y,
    next: 1,            // index of the waypoint it's walking toward
    hp: t.hp,
    maxHp: t.hp,
    traveled: 0,        // used to find the threat closest to the core
    revealed: false,    // inside a Verify Beacon's range
    boost: 1,           // speed multiplier (goes up if you misidentify it)
    lastFloat: -1,
  });
}

function moveEnemy(e, dt) {
  let step = THREATS[e.type].speed * e.boost * dt;
  e.traveled += step;
  while (step > 0 && e.next < WAYPOINTS.length) {
    const target = WAYPOINTS[e.next];
    const dist = Math.hypot(target.x - e.x, target.y - e.y);
    if (dist <= step) {
      e.x = target.x;
      e.y = target.y;
      e.next++;
      step -= dist;
    } else {
      e.x += (target.x - e.x) / dist * step;
      e.y += (target.y - e.y) / dist * step;
      step = 0;
    }
  }
  if (e.next >= WAYPOINTS.length) leak(e);
}

function leak(e) {
  e.gone = true;
  const t = THREATS[e.type];
  state.data = Math.max(0, state.data - t.damage);
  state.leaked[e.type] = (state.leaked[e.type] || 0) + 1;
  state.coreFlash = 1;
  addFloater(CORE.x, CORE.y - 30, `-${t.damage} data`, '#ff3d8b');
  updateHud();
  if (state.data <= 0) endGame(false);
}

function damage(e, towerType, amount) {
  if (e.gone) return;
  const strong = isKnown(e) && THREATS[e.type].weakTo === towerType;
  e.hp -= amount * (strong ? STRONG : NORMAL);

  if (strong && state.time - e.lastFloat > 0.8) {
    e.lastFloat = state.time;
    addFloater(e.x, e.y - 18, 'Super effective!', '#7cff6b');
  }

  if (e.hp <= 0) {
    e.gone = true;
    const t = THREATS[e.type];
    state.bytes += t.reward;
    state.stopped[e.type] = (state.stopped[e.type] || 0) + 1;
    addFloater(e.x, e.y, `+${t.reward}`, '#ffd23f');
    updateHud();
  }
}

function updateTowers(dt) {
  for (const tower of state.towers) {
    const info = TOWERS[tower.type];
    tower.cooldown -= dt;
    if (tower.cooldown > 0) continue;

    // Aim at the threat in range that's closest to the core
    let target = null;
    for (const e of state.enemies) {
      if (e.gone || !canTarget(e)) continue;
      if (Math.hypot(e.x - tower.x, e.y - tower.y) > info.range) continue;
      if (!target || e.traveled > target.traveled) target = e;
    }
    if (!target) continue;

    tower.cooldown = info.rate;
    state.shots.push({ x: tower.x, y: tower.y, target, type: tower.type, tx: target.x, ty: target.y });
  }
}

function updateShots(dt) {
  for (const shot of state.shots) {
    // Follow the target while it's alive, otherwise fly to where it was
    if (!shot.target.gone) {
      shot.tx = shot.target.x;
      shot.ty = shot.target.y;
    }
    const dist = Math.hypot(shot.tx - shot.x, shot.ty - shot.y);
    const step = SHOT_SPEED * dt;
    if (dist > step) {
      shot.x += (shot.tx - shot.x) / dist * step;
      shot.y += (shot.ty - shot.y) / dist * step;
      continue;
    }

    shot.done = true;
    const info = TOWERS[shot.type];
    if (info.splash) {
      for (const e of state.enemies) {
        if (canTarget(e) && Math.hypot(e.x - shot.tx, e.y - shot.ty) <= info.splash) damage(e, shot.type, info.damage);
      }
      state.floaters.push({ x: shot.tx, y: shot.ty, ring: info.splash, color: info.color, life: 0.3 });
    } else {
      damage(shot.target, shot.type, info.damage);
    }
  }
  state.shots = state.shots.filter(s => !s.done);
}

function updateReveals() {
  const beacons = state.towers.filter(t => TOWERS[t.type].reveals);
  for (const e of state.enemies) {
    if (!THREATS[e.type].hidden) continue;
    e.revealed = beacons.some(b => Math.hypot(e.x - b.x, e.y - b.y) <= TOWERS[b.type].range);
  }
}

function addFloater(x, y, text, color) {
  state.floaters.push({ x, y, text, color, life: 1 });
}

function update(dt) {
  state.time += dt;

  if (state.waveActive) {
    state.waveTime += dt;
    while (state.spawnQueue.length && state.spawnQueue[0].at <= state.waveTime) {
      spawnEnemy(state.spawnQueue.shift().type);
    }
  }

  for (const e of state.enemies) moveEnemy(e, dt);
  if (state.over) return;
  updateReveals();
  updateTowers(dt);
  updateShots(dt);
  state.enemies = state.enemies.filter(e => !e.gone);

  for (const f of state.floaters) {
    f.life -= dt;
    if (f.text) f.y -= 30 * dt;
  }
  state.floaters = state.floaters.filter(f => f.life > 0);
  state.coreFlash = Math.max(0, state.coreFlash - dt * 2);

  if (state.waveActive && state.spawnQueue.length === 0 && state.enemies.length === 0) finishWave();
}

// ---------- End of game ----------
function endGame(won) {
  state.over = true;
  state.waveActive = false;
  if (state.tool) selectTool(state.tool);
  updateHud();

  const stopped = Object.values(state.stopped).reduce((a, b) => a + b, 0);
  const leaked = Object.values(state.leaked).reduce((a, b) => a + b, 0);
  el('end-emoji').textContent = won ? '🏆' : '💥';
  el('end-title').textContent = won ? 'Data Defended!' : 'Data Leaked!';
  el('end-summary').textContent = won
    ? `You stopped ${stopped} threats and kept ${state.data} of ${START_DATA} data safe.${leaked === 0 ? ' A perfect defense!' : ''}`
    : `The threats broke through after you stopped ${stopped} of them. Every leak is a lesson, so try again!`;

  const { scans, scansRight, quiz, quizRight } = state.stats;
  el('end-stats').textContent =
    `📩 Messages identified: ${scansRight}/${scans}  ·  ✅ Real or Scam: ${quizRight}/${quiz}  ·  📖 Threat Index: ${state.index.size}/${Object.keys(THREATS).length}`;

  const lessons = el('end-lessons');
  lessons.innerHTML = '';
  for (const type of state.seen) {
    const t = THREATS[type];
    const li = document.createElement('li');
    li.innerHTML = `<strong>${t.emoji} ${t.name}:</strong> ${t.defense}`;
    if (state.leaked[type]) {
      li.classList.add('leaked');
      li.innerHTML += ` <em>(${state.leaked[type]} got through)</em>`;
    }
    lessons.appendChild(li);
  }
  endDialog.showModal();
}

// The end screen stays open until you pick Play Again or Main Menu
endDialog.addEventListener('cancel', e => e.preventDefault());

el('btn-again').addEventListener('click', () => {
  endDialog.close();
  newGame();
});

// ---------- Drawing ----------
function drawEmoji(emoji, x, y, size) {
  ctx.font = `${size}px ${EMOJI_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, x, y);
}

function drawBoard() {
  ctx.fillStyle = '#0a1030';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid
  ctx.strokeStyle = 'rgba(46, 230, 255, 0.06)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= canvas.width; x += TILE) { ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); }
  for (let y = 0; y <= canvas.height; y += TILE) { ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); }
  ctx.stroke();

  // Path: a dark data lane with a glowing dashed center line
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  WAYPOINTS.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.strokeStyle = '#1a2560';
  ctx.lineWidth = TILE * 0.95;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(46, 230, 255, 0.25)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 10]);
  ctx.lineDashOffset = -state.time * 30;
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawCore() {
  const pulse = 1 + Math.sin(state.time * 3) * 0.05;
  ctx.save();
  ctx.shadowBlur = 25;
  ctx.shadowColor = state.coreFlash > 0 ? '#ff3d8b' : '#2ee6ff';
  ctx.fillStyle = state.coreFlash > 0 ? `rgba(255, 61, 139, ${0.3 + state.coreFlash * 0.5})` : 'rgba(46, 230, 255, 0.18)';
  ctx.strokeStyle = state.coreFlash > 0 ? '#ff3d8b' : '#2ee6ff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(CORE.x, CORE.y, 34 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  drawEmoji('💾', CORE.x, CORE.y + 2, 32);
  ctx.font = 'bold 11px Nunito, sans-serif';
  ctx.fillStyle = '#e8f1ff';
  ctx.fillText('DATA CORE', CORE.x, CORE.y + 50);
}

function drawRange(x, y, range, color) {
  ctx.save();
  ctx.fillStyle = color + '1a';
  ctx.strokeStyle = color + '88';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, range, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawTower(type, x, y, alpha = 1) {
  const info = TOWERS[type];
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#0e1538';
  ctx.strokeStyle = info.color;
  ctx.lineWidth = 2.5;
  ctx.shadowBlur = 10;
  ctx.shadowColor = info.color;
  ctx.beginPath();
  ctx.roundRect(x - 17, y - 17, 34, 34, 7);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.globalAlpha = alpha;
  drawEmoji(info.emoji, x, y + 1, 22);
  ctx.globalAlpha = 1;
}

function drawEnemy(e) {
  const t = THREATS[e.type];
  const known = isKnown(e);

  if (known) {
    if (t.hidden) {
      // Exposed Catfish get a red ring
      ctx.strokeStyle = '#ff3d8b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(e.x, e.y, 16, 0, Math.PI * 2);
      ctx.stroke();
    }
    drawEmoji(t.emoji, e.x, e.y, 24);
  } else {
    // Unknown threat: a sealed message with a "?" badge. Click it to scan!
    drawEmoji('📩', e.x, e.y, 24);
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath();
    ctx.arc(e.x + 11, e.y - 10, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = 'bold 11px Nunito, sans-serif';
    ctx.fillStyle = '#070b1f';
    ctx.fillText('?', e.x + 11, e.y - 9);
  }

  // Health bar (hidden threats nobody can hit yet don't show one)
  if (!canTarget(e)) return;
  const w = 28;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(e.x - w / 2, e.y - 22, w, 4);
  ctx.fillStyle = e.hp / e.maxHp > 0.4 ? '#7cff6b' : '#ff3d8b';
  ctx.fillRect(e.x - w / 2, e.y - 22, w * Math.max(0, e.hp / e.maxHp), 4);
}

function drawHover() {
  const h = state.hover;
  if (!h || !state.tool) return;
  const x = h.c * TILE + TILE / 2;
  const y = h.r * TILE + TILE / 2;

  if (state.tool === 'sell') {
    if (towerAt(h.c, h.r)) {
      ctx.strokeStyle = '#ffd23f';
      ctx.lineWidth = 2;
      ctx.strokeRect(h.c * TILE + 1, h.r * TILE + 1, TILE - 2, TILE - 2);
    }
    return;
  }

  const ok = canBuild(h.c, h.r) && state.bytes >= TOWERS[state.tool].cost;
  ctx.fillStyle = ok ? 'rgba(124, 255, 107, 0.18)' : 'rgba(255, 61, 139, 0.25)';
  ctx.fillRect(h.c * TILE, h.r * TILE, TILE, TILE);
  if (ok) {
    drawRange(x, y, TOWERS[state.tool].range, TOWERS[state.tool].color);
    drawTower(state.tool, x, y, 0.6);
  }
}

function drawShotsAndFloaters() {
  for (const shot of state.shots) {
    ctx.fillStyle = TOWERS[shot.type].color;
    ctx.beginPath();
    ctx.arc(shot.x, shot.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const f of state.floaters) {
    ctx.globalAlpha = Math.max(0, Math.min(1, f.life * 2));
    if (f.ring) {
      ctx.strokeStyle = f.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.ring * (1 - f.life / 0.3 * 0.5), 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.font = 'bold 13px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = f.color;
      // Keep text on screen when threats are hit right at the edge
      const x = Math.min(Math.max(f.x, 70), canvas.width - 70);
      ctx.fillText(f.text, x, Math.max(f.y, 14));
    }
    ctx.globalAlpha = 1;
  }
}

// A hint at the bottom of the board telling new players what to do next
function drawHint() {
  let hint = null;
  if (state.over) return;
  if (unlocked.size === 0) {
    hint = '👇 Click a 🔒 tower below and pass its challenge to unlock it!';
  } else if (state.wave === 0 && !state.waveActive && state.towers.length === 0) {
    hint = 'Place your tower next to the path, then press Start Wave!';
  } else if (state.waveActive && state.enemies.some(e => !isKnown(e))) {
    hint = 'Click a 📩 to scan it. Identify the threat for double damage!';
  }
  if (!hint) return;
  ctx.font = 'bold 16px Nunito, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(7, 11, 31, 0.75)';
  const w = ctx.measureText(hint).width + 30;
  ctx.fillRect(canvas.width / 2 - w / 2, canvas.height - 36, w, 28);
  ctx.fillStyle = '#e8f1ff';
  ctx.fillText(hint, canvas.width / 2, canvas.height - 22);
}

function draw() {
  drawBoard();
  drawCore();
  if (state.selected) drawRange(state.selected.x, state.selected.y, TOWERS[state.selected.type].range, TOWERS[state.selected.type].color);
  for (const t of state.towers) drawTower(t.type, t.x, t.y);
  for (const e of state.enemies) drawEnemy(e);
  drawHover();
  drawShotsAndFloaters();
  drawHint();
}

// ---------- Main loop ----------
let lastTime = performance.now();
function loop(now) {
  // Cap the step so the game doesn't jump ahead after switching tabs
  const dt = Math.min((now - lastTime) / 1000, 0.05) * state.speed;
  lastTime = now;
  const frozen = state.paused || state.over || anyDialogOpen();
  if (!frozen) update(dt);
  draw();
  requestAnimationFrame(loop);
}

newGame();
loadSave();
requestAnimationFrame(loop);
