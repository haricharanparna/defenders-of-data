// The Coder Locker on the title screen: spend the stars you earn in Levels mode on cosmetics for your coder.
// Uses COSMETICS, coder, avatarSvg() and the buy/equip helpers from avatar.js.

const lockerDialog = document.getElementById('dlg-coder');
const lockerEl = id => document.getElementById(id);
let lockerSlot = SLOTS[0].id;
let tryingOn = null; // an item you're previewing but don't own yet

function showCoderMini() {
  lockerEl('coder-mini').innerHTML = avatarSvg();
}

function openLocker() {
  tryingOn = null;
  renderLocker();
  lockerDialog.showModal();
  lockerEl('locker-tabs').querySelector('[aria-selected="true"]').focus();
}

function renderLocker() {
  const look = tryingOn ? { ...coder.look, [tryingOn.slot]: tryingOn.id } : coder.look;
  lockerEl('locker-preview').innerHTML = avatarSvg(look);
  lockerEl('locker-preview').classList.toggle('trying', !!tryingOn);

  const earned = earnedStars();
  lockerEl('locker-balance').textContent = starsToSpend();
  lockerEl('locker-earned').textContent = earned === 0
    ? 'Clear levels in Levels mode to earn up to 3 stars each!'
    : `You've earned ${earned} stars in Levels mode. Replay levels for 3 stars to earn more.`;

  // Buy box for the item you're trying on
  lockerEl('locker-buy').hidden = !tryingOn;
  if (tryingOn) {
    const short = tryingOn.price - starsToSpend();
    lockerEl('locker-buy-name').textContent = tryingOn.note ? `${tryingOn.name}: ${tryingOn.note}` : tryingOn.name;
    const buyBtn = lockerEl('locker-buy-btn');
    buyBtn.disabled = short > 0;
    buyBtn.textContent = short > 0 ? `Need ${short} more ★` : `Buy for ★ ${tryingOn.price}`;
  }

  // Tabs
  const tabs = lockerEl('locker-tabs');
  tabs.innerHTML = '';
  for (const slot of SLOTS) {
    const tab = document.createElement('button');
    tab.className = 'locker-tab';
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', slot.id === lockerSlot);
    tab.textContent = slot.name;
    tab.addEventListener('click', () => {
      lockerSlot = slot.id;
      tryingOn = null;
      renderLocker();
      tabs.querySelector('[aria-selected="true"]').focus();
    });
    tabs.appendChild(tab);
  }

  // Items in this tab, each shown on your own coder
  const grid = lockerEl('locker-grid');
  grid.innerHTML = '';
  for (const item of COSMETICS.filter(c => c.slot === lockerSlot)) {
    const owned = ownsCosmetic(item);
    const wearing = coder.look[item.slot] === item.id;
    const card = document.createElement('button');
    card.dataset.id = item.id;
    card.className = `locker-item ${item.rarity || 'common'}${wearing ? ' wearing' : ''}${tryingOn === item ? ' trying' : ''}${owned ? '' : ' for-sale'}`;
    card.innerHTML = `
      <span class="locker-thumb">${avatarSvg({ ...coder.look, [item.slot]: item.id })}</span>
      <span class="locker-name"></span>
      <span class="locker-price">${wearing ? 'Wearing' : owned ? 'Owned' : `★ ${item.price}`}</span>`;
    card.querySelector('.locker-name').textContent = item.name;
    card.setAttribute('aria-label', `${item.name}, ${wearing ? 'wearing' : owned ? 'owned' : `costs ${item.price} stars`}${item.rarity ? `, ${item.rarity}` : ''}`);
    card.addEventListener('click', () => {
      if (owned) {
        equipCosmetic(item);
        tryingOn = null;
        showCoderMini();
      } else {
        tryingOn = item;
      }
      renderLocker();
      grid.querySelector(`[data-id="${item.id}"]`).focus();
    });
    grid.appendChild(card);
  }
}

lockerEl('locker-buy-btn').addEventListener('click', () => {
  if (!tryingOn || !buyCosmetic(tryingOn)) return;
  showToast(`★ Unlocked ${tryingOn.name}!`);
  tryingOn = null;
  showCoderMini();
  renderLocker();
});
lockerEl('locker-buy-cancel').addEventListener('click', () => {
  tryingOn = null;
  renderLocker();
});

lockerEl('btn-coder').addEventListener('click', openLocker);
showCoderMini();
// The coder in the game's top bar links here with #coder
if (location.hash === '#coder') openLocker();
