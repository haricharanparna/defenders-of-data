// Tower upgrades: click a tower on the board to open its menu.
// Upgrading costs bytes AND a right answer to a deeper question about that tower's safety habit.
// Uses UPGRADES from content.js.

const upgradeDialog = el('dlg-upgrade');
const upgradeUnused = {};   // questions not asked yet, per tower type
let menuTower = null;

const upgradeCost = tower => Math.round(TOWERS[tower.type].cost * 0.8 * tower.level);
const stars = level => '⭐'.repeat(level) + '☆'.repeat(MAX_LEVEL - level);

function openTowerMenu(tower) {
  // Towers locked by the Ransomware Boss need restoring first (boss.js)
  if (tower.encrypted) {
    openBossQuestion(tower);
    return;
  }
  menuTower = tower;
  const info = TOWERS[tower.type];
  const now = towerStats(tower);
  const maxed = tower.level >= MAX_LEVEL;
  const cost = upgradeCost(tower);

  el('up-emoji').textContent = info.emoji;
  el('up-title').textContent = info.name;
  el('up-stars').textContent = `${stars(tower.level)}  Level ${tower.level}`;
  el('up-habit').textContent = `Safety habit: ${info.habit}`;

  let rows = `<tr><th></th><th>Now</th>${maxed ? '' : '<th>Next level</th>'}</tr>`;
  if (!maxed) {
    const next = towerStats({ ...tower, level: tower.level + 1 });
    rows += `<tr><td>💥 Damage</td><td>${Math.round(now.damage)}</td><td class="up-next">${Math.round(next.damage)}</td></tr>`;
    rows += `<tr><td>📏 Range</td><td>${Math.round(now.range)}</td><td class="up-next">${Math.round(next.range)}</td></tr>`;
  } else {
    rows += `<tr><td>💥 Damage</td><td>${Math.round(now.damage)}</td></tr><tr><td>📏 Range</td><td>${Math.round(now.range)}</td></tr>`;
  }
  el('up-stats').innerHTML = rows;

  const go = el('up-go');
  go.hidden = maxed;
  go.textContent = `⬆ Upgrade (💾 ${cost})`;
  go.disabled = state.bytes < cost || state.over;
  el('up-note').textContent = maxed
    ? '🏆 Max level! This tower is as strong as it gets.'
    : state.bytes < cost
      ? `You need ${cost - state.bytes} more bytes to upgrade.`
      : 'Answer a question about this safety habit to upgrade. You only pay if you get it right!';
  el('up-sell').textContent = `💰 Sell (+${Math.floor((info.cost + tower.spent) * SELL_REFUND)})`;

  upgradeDialog.showModal();
  (go.hidden || go.disabled ? el('up-close') : go).focus();
}

function closeTowerMenu() {
  upgradeDialog.close();
  state.selected = null;
}

function startUpgrade() {
  const tower = menuTower;
  const info = TOWERS[tower.type];
  upgradeDialog.close();

  if (!upgradeUnused[tower.type] || upgradeUnused[tower.type].length === 0) {
    upgradeUnused[tower.type] = shuffle(UPGRADES[tower.type]);
  }
  const q = upgradeUnused[tower.type].pop();

  openQuestion({
    tag: `⬆ Upgrade ${info.emoji} ${info.name}`,
    title: 'Upgrade Challenge',
    prompt: q.prompt,
    msg: q.msg,
    options: q.options,
  }, correct => {
    state.selected = null;
    if (!correct) {
      if (correct === false) showToast('Not quite! Read why, then click the tower to try a different question.');
      return;
    }
    const cost = upgradeCost(tower);
    if (state.bytes < cost || !state.towers.includes(tower)) return;
    state.bytes -= cost;
    tower.spent += cost;
    tower.level++;
    playSound('upgrade');
    addFloater(tower.x, tower.y - 20, `Level ${tower.level}!`, '#ffd23f');
    showToast(`${info.emoji} ${info.name} upgraded to level ${tower.level}!`);
    updateHud();
  });
}

el('up-go').addEventListener('click', startUpgrade);
el('up-close').addEventListener('click', closeTowerMenu);
el('up-sell').addEventListener('click', () => {
  closeTowerMenu();
  sellTower(menuTower);
});
upgradeDialog.addEventListener('cancel', e => {
  e.preventDefault();
  closeTowerMenu();
});
