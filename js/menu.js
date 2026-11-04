// Title screen: buttons and pop-up panels

const whyDialog = document.getElementById('dlg-why');
const toast = document.getElementById('toast');

document.getElementById('btn-why').addEventListener('click', () => whyDialog.showModal());

// Accessibility: one switch per setting in access.js
fillAccessList(document.getElementById('access-list'));
document.getElementById('btn-access').addEventListener('click', () => document.getElementById('dlg-access').showModal());

// Language: the button is labeled in the language it switches to (i18n.js)
const langButton = document.getElementById('btn-lang');
if (LANG === 'es') {
  langButton.textContent = '🌐 English';
  langButton.lang = 'en';
}
langButton.addEventListener('click', () => setLanguage(LANG === 'es' ? 'en' : 'es'));

// Every "close" button closes the panel it lives in
document.querySelectorAll('.close-btn').forEach(btn => {
  btn.addEventListener('click', () => btn.closest('dialog').close());
});

// Clicking the dark area outside a panel also closes it
document.querySelectorAll('dialog').forEach(dlg => {
  dlg.addEventListener('click', e => {
    if (e.target === dlg) dlg.close();
  });
});

let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// Play: first pick a game, then (for Tower Defense) pick Levels or Endless
const modeDialog = document.getElementById('dlg-mode');
function showModeStep(step) {
  document.getElementById('mode-games').hidden = step !== 'games';
  document.getElementById('mode-td').hidden = step !== 'td';
  modeDialog.querySelector(`#mode-${step} .mode-card`).focus();
}
document.getElementById('btn-play').addEventListener('click', () => {
  modeDialog.showModal();
  showModeStep('games');
});
document.getElementById('btn-tower-defense').addEventListener('click', () => showModeStep('td'));
document.getElementById('btn-mode-back').addEventListener('click', () => showModeStep('games'));
// Start with the Play button focused so keyboard players can press Enter right away
document.getElementById('btn-play').focus();
