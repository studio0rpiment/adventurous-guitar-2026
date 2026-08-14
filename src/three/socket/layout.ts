export type SocketSpec = { pos: [number, number, number]; r: number; rz: number };

// 16 input sockets (two per cable). Deliberately ASYMMETRIC: the mass sits
// up-and-left and trails out toward the lower-right, spread wide with varied
// depth (z) for parallax. Tune / add / remove freely.
export const SOCKETS: SocketSpec[] = [
  { pos: [-5.8, 3.3, 2.0], r: 0.3, rz: 0.3 },
  { pos: [-5.2, 1.9, 2.6], r: 0.36, rz: -0.2 },
  { pos: [-5.6, 0.5, 1.6], r: 0.26, rz: 0.5 },
  { pos: [-4.5, 3.1, 1.3], r: 0.4, rz: 0.1 },
  { pos: [-4.1, 1.3, 2.9], r: 0.28, rz: -0.4 },
  { pos: [-3.5, 2.5, 1.9], r: 0.24, rz: 0.45 },
  { pos: [-3.1, -0.3, 2.3], r: 0.34, rz: -0.15 },
  { pos: [-2.3, 1.6, 1.2], r: 0.42, rz: 0.2 },
  { pos: [-1.5, 3.0, 2.1], r: 0.26, rz: -0.5 },
  { pos: [-0.7, 0.3, 2.5], r: 0.32, rz: 0.35 },
  { pos: [0.5, 2.1, 1.5], r: 0.3, rz: -0.3 },
  { pos: [1.7, -0.9, 2.2], r: 0.36, rz: 0.15 },
  { pos: [2.9, 1.1, 1.7], r: 0.28, rz: -0.45 },
  { pos: [3.7, -1.9, 2.4], r: 0.34, rz: 0.3 },
  { pos: [4.6, -0.5, 1.6], r: 0.24, rz: -0.1 },
  { pos: [5.2, -2.5, 2.0], r: 0.3, rz: 0.5 },
];
