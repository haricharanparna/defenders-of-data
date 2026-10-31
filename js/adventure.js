// Adventure mode: walk around "the internet", battle the threats hiding in spam grass,
// quarantine them into your Threat Index, and beat hacker trainers to open the gates.
// Content (threats, map, people) lives in adventure-data.js.

const $ = id => document.getElementById(id);
const ADVENTURE_KEY = 'defenders-of-data-adventure';

const TILE = 48;
const ZONE_W = 16;
const STEP_TIME = 0.14;          // seconds to walk one tile
const ENCOUNTER_CHANCE = 0.13;   // chance of a wild threat on each step in spam grass
const BASE_HP = 100;
const HP_PER_BADGE = 20;
const RIGHT_DAMAGE = [42, 55];   // super effective hits
const WRONG_DAMAGE = 12;
const HELP_HEAL = 30;

const pickRandom = list => list[Math.floor(Math.random() * list.length)];
const shuffle = list => list.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);
const creature = id => (id === BOSS.id ? BOSS : CREATURES.find(c => c.id === id));

// ---------- The world ----------
const MAP = ZONES[0].rows.map((_, r) => ZONES.map(z => z.rows[r]).join(''));
const MAP_W = MAP[0].length;
const MAP_H = MAP.length;
const tileAt = (x, y) => (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H ? '#' : MAP[y][x]);
const zoneOf = x => Math.min(ZONES.length - 1, Math.max(0, Math.floor(x / ZONE_W)));

// Which sign or person is which: count them in reading order within each zone
const talkIndex = {};
for (let y = 0; y < MAP_H; y++) {
  for (let x = 0; x < MAP_W; x++) {
    const t = tileAt(x, y);
    if (t !== 'S' && t !== 'N') continue;
    const z = zoneOf(x);
    const key = `${z}${t}`;
    talkIndex[key] = (talkIndex[key] || 0);
    talkIndex[`${x},${y}`] = talkIndex[key]++;
  }
}

// ---------- Saved progress ----------
let save = {
  x: 2, y: 1, hp: BASE_HP, badges: [], caught: [], seen: [], beatBoss: false,
  restore: { x: 2, y: 1 },
};
let firstVisit = true;
try {
  const saved = JSON.parse(localStorage.getItem(ADVENTURE_KEY));
  if (saved) { save = { ...save, ...saved }; firstVisit = false; }
} catch { /* storage blocked */ }

function saveAdventure() {
  try { localStorage.setItem(ADVENTURE_KEY, JSON.stringify(save)); } catch { /* storage blocked */ }
}

const maxHp = () => BASE_HP + save.badges.length * HP_PER_BADGE;

// ---------- Player ----------
const player = { x: save.x, y: save.y, fromX: save.x, fromY: save.y, t: 1, facing: 'down' };
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const held = new Set();

// Your coder from the Locker is your character. (As an image, the SVG needs its namespace and a size.)
const coderImage = new Image();
coderImage.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(avatarSvg().replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" '))}`;

function canWalk(x, y) {
  const t = tileAt(x, y);
  if (t === 'G') return save.badges.includes(zoneOf(x));
  return t === '.' || t === ',' || t === 'R';
}

function tryMove(dir) {
  if (busy() || player.t < 1) return;
  player.facing = dir;
  const [dx, dy] = DIRS[dir];
  const nx = player.x + dx, ny = player.y + dy;
  if (!canWalk(nx, ny)) {
    if (tileAt(nx, ny) === 'G') say([`🚧 A firewall gate. You need the badge from this zone's hacker trainer to pass.`]);
    return;
  }
  player.fromX = player.x;
  player.fromY = player.y;
  player.x = nx;
  player.y = ny;
  player.t = 0;
}

// Called when the player finishes walking onto a tile
function arrived() {
  save.x = player.x;
  save.y = player.y;
  const t = tileAt(player.x, player.y);
  if (t === 'R') {
    save.restore = { x: player.x, y: player.y };
    if (save.hp < maxHp()) {
      save.hp = maxHp();
      playSound('upgrade');
      showToast('💾 Restore Point: your data is fully restored, and you\'ll come back here if you lose.');
    }
  }
  if (t === ',' && Math.random() < ENCOUNTER_CHANCE) startWild();
  updateHud();
  saveAdventure();
}

// ---------- Talking ----------
let talkLines = null;
let talkDone = null;

function say(lines, done = null) {
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

function interact() {
  if (talkLines) return nextLine();
  if (busy()) return;
  const [dx, dy] = DIRS[player.facing];
  const x = player.x + dx, y = player.y + dy;
  const t = tileAt(x, y);
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
    else say([`${trainer.emoji} ${trainer.name}: ${trainer.intro}`], () => startBattle({ trainer: z }));
  } else if (t === 'B') {
    if (!save.badges.includes(ZONES.length - 1)) say(['☠️ A wall of red code blocks the way. Beat Dark Lord Dex first.']);
    else if (save.beatBoss) say(['The boss\'s lair is empty. The internet is safe, thanks to you!']);
    else say(['☠️ OMEGA RANSOMWARE: So, you made it to the end of the internet.', 'I change my tactics every turn. Let\'s see if you can keep up!'], () => startBattle({ boss: true }));
  } else if (t === 'G' && !save.badges.includes(z)) {
    say([`🚧 This gate needs the ${TRAINERS[z].badge}. Beat ${TRAINERS[z].name} in this zone to get it.`]);
  }
}

// ---------- Battles ----------
let battle = null;

function startWild() {
  const z = zoneOf(player.x);
  const home = CREATURES.filter(c => c.zone === z + 1 && (!c.rare || Math.random() < 0.25));
  const older = CREATURES.filter(c => c.zone <= z && !c.rare);
  const pool = home.length && (Math.random() < 0.75 || !older.length) ? home : older;
  startBattle({ wild: pickRandom(pool).id });
}

function startBattle({ wild = null, trainer = null, boss = false }) {
  held.clear();
  const team = boss ? [BOSS.id] : trainer !== null ? [...TRAINERS[trainer].team] : [wild];
  battle = { team, trainer, boss, wild: !!wild, enemy: null, attack: null, over: false };
  $('battle').hidden = false;
  $('battle').classList.toggle('boss-fight', boss);
  $('player-sprite').innerHTML = avatarSvg();
  playSound(boss || trainer !== null ? 'boss' : 'dm');
  nextEnemy();
}

function nextEnemy() {
  const c = creature(battle.team.shift());
  battle.enemy = { c, hp: Math.round(c.hp * (1 + 0.1 * zoneOf(player.x))), maxHp: 0, turn: 0 };
  battle.enemy.maxHp = battle.enemy.hp;
  if (!save.seen.includes(c.id)) save.seen.push(c.id);
  $('enemy-name').textContent = c.name;
  // You learn a threat's type once it's in your Index; until then, read the attack!
  const known = save.caught.includes(c.id) && !battle.boss;
  $('enemy-type').textContent = known ? DEFENSES[c.beats].type : '???';
  $('enemy-sprite').textContent = c.emoji;
  $('enemy-sprite').className = 'sprite enemy-sprite enter';
  updateBattleHp();
  const intro = battle.boss ? '☠️ The final battle begins!'
    : battle.trainer !== null ? `${TRAINERS[battle.trainer].name} sends out ${c.emoji} ${c.name}!`
    : `A wild ${c.emoji} ${c.name} appeared!`;
  log(intro);
  setTimeout(enemyTurn, 900);
}

function enemyTurn() {
  if (!battle || battle.over) return;
  const e = battle.enemy;
  const i = e.turn++ % e.c.attacks.length;
  battle.attack = { text: e.c.attacks[battle.boss ? Math.floor(Math.random() * e.c.attacks.length) : i] };
  // The boss's weakness depends on which attack it uses
  const attackIndex = e.c.attacks.indexOf(battle.attack.text);
  battle.attack.beats = (battle.boss && BOSS.mixed[attackIndex]) || e.c.beats;
  log(`${e.c.emoji} ${e.c.name} ${battle.attack.text}`, 'attack');
  showMoves();
}

function showMoves() {
  const actions = $('battle-actions');
  actions.innerHTML = '';
  actions.className = 'battle-actions moves';
  for (const [id, d] of Object.entries(DEFENSES)) {
    addAction(`<strong>${d.emoji} ${d.name}</strong><span>${d.move}</span>`, () => useMove(id));
  }
  addAction('<strong>🙋 Ask for help</strong><span>Tell a trusted adult: +30 data</span>', askHelp, 'help');
  if (battle.wild) addAction('<strong>🏃 Run</strong><span>Leave this one alone</span>', run, 'run');
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
    const dmg = RIGHT_DAMAGE[0] + Math.floor(Math.random() * (RIGHT_DAMAGE[1] - RIGHT_DAMAGE[0]));
    e.hp = Math.max(0, e.hp - dmg);
    hitSprite('enemy-sprite');
    playSound('right');
    log(`You used ${d.emoji} ${d.name}. It's super effective! (-${dmg})`, 'good');
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
      enemyHits(e.c.power, `Hint: that attack was ${right.type}. ${right.emoji} ${right.name} beats it.`);
    }, 1000);
  }
}

function askHelp() {
  save.hp = Math.min(maxHp(), save.hp + HELP_HEAL);
  playSound('upgrade');
  log(`🙋 You told a trusted adult. They helped you stay calm. +${HELP_HEAL} data`, 'good');
  updateBattleHp();
  setTimeout(() => enemyHits(Math.round(battle.enemy.c.power / 2)), 1000);
}

function enemyHits(power, hint = '') {
  const dmg = Math.round(power * (0.85 + Math.random() * 0.3));
  save.hp = Math.max(0, save.hp - dmg);
  hitSprite('player-sprite');
  playSound('leak');
  log(`${battle.enemy.c.emoji} ${battle.enemy.c.name} got through! -${dmg} data`, 'bad');
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
  if (battle.team.length) return setTimeout(() => nextEnemy(), 1300);
  if (battle.trainer !== null) return setTimeout(wonTrainer, 1000);

  // A wild threat: offer to quarantine it
  if (save.caught.includes(c.id)) {
    log(`(${c.name} is already in your Threat Index.)`);
    return setTimeout(endBattle, 1300);
  }
  const actions = $('battle-actions');
  actions.innerHTML = '';
  actions.className = 'battle-actions';
  addAction('<strong>🧪 Quarantine it</strong><span>Answer a question to add it to your Index</span>', () => quarantine(c), 'quarantine').focus();
  addAction('<strong>Leave it</strong><span>Keep exploring</span>', endBattle);
}

// ---------- Quarantine (catching) ----------
function questionPool(tier) {
  const all = [
    ...Object.values(UPGRADES).flat(),
    ...SKILLS.flatMap(skill => skill.questions.map(q => ({ ...q, level: skill.level <= 30 ? 2 : 3 }))),
    ...BOSS_QUESTIONS,
  ];
  return all.filter(q => (q.level || 1) <= tier);
}

function quarantine(c) {
  const q = pickRandom(questionPool(Math.min(3, c.zone)));
  log(`🧪 Quarantine: ${q.prompt}`, 'question');
  const actions = $('battle-actions');
  actions.innerHTML = '';
  actions.className = 'battle-actions answers';
  for (const opt of shuffle(q.options)) {
    addAction(`<strong></strong>`, () => {
      if (opt.correct) {
        save.caught.push(c.id);
        playSound('badge');
        log(`✅ ${opt.why}`, 'good');
        log(`🧪 ${c.emoji} ${c.name} was quarantined! Added to your Threat Index.`, 'good');
        $('enemy-sprite').className = 'sprite enemy-sprite caught';
        saveAdventure();
        updateHud();
        setTimeout(() => { endBattle(); openIndex(c.id); }, 1800);
      } else {
        playSound('wrong');
        log(`❌ ${opt.why} The right answer: ${q.options.find(o => o.correct).text}`, 'bad');
        log(`${c.emoji} ${c.name} escaped!`);
        $('enemy-sprite').className = 'sprite enemy-sprite fled';
        setTimeout(endBattle, 2600);
      }
    }).querySelector('strong').textContent = opt.text;
  }
  actions.querySelector('button').focus();
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
  say([`${trainer.emoji} ${trainer.name}: ${trainer.outro}`, `You got the ${trainer.badge}! Your max data went up to ${maxHp()}.`, z < ZONES.length - 1 ? 'The gate to the next zone is open!' : 'Now nothing stands between you and Omega Ransomware...']);
}

function wonBoss() {
  save.beatBoss = true;
  saveAdventure();
  endBattle();
  playSound('badge');
  $('win-coder').innerHTML = avatarSvg();
  $('win-text').textContent = `You beat Omega Ransomware and saved the internet! You've quarantined ${save.caught.length} of ${CREATURES.length} threats. Keep exploring to complete your Threat Index.`;
  makeConfetti();
  $('dlg-win').showModal();
}

function lostBattle() {
  log('💥 Your data leaked!', 'bad');
  setTimeout(() => {
    endBattle();
    save.hp = maxHp();
    player.x = player.fromX = save.restore.x;
    player.y = player.fromY = save.restore.y;
    player.t = 1;
    save.x = player.x;
    save.y = player.y;
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

function updateBattleHp() {
  if (!battle) return;
  const e = battle.enemy;
  const fill = $('enemy-hp-fill');
  fill.style.width = `${(e.hp / e.maxHp) * 100}%`;
  fill.className = e.hp / e.maxHp < 0.3 ? 'low' : '';
  const pFill = $('player-hp-fill');
  pFill.style.width = `${(save.hp / maxHp()) * 100}%`;
  pFill.className = save.hp / maxHp() < 0.3 ? 'low' : '';
  $('player-hp-text').textContent = `${save.hp} / ${maxHp()}`;
}

function hitSprite(id) {
  const el = $(id);
  el.classList.remove('hit');
  void el.offsetWidth;
  el.classList.add('hit');
}

// ---------- Threat Index ----------
const indexDialog = $('dlg-index');

function openIndex(focusId = null) {
  const dex = $('dex');
  dex.innerHTML = '';
  for (const c of [...CREATURES, BOSS]) {
    const caught = save.caught.includes(c.id) || (c === BOSS && save.beatBoss);
    const seen = save.seen.includes(c.id);
    const btn = document.createElement('button');
    btn.className = `dex-entry ${caught ? 'caught' : seen ? 'seen' : 'unknown'}`;
    btn.innerHTML = `<span class="dex-emoji">${caught || seen ? c.emoji : '❓'}</span><span class="dex-name">${caught || seen ? c.name : '???'}</span>`;
    btn.addEventListener('click', () => showDex(c, caught, seen));
    dex.appendChild(btn);
    if (c.id === focusId) setTimeout(() => btn.click());
  }
  $('index-summary').textContent = `Quarantined ${save.caught.length} of ${CREATURES.length} threats · Seen ${save.seen.filter(id => id !== BOSS.id).length}`;
  $('dex-detail').hidden = true;
  if (!indexDialog.open) indexDialog.showModal();
}

function showDex(c, caught, seen) {
  const box = $('dex-detail');
  box.hidden = false;
  if (!caught) {
    box.innerHTML = `<p class="dex-title">${seen ? `${c.emoji} ${c.name}` : '❓ Unknown threat'}</p><p>${seen ? 'You\'ve met it, but it isn\'t quarantined yet. Beat it in the wild, then answer the quarantine question.' : 'Explore the spam grass to find it.'}</p>`;
    return;
  }
  const d = DEFENSES[c.beats];
  box.innerHTML = `
    <p class="dex-title">${c.emoji} ${c.name} <span class="type-tag">${c === BOSS ? 'Boss' : d.type}</span></p>
    <p></p>
    <p class="dex-weak">Beaten by: ${c === BOSS ? 'reading every attack' : `${d.emoji} ${d.name}`}</p>
    <p class="dex-tip">💡 </p>`;
  box.children[1].textContent = c.about;
  box.querySelector('.dex-tip').textContent += c.tip;
}

$('btn-index').addEventListener('click', () => { if (!busy()) openIndex(); });
$('index-close').addEventListener('click', () => indexDialog.close());

// ---------- HUD ----------
function updateHud() {
  $('zone-name').textContent = `📍 ${ZONES[zoneOf(player.x)].name}`;
  $('hud-hp').textContent = `${save.hp}/${maxHp()}`;
  $('hud-hp-fill').style.width = `${(save.hp / maxHp()) * 100}%`;
  $('hud-hp-fill').className = save.hp / maxHp() < 0.3 ? 'low' : '';
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
    held.add(KEYS[e.key]);
    tryMove(KEYS[e.key]);
  } else if ((e.key === ' ' || e.key === 'Enter') && !battle) {
    e.preventDefault();
    interact();
  } else if ((e.key === 'i' || e.key === 'I') && !busy()) {
    openIndex();
  }
});
document.addEventListener('keyup', e => { if (KEYS[e.key]) held.delete(KEYS[e.key]); });
window.addEventListener('blur', () => held.clear());

// On-screen pad: hold a direction to keep walking
for (const btn of document.querySelectorAll('.pad button')) {
  const dir = btn.dataset.dir;
  if (dir === 'act') {
    btn.addEventListener('click', interact);
    continue;
  }
  btn.addEventListener('pointerdown', e => { e.preventDefault(); held.add(dir); tryMove(dir); });
  for (const end of ['pointerup', 'pointerleave', 'pointercancel']) btn.addEventListener(end, () => held.delete(dir));
}
$('talk').addEventListener('click', () => { if (talkLines) nextLine(); });

// ---------- Drawing ----------
const canvas = $('world');
const ctx = canvas.getContext('2d');

function resize() {
  const wrap = $('world-wrap');
  canvas.width = wrap.clientWidth;
  canvas.height = wrap.clientHeight;
}
window.addEventListener('resize', resize);

const TILE_ICONS = { H: '🏠', R: '💾', S: '🪧', B: '☠️' };
const PEOPLE = [['👩'], ['🧑‍🎤'], ['🧑‍🔧'], ['🕵️‍♀️']];

function draw(time) {
  const px = (player.fromX + (player.x - player.fromX) * player.t) * TILE;
  const py = (player.fromY + (player.y - player.fromY) * player.t) * TILE;
  // Camera follows you, but stops at the edges of the map
  const camX = Math.max(0, Math.min(MAP_W * TILE - canvas.width, px + TILE / 2 - canvas.width / 2));
  const camY = Math.max(0, Math.min(MAP_H * TILE - canvas.height, py + TILE / 2 - canvas.height / 2));
  const offX = MAP_W * TILE < canvas.width ? (canvas.width - MAP_W * TILE) / 2 : -camX;
  const offY = MAP_H * TILE < canvas.height ? (canvas.height - MAP_H * TILE) / 2 : -camY;

  ctx.fillStyle = '#070b1f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(Math.round(offX), Math.round(offY));

  const x0 = Math.max(0, Math.floor(-offX / TILE)), x1 = Math.min(MAP_W, Math.ceil((canvas.width - offX) / TILE));
  const y0 = Math.max(0, Math.floor(-offY / TILE)), y1 = Math.min(MAP_H, Math.ceil((canvas.height - offY) / TILE));
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
        // Swaying blades
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
        const open = save.badges.includes(zoneOf(x));
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
        ctx.fillText(PEOPLE[zoneOf(x)][0], sx + TILE / 2, sy + TILE / 2 + 2);
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

  // You
  const bob = player.t < 1 ? Math.abs(Math.sin(player.t * Math.PI)) * -4 : 0;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(px + TILE / 2, py + TILE - 6, 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  if (coderImage.complete) ctx.drawImage(coderImage, px + 5, py + 2 + bob, TILE - 10, TILE - 10);

  // Zone names on the map, so you can see where you're heading
  ctx.font = 'bold 13px Nunito, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ZONES.forEach((z, i) => ctx.fillText(z.name.toUpperCase(), (i * ZONE_W + ZONE_W / 2) * TILE, TILE * (MAP_H - 0.5)));
  ctx.restore();
}

// ---------- Main loop ----------
let last = performance.now();
let sinceSave = 0;
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (player.t < 1) {
    player.t = Math.min(1, player.t + dt / STEP_TIME);
    if (player.t >= 1) {
      arrived();
      // Keep walking while a direction is held
      const dir = [...held].pop();
      if (dir && !busy()) tryMove(dir);
    }
  }
  if ((sinceSave += dt) > 10) { sinceSave = 0; saveAdventure(); }
  draw(now);
  requestAnimationFrame(loop);
}

// ---------- Start ----------
$('btn-help').addEventListener('click', () => $('dlg-help').showModal());
$('help-go').addEventListener('click', () => {
  $('dlg-help').close();
  if (firstVisit) {
    firstVisit = false;
    say(['🏠 This is your Home Network. Head right through the spam grass to explore the internet.', 'Talk to 👩 Mom and read the 🪧 signs for tips. Good luck, Defender!']);
  }
});
$('win-go').addEventListener('click', () => $('dlg-win').close());
window.addEventListener('beforeunload', saveAdventure);

resize();
$('hud-coder').innerHTML = avatarSvg();
updateHud();
if (firstVisit) $('dlg-help').showModal();
requestAnimationFrame(loop);
