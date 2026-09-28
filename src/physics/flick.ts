/**
 * Flick detection: one excursion of the phone's rotation toward or away from
 * you, recognised on its FIRST lobe, so a note changes the moment the flick
 * starts rather than after it ends.
 *
 * Why not DTW or a trained model: we only need two gestures on one axis. Both
 * of those compare a whole gesture after it has finished (added latency — bad
 * for playing) and need templates or training data. A flick is a sharp spike
 * in rotation rate; a threshold with hysteresis and a short refractory catches
 * it on the way up and ignores the rebound.
 *
 * Signal: the gyroscope's rotation rate about the phone's own x axis (the axis
 * across the screen) — a wrist flick is a rotation, and the gyro reads it
 * cleanly with no gravity in it, whatever way the phone is held. Top edge
 * tipping toward you = +, away = −. If a device has no gyro, fall back to
 * linear acceleration along the screen's normal (toward your face = +).
 *
 * Event-driven: fed by devicemotion events; the refractory period is timed off
 * the events' own timestamps, not a timer.
 */
export const FLICK = {
  /** Rotation rate (deg/s) that counts as a flick. */
  onDegPerSec: 220,
  /** Must settle back under this (deg/s) before the next flick can fire. */
  offDegPerSec: 60,
  /** Fallback (no gyro): linear acceleration that counts as a flick (m/s²). */
  onAccel: 7,
  offAccel: 2,
  /** Ignore everything for this long after a flick (ms) — swallows the rebound. */
  refractoryMs: 220,
  /** Flip if toward/away come out backwards on a device. */
  invert: false,
} as const;

/** +1 = flicked toward you (down the scale), −1 = flicked away (up the scale). */
export type FlickDir = 1 | -1;

export class FlickDetector {
  private armed = true;
  private lockUntil = 0;

  /** Returns a direction when a flick starts, else null. */
  feed(e: DeviceMotionEvent): FlickDir | null {
    const rr = e.rotationRate;
    let v: number | null = null;
    let on = 0;
    let off = 0;
    if (rr && rr.beta != null) {
      v = rr.beta;
      on = FLICK.onDegPerSec;
      off = FLICK.offDegPerSec;
    } else if (e.acceleration && e.acceleration.z != null) {
      v = e.acceleration.z;
      on = FLICK.onAccel;
      off = FLICK.offAccel;
    }
    if (v == null) return null;
    if (FLICK.invert) v = -v;

    const now = e.timeStamp;
    if (now < this.lockUntil) return null;
    if (!this.armed) {
      if (Math.abs(v) < off) this.armed = true;
      return null;
    }
    if (Math.abs(v) > on) {
      this.armed = false;
      this.lockUntil = now + FLICK.refractoryMs;
      return v > 0 ? 1 : -1;
    }
    return null;
  }
}
