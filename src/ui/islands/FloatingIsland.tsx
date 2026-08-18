import type { ReactNode } from "react";

export type IslandAlign = "flex-start" | "center" | "flex-end";

/**
 * Positioned wrapper for one scroll-stream island: alignment, tilt, overlap and
 * stacking. Purely presentational — IslandField owns which island is raised.
 *
 * Two things it has to get right:
 *  - The field itself is pointer-transparent on desktop so the cables stay
 *    grabbable; each island re-enables pointer events on ITSELF, so the gaps
 *    still pass through but the card is tappable.
 *  - Vertical overlap comes from the --ags-island-overlap custom property, set
 *    per-breakpoint in global.css. Phones get much less overlap so the islands
 *    don't pile on top of each other.
 *
 * Opening is event-driven: click or Enter/Space, no timers. Deliberately click
 * and not pointerdown — on touch, a swipe that scrolls the page never becomes a
 * click, so scrolling past an island doesn't open it.
 *
 * `onOpen` is handed the island's own element rather than a ref from above:
 * the opened card grows out of exactly this rect, and the element that owns
 * the geometry is the one that should report it.
 */
export function FloatingIsland({
  index,
  align,
  rotate,
  raised,
  onRaise,
  onOpen,
  label,
  children,
}: {
  index: number;
  align: IslandAlign;
  rotate: number;
  raised: boolean;
  onRaise: () => void;
  /** Show the event's full detail, growing out of this element. */
  onOpen: (el: HTMLElement) => void;
  /** Accessible name — the island's title, since the art is SVG text. */
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      className="ags-island"
      role="button"
      tabIndex={0}
      aria-label={`Show details: ${label}`}
      aria-haspopup="dialog"
      onClick={(e) => onOpen(e.currentTarget)}
      onFocus={onRaise}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(e.currentTarget);
        }
      }}
      style={{
        alignSelf: align,
        marginTop: index === 0 ? 0 : "var(--ags-island-overlap)",
        width: "var(--ags-island-w)",
        // Later islands sit above earlier ones by default; a raised island
        // jumps clear of the whole stack.
        zIndex: raised ? 999 : index + 1,
        position: "relative",
        cursor: "pointer",
        pointerEvents: "auto",
        transform: `rotate(${rotate}deg)`,
        filter: raised
          ? "drop-shadow(0 18px 44px rgba(0, 0, 0, 0.8))"
          : "drop-shadow(0 12px 34px rgba(0, 0, 0, 0.65))",
        transition: "filter 0.2s ease",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {children}
    </div>
  );
}
