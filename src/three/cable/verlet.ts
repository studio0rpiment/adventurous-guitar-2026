import * as THREE from "three";
import { ROPE } from "./constants";

export interface RopePoint {
  p: THREE.Vector3;
  prev: THREE.Vector3;
  pinned: boolean;
}

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
  seg: number,
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
  if (pts[0].pinned) {
    pts[0].p.copy(anchorA);
    pts[0].prev.copy(anchorA);
  }
  if (pts[n - 1].pinned) {
    pts[n - 1].p.copy(anchorB);
    pts[n - 1].prev.copy(anchorB);
  }
  for (let k = 0; k < ROPE.iterations; k++) {
    for (let i = 0; i < n - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const dx = b.p.x - a.p.x;
      const dy = b.p.y - a.p.y;
      const dz = b.p.z - a.p.z;
      const d = Math.hypot(dx, dy, dz) || 1e-6;
      const diff = (d - seg) / d;
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

/**
 * Build a cable draped between two fixed points a and b, both ends pinned. The
 * rope is `restLen` long (pass > |a-b| so it sags); points start along a gentle
 * parabola so it drapes immediately, then gravity settles it. Pair with
 * stepRope(pts, a, b, restLen/(count-1)).
 */
export function createDrapedRope(
  a: THREE.Vector3,
  b: THREE.Vector3,
  restLen: number,
): RopePoint[] {
  const n = ROPE.count;
  const d = a.distanceTo(b);
  const sag = Math.max(0, restLen - d) * 0.5; // initial droop
  const pts: RopePoint[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const p = new THREE.Vector3().lerpVectors(a, b, t);
    p.y -= sag * Math.sin(Math.PI * t);
    pts.push({ p: p.clone(), prev: p.clone(), pinned: i === 0 || i === n - 1 });
  }
  return pts;
}
