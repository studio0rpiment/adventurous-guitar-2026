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
  const n = pts.length;
  const a = pts[0].p;
  const b = pts[n - 1].p;
  let cz = 0;
  for (let i = 1; i < n - 1; i++) cz += pts[i].p.z;
  cz /= Math.max(1, n - 2);
  const gap = a.distanceTo(b);
  const slack = Math.max(0.1, restLen - gap);
  const reach = 0.6 * Math.sqrt((3 * Math.max(gap, 0.5) * slack) / 8);
  return clamp((cz - (a.z + b.z) / 2) / reach, -1, 1);
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
 * The cable's acceleration (change in speed) drives both filters.
 */
export class CableReading {
  depth = 0;
  level = 0;
  private lastSpeed = 0;
  /** The cable's acceleration right now (lightly smoothed), world units / s². */
  accel = 0;
  private depthF = new AdaptiveLowpass();
  private speedF = new AdaptiveLowpass();

  update(pts: RopePoint[], restLen: number, dt: number) {
    const d = Math.max(dt, 1e-3);
    const speed = measureSpeed(pts, d);
    // acceleration, lightly smoothed so one noisy frame doesn't open the filter
    const rawAccel = Math.abs(speed - this.lastSpeed) / d;
    this.lastSpeed = speed;
    this.accel += (rawAccel - this.accel) * 0.5;

    this.depth = this.depthF.update(measureDepth(pts, restLen), this.accel, d, SYNTH.filter);
    const s = this.speedF.update(speed, this.accel, d, SYNTH.filter);
    const m = (s - SYNTH.speedFloor) / (SYNTH.speedFull - SYNTH.speedFloor);
    this.level = motionToLevel(clamp(m, 0, 1));
  }
}
