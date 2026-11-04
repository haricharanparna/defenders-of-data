// Accessibility settings, shared by every page. You change them from ♿ Accessibility on the title screen,
// or the ♿ button next to 🔊 in any game.
// - Extra time: every countdown (hacker attacks, quarantines, DMs, scam pop-ups, bonus bubbles) lasts twice as long
// - Bigger text: everything is drawn a bit larger
// - Calm mode: no flashing, shaking or bouncing animations
// - Read aloud: questions, messages and explanations are read out loud (in Spanish too), and so is
//   each button you move to with the keyboard
// - Easy-read font: the blocky pixel font becomes a plain, wide font that's easier to read (helps with dyslexia)
// - High contrast: solid dark backgrounds, bright text and thick focus outlines
// Load this right after demo-mode.js, before the game scripts, so they can use TIME_SCALE.

const ACCESS_KEY = 'defenders-of-data-access';
const ACCESS_OPTIONS = [
  { id: 'extraTime', emoji: '⏱️', name: 'Extra time', text: 'Every timer lasts twice as long, so you can read and think at your own pace.' },
  { id: 'bigText', emoji: '🔤', name: 'Bigger text', text: 'Makes words and buttons larger and easier to read.' },
  { id: 'calm', emoji: '🌙', name: 'Calm mode', text: 'Turns off flashing, shaking and bouncing animations.' },
  { id: 'readAloud', emoji: '🗣️', name: 'Read aloud', text: 'Reads questions, messages and explanations out loud, and each button you move to with the keyboard.' },
  { id: 'easyFont', emoji: '📖', name: 'Easy-read font', text: 'Swaps the blocky pixel letters for a plain font that is easier to read, including with dyslexia.' },
  { id: 'contrast', emoji: '🌓', name: 'High contrast', text: 'Solid dark backgrounds, brighter text and thicker outlines around what you have selected.' },
];

let access = { extraTime: false, bigText: false, calm: false, readAloud: false, easyFont: false, contrast: false };
try { access = { ...access, ...JSON.parse(localStorage.getItem(ACCESS_KEY)) }; } catch { /* storage blocked */ }

// Countdowns are multiplied by this. Read when a page loads, so a change applies to the next game you open.
const TIME_SCALE = access.extraTime ? 2 : 1;

// True when motion should be kept still: Calm mode, or the computer's own "reduce motion" setting.
// Checked when it's needed (not once on load), so switching Calm mode works right away.
const calmMotion = () => access.calm || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function applyAccess() {
  document.documentElement.classList.toggle('big-text', access.bigText);
  document.documentElement.classList.toggle('calm', access.calm);
  document.documentElement.classList.toggle('easy-font', access.easyFont);
  document.documentElement.classList.toggle('contrast', access.contrast);
  if (!access.readAloud) stopReading();
}

function setAccess(id, on) {
  access[id] = on;
  try { localStorage.setItem(ACCESS_KEY, JSON.stringify(access)); } catch { /* storage blocked */ }
  applyAccess();
  if (id === 'readAloud' && on) say(tr2('Read aloud is on.'));
}

// The switches, one per setting. Used by the panel on the title screen and the one inside each game.
function fillAccessList(list) {
  for (const option of ACCESS_OPTIONS) {
    const row = document.createElement('label');
    row.className = 'access-option';
    row.innerHTML = `<span class="access-emoji" aria-hidden="true">${option.emoji}</span>
      <span class="access-text"><strong>${option.name}</strong><span>${option.text}</span></span>
      <input type="checkbox" role="switch" class="access-switch">`;
    const input = row.querySelector('input');
    input.checked = access[option.id];
    input.addEventListener('change', () => {
      setAccess(option.id, input.checked);
      if (option.id === 'extraTime' && list.dataset.inGame) list.parentElement.querySelector('.access-reload').hidden = false;
    });
    list.appendChild(row);
  }
}

// ---------- Read aloud ----------
// Uses the browser's own voices (speechSynthesis), so it works offline and needs no account.
// Whatever pops up (a question, a DM, a scam pop-up, an explanation) is read once; new lines that
// appear in it afterwards (like the explanation after you answer) are read when they show up.
const canSpeak = 'speechSynthesis' in window && window === window.top;   // not inside the How to Play videos
const tr2 = text => (typeof tr === 'function' ? tr(text) : text);         // i18n.js loads after this file
function stopReading() { if (canSpeak) speechSynthesis.cancel(); }
function say(text, interrupt = true) {
  if (!canSpeak || !access.readAloud) return;
  // emoji are read out by name ("police car light"), which gets in the way, so they're left out
  const clean = text.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{1F1E6}-\u{1F1FF}]/gu, '').replace(/\s+/g, ' ').trim();
  if (!clean) return;
  if (interrupt) speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = document.documentElement.lang === 'es' ? 'es-ES' : 'en-US';
  u.rate = 0.95;
  speechSynthesis.speak(u);
}

// Pop-ups worth reading: open panels, plus in-game pop-ups that aren't <dialog>s (marked role="dialog" or aria-live)
const READ_SPOTS = 'dialog[open]:not(.demo), [role="dialog"]:not([hidden]):not(dialog), aside[aria-live]:not([hidden])';
const heard = new WeakMap();   // each pop-up's lines already read, so only new ones are read
// "Wave 3" and "Wave 4" count as the same line, so ticking timers and counters aren't read over and over
const lineKey = line => line.replace(/\d+/g, '#');
const isWords = line => /\p{L}{2}/u.test(line);
let readTimer = null;
function readNewLines() {
  readTimer = null;
  if (!access.readAloud) return;
  const spots = [...document.querySelectorAll(READ_SPOTS)].filter(el => el.offsetParent !== null || el.tagName === 'DIALOG');
  const fresh = [];
  for (const spot of spots) {
    const seen = heard.get(spot) || new Set();
    heard.set(spot, seen);
    for (const line of spot.innerText.split('\n').map(l => l.trim())) {
      const key = lineKey(line);
      if (line && isWords(line) && !seen.has(key)) { seen.add(key); fresh.push(line); }
    }
  }
  if (fresh.length) say(fresh.join('. ').replace(/([.!?:])\./g, '$1'), false);
}
function watchForReading() {
  new MutationObserver(changes => {
    for (const c of changes) {
      // a pop-up that closed or hid is read fresh the next time it opens
      if (c.type === 'attributes' && c.target.matches && !c.target.matches(READ_SPOTS) && heard.has(c.target)) {
        heard.delete(c.target);
        if (c.target.tagName === 'DIALOG') stopReading();
      }
    }
    if (access.readAloud && !readTimer) readTimer = setTimeout(readNewLines, 350);
  }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['open', 'hidden'] });

  // Keyboard players hear each button as they Tab to it
  let usingKeys = false;
  addEventListener('keydown', e => { if (e.key === 'Tab' || e.key.startsWith('Arrow')) usingKeys = true; }, true);
  addEventListener('pointerdown', () => { usingKeys = false; }, true);
  addEventListener('focusin', e => {
    if (!access.readAloud || !usingKeys) return;
    const el = e.target;
    if (!el.matches('button, a, input, select, [tabindex]')) return;
    let label = el.getAttribute('aria-label') || el.innerText || el.value || el.title || '';
    if (el.matches('input[type="checkbox"]')) label = `${el.closest('label')?.innerText.split('\n')[0] || label}, ${tr2(el.checked ? 'on' : 'off')}`;
    say(label);
  });
}

// ---------- The ♿ button inside each game ----------
function openAccessPanel() {
  let dialog = document.getElementById('dlg-access');
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.id = 'dlg-access';
    dialog.className = 'panel';
    dialog.setAttribute('aria-labelledby', 'access-title');
    dialog.innerHTML = `<h2 id="access-title">♿ Accessibility</h2>
      <p>Make the game work for you. These settings apply to all three games.</p>
      <div class="access-list" data-in-game="1"></div>
      <p class="access-reload" hidden>⏱️ Extra time starts the next time you open a game.</p>
      <p class="access-note">Everything also works with just a keyboard: <kbd>Tab</kbd> to move, <kbd>Enter</kbd> to choose, <kbd>Esc</kbd> to close.</p>
      <button class="btn btn-primary close-btn">Done</button>`;
    fillAccessList(dialog.querySelector('.access-list'));
    dialog.querySelector('.close-btn').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
    document.body.appendChild(dialog);
  }
  dialog.showModal();
}

applyAccess();
addEventListener('DOMContentLoaded', () => {
  watchForReading();
  const mute = document.getElementById('btn-mute');
  if (mute && !document.getElementById('btn-access')) {
    const btn = document.createElement('button');
    btn.className = 'btn btn-small';
    btn.id = 'btn-access-game';
    btn.title = 'Accessibility';
    btn.setAttribute('aria-label', 'Accessibility settings');
    btn.textContent = '♿';
    btn.addEventListener('click', openAccessPanel);
    mute.after(btn);
  }
});
