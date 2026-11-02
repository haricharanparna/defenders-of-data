// Your coder: a little avatar you dress up with cosmetics bought with the stars you earn in Levels mode.
// Shared by the menu (the Coder Locker in locker.js) and the game (HUD and Level Cleared screen).

const CODER_KEY = 'defenders-of-data-coder';
const STAR_SAVE_KEY = 'defenders-of-data-stars';

// The parts of a coder you can change, in the order the Locker shows them
// (The "hoodie" slot is the outfit's main color; it kept its old name so saved coders still load.)
const SLOTS = [
  { id: 'outfit', name: 'Outfit' },
  { id: 'hoodie', name: 'Outfit color' },
  { id: 'hair', name: 'Hair' },
  { id: 'hairColor', name: 'Hair color' },
  { id: 'skin', name: 'Skin' },
  { id: 'face', name: 'Face' },
  { id: 'hat', name: 'Headwear' },
  { id: 'glasses', name: 'Eyewear' },
  { id: 'neck', name: 'Neckwear' },
  { id: 'laptop', name: 'Laptop' },
  { id: 'bg', name: 'Background' },
  { id: 'pet', name: 'Sidekick' },
];

// Price is in stars. 0 = free for everyone. Rarity just changes the card's border color.
// event: 'halloween' items also show up in the Locker's Halloween tab.
const COSMETICS = [
  // Outfits: each one is drawn differently. Most use your outfit color somewhere.
  { id: 'outfit-hoodie', slot: 'outfit', name: 'Hoodie', price: 0 },
  { id: 'outfit-tshirt', slot: 'outfit', name: 'Logo Tee', price: 0 },
  { id: 'outfit-varsity', slot: 'outfit', name: 'Varsity Jacket', price: 15 },
  { id: 'outfit-leather', slot: 'outfit', name: 'Leather Jacket', price: 20 },
  { id: 'outfit-labcoat', slot: 'outfit', name: 'Lab Coat', price: 20 },
  { id: 'outfit-suit', slot: 'outfit', name: 'Suit & Tie', price: 30, rarity: 'rare' },
  { id: 'outfit-trench', slot: 'outfit', name: 'Detective Trench', price: 35, rarity: 'rare' },
  { id: 'outfit-space', slot: 'outfit', name: 'Space Suit', price: 60, rarity: 'epic' },
  { id: 'outfit-armor', slot: 'outfit', name: 'Knight Armor', price: 70, rarity: 'epic' },
  { id: 'outfit-hero', slot: 'outfit', name: 'Superhero Suit', price: 120, rarity: 'legendary' },
  { id: 'outfit-hacker', slot: 'outfit', name: 'Hacker', price: 150, rarity: 'legendary', note: 'The most expensive outfit in the game! A glowing hacker hoodie for an ethical hacker who uses their skills to protect people.' },
  { id: 'outfit-skeleton', slot: 'outfit', name: 'Skeleton Suit', price: 20, event: 'halloween' },
  { id: 'outfit-mummy', slot: 'outfit', name: 'Mummy Wraps', price: 25, event: 'halloween' },
  { id: 'outfit-pumpkin', slot: 'outfit', name: 'Pumpkin Costume', price: 25, event: 'halloween' },
  { id: 'outfit-witch', slot: 'outfit', name: 'Witch Robe', price: 30, rarity: 'rare', event: 'halloween' },
  { id: 'outfit-vampire', slot: 'outfit', name: 'Vampire Cape', price: 60, rarity: 'epic', event: 'halloween' },

  // Face
  { id: 'face-none', slot: 'face', name: 'Nothing', price: 0 },
  { id: 'face-freckles', slot: 'face', name: 'Freckles', price: 5 },
  { id: 'face-star', slot: 'face', name: 'Star Sticker', price: 8 },
  { id: 'face-bandaid', slot: 'face', name: 'Bandage', price: 8 },
  { id: 'face-fangs', slot: 'face', name: 'Vampire Fangs', price: 15, event: 'halloween' },
  { id: 'face-stitches', slot: 'face', name: 'Monster Stitches', price: 15, event: 'halloween' },
  { id: 'face-skull', slot: 'face', name: 'Skull Face Paint', price: 30, rarity: 'rare', event: 'halloween' },

  // Neckwear
  { id: 'neck-none', slot: 'neck', name: 'Nothing', price: 0 },
  { id: 'neck-bowtie', slot: 'neck', name: 'Bow Tie', price: 10 },
  { id: 'neck-scarf', slot: 'neck', name: 'Cozy Scarf', price: 12 },
  { id: 'neck-lanyard', slot: 'neck', name: 'Security Badge', price: 15 },
  { id: 'neck-chain', slot: 'neck', name: 'Gold Chain', price: 45, rarity: 'epic' },
  { id: 'neck-bolts', slot: 'neck', name: 'Monster Bolts', price: 15, event: 'halloween' },

  // Outfit colors
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
  { id: 'skin-zombie', slot: 'skin', name: 'Zombie Green', price: 20, color: '#9ccf8a', event: 'halloween' },
  { id: 'skin-ghost', slot: 'skin', name: 'Ghostly Pale', price: 20, color: '#eef2fa', event: 'halloween' },

  // Headwear
  { id: 'hat-none', slot: 'hat', name: 'Nothing', price: 0 },
  { id: 'hat-beanie', slot: 'hat', name: 'Beanie', price: 8 },
  { id: 'hat-cap', slot: 'hat', name: 'Cap', price: 8 },
  { id: 'hat-headphones', slot: 'hat', name: 'Headphones', price: 15 },
  { id: 'hat-catears', slot: 'hat', name: 'Cat Ears', price: 20 },
  { id: 'hat-hood', slot: 'hat', name: 'Hood Up', price: 25, rarity: 'rare' },
  { id: 'hat-crown', slot: 'hat', name: 'Crown', price: 120, rarity: 'legendary' },
  { id: 'hat-horns', slot: 'hat', name: 'Devil Horns', price: 20, event: 'halloween' },
  { id: 'hat-witch', slot: 'hat', name: 'Witch Hat', price: 30, rarity: 'rare', event: 'halloween' },
  { id: 'hat-pumpkin', slot: 'hat', name: 'Pumpkin Head', price: 50, rarity: 'epic', event: 'halloween' },

  // Eyewear
  { id: 'glasses-none', slot: 'glasses', name: 'Nothing', price: 0 },
  { id: 'glasses-round', slot: 'glasses', name: 'Round Glasses', price: 5 },
  { id: 'glasses-square', slot: 'glasses', name: 'Square Glasses', price: 5 },
  { id: 'glasses-shades', slot: 'glasses', name: 'Sunglasses', price: 15 },
  { id: 'glasses-pixel', slot: 'glasses', name: 'Pixel Shades', price: 30, rarity: 'rare' },
  { id: 'glasses-visor', slot: 'glasses', name: 'Cyber Visor', price: 50, rarity: 'epic' },
  { id: 'glasses-mask', slot: 'glasses', name: 'Masquerade Mask', price: 20, event: 'halloween' },

  // Laptops
  { id: 'laptop-silver', slot: 'laptop', name: 'Silver', price: 0, color: '#b9c3d6' },
  { id: 'laptop-black', slot: 'laptop', name: 'Stealth Black', price: 6, color: '#2a2e3d' },
  { id: 'laptop-stickers', slot: 'laptop', name: 'Sticker Bomb', price: 15, color: '#b9c3d6', stickers: true },
  { id: 'laptop-neon', slot: 'laptop', name: 'Neon Rig', price: 35, color: '#121733', neon: true, rarity: 'rare' },
  { id: 'laptop-gold', slot: 'laptop', name: 'Gold Laptop', price: 100, color: 'gold', rarity: 'legendary' },
  { id: 'laptop-spooky', slot: 'laptop', name: 'Spooky Laptop', price: 25, color: '#1a1420', spooky: true, event: 'halloween' },
  { id: 'laptop-none', slot: 'laptop', name: 'No Laptop', price: 0, none: true },

  // Backgrounds
  { id: 'bg-navy', slot: 'bg', name: 'Night Shift', price: 0, color: '#16204d' },
  { id: 'bg-teal', slot: 'bg', name: 'Teal', price: 4, color: '#0f5a63' },
  { id: 'bg-purple', slot: 'bg', name: 'Grape', price: 4, color: '#3c2066' },
  { id: 'bg-sunset', slot: 'bg', name: 'Sunset', price: 20, pattern: 'sunset' },
  { id: 'bg-circuit', slot: 'bg', name: 'Circuit Board', price: 30, pattern: 'circuit', rarity: 'rare' },
  { id: 'bg-matrix', slot: 'bg', name: 'Code Rain', price: 45, pattern: 'matrix', rarity: 'epic' },
  { id: 'bg-galaxy', slot: 'bg', name: 'Galaxy', price: 80, pattern: 'galaxy', rarity: 'epic' },
  { id: 'bg-haunted', slot: 'bg', name: 'Haunted Night', price: 25, pattern: 'haunted', event: 'halloween' },
  { id: 'bg-patch', slot: 'bg', name: 'Pumpkin Patch', price: 30, pattern: 'patch', event: 'halloween' },
  { id: 'bg-graveyard', slot: 'bg', name: 'Graveyard', price: 40, pattern: 'graveyard', rarity: 'rare', event: 'halloween' },

  // Sidekicks
  { id: 'pet-none', slot: 'pet', name: 'Nobody', price: 0 },
  { id: 'pet-duck', slot: 'pet', name: 'Rubber Duck', price: 0, emoji: '🦆', note: 'Your starter sidekick! Coders explain bugs to a rubber duck. It really works!' },
  { id: 'pet-cat', slot: 'pet', name: 'Keyboard Cat', price: 20, emoji: '🐱' },
  { id: 'pet-robot', slot: 'pet', name: 'Robo Buddy', price: 35, emoji: '🤖', rarity: 'rare' },
  { id: 'pet-owl', slot: 'pet', name: 'Night Owl', price: 50, emoji: '🦉', rarity: 'epic' },
  { id: 'pet-dragon', slot: 'pet', name: 'Data Dragon', price: 200, emoji: '🐉', rarity: 'legendary' },
  { id: 'pet-ghost', slot: 'pet', name: 'Friendly Ghost', price: 15, emoji: '👻', event: 'halloween' },
  { id: 'pet-bat', slot: 'pet', name: 'Bat', price: 15, emoji: '🦇', event: 'halloween' },
  { id: 'pet-spider', slot: 'pet', name: 'Spider', price: 20, emoji: '🕷️', event: 'halloween' },
  { id: 'pet-blackcat', slot: 'pet', name: 'Black Cat', price: 25, emoji: '🐈‍⬛', event: 'halloween' },
  { id: 'pet-jack', slot: 'pet', name: 'Jack-o-Lantern', price: 35, emoji: '🎃', rarity: 'rare', event: 'halloween' },
];

const cosmetic = id => COSMETICS.find(item => item.id === id);

const DEFAULT_LOOK = {
  outfit: 'outfit-hoodie', face: 'face-none', neck: 'neck-none',
  hoodie: 'hoodie-blue', hair: 'hair-short', hairColor: 'hc-brown', skin: 'skin-2',
  hat: 'hat-none', glasses: 'glasses-none', laptop: 'laptop-silver', bg: 'bg-navy', pet: 'pet-duck',
};

// ---------- Saving ----------
function loadCoder() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(CODER_KEY)) || {}; } catch { /* storage blocked */ }
  const look = { ...DEFAULT_LOOK, ...saved.look };
  // Ignore anything that no longer exists
  for (const slot of Object.keys(look)) if (!cosmetic(look[slot])) look[slot] = DEFAULT_LOOK[slot];
  let owned = saved.owned || [];
  let spent = saved.spent || 0;
  // The rubber duck became everyone's free starter sidekick: give it to older coders too,
  // and refund the 10 stars if they had already bought it
  if (!saved.starterDuck) {
    if (look.pet === 'pet-none') look.pet = 'pet-duck';
    if (owned.includes('pet-duck')) {
      owned = owned.filter(id => id !== 'pet-duck');
      spent = Math.max(0, spent - 10);
    }
  }
  return { look, owned, spent, starterDuck: true, name: cleanName(saved.name) };
}

// ---------- Your coder's name ----------
// A nickname, never your real name: no email or password, and it never leaves this computer.
// New coders get a random fun name, like in Quizizz.
const NAME_MAX = 20;
const NAME_FIRST = ['Cyber', 'Pixel', 'Turbo', 'Secret', 'Mega', 'Neon', 'Stealth', 'Quantum', 'Firewall', 'Byte', 'Crypto', 'Glitch'];
const NAME_LAST = ['Panda', 'Fox', 'Ninja', 'Owl', 'Dragon', 'Tiger', 'Wizard', 'Falcon', 'Otter', 'Shark', 'Koala', 'Phoenix'];
// Letters, numbers, spaces, - and _ only
const cleanName = name => (typeof name === 'string' ? name : '').replace(/[^\p{L}\p{N} _-]/gu, '').replace(/\s+/g, ' ').slice(0, NAME_MAX).trim();
const nameFrom = list => list[Math.floor(Math.random() * list.length)];
const randomName = () => `${nameFrom(NAME_FIRST)} ${nameFrom(NAME_LAST)} ${Math.floor(Math.random() * 90) + 10}`;

let coder = loadCoder();

function saveCoder() {
  try { localStorage.setItem(CODER_KEY, JSON.stringify(coder)); } catch { /* storage blocked */ }
}

if (!coder.name) {
  coder.name = randomName();
  saveCoder();
}

function setCoderName(name) {
  coder.name = cleanName(name) || coder.name;
  saveCoder();
  showHudName();
  return coder.name;
}

// In the games, your name sits next to your coder in the top bar
function showHudName() {
  const hud = document.getElementById('hud-coder');
  if (!hud) return;
  let tag = document.getElementById('hud-name');
  if (!tag) {
    tag = document.createElement('span');
    tag.id = 'hud-name';
    tag.className = 'hud-name';
    hud.after(tag);
  }
  tag.textContent = coder.name;
}
showHudName();

const ownsCosmetic = item => item.price === 0 || coder.owned.includes(item.id);

// Stars come from your best result on each level in Tower Defense (up to 300),
// plus bonus stars from milestones in Data Clicker and Adventure, so they only ever go up
function earnedStars() {
  let stars = {};
  try { stars = JSON.parse(localStorage.getItem(STAR_SAVE_KEY)) || {}; } catch { /* storage blocked */ }
  return Object.values(stars).reduce((a, b) => a + b, 0) + Object.values(bonusStars).reduce((a, b) => a + b, 0);
}

// ---------- Bonus stars from Data Clicker and Adventure ----------
// Each milestone pays once ({ 'clicker-bytes-1000': 1, ... }), so they can't be farmed.
// About 25 stars in Clicker and 53 in Adventure: Tower Defense levels stay the main way to earn.
const BONUS_STARS_KEY = 'defenders-of-data-bonus-stars';
let bonusStars = {};
try { bonusStars = JSON.parse(localStorage.getItem(BONUS_STARS_KEY)) || {}; } catch { /* storage blocked */ }

function awardStars(id, stars, why) {
  if (bonusStars[id] || (typeof DEMO_MODE !== 'undefined' && DEMO_MODE)) return false;
  bonusStars[id] = stars;
  try { localStorage.setItem(BONUS_STARS_KEY, JSON.stringify(bonusStars)); } catch { /* storage blocked */ }
  showStarReward(stars, why);
  return true;
}

// A gold "+2 ★" pop-up at the top of the screen. It's a popover so it shows above open windows too.
const starQueue = [];
function showStarReward(stars, why) {
  starQueue.push({ stars, why });
  if (starQueue.length === 1) nextStarReward();
}
function nextStarReward() {
  const reward = starQueue[0];
  if (!reward) return;
  let box = document.getElementById('star-reward');
  if (!box) {
    box = document.createElement('div');
    box.id = 'star-reward';
    box.className = 'star-reward';
    box.popover = 'manual';
    box.setAttribute('role', 'status');
    document.body.appendChild(box);
  }
  box.innerHTML = `<span class="sr-star" aria-hidden="true">★</span><span class="sr-text"><strong>+${reward.stars} star${reward.stars > 1 ? 's' : ''}!</strong><small></small><small>Spend them in the Coder Locker</small></span>`;
  box.querySelector('small').textContent = reward.why;
  if (box.matches(':popover-open')) box.hidePopover();
  box.showPopover();
  if (typeof playSound === 'function') playSound('badge');
  setTimeout(() => {
    box.hidePopover();
    starQueue.shift();
    setTimeout(nextStarReward, 300);
  }, 3200);
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

// Blend two #rrggbb colors: t = 0 gives a, t = 1 gives b. Used for shadows and highlights.
function mix(a, b, t) {
  const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  const [x, y] = [rgb(a), rgb(b)];
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

// bare: leave out the background (the Locker's item tiles put their rarity color behind the coder)
// full: the whole coder standing, head to shoes, with the background as a circle behind them
// (the Locker's big preview, like the character on the side in Quizizz)
function avatarSvg(look = coder.look, { bare = false, full = false } = {}) {
  const n = `av${avatarCount++}`;
  const get = slot => cosmetic(look[slot]) || cosmetic(DEFAULT_LOOK[slot]);
  const hoodie = get('hoodie'), hair = get('hair').id, hairColor = get('hairColor').color;
  const skin = get('skin').color, hat = get('hat').id, glasses = get('glasses').id;
  const laptop = get('laptop'), bg = get('bg'), pet = get('pet');
  const outfit = get('outfit').id, face = get('face').id, neck = get('neck').id;
  // Shadows and highlights, so the coder looks lit from the top left
  const skinShade = mix(skin, '#3a1410', 0.22), skinLight = mix(skin, '#ffffff', 0.18);
  const hairDark = mix(hairColor, '#000000', 0.35), hairLight = mix(hairColor, '#ffffff', 0.4);

  const defs = `
    <linearGradient id="${n}-rainbow" x1="0" x2="1"><stop offset="0" stop-color="#ff4d6d"/><stop offset=".25" stop-color="#ffb84d"/><stop offset=".5" stop-color="#5ee07a"/><stop offset=".75" stop-color="#4db8ff"/><stop offset="1" stop-color="#a66bff"/></linearGradient>
    <linearGradient id="${n}-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1a8"/><stop offset=".5" stop-color="#ffd23f"/><stop offset="1" stop-color="#c8920a"/></linearGradient>
    <linearGradient id="${n}-sunset" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7a59"/><stop offset=".55" stop-color="#d9467a"/><stop offset="1" stop-color="#4b2a7a"/></linearGradient>
    <radialGradient id="${n}-galaxy" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#6b3fb8"/><stop offset=".5" stop-color="#241a5c"/><stop offset="1" stop-color="#090b24"/></radialGradient>
    <linearGradient id="${n}-night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1250"/><stop offset="1" stop-color="#0d0618"/></linearGradient>
    <linearGradient id="${n}-patch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a1a0a"/><stop offset="1" stop-color="#8a3a0c"/></linearGradient>
    <linearGradient id="${n}-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d6dce8"/><stop offset=".5" stop-color="#9aa3b5"/><stop offset="1" stop-color="#6b7385"/></linearGradient>
    <radialGradient id="${n}-face" cx=".4" cy=".36" r=".72"><stop offset="0" stop-color="${skinLight}"/><stop offset=".62" stop-color="${skin}"/><stop offset="1" stop-color="${skinShade}"/></radialGradient>
    <linearGradient id="${n}-shade" x1="0" x2="1"><stop offset="0" stop-opacity=".3"/><stop offset=".3" stop-opacity="0"/><stop offset=".7" stop-opacity="0"/><stop offset="1" stop-opacity=".34"/></linearGradient>
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
  } else if (bg.pattern === 'haunted') {
    back = `<rect width="120" height="120" fill="#1d0f33"/><rect width="120" height="120" fill="url(#${n}-night)"/>
      <circle cx="92" cy="22" r="13" fill="#fff4c2"/><circle cx="87" cy="18" r="3" fill="#e8d98f" opacity=".6"/>
      <text x="22" y="24" font-size="11">🦇</text><text x="62" y="14" font-size="8">🦇</text><text x="104" y="48" font-size="9">🦇</text>`;
  } else if (bg.pattern === 'patch') {
    back = `<rect width="120" height="120" fill="url(#${n}-patch)"/><circle cx="60" cy="40" r="30" fill="#ffb347" opacity=".25"/>
      <text x="4" y="118" font-size="20">🎃</text><text x="96" y="80" font-size="16">🎃</text><text x="8" y="70" font-size="12">🎃</text>`;
  } else if (bg.pattern === 'graveyard') {
    back = `<rect width="120" height="120" fill="#1c2522"/><circle cx="24" cy="20" r="10" fill="#e8eef0" opacity=".85"/>
      <g fill="#6e7a78" stroke="#3d4644" stroke-width="1.5">
        <path d="M4 120 V92 Q12 82 20 92 V120 Z"/><path d="M98 120 V86 Q107 76 116 86 V120 Z"/><path d="M86 120 V100 Q92 94 98 100 V120 Z"/></g>
      <g stroke="#3d4644" stroke-width="1.5"><path d="M12 96 V104 M9 99 H15"/><path d="M107 90 V98 M104 93 H110"/></g>
      <rect y="100" width="120" height="20" fill="#cfd8dc" opacity=".12"/>`;
  } else {
    back = `<rect width="120" height="120" fill="${bg.color}"/><circle cx="60" cy="56" r="40" fill="#fff" opacity=".06"/>`;
  }

  // Hair that sits behind the head
  let hairBack = '';
  if (hair === 'hair-long') hairBack = `<path d="M33 50 C31 20 89 20 87 50 C87 66 92 80 89 96 Q80 99 74 92 L46 92 Q40 99 31 96 C28 80 33 66 33 50 Z" fill="${hairDark}"/>
    <path d="M36 52 C35 70 38 82 35 94 M84 52 C85 70 82 82 85 94" fill="none" stroke="${hairColor}" stroke-width="5" stroke-linecap="round"/>`;
  if (hair === 'hair-curly') hairBack = `<circle cx="60" cy="44" r="30" fill="${hairDark}"/><circle cx="34" cy="58" r="9" fill="${hairDark}"/><circle cx="86" cy="58" r="9" fill="${hairDark}"/><circle cx="33" cy="70" r="7" fill="${hairDark}"/><circle cx="87" cy="70" r="7" fill="${hairDark}"/>`;
  if (hair === 'hair-pigtails') hairBack = `<path d="M33 50 C22 54 20 72 26 84 C30 76 34 64 36 56 Z M87 50 C98 54 100 72 94 84 C90 76 86 64 84 56 Z" fill="${hairColor}"/>
    <path d="M29 60 C25 68 25 76 27 80 M91 60 C95 68 95 76 93 80" fill="none" stroke="${hairLight}" stroke-width="1.5" opacity=".6" stroke-linecap="round"/>
    <rect x="31" y="50" width="6" height="5" rx="2" fill="#ff3d8b"/><rect x="83" y="50" width="6" height="5" rx="2" fill="#ff3d8b"/>`;
  if (hair === 'hair-bun') hairBack = `<circle cx="60" cy="21" r="10" fill="${hairColor}"/><path d="M53 18 Q60 13 67 18" fill="none" stroke="${hairLight}" stroke-width="1.6" opacity=".6"/>`;

  if (hat === 'hat-hood') hairBack = ''; // the hood covers it

  // Hood up goes behind the head too
  const hoodBack = hat === 'hat-hood' ? `<path d="M28 64 C26 18 94 18 92 64 L90 86 L30 86 Z" fill="${paint(hoodie.color)}"/><path d="M28 64 C26 18 94 18 92 64 L90 86 L30 86 Z" fill="#000" opacity=".15"/>` : '';

  // The outfit: what's behind and around the body, then the neck, then the collar and details on top
  const [outfitBack, outfitFront] = outfitSvg(outfit, paint(hoodie.color), skin, n);
  // The neck is a little darker than the face, with a shadow under the chin.
  // The outfit gets shaded at the sides so it looks round.
  const body = `${outfitBack}<path d="${BODY}" fill="url(#${n}-shade)"/>
    <path d="M52.5 68 H67.5 V84 Q60 88 52.5 84 Z" fill="${mix(skin, '#3a1410', 0.1)}"/><ellipse cx="60" cy="76" rx="8.5" ry="4.5" fill="${skinShade}" opacity=".8"/>
    ${outfitFront}${neckSvg(neck)}`;

  // A face shape with a chin, real-looking eyes (white, colored iris, lid), eyebrows, nose and a smile
  const eye = x => `
    <ellipse cx="${x}" cy="55.5" rx="4.6" ry="3.7" fill="#fff"/>
    <circle cx="${x + 0.3}" cy="55.7" r="2.9" fill="#5b3a24"/><circle cx="${x + 0.3}" cy="55.7" r="2.9" fill="none" stroke="#2a180e" stroke-width=".7"/>
    <circle cx="${x + 0.3}" cy="55.8" r="1.5" fill="#120a06"/><circle cx="${x + 1.3}" cy="54.6" r="1" fill="#fff"/>
    <path d="M${x - 4.9} 55.4 Q${x} 50.6 ${x + 4.9} 55.4" fill="none" stroke="#1d1b22" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M${x - 4} 59.2 Q${x} 60.6 ${x + 4} 59.2" fill="none" stroke="${skinShade}" stroke-width=".8" stroke-linecap="round"/>`;
  const head = `
    <ellipse cx="36.5" cy="57" rx="4.6" ry="6" fill="${skin}"/><ellipse cx="83.5" cy="57" rx="4.6" ry="6" fill="${skin}"/>
    <ellipse cx="36.8" cy="57" rx="2" ry="3.6" fill="${skinShade}" opacity=".7"/><ellipse cx="83.2" cy="57" rx="2" ry="3.6" fill="${skinShade}" opacity=".7"/>
    <path d="M60 27 C74 27 84 37 84 51 C84 63 78 72 69 76.5 C65 78.6 55 78.6 51 76.5 C42 72 36 63 36 51 C36 37 46 27 60 27 Z" fill="url(#${n}-face)"/>
    ${eye(51)}${eye(69)}
    <path d="M45.5 48.6 Q50.5 45.4 56 47.4 M74.5 48.6 Q69.5 45.4 64 47.4" fill="none" stroke="${hairDark}" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M60.5 56 Q59 61 58 62.4" fill="none" stroke="${skinShade}" stroke-width="1.2" stroke-linecap="round" opacity=".7"/>
    <path d="M57.4 63.6 Q60 65 62.6 63.6" fill="none" stroke="${skinShade}" stroke-width="1.4" stroke-linecap="round"/>
    <ellipse cx="44.5" cy="63.5" rx="4" ry="2.6" fill="#ff6b7d" opacity=".22"/><ellipse cx="75.5" cy="63.5" rx="4" ry="2.6" fill="#ff6b7d" opacity=".22"/>
    <path d="M53.6 67 Q60 73.6 66.4 67 Q60 68.8 53.6 67 Z" fill="#8a2f3a"/>
    <path d="M55 67.4 Q60 69.2 65 67.4 L64.4 68.6 Q60 70 55.6 68.6 Z" fill="#fff"/>
    <path d="M53 66.6 Q54 66 54.6 66.9 M67 66.6 Q66 66 65.4 66.9" fill="none" stroke="#8a2f3a" stroke-width="1" stroke-linecap="round"/>
    ${faceSvg(face)}`;

  // Hair on top of the head: a side-swept fringe with a shine and strands
  const fringe = `<path d="M34.5 54 C31 30 46 22 61 22 C77 22 89 32 85.5 54 C84 46 81 41 76 38 C70 44 58 45.5 48 41 C43 44 38 48 34.5 54 Z" fill="${hairColor}"/>
    <path d="M76 38 C70 44 58 45.5 48 41" fill="none" stroke="${hairDark}" stroke-width="1.4" opacity=".6"/>
    <path d="M62 26 C58 32 54 37 48 41 M72 28 C70 34 68 38 64 43" fill="none" stroke="${hairDark}" stroke-width="1" opacity=".45" stroke-linecap="round"/>
    <path d="M42 34 Q52 25 68 26" fill="none" stroke="${hairLight}" stroke-width="2.4" opacity=".6" stroke-linecap="round"/>`;
  const curls = [[42, 36, 8], [52, 29, 8.5], [64, 28, 8.5], [75, 33, 8], [82, 43, 6.5], [37, 45, 6.5]];
  const hairFront = {
    'hair-short': fringe,
    'hair-long': fringe,
    'hair-bun': fringe,
    'hair-pigtails': fringe,
    'hair-curly': curls.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${hairColor}"/><path d="M${x - r / 2} ${y - r / 3} Q${x} ${y - r * 0.8} ${x + r / 2} ${y - r / 3}" fill="none" stroke="${hairLight}" stroke-width="1.3" opacity=".55"/>`).join(''),
    'hair-buzz': `<path d="M36.5 48 C36 30 49 26 60 26 C71 26 84 30 83.5 48 C80 40 72 37 60 37 C48 37 40 40 36.5 48 Z" fill="${hairColor}" opacity=".9"/><path d="M45 31 Q55 27 66 28" fill="none" stroke="${hairLight}" stroke-width="1.6" opacity=".5"/>`,
    'hair-spiky': `<path d="M35 52 L36 34 L44 38 L45 22 L53 32 L59 17 L65 31 L73 21 L75 35 L85 30 L85 52 C78 40 44 40 35 52 Z" fill="${hairColor}"/>
      <path d="M45 22 L49 34 M59 17 L60 32 M73 21 L70 34" fill="none" stroke="${hairLight}" stroke-width="1.4" opacity=".55" stroke-linecap="round"/>`,
    'hair-mohawk': `<path d="M53 18 Q60 12 67 18 L66 44 L54 44 Z" fill="${hairColor}"/><path d="M57 18 L57.5 40" stroke="${hairLight}" stroke-width="1.5" opacity=".55"/><path d="M38 46 C38 34 44 30 54 29 L54 40 C46 40 40 43 38 46 Z M82 46 C82 34 76 30 66 29 L66 40 C74 40 80 43 82 46 Z" fill="${hairColor}" opacity=".35"/>`,
  }[hair] || '';

  const eyewear = {
    'glasses-round': `<g fill="none" stroke="#1d1b22" stroke-width="2"><circle cx="51" cy="55" r="7"/><circle cx="69" cy="55" r="7"/><path d="M58 55 H62 M44 54 L37 52 M76 54 L83 52"/></g>`,
    'glasses-square': `<g fill="#fff" fill-opacity=".15" stroke="#1d1b22" stroke-width="2.4"><rect x="43" y="49" width="15" height="11" rx="2"/><rect x="62" y="49" width="15" height="11" rx="2"/><path d="M58 54 H62 M43 53 L37 51 M77 53 L83 51" fill="none"/></g>`,
    'glasses-shades': `<g fill="#14161f" stroke="#14161f" stroke-width="2"><path d="M42 50 H58 V56 C58 61 54 62 50 62 C45 62 42 59 42 55 Z"/><path d="M62 50 H78 V55 C78 59 75 62 70 62 C66 62 62 61 62 56 Z"/><path d="M58 52 H62 M42 51 L37 50 M78 51 L83 50" fill="none"/></g><path d="M45 52 L49 52" stroke="#fff" stroke-opacity=".5" stroke-width="1.5"/>`,
    'glasses-pixel': `<g fill="#0a0a0a"><rect x="40" y="50" width="40" height="4"/><rect x="42" y="54" width="14" height="4"/><rect x="64" y="54" width="14" height="4"/><rect x="44" y="58" width="10" height="3"/><rect x="66" y="58" width="10" height="3"/></g><g fill="#fff"><rect x="44" y="54" width="3" height="3"/><rect x="66" y="54" width="3" height="3"/></g>`,
    'glasses-visor': `<rect x="36" y="47" width="48" height="14" rx="7" fill="#2ee6ff" opacity=".75"/><rect x="36" y="47" width="48" height="14" rx="7" fill="none" stroke="#bff8ff" stroke-width="1.5"/><path d="M42 51 H60" stroke="#fff" stroke-opacity=".7" stroke-width="2" stroke-linecap="round"/>`,
    'glasses-mask': `<path fill-rule="evenodd" fill="#6b2fa8" stroke="#3c1466" stroke-width="1.2" d="M36 51 Q46 43 58 51 Q60 53 62 51 Q74 43 84 51 Q85 62 72 63 Q63 62 60 58 Q57 62 48 63 Q35 62 36 51 Z M45 55 a6 4 0 1 0 12 0 a6 4 0 1 0 -12 0 Z M63 55 a6 4 0 1 0 12 0 a6 4 0 1 0 -12 0 Z"/><circle cx="40" cy="50" r="2" fill="#ffd23f"/><circle cx="80" cy="50" r="2" fill="#ffd23f"/>`,
  }[glasses] || '';

  const headwear = {
    'hat-beanie': `<path d="M35 46 C35 20 85 20 85 46 Z" fill="${paint(hoodie.color)}"/><path d="M35 46 C35 20 85 20 85 46 Z" fill="#000" opacity=".12"/><rect x="33" y="40" width="54" height="10" rx="4" fill="${paint(hoodie.color)}"/><circle cx="60" cy="20" r="6" fill="#fff"/>`,
    'hat-cap': `<path d="M36 44 C36 22 84 22 84 44 Z" fill="#e0393e"/><path d="M80 42 C92 40 102 42 104 46 C96 47 88 46 80 46 Z" fill="#b22a2f"/><circle cx="60" cy="24" r="2.5" fill="#b22a2f"/><text x="60" y="40" font-family="monospace" font-weight="bold" font-size="10" text-anchor="middle" fill="#fff">&lt;/&gt;</text>`,
    'hat-headphones': `<path d="M34 54 C32 18 88 18 86 54" fill="none" stroke="#2a2e3d" stroke-width="5"/><rect x="28" y="46" width="10" height="18" rx="4" fill="#ff3d8b"/><rect x="82" y="46" width="10" height="18" rx="4" fill="#ff3d8b"/>`,
    'hat-catears': `<path d="M38 40 L38 18 L54 30 Z" fill="${hairColor}"/><path d="M82 40 L82 18 L66 30 Z" fill="${hairColor}"/><path d="M41 34 L41 24 L49 30 Z" fill="#ff9ec4"/><path d="M79 34 L79 24 L71 30 Z" fill="#ff9ec4"/>`,
    'hat-hood': `<path d="M30 66 C30 30 90 30 90 66 C88 40 74 30 60 30 C46 30 32 40 30 66 Z" fill="${paint(hoodie.color)}"/>`,
    'hat-crown': `<path d="M40 36 L40 16 L49 25 L60 12 L71 25 L80 16 L80 36 Z" fill="url(#${n}-gold)" stroke="#c8920a" stroke-width="1.5"/><circle cx="60" cy="28" r="3" fill="#ff3d8b"/><circle cx="48" cy="31" r="2" fill="#2ee6ff"/><circle cx="72" cy="31" r="2" fill="#2ee6ff"/>`,
    'hat-horns': `<path d="M42 34 C36 26 36 16 40 10 C42 18 46 24 50 28 Z" fill="#d62839" stroke="#8b0f1f" stroke-width="1.2"/><path d="M78 34 C84 26 84 16 80 10 C78 18 74 24 70 28 Z" fill="#d62839" stroke="#8b0f1f" stroke-width="1.2"/>`,
    'hat-witch': `<path d="M24 40 Q60 30 96 40 Q60 48 24 40 Z" fill="#2a1240"/><path d="M40 39 L58 2 Q62 0 64 4 L80 39 Z" fill="#3a1f55"/><path d="M58 2 Q66 -2 72 8 Q64 4 60 8 Z" fill="#3a1f55"/><path d="M41 34 Q60 30 79 34 L80 39 Q60 35 40 39 Z" fill="#f07c12"/><rect x="56" y="32" width="8" height="6" rx="1" fill="#ffd23f"/>`,
    'hat-pumpkin': `<g><ellipse cx="60" cy="52" rx="31" ry="28" fill="#f07c12"/><g fill="none" stroke="#c45e08" stroke-width="2"><path d="M48 26 Q40 52 48 78"/><path d="M72 26 Q80 52 72 78"/><path d="M60 24 V80"/></g>
      <path d="M57 24 Q58 14 64 12 L66 16 Q61 18 62 25 Z" fill="#3d7a2a"/>
      <g fill="#3a1500"><path d="M42 50 L50 40 L56 50 Z"/><path d="M64 50 L70 40 L78 50 Z"/><path d="M44 62 L50 66 L54 62 L60 66 L66 62 L70 66 L76 62 Q70 74 60 74 Q50 74 44 62 Z"/></g>
      <g fill="#ffd23f" opacity=".55"><path d="M45 49 L50 43 L53 49 Z"/><path d="M67 49 L70 43 L75 49 Z"/></g></g>`,
  }[hat] || '';

  // Laptop in front, lid facing us (low and small, so your outfit shows)
  const lid = paint(laptop.color);
  const laptopSvg = laptop.none ? '' : `
    ${laptop.neon ? `<rect x="33" y="99" width="54" height="25" rx="5" fill="#2ee6ff" opacity=".35"/>` : ''}
    <rect x="36" y="102" width="48" height="22" rx="4" fill="${lid}" ${laptop.neon ? 'stroke="#2ee6ff" stroke-width="2"' : ''}/>
    ${laptop.spooky
      ? '<text x="60" y="118" font-size="11" text-anchor="middle">🎃</text><path d="M36 102 L46 102 M36 102 L36 112 M36 102 L44 110 M40 102 Q38 106 36 106 M43 102 Q40 108 36 109" stroke="#cfd8dc" stroke-width=".8" fill="none" opacity=".7"/>'
      : `<path d="M60 107 L66 109.5 V113 C66 116 63 118 60 119 C57 118 54 116 54 113 V109.5 Z" fill="${laptop.neon ? '#2ee6ff' : '#fff'}" opacity="${laptop.neon ? 1 : 0.55}"/>`}
    ${laptop.stickers ? `<circle cx="42" cy="108" r="3.5" fill="#ff3d8b"/><rect x="72" y="105" width="8" height="6" rx="2" fill="#ffd23f"/><circle cx="76" cy="117" r="3.5" fill="#20a95a"/><path d="M41 114 l3 5 l3 -5 z" fill="#8a4ce0"/>` : ''}`;

  if (!full) {
    const sidekick = pet.emoji ? `<text x="102" y="113" font-size="19" text-anchor="middle">${pet.emoji}</text>` : '';
    return `<svg class="avatar-svg" viewBox="0 0 120 120" role="img" aria-label="Your coder"><defs>${defs}</defs><g clip-path="url(#${n}-clip)">
    ${bare ? '' : back}${hoodBack}${hairBack}${body}${head}${hairFront}${eyewear}${headwear}${laptopSvg}${sidekick}</g></svg>`;
  }

  // ---------- The whole coder, for the Locker ----------
  // Below the chest: legs and shoes, the rest of the top (down to the knees for long coats), and arms.
  // With a laptop, the arms bend to hold it at the waist.
  const o = outfitBelow(outfit, paint(hoodie.color), skin, n);
  const torso = o.long ? 'M22 116 H98 L95 178 H25 Z' : 'M22 116 H98 L90 160 H30 Z';
  const legs = 'M33 156 H58.5 L57 193 H35 Z M61.5 156 H87 L85 193 H63 Z';
  const holding = !laptop.none;
  const arms = holding
    ? 'M19 104 Q11 134 30 151 L39 141 Q27 130 31 110 Z M101 104 Q109 134 90 151 L81 141 Q93 130 89 110 Z'
    : 'M19 104 Q13 130 15 152 H28 Q27 130 31 110 Z M101 104 Q107 130 105 152 H92 Q93 130 89 110 Z';
  const hands = holding ? [[37, 148], [83, 148]] : [[21.5, 156], [98.5, 156]];
  const below = `
    ${o.cape ? `<path d="M16 100 H104 L112 198 H8 Z" fill="${o.cape}"/>` : ''}
    <path d="${legs}" fill="${o.pants}"/><path d="${legs}" fill="url(#${n}-shade)"/>
    <path d="M34 189 H58 V198 Q58 203 54 203 H31 Q25 203 27 197 Q29 190 34 189 Z M62 189 H86 Q91 190 93 197 Q95 203 89 203 H66 Q62 203 62 198 Z" fill="${o.shoes}"/>
    <path d="M27 200 H58 M62 200 H93" stroke="#000" stroke-opacity=".3" stroke-width="2"/>
    <path d="${torso}" fill="${o.main}"/><path d="${torso}" fill="url(#${n}-shade)"/>
    ${o.long ? '<path d="M60 122 V178" stroke="#000" stroke-opacity=".2" stroke-width="1.5"/>' : '<path d="M30.5 157 H89.5" stroke="#000" stroke-opacity=".3" stroke-width="3"/>'}
    <path d="${arms}" fill="${o.arm}"/><path d="${arms}" fill="#000" opacity=".12"/>`;
  const handsSvg = hands.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="${skin}"/><circle cx="${x}" cy="${y}" r="6" fill="none" stroke="${skinShade}" stroke-width="1"/>`).join('');
  const backdrop = bare ? '' : `<g clip-path="url(#${n}-round)">${back}</g><circle cx="60" cy="62" r="54" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2"/>`;
  const buddy = pet.emoji ? `<text x="108" y="204" font-size="22" text-anchor="middle">${pet.emoji}</text>` : '';
  return `<svg class="avatar-svg full" viewBox="0 0 120 208" role="img" aria-label="Your coder"><defs>${defs}<clipPath id="${n}-round"><circle cx="60" cy="62" r="54"/></clipPath></defs>
    ${backdrop}${below}${hoodBack}${hairBack}${body}${head}${hairFront}${eyewear}${headwear}<g transform="translate(0 30)">${laptopSvg}</g>${handsSvg}${buddy}</svg>`;
}

// What each outfit looks like below the chest, for the full-body coder.
// main: the top's color (c is your outfit color), long: a coat down to the knees, cape: the cape's lining
function outfitBelow(id, c, skin, n) {
  const metal = `url(#${n}-metal)`;
  const below = {
    'outfit-tshirt': { arm: skin },
    'outfit-varsity': { arm: '#f4f1e8' },
    'outfit-leather': { main: '#1f1f26', shoes: '#1c1c22' },
    'outfit-labcoat': { main: '#f1f4f8', long: true },
    'outfit-suit': { main: '#22253a', pants: '#22253a', shoes: '#1c1c22' },
    'outfit-trench': { main: '#7a5434', long: true, shoes: '#3d2814' },
    'outfit-space': { main: '#e9edf5', pants: '#e9edf5', shoes: '#9aa6bd' },
    'outfit-armor': { main: metal, pants: metal, shoes: '#555d6e' },
    'outfit-hero': { pants: c, shoes: '#d62839', cape: '#a51d2c' },
    'outfit-hacker': { main: '#121418', pants: '#1c1f26', shoes: '#0a0c10' },
    'outfit-vampire': { main: '#1a1a1f', pants: '#1a1a1f', shoes: '#111', cape: '#8b0f1f' },
    'outfit-skeleton': { main: '#15151b', pants: '#15151b', shoes: '#15151b' },
    'outfit-mummy': { main: '#e8dcc0', pants: '#e8dcc0', shoes: '#bfae86' },
    'outfit-witch': { main: '#3a1f55', long: true, shoes: '#1c1c22' },
    'outfit-pumpkin': { main: '#f07c12', pants: '#3d7a2a' },
  }[id] || {};
  return { main: c, pants: '#2c3a5e', shoes: '#f1f4f8', ...below, arm: below.arm || below.main || c };
}

// ---------- Outfits ----------
// Returns [behind, front]: "behind" is the body (and anything like a cape behind it),
// "front" is the collar and details drawn over the neck. c is the outfit color.
const BODY = 'M18 122 C18 94 36 84 60 84 C84 84 102 94 102 122 Z';

function outfitSvg(id, c, skin, n) {
  const body = fill => `<path d="${BODY}" fill="${fill}"/>`;
  const cape = (outside, inside) => `<path d="M8 124 L30 86 L90 86 L112 124 Z" fill="${outside}"/><path d="M18 124 L34 90 L86 90 L102 124 Z" fill="${inside}"/>`;
  switch (id) {
    case 'outfit-tshirt': return [body(c), `
      <path d="M49 85 Q60 94 71 85" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="3"/>
      <path d="M30 104 Q33 96 38 92 M90 104 Q87 96 82 92" fill="none" stroke="#000" stroke-opacity=".2" stroke-width="2"/>
      <path d="M60 92 L66 94.5 V98 C66 101 63 103 60 104 C57 103 54 101 54 98 V94.5 Z" fill="#fff" opacity=".9"/>`];
    case 'outfit-varsity': return [`${body(c)}
      <path d="M18 122 C18 100 23 92 33 89 L38 122 Z" fill="#f4f1e8"/><path d="M102 122 C102 100 97 92 87 89 L82 122 Z" fill="#f4f1e8"/>
      <path d="M22 112 L37 112 M98 112 L83 112" stroke="${c}" stroke-width="3"/>`, `
      <path d="M46 85 Q60 97 74 85" fill="none" stroke="#f4f1e8" stroke-width="5"/>
      <path d="M46 85 Q60 97 74 85" fill="none" stroke="${c}" stroke-width="1.5"/>
      <text x="45" y="102" font-family="Georgia, serif" font-weight="bold" font-size="11" fill="#ffd23f" stroke="#f4f1e8" stroke-width=".6">D</text>`];
    case 'outfit-leather': return [body('#1f1f26'), `
      <path d="M53 85 L60 98 L67 85 Z" fill="${c}"/>
      <path d="M44 85 L55 101 L58 89 L52 84 Z" fill="#2e2e38" stroke="#000" stroke-opacity=".4"/>
      <path d="M76 85 L65 101 L62 89 L68 84 Z" fill="#2e2e38" stroke="#000" stroke-opacity=".4"/>
      <path d="M64 100 V122" stroke="#c9d2e3" stroke-width="1.5" stroke-dasharray="2 1.5"/>
      <circle cx="30" cy="102" r="1.6" fill="#c9d2e3"/><circle cx="90" cy="102" r="1.6" fill="#c9d2e3"/>`];
    case 'outfit-labcoat': return [body('#f1f4f8'), `
      <path d="M52 85 L60 101 L68 85 Z" fill="${c}"/>
      <path d="M52 85 L58 103 M68 85 L62 103" stroke="#c3cad6" stroke-width="2"/>
      <path d="M60 103 V122" stroke="#c3cad6" stroke-width="1.5"/>
      <rect x="40" y="95" width="10" height="7" rx="1" fill="none" stroke="#c3cad6" stroke-width="1.2"/>
      <path d="M43 90 V97 M46 91 V97" stroke="#2f6fe0" stroke-width="1.5" stroke-linecap="round"/>`];
    case 'outfit-suit': return [body('#22253a'), `
      <path d="M51 85 L60 104 L69 85 Z" fill="#fff"/>
      <path d="M58 88 L62 88 L63.5 101 L60 105 L56.5 101 Z" fill="${c}"/><rect x="57.5" y="86" width="5" height="3.5" rx="1" fill="${c}"/>
      <path d="M51 85 L57 103 L47 93 L49 88 Z M69 85 L63 103 L73 93 L71 88 Z" fill="#30344d"/>
      <path d="M78 96 L84 96" stroke="#fff" stroke-width="2"/>`];
    case 'outfit-trench': return [body('#7a5434'), `
      <path d="M53 85 L60 96 L67 85 Z" fill="#e9edf5"/>
      <path d="M38 94 L45 76 L57 88 L52 99 Z" fill="#664427" stroke="#3d2814" stroke-width="1"/>
      <path d="M82 94 L75 76 L63 88 L68 99 Z" fill="#664427" stroke="#3d2814" stroke-width="1"/>
      <g fill="#3d2814"><circle cx="50" cy="104" r="1.8"/><circle cx="70" cy="104" r="1.8"/><circle cx="50" cy="112" r="1.8"/><circle cx="70" cy="112" r="1.8"/></g>`];
    case 'outfit-space': return [`${body('#e9edf5')}
      <path d="M86 92 L100 112" stroke="${c}" stroke-width="4"/>`, `
      <ellipse cx="60" cy="86" rx="17" ry="5" fill="#9aa6bd" stroke="#6b7790" stroke-width="1.5"/>
      <circle cx="31" cy="102" r="6" fill="${c}" stroke="#fff" stroke-width="1.5"/>
      <path d="M31 98.5 L32 101 L34.5 101 L32.5 102.5 L33.3 105 L31 103.5 L28.7 105 L29.5 102.5 L27.5 101 L30 101 Z" fill="#fff"/>
      <rect x="44" y="92" width="10" height="6" rx="1.5" fill="#6b7790"/><circle cx="47" cy="95" r="1.2" fill="#7cff6b"/><circle cx="51" cy="95" r="1.2" fill="#ff3d8b"/>`];
    case 'outfit-armor': return [`${body(`url(#${n}-metal)`)}
      <path d="M55 92 H65 V122 H55 Z" fill="${c}"/>`, `
      <path d="M44 86 Q60 97 76 86 L76 91 Q60 102 44 91 Z" fill="#7d8698" stroke="#555d6e" stroke-width="1"/>
      <ellipse cx="28" cy="98" rx="13" ry="8" fill="url(#${n}-metal)" stroke="#555d6e" stroke-width="1.2"/>
      <ellipse cx="92" cy="98" rx="13" ry="8" fill="url(#${n}-metal)" stroke="#555d6e" stroke-width="1.2"/>
      <g fill="#555d6e"><circle cx="22" cy="98" r="1.3"/><circle cx="34" cy="98" r="1.3"/><circle cx="86" cy="98" r="1.3"/><circle cx="98" cy="98" r="1.3"/></g>`];
    case 'outfit-hero': return [`${cape('#d62839', '#a51d2c')}${body(c)}`, `
      <path d="M42 87 L48 78 L56 87 Z M78 87 L72 78 L64 87 Z" fill="#d62839"/>
      <path d="M50 94 L60 89 L70 94 L60 104 Z" fill="#ffd23f" stroke="#c8920a" stroke-width="1"/>
      <path d="M57 93 L63 93 L58 99 L63 99" fill="none" stroke="#d62839" stroke-width="1.6"/>`];
    case 'outfit-hacker': return [`${body('#121418')}
      <g font-family="monospace" font-size="5" fill="#3dff7a" opacity=".55"><text x="22" y="108">1011</text><text x="24" y="115">0110</text><text x="84" y="108">0101</text><text x="83" y="115">1100</text></g>`, `
      <path d="M38 90 Q40 80 60 80 Q80 80 82 90 Q72 86 60 92 Q48 86 38 90 Z" fill="#1d2027" stroke="#3dff7a" stroke-width="1" stroke-opacity=".7"/>
      <path d="M60 92 V122" stroke="#3dff7a" stroke-width="1.6" opacity=".9"/>
      <path d="M53 90 L52 104 M67 90 L68 104" stroke="#3dff7a" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="52" cy="105" r="1.6" fill="#3dff7a"/><circle cx="68" cy="105" r="1.6" fill="#3dff7a"/>
      <rect x="70" y="89" width="17" height="10" rx="2.5" fill="#0a0c10" stroke="#3dff7a" stroke-width="1"/>
      <text x="78.5" y="96.4" font-family="monospace" font-weight="bold" font-size="6.5" text-anchor="middle" fill="#3dff7a">&gt;_</text>
      <path d="M18 122 C18 94 36 84 60 84 C84 84 102 94 102 122" fill="none" stroke="#3dff7a" stroke-width="1" opacity=".35"/>`];
    case 'outfit-vampire': return [`${cape('#111', '#8b0f1f')}${body('#1a1a1f')}
      <path d="M41 95 L32 64 L54 84 Z" fill="#8b0f1f" stroke="#111" stroke-width="1.5"/>
      <path d="M79 95 L88 64 L66 84 Z" fill="#8b0f1f" stroke="#111" stroke-width="1.5"/>`, `
      <path d="M52 85 L60 100 L68 85 Z" fill="#f4f1e8"/>
      <circle cx="60" cy="96" r="3" fill="#d62839" stroke="#ffd23f" stroke-width="1"/>`];
    case 'outfit-skeleton': return [body('#15151b'), `
      <g fill="none" stroke="#f4f1e8" stroke-width="2.5" stroke-linecap="round">
        <path d="M60 88 V122"/><path d="M44 89 Q52 92 58 89 M76 89 Q68 92 62 89"/>
        <path d="M46 96 Q60 101 74 96"/><path d="M47 103 Q60 108 73 103"/><path d="M48 110 Q60 115 72 110"/>
      </g><circle cx="29" cy="101" r="5" fill="#f4f1e8"/><circle cx="91" cy="101" r="5" fill="#f4f1e8"/>`];
    case 'outfit-mummy': return [body('#e8dcc0'), `
      <g stroke="#bfae86" stroke-width="2" fill="none">
        <path d="M22 104 L50 88"/><path d="M20 114 L60 92"/><path d="M30 122 L78 90"/><path d="M50 122 L98 98"/><path d="M76 122 L102 108"/><path d="M60 88 L96 104"/>
      </g><path d="M84 100 L92 116 L96 114 L88 99 Z" fill="#e8dcc0" stroke="#bfae86" stroke-width="1"/>`];
    case 'outfit-witch': return [body('#3a1f55'), `
      <path d="M50 85 L60 97 L70 85" fill="none" stroke="#f07c12" stroke-width="3"/>
      <path d="M60 96 L61.5 99.5 L65 99.8 L62.3 102 L63.2 105.5 L60 103.6 L56.8 105.5 L57.7 102 L55 99.8 L58.5 99.5 Z" fill="#ffd23f"/>
      <path d="M18 120 Q60 112 102 120" stroke="#f07c12" stroke-width="2" fill="none"/>`];
    case 'outfit-pumpkin': return [body('#f07c12'), `
      <g fill="none" stroke="#c45e08" stroke-width="2"><path d="M38 90 Q32 106 36 122"/><path d="M82 90 Q88 106 84 122"/><path d="M50 86 Q46 104 48 122"/><path d="M70 86 Q74 104 72 122"/></g>
      <path d="M50 85 Q60 92 70 85" fill="#3d7a2a"/>
      <g fill="#3a1500"><path d="M50 98 L54 93 L58 98 Z"/><path d="M62 98 L66 93 L70 98 Z"/></g>`];
    default: return [body(c), `
      <path d="M44 86 C50 96 70 96 76 86" fill="none" stroke="#000" stroke-opacity=".2" stroke-width="3"/>
      <line x1="53" y1="92" x2="52" y2="104" stroke="#fff" stroke-opacity=".7" stroke-width="2" stroke-linecap="round"/>
      <line x1="67" y1="92" x2="68" y2="104" stroke="#fff" stroke-opacity=".7" stroke-width="2" stroke-linecap="round"/>
      <path d="M48 104 H72 V112 Q60 115 48 112 Z" fill="#000" opacity=".18"/>`];
  }
}

// ---------- Face extras ----------
function faceSvg(id) {
  return {
    'face-freckles': '<g fill="#a0522d" opacity=".55"><circle cx="44" cy="61" r=".9"/><circle cx="47" cy="63" r=".9"/><circle cx="43" cy="64" r=".9"/><circle cx="76" cy="61" r=".9"/><circle cx="73" cy="63" r=".9"/><circle cx="77" cy="64" r=".9"/></g>',
    'face-star': '<path d="M76 58 L77.2 60.8 L80.2 61 L77.9 63 L78.6 66 L76 64.4 L73.4 66 L74.1 63 L71.8 61 L74.8 60.8 Z" fill="#ffd23f" stroke="#c8920a" stroke-width=".6"/>',
    'face-bandaid': '<g transform="rotate(-25 45 62)"><rect x="38" y="59.5" width="14" height="5" rx="2.5" fill="#e8b98a"/><rect x="43" y="59.5" width="4" height="5" fill="#d9a575"/></g>',
    'face-fangs': '<path d="M55.5 66.6 L57 71 L58.6 67.6 Z M61.4 67.6 L63 71 L64.5 66.6 Z" fill="#fff" stroke="#c9d2e3" stroke-width=".5"/>',
    'face-stitches': '<g stroke="#3d2b4a" stroke-width="1.4" stroke-linecap="round"><path d="M64 36 L80 44"/><path d="M67 35 L65 40 M71 37 L69 42 M75 39 L73 44 M79 41 L77 46"/></g>',
    'face-skull': '<g fill="#1d1b22"><circle cx="51" cy="55" r="6.5"/><circle cx="69" cy="55" r="6.5"/><path d="M58 60 L60 63.5 L62 60 Z"/></g>'
      + '<g fill="#fff"><circle cx="52" cy="54" r="1.3"/><circle cx="70" cy="54" r="1.3"/></g>'
      + '<path d="M52 67 H68 M55 65 V69 M58.5 65.5 V69.5 M62 65.5 V69.5 M65.5 65 V69" stroke="#1d1b22" stroke-width="1.2"/>',
  }[id] || '';
}

// ---------- Neckwear ----------
function neckSvg(id) {
  return {
    'neck-bowtie': '<path d="M60 88 L51 83 L51 93 Z M60 88 L69 83 L69 93 Z" fill="#d62839" stroke="#8b0f1f" stroke-width=".8"/><circle cx="60" cy="88" r="2.2" fill="#a51d2c"/>',
    'neck-scarf': '<path d="M45 81 Q60 90 75 81 L76 88 Q60 97 44 88 Z" fill="#e0393e"/>'
      + '<path d="M48 84 L49 91 M56 86 L56.5 93 M64 86 L63.5 93 M72 84 L71 91" stroke="#f4f1e8" stroke-width="2"/>'
      + '<path d="M66 90 L72 108 L78 106 L72 89 Z" fill="#e0393e"/><path d="M68 96 L75 94 M70 102 L76.5 100" stroke="#f4f1e8" stroke-width="2"/>',
    'neck-lanyard': '<path d="M52 84 L58 98 M68 84 L62 98" stroke="#2f6fe0" stroke-width="2.5"/><rect x="54" y="96" width="12" height="9" rx="1.5" fill="#fff" stroke="#c3cad6"/>'
      + '<rect x="55.5" y="97.5" width="4" height="4" fill="#9fb0d8"/><path d="M61 98.5 H64.5 M61 101 H64.5" stroke="#9fb0d8" stroke-width="1"/>',
    'neck-chain': '<path d="M47 85 Q60 101 73 85" fill="none" stroke="#ffd23f" stroke-width="2.4" stroke-dasharray="2.5 1.2"/>'
      + '<circle cx="60" cy="96" r="4.2" fill="#ffd23f" stroke="#c8920a" stroke-width="1"/><text x="60" y="98.3" font-size="5.5" font-weight="bold" text-anchor="middle" fill="#8a6200">&lt;/&gt;</text>',
    'neck-bolts': '<g fill="#8a94a6" stroke="#555d6e" stroke-width="1"><rect x="47" y="76" width="7" height="5" rx="1"/><rect x="66" y="76" width="7" height="5" rx="1"/></g>',
  }[id] || '';
}
