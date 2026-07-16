import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Scene } from "@/three/Scene";

/**
 * Owns the R3F <Canvas> and render settings. Suspense here catches async
 * loads (models, textures, positional audio) inside the scene graph.
 */
export function CanvasStage() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0, 6], fov: 50 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#0a0a0f"]} />
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
