// How to Play: a short picture-book of directions shown when you start Tower Defense,
// written so beginners and younger kids can follow it. One step per page.
// After "Got it!", Levels mode goes on to the Level 1 briefing (briefing.js).

const howDialog = document.getElementById('dlg-how');

const HOW_STEPS = [
  {
    icon: '💾', title: 'Protect your data',
    text: 'Hackers send <strong>threats</strong> down the path. They want to reach your <strong>Data Core</strong> at the end and steal your data.',
    tip: 'If too many threats get through, your data is leaked and the game is over.',
  },
  {
    icon: '🔓', title: 'Unlock a tower',
    text: 'Towers stop threats. Each tower is a <strong>real way to stay safe online</strong>. Answer a quick question to unlock one.',
    tip: 'One tower makes you a practice password. Remember it! The game will ask for it later.',
  },
  {
    icon: '🛡️', title: 'Build your towers',
    text: 'Click a tower in the bar at the bottom. Then click an <strong>empty square next to the path</strong> to place it.',
    tip: 'Towers cost bytes. You can see your bytes at the top of the screen.',
  },
  {
    icon: '▶️', title: 'Start the wave',
    text: 'Press <strong>Start</strong> (or the Space bar). The threats come, and your towers fight them by themselves.',
    tip: 'Watch the map for a tiny secret message bubble. Click it within 5 seconds and answer it for double damage!',
  },
  {
    icon: '🧠', title: 'Answer questions',
    text: 'Click a threat to <strong>scan</strong> it. Answer the messages that pop up. Play <strong>Real or Scam</strong> after each wave.',
    tip: 'Right answers give you bytes and make your towers stronger. Stuck? Press Study to see the flashcards.',
  },
  {
    icon: '👾', title: 'Beat the bosses',
    text: 'Every 10th wave, a <strong>Ransomware Boss</strong> comes and locks your towers. Answer its questions to unlock them.',
    tip: 'Click a tower you built to upgrade it and make it stronger.',
  },
  LEVELS_MODE ? {
    icon: '⭐', title: 'Earn stars',
    text: 'Clear a level to get <strong>up to 3 stars</strong>. You get more stars for right answers, losing no data and stopping every threat.',
    tip: 'Spend your stars on cool looks for your coder in My Coder.',
  } : {
    icon: '♾️', title: 'Last as long as you can',
    text: 'In Endless mode the waves <strong>never stop</strong>, and they get harder and harder.',
    tip: 'Try to beat your best score!',
  },
];

let howStep = 0;
let afterHow = null;

function openHowTo(afterClose = null) {
  afterHow = afterClose;
  showHowStep(0);
  howDialog.showModal();
  document.getElementById('how-next').focus();
}

function showHowStep(i) {
  howStep = Math.max(0, Math.min(HOW_STEPS.length - 1, i));
  const step = HOW_STEPS[howStep];
  const last = howStep === HOW_STEPS.length - 1;
  document.getElementById('how-count').textContent = `Step ${howStep + 1} of ${HOW_STEPS.length}`;
  document.getElementById('how-icon').textContent = step.icon;
  document.getElementById('how-title').textContent = step.title;
  document.getElementById('how-text').innerHTML = step.text;
  document.getElementById('how-tip').textContent = step.tip;
  document.getElementById('how-dots').innerHTML = HOW_STEPS
    .map((_, n) => `<span class="${n === howStep ? 'on' : n < howStep ? 'done' : ''}"></span>`).join('');
  document.getElementById('how-back').disabled = howStep === 0;
  document.getElementById('how-next').textContent = last ? 'Got it!' : 'Next';
  document.getElementById('how-next').classList.toggle('btn-primary', last);
  // Replay the slide-in animation
  const page = document.getElementById('how-page');
  page.classList.remove('slide');
  void page.offsetWidth;
  page.classList.add('slide');
}

function closeHowTo() {
  howDialog.close();
  const after = afterHow;
  afterHow = null;
  if (after) after();
}

document.getElementById('how-next').addEventListener('click', () => {
  if (howStep === HOW_STEPS.length - 1) closeHowTo();
  else showHowStep(howStep + 1);
});
document.getElementById('how-back').addEventListener('click', () => showHowStep(howStep - 1));
document.getElementById('how-skip').addEventListener('click', closeHowTo);
howDialog.addEventListener('cancel', e => {
  e.preventDefault();
  closeHowTo();
});
howDialog.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' && howStep < HOW_STEPS.length - 1) showHowStep(howStep + 1);
  else if (e.key === 'ArrowLeft') showHowStep(howStep - 1);
});

// The ? button in the top bar opens it again any time
document.getElementById('btn-how').addEventListener('click', () => {
  if (!anyDialogOpen()) openHowTo();
});
