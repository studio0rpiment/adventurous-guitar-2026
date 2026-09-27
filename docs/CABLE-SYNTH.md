# Cable synth

_2026-09-27._ Each of the 8 patch cables plays one square-wave voice. One button,
"Physics and sound" (phones) / "Sound" (desktop), turns it on; on phones the same
tap asks for motion access so the cables swing with the phone.

## Chords (from phone tilt)

| phone | chord | cables 0–4 (chord tones) | cables 5–7 (harmonics 5, 7, 9 of the bass) |
|---|---|---|---|
| flat on its back | D Lydian | D3 F#3 B3 E4 G#5 | (snapped to D Lydian) |
| upright | E7#9 (Hendrix) | E2 E3 G#3 D4 G5 | G#4, D5 (−31¢), F#5 |
| flat on its face | Bb6add9 | Bb2 D3 G3 E4 A5 | D5, Ab5 (−31¢), C6 |

- Tilt comes from the smoothed gravity (`deviceTilt` in `physics/gravity.ts`).
  A dead zone around upright holds E7#9; past it every voice glides to the
  matching voice of the target chord, fully there at `tiltFull`.
- Desktop has no tilt, so it stays on E7#9.
- In full D Lydian, a moving cable wanders off its note (sideways + depth sway,
  up to `wanderSemis`) and resolves to the nearest D Lydian scale tone. Chord
  tones D F# C# G# A ring louder than E and B (`nonChordLevel`).

## Loudness

Motion = amplitude: a still cable is silent; it speaks as it moves and rings out
as it settles (`response: "direct"`; "inverse" and "swell" still available).

## Files

`src/audio/synth/` — `voicings.ts` (chords, harmonics, Lydian snap), `chord.ts`
(tilt + sway → note), `sway.ts`, `CableVoice.ts`, `engine.ts` (master → lowpass
→ compressor; suspends when hidden / off), `config.ts` (all feel knobs).
