import { forwardRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import type { GroupProps } from "@react-three/fiber";
import {
  barrelGeometry,
  barrelRoughnessMap,
  metalRoughnessMap,
  ringGeometry,
  sleeveGeometry,
  tipGeometry,
} from "./plugProfile";
import { usePlugEnv } from "./plugEnv";

/**
 * A single guitar-cable jack, built rather than downloaded.
 *
 * Same contract as the model it replaces: centred at the origin, long axis on
 * local Z, +Z the cable-exit end, overall length TARGET_LEN. PatchCable places
 * and orients the group each frame and knows nothing about what's inside it,
 * so the swap needed no changes there.
 *
 * Geometry and materials are module-level singletons. Sixteen plugs are on
 * screen — eight cables, two ends — and they're identical; the previous version
 * deep-cloned a glTF scene per plug, which meant sixteen copies of the same
 * buffers. This is four geometries and three materials, shared by all of them.
 */
const GEOMETRY = {
  tip: tipGeometry(),
  ring: ringGeometry(),
  sleeve: sleeveGeometry(),
  barrel: barrelGeometry(),
};

/**
 * FINISH — what actually controls how silver this looks.
 *
 * The first thing to know is that **a metal has no colour of its own**. It's a
 * mirror; what you see is what it reflects. So `color` here tints the
 * REFLECTION, and pushing it toward white doesn't make silver — it makes a
 * paler grey, because a grey environment reflected faithfully is still grey.
 * That's why the fix for "reads white/grey" is `plugEnv.ts`, not this block.
 *
 * `metalness` is 1 and stays 1; 1 is the top, and a metalness map is for
 * surfaces that are metal in some places and not others. What's left:
 *
 *   • `roughness`  — the brightness control. Lower keeps the reflection
 *                    concentrated instead of smeared. Sockets sit at 0.06.
 *   • `anisotropy` — the machined-metal cue. A turned part is cut in rings, so
 *                    its highlight STRETCHES around the circumference instead
 *                    of sitting as a round dot. This is what separates
 *                    "polished metal" from "shiny ball" at a glance, and it's
 *                    the reason these are MeshPhysicalMaterial rather than
 *                    MeshStandardMaterial — anisotropy only exists on Physical.
 *   • `envMapIntensity` — how hard the studio strips come back. Past ~1.6 the
 *                    highlight blows out to flat white and you lose the strips.
 */
const FINISH = {
  /** Contacts — polished tip and sleeve. */
  metal: { color: "#dfe4ea", roughness: 0.11, anisotropy: 0.7, envMapIntensity: 1.45 },
  /** Barrel — the part you grip, so slightly softer. */
  barrel: { color: "#c9cfd8", roughness: 0.17, anisotropy: 0.55, envMapIntensity: 1.3 },
} as const;

const METAL = new THREE.MeshPhysicalMaterial({
  ...FINISH.metal,
  metalness: 1,
  roughnessMap: metalRoughnessMap(),
});

/** The one genuinely matte part — a dark gap between two bright contacts, so
 *  it should catch nothing. */
const INSULATOR = new THREE.MeshStandardMaterial({
  color: "#0e0e12",
  metalness: 0,
  roughness: 0.62,
});

/**
 * The barrel, kept bright metal to match the model this replaced — swapping an
 * asset shouldn't restyle the scene.
 *
 * For a black-anodised barrel instead, change FINISH.barrel to color "#1a1a1f",
 * roughness 0.5, anisotropy 0.2, envMapIntensity 0.7, and drop metalness to
 * about 0.4.
 */
const BARREL = new THREE.MeshPhysicalMaterial({
  ...FINISH.barrel,
  metalness: 1,
  roughnessMap: barrelRoughnessMap(),
});

const METALS = [METAL, BARREL];

export const JackPlug = forwardRef<THREE.Group, GroupProps>(function JackPlug(props, ref) {
  // The plug gets its own environment — see plugEnv.ts. Assigning to the
  // shared materials is idempotent, so all sixteen plugs racing to do it is
  // harmless; the texture itself is built once per renderer.
  const env = usePlugEnv();
  useEffect(() => {
    for (const m of METALS) {
      if (m.envMap === env) continue;
      m.envMap = env;
      m.needsUpdate = true;
    }
  }, [env]);

  // The parts never change; only the group's transform does.
  const parts = useMemo(
    () => [
      { geometry: GEOMETRY.tip, material: METAL },
      { geometry: GEOMETRY.ring, material: INSULATOR },
      { geometry: GEOMETRY.sleeve, material: METAL },
      { geometry: GEOMETRY.barrel, material: BARREL },
    ],
    [],
  );

  return (
    <group ref={ref} {...props}>
      {parts.map((p, i) => (
        <mesh key={i} geometry={p.geometry} material={p.material} />
      ))}
    </group>
  );
});
