/**
 * The chord the cables drone. Just intonation: every note is a whole-number
 * harmonic of its root, and the two roots are a just whole step apart — so it
 * stays out of tune on purpose: two overtone series rubbing against each other.
 *
 * Same rule for both roots: the ODD harmonics 1–15 (the series with the octave
 * doublings skipped). Eight cables, sixteen notes: each cable plays a lower
 * harmonic together with its upper partner (1+9, 3+11, 5+13, 7+15). Half the
 * cables sit on E, half on D, interleaved so each root is spread across the
 * socket field. Order = cable order in PatchCables' PAIRS.
 */
import type { VoiceNote } from "@/audio/synth/CableVoice";

export const E_HZ = 82.41; // E2
export const D_HZ = E_HZ * (8 / 9); // D2, a just 9:8 below E (~73.25 Hz)

/** Lower odd harmonic → upper odd partner, one pair per cable per root. */
const PAIRS: [number, number][] = [
  [1, 9],
  [3, 11],
  [5, 13],
  [7, 15],
];

export interface VoiceTuning {
  root: number;
  harmonics: number[];
}

export const VOICES: VoiceTuning[] = PAIRS.flatMap((hs) => [
  { root: E_HZ, harmonics: hs },
  { root: D_HZ, harmonics: hs },
]);

/** Higher harmonics sit lower in level so the chord doesn't go shrill. */
export const voiceNotes = (i: number): VoiceNote[] => {
  const v = VOICES[i % VOICES.length];
  return v.harmonics.map((h) => ({ hz: v.root * h, amp: 1 / Math.sqrt(h) }));
};
