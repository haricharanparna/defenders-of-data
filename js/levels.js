// Levels mode: the Level Map and the Security Clearance test.
// The 🗺️ Levels button shows all 100 levels. Levels you've reached can be played any time.
// To jump past them, pass a Security Clearance test: a mix of question types,
// 3 firewall shields, and a decrypt bar. Higher levels = more and harder questions.
// Pass it and you start at that level with bytes to build your defense.

const SHIELDS = 3;
const GRANTED = ['ACCESS GRANTED', 'THREAT BLOCKED', 'FIREWALL HOLDING', 'SCAN COMPLETE', 'DEFENSE CONFIRMED'];

const levelsDialog = el('dlg-levels');
const skipDialog = el('dlg-skip');

// The map, its button and the clearance test are only in Levels mode
el('btn-levels').hidden = !LEVELS_MODE;

// Highest level you can play without a clearance test
const reachedLevel = () => Math.min(LEVEL_COUNT, bestWave + 1);

// ---------- Level map ----------
function openLevels() {
  el('levels-best').textContent = `🏆 Cleared ${bestWave} of ${LEVEL_COUNT} levels. Play any level you've reached, or pass a Security Clearance test to jump ahead!`;

  const grid = el('levels-grid');
  grid.innerHTML = '';
  for (let level = 1; level <= LEVEL_COUNT; level++) {
    const btn = document.createElement('button');
    const boss = isBossWave(level - 1);
    const current = level === state.wave + 1 && !state.over;
    const cleared = level <= bestWave;
    const locked = level > reachedLevel();
    const final = level === LEVEL_COUNT;
    btn.className = `level${final ? ' final' : boss ? ' boss' : ''}${cleared ? ' cleared' : ''}${locked ? ' locked' : ''}${current ? ' current' : ''}`;
    btn.innerHTML = final
      // The last level gets its own big tile in the middle
      ? `<span class="final-skull">☠️</span><span class="final-text"><span class="final-tag">Level ${level} · Final Boss</span><span class="final-name">OMEGA</span></span><span class="final-skull">${cleared ? '🏆' : locked ? '🔒' : current ? '📍' : '☠️'}</span>`
      : `<span class="level-num">${level}</span><span class="level-icon">${current ? '📍' : boss ? '👾' : cleared ? '✓' : locked ? '🔒' : ''}</span>`;
    btn.setAttribute('aria-label', `Level ${level}${final ? ', final boss: Omega Ransomware' : boss ? ', boss level' : ''}${current ? ', you are here' : cleared ? ', cleared' : locked ? ', locked' : ''}`);
    btn.addEventListener('click', () => chooseLevel(level));
    grid.appendChild(btn);
  }
  showLevelsPanel('levels-map');
  levelsDialog.showModal();
  grid.querySelector('.current')?.scrollIntoView({ block: 'center' });
}

function showLevelsPanel(id) {
  el('levels-map').hidden = id !== 'levels-map';
  el('levels-confirm').hidden = id !== 'levels-confirm';
}

let skipTarget = 1;

function chooseLevel(level) {
  if (level === state.wave + 1 && !state.over) {
    levelsDialog.close();
    return;
  }
  skipTarget = level;
  const locked = level > reachedLevel();
  const final = level === LEVEL_COUNT;
  el('confirm-emoji').textContent = final ? '☠️' : locked ? '🔐' : '🚀';
  el('confirm-title').textContent = final ? 'Final Boss: Omega Ransomware' : locked ? `Level ${level} Is Locked` : `Play Level ${level}?`;
  el('levels-confirm').classList.toggle('final-confirm', final);
  el('confirm-text').textContent = locked
    ? `Pass a Security Clearance test to unlock it: ${skipQuestionCount(level)} questions, and you can only lose ${SHIELDS - 1} firewall shields. Higher levels have harder questions! If you pass, you start at level ${level} with 💾 ${bytesForWave(level)} bytes to build with.`
    : `Your current game will end and you'll start at level ${level}${level > 1 ? ` with 💾 ${bytesForWave(level)} bytes to build with` : ''}.`;
  if (final) {
    el('confirm-text').textContent = `The ultimate ransomware. It has 3 phases, calls in reinforcements and locks your towers fast. Only the hardest questions can restore them. ${el('confirm-text').textContent}`;
  }
  el('confirm-go').textContent = locked ? '🔐 Start clearance test' : final ? '☠️ Face the final boss' : '▶ Play';
  el('confirm-go').dataset.locked = locked;
  showLevelsPanel('levels-confirm');
  el('confirm-go').focus();
}

el('confirm-go').addEventListener('click', () => {
  levelsDialog.close();
  if (el('confirm-go').dataset.locked === 'true') startSkipQuiz(skipTarget);
  else startAtWave(skipTarget);
});
el('confirm-back').addEventListener('click', () => showLevelsPanel('levels-map'));
el('levels-close').addEventListener('click', () => levelsDialog.close());
el('btn-levels').addEventListener('click', () => { if (!anyDialogOpen()) openLevels(); });
el('btn-end-levels').addEventListener('click', () => { endDialog.close(); openLevels(); });
el('btn-retry').addEventListener('click', () => startAtWave(state.wave + 1));
document.addEventListener('keydown', e => {
  if ((e.key === 'v' || e.key === 'V') && LEVELS_MODE && !anyDialogOpen()) openLevels();
});

// Bytes you start with on a later level, so you can build a defense that fits it
function bytesForWave(level) {
  return START_BYTES + Math.round(110 * (level - 1) + 4.5 * (level - 1) ** 2);
}

function startAtWave(level) {
  if (endDialog.open) endDialog.close();
  newGame();
  if (level > 1) {
    // You proved you know your stuff, so every tower is unlocked
    Object.keys(TOWERS).forEach(id => unlocked.add(id));
    state.wave = level - 1;
    state.bytes = bytesForWave(level);
    state.lastLogin = state.wave;
  }
  updateHud();
  showToast(level > 1 ? `🚀 Level ${level}! Build your towers, then press Start Level.` : 'Fresh start! Good luck, Defender.');
}

// ---------- Security Clearance test ----------
const skipQuestionCount = level => Math.min(12, 4 + Math.ceil(level / 10));

let skip = null;  // { target, questions, index, shields, right, chain, answered, pick }

// Every multiple-choice question in the game, for the test to pick from
function mcPool() {
  const unlocks = Object.values(CHALLENGES).flat().filter(c => !c.password);
  return [...unlocks, ...Object.values(UPGRADES).flat(), ...BOSS_QUESTIONS];
}

// Builds the list of questions, mixing the types so it stays fun
function buildSkipQuestions(level) {
  const tier = tierFor(level - 1);
  const makers = [makeChoice, makeRealScam, makeTrueFalse, makeLinks, makeSentence, makeMatch];
  const questions = [];
  let order = [];
  while (questions.length < skipQuestionCount(level)) {
    if (order.length === 0) order = shuffle(makers);
    questions.push(order.pop()(tier));
  }
  return questions;
}

// Each maker returns { label, render(body), check() -> true/false, solution, why, msg }
// render() calls ready(true/false) to turn the Submit button on and off.

function choiceButtons(body, texts, className = '') {
  const wrap = document.createElement('div');
  wrap.className = `sq-choices ${className}`;
  texts.forEach((text, i) => {
    const btn = document.createElement('button');
    btn.className = 'sq-choice';
    btn.innerHTML = `<span class="sq-key">${String.fromCharCode(65 + i)}</span><span></span>`;
    btn.lastChild.textContent = text;
    btn.addEventListener('click', () => {
      wrap.querySelectorAll('.sq-choice').forEach(b => b.classList.toggle('picked', b === btn));
      skip.pick = text;
      ready(true);
    });
    wrap.appendChild(btn);
  });
  body.appendChild(wrap);
}

function promptText(body, text) {
  const p = document.createElement('p');
  p.className = 'sq-prompt';
  p.textContent = text;
  body.appendChild(p);
}

function makeChoice(tier) {
  const [q] = drawQuestions(mcPool(), tier, 1);
  const right = q.options.find(o => o.correct);
  return {
    label: '🧠 Threat intel',
    render(body) {
      promptText(body, q.prompt);
      if (q.msg) {
        const box = document.createElement('div');
        box.className = 'message';
        renderMessage(box, q.msg);
        body.appendChild(box);
      }
      choiceButtons(body, shuffle(q.options).map(o => o.text));
    },
    check: () => skip.pick === right.text,
    solution: right.text,
    why: right.why.replace(/^(Right|Correct)! /, ''),
    msg: { from: 'Question', text: q.prompt },
  };
}

function makeRealScam(tier) {
  const [q] = drawQuestions(QUIZ, tier, 1);
  const label = q.answer === 'real' ? '✅ Real' : '🚩 Scam';
  return {
    label: '📡 Intercepted message: real or scam?',
    render(body) {
      const box = document.createElement('div');
      box.className = 'message';
      renderMessage(box, q);
      body.appendChild(box);
      choiceButtons(body, ['✅ Real', '🚩 Scam'], 'two');
    },
    check: () => skip.pick === label,
    solution: label,
    why: q.why,
    msg: q,
  };
}

function makeTrueFalse(tier) {
  const [q] = drawQuestions(TRUE_FALSE, tier, 1);
  const label = q.answer ? '✔ Fact' : '✖ Myth';
  return {
    label: '⚖️ Fact or myth?',
    render(body) {
      promptText(body, `"${q.text}"`);
      choiceButtons(body, ['✔ Fact', '✖ Myth'], 'two');
    },
    check: () => skip.pick === label,
    solution: label,
    why: q.why,
    msg: { from: 'Fact or myth?', text: q.text },
  };
}

function makeLinks(tier) {
  const [q] = drawQuestions(LINK_SETS, tier, 1);
  return {
    label: '🔗 Link scanner',
    render(body) {
      promptText(body, 'Three of these are traps. Which link is the REAL website?');
      choiceButtons(body, shuffle([q.real, ...q.fakes]), 'links');
    },
    check: () => skip.pick === q.real,
    solution: q.real,
    why: 'Read the domain right before the first single "/", letter by letter. The fakes add extra words, swap letters, or hide the real name at the start.',
    msg: { from: 'Link scanner', text: [q.real, ...q.fakes].join('  ·  ') },
  };
}

function makeSentence(tier) {
  const [q] = drawQuestions(SENTENCES, tier, 1);
  const goal = q.words.join(' ');
  return {
    label: '🧩 Repair the security rule',
    render(body) {
      promptText(body, 'A hacker scrambled this safety rule (and added fake pieces). Put the right code blocks back in order.');
      const answer = document.createElement('div');
      answer.className = 'sq-answer';
      answer.setAttribute('aria-label', 'Your rule');
      const bank = document.createElement('div');
      bank.className = 'sq-bank';
      const update = () => {
        skip.pick = [...answer.children].map(t => t.textContent).join(' ');
        ready(answer.children.length > 0);
      };
      for (const word of shuffle([...q.words, ...q.extra])) {
        const tile = document.createElement('button');
        tile.className = 'sq-tile';
        tile.textContent = word;
        // Click to move a block between the pile and the rule
        tile.addEventListener('click', () => {
          if (skip.answered) return;
          (tile.parentElement === bank ? answer : bank).appendChild(tile);
          update();
        });
        bank.appendChild(tile);
      }
      body.append(answer, bank);
      update();
    },
    check: () => skip.pick === goal,
    solution: goal,
    why: 'Remember this rule. It keeps you safe in real life too!',
    msg: { from: 'Repair the rule', text: goal },
  };
}

function makeMatch() {
  const cards = shuffle(FLASHCARDS).slice(0, 4);
  return {
    label: '🔌 Reconnect the wires',
    render(body) {
      promptText(body, 'The network got unplugged! Connect each term to what it means.');
      const grid = document.createElement('div');
      grid.className = 'sq-match';
      const left = document.createElement('div');
      const right = document.createElement('div');
      let picked = null;
      let matched = 0;
      skip.matchMistakes = 0;

      const tap = (btn, side) => {
        if (btn.disabled || skip.answered) return;
        if (!picked || picked.side === side) {
          if (picked) picked.btn.classList.remove('picked');
          picked = { btn, side };
          btn.classList.add('picked');
          return;
        }
        if (picked.btn.dataset.id === btn.dataset.id) {
          playSound('place');
          for (const b of [picked.btn, btn]) { b.classList.remove('picked'); b.classList.add('matched'); b.disabled = true; }
          matched++;
          if (matched === cards.length) { skip.pick = 'done'; ready(true); }
        } else {
          skip.matchMistakes++;
          for (const b of [picked.btn, btn]) {
            b.classList.remove('picked');
            b.classList.add('nope');
            setTimeout(() => b.classList.remove('nope'), 400);
          }
        }
        picked = null;
      };

      const addSide = (column, items, side) => {
        for (const card of items) {
          const btn = document.createElement('button');
          btn.className = 'sq-tile';
          btn.dataset.id = card.term;
          btn.textContent = side === 'term' ? `${card.emoji} ${card.term}` : card.short;
          btn.addEventListener('click', () => tap(btn, side));
          column.appendChild(btn);
        }
      };
      addSide(left, shuffle(cards), 'term');
      addSide(right, shuffle(cards), 'def');
      grid.append(left, right);
      body.appendChild(grid);
    },
    // Wiring never costs a shield, but only a perfect job keeps your chain going
    check: () => true,
    perfect: () => skip.matchMistakes === 0,
    solution: '',
    why: cards.map(c => `${c.term}: ${c.short}`).join(' · '),
  };
}

// ---------- Running the test ----------
function ready(on) {
  el('sq-check').disabled = !on;
}

function drawShields() {
  el('sq-shields').innerHTML = Array.from({ length: SHIELDS }, (_, i) =>
    `<span class="${i < skip.shields ? 'up' : 'down'}">${i < skip.shields ? '🛡️' : '💥'}</span>`).join('');
}

function drawDecrypt() {
  const total = skip.questions.length;
  el('sq-decrypt').innerHTML = skip.questions.map((_, i) =>
    `<span class="${i < skip.index ? 'done' : i === skip.index ? 'now' : ''}"></span>`).join('');
  el('sq-count').textContent = `DECRYPTING ${Math.min(skip.index + 1, total)}/${total}`;
}

function startSkipQuiz(target) {
  skip = { target, questions: buildSkipQuestions(target), index: 0, shields: SHIELDS, right: 0, chain: 0, answered: false };
  el('sq-target').textContent = `SECURITY CLEARANCE · LEVEL ${target}`;
  showSkipPanel('sq-play');
  skipDialog.showModal();
  showSkipQuestion();
}

function showSkipPanel(id) {
  for (const panel of ['sq-play', 'sq-end']) el(panel).hidden = panel !== id;
}

function showSkipQuestion() {
  const q = skip.questions[skip.index];
  skip.pick = null;
  skip.answered = false;
  drawShields();
  drawDecrypt();
  el('sq-label').textContent = q.label;
  const body = el('sq-body');
  body.innerHTML = '';
  q.render(body);
  el('sq-terminal').hidden = true;
  el('sq-terminal').className = 'sq-terminal';
  el('sq-check').textContent = 'Submit ▶';
  ready(false);
  body.querySelector('button')?.focus();
}

function checkSkipAnswer() {
  const q = skip.questions[skip.index];
  skip.answered = true;
  el('sq-body').querySelectorAll('button').forEach(b => { b.disabled = true; });
  const correct = q.check();
  const perfect = correct && (!q.perfect || q.perfect());
  // Show which choice was right (and which pick was wrong)
  el('sq-body').querySelectorAll('.sq-choice').forEach(b => {
    const text = b.lastChild.textContent;
    if (text === q.solution) b.classList.add('right');
    else if (text === skip.pick) b.classList.add('wrong');
  });

  const terminal = el('sq-terminal');
  terminal.hidden = false;
  // Sounds only: test answers don't charge your in-game Firewall Blast
  playSound(correct ? 'right' : 'wrong');
  if (correct) {
    skip.right++;
    skip.chain = perfect ? skip.chain + 1 : 0;
    terminal.className = 'sq-terminal good';
    terminal.innerHTML = `<p class="sq-line">&gt; ${pickRandom(GRANTED)} ✔${skip.chain >= 3 ? ` <span class="sq-chain">⚡ CHAIN x${skip.chain}</span>` : ''}</p><p class="sq-why"></p>`;
  } else {
    skip.chain = 0;
    skip.shields--;
    drawShields();
    el('sq-shields').classList.add('hit');
    setTimeout(() => el('sq-shields').classList.remove('hit'), 500);
    terminal.className = 'sq-terminal bad';
    terminal.innerHTML = `<p class="sq-line">&gt; ACCESS DENIED ✖ Shield lost!</p><p class="sq-line">&gt; Answer: <span class="sq-solution"></span></p><p class="sq-why"></p>`;
    terminal.querySelector('.sq-solution').textContent = q.solution;
    recordMiss({ kind: '🔐 Security Clearance', msg: q.msg, yours: skip.pick, right: q.solution, why: q.why });
  }
  terminal.querySelector('.sq-why').textContent = q.why;
  el('sq-check').textContent = skip.shields === 0 ? 'See results ▶' : 'Next ▶';
  el('sq-check').disabled = false;
  el('sq-check').focus();
}

function nextSkipQuestion() {
  skip.index++;
  if (skip.shields === 0 || skip.index >= skip.questions.length) finishSkipQuiz();
  else showSkipQuestion();
}

function finishSkipQuiz() {
  const passed = skip.shields > 0;
  const answered = Math.min(skip.index, skip.questions.length);
  el('sq-end-emoji').textContent = passed ? '🔓' : '🚨';
  el('sq-end-title').textContent = passed ? 'Clearance Granted' : 'Clearance Denied';
  el('sq-end-text').textContent = passed
    ? `You answered ${skip.right} of ${skip.questions.length} right. Level ${skip.target} is unlocked. Time to defend!`
    : `Your firewall went down after ${answered} questions (${skip.right} right). Check the 📚 Study tab (your mistakes are in Missed), then try again!`;
  el('sq-start').hidden = !passed;
  el('sq-retry').hidden = passed;
  showSkipPanel('sq-end');
  playSound(passed ? 'badge' : 'leak');
  (passed ? el('sq-start') : el('sq-retry')).focus();
}

el('sq-check').addEventListener('click', () => {
  if (skip.answered) nextSkipQuestion();
  else checkSkipAnswer();
});
el('sq-quit').addEventListener('click', () => skipDialog.close());
el('sq-start').addEventListener('click', () => {
  skipDialog.close();
  startAtWave(skip.target);
});
el('sq-retry').addEventListener('click', () => startSkipQuiz(skip.target));
el('sq-back').addEventListener('click', () => { skipDialog.close(); openLevels(); });

// Keys: A-D pick an answer, Enter submits / goes on
skipDialog.addEventListener('keydown', e => {
  if (el('sq-play').hidden || e.ctrlKey || e.metaKey || e.altKey) return;
  const choices = el('sq-body').querySelectorAll('.sq-choice');
  const index = e.key.length === 1 ? e.key.toUpperCase().charCodeAt(0) - 65 : -1;
  if (index >= 0 && index < choices.length && !skip.answered) choices[index].click();
  else if (e.key === 'Enter' && !el('sq-check').disabled && e.target.id !== 'sq-check') {
    e.preventDefault();
    el('sq-check').click();
  }
});
