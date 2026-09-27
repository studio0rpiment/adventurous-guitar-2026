/**
 * Feel knobs for the cable synth. Displacements are in world units, measured as
 * the cable's centre of mass away from where it has been resting lately.
 */
export const SYNTH = {
  /**
   * How far a cable's centre must hang in front of / behind its plugs (z,
   * toward/away from the screen) for the full pitch bend. z rather than x:
   * when a phone rotates, "sideways" swaps with "up", but toward/away from the
   * screen stays the same axis. Behind = down, in front = up.
   */
  dispZ: 1.2,
  /** Vertical (y) displacement that reaches full square wave. */
  dispY: 0.8,
  /** Total displacement that counts as "all the motion there is". */
  dispMag: 1.0,
  /**
   * Max pitch bend either way, in cents (100 = one semitone). A just minor
   * third (6:5, ~316 cents): full bend lands exactly ×6/5 up or ×5/6 down.
   */
  bendCents: 1200 * Math.log2(6 / 5),

  /**
   * How motion maps to loudness.
   *  - "direct":  motion = amplitude. Still = silent, more motion = louder.
   *  - "inverse": still = loudest, more motion = quieter; settling swells back.
   *  - "swell":   silent at rest, loudest at small controlled motion, quieter
   *               again as it gets wild.
   */
  response: "direct" as "direct" | "inverse" | "swell",
  /** Curve on the response (>1 = more of the range stays loud / small motion speaks up). */
  responseCurve: 1.5,

  /** Seconds-ish smoothing (setTargetAtTime time constants). */
  tauPitch: 0.04,
  tauShape: 0.06,
  tauRise: 0.08, // getting louder: quick, so motion speaks right away
  tauFall: 0.6, // getting quieter: slow, so it rings out as the cable settles

  /** How fast the "rest" position follows the cable (per frame, 0..1). */
  restFollow: 0.02,

  /** Output. */
  master: 0.14,
  lowpassHz: 4200,
} as const;
