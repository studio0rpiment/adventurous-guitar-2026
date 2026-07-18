/**
 * Annotation over the festival logo: a dot on Houston, TX with a two-segment
 * "arm" leader line to a label linking the Shepherd School of Music at Rice.
 *
 * Coordinates are in the logo's own 1122×1402 pixel space. The parent must be a
 * relatively-positioned box with the SAME aspect ratio (1122/1402) so these map
 * 1:1 onto the rendered logo. Tune the three points below to reposition.
 */
const VB_W = 1122;
const VB_H = 1402;

const HOUSTON = { x: 452, y: 322 }; // dot on the upper Texas coast
const ELBOW = { x: 392, y: 270 }; // single bend ("arm")
const JOIN = { x: 300, y: 270 }; // where the label meets the line

const DOT_R = 6; // Houston dot radius (logo units)
const GAP = 14; // space between the arm's tip and the dot (technical-diagram look)
const STROKE = 0.75; // non-scaling line weight (CSS px)

const RICE_URL = "https://music.rice.edu/";

// Stop the arm short of the dot so the line reads as a detached leader.
const _dx = HOUSTON.x - ELBOW.x;
const _dy = HOUSTON.y - ELBOW.y;
const _len = Math.hypot(_dx, _dy);
const TIP = {
  x: HOUSTON.x - (_dx / _len) * (GAP + DOT_R),
  y: HOUSTON.y - (_dy / _len) * (GAP + DOT_R),
};

export function RiceCallout() {
  return (
    <>
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          overflow: "visible",
          pointerEvents: "none",
        }}
      >
        <polyline
          points={`${JOIN.x},${JOIN.y} ${ELBOW.x},${ELBOW.y} ${TIP.x.toFixed(1)},${TIP.y.toFixed(1)}`}
          fill="none"
          stroke="#ffffff"
          strokeWidth={STROKE}
          strokeLinejoin="miter"
          strokeLinecap="butt"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={HOUSTON.x} cy={HOUSTON.y} r={DOT_R} fill="#ffffff" />
      </svg>

      <a
        href={RICE_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          left: `${(JOIN.x / VB_W) * 100}%`,
          top: `${(JOIN.y / VB_H) * 100}%`,
          transform: "translate(-100%, -50%)",
          paddingRight: "0.35rem",
          whiteSpace: "nowrap",
          fontFamily: "var(--font-body)",
          // ~0.5rem on desktop, scales down with the logo on small screens
          // (cqw = 1% of the container/logo width) so it doesn't overflow.
          fontSize: "clamp(0.4rem, 1.3cqw, 0.5rem)",
          letterSpacing: "0.02em",
          color: "#ffffff",
          textDecoration: "none",
          pointerEvents: "auto",
        }}
      >
        Shepherd School of Music at Rice
      </a>
    </>
  );
}
