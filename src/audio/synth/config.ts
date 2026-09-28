/**
 * Feel knobs for the cable synth. Everything is read off the cables themselves
 * (their depth and speed), in world units.
 */
export const SYNTH = {
  /* ---- chord from the cable's own depth ----
   * Each cable reads where IT hangs: its middle behind its plugs (fallen back)
   * → D Lydian, level with them → E7#9, out in front → low Bb. Depth is
   * measured as a fraction (−1..1) of how far that cable's slack can reach. */
  /** Below this much depth it's the upright chord (E7#9). */
  depthDead: 0.25,
  /** At/above this much depth it's fully the flat chord (D Lydian / Bb). */
  depthFull: 0.7,
  /**
   * Magnetic note centres. Along its path a voice's pitch is pulled gently
   * toward each note it passes (D Lydian scale tones on the D side, semitones
   * on the Bb side) and slowed there. The pull fades as the cable accelerates
   * — same parabola as the reading filter — so gentle motion creeps past each
   * note and a whip flies straight through. See chord.ts PitchMagnet.
   */
  magnet: {
    /** 0 = no pull (pure glide), 1 = strong (almost stepwise when moving gently). */
    strength: 0.6,
    /** How fast the pitch chases its (warped) target, per second. */
    follow: 14,
    /** Cable acceleration (world units / s²) at which the magnet lets go. */
    accelRef: 20,
  },
  /** Level of D Lydian non-chord tones (E, B) vs. chord tones (D F# C# G# A). */
  nonChordLevel: 0.45,

  /* ---- reading the cable ---- */
  /**
   * Adaptive low-pass on everything read from a cable (depth → pitch, speed →
   * loudness). Its cutoff rides a parabola on the cable's acceleration: slow
   * motion is heard slowly, a jolt snaps through. See adaptiveLowpass.ts.
   */
  filter: {
    fcMin: 0.8, // Hz — gentle motion: lazy, drifting
    fcMax: 25, // Hz — hard jolt: immediate
    accelRef: 30, // world units / s² that fully opens it
  },

  /* ---- loudness ---- */
  /** Cable speed (world units / s) that counts as full volume. */
  speedFull: 3,
  /** Below this speed a cable is silent (gates out tiny settling jitter). */
  speedFloor: 0.08,
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

  /**
   * Seconds-ish de-zipper smoothing on the audio params. Kept tiny: the
   * adaptive filter above already decides how fast things move.
   */
  tauPitch: 0.02,
  tauTone: 0.05,
  tauRise: 0.02,
  tauFall: 0.04,

  /** Output. */
  master: 0.12,
  lowpassHz: 4200,
} as const;
