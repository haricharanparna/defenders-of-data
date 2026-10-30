// The Ransomware Boss: shows up every 10th wave, tougher each time.
// Every few seconds it encrypts (locks) one of your towers, which stops firing.
// Click a 🔒 tower and answer a question about ransomware to restore it from backup,
// and each right answer also hits the boss hard. If it reaches the core, all your data is locked.
// Uses BOSS_QUESTIONS from content.js.

const ENCRYPT_EVERY = 7;      // seconds between towers getting locked (a bit faster for each later boss)
const RESTORE_DAMAGE = 0.08;  // share of the boss's max HP each right answer takes off

let encryptTimer = 0;
let bossAnnounced = false;
let beams = [];               // red beams drawn when the boss locks a tower

const findBoss = () => state.enemies.find(e => THREATS[e.type].boss && !e.gone);

function encryptTower(boss) {
  const targets = state.towers.filter(t => !t.encrypted);
  if (targets.length === 0) return;
  // Lock the working tower closest to the boss
  targets.sort((a, b) => Math.hypot(a.x - boss.x, a.y - boss.y) - Math.hypot(b.x - boss.x, b.y - boss.y));
  const tower = targets[0];
  tower.encrypted = true;
  playSound('encrypt');
  addFloater(tower.x, tower.y - 22, '🔒 Encrypted!', '#ff3d8b');
  beams.push({ x: boss.x, y: boss.y, tower, life: 0.4 });
}

function openBossQuestion(tower) {
  // Later bosses ask harder questions
  const [q] = drawQuestions(BOSS_QUESTIONS, bossNumber(state.wave), 1);
  openQuestion({
    tag: '👾 Ransomware Boss',
    title: 'Restore from Backup',
    prompt: q.prompt,
    options: q.options,
  }, correct => {
    state.selected = null;
    if (!correct) {
      if (correct === false) showToast('Still locked! Read why, then click the tower to try another question.');
      return;
    }
    tower.encrypted = false;
    tower.cooldown = 0;
    playSound('upgrade');
    addFloater(tower.x, tower.y - 22, 'Restored!', '#7cff6b');
    const boss = findBoss();
    if (boss) {
      addFloater(boss.x, boss.y - 40, `Backup restored! -${RESTORE_DAMAGE * 100}%`, '#7cff6b');
      hurt(boss, boss.maxHp * RESTORE_DAMAGE);
    }
  });
}

hooks.waveStart.push(() => {
  encryptTimer = 0;
  bossAnnounced = false;
});

hooks.update.push(dt => {
  beams.forEach(b => { b.life -= dt; });
  beams = beams.filter(b => b.life > 0);
  const boss = findBoss();
  if (!boss) {
    // Boss beaten: every locked tower comes back
    if (state.towers.some(t => t.encrypted)) {
      state.towers.forEach(t => { t.encrypted = false; });
      showToast('👾 Ransomware defeated! Every tower is restored. Back up your files in real life too!');
    }
    return;
  }
  if (!bossAnnounced) {
    bossAnnounced = true;
    playSound('boss');
    showToast('⚠️ The RANSOMWARE BOSS is here! It locks your towers. Click a 🔒 tower to restore it.');
  }
  encryptTimer += dt;
  if (encryptTimer >= Math.max(4, ENCRYPT_EVERY - (bossNumber(state.wave) - 1))) {
    encryptTimer = 0;
    encryptTower(boss);
  }
});

hooks.draw.push(() => {
  // Locked towers: dark red cover with a padlock
  for (const t of state.towers) {
    if (!t.encrypted) continue;
    ctx.fillStyle = 'rgba(120, 0, 40, 0.75)';
    ctx.fillRect(t.x - 18, t.y - 18, 36, 36);
    drawEmoji('🔒', t.x, t.y, 20);
  }

  // The red beam when the boss locks a tower
  for (const b of beams) {
    ctx.globalAlpha = Math.max(0, b.life / 0.4);
    ctx.strokeStyle = '#ff3d8b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.tower.x, b.tower.y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  const boss = findBoss();
  if (!boss) return;

  // Big health bar across the top
  const w = 420;
  const x = canvas.width / 2 - w / 2;
  ctx.fillStyle = 'rgba(7, 11, 31, 0.85)';
  ctx.fillRect(x - 10, 6, w + 20, 44);
  ctx.font = 'bold 13px Nunito, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ff3d8b';
  ctx.fillText('👾 RANSOMWARE BOSS', canvas.width / 2, 18);
  ctx.fillStyle = '#1a2560';
  ctx.fillRect(x, 30, w, 12);
  ctx.fillStyle = '#ff3d8b';
  ctx.fillRect(x, 30, w * Math.max(0, boss.hp / boss.maxHp), 12);

  if (state.towers.some(t => t.encrypted)) {
    const hint = '🔒 Click a locked tower and answer to restore it from backup!';
    ctx.font = 'bold 15px Nunito, sans-serif';
    const hw = ctx.measureText(hint).width + 24;
    ctx.fillStyle = 'rgba(120, 0, 40, 0.85)';
    ctx.fillRect(canvas.width / 2 - hw / 2, 56, hw, 26);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(hint, canvas.width / 2, 69);
  }
});
