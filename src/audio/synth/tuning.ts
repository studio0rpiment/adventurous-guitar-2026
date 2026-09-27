/**
 * The chord the cables drone. Just intonation: every voice is a whole-number
 * harmonic of its root, and the two roots are a just whole step apart — so it
 * stays out of tune on purpose: two overtone series rubbing against each other.
 *
 * Same rule for both roots: the ODD harmonics (1 3 5 7 — the series with the
 * octave doublings skipped). Half the cables sit on E, half on D, interleaved
 * so each root is spread across the socket field. Order = cable order in
 * PatchCables' PAIRS.
 */
export const E_HZ = 82.41; // E2
export const D_HZ = E_HZ * (8 / 9); // D2, a just 9:8 below E (~73.25 Hz)

export interface VoiceTuning {
  root: number;
  harmonic: number;
}

const ODD = [1, 3, 5, 7] as const;

export const VOICES: VoiceTuning[] = ODD.flatMap((h) => [
  { root: E_HZ, harmonic: h },
  { root: D_HZ, harmonic: h },
]);

export const voiceHz = (i: number): number => {
  const v = VOICES[i % VOICES.length];
  return v.root * v.harmonic;
};
