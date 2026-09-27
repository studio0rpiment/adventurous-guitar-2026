import { DEFAULT_GRAVITY } from "@/three/cable/verlet";

/**
 * The one gravity vector every cable reads on its sim step (world space,
 * per-step units, same scale as ROPE.gravity). It's a mutable module-level
 * vector on purpose: the sensor writes it on each devicemotion event and the
 * rope reads it on the render tick, with no React re-render in between.
 */
export const worldGravity = DEFAULT_GRAVITY.clone();

/**
 * The phone's steady tilt, smoothed (no shake): z of the smoothed gravity, in g.
 * −1 = flat on its back (screen up), 0 = upright, +1 = flat on its face. The
 * cable synth picks its chord from this. Stays 0 on desktop / physics off.
 */
export const deviceTilt = { z: 0 };

/** Back to plain downward pull, upright tilt (physics off / permission lost). */
export function resetGravity(): void {
  worldGravity.copy(DEFAULT_GRAVITY);
  deviceTilt.z = 0;
}
