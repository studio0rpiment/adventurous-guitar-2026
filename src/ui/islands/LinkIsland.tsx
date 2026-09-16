import { Island } from "./Island";
import { islandFrameStyle, type IslandFrame } from "./frame";

/**
 * An island that is a plain outbound link — no card, no turn. Tapping it
 * leaves for the ticket page in a new tab.
 *
 * Same frame and same artwork as the event islands so it reads as one of
 * them, but it's an <a>, not a role=button: the browser gives it open-in-new-
 * tab, copy link, and the right cursor for free, and screen readers announce
 * it as a link rather than a details button.
 *
 * `raised` is owned by IslandField like every other island's; focus and
 * pointer-enter both lift it (event-driven, no timers).
 */
export function LinkIsland({
  id,
  href,
  label,
  top,
  title,
  sub,
  note,
  onRaise,
  ...frame
}: IslandFrame & {
  id: string;
  href: string;
  /** Accessible name — the art is SVG text. */
  label: string;
  top?: string;
  title: string;
  sub?: string;
  note?: string;
  onRaise: () => void;
}) {
  return (
    <a
      className="ags-island ags-island--link"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens in a new tab)`}
      onFocus={onRaise}
      onPointerEnter={onRaise}
      style={{ ...islandFrameStyle(frame), display: "block", textDecoration: "none" }}
    >
      <Island id={id} top={top} title={title} sub={sub} note={note} />
    </a>
  );
}
