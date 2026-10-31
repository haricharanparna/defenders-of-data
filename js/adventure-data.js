// Adventure mode content: the threats you can meet and quarantine, the world map, and everyone in it.
// Each threat has a type, and each type is beaten by one of your four defenses (the towers from
// Tower Defense). Picking the right defense for each attack is how you win battles.

const DEFENSES = {
  linkcheck: { emoji: '🔍', name: 'Link Check', move: 'Check where the link really goes', type: 'Phishing' },
  twofa: { emoji: '🔐', name: '2FA Lock', move: 'Lock it with 2-step verification', type: 'Password' },
  update: { emoji: '🔄', name: 'Update Patch', move: 'Update and scan your device', type: 'Malware' },
  verify: { emoji: '📡', name: 'Verify', move: 'Check who it really is', type: 'Social' },
};

// beats: the defense that is super effective. power: damage it does to you. zone: where it lives (1 to 4).
const CREATURES = [
  {
    id: 'phisher', emoji: '🎣', name: 'Phisher', beats: 'linkcheck', zone: 1, hp: 60, power: 14,
    about: 'Sends fake messages that look like they come from a real company, hoping you click a bad link.',
    tip: 'Before you click, check the real domain: the part right before the first single slash.',
    attacks: [
      'casts a line: "Your Roblox account will be deleted! Log in now: roblox-security.help"',
      'sends an email from "Netfl1x Billing": "Payment failed. Update your card here."',
      'whispers: "Click fast, this offer ends in 10 minutes!"',
    ],
  },
  {
    id: 'smisher', emoji: '📱', name: 'Smisher', beats: 'linkcheck', zone: 1, hp: 55, power: 12,
    about: 'Phishing by text message. It pretends to be a delivery company, your bank or even a friend.',
    tip: 'Delivery and bank texts with links are a classic scam. Open the real app instead.',
    attacks: [
      'texts: "USPS: your package is on hold. Confirm your address: usps-track.co"',
      'texts: "Your bank card is locked. Tap here to unlock: bnk-verify.net"',
    ],
  },
  {
    id: 'adware', emoji: '📢', name: 'Adware Gremlin', beats: 'update', zone: 1, hp: 50, power: 10,
    about: 'Sneaks in with free downloads and fills your screen with pop-ups and fake virus warnings.',
    tip: 'Only download apps from official stores, and keep your device updated.',
    attacks: [
      'flashes a pop-up: "WARNING! 37 viruses found! Download CleanerPro now!"',
      'hides inside a "free" wallpaper app and floods your screen with ads.',
    ],
  },
  {
    id: 'giveaway', emoji: '🎁', name: 'Giveaway Bot', beats: 'linkcheck', zone: 2, hp: 70, power: 16,
    about: 'Promises free prizes, skins or money, but only after you "verify" with your login or card.',
    tip: 'You can\'t win something you never entered. Real prizes never need your password.',
    attacks: [
      'comments: "FREE V-BUCKS! First 100 people only: vbucks-gift.xyz"',
      'DMs: "You won an iPhone 16! Just pay $2.99 shipping here."',
    ],
  },
  {
    id: 'catfish', emoji: '🎭', name: 'Catfish', beats: 'verify', zone: 2, hp: 75, power: 16,
    about: 'Pretends to be someone they\'re not, usually someone your age, to earn your trust.',
    tip: 'If you\'ve never met them in person, you can\'t be sure who they are. Never share private info or photos.',
    attacks: [
      'messages: "hey! I\'m 14 too, we have so much in common. what school do you go to?"',
      'says: "Let\'s keep our chats a secret from your parents, ok?"',
    ],
  },
  {
    id: 'impersonator', emoji: '🪞', name: 'Impersonator', beats: 'verify', zone: 2, hp: 70, power: 18,
    about: 'Copies a friend\'s or a celebrity\'s profile, then asks for money, codes or favors.',
    tip: 'If a "friend" asks for money or codes, call or ask them in person first.',
    attacks: [
      'messages from your "best friend\'s" new account: "Lost my phone, can you send me a $50 gift card?"',
      'pretends to be a famous streamer: "Send me your login and I\'ll gift you a sub!"',
    ],
  },
  {
    id: 'worm', emoji: '🐛', name: 'Malware Worm', beats: 'update', zone: 3, hp: 85, power: 18,
    about: 'Spreads from device to device through security holes that haven\'t been patched.',
    tip: 'Updates patch the holes worms crawl through. Turn on automatic updates.',
    attacks: [
      'crawls through an old app you never updated.',
      'copies itself to every device on your Wi-Fi.',
    ],
  },
  {
    id: 'trojan', emoji: '🐴', name: 'Trojan Horse', beats: 'update', zone: 3, hp: 90, power: 20,
    about: 'Hides malware inside something that looks useful, like a game mod or a free tool.',
    tip: 'Free mods, cheats and cracked games from random sites often hide malware.',
    attacks: [
      'offers: "Minecraft super mod pack, totally free! Just run setup.exe"',
      'disguises itself as a homework helper app from a random website.',
    ],
  },
  {
    id: 'keylogger', emoji: '⌨️', name: 'Keylogger', beats: 'twofa', zone: 3, hp: 80, power: 20,
    about: 'Secretly records everything you type, including your passwords.',
    tip: 'Even if a keylogger steals your password, 2-step verification stops the hacker at the second step.',
    attacks: [
      'quietly records every key you type, including your password.',
      'sends your typed password to a hacker server.',
    ],
  },
  {
    id: 'cracker', emoji: '🔓', name: 'Password Cracker', beats: 'twofa', zone: 4, hp: 100, power: 22,
    about: 'Guesses millions of passwords a second, starting with the most common ones.',
    tip: 'Use long, unique passwords, and turn on 2-step verification.',
    attacks: [
      'tries "password123", "qwerty" and "iloveyou" on your account.',
      'guesses your password using your pet\'s name and birthday.',
    ],
  },
  {
    id: 'stuffer', emoji: '🧦', name: 'Credential Stuffer', beats: 'twofa', zone: 4, hp: 100, power: 24,
    about: 'Takes passwords leaked from one site and tries them on all your other accounts.',
    tip: 'Never reuse passwords. A password manager can remember them all for you.',
    attacks: [
      'found your password in a leak from an old game site and is trying it on your email.',
      'tries your leaked password on 500 other websites at once.',
    ],
  },
  {
    id: 'ransomware', emoji: '👾', name: 'Ransomware', beats: 'update', zone: 4, hp: 120, power: 26, rare: true,
    about: 'Locks all your files and demands money to unlock them.',
    tip: 'Keep backups and updates on, never open surprise attachments, and never pay.',
    attacks: [
      'locks every file: "Pay $500 in Bitcoin to get them back!"',
      'sneaks in through an email attachment called invoice.pdf.exe.',
    ],
  },
];

const BOSS = {
  id: 'omega', emoji: '☠️', name: 'Omega Ransomware', beats: 'update', hp: 260, power: 30,
  about: 'The final boss of the internet. It steals files, then threatens to leak them.',
  tip: 'Backups, updates and never paying keep you safe, even from the worst ransomware.',
  attacks: [
    'encrypts everything and threatens to post your files online!',
    'uses a stolen password to get back in.',
    'sends a fake "IT department" message with a poisoned link.',
    'pretends to be your school\'s tech support on chat.',
  ],
  // The boss switches tactics, so you have to read each attack
  mixed: { 1: 'twofa', 2: 'linkcheck', 3: 'verify' },
};

// ---------- The map ----------
// Four zones, left to right. Each is 16 tiles wide and 14 tall.
// # wall   . ground   , spam grass (wild threats)   ~ data stream   R restore point
// S sign   N friendly person   T hacker trainer   G gate (needs that zone's badge)   B final boss   H home
const ZONES = [
  {
    name: 'Home Network', ground: '#1d3a2f', grass: '#2f6b3f', wall: '🌳',
    rows: [
      '################',
      '#H....,,,,.....#',
      '#.....,,,,..S..#',
      '#..R..,,,,.....#',
      '#..........~~..#',
      '#.,,,......~~..#',
      '#.,,,..N...~~..#',
      '#.,,,..........G',
      '#..........,,,.#',
      '#..T.......,,,.#',
      '#..........,,,.#',
      '#..S...........#',
      '#..............#',
      '################',
    ],
  },
  {
    name: 'Social Media City', ground: '#2a2550', grass: '#4a3a8a', wall: '🏢',
    rows: [
      '################',
      '#...,,,,,......#',
      '#.S.,,,,,..N...#',
      '#...,,,,,......#',
      '#..............#',
      '#.~~~...,,,,,..#',
      '#.~~~...,,,,,..#',
      '.....R..,,,,,..G',
      '#..............#',
      '#.,,,,......T..#',
      '#.,,,,.........#',
      '#.,,,,...S.....#',
      '#..............#',
      '################',
    ],
  },
  {
    name: 'Download Woods', ground: '#2e2a18', grass: '#5a4a1a', wall: '🌲',
    rows: [
      '################',
      '#.,,,,....,,,,.#',
      '#.,,,,....,,,,.#',
      '#.,,,,.S..,,,,.#',
      '#..............#',
      '#...~~~~...N...#',
      '#...~~~~.......#',
      '.....R.........G',
      '#.,,,,,....,,,.#',
      '#.,,,,,....,,,.#',
      '#.,,,,,..T.,,,.#',
      '#..............#',
      '#.....S........#',
      '################',
    ],
  },
  {
    name: 'Dark Web Depths', ground: '#1f0d16', grass: '#4a1028', wall: '🧱',
    rows: [
      '################',
      '#..,,,,,,,,....#',
      '#..,,,,,,,,..S.#',
      '#..,,,,,,,,....#',
      '#..........~~..#',
      '#.R........~~..#',
      '#..........~~..#',
      '...,,,,,.....B.#',
      '#..,,,,,.......#',
      '#..,,,,,..T....#',
      '#..............#',
      '#.N..,,,,,,....#',
      '#....,,,,,,....#',
      '################',
    ],
  },
];

// Signs and friendly people, by zone. Each line is one page of dialogue.
const ZONE_TALK = [
  {
    S: [
      ['Welcome to the Home Network! Spam grass (the darker squares) hides wild threats.', 'Walk through it to find them, then battle with the right defense.'],
      ['Tip: every threat has a weakness. Phishing → Link Check. Password attacks → 2FA. Malware → Update. Fake people → Verify.'],
    ],
    N: [['👩 Mom: Be careful out there! If anything online feels weird, come tell me. That\'s what "Ask for help" does in battle.', 'The 💾 Restore Point fixes your data if you get hurt.']],
  },
  {
    S: [
      ['Social Media City: lots of friends... and lots of fakes.', 'Catfish and Impersonators pretend to be people you know. Verify them!'],
      ['Rule of the city: never share your address, school or passwords with someone you only know online.'],
    ],
    N: [['🧑‍🎤 Streamer: Someone made a fake copy of my account and asked fans for money! I would NEVER do that.', 'If a "famous" account asks for your login or money, it\'s fake.']],
  },
  {
    S: [
      ['Download Woods: free mods, free games, free... malware.', 'Only download from official app stores!'],
      ['Updates aren\'t annoying, they\'re armor. Each one patches holes that worms and trojans crawl through.'],
    ],
    N: [['🧑‍🔧 IT Ranger: A keylogger can steal your password as you type it.', 'But with 2-step verification, the hacker still can\'t get in without your phone!']],
  },
  {
    S: [['⚠️ Dark Web Depths. Leaked passwords are traded here.', 'Never reuse a password: one leak shouldn\'t unlock everything.']],
    N: [['🕵️‍♀️ Security Researcher: Omega Ransomware lives at the end of this cave.', 'It changes tactics every turn. Read each attack carefully and pick the matching defense!']],
  },
];

// Hacker trainers: beat their team to win the badge that opens the next gate
const TRAINERS = [
  { emoji: '🧢', name: 'Script Kiddie Sam', team: ['phisher', 'adware', 'smisher'], badge: '🛡️ Spam Badge',
    intro: 'Heh, I bought a phishing kit online. Let\'s see if you can spot my tricks!', outro: 'Aw man, you saw right through me. Here, take the Spam Badge.' },
  { emoji: '🕶️', name: 'Influencer Ivy', team: ['giveaway', 'catfish', 'impersonator'], badge: '🎭 Truth Badge',
    intro: 'My followers believe anything I post. Will you?', outro: 'Okay, okay, you really do check who you\'re talking to. Truth Badge is yours.' },
  { emoji: '🧪', name: 'Malware Mo', team: ['trojan', 'worm', 'keylogger'], badge: '🔄 Patch Badge',
    intro: 'Want a free game? It\'s totally safe. Probably.', outro: 'Your updates are too strong! Take the Patch Badge.' },
  { emoji: '💀', name: 'Dark Lord Dex', team: ['cracker', 'stuffer', 'keylogger'], badge: '🔐 Lock Badge',
    intro: 'I have a list of a billion leaked passwords. Is yours on it?', outro: 'Unique passwords AND 2FA? Impossible! Fine, take the Lock Badge.' },
];
