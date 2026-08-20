import { useEffect, useRef } from "react";

/**
 * Run a handler when Escape is pressed, while `active` is true.
 *
 * Extracted because three overlays each carried the same keydown effect —
 * NavProvider (section panels), PickMenu (the fan), and ExpandedIsland (the
 * opened card). One hook means "Escape closes the thing" can't drift into
 * three slightly different behaviours.
 *
 * The handler lives in a ref, so callers can pass a fresh closure every render
 * without the listener detaching and re-attaching each time — the subscription
 * follows `active` only. Event-driven throughout; no timers.
 */
export function useEscape(active: boolean, onEscape: () => void): void {
  const handler = useRef(onEscape);
  handler.current = onEscape;

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handler.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);
}
