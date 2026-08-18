import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { FestivalEvent } from "@/config/events";
import { EventDetail } from "@/ui/event/EventDetail";

/** Where the island was on screen when it was tapped, and how it was tilted. */
export interface IslandOrigin {
  rect: DOMRect;
  rotate: number;
  /** The island's rect *now*. The card returns to where the island currently
   *  is, not where it was — the reader may have scrolled while it was open. */
  liveRect?: () => DOMRect | null;
}

const DURATION = 340;

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The opened island: an event's full detail, arriving as if the island itself
 * had straightened up and grown into a readable card.
 *
 * **FLIP, and it has to be.** The card is rendered where it finally belongs,
 * measured, and then transformed *back* onto the island's own rect (position,
 * scale and its tilt) for one frame before releasing to identity. The reason
 * it can't simply expand in the scroll flow: growing an island pushes
 * everything below it down by hundreds of pixels, and CameraPan measures
 * `.ags-island-field`'s bottom edge on mount and resize only — a height change
 * with no resize would leave the guitar's descent starting from a stale
 * position. Out of flow, none of that moves.
 *
 * Portalled to <body> rather than rendered in place: InfoSections is a z-index
 * stacking context, so an overlay inside it can never sit above its siblings
 * however high its own z-index goes.
 *
 * The scrim locks scrolling with `touch-action: none` rather than by pinning
 * the body. Pinning changes `window.scrollY`, and three things here read page
 * scroll to decide where the camera is — the reveal would jump to the top
 * behind the card.
 *
 * Motion is state-driven, not timed: the transition begins on a layout effect
 * after mount and the close unmounts on `transitionend`. The one timer is a
 * fallback for the case where `transitionend` never fires (an interrupted or
 * skipped transition), so a cancelled animation can't strand the overlay.
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
  const [closing, setClosing] = useState(false);

  // Play the island → card move. Layout effect so the card is never painted at
  // its final position before being pulled back onto the island.
  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    card.focus({ preventScroll: true });
    if (!origin || reducedMotion()) return;

    const to = card.getBoundingClientRect();
    if (!to.width || !to.height) return;
    const { rect: from, rotate } = origin;

    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    const sx = from.width / to.width;
    const sy = from.height / to.height;

    card.style.transition = "none";
    card.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy}) rotate(${rotate}deg)`;
    card.style.opacity = "0.35";

    // Two frames: one to commit the inverted state, one to release it. A single
    // rAF is sometimes coalesced with the style write and the transition is
    // skipped entirely.
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        card.style.transition = `transform ${DURATION}ms cubic-bezier(0.2, 0.7, 0.2, 1), opacity ${DURATION}ms ease`;
        card.style.transform = "none";
        card.style.opacity = "1";
      });
    });
    return () => cancelAnimationFrame(id);
  }, [origin]);

  // Escape closes, like the section panels.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") startClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closing, origin]);

  /** Run the move in reverse, then unmount. The island is still in the page,
   *  so its rect is re-read now rather than reused — the reader may have
   *  scrolled, and the card should return to where the island actually is. */
  function startClose() {
    const card = cardRef.current;
    if (closing) return;
    setClosing(true);

    const from = origin?.liveRect?.() ?? origin?.rect;
    if (!card || !from || reducedMotion()) {
      onClose();
      return;
    }

    const to = card.getBoundingClientRect();
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    const sx = from.width / to.width;
    const sy = from.height / to.height;

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      onClose();
    };
    card.addEventListener("transitionend", finish, { once: true });
    // Safety net only: transitionend doesn't fire if the transition is
    // interrupted or never starts, and a stranded overlay would trap the page.
    window.setTimeout(finish, DURATION + 120);

    card.style.transition = `transform ${DURATION}ms cubic-bezier(0.4, 0, 0.6, 1), opacity ${DURATION}ms ease`;
    card.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy}) rotate(${origin?.rotate ?? 0}deg)`;
    card.style.opacity = "0";
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
        className="ags-panel ags-island-card"
        onPointerDown={(e) => e.stopPropagation()}
      >
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
    </div>,
    document.body,
  );
}
