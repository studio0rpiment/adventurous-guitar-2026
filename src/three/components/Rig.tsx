import { OrbitControls } from "@react-three/drei";

/** Camera controls. Swap for a scripted/animated rig later. */
export function Rig() {
  return (
    <OrbitControls
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      minDistance={3}
      maxDistance={12}
    />
  );
}
