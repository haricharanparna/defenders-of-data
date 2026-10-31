// Secret Message: once every level (or wave), a small text bubble pops up somewhere off the track.
// It only stays for 5 seconds, so you have to spot it. Click it and answer its question right,
// and your towers do double damage for the rest of that level.
// Questions come from the tower upgrades and from the skills you've learned so far (content.js).

const BONUS_STAY = 5;                 // seconds the bubble stays (real seconds, whatever the game speed)
const BONUS_APPEAR = [2, 9];          // it shows up between these many seconds into the level
const BONUS_DAMAGE = 2;               // damage multiplier when you answer right
const BONUS_SIZE = 13;                // bubble radius in pixels: small enough to be easy to miss

let bonus = null;   // { appearIn, x, y, life } for this level's bubble, or null once it's used up
const boostStat = el('boost-stat');


// Somewhere empty: not on the track, not on a tower, not right at the edges
function bonusSpot() {
  const spots = [];
  for (let c = 1; c < COLS - 1; c++) {
    for (let r = 1; r < ROWS - 1; r++) if (canBuild(c, r)) spots.push([c, r]);
  }
  const [c, r] = pickRandom(spots);
  // A little off the middle of the tile so it doesn't sit on a neat grid
  return { x: c * TILE + TILE / 2 + (Math.random() - 0.5) * 14, y: r * TILE + TILE / 2 + (Math.random() - 0.5) * 14 };
}

hooks.waveStart.push(() => {
  const [min, max] = BONUS_APPEAR;
  bonus = { appearIn: min + Math.random() * (max - min), life: 0, shown: false };
  state.boosted = false;
  boostStat.hidden = true;
});

hooks.waveEnd.push(() => {
  bonus = null;
  state.boosted = false;
  boostStat.hidden = true;
});
hooks.newGame.push(() => {
  bonus = null;
  boostStat.hidden = true;
});

hooks.update.push(dt => {
  if (!bonus || !state.waveActive) return;
  const realDt = dt / state.speed;
  if (!bonus.shown) {
    bonus.appearIn -= realDt;
    if (bonus.appearIn <= 0) {
      Object.assign(bonus, bonusSpot(), { shown: true, life: BONUS_STAY });
      playSound('dm');
    }
    return;
  }
  bonus.life -= realDt;
  if (bonus.life <= 0) bonus = null;   // too slow, it's gone for this level
});

hooks.draw.push(() => {
  if (!bonus || !bonus.shown) return;
  const age = BONUS_STAY - bonus.life;
  // Fade in, gently bob, and blink in the last second
  const fadeIn = Math.min(1, age / 0.3);
  const blink = bonus.life < 1 && Math.floor(bonus.life * 8) % 2 === 0 ? 0.35 : 1;
  const bob = Math.sin(age * 4) * 2;
  const x = bonus.x, y = bonus.y + bob;

  ctx.save();
  ctx.globalAlpha = fadeIn * blink;
  ctx.shadowColor = '#ffd23f';
  ctx.shadowBlur = 8;
  // Speech bubble
  ctx.fillStyle = '#ffd23f';
  ctx.beginPath();
  ctx.roundRect(x - BONUS_SIZE, y - BONUS_SIZE * 0.75, BONUS_SIZE * 2, BONUS_SIZE * 1.5, 6);
  ctx.moveTo(x - 4, y + BONUS_SIZE * 0.7);
  ctx.lineTo(x - 8, y + BONUS_SIZE * 1.2);
  ctx.lineTo(x + 2, y + BONUS_SIZE * 0.7);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Three typing dots
  ctx.fillStyle = '#070b1f';
  for (let i = -1; i <= 1; i++) {
    const lift = Math.sin(age * 8 - i * 1.2) > 0.6 ? 1.5 : 0;
    ctx.beginPath();
    ctx.arc(x + i * 6, y - lift, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
});

const onBonus = p => bonus && bonus.shown && Math.hypot(p.x - bonus.x, p.y - bonus.y) <= BONUS_SIZE + 6;

// Runs before the board's own click handler, so clicking the bubble doesn't place a tower
canvas.addEventListener('click', e => {
  if (state.over || !onBonus(pointFromEvent(e))) return;
  e.stopImmediatePropagation();
  bonus = null;
  openBonusQuestion();
}, true);

canvas.addEventListener('mousemove', e => {
  if (onBonus(pointFromEvent(e))) canvas.style.cursor = 'pointer';
});

function bonusPool() {
  const level = state.wave + 1;
  return [
    ...Object.values(UPGRADES).flat(),
    ...SKILLS.filter(skill => skill.level <= level).flatMap(skill => skill.questions),
  ];
}

function openBonusQuestion() {
  const [q] = drawQuestions(bonusPool(), tierFor(state.wave), 1);
  openQuestion({
    tag: '💬 Secret Message',
    title: 'Answer for double damage!',
    prompt: q.prompt,
    msg: q.msg,
    options: q.options,
  }, correct => {
    if (!correct) {
      if (correct === false) showToast('No bonus this time. Watch for the next secret message!');
      return;
    }
    state.boosted = true;
    boostStat.hidden = false;
    playSound('upgrade');
    showToast(`⚡ Double damage for the rest of this ${LEVELS_MODE ? 'level' : 'wave'}!`);
  });
}
