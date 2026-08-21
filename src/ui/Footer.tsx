import { useEffect, useRef } from "react";
import { scrollProgress, smoothstep, watchScroll } from "@/lib/scroll";
import { FESTIVAL } from "@/config/festival";
import { MEDIA } from "@/config/media";
import { useNav } from "@/ui/nav";
import { SECTION_TITLES } from "@/config/nav";

/** Where in the page scroll the footer begins to appear (0..1). */
const FADE_START = 0.93;

/**
 * Where the festival name arrives (0..1) — a little after the marks start
 * coming up, so it lands as its own beat rather than riding in with them.
 *
 * The marks' fade is tied to scroll position: drag the page and they follow
 * your finger. The name isn't. It's a THRESHOLD — cross it and it fades in over
 * 300ms under its own steam, at the same speed whether you flicked to the
 * bottom or crept there. That's the difference between a thing being dragged
 * into view and a thing arriving.
 */
const LOCKUP_AT = 0.95;

const LOGO_ALT = "Shepherd School of Music at Rice";
const LOGO_HREF = "https://music.rice.edu/";

/** Studio credit: the SO monogram, with the wordmark stacked beside it. */
const CREDIT_HREF = "https://orpiment.studio";
const CREDIT_NAME = "Studio Orpiment";
const CREDIT_SHORT = "SO";
const CREDIT_LINES = ["Studio", "Orpiment"];

/**
 * The closing frame under the guitar: the festival's name as a full-width
 * lockup, with the presenting school's mark and the studio credit on a row
 * beneath it.
 *
 * The name used to be a 1rem line sharing that row. It's the title of the whole
 * piece, and at the end of a scroll that has just descended past the cables to
 * a guitar on the floor it should land like one — so it's its own band now, set
 * to fit one line at 1920 and never to break past two. With it out of the row,
 * the Rice mark moves over into the space it left.
 *
 * Fades in over the last stretch of scroll rather than sitting in the layout,
 * so it reads as the end of the piece instead of another block of page. A DOM
 * overlay, not part of the 3D scene: the marks stay crisp and the canvas pays
 * nothing for them.
 *
 * The fade writes straight to the element's style from the scroll handler. No
 * React state: opacity changes on nearly every scroll event, and re-rendering
 * the tree that often would be wasteful. The name's arrival is the exception
 * and it isn't per-scroll either — it's one attribute flip when its threshold
 * is crossed, and CSS carries the 300ms from there.
 */
export function Footer() {
  const { open } = useNav();
  const ref = useRef<HTMLElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const lockupRef = useRef<HTMLParagraphElement>(null);
  /** Last value written, so the crossing is a single DOM write and not one per
   *  scroll event. */
  const shown = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () => {
      const progress = scrollProgress();
      const t = smoothstep((progress - FADE_START) / (1 - FADE_START));
      // The marks track scroll continuously; the name is a state change.
      if (rowRef.current) rowRef.current.style.opacity = String(t);

      const isShown = progress >= LOCKUP_AT;
      if (isShown !== shown.current) {
        shown.current = isShown;
        if (lockupRef.current) lockupRef.current.dataset.shown = String(isShown);
      }
      // Only clickable once it's actually visible, so an invisible footer can
      // never swallow a click meant for the scene.
      el.style.pointerEvents = t > 0.6 ? "auto" : "none";
      el.style.transform = `translateY(${(1 - t) * 14}px)`;
    };
    return watchScroll(apply);
  }, []);

  return (
    <footer ref={ref} className="ags-footer" aria-label="Festival footer">
      <p ref={lockupRef} className="ags-footer__lockup" data-shown="false">
        The {FESTIVAL.name}
      </p>

      <div ref={rowRef} className="ags-footer__row">
        <a
          className="ags-footer__logo"
          href={LOGO_HREF}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={MEDIA.shepherdLogo} alt={LOGO_ALT} />
        </a>

        {/* The notice opens in the same panel shell as the programme sections —
            it's a section, just not a menu one. */}
        <button
          type="button"
          className="ags-footer__privacy"
          onClick={() => open("privacy")}
        >
          {SECTION_TITLES.privacy}
        </button>

        <a
          className="ags-footer__credit"
          href={CREDIT_HREF}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={CREDIT_NAME}
        >
          {/* aria-label carries the name, so both marks are decorative here and
              CSS is free to show the wordmark only where there's room for it. */}
          <span className="ags-footer__credit-short" aria-hidden>
            {CREDIT_SHORT}
          </span>
          <span className="ags-footer__credit-full" aria-hidden>
            {CREDIT_LINES.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </span>
        </a>
      </div>
    </footer>
  );
}
