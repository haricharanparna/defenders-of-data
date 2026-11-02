// Save Code: move your progress to another computer without an account.
// "Copy my save code" packs everything the game saved on this computer (stars, coder, levels,
// Clicker and Adventure) into one code. Paste it into "Load save code" on the other computer.
// The code is your saves squeezed small (deflate) and written as letters (base64), starting with DOD1-.

const SAVE_PREFIX = 'defenders-of-data';
const CODE_START = 'DOD1-';
const saveDialog = document.getElementById('dlg-save');
const saveEl = id => document.getElementById(id);

// Squeeze bytes with the browser's built-in compressor (or un-squeeze them)
async function squeeze(bytes, Stream) {
  const stream = new Blob([bytes]).stream().pipeThrough(new Stream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
const toBase64 = bytes => btoa(Array.from(bytes, b => String.fromCharCode(b)).join(''));
const fromBase64 = text => Uint8Array.from(atob(text), c => c.charCodeAt(0));

async function makeSaveCode() {
  const saves = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(SAVE_PREFIX)) saves[key] = localStorage.getItem(key);
  }
  const bytes = new TextEncoder().encode(JSON.stringify(saves));
  return CODE_START + toBase64(await squeeze(bytes, CompressionStream));
}

// Returns the saves inside a code, or null if the code is broken
async function readSaveCode(code) {
  code = code.replace(/\s+/g, '');
  if (!code.startsWith(CODE_START)) return null;
  try {
    const bytes = await squeeze(fromBase64(code.slice(CODE_START.length)), DecompressionStream);
    const saves = JSON.parse(new TextDecoder().decode(bytes));
    const keys = Object.keys(saves);
    if (!keys.length || !keys.every(k => k.startsWith(SAVE_PREFIX) && typeof saves[k] === 'string')) return null;
    return saves;
  } catch {
    return null;
  }
}

function saveMessage(text, good) {
  const msg = saveEl('save-message');
  msg.textContent = text;
  msg.className = `save-message ${good ? 'good' : 'bad'}`;
  msg.hidden = false;
}

saveEl('btn-save').addEventListener('click', async () => {
  saveEl('save-message').hidden = true;
  saveEl('save-load-box').value = '';
  saveEl('save-code').value = await makeSaveCode();
  saveDialog.showModal();
  saveEl('save-code').scrollTop = 0;
});

saveEl('save-copy').addEventListener('click', async () => {
  const box = saveEl('save-code');
  box.select();
  try {
    await navigator.clipboard.writeText(box.value);
  } catch {
    document.execCommand('copy'); // older browsers
  }
  saveMessage('✅ Copied! Paste it somewhere safe, like a note to yourself. Anyone with this code can load your progress.', true);
});

saveEl('save-load').addEventListener('click', async () => {
  const saves = await readSaveCode(saveEl('save-load-box').value);
  if (!saves) return saveMessage('❌ That code doesn\'t work. Make sure you copied all of it, starting with DOD1-', false);
  if (!confirm('Load this save code? It replaces all the progress on this computer.')) return;
  // Clear this computer's saves first, so nothing old gets mixed in
  for (const key of Object.keys(localStorage)) if (key.startsWith(SAVE_PREFIX)) localStorage.removeItem(key);
  for (const [key, value] of Object.entries(saves)) localStorage.setItem(key, value);
  saveMessage('✅ Loaded! Starting the game with your progress...', true);
  setTimeout(() => location.reload(), 1200);
});
