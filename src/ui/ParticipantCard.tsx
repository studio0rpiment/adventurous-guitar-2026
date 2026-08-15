import { participantAppearances, type Participant } from "@/config/participants";

/** Initials fallback while we're still waiting on photos. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/**
 * One participant: portrait (or initials), name, role, bio, links, and where
 * they appear in the programme. Appearances are derived in participants.ts, so
 * this stays presentational — same split as SlotRow / SchedulePanel.
 */
export function ParticipantCard({ participant }: { participant: Participant }) {
  const { name, role, bio, image, links, members } = participant;
  const appearances = participantAppearances(participant);

  return (
    <article
      style={{
        display: "grid",
        gridTemplateColumns: "3.25rem 1fr",
        gap: "0.9rem",
        padding: "1rem 0",
        borderTop: "1px solid rgba(244, 241, 234, 0.12)",
      }}
    >
      {image ? (
        <img
          src={image}
          alt=""
          width={52}
          height={52}
          style={{ width: "3.25rem", height: "3.25rem", objectFit: "cover", borderRadius: "2px" }}
        />
      ) : (
        <div
          aria-hidden
          style={{
            width: "3.25rem",
            height: "3.25rem",
            display: "grid",
            placeItems: "center",
            borderRadius: "2px",
            border: "1px solid rgba(244, 241, 234, 0.18)",
            color: "var(--ags-muted)",
            fontSize: "0.8rem",
            letterSpacing: "0.06em",
          }}
        >
          {initials(name)}
        </div>
      )}

      <div>
        <div style={{ fontSize: "0.95rem", color: "var(--ags-fg)" }}>{name}</div>
        {role && (
          <div style={{ fontSize: "0.75rem", color: "var(--ags-accent)", marginTop: "0.1rem" }}>
            {role}
          </div>
        )}

        {bio ? (
          <p
            style={{
              margin: "0.5rem 0 0",
              fontSize: "0.78rem",
              lineHeight: 1.5,
              color: "var(--ags-fg)",
              opacity: 0.85,
            }}
          >
            {bio}
          </p>
        ) : (
          <p
            style={{
              margin: "0.5rem 0 0",
              fontSize: "0.74rem",
              color: "var(--ags-muted)",
              fontStyle: "italic",
            }}
          >
            Bio to come.
          </p>
        )}

        {members && members.length > 0 && (
          <ul style={{ listStyle: "none", margin: "0.7rem 0 0", padding: 0 }}>
            {members.map((m) => (
              <li
                key={m.name}
                style={{
                  marginTop: "0.5rem",
                  paddingLeft: "0.7rem",
                  borderLeft: "1px solid rgba(244, 241, 234, 0.18)",
                }}
              >
                <span style={{ fontSize: "0.8rem", color: "var(--ags-fg)" }}>{m.name}</span>
                {m.role && (
                  <span style={{ fontSize: "0.72rem", color: "var(--ags-muted)" }}> — {m.role}</span>
                )}
                {m.bio && (
                  <p
                    style={{
                      margin: "0.2rem 0 0",
                      fontSize: "0.74rem",
                      lineHeight: 1.5,
                      color: "var(--ags-fg)",
                      opacity: 0.8,
                    }}
                  >
                    {m.bio}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        {appearances.length > 0 && (
          <ul style={{ listStyle: "none", margin: "0.6rem 0 0", padding: 0 }}>
            {appearances.map((a, i) => (
              <li
                key={i}
                style={{ fontSize: "0.73rem", color: "var(--ags-muted)", marginTop: "0.15rem" }}
              >
                <span style={{ fontVariantNumeric: "tabular-nums" }}>{a.when}</span>
                {" — "}
                {a.title}
                <span style={{ opacity: 0.75 }}> · {a.venue}</span>
              </li>
            ))}
          </ul>
        )}

        {links && links.length > 0 && (
          <div style={{ display: "flex", gap: "0.9rem", flexWrap: "wrap", marginTop: "0.55rem" }}>
            {links.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ags-link"
              >
                {l.label} ↗
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
