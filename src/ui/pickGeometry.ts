import { NAV_ITEMS } from "@/config/nav";

/**
 * Geometry of the pick hub and its fan.
 *
 * Pulled out of PickMenu because the mobile nav bar needs the SAME numbers:
 * when the pick opens, the nav items fly into the fan's label slots, and they
 * can only land exactly on them if both are reading one set of coordinates.
 */

/* Overall size of the pick + fan. Everything below is expressed in base units
   and multiplied by S, so nudging the hub's scale is a one-number change.
   1.157625 = three 5% bumps up from the original 1.0. */
export const S = 1.157625;

/* Fan geometry (px, relative to the container's top-left). Each leader is an
   angled line from ORIGIN to a bend, then a horizontal shelf to the label. */
const TIP_X = 40 * S;
const TIP_Y = 24 * S;
const START_R = 11 * S;
const TOP_Y = 6 * S;
const ROW = 24 * S;
const RIGHT_X = 116 * S;
const X_STEP = 20 * S;
const SHELF = 16 * S;

/** Gap between the end of a leader line and its label. */
export const LABEL_GAP = 5;

/* Pick, wordmark and label sizes — same scale factor. */
export const PICK_SIZE = `${3 * S}rem`;
export const PLATE_H = `${3.9 * S}rem`;
export const WORDMARK_W = `clamp(${4.5 * S}rem, ${24 * S}vw, ${7.5 * S}rem)`;
export const LABEL_SIZE = `clamp(${0.5 * S}rem, ${2.1 * S}vw, ${0.6 * S}rem)`;

export const SPOKES = NAV_ITEMS.map((it, i) => {
  const ly = TOP_Y + i * ROW;
  const lx = RIGHT_X - i * X_STEP;
  const bx = lx - SHELF;
  const dx = bx - TIP_X;
  const dy = ly - TIP_Y;
  const len = Math.hypot(dx, dy) || 1;
  const sx = TIP_X + (dx / len) * START_R;
  const sy = TIP_Y + (dy / len) * START_R;
  return { ...it, lx, ly, bx, sx, sy };
});

export const FAN_W = 240 * S;
export const FAN_H = TOP_Y + (NAV_ITEMS.length - 1) * ROW + 30 * S;

/**
 * Where a fan label sits, in px from the pick container's top-left. `y` is the
 * label's vertical CENTRE (the fan buttons are translateY(-50%)).
 */
export function spokeLabelPos(index: number): { x: number; y: number } {
  const s = SPOKES[index];
  return { x: s.lx + LABEL_GAP, y: s.ly };
}
