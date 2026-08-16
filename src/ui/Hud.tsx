import { useEffect, useRef, useState } from "react";
import { useNav } from "@/ui/nav";
import { PickMenu } from "@/ui/PickMenu";
import { NavBar } from "@/ui/NavBar";

/** Below this width the HUD collapses to one row: pick + items beside it. */
const COMPACT_QUERY = "(max-width: 640px)";

/**
 * DOM overlay above the canvas: the pick hub and the nav items, as ONE sticky
 * HUD.
 *
 * The pick's open state lives here rather than inside PickMenu because on
 * mobile the nav items need to know about it — they fly into the fan's label
 * slots when it opens, and the pick hides its own labels so there's only one
 * set of words. On desktop the two are independent: hover opens the fan with
 * its own labels, and the nav bar just sits on the right.
 */
export function Hud() {
  const { open } = useNav();
  const [pickOpen, setPickOpen] = useState(false);
  const [compact, setCompact] = useState(
    () => typeof window !== "undefined" && window.matchMedia(COMPACT_QUERY).matches,
  );
  const pickRef = useRef<HTMLDivElement>(null);

  // Event-driven: the media query tells us when it flips, no polling.
  useEffect(() => {
    const mq = window.matchMedia(COMPACT_QUERY);
    const onChange = (e: MediaQueryListEvent) => setCompact(e.matches);
    setCompact(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div
      className="ags-hud"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        // +1svh of breathing room off the very top edge, on top of the safe-area
        // inset. Mirrored in the small-screen .ags-hud rule in global.css.
        paddingTop:
          "calc(max(clamp(0.9rem, 3vw, 1.5rem), env(safe-area-inset-top)) + 5px + 1svh)",
        paddingRight:
          "max(clamp(0.9rem, 3vw, 1.5rem), env(safe-area-inset-right))",
        paddingBottom:
          "max(clamp(0.9rem, 3vw, 1.5rem), env(safe-area-inset-bottom))",
        paddingLeft:
          "max(clamp(0.9rem, 3vw, 1.5rem), env(safe-area-inset-left))",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "1rem",
        zIndex: 10,
      }}
    >
      <div ref={pickRef} style={{ pointerEvents: "auto", width: "fit-content" }}>
        <PickMenu
          onSelect={open}
          open={pickOpen}
          onOpenChange={setPickOpen}
          showLabels={!compact}
        />
      </div>
      <NavBar pickOpen={pickOpen} anchorRef={pickRef} compact={compact} />
    </div>
  );
}
