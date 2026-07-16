import type { CSSProperties } from "react";

const WORD = "ENTER";

// Timing (seconds). One cycle = L→R flip wave, then R→L flip wave, then a pause.
const FLIP = 0.15; // one letter's flip
const STAGGER = 0.12; // gap between letters within a wave
const PAUSE = 3.0; // hold after the two waves before repeating

const N = WORD.length;
const WAVE = (N - 1) * STAGGER + FLIP; // length of one wave
const CYCLE = 2 * WAVE + PAUSE; // full loop length

/**
 * Build one letter's keyframes. In the first wave letters rotate to 180°
 * (halfway) staggered left→right; in the second they rotate back to 0
 * staggered right→left; then everything holds through the pause. Timing is
 * expressed as % of the shared CYCLE so all letters loop together.
 */
function keyframesFor(i: number): string {
  const pct = (t: number) => Math.round((t / CYCLE) * 1000) / 10;
  const t1s = i * STAGGER; // wave 1 start (left→right)
  const t1e = t1s + FLIP;
  const t2s = WAVE + (N - 1 - i) * STAGGER; // wave 2 start (right→left)
  const t2e = t2s + FLIP;

  const stops = new Map<number, number>();
  stops.set(0, 0);
  stops.set(pct(t1s), 0);
  stops.set(pct(t1e), 180); // wave 1: rotate to halfway
  stops.set(pct(t2s), 180); // hold until wave 2 reaches it
  stops.set(pct(t2e), 0); // wave 2: rotate back
  stops.set(100, 0);

  const body = [...stops.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([p, deg]) => `${p}%{transform:rotateY(${deg}deg)}`)
    .join("");
  return `@keyframes ags-enter-${i}{${body}}`;
}

const KEYFRAMES = Array.from({ length: N }, (_, i) => keyframesFor(i)).join("\n");

/**
 * The "ENTER" cue: upright, level letters that flip in place around the Y axis.
 * See keyframesFor for the L→R / R→L / pause choreography. Disabled under
 * prefers-reduced-motion (global.css).
 */
export function EnterCue() {
  return (
    <>
      <style>{KEYFRAMES}</style>
      <span
        aria-label={WORD}
        style={{
          display: "inline-flex",
          alignItems: "baseline",
          gap: "0.12em",
          perspective: "400px", // gives the rotateY flip real 3D depth
          fontFamily: "var(--font-body)",
          fontSize: "0.9rem",
          textTransform: "uppercase",
          color: "#ffffff",
        }}
      >
        {WORD.split("").map((ch, i) => {
          const style = {
            display: "inline-block",
            animation: `ags-enter-${i} ${CYCLE}s ease-in-out infinite`,
          } as CSSProperties;
          return (
            <span key={i} className="ags-enter-letter" aria-hidden style={style}>
              {ch}
            </span>
          );
        })}
      </span>
    </>
  );
}
