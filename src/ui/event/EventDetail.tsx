import { useState } from "react";
import type { FestivalEvent } from "@/config/events";
import { eventParticipants } from "@/config/participants";
import { ParticipantChip } from "@/ui/event/ParticipantChip";
import { ParticipantBio } from "@/ui/event/ParticipantBio";
import { kindColor } from "@/ui/event/kind";
import { CurvedTitle } from "@/ui/event/CurvedTitle";
import { ExtLink } from "@/ui/ExtLink";
import { Paras } from "@/ui/Paras";

/**
 * Everything we know about one programme entry, as a readable column.
 *
 * The single detail view: the island morphs into this, and the Schedule /
 * Venue rows expand into it. Two ways in, one component — the alternative was
 * two renderers of the same fields, and the second one drifts.
 *
 * One interaction, used at both levels: you tapped an island to open it, and
 * inside you tap a name to open that. No toggles and no tabs — most of this
 * content is short, and chrome that hides it costs more than it saves. Only
 * one bio is open at a time so the column never turns into a wall.
 */
export function EventDetail({
  event,
  heading = true,
  size = "compact",
}: {
  event: FestivalEvent;
  /** `false` drops the when / title / venue block for callers that are already
   *  showing it — the schedule and venue rows, which expand underneath their
   *  own line. The island has no such line, so it keeps the heading. */
  heading?: boolean;
  /**
   * "large" is the opened island: island-scale type and the title back on its
   * curved baselines, so the card reads as the island grown rather than a
   * dialog that replaced it. "compact" is the same content inside a schedule
   * or venue row, where it's a detail under a line of a list.
   */
  size?: "compact" | "large";
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const people = eventParticipants(event);
  const venue = event.venue;

  // The raw performers string is the fallback, not the default: if we matched
  // people in the roster their chips say it better. It still shows when nobody
  // matched (a guest who isn't on the roster yet), so a name is never lost.
  const showRawPerformers = people.length === 0 && Boolean(event.performers);
  const large = size === "large";

  return (
    <div className={large ? "ags-event ags-event--large" : "ags-event"}>
      {heading && (
        <>
          <div className="ags-event__when">
            <span
              aria-hidden
              className="ags-event__dot"
              style={{ background: kindColor(event.kind) }}
            />
            {event.when}
          </div>

          {large ? (
            <h3 className="ags-event__title ags-event__title--curved">
              <CurvedTitle id={`t-${event.id}`} text={event.title} />
            </h3>
          ) : (
            <h3 className="ags-event__title">{event.title}</h3>
          )}

          <div className="ags-event__venue">
            {event.venueName}
            {event.venueNote && (
              <span className="ags-event__venue-note"> — {event.venueNote}</span>
            )}
          </div>
        </>
      )}

      {showRawPerformers && <p className="ags-event__performers">{event.performers}</p>}

      {event.note && <p className="ags-event__note">{event.note}</p>}

      {event.abstract && <Paras text={event.abstract} />}

      {people.length > 0 && (
        <section className="ags-event__lineup">
          <h4 className="ags-event__h">Line-up</h4>
          <ul className="ags-event__chips">
            {people.map((p) => (
              <li key={p.id}>
                <ParticipantChip
                  participant={p}
                  open={openId === p.id}
                  onToggle={() => setOpenId(openId === p.id ? null : p.id)}
                />
                {openId === p.id && <ParticipantBio participant={p} />}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="ags-event__links">
        {event.link && <ExtLink href={event.link} label={event.linkLabel ?? "Details"} />}
        {venue?.mapUrl && <ExtLink href={venue.mapUrl} label="Map" />}
        {venue?.url && <ExtLink href={venue.url} label="Venue" />}
        {venue?.links?.map((l) => (
          // The slot's own link is often the venue's ticket link too; don't
          // print it twice.
          l.url === event.link ? null : <ExtLink key={l.url} href={l.url} label={l.label} />
        ))}
      </div>
    </div>
  );
}
