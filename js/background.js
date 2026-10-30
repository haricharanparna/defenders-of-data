// Animated background for the title screen.
// Blue data packets flow along a grid toward the glowing Data Core in the middle.
// Red threats try to sneak in too, but the core's shield zaps them.

const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');

const GRID = 48;            // size of one grid square in pixels
const THREAT_CHANCE = 0.25; // how many of the movers are threats
const MAX_MOVERS = 40;

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let width, height, centerX, centerY;
let movers = [];
let sparks = [];
let shieldPulse = 0;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  centerX = width / 2;
  centerY = height / 2;
}

// Each mover starts at the edge of the screen and travels to the center,
// first along one grid line and then along the other (like a circuit board).
function spawnMover() {
  const side = Math.floor(Math.random() * 4);
  const snap = v => Math.round(v / GRID) * GRID;
  let x, y;
  if (side === 0) { x = snap(Math.random() * width); y = -10; }
  if (side === 1) { x = width + 10; y = snap(Math.random() * height); }
  if (side === 2) { x = snap(Math.random() * width); y = height + 10; }
  if (side === 3) { x = -10; y = snap(Math.random() * height); }

  movers.push({
    x, y,
    threat: Math.random() < THREAT_CHANCE,
    speed: 0.6 + Math.random() * 1.2,
    // Packets from the top or bottom travel down their column first
    verticalFirst: side === 0 || side === 2,
  });
}

function moveToward(m) {
  const dx = centerX - m.x;
  const dy = centerY - m.y;
  // Move along one axis until lined up with the center, then turn and go along the other
  const moveVertically = m.verticalFirst ? Math.abs(dy) > 1 : Math.abs(dx) <= 1;
  if (moveVertically) {
    m.y += Math.sign(dy) * Math.min(m.speed, Math.abs(dy));
  } else {
    m.x += Math.sign(dx) * Math.min(m.speed, Math.abs(dx));
  }
}

function makeSparks(x, y, color) {
  for (let i = 0; i < 10; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 2.5;
    sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, color });
  }
}

function drawGrid() {
  ctx.strokeStyle = 'rgba(46, 230, 255, 0.07)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= width; x += GRID) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
  for (let y = 0; y <= height; y += GRID) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
  ctx.stroke();
}

function drawCore() {
  const radius = Math.min(width, height) * 0.32;
  // Shield ring that flashes when it blocks a threat
  ctx.strokeStyle = `rgba(46, 230, 255, ${0.08 + shieldPulse * 0.5})`;
  ctx.lineWidth = 2 + shieldPulse * 4;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();
  shieldPulse *= 0.92;
  return radius;
}

function drawMover(m) {
  ctx.save();
  ctx.shadowBlur = 12;
  if (m.threat) {
    // Threats are red diamonds
    ctx.fillStyle = '#ff3d8b';
    ctx.shadowColor = '#ff3d8b';
    ctx.translate(m.x, m.y);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-5, -5, 10, 10);
  } else {
    // Data packets are blue squares
    ctx.fillStyle = '#2ee6ff';
    ctx.shadowColor = '#2ee6ff';
    ctx.fillRect(m.x - 4, m.y - 4, 8, 8);
  }
  ctx.restore();
}

function frame() {
  ctx.clearRect(0, 0, width, height);
  drawGrid();
  const shieldRadius = drawCore();

  if (movers.length < MAX_MOVERS && Math.random() < 0.15) spawnMover();

  movers = movers.filter(m => {
    moveToward(m);
    const dist = Math.hypot(centerX - m.x, centerY - m.y);

    // Threats get blocked at the shield, safe data passes through to the core
    if (m.threat && dist < shieldRadius) {
      makeSparks(m.x, m.y, '#ff3d8b');
      shieldPulse = 1;
      return false;
    }
    if (dist < 2) return false;

    drawMover(m);
    return true;
  });

  sparks = sparks.filter(s => {
    s.x += s.vx;
    s.y += s.vy;
    s.life -= 0.03;
    ctx.globalAlpha = Math.max(s.life, 0);
    ctx.fillStyle = s.color;
    ctx.fillRect(s.x - 1.5, s.y - 1.5, 3, 3);
    ctx.globalAlpha = 1;
    return s.life > 0;
  });

  requestAnimationFrame(frame);
}

window.addEventListener('resize', resize);
resize();

if (reduceMotion) {
  // Players who prefer less motion just get the still grid
  drawGrid();
  drawCore();
} else {
  frame();
}
