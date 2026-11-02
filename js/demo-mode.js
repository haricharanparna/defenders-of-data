// Demo mode: the How to Play videos (demo.js) load the real game in a little screen with #demo in the link.
// (A # survives servers that redirect page.html to /page and drop the ?part.)
// In demo mode nothing is read from or saved to this computer, so every demo starts fresh
// and never touches your real progress. Load this before every other game script.
const DEMO_MODE = location.hash === '#demo';
if (DEMO_MODE) {
  Storage.prototype.getItem = () => null;
  Storage.prototype.setItem = () => {};
  document.documentElement.classList.add('demo-mode');
}
