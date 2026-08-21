import { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * A studio environment for the plugs alone — the reason they read as silver
 * rather than grey.
 *
 * **A metal has no colour of its own.** It is a mirror: what you see is
 * entirely what it reflects. So no amount of tuning `color`, `roughness` or
 * `metalness` will turn grey into silver — those only change how faithfully
 * the reflection comes back. If the environment is a smooth grey gradient, a
 * perfect mirror returns a smooth grey gradient, and the eye calls it painted
 * plastic.
 *
 * What the eye actually reads as polished metal is CONTRAST and STRUCTURE in
 * the reflection: a bright sky over a dark floor with a hard horizon between
 * them, and a few distinct light sources with edges. That's why a real studio
 * shoot uses strip softboxes — the long bright streaks they leave are the
 * whole effect.
 *
 * `StudioEnv` gives the scene a soft vertical gradient, which is right for the
 * sockets sitting in shadow. This is the same idea with the contrast turned up
 * and hard edges added, applied only to the plug materials — a material's own
 * `envMap` overrides `scene.environment`, so nothing else in the scene changes.
 *
 * Built once per renderer and shared by all sixteen plugs.
 */

const CACHE = new WeakMap<THREE.WebGLRenderer, THREE.Texture>();

/** Vertical strip softboxes, as fractions of the equirect width. Three at
 *  irregular spacing so a turning plug catches them one at a time rather than
 *  in a regular pulse. */
const STRIPS = [
  { x: 0.1, w: 0.035, top: 0.06, bottom: 0.46, level: 1 },
  { x: 0.43, w: 0.055, top: 0.04, bottom: 0.42, level: 0.92 },
  { x: 0.72, w: 0.028, top: 0.1, bottom: 0.4, level: 0.78 },
];

function buildEnvTexture(gl: THREE.WebGLRenderer): THREE.Texture {
  const W = 512;
  const H = 256;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;

  /* Sky: bright at the zenith, falling to the horizon. */
  const sky = g.createLinearGradient(0, 0, 0, H * 0.5);
  sky.addColorStop(0, "#e8eef8");
  sky.addColorStop(0.55, "#9aa6b8");
  sky.addColorStop(1, "#6c7686");
  g.fillStyle = sky;
  g.fillRect(0, 0, W, H * 0.5);

  /* Floor, dark and near-flat. The HARD step between the two is the horizon,
     and that single sharp edge does more for the metal than any material
     setting — it's the line you see curving across a polished cylinder. */
  const floor = g.createLinearGradient(0, H * 0.5, 0, H);
  floor.addColorStop(0, "#1b1f27");
  floor.addColorStop(0.5, "#0b0d11");
  floor.addColorStop(1, "#050507");
  g.fillStyle = floor;
  g.fillRect(0, H * 0.5, W, H * 0.5);

  /* The strip lights. Soft-edged along their width so the highlight has a
     falloff rather than a cut edge. */
  for (const s of STRIPS) {
    const x0 = s.x * W;
    const w = s.w * W;
    const grad = g.createLinearGradient(x0, 0, x0 + w, 0);
    const a = s.level;
    grad.addColorStop(0, "rgba(255,255,255,0)");
    grad.addColorStop(0.5, `rgba(255,255,255,${a})`);
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(x0, s.top * H, w, (s.bottom - s.top) * H);
  }

  /* One warm bounce low on the opposite side, so the shadow side of a plug
     isn't dead black. Real rooms have walls. */
  const bounce = g.createRadialGradient(W * 0.86, H * 0.56, 4, W * 0.86, H * 0.56, W * 0.22);
  bounce.addColorStop(0, "rgba(232,150,74,0.30)");
  bounce.addColorStop(1, "rgba(232,150,74,0)");
  g.fillStyle = bounce;
  g.fillRect(0, 0, W, H);

  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;

  const pmrem = new THREE.PMREMGenerator(gl);
  const rt = pmrem.fromEquirectangular(tex);
  tex.dispose();
  pmrem.dispose();
  return rt.texture;
}

/** The plug environment for the active renderer, built at most once. */
export function usePlugEnv(): THREE.Texture {
  const gl = useThree((s) => s.gl);
  return useMemo(() => {
    const hit = CACHE.get(gl);
    if (hit) return hit;
    const tex = buildEnvTexture(gl);
    CACHE.set(gl, tex);
    return tex;
  }, [gl]);
}
