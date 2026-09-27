/**
 * Feel knobs for the cable synth. Displacements are in world units, measured as
 * the cable's centre of mass away from where it has been resting lately.
 */
export const SYNTH = {
  /** Sideways (x) displacement that reaches the full pitch bend. */
  dispX: 0.8,
  /** Vertical (y) displacement that reaches full square wave. */
  dispY: 0.8,
  /** Total displacement that counts as "all the motion there is". */
  dispMag: 1.0,
  /** Max pitch bend either way, in cents (100 = one semitone). */
  bendCents: 100,

  /**
   * How motion maps to loudness.
   *  - "inverse": still = loudest, more motion = quieter; settling swells back.
   *  - "swell":   silent at rest, loudest at small controlled motion, quieter
   *               again as it gets wild.
   */
  response: "inverse" as "inverse" | "swell",
  /** Curve on the response (>1 = more of the range stays loud). */
  responseCurve: 1.5,

  /** Seconds-ish smoothing (setTargetAtTime time constants). */
  tauPitch: 0.04,
  tauShape: 0.06,
  tauRise: 0.6, // getting louder: slow, so it swells
  tauFall: 0.08, // getting quieter: quick, so a shake ducks it

  /** How fast the "rest" position follows the cable (per frame, 0..1). */
  restFollow: 0.02,

  /** Output. */
  master: 0.18,
  lowpassHz: 4200,
} as const;
