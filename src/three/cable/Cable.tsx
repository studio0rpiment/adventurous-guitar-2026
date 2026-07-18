import { forwardRef } from "react";
import * as THREE from "three";

/**
 * The cable tube. Presentational only — its geometry is rebuilt each frame by
 * CableRig via the forwarded ref (single authoritative update loop).
 */
export const Cable = forwardRef<THREE.Mesh>(function Cable(_props, ref) {
  return (
    <mesh ref={ref}>
      <meshStandardMaterial color="#0d0d10" roughness={0.5} metalness={0} envMapIntensity={0.7} />
    </mesh>
  );
});
