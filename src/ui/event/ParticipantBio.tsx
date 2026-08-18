import type { Participant } from "@/config/participants";
import { ExtLink } from "@/ui/ExtLink";

/**
 * A participant's bio as it appears inside an event — set in the card's own
 * type, not as a transplanted roster card.
 *
 * Deliberately less than `ParticipantCard`: no portrait, and no list of
 * appearances, because you are already standing inside one of them. What's left
 * is what you actually want after tapping a name — who they are, who else is in
 * the group, and where to hear them.
 *
 * Paragraphs use the same `.ags-event__para` class as the event's own abstract,
 * so a bio and a talk description are the same voice on the page rather than
 * two components' idea of body copy.
 */
export function ParticipantBio({ participant }: { participant: Participant }) {
  const { bio, members, links } = participant;

  return (
    <div className="ags-event__bio">
      {bio ? (
        bio.split(/\n\s*\n/).map((para, i) => (
          <p key={i} className="ags-event__para">
            {para}
          </p>
        ))
      ) : (
        <p className="ags-event__para ags-event__para--awaiting">Bio to come.</p>
      )}

      {members && members.length > 0 && (
        <ul className="ags-event__members">
          {members.map((m) => (
            <li key={m.name}>
              <span className="ags-event__member-name">{m.name}</span>
              {m.role && <span className="ags-event__member-role"> — {m.role}</span>}
              {m.bio && <p className="ags-event__para">{m.bio}</p>}
            </li>
          ))}
        </ul>
      )}

      {links && links.length > 0 && (
        <div className="ags-event__links">
          {links.map((l) => (
            <ExtLink key={l.url} href={l.url} label={l.label} />
          ))}
        </div>
      )}
    </div>
  );
}
