// Your coder: a little avatar you dress up with cosmetics bought with the stars you earn in Levels mode.
// Shared by the menu (the Coder Locker in locker.js) and the game (HUD and Level Cleared screen).

const CODER_KEY = 'defenders-of-data-coder';
const STAR_SAVE_KEY = 'defenders-of-data-stars';

// The parts of a coder you can change, in the order the Locker shows them
const SLOTS = [
  { id: 'hoodie', name: 'Hoodie' },
  { id: 'hair', name: 'Hair' },
  { id: 'hairColor', name: 'Hair color' },
  { id: 'skin', name: 'Skin' },
  { id: 'hat', name: 'Headwear' },
  { id: 'glasses', name: 'Eyewear' },
  { id: 'laptop', name: 'Laptop' },
  { id: 'bg', name: 'Background' },
  { id: 'pet', name: 'Sidekick' },
];

// Price is in stars. 0 = free for everyone. Rarity just changes the card's border color.
const COSMETICS = [
  // Hoodies
  { id: 'hoodie-blue', slot: 'hoodie', name: 'Classic Blue', price: 0, color: '#2f6fe0' },
  { id: 'hoodie-red', slot: 'hoodie', name: 'Firewall Red', price: 5, color: '#e0393e' },
  { id: 'hoodie-green', slot: 'hoodie', name: 'Terminal Green', price: 5, color: '#20a95a' },
  { id: 'hoodie-purple', slot: 'hoodie', name: 'Encryption Purple', price: 8, color: '#8a4ce0' },
  { id: 'hoodie-pink', slot: 'hoodie', name: 'Hot Pink', price: 8, color: '#ff3d8b' },
  { id: 'hoodie-black', slot: 'hoodie', name: 'Midnight Black', price: 15, color: '#1c1f2b' },
  { id: 'hoodie-white', slot: 'hoodie', name: 'Clean Code White', price: 15, color: '#e9edf5' },
  { id: 'hoodie-rainbow', slot: 'hoodie', name: 'Rainbow Hoodie', price: 60, color: 'rainbow', rarity: 'epic' },
  { id: 'hoodie-gold', slot: 'hoodie', name: 'Golden Hoodie', price: 150, color: 'gold', rarity: 'legendary' },

  // Hair styles
  { id: 'hair-short', slot: 'hair', name: 'Short', price: 0 },
  { id: 'hair-long', slot: 'hair', name: 'Long', price: 0 },
  { id: 'hair-buzz', slot: 'hair', name: 'Buzz Cut', price: 0 },
  { id: 'hair-bun', slot: 'hair', name: 'Bun', price: 6 },
  { id: 'hair-curly', slot: 'hair', name: 'Curly', price: 6 },
  { id: 'hair-spiky', slot: 'hair', name: 'Spiky', price: 10 },
  { id: 'hair-pigtails', slot: 'hair', name: 'Pigtails', price: 10 },
  { id: 'hair-mohawk', slot: 'hair', name: 'Mohawk', price: 25, rarity: 'rare' },

  // Hair colors
  { id: 'hc-black', slot: 'hairColor', name: 'Black', price: 0, color: '#1d1b22' },
  { id: 'hc-brown', slot: 'hairColor', name: 'Brown', price: 0, color: '#5a3622' },
  { id: 'hc-blonde', slot: 'hairColor', name: 'Blonde', price: 0, color: '#e8c06a' },
  { id: 'hc-red', slot: 'hairColor', name: 'Red', price: 0, color: '#b2442a' },
  { id: 'hc-blue', slot: 'hairColor', name: 'Electric Blue', price: 5, color: '#2ee6ff' },
  { id: 'hc-pink', slot: 'hairColor', name: 'Bubblegum', price: 5, color: '#ff7ac0' },
  { id: 'hc-purple', slot: 'hairColor', name: 'Violet', price: 5, color: '#9b5cff' },
  { id: 'hc-green', slot: 'hairColor', name: 'Matrix Green', price: 12, color: '#3dff7a' },
  { id: 'hc-silver', slot: 'hairColor', name: 'Silver', price: 12, color: '#c9d2e3' },

  // Skin tones (always free)
  { id: 'skin-1', slot: 'skin', name: 'Tone 1', price: 0, color: '#ffdbc0' },
  { id: 'skin-2', slot: 'skin', name: 'Tone 2', price: 0, color: '#f1c09b' },
  { id: 'skin-3', slot: 'skin', name: 'Tone 3', price: 0, color: '#d39b72' },
  { id: 'skin-4', slot: 'skin', name: 'Tone 4', price: 0, color: '#a86e4a' },
  { id: 'skin-5', slot: 'skin', name: 'Tone 5', price: 0, color: '#6e4630' },

  // Headwear
  { id: 'hat-none', slot: 'hat', name: 'Nothing', price: 0 },
  { id: 'hat-beanie', slot: 'hat', name: 'Beanie', price: 8 },
  { id: 'hat-cap', slot: 'hat', name: 'Cap', price: 8 },
  { id: 'hat-headphones', slot: 'hat', name: 'Headphones', price: 15 },
  { id: 'hat-catears', slot: 'hat', name: 'Cat Ears', price: 20 },
  { id: 'hat-hood', slot: 'hat', name: 'Hood Up', price: 25, rarity: 'rare' },
  { id: 'hat-crown', slot: 'hat', name: 'Crown', price: 120, rarity: 'legendary' },

  // Eyewear
  { id: 'glasses-none', slot: 'glasses', name: 'Nothing', price: 0 },
  { id: 'glasses-round', slot: 'glasses', name: 'Round Glasses', price: 5 },
  { id: 'glasses-square', slot: 'glasses', name: 'Square Glasses', price: 5 },
  { id: 'glasses-shades', slot: 'glasses', name: 'Sunglasses', price: 15 },
  { id: 'glasses-pixel', slot: 'glasses', name: 'Pixel Shades', price: 30, rarity: 'rare' },
  { id: 'glasses-visor', slot: 'glasses', name: 'Cyber Visor', price: 50, rarity: 'epic' },

  // Laptops
  { id: 'laptop-silver', slot: 'laptop', name: 'Silver', price: 0, color: '#b9c3d6' },
  { id: 'laptop-black', slot: 'laptop', name: 'Stealth Black', price: 6, color: '#2a2e3d' },
  { id: 'laptop-stickers', slot: 'laptop', name: 'Sticker Bomb', price: 15, color: '#b9c3d6', stickers: true },
  { id: 'laptop-neon', slot: 'laptop', name: 'Neon Rig', price: 35, color: '#121733', neon: true, rarity: 'rare' },
  { id: 'laptop-gold', slot: 'laptop', name: 'Gold Laptop', price: 100, color: 'gold', rarity: 'legendary' },

  // Backgrounds
  { id: 'bg-navy', slot: 'bg', name: 'Night Shift', price: 0, color: '#16204d' },
  { id: 'bg-teal', slot: 'bg', name: 'Teal', price: 4, color: '#0f5a63' },
  { id: 'bg-purple', slot: 'bg', name: 'Grape', price: 4, color: '#3c2066' },
  { id: 'bg-sunset', slot: 'bg', name: 'Sunset', price: 20, pattern: 'sunset' },
  { id: 'bg-circuit', slot: 'bg', name: 'Circuit Board', price: 30, pattern: 'circuit', rarity: 'rare' },
  { id: 'bg-matrix', slot: 'bg', name: 'Code Rain', price: 45, pattern: 'matrix', rarity: 'epic' },
  { id: 'bg-galaxy', slot: 'bg', name: 'Galaxy', price: 80, pattern: 'galaxy', rarity: 'epic' },

  // Sidekicks
  { id: 'pet-none', slot: 'pet', name: 'Nobody', price: 0 },
  { id: 'pet-duck', slot: 'pet', name: 'Rubber Duck', price: 10, emoji: '🦆', note: 'Coders explain bugs to a rubber duck. It really works!' },
  { id: 'pet-cat', slot: 'pet', name: 'Keyboard Cat', price: 20, emoji: '🐱' },
  { id: 'pet-robot', slot: 'pet', name: 'Robo Buddy', price: 35, emoji: '🤖', rarity: 'rare' },
  { id: 'pet-owl', slot: 'pet', name: 'Night Owl', price: 50, emoji: '🦉', rarity: 'epic' },
  { id: 'pet-dragon', slot: 'pet', name: 'Data Dragon', price: 200, emoji: '🐉', rarity: 'legendary' },
];

const cosmetic = id => COSMETICS.find(item => item.id === id);

const DEFAULT_LOOK = {
  hoodie: 'hoodie-blue', hair: 'hair-short', hairColor: 'hc-brown', skin: 'skin-2',
  hat: 'hat-none', glasses: 'glasses-none', laptop: 'laptop-silver', bg: 'bg-navy', pet: 'pet-none',
};

// ---------- Saving ----------
function loadCoder() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(CODER_KEY)) || {}; } catch { /* storage blocked */ }
  const look = { ...DEFAULT_LOOK, ...saved.look };
  // Ignore anything that no longer exists
  for (const slot of Object.keys(look)) if (!cosmetic(look[slot])) look[slot] = DEFAULT_LOOK[slot];
  return { look, owned: saved.owned || [], spent: saved.spent || 0 };
}

let coder = loadCoder();

function saveCoder() {
  try { localStorage.setItem(CODER_KEY, JSON.stringify(coder)); } catch { /* storage blocked */ }
}

const ownsCosmetic = item => item.price === 0 || coder.owned.includes(item.id);

// Stars come from your best result on each level, so they only ever go up
function earnedStars() {
  let stars = {};
  try { stars = JSON.parse(localStorage.getItem(STAR_SAVE_KEY)) || {}; } catch { /* storage blocked */ }
  return Object.values(stars).reduce((a, b) => a + b, 0);
}
const starsToSpend = () => Math.max(0, earnedStars() - coder.spent);

function buyCosmetic(item) {
  if (ownsCosmetic(item) || starsToSpend() < item.price) return false;
  coder.owned.push(item.id);
  coder.spent += item.price;
  coder.look[item.slot] = item.id;
  saveCoder();
  return true;
}

function equipCosmetic(item) {
  if (!ownsCosmetic(item)) return;
  coder.look[item.slot] = item.id;
  saveCoder();
}

// ---------- Drawing ----------
// Returns an SVG string. Each drawing gets its own id prefix so gradients don't clash on one page.
let avatarCount = 0;

function avatarSvg(look = coder.look) {
  const n = `av${avatarCount++}`;
  const get = slot => cosmetic(look[slot]) || cosmetic(DEFAULT_LOOK[slot]);
  const hoodie = get('hoodie'), hair = get('hair').id, hairColor = get('hairColor').color;
  const skin = get('skin').color, hat = get('hat').id, glasses = get('glasses').id;
  const laptop = get('laptop'), bg = get('bg'), pet = get('pet');

  const defs = `
    <linearGradient id="${n}-rainbow" x1="0" x2="1"><stop offset="0" stop-color="#ff4d6d"/><stop offset=".25" stop-color="#ffb84d"/><stop offset=".5" stop-color="#5ee07a"/><stop offset=".75" stop-color="#4db8ff"/><stop offset="1" stop-color="#a66bff"/></linearGradient>
    <linearGradient id="${n}-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1a8"/><stop offset=".5" stop-color="#ffd23f"/><stop offset="1" stop-color="#c8920a"/></linearGradient>
    <linearGradient id="${n}-sunset" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7a59"/><stop offset=".55" stop-color="#d9467a"/><stop offset="1" stop-color="#4b2a7a"/></linearGradient>
    <radialGradient id="${n}-galaxy" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#6b3fb8"/><stop offset=".5" stop-color="#241a5c"/><stop offset="1" stop-color="#090b24"/></radialGradient>
    <clipPath id="${n}-clip"><rect width="120" height="120" rx="18"/></clipPath>`;
  const paint = color => color === 'rainbow' ? `url(#${n}-rainbow)` : color === 'gold' ? `url(#${n}-gold)` : color;

  // Background
  let back = '';
  if (bg.pattern === 'sunset') {
    back = `<rect width="120" height="120" fill="url(#${n}-sunset)"/><circle cx="60" cy="78" r="26" fill="#ffd23f" opacity=".55"/>`;
  } else if (bg.pattern === 'galaxy') {
    const stars = [[14, 18], [30, 40], [96, 14], [104, 46], [20, 70], [88, 30], [70, 10], [10, 96], [108, 84], [44, 12]];
    back = `<rect width="120" height="120" fill="url(#${n}-galaxy)"/>` +
      stars.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 3 ? 1 : 1.8}" fill="#fff" opacity="${i % 2 ? 0.6 : 1}"/>`).join('');
  } else if (bg.pattern === 'matrix') {
    back = `<rect width="120" height="120" fill="#03140a"/>` +
      [6, 18, 30, 90, 102, 114].map((x, i) => `<text x="${x}" y="${4 + (i * 17) % 26}" font-family="monospace" font-size="9" fill="#3dff7a" opacity=".7" writing-mode="tb">${['1010', '0110', '1101', '0011', '1001', '0101'][i]}</text>`).join('');
  } else if (bg.pattern === 'circuit') {
    back = `<rect width="120" height="120" fill="#0b2a2a"/><g fill="none" stroke="#2ee6ff" stroke-width="1.5" opacity=".55">
      <path d="M0 20 H22 V40 H34"/><path d="M120 24 H96 V8"/><path d="M0 70 H14 V56"/><path d="M120 66 H104 V86 H92"/><path d="M28 0 V12 H48"/></g>
      <g fill="#2ee6ff" opacity=".8"><circle cx="34" cy="40" r="2.5"/><circle cx="96" cy="8" r="2.5"/><circle cx="14" cy="56" r="2.5"/><circle cx="92" cy="86" r="2.5"/><circle cx="48" cy="12" r="2.5"/></g>`;
  } else {
    back = `<rect width="120" height="120" fill="${bg.color}"/><circle cx="60" cy="56" r="40" fill="#fff" opacity=".06"/>`;
  }

  // Hair that sits behind the head
  let hairBack = '';
  if (hair === 'hair-long') hairBack = `<path d="M34 50 C34 24 86 24 86 50 L89 90 L31 90 Z" fill="${hairColor}"/>`;
  if (hair === 'hair-curly') hairBack = `<circle cx="60" cy="44" r="30" fill="${hairColor}"/><circle cx="34" cy="58" r="9" fill="${hairColor}"/><circle cx="86" cy="58" r="9" fill="${hairColor}"/>`;
  if (hair === 'hair-pigtails') hairBack = `<circle cx="31" cy="56" r="9" fill="${hairColor}"/><circle cx="89" cy="56" r="9" fill="${hairColor}"/>`;
  if (hair === 'hair-bun') hairBack = `<circle cx="60" cy="24" r="9" fill="${hairColor}"/>`;

  if (hat === 'hat-hood') hairBack = ''; // the hood covers it

  // Hood up goes behind the head too
  const hoodBack = hat === 'hat-hood' ? `<path d="M28 64 C26 18 94 18 92 64 L90 86 L30 86 Z" fill="${paint(hoodie.color)}"/><path d="M28 64 C26 18 94 18 92 64 L90 86 L30 86 Z" fill="#000" opacity=".15"/>` : '';

  const body = `
    <path d="M18 122 C18 94 36 84 60 84 C84 84 102 94 102 122 Z" fill="${paint(hoodie.color)}"/>
    <path d="M44 86 C50 96 70 96 76 86" fill="none" stroke="#000" stroke-opacity=".2" stroke-width="3"/>
    <line x1="53" y1="92" x2="52" y2="104" stroke="#fff" stroke-opacity=".7" stroke-width="2" stroke-linecap="round"/>
    <line x1="67" y1="92" x2="68" y2="104" stroke="#fff" stroke-opacity=".7" stroke-width="2" stroke-linecap="round"/>
    <rect x="53" y="70" width="14" height="16" rx="4" fill="${skin}"/>`;

  const head = `
    <circle cx="36" cy="56" r="5" fill="${skin}"/><circle cx="84" cy="56" r="5" fill="${skin}"/>
    <ellipse cx="60" cy="52" rx="24" ry="25" fill="${skin}"/>
    <circle cx="51" cy="55" r="2.8" fill="#1d1b22"/><circle cx="69" cy="55" r="2.8" fill="#1d1b22"/>
    <circle cx="52" cy="54" r=".9" fill="#fff"/><circle cx="70" cy="54" r=".9" fill="#fff"/>
    <circle cx="45" cy="63" r="3.5" fill="#ff7a8a" opacity=".35"/><circle cx="75" cy="63" r="3.5" fill="#ff7a8a" opacity=".35"/>
    <path d="M53 65 Q60 71 67 65" fill="none" stroke="#1d1b22" stroke-width="2.2" stroke-linecap="round"/>`;

  // Hair on top of the head
  const fringe = `<path d="M36 50 C35 28 50 25 60 25 C72 25 86 29 84 50 C79 40 70 36 60 37 C50 37 41 42 36 50 Z" fill="${hairColor}"/>`;
  const hairFront = {
    'hair-short': fringe,
    'hair-long': fringe,
    'hair-bun': fringe,
    'hair-pigtails': fringe,
    'hair-curly': `<circle cx="44" cy="34" r="8" fill="${hairColor}"/><circle cx="56" cy="29" r="8" fill="${hairColor}"/><circle cx="68" cy="30" r="8" fill="${hairColor}"/><circle cx="78" cy="37" r="7" fill="${hairColor}"/>`,
    'hair-buzz': `<path d="M37 46 C37 30 50 27 60 27 C70 27 83 30 83 46 C76 38 44 38 37 46 Z" fill="${hairColor}" opacity=".85"/>`,
    'hair-spiky': `<path d="M36 50 L37 34 L44 38 L46 24 L53 33 L59 20 L65 32 L72 23 L75 36 L83 31 L84 50 C76 40 44 40 36 50 Z" fill="${hairColor}"/>`,
    'hair-mohawk': `<path d="M53 20 L67 20 L66 44 L54 44 Z" fill="${hairColor}"/><path d="M38 46 C38 34 44 30 54 29 L54 40 C46 40 40 43 38 46 Z M82 46 C82 34 76 30 66 29 L66 40 C74 40 80 43 82 46 Z" fill="${hairColor}" opacity=".35"/>`,
  }[hair] || '';

  const eyewear = {
    'glasses-round': `<g fill="none" stroke="#1d1b22" stroke-width="2"><circle cx="51" cy="55" r="7"/><circle cx="69" cy="55" r="7"/><path d="M58 55 H62 M44 54 L37 52 M76 54 L83 52"/></g>`,
    'glasses-square': `<g fill="#fff" fill-opacity=".15" stroke="#1d1b22" stroke-width="2.4"><rect x="43" y="49" width="15" height="11" rx="2"/><rect x="62" y="49" width="15" height="11" rx="2"/><path d="M58 54 H62 M43 53 L37 51 M77 53 L83 51" fill="none"/></g>`,
    'glasses-shades': `<g fill="#14161f" stroke="#14161f" stroke-width="2"><path d="M42 50 H58 V56 C58 61 54 62 50 62 C45 62 42 59 42 55 Z"/><path d="M62 50 H78 V55 C78 59 75 62 70 62 C66 62 62 61 62 56 Z"/><path d="M58 52 H62 M42 51 L37 50 M78 51 L83 50" fill="none"/></g><path d="M45 52 L49 52" stroke="#fff" stroke-opacity=".5" stroke-width="1.5"/>`,
    'glasses-pixel': `<g fill="#0a0a0a"><rect x="40" y="50" width="40" height="4"/><rect x="42" y="54" width="14" height="4"/><rect x="64" y="54" width="14" height="4"/><rect x="44" y="58" width="10" height="3"/><rect x="66" y="58" width="10" height="3"/></g><g fill="#fff"><rect x="44" y="54" width="3" height="3"/><rect x="66" y="54" width="3" height="3"/></g>`,
    'glasses-visor': `<rect x="36" y="47" width="48" height="14" rx="7" fill="#2ee6ff" opacity=".75"/><rect x="36" y="47" width="48" height="14" rx="7" fill="none" stroke="#bff8ff" stroke-width="1.5"/><path d="M42 51 H60" stroke="#fff" stroke-opacity=".7" stroke-width="2" stroke-linecap="round"/>`,
  }[glasses] || '';

  const headwear = {
    'hat-beanie': `<path d="M35 46 C35 20 85 20 85 46 Z" fill="${paint(hoodie.color)}"/><path d="M35 46 C35 20 85 20 85 46 Z" fill="#000" opacity=".12"/><rect x="33" y="40" width="54" height="10" rx="4" fill="${paint(hoodie.color)}"/><circle cx="60" cy="20" r="6" fill="#fff"/>`,
    'hat-cap': `<path d="M36 44 C36 22 84 22 84 44 Z" fill="#e0393e"/><path d="M80 42 C92 40 102 42 104 46 C96 47 88 46 80 46 Z" fill="#b22a2f"/><circle cx="60" cy="24" r="2.5" fill="#b22a2f"/><text x="60" y="40" font-family="monospace" font-weight="bold" font-size="10" text-anchor="middle" fill="#fff">&lt;/&gt;</text>`,
    'hat-headphones': `<path d="M34 54 C32 18 88 18 86 54" fill="none" stroke="#2a2e3d" stroke-width="5"/><rect x="28" y="46" width="10" height="18" rx="4" fill="#ff3d8b"/><rect x="82" y="46" width="10" height="18" rx="4" fill="#ff3d8b"/>`,
    'hat-catears': `<path d="M38 40 L38 18 L54 30 Z" fill="${hairColor}"/><path d="M82 40 L82 18 L66 30 Z" fill="${hairColor}"/><path d="M41 34 L41 24 L49 30 Z" fill="#ff9ec4"/><path d="M79 34 L79 24 L71 30 Z" fill="#ff9ec4"/>`,
    'hat-hood': `<path d="M30 66 C30 30 90 30 90 66 C88 40 74 30 60 30 C46 30 32 40 30 66 Z" fill="${paint(hoodie.color)}"/>`,
    'hat-crown': `<path d="M40 36 L40 16 L49 25 L60 12 L71 25 L80 16 L80 36 Z" fill="url(#${n}-gold)" stroke="#c8920a" stroke-width="1.5"/><circle cx="60" cy="28" r="3" fill="#ff3d8b"/><circle cx="48" cy="31" r="2" fill="#2ee6ff"/><circle cx="72" cy="31" r="2" fill="#2ee6ff"/>`,
  }[hat] || '';

  // Laptop in front, lid facing us
  const lid = paint(laptop.color);
  const laptopSvg = `
    ${laptop.neon ? `<rect x="27" y="89" width="66" height="34" rx="5" fill="#2ee6ff" opacity=".35"/>` : ''}
    <rect x="30" y="92" width="60" height="30" rx="4" fill="${lid}" ${laptop.neon ? 'stroke="#2ee6ff" stroke-width="2"' : ''}/>
    <path d="M60 100 L68 103 V108 C68 112 64 115 60 116 C56 115 52 112 52 108 V103 Z" fill="${laptop.neon ? '#2ee6ff' : '#fff'}" opacity="${laptop.neon ? 1 : 0.55}"/>
    ${laptop.stickers ? `<circle cx="38" cy="100" r="4" fill="#ff3d8b"/><rect x="74" y="97" width="10" height="7" rx="2" fill="#ffd23f"/><circle cx="80" cy="113" r="4" fill="#20a95a"/><path d="M36 110 l3 6 l3 -6 z" fill="#8a4ce0"/>` : ''}`;

  const sidekick = pet.emoji ? `<text x="102" y="113" font-size="19" text-anchor="middle">${pet.emoji}</text>` : '';

  return `<svg class="avatar-svg" viewBox="0 0 120 120" role="img" aria-label="Your coder"><defs>${defs}</defs><g clip-path="url(#${n}-clip)">
    ${back}${hoodBack}${hairBack}${body}${head}${hairFront}${eyewear}${headwear}${laptopSvg}${sidekick}</g></svg>`;
}
