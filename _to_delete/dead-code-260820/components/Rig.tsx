import { OrbitControls } from "@react-three/drei";
import { TOUCH } from "three";

/**
 * Camera controls. Desktop: drag to orbit, wheel to zoom. Touch: one finger
 * orbits, two fingers dolly (zoom) + rotate. Swap for a scripted rig later.
 */
export function Rig() {
  return (
    <OrbitControls
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.6}
      minDistance={3}
      maxDistance={12}
      touches={{ ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_ROTATE }}
    />
  );
}
