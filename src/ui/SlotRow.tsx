import { useState } from "react";
import type { ScheduleSlot } from "@/config/sections";
import { eventForSlot } from "@/config/events";
import { EventDetail } from "@/ui/event/EventDetail";
import { kindColor } from "@/ui/event/kind";

/**
 * One schedule entry: time, title and a kind dot, expanding to the full event
 * detail. Reused by the day view (SchedulePanel) and the per-venue view
 * (VenuePanel).
 *
 * This is the second way into EventDetail — the island morph is the first. The
 * row used to print the abstract, performers and links inline, which let one
 * long talk swamp the day around it and meant two components rendered the same
 * fields. It's now an index entry that opens the one detail component.
 *
 * The slot is looked up in EVENTS by object identity, so callers that already
 * hold a slot (both panels do) didn't have to be rewritten to pass events.
 */
export function SlotRow({ slot }: { slot: ScheduleSlot }) {
  const [open, setOpen] = useState(false);
  const event = eventForSlot(slot);

  return (
    <li className="ags-slot">
      <button
        type="button"
        className="ags-slot__row"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span className="ags-slot__time">{slot.time}</span>
        <span className="ags-slot__main">
          <span className="ags-slot__head">
            <span
              aria-hidden
              className="ags-slot__dot"
              style={{ background: kindColor(slot.kind) }}
            />
            <span className="ags-slot__title">{slot.title}</span>
          </span>
          {slot.performers && <span className="ags-slot__performers">{slot.performers}</span>}
        </span>
        <span aria-hidden className="ags-slot__chevron" data-open={open || undefined}>
          {"›"}
        </span>
      </button>

      {open && event && (
        <div className="ags-slot__detail">
          <EventDetail event={event} heading={false} />
        </div>
      )}
    </li>
  );
}
