import { ABOUT } from "@/config/participants";
import { FESTIVAL } from "@/config/festival";

const META_ROW: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "7rem 1fr",
  gap: "0.75rem",
  padding: "0.5rem 0",
  borderTop: "1px solid rgba(244, 241, 234, 0.1)",
  fontSize: "0.78rem",
};

const META_LABEL: React.CSSProperties = {
  color: "var(--ags-muted)",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  fontSize: "0.68rem",
};

/** What the festival is, who runs it, and who backs it. */
export function AboutPanel() {
  return (
    <div>
      {ABOUT.body.map((para, i) => (
        <p
          key={i}
          style={{
            margin: i === 0 ? "0 0 0.85rem" : "0 0 0.85rem",
            fontSize: "0.85rem",
            lineHeight: 1.6,
            color: "var(--ags-fg)",
            opacity: 0.9,
          }}
        >
          {para}
        </p>
      ))}

      <div style={{ marginTop: "1.2rem" }}>
        <div style={META_ROW}>
          <span style={META_LABEL}>Founded by</span>
          <span>{ABOUT.founders.join(" & ")}</span>
        </div>
        <div style={META_ROW}>
          <span style={META_LABEL}>Presented by</span>
          <span>{ABOUT.presenter}</span>
        </div>
        <div style={META_ROW}>
          <span style={META_LABEL}>Support</span>
          <span>{ABOUT.support}</span>
        </div>
        <div style={META_ROW}>
          <span style={META_LABEL}>Dates</span>
          <span>{FESTIVAL.dates}</span>
        </div>
      </div>
    </div>
  );
}
