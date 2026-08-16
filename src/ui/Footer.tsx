import { useEffect, useRef } from "react";
import { scrollProgress, smoothstep } from "@/lib/scroll";
import { FESTIVAL } from "@/config/festival";
import { MEDIA } from "@/config/media";

/** Where in the page scroll the footer begins to appear (0..1). */
const FADE_START = 0.93;

const LOGO_ALT = "Shepherd School of Music at Rice";
const LOGO_HREF = "https://music.rice.edu/";

/** Studio credit: the SO monogram, with the wordmark stacked beside it. */
const CREDIT_HREF = "https://orpiment.studio";
const CREDIT_NAME = "Studio Orpiment";
const CREDIT_SHORT = "SO";
const CREDIT_LINES = ["Studio", "Orpiment"];

/**
 * The footer: festival name, the presenting school's mark, and the studio
 * credit — at the very end, under the guitar.
 *
 * Fades in over the last stretch of scroll rather than sitting in the layout,
 * so it reads as the end of the piece instead of another block of page. A DOM
 * overlay, not part of the 3D scene: the marks stay crisp and the canvas pays
 * nothing for them.
 *
 * The fade writes straight to the element's style from the scroll handler. No
 * React state: opacity changes on nearly every scroll event, and re-rendering
 * the tree that often would be wasteful.
 */
export function Footer() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () => {
      const t = smoothstep((scrollProgress() - FADE_START) / (1 - FADE_START));
      el.style.opacity = String(t);
      // Only clickable once it's actually visible, so an invisible footer can
      // never swallow a click meant for the scene.
      el.style.pointerEvents = t > 0.6 ? "auto" : "none";
      el.style.transform = `translateY(${(1 - t) * 14}px)`;
    };
    apply();
    window.addEventListener("scroll", apply, { passive: true });
    window.addEventListener("resize", apply);
    return () => {
      window.removeEventListener("scroll", apply);
      window.removeEventListener("resize", apply);
    };
  }, []);

  return (
    <footer ref={ref} className="ags-footer" aria-label="Festival footer">
      <p className="ags-footer__name">The {FESTIVAL.name}</p>

      <a
        className="ags-footer__logo"
        href={LOGO_HREF}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src={MEDIA.shepherdLogo} alt={LOGO_ALT} />
      </a>

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
    </footer>
  );
}
