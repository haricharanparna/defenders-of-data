// Accessibility settings, shared by every page. You change them from ♿ Accessibility on the title screen.
// - Extra time: every countdown (hacker attacks, quarantines, DMs, scam pop-ups, bonus bubbles) lasts twice as long
// - Bigger text: everything is drawn a bit larger
// - Calm mode: no flashing, shaking or bouncing animations
// Load this right after demo-mode.js, before the game scripts, so they can use TIME_SCALE.

const ACCESS_KEY = 'defenders-of-data-access';
const ACCESS_OPTIONS = [
  { id: 'extraTime', emoji: '⏱️', name: 'Extra time', text: 'Every timer lasts twice as long, so you can read and think at your own pace.' },
  { id: 'bigText', emoji: '🔤', name: 'Bigger text', text: 'Makes words and buttons larger and easier to read.' },
  { id: 'calm', emoji: '🌙', name: 'Calm mode', text: 'Turns off flashing, shaking and bouncing animations.' },
];

let access = { extraTime: false, bigText: false, calm: false };
try { access = { ...access, ...JSON.parse(localStorage.getItem(ACCESS_KEY)) }; } catch { /* storage blocked */ }

// Countdowns are multiplied by this. Read when a page loads, so a change applies to the next game you open.
const TIME_SCALE = access.extraTime ? 2 : 1;

// True when motion should be kept still: Calm mode, or the computer's own "reduce motion" setting.
// Checked when it's needed (not once on load), so switching Calm mode works right away.
const calmMotion = () => access.calm || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function applyAccess() {
  document.documentElement.classList.toggle('big-text', access.bigText);
  document.documentElement.classList.toggle('calm', access.calm);
}
applyAccess();

function setAccess(id, on) {
  access[id] = on;
  try { localStorage.setItem(ACCESS_KEY, JSON.stringify(access)); } catch { /* storage blocked */ }
  applyAccess();
}
