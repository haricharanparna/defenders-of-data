// Languages: English, or Spanish (Español) from the 🌐 button on the title screen. Your choice is saved in this browser,
// and a link with ?lang=es (or ?lang=en) picks it too.
// The game is written in English. In Spanish, every word that shows up on screen (page text, pop-ups, button labels,
// screen reader labels and words drawn on the game canvas) is swapped for its translation from ES_TEXT in lang-es.js.
// - Numbers don't need their own lines: "Wave 3" uses the line for "Wave #".
// - A line with {} fills in other words: "{} used {}!" matches "Phisher used Bait Link!", translating each part too.
// - Anything inside translate="no" stays as it is (like fake scam links and save codes).
// - langMissing() in the browser console lists any line still showing in English.
// Load this after access.js and lang-es.js, before the game scripts.

const LANG_KEY = 'defenders-of-data-lang';
var LANG = 'en';
try {
  const asked = new URLSearchParams(location.search).get('lang');
  if (asked === 'es' || asked === 'en') localStorage.setItem(LANG_KEY, asked);
  LANG = localStorage.getItem(LANG_KEY) === 'es' ? 'es' : 'en';
} catch { /* storage blocked */ }
// A How to Play video can't read storage (demo-mode.js), so it uses the language of the page it plays in
if (typeof DEMO_MODE !== 'undefined' && DEMO_MODE) {
  try { LANG = window.parent.LANG || 'en'; } catch { /* not inside the game */ }
}

function setLanguage(lang) {
  try { localStorage.setItem(LANG_KEY, lang); } catch { /* storage blocked */ }
  location.reload();
}

const NUMBER = /\d+(?:[.,]\d+)*/g;
const LETTER = /\p{L}/u;
const SLOT = '\u0001';           // stands for "any number" inside a line
const translated = new Map();   // English line with its numbers as SLOT → { es, slots } (Spanish line, numbers as SLOT)
const shouted = new Map();      // the same lines in CAPITALS, for titles drawn in capitals
const patterns = [];            // lines with {}: { test, to }
const remembered = new Map();   // every line already looked up, so the game doesn't redo the work every frame
const missing = new Set();      // lines with no translation yet (see them with ?lang-check)
const outputs = new Set();      // Spanish lines already on screen, so they aren't looked up again

if (LANG === 'es' && typeof ES_TEXT !== 'undefined') {
  for (const [en, es] of Object.entries(ES_TEXT)) {
    if (en.includes('{}')) {
      const escaped = en.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\{\}/g, '(.*?)');
      patterns.push({ test: new RegExp(`^${escaped}$`, 's'), to: es });
    } else {
      // The numbers only become slots when the Spanish has the same ones, in the same order
      const same = (en.match(NUMBER) || []).join() === (es.match(NUMBER) || []).join();
      translated.set(en.replace(NUMBER, SLOT), same ? es.replace(NUMBER, SLOT) : es);
      shouted.set(en.toUpperCase(), es.toUpperCase());
    }
  }
}

// The Spanish for one line of text (or the same text when there's no translation)
function tr(text) {
  if (LANG !== 'es' || typeof text !== 'string' || !LETTER.test(text)) return text;
  if (remembered.has(text)) return remembered.get(text);
  if (outputs.has(text)) return text;
  const lead = text.match(/^\s*/)[0];
  const trail = text.match(/\s*$/)[0];
  const core = text.trim().replace(/\s+/g, ' ');
  const found = lookup(core);
  if (found === null) missing.add(core);
  const result = found === null ? text : lead + found + trail;
  if (remembered.size > 5000) remembered.clear();
  remembered.set(text, result);
  outputs.add(result);
  return result;
}

function lookup(core, tryDots = true) {
  const numbers = core.match(NUMBER) || [];
  const hit = translated.get(core.replace(NUMBER, SLOT));
  if (hit !== undefined) {
    let i = 0;
    return hit.replace(/\u0001/g, () => numbers[i++] ?? '');
  }
  if (shouted.has(core)) return shouted.get(core);
  for (const { test, to } of patterns) {
    const m = core.match(test);
    if (m) {
      let i = 1;
      return to.replace(/\{\}/g, () => tr(m[i++]));
    }
  }
  // An emoji or symbol in front ("🎣 Phishers") or punctuation behind: translate the words in between
  const [, front, middle, back] = core.match(/^([^\p{L}\p{N}]*)(.*?)([^\p{L}\p{N}]*)$/u);
  for (const [a, words, b] of [[front, core.slice(front.length), ''], [front, middle, back], ['', core.slice(0, core.length - back.length), back]]) {
    if ((a || b) && words) {
      const inner = lookup(words, tryDots);
      if (inner !== null) return a + inner + b;
    }
  }
  // The same line with or without its last period ("Answer a question to buy it")
  if (!tryDots) return null;
  if (core.endsWith('.')) {
    const noDot = lookup(core.slice(0, -1), false);
    if (noDot !== null) return `${noDot}.`;
  } else if (!/[.!?]$/.test(core)) {
    const withDot = lookup(`${core}.`, false);
    if (withDot !== null) return withDot.replace(/\.$/, '');
  }
  return null;
}

// ---------- Swapping the words on the page ----------
if (LANG === 'es') {
  document.documentElement.lang = 'es';
  const ATTRS = ['title', 'aria-label', 'placeholder', 'alt', 'data-tip'];
  const skip = el => el && el.closest && el.closest('[translate="no"], script, style, code');

  const doText = node => {
    if (skip(node.parentElement)) return;
    const es = tr(node.data);
    if (es !== node.data) node.data = es;
  };
  const doAttrs = el => {
    if (skip(el)) return;
    for (const a of ATTRS) {
      const v = el.getAttribute(a);
      if (v) {
        const es = tr(v);
        if (es !== v) el.setAttribute(a, es);
      }
    }
  };
  const doTree = root => {
    if (root.nodeType === Node.TEXT_NODE) return doText(root);
    if (root.nodeType !== Node.ELEMENT_NODE) return;
    doAttrs(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (n.nodeType === Node.TEXT_NODE) doText(n); else doAttrs(n);
    }
  };

  // The tab title (games change it as you play)
  const doTitle = () => { if (tr(document.title) !== document.title) document.title = tr(document.title); };
  doTitle();
  new MutationObserver(doTitle).observe(document.head, { childList: true, subtree: true, characterData: true });
  doTree(document.body);
  new MutationObserver(changes => {
    for (const c of changes) {
      if (c.type === 'childList') c.addedNodes.forEach(doTree);
      else if (c.type === 'characterData') doText(c.target);
      else doAttrs(c.target);
    }
  }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });

  // Words drawn on the game canvas
  const ctx = CanvasRenderingContext2D.prototype;
  for (const name of ['fillText', 'strokeText', 'measureText']) {
    const original = ctx[name];
    ctx[name] = function (text, ...rest) { return original.call(this, tr(String(text)), ...rest); };
  }
  const ask = window.confirm;
  window.confirm = message => ask.call(window, tr(message));

  // langMissing() in the console lists every line still in English
  window.langMissing = () => [...missing];
}
