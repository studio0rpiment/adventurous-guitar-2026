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

  /**
   * Re-centre the GLB on its own bounding box so POSE/JACK_ANCHOR are
   * meaningful, and measure the POSED bounding box in the same pass. Cloned so
   * we never mutate drei's cached scene.
   *
   * The measurement happens here — once per model — rather than alongside the
   * viewport maths below, and that placement is load-bearing. Measuring the
   * posed box means parenting the model into a rotated probe group and taking
   * it out again; `Group.add` DETACHES the object from whatever parent it
   * already has. Once React has mounted <primitive object={model} />, that
   * parent is the live scene graph — so re-running the probe on a later render
   * (every resize) would rip the guitar out of the scene and leave it
   * orphaned, with no error and nothing on screen. On a phone the URL bar
   * showing/hiding fires exactly that resize, which is why the guitar appeared
   * only sometimes. Keyed on `scene` alone, it runs before the first mount and
   * never again.
   */
  const { model, posedBox } = useMemo(() => {
    const m = scene.clone(true);
    const centre = new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3());
    m.position.sub(centre);

    const probe = new THREE.Group();
    probe.rotation.set(...POSE.rotation);
    probe.add(m);
    probe.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(probe);
    probe.remove(m); // hand the model back before React mounts it

    return { model: m, posedBox: box };
  }, [scene]);

  /**
   * Fit + seat, both derived from the posed box above.
   *
   * Scale so the guitar's on-screen width is WIDTH_FRACTION of the visible
   * viewport, and drop it so its lowest point lands on FLOOR_Y. Pure
   * arithmetic — it touches no scene graph — so it's safe to recompute on
   * every resize, and the guitar stays viewport-width and floor-seated on any
   * aspect. visibleWidth() comes from ResponsiveCamera so this can't drift out
   * of step with the framing.
   */
  const { scale, restY } = useMemo(() => {
    const aspect = size.width / size.height;
    const posedWidth = posedBox.max.x - posedBox.min.x;
    const target = visibleWidth(camera.fov, aspect) * WIDTH_FRACTION;
    const s = target / posedWidth;
    // The floor itself depends on the viewport (see layout.floorY), so this
    // has to be recomputed on resize alongside the scale.
    return {
      scale: s,
      restY: floorY(visibleHalfHeight(camera.fov, aspect)) - posedBox.min.y * s,
    };
  }, [posedBox, camera, size]);

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
