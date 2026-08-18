import { venueSchedules } from "@/config/sections";
import { ExtLink } from "@/ui/ExtLink";
import { SlotRow } from "@/ui/SlotRow";

/** Each festival location, with the sessions happening there across both days. */
export function VenuePanel() {
  const venues = venueSchedules();

  return (
    <div>
      {venues.map(({ venue, ongoing, days }) => (
        <section
          key={venue.name}
          style={{
            marginBottom: "1.6rem",
            paddingBottom: "1.2rem",
            borderBottom: "1px solid rgba(244, 241, 234, 0.12)",
          }}
        >
          <div style={{ fontSize: "0.98rem", color: "var(--ags-fg)" }}>{venue.name}</div>
          {venue.org && (
            <div style={{ fontSize: "0.76rem", color: "var(--ags-muted)", marginTop: "0.15rem" }}>
              {venue.org}
            </div>
          )}

          <div style={{ display: "flex", gap: "0.9rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
            {venue.mapUrl && <ExtLink href={venue.mapUrl} label="Map" />}
            {venue.url && <ExtLink href={venue.url} label="Website" />}
            {venue.links?.map((l) => (
              <ExtLink key={l.url} href={l.url} label={l.label} />
            ))}
          </div>

          {ongoing.map((o) => (
            <div key={o.title} style={{ marginTop: "0.8rem", fontSize: "0.8rem", color: "var(--ags-fg)" }}>
              {o.title}
              <span style={{ color: "var(--ags-muted)" }}> — {o.when}</span>
              {o.note && (
                <div style={{ fontSize: "0.74rem", color: "var(--ags-muted)", marginTop: "0.15rem" }}>{o.note}</div>
              )}
            </div>
          ))}

          {days.map((d) => (
            <div key={d.label} style={{ marginTop: "0.85rem" }}>
              <div style={{ fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ags-muted)", marginBottom: "0.1rem" }}>
                {d.label}
              </div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {d.slots.map((slot, i) => (
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
