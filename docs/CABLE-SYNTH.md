# Cable synth

_2026-09-27._ Each of the 8 patch cables plays one square-wave voice. One button,
"Physics and sound" (phones) / "Sound" (desktop), turns it on; on phones the same
tap asks for motion access so the cables swing with the phone.

## Chords (from each cable's own position)

| cable hangs… | phone | chord | cables 0–4 (chord tones, low → high) | cables 5–7 (harmonics 5, 7, 9 of the bass) |
|---|---|---|---|---|
| behind its plugs | flat on its back | D Lydian | D3 F#3 B3 E4 G#5 | snapped to D Lydian |
| level | upright | E7#9 | E2 E3 G#3 D4 G5 | G#4, D5 (−31¢), F#5 |
| in front | flat on its face | Bb6add9 | Bb1 D2 G2 E3 A4 | D4, Ab4 (−31¢), C5 |

- Cable i is always voice i, so each cable has one fixed path, and every path
  descends D Lydian → E7#9 → Bb: a cable only ever moves one way.
- Depth = how far the cable's middle hangs in front of / behind its plugs, as a
  fraction of its reach (`measureDepth` in `sway.ts`). A wide zone around level
  holds E7#9 (`depthDead` 0.45 — a hand-held phone leans back); fully in the
  outer chord at `depthFull`. The chords themselves are magnets (`chordPull`):
  moving gently, voices linger at each chord and cross quickly between, so
  E7#9 lands as solidly as the ends; a jolt makes it a straight crossfade.
- Pitch glides continuously along the path, with a gentle magnetic pull at
  each note centre on the way (D Lydian scale tones on the D side, semitones
  on the Bb side): it lingers near each note and moves quickly between them.
  The pull is powered by the cable's acceleration on a parabola — gentle
  motion creeps note to note like a noodle on a table, a whip drains the pull
  and flies straight through (`SYNTH.magnet`: `strength`, `follow`,
  `accelRef`; `PitchMagnet` in `chord.ts`). D Lydian non-chord tones (E, B)
  sit lower (`nonChordLevel`).

## Sticky, weighted cables (`src/physics/sticky.ts`)

Each cable holds the pull it last settled under. When the phone turns it stays
stuck until the new pull is past its own release angle, then swings over at its
own speed and sticks again — so cables let go one by one, in a different order
each time (release angles re-roll on each re-stick). Heavier cables swing more
slowly and are drawn thicker. Shake always passes straight through.
Knobs: `STICKY.stickiness` (0 = none, 2 = gooey), `releaseMinDeg`/`releaseMaxDeg`,
`weightMin`/`weightMax`, `followRate`.

## Reading the cables (`src/audio/synth/sway.ts`, `adaptiveLowpass.ts`)

Everything the synth hears comes off each cable itself, every frame:
depth (where it hangs → pitch/chord) and speed (how fast it's moving →
loudness). Both pass through an adaptive low-pass whose cutoff rides a
parabola (U-curve) on the cable's acceleration — `fcMin` when it's moving
gently (slow feels slow), up to `fcMax` on a jolt (a whip snaps straight
through). Knobs: `SYNTH.filter`, `speedFull`, `speedFloor`.

## Loudness

Motion = amplitude: a still cable is silent (below `speedFloor`), louder the
faster it moves. Sideways lean fades it: a cable swung far left or right of its
plugs (phone rolled to either side) goes quiet, silent at `leanSilent`
(`leanDead`/`leanSilent`; measured from each cable's own natural lopsided hang,
learned while the phone is level side-to-side) (`response: "direct"`; "inverse" and "swell" still available).

## Files

`src/audio/synth/` — `voicings.ts` (chords, harmonics, Lydian snap), `chord.ts`
(cable depth → note), `sway.ts`, `CableVoice.ts`, `engine.ts` (master → lowpass
→ compressor; suspends when hidden / off), `config.ts` (all feel knobs).

## Solo mode (`src/ui/SoloController.tsx`, `src/audio/synth/solo.ts`, `src/physics/flick.ts`)

Hold a thumb down in the middle 60% of the screen (width and height) while
sound is on: the chord crossfades out and a single square voice takes over on
the E minor pentatonic (E G A B D, E2–E5, starting on E3). Flick the phone
toward you to step down, away to step up; lift the thumb to go back to the
chord. The solo voice sounds at the liveliest cable's level, so the cables
still play it. A "Solo <note>" pill shows the current note.

Flicks are read from the gyroscope's rotation rate about the phone's x axis
(fallback: linear acceleration along the screen normal), caught on the first
lobe with a threshold + hysteresis + refractory (`FLICK` in `flick.ts`:
`onDegPerSec`, `offDegPerSec`, `refractoryMs`, `invert`). No DTW or trained
model: two gestures on one axis don't need them, and both would add latency.
