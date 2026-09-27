# Cable synth

_2026-09-27._ Each of the 8 patch cables plays one Web Audio voice. One button,
"Physics and sound" (phones) / "Sound" (desktop), turns it on; on phones the same
tap asks for motion access so the cables swing with the phone.

- **Tuning** (`src/audio/synth/tuning.ts`): two just-intoned overtone series,
  deliberately out of tune with each other. Four cables on E2 (82.41 Hz), four
  on D2 a just 9:8 below (~73.25 Hz), each taking the odd harmonics 1 3 5 7
  (octave doublings skipped), interleaved E/D across the cables. Edit `VOICES`.
- **Voice** (`CableVoice.ts`): triangle + saw + square at one pitch, crossfaded.
- **Mapping** (`sway.ts`, measured per frame from the rope, displacement of the
  cable's centre from where it has been resting lately):
  - z displacement (toward/away from the screen) → pitch bend (± `bendCents`).
    z, not x, because x and y swap when the phone rotates.
  - y displacement → waveform, triangle → saw → square
  - total displacement → loudness, direct: motion = amplitude (quick rise,
    slow ring-out). `response` in `config.ts` also offers "inverse" (still =
    loudest) and "swell" (loudest at small motion).
- **Output** (`engine.ts`): master gain → lowpass → compressor. The audio thread
  suspends when the tab is hidden and when sound is turned off.
- All feel knobs: `src/audio/synth/config.ts`.
