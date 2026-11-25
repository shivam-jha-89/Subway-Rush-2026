# Subway Surfers — 3D Endless Runner

A browser-based 3D endless runner game inspired by Subway Surfers, built with **React** and **Three.js**. No game engine, no asset files — everything is procedurally generated with code.

---

## 🚀 Live Demo

**[https://subway-surfers-flame-alpha.vercel.app/](https://subway-surfers-flame-alpha.vercel.app/)**

## 📁 GitHub Repository

**[https://github.com/NikhilMamilla/Subway-Surfers](https://github.com/NikhilMamilla/Subway-Surfers)**

---

## 📸 Screenshots

![Gameplay](./public/Screenshots/1.png)

![Game Over](./public/Screenshots/2.png)

---

## Features

- **3 lanes** — switch left, right, or stay centre
- **Jump** — clear barriers and obstacles
- **Slide** — duck under high obstacles
- **Oncoming trains** — dodge trains rushing toward you
- **Progressive difficulty** — game speed increases over distance
- **Coin collection** — coins placed on ground, over barriers, and on train roofs
- **Pattern-based spawning** — fair obstacle patterns, always survivable
- **Procedural city environment** — buildings, street lamps, neon billboards, scrolling scenery
- **Realistic metro train** — deep purple/indigo body, large yellow windows, bullet nose cab
- **Police barrier** — red/white striped panel with traffic cones and caution tape
- **Score counter** — live distance score with animated game over screen
- **FPS monitor** — real-time performance indicator (green = smooth, yellow = moderate, red = low)
- **Countdown start** — 3-2-1 countdown before each run
- **Touch controls** — swipe gestures for mobile play
- **Zero external assets** — all geometry built with Three.js `BoxGeometry`, `CylinderGeometry`, and custom `BufferGeometry`

---

## Controls

| Action | Keyboard | Mobile |
|--------|----------|--------|
| Switch lane left | `←` or `A` | Swipe left |
| Switch lane right | `→` or `D` | Swipe right |
| Jump | `↑` or `W` or `Space` | Swipe up |
| Slide | `↓` or `S` | Swipe down |
| Restart (game over) | `Enter` / `R` / `Space` | Tap |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 19 |
| 3D Rendering | Three.js 0.181 |
| React + Three.js bridge | React Three Fiber 9 |
| Build tool | Vite 7 |
| Language | JavaScript (ESM) |

No TypeScript, no Redux, no game engine. Physics, collision, and spawning are all custom-built plain JavaScript.

---

## Project Structure

```
src/
├── App.jsx                    # Root — screen state, game lifecycle
├── game/
│   ├── constants.js           # All tunable game values
│   ├── state.js               # Initial game state factory
│   ├── materials.js           # Shared Three.js materials
│   └── systems/
│       ├── physics.js         # Jump, slide, coyote time, jump buffer
│       ├── collision.js       # Train, barrier, and coin collision
│       └── spawning.js        # Pattern-based obstacle & coin spawning
├── hooks/
│   └── useControls.js         # Keyboard + touch input
└── components/
    ├── three/
    │   ├── GameScene.jsx      # Main game loop (single useFrame)
    │   ├── Player.jsx         # Animated character
    │   ├── Train.jsx          # Metro train with bullet nose
    │   ├── Barrier.jsx        # Police barrier with cones
    │   ├── Coin.jsx           # Gold coin with star
    │   ├── TrainTracks.jsx    # Ground, rails, ties
    │   └── ScrollingWalls.jsx # City buildings + sky
    └── ui/
        ├── ScoreOverlay.jsx   # HUD, game over screen, FPS counter
        ├── LoaderScreen.jsx   # Loading screen
        └── NearMissFlash.jsx  # Near-miss visual feedback
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install & run locally

```bash
git clone https://github.com/NikhilMamilla/Subway-Surfers.git
cd Subway-Surfers
npm install
npm run dev
```

Open `http://localhost:5173`

### Build for production

```bash
npm run build
```

Output goes to `dist/`. Deploy that folder.

---

## Performance

Optimized for smooth playback on mid-range laptops:

- **Single `useFrame` loop** — all game logic, physics, collision, and mesh updates in one pass
- **Zero per-frame heap allocations** — in-place array culling instead of `Array.filter()`
- **Reusable collision result objects** — no `new {}` per collision check
- **Merged building geometry** — city walls are 2 draw calls total
- **No post-processing** — Bloom/ChromaticAberration removed for performance
- **4 active `useFrame` hooks** — GameScene, Player, TrainTracks, ScrollingWalls

Target: **50–60 FPS** on modern laptops, **40+ FPS** on older hardware.

---

## Assessment Checklist

- [x] 3-lane endless runner
- [x] Lane switching (keyboard + touch)
- [x] Jump over obstacles
- [x] Slide under obstacles
- [x] Gradually increasing speed
- [x] Start screen (loading → countdown)
- [x] Score counter
- [x] Game over screen
- [x] Restart functionality
- [x] Clean, organised code
- [x] Smooth gameplay
- [x] Polished user experience
- [x] Mobile touch support
- [x] FPS performance monitor
- [x] Live demo deployed on Vercel

---

## License

MIT
