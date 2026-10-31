// Starts Tower Defense once every other file has loaded and plugged in its hooks.
newGame();
loadSave();
// New game (no saved game to continue): show the directions first,
// then in Levels mode the Level 1 briefing
if (!anyDialogOpen()) openHowTo(LEVELS_MODE ? () => showBriefing(1) : null);
requestAnimationFrame(loop);
document.getElementById('hud-coder').innerHTML = avatarSvg();
