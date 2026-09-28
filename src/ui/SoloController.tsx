import { useEffect } from "react";
import { solo, SOLO_SCALE, noteName } from "@/audio/synth/solo";
import { useCableSynth } from "@/audio/synth/useCableSynth";
import { useFlick } from "@/physics/useFlick";
import { useSolo } from "@/ui/useSolo";

/** The thumb zone: the middle of the viewport, this fraction of its width and height. */
const ZONE = 0.6;

const inZone = (x: number, y: number) => {
  const mx = (window.innerWidth * (1 - ZONE)) / 2;
  const my = (window.innerHeight * (1 - ZONE)) / 2;
  return x >= mx && x <= window.innerWidth - mx && y >= my && y <= window.innerHeight - my;
};

/**
 * Solo mode, while sound is on: hold a thumb down in the middle 60% of the
 * screen and the chord hands over to a single voice on the E minor
 * pentatonic; flick the phone toward you to step down, away to step up; lift
 * the thumb to go back to the chord. Shows the current note while soloing.
 *
 * Event-driven throughout: pointer down/up/cancel for the thumb, devicemotion
 * for the flicks (useFlick).
 */
export function SoloController() {
  const synth = useCableSynth();
  const s = useSolo();

  // thumb down in the zone → solo; that same pointer up/cancelled → back to the chord
  useEffect(() => {
    if (!synth.on) {
      solo.exit();
      return;
    }
    let thumb: number | null = null;
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "touch" || thumb !== null) return;
      if (!inZone(e.clientX, e.clientY)) return;
      thumb = e.pointerId;
      solo.enter();
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== thumb) return;
      thumb = null;
      solo.exit();
    };
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      solo.exit();
    };
  }, [synth.on]);

  useFlick(s.active, (dir) => solo.step(dir));

  if (!s.active) return null;
  return (
    <div
      aria-live="polite"
      style={{
        position: "fixed",
        left: "50%",
        bottom: "max(clamp(0.9rem, 3vw, 1.5rem), env(safe-area-inset-bottom))",
        transform: "translateX(-50%)",
        zIndex: 11,
        padding: "0.5rem 0.9rem",
        borderRadius: "999rem",
        background: "rgba(255,255,255,0.92)",
        color: "#0a0a0f",
        fontSize: "0.8rem",
        letterSpacing: "0.04em",
        pointerEvents: "none",
      }}
    >
      Solo {noteName(SOLO_SCALE[s.index])}
    </div>
  );
}
