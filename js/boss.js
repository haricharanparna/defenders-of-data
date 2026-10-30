// The Ransomware Boss: shows up every 10th wave, tougher each time.
// Every few seconds it encrypts (locks) one of your towers, which stops firing.
// Click a 🔒 tower and answer a question about ransomware to restore it from backup,
// and each right answer also hits the boss hard. If it reaches the core, all your data is locked.
//
// Level 100 in Levels mode is the final boss, ☠️ Omega Ransomware:
//  - 3 phases. Each new phase calls in more threats and locks towers faster (2 at a time in phase 3)
//  - Only the hardest questions (FINAL_BOSS_QUESTIONS), and a wrong answer heals it
//  - A dramatic entrance, a pulsing red screen and a huge health bar
// Uses BOSS_QUESTIONS and FINAL_BOSS_QUESTIONS from content.js.

const ENCRYPT_EVERY = 7;      // seconds between towers getting locked (a bit faster for each later boss)
const RESTORE_DAMAGE = 0.08;  // share of the boss's max HP each right answer takes off
const FINAL_ENCRYPT = [4, 3, 2.5]; // Omega: seconds between locks in phase 1, 2 and 3
const FINAL_RESTORE_DAMAGE = 0.05;
const FINAL_WRONG_HEAL = 0.04;     // Omega heals this much when you answer wrong

let encryptTimer = 0;
let bossAnnounced = false;
let beams = [];               // red beams drawn when the boss locks a tower
let banner = null;            // big text across the board: { title, sub, color, time }
let omegaFight = false;       // the final boss is on the board

const findBoss = () => state.enemies.find(e => THREATS[e.type].boss && !e.gone);
const isFinal = boss => boss && THREATS[boss.type].final;

function showBanner(title, sub, color = '#ff3d8b') {
  banner = { title, sub, color, time: 3 };
  // Shake the board
  canvas.classList.remove('shake');
  void canvas.offsetWidth;  // restart the animation
  canvas.classList.add('shake');
}

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
  const final = isFinal(findBoss());
  // Later bosses ask harder questions, and Omega asks the hardest of all
  const [q] = final ? drawQuestions(FINAL_BOSS_QUESTIONS, 3, 1) : drawQuestions(BOSS_QUESTIONS, bossNumber(state.wave), 1);
  const damage = final ? FINAL_RESTORE_DAMAGE : RESTORE_DAMAGE;
  openQuestion({
    tag: final ? '☠️ FINAL BOSS: Omega Ransomware' : '👾 Ransomware Boss',
    title: final ? 'Expert Recovery' : 'Restore from Backup',
    prompt: q.prompt,
    options: q.options,
  }, correct => {
    state.selected = null;
    if (correct === false && final) {
      // Omega feeds on mistakes
      const boss = findBoss();
      if (boss) {
        boss.hp = Math.min(boss.maxHp, boss.hp + boss.maxHp * FINAL_WRONG_HEAL);
        addFloater(boss.x, boss.y - 50, `Omega healed +${Math.round(FINAL_WRONG_HEAL * 100)}%!`, '#ff3d8b');
      }
      showToast('☠️ Wrong! Omega feeds on mistakes and heals. Read why, then try another question.');
      return;
    }
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
      addFloater(boss.x, boss.y - 50, `Backup restored! -${Math.round(damage * 100)}%`, '#7cff6b');
      hurt(boss, boss.maxHp * damage);
    }
  });
}

// Omega's phases: 1 (full health), 2 (below 2/3), 3 (below 1/3)
function finalPhase(boss) {
  const left = boss.hp / boss.maxHp;
  return left > 2 / 3 ? 1 : left > 1 / 3 ? 2 : 3;
}

function enterPhase(boss, phase) {
  boss.phase = phase;
  playSound('boss');
  showBanner(`PHASE ${phase}`, phase === 2 ? 'Omega calls in reinforcements!' : 'Omega locks 2 towers at a time!');
  // Reinforcements rush in
  const extra = phase === 2 ? [['worm', 10], ['phisher', 6]] : [['cracker', 4], ['catfish', 5], ['worm', 10]];
  let at = state.waveTime;
  for (const [type, count] of extra) {
    for (let i = 0; i < count; i++) state.spawnQueue.push({ type, at: (at += 0.35) });
  }
  state.spawnQueue.sort((a, b) => a.at - b.at);
}

hooks.newGame.push(() => {
  banner = null;
  omegaFight = false;
  canvas.classList.remove('shake');
});

hooks.waveStart.push(() => {
  encryptTimer = 0;
  bossAnnounced = false;
});

hooks.update.push(dt => {
  beams.forEach(b => { b.life -= dt; });
  beams = beams.filter(b => b.life > 0);
  if (banner && (banner.time -= dt / state.speed) <= 0) banner = null;

  const boss = findBoss();
  if (!boss) {
    if (omegaFight) {
      omegaFight = false;
      showBanner('OMEGA DEFEATED', 'You saved the data! Clear the last threats to win!', '#7cff6b');
      playSound('badge');
    }
    // Boss beaten: every locked tower comes back
    if (state.towers.some(t => t.encrypted)) {
      state.towers.forEach(t => { t.encrypted = false; });
      showToast('👾 Ransomware defeated! Every tower is restored. Back up your files in real life too!');
    }
    return;
  }

  const final = isFinal(boss);
  if (!bossAnnounced) {
    bossAnnounced = true;
    playSound('boss');
    if (final) {
      boss.phase = 1;
      omegaFight = true;
      showBanner('☠️ OMEGA RANSOMWARE', 'The final boss has arrived. Only experts can stop it!');
    } else {
      showToast('⚠️ The RANSOMWARE BOSS is here! It locks your towers. Click a 🔒 tower to restore it.');
    }
  }

  let every = Math.max(4, ENCRYPT_EVERY - (bossNumber(state.wave) - 1));
  if (final) {
    const phase = finalPhase(boss);
    if (phase > boss.phase) enterPhase(boss, phase);
    every = FINAL_ENCRYPT[boss.phase - 1];
  }
  encryptTimer += dt;
  if (encryptTimer >= every) {
    encryptTimer = 0;
    encryptTower(boss);
    if (final && boss.phase === 3) encryptTower(boss);
  }
});

function drawBanner() {
  if (!banner) return;
  const fade = Math.min(1, banner.time * 2, (3 - banner.time) * 4);
  ctx.save();
  ctx.globalAlpha = fade;
  ctx.fillStyle = 'rgba(7, 11, 31, 0.85)';
  ctx.fillRect(0, canvas.height / 2 - 60, canvas.width, 120);
  ctx.fillStyle = banner.color;
  ctx.fillRect(0, canvas.height / 2 - 60, canvas.width, 3);
  ctx.fillRect(0, canvas.height / 2 + 57, canvas.width, 3);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '34px "Press Start 2P", monospace';
  ctx.shadowBlur = 20;
  ctx.shadowColor = banner.color;
  ctx.fillText(banner.title, canvas.width / 2, canvas.height / 2 - 14);
  ctx.shadowBlur = 0;
  ctx.font = 'bold 18px Nunito, sans-serif';
  ctx.fillStyle = '#e8f1ff';
  ctx.fillText(banner.sub, canvas.width / 2, canvas.height / 2 + 30);
  ctx.restore();
}

function drawFinalBoss(boss) {
  const pulse = (Math.sin(state.time * 4) + 1) / 2;

  // Red glow pulsing around the edges of the board
  const glow = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, canvas.height * 0.4, canvas.width / 2, canvas.height / 2, canvas.width * 0.7);
  glow.addColorStop(0, 'rgba(255, 0, 60, 0)');
  glow.addColorStop(1, `rgba(255, 0, 60, ${0.18 + pulse * 0.17})`);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Spinning dashed aura around Omega
  ctx.save();
  ctx.translate(boss.x, boss.y);
  ctx.rotate(state.time * 1.5);
  ctx.strokeStyle = ['#c58bff', '#ff3d8b', '#ff2020'][boss.phase - 1];
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.arc(0, 0, 46 + pulse * 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Huge health bar with phase markers
  const w = 600;
  const x = canvas.width / 2 - w / 2;
  ctx.fillStyle = 'rgba(7, 11, 31, 0.9)';
  ctx.fillRect(x - 12, 4, w + 24, 52);
  ctx.strokeStyle = '#ff3d8b';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 12, 4, w + 24, 52);
  ctx.font = '12px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ff3d8b';
  ctx.fillText(`☠️ OMEGA RANSOMWARE · PHASE ${boss.phase}/3`, canvas.width / 2, 20);
  ctx.fillStyle = '#1a2560';
  ctx.fillRect(x, 34, w, 14);
  const bar = ctx.createLinearGradient(x, 0, x + w, 0);
  bar.addColorStop(0, '#ff2020');
  bar.addColorStop(0.5, '#ff3d8b');
  bar.addColorStop(1, '#c58bff');
  ctx.fillStyle = bar;
  ctx.fillRect(x, 34, w * Math.max(0, boss.hp / boss.maxHp), 14);
  ctx.fillStyle = '#e8f1ff';
  for (const mark of [1 / 3, 2 / 3]) ctx.fillRect(x + w * mark - 1, 32, 2, 18);
}

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
  if (boss && isFinal(boss)) {
    drawFinalBoss(boss);
  } else if (boss) {
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
  }

  if (boss && state.towers.some(t => t.encrypted)) {
    const hint = '🔒 Click a locked tower and answer to restore it from backup!';
    ctx.font = 'bold 15px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const hw = ctx.measureText(hint).width + 24;
    ctx.fillStyle = 'rgba(120, 0, 40, 0.85)';
    ctx.fillRect(canvas.width / 2 - hw / 2, 62, hw, 26);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(hint, canvas.width / 2, 75);
  }

  drawBanner();
});
