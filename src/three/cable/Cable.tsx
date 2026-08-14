import { forwardRef } from "react";
import * as THREE from "three";

/**
 * The cable tube. Presentational only — its geometry is rebuilt each frame by
 * the rig via the forwarded ref. `color` sets the tube colour.
 */
export const Cable = forwardRef<THREE.Mesh, { color?: string }>(function Cable(
  { color = "#0d0d10" },
  ref,
) {
  return (
    <mesh ref={ref}>
      <meshStandardMaterial
        color={color}
        roughness={0.5}
        metalness={0}
        envMapIntensity={0.7}
      />
    </mesh>
  );
});
