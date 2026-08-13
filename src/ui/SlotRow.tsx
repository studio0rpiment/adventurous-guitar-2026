import type { ScheduleSlot } from "@/config/sections";

// Kind -> dot colour (accent for stage, cyan for talks, muted for social).
const KIND_COLOR: Record<string, string> = {
  performance: "var(--ags-accent)",
  talk: "#7fb0ff",
  social: "var(--ags-muted)",
};

/** One schedule entry: time + titled detail with a kind dot. Reused by the
 *  day view (SchedulePanel) and the per-venue view (VenuePanel). */
export function SlotRow({ slot }: { slot: ScheduleSlot }) {
  return (
    <li
      style={{
        display: "grid",
        gridTemplateColumns: "6.5rem 1fr",
        gap: "0.75rem",
        padding: "0.55rem 0",
        borderTop: "1px solid rgba(244, 241, 234, 0.1)",
      }}
    >
      <span
        style={{
          fontVariantNumeric: "tabular-nums",
          color: "var(--ags-muted)",
          fontSize: "0.8rem",
        }}
      >
        {slot.time}
      </span>
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
          <span
            aria-hidden
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              flex: "0 0 auto",
              transform: "translateY(-1px)",
              background: KIND_COLOR[slot.kind ?? "performance"],
            }}
          />
          <span style={{ fontSize: "0.9rem", color: "var(--ags-fg)" }}>
            {slot.title}
          </span>
        </div>
        <div style={{ marginLeft: "1rem" }}>
          {slot.performers && (
            <div style={{ fontSize: "0.78rem", color: "var(--ags-fg)", opacity: 0.85, marginTop: "0.2rem" }}>
              {slot.performers}
            </div>
          )}
          {slot.note && (
            <div style={{ fontSize: "0.74rem", color: "var(--ags-muted)", marginTop: "0.2rem", lineHeight: 1.45 }}>
              {slot.note}
            </div>
          )}
          {slot.link && (
            <a href={slot.link} target="_blank" rel="noopener noreferrer" className="ags-link" style={{ display: "inline-block", marginTop: "0.35rem" }}>
              Details ↗
            </a>
          )}
        </div>
      </div>
    </li>
  );
}
