import * as THREE from "three";

/** World length of the jack's long axis after normalization. */
export const TARGET_LEN = 1.75;

/** The jack's long axis in its local frame; +Z is the cable-exit (barrel) end. */
export const JACK_AXIS = new THREE.Vector3(0, 0, 1);

/** Where the cable meets the plug, in the jack's local (normalized) frame. */
export const EXIT_LOCAL = new THREE.Vector3(0, 0, TARGET_LEN / 2);

/** Path to the jack model in /public. */
export const JACK_MODEL_URL = "/models/guitarCableJack.glb";

/** Verlet rope tuning. */
export const ROPE = {
  count: 26,
  restTotal: 8.4, // > end-to-end distance so it sags
  gravity: -0.014,
  damping: 0.98,
  iterations: 18,
  radius: 0.075,
  tubeSegments: 54,
  tubeRadial: 10,
} as const;

/** Default rest positions of the two ends. */
export const END_A = new THREE.Vector3(-3.3, 1.2, 0);
export const END_B = new THREE.Vector3(3.3, 1.2, 0);
