// Little bits of feedback that make the game feel alive and show players what to do next:
// - the top bar numbers pop and float "+5" / "-1" when they change
// - your coder in the top bar cheers for right answers and wobbles for wrong ones
// - a freshly unlocked tower bursts open in the tower bar
// - placing a tower sends out a ring on the board
// - the next thing to click (a locked tower, or Start) glows for new players

// ---------- Top bar numbers ----------
let lastShown = null;

function popStat(textEl, change) {
  const stat = textEl.parentElement;
  stat.classList.remove('gain', 'loss');
  void stat.offsetWidth; // restart the animation
  stat.classList.add(change > 0 ? 'gain' : 'loss');

  const chip = document.createElement('span');
  chip.className = `stat-chip ${change > 0 ? 'gain' : 'loss'}`;
  chip.textContent = change > 0 ? `+${change}` : change;
  stat.appendChild(chip);
  chip.addEventListener('animationend', () => chip.remove());
}

// A new game (or loading one) resets the numbers without a pop
hooks.newGame.push(() => { lastShown = null; });

hooks.hud.push(() => {
  const now = { data: state.data, bytes: state.bytes };
  // Don't celebrate when a whole new game loads
  if (lastShown && state.wave === lastShown.wave) {
    if (now.bytes !== lastShown.bytes) popStat(bytesText, now.bytes - lastShown.bytes);
    if (now.data !== lastShown.data) popStat(dataText, now.data - lastShown.data);
  }
  lastShown = { ...now, wave: state.wave };

  // Point new players at the next step
  const nothingUnlocked = unlocked.size === 0 && !state.over;
  for (const id of Object.keys(TOWERS)) toolButtons[id].classList.toggle('nudge', nothingUnlocked);
  waveButton.classList.toggle('nudge', !state.waveActive && !state.over && state.wave === 0 && state.towers.length > 0);
});

// ---------- Your coder reacts to your answers ----------
const hudCoder = document.getElementById('hud-coder');
answerListeners.push(correct => {
  hudCoder.classList.remove('cheer', 'oops');
  void hudCoder.offsetWidth;
  hudCoder.classList.add(correct ? 'cheer' : 'oops');
});
hudCoder.addEventListener('animationend', () => hudCoder.classList.remove('cheer', 'oops'));

// ---------- Unlocking a tower ----------
hooks.unlock.push(id => {
  const btn = toolButtons[id];
  btn.classList.remove('unlocking');
  void btn.offsetWidth;
  btn.classList.add('unlocking');
  btn.addEventListener('animationend', () => btn.classList.remove('unlocking'), { once: true });
  playSound('upgrade');
});

// ---------- Placing a tower ----------
const rings = [];
let towerCount = 0;
hooks.newGame.push(() => { towerCount = 0; });
let lastFrame = performance.now();

hooks.hud.push(() => {
  if (state.towers.length === towerCount + 1) {
    const t = state.towers[state.towers.length - 1];
    rings.push({ x: t.x, y: t.y, age: 0, color: TOWERS[t.type].color });
  }
  towerCount = state.towers.length;
});

hooks.draw.push(() => {
  const now = performance.now();
  const dt = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;
  for (const ring of rings) {
    ring.age += dt;
    const t = ring.age / 0.5;
    ctx.globalAlpha = Math.max(0, 1 - t);
    ctx.strokeStyle = ring.color;
    ctx.lineWidth = 4 * (1 - t) + 1;
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, 10 + t * 40, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  for (let i = rings.length - 1; i >= 0; i--) if (rings[i].age > 0.5) rings.splice(i, 1);
});
