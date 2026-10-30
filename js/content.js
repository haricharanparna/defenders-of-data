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
  { level: 1, from: 'Link', link: 'paypa1.com/login', answer: 'scam', why: 'Look closely: "paypa1" uses the number 1 instead of an L. The real site is paypal.com.' },
  { level: 1, from: 'Link', link: 'https://www.roblox.com/home', answer: 'real', why: 'The domain right before the first single slash is roblox.com, the real site.' },
  { level: 2, from: 'Link', link: 'instagram.com.account-security.io/login', answer: 'scam', why: 'The real domain is the last part before the slash: account-security.io. "instagram.com" at the start is just a disguise.' },
  { level: 2, from: 'Link', link: 'https://accounts.google.com/signin', answer: 'real', why: 'accounts.google.com is part of google.com, so this is Google\'s real sign-in page.' },
  { level: 1, from: '+1 (213) 555-0144', meta: 'Text message', text: 'Hi sweetie it\'s Mom, I lost my phone and this is my new number. Can you buy a $100 gift card and text me the code?', answer: 'scam', why: 'Requests for gift cards are almost always scams. Call your parent\'s real number to check.' },
  { level: 2, from: 'Discord', meta: 'Text message', note: 'You just tried to log in to Discord on a new computer.', text: 'Your Discord security code is 551234. If you didn\'t request this, ignore this message.', answer: 'real', why: 'You asked for this code, so it\'s expected. Use it, but never share it with anyone.' },
  { level: 1, from: 'Apple Support', meta: 'Text message', text: 'Your Apple ID has been locked for security reasons. Unlock now:', link: 'apple-id-verify.help', answer: 'scam', why: 'Apple doesn\'t text links like this. Check your account in your phone\'s Settings app instead.' },
  { level: 1, from: 'Mr. Rivera', meta: 'Google Classroom post', text: 'Reminder: lab reports are due Friday. The rubric is attached in this assignment.', answer: 'real', why: 'It\'s inside your school\'s Classroom, from your teacher, about real class work, and doesn\'t ask for passwords.' },
  { level: 1, from: 'Prize Center', meta: 'Website banner', text: '🎉 You are the 1,000,000th visitor! You won a FREE iPhone 16. Just pay $2.99 shipping.', answer: 'scam', why: 'You can\'t win something you didn\'t enter. The "shipping fee" is how they steal your card info.' },
  { level: 1, from: 'Settings', meta: 'Your phone', text: 'Software Update: iOS 26.1 is available. This update includes important security fixes.', answer: 'real', why: 'Updates in your phone\'s own Settings app are real and important. They fix holes hackers use.' },
  { level: 2, from: 'Easy Money Jobs', meta: 'Instagram ad', text: 'Teens! Earn $500/week as a "payment helper". Just receive money in your account and send it on.', answer: 'scam', why: 'This is called being a "money mule". It\'s used to move stolen money, and it\'s illegal even if you didn\'t know.' },
  { level: 2, from: 'Google', meta: 'no-reply@accounts.google.com', note: 'You just signed in on your new laptop.', text: 'New sign-in on Windows. If this was you, you don\'t need to do anything.', answer: 'real', why: 'This matches something you just did, and it doesn\'t ask you to click or log in. It\'s a real security alert.' },
  { level: 2, from: 'Steam Support', meta: 'Steam chat', text: 'A friend reported your account by accident. Message this admin on Discord within 1 hour or you\'ll be banned.', answer: 'scam', why: 'Support teams don\'t contact you through chat or Discord. The rush and threat are big red flags.' },
  { level: 2, from: 'Café flyer', meta: 'QR code', text: 'Scan for FREE Wi-Fi! Then sign in with your Google email and password to connect.', answer: 'scam', why: 'Wi-Fi never needs your Google password. Fake QR codes can lead to phishing pages.' },
  { level: 1, from: 'Your best friend', meta: 'At school, in person', text: 'I made a new TikTok account, my username is @leo.draws, follow me!', answer: 'real', why: 'You heard it from your friend in person, so you know the account is really theirs.' },
  { level: 2, from: 'Chase Mobile', meta: 'Notification inside the bank app', text: 'Your card was used for $4.50 at Corner Café.', answer: 'real', why: 'It\'s in the official app and doesn\'t ask you to click a link or share info.' },
  { level: 1, from: 'TikTok Creator Fund', meta: 'Direct message', text: 'You\'ve been chosen to get paid for your videos! Send us your login so we can link your account.', answer: 'scam', why: 'No real company asks for your password. Anyone who does is trying to steal your account.' },
  { level: 1, from: 'Minecraft', meta: 'Microsoft Store', text: 'Minecraft update 1.22 is ready to install.', answer: 'real', why: 'Updates from the official app store are safe and keep your game secure.' },

  // Level 1: easy
  { level: 1, from: 'Fortnite', meta: 'YouTube comment', text: 'FREE V-BUCKS GENERATOR 2026!!! no human verification, works 100%', link: 'vbucks-gen.xyz', answer: 'scam', why: '"Generators" for free game money don\'t exist. They steal your login or install malware.' },
  { level: 1, from: 'Ms. Patel', meta: 'Class group chat (in person she said she\'d post it)', text: 'Here are the pages to read for Monday: 45 to 60 in the textbook.', answer: 'real', why: 'Your teacher said she\'d post it, it\'s in the class chat, and it doesn\'t ask for anything.' },
  { level: 1, from: 'Unknown', meta: 'Instagram DM', text: 'You won our giveaway!!! 🎉 DM us your home address and phone number to get your prize.', answer: 'scam', why: 'You didn\'t enter a giveaway. Real giveaways don\'t ask winners for their address in DMs from random accounts.' },
  { level: 1, from: 'Spotify', meta: 'Inside the Spotify app', text: 'Your Wrapped is here! See your top songs of the year.', answer: 'real', why: 'It\'s inside the real app and doesn\'t ask for a password or payment.' },

  // Level 2: medium
  { level: 2, from: 'Link', link: 'https://www.paypal.com.security-check.info/login', answer: 'scam', why: 'The real domain is security-check.info. "www.paypal.com" at the start is only a disguise, even with https.' },
  { level: 2, from: 'Link', link: 'https://help.instagram.com/contact', answer: 'real', why: 'help.instagram.com is part of instagram.com, the real domain right before the first single slash.' },
  { level: 2, from: 'Netflix', meta: 'info@netflix-billing-support.com', text: 'We couldn\'t process your payment. Update your card within 24 hours to avoid losing access.', link: 'netflix-billing-support.com/update', answer: 'scam', why: 'The email and link aren\'t netflix.com. If you\'re worried, open the Netflix app yourself and check your account.' },
  { level: 2, from: 'Roblox', meta: 'Email you get right after clicking "Forgot password" on roblox.com', text: 'Here\'s the link to reset your password. It expires in 30 minutes.', link: 'www.roblox.com/reset', answer: 'real', why: 'You asked for it a minute ago, and the link goes to roblox.com. That\'s exactly what a real reset email looks like.' },
  { level: 2, from: 'Microsoft Authenticator', meta: 'Phone notification, while you\'re NOT logging in', text: 'Approve sign-in request? Tap Approve to continue.', answer: 'scam', why: 'If you aren\'t logging in, someone else is. Tap Deny and change your password. Never approve logins you didn\'t start.' },
  { level: 2, from: 'Jordan (friend)', meta: 'Instagram DM', text: 'omg can you vote for me in this contest?? you just have to log in with your instagram here', link: 'insta-vote-contest.com', answer: 'scam', why: 'Your friend\'s account was probably hacked. Real contests don\'t need you to log in on another site.' },
  { level: 2, from: 'Chrome', meta: 'Pop-up on a random website', text: '⚠️ Your computer has 5 viruses! Call Microsoft Support now: 1-888-555-0199', answer: 'scam', why: 'Websites can\'t scan your computer. Real companies don\'t put phone numbers in pop-ups. Close the tab.' },
  { level: 2, from: 'School Library', meta: 'Email from your school\'s real domain', text: 'Your book "Wonder" is due back on Friday. You can renew it in the library portal.', answer: 'real', why: 'It\'s from your school, about something you actually did, and doesn\'t rush you or ask for your password.' },

  // Level 3: hard
  { level: 3, from: 'Link', link: 'https://www.rnicrosoft.com/account', answer: 'scam', why: 'Look really closely: "rn" next to each other looks like an "m". The real site is microsoft.com.' },
  { level: 3, from: 'Link', link: 'https://drive.google.com/file/d/1aB2c3/view', answer: 'real', why: 'drive.google.com is part of google.com. The domain is real, but still only open files from people you trust!' },
  { level: 3, from: '"Grandma"', meta: 'Phone call, sounds exactly like her', text: '"Sweetie, I\'m in trouble and I need you to send money with an app right now. Don\'t tell your parents."', answer: 'scam', why: 'AI can copy voices from short clips online. The secrecy and money request are the giveaway. Hang up and call her real number.' },
  { level: 3, from: 'QuizMaster App', meta: 'Sign in with Google pop-up', text: 'QuizMaster wants to: Read, send and delete your emails. See your contacts. Manage your Google Drive files.', answer: 'scam', why: 'A quiz app has no reason to read your email or manage your files. Check what an app asks for before you click Allow.' },
  { level: 3, from: 'Have I Been Pwned', meta: 'Email you signed up for at haveibeenpwned.com', text: 'You\'ve been found in a data breach of GameForum. Change your password there and anywhere you reused it.', answer: 'real', why: 'You signed up for these alerts, and it tells you to change your password yourself instead of clicking a login link. That\'s good advice.' },
  { level: 3, from: 'Unknown', meta: 'Email', text: 'I hacked your camera and have videos of you. Pay $300 in Bitcoin in 24 hours or I send them to all your contacts.', answer: 'scam', why: 'This is a bluff called sextortion. They send it to millions of people. Don\'t pay or reply, and tell a trusted adult. It\'s not your fault.' },
  { level: 3, from: 'Recruiter: Amazon Jobs', meta: 'Text message', text: 'Hi! Work from home, $40/hour, no experience needed. Reply YES and we\'ll send your first check to deposit.', answer: 'scam', why: 'Fake checks bounce days later, after you\'ve sent money back. Real jobs don\'t text you out of nowhere.' },
  { level: 3, from: 'Discord', meta: 'Popup when you join a new server', text: 'Verify you\'re human: open the Run box on your computer and paste this command.', answer: 'scam', why: 'Real "are you human" checks never ask you to paste commands. That command installs malware.' },
  { level: 3, from: 'Your phone', meta: 'Settings app', text: 'Your Apple ID was used to sign in on a new iPad near Chicago. Was this you?', note: 'You don\'t own an iPad and have never been to Chicago.', answer: 'real', why: 'The alert is real, and it\'s warning you that someone else has your password! Tap "No", change your password and turn on 2FA.' },
  { level: 3, from: 'Free Public Wi-Fi', meta: 'Network list at the mall', text: 'Mall_Free_WiFi_Official: no password needed', answer: 'scam', why: 'Anyone can name a network "Official". On public Wi-Fi, don\'t log in to important accounts, or use your phone\'s data instead.' },
];

// ---------- Flashcards (the Study tab) ----------
// The words players need to know. "example" is optional.
const FLASHCARDS = [
  {
    emoji: '🎣',
    term: 'Phishing',
    short: 'Fake message that tricks you into clicking',
    def: 'A fake message, email or text pretending to be someone you trust, so you\'ll click a bad link or give away your password.',
    example: 'A text from "USPS" with a link to usps-redelivery-help.com',
  },
  {
    emoji: '🚩',
    term: 'Red flag',
    short: 'A warning sign of a scam',
    def: 'A warning sign that something might be a scam: rushing you, prizes you never entered for, spelling mistakes, or asking for private info.',
    example: '"Claim your FREE Robux in the next 60 minutes!"',
  },
  {
    emoji: '🌐',
    term: 'Domain',
    short: 'A website\'s real name',
    def: 'The real name of a website: the part right before the first single "/". Scammers make fake domains that look almost right.',
    example: 'In roblox.com.free-robux.net/login, the real domain is free-robux.net',
  },
  {
    emoji: '🔓',
    term: 'Password attack',
    short: 'Guessing or stealing your password',
    def: 'When someone tries to break into your account by guessing your password, or by using one that leaked from another site.',
    example: 'A login code you didn\'t ask for shows up on your phone.',
  },
  {
    emoji: '💥',
    term: 'Data breach',
    short: 'A company gets hacked and info leaks',
    def: 'When a company gets hacked and people\'s info, like emails and passwords, gets leaked.',
    example: 'If a site you used gets breached, change that password everywhere you used it.',
  },
  {
    emoji: '🔑',
    term: 'Strong password',
    short: 'Long, unique and hard to guess',
    def: 'A long password (12+ characters) that\'s different for every account. Three or four random words together is strong and easy to remember.',
    example: 'Purple-Taco-Rocket-42',
  },
  {
    emoji: '🔐',
    term: '2-step verification (2FA)',
    short: 'A second check when you log in',
    def: 'A second check when you log in, like a code sent to your phone. Even if someone steals your password, they can\'t get in without it.',
    example: 'Never share your 2FA code, not even with "friends".',
  },
  {
    emoji: '🐛',
    term: 'Malware',
    short: 'Harmful software hidden in downloads',
    def: 'Harmful software hidden in downloads, game cheats, mods or fake apps. It can spy on you or steal your info.',
    example: 'A file called Homework_Final.pdf.exe',
  },
  {
    emoji: '🔄',
    term: 'Software update',
    short: 'A free fix for security holes',
    def: 'A free fix from the company that made your device or app. Updates patch security holes that hackers use.',
    example: 'Update from Settings or the official app store, never from a pop-up.',
  },
  {
    emoji: '🎭',
    term: 'Catfish',
    short: 'A fake person pretending to be someone else',
    def: 'Someone online pretending to be a different person, often someone your age, to win your trust.',
    example: 'A brand-new account that can never video call.',
  },
  {
    emoji: '✅',
    term: 'Verify',
    short: 'Check that something is real first',
    def: 'Checking that someone or something is real before you trust it, like asking a friend in person or going to the official website yourself.',
  },
  {
    emoji: '🪪',
    term: 'Personal info',
    short: 'Details that can identify or find you',
    def: 'Details that can identify or find you: your full name, address, school, birthday, passwords and photos. Keep them private online.',
  },
  {
    emoji: '⚙️',
    term: 'Privacy settings',
    short: 'Control who sees your stuff',
    def: 'Options in apps that control who can see your posts and message you. Set accounts to private and only accept people you know.',
  },
  {
    emoji: '💸',
    term: 'Money mule',
    short: 'Moving money for strangers',
    def: 'Someone who moves money for strangers, which is usually stolen money. It\'s illegal, even if you didn\'t know.',
    example: '"Earn $500/week! Just receive money and send it on."',
  },
  {
    emoji: '👾',
    term: 'Ransomware',
    short: 'Locks your files for money',
    def: 'Malware that locks (encrypts) your files and demands money to unlock them. Paying doesn\'t guarantee you get anything back.',
    example: '"Your files are locked. Pay $500 in Bitcoin within 48 hours."',
  },
  {
    emoji: '💽',
    term: 'Backup',
    short: 'An extra copy of your files',
    def: 'An extra copy of your files kept somewhere else, like the cloud or an external drive. If ransomware strikes, you just restore your copy.',
    example: 'Turn on automatic cloud backup for your photos and schoolwork.',
  },
  {
    emoji: '📲',
    term: 'Authenticator app',
    short: 'Makes a new login code every 30 seconds',
    def: 'An app that makes a new login code every 30 seconds. It\'s safer than text-message codes, because the codes never travel over your phone number.',
  },
];

// ---------- Live DMs (pop up during waves) ----------
// The game keeps running while these are on screen, so players practice deciding fast, like in real life.
// Not every DM is a scam! "punish" is the threat that sneaks in if you pick an unsafe reply.
const DMS = [
  {
    from: 'jaylen 🏀', meta: 'Snapchat',
    text: 'yo i accidentally sent my login code to ur number 😅 can u send it back real quick?',
    punish: 'cracker',
    replies: [
      { text: 'ok here it is: 482913', safe: false, why: 'That code is for YOUR account. Whoever has it can log in as you. This is a common account takeover trick, even from a friend\'s hacked account.' },
      { text: 'nah, I never share codes. I\'ll ask you at school', safe: true, why: 'Login codes are never sent to the wrong person by accident. Never share them, and check with your friend in person.' },
    ],
  },
  {
    from: 'FreeSkinz Bot', meta: 'Discord DM',
    text: '🔥 FREE Fortnite skins for the first 100 people! Log in with your Epic account here:',
    link: 'freeskinz.gg/epic-login',
    punish: 'phisher',
    replies: [
      { text: 'Log in to claim my skins', safe: false, why: 'Free skins for your login is phishing. The site steals your Epic account and everything in it.' },
      { text: 'Ignore it and report the bot', safe: true, why: 'Free stuff + a login link from a bot = phishing. Reporting helps protect other players.' },
    ],
  },
  {
    from: 'Mom', meta: 'Text message (saved contact)',
    text: 'Can you grab milk on the way home? Love you ❤️',
    punish: 'phisher',
    replies: [
      { text: 'ok! 👍', safe: true, why: 'It\'s from Mom\'s saved number, asking something normal, with no link, money or secrets. Not everything is a scam!' },
      { text: 'Block this number, it\'s a scam', safe: false, why: 'Being careful is good, but this is a normal message from a saved contact. Look for real red flags: links, money, secrets and rushing.' },
    ],
  },
  {
    from: 'teen.model.scout', meta: 'Instagram DM',
    text: 'You have the perfect look for our teen modeling agency!! Send a few pics + your age and city 📸',
    punish: 'catfish',
    replies: [
      { text: 'Send pics, age and city', safe: false, why: 'Real agencies don\'t recruit kids through DMs. This is a stranger collecting photos and where you live.' },
      { text: 'Don\'t reply, block and tell a trusted adult', safe: true, why: 'Strangers asking for photos and location are a serious red flag. Blocking and telling an adult is exactly right.' },
    ],
  },
  {
    from: 'Sam', meta: 'Discord DM',
    text: 'send me ur password and ill grind ur account to lvl 50 tonight 💪',
    punish: 'cracker',
    replies: [
      { text: 'bet, it\'s Dragon2011', safe: false, why: 'Never share passwords, even with friends. Friends fall out, and their accounts get hacked too.' },
      { text: 'thx but I don\'t share passwords', safe: true, why: 'Your password is only for you. A real friend will understand.' },
    ],
  },
  {
    from: 'Roblox Admin', meta: 'Roblox chat',
    text: '⚠️ Your account will be BANNED in 10 minutes unless you confirm your password in this chat.',
    punish: 'phisher',
    replies: [
      { text: 'Type my password to confirm', safe: false, why: 'Admins and support teams NEVER ask for your password. Pressure plus a deadline is a classic scam.' },
      { text: 'Report it, real admins never ask for passwords', safe: true, why: 'Exactly. No real company will ever ask for your password in a chat.' },
    ],
  },
  {
    from: '+1 (702) 555-0117', meta: 'Text message',
    text: 'hey it\'s your cousin Dev! lost my phone 😭 can u buy a $50 gift card and text me the code? pay u back',
    punish: 'phisher',
    replies: [
      { text: 'Call Dev or a parent on a number you already know', safe: true, why: 'Always verify with a number you already have. Gift card requests are almost always scams.' },
      { text: 'Buy the gift card and send the code', safe: false, why: 'Gift card codes are like cash, and they can\'t be traced or refunded. That\'s why scammers ask for them.' },
    ],
  },
  {
    from: 'Coach Rivera', meta: 'Team app',
    text: 'Practice moved to 4pm today because of the field trip. See you there!',
    punish: 'phisher',
    replies: [
      { text: 'Got it, thanks coach!', safe: true, why: 'It\'s from your coach in your team\'s app, about something normal, with no link or request. It\'s real.' },
      { text: 'Report it as a scam', safe: false, why: 'Not every message is a scam! This one has no link, no money and no request for info.' },
    ],
  },
  {
    from: 'Nitro Gifts', meta: 'Discord DM',
    text: '🎁 You\'ve been gifted 1 month of Discord Nitro! Claim before it expires:',
    link: 'discord-gift.ru/claim',
    punish: 'worm',
    replies: [
      { text: 'Claim my Nitro!', safe: false, why: 'Real Discord gifts appear inside the app as a gift card, not as a link to discord-gift.ru. That site steals accounts or installs malware.' },
      { text: 'Ignore it, real gifts show up in the app', safe: true, why: 'Right! Check the domain: discord-gift.ru isn\'t discord.com.' },
    ],
  },
  {
    from: 'gamergirl_14', meta: 'Instagram DM (account made last week)',
    text: 'ur so cool!! lets move to snap 😊 whats ur address? i wanna send u a gift',
    punish: 'catfish',
    replies: [
      { text: 'Give my address and Snapchat', safe: false, why: 'A brand-new account, flattery, and a push to a private app are catfish red flags. Never give your address to online-only friends.' },
      { text: 'No thanks, I don\'t share my address online', safe: true, why: 'Keep your address private. If someone keeps pushing, block them and tell a trusted adult.' },
    ],
  },
  {
    from: 'Mod Hub', meta: 'Discord DM',
    text: 'try this minecraft x-ray mod 😎 just run MinecraftXray.exe',
    punish: 'worm',
    replies: [
      { text: 'Run the file', safe: false, why: 'An .exe from a stranger can be anything, including malware. Get mods only from official, trusted sites.' },
      { text: 'Don\'t run it, only get mods from trusted sites', safe: true, why: 'Exactly. Game cheats and mods are one of the most common ways malware spreads.' },
    ],
  },
  // Harder DMs for later waves. (DMs without a level count as level 1.)
  {
    level: 2, from: 'Instagram Support ✔️', meta: 'Instagram DM (account: @insta.help.desk)',
    text: 'Your account is up for a blue checkmark! Fill in our form with your login to verify:',
    link: 'meta-verified-badge.com/apply',
    punish: 'phisher',
    replies: [
      { text: 'Fill in the form, I want a checkmark!', safe: false, why: 'A ✔️ in a display name proves nothing. Real Instagram never DMs you for your login. This steals accounts.' },
      { text: 'Ignore it, real Instagram doesn\'t DM for logins', safe: true, why: 'Right! Real verification happens inside the app settings, never through a DM link.' },
    ],
  },
  {
    level: 2, from: 'Microsoft Authenticator', meta: 'Phone notification (you\'re watching TV, not logging in)',
    text: 'Approve sign-in to your school account? (3rd request in 2 minutes)',
    punish: 'cracker',
    replies: [
      { text: 'Approve so it stops buzzing', safe: false, why: 'This is called MFA fatigue: attackers spam requests until you tap Approve. You just let them in!' },
      { text: 'Deny, then change my password and tell IT', safe: true, why: 'Right! Requests you didn\'t start mean someone has your password.' },
    ],
  },
  {
    level: 3, from: 'Dad', meta: 'Text from an unknown number',
    text: 'hi it\'s dad, phone broke so using a friend\'s. what\'s the code that just got texted to you? need it to log into our netflix',
    punish: 'cracker',
    replies: [
      { text: 'Call Dad\'s real number to check', safe: true, why: 'Right! Codes texted to you are for logging into YOUR accounts. Always verify with a number you already know.' },
      { text: 'Send him the code', safe: false, why: 'Scammers pretend to be family from a "new number". The code would let them into your account.' },
    ],
  },
  {
    level: 3, from: 'Valorant Tournaments', meta: 'Discord DM',
    text: 'Our team needs a 5th player for a $500 tournament! Download our anti-cheat to join the scrim: ValoGuard.exe',
    punish: 'worm',
    replies: [
      { text: 'Download the anti-cheat to join', safe: false, why: 'Fake "anti-cheat" and "game testing" downloads are a huge malware trick aimed at gamers.' },
      { text: 'Decline, real tournaments use the official game client', safe: true, why: 'Right! Never install a program a stranger sends you, no matter how cool the offer.' },
    ],
  },
];

// ---------- Tower upgrade questions ----------
// Upgrading a tower costs bytes AND a right answer to a deeper question about its habit.
const UPGRADES = {
  linkcheck: [
    {
      prompt: 'In this link, what is the REAL domain?',
      msg: { from: 'Link', link: 'login.secure-paypal.com.verify-acct.net/home' },
      options: [
        { text: 'paypal.com', correct: false, why: '"paypal.com" is only a disguise at the start.' },
        { text: 'verify-acct.net', correct: true, why: 'Right! The real domain is the last part before the first single slash: verify-acct.net.' },
        { text: 'secure-paypal.com', correct: false, why: 'Close, but the domain keeps going. The real one is verify-acct.net.' },
      ],
    },
    {
      prompt: 'A friend sends a short link: bit.ly/3xYz9. What\'s the safest move?',
      options: [
        { text: 'Click it, short links are always safe', correct: false, why: 'Short links hide where they really go, so scammers love them.' },
        { text: 'Ask what it is, or use a link preview to see where it really goes', correct: true, why: 'Right! Check where a short link really leads before you open it.' },
        { text: 'Forward it to everyone first', correct: false, why: 'If it\'s a scam, you just spread it to all your friends.' },
      ],
    },
    {
      prompt: 'The address bar shows a 🔒 padlock (https). What does that mean?',
      options: [
        { text: 'The website is safe and real', correct: false, why: 'Scam sites can get a padlock too. It doesn\'t prove the site is real.' },
        { text: 'The connection is encrypted, but scam sites can have it too', correct: true, why: 'Right! The padlock means nobody can snoop on the connection. You still need to check the domain.' },
        { text: 'The site is run by Google', correct: false, why: 'The padlock has nothing to do with who owns the site.' },
      ],
    },
    {
      level: 2,
      prompt: 'Which of these links is a fake that uses a look-alike letter?',
      options: [
        { text: 'www.apple.com/support', correct: false, why: 'This one is the real apple.com.' },
        { text: 'www.αpple.com/support', correct: true, why: 'Right! That first letter is a Greek alpha (α), not an "a". Look-alike letters are called homograph attacks.' },
        { text: 'support.apple.com', correct: false, why: 'support.apple.com is part of apple.com, so it\'s real.' },
      ],
    },
    {
      level: 2,
      prompt: 'You scan a QR code on a parking meter and it opens "pay-parking-city.net" asking for your card. What\'s the risk?',
      options: [
        { text: 'None, QR codes are always official', correct: false, why: 'Scammers stick fake QR stickers over real ones. A QR code is just a hidden link.' },
        { text: 'It could be a fake sticker leading to a phishing site', correct: true, why: 'Right! Check the domain after scanning, just like any other link.' },
        { text: 'QR codes can\'t lead to websites', correct: false, why: 'Most QR codes are links to websites.' },
      ],
    },
  ],
  twofa: [
    {
      prompt: 'Which kind of 2-step verification is hardest for hackers to steal?',
      options: [
        { text: 'A code sent by text message', correct: false, why: 'Text codes are better than nothing, but hackers can steal phone numbers (called SIM swapping).' },
        { text: 'An authenticator app or a security key', correct: true, why: 'Right! Codes from an app or a physical key never travel over your phone number.' },
        { text: 'A security question, like your pet\'s name', correct: false, why: 'Answers like your pet\'s name are often easy to find on social media.' },
      ],
    },
    {
      prompt: 'Your phone gets a login code you didn\'t ask for. What does that probably mean?',
      options: [
        { text: 'Someone has your password. Change it now', correct: true, why: 'Right! Someone got past your password and 2FA stopped them. Change your password right away.' },
        { text: 'It\'s a glitch, ignore it forever', correct: false, why: 'It\'s a warning sign. Someone is probably trying to get in.' },
        { text: 'Send it to whoever asks for it', correct: false, why: 'Never share login codes. That\'s exactly what the hacker needs.' },
      ],
    },
    {
      prompt: 'Why should you use a different password for every account?',
      options: [
        { text: 'If one site gets hacked, your other accounts stay safe', correct: true, why: 'Right! Hackers try leaked passwords on lots of sites. Different passwords stop that.' },
        { text: 'Websites check if you reuse them', correct: false, why: 'They can\'t see your other passwords. It\'s about leaks.' },
        { text: 'It makes logging in faster', correct: false, why: 'It\'s about safety. A password manager makes it easy to remember them all.' },
      ],
    },
    {
      level: 2,
      prompt: 'What does a password manager do?',
      options: [
        { text: 'Makes and remembers a different strong password for every account', correct: true, why: 'Right! You only remember one master password, and it handles the rest.' },
        { text: 'Shares your passwords with your friends', correct: false, why: 'It keeps them private and locked behind your master password.' },
        { text: 'Makes all your passwords the same so they\'re easy', correct: false, why: 'The opposite! It makes every password different.' },
      ],
    },
    {
      level: 2,
      prompt: 'Your phone keeps buzzing: "Approve sign-in?" You\'re not logging in. What\'s happening?',
      options: [
        { text: 'An app glitch, tap Approve to stop it', correct: false, why: 'That\'s exactly what the attacker wants. It\'s called MFA fatigue.' },
        { text: 'Someone has your password and is spamming requests. Deny and change it', correct: true, why: 'Right! 2FA is blocking them. Deny, change your password, and tell an adult or IT.' },
        { text: 'Your phone needs an update', correct: false, why: 'Login requests mean someone is trying to log in to your account.' },
      ],
    },
  ],
  update: [
    {
      prompt: 'Why do software updates protect you?',
      options: [
        { text: 'They fix security holes that hackers already know about', correct: true, why: 'Right! Once a hole is public, hackers race to use it on devices that haven\'t updated.' },
        { text: 'They only add new emojis', correct: false, why: 'Lots of updates are mostly security fixes you never see.' },
        { text: 'They don\'t, they just slow your phone down', correct: false, why: 'Skipping updates leaves known holes open for hackers.' },
      ],
    },
    {
      prompt: 'An email attachment is called "invoice.pdf.exe". What is it?',
      options: [
        { text: 'A normal PDF file', correct: false, why: 'The real file type is the LAST part: .exe, a program.' },
        { text: 'A program pretending to be a PDF. Don\'t open it!', correct: true, why: 'Right! ".exe" is a program. The ".pdf" in the middle is a disguise.' },
        { text: 'A picture', correct: false, why: 'It\'s a program (.exe) pretending to be a document.' },
      ],
    },
    {
      prompt: 'Where is the safest place to download apps?',
      options: [
        { text: 'Any website that shows up on Google', correct: false, why: 'Fake download sites often top the search results.' },
        { text: 'The official app store for your device', correct: true, why: 'Right! Official stores check apps for malware.' },
        { text: 'A file someone shared in a group chat', correct: false, why: 'You can\'t know what\'s inside a shared file.' },
      ],
    },
    {
      level: 2,
      prompt: 'A browser extension called "Free Robux Finder" asks to "Read and change all your data on all websites". What should you do?',
      options: [
        { text: 'Allow it, extensions are safe', correct: false, why: 'That permission lets it see and change everything, including your passwords.' },
        { text: 'Don\'t install it. That permission lets it spy on everything', correct: true, why: 'Right! Always check what an extension can access before you install it.' },
        { text: 'Install it, then uninstall it later', correct: false, why: 'It could steal your logins the moment you install it.' },
      ],
    },
    {
      level: 2,
      prompt: 'What is a "zero-day"?',
      options: [
        { text: 'A security hole hackers use before there\'s an update to fix it', correct: true, why: 'Right! That\'s why you install updates the moment a fix comes out.' },
        { text: 'The day you buy a new phone', correct: false, why: 'It\'s a security hole that has had zero days of fixes.' },
        { text: 'A virus that only works on Sundays', correct: false, why: 'Nope! It\'s a hole that has no fix yet.' },
      ],
    },
  ],
  verify: [
    {
      prompt: 'Which is a red flag on a new online "friend\'s" profile?',
      options: [
        { text: 'The account is a week old, has few posts and no mutual friends', correct: true, why: 'Right! Fake accounts are usually new and empty.' },
        { text: 'They like the same games as you', correct: false, why: 'That\'s normal, though catfish do pretend to like what you like.' },
        { text: 'They post memes', correct: false, why: 'Everyone posts memes. Look at how old the account is and who they know.' },
      ],
    },
    {
      prompt: 'An online friend asks you to keep your chats a secret from your parents. What does that mean?',
      options: [
        { text: 'They\'re just shy', correct: false, why: 'Asking for secrets is a big warning sign, not shyness.' },
        { text: 'It\'s a big red flag. Tell a trusted adult', correct: true, why: 'Right! Safe people don\'t ask you to hide things from your family.' },
        { text: 'It\'s normal for online friends', correct: false, why: 'It\'s not normal. It\'s a common grooming tactic.' },
      ],
    },
    {
      prompt: 'How can you check if someone\'s profile photo is stolen?',
      options: [
        { text: 'Do a reverse image search', correct: true, why: 'Right! A reverse image search shows if the photo belongs to someone else online.' },
        { text: 'Ask them if it\'s really them', correct: false, why: 'A catfish will just say yes.' },
        { text: 'You can\'t check', correct: false, why: 'You can! A reverse image search (like Google Lens) finds where else the photo appears.' },
      ],
    },
    {
      level: 2,
      prompt: 'A video shows a famous YouTuber saying "Send me $50 in crypto and I\'ll send back $500!" What is it most likely?',
      options: [
        { text: 'A real giveaway', correct: false, why: 'No real creator asks you to send money first to get more back.' },
        { text: 'A deepfake: AI-made video of someone saying things they never said', correct: true, why: 'Right! AI can fake faces and voices. "Send money to get more back" is always a scam.' },
        { text: 'A glitch', correct: false, why: 'It\'s on purpose. Deepfakes are made to look real.' },
      ],
    },
    {
      level: 2,
      prompt: 'An online friend sends you gifts, says you\'re "mature for your age", and asks you to keep it secret. What is this?',
      options: [
        { text: 'A really nice friend', correct: false, why: 'Gifts, flattery and secrecy together are warning signs, not friendship.' },
        { text: 'Grooming: building trust to take advantage of you. Tell a trusted adult', correct: true, why: 'Right! You did nothing wrong, and a trusted adult can help.' },
        { text: 'Normal online behavior', correct: false, why: 'Safe people don\'t ask kids to keep secrets from their family.' },
      ],
    },
  ],
};

// ---------- Ransomware boss questions ----------
// The boss encrypts your towers. Answer one of these to restore a tower from backup.
const BOSS_QUESTIONS = [
  {
    prompt: 'Ransomware locked your files and wants $500 in Bitcoin. What should you do?',
    options: [
      { text: 'Pay right away to get the files back', correct: false, why: 'Paying funds criminals, and many people who pay never get their files back.' },
      { text: 'Don\'t pay. Tell an adult or IT, and restore from a backup', correct: true, why: 'Right! Backups mean you don\'t need the hacker at all.' },
      { text: 'Email the hacker and ask nicely', correct: false, why: 'Contacting them doesn\'t help, and it shows them you\'re a target.' },
    ],
  },
  {
    prompt: 'What\'s the best protection against losing your files to ransomware?',
    options: [
      { text: 'Regular backups kept somewhere else, like the cloud or an external drive', correct: true, why: 'Right! If your files are locked, you just restore your copy.' },
      { text: 'Keeping everything on your desktop', correct: false, why: 'Ransomware would lock that too. You need a separate copy.' },
      { text: 'A cool wallpaper', correct: false, why: 'Nice try! Backups are what save you.' },
    ],
  },
  {
    prompt: 'How does ransomware usually get onto a computer?',
    options: [
      { text: 'Email attachments, fake downloads and out-of-date software', correct: true, why: 'Right! That\'s why you don\'t open surprise attachments and you keep things updated.' },
      { text: 'Charging your phone too long', correct: false, why: 'Charging can\'t give you ransomware. Dodgy files and links can.' },
      { text: 'Watching videos on YouTube', correct: false, why: 'Normal streaming is fine. Watch out for downloads and attachments.' },
    ],
  },
  {
    prompt: 'The ransomware note says "Pay and we PROMISE to unlock your files." Can you trust it?',
    options: [
      { text: 'Yes, they promised', correct: false, why: 'Criminals don\'t keep promises. Lots of people pay and get nothing.' },
      { text: 'No. Many people who pay never get their files back', correct: true, why: 'Right! That\'s why backups matter so much.' },
    ],
  },
  {
    prompt: 'Your school laptop shows a ransomware message. What\'s the FIRST thing to do?',
    options: [
      { text: 'Tell a teacher or the school IT team right away', correct: true, why: 'Right! Telling IT fast stops it from spreading to other computers.' },
      { text: 'Hide it and hope it goes away', correct: false, why: 'It won\'t go away, and it might spread. Tell someone right away.' },
      { text: 'Try to pay with your own money', correct: false, why: 'Never pay. Get help from an adult or IT.' },
    ],
  },
  {
    prompt: 'Why does updating your computer help stop ransomware?',
    options: [
      { text: 'Updates patch the holes ransomware uses to sneak in', correct: true, why: 'Right! Lots of big ransomware attacks hit computers that skipped updates.' },
      { text: 'Updates delete every virus forever', correct: false, why: 'Updates close holes. They don\'t remove everything, so backups still matter.' },
      { text: 'They don\'t help', correct: false, why: 'They help a lot. Many attacks use holes that were already fixed by an update.' },
    ],
  },
  // Harder questions for later bosses. (Questions without a level count as level 1.)
  {
    level: 2,
    prompt: 'What is the "3-2-1" backup rule?',
    options: [
      { text: '3 copies of your files, on 2 kinds of storage, with 1 kept somewhere else', correct: true, why: 'Right! If ransomware locks one copy, you still have others safe.' },
      { text: 'Back up 3 times a day for 2 years', correct: false, why: 'It\'s about how many copies and where they\'re kept.' },
      { text: 'Count down from 3 before opening attachments', correct: false, why: 'Nice idea, but it\'s about backups: 3 copies, 2 kinds of storage, 1 somewhere else.' },
    ],
  },
  {
    level: 2,
    prompt: 'Your backup drive is plugged into your computer all the time. Why is that risky with ransomware?',
    options: [
      { text: 'Ransomware can lock the backup drive too', correct: true, why: 'Right! Unplug backup drives when you\'re done, or use cloud backups with version history.' },
      { text: 'It makes the computer slow', correct: false, why: 'The real risk is ransomware locking the backup too.' },
      { text: 'It isn\'t risky at all', correct: false, why: 'Anything connected can get locked. Keep one backup unplugged.' },
    ],
  },
  {
    level: 2,
    prompt: 'Ransomware hit a hospital and shut down its computers. Why do attackers target places like hospitals and schools?',
    options: [
      { text: 'They can\'t afford downtime, so attackers hope they\'ll pay fast', correct: true, why: 'Right! That\'s why backups and updates matter so much for them, and for you.' },
      { text: 'Hospitals have the best video games', correct: false, why: 'Attackers go after places that need their computers working right away.' },
      { text: 'It\'s random and has no reason', correct: false, why: 'They pick targets that are likely to pay quickly.' },
    ],
  },
  {
    level: 2,
    prompt: 'Which is the BEST way to keep schoolwork safe from ransomware?',
    options: [
      { text: 'Save it in a cloud drive that keeps old versions', correct: true, why: 'Right! Version history lets you roll back to a copy from before the attack.' },
      { text: 'Keep it only on a USB stick in your laptop', correct: false, why: 'One copy, plugged in, can be locked along with everything else.' },
      { text: 'Email it to a stranger for safekeeping', correct: false, why: 'Never send your files to strangers.' },
    ],
  },
];

// ---------- Tower unlock challenges ----------
// Each tower is locked until you prove you know the safety habit it stands for.
// Every tower has several challenges, and one is picked at random each time.
const CHALLENGES = {
  linkcheck: [
    {
      title: 'Spot the Real Link',
      prompt: 'You want to log in to Roblox. Which link really goes to Roblox?',
      options: [
        { text: 'roblox.com.free-robux.net/login', correct: false, why: 'The real domain is free-robux.net. "roblox.com" at the start is a disguise.' },
        { text: 'rob1ox.com/login', correct: false, why: 'Look closely: that\'s a number 1, not an L.' },
        { text: 'www.roblox.com/login', correct: true, why: 'Correct! The domain right before the first single slash is roblox.com.' },
      ],
      tip: 'Tip: the real website name is the part right before the first single "/". Read it carefully, letter by letter.',
    },
    {
      title: 'Before You Click',
      prompt: 'A text says your package is delayed and links to "fedex-delivery-help.com". What\'s the safest move?',
      options: [
        { text: 'Tap the link, it says FedEx', correct: false, why: 'Anyone can put "fedex" in a made-up domain. The real one is fedex.com.' },
        { text: 'Go to fedex.com yourself, or check the shopping app you ordered from', correct: true, why: 'Correct! Going to the site yourself means a fake link can\'t trick you.' },
        { text: 'Reply STOP to the text', correct: false, why: 'Replying tells scammers your number is real, so you get more scam texts.' },
      ],
      tip: 'Tip: when a message has a link, go to the website yourself instead of tapping it.',
    },
    {
      title: 'Which One Is Google?',
      prompt: 'Which of these is really Google\'s login page?',
      options: [
        { text: 'accounts.google.com/signin', correct: true, why: 'Correct! accounts.google.com is part of google.com.' },
        { text: 'google.com-signin.help/login', correct: false, why: 'The domain is com-signin.help. The "google.com" part is a trick.' },
        { text: 'goog1e-accounts.com/signin', correct: false, why: 'That\'s a number 1 instead of an L, on a totally different domain.' },
      ],
      tip: 'Tip: read the domain from right to left, starting at the first single "/".',
    },
    {
      title: 'Hover Check',
      prompt: 'An email button says "Log in to Steam". When you hover over it, the bottom of the screen shows "steamcommunlty.ru/login". What is it?',
      options: [
        { text: 'Safe, the button says Steam', correct: false, why: 'Button text can say anything. What matters is where the link really goes.' },
        { text: 'A phishing link: "communlty" with an L, on a .ru site', correct: true, why: 'Correct! Hovering showed the real address, and it\'s a fake.' },
        { text: 'A Steam server in another country', correct: false, why: 'Steam\'s real site is steamcommunity.com. This one swaps a letter.' },
      ],
      tip: 'Tip: on a computer, hover over a link to see where it really goes before you click.',
    },
  ],
  twofa: [
    {
      title: 'Build a Strong Password',
      password: true,
      prompt: 'Make a password strong enough to stop a Password Cracker, then turn on 2-step verification. Pick something you can REMEMBER: you\'ll be asked to log in with it later! (Practice only, never type a password you really use!)',
      tip: 'Tip: string 3 or 4 random words together, like Purple-Taco-Rocket-42. Long is strong, and it\'s easy to remember.',
    },
  ],
  update: [
    {
      title: 'Safe Updates',
      prompt: 'A website pop-up says: "Your phone is out of date! Download UpdateNow.apk to stay safe." What should you do?',
      options: [
        { text: 'Download it, updates are important', correct: false, why: 'Updates are important, but real ones never come from website pop-ups. This is malware.' },
        { text: 'Close it, then check for updates in your phone\'s Settings', correct: true, why: 'Correct! Real updates come from Settings or the official app store.' },
        { text: 'Never update anything, it\'s too risky', correct: false, why: 'Skipping updates leaves security holes open. Hackers love out-of-date devices.' },
      ],
      tip: 'Tip: turn on automatic updates so your phone and apps stay protected.',
    },
    {
      title: 'Free Game?',
      prompt: 'A website offers "Minecraft FULL VERSION free download (cracked)". What\'s the risk?',
      options: [
        { text: 'No risk, it\'s just a game', correct: false, why: 'Cracked games are one of the most common ways malware spreads.' },
        { text: 'It could hide malware that steals your accounts', correct: true, why: 'Correct! "Free" versions of paid games often come with hidden malware.' },
        { text: 'It might be a slightly older version', correct: false, why: 'The real danger is malware hidden inside, not the version number.' },
      ],
      tip: 'Tip: only download games and apps from official stores and websites.',
    },
    {
      title: 'Update Later?',
      prompt: 'Your laptop says "Security update ready. Restart now or tonight?" You\'re in the middle of homework. What\'s smart?',
      options: [
        { text: 'Pick "tonight" so it installs soon', correct: true, why: 'Correct! Security updates should go in soon, and scheduling it is fine.' },
        { text: 'Turn off updates forever so it stops asking', correct: false, why: 'That leaves your laptop open to attacks that updates already fixed.' },
        { text: 'Ignore it for a few months', correct: false, why: 'Hackers target holes right after updates come out. Install them soon.' },
      ],
      tip: 'Tip: real updates come from your device\'s own settings. Schedule them, don\'t skip them.',
    },
    {
      title: 'Suspicious Attachment',
      prompt: 'An email from someone you don\'t know has an attachment called "homework_answers.zip". What do you do?',
      options: [
        { text: 'Open it, free answers!', correct: false, why: 'Surprise attachments, especially .zip files, are a top way malware gets in.' },
        { text: 'Delete it without opening', correct: true, why: 'Correct! Don\'t open attachments you weren\'t expecting, especially from strangers.' },
        { text: 'Forward it to friends first', correct: false, why: 'If it\'s malware, you\'d spread it to your friends.' },
      ],
      tip: 'Tip: if you weren\'t expecting a file, don\'t open it.',
    },
  ],
  verify: [
    {
      title: 'Who Are You Really?',
      prompt: 'A new account messages you: "hey I go to your school! add me?" You don\'t recognize them. What\'s the best move?',
      options: [
        { text: 'Add them, they know your school', correct: false, why: 'Your school is easy to find from posts or your bio. It doesn\'t prove who they are.' },
        { text: 'Check for red flags (new account, no mutual friends) and ask friends in person if they know them', correct: true, why: 'Correct! Check the profile and confirm in real life before trusting someone.' },
        { text: 'Send them your Snapchat so they can prove it', correct: false, why: 'That gives a stranger more ways to contact you. Verify first, share later (or never).' },
      ],
      tip: 'Tip: if you can\'t confirm who someone is in real life, don\'t share personal info with them.',
    },
    {
      title: 'Hacked Friend?',
      prompt: 'Your friend\'s account messages you: "I\'m stuck, can you send me $20 on Cash App? I\'ll pay you back tomorrow". It doesn\'t sound like them. What do you do?',
      options: [
        { text: 'Send it, they\'re your friend', correct: false, why: 'Friends\' accounts get hacked all the time, and scammers use them to ask for money.' },
        { text: 'Call or text your friend another way to check', correct: true, why: 'Correct! Checking another way shows if it\'s really them.' },
        { text: 'Ask them a question only they would know, in the same chat', correct: false, why: 'Hackers can read old messages to find answers. Check outside the hacked chat.' },
      ],
      tip: 'Tip: if a message from a friend feels off, check with them another way.',
    },
    {
      title: 'Video Call Excuses',
      prompt: 'An online friend you\'ve chatted with for weeks always has an excuse not to video call ("camera broken", "bad wifi"). What does that suggest?',
      options: [
        { text: 'They\'re just camera shy', correct: false, why: 'It could be shyness, but always avoiding video is a classic catfish sign.' },
        { text: 'They might not be who they say they are', correct: true, why: 'Correct! Catfish avoid video calls because their face doesn\'t match their photos.' },
        { text: 'Their camera really is broken for weeks', correct: false, why: 'Maybe, but keep your guard up and don\'t share personal info.' },
      ],
      tip: 'Tip: never meet up with an online-only friend without a trusted adult.',
    },
    {
      title: 'Profile Detective',
      prompt: 'Which profile is MOST likely to be fake?',
      options: [
        { text: 'Made last week, 3 posts, perfect model photos, follows 2,000 people', correct: true, why: 'Correct! New, empty, too-perfect, and following tons of people are all fake-account signs.' },
        { text: 'Made 4 years ago, lots of posts with friends you know', correct: false, why: 'A long history with mutual friends is a good sign it\'s real.' },
        { text: 'Your cousin\'s account that you follow in real life', correct: false, why: 'You know them in real life, so it\'s very likely real.' },
      ],
      tip: 'Tip: check how old an account is and whether you have real mutual friends.',
    },
  ],
};

// ---------- Skip-ahead quiz extras ----------
// The level-skip quiz mixes in these question types too.

// True or false
const TRUE_FALSE = [
  { level: 1, text: 'It\'s OK to share your password with your best friend.', answer: false, why: 'Passwords are only for you. Friendships change, and friends\' accounts get hacked.' },
  { level: 1, text: 'A website with a padlock 🔒 can still be a scam.', answer: true, why: 'The padlock only means the connection is encrypted. Scam sites can have one too.' },
  { level: 1, text: 'Software updates often fix security holes.', answer: true, why: 'Many updates patch holes hackers already know about.' },
  { level: 1, text: 'If a message says "act now", you should hurry.', answer: false, why: 'Rushing you is a classic red flag. Slow down and check.' },
  { level: 1, text: 'You should tell a trusted adult if someone online makes you uncomfortable.', answer: true, why: 'Always. You won\'t get in trouble for asking for help.' },
  { level: 2, text: 'Using the same password everywhere is fine if it\'s really strong.', answer: false, why: 'If one site leaks it, hackers try it everywhere else. Use a different one for each account.' },
  { level: 2, text: 'A login code you didn\'t ask for means someone might have your password.', answer: true, why: 'Change your password right away. 2FA just saved you!' },
  { level: 2, text: 'Real companies sometimes ask for your password over email.', answer: false, why: 'No real company will ever ask for your password.' },
  { level: 2, text: 'Gift cards are a common way scammers ask to be paid.', answer: true, why: 'Gift card codes work like cash and can\'t be traced or refunded.' },
  { level: 2, text: 'A file called "photo.jpg.exe" is a picture.', answer: false, why: 'The real file type is the last part, .exe, which is a program.' },
  { level: 3, text: 'Scammers can copy someone\'s voice using AI.', answer: true, why: 'A few seconds of audio from a video can be enough. Verify with a call to their real number.' },
  { level: 3, text: 'Text-message codes are the safest kind of 2-step verification.', answer: false, why: 'Authenticator apps and security keys are safer, because phone numbers can be stolen.' },
  { level: 3, text: 'Paying a ransomware attacker guarantees you get your files back.', answer: false, why: 'Many people who pay get nothing. Backups are the real protection.' },
  { level: 3, text: '"rnicrosoft.com" is Microsoft\'s real website.', answer: false, why: '"rn" next to each other looks like "m". It\'s a fake.' },
  { level: 3, text: 'You should approve a login request on your phone even if you aren\'t logging in.', answer: false, why: 'Never! That lets an attacker in. Deny it and change your password.' },
];

// Tap the REAL link out of four
const LINK_SETS = [
  { level: 1, real: 'www.youtube.com/watch', fakes: ['youtube.com.video-free.net/watch', 'y0utube.com/watch', 'youtube-login.help/watch'] },
  { level: 1, real: 'www.minecraft.net/download', fakes: ['minecraft-free-download.com', 'minecraft.net.mods-hub.ru/download', 'mlnecraft.net/download'] },
  { level: 2, real: 'www.amazon.com/orders', fakes: ['amazon.com.order-help.co/orders', 'arnazon.com/orders', 'amazon-refunds.net/orders'] },
  { level: 2, real: 'discord.com/login', fakes: ['discord-nitro.gift/login', 'dlscord.com/login', 'discord.com.verify-account.io/login'] },
  { level: 2, real: 'www.instagram.com/accounts/login', fakes: ['instagram-verify.com/login', 'instagram.com.badge-support.net', 'lnstagram.com/accounts/login'] },
  { level: 3, real: 'appleid.apple.com/sign-in', fakes: ['appleid.apple.com.secure-id.help/sign-in', 'apple.id-verify.com/sign-in', 'appIeid.apple.com/sign-in'] },
  { level: 3, real: 'login.microsoftonline.com', fakes: ['login.microsoftonline.com.office-auth.net', 'login-microsoftonline.com', 'login.rnicrosoftonline.com'] },
  { level: 3, real: 'www.paypal.com/signin', fakes: ['www.paypal.com.signin-secure.info', 'paypa1.com/signin', 'paypal-resolution-center.com/signin'] },
];

// Repair a safety rule from scrambled code blocks
const SENTENCES = [
  { level: 1, words: ['Never', 'share', 'your', 'password'], extra: ['always', 'post'] },
  { level: 1, words: ['Think', 'before', 'you', 'click'], extra: ['never', 'download'] },
  { level: 1, words: ['Tell', 'a', 'trusted', 'adult'], extra: ['stranger', 'nobody'] },
  { level: 2, words: ['Turn', 'on', 'two-step', 'verification'], extra: ['off', 'skip'] },
  { level: 2, words: ['Keep', 'your', 'apps', 'updated'], extra: ['ignore', 'delete'] },
  { level: 2, words: ['Use', 'a', 'different', 'password', 'everywhere'], extra: ['same', 'short'] },
  { level: 3, words: ['Back', 'up', 'your', 'files', 'often'], extra: ['never', 'pay'] },
  { level: 3, words: ['Verify', 'before', 'you', 'trust', 'anyone'], extra: ['after', 'everyone'] },
];
