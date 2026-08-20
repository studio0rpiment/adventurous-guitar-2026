import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { FESTIVAL } from "@/config/festival";
import { watchScroll } from "@/lib/scroll";

const FONT = "/fonts/Format_1452.ttf";
const WHITE = "#f4f1ea";
const FS = 1.2; // title line size (world units)
const LINE = 1.7; // vertical gap between title lines (leading)
const DATE_FS = 0.58;
const DATE_GAP = 1.3; // gap from last title line down to the date
const CY = -0.8; // vertical centre of the lockup at scroll 0 (lower = sits further down)
const Z = 6.5; // in front of the cables so it floats on top
const RISE = 9; // world units the lockup rises over one viewport of scroll

const LINES = FESTIVAL.titleLines.map((l) => l.toUpperCase());

/**
 * The title lockup as 3D text floating in front of the cables. It scrolls up
 * (and out of frame) as the page scrolls, handing off to the island content.
 */
export function TitleText3D() {
  const group = useRef<THREE.Group>(null);
  const scrollY = useRef(0);

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
    const targetY = CY + frac * RISE;
    g.position.y += (targetY - g.position.y) * 0.15;
  });

  return (
    <group ref={group} position={[0, CY, Z]}>
      {LINES.map((line, i) => (
        <Text key={line} font={FONT} fontSize={FS} color={WHITE} anchorX="center" anchorY="middle" letterSpacing={0.06} position={[0, LINE - i * LINE, 0]}>
          {line}
        </Text>
      ))}
      <Text font={FONT} fontSize={DATE_FS} color={WHITE} anchorX="center" anchorY="middle" letterSpacing={0.14} position={[0, -LINE - DATE_GAP, 0]}>
        {FESTIVAL.dates.toUpperCase()}
      </Text>
    </group>
  );
}
