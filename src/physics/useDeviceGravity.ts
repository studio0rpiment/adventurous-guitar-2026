import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ROPE } from "@/three/cable/constants";
import { resetGravity, steadyGravity, worldGravity } from "@/physics/gravity";
import { PHYSICS_FLIP } from "@/config/flags";

export type PhysicsStatus = "off" | "on" | "denied";

const G = 9.81;
/** Per-event low-pass weight for the steady gravity direction (higher = tilt reads faster). */
const SMOOTH = 0.3;
/** How much of the fast part of each reading (a shake, a flick) reaches the cables — the whip. */
const SHAKE_GAIN = 4;
/** Cap on the total pull, as a multiple of normal gravity, so a hard flick whips but can't fling. */
const MAX_G = 7;
/** A reading this strong along the screen's vertical is clear enough to calibrate the sign from. */
const CALIBRATE_MIN = 6;

type MotionPermission = { requestPermission?: () => Promise<"granted" | "denied"> };

const isIOS = () =>
  /iP(hone|ad|od)/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const screenAngle = () =>
  (window.screen.orientation?.angle ??
    (window as unknown as { orientation?: number }).orientation ??
    0) *
  (Math.PI / 180);

/**
 * Phone sensors → cable gravity.
 *
 * Reads `devicemotion`'s accelerationIncludingGravity. At rest that's the
 * reaction to gravity (it points UP), so the pull on the cables is its
 * negative. Held upright it points down the screen; flat on a table it points
 * into the screen, so the cables fall back into the scene. Shaking adds linear
 * acceleration to the same reading, so shakes jolt the cables with no extra
 * code: a low-pass keeps the steady direction and the fast remainder is fed
 * through as a shake.
 *
 * Event-driven: each devicemotion event writes `worldGravity`; the rope reads it
 * on its tick. No timers.
 *
 * The camera never rotates (CameraPan is pure translation), so screen axes ARE
 * world axes: x right, y up, z toward the viewer. We only have to undo the
 * screen's own rotation in landscape.
 *
 * Sign: the spec says a face-up phone reads z = +9.81; iOS Safari has reported
 * the opposite. We start from a platform guess, then calibrate from the first
 * clear reading — whoever taps "Physics" is almost always holding the phone
 * upright, so the pull should point down the screen. `?physics=flip` inverts it
 * by hand if that ever guesses wrong.
 */
export function useDeviceGravity() {
  const [status, setStatus] = useState<PhysicsStatus>("off");
  const sign = useRef(1);
  const calibrated = useRef(false);
  const smooth = useRef(new THREE.Vector3(0, -1, 0)); // in units of g, world space
  const raw = useRef(new THREE.Vector3());

  const onMotion = useCallback((e: DeviceMotionEvent) => {
    const a = e.accelerationIncludingGravity;
    if (!a || a.x == null || a.y == null || a.z == null) return;

    // device axes -> screen axes (undo landscape rotation)
    const t = screenAngle();
    const c = Math.cos(t);
    const s = Math.sin(t);
    const sx = a.x * c - a.y * s;
    const sy = a.x * s + a.y * c;
    const sz = a.z;

    if (!calibrated.current && Math.abs(sy) > CALIBRATE_MIN) {
      // upright: the reaction reading should point UP the screen (+y)
      sign.current = sy > 0 ? 1 : -1;
      calibrated.current = true;
    }
    const k = (-sign.current * (PHYSICS_FLIP ? -1 : 1)) / G; // pull = -reaction, in g
    raw.current.set(sx * k, sy * k, sz * k);

    const sm = smooth.current.lerp(raw.current, SMOOTH);
    steadyGravity.copy(sm).multiplyScalar(Math.abs(ROPE.gravity));
    // steady direction + amplified fast part (the shake)
    worldGravity
      .copy(raw.current)
      .sub(sm)
      .multiplyScalar(SHAKE_GAIN)
      .add(sm);
    const m = worldGravity.length();
    if (m > MAX_G) worldGravity.multiplyScalar(MAX_G / m);
    worldGravity.multiplyScalar(Math.abs(ROPE.gravity));
  }, []);

  // Listener lives only while physics is on.
  useEffect(() => {
    if (status !== "on") return;
    window.addEventListener("devicemotion", onMotion);
    return () => {
      window.removeEventListener("devicemotion", onMotion);
      resetGravity();
    };
  }, [status, onMotion]);

  /** Must be called straight from a tap: iOS only grants motion inside a user gesture. */
  const enable = useCallback(() => {
    const DM = (window as unknown as { DeviceMotionEvent?: MotionPermission }).DeviceMotionEvent;
    sign.current = isIOS() ? -1 : 1;
    calibrated.current = false;
    smooth.current.set(0, -1, 0);
    if (DM?.requestPermission) {
      DM.requestPermission()
        .then((r) => setStatus(r === "granted" ? "on" : "denied"))
        .catch(() => setStatus("denied"));
    } else {
      setStatus("on");
    }
  }, []);

  const disable = useCallback(() => setStatus("off"), []);

  return { status, enable, disable };
}
