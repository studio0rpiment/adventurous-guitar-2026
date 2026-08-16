import { useEffect, useRef } from "react";
import { useNav } from "@/ui/nav";
import { NAV_ITEMS } from "@/config/nav";
import { spokeLabelPos } from "@/ui/pickGeometry";

/**
 * The legible twin of the pick menu.
 *
 * Desktop: a plain bar on the right of the HUD. The pick is the character of
 * the thing, but it isn't obvious to everyone that it's navigation, so this is
 * the signposted route to the same four sections.
 *
 * Mobile: one HUD instead of two rows. The items sit in a column just right of
 * the pick, and when the pick is opened they FLY INTO the fan's label slots —
 * so they turn into the pick's own labels rather than competing with them.
 * PickMenu is told to hide its labels in that mode (`showLabels={false}`), so
 * there's only ever one set of words on screen.
 *
 * The flight is measured, not animated blind: we read each button's current box
 * and the pick's box, and translate by the difference to the exact coordinate
 * the fan would have drawn that label at (from the shared pickGeometry). That
 * survives font, viewport and safe-area changes.
 */
export function NavBar({
  pickOpen = false,
  anchorRef,
  compact = false,
}: {
  /** Whether the pick's fan is open — drives the fly-into-place on mobile. */
  pickOpen?: boolean;
  /** The pick container, i.e. the origin the fan coordinates are relative to. */
  anchorRef?: React.RefObject<HTMLElement | null>;
  /** Mobile mode: column beside the pick, items fly into the fan. */
  compact?: boolean;
}) {
  const { section, open, close } = useNav();
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const place = () => {
      const anchor = anchorRef?.current;
      itemsRef.current.forEach((el, i) => {
        if (!el) return;
        // Always clear first, so what we measure is the button's RESTING box
        // and the deltas never compound across repeated placements.
        el.style.transform = "";
        if (!compact || !pickOpen || !anchor) return;

        const a = anchor.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        const target = spokeLabelPos(i);
        const dx = a.left + target.x - r.left;
        const dy = a.top + target.y - (r.top + r.height / 2);
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      });
    };

    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [compact, pickOpen, anchorRef]);

  return (
    <nav
      className="ags-navbar"
      data-compact={compact ? "true" : undefined}
      data-flown={compact && pickOpen ? "true" : undefined}
      aria-label="Festival sections"
    >
      {NAV_ITEMS.map((item, i) => {
        const active = section === item.id;
        return (
          <button
            key={item.id}
            ref={(el) => {
              itemsRef.current[i] = el;
            }}
            type="button"
            className="ags-navbar__item"
            aria-current={active ? "true" : undefined}
            onClick={() => (active ? close() : open(item.id))}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
