/**
 * URL feature flags, read once at load. Test-only switches that let a build go
 * out to the live site without being on for everyone.
 *
 *   ?physics       — show the "Physics" toggle: phone sensors drive cable gravity
 *   ?physics=flip  — same, with the sensor sign inverted (if a phone reads
 *                    upside-down and the auto-calibration guessed wrong)
 */
const params =
  typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();

export const PHYSICS_FLAG = params.has("physics");
export const PHYSICS_FLIP = params.get("physics") === "flip";
