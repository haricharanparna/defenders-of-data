// Demo mode: the How to Play videos (demo.js) load the real game in a little screen with #demo in the link.
// (A # survives servers that redirect page.html to /page and drop the ?part.)
// In demo mode nothing is read from or saved to this computer, so every demo starts fresh
// and never touches your real progress. Load this before every other game script.
const DEMO_MODE = location.hash === '#demo';
if (DEMO_MODE) {
  Storage.prototype.getItem = () => null;
  Storage.prototype.setItem = () => {};
  document.documentElement.classList.add('demo-mode');

  // ---------- The same every time ----------
  // "Random" numbers come from a fixed sequence, so the video plays out exactly the same way
  // (and is exactly the same length) every time you watch it, like a real video.
  let seed = 20261105;
  Math.random = () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // ---------- The video clock ----------
  // The game's time doesn't run by itself: timers, animation frames and performance.now() all
  // follow a clock the video player moves forward (demoClock.advance). That's how the video can
  // pause, play faster or slower, and skip ahead, with the game keeping up exactly.
  let now = performance.now();
  let nextId = 1;
  const timers = new Map();   // id → { at, fn, args, every }
  let frames = [];            // animation frame callbacks waiting for the next step

  performance.now = () => now;
  window.requestAnimationFrame = cb => {
    const id = nextId++;
    frames.push({ id, cb });
    return id;
  };
  window.cancelAnimationFrame = id => { frames = frames.filter(f => f.id !== id); };
  window.setTimeout = (fn, ms = 0, ...args) => {
    const id = nextId++;
    timers.set(id, { at: now + Math.max(0, ms), fn, args });
    return id;
  };
  window.setInterval = (fn, ms = 0, ...args) => {
    const id = nextId++;
    const every = Math.max(1, ms);
    timers.set(id, { at: now + every, fn, args, every });
    return id;
  };
  window.clearTimeout = window.clearInterval = id => { timers.delete(id); };

  const run = (fn, args) => {
    try { if (typeof fn === 'function') fn(...args); } catch (err) { console.error(err); }
  };
  window.demoClock = {
    // Move the game's time forward by ms: run the timers that come due (in order), then one animation frame
    advance(ms) {
      const end = now + ms;
      for (;;) {
        let next = null;
        for (const [id, t] of timers) if (t.at <= end && (!next || t.at < next.t.at)) next = { id, t };
        if (!next) break;
        now = Math.max(now, next.t.at);
        if (next.t.every) next.t.at += next.t.every;
        else timers.delete(next.id);
        run(next.t.fn, next.t.args);
      }
      now = end;
      const waiting = frames;
      frames = [];
      for (const f of waiting) run(f.cb, [now]);
    },
  };

  // ---------- Volume ----------
  // Game sound effects go through a volume knob the video player turns (demoSetVolume)
  const RealAudioContext = window.AudioContext;
  if (RealAudioContext) {
    let volume = 1;
    const knobs = [];
    window.AudioContext = class extends RealAudioContext {
      constructor(...args) {
        super(...args);
        this.knob = super.createGain();
        this.knob.gain.value = volume;
        this.knob.connect(super.destination);
        knobs.push(this.knob);
      }
      get destination() { return this.knob; }
    };
    window.demoSetVolume = value => {
      volume = value;
      for (const knob of knobs) knob.gain.value = value;
    };
  }
}
