import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { MEDIA } from "@/config/media";

/**
 * The patch field — face 0 of the metaphor. A flat, orthographic wall of prism
 * bricks whose front faces reconstruct the stage photo, flush with no seams,
 * filling the viewport.
 *
 * Hovering a brick rolls that single brick a full 360° around its long axis,
 * starting and ending on the image face (the other three faces are placeholder
 * colors that flash past mid-roll). No ripple, no auto-cascade.
 */
const ROWS = 16;
const WIDTH_FRACS = [0.06, 0.09, 0.12, 0.16];
const ROLL_EASE = 0.16;

// placeholder colors for the three non-image faces
const FACE_TOP = "#d9a441"; // +Y  (amber)
const FACE_BOTTOM = "#b0563a"; // -Y  (rust)
const FACE_BACK = "#2b6f8f"; // -Z  (teal)

export function PatchField() {
  const tex = useLoader(THREE.TextureLoader, MEDIA.stageBackground);
  const TW = useThree((s) => s.viewport.width);
  const TH = useThree((s) => s.viewport.height);

  const { bricks, materials } = useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;

    const iw = tex.image?.width ?? 4;
    const ih = tex.image?.height ?? 3;
    const gridAspect = TW / TH;
    const imgAspect = iw / ih;

    let uBase = 0,
      uSpan = 1,
      vBase = 0,
      vSpan = 1;
    if (gridAspect > imgAspect) {
      vSpan = imgAspect / gridAspect;
      vBase = (1 - vSpan) / 2;
    } else {
      uSpan = gridAspect / imgAspect;
      uBase = (1 - uSpan) / 2;
    }

    const rowPitch = TH / ROWS;
    const h = rowPitch;
    const depth = h;

    const items: {
      key: string;
      geo: THREE.BoxGeometry;
      pos: [number, number, number];
    }[] = [];

    let n = 0;
    for (let r = 0; r < ROWS; r++) {
      const yc = TH / 2 - rowPitch / 2 - r * rowPitch;
      const yB = yc - h / 2;
      const yT = yc + h / 2;
      let x = -TW / 2;
      while (x < TW / 2 - 0.01) {
        let w = WIDTH_FRACS[(Math.random() * WIDTH_FRACS.length) | 0] * TW;
        if (x + w > TW / 2) w = TW / 2 - x;
        const xL = x;
        const xR = x + w;

        const uS = uBase + ((xL + TW / 2) / TW) * uSpan;
        const uE = uBase + ((xR + TW / 2) / TW) * uSpan;
        const vS = vBase + ((yB + TH / 2) / TH) * vSpan;
        const vE = vBase + ((yT + TH / 2) / TH) * vSpan;

        const geo = new THREE.BoxGeometry(w, h, depth);
        const uv = geo.attributes.uv as THREE.BufferAttribute;
        uv.setXY(16, uS, vE);
        uv.setXY(17, uE, vE);
        uv.setXY(18, uS, vS);
        uv.setXY(19, uE, vS);
        uv.needsUpdate = true;

        items.push({ key: `${r}-${n++}`, geo, pos: [xL + w / 2, yc, 0] });
        x += w;
      }
    }

    const dark = new THREE.MeshBasicMaterial({ color: 0x0a0a0f });
    const front = new THREE.MeshBasicMaterial({ map: tex });
    const top = new THREE.MeshBasicMaterial({ color: FACE_TOP });
    const bottom = new THREE.MeshBasicMaterial({ color: FACE_BOTTOM });
    const back = new THREE.MeshBasicMaterial({ color: FACE_BACK });
    // BoxGeometry group order: +X, -X, +Y, -Y, +Z, -Z
    const mats = [dark, dark, top, bottom, front, back];

    return { bricks: items, materials: mats };
  }, [tex, TW, TH]);

  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const anim = useRef<{ turns: number; startAt: number; cur: number }[]>([]);
  useEffect(() => {
    anim.current = bricks.map(() => ({ turns: 0, startAt: 0, cur: 0 }));
  }, [bricks]);

  useFrame(() => {
    const a = anim.current;
    for (let i = 0; i < a.length; i++) {
      const m = meshRefs.current[i];
      if (!m) continue;
      const target = a[i].turns * Math.PI * 2; // full 360° per hover, back to the image
      if (Math.abs(target - a[i].cur) > 1e-4) {
        a[i].cur += (target - a[i].cur) * ROLL_EASE;
        m.rotation.x = a[i].cur;
      }
    }
  });

  const spin = (i: number) => {
    const a = anim.current;
    if (a[i]) a[i].turns += 1;
  };

  return (
    <group>
      {bricks.map((b, i) => (
        <mesh
          key={b.key}
          ref={(m) => (meshRefs.current[i] = m)}
          geometry={b.geo}
          material={materials}
          position={b.pos}
          onPointerOver={(e) => {
            e.stopPropagation();
            spin(i);
          }}
        />
      ))}
    </group>
  );
}
