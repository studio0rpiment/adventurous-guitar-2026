import { useMemo } from "react";
import * as THREE from "three";
import { HangingCable } from "./HangingCable";

/**
 * A row of patch cables in assorted colours (the Bittree-rack look) — the first
 * step toward the "wire hair" treatment. Same cable object repeated; only the
 * tube colour changes. Add/remove colours to change the count.
 */
const CABLE_COLORS = [
  "#e0483d", // red
  "#e8801f", // orange
  "#e8c020", // yellow
  "#57b24a", // green
  "#2fb0a0", // teal
  "#3f7fe0", // blue
  "#7a4fe0", // violet
  "#d24ac0", // magenta
];

const CENTER_X = -3.8; // shift the whole row further left
const SPACING = 0.5; // horizontal gap between cables (tighter = closer)
const TOP_Y = 2.6; // where the tops hang from
const Z = 2.5; // forward toward the camera (larger, clear of the title)

export function CableRow() {
  const cables = useMemo(() => {
    const n = CABLE_COLORS.length;
    const x0 = CENTER_X - ((n - 1) * SPACING) / 2;
    return CABLE_COLORS.map((color, i) => ({
      color,
      top: new THREE.Vector3(x0 + i * SPACING, TOP_Y, Z),
    }));
  }, []);

  return (
    <>
      {cables.map((c, i) => (
        <HangingCable key={i} top={c.top} color={c.color} />
      ))}
    </>
  );
}
