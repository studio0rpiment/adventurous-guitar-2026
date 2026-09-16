import type { CSSProperties } from "react";

export type IslandAlign = "flex-start" | "center" | "flex-end";

export interface IslandFrame {
  /** Position in the stream. 0 gets no overlap pull; later ones stack above. */
  index: number;
  align: IslandAlign;
  rotate: number;
  raised: boolean;
}

/**
 * The inline styles that make a thing in the stream *an island*: alignment,
 * tilt, the negative-margin overlap, stacking, and the lift shadow.
 *
 * Shared between the event islands (a button that opens a card) and the link
 * island (an anchor that leaves the site). The two elements differ in what
 * they do when tapped, not in how they float — so this is the seam.
 *
 * Overlap and width come from custom properties set per-breakpoint in
 * global.css (.ags-island-field), so phone layout is a CSS change.
 */
export function islandFrameStyle({ index, align, rotate, raised }: IslandFrame): CSSProperties {
  return {
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
  };
}
