/**
 * URL feature flags, read once at load. Test-only switches that let a build go
 * out to the live site without being on for everyone.
 *
 *   ?physics=flip  — invert the motion-sensor sign for the Physics toggle (if a
 *                    phone reads upside-down and the auto-calibration guessed
 *                    wrong). The toggle itself is always on for touch devices.
 */
const params =
  typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();

export const PHYSICS_FLIP = params.get("physics") === "flip";
