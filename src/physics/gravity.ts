import { DEFAULT_GRAVITY } from "@/three/cable/verlet";

/**
 * The one gravity vector every cable reads on its sim step (world space,
 * per-step units, same scale as ROPE.gravity). It's a mutable module-level
 * vector on purpose: the sensor writes it on each devicemotion event and the
 * rope reads it on the render tick, with no React re-render in between.
 */
export const worldGravity = DEFAULT_GRAVITY.clone();

/** Back to plain downward pull (physics off / permission lost). */
export function resetGravity(): void {
  worldGravity.copy(DEFAULT_GRAVITY);
}
