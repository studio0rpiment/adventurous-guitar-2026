import { SYNTH } from "@/audio/synth/config";
import { chordMidi, isLydianChordTone, lydianBracket, snapLydian } from "@/audio/synth/voicings";

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

export interface CableNote {
  /** Pitch, fractional MIDI. */
  midi: number;
  /** Relative level for this note (D Lydian non-chord tones sit lower). */
  tone: number;
}

/**
 * Where cable i's pitch is headed, from where the cable hangs (depth −1..1,
 * see sway.ts). Three poles, one fixed path per cable:
 *
 *   depth −1 (fallen back)   D Lydian   ─┐
 *   depth  0 (level)         E7#9       ─┼─ cable i is always voice i: the
 *   depth +1 (out in front)  low Bb     ─┘  lowest note of each chord, up.
 *
 * Every voice descends monotonically D Lydian → E7#9 → Bb, so a cable only ever
 * moves one way as it falls from one pole to the next. Returns the target pitch
 * plus the two note centres it sits between along the way (D Lydian scale
 * tones on the D side, semitones on the Bb side), or null at a pole (exact
 * chord tuning).
 */
/** Acceleration → magnet power, on the parabola: 1 when gentle, 0 at a jolt. */
export const magnetPower = (accel: number) =>
  1 - Math.min(1, (accel / SYNTH.magnet.accelRef) ** 2);

/** Smooth staircase between 0 and 1: n = 1 straight, bigger n lingers at both ends. */
const linger = (u: number, n: number) => {
  const a = u ** n;
  const b = (1 - u) ** n;
  return a / (a + b);
};

export function cableTarget(
  i: number,
  depth: number,
  power = 0,
): { midi: number; bracket: [number, number] | null } {
  const home = chordMidi("hendrix", i);
  const back = depth < 0;
  const raw = clamp01((Math.abs(depth) - SYNTH.depthDead) / (SYNTH.depthFull - SYNTH.depthDead));
  // chords are magnets: linger near E7#9 and near the flat chord, pass quickly between
  let w = raw > 0 && raw < 1 ? linger(raw, 1 + SYNTH.chordPull * 4 * power) : raw;
  if (w < 0.01) w = 0;
  if (w > 0.99) w = 1;
  const target = chordMidi(back ? "lydian" : "bb", i);
  const m = home + (target - home) * w;
  if (w >= 1 && back) return { midi: snapLydian(m), bracket: null };
  if (w <= 0 || w >= 1) return { midi: m, bracket: null };
  const lo = Math.floor(m);
  return { midi: m, bracket: back ? lydianBracket(m) : [lo, lo + 1] };
}

/**
 * The pitch itself, with a gentle magnetic pull at each note centre.
 *
 * Between two note centres the target is warped by a smooth staircase: it
 * lingers near each note and moves quickly through the space between. How
 * strongly it lingers is powered by the cable's acceleration, on the same
 * U-curve (parabola) as the reading filter: moving gently, the pull is full —
 * the pitch creeps along note by note like a noodle dragged across a table. A
 * jolt drains it toward nothing and the pitch flies straight through (plain
 * continuous glide). The pitch then chases that warped target.
 *
 *   u    = where the target sits between its two notes (0..1)
 *   n    = 1 + strength · 6 · (1 − min(1, (accel/accelRef)²))
 *   u'   = uⁿ / (uⁿ + (1−u)ⁿ)          n = 1 → straight line, big n → steps
 */
export class PitchMagnet {
  midi = NaN;

  update(i: number, depth: number, accel: number, dt: number, out: CableNote): CableNote {
    const power = magnetPower(accel);
    const { midi: target, bracket } = cableTarget(i, depth, power);
    const M = SYNTH.magnet;

    let goal = target;
    if (bracket && M.strength > 0) {
      const [lo, hi] = bracket;
      goal = lo + (hi - lo) * linger((target - lo) / (hi - lo), 1 + M.strength * 6 * power);
    }

    if (Number.isNaN(this.midi)) this.midi = goal;
    this.midi += (goal - this.midi) * (1 - Math.exp(-M.follow * Math.min(dt, 0.1)));

    out.midi = this.midi;
    // on the D side, D Lydian chord tones ring louder than E and B
    const dSide = depth < -SYNTH.depthDead;
    out.tone = dSide && !isLydianChordTone(this.midi) ? SYNTH.nonChordLevel : 1;
    return out;
  }
}
