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

/**
 * Where the lockup's own centre sits, as a fraction of the visible half-height
 * ABOVE the middle of the frame. 0 would centre it; this lifts it into the
 * upper third so the name and the dates read the moment the page opens.
 */
const LIFT = 0.16;

/* Bands of the frame kept clear, as fractions of its full height. The top one
   is the HUD's: the pick plate and the nav sit there, and a title line running
   under them is the reason the lockup can't simply be pushed as high as it
   fits. */
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
const MID = (TOP + BOTTOM) / 2;

/**
 * The title lockup as 3D text floating in front of the cables. It scrolls up
 * (and out of frame) as the page scrolls, handing off to the island content.
 *
 * **Its size and place are fitted to the frame, not fixed in world units.**
 * They used to be constants, and that broke quietly at both ends: the lockup
 * sits at z=6.5, well in front of the plane the camera framing describes, so
 * it's magnified — on a 900px-tall desktop window "OCTOBER 8–9, 2026" was
 * pushed off the bottom of the viewport entirely, while a portrait phone
 * (camera pulled right back to fit the socket spread) saw the same lockup as a
 * small thing adrift below the middle. One number can't serve both.
 *
 * So: scale down only if it would overfill the frame, put its centre a fixed
 * FRACTION of the frame above the middle, and rise by enough to actually clear
 * the top — the old fixed RISE was about right for a desktop and left the
 * lockup lingering over the first islands on a phone.
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

    // Shrink only if the lockup can't fit between those bands at all — a tall
    // portrait frame has room to spare, a 900px desktop window doesn't.
    const s = Math.min(1, (top - bottom) / HEIGHT);

    // Lift it toward the upper third, then hold it inside the bands. The lift
    // is what a phone gets (plenty of slack); the clamp is what a short desktop
    // window gets, and it's why the date stopped falling off the bottom.
    const wanted = LIFT * halfH - MID * s;
    const highest = top - TOP * s;
    const lowest = bottom - BOTTOM * s;

    return {
      scale: s,
      restY: Math.min(highest, Math.max(lowest, wanted)),
      // Enough to carry the whole lockup past the top edge over one viewport
      // of scroll, whatever that viewport is.
      rise: halfH + HEIGHT * s,
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
