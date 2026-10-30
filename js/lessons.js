// The learning pop-ups: scanning a threat's message, the Real or Scam quiz,
// and the challenges that unlock each tower. Uses MESSAGES, QUIZ and CHALLENGES from content.js.
// Each function calls done(...) when the player is finished, so the game can react.

const $ = id => document.getElementById(id);

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Draws a message like a phone notification: who it's from, the text and any link
function renderMessage(box, msg) {
  box.innerHTML = '';
  const head = document.createElement('div');
  head.className = 'msg-from';
  head.textContent = msg.from;
  if (msg.meta) {
    const meta = document.createElement('span');
    meta.className = 'msg-meta';
    meta.textContent = msg.meta;
    head.appendChild(meta);
  }
  box.appendChild(head);

  if (msg.note) {
    const note = document.createElement('p');
    note.className = 'msg-note';
    note.textContent = `📍 ${msg.note}`;
    box.appendChild(note);
  }
  if (msg.text) {
    const text = document.createElement('p');
    text.className = 'msg-text';
    text.textContent = msg.text;
    box.appendChild(text);
  }
  if (msg.link) {
    const link = document.createElement('div');
    link.className = 'msg-link';
    link.textContent = `🔗 ${msg.link}`;
    box.appendChild(link);
  }
}

// ---------- Harder questions as you go ----------
// Questions have a level: 1 easy, 2 medium, 3 hard (no level means 1).
const levelOf = q => q.level || 1;

// How hard questions should be on a wave (wave counts from 0). Levels mode ramps up more slowly.
function tierFor(wave) {
  const [medium, hard] = LEVELS_MODE ? [10, 30] : [5, 12];
  return wave < medium ? 1 : wave < hard ? 2 : 3;
}

// Picks `count` questions from `list` that haven't been asked yet, hardest allowed first,
// so questions get harder as the tier goes up. Starts over once they've all been asked.
const askedQuestions = new Set();

function drawQuestions(list, tier, count) {
  const allowed = list.filter(q => levelOf(q) <= tier);
  let fresh = allowed.filter(q => !askedQuestions.has(q));
  if (fresh.length < count) {
    allowed.forEach(q => askedQuestions.delete(q));
    fresh = allowed;
  }
  // Shuffle, then put the hardest allowed questions first (sorting keeps the shuffle within a level)
  const picked = shuffle(fresh).sort((a, b) => levelOf(b) - levelOf(a)).slice(0, count);
  picked.forEach(q => askedQuestions.add(q));
  return shuffle(picked);
}

// Every wrong answer this game, newest last. The Study tab's "Missed" list reads this.
const missed = [];

function recordMiss(miss) {
  missed.push(miss);
  if (typeof updateMissedBadge === 'function') updateMissedBadge();
}

// Every answer the player gives, right or wrong. rewards.js listens to build streaks and play sounds.
const answerListeners = [];

function reportAnswer(correct) {
  for (const listener of answerListeners) listener(correct);
}

function showResult(box, good, html) {
  box.hidden = false;
  box.className = `result ${good ? 'good' : 'bad'}`;
  box.innerHTML = html;
}

// ---------- Scan a threat ----------
const scanDialog = $('dlg-scan');
let scanDone = null;
let scanAnswered = false;
let lastMessage = null;

function openScan(type, firstTime, done) {
  scanDone = done;
  scanAnswered = false;

  // Pick a message, trying not to show the same one twice in a row
  let msg = pickRandom(MESSAGES[type]);
  if (msg === lastMessage && MESSAGES[type].length > 1) msg = pickRandom(MESSAGES[type].filter(m => m !== msg));
  lastMessage = msg;
  renderMessage($('scan-message'), msg);

  const choices = $('scan-choices');
  choices.innerHTML = '';
  for (const [id, threat] of Object.entries(THREATS)) {
    if (threat.boss) continue;
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.dataset.type = id;
    btn.innerHTML = `<strong>${threat.emoji} ${threat.kind}</strong><span>${threat.short}</span>`;
    btn.addEventListener('click', () => answerScan(btn, id, type, msg, firstTime));
    choices.appendChild(btn);
  }

  $('scan-result').hidden = true;
  $('scan-continue').hidden = true;
  scanDialog.showModal();
}

function answerScan(button, guess, type, msg, firstTime) {
  if (scanAnswered) return;
  scanAnswered = true;
  const threat = THREATS[type];
  const correct = guess === type;
  reportAnswer(correct);

  [...$('scan-choices').children].forEach(b => { b.disabled = true; });
  button.classList.add(correct ? 'right' : 'wrong');
  // Always show which answer was right
  $('scan-choices').querySelector(`[data-type="${type}"]`).classList.add('right');

  let html = correct
    ? `<p class="verdict">✅ Correct! This is <strong>${threat.kind}</strong>.</p>`
    : `<p class="verdict">❌ Not quite. This is <strong>${threat.kind}</strong>.</p>`;
  html += `<p><strong>🚩 Red flags:</strong> ${msg.flags}</p>`;

  if (correct) {
    const tower = TOWERS[threat.weakTo];
    html += `<p class="reward">+${SCAN_REWARD} bytes! For the rest of this wave, every ${threat.name} is exposed and takes double damage from ${tower.emoji} ${tower.name}.</p>`;
    if (firstTime) {
      html += `<div class="index-entry"><p class="index-tag">📖 New Threat Index entry: ${threat.emoji} ${threat.name}</p>
        <p>${threat.fact}</p>
        <p><strong>How to stay safe:</strong> ${threat.defense}</p></div>`;
    }
  } else {
    html += `<p class="penalty">That threat got away and sped up! Try scanning another one.</p>`;
    recordMiss({
      kind: '📩 Threat scan',
      msg,
      yours: `${THREATS[guess].emoji} ${THREATS[guess].kind}`,
      right: `${threat.emoji} ${threat.kind}`,
      why: msg.flags,
    });
  }

  showResult($('scan-result'), correct, html);
  $('scan-continue').hidden = false;
  $('scan-continue').focus();
}

function finishScan() {
  scanDialog.close();
  const done = scanDone;
  scanDone = null;
  if (done) done(scanAnswered ? $('scan-choices').querySelector('.wrong') === null : null);
}

$('scan-continue').addEventListener('click', finishScan);
scanDialog.addEventListener('cancel', e => {
  e.preventDefault();
  // Esc before answering just closes it without a guess
  finishScan();
});

// ---------- Real or Scam quiz ----------
const quizDialog = $('dlg-quiz');
let quizQuestions = [];
let quizIndex = 0;
let quizRight = 0;
let quizDone = null;

// tier: how hard the questions should be (1 easy, 2 medium, 3 hard)
function runQuiz(count, done, tier = 1) {
  quizQuestions = drawQuestions(QUIZ, tier, count);
  quizIndex = 0;
  quizRight = 0;
  quizDone = done;
  showQuizQuestion();
  quizDialog.showModal();
}

function showQuizQuestion() {
  const q = quizQuestions[quizIndex];
  $('quiz-progress').textContent = `Question ${quizIndex + 1} of ${quizQuestions.length} · +${QUIZ_REWARD} bytes for each right answer`;
  renderMessage($('quiz-message'), q);
  $('quiz-result').hidden = true;
  $('quiz-next').hidden = true;
  for (const btn of [$('quiz-real'), $('quiz-scam')]) {
    btn.disabled = false;
    btn.classList.remove('right', 'wrong');
  }
}

function answerQuiz(guess) {
  const q = quizQuestions[quizIndex];
  const correct = guess === q.answer;
  if (correct) quizRight++;
  reportAnswer(correct);
  $('quiz-real').disabled = true;
  $('quiz-scam').disabled = true;
  $(guess === 'real' ? 'quiz-real' : 'quiz-scam').classList.add(correct ? 'right' : 'wrong');

  const label = q.answer === 'real' ? '✅ Real' : '🚩 Scam';
  if (!correct) {
    recordMiss({ kind: '✅ Real or Scam', msg: q, yours: guess === 'real' ? '✅ Real' : '🚩 Scam', right: label, why: q.why });
  }
  showResult($('quiz-result'), correct,
    `<p class="verdict">${correct ? 'Correct!' : 'Not quite.'} It's <strong>${label}</strong>.</p><p>${q.why}</p>`);

  const last = quizIndex === quizQuestions.length - 1;
  $('quiz-next').textContent = last ? 'Back to defending!' : 'Next question';
  $('quiz-next').hidden = false;
  $('quiz-next').focus();
}

$('quiz-real').addEventListener('click', () => answerQuiz('real'));
$('quiz-scam').addEventListener('click', () => answerQuiz('scam'));
$('quiz-next').addEventListener('click', () => {
  quizIndex++;
  if (quizIndex < quizQuestions.length) {
    showQuizQuestion();
    return;
  }
  quizDialog.close();
  const done = quizDone;
  quizDone = null;
  if (done) done(quizRight, quizQuestions.length);
});
// The quiz can't be skipped with Esc
quizDialog.addEventListener('cancel', e => e.preventDefault());

// ---------- Tower unlock challenges ----------
const challengeDialog = $('dlg-challenge');
let challengeDone = null;
let challengePassed = false;
let challengeCounted = false;

const COMMON_PASSWORDS = ['password', '123456', 'qwerty', 'letmein', 'abc123', 'iloveyou', '111111',
  'admin', 'welcome', 'monkey', 'dragon', 'football', 'roblox', 'minecraft', 'fortnite'];

const lastChallenge = {};  // so the same challenge doesn't come up twice in a row

// tag: the line at the top (password.js uses it for "Reset your password")
function openChallenge(towerId, done, tag = null) {
  const tower = TOWERS[towerId];
  const choices = CHALLENGES[towerId].filter(c => c !== lastChallenge[towerId]);
  const ch = pickRandom(choices.length ? choices : CHALLENGES[towerId]);
  lastChallenge[towerId] = ch;
  challengeDone = done;
  challengePassed = false;
  challengeCounted = false;

  $('ch-tag').textContent = tag || `🔒 Unlock ${tower.emoji} ${tower.name}`;
  $('ch-unlock').textContent = tag ? '✅ Save password' : '🔓 Unlock tower!';
  $('ch-title').textContent = ch.title;
  $('ch-prompt').textContent = ch.prompt;
  $('ch-tip').textContent = ch.tip;
  $('ch-tip').hidden = true;
  $('ch-result').hidden = true;
  $('ch-unlock').hidden = true;

  const options = $('ch-options');
  options.innerHTML = '';
  $('ch-password').hidden = !ch.password;

  if (ch.password) {
    $('ch-pw').value = '';
    $('ch-2fa').checked = false;
    $('ch-tip').hidden = false;
    checkPassword();
  } else {
    for (const opt of shuffle(ch.options)) {
      const btn = document.createElement('button');
      btn.className = 'choice';
      btn.textContent = opt.text;
      btn.addEventListener('click', () => answerChallenge(btn, opt, ch));
      options.appendChild(btn);
    }
  }
  challengeDialog.showModal();
  if (ch.password) $('ch-pw').focus();
}

function answerChallenge(button, opt, ch) {
  button.classList.add(opt.correct ? 'right' : 'wrong');
  if (!opt.correct) {
    reportAnswer(false);
    recordMiss({
      kind: `🔒 Challenge: ${ch.title}`,
      msg: { from: 'Question', text: ch.prompt },
      yours: opt.text,
      right: ch.options.find(o => o.correct).text,
      why: opt.why,
    });
  }
  button.disabled = true;
  showResult($('ch-result'), opt.correct, `<p>${opt.correct ? '✅' : '❌'} ${opt.why}</p>${opt.correct ? '' : '<p>Try again!</p>'}`);
  if (opt.correct) {
    [...$('ch-options').children].forEach(b => { b.disabled = true; });
    passChallenge();
  }
}

// Checks the practice password live and ticks off each rule
function checkPassword() {
  const pw = $('ch-pw').value;
  const kinds = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter(re => re.test(pw)).length;
  const lower = pw.toLowerCase();
  const rules = {
    'rule-length': pw.length >= 12,
    'rule-mix': kinds >= 3,
    'rule-common': pw.length > 0 && !COMMON_PASSWORDS.some(word => lower.includes(word)),
    'rule-2fa': $('ch-2fa').checked,
  };
  for (const [id, ok] of Object.entries(rules)) $(id).classList.toggle('ok', ok);

  // Strength bar: one step per rule about the password itself
  const score = ['rule-length', 'rule-mix', 'rule-common'].filter(id => rules[id]).length;
  const meter = $('ch-meter');
  meter.style.width = `${(score / 3) * 100}%`;
  meter.className = ['weak', 'weak', 'ok', 'strong'][score];
  $('ch-meter-label').textContent = ['Too weak', 'Weak', 'Getting there', 'Strong!'][score];

  const allOk = Object.values(rules).every(Boolean);
  if (allOk && !challengePassed) {
    showResult($('ch-result'), true, '<p>✅ Strong password + 2-step verification. A Password Cracker would need a second key that only you have!</p>');
    // Don't steal focus while they're still typing
    passChallenge(false);
  } else if (!allOk && challengePassed) {
    // They changed it after passing, so take the unlock back until it's strong again
    challengePassed = false;
    $('ch-unlock').hidden = true;
    $('ch-result').hidden = true;
  }
}

function passChallenge(moveFocus = true) {
  // Only count the first pass, so retyping a password doesn't farm streaks
  if (!challengeCounted) reportAnswer(true);
  challengeCounted = true;
  challengePassed = true;
  $('ch-tip').hidden = false;
  $('ch-unlock').hidden = false;
  if (moveFocus) $('ch-unlock').focus();
}

function finishChallenge(unlocked) {
  // Remember the practice password, so you can be asked to log in with it later (password.js)
  if (unlocked && !$('ch-password').hidden) savePracticePassword($('ch-pw').value);
  challengeDialog.close();
  const done = challengeDone;
  challengeDone = null;
  if (done) done(unlocked);
}

$('ch-pw').addEventListener('input', checkPassword);
$('ch-2fa').addEventListener('change', checkPassword);
$('ch-unlock').addEventListener('click', () => finishChallenge(true));
$('ch-cancel').addEventListener('click', () => finishChallenge(false));
challengeDialog.addEventListener('cancel', e => {
  e.preventDefault();
  finishChallenge(false);
});

// ---------- One-question pop-up (tower upgrades and the Ransomware Boss) ----------
// q: { tag, title, prompt, msg (optional), options: [{ text, correct, why }] }
// done(true / false), or done(null) if closed without answering.
const questionDialog = $('dlg-question');
let questionDone = null;
let questionResult = null;

function openQuestion(q, done) {
  questionDone = done;
  questionResult = null;
  $('q-tag').textContent = q.tag;
  $('q-title').textContent = q.title;
  $('q-prompt').textContent = q.prompt;
  $('q-message').hidden = !q.msg;
  if (q.msg) renderMessage($('q-message'), q.msg);
  $('q-result').hidden = true;
  $('q-continue').hidden = true;

  const options = $('q-options');
  options.innerHTML = '';
  for (const opt of shuffle(q.options)) {
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.textContent = opt.text;
    btn.addEventListener('click', () => answerQuestion(btn, opt, q));
    options.appendChild(btn);
  }
  questionDialog.showModal();
}

function answerQuestion(button, opt, q) {
  if (questionResult !== null) return;
  questionResult = opt.correct;
  reportAnswer(opt.correct);
  const right = q.options.find(o => o.correct);
  [...$('q-options').children].forEach(b => {
    b.disabled = true;
    if (b.textContent === right.text) b.classList.add('right');
  });
  if (!opt.correct) {
    button.classList.add('wrong');
    recordMiss({
      kind: q.tag,
      msg: q.msg || { from: 'Question', text: q.prompt },
      yours: opt.text,
      right: right.text,
      why: `${opt.why} ${right.why.replace(/^Right! /, '')}`,
    });
  }
  showResult($('q-result'), opt.correct,
    `<p class="verdict">${opt.correct ? '✅ Correct!' : '❌ Not quite.'}</p><p>${opt.why}</p>${opt.correct ? '' : `<p><strong>Answer:</strong> ${right.text}</p>`}`);
  $('q-continue').textContent = opt.correct ? 'Awesome!' : 'Got it';
  $('q-continue').hidden = false;
  $('q-continue').focus();
}

function finishQuestion() {
  questionDialog.close();
  const done = questionDone;
  questionDone = null;
  if (done) done(questionResult);
}

$('q-continue').addEventListener('click', finishQuestion);
questionDialog.addEventListener('cancel', e => {
  e.preventDefault();
  finishQuestion();
});
