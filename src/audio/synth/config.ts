/**
 * Feel knobs for the cable synth. Displacements are in world units, measured as
 * the cable's centre of mass away from where it has been resting lately.
 */
export const SYNTH = {
  /* ---- chord from phone tilt (physics/gravity.ts deviceTilt, −1..1) ---- */
  /** Below this much tilt it's the upright chord (E7#9). */
  tiltDead: 0.3,
  /** At/above this much tilt it's fully the flat chord (D Lydian / Bb6add9). */
  tiltFull: 0.8,
  /* In between, every voice glides from one chord to the other. */

  /* ---- D Lydian wandering ---- */
  /** Sideways (x) sway that counts as a full wander. */
  dispX: 0.8,
  /** Depth (z) sway that counts as a full wander. */
  dispZ: 0.8,
  /**
   * How far (semitones) a moving cable can wander from its chord tone, x + z
   * together. It then resolves to the nearest D Lydian scale tone.
   */
  wanderSemis: 5,
  /** Level of D Lydian non-chord tones (E, B) vs. chord tones (D F# C# G# A). */
  nonChordLevel: 0.45,

  /* ---- loudness ---- */
  /** Total displacement that counts as "all the motion there is". */
  dispMag: 1.0,
  /**
   * How motion maps to loudness.
   *  - "direct":  motion = amplitude. Still = silent, more motion = louder.
   *  - "inverse": still = loudest, more motion = quieter; settling swells back.
   *  - "swell":   silent at rest, loudest at small controlled motion, quieter
   *               again as it gets wild.
   */
  response: "direct" as "direct" | "inverse" | "swell",
  /** Curve on the response (>1 = small motion speaks up more). */
  responseCurve: 1.5,
  /** Upper-harmonic cables (5–7) sit this much under the chord tones. */
  harmonicLevel: 0.55,

  /** Seconds-ish smoothing (setTargetAtTime time constants). */
  tauPitch: 0.05,
  tauTone: 0.08,
  tauRise: 0.08, // getting louder: quick, so motion speaks right away
  tauFall: 0.6, // getting quieter: slow, so it rings out as the cable settles

  /** How fast the "rest" position follows the cable (per frame, 0..1). */
  restFollow: 0.02,

  /** Output. */
  master: 0.12,
  lowpassHz: 4200,
} as const;
