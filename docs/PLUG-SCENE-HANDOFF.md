# Handoff — Guitar-cable / pedal "plug-scene" prototype

_Last updated 2026-07-19. Written to hand this build to a fresh session._

## 0. TL;DR / where we are

An interactive **R3F-metaphor prototype**: two guitar pedals on a floor, a
physics guitar cable you grab and plug into their jacks, turnable knobs, a
3-position toggle, and a latching footswitch with an LED. It is the current
active direction for the site (the "guitar cable" fork from `docs/HANDOFF.md`
§11), taken much further.

**It is a standalone look-lock widget, NOT in the app yet.** It lives at
**`public/plug-scene.html`** and is viewed by running the dev server and opening
**`http://localhost:5173/plug-scene.html`** (or whatever port Vite prints). It is
a single self-contained HTML file (three.js from cdnjs + inline GLTFLoader +
models embedded as base64 `.glb` data-URLs).

### Why standalone HTML on the dev server (not an inline artifact)
The Cowork/artifact sandbox blocks `blob:` URLs, and `GLTFLoader` creates
`blob:` URLs for embedded textures, so the models silently fail there and the
canvas is blank. A normal browser (the Vite dev server) has no such restriction,
so it renders fine. If we ever want it to run inside an artifact too, convert the
models to `data:`-URI glTF (no `blob:`) and inline three.js.

## 1. Models (`public/models/`)

All models are Blender/Sketchfab exports with the same quirk: a single merged
mesh named `Object_0`/`Object_2` under a `Sketchfab_model` node that carries a
**−90° X rotation**, so **mesh geometry is raw Z-up** (Z is up, Y is length).

| file | notes |
|---|---|
| `guitarCableJack.glb` (125KB) | the cable plug. ~9cm along Z; steel tip toward −Z, black barrel / cable-exit toward +Z. Tip node is a **child** of the barrel node — `useGLTF`/GLTFLoader compose it correctly; do not flatten transforms by hand. Shoulder (thin shaft → barrel) at ~42% of length from the tip. |
| `DlyNarrowPedal.glb` (5.1MB) | original Mooer-style mini pedal (single mesh, 4× 2048 PNG). |
| `DlyNarrowPedal-web.glb` (253KB) | optimized (1024 webp). |
| `Pedal-Schedule.glb` / `Pedal-Participants.glb` (~260KB) | **the two pedals used in the scene** — recolored body (hue-shift) + renamed top ("SCHEDULE" teal, "PARTICIPANTS" orange), 1024 webp. Built by repacking the recolored baseColor into the original then `gltf-transform optimize … --compress false` (which keeps the Sketchfab hierarchy — mesh stays raw Z-up). **Do not re-run optimize with flatten/quantize** or the runtime knob-split (below) breaks. |
| `MemoryMan.glb`→`MemoryMan-web.glb` (78MB→3.3MB) | EHX delay, optimized; not in the scene yet. |
| `FootSwitch.glb` (5.0MB, **new, added by Kevin 2026-07-19**) | a **dedicated footswitch part**, same source/coords as the pedal (bbox x[-0.081,0.081] y[-0.341,-0.179] z[0.15,0.33] — matches the pedal footswitch spot). Single mesh, 4× 2048 PNG. |
| `FootSwitch-web.glb` (134KB) | optimized (1024 webp) version of the above. Could replace the runtime footswitch-split with a real model (still one mesh, so the cap would need splitting from the nut for the press). |

Optimize recipe used throughout: `gltf-transform optimize IN OUT
--texture-compress webp --texture-size 1024 --compress false
--prune-solid-textures true`.

## 2. What the scene does (`public/plug-scene.html`)

Everything is inside one big IIFE. Key systems:

**Cable (Verlet rope).** `N=22` points, gravity, damping, distance constraints
(`ITER=20`), **bending stiffness** and floor/pedal collision. Rendered as a
`TubeGeometry` swept along a **centripetal** CatmullRom through the points.
- Floor: interior points clamp to `y≥CABLE_R`; the two **plug ends** clamp to
  `y≥BARREL_R` (they ride on the fat barrel, so they don't sink).
- Pedal collision: each pedal is an oriented box; cable points and the plug tip
  are pushed out (never out the **bottom** face — pedals sit on the floor). So a
  plug can't enter a pedal except by seating in a jack.
- **Bending fix (important):** the stiffness pass eases interior points toward
  the neighbour midline and shifts **both `p` and `pp` by the same delta** so it
  injects **zero velocity**. The earlier bug moved only `p`, which pumped energy
  every frame → a self-sustaining **transverse wave**, worst on a cable pinned at
  both ends (a taut string resonates). Keep `p`/`pp` in lockstep here.
- **Sleep/wake:** the sim only runs while awake. It sleeps (freezes, zeros
  velocities) once at rest OR ~1.5s after the last interaction (wall-clock, so
  it's frame-rate independent). Wakes on grab / hover-over-plug / pointer-down.

**Plug interaction (two-phase, screen-space).** Grab a plug (raycast the jack
meshes). As it nears a jack (`ALIGN_PX`) it **rotates to present its tip** to the
socket; when moved onto it (`SEAT_PX`) it **seats**. Only the front ~42% (tip to
shoulder) inserts; the barrel + cable stay out. A grabbed/plugged end is pinned;
a released free end falls to the floor and can be grabbed off it.

**Jacks / sockets.** Each pedal exposes **both** jacks (−X input, +X output),
placed on the real modeled hex nuts. A tight `PointLight` at each makes the
pedal's own **metal nut shine** as a plug approaches (`aligning`). +X (output)
position is mirrored from the measured −X jack and may want a small nudge.

**Controls — runtime mesh-split.** The pedal is one merged mesh, so on load
`splitPedal()` carves the knobs / footswitch cap / LED out of the geometry by
raw-coord cylinders (all 3 triangle verts must be inside → no bridging shards),
re-indexes the body, and parents each part on a pivot so the **real modeled
parts** move:
- **bigKnob**, **smallKnob** — turn (drag vertically), `KNOB_SWEEP=270°`,
  continuous `0.0–1.0` (Kevin said maybe 320° — one constant to change).
- **smallToggle** — 3-position (click to cycle), `TOGGLE_ANGLES`.
- **footswitch** — split into a **static silver nut/shaft** and a **silver
  cap**; the cap is **momentary** (dips into the housing on click, springs back)
  while the on/off **state latches**. Silver = `SILVER` material (metalness 1).
- **LED** — split out with its own emissive material; glows red when the
  footswitch is on.

**Params HUD (top-right).** Live per-device values. Naming:
`[deviceName]-bigKnob: 0.00–1.00`, `-smallKnob`, `-footswitch: on/off`, and the
toggle as **`[deviceName]-smalltogglePosition1|2|3`**. deviceName is the pedal
name ("Schedule" / "Participants"). These are the interaction hooks; nothing is
wired to real app state yet.

**Camera.** A minimal custom orbit (drag empty space to rotate, wheel to zoom) —
not drei OrbitControls, so it composes cleanly with grabbing (a plug/knob grab
never fights the camera).

## 3. Coordinate & implementation gotchas (read before editing)

- **Mesh is raw Z-up.** Feature centres (`FEATURES` in `splitPedal`) are in raw
  mesh coords: X width, Y length, **Z up**. Knob axis = raw +Z → rotate
  `pivot.rotation.z`. Footswitch presses along −Z.
- **Do not flatten/quantize the pedal glbs.** The split relies on the mesh being
  raw Z-up under the rotation node. An earlier mis-analysis (thinking it was
  baked Y-up) sent me down a wrong path — it is Z-up.
- `geometry.setIndex()` **must** get a `THREE.BufferAttribute`, not a raw typed
  array (three r128 sets `.index` to the array as-is otherwise → render crash
  "onUploadCallback is not a function").
- To hit-test a split part, its world centre = **average of its indexed
  vertices** localToWorld — the shared position attribute makes
  `boundingSphere.center` the whole-pedal centroid (wrong).

## 4. Tunables (constants near the top of the script)

Cable: `CABLE_R`, `BARREL_R`, `GRAV` (−0.02), `DAMP` (0.9), `ITER`, `BEND` /
`BEND_PASS`, `REST` (cable length), `N`. Sleep: `stillFrames`>14 and the 1500ms
backstop. Plug: `ALIGN_PX`, `SEAT_PX`, `OUTSET` (=0.58·PLUG_LEN, the shoulder
depth), `PLUG_LEN`. Sockets: `socketLocal` per jack, `PointLight`
intensity/distance. Controls: `KNOB_SWEEP`, `TOGGLE_ANGLES`, knob drag
sensitivity (0.005), footswitch dip depth/`DUR`, LED `emissiveIntensity` target.

## 5. Next steps

1. **Fold into `src/`** as real R3F components (perspective `CanvasStage`,
   `<Cable>`, `<PedalRig>`, `useGrab`, a params store). Right now it's vanilla
   three in one HTML file for fast iteration.
2. **Wire the params/bypass state** to real app state / routing (e.g. plugging a
   cable into "Participants" → navigate; knob/toggle values → actual parameters,
   eventually RNBO per the master handoff).
3. **Use `FootSwitch.glb`** (optimize first) — decide whether to keep the
   runtime split or use the dedicated model; split its cap from nut for the press.
4. Fine-tune the **+X (output) jack** position; consider wiring a real
   output→input signal chain between the two pedals.
5. **Physics as Rapier** if we ever need collisions/plug-into-socket beyond the
   current box approach — the Verlet version is what shipped and feels right.

## 6. Test/verify loop used this session

Rendered headlessly with Playwright + Chromium (SwiftShader) against a local
`python3 -m http.server`, driving pointer events and diffing frames (e.g. to
prove the cable freezes when connected). The delivered file points three.js at
cdnjs; the test copy swaps in a local `three.min.js`. Window hooks
(`__knobpos`, `__scr`, `__ends`, `__socks`, `__diag`) exist only to let the test
aim/inspect and are harmless to leave in.
