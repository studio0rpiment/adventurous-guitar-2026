import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { FestivalEvent } from "@/config/events";
import { EventDetail } from "@/ui/event/EventDetail";
import { Island } from "@/ui/islands/Island";
import { islandSummary } from "@/ui/islands/summary";
import type { Box } from "@/ui/islands/geometry";

/** Where the island was on screen when it was tapped, and how it was tilted. */
export interface IslandOrigin {
  /** The island's untilted box — see geometry.untiltedBox. */
  box: Box;
  rotate: number;
  /** The island's box *now*. The card returns to where the island currently
   *  is, not where it was — the reader may have scrolled while it was open. */
  liveBox?: () => Box | null;
}

const OPEN_MS = 640;
const CLOSE_MS = 520;

/* The weight of the turn. The stone rises toward the viewer as it goes over and
   settles back down: LIFT_Z is that rise in perspective units, LIFT_Y the small
   arc it travels through, TIP_X the sideways tilt that stops the move reading
   as a flat card-flip. */
const LIFT_Z = 90;
const LIFT_Y = 26;
const TIP_X = -10;

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The turn itself, as three poses.
 *
 * Every keyframe lists the SAME transform functions in the same order — that's
 * what makes the browser interpolate them one by one instead of decomposing
 * matrices, which is the difference between a stone going over and a shape
 * smearing between two states.
 *
 * The easings are split at the halfway point on purpose. A stone you flip
 * resists at first (you're lifting it against its own weight), goes over the
 * top, then drops and settles: accelerate into the tip, decelerate out of it.
 * A single ease across the whole move feels like a UI panel, not an object.
 *
 * Origin is TOP-CENTRE and the scale is uniform, so the front face lands
 * exactly on the island it grew from — the island's artwork is top-aligned in
 * the card and the same width, so one scale factor registers both.
 */
function flipFrames(from: Box, to: DOMRect, tilt: number): Keyframe[] {
  const dx = from.left + from.width / 2 - (to.left + to.width / 2);
  const dy = from.top - to.top;
  const s = from.width / to.width;
  // Most of the growth happens before the halfway point, so the face you end up
  // reading is already near full size when it comes into view.
  const mid = s + (1 - s) * 0.62;

  const pose = (
    x: number,
    y: number,
    z: number,
    scale: number,
    rx: number,
    ry: number,
    rz: number,
  ) =>
    `translate(${x}px, ${y}px) translateZ(${z}px) scale(${scale}) ` +
    `rotateX(${rx}deg) rotateY(${ry}deg) rotate(${rz}deg)`;

  return [
    {
      offset: 0,
      transform: pose(dx, dy, 0, s, 0, -180, tilt),
      easing: "cubic-bezier(0.5, 0, 0.75, 0.4)",
    },
    {
      offset: 0.5,
      transform: pose(dx * 0.42, dy * 0.42 - LIFT_Y, LIFT_Z, mid, TIP_X, -90, tilt * 0.45),
      easing: "cubic-bezier(0.25, 0.8, 0.3, 1)",
    },
    { offset: 1, transform: pose(0, 0, 0, 1, 0, 0, 0) },
  ];
}

/**
 * The opened island — the event turned over like a stone.
 *
 * The card is genuinely two-sided. Its FRONT is the island's own artwork, its
 * BACK is the detail, both `backface-visibility: hidden`, and the container
 * turns 180° about its vertical axis: you watch the island go edge-on and the
 * information arrive on its underside. Without a real front face this is just a
 * dialog spinning, which is the thing that doesn't feel like an object.
 *
 * **It can't expand in the scroll flow.** Growing an island in place pushes
 * everything below it down by hundreds of pixels, and CameraPan measures
 * `.ags-island-field`'s bottom edge on mount and resize only — a height change
 * with no resize leaves the guitar's descent starting from a stale position.
 * Out of flow, none of that moves.
 *
 * Portalled to <body>: InfoSections is a z-index stacking context, so an
 * overlay inside it can never rise above its siblings however high its own
 * z-index goes. The scrim carries the `perspective` (depth has to come from an
 * ancestor) and locks scrolling with `touch-action: none` rather than by
 * pinning the body — pinning changes `window.scrollY`, and three things here
 * read page scroll to place the camera.
 *
 * The Web Animations API rather than a CSS transition: this needs a midpoint
 * pose (the lift, the tip, the 90° edge) that a two-state transition can't
 * express, and `element.animate()` starts on its own timeline with no
 * style-flush race — the double-rAF dance a FLIP transition needs is gone.
 */
export function ExpandedIsland({
  event,
  origin,
  onClose,
}: {
  event: FestivalEvent;
  origin: IslandOrigin | null;
  onClose: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<Animation | null>(null);
  const [closing, setClosing] = useState(false);

  // Layout effect so the card is never painted at rest before it's turned back
  // onto the island.
  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    card.focus({ preventScroll: true });
    if (!origin || reducedMotion() || typeof card.animate !== "function") return;

    const to = card.getBoundingClientRect();
    if (!to.width || !to.height) return;

    // fill: "backwards" only — the last pose IS the element's resting style, so
    // nothing needs to be held or cleaned up after it finishes.
    animRef.current = card.animate(flipFrames(origin.box, to, origin.rotate), {
      duration: OPEN_MS,
      fill: "backwards",
    });

    return () => animRef.current?.cancel();
  }, [origin]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") startClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closing, origin]);

  /**
   * Turn it back. The island is still in the page, so its rect is re-read now
   * rather than reused — the reader may have scrolled while it was open.
   */
  function startClose() {
    const card = cardRef.current;
    if (closing) return;
    setClosing(true);

    const from = origin?.liveBox?.() ?? origin?.box;
    if (!card || !from || reducedMotion() || typeof card.animate !== "function") {
      onClose();
      return;
    }

    // Cancel any in-flight opening first: getBoundingClientRect reports the
    // TRANSFORMED box, so measuring mid-turn would aim at the wrong target.
    animRef.current?.cancel();
    const to = card.getBoundingClientRect();

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      onClose();
    };

    const anim = card.animate(flipFrames(from, to, origin?.rotate ?? 0), {
      duration: CLOSE_MS,
      direction: "reverse",
      fill: "forwards",
    });
    animRef.current = anim;
    anim.onfinish = finish;
    anim.oncancel = finish;
    // Safety net: a cancelled or never-started animation must not strand the
    // overlay over the page.
    window.setTimeout(finish, CLOSE_MS + 120);
  }

  return createPortal(
    <div
      className="ags-panel-scrim ags-island-scrim"
      data-closing={closing || undefined}
      onPointerDown={startClose}
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={event.title}
        tabIndex={-1}
        className="ags-island-card"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Back face — in normal flow, so it's what gives the card its size. */}
        <div className="ags-island-face ags-island-face--back">
          <button
            type="button"
            className="ags-island-card__close"
            aria-label="Close"
            onClick={startClose}
          >
            {"×"}
          </button>
          <div className="ags-island-card__body">
            <EventDetail event={event} size="large" />
          </div>
        </div>

        {/* Front face — the island itself, laid over the back and hidden the
            moment the turn passes 90°. Its own id, because the page's island is
            still mounted and SVG path ids have to stay unique. */}
        <div className="ags-island-face ags-island-face--front" aria-hidden>
          <Island id={`flip-${event.id}`} {...islandSummary(event)} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
