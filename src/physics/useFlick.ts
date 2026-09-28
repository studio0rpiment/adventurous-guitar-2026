import { useEffect, useRef } from "react";
import { FlickDetector, type FlickDir } from "@/physics/flick";

/** Calls onFlick(dir) on each flick while `enabled`. Listens only while enabled. */
export function useFlick(enabled: boolean, onFlick: (dir: FlickDir) => void) {
  const cb = useRef(onFlick);
  cb.current = onFlick;

  useEffect(() => {
    if (!enabled) return;
    const det = new FlickDetector();
    const onMotion = (e: DeviceMotionEvent) => {
      const dir = det.feed(e);
      if (dir) cb.current(dir);
    };
    window.addEventListener("devicemotion", onMotion);
    return () => window.removeEventListener("devicemotion", onMotion);
  }, [enabled]);
}
