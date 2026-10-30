// Rewards for learning:
//  - Streak: right answers in a row (scans, quizzes, DMs, upgrades, boss questions...)
//  - Every right answer charges the Firewall Blast, and a streak of 3+ charges it twice as fast.
//    A full charge lets you blast every threat on screen (B key).
//  - Badges: achievements saved on this computer, shown in the Study tab and on the end screen.

const BLAST_CHARGE = 5;
const BLAST_DAMAGE = 250;
const BLAST_BOSS_DAMAGE = 0.05;  // share of the boss's max HP
const STREAK_BOOST_AT = 3;

// ---------- Streaks and charge ----------
answerListeners.push(correct => {
  playSound(correct ? 'right' : 'wrong');
  if (correct) {
    state.streak++;
    state.charge = Math.min(BLAST_CHARGE, state.charge + (state.streak >= STREAK_BOOST_AT ? 2 : 1));
  } else {
    state.streak = 0;
  }
  updateHud();
});

hooks.hud.push(() => {
  el('streak').textContent = state.streak;
  el('streak').parentElement.classList.toggle('hot', state.streak >= STREAK_BOOST_AT);
  el('charge-fill').style.width = `${(state.charge / BLAST_CHARGE) * 100}%`;
  const ready = state.charge >= BLAST_CHARGE;
  el('btn-blast').classList.toggle('ready', ready);
  el('btn-blast').disabled = !ready || !state.waveActive || state.over;
  el('btn-blast').title = ready ? 'Firewall Blast! Hits every threat on screen (B)'
    : `Charge the Firewall Blast with right answers (${state.charge}/${BLAST_CHARGE})`;
});

// ---------- Firewall Blast ----------
let blastFlash = 0;

function firewallBlast() {
  if (state.charge < BLAST_CHARGE || !state.waveActive || state.over || anyDialogOpen()) return;
  state.charge = 0;
  state.blasts++;
  blastFlash = 0.5;
  playSound('blast');
  for (const e of state.enemies) {
    if (THREATS[e.type].boss) hurt(e, e.maxHp * BLAST_BOSS_DAMAGE);
    else hurt(e, BLAST_DAMAGE);
  }
  state.floaters.push({ x: CORE.x, y: CORE.y, ring: 900, color: '#ff3d8b', life: 0.3 });
  addFloater(CORE.x - 60, CORE.y - 50, '💥 FIREWALL BLAST!', '#ff3d8b');
  updateHud();
}

el('btn-blast').addEventListener('click', firewallBlast);
document.addEventListener('keydown', e => {
  if ((e.key === 'b' || e.key === 'B') && !anyDialogOpen()) firewallBlast();
});

hooks.update.push(dt => { blastFlash = Math.max(0, blastFlash - dt); });
hooks.draw.push(() => {
  if (blastFlash <= 0) return;
  ctx.fillStyle = `rgba(255, 255, 255, ${blastFlash * 0.6})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
});

// ---------- Badges ----------
const BADGES = [
  { id: 'phish', emoji: '🎣', name: 'Phish Finder', how: 'Identify 5 threat messages in one game', test: () => state.stats.scansRight >= 5 },
  { id: 'fire', emoji: '🔥', name: 'On Fire', how: 'Get 5 answers right in a row', test: () => state.streak >= 5 },
  { id: 'talker', emoji: '💬', name: 'Smooth Talker', how: 'Reply safely to 3 live DMs in one game', test: () => state.dmSafe >= 3 },
  { id: 'spotter', emoji: '🧠', name: 'Scam Spotter', how: 'Get a perfect Real or Scam round', test: () => state.perfectQuiz },
  { id: 'max', emoji: '⭐', name: 'Max Power', how: 'Upgrade a tower to level 3', test: () => state.towers.some(t => t.level >= MAX_LEVEL) },
  { id: 'index', emoji: '📖', name: 'Collector', how: 'Fill the Threat Index in one game', test: () => state.index.size >= Object.values(THREATS).filter(t => !t.boss).length },
  { id: 'blast', emoji: '💥', name: 'Firewall!', how: 'Use a Firewall Blast', test: () => state.blasts >= 1 },
  { id: 'boss', emoji: '👾', name: 'Ransomware Rescuer', how: 'Defeat the Ransomware Boss', test: () => state.bossBeaten },
  { id: 'perfect', emoji: '🛡️', name: 'Perfect Defense', how: 'Survive 10 waves without losing any data', test: () => state.wave >= 10 && state.data === START_DATA },
  { id: 'survivor', emoji: '🌊', name: 'Survivor', how: 'Survive 20 waves', test: () => state.wave >= 20 },
  { id: 'champion', emoji: '🏆', name: 'Champion', how: 'Clear all 100 levels in Levels mode', test: () => state.won },
];

const BADGE_KEY = 'defenders-of-data-badges';
let earnedBadges = {};
try { earnedBadges = JSON.parse(localStorage.getItem(BADGE_KEY)) || {}; } catch { /* storage blocked */ }
let newBadges = [];  // earned during this game, shown on the end screen

const badgePop = el('badge-pop');
let badgePopTimer;

function checkBadges() {
  for (const badge of BADGES) {
    if (earnedBadges[badge.id] || !badge.test()) continue;
    earnedBadges[badge.id] = true;
    newBadges.push(badge);
    try { localStorage.setItem(BADGE_KEY, JSON.stringify(earnedBadges)); } catch { /* storage blocked */ }
    showBadgePop(badge);
  }
}

function showBadgePop(badge) {
  playSound('badge');
  el('badge-pop-emoji').textContent = badge.emoji;
  el('badge-pop-name').textContent = badge.name;
  el('badge-pop-how').textContent = badge.how;
  // A popover shows on top of everything, even an open question
  try { badgePop.showPopover(); } catch { badgePop.hidden = false; }
  clearTimeout(badgePopTimer);
  badgePopTimer = setTimeout(() => {
    try { badgePop.hidePopover(); } catch { badgePop.hidden = true; }
  }, 3500);
}

// The 🏅 Badges tab in the Study panel
function renderBadges() {
  const grid = el('badge-grid');
  grid.innerHTML = '';
  for (const badge of BADGES) {
    const got = earnedBadges[badge.id];
    const card = document.createElement('div');
    card.className = `badge-card${got ? ' earned' : ''}`;
    card.innerHTML = '<span class="badge-emoji"></span><strong></strong><span class="badge-how"></span>';
    card.querySelector('.badge-emoji').textContent = got ? badge.emoji : '🔒';
    card.querySelector('strong').textContent = badge.name;
    card.querySelector('.badge-how').textContent = badge.how;
    grid.appendChild(card);
  }
  const count = BADGES.filter(b => earnedBadges[b.id]).length;
  el('badge-total').textContent = `${count} of ${BADGES.length} badges earned`;
}

hooks.hud.push(checkBadges);
hooks.newGame.push(() => { newBadges = []; });
hooks.end.push(() => {
  checkBadges();
  const box = el('end-badges');
  box.hidden = newBadges.length === 0;
  box.textContent = `🏅 New badges: ${newBadges.map(b => `${b.emoji} ${b.name}`).join(', ')}`;
});
