# Adventurous Electric Guitar Festival — Project Handoff

_Last updated: 2026-07-17. Written to hand this build off to a fresh session._

---

## 0. TL;DR / where we are

> **ACTIVE FORK (2026-07-18):** work has moved to a new **guitar-cable scene** (see §11 at the end). The Max/MSP brick + patch-cord metaphor described below is intentionally **held for now** — its files are kept but unmounted.

A frontend, interactive **React Three Fiber (R3F)** site for the **Adventurous
Electric Guitar Festival** (Oct 8–9, 2026), Houston / Rice University's Shepherd
School of Music. Built with **Vite + React 18 + TypeScript**. Deployed on
**Vercel** (already live once).

Two things exist in parallel and should not be confused:

1. **The app** (the real code in `src/`). Currently: an ENTER landing gate over
   an orthographic "brick field" that reconstructs the stage photo, four menu
   bricks on the left, and a HUD pick logo. This is real but **early** — it does
   NOT yet have the object-outline boxes, signal cables, or content-sized text
   from the prototypes.
2. **The prototypes** (Three.js widgets rendered inline in the chat only, to lock
   the visual language). These are NOT in the repo. Their agreed specs + code are
   captured in the Appendix so they can be ported.

The current open thread: **porting the prototyped "Max/MSP patch" metaphor into
the app.** The stage-image field is ported; the object boxes + cables are not.

---

## 1. The vision

The festival is about interactive/electronic guitar music. The organizer (Kevin)
and his community use **Max/MSP** (Cycling '74) — a visual DSP environment where
you build sound by wiring **objects** (labeled rectangular boxes) together with
**patch cords**. We are turning that visual language into the site's UI.

Core metaphor: the site surface is a **2D matrix of thin rectangular cuboids
("bricks")** seen through a **flat, head-on orthographic camera**. Each brick is
a prism that can **rotate around its long (horizontal) axis** to show up to four
faces. Collectively the front faces reconstruct an **image** (the stage photo,
like a coarse photo-mosaic — reference was a pixelated camel-rider image made of
glyph tiles). Bricks/objects are wired together with **Max-style signal cables**.

Relevant tech note: Cycling '74's **RNBO** can export a Max patch to
**WebAssembly wrapped as a Web Audio `AudioWorkletNode`** (`@rnbo/js`), so the
actual Max DSP could eventually run inside this site — the 3D scene and a real
granular/looping engine sharing one Web Audio graph. This is the aspirational
audio direction (current audio is just a Howler provider stub).

---

## 2. Design decisions locked in the prototypes

Dimensions/looks agreed while iterating (see Appendix for code):

- **Camera:** orthographic, dead flat / head-on. No perspective. Depth only
  reveals itself when a brick rotates.
- **Bricks:** rectangular cuboids, **height 0.5** units, **variable width based
  on content** (like Max objects sizing to fit their label). Cross-section
  square-ish so all four rotating faces are usable.
- **Seams:** the field image uses **NO gap** (flush → continuous image). Earlier
  we tried hairline seams but they read "too much like actual bricks."
- **Object boxes (Max style):** dark center with the label, a **grey outline**,
  **colored top/bottom bars** (green in Kevin's example, color is data-drivable),
  and **half-circle inlet/outlet connector nubs**. Connectors sit **near the
  edges (left/right), not centered** (Max convention). Text is **1:1, never
  stretched** — the box width is measured from the text.
- **Menu labels:** lowercase, ~**1rem**, in the site font **Format 1452**. Grey
  outline. **Hover → accent orange** (`#e8964a`).
- **Signal cables:** **flat ribbon** (not a round tube), bezier curve with a
  gravity sag from outlet→inlet. Texture = **equal-length yellow and black
  segments** with a **light-grey outline** on the two long edges. **Thin** (a few
  attempts thinner — final `HALF ≈ 0.026`). Procedural stripe (crisper than the
  raster cable image; scales without blurring). Cables route into the **near-side
  connector**.
- **Motion (final decision for the picture field):** **hovering a brick rolls
  that single brick a full 360°**, starting and ending on the image face. NO
  ripple radius, NO auto-cascade, NO timer. (We tried and rejected: a
  radius ripple = "bursts"; a periodic Solari/departure-board cascade = "just
  changing colors one after another".)
- **Menu bricks:** stationary (no roll). Only the picture bricks roll.

---

## 3. What's in the app right now (`src/`)

Entry: `main.tsx` → `App.tsx`. `App` wraps everything in `AudioProvider` and
renders `CanvasStage` (the R3F canvas), `Hud`, and `EnterGate` (the landing gate,
which hides once audio is unlocked).

### Landing / DOM UI (`src/ui/`)

- **`EnterGate.tsx`** — the landing. The `aeg-Logo.jpg` centered on black, with
  the Rice callout and the ENTER cue. Hides when audio unlocks (first gesture),
  revealing the canvas. The box is a container-query context so children scale on
  mobile.
- **`RiceCallout.tsx`** — technical-diagram callout: a dot on Houston (logo coord
  `452,322`), a **two-segment "arm"** leader with a gap before the dot, and a
  label _"Shepherd School of Music at Rice"_ (0.5rem, `cqw`-responsive) linking
  to `https://music.rice.edu/` (new tab, `stopPropagation` so it doesn't trigger
  enter). Constants `HOUSTON / ELBOW / JOIN / DOT_R / GAP / STROKE` at top.
- **`EnterCue.tsx`** — the "ENTER" cue nested in the pick's bottom tip. Upright,
  level letters that each **flip around the Y axis**, choreographed: L→R wave to
  180°, R→L wave back to 0, then a 3s pause, looping. Per-letter keyframes are
  generated from `FLIP`/`STAGGER`/`PAUSE`. Respects reduced-motion.
- **`Logo.tsx`** — the festival mark: Kevin's `logoInvert.svg` path (inverted
  pick + Gulf-of-Mexico coastline) rendered as a **white outline**
  (`non-scaling-stroke`), plus a traced **pick-top curve** (from the JPG) so it's
  a closed pick, plus a **Houston dot** (`cx=455 cy=345 r=42`, enlarged for
  legibility at 3rem). Props: `size`, `color`, `strokeWidth`.
- **`PickMenu.tsx`** — the corner HUD pick as a nav hub. Hover (desktop) / tap
  (mobile) rotates the pick `-90deg` and fans four leader-line routes (Schedule,
  Participants, Locations, About) to the right — each leader starts on a small
  radius around the tip. Routing is **stubbed** (`onSelect`). Constants
  `TIP_X/TIP_Y/START_R/TOP_Y/ROW/RIGHT_X/X_STEP/SHELF`. Event-driven open/close
  (hover, Escape, outside-pointerdown). NOTE: this is the OLD menu; per Kevin the
  menu is migrating to on-canvas bricks (`MenuBricks`), but the pick stays in the
  HUD "so to speak".
- **`Hud.tsx`** — fixed overlay: `PickMenu` top-left, sound toggle top-right.
  Safe-area-aware padding, 44px tap targets.
- **`Backdrop.tsx`** — old stage-image landing backdrop, now UNUSED (kept, reusable).

### 3D / R3F (`src/three/`)

- **`CanvasStage.tsx`** — the `<Canvas>`. **Orthographic**, `zoom: 50`,
  head-on. Renders `PatchField` (in Suspense) + `MenuBricks`.
- **`PatchField.tsx`** — the brick field / face 0. Loads `stage-background.jpg`,
  builds a grid (`ROWS=16`, variable widths) of `BoxGeometry` prisms, **flush**,
  each front face UV-mapped to its **cover-mapped** slice of the photo. The three
  non-image faces are placeholder colors (amber/rust/teal). **Hover → that brick
  rolls 360°** (`useFrame` eases `rotation.x` toward `turns*2π`). Per-brick
  `onPointerOver`.
- **`MenuBricks.tsx`** — the four menu items as **thin stationary object bricks**
  stacked on the left. ~1rem lowercase Format 1452, grey object outline + grey
  bars + half-circle side nubs, **accent-orange on hover**. Font-load guarded
  (canvas waits for `document.fonts.ready`). Routing not yet wired.
- **`Scene.tsx`, `components/{Lights,Rig,PlaceholderObject}.tsx`** — the ORIGINAL
  placeholder perspective scene (spinning icosahedron + OrbitControls). Now
  UNUSED since we went orthographic; kept for reference. Can be deleted.

### Audio (`src/audio/`)

- **`AudioProvider.tsx`** — Howler-based context. Unlocks on first user gesture
  (event-driven, `pointerdown/keydown/touchstart`, once). `useAudio()` hook,
  `sounds.ts` registry (empty). This is a stub; real direction is RNBO (see §1).

### Config / styles

- **`config/festival.ts`** — name, shortName `AEG`, year, dates.
- **`config/media.ts`** — media source map (`stageBackground`, `stageBackgroundMobile`,
  `logo`). Cloudinary-ready (`cld()` helper commented; Kevin serves media via
  Cloudinary — swap the local `/img/...` paths for `cld("public-id")` when ready).
- **`styles/global.css`** — CSS vars, **font tokens** (`--font-body` = Format
  1452; `--font-light` / `--font-display` are RAILS defaulting to body; commented
  `@font-face` rails incl. a **variable-font** rail, Kevin's preferred path),
  mobile hardening, keyframes (`ags-menu-in`), reduced-motion.

---

## 4. Current known issues / gotchas

- **"The prototyped bricks don't work in the app."** Correct — the object boxes,
  cables, and content-sized text were **chat-only prototype widgets**, never
  ported. Only the stage-image field + menu bricks + hover-roll are in the app.
  The port is the main next task (see §5).
- **`1rem` menu font is pinned to `ZOOM=50`** (the ortho camera zoom). If the
  camera zoom changes, rescale `MenuBricks` font (`fontPx = REM_PX*PX/ZOOM`).
- **Perf:** `PatchField`/`MenuBricks` use individual meshes. Fine now; before
  full density + all four faces + cables, switch to **InstancedMesh + a texture
  atlas** so mobile stays smooth.
- **Rolling reveals dark/colored side faces** (placeholder) mid-spin. Intended —
  those faces get real content later.
- **`node_modules` / `dist`:** any `node_modules` I generated was built in a Linux
  sandbox (wrong native binaries for macOS). On the Mac: `rm -rf node_modules dist && npm install`.
- **⚠️ File-sync conflicts on `PickMenu.tsx`:** the sync repeatedly created
  `PickMenu [conflicted].tsx` / `[conflicted 2].tsx` copies (something on Kevin's
  machine races the file — likely an editor re-saving during sync). Each time I
  renamed the conflicted copy back to `PickMenu.tsx`. If the build errors with
  "Cannot find module '@/ui/PickMenu'", check `src/ui/` for a conflicted copy and
  rename it.
- **Scratch files:** lots of `_scratch/`, `_trace/`, `_*.png`, and
  `vite.config.ts.timestamp-*.mjs` accumulated and are **gitignored**; the
  sandbox couldn't delete them (mount blocks unlink). Clean on the Mac:
  `rm -rf _scratch _trace _*.png vite.config.ts.timestamp-*.mjs`.

---

## 5. Roadmap / next steps (in rough priority)

1. **Port the object boxes into the app.** Content-sized brick widths (measure
   the label), grey outline + colored bars + side connector nubs — the
   `objTexture` from the prototype (Appendix B). The four `MenuBricks` should use
   this look; general field objects too.
2. **Port the signal cables** (Appendix C): flat ribbon, equal yellow/black
   dashes, grey outline, thin, sagging bezier, routed to near-side connectors.
   Decide what connects to what (menu → field regions? object graph?).
3. **Wire menu routing** — `PickMenu.onSelect` / `MenuBricks` clicks → real
   sections (Schedule / Participants / Locations / About). No router yet; add
   react-router or one-page scroll when the sections exist (Kevin chose "stub for
   now").
4. **The four faces' content model.** Face 0 = stage image (done). Decide faces
   1–3: info text, glyph/pattern tiles, menu, second image. Kevin's framing: "we
   build the four sides of the cuboids and then connect them."
5. **Instancing pass** for perf.
6. **Audio:** evaluate RNBO web export to run real Max DSP in-browser.
7. **Cloudinary:** move `/img` assets to Cloudinary via `media.ts`'s `cld()`.

---

## 6. Conventions & preferences (Kevin)

- **TypeScript**, always. Builds must pass `npx tsc -b` + `npx vite build`.
- **Event-driven over timers/polling.** Prefer state-change/pointer/keyboard
  events; only use a timer when there's genuinely no event to hang on, and say so
  (e.g., the departure-board tick was a legit-but-rejected timer use).
- **Modular** — small reusable components extracted at natural seams; don't
  over-extract genuinely-different things.
- **rem units** for sizing.
- **Recommendations _with_ reasoning**, not just options.
- **Iterative, visually-driven** — he reviews rendered output and gives precise,
  issue-level feedback. Prototyping the look in a throwaway widget before porting
  works well.
- Concise, low-formatting responses.

---

## 7. Run / build / deploy

```bash
npm install
npm run dev        # local
npm run build      # tsc -b && vite build
npm run preview
```

- Deploy: **Vercel** (Vite preset auto-detected). `vercel.json` sets the SPA
  rewrite + long-cache asset headers.
- Path alias `@/` → `src/`.
- Assets in `public/img/` (`stage-background.jpg` 4032×3024, `aeg-Logo.jpg`,
  `SVG/logoInvert.svg` etc.) and font in `public/fonts/Format_1452.woff2`.

---

## 8. Appendix — prototype widget code (chat-only, for porting)

These were rendered inline as Three.js (r128) HTML widgets to lock the look. They
are the source of truth for §2. Reproduce or port as needed.

### A. Flat orthographic variable-width brick field (concept)

- Ortho camera, head-on. Bricks `BoxGeometry(w, 0.5, 0.5)`, variable `w` packed
  end-to-end per row; hairline (later zero) gaps. Front face = image slice or a
  text/colour. Click flips the field; hover flips a tile (early exploration).

### B. Object box front-face texture (grey outline + bars + side nubs)

```js
// worldW measured from the label so text is never stretched.
// PX = texture px per world unit; CH = brick height in px; connectors at edges.
function objTexture(label, worldW, chPx, fontPx, band, outline, textColor) {
  const cw = Math.max(8, Math.round(worldW * PX));
  const cv = document.createElement('canvas'); cv.width = cw; cv.height = chPx;
  const g = cv.getContext('2d');
  const bH = Math.round(chPx * 0.14), R = Math.round(chPx * 0.10); // bar height, nub radius
  g.fillStyle = '#191d23'; g.fillRect(0, 0, cw, chPx);             // dark center
  g.fillStyle = band; g.fillRect(0, 0, cw, bH); g.fillRect(0, chPx - bH, cw, bH); // colored bars
  g.fillStyle = textColor; g.font = `${fontPx}px "Format 1452", monospace`;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(label.toLowerCase(), cw / 2, chPx / 2 + 1);
  g.fillStyle = '#cfd3d9';                                         // half-circle nubs, EDGE-aligned
  [0.12, 0.88].forEach(fx => { const x = fx * cw;
    g.beginPath(); g.arc(x, 0, R, 0, Math.PI); g.fill();           // top inlets (bulge down)
    g.beginPath(); g.arc(x, chPx, R, Math.PI, 2 * Math.PI); g.fill(); }); // bottom outlets
  g.strokeStyle = outline; g.lineWidth = 2; g.strokeRect(1, 1, cw - 2, chPx - 2); // grey outline
  // -> new THREE.CanvasTexture(cv); colorSpace = SRGB; minFilter = Linear; no mipmaps
}
// NORMAL = { band:'#3a4049', outline:'#b7bcc4', text:'#eef2f6' }
// HOVER  = { band:'#e8964a', outline:'#e8964a', text:'#ffffff' }  (accent orange)
```

### C. Signal cable (flat ribbon + dashed texture, routed to near-side connectors)

```js
// Equal-length yellow/black segments + light-grey outline on the long edges.
function cableTex() {
  const wpx = 48, hpx = 26, c = document.createElement('canvas');
  c.width = wpx; c.height = hpx; const g = c.getContext('2d');
  g.fillStyle = '#d7de1f'; g.fillRect(0, 0, wpx, hpx);            // yellow half
  g.fillStyle = '#101010'; g.fillRect(wpx / 2, 3, wpx / 2, hpx - 6); // black half (equal)
  g.fillStyle = '#c7ccd2'; g.fillRect(0, 0, wpx, 3.2); g.fillRect(0, hpx - 3.2, wpx, 3.2); // grey edges
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.ClampToEdgeWrapping; return t;
}
// Ribbon: sample a CatmullRom curve [outlet, mid(-sag), inlet]; for each sample
// push left/right verts along the XY-perpendicular at HALF width (~0.026 world);
// uv u along length, v across width; map.repeat.x = round(length * DENS(~3.6)).
// Material: MeshBasicMaterial({ map, side: DoubleSide }). Flat, no lighting.
// Endpoints: connectors are inset NUB=0.12 from each edge; a link a->b uses a's
// outlet on the side toward b (bottom edge) and b's inlet on the side toward a
// (top edge). Sag: mid.y -= dist*0.26 + 0.25.
```

### D. Motion behaviors explored (and the final pick)

- Per-letter Y-flip choreography (shipped in `EnterCue`).
- Prism-field: click-wave; hover single-flip; **radius ripple (rejected: bursts)**;
  **periodic Solari cascade (rejected: just cycles colors)**;
  **FINAL: hover a brick → single 360° roll, back to the image.** (in `PatchField`)

---

## 9. Fast orientation for the next session

Read, in order: this file → `src/App.tsx` → `src/three/CanvasStage.tsx` →
`src/three/PatchField.tsx` + `MenuBricks.tsx` → `src/ui/EnterGate.tsx` +
`RiceCallout.tsx` + `EnterCue.tsx` + `PickMenu.tsx` + `Logo.tsx`. Then continue
the port per §5, following the specs in §2 and the prototype code in §8.

---

## 11. Active fork — the guitar-cable scene (added 2026-07-18)

A new visual direction, forked from and running **instead of** the Max/MSP
brick field. The org's community is guitar-centric, so the site's hero object is
now a **real 3D guitar cable**: a 1/4" jack plug at each end joined by a cable
that **sags, swings, and whips with physics**. You can **grab either plug** and
move it; the cable responds. The brick/patch-cord metaphor (§1–§5, §8) is on hold
(files kept, unmounted) and can be revived.

### What shipped
- Camera is now **perspective** (real models need depth/lighting), replacing the
  orthographic head-on rig.
- `CanvasStage.tsx` rewritten: perspective camera (`fov 45`, `lookAt(0,-0.6,0)`),
  hemi + two directional lights, a procedural studio env for reflections, and it
  renders `CableRig` in Suspense. It no longer mounts `PatchField` / `MenuBricks`.
- New module **`src/three/cable/`** (kept modular per Kevin's prefs):
  - `constants.ts` — all feel knobs: `ROPE` (count, `restTotal`=sag, `gravity`,
    `damping`, `iterations`, `radius`, tube segments), `TARGET_LEN` (plug size),
    `END_A`/`END_B` (rest positions), `JACK_AXIS`/`EXIT_LOCAL`, `JACK_MODEL_URL`.
  - `verlet.ts` — pure Verlet rope (`createRope`, `stepRope`). No dependencies.
  - `Cable.tsx` — presentational tube mesh; geometry rebuilt each frame by the rig.
  - `JackPlug.tsx` — loads `public/models/guitarCableJack.glb` via `useGLTF`,
    then **normalizes** it (center at origin, long axis local **Z**, **+Z = the
    cable-exit end**), scaled so its long axis = `TARGET_LEN`. Pointer props are
    spread through for grabbing.
  - `StudioEnv.tsx` — procedural PMREM gradient env (no external HDR fetch) so the
    steel reads; matches the look locked in the feel prototype.
  - `CableRig.tsx` — owns the rope, the two anchors, and the grab. **One
    authoritative `useFrame`**: step physics → rebuild cable tube → orient/place
    each plug to the rope tangent (`setFromUnitVectors(JACK_AXIS, tangent)`).

### The model (`public/models/guitarCableJack.glb`)
- ~9cm along its **Z** axis; steel plug tip toward **−Z**, black-plastic barrel /
  **cable exit toward +Z**. Two PBR materials (steel: metal 1 / rough .15; black
  plastic: metal 0 / rough .25).
- **Gotcha (already handled):** the steel-tip node is a **child** of the barrel
  node, so its position only resolves once the parent transform is composed in.
  `GLTFLoader`/`useGLTF` do this correctly — do **not** flatten node transforms by
  hand (doing so splits the tip off the barrel).

### Physics decision
- Prototyped and shipped with a **dependency-free Verlet rope** — the approved
  feel, and it runs with no install step. The grab is **event-driven** (pointer
  events + a drag plane through the anchor); only the sim runs on the render tick
  (a legitimate tick — noted in `verlet.ts`).
- **Upgrade path:** swap `verlet.ts` for **`@react-three/rapier`** rope joints
  when we need collisions or **plugging the jack into a socket**. Not needed yet.
- Released ends currently **anchor where dropped** (always usable). Rapier would
  let a released end free-dangle if we want that.

### Next steps for this fork
1. Tune feel in `cable/constants.ts` (thickness, sag, plug scale, camera framing).
2. Wire the plugs/cable to navigation (this is where menu routing could live).
3. Consider a subtle idle sway and hover state on the plugs.
4. When sockets/collisions are wanted → port physics to Rapier.
