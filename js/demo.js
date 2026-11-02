// How to Play videos: the real game plays itself in a little screen. A cursor moves and clicks,
// a keyboard in the corner lights up with every key pressed, and a narrator explains (with captions).
// The game runs in an iframe with #demo (demo-mode.js), so it starts fresh and never touches your save.
// openDemo('td' | 'clicker' | 'adventure', afterClose) plays one. The scripts are at the bottom.
// Everything is inside this function so its names never clash with the game's own. Only openDemo is shared.
(() => {

const DEMO_W = 1280;   // the game inside the screen is laid out at this size, then scaled to fit
const DEMO_H = 720;
const VOICE_KEY = 'defenders-of-data-demo-voice';
const STOPPED = Symbol('demo stopped');

const KEY_ROWS = [
  ['Escape', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm'],
  [' ', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'ArrowRight'],
];
const KEY_LABELS = { Escape: 'Esc', Shift: 'Shift', ' ': 'Space', ArrowLeft: '←', ArrowUp: '↑', ArrowDown: '↓', ArrowRight: '→' };
const KEY_CODES = { ' ': 'Space', Escape: 'Escape', Shift: 'ShiftLeft' };
const keyCode = key => KEY_CODES[key] || (key.startsWith('Arrow') ? key : /\d/.test(key) ? `Digit${key}` : `Key${key.toUpperCase()}`);

// Your own recorded narration, in the voice folder: line id → file name (see VOICE-SCRIPT.md).
// Lines not listed here are read by the computer's voice.
const VOICE_CLIPS = {};
let clip = null;   // the recording playing right now

let voiceOn = true;
try { voiceOn = localStorage.getItem(VOICE_KEY) !== '0'; } catch { /* storage blocked */ }

// ---------- The player ----------
const demoDialog = document.createElement('dialog');
demoDialog.className = 'panel demo';
demoDialog.setAttribute('aria-labelledby', 'demo-title');
demoDialog.innerHTML = `
  <div class="demo-head">
    <span class="demo-live" aria-hidden="true">▶ DEMO</span>
    <h2 id="demo-title"></h2>
    <button class="btn btn-small demo-voice" id="demo-voice"></button>
  </div>
  <div class="demo-screen" id="demo-screen">
    <iframe id="demo-frame" title="The game playing by itself" tabindex="-1"></iframe>
    <div class="demo-cursor" id="demo-cursor" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M3 2 L3 19 L8 14.5 L11.5 22 L14.5 20.6 L11 13.4 L17.5 13.4 Z" fill="#fff" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg>
    </div>
    <div class="demo-input" aria-hidden="true">
      <div class="demo-keys" id="demo-keys"></div>
      <div class="demo-mouse" id="demo-mouse"><span class="demo-mouse-l"></span><span class="demo-mouse-r"></span></div>
    </div>
    <div class="demo-cover" id="demo-cover"></div>
  </div>
  <div class="demo-progress" aria-hidden="true"><span id="demo-progress"></span></div>
  <p class="demo-caption" id="demo-caption" aria-live="polite"></p>
  <div class="end-buttons">
    <button class="btn btn-primary" id="demo-go">Let's play!</button>
    <button class="btn" id="demo-replay">↺ Watch again</button>
  </div>`;
document.body.appendChild(demoDialog);

const demoEl = id => document.getElementById(id);
const frame = demoEl('demo-frame');
const screen = demoEl('demo-screen');
const cursor = demoEl('demo-cursor');
let screenScale = 1;
let current = null;    // the demo that's playing: { name, stopped, start, length }
let demoAfter = null;

// The keyboard in the corner: an RGB gaming keyboard. Each key gets its own color (--h, a hue)
// in a rainbow wave across the board, and the CSS makes the wave flow.
for (const [r, row] of KEY_ROWS.entries()) {
  const line = document.createElement('div');
  line.className = 'demo-row';
  for (const [i, key] of row.entries()) {
    const k = document.createElement('span');
    k.className = `demo-key${key.length > 1 ? ' wide' : ''}${key === ' ' ? ' space' : ''}`;
    k.style.setProperty('--h', Math.round(r * 24 + (i / row.length) * 300));
    k.dataset.key = key;
    k.textContent = KEY_LABELS[key] || key.toUpperCase();
    line.appendChild(k);
  }
  demoEl('demo-keys').appendChild(line);
}
const lightKey = (key, on) => demoEl('demo-keys').querySelector(`[data-key="${CSS.escape(key)}"]`)?.classList.toggle('down', on);

// Keep the game laid out at 1280x720 and shrink it to fit the screen
new ResizeObserver(() => {
  screenScale = screen.clientWidth / DEMO_W;
  frame.style.transform = `scale(${screenScale})`;
}).observe(screen);

function renderVoice() {
  demoEl('demo-voice').textContent = voiceOn ? '🔊 Voice on' : '🔇 Voice off';
  demoEl('demo-voice').setAttribute('aria-pressed', voiceOn);
}
renderVoice();

function openDemo(name, after = null) {
  demoAfter = after;
  demoEl('demo-title').textContent = `How to Play: ${DEMOS[name].title}`;
  if (!demoDialog.open) demoDialog.showModal();
  demoEl('demo-go').focus();
  playDemo(name);
}

function playDemo(name) {
  stopDemo();
  const run = { name, stopped: false, start: 0, length: DEMOS[name].length };
  current = run;
  demoEl('demo-caption').textContent = '';
  demoEl('demo-progress').style.width = '0%';
  showCover('<span class="demo-spinner"></span>Loading the game...');
  cursor.style.transform = `translate(${screen.clientWidth / 2}px, ${screen.clientHeight / 2}px)`;
  frame.onload = async () => {
    if (current !== run) return;
    try {
      await sleep(run, 700);
      hideCover();
      run.start = performance.now();
      requestAnimationFrame(() => tickProgress(run));
      await DEMOS[name].script(demoApi(run));
      finishDemo(run);
    } catch (err) {
      if (err === STOPPED) return;
      console.error('Demo stopped:', err);
      finishDemo(run);
    }
  };
  // A new number each time, so the game always reloads from the start. #demo turns on demo mode.
  frame.src = `${DEMOS[name].page}?v=${Date.now()}#demo`;
}

function stopDemo() {
  if (current) current.stopped = true;
  current = null;
  window.speechSynthesis?.cancel();
  clip?.pause();
  frame.onload = null;
  demoDialog.querySelectorAll('.demo-key.down').forEach(k => k.classList.remove('down'));
}

function finishDemo(run) {
  if (current !== run) return;
  run.done = true;
  demoEl('demo-progress').style.width = '100%';
  showCover(`<p class="demo-end">You're ready, Defender!</p>
    <button class="btn btn-primary" data-act="go">Let's play!</button>
    <button class="btn" data-act="replay">↺ Watch again</button>`);
}

function tickProgress(run) {
  if (current !== run || run.done) return;
  const t = (performance.now() - run.start) / 1000;
  demoEl('demo-progress').style.width = `${Math.min(98, (t / run.length) * 100)}%`;
  requestAnimationFrame(() => tickProgress(run));
}

function showCover(html) {
  const cover = demoEl('demo-cover');
  cover.innerHTML = html;
  cover.hidden = false;
}
function hideCover() { demoEl('demo-cover').hidden = true; }

function closeDemo() {
  stopDemo();
  frame.src = 'about:blank';
  demoDialog.close();
  const after = demoAfter;
  demoAfter = null;
  if (after) after();
}

demoEl('demo-go').addEventListener('click', closeDemo);
demoEl('demo-replay').addEventListener('click', () => current ? playDemo(current.name) : null);
demoEl('demo-cover').addEventListener('click', e => {
  const act = e.target.closest('[data-act]')?.dataset.act;
  if (act === 'go') closeDemo();
  if (act === 'replay') playDemo(current.name);
});
demoEl('demo-voice').addEventListener('click', () => {
  voiceOn = !voiceOn;
  if (!voiceOn) {
    window.speechSynthesis?.cancel();
    clip?.pause();
  }
  try { localStorage.setItem(VOICE_KEY, voiceOn ? '1' : '0'); } catch { /* storage blocked */ }
  renderVoice();
});
demoDialog.addEventListener('cancel', e => {
  e.preventDefault();
  closeDemo();
});

function sleep(run, ms) {
  return new Promise((resolve, reject) => setTimeout(() => (run.stopped ? reject(STOPPED) : resolve()), ms));
}

// A friendly English voice, if the computer has one
function pickVoice() {
  const voices = speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
  const liked = ['Natural', 'Google US English', 'Aria', 'Jenny', 'Samantha', 'Zira'];
  return liked.map(name => voices.find(v => v.name.includes(name))).find(Boolean) || voices[0] || null;
}

// ---------- What a script can do ----------
// Points are in the game's own coordinates (as if the game were full size).
function demoApi(run) {
  const win = frame.contentWindow;
  const doc = frame.contentDocument;
  let at = { x: DEMO_W / 2, y: DEMO_H / 2 };
  const alive = () => { if (run.stopped) throw STOPPED; };
  const wait = ms => sleep(run, ms);
  const $ = sel => doc.querySelector(sel);
  // Runs code inside the game, so a script can read its variables (like which answer is right)
  const game = code => win.eval(code);

  const pointOf = target => {
    if (typeof target === 'function') target = target();
    if (!target) return at;
    if (typeof target.x === 'number') return target;
    const el = typeof target === 'string' ? $(target) : target;
    if (!el) throw new Error(`Demo can't find ${target}`);
    el.scrollIntoView({ block: 'nearest' });   // like a player scrolling down to a button
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };
  const mouseEvent = (type, p, Kind = win.MouseEvent) => {
    const el = doc.elementFromPoint(p.x, p.y);
    el?.dispatchEvent(new Kind(type, { bubbles: true, cancelable: true, clientX: p.x, clientY: p.y, view: win, button: 0 }));
  };
  const placeCursor = p => {
    at = p;
    cursor.style.transform = `translate(${p.x * screenScale}px, ${p.y * screenScale}px)`;
  };

  // Glide the cursor there. A function target is followed as it moves (like a threat walking).
  async function moveTo(target, ms = 550) {
    alive();
    const from = { ...at };
    const start = performance.now();
    for (;;) {
      const to = pointOf(target);
      const t = Math.min(1, (performance.now() - start) / ms);
      const ease = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      const p = { x: from.x + (to.x - from.x) * ease, y: from.y + (to.y - from.y) * ease };
      placeCursor(p);
      mouseEvent('mousemove', p);
      if (t >= 1) break;
      await wait(16);   // a timer, not a frame, so it keeps time even if the browser skips frames
    }
  }

  async function click(target, ms) {
    await moveTo(target, ms);
    const p = pointOf(target);
    placeCursor(p);
    demoEl('demo-mouse').classList.add('down');
    cursor.classList.remove('clicking');
    void cursor.offsetWidth;
    cursor.classList.add('clicking');
    mouseEvent('pointerdown', p, win.PointerEvent);
    mouseEvent('mousedown', p);
    await wait(90);
    mouseEvent('pointerup', p, win.PointerEvent);
    mouseEvent('mouseup', p);
    mouseEvent('click', p);
    demoEl('demo-mouse').classList.remove('down');
    await wait(150);
  }

  const keyEvent = (type, key) => {
    (doc.activeElement || doc.body).dispatchEvent(new win.KeyboardEvent(type, { key, code: keyCode(key), bubbles: true, cancelable: true }));
  };
  async function hold(keys, ms) {
    alive();
    for (const k of keys) { lightKey(k, true); keyEvent('keydown', k); }
    try { await wait(ms); } finally {
      for (const k of keys) { lightKey(k, false); if (!run.stopped) keyEvent('keyup', k); }
    }
  }
  async function press(key, ms = 150) {
    await hold([key], ms);
    await wait(150);
  }

  // Say a line out loud and show it as a caption. Resolves when it's finished.
  // id names the line in VOICE-SCRIPT.md: a recording in VOICE_CLIPS plays if there is one,
  // otherwise the computer's voice reads it.
  function say(id, text) {
    alive();
    demoEl('demo-caption').textContent = text;
    const words = text.split(/\s+/).length;
    return new Promise(resolve => {
      let timer;
      const done = () => { clearTimeout(timer); resolve(); };
      if (voiceOn && VOICE_CLIPS[id]) {
        clip = new Audio(`voice/${VOICE_CLIPS[id]}`);
        clip.onended = done;
        clip.onerror = done;
        clip.onpause = done;   // voice turned off, or the video closed
        // Browsers block sound until you've clicked the page: then just show the caption long enough to read
        clip.play().catch(() => { timer = setTimeout(done, words * 320 + 900); });
      } else if (voiceOn && window.speechSynthesis) {
        const line = new SpeechSynthesisUtterance(text);
        line.voice = pickVoice();
        line.rate = 1.03;
        line.pitch = 1.1;
        line.onend = done;
        line.onerror = done;
        speechSynthesis.cancel();
        speechSynthesis.speak(line);
        timer = setTimeout(done, words * 550 + 2500);   // in case the voice never says it finished
      } else {
        timer = setTimeout(done, words * 320 + 900);    // time to read the caption
      }
    }).then(alive);
  }

  async function waitFor(test, timeout = 10000) {
    const end = performance.now() + timeout;
    while (!test()) {
      if (performance.now() > end) throw new Error('Demo waited too long');
      await wait(100);
    }
  }
  // The answer button whose text matches
  const button = (sel, text) => [...doc.querySelectorAll(sel)].find(b => b.textContent.trim() === text.trim());

  return { say, wait, moveTo, click, hold, press, game, $, waitFor, button };
}

// Do several things at once, like talking while clicking
const together = (...steps) => Promise.all(steps);

// ---------- The scripts ----------
const DEMOS = {
  td: {
    title: 'Tower Defense',
    page: 'tower-defense.html',
    length: 100,
    async script({ say, wait, moveTo, click, press, game, $, waitFor, button }) {
      // A square on the board, or a threat, as a point on the screen
      const toScreen = (x, y) => game(`(() => { const b = canvas.getBoundingClientRect();
        return { x: b.left + ${x} * b.width / canvas.width, y: b.top + ${y} * b.height / canvas.height }; })()`);
      const tile = (c, r) => toScreen(c * 40 + 20, r * 40 + 20);
      const threat = () => {
        const e = game('state.enemies.find(e => !e.gone && e.x > 60 && e.x < 800)');
        return e && toScreen(e.x, e.y);
      };

      await together(
        say('td-01', 'Hackers send threats down this path. They want to steal your data at the end!'),
        (async () => { for (const [c, r] of [[0, 3], [4, 3], [4, 10], [10, 10], [10, 3], [16, 3], [16, 10], [21, 10]]) await moveTo(tile(c, r), 420); })(),
      );
      await together(
        say('td-02', 'Towers stop them. Each tower is a real way to stay safe online. Click one to unlock it.'),
        click('#tower-bar .tool', 900),
      );
      await waitFor(() => $('#dlg-challenge').open);
      const right = game('lastChallenge.linkcheck.options.find(o => o.correct).text');
      await together(
        say('td-03', 'Answer a quick question to unlock it. Read every choice carefully!'),
        (async () => { for (const b of $('#ch-options').children) await moveTo(b, 450); })(),
      );
      await click(button('#ch-options .choice', right));
      await wait(1200);
      await click('#ch-unlock');
      await say('td-04', 'Unlocked! Now press 1, or click the tower, then click an empty square next to the path.');
      await press('1');
      await click(tile(5, 6));
      await click(tile(9, 9), 700);
      await press('Escape');
      await together(say('td-05', 'Press Space to start the wave. Your towers fire all by themselves!'), press(' '));
      await waitFor(threat, 15000);
      await say('td-06', 'Click a threat to scan it.');
      await waitFor(threat, 15000);
      await click(threat, 650);
      await waitFor(() => $('#dlg-scan').open, 3000);
      const kind = game('state.enemies.find(e => !e.gone).type');
      await together(
        say('td-07', 'Read the message and pick what kind of threat it is. This one is phishing!'),
        moveTo('#scan-message', 700),
      );
      await click(`#scan-choices [data-type="${kind}"]`);
      await say('td-08', 'Right! Now your towers do double damage to it.');
      await click('#scan-continue');
      await together(say('td-09', 'Press F to speed things up.'), press('f'));
      await say('td-10', 'Keep an eye out for a tiny secret message bubble. Click it fast for double damage!');
      await waitFor(() => $('#dlg-quiz').open, 60000);
      await say('td-11', 'After every wave, play Real or Scam. Right answers earn bytes for more towers.');
      for (let i = 0; i < 3; i++) {
        await moveTo('#quiz-message', 500);
        await wait(i === 0 ? 900 : 400);
        const answer = game('quizQuestions[quizIndex].answer');
        await click(answer === 'real' ? '#quiz-real' : '#quiz-scam');
        await wait(1300);
        await click('#quiz-next');
      }
      await together(
        say('td-12', 'Every tenth wave, a Ransomware Boss attacks. Answer its questions to save your towers.'),
        moveTo('#btn-wave', 900),
      );
      await say('td-13', 'Clear levels to earn stars, and spend them on your coder. Now it\'s your turn!');
    },
  },

  clicker: {
    title: 'Data Clicker',
    page: 'clicker.html',
    length: 85,
    async script({ say, wait, moveTo, click, game, $, waitFor, button }) {
      // Pop-ups come when the script says so, not at random
      game('scamIn = 9999; secretIn = 9999');
      // The right answer to the question that's showing
      const rightAnswer = () => game(`(() => { const q = questionPool(3).find(q => q.prompt === askedRecently[askedRecently.length - 1]);
        return q.options.find(o => o.correct).text; })()`);
      async function answerAsk() {
        await waitFor(() => $('#dlg-ask').open && $('#ask-options .choice'), 4000);
        for (const b of $('#ask-options').children) await moveTo(b, 380);
        await click(button('#ask-options .choice', rightAnswer()));
        await wait(1300);
        await click('#ask-done');
      }

      await together(
        say('clicker-01', 'Click the big shield to earn bytes. Every click protects your data!'),
        (async () => { await moveTo('#big-shield', 700); for (let i = 0; i < 18; i++) await click('#big-shield', 60); })(),
      );
      await together(
        say('clicker-02', 'Spend bytes to hire defenders. Each one is a real way to stay safe online.'),
        moveTo('#helpers .helper', 900),
      );
      await click('#helpers .helper');
      await say('clicker-03', 'Answer a question to unlock it.');
      await answerAsk();
      await together(
        say('clicker-04', 'Defenders earn bytes for you every second, even while you\'re away!'),
        moveTo('#rate', 800),
      );
      game('showScam(); scam.left = 999');
      await wait(400);
      await together(
        say('clicker-05', 'Watch out for pop-ups! Read the message and decide: is it real, or a scam?'),
        moveTo('#scam-message', 800),
      );
      const truth = game('scam.item.answer');
      await click(`#scam-buttons [data-answer="${truth}"]`);
      await say('clicker-06', 'Get it right for bonus bytes. Then click anywhere to keep going.');
      await click('#big-shield', 700);
      game('showSecret(); secretLeft = 999');
      await wait(300);
      await together(
        say('clicker-07', 'See that tiny bubble? That\'s a secret message. Click it before it disappears!'),
        moveTo('#secret-bubble', 1400),
      );
      await click('#secret-bubble');
      await answerAsk();
      await together(
        say('clicker-08', 'Overdrive! For thirty seconds, everything earns seven times more.'),
        (async () => { await moveTo('#big-shield', 500); for (let i = 0; i < 14; i++) await click('#big-shield', 60); })(),
      );
      await together(
        say('clicker-09', 'Every few minutes a hacker breaks in. Answer fast to keep your bytes. Have fun, Defender!'),
        moveTo('#bytes', 900),
      );
    },
  },

  adventure: {
    title: 'Internet Adventure',
    page: 'adventure.html',
    length: 105,
    async script({ say, wait, moveTo, click, hold, press, game, $, waitFor, button }) {
      const canvasPoint = (fx, fy) => game(`(() => { const b = canvas.getBoundingClientRect(); return { x: b.left + b.width * ${fx}, y: b.top + b.height * ${fy} }; })()`);
      const nearSign = () => game('(() => { const t = nearbyThing(); return !!t && "SN".includes(t.t); })()');

      await together(
        say('adventure-01', 'Walk with W A S D, or the arrow keys. Your coder always faces your mouse.'),
        (async () => {
          await moveTo(canvasPoint(0.75, 0.45), 600);
          await hold(['d'], 1100);
          await moveTo(canvasPoint(0.5, 0.85), 500);
          await hold(['s'], 450);
          await moveTo(canvasPoint(0.5, 0.15), 500);
          await hold(['w'], 450);
          await moveTo(canvasPoint(0.85, 0.5), 500);
        })(),
      );
      await together(say('adventure-02', 'Hold Shift to sprint. Watch your stamina bar!'), hold(['Shift', 'd'], 1600));
      await moveTo('#btn-sprint', 500);
      // Walk along until there's a sign or a person to talk to (or skip ahead to one)
      for (let i = 0; i < 25 && !nearSign(); i++) await hold(['d'], 150);
      if (!nearSign()) {
        game(`(() => { for (let y = 0; y < MAP_H; y++) for (let x = 0; x < 30; x++) {
          if (!'SN'.includes(tileAt(x, y))) continue;
          for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) if (walkable(x + dx, y + dy)) {
            const c = center(x + dx, y + dy); player.x = c.x; player.y = c.y; return; } } })()`);
      }
      await moveTo(canvasPoint(0.55, 0.5), 400);
      await together(say('adventure-03', 'Press Space to talk to people and read signs. They have great safety tips!'), press(' '));
      for (let i = 0; i < 4 && game('!!talkLines'); i++) {
        await wait(1100);
        await press(' ');
      }
      await together(say('adventure-04', 'Wild threats hide in the dark spam grass. Walk through it to find them.'), hold(['s'], 600));
      game('startWild()');
      await waitFor(() => $('#battle-actions [data-move]'), 5000);
      await say('adventure-05', 'Battle! Read the attack, then pick the defense that beats it. The right one is super effective!');
      let narrated = false;
      for (let turn = 0; turn < 20 && !$('.action.quarantine'); turn++) {
        await waitFor(() => $('.action.quarantine') || ($('#battle-actions [data-move]') && !$('#battle-actions [data-move]').disabled), 9000);
        if ($('.action.quarantine')) break;
        await moveTo('#battle-log', 400);
        await wait(500);
        await click(`#battle-actions [data-move="${game('battle.attack.beats')}"]`, 500);
        if (!narrated) { narrated = true; await say('adventure-06', 'Super effective!'); }
      }
      await say('adventure-07', 'You beat it! Now quarantine it: get 7 questions right in 30 seconds before it escapes.');
      await click('.action.quarantine');
      const answering = (async () => {
        for (let i = 0; i < 7; i++) {
          await waitFor(() => game('catching && !catching.busy') && $('#battle-actions .answer:not(:disabled)'), 4000);
          const right = game('[...catching.asked].pop().options.find(o => o.correct).text');
          await wait(450);
          await click(button('#battle-actions .answer', right), 320);
        }
      })();
      await together(say('adventure-08', 'Rarer threats are tougher, and their questions are harder.'), answering);
      await waitFor(() => $('#dlg-index').open, 6000);
      await say('adventure-09', 'Quarantined! It goes into your Threat Index. Press I to open it any time.');
      await click('#index-close');
      await press('i');
      await wait(1200);
      await click('#index-close');
      await together(
        say('adventure-10', 'Beat hacker trainers to earn badges and open new areas. You can change your keys in Settings. Good luck, Defender!'),
        moveTo('#btn-settings', 1200),
      );
    },
  },
};

window.openDemo = openDemo;
})();
