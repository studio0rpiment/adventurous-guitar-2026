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
  /** Long-form talk copy. Paragraphs are split on blank lines when rendered. */
  abstract?: string;
  link?: string;
  /** Word on the link; the ↗ is the component's. Defaults to "Details". */
  linkLabel?: string;
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
            title:
              "Music For Mitochondria: Angine de Poitrine, and how the electric guitar became \u2018cool\u2019 again",
            performers: "Keynote \u2014 Erik Broess",
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
            abstract:
              "DECIDE(S) is a collaborative decision-making and project-management platform that enables groups of musicians and teams of producers to sort through multiple iterations of songs, sequences, and pieces \u2014 from the recording of multiple takes to the sharing of mixes and masters.\n\nSo often capturing a performance, or producing a track, that meets exacting virtuosic standards while preserving musical inspiration requires take after take, detailed editing, and extensive discussion. DECIDE(S) brings everything into one place: load the audio, play any version, and highlight a specific section of a take to point to exactly what you mean. It supports group discussion, section-level audio highlights, and real-time collaboration for everyone involved in the production. Video is supported as well, so projects that need to deliver visual or social media content can be directly integrated.",
            link: "https://decides.app",
            linkLabel: "decides.app",
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
            title:
              "On building tools for musicians: reflections, surprises, and recommendations",
            performers: "Peter McCulloch",
            abstract:
              "For the past 9 years, Peter McCulloch has worked at Eventide Audio, building algorithms such as TriceraChorus and Harmadillo for the H9 stompbox, as well as working on a variety of plugins such as SP2016 Reverb, SplitEQ, and Temperance Pro. Eventide Audio has a long history of cutting-edge research and development over the last 55 years, including innovations such as the first digital delay unit, the invention of the Harmonizer, and the first effects multiprocessor, as well as newer technologies such as the Structural Split algorithm and modal reverb modelling.\n\nThe lecture will discuss what makes music a compelling problem space, and present some of the unique challenges involved with creating tools for musicians, as well as some suggestions for people interested in making their own tools.",
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
            // Set order confirmed by Chapman, Aug 14.
            performers: "Brad Allen Williams · Kelly Doyle · Aurum Son",
            note: "Brad Allen Williams opens, Kelly Doyle second, Aurum Son closes. $10 suggested donation. No one turned away.",
            // Dan Electro's ticketing page, announced Aug 18. NB: the venue's
            // own prices don't match the $10 suggested donation — Chapman
            // flagged it with Shaun, so this note may need a revisit.
            link: "https://www.stubwire.com/e/39361/theadventurouselectricguitarfestivalwbradallenwilliamskellydoyleandaurumson/danelectros/",
            linkLabel: "Tickets",
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
  /** Extra outbound links — tickets, event pages, playlists. */
  links?: { label: string; url: string }[];
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
    links: [
      {
        label: "Tickets",
        url: "https://www.stubwire.com/e/39361/theadventurouselectricguitarfestivalwbradallenwilliamskellydoyleandaurumson/danelectros/",
      },
      { label: "Facebook event", url: "https://www.facebook.com/share/1HkX3jiQCx/" },
      {
        label: "Spotify playlist",
        url: "https://open.spotify.com/playlist/3PSxieAElz9ifD7oGa8gBT",
      },
    ],
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
