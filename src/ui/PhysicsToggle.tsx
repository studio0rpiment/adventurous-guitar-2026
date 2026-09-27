import { useEffect, useState } from "react";
import { useDeviceGravity } from "@/physics/useDeviceGravity";

/** Only phones/tablets have a motion sensor worth offering. */
const TOUCH_QUERY = "(pointer: coarse)";

const LABEL = { off: "Physics off", on: "Physics on", denied: "Motion blocked" } as const;

/**
 * The opt-in for device gravity. One tap asks for motion
 * access (required on iOS) and hands the cables to the phone's real gravity;
 * another tap gives them back. Hidden where there's no touch screen.
 */
export function PhysicsToggle() {
  const { status, enable, disable } = useDeviceGravity();
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

  if (!touch) return null;

  return (
    <button
      type="button"
      className="ags-physics-toggle"
      aria-pressed={status === "on"}
      onClick={status === "on" ? disable : enable}
      style={{
        position: "fixed",
        left: "max(clamp(0.9rem, 3vw, 1.5rem), env(safe-area-inset-left))",
        bottom: "max(clamp(0.9rem, 3vw, 1.5rem), env(safe-area-inset-bottom))",
        zIndex: 11,
        padding: "0.5rem 0.9rem",
        borderRadius: "999rem",
        border: "0.0625rem solid rgba(255,255,255,0.35)",
        background: status === "on" ? "rgba(255,255,255,0.92)" : "rgba(10,10,15,0.8)",
        color: status === "on" ? "#0a0a0f" : "#fff",
        font: "inherit",
        fontSize: "0.8rem",
        letterSpacing: "0.04em",
        cursor: "pointer",
      }}
    >
      {LABEL[status]}
    </button>
  );
}
