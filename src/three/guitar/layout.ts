/**
 * Pose + anchor constants for the Jaguar lying on the floor of the scene.
 *
 * All positions are in CENTERED MODEL SPACE: Jaguar.tsx re-centres the GLB on
 * its own bounding-box centre first, so (0,0,0) is the middle of the guitar
 * regardless of where Sketchfab put the origin. Length runs along Z — headstock
 * at −Z, lower bout at +Z. The face is +Y and the jack edge is +X, both before
 * the pose rotation.
 */

import { SOCKETS } from "@/three/socket/layout";

/** Where the model file lives (the 2.2 MB Draco-compressed build). */
export const JAGUAR_URL = "/models/fender_jaguar-web.glb";

/**
 * Draco decoder, served by us.
 *
 * drei's default is Google's CDN (gstatic). The model is Draco-compressed, so
 * if that fetch is blocked or slow the loader never settles, useGLTF suspends
 * forever and the guitar silently never appears — no error, just nothing. Two
 * files in /public/draco removes the third-party dependency entirely, which
 * also means it works on bad venue wifi.
 */
export const DRACO_PATH = "/draco/";

/**
 * The floor, and how far the camera descends — both derived from how much
 * world the viewport can actually see.
 *
 * The patch cables don't stop at their sockets: the ropes are slack and sag a
 * long way below them, to roughly CABLE_SAG world units down. To read as "the
 * cables went up and away", the guitar has to sit a whole viewport below THAT,
 * not below the sockets — and a viewport is about twice as tall on a portrait
 * phone as on a desktop. Fixed numbers can't satisfy both, so these are
 * functions of the visible half-height.
 */
const LOWEST_SOCKET_Y = Math.min(...SOCKETS.map((s) => s.pos[1]));

/** How far the slack ropes hang below the lowest socket. Measured by eye from
 *  the settled scene; raise it if the cables ever dip into the guitar's view. */
export const CABLE_SAG = 10;

/** Lowest thing in the cable rig — the bottom of the "wall". */
export const CABLE_BOTTOM = LOWEST_SOCKET_Y - CABLE_SAG;

/** Gap between the cable rig and the floor, in half-viewport-heights. */
export const FLOOR_GAP_VIEWPORTS = 2;
export const FLOOR_MARGIN = 1;

/**
 * Where the guitar sits in the final frame, in half-viewport-heights above the
 * floor. 0 puts the floor on the centre line, so the guitar occupies the
 * middle band and leaves the footer a clear bottom strip. Raise it to push the
 * guitar down the frame, lower it to lift it.
 */
export const FRAME_BIAS = 0;

/** Floor height for a given visible half-height. */
export function floorY(halfHeight: number): number {
  return CABLE_BOTTOM - halfHeight * FLOOR_GAP_VIEWPORTS - FLOOR_MARGIN;
}

/** Where the camera settles at the end of the descent. */
export function cameraRestY(halfHeight: number): number {
  return floorY(halfHeight) + halfHeight * FRAME_BIAS;
}

/**
 * Guitar width as a fraction of the visible viewport width. 1 = edge to edge.
 * Jaguar.tsx derives its scale from this and the live aspect, so it stays
 * viewport-width on any screen.
 */
export const WIDTH_FRACTION = 1;

/**
 * The camera descent starts where the islands end — CameraPan measures the
 * scroll position at which the island field's bottom edge passes the top of
 * the viewport, so the guitar is always beneath ALL the islands however many
 * there are. The fallback is only used if that element can't be found.
 */
export const ISLAND_FIELD_SELECTOR = ".ags-island-field";
export const PAN_START_FALLBACK = 0.8;

/**
 * Resting pose — a side profile, jack edge toward the viewer.
 *
 *   rotation.y = −90°  swings the jack side (+X) around to face the camera and
 *                      lays the guitar's length across the frame.
 *   rotation.x = 0.55  tips the face up toward us so it isn't a flat silhouette
 *                      — you see the pickguard and pickups, not just the edge.
 *   rotation.z = 0.06  a hair of roll so it reads dropped, not placed.
 *
 * No scale or Y here: Jaguar.tsx measures the posed bounding box, scales it to
 * WIDTH_FRACTION of the viewport, then seats it so its lowest point lands
 * exactly on FLOOR_Y. Change the tilt and it re-fits and re-seats itself.
 */
export const POSE = {
  rotation: [0.55, -Math.PI / 2, 0.06] as [number, number, number],
  /** Horizontal placement. Scale comes from WIDTH_FRACTION; Y from FLOOR_Y. */
  x: 0,
  z: 0,
};

/**
 * Scroll fractions (0 = top of page, 1 = bottom).
 *   MOUNT_AT — start fetching/mounting the model, well before the camera
 *              descends, so the 2.2 MB download is done before it's in frame.
 */
export const MOUNT_AT = 0.45;

/**
 * The output jack, on the outer edge of the lower bout — calibrated against the
 * model's own `Plate_Jack` mesh, not guessed. This is where the special cable
 * will seat. Rendered as an empty group named JACK_NODE_NAME so the cable code
 * can look it up and read its world matrix. With the side-profile pose this
 * edge faces the camera, so the plug will come straight out toward the viewer.
 */
export const JACK_ANCHOR: [number, number, number] = [1.3, 0.15, 4.1];
export const JACK_NODE_NAME = "jaguar-jack";

/** Flip on to render a marker at JACK_ANCHOR while positioning the cable. */
export const DEBUG_JACK = false;

