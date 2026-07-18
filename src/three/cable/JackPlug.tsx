import { forwardRef, useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import type { GroupProps } from "@react-three/fiber";
import { JACK_MODEL_URL, TARGET_LEN } from "./constants";

useGLTF.preload(JACK_MODEL_URL);

/**
 * A single guitar-cable jack. Loaded from the glTF (whose internal parenting the
 * loader resolves correctly), then normalized: centered at the origin, long axis
 * along local Z, +Z = the cable-exit end. CableRig positions/orients the group
 * each frame; pointer props are spread through for grabbing.
 */
export const JackPlug = forwardRef<THREE.Group, GroupProps>(function JackPlug(props, ref) {
  const { scene } = useGLTF(JACK_MODEL_URL);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const scale = TARGET_LEN / Math.max(size.x, size.y, size.z);
    clone.scale.setScalar(scale);
    clone.position.copy(center).multiplyScalar(-scale);
    return clone;
  }, [scene]);
  return (
    <group ref={ref} {...props}>
      <primitive object={model} />
    </group>
  );
});
