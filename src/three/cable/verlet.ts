import * as THREE from "three";
import { ROPE } from "./constants";

export interface RopePoint {
  p: THREE.Vector3;
  prev: THREE.Vector3;
  pinned: boolean;
}

/** Build a rope of points evenly spaced between the two ends (ends pinned). */
export function createRope(a: THREE.Vector3, b: THREE.Vector3): RopePoint[] {
  const pts: RopePoint[] = [];
  for (let i = 0; i < ROPE.count; i++) {
    const t = i / (ROPE.count - 1);
    const p = new THREE.Vector3().lerpVectors(a, b, t);
    pts.push({ p: p.clone(), prev: p.clone(), pinned: i === 0 || i === ROPE.count - 1 });
  }
  return pts;
}

const SEG = ROPE.restTotal / (ROPE.count - 1);

/**
 * One Verlet integration + constraint-relaxation step. The two ends are held at
 * the supplied anchors; interior points fall under gravity and settle. This runs
 * on the render tick (the one place a continuous sim legitimately needs a tick);
 * the grab that moves the anchors is event-driven.
 */
export function stepRope(
  pts: RopePoint[],
  anchorA: THREE.Vector3,
  anchorB: THREE.Vector3,
): void {
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const q = pts[i];
    if (q.pinned) continue;
    const vx = (q.p.x - q.prev.x) * ROPE.damping;
    const vy = (q.p.y - q.prev.y) * ROPE.damping;
    const vz = (q.p.z - q.prev.z) * ROPE.damping;
    q.prev.copy(q.p);
    q.p.x += vx;
    q.p.y += vy + ROPE.gravity;
    q.p.z += vz;
  }
  pts[0].p.copy(anchorA);
  pts[0].prev.copy(anchorA);
  pts[n - 1].p.copy(anchorB);
  pts[n - 1].prev.copy(anchorB);
  for (let k = 0; k < ROPE.iterations; k++) {
    for (let i = 0; i < n - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const dx = b.p.x - a.p.x;
      const dy = b.p.y - a.p.y;
      const dz = b.p.z - a.p.z;
      const d = Math.hypot(dx, dy, dz) || 1e-6;
      const diff = (d - SEG) / d;
      const mA = a.pinned ? 0 : b.pinned ? 1 : 0.5;
      const mB = b.pinned ? 0 : a.pinned ? 1 : 0.5;
      a.p.x += dx * diff * mA;
      a.p.y += dy * diff * mA;
      a.p.z += dz * diff * mA;
      b.p.x -= dx * diff * mB;
      b.p.y -= dy * diff * mB;
      b.p.z -= dz * diff * mB;
    }
  }
}
