// Title screen: buttons and pop-up panels

const howDialog = document.getElementById('dlg-how');
const whyDialog = document.getElementById('dlg-why');
const toast = document.getElementById('toast');

document.getElementById('btn-how').addEventListener('click', () => howDialog.showModal());
document.getElementById('btn-why').addEventListener('click', () => whyDialog.showModal());

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

const modeDialog = document.getElementById('dlg-mode');
document.getElementById('btn-play').addEventListener('click', () => modeDialog.showModal());
// Start with the Play button focused so keyboard players can press Enter right away
document.getElementById('btn-play').focus();
