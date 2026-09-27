import type { RopePoint } from "@/three/cable/verlet";
import { SYNTH } from "@/audio/synth/config";

/** Per-cable memory: where it has been resting lately. */
export interface SwayState {
  rx: number;
  ry: number;
  rz: number;
  primed: boolean;
}

export const createSwayState = (): SwayState => ({ rx: 0, ry: 0, rz: 0, primed: false });

export interface Sway {
  /** Depth displacement (toward the viewer +), -1..1 (signed). */
  z: number;
  /** Vertical displacement, 0..1 (how far, either way). */
  y: number;
  /** Total displacement, 0..1. */
  mag: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * How far a cable's centre of mass sits from where it has been resting. The rest
 * point is a slow follower of the centre, so a cable that settles somewhere new
 * (replugged, phone tilted) reads as still again after a moment. Pure: reads
 * the rope, updates `s` in place.
 */
export function measureSway(pts: RopePoint[], s: SwayState, out: Sway): Sway {
  let cx = 0;
  let cy = 0;
  let cz = 0;
  const n = pts.length;
  for (let i = 1; i < n - 1; i++) {
    cx += pts[i].p.x;
    cy += pts[i].p.y;
    cz += pts[i].p.z;
  }
  const k = 1 / Math.max(1, n - 2);
  cx *= k;
  cy *= k;
  cz *= k;

  if (!s.primed) {
    s.rx = cx;
    s.ry = cy;
    s.rz = cz;
    s.primed = true;
  }
  const dx = cx - s.rx;
  const dy = cy - s.ry;
  const dz = cz - s.rz;
  s.rx += dx * SYNTH.restFollow;
  s.ry += dy * SYNTH.restFollow;
  s.rz += dz * SYNTH.restFollow;

  out.z = clamp(dz / SYNTH.dispZ, -1, 1);
  out.y = clamp(Math.abs(dy) / SYNTH.dispY, 0, 1);
  out.mag = clamp(Math.hypot(dx, dy, dz) / SYNTH.dispMag, 0, 1);
  return out;
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
