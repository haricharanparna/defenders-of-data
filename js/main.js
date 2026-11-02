// Starts Tower Defense once every other file has loaded and plugged in its hooks.
newGame();
loadSave();
// New game (no saved game to continue): show the How to Play video first,
// then in Levels mode the Level 1 briefing. (Not inside the video itself!)
if (!anyDialogOpen() && !DEMO_MODE) openHowTo(LEVELS_MODE ? () => showBriefing(1) : null);
requestAnimationFrame(loop);
document.getElementById('hud-coder').innerHTML = avatarSvg();

// Every few minutes of play a hacker breaks in (hacked.js). Too slow, and they take half your bytes.
const hackAttack = setupHackAttack({
  isPlaying: () => state.waveActive && !state.paused && !state.over && !anyDialogOpen(),
  lossText: 'they steal half your bytes',
  lose: () => {
    const lost = Math.ceil(state.bytes / 2);
    state.bytes -= lost;
    updateHud();
    return `${lost} bytes, half of everything you had`;
  },
  onAnswer: (correct, item) => {
    reportAnswer(correct);
    if (!correct) {
      recordMiss({
        kind: '💀 Hacked!',
        msg: item,
        yours: item.answer === 'scam' ? 'Real' : 'Scam',
        right: item.answer === 'scam' ? 'Scam' : 'Real',
        why: item.why,
      });
    }
  },
});
