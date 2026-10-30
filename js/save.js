// Saving: progress is kept in this browser's localStorage, so it stays on the computer you play on.
// - Unlocked towers are saved as soon as you unlock them.
// - The game itself (wave, data, bytes, towers, Threat Index, missed answers) is saved between waves.
//   If you leave in the middle of a wave, you come back to the start of that wave.
// Loaded before td.js, which calls saveGame() from updateHud(). main.js calls loadSave() at the start.
// (Badges and the mute button are saved separately, in rewards.js and sound.js.)

const SAVE_KEY = 'defenders-of-data-save';

// Don't save until the old save has been read, or the fresh game at startup would overwrite it
let saveReady = false;

// localStorage can be blocked (private windows, some school computers), so never let it crash the game
function readSave() {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY)) || {};
  } catch {
    return {};
  }
}

function writeSave(save) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    // Nothing we can do; the game still works, it just won't remember
  }
}

function saveGame() {
  if (!saveReady) return;
  const save = readSave();
  save.unlocked = [...unlocked];
  save.best = Math.max(save.best || 0, bestWave, state.wave);

  if (state.over) {
    save.game = null;
  } else if (!state.waveActive) {
    save.game = {
      data: state.data,
      bytes: state.bytes,
      wave: state.wave,
      towers: state.towers.map(t => ({ type: t.type, c: t.c, r: t.r, level: t.level, spent: t.spent })),
      streak: state.streak,
      charge: state.charge,
      dmSafe: state.dmSafe,
      perfectQuiz: state.perfectQuiz,
      blasts: state.blasts,
      index: [...state.index],
      seen: [...state.seen],
      stopped: state.stopped,
      leaked: state.leaked,
      stats: state.stats,
      missed,
    };
  }
  writeSave(save);
}

// Called once when the page opens. Restores unlocked towers, then offers to continue a saved game.
function loadSave() {
  const save = readSave();
  bestWave = save.best || 0;
  for (const id of save.unlocked || []) {
    if (TOWERS[id]) unlocked.add(id);
  }

  const game = save.game;
  const hasProgress = game && (game.wave > 0 || game.towers.length > 0);
  if (!hasProgress) {
    saveReady = true;
    updateHud();
    return;
  }

  el('continue-summary').textContent =
    `You were on Wave ${game.wave + 1} with ❤️ ${game.data} data, 💾 ${game.bytes} bytes and ${game.towers.length} tower${game.towers.length === 1 ? '' : 's'}.`;
  const dialog = el('dlg-continue');
  dialog.showModal();
  el('btn-continue').focus();

  el('btn-continue').onclick = () => {
    saveReady = true;
    restoreGame(game);
    dialog.close();
    showToast(`Welcome back! Ready for Wave ${game.wave + 1}.`);
  };
  el('btn-fresh').onclick = () => {
    saveReady = true;
    dialog.close();
    newGame();
    showToast('New game started. Your unlocked towers are still unlocked!');
  };
  // Esc means "continue": the safer choice, so nobody loses progress by accident
  dialog.oncancel = e => { e.preventDefault(); el('btn-continue').click(); };
}

function restoreGame(game) {
  state.data = game.data;
  state.bytes = game.bytes;
  state.wave = game.wave;
  state.towers = [];
  for (const t of game.towers) {
    if (TOWERS[t.type] && canBuild(t.c, t.r)) state.towers.push(makeTower(t.type, t.c, t.r, t.level || 1, t.spent || 0));
  }
  state.streak = game.streak || 0;
  state.charge = game.charge || 0;
  state.dmSafe = game.dmSafe || 0;
  state.perfectQuiz = game.perfectQuiz || false;
  state.blasts = game.blasts || 0;
  state.index = new Set(game.index);
  state.seen = new Set(game.seen);
  state.stopped = game.stopped || {};
  state.leaked = game.leaked || {};
  state.stats = game.stats || state.stats;
  missed.length = 0;
  missed.push(...(game.missed || []));
  if (typeof updateMissedBadge === 'function') updateMissedBadge();
  updateHud();
}
