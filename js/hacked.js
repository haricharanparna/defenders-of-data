// "You've been hacked!": every 3 to 7 minutes of play, a hacker breaks into your computer.
// You watch them go through your files while you race the clock: answer 3 Real or Scam
// questions right before the hacker finishes, or they steal your bytes.
// Shared by Tower Defense and Data Clicker. Each page calls setupHackAttack() with its own rules.
// Uses QUIZ from content.js and playSound() from sound.js.

const HACK_EVERY = [3 * 60, 7 * 60];   // seconds of play between attacks
const HACK_TIME = 30;                    // seconds you have to kick the hacker out
const HACK_NEEDED = 3;                   // right answers needed
const HACK_WRONG_COST = 4;               // a wrong answer gives the hacker this many extra seconds
const HACK_FILES = ['📁 Homework', '📷 Photos', '🔑 Passwords', '💬 Chats', '🎮 Game saves', '💳 Payment info'];
const HACK_LOG = [
  'Connecting to your computer...',
  'Bypassing login...',
  'Access granted.',
  'Reading saved passwords...',
  'Copying your photos...',
  'Downloading chat history...',
  'Installing keylogger...',
  'Looking for payment info...',
  'Uploading files to hacker server...',
  'Locking your accounts...',
];

// rules: { isPlaying() -> bool, lose() -> text saying what you lost, lossText, onAnswer(correct, item) }
function setupHackAttack(rules) {
  // ---------- The screen ----------
  const dialog = document.createElement('dialog');
  dialog.id = 'dlg-hacked';
  dialog.className = 'hacked';
  dialog.setAttribute('aria-labelledby', 'hack-title');
  dialog.innerHTML = `
    <div class="hack-scanlines" aria-hidden="true"></div>
    <h2 class="hack-title" id="hack-title" data-text="YOU'VE BEEN HACKED">YOU'VE BEEN HACKED</h2>
    <p class="hack-sub" id="hack-sub"></p>
    <div class="hack-grid">
      <div class="hack-screen" aria-hidden="true">
        <div class="hack-files" id="hack-files"></div>
        <div class="hack-log" id="hack-log"></div>
      </div>
      <div class="hack-fight">
        <div class="hack-meter">
          <span>Hacker progress</span>
          <span class="hack-bar"><span id="hack-fill"></span></span>
          <strong id="hack-time"></strong>
        </div>
        <div id="hack-play">
          <p class="hack-count">Real or scam? <span id="hack-dots"></span></p>
          <div class="message" id="hack-message"></div>
          <div class="hack-buttons">
            <button class="choice big" data-answer="real">✅ Real</button>
            <button class="choice big" data-answer="scam">🚩 Scam</button>
          </div>
          <p class="hack-feedback" id="hack-feedback" aria-live="assertive"></p>
        </div>
        <div class="hack-end" id="hack-end" hidden>
          <p class="hack-end-title" id="hack-end-title"></p>
          <p id="hack-end-text"></p>
          <button class="btn btn-primary" id="hack-continue">Back to the game</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(dialog);
  const $h = id => document.getElementById(id);

  let nextIn = randomGap();
  let attack = null;   // { left, right, item, logIndex, logTimer, locked }
  let last = performance.now();

  function randomGap() {
    return HACK_EVERY[0] + Math.random() * (HACK_EVERY[1] - HACK_EVERY[0]);
  }

  // ---------- Starting an attack ----------
  function start() {
    attack = { left: HACK_TIME, right: 0, item: null, logIndex: 0, logTimer: 0, busy: false, asked: new Set() };
    $h('hack-sub').textContent = `A hacker got into your computer! Answer ${HACK_NEEDED} questions right in ${HACK_TIME} seconds to kick them out, or ${rules.lossText}.`;
    $h('hack-files').innerHTML = HACK_FILES.map(f => `<span class="hack-file">${f}</span>`).join('');
    $h('hack-log').innerHTML = '';
    $h('hack-play').hidden = false;
    $h('hack-end').hidden = true;
    dialog.classList.remove('won', 'lost', 'panic');
    $h('hack-fill').style.width = '0%';
    $h('hack-time').textContent = `${HACK_TIME}s`;
    nextQuestion();
    dialog.showModal();
    playSound('boss');
  }

  function nextQuestion() {
    let pool = QUIZ.filter(q => !attack.asked.has(q));
    if (!pool.length) pool = QUIZ;
    attack.item = pool[Math.floor(Math.random() * pool.length)];
    attack.asked.add(attack.item);
    renderHackMessage($h('hack-message'), attack.item);
    $h('hack-dots').innerHTML = Array.from({ length: HACK_NEEDED }, (_, i) => `<span class="${i < attack.right ? 'on' : ''}"></span>`).join('');
    $h('hack-feedback').textContent = '';
    $h('hack-feedback').className = 'hack-feedback';
    for (const btn of dialog.querySelectorAll('.hack-buttons .choice')) {
      btn.disabled = false;
      btn.classList.remove('right', 'wrong');
    }
    dialog.querySelector('.hack-buttons .choice').focus();
  }

  function renderHackMessage(box, msg) {
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

  // ---------- Answering ----------
  for (const btn of dialog.querySelectorAll('.hack-buttons .choice')) {
    btn.addEventListener('click', () => {
      if (!attack || attack.busy) return;
      const item = attack.item;
      const correct = btn.dataset.answer === item.answer;
      attack.busy = true;
      dialog.querySelectorAll('.hack-buttons .choice').forEach(b => { b.disabled = true; });
      btn.classList.add(correct ? 'right' : 'wrong');
      rules.onAnswer(correct, item);

      const feedback = $h('hack-feedback');
      feedback.className = `hack-feedback ${correct ? 'good' : 'bad'}`;
      if (correct) {
        attack.right++;
        feedback.textContent = '✅ Blocked!';
        playSound('right');
      } else {
        attack.left = Math.max(0, attack.left - HACK_WRONG_COST);
        feedback.textContent = `❌ It was ${item.answer === 'scam' ? 'a scam' : 'real'}. The hacker gets ${HACK_WRONG_COST} more seconds!`;
        playSound('wrong');
      }
      if (attack.right >= HACK_NEEDED) return setTimeout(win, 500);
      // A quick pause so you can see if you were right, then the next one
      setTimeout(() => {
        if (!attack || attack.over) return;
        attack.busy = false;
        nextQuestion();
      }, correct ? 600 : 1500);
    });
  }

  // ---------- How it ends ----------
  function finish(won, title, text) {
    attack.over = true;
    attack.busy = true;
    $h('hack-play').hidden = true;
    $h('hack-end').hidden = false;
    $h('hack-end-title').textContent = title;
    $h('hack-end-text').textContent = text;
    dialog.classList.add(won ? 'won' : 'lost');
    $h('hack-continue').focus();
  }

  function win() {
    if (!attack || attack.over) return;
    addLog('Connection closed by owner.', 'good');
    playSound('badge');
    finish(true, '🛡️ HACKER KICKED OUT!', 'You spotted the scams fast enough to lock them out. Real tip: if you think you\'ve been hacked, change your passwords from a safe device and turn on 2-step verification.');
  }

  function lose() {
    if (!attack || attack.over) return;
    addLog('Upload complete. Goodbye!', 'bad');
    playSound('blast');
    const lost = rules.lose();
    dialog.querySelectorAll('.hack-file').forEach(f => f.classList.add('locked'));
    finish(false, '💀 TOO SLOW!', `The hacker got away with ${lost}. Real tip: strong, unique passwords and 2-step verification make it much harder for hackers to get in at all.`);
  }

  $h('hack-continue').addEventListener('click', () => {
    dialog.close();
    attack = null;
    nextIn = randomGap();
  });
  // Esc can't make the hacker go away
  dialog.addEventListener('cancel', e => {
    e.preventDefault();
    if (attack && attack.over) $h('hack-continue').click();
  });

  function addLog(text, kind = '') {
    const line = document.createElement('p');
    line.className = kind;
    line.textContent = `> ${text}`;
    const log = $h('hack-log');
    log.appendChild(line);
    while (log.children.length > 7) log.firstChild.remove();
  }

  // ---------- Clock ----------
  function advance(dt) {
    if (attack && !attack.over) {
      attack.left -= dt;
      const progress = 1 - attack.left / HACK_TIME;
      $h('hack-fill').style.width = `${Math.min(100, progress * 100)}%`;
      $h('hack-time').textContent = `${Math.max(0, Math.ceil(attack.left))}s`;
      dialog.classList.toggle('panic', attack.left < 8);
      // The hacker works through your files and types in the log as time runs out
      const files = dialog.querySelectorAll('.hack-file');
      files.forEach((f, i) => f.classList.toggle('locked', progress > (i + 1) / (files.length + 1)));
      if ((attack.logTimer -= dt) <= 0) {
        attack.logTimer = 2.2;
        addLog(HACK_LOG[Math.min(attack.logIndex++, HACK_LOG.length - 1)]);
      }
      if (attack.left <= 0) lose();
    } else if (!attack && rules.isPlaying()) {
      nextIn -= dt;
      if (nextIn <= 0) start();
    }
  }
  function tick(now) {
    advance(Math.min(0.1, (now - last) / 1000));
    last = now;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  return { start, advance };
}
