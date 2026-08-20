import * as THREE from "three";

const proj = new THREE.Vector3();

/**
 * Distance in CSS pixels between a world-space point's screen projection and a
 * pointer position.
 *
 * The project-then-measure math lived in two places — ConnectionContext's
 * `nearestSocket` and PatchCable's seat check — and both were answering the
 * same question ("how close is the pointer to this socket on screen?"), so
 * this is that question as one function. Uses a module-scoped scratch vector:
 * it runs inside pointermove handlers, where per-call allocation adds up.
 */
export function screenDistance(
  world: THREE.Vector3,
  camera: THREE.Camera,
  width: number,
  height: number,
  px: number,
  py: number,
): number {
  proj.copy(world).project(camera);
  const sx = (proj.x * 0.5 + 0.5) * width;
  const sy = (-proj.y * 0.5 + 0.5) * height;
  return Math.hypot(sx - px, sy - py);
}
