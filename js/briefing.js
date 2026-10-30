// Between levels (Levels mode only):
//  1. 🎉 Level Cleared: stars and stats for the level you just beat
//  2. 🆕 New Skill (every 5 levels): a short lesson, then a 2-question skill check
//  3. 📋 Level Briefing: the words you need for the next level and what's coming,
//     with "I know this" or "Study the flashcards"
// Uses SKILLS and FLASHCARDS from content.js.

const SKILL_REWARD = 10;   // bytes per right answer in a skill check

const clearedDialog = el('dlg-cleared');
const skillDialog = el('dlg-skill');
const briefDialog = el('dlg-brief');

// The flashcard word that goes with each threat
const THREAT_WORDS = {
  phisher: ['Phishing', 'Red flag'],
  cracker: ['Password attack', '2-step verification (2FA)'],
  worm: ['Malware', 'Software update'],
  catfish: ['Catfish', 'Verify'],
  ransomware: ['Ransomware', 'Backup'],
  omega: ['Double extortion', 'Ransomware'],
};
const seenWords = new Set();   // words already shown in a briefing, so new ones get a NEW tag
let levelStart = null;         // stats when the level started
let briefingLevel = null;      // the level the open briefing is for
let briefNew = null;           // { level, terms } words tagged NEW in the current briefing

const cardFor = term => FLASHCARDS.find(card => card.term === term);

// ---------- 1. Level Cleared ----------
// Stars (1 to 3) come from three things during the level:
//  - Questions: how many you got right (scans, DMs, boss questions, Real or Scam...)
//  - Data kept: losing 5 or more data drops this to zero
//  - Threats stopped: how many you stopped instead of letting through
const STAR_WEIGHTS = { questions: 0.4, data: 0.3, stopped: 0.3 };
const DATA_FOR_ZERO = 5;
const STARS_AT = [0.7, 0.9];   // score needed for 2 stars and 3 stars

const totalOf = counts => Object.values(counts).reduce((a, b) => a + b, 0);

hooks.waveStart.push(() => {
  levelStart = { stopped: totalOf(state.stopped), leaked: totalOf(state.leaked), data: state.data, right: 0, answered: 0 };
});

// Count every answer between the start of a level and its Real or Scam round
answerListeners.push(correct => {
  if (!levelStart) return;
  levelStart.answered++;
  if (correct) levelStart.right++;
});

function levelResult() {
  const stopped = totalOf(state.stopped) - levelStart.stopped;
  const leaked = totalOf(state.leaked) - levelStart.leaked;
  const lost = levelStart.data - state.data;
  const parts = {
    questions: levelStart.answered ? levelStart.right / levelStart.answered : 1,
    data: Math.max(0, 1 - lost / DATA_FOR_ZERO),
    stopped: stopped + leaked ? stopped / (stopped + leaked) : 1,
  };
  const score = Object.entries(STAR_WEIGHTS).reduce((sum, [key, weight]) => sum + parts[key] * weight, 0);
  const stars = score >= STARS_AT[1] ? 3 : score >= STARS_AT[0] ? 2 : 1;
  return { stars, parts, stopped, leaked, lost, right: levelStart.right, answered: levelStart.answered };
}

hooks.afterQuiz.push((right, total, bytesEarned) => {
  if (!LEVELS_MODE || state.over || !levelStart) return;
  const result = levelResult();
  levelStart = null;
  saveLevelStars(state.wave, result.stars);
  showCleared(state.wave, result, bytesEarned);
});

// Level 100 ends the game right away, so save its stars there
hooks.end.push(() => {
  if (!LEVELS_MODE || !state.won || !levelStart) return;
  saveLevelStars(LEVEL_COUNT, levelResult().stars);
  levelStart = null;
});

function starRow(stars) {
  return [1, 2, 3].map(i => `<span class="${i <= stars ? 'on' : ''}">★</span>`).join('');
}

function showCleared(level, result, bytesEarned) {
  const { stars, parts } = result;
  const best = levelStars[level] || 0;

  el('cleared-title').textContent = `Level ${level} Cleared!`;
  el('cleared-stars').innerHTML = starRow(stars);
  el('cleared-stars').setAttribute('aria-label', `${stars} out of 3 stars`);
  el('cleared-praise').textContent =
    (stars === 3 ? 'Perfect run!' : stars === 2 ? 'Great job!' : 'You made it!') +
    (best > stars ? ` Your best here is still ${best} stars.` : stars < 3 ? ' Replay it from the Level Map to earn more stars.' : '');

  const meter = (label, value, detail) => `
    <div class="score-row">
      <span class="score-label">${label}</span>
      <span class="score-bar"><span style="width: ${Math.round(value * 100)}%"></span></span>
      <span class="score-detail">${detail}</span>
    </div>`;
  el('cleared-stats').innerHTML =
    meter('Questions right', parts.questions, `${result.right}/${result.answered}`) +
    meter('Data kept', parts.data, result.lost ? `lost ${result.lost}` : 'none lost') +
    meter('Threats stopped', parts.stopped, `${result.stopped}/${result.stopped + result.leaked}`) +
    `<p class="score-bytes">+${bytesEarned} bonus bytes</p>`;
  el('cleared-next').textContent = `Move on to Level ${level + 1}`;
  makeConfetti();
  clearedDialog.showModal();
  playSound('badge');
  el('cleared-next').focus();
}

function makeConfetti() {
  const box = el('confetti');
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

function moveOn() {
  clearedDialog.close();
  nextLevelSteps(state.wave + 1);
}

el('cleared-next').addEventListener('click', moveOn);
el('cleared-map').addEventListener('click', () => { clearedDialog.close(); openLevels(); });
clearedDialog.addEventListener('cancel', e => { e.preventDefault(); moveOn(); });

// A new skill first (every 5 levels), then the briefing
function nextLevelSteps(level) {
  const skill = SKILLS.find(s => s.level === level);
  if (skill) showSkill(skill, () => showBriefing(level));
  else showBriefing(level);
}

// ---------- 2. New Skill ----------
let skillDone = null;
let currentSkill = null;

function showSkill(skill, done) {
  currentSkill = skill;
  skillDone = done;
  el('skill-tag').textContent = `🆕 New skill unlocked · Level ${skill.level}`;
  el('skill-emoji').textContent = skill.emoji;
  el('skill-name').textContent = skill.name;
  el('skill-lesson').textContent = skill.lesson;
  el('skill-tips').innerHTML = '';
  for (const tip of skill.tips) {
    const li = document.createElement('li');
    li.textContent = tip;
    el('skill-tips').appendChild(li);
  }
  el('skill-word').innerHTML = '';
  el('skill-word').appendChild(vocabCard(skill.vocab, true));
  skillDialog.showModal();
  el('skill-go').focus();
}

// Two questions in a row, then a reward
function runSkillCheck() {
  skillDialog.close();
  const questions = shuffle(currentSkill.questions);
  let right = 0;
  const ask = i => {
    if (i >= questions.length) {
      state.bytes += right * SKILL_REWARD;
      updateHud();
      showToast(`🧠 Skill check: ${right}/${questions.length} right! +${right * SKILL_REWARD} bytes. "${currentSkill.vocab.term}" is in your flashcards.`);
      skillDone();
      return;
    }
    openQuestion({
      tag: `🧠 Skill check ${i + 1}/${questions.length}: ${currentSkill.name}`,
      title: 'Skill Check',
      prompt: questions[i].prompt,
      options: questions[i].options,
    }, correct => {
      if (correct) right++;
      ask(i + 1);
    });
  };
  ask(0);
}

el('skill-go').addEventListener('click', runSkillCheck);
skillDialog.addEventListener('cancel', e => e.preventDefault());

// ---------- 3. Level Briefing ----------
function vocabCard(card, isNew) {
  const div = document.createElement('div');
  div.className = 'vocab';
  div.innerHTML = '<p class="vocab-term"></p><p class="vocab-def"></p>';
  div.querySelector('.vocab-term').textContent = card.term;
  if (isNew) div.querySelector('.vocab-term').insertAdjacentHTML('beforeend', ' <span class="new-word">NEW</span>');
  div.querySelector('.vocab-def').textContent = card.def;
  return div;
}

function showBriefing(level) {
  briefingLevel = level;
  const wave = level - 1;
  const groups = plannedWave(wave);
  const counts = {};
  for (const [type, count] of groups) counts[type] = (counts[type] || 0) + count;
  const types = Object.keys(counts);

  el('brief-tag').textContent = `Level ${level} briefing`;
  el('brief-title').textContent = counts.omega ? 'The Final Battle' : isBossWave(wave) ? `Level ${level}: Boss Level` : `Get Ready for Level ${level}`;

  // Words: the ones for this level's threats, plus this level's new skill
  const terms = [];
  const skill = SKILLS.find(s => s.level === level);
  if (skill) terms.push(skill.vocab.term);
  for (const type of types) terms.push(...THREAT_WORDS[type]);
  const cards = [...new Set(terms)].map(cardFor).filter(Boolean).slice(0, 4);
  // Coming back from studying keeps the same NEW tags
  if (!briefNew || briefNew.level !== level) {
    briefNew = { level, terms: new Set(cards.map(c => c.term).filter(term => !seenWords.has(term))) };
  }
  const vocab = el('brief-vocab');
  vocab.innerHTML = '';
  for (const card of cards) {
    vocab.appendChild(vocabCard(card, briefNew.terms.has(card.term)));
    seenWords.add(card.term);
  }
  el('brief-study').dataset.card = cards.length ? Math.max(0, unlockedCards(level).indexOf(cards[0])) : 0;

  // What's coming: one row per threat, colored like the tower that beats it
  const intel = el('brief-intel');
  intel.innerHTML = '';
  for (const type of types) {
    const t = THREATS[type];
    const tower = TOWERS[t.weakTo];
    const row = document.createElement('div');
    row.className = `intel-row${t.boss ? ' boss' : ''}`;
    row.style.setProperty('--accent', t.boss ? '#ff3d8b' : tower.color);
    if (t.boss) {
      row.innerHTML = `<p class="intel-head"><span class="intel-name">${t.name}</span><span class="intel-count">Boss</span></p>
        <p class="intel-spot">${t.final
          ? 'Three phases, calls in reinforcements and locks towers fast. Only expert answers restore them, and wrong answers heal it.'
          : 'Locks your towers. Click a locked tower and answer a question to restore it and damage the boss.'}</p>`;
    } else {
      const needsUnlock = unlocked.has(t.weakTo) ? '' : '<span class="intel-lock">unlock it first</span>';
      row.innerHTML = `<p class="intel-head"><span class="intel-name">${counts[type] === 1 ? t.name : t.plural}</span><span class="intel-count">× ${counts[type]}</span></p>
        <p class="intel-counter">Counter: <strong>${tower.name}</strong> ${needsUnlock}</p>
        <p class="intel-spot">${t.hidden ? 'Invisible until scanned or revealed by a Verify Beacon. ' : ''}Watch for: ${t.spot}</p>`;
    }
    intel.appendChild(row);
  }

  // Short tips underneath
  const list = el('brief-know');
  list.innerHTML = '';
  const add = text => {
    const li = document.createElement('li');
    li.textContent = text;
    list.appendChild(li);
  };
  // Flashcards unlock 5 levels at a time (study.js), at levels 1, 6, 11...
  if ((level - 1) % CARD_BLOCK === 0) {
    const fresh = unlockedCards(level).filter(card => card.level >= level);
    if (fresh.length) add(`${fresh.length} new flashcard${fresh.length === 1 ? '' : 's'} unlocked in Study for levels ${level}–${level + CARD_BLOCK - 1}.`);
  }
  const tougher = Math.round((hpScale(wave) - 1) * 100);
  if (tougher > 0) add(`Threats are ${tougher}% tougher than at the start, so upgrade your towers.`);
  add('Scan threats as they arrive. Identifying one makes the right tower do double damage.');

  briefDialog.showModal();
  el('brief-go').focus();
}

function closeBriefing() {
  briefDialog.close();
  briefingLevel = null;
  showToast(`Build your defense, then press Start Level ${state.wave + 1}!`);
}

el('brief-go').addEventListener('click', closeBriefing);
// Study the words, then come back to the briefing
el('brief-study').addEventListener('click', () => {
  const level = briefingLevel;
  briefDialog.close();
  openStudy('cards', Number(el('brief-study').dataset.card), () => showBriefing(level));
});
briefDialog.addEventListener('cancel', e => { e.preventDefault(); closeBriefing(); });

// Play Again in Levels mode starts at level 1, so brief that too.
// (Starting from the map or a retry is handled in levels.js, and the very first game in main.js.)
if (LEVELS_MODE) {
  el('btn-again').addEventListener('click', () => showBriefing(1));
}
