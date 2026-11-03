// How to Play videos: the real game plays itself in a little screen. A cursor moves and clicks,
// a keyboard in the corner lights up with every key pressed, and a narrator explains (with captions).
// The game runs in an iframe with #demo (demo-mode.js), so it starts fresh and never touches your save.
// The controls work like a video player: pause, skip back and forward, a seek bar, volume and speed.
// openDemo('td' | 'clicker' | 'adventure', afterClose) plays one. The scripts are at the bottom.
// Everything is inside this function so its names never clash with the game's own. Only openDemo is shared.
(() => {

const DEMO_W = 1280;   // the game inside the screen is laid out at this size, then scaled to fit
const DEMO_H = 720;
const STOPPED = Symbol('demo stopped');
const VOICE_KEY = 'defenders-of-data-demo-voice';     // '0' = muted
const VOLUME_KEY = 'defenders-of-data-demo-volume';
const SPEED_KEY = 'defenders-of-data-demo-speed';
const SPEEDS = [2, 1.75, 1.5, 1.25, 1, 0.75, 0.5, 0.25];
const SKIP = 10000;    // ⏪ and ⏩ jump 10 seconds
// The game moves forward in steps of about one frame (20ms of video). Faster speeds and skipping take
// bigger steps, so the game still draws a normal number of frames each second and keeps up.
const STEP = 20;
const MAX_STEP = 50;
const stepSize = () => (skipping() ? MAX_STEP : Math.min(MAX_STEP, STEP * Math.max(1, prefs.speed)));

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
const recorded = (game, lines) => Array.from({ length: lines }, (_, i) => `${game}-${String(i + 1).padStart(2, '0')}`);
const VOICE_CLIPS = Object.fromEntries(
  [...recorded('td', 13), ...recorded('clicker', 9), ...recorded('adventure', 10)].map(id => [id, `${id}.m4a`]),
);
const clipLength = {};   // how long each recording is, in ms, so skipping ahead keeps the same timing
let narration = null;    // the recording playing right now: { audio }
let soundBlocked = false;   // browsers block sound until you click the page

// Your player settings, remembered on this computer
const prefs = { volume: 1, muted: false, speed: 1 };
try {
  prefs.muted = localStorage.getItem(VOICE_KEY) === '0';
  const volume = parseFloat(localStorage.getItem(VOLUME_KEY));
  if (volume >= 0 && volume <= 1) prefs.volume = volume;
  const speed = parseFloat(localStorage.getItem(SPEED_KEY));
  if (SPEEDS.includes(speed)) prefs.speed = speed;
} catch { /* storage blocked */ }
function savePrefs() {
  try {
    localStorage.setItem(VOICE_KEY, prefs.muted ? '0' : '1');
    localStorage.setItem(VOLUME_KEY, prefs.volume);
    localStorage.setItem(SPEED_KEY, prefs.speed);
  } catch { /* storage blocked */ }
}

// ---------- The player ----------
const demoDialog = document.createElement('dialog');
demoDialog.className = 'panel demo';
demoDialog.setAttribute('aria-labelledby', 'demo-title');
demoDialog.innerHTML = `
  <div class="demo-head">
    <span class="demo-live" aria-hidden="true">▶ DEMO</span>
    <h2 id="demo-title"></h2>
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
    <span class="demo-big-play" id="demo-big-play" aria-hidden="true" hidden>▶</span>
    <span class="demo-skipping" id="demo-skipping" aria-hidden="true" hidden>⏩ Skipping ahead...</span>
    <button class="demo-unmute" id="demo-unmute" hidden>🔊 Click for sound</button>
    <div class="demo-cover" id="demo-cover"></div>
  </div>
  <div class="demo-controls">
    <button class="demo-ctl demo-play" id="demo-play"></button>
    <button class="demo-ctl" id="demo-back" title="Back 10 seconds (J)" aria-label="Back 10 seconds">⏪ 10</button>
    <button class="demo-ctl" id="demo-fwd" title="Forward 10 seconds (L)" aria-label="Forward 10 seconds">10 ⏩</button>
    <input type="range" class="demo-seek" id="demo-seek" min="0" max="1000" value="0" aria-label="Seek">
    <span class="demo-time" id="demo-time">0:00 / 0:00</span>
    <span class="demo-sound">
      <button class="demo-ctl" id="demo-mute" title="Mute (M)"></button>
      <input type="range" class="demo-volume" id="demo-volume" min="0" max="100" aria-label="Volume">
    </span>
    <select class="demo-speed" id="demo-speed" aria-label="Playback speed" title="Playback speed">
      ${SPEEDS.map(s => `<option value="${s}">${s === 1 ? 'Normal' : `${s}×`}</option>`).join('')}
    </select>
  </div>
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
let current = null;    // the demo that's playing: { name, stopped, live, done, length }
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

// ---------- The video clock ----------
// The game in the screen doesn't run on real time: demo-mode.js hands its clock to this player.
// clock.t is how far into the video we are (ms). Every few milliseconds drive() moves it forward
// by the real time that passed times the speed, in small steps, and the game and the script follow.
// Paused, nothing moves. Skipping ahead (clock.seekTo) runs as fast as the computer can.
const clock = { t: 0, gameT: 0, paused: false, seekTo: null };   // gameT: how far the game itself has moved
let sleepers = [];     // the script waiting for the clock: { end, resolve, reject, run }
let lastReal = performance.now();
let driving = false;
const skipping = () => clock.seekTo !== null;

function sleep(run, ms) {
  return new Promise((resolve, reject) => {
    if (run.stopped) return reject(STOPPED);
    sleepers.push({ end: clock.t + ms, resolve, reject, run });
  });
}

// Let the script carry on wherever its wait is over
function wakeSleepers() {
  const due = sleepers.filter(s => s.end <= clock.t || s.run.stopped);
  if (!due.length) return false;
  sleepers = sleepers.filter(s => !due.includes(s));
  for (const s of due) (s.run.stopped ? s.reject(STOPPED) : s.resolve());
  return true;
}

async function drive() {
  const now = performance.now();
  const passed = Math.min(100, now - lastReal);
  lastReal = now;
  const run = current;
  if (driving || !run?.live || (clock.paused && !skipping())) return;
  driving = true;
  try {
    let budget = skipping() ? Infinity : passed * prefs.speed;
    for (let i = 0; i < 5000 && budget > 0 && current === run && run.live; i++) {
      if (skipping() && performance.now() - now > 14) break;   // keep the page responsive while skipping
      // Move the video's time to the next moment something happens: the script's next wake-up,
      // the game's next step, the end of a skip, or as far as real time allows
      const wake = Math.min(...sleepers.map(s => s.end));
      const target = Math.min(clock.t + budget, wake, clock.gameT + stepSize(), skipping() ? clock.seekTo : Infinity);
      const moved = Math.max(0, target - clock.t);
      clock.t += moved;
      budget -= moved;
      // The game only ever moves in whole steps, so it plays out the same way every time
      while (clock.gameT + stepSize() <= clock.t + 1e-6) {
        const step = stepSize();
        clock.gameT += step;
        frame.contentWindow?.demoClock?.advance(step);
      }
      const woke = wakeSleepers();
      if (woke) for (let k = 0; k < 20; k++) await null;   // let the script react before time moves on
      if (skipping() && clock.t >= clock.seekTo) {
        endSkip();
        break;   // back to normal speed from the next tick
      }
      if (moved === 0 && !woke) break;
    }
  } finally {
    driving = false;
  }
}
setInterval(drive, 8);

// ---------- Playing, pausing and skipping ----------
function openDemo(name, after = null) {
  demoAfter = after;
  demoEl('demo-title').textContent = `How to Play: ${DEMOS[name].title}`;
  if (!demoDialog.open) demoDialog.showModal();
  demoEl('demo-go').focus();
  loadClipLengths(name);
  clock.paused = false;
  playDemo(name);
}

// Read how long each recording is. Each line lasts exactly that long in the video, whether it's
// heard, muted or skipped, so the video always has the same timing.
const clipsLoaded = {};
function loadClipLengths(name) {
  clipsLoaded[name] = clipsLoaded[name] || Promise.all(Object.keys(VOICE_CLIPS).filter(id => id.startsWith(`${name}-`)).map(id =>
    new Promise(resolve => {
      const audio = new Audio(`voice/${VOICE_CLIPS[id]}`);
      audio.preload = 'metadata';
      audio.onloadedmetadata = () => { clipLength[id] = audio.duration * 1000; resolve(); };
      audio.onerror = resolve;
    })));
  return clipsLoaded[name];
}
const stopNarration = () => {
  narration?.audio.pause();
  narration = null;
};

// skipTo: start the video and skip straight to this point (ms), used for skipping back
function playDemo(name, skipTo = 0) {
  stopDemo();
  const run = { name, stopped: false, live: false, done: false, length: DEMOS[name].length * 1000 };
  current = run;
  clock.t = 0;
  clock.gameT = 0;
  clock.seekTo = skipTo > 0 ? skipTo : null;
  demoEl('demo-caption').textContent = '';
  showCover('<span class="demo-spinner"></span>Loading the game...');
  cursor.style.transform = `translate(${screen.clientWidth / 2}px, ${screen.clientHeight / 2}px)`;
  renderControls();
  frame.onload = async () => {
    if (current !== run) return;
    // Calm mode for the paused game: stop its animations too
    const style = frame.contentDocument.createElement('style');
    style.textContent = 'html.demo-paused *, html.demo-paused *::before, html.demo-paused *::after { animation-play-state: paused !important; }';
    frame.contentDocument.head.appendChild(style);
    setGameVolume();
    // Wait (a few seconds at most) to know how long each line is
    await Promise.race([loadClipLengths(name), new Promise(resolve => window.setTimeout(resolve, 3000))]);
    if (current !== run) return;
    run.live = true;
    try {
      await sleep(run, 700);
      hideCover();
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
  wakeSleepers();
  stopNarration();
  current = null;
  frame.onload = null;
  demoDialog.querySelectorAll('.demo-key.down').forEach(k => k.classList.remove('down'));
}

function finishDemo(run) {
  if (current !== run) return;
  run.done = true;
  run.live = false;
  run.length = clock.t;
  DEMOS[run.name].length = clock.t / 1000;   // the real length, for the seek bar next time
  endSkip();
  showCover(`<p class="demo-end">You're ready, Defender!</p>
    <button class="btn btn-primary" data-act="go">Let's play!</button>
    <button class="btn" data-act="replay">↺ Watch again</button>`);
  renderControls();
}

function setPaused(paused) {
  if (!current) return;
  if (current.done && !paused) return playDemo(current.name);   // ▶ at the end plays it again
  clock.paused = paused;
  if (narration) {
    if (paused) narration.audio.pause();
    else narration.audio.play().catch(() => {});
  }
  renderControls();
}

// Jump to a point in the video (ms). Forward skips ahead; back starts over and skips to that point.
function seek(target) {
  const run = current;
  if (!run) return;
  target = Math.max(0, Math.min(target, run.length));
  if (run.done || target < clock.t - 250) {
    if (target <= 0 && !run.done) return playDemo(run.name);
    return playDemo(run.name, target);
  }
  if (target <= clock.t) return;
  clock.seekTo = target;
  stopNarration();   // skipped lines show as captions only
  setGameVolume();
  renderControls();
}

function endSkip() {
  if (!skipping()) return;
  clock.seekTo = null;
  setGameVolume();
  renderControls();
}

function closeDemo() {
  stopDemo();
  frame.src = 'about:blank';
  demoDialog.close();
  const after = demoAfter;
  demoAfter = null;
  if (after) after();
}

function showCover(html) {
  const cover = demoEl('demo-cover');
  cover.innerHTML = html;
  cover.hidden = false;
}
function hideCover() { demoEl('demo-cover').hidden = true; }

// ---------- Sound ----------
const audible = () => !prefs.muted && prefs.volume > 0;
function setGameVolume() {
  frame.contentWindow?.demoSetVolume?.(audible() && !skipping() ? prefs.volume : 0);
}
function setVolume(volume, muted = volume === 0) {
  prefs.volume = volume;
  prefs.muted = muted;
  if (narration) narration.audio.volume = audible() ? prefs.volume : 0;
  setGameVolume();
  savePrefs();
  renderControls();
}
function setSpeed(speed) {
  prefs.speed = speed;
  if (narration) narration.audio.playbackRate = speed;
  savePrefs();
  renderControls();
}

// ---------- The controls ----------
const timeText = ms => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
let draggingSeek = false;

function renderControls() {
  const run = current;
  const paused = clock.paused || !!run?.done;
  demoDialog.classList.toggle('paused', paused);
  frame.contentDocument?.documentElement?.classList.toggle('demo-paused', paused);
  const play = demoEl('demo-play');
  play.textContent = run?.done ? '↺' : paused ? '▶' : '⏸';
  play.setAttribute('aria-label', run?.done ? 'Watch again' : paused ? 'Play' : 'Pause');
  play.title = `${play.getAttribute('aria-label')} (Space or K)`;
  demoEl('demo-big-play').hidden = !clock.paused || !run || run.done;
  demoEl('demo-skipping').hidden = !skipping();
  demoEl('demo-unmute').hidden = !soundBlocked || !audible();
  const level = audible() ? prefs.volume : 0;
  const mute = demoEl('demo-mute');
  mute.textContent = level === 0 ? '🔇' : level < 0.5 ? '🔉' : '🔊';
  mute.setAttribute('aria-label', audible() ? 'Mute' : 'Unmute');
  const volume = demoEl('demo-volume');
  volume.value = Math.round(level * 100);
  volume.style.setProperty('--fill', `${level * 100}%`);
  demoEl('demo-speed').value = prefs.speed;
  renderTime();
}

function renderTime() {
  const run = current;
  const length = run ? Math.max(run.length, clock.t) : 0;
  const at = run?.done ? length : skipping() ? clock.seekTo : clock.t;
  const seekBar = demoEl('demo-seek');
  if (!draggingSeek) {
    seekBar.value = length ? Math.round((at / length) * 1000) : 0;
    demoEl('demo-time').textContent = `${timeText(at)} / ${timeText(length)}`;
  }
  seekBar.style.setProperty('--fill', `${(seekBar.value / 10)}%`);
}
(function tickTime() {
  if (demoDialog.open) renderTime();
  requestAnimationFrame(tickTime);
})();

demoEl('demo-play').addEventListener('click', () => setPaused(!(clock.paused || current?.done)));
demoEl('demo-back').addEventListener('click', () => seek(clock.t - SKIP));
demoEl('demo-fwd').addEventListener('click', () => seek(clock.t + SKIP));
const seekBar = demoEl('demo-seek');
seekBar.addEventListener('input', () => {
  draggingSeek = true;
  const length = Math.max(current?.length || 0, clock.t);
  demoEl('demo-time').textContent = `${timeText((seekBar.value / 1000) * length)} / ${timeText(length)}`;
  seekBar.style.setProperty('--fill', `${seekBar.value / 10}%`);
});
seekBar.addEventListener('change', () => {
  draggingSeek = false;
  seek((seekBar.value / 1000) * Math.max(current?.length || 0, clock.t));
});
demoEl('demo-mute').addEventListener('click', () => {
  soundBlocked = false;
  if (audible()) setVolume(prefs.volume, true);
  else setVolume(prefs.volume || 1, false);
});
demoEl('demo-volume').addEventListener('input', e => setVolume(e.target.value / 100));
demoEl('demo-speed').addEventListener('change', e => setSpeed(parseFloat(e.target.value)));
// This click lets the browser play sound, so the next line will be heard
demoEl('demo-unmute').addEventListener('click', () => {
  soundBlocked = false;
  renderControls();
});
// Click the screen to pause or play, like a video
screen.addEventListener('click', e => {
  if (e.target.closest('button, .demo-cover:not([hidden])')) return;
  setPaused(!clock.paused);
});

demoEl('demo-go').addEventListener('click', closeDemo);
demoEl('demo-replay').addEventListener('click', () => current ? playDemo(current.name) : null);
demoEl('demo-cover').addEventListener('click', e => {
  const act = e.target.closest('[data-act]')?.dataset.act;
  if (act === 'go') closeDemo();
  if (act === 'replay') playDemo(current.name);
});
demoDialog.addEventListener('cancel', e => {
  e.preventDefault();
  closeDemo();
});

// Video player keys: Space or K pause, J and L skip 10s, ← and → skip 5s, M mute
demoDialog.addEventListener('keydown', e => {
  if (e.target.matches('input, select')) return;
  const key = e.key.toLowerCase();
  const actions = {
    ' ': () => setPaused(!(clock.paused || current?.done)),
    k: () => setPaused(!(clock.paused || current?.done)),
    j: () => seek(clock.t - SKIP),
    l: () => seek(clock.t + SKIP),
    arrowleft: () => seek(clock.t - SKIP / 2),
    arrowright: () => seek(clock.t + SKIP / 2),
    m: () => demoEl('demo-mute').click(),
  };
  if (!actions[key]) return;
  e.preventDefault();
  actions[key]();
});
renderControls();

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
    const start = clock.t;
    for (;;) {
      const to = pointOf(target);
      const t = Math.min(1, (clock.t - start) / ms);
      const ease = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      const p = { x: from.x + (to.x - from.x) * ease, y: from.y + (to.y - from.y) * ease };
      placeCursor(p);
      mouseEvent('mousemove', p);
      if (t >= 1) break;
      await wait(16);
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
  // id names the line in VOICE-SCRIPT.md. The line lasts exactly as long as its recording on the
  // video clock, so the timing is the same whether it's heard, muted, skipped or blocked.
  function say(id, text) {
    alive();
    demoEl('demo-caption').textContent = text;
    const length = clipLength[id] || text.split(/\s+/).length * 330 + 900;
    const line = sleep(run, length);
    if (!VOICE_CLIPS[id] || skipping() || !audible() || soundBlocked) return line;
    stopNarration();
    const audio = new Audio(`voice/${VOICE_CLIPS[id]}`);
    narration = { audio };
    audio.volume = prefs.volume;
    audio.playbackRate = prefs.speed;
    if (!clock.paused) {
      audio.play().catch(() => {
        // Blocked until you click the page: the caption still shows, and a button asks for a click
        soundBlocked = true;
        renderControls();
      });
    }
    const end = () => { if (narration?.audio === audio) stopNarration(); };
    return line.then(end, err => { end(); throw err; });
  }

  async function waitFor(test, timeout = 10000) {
    const end = clock.t + timeout;
    while (!test()) {
      if (clock.t > end) throw new Error('Demo waited too long');
      await wait(100);
    }
  }
  // The answer button whose text matches (in Spanish, the button shows the translation)
  const button = (sel, text) => [...doc.querySelectorAll(sel)].find(b => [text.trim(), tr(text).trim()].includes(b.textContent.trim()));

  return { say, wait, moveTo, click, hold, press, game, $, waitFor, button };
}

// Do several things at once, like talking while clicking
const together = (...steps) => Promise.all(steps);

// ---------- The scripts ----------
const DEMOS = {
  td: {
    title: 'Tower Defense',
    page: 'tower-defense.html',
    length: 97,    // seconds: the exact length at normal speed (every run is the same)
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
    length: 63,
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
    length: 80,
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
