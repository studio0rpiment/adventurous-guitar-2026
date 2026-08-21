import * as THREE from "three";
import { TARGET_LEN } from "./constants";

/**
 * A ¼" (6.35 mm) TS mono phone plug, spun from its own cross-section.
 *
 * This replaces a downloaded model, and it's the same move `socket/Socket.tsx`
 * already makes: the sockets were built from a manufacturer's drawing rather
 * than sourced, so the plug that seats into them should come from the same
 * measurements. They now agree by construction instead of by eye.
 *
 * A plug is a turned part in real life — a profile spun on a lathe — so
 * `LatheGeometry` is not an approximation of how it's made, it IS how it's
 * made. Everything below is in MILLIMETRES from the real part, converted once,
 * so the numbers stay checkable against a spec sheet.
 */

/* Real dimensions, mm. A standard straight guitar plug. */
const MM = {
  /** 6.35 mm across the sleeve — the dimension the connector is named for. */
  shaftR: 3.175,
  /** Tip contact: nose to the back of the bullet. */
  tipEnd: 9.0,
  /** The insulating ring that separates tip from sleeve. */
  ringStart: 8.8,
  ringEnd: 11.6,
  ringR: 2.95,
  /** Sleeve contact runs from the ring to the collar. */
  collarStart: 30.0,
  barrelR: 6.5,
  barrelStart: 31.4,
  /** Where the strain relief starts tapering down to the cable. */
  reliefStart: 68.0,
  cableR: 2.6,
  /** Overall length, tip to cable exit. */
  total: 80.0,
};

/** mm → world units. The plug is normalised to TARGET_LEN, so this is the one
 *  place the two systems meet. */
const K = TARGET_LEN / MM.total;

/** Profile points as [radius, distance from the tip], both in mm. */
type Pt = [number, number];

/**
 * Radial segments. 48 rather than a frugal 24 because a specular highlight
 * travelling around a cylinder is exactly what shows facets, and this part is
 * close to camera — it's the thing you reach out and grab.
 */
const SEGMENTS = 48;

const lathe = (points: Pt[], segments = SEGMENTS): THREE.BufferGeometry => {
  const profile = points.map(([r, y]) => new THREE.Vector2(r * K, y * K));
  const g = new THREE.LatheGeometry(profile, segments);
  // Lathe spins around Y; the cable rig wants the long axis on Z with +Z at
  // the cable end. rotateX(+90°) sends +Y to +Z, so the profile's "distance
  // from the tip" becomes exactly that.
  g.rotateX(Math.PI / 2);
  // Centre it: PatchCable places the plug by its middle.
  g.translate(0, 0, -TARGET_LEN / 2);
  // NOTE: do NOT computeVertexNormals() here. LatheGeometry already generates
  // its own — including the duplicated vertices at the closing seam — and
  // recomputing averages them across the hard collar step, rounding off the
  // one edge that should catch a hard line of light. An earlier version did
  // this and the plug read as soft plastic.
  return g;
};

/**
 * A turned-metal finish, generated rather than fetched.
 *
 * Machined parts carry fine concentric rings from the tool — that's what makes
 * a lathe part look machined instead of moulded, and it's what a flat roughness
 * value can't give you. This is a roughness map: a strip of banded greys with
 * variation ALONG the profile and none around it, which is the direction a
 * lathe actually cuts. LatheGeometry's UVs run u around the circumference and
 * v along the profile, so an 8px-wide strip is all the width it needs.
 *
 * Multiplied against the material's own `roughness`, so the values here are
 * relative: 1 = as set, lower = glossier. The result is a highlight that breaks
 * into rings as it travels instead of sliding across as one dead smear.
 */
function turnedRoughnessMap(repeat: number, contrast = 0.35): THREE.Texture {
  const H = 512;
  const c = document.createElement("canvas");
  c.width = 8;
  c.height = H;
  const g = c.getContext("2d")!;

  for (let y = 0; y < H; y++) {
    // Two incommensurate frequencies plus a little noise, so the rings never
    // settle into a visible repeating pattern.
    const fine = Math.sin(y * 0.9) * 0.5 + 0.5;
    const coarse = Math.sin(y * 0.11 + 1.7) * 0.5 + 0.5;
    const grain = Math.random() * 0.25;
    const v = 1 - contrast * (fine * 0.55 + coarse * 0.25 + grain * 0.2);
    const level = Math.round(Math.max(0, Math.min(1, v)) * 255);
    g.fillStyle = `rgb(${level},${level},${level})`;
    g.fillRect(0, y, 8, 1);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, repeat);
  tex.anisotropy = 4;
  return tex;
}

/** Contacts: tight rings, high polish. */
export const metalRoughnessMap = (): THREE.Texture => turnedRoughnessMap(3, 0.4);

/** Barrel: looser, softer — it's anodised, not polished. */
export const barrelRoughnessMap = (): THREE.Texture => turnedRoughnessMap(1.6, 0.22);

/**
 * The bullet tip and its contact band. Rounded rather than hemispherical —
 * a real tip is a truncated bullet, and the flat-ish nose is what you see
 * when one is pointed at the camera.
 */
export const tipGeometry = (): THREE.BufferGeometry =>
  lathe([
    [0, 0],
    [1.15, 0.35],
    [2.15, 1.15],
    [2.8, 2.3],
    [3.05, 3.6],
    [MM.shaftR, 5.2],
    [MM.shaftR, MM.tipEnd],
    [MM.ringR, MM.tipEnd + 0.3],
  ]);

/** The insulating ring. Slightly under the sleeve so it reads as a groove. */
export const ringGeometry = (): THREE.BufferGeometry =>
  lathe([
    [MM.ringR, MM.ringStart],
    [MM.ringR, MM.ringEnd],
  ]);

/**
 * Sleeve contact and the collar that steps out to the barrel. The two shallow
 * grooves near the collar are on real plugs and give the chrome something to
 * catch a highlight on — without them a long cylinder reads as plastic.
 */
export const sleeveGeometry = (): THREE.BufferGeometry =>
  lathe([
    [MM.ringR, MM.ringEnd - 0.3],
    [MM.shaftR, MM.ringEnd + 0.4],
    [MM.shaftR, 24.0],
    [2.95, 24.8],
    [MM.shaftR, 25.6],
    [MM.shaftR, 27.0],
    [2.95, 27.8],
    [MM.shaftR, 28.6],
    [MM.shaftR, MM.collarStart],
    [4.9, MM.collarStart + 0.7],
    [MM.barrelR - 0.2, MM.barrelStart],
  ]);

/**
 * The barrel and its strain relief. Ends open at the cable exit — the rope
 * continues from EXIT_LOCAL, so a closed cap there would only be seen from
 * inside the cable.
 */
export const barrelGeometry = (): THREE.BufferGeometry =>
  lathe([
    // Close the front. Without these two points the barrel is an open tube and,
    // once the plug is seated and the shaft is swallowed by the socket, you
    // look straight down the inside of it — backfaces culled, so it reads as a
    // hole. A real barrel has this annular face where the shaft passes through.
    [MM.shaftR + 0.15, MM.barrelStart - 0.4],
    [MM.barrelR - 0.2, MM.barrelStart - 0.4],
    [MM.barrelR, MM.barrelStart + 1.6],
    [MM.barrelR, 40.0],
    [MM.barrelR - 0.35, 41.2],
    [MM.barrelR - 0.35, 44.0],
    [MM.barrelR, 45.2],
    [MM.barrelR, MM.reliefStart],
    [MM.barrelR - 0.6, MM.reliefStart + 2.4],
    [4.6, MM.reliefStart + 6.5],
    [3.4, MM.reliefStart + 10.0],
    [MM.cableR, MM.total],
  ]);
