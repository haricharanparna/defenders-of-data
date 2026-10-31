// Adventure mode content: the threats you can meet and quarantine, the world map, and everyone in it.
// Each threat has a type, and each type is beaten by one of your four defenses (the towers from
// Tower Defense). Picking the right defense for each attack is how you win battles.

const DEFENSES = {
  linkcheck: { emoji: '🔍', name: 'Link Check', move: 'Check where the link really goes', type: 'Phishing' },
  twofa: { emoji: '🔐', name: '2FA Lock', move: 'Lock it with 2-step verification', type: 'Password' },
  update: { emoji: '🔄', name: 'Update Patch', move: 'Update and scan your device', type: 'Malware' },
  verify: { emoji: '📡', name: 'Verify', move: 'Check who it really is', type: 'Social' },
};

// Rarer threats are harder to find, tougher in battle and harder to quarantine.
// hp and power multiply a threat's base stats; weight is how often it shows up in the wild.
const RARITY = {
  common: { name: 'Common', color: '#9fb0d8', hp: 1, power: 1, weight: 50, tier: 1 },
  uncommon: { name: 'Uncommon', color: '#7cff6b', hp: 1.3, power: 1.15, weight: 25, tier: 1 },
  rare: { name: 'Rare', color: '#4db8ff', hp: 1.7, power: 1.3, weight: 10, tier: 2 },
  epic: { name: 'Epic', color: '#c58bff', hp: 2.2, power: 1.5, weight: 4, tier: 3 },
  legendary: { name: 'Legendary', color: '#ffd23f', hp: 3, power: 1.8, weight: 1.2, tier: 3 },
};

// beats: the defense that is super effective. zone: where it lives (1 to 4).
const CREATURES = [
  // ---------- Home Network ----------
  {
    id: 'phisher', emoji: '🎣', name: 'Phisher', beats: 'linkcheck', zone: 1, rarity: 'common',
    about: 'Sends fake messages that look like they come from a real company, hoping you click a bad link.',
    tip: 'Before you click, check the real domain: the part right before the first single slash.',
    attacks: [
      'casts a line: "Your Roblox account will be deleted! Log in now: roblox-security.help"',
      'sends an email from "Netfl1x Billing": "Payment failed. Update your card here."',
      'whispers: "Click fast, this offer ends in 10 minutes!"',
    ],
  },
  {
    id: 'smisher', emoji: '📱', name: 'Smisher', beats: 'linkcheck', zone: 1, rarity: 'common',
    about: 'Phishing by text message. It pretends to be a delivery company, your bank or even a friend.',
    tip: 'Delivery and bank texts with links are a classic scam. Open the real app instead.',
    attacks: [
      'texts: "USPS: your package is on hold. Confirm your address: usps-track.co"',
      'texts: "Your bank card is locked. Tap here to unlock: bnk-verify.net"',
    ],
  },
  {
    id: 'adware', emoji: '📢', name: 'Adware Gremlin', beats: 'update', zone: 1, rarity: 'common',
    about: 'Sneaks in with free downloads and fills your screen with pop-ups and fake virus warnings.',
    tip: 'Only download apps from official stores, and keep your device updated.',
    attacks: [
      'flashes a pop-up: "WARNING! 37 viruses found! Download CleanerPro now!"',
      'hides inside a "free" wallpaper app and floods your screen with ads.',
    ],
  },
  {
    id: 'quisher', emoji: '🔳', name: 'QR Quisher', beats: 'linkcheck', zone: 1, rarity: 'uncommon',
    about: 'Sticks fake QR codes on posters and parking meters that lead to phishing sites.',
    tip: 'After scanning a QR code, read the link your phone shows before you open it.',
    attacks: [
      'puts a sticker over the café menu: "Scan for free Wi-Fi!" It goes to wifi-login.click.',
      'hides a QR code in an email: "Scan to keep your account active."',
    ],
  },
  {
    id: 'spear', emoji: '🎯', name: 'Spear Phisher', beats: 'linkcheck', zone: 1, rarity: 'rare',
    about: 'A phisher that studies you first, then uses your name, school or team to make the trap believable.',
    tip: 'Even if a message knows your name and school, check the link and the sender before trusting it.',
    attacks: [
      'emails: "Hi Jordan! Coach Kim here. Here\'s the new team schedule:" The link goes to team-docs.co.',
      'messages: "Your Lincoln Middle School account expires today. Sign in here."',
    ],
  },

  // ---------- Social Media City ----------
  {
    id: 'giveaway', emoji: '🎁', name: 'Giveaway Bot', beats: 'linkcheck', zone: 2, rarity: 'common',
    about: 'Promises free prizes, skins or money, but only after you "verify" with your login or card.',
    tip: 'You can\'t win something you never entered. Real prizes never need your password.',
    attacks: [
      'comments: "FREE V-BUCKS! First 100 people only: vbucks-gift.xyz"',
      'DMs: "You won an iPhone 16! Just pay $2.99 shipping here."',
    ],
  },
  {
    id: 'catfish', emoji: '🎭', name: 'Catfish', beats: 'verify', zone: 2, rarity: 'uncommon',
    about: 'Pretends to be someone they\'re not, usually someone your age, to earn your trust.',
    tip: 'If you\'ve never met them in person, you can\'t be sure who they are. Never share private info or photos.',
    attacks: [
      'messages: "hey! I\'m 14 too, we have so much in common. what school do you go to?"',
      'says: "Let\'s keep our chats a secret from your parents, ok?"',
    ],
  },
  {
    id: 'impersonator', emoji: '🪞', name: 'Impersonator', beats: 'verify', zone: 2, rarity: 'uncommon',
    about: 'Copies a friend\'s or a celebrity\'s profile, then asks for money, codes or favors.',
    tip: 'If a "friend" asks for money or codes, call or ask them in person first.',
    attacks: [
      'messages from your "best friend\'s" new account: "Lost my phone, can you send me a $50 gift card?"',
      'pretends to be a famous streamer: "Send me your login and I\'ll gift you a sub!"',
    ],
  },
  {
    id: 'techsupport', emoji: '🎧', name: 'Fake Tech Support', beats: 'verify', zone: 2, rarity: 'rare',
    about: 'Pretends to be from Microsoft, Apple or your school\'s IT team so you\'ll give them control of your device.',
    tip: 'Real tech companies don\'t call or pop up out of nowhere. Hang up and contact them through their official site.',
    attacks: [
      'calls: "This is Microsoft. Your computer has a virus. Install this app so we can fix it."',
      'pops up: "Your PC is locked! Call this number now for support."',
    ],
  },
  {
    id: 'whale', emoji: '🐋', name: 'Whale Phisher', beats: 'linkcheck', zone: 2, rarity: 'epic',
    about: 'Goes after the "big fish": it pretends to be a principal or a boss to trick people into acting fast.',
    tip: 'If an important person asks for something urgent and unusual, check with them another way first.',
    attacks: [
      'emails as your principal: "Urgent! Everyone must log in here before 3pm or lose access."',
      'writes as the school boss: "I need gift cards for the staff today. Keep it a surprise!"',
    ],
  },
  {
    id: 'deepfake', emoji: '🤖', name: 'Deepfake', beats: 'verify', zone: 2, rarity: 'legendary',
    about: 'Uses AI to fake a real person\'s face or voice, so it looks and sounds like someone you trust.',
    tip: 'If a video or call asks for money or secrets, verify it another way. Families can agree on a secret code word.',
    attacks: [
      'calls using your cousin\'s cloned voice: "I\'m in trouble, send money right now, don\'t tell anyone!"',
      'posts a fake video of a famous YouTuber promoting a crypto giveaway.',
    ],
  },

  // ---------- Download Woods ----------
  {
    id: 'worm', emoji: '🐛', name: 'Malware Worm', beats: 'update', zone: 3, rarity: 'common',
    about: 'Spreads from device to device through security holes that haven\'t been patched.',
    tip: 'Updates patch the holes worms crawl through. Turn on automatic updates.',
    attacks: [
      'crawls through an old app you never updated.',
      'copies itself to every device on your Wi-Fi.',
    ],
  },
  {
    id: 'trojan', emoji: '🐴', name: 'Trojan Horse', beats: 'update', zone: 3, rarity: 'uncommon',
    about: 'Hides malware inside something that looks useful, like a game mod or a free tool.',
    tip: 'Free mods, cheats and cracked games from random sites often hide malware.',
    attacks: [
      'offers: "Minecraft super mod pack, totally free! Just run setup.exe"',
      'disguises itself as a homework helper app from a random website.',
    ],
  },
  {
    id: 'cryptojacker', emoji: '⛏️', name: 'Cryptojacker', beats: 'update', zone: 3, rarity: 'uncommon',
    about: 'Secretly uses your computer to mine cryptocurrency, making it slow, hot and loud.',
    tip: 'If your device is suddenly slow and hot for no reason, run a scan and update everything.',
    attacks: [
      'sneaks into a browser extension and makes your laptop fan scream.',
      'hides in a "free game booster" and uses all your computer\'s power.',
    ],
  },
  {
    id: 'keylogger', emoji: '⌨️', name: 'Keylogger', beats: 'twofa', zone: 3, rarity: 'uncommon',
    about: 'Secretly records everything you type, including your passwords.',
    tip: 'Even if a keylogger steals your password, 2-step verification stops the hacker at the second step.',
    attacks: [
      'quietly records every key you type, including your password.',
      'sends your typed password to a hacker server.',
    ],
  },
  {
    id: 'spyware', emoji: '👁️', name: 'Spyware', beats: 'update', zone: 3, rarity: 'rare',
    about: 'Watches what you do, where you go and who you talk to, then reports it to someone else.',
    tip: 'Check which apps can use your camera, microphone and location, and remove apps you don\'t trust.',
    attacks: [
      'hides in a flashlight app that asks for your location, camera and contacts.',
      'turns on your microphone without the light coming on.',
    ],
  },
  {
    id: 'rootkit', emoji: '🕳️', name: 'Rootkit', beats: 'update', zone: 3, rarity: 'epic',
    about: 'Burrows deep into a device and hides itself from normal scans so it can stay for a long time.',
    tip: 'Keep your system updated and use built-in security tools. If something is badly wrong, ask an adult to reset the device.',
    attacks: [
      'digs into your system files and hides from your antivirus.',
      'gives a hacker secret control of your computer every time it starts.',
    ],
  },

  // ---------- Dark Web Depths ----------
  {
    id: 'cracker', emoji: '🔓', name: 'Password Cracker', beats: 'twofa', zone: 4, rarity: 'common',
    about: 'Guesses millions of passwords a second, starting with the most common ones.',
    tip: 'Use long, unique passwords, and turn on 2-step verification.',
    attacks: [
      'tries "password123", "qwerty" and "iloveyou" on your account.',
      'guesses your password using your pet\'s name and birthday.',
    ],
  },
  {
    id: 'stuffer', emoji: '🧦', name: 'Credential Stuffer', beats: 'twofa', zone: 4, rarity: 'rare',
    about: 'Takes passwords leaked from one site and tries them on all your other accounts.',
    tip: 'Never reuse passwords. A password manager can remember them all for you.',
    attacks: [
      'found your password in a leak from an old game site and is trying it on your email.',
      'tries your leaked password on 500 other websites at once.',
    ],
  },
  {
    id: 'hijacker', emoji: '🍪', name: 'Session Hijacker', beats: 'twofa', zone: 4, rarity: 'rare',
    about: 'Steals the "you\'re logged in" cookie from your browser so it can skip the password completely.',
    tip: 'Log out on shared computers, don\'t install sketchy extensions, and keep 2-step verification on for sign-in alerts.',
    attacks: [
      'grabs the login cookie from a school computer you forgot to log out of.',
      'uses a fake browser extension to copy your logged-in session.',
    ],
  },
  {
    id: 'simswap', emoji: '📶', name: 'SIM Swapper', beats: 'twofa', zone: 4, rarity: 'epic',
    about: 'Tricks a phone company into moving your number to their SIM card, so they get your text codes.',
    tip: 'Use an authenticator app for 2-step codes when you can, and ask your family to add a PIN to your phone account.',
    attacks: [
      'calls your phone company pretending to be you and steals your number.',
      'now gets your text message codes and tries to reset your passwords.',
    ],
  },
  {
    id: 'ransomware', emoji: '👾', name: 'Ransomware', beats: 'update', zone: 4, rarity: 'epic',
    about: 'Locks all your files and demands money to unlock them.',
    tip: 'Keep backups and updates on, never open surprise attachments, and never pay.',
    attacks: [
      'locks every file: "Pay $500 in Bitcoin to get them back!"',
      'sneaks in through an email attachment called invoice.pdf.exe.',
    ],
  },
  {
    id: 'zeroday', emoji: '💥', name: 'Zero-Day', beats: 'update', zone: 4, rarity: 'legendary',
    about: 'Attacks a brand-new bug that nobody knew about yet, so there\'s no fix for it on day zero.',
    tip: 'When an emergency update comes out, install it right away. That\'s the fix for a zero-day.',
    attacks: [
      'breaks in through a bug in your browser that was found this morning.',
      'spreads before anyone has time to make a patch!',
    ],
  },
];

// Base stats for a threat in each zone, before rarity
const zoneHp = zone => 50 + 15 * zone;
const zonePower = zone => 10 + 4 * zone;

const BOSS = {
  id: 'omega', emoji: '☠️', name: 'Omega Ransomware', beats: 'update', rarity: 'legendary', hp: 360, power: 30,
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

// ---------- Guardians: the good guys ----------
// They fight beside you in boss battles (hacker trainers and Omega). You start with Hoot and get
// one more with each badge. A guardian takes hits for you, boosts its own defense, and has a
// special move it can use once per battle.
const GUARDIANS = [
  { id: 'hoot', emoji: '🦉', name: 'Hoot', type: 'linkcheck', about: 'A wise owl that spots fake links from a mile away.',
    special: 'Scan', specialText: 'Shows which defense beats the next attack' },
  { id: 'shellock', emoji: '🐢', name: 'Shellock', type: 'twofa', about: 'A turtle with a shell that needs two keys to open.',
    special: 'Shell Shield', specialText: 'Blocks the next attack completely' },
  { id: 'pup', emoji: '🐶', name: 'Patch Pup', type: 'update', about: 'A loyal pup that sniffs out old software and patches it.',
    special: 'Patch Up', specialText: 'Heals you and this guardian' },
  { id: 'verifly', emoji: '🦋', name: 'Verifly', type: 'verify', about: 'A butterfly that sees through every disguise.',
    special: 'Truth Burst', specialText: 'A big hit that always works' },
];
const GUARDIAN_HP = 70;
const GUARDIAN_BOOST = 1.5;   // damage bonus when you use the guardian's own defense

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
