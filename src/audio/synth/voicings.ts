/**
 * The three chords the cables move between. Each cable picks from where it
 * hangs (see chord.ts), which follows how the phone is tilted:
 *
 *   fallen back (phone on its back)  → D Lydian        D3  F#3 B3  E4  G#5
 *   level (upright)                  → E7#9 (Hendrix)  E2  E3  G#3 D4  G5
 *   out in front (phone on its face) → Bb6add9         Bb1 D2  G2  E3  A4
 *
 * Five chord tones on cables 0–4 (low → high, so each voice glides to the
 * matching voice of the next chord), and three upper harmonics of the chord's
 * bass on cables 5–7. Chord tones are equal-tempered; the harmonics are true
 * overtones of the bass, so they sit a little off the grid (the 7th especially).
 */
export type ChordName = "lydian" | "hendrix" | "bb";

/** MIDI note numbers. */
const N = {
  E2: 40, Bb2: 46, D3: 50, E3: 52, Fs3: 54, G3: 55, Gs3: 56, B3: 59,
  D4: 62, E4: 64, G5: 79, Gs5: 80, A5: 81,
} as const;

export const CHORDS: Record<ChordName, number[]> = {
  lydian: [N.D3, N.Fs3, N.B3, N.E4, N.Gs5],
  hendrix: [N.E2, N.E3, N.Gs3, N.D4, N.G5],
  // an octave below the voicing as written, for weight
  bb: [N.Bb2, N.D3, N.G3, N.E4, N.A5].map((m) => m - 12),
};

/** Upper harmonics of the chord's bass, for cables 5–7. */
export const UPPER_HARMONICS = [5, 7, 9] as const;

export const midiToHz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
export const hzToMidi = (hz: number) => 69 + 12 * Math.log2(hz / 440);

/** Cable i's pitch in chord c, in (fractional) MIDI. */
export function chordMidi(c: ChordName, i: number): number {
  const notes = CHORDS[c];
  if (i < notes.length) return notes[i];
  const h = UPPER_HARMONICS[(i - notes.length) % UPPER_HARMONICS.length];
  return notes[0] + 12 * Math.log2(h);
}

/* ---- D Lydian: where moving cables resolve ---------------------------- */

/** D Lydian pitch classes: D E F# G# A B C#. */
const LYDIAN_SCALE = [2, 4, 6, 8, 9, 11, 1];
/** The ones that ring louder: D F# C# G# A. */
const LYDIAN_CHORD_TONES = new Set([2, 6, 1, 8, 9]);

const pc = (m: number) => ((Math.round(m) % 12) + 12) % 12;

/** Nearest D Lydian scale tone to a (fractional) MIDI pitch. */
export function snapLydian(m: number): number {
  const base = Math.floor(m);
  let best = base;
  let bestD = Infinity;
  for (let k = -2; k <= 2; k++) {
    const cand = base + k;
    if (!LYDIAN_SCALE.includes(pc(cand))) continue;
    const d = Math.abs(cand - m);
    if (d < bestD) {
      bestD = d;
      best = cand;
    }
  }
  return best;
}

export const isLydianChordTone = (m: number) => LYDIAN_CHORD_TONES.has(pc(m));

/** The D Lydian scale tones just below/at and just above a pitch: [lo, hi). */
export function lydianBracket(m: number): [number, number] {
  let lo = Math.floor(m);
  while (!LYDIAN_SCALE.includes(pc(lo))) lo--;
  let hi = lo + 1;
  while (!LYDIAN_SCALE.includes(pc(hi))) hi++;
  return [lo, hi];
}
