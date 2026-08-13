/**
 * Section content for the pick-menu routes. Static, presentational data — the
 * panels read from here so schedule/venue copy lives in one place. Updated with
 * the real Oct 8-9 program; items still marked TBA/(?) below are unconfirmed.
 */

export type SectionId = "schedule" | "participants" | "venue" | "about";

/* ── Schedule ──────────────────────────────────────────────────────────────
   The festival runs across several venues each day, so the schedule is grouped
   day -> venue block -> slots. `ONGOING` holds things that span both days. */

export type SlotKind = "performance" | "talk" | "social";

export interface ScheduleSlot {
  time: string;
  title: string;
  performers?: string;
  note?: string;
  link?: string;
  kind?: SlotKind;
}

export interface VenueBlock {
  venue: string;
  venueNote?: string;
  slots: ScheduleSlot[];
}

export interface ScheduleDay {
  date: string;
  label: string;
  blocks: VenueBlock[];
}

export interface OngoingItem {
  title: string;
  when: string;
  venue: string;
  note?: string;
}

// Runs across both festival days.
export const ONGOING: OngoingItem[] = [
  {
    title: "Pedal Kiosks",
    when: "Oct 8–9, 10 AM–5 PM",
    venue: "Moody Center for the Arts",
    note: "Test pedals from Eventide and Idiot Box Effects.",
  },
];

export const SCHEDULE: ScheduleDay[] = [
  {
    date: "Thu, Oct 8",
    label: "Day 1 — Thursday, October 8",
    blocks: [
      {
        venue: "Wortham Theater",
        venueNote: "Shepherd School of Music",
        slots: [
          {
            time: "6 PM",
            title: "Keynote — Erik Broess",
            note: "Topic TBD",
            kind: "talk",
          },
          {
            time: "7 PM",
            title: "Concert",
            performers:
              "Chapman Welch / Thomas Helton, Sandy Ewen, Kevin Patton, Christopher Trapani, Asher Lurie, Aisling Ma, Kelly Doyle (?), Brad Allen Williams (?)",
            kind: "performance",
          },
        ],
      },
    ],
  },
  {
    date: "Fri, Oct 9",
    label: "Day 2 — Friday, October 9",
    blocks: [
      {
        venue: "Wortham Theater",
        venueNote: "Shepherd School of Music",
        slots: [
          {
            time: "9 AM",
            title: "AI and Music — Panel",
            performers:
              "Chris Trapani, Chapman Welch, Peter McCulloch, Kevin Patton, Brad Allen Williams",
            kind: "talk",
          },
          {
            time: "10 AM",
            title: "DECIDE(S) — an app for collaborative music production",
            performers: "Kevin Patton",
            kind: "talk",
          },
          {
            time: "11 AM",
            title: "Interesting sounds on a budget",
            performers: "Brad Allen Williams",
            kind: "talk",
          },
        ],
      },
      {
        venue: "Electrical Engineering & Computer Science Dept.",
        venueNote: "Rice University — room & department title TBA",
        slots: [
          {
            time: "2 PM",
            title: "Digital Signal Processing",
            performers: "Peter McCulloch",
            kind: "talk",
          },
        ],
      },
      {
        venue: "Moody Center for the Arts",
        venueNote: "Rice University",
        slots: [
          {
            time: "4 PM",
            title: "Sandy Ewen — performance / lecture",
            note: "Using Nanibah Chacon’s amplified installation, part of the Radiant Geometries exhibit. Work title TBA.",
            link: "https://moody.rice.edu/exhibitions/radiant-geometries",
            kind: "performance",
          },
        ],
      },
      {
        venue: "Dan Electro’s Guitar Bar",
        slots: [
          { time: "8 PM", title: "Doors open", kind: "social" },
          {
            time: "9 PM–12:30 AM",
            title: "Late show",
            performers: "Brad Allen Williams, Kelly Doyle, Aurum Son",
            note: "$10 suggested donation. No one turned away.",
            kind: "performance",
          },
        ],
      },
    ],
  },
];

/* ── Venues ────────────────────────────────────────────────────────────────
   The festival uses several locations; the Venue route lists them all. */

export interface Venue {
  name: string;
  org?: string;
  note?: string;
  mapUrl?: string;
  url?: string;
}

export const VENUES: Venue[] = [
  {
    name: "Moody Center for the Arts",
    org: "Rice University",
    note: "Pedal kiosks (both days) · Sandy Ewen performance (Fri)",
    url: "https://moody.rice.edu/",
    mapUrl: "https://maps.google.com/?q=Moody+Center+for+the+Arts+Rice+University",
  },
  {
    name: "Wortham Theater",
    org: "Shepherd School of Music, Rice University",
    note: "Keynote, panels & concerts",
    url: "https://music.rice.edu/about/facilities/wortham-theatre",
    mapUrl: "https://maps.google.com/?q=Shepherd+School+of+Music+Rice+University",
  },
  {
    name: "Electrical Engineering & Computer Science Dept.",
    org: "Rice University",
    note: "DSP talk — specific room & department title TBA",
    mapUrl: "https://maps.google.com/?q=Rice+University+Electrical+Computer+Engineering",
  },
  {
    name: "Dan Electro’s Guitar Bar",
    org: "Houston, TX",
    note: "Friday late show — $10 suggested donation, no one turned away",
    url: "https://danelectros.com/",
    mapUrl: "https://maps.google.com/?q=Dan+Electro%27s+Guitar+Bar+Houston",
  },
];

/* ── Derived: per-venue two-day schedule ────────────────────────────────────
   The Venue route shows each location's own schedule across the festival,
   derived from SCHEDULE/ONGOING so there's a single source of truth. */

export interface VenueDaySchedule {
  label: string; // short day label, e.g. "Thu, Oct 8"
  slots: ScheduleSlot[];
}

export interface VenueWithSchedule {
  venue: Venue;
  ongoing: OngoingItem[];
  days: VenueDaySchedule[];
}

export function venueSchedules(): VenueWithSchedule[] {
  return VENUES.map((venue) => {
    const ongoing = ONGOING.filter((o) => o.venue === venue.name);
    const days = SCHEDULE.map((day) => ({
      label: day.date,
      slots: day.blocks
        .filter((b) => b.venue === venue.name)
        .flatMap((b) => b.slots),
    })).filter((d) => d.slots.length > 0);
    return { venue, ongoing, days };
  });
}
