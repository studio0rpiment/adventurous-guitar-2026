import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import type { PerspectiveCamera } from "three";

const BASE_Z = 15; // desktop framing distance (keeps the look you approved)
const FIT_HALF_W = 6.5; // world half-width to always keep visible
const FIT_HALF_H = 4; // world half-height to always keep visible
const LOOK_Y = -0.2; // vertical look target

/**
 * Keeps the whole composition framed across aspect ratios: holds the desktop
 * distance on wide screens, and pulls the camera back on narrow / portrait ones
 * so the asymmetric socket spread never gets clipped. Runs on mount + resize.
 * (The DOM overlays — title, HUD, pick — scale via CSS clamp/vw already.)
 */
export function ResponsiveCamera() {
  const camera = useThree((s) => s.camera) as unknown as PerspectiveCamera;
  const size = useThree((s) => s.size);

  useEffect(() => {
    const tanV = Math.tan((camera.fov * Math.PI) / 360); // tan(vFov / 2)
    const aspect = size.width / size.height;
    const zForWidth = FIT_HALF_W / (tanV * aspect);
    const zForHeight = FIT_HALF_H / tanV;
    const z = Math.max(BASE_Z, zForWidth, zForHeight);
    camera.position.set(0, 0, z);
    camera.lookAt(0, LOOK_Y, 0);
    camera.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}
