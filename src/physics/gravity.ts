import { DEFAULT_GRAVITY } from "@/three/cable/verlet";

/**
 * The gravity the cables feel (world space, per-step units, same scale as
 * ROPE.gravity). Module-level mutable vectors on purpose: the sensor writes
 * them on each devicemotion event and the ropes read them on the render tick,
 * with no React re-render in between.
 *
 *  - worldGravity:  steady pull + shake (what a free cable would feel)
 *  - steadyGravity: the steady pull alone (the phone's tilt, no shake)
 *
 * Each cable then feels its OWN gravity through physics/sticky.ts: it holds
 * on to an old steady direction until it lets go, plus the live shake.
 */
export const worldGravity = DEFAULT_GRAVITY.clone();
export const steadyGravity = DEFAULT_GRAVITY.clone();

/** Back to plain downward pull (physics off / permission lost). */
export function resetGravity(): void {
  worldGravity.copy(DEFAULT_GRAVITY);
  steadyGravity.copy(DEFAULT_GRAVITY);
}
