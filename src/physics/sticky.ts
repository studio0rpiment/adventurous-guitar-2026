import * as THREE from "three";
import { steadyGravity, worldGravity } from "@/physics/gravity";

/**
 * Sticky, weighted cables — tentacles, not strings.
 *
 * Each cable holds on to the gravity direction it last settled under. When the
 * phone turns, it stays stuck until the new pull is far enough from what it's
 * holding (its own release angle), then lets go and swings toward the new pull
 * at its own speed (heavier = slower), and sticks again once it gets there.
 * Every cable has its own weight and release angle, and the angle is re-rolled
 * each time it re-sticks — so they release one by one, never in the same order
 * twice. Shake always passes straight through, stuck or not.
 */
export const STICKY = {
  /** Global stickiness: 0 = no stick (all cables follow at once), 1 = normal, 2 = gooey. */
  stickiness: 1,
  /** Release angle range, degrees (scaled by stickiness). */
  releaseMinDeg: 10,
  releaseMaxDeg: 45,
  /** Once within this of the pull, a released cable sticks again. */
  restickDeg: 2,
  /** Cable weights (1 = normal). Heavier cables swing to the new pull more slowly and look thicker. */
  weightMin: 0.6,
  weightMax: 1.8,
  /** How fast a weight-1 cable turns toward the new pull, per second (frame-rate independent). */
  followRate: 3,
} as const;

/** Deterministic 0..1 per cable, so each keeps its character across reloads. */
const hash01 = (i: number, salt: number) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const rollRelease = () =>
  THREE.MathUtils.degToRad(
    (STICKY.releaseMinDeg + Math.random() * (STICKY.releaseMaxDeg - STICKY.releaseMinDeg)) *
      STICKY.stickiness,
  );

export interface Sticky {
  /** The steady pull this cable is holding on to (per-step units). */
  held: THREE.Vector3;
  released: boolean;
  releaseAngle: number;
  weight: number;
}

export function createSticky(index: number): Sticky {
  return {
    held: steadyGravity.clone(),
    released: false,
    releaseAngle: rollRelease(),
    weight: STICKY.weightMin + hash01(index, 1) * (STICKY.weightMax - STICKY.weightMin),
  };
}

const RESTICK = THREE.MathUtils.degToRad(STICKY.restickDeg);

/** This cable's gravity this frame → out (held pull + live shake). dt in seconds. */
export function stickyGravity(s: Sticky, dt: number, out: THREE.Vector3): THREE.Vector3 {
  const angle = s.held.angleTo(steadyGravity);
  if (!s.released && angle > s.releaseAngle) s.released = true;
  if (s.released) {
    const len = steadyGravity.length();
    const k = 1 - Math.exp((-STICKY.followRate / s.weight) * Math.min(dt, 0.1));
    s.held.lerp(steadyGravity, k).setLength(len);
    if (s.held.angleTo(steadyGravity) < RESTICK) {
      s.held.copy(steadyGravity);
      s.released = false;
      s.releaseAngle = rollRelease();
    }
  }
  // held steady pull + whatever shake is happening right now
  return out.copy(worldGravity).sub(steadyGravity).add(s.held);
}
