import { useEffect, useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

const ITEMS = ["Schedule", "Participants", "Locations", "About"];

const ZOOM = 50; // must match the orthographic camera zoom in CanvasStage
const PX = 150; // texture px per world unit
const REM_PX = 16; // 1rem
const PAD = 16; // side padding (px)
const FONT_FAMILY = '"Format 1452", ui-monospace, Menlo, monospace';

const NORMAL = { band: "#3a4049", outline: "#b7bcc4", text: "#eef2f6" };
const HOVER = { band: "#e8964a", outline: "#e8964a", text: "#ffffff" };

function objTexture(
  label: string,
  worldW: number,
  chPx: number,
  fontPx: number,
  c: { band: string; outline: string; text: string },
) {
  const cw = Math.max(8, Math.round(worldW * PX));
  const cv = document.createElement("canvas");
  cv.width = cw;
  cv.height = chPx;
  const g = cv.getContext("2d")!;
  const bH = Math.round(chPx * 0.14);
  const R = Math.round(chPx * 0.1);
  g.fillStyle = "#191d23";
  g.fillRect(0, 0, cw, chPx);
  g.fillStyle = c.band;
  g.fillRect(0, 0, cw, bH);
  g.fillRect(0, chPx - bH, cw, bH);
  g.fillStyle = c.text;
  g.font = `${fontPx}px ${FONT_FAMILY}`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(label.toLowerCase(), cw / 2, chPx / 2 + 1);
  g.fillStyle = c.outline;
  [0.12, 0.88].forEach((fx) => {
    const x = fx * cw;
    g.beginPath();
    g.arc(x, 0, R, 0, Math.PI);
    g.fill();
    g.beginPath();
    g.arc(x, chPx, R, Math.PI, 2 * Math.PI);
    g.fill();
  });
  g.strokeStyle = c.outline;
  g.lineWidth = 2;
  g.strokeRect(1, 1, cw - 2, chPx - 2);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.minFilter = THREE.LinearFilter;
  t.generateMipmaps = false;
  return t;
}

/**
 * The menu as four thin, stationary object bricks stacked on the left. ~1rem
 * lowercase Format 1452 label, grey object outline, accent-orange on hover.
 * No roll — these stay put (the picture field is what ripples).
 */
export function MenuBricks() {
  const TW = useThree((s) => s.viewport.width);
  const TH = useThree((s) => s.viewport.height);
  const [fontsReady, setFontsReady] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(-1);

  useEffect(() => {
    let live = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fonts = (document as any).fonts;
    if (fonts?.ready) fonts.ready.then(() => live && setFontsReady(true));
    else setFontsReady(true);
    return () => {
      live = false;
    };
  }, []);

  const bricks = useMemo(() => {
    const H = 0.52; // thin brick (world units)
    const GAPY = H * 0.5;
    const depth = H;
    const chPx = Math.round(H * PX);
    const fontPx = Math.round((REM_PX * PX) / ZOOM);

    const meas = document.createElement("canvas").getContext("2d")!;
    meas.font = `${fontPx}px ${FONT_FAMILY}`;

    const totalH = ITEMS.length * H + (ITEMS.length - 1) * GAPY;
    const startY = totalH / 2 - H / 2;
    const leftEdge = -TW / 2 + TW * 0.05;

    return ITEMS.map((label, i) => {
      const w = (meas.measureText(label.toLowerCase()).width + 2 * PAD) / PX;
      return {
        label,
        geo: new THREE.BoxGeometry(w, H, depth),
        normalTex: objTexture(label, w, chPx, fontPx, NORMAL),
        hoverTex: objTexture(label, w, chPx, fontPx, HOVER),
        pos: [leftEdge + w / 2, startY - i * (H + GAPY), 1.5] as [
          number,
          number,
          number,
        ],
      };
    });
    // fontsReady forces a rebuild once the web font has loaded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [TW, TH, fontsReady]);

  const dark = useMemo(() => new THREE.MeshBasicMaterial({ color: 0x14171c }), []);
  const fronts = useMemo(
    () => bricks.map((b) => new THREE.MeshBasicMaterial({ map: b.normalTex })),
    [bricks],
  );
  useEffect(() => {
    fronts.forEach((f, i) => {
      f.map = i === hoveredIdx ? bricks[i].hoverTex : bricks[i].normalTex;
      f.needsUpdate = true;
    });
  }, [hoveredIdx, fronts, bricks]);

  return (
    <group>
      {bricks.map((b, i) => (
        <mesh
          key={b.label}
          geometry={b.geo}
          material={[dark, dark, dark, dark, fronts[i], dark]}
          position={b.pos}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredIdx(i);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHoveredIdx(-1);
            document.body.style.cursor = "default";
          }}
        />
      ))}
    </group>
  );
}
