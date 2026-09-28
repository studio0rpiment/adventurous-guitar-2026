/**
 * Feel knobs for the cable synth. Displacements are in world units, measured as
 * the cable's centre of mass away from where it has been resting lately.
 */
export const SYNTH = {
  /* ---- chord from the cable's own depth ----
   * Each cable reads where IT hangs: its middle behind its plugs (fallen back)
   * → D Lydian, level with them → E7#9, out in front → low Bb. Depth is
   * measured as a fraction (−1..1) of how far that cable's slack can reach. */
  /** Below this much depth it's the upright chord (E7#9). */
  depthDead: 0.25,
  /** At/above this much depth it's fully the flat chord (D Lydian / Bb). */
  depthFull: 0.8,
  /**
   * How a voice travels between chords:
   *  - "steps":  walks note by note — through D Lydian scale tones on the
   *              D side, by semitones on the Bb side.
   *  - "smooth": glides continuously.
   */
  travel: "smooth" as "steps" | "smooth",
  /**
   * Sticky notes (with travel "smooth"): a gliding voice snags on the note
   * points along its path — D Lydian scale tones on the D side, semitones on
   * the Bb side — holds there until the glide has pulled past it by its catch
   * (semitones, random per snag, scaled by noteStickiness), then slips on.
   * 0 = pure glide.
   */
  noteStickiness: 1,
  catchMin: 0.3,
  catchMax: 1.0,
  /** How close the glide must pass a note point to snag on it (semitones). */
  snagRadius: 0.12,
  /** Glide time when a voice slips off a note (seconds-ish). */
  tauSlip: 0.12,
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
