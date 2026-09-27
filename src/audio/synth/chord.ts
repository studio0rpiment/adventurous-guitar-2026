import { SYNTH } from "@/audio/synth/config";
import { chordMidi, isLydianChordTone, snapLydian } from "@/audio/synth/voicings";

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

export interface CableNote {
  /** Pitch, fractional MIDI. */
  midi: number;
  /** Relative level for this note (D Lydian non-chord tones sit lower). */
  tone: number;
}

/**
 * What cable i plays, from where the cable itself hangs (depth −1..1, see
 * sway.ts measureDepth). Three poles, one fixed path per cable:
 *
 *   depth −1 (fallen back)   D Lydian   ─┐
 *   depth  0 (level)         E7#9       ─┼─ cable i is always voice i: the
 *   depth +1 (out in front)  low Bb     ─┘  lowest note of each chord, up.
 *
 * Every voice descends monotonically from D Lydian through E7#9 to Bb, so a
 * cable only ever moves one way as it falls from one pole to the next. With
 * SYNTH.travel = "steps" it walks there note by note — D Lydian scale tones on
 * the D side, semitones on the Bb side — landing exactly on each chord's tuning
 * (harmonics included) at the poles.
 */
export function cableNote(i: number, depth: number, out: CableNote): CableNote {
  const home = chordMidi("hendrix", i);
  const back = depth < 0;
  const w = clamp01((Math.abs(depth) - SYNTH.depthDead) / (SYNTH.depthFull - SYNTH.depthDead));
  const target = chordMidi(back ? "lydian" : "bb", i);

  let m = home + (target - home) * w;
  if (w >= 1 && back) m = snapLydian(m);
  else if (w > 0 && w < 1 && SYNTH.travel === "steps") m = back ? snapLydian(m) : Math.round(m);

  out.midi = m;
  out.tone = back && w > 0 && !isLydianChordTone(m) ? SYNTH.nonChordLevel : 1;
  return out;
}
