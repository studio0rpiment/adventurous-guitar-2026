import { forwardRef, type Ref } from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";

interface CableProps {
  color?: string;
  hitRef?: Ref<THREE.Mesh>;
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: (e: ThreeEvent<PointerEvent>) => void;
}

/**
 * The cable tube. The visible mesh (forwarded ref) and an invisible, fatter
 * "hit" mesh (hitRef) are both rebuilt each frame by the rig along the same
 * curve; hover handlers live on the hit mesh so hovering near the cable counts.
 */
export const Cable = forwardRef<THREE.Mesh, CableProps>(function Cable(
  { color = "#0d0d10", hitRef, onPointerOver, onPointerOut },
  ref,
) {
  return (
    <group>
      <mesh ref={ref}>
        <meshStandardMaterial color={color} roughness={0.5} metalness={0} envMapIntensity={0.7} />
      </mesh>
      <mesh ref={hitRef} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
    </group>
  );
});
