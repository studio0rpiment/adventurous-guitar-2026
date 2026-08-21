import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { FESTIVAL } from "@/config/festival";
import { watchScroll } from "@/lib/scroll";
import { planeScale, visibleHalfHeight } from "@/three/ResponsiveCamera";

const FONT = "/fonts/Format_1452.ttf";
const WHITE = "#f4f1ea";
const FS = 1.2; // title line size (world units)
const LINE = 1.7; // vertical gap between title lines (leading)
const DATE_FS = 0.58;
const DATE_GAP = 1.3; // gap from last title line down to the date
const Z = 6.5; // in front of the cables so it floats on top

const CY = -0.8; // resting height of the lockup at scroll 0
const RISE = 9; // world units the lockup rises over one viewport of scroll

/* Bands of the frame kept clear, as fractions of its full height. The top one
   is the HUD's — the pick plate and the nav sit there — and the bottom one is
   what the date needs. These are only ever used to PULL THE LOCKUP BACK into
   frame; where there's room for it at CY, nothing here does anything. */
const TOP_INSET = 0.16;
const BOTTOM_INSET = 0.08;

const LINES: string[] = FESTIVAL.titleLines.map((l: string) => l.toUpperCase());

/* The lockup's own geometry, derived from the type constants above rather than
   measured off a screenshot — change the leading, the date gap or the number of
   title lines and the fit and placement below follow. */
const lineY = (i: number) => LINE - i * LINE;
const DATE_Y = lineY(LINES.length - 1) - DATE_GAP;
const TOP = lineY(0) + FS * 0.55;
const BOTTOM = DATE_Y - DATE_FS * 0.75;
const HEIGHT = TOP - BOTTOM;

/**
 * The title lockup as 3D text floating in front of the cables. It scrolls up
 * (and out of frame) as the page scrolls, handing off to the island content.
 *
 * **CY is still the resting height; it's now held inside the frame.** The
 * lockup sits at z=6.5, well in front of the plane the camera framing
 * describes, so it's magnified by d/(d−z) — 1.76× at the desktop distance of
 * 15. The frame it actually has to fit inside there is only ~4 world units
 * tall, not the ~7 the framing numbers suggest, and "OCTOBER 8–9, 2026" fell
 * off the bottom of a 900px-tall window. A portrait phone has the opposite
 * problem and no problem: the camera is pulled right back to fit the socket
 * spread, so there's slack to spare.
 *
 * So this is a CLAMP, not a re-placement. Where the lockup fits at CY —
 * every phone, and any reasonably tall window — the maths below returns CY
 * unchanged and nothing moves. It only bites when the frame is too short, and
 * then only by as much as it takes to bring the date back into view.
 */
export function TitleText3D() {
  const group = useRef<THREE.Group>(null);
  const scrollY = useRef(0);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);

  const { restY, rise, scale } = useMemo(() => {
    const aspect = size.width / size.height;
    // The half-height that applies AT THE LOCKUP'S DEPTH, not at z=0.
    const halfH =
      visibleHalfHeight(camera.fov, aspect) * planeScale(camera.fov, aspect, Z);

    const frame = 2 * halfH;
    const top = halfH - TOP_INSET * frame;
    const bottom = -halfH + BOTTOM_INSET * frame;

    // Shrink only if the lockup can't fit between those bands at all. Nothing
    // in the current range of viewports hits this; it's the floor under an
    // unusually short window, where clamping alone can't win.
    const s = Math.min(1, (top - bottom) / HEIGHT);

    // The only intervention: hold CY between the highest and lowest positions
    // that keep the whole lockup inside those bands. Where it already fits,
    // this returns CY and nothing moves.
    const highest = top - TOP * s;
    const lowest = bottom - BOTTOM * s;

    return {
      scale: s,
      restY: Math.min(highest, Math.max(lowest, CY)),
      rise: RISE,
    };
  }, [camera, size]);

  useEffect(
    () =>
      watchScroll(() => {
        scrollY.current = window.scrollY;
      }),
    [],
  );

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const frac = scrollY.current / Math.max(1, window.innerHeight);
    const targetY = restY + frac * rise;
    // Lerped, so a resize re-fit slides into place rather than jumping.
    g.position.y += (targetY - g.position.y) * 0.15;
  });

  return (
    <group ref={group} position={[0, restY, Z]} scale={scale}>
      {LINES.map((line: string, i: number) => (
        <Text key={line} font={FONT} fontSize={FS} color={WHITE} anchorX="center" anchorY="middle" letterSpacing={0.06} position={[0, lineY(i), 0]}>
          {line}
        </Text>
      ))}
      <Text font={FONT} fontSize={DATE_FS} color={WHITE} anchorX="center" anchorY="middle" letterSpacing={0.14} position={[0, DATE_Y, 0]}>
        {FESTIVAL.dates.toUpperCase()}
      </Text>
    </group>
  );
}
