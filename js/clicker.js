// Data Clicker: click the shield to earn bytes, hire defenders that earn bytes for you,
// and learn along the way:
// - every defender and defender upgrade is unlocked by answering a question
// - scam pop-ups ask "real or scam?": right earns bonus bytes, falling for a scam costs you
// - a tiny secret message bubble sometimes appears: answer it for an Overdrive
// Progress is saved on this computer, and defenders keep earning (slower) while you're away.
// Uses QUIZ, UPGRADES, SKILLS, BOSS_QUESTIONS and FLASHCARDS from content.js.

const $ = id => document.getElementById(id);
const CLICKER_KEY = 'defenders-of-data-clicker';

const COST_GROWTH = 1.15;          // each extra defender costs 15% more
const OFFLINE_RATE = 0.25;         // defenders earn this share while you're away...
const OFFLINE_MAX = 8 * 60 * 60;   // ...for up to 8 hours
const SCAM_EVERY = [35, 75];       // seconds between scam pop-ups
const SCAM_STAY = 20;              // seconds before an unanswered pop-up gives up
const SCAM_LOSS = 0.1;             // falling for a scam loses this share of your bytes
const SECRET_EVERY = [50, 120];    // seconds between secret messages
const SECRET_STAY = 6;
const OVERDRIVE = { times: 7, seconds: 30 };

// ---------- What you can buy ----------
// tier: how hard the unlock question is (1 to 3)
const HELPERS = [
  { id: 'password', emoji: '🔑', name: 'Password Manager', habit: 'Makes a strong, different password for every account.', cost: 15, rate: 0.1, tier: 1 },
  { id: 'twofa', emoji: '🔐', name: '2FA Codes', habit: 'A second key, so a stolen password isn\'t enough.', cost: 100, rate: 1, tier: 1 },
  { id: 'update', emoji: '🔄', name: 'Auto Updates', habit: 'Patches the holes hackers use, all by itself.', cost: 1100, rate: 8, tier: 1 },
  { id: 'antivirus', emoji: '🦠', name: 'Antivirus Scanner', habit: 'Catches malware before it can run.', cost: 12000, rate: 47, tier: 2 },
  { id: 'firewall', emoji: '🧱', name: 'Firewall', habit: 'Blocks connections you didn\'t ask for.', cost: 130000, rate: 260, tier: 2 },
  { id: 'backup', emoji: '💽', name: 'Cloud Backup', habit: 'A spare copy of your files, so ransomware can\'t win.', cost: 1.4e6, rate: 1400, tier: 2 },
  { id: 'team', emoji: '👩‍💻', name: 'Security Team', habit: 'Real people watching for attacks day and night.', cost: 2e7, rate: 7800, tier: 3 },
  { id: 'ai', emoji: '🤖', name: 'AI Threat Hunter', habit: 'Spots strange activity faster than any human.', cost: 3.3e8, rate: 44000, tier: 3 },
];

// Each defender gets 4 upgrades that double it, once you own enough of them
const HELPER_STEPS = [
  { need: 1, price: 10, name: 'Training' },
  { need: 5, price: 50, name: 'Pro Mode' },
  { need: 25, price: 500, name: 'Expert Mode' },
  { need: 50, price: 5000, name: 'Legendary' },
];

const CLICK_UPGRADES = [
  { id: 'click1', emoji: '⌨️', name: 'Fast Fingers', text: 'Clicks earn twice as much.', cost: 100, times: 2 },
  { id: 'click2', emoji: '🖱️', name: 'Gaming Mouse', text: 'Clicks earn twice as much.', cost: 500, times: 2 },
  { id: 'click3', emoji: '🧤', name: 'Coding Gloves', text: 'Clicks earn twice as much.', cost: 10000, times: 2 },
  { id: 'smart1', emoji: '🧠', name: 'Smart Clicks', text: 'Each click also earns 1% of your bytes per second.', cost: 50000, share: 0.01 },
  { id: 'click4', emoji: '⚡', name: 'Lightning Reflexes', text: 'Clicks earn twice as much.', cost: 1e6, times: 2 },
  { id: 'smart2', emoji: '🎓', name: 'Genius Clicks', text: 'Each click also earns 3% more of your bytes per second.', cost: 5e6, share: 0.03 },
];

const UPGRADE_LIST = [
  ...CLICK_UPGRADES.map(u => ({ ...u, kind: 'click' })),
  ...HELPERS.flatMap(h => HELPER_STEPS.map((step, i) => ({
    id: `${h.id}-${i}`, kind: 'helper', helper: h.id, need: step.need, cost: h.cost * step.price,
    emoji: h.emoji, name: `${h.name}: ${step.name}`, text: `${h.name} earns twice as much.`, tier: Math.min(3, h.tier + (i >= 2 ? 1 : 0)),
  }))),
];

// ---------- Saved progress ----------
let game = {
  bytes: 0, total: 0, clicks: 0, streak: 0,
  owned: {},          // how many of each defender
  unlocked: [],       // defenders you've answered a question for
  upgrades: [],       // upgrades bought
  saved: Date.now(),
};
let firstVisit = true;

try {
  const saved = JSON.parse(localStorage.getItem(CLICKER_KEY));
  if (saved) {
    game = { ...game, ...saved };
    firstVisit = false;
  }
} catch { /* storage blocked */ }

function saveClicker() {
  game.saved = Date.now();
  try { localStorage.setItem(CLICKER_KEY, JSON.stringify(game)); } catch { /* storage blocked */ }
}

// ---------- Numbers ----------
const owned = id => game.owned[id] || 0;
const has = id => game.upgrades.includes(id);
const helperCost = h => Math.ceil(h.cost * COST_GROWTH ** owned(h.id));
let overdriveLeft = 0;
const boost = () => (overdriveLeft > 0 ? OVERDRIVE.times : 1);

function helperRate(h) {
  const doubles = HELPER_STEPS.filter((_, i) => has(`${h.id}-${i}`)).length;
  return h.rate * 2 ** doubles;
}
const baseRate = () => HELPERS.reduce((sum, h) => sum + owned(h.id) * helperRate(h), 0);
const perSecond = () => baseRate() * boost();

function perClick() {
  let power = 1;
  let share = 0;
  for (const u of CLICK_UPGRADES) {
    if (!has(u.id)) continue;
    if (u.times) power *= u.times;
    if (u.share) share += u.share;
  }
  return (power + baseRate() * share) * boost();
}

const UNITS = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi'];
function fmt(n, decimals = 0) {
  if (n < 1000) return n < 10 && decimals ? n.toFixed(1).replace(/\.0$/, '') : Math.floor(n).toLocaleString();
  const unit = Math.min(UNITS.length - 1, Math.floor(Math.log10(n) / 3));
  return `${(n / 1000 ** unit).toFixed(2).replace(/\.?0+$/, '')}${UNITS[unit]}`;
}

function earn(amount) {
  game.bytes += amount;
  game.total += amount;
}

// While you were away
const away = Math.min(OFFLINE_MAX, (Date.now() - game.saved) / 1000);
const awayEarned = firstVisit ? 0 : baseRate() * away * OFFLINE_RATE;
if (awayEarned >= 1) earn(awayEarned);

// ---------- Clicking the shield ----------
const shield = $('big-shield');
const playArea = $('play-area');

shield.addEventListener('click', e => {
  const amount = perClick();
  earn(amount);
  game.clicks++;
  $('click-hint').classList.add('gone');
  // Float the amount from where you clicked (or the middle, for keyboard clicks)
  const area = playArea.getBoundingClientRect();
  const box = shield.getBoundingClientRect();
  const x = e.clientX || box.left + box.width / 2;
  const y = e.clientY || box.top + box.height / 2;
  floatText(`+${fmt(amount, 1)}`, x - area.left, y - area.top);
  for (let i = 0; i < 3; i++) flyBit(x - area.left, y - area.top);
  shield.classList.remove('bump');
  void shield.offsetWidth;
  shield.classList.add('bump');
  playSound('place');
  render();
});

function floatText(text, x, y, className = '') {
  const el = document.createElement('span');
  el.className = `float-text ${className}`;
  el.textContent = text;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  playArea.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

// Little 1s and 0s that fly out of the shield
function flyBit(x, y) {
  const el = document.createElement('span');
  el.className = 'bit';
  el.textContent = Math.random() < 0.5 ? '0' : '1';
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.setProperty('--dx', `${(Math.random() - 0.5) * 160}px`);
  el.style.setProperty('--dy', `${-40 - Math.random() * 80}px`);
  playArea.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

// ---------- Questions ----------
const askDialog = $('dlg-ask');
let askDone = null;
let askRight = null;
let askOpts = null;
const askedRecently = [];

function questionPool(tier) {
  const all = [
    ...Object.values(UPGRADES).flat(),
    ...SKILLS.flatMap(skill => skill.questions.map(q => ({ ...q, level: skill.level <= 30 ? 2 : 3 }))),
    ...BOSS_QUESTIONS,
  ];
  return all.filter(q => (q.level || 1) <= tier);
}

function pickQuestion(tier) {
  const pool = questionPool(tier);
  const fresh = pool.filter(q => !askedRecently.includes(q.prompt));
  const q = pickRandom(fresh.length ? fresh : pool);
  askedRecently.push(q.prompt);
  if (askedRecently.length > 20) askedRecently.shift();
  return q;
}

const pickRandom = list => list[Math.floor(Math.random() * list.length)];
const shuffle = list => list.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);

// done(true) when answered right. A wrong answer offers another question.
function ask(opts, done) {
  const { tag, title, tier, doneText } = opts;
  const q = pickQuestion(tier);
  askOpts = opts;
  askDone = done;
  askRight = null;
  $('ask-tag').textContent = tag;
  $('ask-title').textContent = title;
  $('ask-prompt').textContent = q.prompt;
  $('ask-message').hidden = !q.msg;
  if (q.msg) renderMessage($('ask-message'), q.msg);
  $('ask-result').hidden = true;
  $('ask-done').hidden = true;
  $('ask-cancel').textContent = 'Not now';

  const options = $('ask-options');
  options.innerHTML = '';
  for (const opt of shuffle(q.options)) {
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.textContent = opt.text;
    btn.addEventListener('click', () => answer(btn, opt, q));
    options.appendChild(btn);
  }
  if (!askDialog.open) askDialog.showModal();
  options.firstChild.focus();
}

function answer(button, opt, q) {
  if (askRight !== null) return;
  askRight = opt.correct;
  const right = q.options.find(o => o.correct);
  [...$('ask-options').children].forEach(b => {
    b.disabled = true;
    if (b.textContent === right.text) b.classList.add('right');
  });
  if (!opt.correct) button.classList.add('wrong');
  answered(opt.correct);

  const result = $('ask-result');
  result.hidden = false;
  result.className = `result ${opt.correct ? 'good' : 'bad'}`;
  result.innerHTML = `<p class="verdict">${opt.correct ? '✅ Correct!' : '❌ Not quite.'}</p><p></p>${opt.correct ? '' : '<p><strong>Answer:</strong> <span></span></p>'}`;
  result.children[1].textContent = opt.why;
  if (!opt.correct) result.querySelector('span').textContent = right.text;

  const doneBtn = $('ask-done');
  doneBtn.hidden = false;
  doneBtn.textContent = opt.correct ? askOpts.doneText : 'Try another question';
  doneBtn.focus();
}

$('ask-done').addEventListener('click', () => {
  if (askRight) {
    askDialog.close();
    const done = askDone;
    askDone = null;
    done();
  } else {
    // Read why, then try a different question
    ask(askOpts, askDone);
  }
});
$('ask-cancel').addEventListener('click', () => askDialog.close());

// Keeps your streak and makes your coder react
function answered(correct) {
  game.streak = correct ? game.streak + 1 : 0;
  playSound(correct ? 'right' : 'wrong');
  const coder = $('hud-coder');
  coder.classList.remove('cheer', 'oops');
  void coder.offsetWidth;
  coder.classList.add(correct ? 'cheer' : 'oops');
  render();
}
$('hud-coder').addEventListener('animationend', e => e.currentTarget.classList.remove('cheer', 'oops'));

function renderMessage(box, msg) {
  box.innerHTML = '<div class="msg-from"><span></span><span class="msg-meta"></span></div>';
  box.querySelector('span').textContent = msg.from;
  box.querySelector('.msg-meta').textContent = msg.meta || '';
  for (const [key, className, prefix] of [['note', 'msg-note', '📍 '], ['text', 'msg-text', ''], ['link', 'msg-link', '🔗 ']]) {
    if (!msg[key]) continue;
    const el = document.createElement(key === 'link' ? 'div' : 'p');
    el.className = className;
    el.textContent = prefix + msg[key];
    box.appendChild(el);
  }
}

// ---------- The shop ----------
function buyHelper(h) {
  const cost = helperCost(h);
  if (game.bytes < cost) return;
  if (!game.unlocked.includes(h.id)) {
    ask({ tag: `🔒 Unlock ${h.emoji} ${h.name}`, title: 'Answer to hire this defender', tier: h.tier, doneText: `Hire ${h.name}` }, () => {
      game.unlocked.push(h.id);
      showToast(`${h.emoji} ${h.name} unlocked!`);
      playSound('upgrade');
      buyHelper(h);
    });
    return;
  }
  game.bytes -= cost;
  game.owned[h.id] = owned(h.id) + 1;
  playSound('place');
  render(true);
}

function buyUpgrade(u) {
  if (game.bytes < u.cost || has(u.id)) return;
  const finish = () => {
    if (game.bytes < u.cost) return showToast('Not enough bytes anymore!');
    game.bytes -= u.cost;
    game.upgrades.push(u.id);
    playSound('upgrade');
    showToast(`${u.emoji} ${u.name}: ${u.text}`);
    render(true);
  };
  // Defender upgrades are earned with a question too
  if (u.kind === 'helper') ask({ tag: `⭐ Upgrade ${u.emoji}`, title: u.name, tier: u.tier, doneText: `Buy for ${fmt(u.cost)} bytes` }, finish);
  else finish();
}

// Only show what you can almost afford, so the shop grows as you play
const upgradeVisible = u => !has(u.id) && (u.kind === 'click' ? game.total >= u.cost * 0.5 : owned(u.helper) >= u.need);
const helperVisible = (h, i) => i === 0 || owned(HELPERS[i - 1].id) > 0 || game.total >= h.cost * 0.5;

function buildShop() {
  const helpers = $('helpers');
  helpers.innerHTML = '';
  HELPERS.forEach((h, i) => {
    if (!helperVisible(h, i)) return;
    const btn = document.createElement('button');
    btn.className = 'helper';
    btn.dataset.id = h.id;
    btn.innerHTML = `
      <span class="helper-emoji">${h.emoji}</span>
      <span class="helper-info">
        <span class="helper-name">${h.name}</span>
        <span class="helper-habit">${h.habit}</span>
        <span class="helper-cost"></span>
      </span>
      <span class="helper-owned"></span>`;
    btn.addEventListener('click', () => buyHelper(h));
    helpers.appendChild(btn);
  });
  // A mystery card for the next defender
  const next = HELPERS.find((h, i) => !helperVisible(h, i));
  if (next) helpers.insertAdjacentHTML('beforeend', '<div class="helper mystery"><span class="helper-emoji">❓</span><span class="helper-info"><span class="helper-name">???</span><span class="helper-habit">Keep earning to discover the next defender.</span></span></div>');

  const upgrades = $('upgrades');
  upgrades.innerHTML = '';
  const visible = UPGRADE_LIST.filter(upgradeVisible).sort((a, b) => a.cost - b.cost);
  for (const u of visible) {
    const btn = document.createElement('button');
    btn.className = `upgrade for-${u.kind}`;
    btn.dataset.id = u.id;
    btn.innerHTML = `<span class="upgrade-emoji">${u.emoji}</span><span class="upgrade-cost">${fmt(u.cost)}</span>${u.kind === 'helper' ? '<span class="upgrade-q">?</span>' : ''}`;
    btn.title = `${u.name}: ${u.text} Costs ${fmt(u.cost)} bytes.${u.kind === 'helper' ? ' Answer a question to buy it.' : ''}`;
    btn.setAttribute('aria-label', btn.title);
    btn.addEventListener('click', () => buyUpgrade(u));
    upgrades.appendChild(btn);
  }
  $('upgrades-empty').hidden = visible.length > 0;
  shopShape = shopKey();
}

// Rebuild the shop only when what's in it changes; otherwise just update prices and states
let shopShape = '';
const shopKey = () => HELPERS.map((h, i) => helperVisible(h, i) ? 1 : 0).join('') + UPGRADE_LIST.filter(upgradeVisible).map(u => u.id).join(',');

function render(rebuild = false) {
  if (rebuild || shopKey() !== shopShape) buildShop();
  $('bytes').textContent = fmt(game.bytes);
  $('rate').textContent = fmt(perSecond(), 1);
  $('per-click').textContent = fmt(perClick(), 1);
  $('clicks').textContent = fmt(game.clicks);
  $('streak').textContent = game.streak;
  document.title = `${fmt(game.bytes)} bytes - Data Clicker`;

  for (const btn of document.querySelectorAll('.helper[data-id]')) {
    const h = HELPERS.find(x => x.id === btn.dataset.id);
    const cost = helperCost(h);
    const locked = !game.unlocked.includes(h.id);
    btn.querySelector('.helper-cost').textContent = `💾 ${fmt(cost)}${locked ? ' · 🔒 answer to unlock' : ` · +${fmt(helperRate(h), 1)}/s each`}`;
    btn.querySelector('.helper-owned').textContent = owned(h.id) || '';
    btn.classList.toggle('locked', locked);
    btn.classList.toggle('cant', game.bytes < cost);
  }
  for (const btn of document.querySelectorAll('.upgrade')) {
    const u = UPGRADE_LIST.find(x => x.id === btn.dataset.id);
    btn.classList.toggle('cant', game.bytes < u.cost);
  }
}

// ---------- Scam pop-ups ----------
const popup = $('scam-popup');
let scamIn = 20;          // the first one comes quickly
let scam = null;          // { item, left }

function showScam() {
  const item = pickRandom(QUIZ);
  scam = { item, left: SCAM_STAY };
  renderMessage($('scam-message'), item);
  $('scam-result').hidden = true;
  $('scam-buttons').hidden = false;
  // Somewhere random in the play area, but fully on screen
  const area = playArea.getBoundingClientRect();
  popup.hidden = false;
  const w = popup.offsetWidth, ht = popup.offsetHeight;
  popup.style.left = `${Math.random() * Math.max(0, area.width - w - 16) + 8}px`;
  popup.style.top = `${Math.random() * Math.max(0, area.height - ht - 16) + 8}px`;
  popup.classList.remove('pop');
  void popup.offsetWidth;
  popup.classList.add('pop');
  playSound('dm');
}

for (const btn of $('scam-buttons').children) {
  btn.addEventListener('click', () => {
    if (!scam) return;
    const right = btn.dataset.answer === scam.item.answer;
    const result = $('scam-result');
    let line;
    if (right) {
      const reward = Math.max(25, baseRate() * 60);
      earn(reward);
      line = `<p class="reward">+${fmt(reward)} bytes</p>`;
    } else if (scam.item.answer === 'scam') {
      const loss = Math.floor(game.bytes * SCAM_LOSS);
      game.bytes -= loss;
      line = `<p class="penalty">You got scammed! -${fmt(loss)} bytes</p>`;
    } else {
      line = '<p class="penalty">That one was real. No bonus this time.</p>';
    }
    answered(right);
    $('scam-buttons').hidden = true;
    result.hidden = false;
    result.className = `result ${right ? 'good' : 'bad'}`;
    result.innerHTML = `<p class="verdict">${right ? '✅ Correct!' : '❌ Not quite.'} It was ${scam.item.answer === 'scam' ? 'a scam' : 'real'}.</p><p></p>${line}<p class="scam-dismiss">Click anywhere to keep playing</p>`;
    result.children[1].textContent = scam.item.why;
    // The answer makes the pop-up taller, so slide it up if it would go off screen
    const room = playArea.clientHeight - popup.offsetHeight - 8;
    popup.style.top = `${Math.max(8, Math.min(popup.offsetTop, room))}px`;
    scam.left = 8;          // closes by itself if you don't click
    // Wait for this click to finish, so it doesn't close the pop-up straight away
    setTimeout(() => { if (scam) scam.answered = true; });
    render();
  });
}

// Once you've answered, any click (on the pop-up or anywhere else) closes it.
// A click outside still counts, so clicking the shield closes it and earns bytes.
document.addEventListener('pointerdown', () => {
  if (scam && scam.answered) closeScam();
}, true);

function closeScam() {
  popup.hidden = true;
  scam = null;
  scamIn = SCAM_EVERY[0] + Math.random() * (SCAM_EVERY[1] - SCAM_EVERY[0]);
}

// ---------- Secret messages ----------
const bubble = $('secret-bubble');
let secretIn = 40;
let secretLeft = 0;

function showSecret() {
  const area = playArea.getBoundingClientRect();
  bubble.style.left = `${20 + Math.random() * (area.width - 60)}px`;
  bubble.style.top = `${20 + Math.random() * (area.height - 60)}px`;
  bubble.hidden = false;
  secretLeft = SECRET_STAY;
}

function hideSecret() {
  bubble.hidden = true;
  secretLeft = 0;
  secretIn = SECRET_EVERY[0] + Math.random() * (SECRET_EVERY[1] - SECRET_EVERY[0]);
}

bubble.addEventListener('click', () => {
  hideSecret();
  ask({ tag: '💬 Secret Message', title: `Answer for a x${OVERDRIVE.times} Overdrive!`, tier: 2, doneText: 'Start Overdrive!' }, () => {
    overdriveLeft = OVERDRIVE.seconds;
    playSound('blast');
    showToast(`⚡ OVERDRIVE! Everything earns x${OVERDRIVE.times} for ${OVERDRIVE.seconds} seconds!`);
  });
});

// ---------- Safety tips ticker ----------
const TIPS = [
  ...FLASHCARDS.map(card => `${card.term}: ${card.short}.`),
  ...SKILLS.flatMap(skill => skill.tips.map(tip => `${skill.name}: ${tip}.`)),
  ...HELPERS.map(h => `${h.name}: ${h.habit}`),
];
function nextTip() {
  const text = $('ticker-text');
  text.classList.remove('in');
  void text.offsetWidth;
  text.textContent = pickRandom(TIPS);
  text.classList.add('in');
}
setInterval(nextTip, 9000);
nextTip();

// ---------- Main loop ----------
let last = performance.now();
let sinceRender = 0;
let sinceSave = 0;

function loop(now) {
  // Browsers pause hidden tabs, so earn for all the time that really passed
  const elapsed = (now - last) / 1000;
  const dt = Math.min(1, elapsed);
  last = now;
  const paused = document.querySelector('dialog[open]') !== null;

  earn(perSecond() * elapsed);

  if (overdriveLeft > 0) {
    overdriveLeft = Math.max(0, overdriveLeft - dt);
    $('overdrive').hidden = overdriveLeft === 0;
    $('overdrive-x').textContent = OVERDRIVE.times;
    $('overdrive-fill').style.width = `${(overdriveLeft / OVERDRIVE.seconds) * 100}%`;
    playArea.classList.toggle('overdrive-on', overdriveLeft > 0);
  }

  // Surprises wait while a question is open
  if (!paused) {
    if (scam) {
      scam.left -= dt;
      $('scam-timer').textContent = scam.answered ? '' : `${Math.ceil(scam.left)}s`;
      if (scam.left <= 0) closeScam();
    } else if ((scamIn -= dt) <= 0) {
      showScam();
    }
    if (secretLeft > 0) {
      secretLeft -= dt;
      bubble.classList.toggle('fading', secretLeft < 1);
      if (secretLeft <= 0) hideSecret();
    } else if ((secretIn -= dt) <= 0) {
      showSecret();
    }
  }

  if ((sinceRender += dt) > 0.1) { sinceRender = 0; render(); }
  if ((sinceSave += dt) > 5) { sinceSave = 0; saveClicker(); }
  requestAnimationFrame(loop);
}

// ---------- Toast, help, start ----------
let toastTimer;
function showToast(message) {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// How to Play is a video of the game playing itself (demo.js)
$('btn-help').addEventListener('click', () => openDemo('clicker'));

window.addEventListener('beforeunload', saveClicker);
document.addEventListener('visibilitychange', () => { if (document.hidden) saveClicker(); });

$('hud-coder').innerHTML = avatarSvg();
if (game.clicks > 0) $('click-hint').classList.add('gone');
render(true);
if (firstVisit && !DEMO_MODE) openDemo('clicker');
else if (awayEarned >= 1) showToast(`Welcome back! Your defenders earned ${fmt(awayEarned)} bytes while you were away.`);
// Every few minutes a hacker breaks in (hacked.js). Too slow, and they take 3/4 of your bytes.
const hackAttack = setupHackAttack({
  isPlaying: () => !document.hidden && !document.querySelector('dialog[open]'),
  lossText: 'they steal 3/4 of your bytes',
  lose: () => {
    const lost = Math.floor(game.bytes * 0.75);
    game.bytes -= lost;
    render();
    saveClicker();
    return `${fmt(lost)} bytes, 3/4 of everything you had`;
  },
  onAnswer: correct => answered(correct),
});

requestAnimationFrame(loop);
