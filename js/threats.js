// Shared game data: the threats (enemies) and the defenses (towers / moves).
// Both Tower Defense and Adventure mode read from here, so every threat
// teaches the same real-world lesson no matter which mode you play.

const THREATS = {
  phisher: {
    name: 'Phisher',
    plural: 'Phishers',
    emoji: '🎣',
    kind: 'Phishing',
    short: 'A fake message trying to get you to click a link or give away your login',
    hp: 70,
    speed: 70,      // pixels per second
    reward: 8,      // bytes you earn for stopping it
    damage: 1,      // data you lose if it reaches the core
    weakTo: 'linkcheck',
    fact: 'Phishing messages pretend to be someone you trust, like a bank, a game or a friend, to trick you into clicking a fake link or typing your password.',
    spot: 'Pressure to act fast ("Act NOW!"), prizes you never entered for, and links that don\'t match the real website.',
    defense: 'Hover over links before you click, and go to websites by typing the address yourself.',
  },
  cracker: {
    name: 'Password Cracker',
    plural: 'Password Crackers',
    emoji: '🔓',
    kind: 'Password attack',
    short: 'Someone trying to guess or steal their way into your account',
    hp: 270,
    speed: 40,
    reward: 15,
    damage: 2,
    weakTo: 'twofa',
    fact: 'Hackers use programs that guess millions of passwords, and they try passwords leaked from one site on all your other accounts.',
    spot: 'Login alerts you didn\'t cause, or password reset emails you never asked for.',
    defense: 'Use long, different passwords for each account, and turn on 2-step verification so a password alone isn\'t enough.',
  },
  worm: {
    name: 'Malware Worm',
    plural: 'Malware Worms',
    emoji: '🐛',
    kind: 'Malware',
    short: 'A download, file or app that secretly infects your device',
    hp: 38,
    speed: 100,
    reward: 4,
    damage: 1,
    weakTo: 'update',
    fact: 'Malware hides in "free" downloads, game cheats, mods and fake apps, then spreads and steals info from your device.',
    spot: 'Free versions of paid games, cheat tools, pop-ups saying your device is infected, and apps from outside official stores.',
    defense: 'Keep your device and apps updated, and only download from official app stores.',
  },
  catfish: {
    name: 'Catfish',
    plural: 'Catfish',
    emoji: '🎭',
    kind: 'Catfish',
    short: 'A fake person pretending to be someone else to win your trust',
    hidden: true,   // towers can't hit it until it's scanned or a Verify Beacon reveals it
    hp: 100,
    speed: 60,
    reward: 12,
    damage: 2,
    weakTo: 'verify',
    fact: 'Catfish make fake profiles that look like friendly people your age to win your trust, then ask for photos, personal info or money.',
    spot: 'New accounts with few posts, photos that look too perfect, refusing video calls, and pushing you to move to a private app.',
    defense: 'Check who people really are, never share private info with online-only friends, and tell a trusted adult if something feels off.',
  },
};

const TOWERS = {
  linkcheck: {
    name: 'Link Checker',
    emoji: '🔍',
    habit: 'Hover before you click',
    cost: 50,
    damage: 12,
    rate: 0.45,     // seconds between shots
    range: 110,
    color: '#2ee6ff',
  },
  twofa: {
    name: '2FA Lock',
    emoji: '🔐',
    habit: 'Turn on 2-step verification',
    cost: 75,
    damage: 45,
    rate: 1.4,
    range: 125,
    color: '#ffd23f',
  },
  update: {
    name: 'Update Patch',
    emoji: '🔄',
    habit: 'Keep your software updated',
    cost: 60,
    damage: 10,
    rate: 1.0,
    range: 100,
    splash: 55,     // hits every threat this close to the target
    color: '#7cff6b',
  },
  verify: {
    name: 'Verify Beacon',
    emoji: '📡',
    habit: 'Check who you\'re really talking to',
    cost: 70,
    damage: 8,
    rate: 0.6,
    range: 105,
    reveals: true,  // unmasks disguised threats in range so every tower can hit them
    color: '#c58bff',
  },
};
