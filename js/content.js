// Learning content: realistic messages, the Real or Scam quiz, and tower unlock challenges.
// Everything here is fake and made up for practice. Edit or add to it freely!

// ---------- Messages each threat carries ----------
// When you click a threat in Tower Defense, you read one of these and decide what kind of threat it is.
// "flags" explains the red flags once you answer.
const MESSAGES = {
  phisher: [
    {
      from: 'Roblox Rewards',
      meta: 'support@roblox-giftcards.co',
      text: '🎁 Congrats! You were selected for 10,000 FREE Robux! Claim in the next 60 minutes before it expires:',
      link: 'roblox-giftcards.co/claim',
      flags: 'A free prize you never entered for, a timer to rush you, and the link goes to roblox-giftcards.co, not roblox.com.',
    },
    {
      from: '+1 (844) 555-0192',
      meta: 'Text message',
      text: 'USPS: Your package is on hold because of an incomplete address. Update your info now:',
      link: 'usps-redelivery-help.com',
      flags: 'Delivery companies don\'t text random links. The real site is usps.com, and you can track packages there yourself.',
    },
    {
      from: 'Instagram',
      meta: 'Direct message',
      text: 'Your account was reported for copyright violation and will be DELETED in 24 hours. Appeal here:',
      link: 'insta-appeal-center.net',
      flags: 'Scary threats plus a deadline are meant to make you panic. Real Instagram warnings show up inside the app, not on random websites.',
    },
    {
      from: 'School IT Department',
      meta: 'it-help@schoo1-portal.com',
      text: 'Your school email password expires TODAY. Log in below to keep your account active.',
      link: 'schoo1-portal.com/login',
      flags: '"schoo1" uses the number 1 instead of an L. Your school\'s IT team won\'t ask you to log in through an email link.',
    },
    {
      from: 'Your friend Maya',
      meta: 'Discord DM',
      text: 'bro is this you in this video?? 😂😂',
      link: 'discord-nitro-gift.ru/v/8812',
      flags: 'Friends\' accounts get hacked too. "Is this you?" links are a classic trick to steal your login. Ask your friend another way first.',
    },
  ],
  cracker: [
    {
      from: 'Snapchat',
      meta: 'Text message',
      text: 'Your Snapchat login code is 482913. Don\'t share it with anyone.',
      note: 'You didn\'t try to log in.',
      flags: 'A login code you didn\'t ask for means someone already has your password and is trying to get in. Change your password now.',
    },
    {
      from: 'Unknown number',
      meta: 'Text message',
      text: 'omg sorry, I sent my 6-digit code to your number by accident. can you send it back to me?',
      flags: 'That code is the key to YOUR account. A hacker who knows your password needs it to get past 2-step verification. Never share codes.',
    },
    {
      from: 'Data Breach Alert',
      meta: 'Your email provider',
      text: 'A game site you signed up for in 2023 was hacked. 2 million emails and passwords were leaked, including yours.',
      flags: 'Hackers try leaked passwords on all your other accounts. That\'s why every account needs a different password.',
    },
    {
      from: 'Account Security',
      meta: 'Sign-in screen',
      text: '⚠️ 47 failed sign-in attempts on your account in the last 10 minutes.',
      flags: 'A program is guessing your password over and over. Long, unique passwords and 2-step verification stop it.',
    },
    {
      from: 'Google',
      meta: 'no-reply@accounts.google.com',
      text: 'Someone just signed in to your account from a new device in another country. Wasn\'t you? Secure your account.',
      flags: 'Someone got your password. Change it, sign out other devices, and turn on 2-step verification.',
    },
  ],
  worm: [
    {
      from: 'xX_FreeGames_Xx',
      meta: 'YouTube comment',
      text: 'FREE Minecraft full version!! no virus 100% working, download here 👇',
      link: 'MC_free_installer.exe',
      flags: 'Free copies of paid games and .exe files from random links are one of the top ways malware spreads.',
    },
    {
      from: 'Security Warning',
      meta: 'Website pop-up',
      text: '⚠️ WARNING! Your phone has 13 viruses! Tap here to download CleanBoost and fix it NOW!',
      flags: 'Websites can\'t scan your phone. Fake virus alerts trick you into installing real malware.',
    },
    {
      from: 'gamer_pro_99',
      meta: 'Discord server',
      text: 'new Fortnite aimbot, totally undetectable 🔥 just run the file',
      link: 'fn_aimbot_v3.zip',
      flags: 'Cheat tools often hide malware, and they can get your account banned too.',
    },
    {
      from: 'Unknown sender',
      meta: 'Email attachment',
      text: 'Hi, here is the homework file you asked for.',
      link: 'Homework_Final.pdf.exe',
      flags: '".pdf.exe" is a program pretending to be a document. Never open attachments you weren\'t expecting.',
    },
    {
      from: 'apkfree-mods.biz',
      meta: 'Download page',
      text: 'Spotify Premium MOD: free forever, no ads! Download the app here.',
      link: 'spotify_premium_mod.apk',
      flags: 'Modded apps from outside the official app store can hide spyware that steals your info.',
    },
  ],
  catfish: [
    {
      from: 'jess_xo_2010',
      meta: 'New account · 2 posts · 0 mutual friends',
      text: 'heyy u seem rly cool!! im new to ur area 😊 can we talk on snap instead?',
      flags: 'A brand-new account, compliments right away, and pushing to move to a private app are big red flags.',
    },
    {
      from: 'tyler.16',
      meta: 'Direct message',
      text: 'my camera is broken so i cant video call lol. but heres a pic of me',
      flags: 'Always having an excuse not to video chat is a sign. The photo could be stolen from someone else\'s profile.',
    },
    {
      from: 'Ava | Model Scout ✨',
      meta: 'Direct message',
      text: 'You could totally be a model! Send me a few photos and your home address so we can mail you a contract 💖',
      flags: 'Strangers asking for photos or your address is a major red flag. Real agencies talk to parents, not DMs.',
    },
    {
      from: 'sam_gamer',
      meta: 'Online friend for 2 weeks',
      text: 'i feel like i can tell u anything. dont tell ur parents about me ok? they wouldnt get it',
      flags: 'Someone asking you to keep secrets from trusted adults is one of the biggest warning signs. Tell an adult you trust.',
    },
    {
      from: 'xoxo_brooke',
      meta: 'Direct message',
      text: 'i can get u a $50 gift card! i just need ur full name, school and birthday for the form',
      flags: 'Your school and birthday help strangers find you or steal your identity. Real friends don\'t need a form.',
    },
  ],
};

// ---------- Real or Scam quiz (between waves) ----------
// Not everything online is a scam! Some of these are real, so players learn what's safe too.
const QUIZ = [
  { from: 'Link', link: 'paypa1.com/login', answer: 'scam', why: 'Look closely: "paypa1" uses the number 1 instead of an L. The real site is paypal.com.' },
  { from: 'Link', link: 'https://www.roblox.com/home', answer: 'real', why: 'The domain right before the first single slash is roblox.com, the real site.' },
  { from: 'Link', link: 'instagram.com.account-security.io/login', answer: 'scam', why: 'The real domain is the last part before the slash: account-security.io. "instagram.com" at the start is just a disguise.' },
  { from: 'Link', link: 'https://accounts.google.com/signin', answer: 'real', why: 'accounts.google.com is part of google.com, so this is Google\'s real sign-in page.' },
  { from: '+1 (213) 555-0144', meta: 'Text message', text: 'Hi sweetie it\'s Mom, I lost my phone and this is my new number. Can you buy a $100 gift card and text me the code?', answer: 'scam', why: 'Requests for gift cards are almost always scams. Call your parent\'s real number to check.' },
  { from: 'Discord', meta: 'Text message', note: 'You just tried to log in to Discord on a new computer.', text: 'Your Discord security code is 551234. If you didn\'t request this, ignore this message.', answer: 'real', why: 'You asked for this code, so it\'s expected. Use it, but never share it with anyone.' },
  { from: 'Apple Support', meta: 'Text message', text: 'Your Apple ID has been locked for security reasons. Unlock now:', link: 'apple-id-verify.help', answer: 'scam', why: 'Apple doesn\'t text links like this. Check your account in your phone\'s Settings app instead.' },
  { from: 'Mr. Rivera', meta: 'Google Classroom post', text: 'Reminder: lab reports are due Friday. The rubric is attached in this assignment.', answer: 'real', why: 'It\'s inside your school\'s Classroom, from your teacher, about real class work, and doesn\'t ask for passwords.' },
  { from: 'Prize Center', meta: 'Website banner', text: '🎉 You are the 1,000,000th visitor! You won a FREE iPhone 16. Just pay $2.99 shipping.', answer: 'scam', why: 'You can\'t win something you didn\'t enter. The "shipping fee" is how they steal your card info.' },
  { from: 'Settings', meta: 'Your phone', text: 'Software Update: iOS 26.1 is available. This update includes important security fixes.', answer: 'real', why: 'Updates in your phone\'s own Settings app are real and important. They fix holes hackers use.' },
  { from: 'Easy Money Jobs', meta: 'Instagram ad', text: 'Teens! Earn $500/week as a "payment helper". Just receive money in your account and send it on.', answer: 'scam', why: 'This is called being a "money mule". It\'s used to move stolen money, and it\'s illegal even if you didn\'t know.' },
  { from: 'Google', meta: 'no-reply@accounts.google.com', note: 'You just signed in on your new laptop.', text: 'New sign-in on Windows. If this was you, you don\'t need to do anything.', answer: 'real', why: 'This matches something you just did, and it doesn\'t ask you to click or log in. It\'s a real security alert.' },
  { from: 'Steam Support', meta: 'Steam chat', text: 'A friend reported your account by accident. Message this admin on Discord within 1 hour or you\'ll be banned.', answer: 'scam', why: 'Support teams don\'t contact you through chat or Discord. The rush and threat are big red flags.' },
  { from: 'Café flyer', meta: 'QR code', text: 'Scan for FREE Wi-Fi! Then sign in with your Google email and password to connect.', answer: 'scam', why: 'Wi-Fi never needs your Google password. Fake QR codes can lead to phishing pages.' },
  { from: 'Your best friend', meta: 'At school, in person', text: 'I made a new TikTok account, my username is @leo.draws, follow me!', answer: 'real', why: 'You heard it from your friend in person, so you know the account is really theirs.' },
  { from: 'Chase Mobile', meta: 'Notification inside the bank app', text: 'Your card was used for $4.50 at Corner Café.', answer: 'real', why: 'It\'s in the official app and doesn\'t ask you to click a link or share info.' },
  { from: 'TikTok Creator Fund', meta: 'Direct message', text: 'You\'ve been chosen to get paid for your videos! Send us your login so we can link your account.', answer: 'scam', why: 'No real company asks for your password. Anyone who does is trying to steal your account.' },
  { from: 'Minecraft', meta: 'Microsoft Store', text: 'Minecraft update 1.22 is ready to install.', answer: 'real', why: 'Updates from the official app store are safe and keep your game secure.' },
];

// ---------- Flashcards (the Study tab) ----------
// The words players need to know. "example" is optional.
const FLASHCARDS = [
  {
    emoji: '🎣',
    term: 'Phishing',
    def: 'A fake message, email or text pretending to be someone you trust, so you\'ll click a bad link or give away your password.',
    example: 'A text from "USPS" with a link to usps-redelivery-help.com',
  },
  {
    emoji: '🚩',
    term: 'Red flag',
    def: 'A warning sign that something might be a scam: rushing you, prizes you never entered for, spelling mistakes, or asking for private info.',
    example: '"Claim your FREE Robux in the next 60 minutes!"',
  },
  {
    emoji: '🌐',
    term: 'Domain',
    def: 'The real name of a website: the part right before the first single "/". Scammers make fake domains that look almost right.',
    example: 'In roblox.com.free-robux.net/login, the real domain is free-robux.net',
  },
  {
    emoji: '🔓',
    term: 'Password attack',
    def: 'When someone tries to break into your account by guessing your password, or by using one that leaked from another site.',
    example: 'A login code you didn\'t ask for shows up on your phone.',
  },
  {
    emoji: '💥',
    term: 'Data breach',
    def: 'When a company gets hacked and people\'s info, like emails and passwords, gets leaked.',
    example: 'If a site you used gets breached, change that password everywhere you used it.',
  },
  {
    emoji: '🔑',
    term: 'Strong password',
    def: 'A long password (12+ characters) that\'s different for every account. Three or four random words together is strong and easy to remember.',
    example: 'Purple-Taco-Rocket-42',
  },
  {
    emoji: '🔐',
    term: '2-step verification (2FA)',
    def: 'A second check when you log in, like a code sent to your phone. Even if someone steals your password, they can\'t get in without it.',
    example: 'Never share your 2FA code, not even with "friends".',
  },
  {
    emoji: '🐛',
    term: 'Malware',
    def: 'Harmful software hidden in downloads, game cheats, mods or fake apps. It can spy on you or steal your info.',
    example: 'A file called Homework_Final.pdf.exe',
  },
  {
    emoji: '🔄',
    term: 'Software update',
    def: 'A free fix from the company that made your device or app. Updates patch security holes that hackers use.',
    example: 'Update from Settings or the official app store, never from a pop-up.',
  },
  {
    emoji: '🎭',
    term: 'Catfish',
    def: 'Someone online pretending to be a different person, often someone your age, to win your trust.',
    example: 'A brand-new account that can never video call.',
  },
  {
    emoji: '✅',
    term: 'Verify',
    def: 'Checking that someone or something is real before you trust it, like asking a friend in person or going to the official website yourself.',
  },
  {
    emoji: '🪪',
    term: 'Personal info',
    def: 'Details that can identify or find you: your full name, address, school, birthday, passwords and photos. Keep them private online.',
  },
  {
    emoji: '⚙️',
    term: 'Privacy settings',
    def: 'Options in apps that control who can see your posts and message you. Set accounts to private and only accept people you know.',
  },
  {
    emoji: '💸',
    term: 'Money mule',
    def: 'Someone who moves money for strangers, which is usually stolen money. It\'s illegal, even if you didn\'t know.',
    example: '"Earn $500/week! Just receive money and send it on."',
  },
];

// ---------- Tower unlock challenges ----------
// Each tower is locked until you prove you know the safety habit it stands for.
const CHALLENGES = {
  linkcheck: {
    title: 'Spot the Real Link',
    prompt: 'You want to log in to Roblox. Which link really goes to Roblox?',
    options: [
      { text: 'roblox.com.free-robux.net/login', correct: false, why: 'The real domain is free-robux.net. "roblox.com" at the start is a disguise.' },
      { text: 'rob1ox.com/login', correct: false, why: 'Look closely: that\'s a number 1, not an L.' },
      { text: 'www.roblox.com/login', correct: true, why: 'Correct! The domain right before the first single slash is roblox.com.' },
    ],
    tip: 'Tip: the real website name is the part right before the first single "/". Read it carefully, letter by letter.',
  },
  twofa: {
    title: 'Build a Strong Password',
    password: true,
    prompt: 'Make a password strong enough to stop a Password Cracker, then turn on 2-step verification. (Practice only, never type a password you really use!)',
    tip: 'Tip: string 3 or 4 random words together, like Purple-Taco-Rocket-42. Long is strong, and it\'s easy to remember.',
  },
  update: {
    title: 'Safe Updates',
    prompt: 'A website pop-up says: "Your phone is out of date! Download UpdateNow.apk to stay safe." What should you do?',
    options: [
      { text: 'Download it, updates are important', correct: false, why: 'Updates are important, but real ones never come from website pop-ups. This is malware.' },
      { text: 'Close it, then check for updates in your phone\'s Settings', correct: true, why: 'Correct! Real updates come from Settings or the official app store.' },
      { text: 'Never update anything, it\'s too risky', correct: false, why: 'Skipping updates leaves security holes open. Hackers love out-of-date devices.' },
    ],
    tip: 'Tip: turn on automatic updates so your phone and apps stay protected.',
  },
  verify: {
    title: 'Who Are You Really?',
    prompt: 'A new account messages you: "hey I go to your school! add me?" You don\'t recognize them. What\'s the best move?',
    options: [
      { text: 'Add them, they know your school', correct: false, why: 'Your school is easy to find from posts or your bio. It doesn\'t prove who they are.' },
      { text: 'Check for red flags (new account, no mutual friends) and ask friends in person if they know them', correct: true, why: 'Correct! Check the profile and confirm in real life before trusting someone.' },
      { text: 'Send them your Snapchat so they can prove it', correct: false, why: 'That gives a stranger more ways to contact you. Verify first, share later (or never).' },
    ],
    tip: 'Tip: if you can\'t confirm who someone is in real life, don\'t share personal info with them.',
  },
};
