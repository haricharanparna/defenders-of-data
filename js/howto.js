// How to Play: a video of the game playing itself, with a narrator (demo.js).
// It plays when you start Tower Defense, and again from the ? button.
// After it, Levels mode goes on to the Level 1 briefing (briefing.js).

function openHowTo(afterClose = null) {
  openDemo('td', afterClose);
}

document.getElementById('btn-how').addEventListener('click', () => {
  if (!anyDialogOpen()) openHowTo();
});
