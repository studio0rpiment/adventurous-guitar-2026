import { Lights } from "@/three/components/Lights";
import { Rig } from "@/three/components/Rig";
import { PlaceholderObject } from "@/three/components/PlaceholderObject";

/**
 * The contents of the 3D scene (everything *inside* the Canvas).
 * Compose scene pieces here; keep the Canvas/setup in CanvasStage.
 */
export function Scene() {
  return (
    <>
      <Lights />
      <PlaceholderObject />
      <Rig />
    </>
  );
}
