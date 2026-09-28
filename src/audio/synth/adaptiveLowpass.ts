/**
 * A low-pass whose speed follows the motion — slow when the cable is slow,
 * instant when it's jolted. (Same idea as the "1€ filter" used for jittery
 * sensor input.)
 *
 * Each update smooths the raw reading with a one-pole low-pass whose cutoff
 * rides a U-shaped curve (a parabola) on the cable's ACCELERATION:
 *
 *   cutoff = fcMin + (fcMax − fcMin) · min(1, (accel / accelRef)²)
 *
 * Gentle motion → near fcMin: the reading drifts, so slow feels slow. A sudden
 * jerk → the square shoots the cutoff up toward fcMax: the sound snaps to it.
 * The square is what makes the middle stay calm and the extremes react.
 */
export interface LowpassShape {
  /** Cutoff when the cable is barely accelerating (Hz). Lower = lazier. */
  fcMin: number;
  /** Cutoff at a hard jolt (Hz). Higher = snappier. */
  fcMax: number;
  /** Acceleration (world units / s²) that opens the filter all the way. */
  accelRef: number;
}

export class AdaptiveLowpass {
  value: number;
  private primed = false;

  constructor(initial = 0) {
    this.value = initial;
  }

  /** raw: new reading; accel: the cable's acceleration now; dt: seconds. */
  update(raw: number, accel: number, dt: number, shape: LowpassShape): number {
    if (!this.primed) {
      this.value = raw;
      this.primed = true;
      return raw;
    }
    const t = Math.min(1, (accel / shape.accelRef) ** 2);
    const fc = shape.fcMin + (shape.fcMax - shape.fcMin) * t;
    const tau = 1 / (2 * Math.PI * fc);
    const a = dt / (tau + dt);
    this.value += (raw - this.value) * a;
    return this.value;
  }
}
