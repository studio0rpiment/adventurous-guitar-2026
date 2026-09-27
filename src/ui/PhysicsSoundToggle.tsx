import { useEffect, useState } from "react";
import { useDeviceGravity } from "@/physics/useDeviceGravity";
import { useCableSynth } from "@/audio/synth/useCableSynth";

/** Phones/tablets have a motion sensor worth offering. */
const TOUCH_QUERY = "(pointer: coarse)";

/**
 * One button for the two things that go together: the cable synth, and (on a
 * phone) the motion sensors that swing the cables. The sound is played BY the
 * cables' motion, so physics without sound is half of it and sound without
 * motion is silence — one tap turns on both.
 *
 * On desktop there's no sensor, so the same button is just "Sound": the cables
 * still sway under the mouse and play.
 *
 * Order matters inside the tap: audio starts first (browsers only allow it in a
 * user gesture), then the motion permission is requested (iOS asks here).
 */
export function PhysicsSoundToggle() {
  const gravity = useDeviceGravity();
  const synth = useCableSynth();
  const [touch, setTouch] = useState(
    () => typeof window !== "undefined" && window.matchMedia(TOUCH_QUERY).matches,
  );

  // Event-driven: the media query tells us if the input type changes.
  useEffect(() => {
    const mq = window.matchMedia(TOUCH_QUERY);
    const onChange = (e: MediaQueryListEvent) => setTouch(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const on = synth.on;

  const toggle = () => {
    if (on) {
      synth.stop();
      gravity.disable();
    } else {
      synth.start();
      if (touch) gravity.enable();
    }
  };

  const what = touch ? "Physics and sound" : "Sound";
  const label = !on
    ? `${what} off`
    : touch && gravity.status === "denied"
      ? "Sound on, motion blocked"
      : `${what} on`;

  return (
    <button
      type="button"
      className="ags-physics-toggle"
      aria-pressed={on}
      onClick={toggle}
      style={{
        position: "fixed",
        left: "max(clamp(0.9rem, 3vw, 1.5rem), env(safe-area-inset-left))",
        bottom: "max(clamp(0.9rem, 3vw, 1.5rem), env(safe-area-inset-bottom))",
        zIndex: 11,
        padding: "0.5rem 0.9rem",
        borderRadius: "999rem",
        border: "0.0625rem solid rgba(255,255,255,0.35)",
        background: on ? "rgba(255,255,255,0.92)" : "rgba(10,10,15,0.8)",
        color: on ? "#0a0a0f" : "#fff",
        font: "inherit",
        fontSize: "0.8rem",
        letterSpacing: "0.04em",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
