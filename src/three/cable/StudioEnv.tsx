import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Procedural studio environment (no external HDR fetch) so the steel plug reflects
 * nicely. Matches the look locked in the feel prototype.
 */
export function StudioEnv() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 128;
    const g = c.getContext("2d")!;
    const grd = g.createLinearGradient(0, 0, 0, 128);
    grd.addColorStop(0.0, "#aeb6c4");
    grd.addColorStop(0.32, "#5b6270");
    grd.addColorStop(0.55, "#191d24");
    grd.addColorStop(1.0, "#08080c");
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 128);
    const s = g.createRadialGradient(80, 34, 4, 80, 34, 90);
    s.addColorStop(0, "rgba(255,255,255,0.85)");
    s.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = s;
    g.fillRect(0, 0, 256, 128);
    const tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    const pmrem = new THREE.PMREMGenerator(gl);
    const rt = pmrem.fromEquirectangular(tex);
    const prev = scene.environment;
    scene.environment = rt.texture;
    tex.dispose();
    pmrem.dispose();
    return () => {
      scene.environment = prev;
      rt.dispose();
    };
  }, [gl, scene]);
  return null;
}
