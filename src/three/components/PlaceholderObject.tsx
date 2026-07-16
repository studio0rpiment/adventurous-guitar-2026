import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

/**
 * A stand-in hero object so the scene isn't empty. Replace with the real
 * festival centerpiece (guitar model, stage, etc.). Rotation runs on the R3F
 * render loop (useFrame) rather than a setInterval.
 */
export function PlaceholderObject() {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += delta * 0.2;
    meshRef.current.rotation.y += delta * 0.35;
  });

  return (
    <mesh
      ref={meshRef}
      scale={hovered ? 1.15 : 1}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      castShadow
    >
      <icosahedronGeometry args={[1.5, 0]} />
      <meshStandardMaterial
        color={hovered ? "#e8964a" : "#6b7bb5"}
        roughness={0.35}
        metalness={0.2}
        flatShading
      />
    </mesh>
  );
}
