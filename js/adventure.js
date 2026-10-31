// Adventure mode: walk around "the internet", battle the threats hiding in spam grass,
// quarantine them into your Threat Index, and beat hacker trainers to open the gates.
// Content (threats, guardians, map, people) lives in adventure-data.js.

const $ = id => document.getElementById(id);
const ADVENTURE_KEY = 'defenders-of-data-adventure';

const TILE = 48;
const MAP_VERSION = 2;           // bump when the map changes, so old saves start at home
const SPEED = 135;               // pixels per second
const SPRINT = 1.75;             // how much faster you go while running (hold Shift or turn on Run)
const ACCEL = 14;                // how quickly you speed up and slow down (higher = snappier)
const RADIUS = 15;               // your size, for bumping into walls
const BODY_SIZE = 19;            // how big you're drawn
const TALK_RANGE = 62;           // how close you need to be to talk to someone
const ENCOUNTER_EVERY = 40;      // pixels walked in spam grass between encounter checks
const ENCOUNTER_CHANCE = 0.14;
const BASE_HP = 100;
const HP_PER_BADGE = 20;
const RIGHT_DAMAGE = [42, 55];   // super effective hits
const WRONG_DAMAGE = 12;
const HELP_HEAL = 30;

const pickRandom = list => list[Math.floor(Math.random() * list.length)];
const shuffle = list => list.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);
const creature = id => (id === BOSS.id ? BOSS : CREATURES.find(c => c.id === id));
const rarityOf = c => RARITY[c.rarity || 'common'];

// ---------- The world ----------
// Each area is built from its own fixed seed, so it comes out the same every time.
// A road runs across the middle with two roads crossing it, and everything important sits
// right next to a road so you can always reach it. Spam grass, data streams and walls fill the rest.
const ROAD_Y = Math.floor(ZONE_H / 2);   // the main road is this row and the one above it

function seeded(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let n = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    n = (n + Math.imul(n ^ (n >>> 7), 61 | n)) ^ n;
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}

function buildZone(i) {
  const rand = seeded(1234 + i * 977);
  const int = (min, max) => min + Math.floor(rand() * (max - min + 1));
  const grid = Array.from({ length: ZONE_H }, (_, y) => Array.from({ length: ZONE_W }, (_, x) =>
    (x === 0 || y === 0 || x === ZONE_W - 1 || y === ZONE_H - 1 ? '#' : '.')));
  const kept = new Set();   // squares that must stay clear
  const keep = (x, y) => kept.add(`${x},${y}`);

  // Roads
  const roadXs = [int(6, 9), int(18, 22)];
  for (let x = 0; x < ZONE_W; x++) { keep(x, ROAD_Y - 1); keep(x, ROAD_Y); }
  for (const rx of roadXs) for (let y = 1; y < ZONE_H - 1; y++) { keep(rx, y); keep(rx + 1, y); }
  // The way in from the last area, and the gate to the next one
  if (i > 0) grid[ROAD_Y - 1][0] = grid[ROAD_Y][0] = '.';
  if (i < ZONES.length - 1) grid[ROAD_Y - 1][ZONE_W - 1] = grid[ROAD_Y][ZONE_W - 1] = 'G';

  // People and places, each with clear space around it
  const place = (ch, x, y) => {
    grid[y][x] = ch;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) keep(x + dx, y + dy);
  };
  if (i === 0) place('H', 2, ROAD_Y - 2);
  place('R', 4, ROAD_Y + 1);
  place('R', roadXs[1] + 3, ROAD_Y + 1);
  place('S', 6 + (i === 0 ? 0 : -2), ROAD_Y - 2);
  place('S', ZONE_W - 10, ROAD_Y + 1);
  place('N', roadXs[0] + 3, ROAD_Y - 2);
  place('T', ZONE_W - 4, ROAD_Y - 2);
  if (i === ZONES.length - 1) place('B', ZONE_W - 3, ROAD_Y + 1);

  // Fill the rest
  const paint = (ch, count, w, h) => {
    for (let n = 0; n < count; n++) {
      const pw = int(...w), ph = int(...h);
      const px = int(1, ZONE_W - 1 - pw), py = int(1, ZONE_H - 1 - ph);
      for (let y = py; y < py + ph; y++) {
        for (let x = px; x < px + pw; x++) if (!kept.has(`${x},${y}`) && grid[y][x] === '.') grid[y][x] = ch;
      }
    }
  };
  paint('~', 3, [2, 5], [2, 3]);
  paint('#', 9, [1, 3], [1, 3]);
  paint(',', 12, [3, 7], [2, 5]);
  // Spam grass also grows along the roads in places, so you can't always avoid it
  paint(',', 6, [2, 4], [2, 3]);
  return grid.map(row => row.join(''));
}

ZONES.forEach((z, i) => { z.rows = buildZone(i); });
const MAP = ZONES[0].rows.map((_, r) => ZONES.map(z => z.rows[r]).join(''));
const MAP_W = MAP[0].length;
const MAP_H = MAP.length;
const tileAt = (x, y) => (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H ? '#' : MAP[y][x]);
const zoneOf = x => Math.min(ZONES.length - 1, Math.max(0, Math.floor(x / ZONE_W)));
const center = (x, y) => ({ x: x * TILE + TILE / 2, y: y * TILE + TILE / 2 });

// Which sign or person is which: count them in reading order within each zone
const talkIndex = {};
const counters = {};
for (let y = 0; y < MAP_H; y++) {
  for (let x = 0; x < MAP_W; x++) {
    const t = tileAt(x, y);
    if (t !== 'S' && t !== 'N') continue;
    const key = `${zoneOf(x)}${t}`;
    counters[key] = counters[key] || 0;
    talkIndex[`${x},${y}`] = counters[key]++;
  }
}

// ---------- Saved progress ----------
const START = { x: 2, y: ROAD_Y };
const fresh = () => ({
  px: center(START.x, START.y).x, py: center(START.x, START.y).y, hp: BASE_HP, badges: [], caught: [], seen: [],
  beatBoss: false, restore: { x: 4, y: ROAD_Y + 1 }, mapVersion: MAP_VERSION,
});
let save = fresh();
let firstVisit = true;
let mapChanged = false;
try {
  const saved = JSON.parse(localStorage.getItem(ADVENTURE_KEY));
  if (saved) {
    firstVisit = false;
    if (saved.mapVersion === MAP_VERSION) {
      save = { ...save, ...saved };
    } else {
      // The world was rebuilt: start again at home, but keep every threat you've quarantined
      mapChanged = true;
      const known = id => CREATURES.some(c => c.id === id);
      save.caught = (saved.caught || []).filter(known);
      save.seen = (saved.seen || []).filter(known);
    }
  }
} catch { /* storage blocked */ }

function saveAdventure() {
  save.px = Math.round(player.x);
  save.py = Math.round(player.y);
  try { localStorage.setItem(ADVENTURE_KEY, JSON.stringify(save)); } catch { /* storage blocked */ }
}

const maxHp = () => BASE_HP + save.badges.length * HP_PER_BADGE;
// You start with Hoot and get another guardian with each badge
const myGuardians = () => GUARDIANS.slice(0, 1 + save.badges.length);

// ---------- You ----------
const player = { x: save.px, y: save.py, vx: 0, vy: 0, angle: Math.PI / 2, walk: 0, grass: 0 };
const held = new Set();
const dust = [];
const mouse = { x: 0, y: 0, active: false };   // where the mouse is on the screen
const view = { x: 0, y: 0 };                   // how far the map is scrolled (set while drawing)

// Your coder from the Locker is your face. (As an image, the SVG needs its namespace and a size.)
const coderImage = new Image();
coderImage.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(avatarSvg().replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" '))}`;
const looks = { hoodie: cosmetic(coder.look.hoodie).color, skin: cosmetic(coder.look.skin).color };
const bodyColor = looks.hoodie === 'gold' ? '#ffd23f' : looks.hoodie === 'rainbow' ? '#a66bff' : looks.hoodie;

function walkable(tx, ty) {
  const t = tileAt(tx, ty);
  if (t === 'G') return save.badges.includes(zoneOf(tx));
  return t === '.' || t === ',' || t === 'R';
}

// Would a circle at (x, y) overlap anything solid?
function blockedAt(x, y) {
  const left = Math.floor((x - RADIUS) / TILE), right = Math.floor((x + RADIUS) / TILE);
  const top = Math.floor((y - RADIUS) / TILE), bottom = Math.floor((y + RADIUS) / TILE);
  for (let ty = top; ty <= bottom; ty++) {
    for (let tx = left; tx <= right; tx++) {
      if (walkable(tx, ty)) continue;
      // Circle vs square: find the closest point of the tile
      const cx = Math.max(tx * TILE, Math.min(x, tx * TILE + TILE));
      const cy = Math.max(ty * TILE, Math.min(y, ty * TILE + TILE));
      if ((x - cx) ** 2 + (y - cy) ** 2 < RADIUS * RADIUS) return true;
    }
  }
  return false;
}

let gateWarned = 0;
function movePlayer(dt) {
  let ix = 0, iy = 0;
  if (!busy()) {
    if (held.has('left')) ix -= 1;
    if (held.has('right')) ix += 1;
    if (held.has('up')) iy -= 1;
    if (held.has('down')) iy += 1;
  }
  const len = Math.hypot(ix, iy) || 1;
  // Ease toward the target speed, so starting and stopping feel smooth
  const blend = 1 - Math.exp(-ACCEL * dt);
  const top = SPEED * (sprinting() ? SPRINT : 1);
  player.vx += ((ix / len) * top - player.vx) * blend;
  player.vy += ((iy / len) * top - player.vy) * blend;
  if (Math.abs(player.vx) < 1 && !ix) player.vx = 0;
  if (Math.abs(player.vy) < 1 && !iy) player.vy = 0;

  // Move one axis at a time so you slide along walls instead of sticking
  const nx = player.x + player.vx * dt;
  if (!blockedAt(nx, player.y)) player.x = nx; else player.vx = 0;
  const ny = player.y + player.vy * dt;
  if (!blockedAt(player.x, ny)) player.y = ny; else player.vy = 0;

  const speed = Math.hypot(player.vx, player.vy);
  // Face the mouse, like in Zombs Royale. Without a mouse (keys or touch only), face where you walk.
  let target = null;
  if (mouse.active && !busy()) target = Math.atan2(mouse.y - view.y - player.y, mouse.x - view.x - player.x);
  else if (speed > 20) target = Math.atan2(player.vy, player.vx);
  if (target !== null) {
    const diff = Math.atan2(Math.sin(target - player.angle), Math.cos(target - player.angle));
    player.angle += diff * Math.min(1, dt * (mouse.active ? 30 : 14));
  }
  if (speed > 20) {
    player.walk += speed * dt;
    if (Math.random() < dt * 9) dust.push({ x: player.x - (player.vx / speed) * 12, y: player.y + 10, life: 0.4 });
  }

  // What you're standing on
  const tx = Math.floor(player.x / TILE), ty = Math.floor(player.y / TILE);
  const t = tileAt(tx, ty);
  if (t === 'R' && (save.restore.x !== tx || save.restore.y !== ty || save.hp < maxHp())) {
    save.restore = { x: tx, y: ty };
    if (save.hp < maxHp()) {
      save.hp = maxHp();
      playSound('upgrade');
      showToast('💾 Restore Point: your data is fully restored, and you\'ll come back here if you lose.');
    }
    updateHud();
  }
  if (t === ',' && speed > 20) {
    player.grass += speed * dt;
    if (player.grass >= ENCOUNTER_EVERY) {
      player.grass = 0;
      if (Math.random() < ENCOUNTER_CHANCE) startWild();
    }
  }
  // Bumping into a locked gate explains what it needs
  if (ix || iy) {
    const ax = Math.floor((player.x + Math.cos(player.angle) * 28) / TILE);
    const ay = Math.floor((player.y + Math.sin(player.angle) * 28) / TILE);
    if (tileAt(ax, ay) === 'G' && !walkable(ax, ay) && performance.now() - gateWarned > 4000) {
      gateWarned = performance.now();
      const z = zoneOf(ax);
      showToast(`🚧 This gate needs the ${TRAINERS[z].badge}. Beat ${TRAINERS[z].name} in this zone first.`);
    }
  }
  for (const d of dust) d.life -= dt;
  while (dust.length && dust[0].life <= 0) dust.shift();
}

// ---------- Talking ----------
let talkLines = null;
let talkDone = null;

function say(lines, done = null) {
  held.clear();
  talkLines = [...lines];
  talkDone = done;
  $('talk').hidden = false;
  nextLine();
}

function nextLine() {
  if (!talkLines.length) {
    $('talk').hidden = true;
    talkLines = null;
    const done = talkDone;
    talkDone = null;
    if (done) done();
    return;
  }
  $('talk-text').textContent = talkLines.shift();
}

// The closest thing you can talk to, if any
function nearbyThing() {
  const tx = Math.floor(player.x / TILE), ty = Math.floor(player.y / TILE);
  let best = null;
  for (let y = ty - 2; y <= ty + 2; y++) {
    for (let x = tx - 2; x <= tx + 2; x++) {
      const t = tileAt(x, y);
      if (!'SNHTBG'.includes(t) || (t === 'G' && walkable(x, y))) continue;
      const c = center(x, y);
      const dist = Math.hypot(c.x - player.x, c.y - player.y);
      if (dist <= TALK_RANGE && (!best || dist < best.dist)) best = { x, y, t, dist };
    }
  }
  return best;
}

function interact() {
  if (talkLines) return nextLine();
  if (busy()) return;
  const thing = nearbyThing();
  if (!thing) return;
  const { x, y, t } = thing;
  const z = zoneOf(x);
  if (t === 'S' || t === 'N') {
    const list = ZONE_TALK[z][t];
    say(list[talkIndex[`${x},${y}`] % list.length]);
  } else if (t === 'H') {
    save.hp = maxHp();
    updateHud();
    say(['🏠 Home sweet home. You rest and your data is fully restored.']);
  } else if (t === 'T') {
    const trainer = TRAINERS[z];
    if (save.badges.includes(z)) say([`${trainer.emoji} ${trainer.name}: You already beat me. Go open that gate!`]);
    else say([`${trainer.emoji} ${trainer.name}: ${trainer.intro}`, 'Boss battle! Your guardians will fight with you.'], () => startBattle({ trainer: z }));
  } else if (t === 'B') {
    if (!save.badges.includes(ZONES.length - 1)) say(['☠️ A wall of red code blocks the way. Beat Dark Lord Dex first.']);
    else if (save.beatBoss) say(['The boss\'s lair is empty. The internet is safe, thanks to you!']);
    else say(['☠️ OMEGA RANSOMWARE: So, you made it to the end of the internet.', 'I change my tactics every turn. Let\'s see if you and your little guardians can keep up!'], () => startBattle({ boss: true }));
  } else if (t === 'G') {
    say([`🚧 This gate needs the ${TRAINERS[z].badge}. Beat ${TRAINERS[z].name} in this zone to get it.`]);
  }
}

// ---------- Battles ----------
let battle = null;

// Rarer threats show up less often
function pickByRarity(list) {
  const total = list.reduce((sum, c) => sum + rarityOf(c).weight, 0);
  let roll = Math.random() * total;
  for (const c of list) if ((roll -= rarityOf(c).weight) <= 0) return c;
  return list[list.length - 1];
}

function startWild() {
  const z = zoneOf(player.x / TILE);
  const home = CREATURES.filter(c => c.zone === z + 1);
  const older = CREATURES.filter(c => c.zone <= z && c.rarity === 'common');
  const pool = !older.length || Math.random() < 0.8 ? home : older;
  startBattle({ wild: pickByRarity(pool).id });
}

function startBattle({ wild = null, trainer = null, boss = false }) {
  held.clear();
  player.vx = player.vy = 0;
  const team = boss ? [BOSS.id] : trainer !== null ? [...TRAINERS[trainer].team] : [wild];
  const bossFight = boss || trainer !== null;
  // Guardians join boss battles, and help against the toughest wild threats too
  const withGuardians = bossFight || ['legendary', 'mythic'].includes(creature(wild)?.rarity);
  battle = {
    team, trainer, boss, wild: !!wild, bossFight, enemy: null, attack: null, shield: false, hintMove: null,
    // Guardians only join boss battles
    guardians: withGuardians ? myGuardians().map(g => ({ ...g, hp: GUARDIAN_HP, maxHp: GUARDIAN_HP, usedSpecial: false })) : [],
    active: 0,
  };
  $('battle').hidden = false;
  $('battle').classList.toggle('boss-fight', boss);
  $('player-sprite').innerHTML = avatarSvg();
  $('battle-log').innerHTML = '';
  renderGuardian();
  playSound(bossFight ? 'boss' : 'dm');
  if (battle.guardians.length) log(`Your guardians ${battle.guardians.map(g => g.emoji).join(' ')} are ready to fight!`, 'good');
  nextEnemy();
}

function nextEnemy() {
  const c = creature(battle.team.shift());
  const r = rarityOf(c);
  const hp = c === BOSS ? c.hp : Math.round(zoneHp(c.zone) * r.hp);
  battle.enemy = { c, hp, maxHp: hp, power: c === BOSS ? c.power : Math.round(zonePower(c.zone) * r.power), turn: 0 };
  if (!save.seen.includes(c.id)) save.seen.push(c.id);
  $('enemy-name').textContent = c.name;
  const tag = $('enemy-rarity');
  tag.textContent = c === BOSS ? 'Boss' : r.name;
  tag.style.background = r.color;
  // You learn a threat's type once it's in your Index; until then, read the attack!
  const known = save.caught.includes(c.id) && c !== BOSS;
  $('enemy-type').textContent = known ? DEFENSES[c.beats].type : '???';
  $('enemy-sprite').textContent = c.emoji;
  $('enemy-sprite').className = `sprite enemy-sprite enter rarity-${c.rarity}`;
  updateBattleHp();
  const rare = c !== BOSS && ['rare', 'epic', 'legendary', 'mythic'].includes(c.rarity) ? ` ✨ ${r.name.toUpperCase()}!` : '';
  const intro = battle.boss ? '☠️ The final battle begins!'
    : battle.trainer !== null ? `${TRAINERS[battle.trainer].name} sends out ${c.emoji} ${c.name}!${rare}`
    : `A wild ${c.emoji} ${c.name} appeared!${rare}`;
  log(intro, rare ? 'rare' : '');
  setTimeout(enemyTurn, 1000);
}

const guardian = () => battle.guardians[battle.active];
const guardianUp = () => battle.guardians.length > 0 && guardian().hp > 0;

function enemyTurn() {
  if (!battle) return;
  const e = battle.enemy;
  const index = battle.boss ? Math.floor(Math.random() * e.c.attacks.length) : e.turn % e.c.attacks.length;
  e.turn++;
  // The boss's weakness depends on which attack it uses
  battle.attack = { text: e.c.attacks[index], beats: (battle.boss && BOSS.mixed[index]) || e.c.beats };
  log(`${e.c.emoji} ${e.c.name} ${battle.attack.text}`, 'attack');
  showMoves();
}

function showMoves() {
  const actions = $('battle-actions');
  actions.innerHTML = '';
  actions.className = 'battle-actions moves';
  for (const [id, d] of Object.entries(DEFENSES)) {
    const boosted = guardianUp() && guardian().type === id;
    const btn = addAction(`<strong>${d.emoji} ${d.name}${boosted ? ` <em>${guardian().emoji} x${GUARDIAN_BOOST}</em>` : ''}</strong><span>${d.move}</span>`, () => useMove(id));
    btn.dataset.move = id;
  }
  if (guardianUp() && !guardian().usedSpecial) {
    addAction(`<strong>✨ ${guardian().special}</strong><span>${guardian().emoji} ${guardian().specialText} (once)</span>`, useSpecial, 'special');
  }
  const others = battle.guardians.filter((g, i) => i !== battle.active && g.hp > 0);
  if (others.length) addAction(`<strong>🔁 Switch guardian</strong><span>${others.map(g => g.emoji).join(' ')} ready</span>`, switchGuardian, 'switch');
  addAction('<strong>🙋 Ask for help</strong><span>Tell a trusted adult: +30 data</span>', askHelp, 'help');
  if (battle.wild) addAction('<strong>🏃 Run</strong><span>Leave this one alone</span>', run, 'run');
  if (battle.hintMove) {
    actions.querySelector(`[data-move="${battle.hintMove}"]`).classList.add('hinted');
    battle.hintMove = null;
  }
  actions.querySelector('button').focus();
}

function addAction(html, onClick, className = '') {
  const btn = document.createElement('button');
  btn.className = `action ${className}`;
  btn.innerHTML = html;
  btn.addEventListener('click', () => {
    $('battle-actions').querySelectorAll('button').forEach(b => { b.disabled = true; });
    onClick();
  });
  $('battle-actions').appendChild(btn);
  return btn;
}

function useMove(id) {
  const e = battle.enemy;
  const d = DEFENSES[id];
  if (id === battle.attack.beats) {
    let dmg = RIGHT_DAMAGE[0] + Math.floor(Math.random() * (RIGHT_DAMAGE[1] - RIGHT_DAMAGE[0]));
    const boosted = guardianUp() && guardian().type === id;
    if (boosted) dmg = Math.round(dmg * GUARDIAN_BOOST);
    e.hp = Math.max(0, e.hp - dmg);
    hitSprite('enemy-sprite');
    if (boosted) hitSprite('guardian-sprite', 'cheer');
    playSound('right');
    log(`You used ${d.emoji} ${d.name}. It's super effective!${boosted ? ` ${guardian().emoji} ${guardian().name} boosted it!` : ''} (-${dmg})`, 'good');
    // Show each threat's real-life tip once per battle
    if (!battle.boss && !e.tipShown) { e.tipShown = true; log(`💡 ${e.c.tip}`, 'tip'); }
    updateBattleHp();
    setTimeout(() => (e.hp <= 0 ? enemyBeaten() : enemyTurn()), 1400);
  } else {
    e.hp = Math.max(0, e.hp - WRONG_DAMAGE);
    playSound('wrong');
    const right = DEFENSES[battle.attack.beats];
    log(`You used ${d.emoji} ${d.name}. It's not very effective... (-${WRONG_DAMAGE})`, 'bad');
    updateBattleHp();
    setTimeout(() => {
      if (e.hp <= 0) return enemyBeaten();
      enemyHits(e.power, `Hint: that attack was ${right.type}. ${right.emoji} ${right.name} beats it.`);
    }, 1000);
  }
}

// Each guardian's special move. Specials don't use up your turn.
function useSpecial() {
  const g = guardian();
  g.usedSpecial = true;
  playSound('upgrade');
  hitSprite('guardian-sprite', 'cheer');
  if (g.id === 'hoot') {
    battle.hintMove = battle.attack.beats;
    log('🦉 Hoot used Scan! The glowing defense beats this attack.', 'good');
    setTimeout(showMoves, 700);
  } else if (g.id === 'shellock') {
    battle.shield = true;
    log('🐢 Shellock used Shell Shield! The next attack will bounce right off.', 'good');
    setTimeout(showMoves, 700);
  } else if (g.id === 'pup') {
    save.hp = Math.min(maxHp(), save.hp + 40);
    g.hp = Math.min(g.maxHp, g.hp + 35);
    log('🐶 Patch Pup used Patch Up! You and Patch Pup feel much better.', 'good');
    updateBattleHp();
    updateHud();
    setTimeout(showMoves, 700);
  } else if (g.id === 'verifly') {
    const e = battle.enemy;
    e.hp = Math.max(0, e.hp - 60);
    hitSprite('enemy-sprite');
    log('🦋 Verifly used Truth Burst! The disguise falls apart. (-60)', 'good');
    updateBattleHp();
    setTimeout(() => (e.hp <= 0 ? enemyBeaten() : showMoves()), 1200);
  }
}

function switchGuardian() {
  const next = battle.guardians.findIndex((g, i) => i > battle.active && g.hp > 0);
  battle.active = next >= 0 ? next : battle.guardians.findIndex(g => g.hp > 0);
  renderGuardian();
  log(`${guardian().emoji} ${guardian().name}, you're up!`);
  setTimeout(showMoves, 500);
}

function askHelp() {
  save.hp = Math.min(maxHp(), save.hp + HELP_HEAL);
  playSound('upgrade');
  log(`🙋 You told a trusted adult. They helped you stay calm. +${HELP_HEAL} data`, 'good');
  updateBattleHp();
  setTimeout(() => enemyHits(Math.round(battle.enemy.power / 2)), 1000);
}

function enemyHits(power, hint = '') {
  const e = battle.enemy;
  if (battle.shield) {
    battle.shield = false;
    log('🐢 The attack bounced off Shellock\'s shell!', 'good');
    if (hint) log(`💡 ${hint}`, 'tip');
    return setTimeout(enemyTurn, 1300);
  }
  const dmg = Math.round(power * (0.85 + Math.random() * 0.3));
  // A guardian takes the hit for you while it can
  if (guardianUp()) {
    const g = guardian();
    g.hp = Math.max(0, g.hp - dmg);
    hitSprite('guardian-sprite');
    log(`${e.c.emoji} ${e.c.name} hit ${g.emoji} ${g.name}! -${dmg}`, 'bad');
    if (g.hp <= 0) {
      log(`${g.emoji} ${g.name} is worn out!`, 'bad');
      const next = battle.guardians.findIndex(x => x.hp > 0);
      if (next >= 0) {
        battle.active = next;
        log(`${guardian().emoji} ${guardian().name} jumps in!`, 'good');
      }
      renderGuardian();
    }
  } else {
    save.hp = Math.max(0, save.hp - dmg);
    hitSprite('player-sprite');
    log(`${e.c.emoji} ${e.c.name} got through! -${dmg} data`, 'bad');
  }
  playSound('leak');
  if (hint) log(`💡 ${hint}`, 'tip');
  updateBattleHp();
  updateHud();
  setTimeout(() => (save.hp <= 0 ? lostBattle() : enemyTurn()), 1500);
}

function run() {
  log('🏃 You got away safely.');
  setTimeout(endBattle, 700);
}

function enemyBeaten() {
  const c = battle.enemy.c;
  $('enemy-sprite').className = 'sprite enemy-sprite beaten';
  log(`${c.emoji} ${c.name} was blocked!`, 'good');
  if (battle.boss) return setTimeout(wonBoss, 1200);
  if (battle.team.length) return setTimeout(nextEnemy, 1300);
  if (battle.trainer !== null) return setTimeout(wonTrainer, 1000);

  // A wild threat: offer to quarantine it
  if (save.caught.includes(c.id)) {
    log(`(${c.name} is already in your Threat Index.)`);
    return setTimeout(endBattle, 1300);
  }
  const actions = $('battle-actions');
  actions.innerHTML = '';
  actions.className = 'battle-actions';
  const hard = ['rare', 'epic', 'legendary', 'mythic'].includes(c.rarity) ? ` It's ${rarityOf(c).name}, so the questions are harder!` : '';
  addAction(`<strong>🧪 Quarantine it</strong><span>Get ${CATCH_NEEDED} questions right in ${CATCH_TIME} seconds.${hard}</span>`, () => quarantine(c), 'quarantine').focus();
  addAction('<strong>Leave it</strong><span>Keep exploring</span>', endBattle);
}

// ---------- Quarantine (catching) ----------
// Answer 7 questions right in 30 seconds, from a never-ending stream. The rarer the threat,
// the harder the questions. Run out of time and it escapes.
const CATCH_NEEDED = 7;
const CATCH_TIME = 30;
const CATCH_WRONG_COST = 2;   // a wrong answer also costs this many seconds
// Which question levels each rarity tier draws from
const CATCH_LEVELS = { 1: [1], 2: [2], 3: [2, 3], 4: [3] };

function catchPool(tier) {
  const levels = CATCH_LEVELS[tier];
  const choice = [
    ...Object.values(UPGRADES).flat(),
    ...SKILLS.flatMap(skill => skill.questions.map(q => ({ ...q, level: skill.level <= 30 ? 2 : 3 }))),
    ...BOSS_QUESTIONS.map(q => ({ ...q, level: q.level || 2 })),
    ...FINAL_BOSS_QUESTIONS.map(q => ({ ...q, level: 3 })),
  ].filter(q => levels.includes(q.level || 1));
  // Real or Scam messages are quick to read, so they mix in too
  const realOrScam = QUIZ.filter(q => levels.includes(q.level || 1)).map(q => ({
    msg: q, prompt: 'Real or scam?', level: q.level,
    options: [
      { text: '✅ Real', correct: q.answer === 'real', why: q.why },
      { text: '🚩 Scam', correct: q.answer === 'scam', why: q.why },
    ],
  }));
  return [...choice, ...realOrScam];
}

let catching = null;

function quarantine(c) {
  const tier = rarityOf(c).tier;
  catching = { c, pool: catchPool(tier), asked: new Set(), right: 0, left: CATCH_TIME, busy: false, last: performance.now() };
  log(`🧪 Quarantine! Get ${CATCH_NEEDED} right in ${CATCH_TIME} seconds before ${c.name} escapes!`, 'question');
  catching.timer = setInterval(catchTick, 100);
  nextCatchQuestion();
}

function nextCatchQuestion() {
  const k = catching;
  let fresh = k.pool.filter(q => !k.asked.has(q));
  if (!fresh.length) { k.asked.clear(); fresh = k.pool; }
  const q = pickRandom(fresh);
  k.asked.add(q);
  k.busy = false;

  const actions = $('battle-actions');
  actions.innerHTML = `
    <div class="catch-head">
      <span class="catch-time"><span id="catch-fill"></span></span>
      <strong id="catch-left"></strong>
      <span class="catch-dots">${Array.from({ length: CATCH_NEEDED }, (_, i) => `<span class="${i < k.right ? 'on' : ''}"></span>`).join('')}</span>
    </div>
    <p class="catch-q"></p>`;
  actions.className = 'battle-actions catching';
  actions.querySelector('.catch-q').textContent = q.prompt;
  if (q.msg) {
    const box = document.createElement('div');
    box.className = 'message catch-msg';
    box.innerHTML = '<div class="msg-from"><span></span><span class="msg-meta"></span></div>';
    box.querySelector('span').textContent = q.msg.from;
    box.querySelector('.msg-meta').textContent = q.msg.meta || '';
    for (const [key, cls] of [['note', 'msg-note'], ['text', 'msg-text'], ['link', 'msg-link']]) {
      if (!q.msg[key]) continue;
      const el = document.createElement('p');
      el.className = cls;
      el.textContent = (key === 'link' ? '🔗 ' : '') + q.msg[key];
      box.appendChild(el);
    }
    actions.appendChild(box);
  }
  for (const opt of shuffle(q.options)) {
    const btn = document.createElement('button');
    btn.className = 'action answer';
    btn.textContent = opt.text;
    btn.addEventListener('click', () => answerCatch(btn, opt, q));
    actions.appendChild(btn);
  }
  updateCatchTimer();
  actions.querySelector('.answer').focus();
}

function answerCatch(btn, opt, q) {
  const k = catching;
  if (!k || k.busy) return;
  k.busy = true;
  $('battle-actions').querySelectorAll('.answer').forEach(b => {
    b.disabled = true;
    if (q.options.find(o => o.text === b.textContent)?.correct) b.classList.add('right');
  });
  if (opt.correct) {
    k.right++;
    playSound('right');
    if (k.right >= CATCH_NEEDED) return caught();
    setTimeout(() => catching === k && nextCatchQuestion(), 350);
  } else {
    btn.classList.add('wrong');
    k.left = Math.max(0, k.left - CATCH_WRONG_COST);
    playSound('wrong');
    // Leave the right answer up a moment so you can learn from it
    setTimeout(() => catching === k && nextCatchQuestion(), 1100);
  }
  $('battle-actions').querySelectorAll('.catch-dots span').forEach((dot, i) => dot.classList.toggle('on', i < k.right));
}

function catchTick() {
  const k = catching;
  if (!k) return;
  const now = performance.now();
  k.left -= (now - k.last) / 1000;
  k.last = now;
  updateCatchTimer();
  if (k.left <= 0) escaped();
}

function updateCatchTimer() {
  const k = catching;
  const fill = $('catch-fill');
  if (!fill) return;
  fill.style.width = `${Math.max(0, (k.left / CATCH_TIME) * 100)}%`;
  fill.className = k.left < 8 ? 'low' : '';
  $('catch-left').textContent = `${Math.max(0, Math.ceil(k.left))}s`;
}

function stopCatching() {
  clearInterval(catching.timer);
  const c = catching.c;
  catching = null;
  return c;
}

function caught() {
  const c = stopCatching();
  save.caught.push(c.id);
  playSound('badge');
  $('battle-actions').innerHTML = '';
  log(`🧪 ${CATCH_NEEDED} right! ${c.emoji} ${c.name} was quarantined and added to your Threat Index.`, 'good');
  $('enemy-sprite').className = 'sprite enemy-sprite caught';
  saveAdventure();
  updateHud();
  setTimeout(() => { endBattle(); openIndex(c.id); }, 1600);
}

function escaped() {
  const right = catching.right;
  const c = stopCatching();
  playSound('wrong');
  $('battle-actions').innerHTML = '';
  log(`⏰ Time's up! You got ${right} of ${CATCH_NEEDED}. ${c.emoji} ${c.name} escaped!`, 'bad');
  $('enemy-sprite').className = 'sprite enemy-sprite fled';
  setTimeout(endBattle, 2000);
}

// ---------- How battles end ----------
function wonTrainer() {
  const z = battle.trainer;
  const trainer = TRAINERS[z];
  save.badges.push(z);
  save.hp = maxHp();
  saveAdventure();
  endBattle();
  playSound('badge');
  const newGuardian = GUARDIANS[save.badges.length];
  say([
    `${trainer.emoji} ${trainer.name}: ${trainer.outro}`,
    `You got the ${trainer.badge}! Your max data went up to ${maxHp()}.`,
    ...(newGuardian ? [`${newGuardian.emoji} ${newGuardian.name} joined your guardians! ${newGuardian.about} Special move: ${newGuardian.special}.`] : []),
    z < ZONES.length - 1 ? 'The gate to the next zone is open!' : 'Now nothing stands between you and Omega Ransomware...',
  ]);
}

function wonBoss() {
  save.beatBoss = true;
  saveAdventure();
  endBattle();
  playSound('badge');
  $('win-coder').innerHTML = avatarSvg();
  $('win-text').textContent = `You and your guardians beat Omega Ransomware and saved the internet! You've quarantined ${save.caught.length} of ${CREATURES.length} threats. Keep exploring to find the rare ones.`;
  makeConfetti();
  $('dlg-win').showModal();
}

function lostBattle() {
  log('💥 Your data leaked!', 'bad');
  setTimeout(() => {
    endBattle();
    save.hp = maxHp();
    const spot = center(save.restore.x, save.restore.y);
    player.x = camera.x = spot.x;
    player.y = camera.y = spot.y;
    saveAdventure();
    updateHud();
    say(['💾 You wake up at your last Restore Point with your data restored.', 'Tip: if you\'re not sure which defense to use, read the attack again. What is it trying to get from you?']);
  }, 1300);
}

function endBattle() {
  battle = null;
  $('battle').hidden = true;
  updateHud();
  saveAdventure();
}

// ---------- Battle display ----------
function log(text, kind = '') {
  const line = document.createElement('p');
  line.className = kind;
  line.textContent = text;
  const box = $('battle-log');
  box.appendChild(line);
  while (box.children.length > 5) box.firstChild.remove();
}

function setBar(id, value, max) {
  const fill = $(id);
  fill.style.width = `${Math.max(0, (value / max) * 100)}%`;
  fill.className = value / max < 0.3 ? 'low' : '';
}

function updateBattleHp() {
  if (!battle || !battle.enemy) return;
  setBar('enemy-hp-fill', battle.enemy.hp, battle.enemy.maxHp);
  setBar('player-hp-fill', save.hp, maxHp());
  $('player-hp-text').textContent = `${save.hp} / ${maxHp()}`;
  if (battle.guardians.length) {
    const g = guardian();
    setBar('guardian-hp-fill', g.hp, g.maxHp);
    $('guardian-hp-text').textContent = `${g.hp} / ${g.maxHp}`;
  }
}

function renderGuardian() {
  $('guardian').hidden = !battle.guardians.length;
  if (!battle.guardians.length) return;
  const g = guardian();
  $('guardian-sprite').textContent = g.emoji;
  $('guardian-sprite').classList.toggle('tired', g.hp <= 0);
  $('guardian-name').textContent = g.name;
  $('guardian-type').textContent = DEFENSES[g.type].type;
  $('guardian-team').textContent = battle.guardians.map(x => (x.hp > 0 ? x.emoji : '💤')).join(' ');
  updateBattleHp();
}

function hitSprite(id, kind = 'hit') {
  const el = $(id);
  el.classList.remove('hit', 'cheer');
  void el.offsetWidth;
  el.classList.add(kind);
}

// ---------- Threat Index ----------
const indexDialog = $('dlg-index');
const RARITY_ORDER = Object.keys(RARITY);

function openIndex(focusId = null) {
  const dex = $('dex');
  dex.innerHTML = '';
  // Your guardians first
  dex.insertAdjacentHTML('beforeend', '<p class="dex-section">Your guardians</p>');
  for (const g of GUARDIANS) {
    const have = myGuardians().includes(g);
    const btn = document.createElement('button');
    btn.className = `dex-entry guardian ${have ? 'caught' : 'unknown'}`;
    btn.innerHTML = `<span class="dex-emoji">${have ? g.emoji : '❓'}</span><span class="dex-name">${have ? g.name : '???'}</span><span class="dex-rarity">Guardian</span>`;
    btn.addEventListener('click', () => showGuardian(g, have));
    dex.appendChild(btn);
  }
  // Then the threats, grouped by the area you find them in, from Common up to Mythic
  ZONES.forEach((zone, i) => {
    const list = CREATURES.filter(c => c.zone === i + 1)
      .sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity));
    const got = list.filter(c => save.caught.includes(c.id)).length;
    const section = document.createElement('p');
    section.className = 'dex-section';
    section.textContent = `📍 ${zone.name}`;
    section.insertAdjacentHTML('beforeend', `<span class="dex-count">${got}/${list.length}</span>`);
    dex.appendChild(section);
    // Omega waits at the end of the last area
    for (const c of i === ZONES.length - 1 ? [...list, BOSS] : list) addDexEntry(c, focusId);
  });
  const counts = RARITY_ORDER.map(k => {
    const all = CREATURES.filter(c => c.rarity === k);
    return `${RARITY[k].name} ${all.filter(c => save.caught.includes(c.id)).length}/${all.length}`;
  });
  $('index-summary').textContent = `Quarantined ${save.caught.length} of ${CREATURES.length} threats · ${counts.join(' · ')}`;
  $('dex-detail').hidden = true;
  if (!indexDialog.open) indexDialog.showModal();
}

function addDexEntry(c, focusId) {
  const caught = save.caught.includes(c.id) || (c === BOSS && save.beatBoss);
  const seen = save.seen.includes(c.id);
  const r = rarityOf(c);
  const btn = document.createElement('button');
  btn.className = `dex-entry ${caught ? 'caught' : seen ? 'seen' : 'unknown'}`;
  btn.style.setProperty('--rarity', r.color);
  btn.innerHTML = `<span class="dex-emoji">${caught || seen ? c.emoji : '❓'}</span><span class="dex-name">${caught || seen ? c.name : '???'}</span><span class="dex-rarity">${c === BOSS ? 'Boss' : r.name}</span>`;
  btn.addEventListener('click', () => showDex(c, caught, seen));
  $('dex').appendChild(btn);
  if (c.id === focusId) setTimeout(() => btn.click());
}

function showDex(c, caught, seen) {
  const box = $('dex-detail');
  const r = rarityOf(c);
  const rarityTag = `<span class="type-tag" style="background:${r.color}">${c === BOSS ? 'Boss' : r.name}</span>`;
  box.hidden = false;
  box.style.setProperty('--rarity', r.color);
  if (!caught) {
    box.innerHTML = `<p class="dex-title">${seen ? `${c.emoji} ${c.name}` : '❓ Unknown threat'} ${rarityTag}</p><p>${seen ? 'You\'ve met it, but it isn\'t quarantined yet. Beat it in the wild, then pass the quarantine challenge.' : `Explore the spam grass to find it.${c.zone ? ` It lives in ${ZONES[c.zone - 1].name}.` : ''}`}</p>`;
    return;
  }
  const d = DEFENSES[c.beats];
  box.innerHTML = `
    <p class="dex-title">${c.emoji} ${c.name} ${rarityTag} <span class="type-tag">${c === BOSS ? 'Boss' : d.type}</span></p>
    <p></p>
    <p class="dex-weak">Beaten by: ${c === BOSS ? 'reading every attack' : `${d.emoji} ${d.name}`}</p>
    <p class="dex-tip">💡 </p>`;
  box.children[1].textContent = c.about;
  box.querySelector('.dex-tip').textContent += c.tip;
}

function showGuardian(g, have) {
  const box = $('dex-detail');
  box.hidden = false;
  box.style.setProperty('--rarity', 'var(--cyan)');
  const d = DEFENSES[g.type];
  box.innerHTML = have
    ? `<p class="dex-title">${g.emoji} ${g.name} <span class="type-tag me">Guardian</span></p><p>${g.about}</p><p class="dex-weak">Boosts ${d.emoji} ${d.name} by x${GUARDIAN_BOOST} in boss battles.</p><p class="dex-tip">✨ Special: ${g.special}. ${g.specialText}.</p>`
    : '<p class="dex-title">❓ A guardian you haven\'t met</p><p>Beat a hacker trainer to earn the next guardian.</p>';
}

$('btn-index').addEventListener('click', () => { if (!busy()) openIndex(); });
$('index-close').addEventListener('click', () => indexDialog.close());

// ---------- HUD ----------
function updateHud() {
  $('zone-name').textContent = `📍 ${ZONES[zoneOf(player.x / TILE)].name}`;
  $('hud-hp').textContent = `${save.hp}/${maxHp()}`;
  setBar('hud-hp-fill', save.hp, maxHp());
  $('badges').innerHTML = TRAINERS.map((t, i) => `<span class="${save.badges.includes(i) ? 'on' : ''}" title="${t.badge}${save.badges.includes(i) ? '' : ' (not yet)'}">${t.badge.split(' ')[0]}</span>`).join('');
  $('index-count').textContent = `${save.caught.length}/${CREATURES.length}`;
}

let toastTimer;
function showToast(message) {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

function makeConfetti() {
  const box = $('confetti');
  box.innerHTML = '';
  const colors = ['#2ee6ff', '#ffd23f', '#ff3d8b', '#7cff6b', '#c58bff'];
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('span');
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.6}s`;
    piece.style.animationDuration = `${1.6 + Math.random() * 1.2}s`;
    box.appendChild(piece);
  }
}

// ---------- Input ----------
const busy = () => !!battle || !!talkLines || !!document.querySelector('dialog[open]');
const KEYS = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };

document.addEventListener('keydown', e => {
  if (document.querySelector('dialog[open]')) return;
  if (KEYS[e.key] && !battle) {
    e.preventDefault();
    if (!talkLines) held.add(KEYS[e.key]);
  } else if ((e.key === ' ' || e.key === 'Enter' || e.key === 'e' || e.key === 'E') && !battle) {
    e.preventDefault();
    interact();
  } else if ((e.key === 'i' || e.key === 'I') && !busy()) {
    openIndex();
  }
});
document.addEventListener('keyup', e => {
  if (KEYS[e.key]) held.delete(KEYS[e.key]);
  if (e.key === 'Shift') shiftHeld = false;
});

// Running: hold Shift, or click Run to keep it on (remembered on this computer)
const SPRINT_KEY = 'defenders-of-data-sprint';
let shiftHeld = false;
let runOn = false;
try { runOn = localStorage.getItem(SPRINT_KEY) === '1'; } catch { /* storage blocked */ }
const sprinting = () => runOn !== shiftHeld;   // Shift flips it either way
function setRun(on) {
  runOn = on;
  $('btn-sprint').setAttribute('aria-pressed', on);
  $('btn-sprint').classList.toggle('on', on);
  try { localStorage.setItem(SPRINT_KEY, on ? '1' : '0'); } catch { /* storage blocked */ }
}
// (Blur it after clicking so Space still talks instead of pressing the button again)
$('btn-sprint').addEventListener('click', e => { setRun(!runOn); e.currentTarget.blur(); });
setRun(runOn);
document.addEventListener('keydown', e => { if (e.key === 'Shift') shiftHeld = true; });
window.addEventListener('blur', () => { held.clear(); shiftHeld = false; });

// On-screen pad: hold a direction to keep walking
for (const btn of document.querySelectorAll('.pad button')) {
  const dir = btn.dataset.dir;
  if (dir === 'act') {
    btn.addEventListener('click', interact);
    continue;
  }
  btn.addEventListener('pointerdown', e => { e.preventDefault(); if (!busy()) held.add(dir); });
  for (const end of ['pointerup', 'pointerleave', 'pointercancel']) btn.addEventListener(end, () => held.delete(dir));
}
$('talk').addEventListener('click', () => { if (talkLines) nextLine(); });

// ---------- Drawing ----------
const canvas = $('world');
const ctx = canvas.getContext('2d');
const camera = { x: player.x, y: player.y };

// The canvas always matches its box exactly (so nothing gets stretched when the top bar
// changes height), and draws at the screen's real pixel density so it stays sharp.
let viewW = 0, viewH = 0, dpr = 1;
function resize() {
  const wrap = $('world-wrap');
  dpr = window.devicePixelRatio || 1;
  viewW = wrap.clientWidth;
  viewH = wrap.clientHeight;
  canvas.width = Math.round(viewW * dpr);
  canvas.height = Math.round(viewH * dpr);
}
new ResizeObserver(resize).observe($('world-wrap'));
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
  mouse.active = true;
});
canvas.addEventListener('mouseleave', () => { mouse.active = false; });

const TILE_ICONS = { H: '🏠', R: '💾', S: '🪧', B: '☠️' };
const PEOPLE = ['👩', '🧑‍🎤', '🧑‍🔧', '🕵️‍♀️'];

function drawTiles(time, x0, x1, y0, y1) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const t = tileAt(x, y);
      const zone = ZONES[zoneOf(x)];
      const sx = x * TILE, sy = y * TILE;
      ctx.fillStyle = zone.ground;
      ctx.fillRect(sx, sy, TILE, TILE);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.strokeRect(sx + 0.5, sy + 0.5, TILE - 1, TILE - 1);

      if (t === ',') {
        ctx.fillStyle = zone.grass;
        ctx.fillRect(sx + 1, sy + 1, TILE - 2, TILE - 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 2;
        const sway = Math.sin(time / 600 + x + y) * 2;
        for (const [bx, by] of [[12, 30], [24, 22], [36, 32], [18, 40]]) {
          ctx.beginPath();
          ctx.moveTo(sx + bx, sy + by + 6);
          ctx.lineTo(sx + bx + sway, sy + by - 4);
          ctx.stroke();
        }
      } else if (t === '~') {
        ctx.fillStyle = '#0d3a66';
        ctx.fillRect(sx, sy, TILE, TILE);
        ctx.fillStyle = 'rgba(46, 230, 255, 0.5)';
        ctx.font = '11px Consolas, monospace';
        const shift = ((time / 25) + y * 13) % TILE;
        ctx.fillText((x + y) % 2 ? '1 0 1' : '0 1 1', sx + TILE / 2, sy + shift);
      } else if (t === '#') {
        ctx.font = '34px serif';
        ctx.fillText(zone.wall, sx + TILE / 2, sy + TILE / 2 + 2);
      } else if (t === 'G') {
        const open = walkable(x, y);
        ctx.font = '30px serif';
        ctx.globalAlpha = open ? 0.35 : 1;
        ctx.fillText(open ? '✅' : '🚧', sx + TILE / 2, sy + TILE / 2 + 2);
        ctx.globalAlpha = 1;
      } else if (TILE_ICONS[t]) {
        if (t === 'R') {
          ctx.fillStyle = 'rgba(46, 230, 255, 0.15)';
          ctx.beginPath();
          ctx.arc(sx + TILE / 2, sy + TILE / 2, 20 + Math.sin(time / 300) * 2, 0, Math.PI * 2);
          ctx.fill();
        }
        if (t === 'B' && !save.beatBoss) {
          ctx.shadowColor = '#ff2050';
          ctx.shadowBlur = 16 + Math.sin(time / 200) * 8;
        }
        ctx.font = t === 'B' ? '38px serif' : '30px serif';
        ctx.fillText(t === 'B' && save.beatBoss ? '🏆' : TILE_ICONS[t], sx + TILE / 2, sy + TILE / 2 + 2);
        ctx.shadowBlur = 0;
      } else if (t === 'N') {
        ctx.font = '30px serif';
        ctx.fillText(PEOPLE[zoneOf(x)], sx + TILE / 2, sy + TILE / 2 + 2 + Math.sin(time / 500 + x) * 1.5);
      } else if (t === 'T') {
        const z = zoneOf(x);
        ctx.font = '30px serif';
        ctx.fillText(TRAINERS[z].emoji, sx + TILE / 2, sy + TILE / 2 + 2);
        if (!save.badges.includes(z)) {
          ctx.font = 'bold 16px Nunito, sans-serif';
          ctx.fillStyle = '#ff3d8b';
          ctx.fillText('!', sx + TILE / 2 + 14, sy + 8 + Math.sin(time / 200) * 2);
        }
      }
    }
  }
}

// You, seen from above: a round body with your coder's face, and hands that swing as you walk
function drawPlayer() {
  const { x, y, angle } = player;
  const R = BODY_SIZE;
  const moving = Math.hypot(player.vx, player.vy) > 20;
  const swing = moving ? Math.sin(player.walk / 9) * 6 : 0;

  for (const d of dust) {
    ctx.globalAlpha = Math.max(0, d.life * 1.2);
    ctx.fillStyle = 'rgba(200, 220, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(d.x, d.y, 3 + (0.4 - d.life) * 8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(x, y + R - 2, R, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hands, out in front in the direction you're facing, swinging opposite each other
  for (const side of [-1, 1]) {
    const a = angle + side * 0.75;
    const push = swing * side * 0.6;
    const hx = x + Math.cos(a) * (R + 3) + Math.cos(angle) * push;
    const hy = y + Math.sin(a) * (R + 3) + Math.sin(angle) * push;
    ctx.fillStyle = looks.skin;
    ctx.strokeStyle = '#1d1b22';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(hx, hy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Body ring in your hoodie color
  ctx.fillStyle = bodyColor;
  ctx.strokeStyle = '#1d1b22';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, R + 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Your coder's face inside, turned so the top of your head points where you're facing
  if (coderImage.complete && coderImage.naturalWidth) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);
    ctx.beginPath();
    ctx.arc(0, 0, R - 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(coderImage, 22, 18, 76, 76, -R + 2, -R + 2, (R - 2) * 2, (R - 2) * 2);
    ctx.restore();
  }
}

// A little "Space" bubble over whatever you can talk to
function drawPrompt(time) {
  const thing = busy() ? null : nearbyThing();
  if (!thing) return;
  const c = center(thing.x, thing.y);
  const bob = Math.sin(time / 250) * 2;
  ctx.fillStyle = 'rgba(14, 21, 56, 0.92)';
  ctx.strokeStyle = '#2ee6ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(c.x - 30, c.y - TILE + bob - 6, 60, 22, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#e8f1ff';
  ctx.font = 'bold 12px Nunito, sans-serif';
  ctx.fillText('Space', c.x, c.y - TILE + bob + 5);
}

function draw(time, dt) {
  // The camera glides after you instead of snapping
  const follow = 1 - Math.exp(-8 * dt);
  camera.x += (player.x - camera.x) * follow;
  camera.y += (player.y - camera.y) * follow;
  const mapW = MAP_W * TILE, mapH = MAP_H * TILE;
  const offX = mapW < viewW ? (viewW - mapW) / 2 : -Math.max(0, Math.min(mapW - viewW, camera.x - viewW / 2));
  const offY = mapH < viewH ? (viewH - mapH) / 2 : -Math.max(0, Math.min(mapH - viewH, camera.y - viewH / 2));

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = '#070b1f';
  ctx.fillRect(0, 0, viewW, viewH);
  ctx.save();
  view.x = Math.round(offX);
  view.y = Math.round(offY);
  ctx.translate(view.x, view.y);
  const x0 = Math.max(0, Math.floor(-offX / TILE)), x1 = Math.min(MAP_W, Math.ceil((viewW - offX) / TILE));
  const y0 = Math.max(0, Math.floor(-offY / TILE)), y1 = Math.min(MAP_H, Math.ceil((viewH - offY) / TILE));
  drawTiles(time, x0, x1, y0, y1);
  drawPlayer();
  drawPrompt(time);

  // Zone names on the map, so you can see where you're heading
  ctx.font = 'bold 13px Nunito, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ZONES.forEach((z, i) => ctx.fillText(z.name.toUpperCase(), (i * ZONE_W + ZONE_W / 2) * TILE, TILE * (MAP_H - 0.5)));
  ctx.restore();
  drawMinimap();
}

// A small map of the area you're in, in the top-right corner
const MINI = 4;   // pixels per square
const MINI_COLORS = { '#': '#05070f', '~': '#1a5a9a', R: '#2ee6ff', S: '#e8f1ff', N: '#7cff6b', T: '#ff3d8b', G: '#ffd23f', B: '#ff2050', H: '#ffd23f' };
const minimaps = ZONES.map((z, i) => {
  const mini = document.createElement('canvas');
  mini.width = ZONE_W * MINI;
  mini.height = ZONE_H * MINI;
  const m = mini.getContext('2d');
  for (let y = 0; y < ZONE_H; y++) {
    for (let x = 0; x < ZONE_W; x++) {
      const ch = z.rows[y][x];
      m.fillStyle = MINI_COLORS[ch] || (ch === ',' ? z.grass : z.ground);
      m.fillRect(x * MINI, y * MINI, MINI, MINI);
    }
  }
  return mini;
});

function drawMinimap() {
  const z = zoneOf(player.x / TILE);
  const w = ZONE_W * MINI, h = ZONE_H * MINI;
  const x = viewW - w - 12, y = 12;
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = 'rgba(7, 11, 31, 0.9)';
  ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
  ctx.drawImage(minimaps[z], x, y);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = '#1a7f99';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 4, y - 4, w + 8, h + 8);
  // You
  const px = x + (player.x / TILE - z * ZONE_W) * MINI, py = y + (player.y / TILE) * MINI;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(px, py, 3, 0, Math.PI * 2);
  ctx.fill();
}

// ---------- Main loop ----------
let last = performance.now();
let sinceSave = 0;
let lastZone = zoneOf(player.x / TILE);
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  movePlayer(dt);
  const zone = zoneOf(player.x / TILE);
  if (zone !== lastZone) { lastZone = zone; updateHud(); showToast(`📍 ${ZONES[zone].name}`); }
  if ((sinceSave += dt) > 5) { sinceSave = 0; saveAdventure(); }
  draw(now, dt);
  requestAnimationFrame(loop);
}

// ---------- Start ----------
$('btn-help').addEventListener('click', () => $('dlg-help').showModal());
$('help-go').addEventListener('click', () => {
  $('dlg-help').close();
  if (firstVisit) {
    firstVisit = false;
    say(['🏠 This is your Home Network. Head right through the spam grass to explore the internet.', '🦉 Hoot the owl is your first guardian! Guardians fight beside you in boss battles. Beat hacker trainers to get more.', 'Talk to 👩 Mom and read the 🪧 signs for tips. Good luck, Defender!']);
  }
});
$('win-go').addEventListener('click', () => $('dlg-win').close());
window.addEventListener('beforeunload', saveAdventure);

resize();
$('hud-coder').innerHTML = avatarSvg();
updateHud();
if (firstVisit) $('dlg-help').showModal();
else if (mapChanged) say(['🌐 The internet got a LOT bigger! There are now 6 areas and 60 threats to find.', 'You are back home to start the new journey, and every threat you quarantined is still in your Index.']);
requestAnimationFrame(loop);
