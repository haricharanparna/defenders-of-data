// Live DMs: chat messages that pop up in the corner DURING a wave.
// The game keeps running, so players practice deciding quickly, just like with real messages.
//  - Safe reply: bonus bytes and an Overclock (towers fire faster for a few seconds)
//  - Risky reply: more threats sneak onto the path
//  - No reply: nothing happens, but you miss the bonus
// Uses DMS from content.js.

const DM_TIME = 12;         // seconds to reply
const DM_PER_WAVE = 2;
const DM_REWARD = 8;
const OVERCLOCK_TIME = 8;
const DM_SNEAK_IN = 3;      // threats that sneak in after a risky reply
const DM_RESULT_TIME = 7;   // how long the explanation stays up

const dmBox = el('dm');
let dm = null;              // the DM on screen: { msg, timeLeft, answered, resultLeft }
let dmCount = 0;
let dmNextAt = 0;

const between = (min, max) => min + Math.random() * (max - min);

function showDm() {
  // Trickier DMs show up in later waves
  const [msg] = drawQuestions(DMS, tierFor(state.wave), 1);
  dm = { msg, timeLeft: DM_TIME, answered: false, resultLeft: DM_RESULT_TIME };
  dmCount++;

  renderMessage(el('dm-message'), msg);
  el('dm-message').hidden = false;
  const replies = el('dm-replies');
  replies.innerHTML = '';
  for (const reply of shuffle(msg.replies)) {
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.textContent = reply.text;
    btn.addEventListener('click', () => answerDm(btn, reply));
    replies.appendChild(btn);
  }
  el('dm-result').hidden = true;
  el('dm-timer').hidden = false;
  dmBox.hidden = false;
  playSound('dm');
}

function answerDm(button, reply) {
  if (!dm || dm.answered) return;
  dm.answered = true;
  reportAnswer(reply.safe);
  [...el('dm-replies').children].forEach(b => { b.disabled = true; });
  button.classList.add(reply.safe ? 'right' : 'wrong');
  el('dm-timer').hidden = true;

  let html;
  if (reply.safe) {
    state.dmSafe++;
    state.bytes += DM_REWARD;
    state.overclock = OVERCLOCK_TIME;
    html = `<p class="verdict">✅ Safe reply! +${DM_REWARD} bytes and ⚡ OVERCLOCK: towers fire 2x faster!</p>`;
  } else {
    const t = THREATS[dm.msg.punish];
    // Add them to this wave's spawn line, a moment apart
    for (let i = 0; i < DM_SNEAK_IN; i++) state.spawnQueue.push({ type: dm.msg.punish, at: state.waveTime + i * 0.5 });
    state.spawnQueue.sort((a, b) => a.at - b.at);
    html = `<p class="verdict">❌ Risky reply! ${DM_SNEAK_IN} ${t.plural} snuck in!</p>`;
    recordMiss({
      kind: '💬 Live DM',
      msg: dm.msg,
      yours: reply.text,
      right: dm.msg.replies.find(r => r.safe).text,
      why: reply.why,
    });
  }
  showResult(el('dm-result'), reply.safe, `${html}<p>${reply.why}</p>`);
  el('dm-message').hidden = true;  // make room for the explanation
  dmNextAt = state.waveTime + between(14, 20);
  updateHud();
}

function dmTimeout() {
  dm.answered = true;
  [...el('dm-replies').children].forEach(b => { b.disabled = true; });
  el('dm-timer').hidden = true;
  const best = dm.msg.replies.find(r => r.safe);
  el('dm-result').hidden = false;
  el('dm-result').className = 'result';
  el('dm-result').innerHTML = `<p class="verdict">⏰ No reply. You missed the bonus!</p><p>Best reply: "${best.text}". ${best.why}</p>`;
  el('dm-message').hidden = true;
  dmNextAt = state.waveTime + between(14, 20);
}

function hideDm() {
  dm = null;
  dmBox.hidden = true;
}

el('dm-close').addEventListener('click', () => {
  if (dm && !dm.answered) dmTimeout();
  else hideDm();
});

hooks.newGame.push(hideDm);
hooks.waveStart.push(() => {
  hideDm();
  dmCount = 0;
  dmNextAt = between(5, 9);
});
// A DM nobody answered disappears when the wave ends
hooks.waveEnd.push(() => { if (dm && !dm.answered) hideDm(); });

hooks.update.push(dt => {
  // Timers use real seconds, so 2x speed doesn't cut your reading time in half
  const seconds = dt / state.speed;
  if (dm) {
    if (!dm.answered) {
      dm.timeLeft -= seconds;
      el('dm-timer-fill').style.width = `${Math.max(0, dm.timeLeft / DM_TIME) * 100}%`;
      if (dm.timeLeft <= 0) dmTimeout();
    } else {
      dm.resultLeft -= seconds;
      if (dm.resultLeft <= 0) hideDm();
    }
    return;
  }
  // Wave 1 is for learning the basics, so DMs start on wave 2
  if (state.waveActive && state.wave >= 1 && dmCount < DM_PER_WAVE && state.waveTime >= dmNextAt) showDm();
});
