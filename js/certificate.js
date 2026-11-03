// The Certified Data Defender certificate, on the title screen (🏆 Certificate).
// Earn it by mastering all three games:
//   🏰 Tower Defense: clear all 100 levels
//   🖱️ Data Clicker: earn 500K bytes in total
//   ⚔️ Adventure: quarantine all 60 threats and unlock all 4 guardians
// Progress is read from each game's own save. Until you've earned it, the certificate shows as a locked preview.
// Once earned, you can print it or save it as a PDF. Uses CREATURES and GUARDIANS from adventure-data.js.

const CERT_KEY = 'defenders-of-data-certificate';   // { earnedAt } once you've earned it
const CERT_LEVELS = 100;
const CERT_BYTES = 5e5;
const certDialog = document.getElementById('dlg-cert');
const certEl = id => document.getElementById(id);

const readJson = key => {
  try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; }
};
const shortNumber = n => n >= 1e9 ? `${+(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `${+(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${+(n / 1e3).toFixed(1)}K` : `${Math.floor(n)}`;

// Where you are on each goal, from 0 to 1
function certGoals() {
  const best = readJson('defenders-of-data-save').best;
  const levels = Math.min(CERT_LEVELS, typeof best === 'object' ? best.levels || 0 : 0);
  const bytes = Math.min(CERT_BYTES, readJson('defenders-of-data-clicker').total || 0);
  const adventure = readJson('defenders-of-data-adventure');
  const caught = Math.min(CREATURES.length, (adventure.caught || []).length);
  const guardians = Math.min(GUARDIANS.length, 1 + (adventure.badges || []).length);
  return [
    { emoji: '🏰', game: 'Tower Defense', goal: `Clear all ${CERT_LEVELS} levels`,
      done: levels / CERT_LEVELS, count: `${levels}/${CERT_LEVELS} levels` },
    { emoji: '🖱️', game: 'Data Clicker', goal: 'Earn 500K bytes',
      done: bytes / CERT_BYTES, count: `${shortNumber(bytes)}/500K bytes` },
    { emoji: '⚔️', game: 'Adventure', goal: `Quarantine all ${CREATURES.length} threats and unlock all ${GUARDIANS.length} guardians`,
      done: (caught + guardians) / (CREATURES.length + GUARDIANS.length), count: `${caught}/${CREATURES.length} threats · ${guardians}/${GUARDIANS.length} guardians` },
  ];
}

function certEarnedAt() {
  const saved = readJson(CERT_KEY);
  if (saved.earnedAt) return saved.earnedAt;
  if (!certGoals().every(g => g.done >= 1)) return null;
  // Just earned it: remember the day, for the date on the certificate
  const earnedAt = Date.now();
  try { localStorage.setItem(CERT_KEY, JSON.stringify({ earnedAt })); } catch { /* storage blocked */ }
  return earnedAt;
}

// A certificate number made from the name and date, so it stays the same each time you open it
function certNumber(name, time) {
  let h = 2166136261;
  for (const ch of `${name}|${time}`) h = Math.imul(h ^ ch.codePointAt(0), 16777619);
  const hex = (h >>> 0).toString(16).toUpperCase().padStart(8, '0');
  return `DD-${hex.slice(0, 4)}-${hex.slice(4)}`;
}

// The title screen button shows how many goals you've finished
function renderCertButton() {
  const goals = certGoals();
  const finished = goals.filter(g => g.done >= 1).length;
  const btn = certEl('btn-cert');
  btn.querySelector('.cert-btn-count').textContent = finished === goals.length ? 'Earned!' : `${finished}/${goals.length}`;
  btn.classList.toggle('earned', finished === goals.length);
}

function openCertificate() {
  renderCertificate();
  certDialog.showModal();
}

function renderCertificate() {
  const goals = certGoals();
  const earnedAt = certEarnedAt();
  const left = goals.filter(g => g.done < 1).length;
  const overall = goals.reduce((sum, g) => sum + Math.min(1, g.done), 0) / goals.length;

  // Progress at the top
  certEl('cert-status').textContent = earnedAt
    ? '🎉 You did it! You\'re officially a Certified Data Defender.'
    : `Finish ${left} more goal${left > 1 ? 's' : ''} to earn your certificate. You're ${Math.floor(overall * 100)}% of the way there!`;
  certEl('cert-overall').style.width = `${overall * 100}%`;
  certEl('cert-goals').innerHTML = goals.map(g => `
    <div class="cert-goal${g.done >= 1 ? ' done' : ''}">
      <span class="cert-goal-emoji" aria-hidden="true">${g.done >= 1 ? '✅' : g.emoji}</span>
      <span class="cert-goal-text"><strong>${g.game}</strong><span>${g.goal}</span>
        <span class="cert-bar" aria-hidden="true"><span style="width:${Math.min(1, g.done) * 100}%"></span></span>
        <small>${g.count}</small></span>
    </div>`).join('');

  // The certificate itself
  const nameInput = certEl('cert-name-input');
  if (!nameInput.value) nameInput.value = coder.name;
  const name = nameInput.value.trim() || coder.name;
  const when = earnedAt || Date.now();
  certEl('cert-name').textContent = name;
  certEl('cert-date').textContent = new Date(when).toLocaleDateString(LANG === 'es' ? 'es' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  certEl('cert-number').textContent = `Certificate No. ${certNumber(name, earnedAt || 0)}`;
  certEl('cert-coder').innerHTML = avatarSvg();
  certEl('cert-paper').classList.toggle('locked', !earnedAt);
  certEl('cert-print').disabled = !earnedAt;
  certEl('cert-print').textContent = earnedAt ? '🖨️ Print or save as PDF' : '🔒 Earn it to print';
}

certEl('cert-name-input').addEventListener('input', renderCertificate);
certEl('cert-print').addEventListener('click', () => {
  document.documentElement.classList.add('printing-cert');
  window.print();
  document.documentElement.classList.remove('printing-cert');
});
certEl('btn-cert').addEventListener('click', openCertificate);
renderCertButton();
