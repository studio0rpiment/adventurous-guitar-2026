/**
 * The chord the cables drone. Just intonation: every voice is a whole-number
 * multiple of one fundamental, so the intervals are the overtone series itself.
 *
 * Start: low E and its ODD harmonics — the series with the octave doublings
 * skipped (2, 4, 6, 8 … are just octaves of 1, 3 …). Eight cables, eight
 * voices: 1 3 5 7 9 11 13 15.
 *
 * Stand-in for the opening chord of Branca's Symphony No. 5 — swap HARMONICS
 * (or BASE_HZ) for the real voicing once it's transcribed. Order = cable order
 * in PatchCables' PAIRS.
 */
export const BASE_HZ = 82.41; // E2

export const HARMONICS = [1, 3, 5, 7, 9, 11, 13, 15] as const;

export const voiceHz = (i: number): number =>
  BASE_HZ * HARMONICS[i % HARMONICS.length];
