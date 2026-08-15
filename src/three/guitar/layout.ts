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
 * The floor line.
 *
 * The sockets read as a wall, so the bottom of that wall is the floor. Derived
 * from the socket layout rather than hard-coded, so moving a socket down moves
 * the floor with it. FLOOR_NUDGE is the manual trim on top of that.
 */
const LOWEST_SOCKET_Y = Math.min(...SOCKETS.map((s) => s.pos[1]));

/**
 * How far BELOW the cable field the floor sits. This has to clear the opening
 * frame: at the default camera the view already reaches ~6.2 world units below
 * centre, so a floor level with the cable ends (-2.5) would be on screen from
 * the first paint. Dropping it puts the guitar out of sight until CameraPan
 * descends — which is what makes the reveal a reveal.
 */
export const FLOOR_DROP = 16;
export const FLOOR_Y = LOWEST_SOCKET_Y - FLOOR_DROP;

/**
 * Guitar width as a fraction of the visible viewport width. 1 = edge to edge.
 * Jaguar.tsx derives its scale from this and the live aspect, so it stays
 * viewport-width on any screen.
 */
export const WIDTH_FRACTION = 1;

/**
 * The camera descent.
 *
 * CameraPan measures where it starts: the scroll position at which the island
 * field's bottom clears the viewport, so the guitar is always beneath ALL the
 * islands however many there are. PAN_START_FALLBACK is only used if that
 * element can't be found. PAN_LIFT is how far above the floor the camera
 * settles — the headroom above the guitar.
 */
export const ISLAND_FIELD_SELECTOR = ".ags-island-field";
export const PAN_START_FALLBACK = 0.8;
export const PAN_LIFT = 2.6;

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

