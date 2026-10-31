// Starts Tower Defense once every other file has loaded and plugged in its hooks.
newGame();
loadSave();
// First time in Levels mode (no saved game to continue): start with the Level 1 briefing
if (LEVELS_MODE && !anyDialogOpen()) showBriefing(1);
requestAnimationFrame(loop);
document.getElementById('hud-coder').innerHTML = avatarSvg();
