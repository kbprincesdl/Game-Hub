# ⚡ Game Hub: 60-Second Reaction Blitz

An intense, fast-paced 60-second reflex challenge and arcade game built with **React**, **TypeScript**, **Tailwind CSS**, and **Express**. Test your hand-eye coordination, build high-combo streaks, unlock powerups, and challenge your friends in real-time multiplayer room scoreboards!

---

## 🎮 Features & Gameplay

### 1. Fast-Paced 60-Second Arena
- **Time Attack**: Race against the clock with an active 60-second countdown ring and audio alerts during the final 10 seconds.
- **Dynamic Energy Nodes**:
  - ⚡ **Standard Targets** (+100 pts): Rapidly clicking nodes build your streak multiplier.
  - 👑 **Golden Targets** (+250 pts): High-value bonus targets that award massive points.
  - ⏰ **Time Boosters** (+3s bonus): Extend your clock to push your score even higher.
  - 🚀 **Multiplier Surge** (2x Boost for 8s): Doubles all incoming point gains.
  - 💣 **Hazard Bombs** (-150 pts): Traps that break your combo streak and trigger screen shake effects.

### 2. Streak & Multiplier Mechanics
- Earn consecutive hits to increase your combo level (e.g. 5x, 10x, 20x).
- Higher combos unlock cascading score multipliers for maximum point efficiency.
- Interactive particle explosion physics and floating score popups on every hit.

### 3. Real-Time Multiplayer Room Leaderboards
- **Instant Room Matches**: Generate shareable room codes (e.g. `BLITZ-789`) with direct URL join links.
- **Head-to-Head Rival Mode**: When two players play in a room, the scoreboard renders a dedicated 2-Player Head-to-Head banner tracking the points gap and current leader.
- **Unique Player Deduplication**: Each competitor is displayed once with their personal best score, accuracy, streak, and match count.
- **Cross-Device & Cross-Tab Sync**: Powered by a central server endpoint and `BroadcastChannel` with live opponent toast alerts (`🎉 [Player] scored X,XXX pts!`).
- **CSV Data Export**: Download room or global score sheets for offline tracking.

### 4. Difficulty Modes
| Mode | Target Speed | Spawn Rate | Score Multiplier | Hazards / Traps |
| :--- | :--- | :--- | :--- | :--- |
| **Casual** | Relaxed | 1200ms | 1.0x Multiplier | None |
| **Focused** | Moderate | 900ms | 1.5x Multiplier | None |
| **Turbo Reflex** | Fast | 700ms | 2.0x Multiplier | Hazard Bombs + Moving Nodes |
| **Cyber Overdrive** | Extreme | 500ms | 3.0x Multiplier | Teleporting Powerups + Traps |

### 5. Procedural Web Audio Synthesizer
- Built with the native HTML5 **Web Audio API** (no external audio files required).
- Custom tone frequencies for hits, combos, golden bonuses, time extensions, bomb explosions, countdown beeps, and game-over fanfares.
- Global one-click sound mute toggle.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React Icons
- **Animations**: `motion/react` (Framer Motion)
- **Backend & API**: Express.js server providing REST API endpoints (`/api/scores`, `/api/scores/reset`, `/api/health`)
- **Audio Engine**: Web Audio API AudioContext Synthesizer
- **Tooling & Build**: Vite, `tsx`, `esbuild`

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### 3. Production Build & Start
```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
├── server.ts                    # Express server with live scores API & Vite middleware
├── src/
│   ├── components/
│   │   ├── CountdownIndicator.tsx # 60s ring timer, multiplier bar & quick replay
│   │   ├── GameBoard.tsx         # Interactive playfield with particle animations
│   │   ├── GameHubStats.tsx      # Player profile & lifetime statistics
│   │   ├── GameOverModal.tsx     # Final summary, accuracy breakdown & rank display
│   │   ├── LeaderboardModal.tsx  # Live scoreboard with Room vs Global filters
│   │   ├── NameInputScreen.tsx   # Player avatar selection & difficulty presets
│   │   ├── Navbar.tsx            # Header HUD with room codes, mute & stats
│   │   ├── RoomModal.tsx         # Shareable URL room join & invite modal
│   │   └── TutorialModal.tsx     # How-to-play guide & rules
│   ├── utils/
│   │   ├── sound.ts              # Web Audio API sound synthesizer engine
│   │   └── storage.ts            # Persistence, room broadcaster & score helpers
│   ├── types.ts                  # TypeScript types & game interfaces
│   ├── App.tsx                   # Main game state manager and loop
│   └── main.tsx                  # React DOM entry point
└── metadata.json                 # Application metadata
```

---

## 📄 License
MIT License
