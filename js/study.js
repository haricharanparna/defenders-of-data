// The Study tab: flashcards of the key terms, a list of everything you got wrong, and your badges.
// Opening it pauses the game, so players can look things up whenever they're stuck.
// Uses FLASHCARDS from content.js, the `missed` list from lessons.js and renderBadges() from rewards.js.

const studyDialog = document.getElementById('dlg-study');
let cardIndex = 0;

// ---------- Study button in the tower bar ----------
const studyButton = document.createElement('button');
studyButton.className = 'tool study-tool';
studyButton.innerHTML = `
  <span class="tool-key">L</span>
  <span class="tool-emoji">📚</span>
  <span class="tool-name">Study</span>
  <span class="tool-cost">Cards, missed &amp; badges</span>
  <span class="tool-beats">Stuck? Learn the terms here</span>`;
studyButton.addEventListener('click', () => openStudy('cards'));
document.getElementById('tower-bar').appendChild(studyButton);

document.addEventListener('keydown', e => {
  if ((e.key === 'l' || e.key === 'L') && !anyDialogOpen()) openStudy('cards');
});

// card: which flashcard to show first. afterClose: called when the panel closes.
// (The Level Briefing uses both to show its own words, then come back.)
let afterStudy = null;
function openStudy(tab, card = null, afterClose = null) {
  if (card !== null) cardIndex = card;
  afterStudy = afterClose;
  showTab(tab);
  studyDialog.showModal();
  // Focus the card so Space flips it right away
  if (tab === 'cards') flashcard.focus();
}

const STUDY_TABS = ['cards', 'missed', 'badges'];

function showTab(tab) {
  for (const name of STUDY_TABS) {
    document.getElementById(`panel-${name}`).hidden = name !== tab;
    document.getElementById(`tab-${name}`).setAttribute('aria-selected', name === tab);
  }
  if (tab === 'cards') showCard(cardIndex);
  else if (tab === 'missed') renderMissed();
  else renderBadges();
}

for (const name of STUDY_TABS) {
  document.getElementById(`tab-${name}`).addEventListener('click', () => showTab(name));
}
function closeStudy() {
  studyDialog.close();
  const after = afterStudy;
  afterStudy = null;
  if (after) after();
}
document.getElementById('study-close').addEventListener('click', closeStudy);
studyDialog.addEventListener('cancel', e => {
  e.preventDefault();
  closeStudy();
});

// ---------- Flashcards ----------
const flashcard = document.getElementById('flashcard');

// Cards unlock 5 levels at a time: levels 1-5 get the basics, and every 5 levels
// adds the words you need for the next 5. (In Endless, "level" is the wave.)
const CARD_BLOCK = 5;
const cardsUpTo = level => Math.ceil(level / CARD_BLOCK) * CARD_BLOCK;

function unlockedCards(level = state.wave + 1) {
  return FLASHCARDS.filter(card => card.level <= cardsUpTo(level));
}

function showCard(i) {
  const cards = unlockedCards();
  cardIndex = (i + cards.length) % cards.length;
  const card = cards[cardIndex];
  flashcard.classList.remove('flipped');
  document.getElementById('card-emoji').textContent = card.emoji;
  document.getElementById('card-term').textContent = card.term;
  document.getElementById('card-term-back').textContent = `${card.emoji} ${card.term}`;
  document.getElementById('card-def').textContent = card.def;
  document.getElementById('card-example').textContent = card.example ? `Example: ${card.example}` : '';
  document.getElementById('card-count').textContent = `${cardIndex + 1} / ${cards.length}`;
  const locked = FLASHCARDS.length - cards.length;
  document.getElementById('cards-locked').textContent = locked > 0
    ? `🔒 ${locked} more cards unlock as you go. Next new cards: level ${cardsUpTo(state.wave + 1) + 1}`
    : '🏆 You\'ve unlocked every flashcard!';
}

flashcard.addEventListener('click', () => flashcard.classList.toggle('flipped'));
document.getElementById('card-prev').addEventListener('click', () => showCard(cardIndex - 1));
document.getElementById('card-next').addEventListener('click', () => showCard(cardIndex + 1));

studyDialog.addEventListener('keydown', e => {
  if (document.getElementById('panel-cards').hidden) return;
  if (e.key === 'ArrowRight') showCard(cardIndex + 1);
  else if (e.key === 'ArrowLeft') showCard(cardIndex - 1);
  else if (e.key === ' ' && e.target.tagName !== 'BUTTON') {
    // Space flips the card when nothing else is focused (buttons handle Space themselves)
    e.preventDefault();
    flashcard.classList.toggle('flipped');
  }
});

// ---------- Missed ----------
function updateMissedBadge() {
  const badge = document.getElementById('missed-count');
  badge.textContent = missed.length;
  badge.classList.toggle('has-missed', missed.length > 0);
}

function renderMissed() {
  const list = document.getElementById('missed-list');
  list.innerHTML = '';
  if (missed.length === 0) {
    list.innerHTML = '<p class="empty">Nothing missed yet! 🎉 Keep it up.</p>';
    return;
  }
  for (const miss of [...missed].reverse()) {
    const item = document.createElement('div');
    item.className = 'missed-item';

    const kind = document.createElement('p');
    kind.className = 'missed-kind';
    kind.textContent = miss.kind;
    item.appendChild(kind);

    const box = document.createElement('div');
    box.className = 'message';
    renderMessage(box, miss.msg);
    item.appendChild(box);

    const answers = document.createElement('p');
    answers.className = 'missed-answers';
    answers.innerHTML = '<span class="yours"></span><span class="right"></span>';
    answers.querySelector('.yours').textContent = `You said: ${miss.yours}`;
    answers.querySelector('.right').textContent = `Answer: ${miss.right}`;
    item.appendChild(answers);

    const why = document.createElement('p');
    why.className = 'missed-why';
    why.textContent = `💡 ${miss.why}`;
    item.appendChild(why);

    list.appendChild(item);
  }
}

// Start each new game with an empty Missed list, and let the end screen open it
document.getElementById('btn-again').addEventListener('click', () => {
  missed.length = 0;
  updateMissedBadge();
});
document.getElementById('btn-review').addEventListener('click', () => openStudy('missed'));

updateMissedBadge();
