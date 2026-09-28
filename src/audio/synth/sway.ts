import type { RopePoint } from "@/three/cable/verlet";
import { SYNTH } from "@/audio/synth/config";
import { AdaptiveLowpass } from "@/audio/synth/adaptiveLowpass";

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * How fast the cable is actually moving right now: the mean speed of its
 * interior points (world units / s), straight from the Verlet state (p − prev
 * is this step's motion).
 */
export function measureSpeed(pts: RopePoint[], dt: number): number {
  const n = pts.length;
  let s = 0;
  for (let i = 1; i < n - 1; i++) s += pts[i].p.distanceTo(pts[i].prev);
  return s / Math.max(1, n - 2) / Math.max(dt, 1e-3);
}

/**
 * How far this cable's middle hangs in front of (+) or behind (−) the line
 * between its plugs, as a fraction of how far its slack can reach (−1..1).
 * Upright ≈ 0; phone flat on its back → toward −1; on its face → toward +1.
 * Reach: a rope of length L across a gap d sags about √(3·d·(L−d)/8); its
 * centre of mass sits a bit short of that.
 */
export function measureDepth(pts: RopePoint[], restLen: number): number {
  return measureOffset(pts, restLen, "z");
}

/**
 * How far this cable's middle has swung sideways (x) from the line between its
 * plugs, same units as measureDepth (−1..1). Tilting the phone left or right
 * (rolling it) swings the cables that way.
 */
export function measureLean(pts: RopePoint[], restLen: number): number {
  return measureOffset(pts, restLen, "x");
}

/** Centre of mass vs. the plugs' midpoint along one axis, as a fraction of the slack's reach. */
function measureOffset(pts: RopePoint[], restLen: number, axis: "x" | "z"): number {
  const n = pts.length;
  const a = pts[0].p;
  const b = pts[n - 1].p;
  let c = 0;
  for (let i = 1; i < n - 1; i++) c += pts[i].p[axis];
  c /= Math.max(1, n - 2);
  const gap = a.distanceTo(b);
  const slack = Math.max(0.1, restLen - gap);
  const reach = 0.6 * Math.sqrt((3 * Math.max(gap, 0.5) * slack) / 8);
  return clamp((c - (a[axis] + b[axis]) / 2) / reach, -1, 1);
}

/** Sideways lean (−1..1) → volume multiplier: full near centre, fading to silence at the extremes. */
export function leanToGain(lean: number): number {
  const t = clamp((Math.abs(lean) - SYNTH.leanDead) / (SYNTH.leanSilent - SYNTH.leanDead), 0, 1);
  return 1 - t * t * (3 - 2 * t);
}

/** Motion (0..1) → loudness (0..1), per SYNTH.response. */
export function motionToLevel(m: number): number {
  if (SYNTH.response === "direct") return Math.pow(m, 1 / SYNTH.responseCurve);
  if (SYNTH.response === "swell") {
    // 0 at rest, peak at m = 0.25, easing down toward wild motion
    const t = m / 0.25;
    return t <= 1 ? Math.pow(t, 0.7) : Math.pow(1 - (m - 0.25) / 0.75, SYNTH.responseCurve);
  }
  return 1 - Math.pow(m, 1 / SYNTH.responseCurve);
}

/**
 * Everything the synth hears from one cable, read off the cable itself each
 * frame and passed through adaptive low-passes (slow when the cable is slow,
 * snapping on a jolt — see adaptiveLowpass.ts):
 *   - depth → which chord / where along the path (pitch)
 *   - speed → loudness
 *   - sideways lean → loudness too: leaned far left or right fades to silence
 * The cable's acceleration (change in speed) drives all the filters.
 */
export class CableReading {
  depth = 0;
  level = 0;
  private lastSpeed = 0;
  /** The cable's acceleration right now (lightly smoothed), world units / s². */
  accel = 0;
  private depthF = new AdaptiveLowpass();
  private speedF = new AdaptiveLowpass();
  private leanF = new AdaptiveLowpass();
  /**
   * A cable's natural sideways offset when the phone ISN'T tilted sideways: a
   * cable between plugs at different heights hangs lopsided, so its centre sits
   * off the plugs' midpoint on its own. Learned while the phone is level
   * side-to-side and the cable is still; lean is measured from there.
   */
  private leanBase: number | null = null;

  /** levelSideways: the phone isn't tilted left/right right now (see physics/gravity.ts). */
  update(pts: RopePoint[], restLen: number, dt: number, levelSideways: boolean) {
    const d = Math.max(dt, 1e-3);
    const speed = measureSpeed(pts, d);
    // acceleration, lightly smoothed so one noisy frame doesn't open the filter
    const rawAccel = Math.abs(speed - this.lastSpeed) / d;
    this.lastSpeed = speed;
    this.accel += (rawAccel - this.accel) * 0.5;

    this.depth = this.depthF.update(measureDepth(pts, restLen), this.accel, d, SYNTH.filter);
    const s = this.speedF.update(speed, this.accel, d, SYNTH.filter);
    const m = (s - SYNTH.speedFloor) / (SYNTH.speedFull - SYNTH.speedFloor);
    const rawLean = measureLean(pts, restLen);
    if (this.leanBase === null) this.leanBase = rawLean;
    else if (levelSideways && speed < SYNTH.speedFloor * 3)
      this.leanBase += (rawLean - this.leanBase) * Math.min(1, d * 2);
    const lean = this.leanF.update(rawLean - this.leanBase, this.accel, d, SYNTH.filter);
    this.level = motionToLevel(clamp(m, 0, 1)) * leanToGain(lean);
  }
}
