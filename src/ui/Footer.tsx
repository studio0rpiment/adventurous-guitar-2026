import { useEffect, useRef } from "react";
import { scrollProgress, smoothstep } from "@/lib/scroll";

/** Where in the page scroll the footer begins to appear (0..1). */
const FADE_START = 0.93;

/** Presenting institution — the logo is a transparent PNG of navy artwork. */
const LOGO_SRC = "/img/Horizontal%20logo_New%20Branding_Blue.png";
const LOGO_ALT = "Shepherd School of Music at Rice";
const LOGO_HREF = "https://music.rice.edu/";

/**
 * The footer: the Shepherd School mark, under the guitar, at the very end.
 *
 * Fades in over the last stretch of scroll rather than sitting in the layout,
 * so it reads as the end of the piece instead of another block of page. It's a
 * DOM overlay, not part of the 3D scene — the mark stays crisp at any size and
 * costs the canvas nothing.
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
    <footer ref={ref} className="ags-footer" aria-label="Presented by">
      <a href={LOGO_HREF} target="_blank" rel="noopener noreferrer">
        <img src={LOGO_SRC} alt={LOGO_ALT} />
      </a>
    </footer>
  );
}
