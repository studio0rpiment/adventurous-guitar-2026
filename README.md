# Adventurous Guitar Summit

Interactive festival site built with React Three Fiber, TypeScript, and Vite.

## Stack

- **Vite** + **React 18** + **TypeScript**
- **@react-three/fiber** / **@react-three/drei** — 3D scene
- **Howler** — 2D/UI/ambient audio + autoplay unlock (add `<PositionalAudio>` from drei for 3D-anchored sound)

## Getting started

```bash
npm install
npm run dev      # start dev server
npm run build    # typecheck + production build
npm run preview  # preview the build
```

## Structure

```
src/
  App.tsx              # app shell: canvas + UI layers, wrapped in AudioProvider
  config/festival.ts   # festival metadata (single source of truth)
  audio/               # AudioProvider (event-driven unlock), useAudio, sound registry
  three/               # CanvasStage (Canvas) -> Scene -> small scene components
  ui/                  # DOM overlays that float above the canvas (Hud, EnterGate)
  styles/global.css
```

## Conventions

- **Modular components** — extract small reusable pieces at natural seams rather
  than duplicating JSX. Scene contents live under `three/components/`.
- **Event-driven over timers** — audio unlocks on the first user gesture, the
  enter gate reacts to unlock state, and animation runs on the R3F render loop
  (`useFrame`) — not `setInterval`/polling.
- Path alias `@/` maps to `src/`.

## Adding sound

1. Drop audio files in `public/audio/`.
2. Register them in `src/audio/sounds.ts`.
3. Play via `const { play } = useAudio(); play("myKey")`.
4. For sound anchored to a 3D object, use drei's `<PositionalAudio>` inside the
   scene graph instead.
```
