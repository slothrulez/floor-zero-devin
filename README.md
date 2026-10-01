# FLOOR ZERO: 60 SECONDS

A fast-paced retro arcade vertical platformer. The building is collapsing around you — climb from the ground floor to the **Emergency Core** at the top and shut it down before the 60-second timer runs out.

Built with React, TypeScript, and an HTML5 Canvas game loop, with all sound effects synthesized live through the Web Audio API.

## Gameplay

- You start on the ground floor (tier 0). The Emergency Core sits on tier 7 at the top of the building.
- Climb ladders and jump across gaps to move up through the floors.
- Floors degrade over time: **SAFE → CRACKING → COLLAPSING → DESTROYED**. A cracking block gives you about 1.8 seconds to get off it.
- Rolling debris (barrels, concrete, canisters) spawns from the upper floors and rolls down toward you. Touching it ends the run; jumping over it earns points.
- Structural failure climbs from 10% to 100% over the minute. Collapses and debris come faster as time runs down, with warnings at 45s, 30s, and 15s and a countdown for the last 5 seconds.
- Reach the core, press **E**, and survive the 3.5-second shutdown sequence to win.

You lose if the timer hits zero, you get hit by debris, or you fall off the bottom of the screen.

### Controls

| Action        | Keyboard            |
| ------------- | ------------------- |
| Move          | `A` / `D` or `←` / `→` |
| Climb ladder  | `W` / `S` or `↑` / `↓` |
| Jump          | `Space`             |
| Core shutdown | `E` (next to the core) |
| Restart       | `R` (on the win/loss screen) |

On small screens an on-screen D-pad plus **JUMP** and **E** buttons appear during play.

### Scoring

| Event                     | Points |
| ------------------------- | ------ |
| Each new floor reached    | +200   |
| Debris jumped over        | +50    |
| Core shut down            | +1000  |
| Time bonus on win         | +100 per second remaining |

Your high score is saved in the browser's `localStorage` (`floor_zero_highscore`).

## Getting started

Requires Node.js and npm.

```bash
npm install
npm run dev
```

The dev server runs on http://localhost:3000 (bound to `0.0.0.0`).

### Scripts

| Command           | Description                                  |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Start the Vite dev server on port 3000       |
| `npm run build`   | Production build into `dist/`                |
| `npm run preview` | Serve the production build locally           |
| `npm run lint`    | Type-check with `tsc --noEmit`               |
| `npm run clean`   | Remove `dist/`                               |

### Environment variables

`.env.example` lists `GEMINI_API_KEY` and `APP_URL` from the original AI Studio template. The game itself doesn't use either, so you don't need a `.env` file to play it locally.

Setting `DISABLE_HMR=true` turns off Vite hot reload and file watching.

## Project structure

```
index.html                  HTML shell, fonts, and meta tags
src/
  main.tsx                  React entry point
  App.tsx                   Mounts the canvas, wires the engine to React UI
  gameEngine.ts             Game loop, physics, level layout, collapse/hazard logic, scoring
  canvasRenderer.ts         Draws the building, player sprite, hazards, particles, and effects
  audio.ts                  SoundEngine: synthesized retro sound effects (Web Audio API)
  types.ts                  Shared game types (Player, Platform, Hazard, GameStats, ...)
  index.css                 Tailwind CSS entry
  components/
    GameHUD.tsx             Timer, structural failure, score, and mute toggle
    StartScreen.tsx         Title screen with controls guide and high score
    WinScreen.tsx           Victory screen and stats
    LossScreen.tsx          Game-over screen (collapse or death)
    TouchControls.tsx       On-screen controls for mobile
  assets/images/            Player sprite sheets
```

The engine (`GameEngine`) runs its own `requestAnimationFrame` loop on a fixed 1200×900 canvas. React only handles the overlay screens and HUD, receiving updates through the `onStateChange` and `onStatsUpdate` callbacks.

## Tech stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- HTML5 Canvas 2D
- Web Audio API
- lucide-react icons
