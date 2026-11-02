// Real-Life Missions, on the Why It Matters screen: safety habits from the game to do in real life.
// Check one off when you've done it and get 1 ★ for the Coder Locker (once per mission, on your honor).
// Uses awardStars() from avatar.js.

const MISSIONS_KEY = 'defenders-of-data-missions';
const MISSIONS = [
  { id: '2fa', emoji: '🔐', text: 'Turn on 2-step verification for your email or a game account.' },
  { id: 'update', emoji: '🔄', text: 'Update your phone, computer or apps (updates fix the holes hackers use).' },
  { id: 'password', emoji: '🔑', text: 'Change a password you use on more than one account. A password manager makes it easy.' },
  { id: 'private', emoji: '🔒', text: 'Set a social media account to private, and check what strangers can see on your profile.' },
  { id: 'location', emoji: '📍', text: 'Turn off location sharing for an app that doesn\'t need it.' },
  { id: 'teach', emoji: '🗣️', text: 'Teach a friend or family member one thing you learned in this game.' },
];

let missionsDone = [];
try { missionsDone = JSON.parse(localStorage.getItem(MISSIONS_KEY)) || []; } catch { /* storage blocked */ }

function renderMissions() {
  const list = document.getElementById('missions-list');
  list.innerHTML = '';
  for (const mission of MISSIONS) {
    const row = document.createElement('label');
    row.className = 'mission';
    row.innerHTML = `<input type="checkbox"><span class="mission-emoji" aria-hidden="true">${mission.emoji}</span><span class="mission-text"></span><span class="mission-star">+1 ★</span>`;
    row.querySelector('.mission-text').textContent = mission.text;
    const box = row.querySelector('input');
    box.checked = missionsDone.includes(mission.id);
    box.addEventListener('change', () => {
      missionsDone = box.checked ? [...missionsDone, mission.id] : missionsDone.filter(id => id !== mission.id);
      try { localStorage.setItem(MISSIONS_KEY, JSON.stringify(missionsDone)); } catch { /* storage blocked */ }
      if (box.checked) awardStars(`mission-${mission.id}`, 1, 'Real-Life Mission complete!');
      showMissionCount();
    });
    list.appendChild(row);
  }
  showMissionCount();
}

function showMissionCount() {
  document.getElementById('missions-count').textContent = `${missionsDone.length}/${MISSIONS.length} done`;
}

renderMissions();
