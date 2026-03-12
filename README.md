# 🌸 Kawaii Seek & Find

> A Toca Boca × Kawaii style hidden-object browser game with 50 levels, Solana wallet login, Supabase progression, and PWA support.

## ✨ Features

- 🎮 **50 levels** across 10 Kawaii themes (Candy Town, Bubble Beach, Cloud Kingdom, Mushroom Forest, Kawaii Kitchen, Space Playground, Rainbow Market, Sleepy Library, Dino Island, Neon Arcade)
- 🔍 **5–10 hidden objects per level**, cleverly hidden with Toca Boca charm
- 📈 **Difficulty progression** — Easy → Medium → Hard → Expert
- 🔎 **Zoom & pan** — pinch zoom on mobile, scroll zoom on desktop
- 💡 **Hint system** — one hint per 60 seconds
- ⭐ **3-star rating** per level based on time and accuracy
- 🏆 **Leaderboard** via Supabase
- 🎯 **Achievements** (Sharp Eyes, Speed Hunter, Explorer, etc.)
- ⚡ **Daily challenges** — new level every day
- 🔗 **Solana/Phantom wallet login** as player account
- 📱 **PWA** — install on mobile home screen, offline support
- 🚀 **Vercel deployment** ready

---

## 🚀 Quick Start

```bash
git clone <your-repo>
cd kawaii-seekfind
npm install

# Set up environment
cp .env.example .env
# Edit .env with your Supabase credentials

npm run dev
```

---

## ⚙️ Setup Guide

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the SQL from the bottom of `src/supabase/SupabaseClient.ts`
3. Copy your project URL and anon key to `.env`:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 2. Phantom Wallet

No setup needed — the game detects Phantom automatically.  
Players without Phantom can still play, just without saving progress.

### 3. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY
```

---

## 📁 Project Structure

```
src/
├── main.ts                    Entry point
├── game/
│   ├── KawaiiGame.ts         Phaser game config
│   ├── ScoreManager.ts       Scoring + star calculation
│   ├── HintSystem.ts         Hint reveal logic
│   ├── CameraController.ts   Zoom/pan bounds
│   ├── ObjectSpawner.ts      Renders + detects hidden objects
│   └── scenes/
│       ├── BootScene.ts      Asset loading + map generation
│       ├── MenuScene.ts      Main menu
│       ├── LevelSelectScene.ts  50-level grid
│       ├── GameScene.ts      Core gameplay
│       └── ResultScene.ts    Stars + score screen
├── levels/
│   └── LevelData.ts          All 50 level definitions
├── ui/
│   └── UIManager.ts          Leaderboard, achievement toasts
├── wallet/
│   └── WalletManager.ts      Phantom wallet integration
└── supabase/
    └── SupabaseClient.ts     DB queries
```

---

## 🎨 Adding Custom Maps

Replace the SVG generators in `BootScene.ts` with real image assets:

1. Add large PNG/JPG maps (2400×1600 min) to `public/maps/`
2. Load them in `BootScene.preload()`:
   ```ts
   this.load.image('map_candy_town', '/maps/candy_town.png')
   ```
3. The object coordinates in `LevelData.ts` use **percentages** (0–100) of map dimensions, so they'll scale automatically.

---

## 🎮 Game Controls

| Action | Mobile | Desktop |
|--------|--------|---------|
| Pan | Drag | Drag / Click-drag |
| Zoom In | Pinch out | Scroll up |
| Zoom Out | Pinch in | Scroll down |
| Tap object | Tap | Click |
| Hint | 💡 button | 💡 button |

---

## 📊 Scoring

- **Base score:** 100 pts per object found
- **Time bonus:** Up to 100 extra pts (scales from level's time target)
- **Rare item bonus:** +150 pts
- **Stars:** Based on score ratio + time under par

---

## 🏆 Achievements

| Achievement | Requirement |
|-------------|-------------|
| 🌸 First Steps | Find first object |
| 👁️ Sharp Eyes | Find 50 objects total |
| ⚡ Speed Hunter | Finish level under 30s |
| 🗺️ Explorer | Reach level 20 |
| ⭐ Star Collector | Earn 30 stars |
| 💎 Perfectionist | Get 3 stars on any level |
| 📅 Daily Habit | 7-day streak |
| 🎯 Halfway There | Complete level 25 |
| 🏆 Kawaii Master | Complete all 50 levels |

---

Made with 💖 — inspired by Hidden Folks and Where's Wally, with a Toca Boca × Kawaii twist!
