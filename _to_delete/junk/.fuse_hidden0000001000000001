import { FESTIVAL } from "@/config/festival";

// Three display lines for the title lockup.
const TITLE_LINES = ["Adventurous", "Electric Guitar", "Festival"];

/**
 * Festival title over the cable scene. Centered, all-caps, in the site font.
 * Decorative overlay — pointer-events pass through so the cable stays grabbable.
 */
export function Title() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "grid",
        placeItems: "center",
        pointerEvents: "none",
        padding: "1rem",
        zIndex: 5,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-body)",
            fontWeight: 400,
            textTransform: "uppercase",
            color: "var(--ags-fg)",
            fontSize: "clamp(2.2rem, 8vw, 4rem)",
            lineHeight: 1.05,
            letterSpacing: "0.04em",
          }}
        >
          {TITLE_LINES.map((line) => (
            <span key={line} style={{ display: "block" }}>
              {line}
            </span>
          ))}
        </h1>
        <div
          style={{
            marginTop: "0.7rem",
            fontFamily: "var(--font-body)",
            textTransform: "uppercase",
            color: "var(--ags-muted)",
            fontSize: "clamp(1.1rem, 4vw, 2rem)",
            letterSpacing: "0.14em",
          }}
        >
          {FESTIVAL.dates}
        </div>
      </div>
    </div>
  );
}
