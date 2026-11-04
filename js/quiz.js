// Quiz mode (quiz.html): test what you know, with questions from all three games.
// - Practice: right after each answer you see if you got it and why. No pressure, just learning.
// - Test: answer them all first, then get your score, a rank and a review of every question.
//   Passing (70% or more) earns stars, and you can print your results to hand in for class.
// Pick a topic, how hard, and how many questions. Uses the questions in content.js,
// so any new question added there shows up here too.
// Keys: 1-4 to answer, Enter for the next question.

const $ = id => document.getElementById(id);
const SETUP_KEY = 'defenders-of-data-quiz-setup';
const BEST_KEY = 'defenders-of-data-quiz-best';
const PASS = 70;   // percent you need to pass a test

const MODES = [
  { id: 'practice', emoji: '🎓', name: 'Practice', text: 'See the answer and why after every question.' },
  { id: 'test', emoji: '📝', name: 'Test', text: 'Answer them all, then get your score. Pass to earn stars.' },
];
const TOPICS = [
  { id: 'all', emoji: '🌐', name: 'Everything', text: 'A mix of every topic.' },
  { id: 'links', emoji: '🔗', name: 'Links and phishing', text: 'Fake websites, sneaky links and QR codes.' },
  { id: 'accounts', emoji: '🔐', name: 'Passwords and accounts', text: 'Passwords, 2-step verification and what to do if you get hacked.' },
  { id: 'scams', emoji: '🚩', name: 'Scams and strangers', text: 'Real or scam messages, DMs, fakes and money tricks.' },
  { id: 'devices', emoji: '🛡️', name: 'Devices and privacy', text: 'Updates, backups, Wi-Fi, apps and what you share.' },
];
const LEVELS = [
  { id: 'mixed', name: 'Mixed', levels: [1, 2, 3] },
  { id: 'easy', name: 'Easy', levels: [1] },
  { id: 'medium', name: 'Medium', levels: [2] },
  { id: 'hard', name: 'Hard', levels: [3] },
];
const LENGTHS = [
  { id: 10, name: '10' },
  { id: 20, name: '20' },
];
const RANKS = [
  [100, '🏆 Perfect score!'],
  [90, '🏆 Data Defender'],
  [70, '🛡️ Safe Surfer'],
  [50, '🔍 Getting there'],
  [0, '📚 Keep practicing'],
];

// ---------- Every question in the game, in one shape ----------
// { label, topic, level, prompt, msg, options: [{ text, correct, why }], two, links }
const TOWER_TOPICS = { linkcheck: 'links', twofa: 'accounts', update: 'devices', verify: 'scams' };
const SKILL_TOPICS = {
  'Reading Web Addresses': 'links', 'QR Code Scams': 'links',
  'Password Managers': 'accounts', 'Login Alerts and MFA Fatigue': 'accounts', 'If You Get Hacked': 'accounts',
  'Social Engineering': 'scams', 'Shopping Scams': 'scams', 'AI Fakes': 'scams', 'Crypto and Money Scams': 'scams',
  'Sextortion: Know What to Do': 'scams', 'Cyberbullying': 'scams',
};   // the rest are about devices and privacy

const choice = (q, topic, level) => ({ label: '🧠 Threat intel', topic, level, prompt: q.prompt, msg: q.msg, options: q.options });

function allQuestions() {
  const list = [];
  for (const [tower, questions] of Object.entries(UPGRADES)) {
    for (const q of questions) list.push(choice(q, TOWER_TOPICS[tower], q.level || 1));
  }
  for (const [tower, challenges] of Object.entries(CHALLENGES)) {
    for (const c of challenges) if (c.options && !c.password) list.push(choice(c, TOWER_TOPICS[tower], c.level || 1));
  }
  for (const skill of SKILLS) {
    for (const q of skill.questions) list.push(choice(q, SKILL_TOPICS[skill.name] || 'devices', skill.level <= 30 ? 2 : 3));
  }
  for (const q of BOSS_QUESTIONS) list.push(choice(q, 'devices', q.level || 2));
  for (const q of FINAL_BOSS_QUESTIONS) list.push(choice(q, 'devices', 3));
  for (const q of QUIZ) {
    list.push({
      label: '📡 Intercepted message: real or scam?', level: q.level || 1, msg: q, two: true,
      topic: q.from === 'Link' ? 'links' : /\bcode\b|password|log ?in/i.test(q.text) ? 'accounts' : 'scams',
      options: [
        { text: '✅ Real', correct: q.answer === 'real', why: q.why },
        { text: '🚩 Scam', correct: q.answer === 'scam', why: q.why },
      ],
    });
  }
  // Fact or myth covers every topic, so each one is sorted by what it's about
  const factTopic = text => (/password|login|code|verification|2-step|2FA/i.test(text) ? 'accounts'
    : /website|padlock|file|\.com/i.test(text) ? 'links'
    : /update|ransomware/i.test(text) ? 'devices' : 'scams');
  for (const q of TRUE_FALSE) {
    list.push({
      label: '⚖️ Fact or myth?', topic: factTopic(q.text), level: q.level || 1, prompt: `"${tr(q.text)}"`, two: true,
      options: [
        { text: '✔ Fact', correct: q.answer, why: q.why },
        { text: '✖ Myth', correct: !q.answer, why: q.why },
      ],
    });
  }
  const linkWhy = 'Read the domain right before the first single "/", letter by letter. The fakes add extra words, swap letters, or hide the real name at the start.';
  for (const q of LINK_SETS) {
    list.push({
      label: '🔗 Link scanner', topic: 'links', level: q.level || 1, links: true,
      prompt: 'Three of these are traps. Which link is the REAL website?',
      options: [q.real, ...q.fakes].map(link => ({ text: link, correct: link === q.real, why: linkWhy })),
    });
  }
  for (const dm of DMS) {
    list.push({
      // DMs that try to steal a login code are about your accounts
      label: '💬 New DM', topic: dm.punish === 'cracker' ? 'accounts' : 'scams', level: dm.level || 1, prompt: 'What\'s the safest reply?',
      msg: { from: dm.from, meta: dm.meta, text: dm.text },
      options: dm.replies.map(r => ({ text: r.text, correct: r.safe, why: r.why })),
    });
  }
  return list.filter(q => q.options.some(o => o.correct));
}
const ALL_QUESTIONS = allQuestions();

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Questions you just had go to the back of the line, so "New questions" really gives new ones
const recent = new Set();
function pickQuestions(topic, levelId, count) {
  const levels = LEVELS.find(l => l.id === levelId).levels;
  const freshFirst = list => shuffle(list).sort((a, b) => recent.has(a) - recent.has(b));
  const inTopic = ALL_QUESTIONS.filter(q => topic === 'all' || q.topic === topic);
  let chosen = freshFirst(inTopic.filter(q => levels.includes(q.level))).slice(0, count);
  // Not enough at this level: fill up with the closest level
  if (chosen.length < count) {
    const extra = freshFirst(inTopic.filter(q => !chosen.includes(q)))
      .sort((a, b) => Math.abs(a.level - levels[0]) - Math.abs(b.level - levels[0]));
    chosen = chosen.concat(extra.slice(0, count - chosen.length));
  }
  if (recent.size > 60) recent.clear();
  chosen.forEach(q => recent.add(q));
  // Mixed starts easy and gets harder
  return levelId === 'mixed' ? chosen.sort((a, b) => a.level - b.level) : chosen;
}

// "Right! Backups..." reads oddly when you got it wrong, so the "Right!" is left off (in Spanish too)
const whyText = option => tr(option.why).replace(/^¡?(Right|Correct|Correcto|Bien)!\s*/, '');

// ---------- Step 1: choose your quiz ----------
let setup = { mode: 'practice', topic: 'all', level: 'mixed', length: 10 };
try { setup = { ...setup, ...JSON.parse(localStorage.getItem(SETUP_KEY)) }; } catch { /* storage blocked */ }
if (location.hash === '#test' || location.hash === '#practice') setup.mode = location.hash.slice(1);

let best = {};
try { best = JSON.parse(localStorage.getItem(BEST_KEY)) || {}; } catch { /* storage blocked */ }
const bestId = () => `${setup.topic}-${setup.level}`;

function pickRow(row, key, items) {
  for (const item of items) {
    const label = document.createElement('label');
    label.className = 'pick';
    label.innerHTML = `<input type="radio" name="${key}">${item.emoji ? '<span class="pick-emoji" aria-hidden="true"></span>' : ''}<span class="pick-text"><strong></strong>${item.text ? '<small></small>' : ''}</span>`;
    if (item.emoji) label.querySelector('.pick-emoji').textContent = item.emoji;
    label.querySelector('strong').textContent = item.name;
    if (item.text) label.querySelector('small').textContent = item.text;
    const input = label.querySelector('input');
    input.value = item.id;
    input.checked = setup[key] === item.id;
    input.addEventListener('change', () => {
      setup[key] = item.id;
      try { localStorage.setItem(SETUP_KEY, JSON.stringify(setup)); } catch { /* storage blocked */ }
      showBest();
    });
    row.appendChild(label);
  }
}
pickRow($('pick-mode'), 'mode', MODES);
pickRow($('pick-topic'), 'topic', TOPICS);
pickRow($('pick-level'), 'level', LEVELS);
pickRow($('pick-length'), 'length', LENGTHS);

function showBest() {
  const score = best[bestId()];
  $('quiz-best').textContent = score === undefined ? '' : `🏅 Your best test score on this quiz: ${score}%`;
}
showBest();

function showStep(step) {
  for (const name of ['setup', 'play', 'results']) $(`quiz-${name}`).hidden = name !== step;
  $('quiz-stats').hidden = step !== 'play';
  window.scrollTo(0, 0);
}

// ---------- Step 2: the questions ----------
let run = null;   // { mode, questions, index, answers, order, pick, locked, started }

// retry: going over the ones you missed, which doesn't count for stars or best scores
function startQuiz(questions = pickQuestions(setup.topic, setup.level, setup.length), mode = setup.mode, retry = false) {
  run = { mode, questions, index: 0, answers: [], started: Date.now(), retry };
  $('quiz-mode-tag').textContent = mode === 'test' ? '📝 Test' : '🎓 Practice';
  $('stat-right-box').hidden = mode === 'test';
  showStep('play');
  showQuestion();
}

function renderMessage(box, msg) {
  box.innerHTML = '<div class="msg-from"><span></span><span class="msg-meta"></span></div>';
  box.querySelector('span').textContent = msg.from;
  box.querySelector('.msg-meta').textContent = msg.meta || '';
  for (const [key, className, prefix] of [['note', 'msg-note', '📍 '], ['text', 'msg-text', ''], ['link', 'msg-link', '🔗 ']]) {
    if (!msg[key]) continue;
    const el = document.createElement(key === 'link' ? 'div' : 'p');
    el.className = className;
    if (key === 'link') el.setAttribute('translate', 'no');   // a fake link stays exactly as it is
    el.textContent = prefix + msg[key];
    box.appendChild(el);
  }
}

// The question, its message and the answers. Each question gets a new box, so Read aloud reads all of it.
function questionBox(q, options) {
  const box = document.createElement('div');
  box.className = 'quiz-q';
  const label = document.createElement('h2');
  label.className = 'quiz-label';
  label.textContent = q.label;
  box.appendChild(label);
  if (q.prompt) {
    const prompt = document.createElement('p');
    prompt.className = 'sq-prompt';
    prompt.textContent = q.prompt;
    box.appendChild(prompt);
  }
  if (q.msg) {
    const msg = document.createElement('div');
    msg.className = 'message';
    renderMessage(msg, q.msg);
    box.appendChild(msg);
  }
  return { box, label, options };
}

function showQuestion() {
  const q = run.questions[run.index];
  // Real or scam and fact or myth keep their order; the rest are shuffled
  run.order = q.two ? q.options : shuffle(q.options);
  run.pick = null;
  run.locked = false;
  const { box, label } = questionBox(q);
  box.dataset.read = '';
  label.tabIndex = -1;

  const choices = document.createElement('div');
  choices.className = `sq-choices${q.two ? ' two' : ''}${q.links ? ' links' : ''}`;
  run.order.forEach((option, i) => {
    const btn = document.createElement('button');
    btn.className = 'sq-choice';
    btn.innerHTML = `<span class="sq-key" aria-hidden="true">${i + 1}</span><span></span>`;
    btn.lastChild.textContent = option.text;
    if (q.links) btn.lastChild.setAttribute('translate', 'no');
    btn.addEventListener('click', () => answer(i));
    choices.appendChild(btn);
  });
  box.appendChild(choices);
  const feedback = document.createElement('div');
  feedback.className = 'quiz-feedback';
  feedback.setAttribute('aria-live', 'polite');
  box.appendChild(feedback);

  $('quiz-question').replaceChildren(box);
  const n = run.questions.length;
  $('stat-count').textContent = `${run.index + 1}/${n}`;
  $('stat-right').textContent = run.answers.filter(a => a.right).length;
  $('quiz-bar-fill').style.width = `${(run.index / n) * 100}%`;
  $('btn-next').disabled = true;
  $('btn-next').textContent = run.index === n - 1 ? (run.mode === 'test' ? 'Finish ✔' : 'See my score ✔') : 'Next ▶';
  label.focus({ preventScroll: true });
}

function cheer(good) {
  const coder = $('hud-coder');
  coder.classList.remove('cheer', 'oops');
  void coder.offsetWidth;   // restart the animation
  coder.classList.add(good ? 'cheer' : 'oops');
}

function answer(i) {
  if (run.locked) return;
  const buttons = [...$('quiz-question').querySelectorAll('.sq-choice')];
  run.pick = i;
  $('btn-next').disabled = false;
  if (run.mode === 'test') {
    // In a test you can change your mind until you press Next
    buttons.forEach((b, j) => b.classList.toggle('picked', j === i));
    playSound('place');
    return;
  }
  // Practice: show right away if it was right, and why
  run.locked = true;
  const picked = run.order[i];
  const right = run.order.find(o => o.correct);
  // Marked with ✔ and ✖ too, not only colors
  buttons.forEach((b, j) => {
    b.disabled = true;
    const mark = run.order[j].correct ? '✔' : j === i ? '✖' : '';
    if (!mark) return;
    b.classList.add(run.order[j].correct ? 'right' : 'wrong');
    b.insertAdjacentHTML('beforeend', `<span class="sq-mark" aria-hidden="true">${mark}</span>`);
  });
  const feedback = $('quiz-question').querySelector('.quiz-feedback');
  feedback.className = `quiz-feedback ${picked.correct ? 'good' : 'bad'}`;
  feedback.append(...explain(picked, right));
  playSound(picked.correct ? 'right' : 'wrong');
  cheer(picked.correct);
  record();
  $('stat-right').textContent = run.answers.filter(a => a.right).length;
  $('btn-next').focus({ preventScroll: true });
  feedback.scrollIntoView({ block: 'nearest', behavior: calmMotion() ? 'auto' : 'smooth' });
}

// "Correct!" or "Not quite", the right answer, and why
function explain(picked, right) {
  const lines = [];
  const add = (className, ...parts) => {
    const p = document.createElement('p');
    p.className = className;
    for (const [tag, text, noTranslate] of parts) {
      const el = document.createElement(tag);
      el.textContent = text;
      if (noTranslate) el.setAttribute('translate', 'no');
      p.append(el, ' ');
    }
    lines.push(p);
  };
  const isLink = /^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(right.text) && !right.text.includes(' ');
  if (picked.correct) {
    add('fb-head', ['strong', '✅ Correct!']);
  } else {
    add('fb-head', ['strong', '❌ Not quite.']);
    add('fb-answer', ['span', 'Right answer:'], ['strong', right.text, isLink]);
  }
  add('fb-why', ['span', whyText(picked)]);
  if (!picked.correct && right.why !== picked.why) add('fb-why', ['span', whyText(right)]);
  return lines;
}

function record() {
  const q = run.questions[run.index];
  const picked = run.order[run.pick];
  run.answers.push({ q, picked, right: picked.correct });
}

function next() {
  if (run.pick === null) return;
  if (run.mode === 'test') record();
  run.index++;
  if (run.index < run.questions.length) showQuestion();
  else showResults();
}
$('btn-next').addEventListener('click', next);

$('btn-quit').addEventListener('click', () => {
  if (run.answers.length && !confirm('Stop this quiz? Your answers won\'t be scored.')) return;
  showStep('setup');
  $('btn-start').focus({ preventScroll: true });
});

// 1-4 answers, Enter goes on
document.addEventListener('keydown', e => {
  if ($('quiz-play').hidden || document.querySelector('dialog[open]') || e.ctrlKey || e.metaKey || e.altKey) return;
  const n = ['1', '2', '3', '4'].indexOf(e.key);
  const buttons = $('quiz-question').querySelectorAll('.sq-choice');
  if (n >= 0 && buttons[n]) {
    e.preventDefault();
    if (!buttons[n].disabled) buttons[n].click();
  } else if (e.key === 'Enter' && !$('btn-next').disabled && !e.target.closest?.('button, a, input')) {
    e.preventDefault();
    next();
  }
});

// ---------- Step 3: your score ----------
function showResults() {
  const total = run.answers.length;
  const right = run.answers.filter(a => a.right).length;
  const percent = Math.round((right / total) * 100);
  const secs = Math.round((Date.now() - run.started) / 1000);
  const missed = run.answers.filter(a => !a.right);
  const test = run.mode === 'test';
  const topic = TOPICS.find(t => t.id === setup.topic);
  const level = LEVELS.find(l => l.id === setup.level);

  // The top part is a new box each time, so Read aloud reads the new score
  const head = document.createElement('div');
  head.className = 'result-head';
  head.dataset.read = '';
  head.innerHTML = `<h1 class="quiz-title" id="results-title"></h1>
    <div class="result-score">
      <div class="result-coder" aria-hidden="true"></div>
      <div>
        <p class="result-big"><strong></strong></p>
        <p class="result-percent"></p>
        <p class="result-time"></p>
      </div>
    </div>
    <p class="result-rank"></p>
    <p class="result-note"></p>`;
  head.querySelector('h1').textContent = test ? 'Test complete!' : 'Practice complete!';
  head.querySelector('.result-coder').innerHTML = avatarSvg();
  head.querySelector('.result-big strong').textContent = `${right}/${total}`;
  head.querySelector('.result-percent').textContent = `${percent}% right`;
  head.querySelector('.result-time').textContent = `⏱️ Time: ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
  head.querySelector('.result-rank').textContent = RANKS.find(([min]) => percent >= min)[1];

  // Stars and best scores are for tests with new questions (not a retry of the ones you missed)
  let note;
  const fullTest = test && !run.retry;
  if (fullTest && percent >= PASS) {
    const isBest = best[bestId()] === undefined || percent > best[bestId()];
    if (isBest) {
      best[bestId()] = percent;
      try { localStorage.setItem(BEST_KEY, JSON.stringify(best)); } catch { /* storage blocked */ }
    }
    // Each topic and level pays once: 1 star for passing, 2 more for a perfect score
    let won = awardStars(`quiz-pass-${bestId()}`, 1, 'Passed a quiz');
    if (percent === 100 && total >= 10) won = awardStars(`quiz-perfect-${bestId()}`, 2, 'Perfect quiz score') || won;
    note = isBest ? '🏅 New best score! You passed.' : 'You passed!';
    // translated in two parts, since the second is only sometimes there
    note = tr(note);
    if (!won) note += ` ${tr('You already earned the stars for this quiz. Try another topic or level for more.')}`;
    if (!won) playSound('upgrade');
  } else if (fullTest) {
    const score = best[bestId()];
    if (score === undefined || percent > score) {
      best[bestId()] = percent;
      try { localStorage.setItem(BEST_KEY, JSON.stringify(best)); } catch { /* storage blocked */ }
    }
    note = `Get ${PASS}% to pass and earn stars. Practice what you missed, then try again!`;
    playSound('wrong');
  } else {
    note = test ? 'Nice work going over what you missed!' : 'Practice mode. Switch to Test to earn stars.';
    playSound(percent >= PASS ? 'upgrade' : 'place');
  }
  head.querySelector('.result-note').textContent = note;
  $('quiz-results').querySelector('.result-head')?.remove();
  $('print-head').after(head);

  // For printing: who, what and when
  const date = new Date().toLocaleDateString(LANG === 'es' ? 'es' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  $('print-head').innerHTML = '<strong translate="no"></strong> · <span></span> · <span></span> · <span translate="no"></span>';
  const [nameEl, topicEl, levelEl, dateEl] = $('print-head').children;
  nameEl.textContent = coder.name;
  topicEl.textContent = topic.name;
  levelEl.textContent = level.name;
  dateEl.textContent = date;

  $('btn-missed').hidden = missed.length === 0;
  $('btn-missed').textContent = test ? '🎯 Practice what I missed' : '🎯 Try the ones I missed again';
  renderReview();
  $('quiz-bar-fill').style.width = '100%';
  showStep('results');
  head.querySelector('h1').tabIndex = -1;
  head.querySelector('h1').focus({ preventScroll: true });
}

function renderReview() {
  const list = $('review-list');
  list.replaceChildren();
  for (const a of run.answers) {
    const right = a.q.options.find(o => o.correct);
    const { box } = questionBox(a.q);
    const item = document.createElement('li');
    item.className = `review-item ${a.right ? 'good' : 'bad'}`;
    box.querySelector('h2').outerHTML = `<h3 class="quiz-label">${a.right ? '✅' : '❌'} <span></span></h3>`;
    box.querySelector('h3 span').textContent = a.q.label;
    const yours = document.createElement('p');
    yours.className = 'fb-answer';
    yours.innerHTML = '<span>Your answer:</span> <strong></strong>';
    yours.querySelector('strong').textContent = a.picked.text;
    if (a.q.links) yours.querySelector('strong').setAttribute('translate', 'no');
    // Right: your answer and why. Wrong: "Not quite", your answer, the right one and why.
    const lines = explain(a.picked, right);
    if (a.right) lines.splice(0, 1, yours);
    else lines.splice(1, 0, yours);
    item.append(box, ...lines);
    list.appendChild(item);
  }
}

$('btn-start').addEventListener('click', () => startQuiz());
$('btn-again').addEventListener('click', () => startQuiz());
$('btn-missed').addEventListener('click', () => startQuiz(run.answers.filter(a => !a.right).map(a => a.q), 'practice', true));
$('btn-change').addEventListener('click', () => { showStep('setup'); $('btn-start').focus({ preventScroll: true }); });
$('btn-print').addEventListener('click', () => print());

$('hud-coder').innerHTML = avatarSvg();
$('hud-coder').addEventListener('animationend', e => e.currentTarget.classList.remove('cheer', 'oops'));
$('btn-start').focus({ preventScroll: true });
