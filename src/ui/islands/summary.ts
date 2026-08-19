import type { FestivalEvent } from "@/config/events";

/** The few lines an island carries at rest. */
export interface IslandSummary {
  top?: string;
  title: string;
  sub?: string;
  note?: string;
}

/**
 * What an event looks like as an island.
 *
 * Shared because the island is now drawn twice: once in the scroll stream, and
 * once as the FRONT FACE of the opening card, which has to be the same artwork
 * or the turn doesn't read as the same object.
 */
export function islandSummary(event: FestivalEvent): IslandSummary {
  return {
    top: event.when,
    title: event.title,
    sub: event.performers ?? event.venueName,
    note: event.performers ? event.venueName : event.note,
  };
}
