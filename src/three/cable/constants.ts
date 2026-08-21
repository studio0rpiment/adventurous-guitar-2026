import * as THREE from "three";

/** World length of the jack's long axis after normalization. */
export const TARGET_LEN = 1.75;

/** The jack's long axis in its local frame; +Z is the cable-exit (barrel) end. */
export const JACK_AXIS = new THREE.Vector3(0, 0, 1);

/** Where the cable meets the plug, in the jack's local (normalized) frame. */
export const EXIT_LOCAL = new THREE.Vector3(0, 0, TARGET_LEN / 2);

/* The jack used to be a downloaded .glb. It's now spun from its own profile in
   cable/plugProfile.ts — see docs/ASSET-PROVENANCE.md for why, but the short
   version is that the model was licensed for editorial use only and a plug is a
   turned part we can measure. Nothing here changed: same length, same axis,
   same exit point, so PatchCable never noticed. */

/** Verlet rope tuning. */
export const ROPE = {
  count: 26,
  gravity: -0.014,
  damping: 0.98,
  iterations: 18,
  radius: 0.075,
  tubeSegments: 54,
  tubeRadial: 10,
} as const;
