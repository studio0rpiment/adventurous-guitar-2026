import { SYNTH } from "@/audio/synth/config";
import { chordMidi, isLydianChordTone, snapLydian } from "@/audio/synth/voicings";

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

export interface CableNote {
  /** Pitch, fractional MIDI. */
  midi: number;
  /** True on the frame a voice slips off a note it was stuck on. */
  slipped: boolean;
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
/** Per-cable memory for sticky notes. */
export interface NoteGrip {
  held: number | null;
  catch: number;
}

const rollCatch = () =>
  (SYNTH.catchMin + Math.random() * (SYNTH.catchMax - SYNTH.catchMin)) * SYNTH.noteStickiness;

export const createNoteGrip = (): NoteGrip => ({ held: null, catch: rollCatch() });

export function cableNote(
  i: number,
  depth: number,
  grip: NoteGrip,
  out: CableNote,
): CableNote {
  const home = chordMidi("hendrix", i);
  const back = depth < 0;
  const w = clamp01((Math.abs(depth) - SYNTH.depthDead) / (SYNTH.depthFull - SYNTH.depthDead));
  const target = chordMidi(back ? "lydian" : "bb", i);

  let m = home + (target - home) * w;
  out.slipped = false;
  if (w >= 1 && back) {
    m = snapLydian(m);
    grip.held = null;
  } else if (w > 0 && w < 1) {
    const grid = back ? snapLydian(m) : Math.round(m);
    if (SYNTH.travel === "steps") m = grid;
    else if (SYNTH.noteStickiness > 0) {
      // snag on note points along the glide, slip off once pulled far enough
      if (grip.held !== null && Math.abs(m - grip.held) > grip.catch) {
        grip.held = null;
        grip.catch = rollCatch();
        out.slipped = true;
      }
      if (grip.held === null && Math.abs(m - grid) < SYNTH.snagRadius) grip.held = grid;
      if (grip.held !== null) m = grip.held;
    }
  } else {
    grip.held = null; // at a pole: exact chord tuning
  }

  out.midi = m;
  out.tone = back && w > 0 && !isLydianChordTone(m) ? SYNTH.nonChordLevel : 1;
  return out;
}
