// The Coder Locker on the title screen: spend the stars you earn in Levels mode on cosmetics for your coder.
// Laid out like a battle-royale locker: pick a slot from your loadout, then pick an item for it.
// Uses SLOTS, COSMETICS, coder, avatarSvg() and the buy/equip helpers from avatar.js.

const lockerDialog = document.getElementById('dlg-coder');
const lockerEl = id => document.getElementById(id);
// The Halloween tab collects every spooky item, whatever slot it goes in
const HALLOWEEN = { id: 'halloween', name: 'Halloween', event: 'halloween' };
// Which part of the coder each tile zooms in on (an SVG viewBox). Slots not listed show the whole coder.
const TILE_ZOOM = {
  hat: '22 2 76 76', hair: '26 12 68 68', hairColor: '26 12 68 68', glasses: '32 32 56 56', face: '30 28 60 60',
  neck: '28 54 64 64', laptop: '28 92 64 34',
};
const RARITY_NAMES = { common: 'Common', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' };
const slotName = id => SLOTS.find(s => s.id === id).name;

let lockerSlot = null; // null = your loadout; otherwise the slot (or the Halloween tab) you're browsing
let picked = null; // the item you clicked in the grid: shown on the big coder and in the details box

function showCoderMini() {
  lockerEl('coder-mini').innerHTML = avatarSvg();
}

function openLocker() {
  lockerSlot = null;
  picked = null;
  renderLocker();
  lockerDialog.showModal();
  lockerDialog.querySelector('.lk-tile')?.focus();
}

// The picture on a tile: your coder wearing the item, zoomed in on that part of them
function tileArt(item) {
  if (item.id.endsWith('-none')) return '<span class="lk-empty" aria-hidden="true">⊘</span>';
  if (item.emoji) return `<span class="lk-emoji" aria-hidden="true">${item.emoji}</span>`;
  let svg = avatarSvg({ ...coder.look, [item.slot]: item.id }, { bare: item.slot !== 'bg' });
  if (TILE_ZOOM[item.slot]) svg = svg.replace('viewBox="0 0 120 120"', `viewBox="${TILE_ZOOM[item.slot]}"`);
  return svg;
}

function makeTile(item, label) {
  const owned = ownsCosmetic(item);
  const wearing = coder.look[item.slot] === item.id;
  const tile = document.createElement('button');
  tile.className = `lk-tile ${item.rarity || 'common'}${owned ? '' : ' locked'}`;
  tile.dataset.id = item.id;
  tile.innerHTML = `
    <span class="lk-art">${tileArt(item)}</span>
    ${label ? `<span class="lk-label">${label}</span>` : ''}
    ${item.event && lockerSlot !== HALLOWEEN.id ? '<span class="lk-event" title="Halloween item">🎃</span>' : ''}
    ${wearing ? (lockerSlot === null ? '' : '<span class="lk-check" title="Equipped">✓</span>') : owned ? '' : `<span class="lk-price">★ ${item.price}</span>`}
    <span class="lk-name"></span>`;
  tile.querySelector('.lk-name').textContent = item.name;
  tile.setAttribute('aria-label', `${label ? `${label}: ` : ''}${item.name}, ${RARITY_NAMES[item.rarity || 'common']}, ${wearing ? 'equipped' : owned ? 'owned' : `costs ${item.price} stars`}`);
  return tile;
}

function renderLocker() {
  const browsing = lockerSlot !== null;
  const tab = lockerSlot === HALLOWEEN.id ? HALLOWEEN : SLOTS.find(s => s.id === lockerSlot);
  lockerDialog.classList.toggle('spooky', lockerSlot === HALLOWEEN.id);
  lockerEl('locker-back').hidden = !browsing;
  lockerEl('coder-title').textContent = browsing ? (tab.event ? '🎃 Halloween' : tab.name) : 'Locker';
  lockerEl('locker-balance').textContent = starsToSpend();
  lockerEl('locker-loadout').hidden = browsing;
  lockerEl('locker-grid').hidden = !browsing;

  // The big coder, head to shoes, wears whatever you picked, even if you don't own it yet
  const look = picked ? { ...coder.look, [picked.slot]: picked.id } : coder.look;
  const preview = lockerEl('locker-preview');
  preview.innerHTML = avatarSvg(look, { full: true });
  preview.className = `lk-preview ${picked ? picked.rarity || 'common' : ''}${picked && !ownsCosmetic(picked) ? ' trying' : ''}`;

  if (browsing) renderGrid(tab); else renderLoadout();
  renderDetails();
}

// Your loadout: one tile per slot showing what you're wearing, plus the Halloween shop
function renderLoadout() {
  const loadout = lockerEl('locker-loadout');
  loadout.innerHTML = '';
  const spooky = COSMETICS.filter(c => c.event === HALLOWEEN.event);
  const event = document.createElement('button');
  event.className = 'lk-tile lk-event-tile';
  event.innerHTML = `<span class="lk-event-new">NEW!</span><span class="lk-event-icon" aria-hidden="true">🎃</span>
    <span class="lk-event-text"><strong>Halloween Shop <em class="lk-event-until">⏰ Until 11/8</em></strong><span>${spooky.filter(ownsCosmetic).length}/${spooky.length} collected</span></span>`;
  event.addEventListener('click', () => browse(HALLOWEEN.id));
  loadout.appendChild(event);

  for (const slot of SLOTS) {
    const tile = makeTile(cosmetic(coder.look[slot.id]) || cosmetic(DEFAULT_LOOK[slot.id]), slot.name);
    tile.addEventListener('click', () => browse(slot.id));
    loadout.appendChild(tile);
  }
  const owned = COSMETICS.filter(ownsCosmetic).length;
  lockerEl('locker-count').textContent = `${owned}/${COSMETICS.length} items`;
}

function renderGrid(tab) {
  const grid = lockerEl('locker-grid');
  grid.innerHTML = '';
  const items = COSMETICS.filter(c => (tab.event ? c.event === tab.event : c.slot === tab.id));
  lockerEl('locker-count').textContent = `${items.filter(ownsCosmetic).length}/${items.length} owned`;
  for (const item of items) {
    const tile = makeTile(item);
    tile.classList.toggle('selected', picked === item);
    tile.addEventListener('click', () => pick(item));
    grid.appendChild(tile);
  }
}

function renderDetails() {
  const action = lockerEl('locker-action');
  const details = lockerEl('locker-details');
  action.onclick = null;
  if (!picked) {
    // Nothing picked: tell them how the locker works
    const earned = earnedStars();
    details.className = 'lk-details';
    lockerEl('locker-rarity').textContent = 'Your coder';
    lockerEl('locker-item-name').textContent = lockerSlot ? 'Pick an item' : 'Pick a slot';
    lockerEl('locker-item-type').textContent = lockerSlot
      ? 'Click an item to try it on. Items you own go on right away.'
      : 'Click any slot to change that part of your coder.';
    lockerEl('locker-item-note').textContent = earned === 0
      ? 'Earn ★ by clearing Tower Defense levels (up to 3 each) and hitting milestones in Data Clicker and Adventure, then spend them here!'
      : `You've earned ${earned} ★. Get more by replaying Tower Defense levels for 3 stars, or by hitting milestones in Data Clicker and Adventure.`;
    action.hidden = true;
    return;
  }
  const owned = ownsCosmetic(picked);
  const short = picked.price - starsToSpend();
  details.className = `lk-details ${picked.rarity || 'common'}`;
  lockerEl('locker-rarity').textContent = RARITY_NAMES[picked.rarity || 'common'];
  lockerEl('locker-item-name').textContent = picked.name;
  lockerEl('locker-item-type').textContent = slotName(picked.slot) + (picked.event ? ' · 🎃 Halloween' : '');
  lockerEl('locker-item-note').textContent = picked.note || (owned ? 'You own this.' : 'Trying it on! Buy it to keep it.');
  action.hidden = false;
  action.className = 'lk-action';
  if (owned) {
    action.textContent = '✓ Equipped';
    action.classList.add('done');
  } else if (short > 0) {
    action.textContent = `Need ${short} more ★`;
    action.classList.add('poor');
  } else {
    action.textContent = `Buy  ★ ${picked.price}`;
    action.onclick = buyPicked;
  }
}

function browse(slotId) {
  lockerSlot = slotId;
  // Start on what you're wearing in that slot
  picked = slotId === HALLOWEEN.id ? null : cosmetic(coder.look[slotId]);
  renderLocker();
  (lockerEl('locker-grid').querySelector('.selected') || lockerEl('locker-grid').querySelector('.lk-tile'))?.focus();
}

function backToLoadout() {
  const from = lockerSlot;
  lockerSlot = null;
  picked = null;
  renderLocker();
  const tiles = [...lockerEl('locker-loadout').querySelectorAll('.lk-tile')];
  (from === HALLOWEEN.id ? tiles[0] : tiles[SLOTS.findIndex(s => s.id === from) + 1])?.focus();
}

// Click an item: wear it if you own it, or try it on if you don't
function pick(item) {
  picked = item;
  if (ownsCosmetic(item) && coder.look[item.slot] !== item.id) {
    equipCosmetic(item);
    showCoderMini();
    celebrate(false);
  }
  renderLocker();
  lockerEl('locker-grid').querySelector(`[data-id="${item.id}"]`).focus();
}

function buyPicked() {
  if (!picked || !buyCosmetic(picked)) return;
  showCoderMini();
  renderLocker();
  celebrate(true);
  lockerEl('locker-grid').querySelector(`[data-id="${picked.id}"]`)?.focus();
}

// The big coder bounces when you put something on, and bursts with stars when you buy it
function celebrate(bought) {
  const stage = lockerDialog.querySelector('.lk-stage');
  stage.classList.remove('equip', 'bought');
  void stage.offsetWidth; // restart the animation
  stage.classList.add(bought ? 'bought' : 'equip');
}

lockerEl('locker-back').addEventListener('click', backToLoadout);
// Esc goes back to your loadout first, then closes the locker
lockerDialog.addEventListener('cancel', e => {
  if (lockerSlot === null) return;
  e.preventDefault();
  backToLoadout();
});

lockerEl('btn-coder').addEventListener('click', openLocker);
showCoderMini();
// The coder in the game's top bar links here with #coder
if (location.hash === '#coder') openLocker();
