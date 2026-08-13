import { ONGOING, SCHEDULE } from "@/config/sections";
import { SlotRow } from "@/ui/SlotRow";

/** Two-day schedule, organized by day then grouped by venue. */
export function SchedulePanel() {
  return (
    <div>
      {ONGOING.map((item) => (
        <section
          key={item.title}
          style={{
            marginBottom: "1.5rem",
            padding: "0.75rem 0.9rem",
            border: "1px solid rgba(244, 241, 234, 0.18)",
            borderRadius: "2px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "baseline" }}>
            <span style={{ fontSize: "0.9rem", color: "var(--ags-fg)" }}>{item.title}</span>
            <span style={{ fontSize: "0.75rem", color: "var(--ags-muted)", whiteSpace: "nowrap" }}>{item.when}</span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--ags-accent)", marginTop: "0.2rem" }}>{item.venue}</div>
          {item.note && (
            <div style={{ fontSize: "0.74rem", color: "var(--ags-muted)", marginTop: "0.3rem" }}>{item.note}</div>
          )}
        </section>
      ))}

      {SCHEDULE.map((day) => (
        <section key={day.date} style={{ marginBottom: "1.75rem" }}>
          <h3
            style={{
              margin: "0 0 0.85rem",
              fontSize: "0.8rem",
              fontWeight: 400,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--ags-fg)",
            }}
          >
            {day.label}
          </h3>

          {day.blocks.map((block) => (
            <div key={block.venue} style={{ marginBottom: "1.1rem" }}>
              <div style={{ marginBottom: "0.15rem" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--ags-accent)" }}>{block.venue}</span>
                {block.venueNote && (
                  <span style={{ fontSize: "0.72rem", color: "var(--ags-muted)" }}> — {block.venueNote}</span>
                )}
              </div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {block.slots.map((slot, i) => (
                  <SlotRow key={i} slot={slot} />
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
