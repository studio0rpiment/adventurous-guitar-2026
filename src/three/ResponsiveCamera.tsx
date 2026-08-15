import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import type { PerspectiveCamera } from "three";

const BASE_Z = 15; // desktop framing distance (keeps the look you approved)
const FIT_HALF_W = 6.5; // world half-width to always keep visible
const FIT_HALF_H = 4; // world half-height to always keep visible
const LOOK_Y = -0.2; // vertical look target

/**
 * How far back the camera sits for a given aspect. Exported because anything
 * that needs to know how much world fits on screen (e.g. sizing the floor
 * guitar to the viewport) has to use the SAME number the camera uses —
 * otherwise the two drift apart on resize.
 */
export function cameraDistance(fovDeg: number, aspect: number): number {
  const tanV = Math.tan((fovDeg * Math.PI) / 360); // tan(vFov / 2)
  return Math.max(BASE_Z, FIT_HALF_W / (tanV * aspect), FIT_HALF_H / tanV);
}

/** Visible world width at the camera's framing distance, for that aspect. */
export function visibleWidth(fovDeg: number, aspect: number): number {
  const tanV = Math.tan((fovDeg * Math.PI) / 360);
  return 2 * tanV * cameraDistance(fovDeg, aspect) * aspect;
}

/**
 * Keeps the whole composition framed across aspect ratios: holds the desktop
 * distance on wide screens, and pulls the camera back on narrow / portrait ones
 * so the asymmetric socket spread never gets clipped. Runs on mount + resize.
 *
 * Only sets Z and the look direction — the vertical position is owned by
 * CameraPan, which slides the camera down to the floor at the end of the
 * scroll. (This effect does reset y to 0 on resize; CameraPan puts it back on
 * the next frame.)
 */
export function ResponsiveCamera() {
  const camera = useThree((s) => s.camera) as unknown as PerspectiveCamera;
  const size = useThree((s) => s.size);

  useEffect(() => {
    const z = cameraDistance(camera.fov, size.width / size.height);
    camera.position.set(0, camera.position.y, z);
    camera.lookAt(0, camera.position.y + LOOK_Y, 0);
    camera.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}
