// Sound effects, made with the Web Audio API so there are no sound files to load.
// The 🔊 button (or M) mutes them, and the choice is remembered on this computer.

const MUTE_KEY = 'defenders-of-data-muted';
let audio = null;
let muted = false;
try { muted = localStorage.getItem(MUTE_KEY) === '1'; } catch { /* storage blocked */ }

// One beep. Times are in seconds from now.
function tone(freq, length, { type = 'square', volume = 0.05, at = 0, slideTo = null } = {}) {
  const start = audio.currentTime + at;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + length);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  osc.connect(gain).connect(audio.destination);
  osc.start(start);
  osc.stop(start + length);
}

const SOUNDS = {
  right: () => [523, 659, 784].forEach((f, i) => tone(f, 0.12, { at: i * 0.07 })),
  wrong: () => tone(220, 0.35, { type: 'sawtooth', slideTo: 90, volume: 0.04 }),
  place: () => tone(660, 0.08, { type: 'triangle', volume: 0.08 }),
  leak: () => tone(120, 0.3, { type: 'sawtooth', slideTo: 50, volume: 0.06 }),
  dm: () => { tone(880, 0.08, { type: 'sine', volume: 0.08 }); tone(1175, 0.12, { type: 'sine', volume: 0.08, at: 0.1 }); },
  upgrade: () => [392, 523, 659, 1047].forEach((f, i) => tone(f, 0.14, { type: 'triangle', volume: 0.07, at: i * 0.08 })),
  badge: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, 0.15, { at: i * 0.09, volume: 0.045 })),
  blast: () => { tone(900, 0.6, { type: 'sawtooth', slideTo: 40, volume: 0.07 }); tone(60, 0.6, { type: 'square', volume: 0.05 }); },
  boss: () => [0, 0.35, 0.7].forEach(at => tone(160, 0.25, { type: 'sawtooth', slideTo: 110, volume: 0.06, at })),
  encrypt: () => tone(300, 0.25, { type: 'square', slideTo: 150, volume: 0.04 }),
};

function playSound(name) {
  if (muted || !SOUNDS[name]) return;
  try {
    // Browsers only allow sound after the player has clicked something, so start the audio on first use
    audio = audio || new AudioContext();
    if (audio.state === 'suspended') audio.resume();
    SOUNDS[name]();
  } catch {
    // No sound support: the game works fine without it
  }
}

const muteButton = document.getElementById('btn-mute');

function setMuted(value) {
  muted = value;
  muteButton.textContent = muted ? '🔇' : '🔊';
  muteButton.setAttribute('aria-label', muted ? 'Turn sound on' : 'Turn sound off');
  try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch { /* storage blocked */ }
}

muteButton.addEventListener('click', () => setMuted(!muted));
document.addEventListener('keydown', e => {
  if ((e.key === 'm' || e.key === 'M') && !document.querySelector('dialog[open]')) setMuted(!muted);
});
setMuted(muted);
