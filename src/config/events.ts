/**
 * The programme as one flat, derived list.
 *
 * `SCHEDULE` / `ONGOING` in sections.ts are the AUTHORED shape — nested day →
 * venue block → slot, which is the right shape for editing and the wrong shape
 * for everything else. Every consumer that needs "an event" (an island, a
 * participant's appearances, a detail card) wants a flat entry with its day,
 * venue record and links already resolved.
 *
 * Derived, never stored: add a slot to sections.ts and it appears as an island,
 * in the schedule, and in the right participants' appearance lists at once.
 * This list replaced a near-identical one that used to live privately inside
 * participants.ts — two builders over the same source was exactly the kind of
 * second copy that drifts.
 */

import {
  ONGOING,
  SCHEDULE,
  VENUES,
  type ScheduleSlot,
  type SlotKind,
  type Venue,
} from "@/config/sections";

export interface FestivalEvent {
  /** Stable and DOM-id-safe — islands use it for their SVG path refs. */
  id: string;
  /** Programme order: ongoing items first, then day by day. */
  order: number;
  /** "Fri, Oct 9 · 2 PM", or the whole span for an ongoing item. */
  when: string;
  title: string;
  performers?: string;
  note?: string;
  abstract?: string;
  link?: string;
  linkLabel?: string;
  kind: SlotKind;
  venueName: string;
  venueNote?: string;
  /** The full venue record — map link, site, tickets — when one is listed. */
  venue?: Venue;
  /**
   * Lowercased text that participant names are matched against.
   *
   * Deliberately NOT every field: slots match on title + performers, ongoing
   * items on title + note. Widening it to notes as well would start matching
   * people named only in passing, and would silently change who appears where.
   */
  haystack: string;
  /** The authored slot, for consumers that are still handed one (SlotRow). */
  slot?: ScheduleSlot;
}

const slug = (s: string) => s.replace(/\W+/g, "").toLowerCase();

/** The venue record behind a block's venue name, if it's listed in VENUES. */
export function venueByName(name: string): Venue | undefined {
  return VENUES.find((v) => v.name === name);
}

const ALL: FestivalEvent[] = [];
const BY_SLOT = new Map<ScheduleSlot, FestivalEvent>();

ONGOING.forEach((item, i) => {
  ALL.push({
    id: `ongoing-${i}`,
    order: ALL.length,
    when: item.when,
    title: item.title,
    note: item.note,
    kind: "social",
    venueName: item.venue,
    venue: venueByName(item.venue),
    haystack: `${item.title} ${item.note ?? ""}`.toLowerCase(),
  });
});

SCHEDULE.forEach((day) => {
  day.blocks.forEach((block) => {
    block.slots.forEach((slot, i) => {
      const event: FestivalEvent = {
        id: `${slug(day.date)}-${slug(block.venue)}-${i}`,
        order: ALL.length,
        when: `${day.date} · ${slot.time}`,
        title: slot.title,
        performers: slot.performers,
        note: slot.note,
        abstract: slot.abstract,
        link: slot.link,
        linkLabel: slot.linkLabel,
        kind: slot.kind ?? "performance",
        venueName: block.venue,
        venueNote: block.venueNote,
        venue: venueByName(block.venue),
        haystack: `${slot.title} ${slot.performers ?? ""}`.toLowerCase(),
        slot,
      };
      ALL.push(event);
      BY_SLOT.set(slot, event);
    });
  });
});

export const EVENTS: readonly FestivalEvent[] = ALL;

/** The event a given authored slot became. Keyed by object identity, so it
 *  can't go stale the way a string key would when copy is edited. */
/**
 * The venue as a line of copy — or nothing, when the title already names it.
 *
 * Some events are billed BY their venue: the Friday closer is "Final Concert @
 * Dan Electro's Guitar Bar", so printing the venue underneath says the same
 * words twice, on the island and again on the opened card. Containment rather
 * than equality, because the billing usually wraps the venue in something
 * ("Final Concert @ …") rather than being it exactly.
 */
export function venueLine(event: FestivalEvent): string | undefined {
  // Whitespace-normalised on both sides: a title may carry newline break hints
  // for the island's curved type, and "Dan Electro's\nGuitar Bar" has to still
  // count as containing "Dan Electro's Guitar Bar".
  const flat = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();
  return flat(event.title).includes(flat(event.venueName)) ? undefined : event.venueName;
}

export function eventForSlot(slot: ScheduleSlot): FestivalEvent | undefined {
  return BY_SLOT.get(slot);
}
