import { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { visibleHalfHeight, visibleWidth } from "@/three/ResponsiveCamera";
import {
  DEBUG_JACK,
  DRACO_PATH,
  floorY,
  JACK_ANCHOR,
  JACK_NODE_NAME,
  JAGUAR_URL,
  POSE,
  WIDTH_FRACTION,
} from "./layout";

/**
 * The Jaguar lying on the floor, below the cable wall.
 *
 * It doesn't move — it's simply there, on the floor, and CameraPan descends to
 * find it at the end of the scroll. Suspends on the GLB, so it has to be
 * rendered inside a <Suspense>; FloorGuitar does that.
 */
export function Jaguar() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const { scene } = useGLTF(JAGUAR_URL, DRACO_PATH);

  // Re-centre the GLB on its own bounding box so POSE/JACK_ANCHOR are
  // meaningful. Cloned so we never mutate drei's cached scene.
  const model = useMemo(() => {
    const s = scene.clone(true);
    const centre = new THREE.Box3().setFromObject(s).getCenter(new THREE.Vector3());
    s.position.sub(centre);
    return s;
  }, [scene]);

  /**
   * Fit + seat, both measured rather than guessed.
   *
   * Measure the posed model at scale 1, then: scale so its on-screen width is
   * WIDTH_FRACTION of the visible viewport, and drop it so its lowest point
   * lands on FLOOR_Y. Recomputed whenever the viewport changes, so the guitar
   * stays viewport-width and floor-seated on any aspect. visibleWidth() comes
   * from ResponsiveCamera so this can't drift out of step with the framing.
   */
  const { scale, restY } = useMemo(() => {
    const probe = new THREE.Group();
    probe.rotation.set(...POSE.rotation);
    probe.add(model);
    probe.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(probe);
    probe.remove(model); // hand the model back before React mounts it

    const aspect = size.width / size.height;
    const posedWidth = box.max.x - box.min.x;
    const target = visibleWidth(camera.fov, aspect) * WIDTH_FRACTION;
    const s = target / posedWidth;
    // The floor itself depends on the viewport (see layout.floorY), so this
    // has to be recomputed on resize alongside the scale.
    return { scale: s, restY: floorY(visibleHalfHeight(camera.fov, aspect)) - box.min.y * s };
  }, [model, camera, size]);

  return (
    <group position={[POSE.x, restY, POSE.z]} rotation={POSE.rotation} scale={scale}>
      <primitive object={model} />

      {/* Seat point for the special cable. Empty on purpose — the cable reads
          this node's world matrix; nothing here should draw. */}
      <group name={JACK_NODE_NAME} position={JACK_ANCHOR}>
        {DEBUG_JACK && (
          <mesh>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshBasicMaterial color="#00ff88" depthTest={false} />
          </mesh>
        )}
      </group>
    </group>
  );
}
