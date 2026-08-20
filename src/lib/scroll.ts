/**
 * Shared scroll helpers.
 *
 * Lives outside any one feature because three separate things read the same
 * page scroll — the camera descent, the floor guitar's mount gate, and the
 * footer fade. One implementation means they can't disagree about where the
 * bottom of the page is.
 */

/** Page scroll as 0..1. Guards the divide when the page can't scroll yet. */
export function scrollProgress(): number {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max <= 0) return 0;
  return Math.min(1, Math.max(0, window.scrollY / max));
}

/** Smooth 0..1 ramp, so things ease in instead of arriving linearly. */
export function smoothstep(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

/**
 * Call `fn` now and on every scroll or resize; returns the unsubscribe.
 *
 * Four components (camera descent, title rise, guitar mount gate, footer fade)
 * carried the same add/remove listener boilerplate. Resize is included because
 * anything derived from scrollProgress() changes when the document height
 * does. Scroll listens passive — none of these handlers preventDefault.
 */
export function watchScroll(fn: () => void): () => void {
  fn();
  window.addEventListener("scroll", fn, { passive: true });
  window.addEventListener("resize", fn);
  return () => {
    window.removeEventListener("scroll", fn);
    window.removeEventListener("resize", fn);
  };
}
