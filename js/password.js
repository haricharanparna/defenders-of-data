// Login checks: the practice password you made to unlock the 2FA Lock comes back!
// Every few waves (at a random moment during a wave) you have to log in with it,
// then type a 2-step code from a pretend phone. This teaches picking a password you can remember.
//  - Log in: bonus bytes
//  - 3 wrong tries: the account locks (like real sites) and you have to make a new password
//
// The password is never stored as plain text. Like real websites, we only keep a "hash":
// a scrambled fingerprint of it that can be checked but not turned back into the password.

const PW_KEY = 'defenders-of-data-password';
const LOGIN_REWARD = 12;
const LOGIN_TRIES = 3;

const loginDialog = el('dlg-login');
let loginAt = null;     // wave time when the next login check pops up
let loginTriesLeft = 0;
let loginCode = '';

async function hashPassword(pw) {
  try {
    const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
    return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // crypto.subtle only works on https or localhost, so fall back to a simple hash
    let h = 2166136261;
    for (const ch of pw) h = Math.imul(h ^ ch.codePointAt(0), 16777619) >>> 0;
    return `fnv-${h.toString(16)}`;
  }
}

function storedHash() {
  try { return localStorage.getItem(PW_KEY); } catch { return null; }
}

// Called by lessons.js when the password challenge is passed
async function savePracticePassword(pw) {
  const hash = await hashPassword(pw);
  try { localStorage.setItem(PW_KEY, hash); } catch { /* storage blocked */ }
  if (state) state.lastLogin = state.wave;
}

// ---------- When to ask ----------
hooks.newGame.push(() => {
  state.lastLogin = 0;
  loginAt = null;
});

hooks.waveStart.push(() => {
  loginAt = null;
  if (!unlocked.has('twofa') || state.wave < 2) return;
  const since = state.wave - state.lastLogin;
  // Always by 5 waves, sometimes sooner, so it's a surprise
  if (since >= 5 || (since >= 3 && Math.random() < 0.4)) loginAt = between(4, 12);
});

hooks.update.push(() => {
  if (loginAt === null || !state.waveActive || state.waveTime < loginAt) return;
  loginAt = null;
  openLogin();
});

// ---------- The login pop-up ----------
function showLoginStep(step) {
  for (const id of ['login-step-pw', 'login-step-code', 'login-step-done']) el(id).hidden = id !== step;
}

function openLogin() {
  // No password saved yet (like an older save): make one first
  if (!storedHash()) {
    openChallenge('twofa', ok => { if (ok) showToast('🔐 Password saved. Remember it, you\'ll need it again!'); },
      '🔐 Your 2FA Locks need a password');
    return;
  }
  loginTriesLeft = LOGIN_TRIES;
  el('login-pw').value = '';
  el('login-pw').type = 'password';
  el('login-show').textContent = 'Show';
  el('login-error').textContent = '';
  showLoginStep('login-step-pw');
  loginDialog.showModal();
  el('login-pw').focus();
}

async function checkLogin() {
  const pw = el('login-pw').value;
  if (!pw) return;
  if (await hashPassword(pw) === storedHash()) {
    // Step 2: the code "sent to your phone"
    loginCode = String(Math.floor(100000 + Math.random() * 900000));
    el('login-phone-code').textContent = loginCode;
    el('login-code').value = '';
    el('login-code-error').textContent = '';
    showLoginStep('login-step-code');
    el('login-code').focus();
    return;
  }
  loginTriesLeft--;
  el('login-pw').value = '';
  if (loginTriesLeft > 0) {
    playSound('wrong');
    el('login-error').textContent = `❌ Wrong password. ${loginTriesLeft} ${loginTriesLeft === 1 ? 'try' : 'tries'} left.`;
    el('login-pw').focus();
  } else {
    lockAccount('Wrong password 3 times');
  }
}

function checkCode() {
  if (el('login-code').value.trim() !== loginCode) {
    playSound('wrong');
    el('login-code-error').textContent = '❌ That code doesn\'t match. Look at the phone again.';
    return;
  }
  reportAnswer(true);
  state.bytes += LOGIN_REWARD;
  state.lastLogin = state.wave;
  el('login-done-text').textContent =
    `✅ Logged in! +${LOGIN_REWARD} bytes. Your password AND your 2-step code proved it was really you.`;
  showLoginStep('login-step-done');
  el('login-done').focus();
  updateHud();
}

// Too many wrong tries (or "Forgot password"): make a new one, just like a real account reset
function lockAccount(yours) {
  reportAnswer(false);
  recordMiss({
    kind: '🔐 Login check',
    msg: { from: 'Login', text: 'You had to log in with the practice password you made earlier.' },
    yours,
    right: 'Your practice password',
    why: 'Pick a password you can remember: 3 or 4 random words like Purple-Taco-Rocket-42 are strong AND memorable. In real life, a password manager can remember them for you.',
  });
  loginDialog.close();
  state.lastLogin = state.wave;
  openChallenge('twofa', () => {}, '🔒 Account locked! Reset your password');
}

el('login-go').addEventListener('click', checkLogin);
el('login-pw').addEventListener('keydown', e => { if (e.key === 'Enter') checkLogin(); });
el('login-show').addEventListener('click', () => {
  el('login-pw').type = el('login-pw').type === 'password' ? 'text' : 'password';
  el('login-show').textContent = el('login-pw').type === 'password' ? 'Show' : 'Hide';
});
el('login-forgot').addEventListener('click', () => lockAccount('Forgot password'));
el('login-verify').addEventListener('click', checkCode);
el('login-code').addEventListener('keydown', e => { if (e.key === 'Enter') checkCode(); });
el('login-done').addEventListener('click', () => loginDialog.close());
// You can't skip logging in
loginDialog.addEventListener('cancel', e => e.preventDefault());
