// Level map + skip-ahead quiz.
// The 🗺️ Levels button shows every wave. To jump ahead, pass a quick Duolingo-style quiz:
// a mix of question types, 3 hearts, a progress bar and combos. Higher waves = more and harder questions.
// Pass it and you start a fresh game at that wave with bytes to build your defense.

const SKIP_HEARTS = 3;
const PRAISE = ['Nice!', 'Awesome!', 'You got it!', 'Great job!', 'Nailed it!', 'Correct!'];

const levelsDialog = el('dlg-levels');
const skipDialog = el('dlg-skip');

// ---------- Level map ----------
function openLevels() {
  const furthest = Math.max(bestWave, state.wave);
  const shown = Math.max(30, Math.ceil((furthest + 10) / 10) * 10);
  el('levels-best').textContent = `🏆 Your best: ${bestWave} wave${bestWave === 1 ? '' : 's'}. Pass a quick quiz to skip ahead!`;

  const grid = el('levels-grid');
  grid.innerHTML = '';
  for (let wave = 1; wave <= shown; wave++) {
    const btn = document.createElement('button');
    const boss = isBossWave(wave - 1);
    const current = wave === state.wave + 1;
    btn.className = `level${boss ? ' boss' : ''}${wave <= bestWave ? ' cleared' : ''}${current ? ' current' : ''}`;
    btn.innerHTML = `<span class="level-num">${wave}</span><span class="level-icon">${current ? '📍' : boss ? '👾' : wave <= bestWave ? '✓' : ''}</span>`;
    btn.setAttribute('aria-label', `Wave ${wave}${boss ? ', boss wave' : ''}${current ? ', you are here' : ''}`);
    btn.addEventListener('click', () => chooseLevel(wave));
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

function chooseLevel(wave) {
  if (wave === state.wave + 1 && !state.over) {
    levelsDialog.close();
    return;
  }
  skipTarget = wave;
  const count = skipQuestionCount(wave);
  el('confirm-title').textContent = wave === 1 ? 'Start Over at Wave 1?' : `Skip to Wave ${wave}?`;
  el('confirm-text').textContent = wave === 1
    ? 'Your current game will end and you\'ll start fresh at wave 1.'
    : `Answer ${count} questions without losing all ${SKIP_HEARTS} hearts. Higher waves have harder questions! If you pass, you start a new game at wave ${wave} with 💾 ${bytesForWave(wave)} bytes to build with.`;
  el('confirm-go').textContent = wave === 1 ? '🔄 Start over' : '🚀 Start the quiz';
  showLevelsPanel('levels-confirm');
  el('confirm-go').focus();
}

el('confirm-go').addEventListener('click', () => {
  levelsDialog.close();
  if (skipTarget === 1) startAtWave(1);
  else startSkipQuiz(skipTarget);
});
el('confirm-back').addEventListener('click', () => showLevelsPanel('levels-map'));
el('levels-close').addEventListener('click', () => levelsDialog.close());
el('btn-levels').addEventListener('click', () => { if (!anyDialogOpen()) openLevels(); });
el('btn-end-levels').addEventListener('click', () => { endDialog.close(); openLevels(); });
document.addEventListener('keydown', e => {
  if ((e.key === 'v' || e.key === 'V') && !anyDialogOpen()) openLevels();
});

// Bytes you start with when you skip ahead, so you can build a defense that fits the wave
function bytesForWave(wave) {
  return START_BYTES + Math.round(95 * (wave - 1) + 4 * (wave - 1) ** 2);
}

function startAtWave(wave) {
  if (endDialog.open) endDialog.close();
  newGame();
  if (wave > 1) {
    // You proved you know your stuff, so every tower is unlocked
    Object.keys(TOWERS).forEach(id => unlocked.add(id));
    state.wave = wave - 1;
    state.bytes = bytesForWave(wave);
    state.lastLogin = state.wave;
  }
  updateHud();
  showToast(wave > 1 ? `🚀 Welcome to Wave ${wave}! Build your towers, then press Start Wave.` : 'Fresh start! Good luck, Defender.');
}

// ---------- Skip quiz ----------
const skipQuestionCount = wave => Math.min(12, 4 + Math.ceil(wave / 5));

let skip = null;  // { target, questions, index, hearts, right, combo, answered }

// Every multiple-choice question in the game, for the quiz to pick from
function mcPool() {
  const unlocks = Object.values(CHALLENGES).flat().filter(c => !c.password);
  return [...unlocks, ...Object.values(UPGRADES).flat(), ...BOSS_QUESTIONS];
}

// Builds the list of questions, mixing the types so it stays fun
function buildSkipQuestions(wave) {
  const tier = tierFor(wave - 1);
  const makers = [makeChoice, makeRealScam, makeTrueFalse, makeLinks, makeSentence, makeMatch];
  const questions = [];
  let order = [];
  while (questions.length < skipQuestionCount(wave)) {
    if (order.length === 0) order = shuffle(makers);
    questions.push(order.pop()(tier));
  }
  return questions;
}

// Each maker returns { label, render(body), check() -> true/false, solution, why, msg }
// render() calls ready(true/false) to turn the Check button on and off.

function choiceButtons(body, texts, className = '') {
  const wrap = document.createElement('div');
  wrap.className = `sq-choices ${className}`;
  texts.forEach((text, i) => {
    const btn = document.createElement('button');
    btn.className = 'sq-choice';
    btn.innerHTML = `<span class="sq-key">${i + 1}</span><span></span>`;
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
    label: 'Select the correct answer',
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
    label: 'Real or scam?',
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
  const label = q.answer ? '👍 True' : '👎 False';
  return {
    label: 'True or false?',
    render(body) {
      promptText(body, `"${q.text}"`);
      choiceButtons(body, ['👍 True', '👎 False'], 'two');
    },
    check: () => skip.pick === label,
    solution: label,
    why: q.why,
    msg: { from: 'True or false?', text: q.text },
  };
}

function makeLinks(tier) {
  const [q] = drawQuestions(LINK_SETS, tier, 1);
  return {
    label: 'Tap the REAL link',
    render(body) {
      promptText(body, 'Only one of these is the real website. Which one?');
      choiceButtons(body, shuffle([q.real, ...q.fakes]), 'links');
    },
    check: () => skip.pick === q.real,
    solution: q.real,
    why: 'Read the domain right before the first single "/", letter by letter. The fakes add extra words, swap letters, or hide the real name at the start.',
    msg: { from: 'Tap the real link', text: [q.real, ...q.fakes].join('  ·  ') },
  };
}

function makeSentence(tier) {
  const [q] = drawQuestions(SENTENCES, tier, 1);
  const goal = q.words.join(' ');
  return {
    label: 'Build the safety rule',
    render(body) {
      promptText(body, 'Tap the words in the right order to make a safety rule.');
      const answer = document.createElement('div');
      answer.className = 'sq-answer';
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
        // Tap to move a word between the bank and the answer line
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
    msg: { from: 'Build the rule', text: goal },
  };
}

function makeMatch() {
  const cards = shuffle(FLASHCARDS).slice(0, 4);
  return {
    label: 'Tap the matching pairs',
    render(body) {
      promptText(body, 'Match each word to what it means.');
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
    // Matching never costs a heart, but a perfect match counts toward your combo
    check: () => true,
    perfect: () => skip.matchMistakes === 0,
    solution: '',
    why: cards.map(c => `${c.term}: ${c.short}`).join(' · '),
  };
}

// ---------- Running the quiz ----------
function ready(on) {
  el('sq-check').disabled = !on;
}

function startSkipQuiz(target) {
  skip = { target, questions: buildSkipQuestions(target), index: 0, hearts: SKIP_HEARTS, right: 0, combo: 0, answered: false };
  el('sq-target').textContent = `Skip to Wave ${target}`;
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
  el('sq-progress-fill').style.width = `${(skip.index / skip.questions.length) * 100}%`;
  el('sq-hearts').textContent = `${'❤️'.repeat(skip.hearts)}${'🖤'.repeat(SKIP_HEARTS - skip.hearts)}`;
  el('sq-label').textContent = q.label;
  const body = el('sq-body');
  body.innerHTML = '';
  q.render(body);
  el('sq-footer').className = 'sq-footer';
  el('sq-feedback').innerHTML = '';
  el('sq-check').textContent = 'Check';
  ready(false);
  // Fresh question: put focus on the first thing to tap
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
  const footer = el('sq-footer');
  const feedback = el('sq-feedback');

  // Sounds only: skip-quiz answers don't charge your in-game Firewall Blast
  playSound(correct ? 'right' : 'wrong');
  if (correct) {
    skip.right++;
    skip.combo = perfect ? skip.combo + 1 : 0;
    footer.className = 'sq-footer good';
    feedback.innerHTML = `<strong>🎉 ${pickRandom(PRAISE)}</strong>${skip.combo >= 3 ? ` <span class="sq-combo">🔥 ${skip.combo} in a row!</span>` : ''}<p></p>`;
    feedback.querySelector('p').textContent = q.why;
  } else {
    skip.combo = 0;
    skip.hearts--;
    el('sq-hearts').textContent = `${'❤️'.repeat(skip.hearts)}${'🖤'.repeat(SKIP_HEARTS - skip.hearts)}`;
    el('sq-hearts').classList.add('ouch');
    setTimeout(() => el('sq-hearts').classList.remove('ouch'), 500);
    footer.className = 'sq-footer bad';
    feedback.innerHTML = '<strong>❌ Correct answer:</strong> <span class="sq-solution"></span><p></p>';
    feedback.querySelector('.sq-solution').textContent = q.solution;
    feedback.querySelector('p').textContent = q.why;
    recordMiss({ kind: '🗺️ Skip quiz', msg: q.msg, yours: skip.pick, right: q.solution, why: q.why });
  }
  el('sq-check').textContent = skip.hearts === 0 ? 'See results' : 'Continue';
  el('sq-check').disabled = false;
  el('sq-check').focus();
}

function nextSkipQuestion() {
  skip.index++;
  if (skip.hearts === 0 || skip.index >= skip.questions.length) finishSkipQuiz();
  else showSkipQuestion();
}

function finishSkipQuiz() {
  const passed = skip.hearts > 0;
  el('sq-progress-fill').style.width = passed ? '100%' : el('sq-progress-fill').style.width;
  const total = skip.index + (passed ? 0 : 1);
  el('sq-end-emoji').textContent = passed ? '🎉' : '💔';
  el('sq-end-title').textContent = passed ? `Wave ${skip.target} Unlocked!` : 'Out of Hearts!';
  el('sq-end-text').textContent = passed
    ? `You got ${skip.right} of ${skip.questions.length} right and earned ⚡ ${skip.right * 10} XP. Time to defend!`
    : `You got ${skip.right} of ${Math.min(total, skip.questions.length)} right. Check the 📚 Study tab (your mistakes are in Missed), then try again!`;
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

// Keys: 1-4 pick an answer, Enter checks / continues
skipDialog.addEventListener('keydown', e => {
  if (el('sq-play').hidden) return;
  const num = parseInt(e.key, 10);
  const choices = el('sq-body').querySelectorAll('.sq-choice');
  if (num >= 1 && num <= choices.length && !skip.answered) choices[num - 1].click();
  else if (e.key === 'Enter' && !el('sq-check').disabled && e.target.id !== 'sq-check') {
    e.preventDefault();
    el('sq-check').click();
  }
});
