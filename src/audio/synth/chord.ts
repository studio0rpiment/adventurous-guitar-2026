import { SYNTH } from "@/audio/synth/config";
import { chordMidi, isLydianChordTone, snapLydian } from "@/audio/synth/voicings";
import type { Sway } from "@/audio/synth/sway";

const smoothstep = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};

export interface CableNote {
  /** Pitch, fractional MIDI. */
  midi: number;
  /** Relative level for this note (D Lydian non-chord tones sit lower). */
  tone: number;
}

/**
 * What cable i plays right now, from the phone's tilt and the cable's sway.
 *
 * Tilt picks the chord: upright = E7#9; tilting back glides every voice toward
 * D Lydian, tilting forward toward Bb6add9 (dead zone around upright, full at
 * SYNTH.tiltFull). Fully in D Lydian, a moving cable wanders off its chord tone
 * (sideways + depth sway) and resolves to the nearest D Lydian scale tone —
 * chord tones (D F# C# G# A) ring louder than the others (E B).
 */
export function cableNote(i: number, tilt: number, sway: Sway, out: CableNote): CableNote {
  const home = chordMidi("hendrix", i);
  const a = Math.abs(tilt);
  const w = smoothstep((a - SYNTH.tiltDead) / (SYNTH.tiltFull - SYNTH.tiltDead));
  const target = chordMidi(tilt < 0 ? "lydian" : "bb", i);
  let m = home + (target - home) * w;
  let tone = 1;

  if (tilt < 0 && w >= 1) {
    const wander = ((sway.x + sway.z) / 2) * SYNTH.wanderSemis;
    m = snapLydian(m + wander);
    tone = isLydianChordTone(m) ? 1 : SYNTH.nonChordLevel;
  }
  out.midi = m;
  out.tone = tone;
  return out;
}
