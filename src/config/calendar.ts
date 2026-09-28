/**
 * The programme as an iCalendar (.ics) file — the "Add to calendar" link at the
 * top of the Schedule route.
 *
 * Built from EVENTS, so it's one more derivation of sections.ts rather than a
 * second copy of the programme: edit a slot there and the next build ships the
 * change in the calendar file too. The file itself is emitted at build time by
 * the `scheduleIcs` plugin in vite.config.ts (and served live in dev), so it's
 * a real URL — which is what iOS needs to offer "Add All" — and could later be
 * offered as a webcal:// subscription without changing anything here.
 *
 * Pure string work, no DOM: vite.config.ts imports this under the node
 * tsconfig. Keep imports relative for the same reason (no "@/" alias there).
 */

import { EVENTS, type FestivalEvent } from "./events";
import { FESTIVAL } from "./festival";

/** Served from the site root: /aegf-2026-schedule.ics */
export const ICS_FILE = `aegf-${FESTIVAL.year}-schedule.ics`;

/** Houston. Times are written as local wall-clock with this TZID; the zone's
 *  rules ride along in VTIMEZONE below, so no offset math happens here. */
const TZID = "America/Chicago";

/** Most slots only give a start. Without an authored `duration`, and with
 *  nothing later in the same venue block to bound them, they get this much. */
const DEFAULT_MINUTES = 60;

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/* ── Parsing the authored copy ───────────────────────────────────────────── */

interface DaySpan {
  month: number; // 0-based
  day: number;
  /** Last day of a span ("Oct 8–9"), for ongoing items. */
  lastDay?: number;
}

/** "Thu, Oct 8" or "Oct 8–9, 10 AM–5 PM" → month + day(s). The weekday is
 *  skipped naturally: "Thu," isn't followed by a number. */
function parseDays(s: string): DaySpan | undefined {
  const m = /([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2})(?:\s*[–-]\s*(\d{1,2})\b(?!\s*(?::|AM|PM)))?/i.exec(s);
  if (!m) return undefined;
  const month = MONTHS.indexOf(m[1].toLowerCase());
  if (month < 0) return undefined;
  return { month, day: Number(m[2]), lastDay: m[3] ? Number(m[3]) : undefined };
}

/** Every clock time in a string, as minutes after midnight, in order:
 *  "9 PM–12:30 AM" → [1260, 30]. */
function parseClocks(s: string): number[] {
  const out: number[] = [];
  for (const m of s.matchAll(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/gi)) {
    const h = Number(m[1]) % 12 + (m[3].toUpperCase() === "PM" ? 12 : 0);
    out.push(h * 60 + Number(m[2] ?? 0));
  }
  return out;
}

/* ── Wall-clock arithmetic ───────────────────────────────────────────────────
   Dates are built in UTC purely as a calculator (so "+1 day" and "past
   midnight" roll over correctly) and formatted back out as floating local
   values; TZID supplies the actual zone. */

const wall = (month: number, day: number, minutes: number) =>
  new Date(Date.UTC(FESTIVAL.year, month, day, 0, minutes));

const pad = (n: number) => String(n).padStart(2, "0");

const localStamp = (t: Date) =>
  `${t.getUTCFullYear()}${pad(t.getUTCMonth() + 1)}${pad(t.getUTCDate())}` +
  `T${pad(t.getUTCHours())}${pad(t.getUTCMinutes())}00`;

const utcStamp = (t: Date) => `${localStamp(t)}Z`;

const dateStamp = (t: Date) => localStamp(t).slice(0, 8);

interface Timing {
  start: Date;
  /** Exclusive: for an all-day entry, the day after the last day. */
  end: Date;
  /** Ongoing items (the pedal kiosks) sit at the top of each day as all-day
   *  entries rather than blocking out the hours in between. */
  allDay: boolean;
}

function timingOf(event: FestivalEvent, next?: FestivalEvent): Timing | undefined {
  // Scheduled slots carry their day and time separately; an ongoing item's
  // whole span is in `when`.
  const days = parseDays(event.date ?? event.when);
  if (!days) return undefined;

  if (!event.slot) {
    return {
      start: wall(days.month, days.day, 0),
      end: wall(days.month, (days.lastDay ?? days.day) + 1, 0),
      allDay: true,
    };
  }

  const clocks = parseClocks(event.slot.time);
  if (clocks.length === 0) return undefined;

  const start = wall(days.month, days.day, clocks[0]);
  let end: Date;

  if (clocks[1] !== undefined) {
    // An authored range. An end at or before the start ran past midnight.
    end = wall(days.month, days.day, clocks[1]);
    if (end <= start) end = wall(days.month, days.day + 1, clocks[1]);
  } else if (event.slot.duration) {
    end = new Date(start.getTime() + event.slot.duration * 60_000);
  } else {
    // No end given: run until the next slot in the same room that day, if
    // there is one (keynote 6 → concert 7), else the default length.
    const nextStart = next && next.date === event.date && next.venueName === event.venueName
      ? timingOf(next)?.start
      : undefined;
    end = nextStart && nextStart > start
      ? nextStart
      : new Date(start.getTime() + DEFAULT_MINUTES * 60_000);
  }

  return { start, end, allDay: false };
}

/* ── iCalendar text ──────────────────────────────────────────────────────── */

/** TEXT escaping per RFC 5545 §3.3.11. */
const esc = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** Titles carry newline break hints for the islands' curved type. */
const oneLine = (s: string) => s.replace(/\s+/g, " ").trim();

/** Fold at 75 octets (RFC 5545 §3.1), never splitting a multi-byte character. */
function fold(line: string): string {
  const parts: string[] = [];
  let cur = "";
  let bytes = 0;
  for (const ch of line) {
    const cp = ch.codePointAt(0) ?? 0;
    const n = cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4;
    // Continuation lines start with a space, which counts toward their 75.
    if (bytes + n > (parts.length ? 74 : 75)) {
      parts.push(cur);
      cur = "";
      bytes = 0;
    }
    cur += ch;
    bytes += n;
  }
  parts.push(cur);
  return parts.join("\r\n ");
}

const VTIMEZONE = [
  "BEGIN:VTIMEZONE",
  `TZID:${TZID}`,
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:-0600",
  "TZOFFSETTO:-0500",
  "TZNAME:CDT",
  "DTSTART:19700308T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:-0500",
  "TZOFFSETTO:-0600",
  "TZNAME:CST",
  "DTSTART:19701101T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
];

function vevent(event: FestivalEvent, t: Timing, stamp: string): string[] {
  const description = [
    // An all-day entry drops the hours from the calendar; keep them in view.
    t.allDay ? event.when : undefined,
    event.performers,
    event.note,
    event.abstract,
    event.link && `${event.linkLabel ?? "Details"}: ${event.link}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const where = event.venue?.org ?? event.venueNote;
  const location = where ? `${event.venueName}, ${where}` : event.venueName;

  return [
    "BEGIN:VEVENT",
    `UID:${event.id}@aegf-${FESTIVAL.year}`,
    `DTSTAMP:${stamp}`,
    ...(t.allDay
      ? [`DTSTART;VALUE=DATE:${dateStamp(t.start)}`, `DTEND;VALUE=DATE:${dateStamp(t.end)}`]
      : [`DTSTART;TZID=${TZID}:${localStamp(t.start)}`, `DTEND;TZID=${TZID}:${localStamp(t.end)}`]),
    `SUMMARY:${esc(oneLine(event.title))}`,
    `LOCATION:${esc(location)}`,
    ...(description ? [`DESCRIPTION:${esc(description)}`] : []),
    ...(event.link ? [`URL:${event.link}`] : []),
    "END:VEVENT",
  ];
}

export interface ScheduleIcs {
  text: string;
  /** Events whose day/time copy couldn't be read — left out, reported by the
   *  build so a copy edit that breaks parsing is loud, not silent. */
  skipped: string[];
}

export function buildScheduleIcs(now: Date = new Date()): ScheduleIcs {
  const stamp = utcStamp(now);
  const skipped: string[] = [];
  const events: string[] = [];

  EVENTS.forEach((event, i) => {
    const t = timingOf(event, EVENTS[i + 1]);
    if (t) events.push(...vevent(event, t, stamp));
    else skipped.push(`${oneLine(event.title)} (${event.when})`);
  });

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${FESTIVAL.shortName}//${FESTIVAL.name} ${FESTIVAL.year}//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${esc(`${FESTIVAL.name} ${FESTIVAL.year}`)}`,
    `X-WR-TIMEZONE:${TZID}`,
    ...VTIMEZONE,
    ...events,
    "END:VCALENDAR",
  ];

  return { text: lines.map(fold).join("\r\n") + "\r\n", skipped };
}
