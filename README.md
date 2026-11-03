# Defenders of the Data

*Hackers are coming for your data. Build your defenses. Learn to stay safe online.*

### ▶ [Play it now in your browser](https://defenders-of-the-data.netlify.app)

No download or account needed. Works on computers, tablets and phones.

Defenders of the Data is a set of three browser games that teach teens how to protect themselves online. Made for the **Girls Who Code HHS Hackathon 2026** (theme: **Discover**: digital safety).

## Why it matters

Scammers target teens where they spend their time: DMs, games, social media and email. In 2024, people reported losing **$12.5 billion** to fraud to the U.S. FTC ([source](https://www.ftc.gov/news-events/news/press-releases/2025/03/new-ftc-data-show-big-jump-reported-losses-fraud-125-billion-2024)), and **phishing** was the most reported cybercrime to the FBI ([source](https://www.ic3.gov/AnnualReport/Reports/2024_IC3Report.pdf)). Most of it can be stopped with a few simple habits, like **2-step verification**, which blocks most automated attacks on your accounts ([source](https://security.googleblog.com/2019/05/new-research-how-effective-is-basic.html)).

**In this game, every tower, defender and guardian is a real safety habit.** You win by choosing the right habit for the right threat, the same choice you make when a sketchy link shows up in your DMs.

## The three games

| Game | How you play | What you learn |
|---|---|---|
| 🏰 **Tower Defense** | Build towers to stop threats marching toward your Data Core. 100 levels with a boss every 10, or Endless mode. | Matching defenses to threats: link checking stops phishing, 2FA stops password crackers, updates stop malware, verifying stops catfish. |
| 🖱️ **Data Clicker** | Click the shield to earn bytes, hire defenders, and decide whether pop-up messages are **real or a scam**. | Spotting scams in realistic messages, and why habits like backups and updates keep protecting you. |
| ⚔️ **Adventure** | Explore "the internet", battle threats hiding in spam grass, quarantine them into your Threat Index, and beat hacker trainers. | 60 threats to learn about, from smishers to deepfakes, each with a real tip for spotting and stopping it. |

Every unlock, upgrade and boss is won by **answering a safety question**, so learning is how you get stronger, not a quiz you have to sit through. Questions get harder as you go.

## Learning that sticks

- **Real-life situations:** realistic DMs, texts, emails and links to judge, not just definitions.
- **Explanations every time:** right or wrong, you see *why*, so a mistake turns into a lesson.
- **Spaced review:** a Study deck of 37 flashcards, a list of what you missed, and badges.
- **Level briefings and 20 skill lessons** in Levels mode, each with a quick skill check.
- **Remember-your-password check:** the practice password you make for the 2FA tower comes back later with a 2-step code.
- **🎯 Real-Life Missions:** on the Why It Matters screen, players check off real actions (turn on 2FA, update your phone, set an account to private, teach a friend) for stars. The game rewards doing it for real.
- **Where to get help:** tell a trusted adult, and report scams at [ReportFraud.ftc.gov](https://reportfraud.ftc.gov).

## Beginner-friendly and accessible

- **How to Play videos:** instead of a wall of text, each game shows a short video of the real game playing itself, with a moving cursor, an on-screen keyboard and mouse that light up, narration and captions. Skip any time.
- **♿ Accessibility settings** (title screen):
  - **Extra time:** every countdown lasts twice as long.
  - **Bigger text:** everything is larger and easier to read.
  - **Calm mode:** turns off flashing, shaking and bouncing. The game also follows your computer's "reduce motion" setting.
- **Keyboard and mouse:** everything works with Tab, Enter and Esc, with visible focus outlines. Adventure has re-mappable keys.
- **Screen reader labels** on buttons and live regions for captions and results.
- **Works on phones, tablets and computers.**
- **Private by design:** no accounts, no email, no data collected. Progress is saved only in your browser, and you pick a nickname, never your real name. A **💾 Save Code** moves your progress to another computer.

## Rewards that keep you playing

Earn ★ stars in all three games and spend them in the **Coder Locker** on 107 cosmetics for your coder: outfits (the legendary Hacker hoodie is the rarest), hair, glasses, laptops, backgrounds and sidekicks, plus a limited-time Halloween shop.

**🏆 Certified Data Defender:** master all three games (clear all 100 Tower Defense levels, earn 500K bytes in Data Clicker, and quarantine all 60 threats and unlock all 4 guardians in Adventure) to earn a printable certificate with your name and coder on it. A tracker on the title screen shows how close you are.

## How it's built

Plain **HTML, CSS and JavaScript**, with no game engine, no frameworks and no build step (about 9,600 lines of JavaScript).

- **Canvas rendering** for the Tower Defense board and the Adventure world. Adventure areas are generated from fixed seeds, so they come out the same every time.
- **Coders drawn in code:** every avatar is an SVG built from your choices, with shading computed from your skin and hair colors. A full-body version stands in the Locker.
- **Self-playing demos:** the How to Play videos run the *real game* in a hidden frame and drive it with simulated mouse and keyboard events. They read the game's own state to answer correctly, so they never go out of date.
- **Narration:** recorded voice clips, falling back to the Web Speech API.
- **Save codes:** all saves are compressed with the browser's `CompressionStream` and turned into one copyable code.
- **Shared systems** across the three games: stars, coder, sound, accessibility settings and the "you've been hacked!" event.

### Project layout

```
index.html            Title screen, Coder Locker, Why It Matters, Save Code, Accessibility
tower-defense.html    Tower Defense      (js/td.js, levels.js, boss.js, dm.js, ...)
clicker.html          Data Clicker       (js/clicker.js)
adventure.html        Adventure          (js/adventure.js, adventure-data.js)
js/content.js         The learning content: quiz, flashcards, DMs, skills, boss questions
js/avatar.js          Your coder: cosmetics, drawing, stars
js/demo.js            How to Play videos
js/access.js          Accessibility settings
css/                  Styles (style.css is shared)
```

## Play it

No install needed. Download the project and open `index.html` in a browser, or serve the folder:

```
npx serve .
```

Then open the address it prints.

**Tower Defense keys:** 1-4 towers, S sell, Space start wave, B blast, L study, V level map, P pause, F speed, M mute.
**Adventure keys:** WASD or arrows to walk, Shift to sprint, Space to talk, I for the Threat Index (change them in Settings).
