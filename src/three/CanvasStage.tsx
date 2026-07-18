import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { CableRig } from "@/three/cable/CableRig";
import { StudioEnv } from "@/three/cable/StudioEnv";

/**
 * Owns the R3F <Canvas>. Perspective camera now that the scene uses real models
 * (the guitar-cable jack). The grabbable, physics-driven cable is the scene; the
 * logo, PickMenu, and HUD remain DOM overlays above it.
 *
 * (The prior orthographic brick-field / Max-MSP metaphor — PatchField and the
 * on-canvas MenuBricks — is held for now; those files remain but are unmounted.)
 */
export function CanvasStage() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0.2, 12], fov: 45, near: 0.1, far: 100 }}
      gl={{ antialias: true }}
      onCreated={({ camera }) => camera.lookAt(0, -0.6, 0)}
    >
      <color attach="background" args={["#0a0a0f"]} />
      <hemisphereLight args={["#8a97ad", "#0c0d12", 0.55]} />
      <directionalLight position={[-4, 6, 6]} intensity={2.1} color="#fff4e6" />
      <directionalLight position={[5, 2, -6]} intensity={1.1} color="#7fb0ff" />
      <StudioEnv />
      <Suspense fallback={null}>
        <CableRig />
      </Suspense>
    </Canvas>
  );
}
