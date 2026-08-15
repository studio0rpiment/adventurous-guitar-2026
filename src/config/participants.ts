/**
 * Participant roster + About copy for the pick-menu routes.
 *
 * Same shape as sections.ts: static presentational data in one place so the
 * panels stay dumb. Bios that haven't arrived yet are simply absent (`bio`
 * undefined) — the card renders an "awaiting bio" state rather than us keeping
 * a parallel list of who's missing.
 *
 * Chronological ordering is DERIVED from SCHEDULE/ONGOING rather than stored,
 * so the roster can't drift out of sync with the programme. Matching is by
 * name + `aliases` against each slot's title/performers string.
 *
 * Bios sourced from Chapman's bios doc (Aug 14) unless noted otherwise.
 */

import { ONGOING, SCHEDULE } from "@/config/sections";

/* ── About ─────────────────────────────────────────────────────────────── */

export const ABOUT = {
  /** Long form — festival page / About panel. */
  body: [
    "The Adventurous Electric Guitar Festival was founded by composers and guitarists Christopher Trapani and Chapman Welch to celebrate the electric guitar as a platform for experimentation, collaboration, and artistic discovery.",
    "Through concerts, workshops, demonstrations, and conversations, the festival brings together innovative performers, composers, builders, technologists, and audiences.",
  ],
  /** Short form — the blurb sent to Dan Electro's for the closing-night listing. */
  short:
    "Presented by REMLABS at Rice University with support from a Rice Creative Ventures grant, the festival brings together inventive guitarists expanding the instrument's possibilities through improvisation, experimentation, and bold new approaches to sound.",
  presenter: "REMLABS, Rice University",
  support: "Rice Creative Ventures grant",
  founders: ["Christopher Trapani", "Chapman Welch"],
} as const;

/* ── Participants ──────────────────────────────────────────────────────── */

export interface ParticipantLink {
  label: string;
  url: string;
}

export interface Participant {
  id: string;
  name: string;
  /** Sort key for A–Z (surname first). Kept explicit — band names aren't people. */
  sortName: string;
  role?: string;
  /** Absent until the bio arrives. */
  bio?: string;
  /** Absent until a photo arrives; drop files in /public/img/participants/. */
  image?: string;
  links?: ParticipantLink[];
  /** Extra strings to match against schedule performer lists. */
  aliases?: string[];
}

export const PARTICIPANTS: Participant[] = [
  {
    id: "broess",
    name: "Erik Broess",
    sortName: "Broess, Erik",
    role: "Keynote · Shepherd School of Music",
    bio: "Erik Broess is a scholar of popular music, specializing in rock, metal, and jazz from the perspectives of music technology studies and sound studies. He earned his Ph.D. in Music History from the University of Pennsylvania, where his thesis, “Unobtainable: Electric Guitar Gear & The Mythology of Tone,” explored the cultural significance of tone for electric guitarists. He is currently engaged in a wide-ranging book project that situates analog electric guitar gear within the global electronics industry since the 1950s, exploring the underlying ideologies that shape guitarists' discourse on sound. His scholarly contributions include research on Fender's “Tweed” era (1948–1960), published in the Journal of the Society for American Music, and a chapter on guitar pedals and tone in the forthcoming Cambridge Companion to the Electric Guitar. In 2021 he earned the Lise Waxer Student Paper Prize from the Society for Ethnomusicology's Popular Music Section. A highly regarded educator, he has received Tufts University's Marshall Hochhauser Prize and the University of Pennsylvania's Dean's Award for Distinguished Teaching by a Graduate Student. He brings to the Shepherd School of Music courses on popular music, world music, and music technology.",
  },
  {
    id: "doyle",
    name: "Kelly Doyle",
    sortName: "Doyle, Kelly",
    role: "Guitar",
    bio: "Kelly Doyle is a boundary-pushing Houston guitarist known for seamlessly blending jazz, country, rock, and avant-garde influences into a singular sound. Primarily self-taught, Doyle has developed a highly personal approach to the electric guitar, drawing as readily from improvisation and experimental music as from the deep traditions of Texas guitar playing.",
    links: [
      { label: "“Bats Are Cute” (live)", url: "https://www.youtube.com/watch?v=IVm3TMPJ9jI" },
    ],
    aliases: ["Kelly Doyle Trio"],
  },
  {
    id: "ewen",
    name: "Sandy Ewen",
    sortName: "Ewen, Sandy",
    role: "Guitar / installation",
    // Trimmed for the card — full text (tour history, discography) is in Chapman's bios doc.
    bio: "Sandy Ewen is an experimental guitar player known for solo and collaborative improvisation. Ewen generates sounds with physical implements and extended techniques; other than a pan pedal, she does not process the guitar's signal with effects. The resulting sounds are nuanced, focused on textures and timbres, with a clear but unusual connection to the physicality of the guitar — its strings, pickups and body. Ewen has spent over 20 years expanding her craft and musical vocabulary through both solo and collaborative projects. In 2026 she embarked on a 49-date US tour including trios with Damon Smith and Weasel Walter, and duos with Arrington de Dionyso, Fred Frith and Henry Kaiser. She has performed with the Roscoe Mitchell Quartet, at Sant'Anna Arresi Jazz Festival, Moers Festival, Wels Festival and Jazz em Agosto, and has an extensive discography including projects with Keith Rowe, Jaap Blonk, Roscoe Mitchell and many others. Ewen also creates experimental videos and analogue photographic work, presenting a solo exhibition in Brooklyn in 2025.",
  },
  {
    id: "aurum-son",
    name: "Aurum Son",
    sortName: "Aurum Son",
    role: "Sonia Flores — bass, voice, composition",
    bio: "Aurum Son is the moniker for the original music projects led by Houston bassist, vocalist, and composer Sonia Flores. A graduate of Texas Southern University, she received her Bachelors in Fine Arts with a concentration in Jazz Studies. As a solo artist, much of Flores' work includes impromptu song composition, story telling, costume design and tonal/atonal melodies. Recurring themes as a composer are inspired by the spirit journey, the vastness of the universe, quantum theories, motherhood, brown/latinx experiences, the life and death cycle but above all else, universal love. Aurum Son is a delicate balance of free jazz, avant-garde improvisation and composed song — pulling from folk music from around the globe and avant garde sensibilities, it all comes together in a fantastical aural journey, defying categorization. In full ensemble, Flores is joined by Houston musicians Jesse Ward on guitar, and Gregory Jr. Brown and Yul Dorn on drums.",
    links: [
      { label: "“The Western Lands”", url: "https://youtu.be/EEoR8BFEy8E" },
      { label: "Bandcamp", url: "https://aurumson.bandcamp.com/" },
      { label: "Instagram", url: "https://instagram.com/aurum.son" },
    ],
    aliases: ["Sonia Flores"],
  },
  {
    id: "helton",
    name: "Thomas Helton",
    sortName: "Helton, Thomas",
    role: "Bass",
    // Trimmed for the card — the full CV-length version is in Chapman's bios doc.
    bio: "Houston bassist and composer Thomas Helton is a multifaceted improviser and skilled interpreter of contemporary bass repertoire. Equally adept at playing jazz, classical, experimental and avant-garde music, Helton continues to push and redefine the possibilities of his instrument by embracing extended performance techniques and new compositional forms. He has studied with bass masters including Mark Helias, Rufus Reid, Lynn Seaton and William Parker, and performed with Milt Jackson, Daniel Carter, Monty Alexander, Ernie Watts, Weasel Walter, Damon Smith and Steve Swell. He is a founding member of The Core Trio, whose acclaimed records with Matthew Shipp were released in 2014 and 2015, and artistic director of the Houston Composers Salon. His projects include the duo pH with electronic composer Kevin Patton, the Boomtown Brass Band, and the dance ensemble Group Acorde. Helton is the primary bass luthier at Quantum Bass Center in Houston.",
  },
  {
    id: "lurie",
    name: "Asher Lurie",
    sortName: "Lurie, Asher",
    role: "Student composer",
    bio: "Asher Lurie (b. 2003) is a composer, percussionist, and guitarist from Dallas, Texas. He is the winner of the Tribeca New Music Young Composer Competition and the Composers Concordance Composition Competition, and a finalist in The American Prize, musicON Composition Competition, Brevard Music Center Composition Competition, and The Sound Ensemble. Ensembles he has worked with include Sandbox Percussion, Unheard-of//Ensemble, arx duo, Trio Kanon, Latitude 49, and Pathos Trio. As winner of the inaugural Stamps Composition Competition he was commissioned to write Make a Statement, premiered by the combined Stamps ensembles and Time for Three. Lurie began with electric guitar and bass lessons with Mick Cervino, studying rock and metal through a neoclassical lens; inspired by this and his heritage, his music explores aggression, explosiveness, and relentlessness with lush, dreamy touches emerging from the background. A graduate of the University of Miami's Frost School of Music, he is currently pursuing his Master's in Composition at the Shepherd School of Music at Rice University, where he studies with Pierre Jalbert.",
  },
  {
    id: "ma",
    name: "Aisling Ma",
    sortName: "Ma, Aisling",
    role: "Student composer",
  },
  {
    id: "mcculloch",
    name: "Peter McCulloch",
    sortName: "McCulloch, Peter",
    role: "Plug-in developer & sound designer, Eventide",
    bio: "Peter McCulloch is a plug-in developer and sound designer at Eventide. He has worked on a variety of plugins such as Temperance, SplitEQ, Physion Mk II, and SP2016 Reverb, and he also did sound design for the Harmadillo and TriceraChorus algorithms on the H9 and H90 stompboxes. Peter is a trained classical composer specializing in interactive electro-acoustic music, and plays piano and Hammond organ. Prior to joining Eventide he taught electronic music at NYU and Vassar College for 10 years.",
    links: [{ label: "Eventide", url: "https://www.eventideaudio.com/" }],
    aliases: ["Eventide"],
  },
  {
    id: "patton",
    name: "Kevin Patton",
    sortName: "Patton, Kevin",
    role: "Guitar / electroacoustic composition",
    // TODO: bio pending — Kevin is writing it.
    links: [
      { label: "kevinpatton.site", url: "https://kevinpatton.site" },
      { label: "DECISION(S)", url: "https://decides.app" },
    ],
  },
  {
    id: "trapani",
    name: "Christopher Trapani",
    sortName: "Trapani, Christopher",
    role: "Composer · co-founder",
    // NOTE: drafted from his LSU faculty page — confirm wording with Chris.
    bio: "Christopher Trapani is an American/Italian composer born in New Orleans in 1980, whose work weaves American and European stylistic strands into a personal aesthetic that defies easy classification — drawing on Delta Blues, Appalachian folk tunes, dance band foxtrots, shoegaze guitar effects, and Turkish makam alongside spectral techniques. He studied with Bernard Rands at Harvard, Julian Anderson at the Royal College of Music, and Ottoman microtonality in Istanbul on a Fulbright, spent seven years at IRCAM in Paris, and completed his doctorate at Columbia in 2017. His honours include the 2016–17 Luciano Berio Rome Prize, the 2007 Gaudeamus Prize, and a 2019 Guggenheim Fellowship. He is Assistant Professor of Experimental Music & Digital Media at LSU.",
    links: [
      { label: "LSU", url: "https://www.lsu.edu/cmda/music/people/faculty/trapani.php" },
      { label: "Website", url: "https://christophertrapani.com" },
    ],
    aliases: ["Chris Trapani"],
  },
  {
    id: "welch",
    name: "Chapman Welch",
    sortName: "Welch, Chapman",
    role: "Composer & guitarist · co-founder · REMLABS, Rice University",
    bio: "Chapman Welch is a guitarist, composer, educator, and music-technology specialist at Rice University's Shepherd School of Music, where he serves as Electroacoustic Specialist for the Rice Electroacoustic Music Labs (REMLABS). His work spans experimental and electronic music, improvisation, American guitar traditions, and the creative use of technology in performance and composition. Welch is a founding member of the Adventurous Electric Guitar Festival with composer and guitarist Christopher Trapani, an initiative devoted to contemporary and experimental approaches to the electric guitar through performances, workshops, artist presentations, and educational programs. As a guitarist, Welch toured extensively with his band Law of Nature and recorded with legendary Allman Brothers producer Johnny Sandlin. He won the 2019 Texas Flatpicking Championship and has twice been a finalist at the National Flat Pick Guitar Championship in Winfield, Kansas.",
    links: [{ label: "chapmanwelch.com", url: "http://chapmanwelch.com/" }],
  },
  {
    id: "williams",
    name: "Brad Allen Williams",
    sortName: "Williams, Brad Allen",
    role: "Guitar",
    bio: "Although known for his surrealistic guitar stylism, Brad Allen Williams describes himself as a “professional listener.” Improvisation is a core musical value that animates collaborations and solo projects alike — it informs the openness, curiosity, presence, and relentless thirst for context that are his hallmarks. In his work with artists like Brittany Howard, Bilal, Nate Smith and others, Williams grounds outwardly-bold aesthetic choices in encyclopedic knowledge. On his solo albums œconomy and light rivers, he casts himself in productive opposition to his instrument, which he describes as “overleveraged in the last 100 years of popular music.” The mission is at once modest and extremely ambitious: he aspires to reimagine the guitar's role and function on an atomic level, all while keeping service of music at the center.",
    links: [
      { label: "Video", url: "https://www.youtube.com/watch?v=TQczqXrQA90" },
      { label: "bradallenwilliams.com", url: "https://bradallenwilliams.com" },
    ],
  },
  {
    id: "idiotbox",
    name: "Idiot Box Effects",
    sortName: "Idiot Box Effects",
    role: "Pedal builder — Texas",
    aliases: ["IdiotBox"],
  },
];

/* ── Derived: where each participant appears ───────────────────────────────
   Flattened once at module load, in the order the programme is declared
   (ONGOING first, then day → venue block → slot — same order the Schedule
   panel renders). Assumes blocks within a day are declared chronologically,
   which matches how sections.ts is written. */

export interface Appearance {
  /** e.g. "Fri, Oct 9 · 2 PM" or "Oct 8–9, 10 AM–5 PM" */
  when: string;
  title: string;
  venue: string;
}

interface IndexedAppearance extends Appearance {
  order: number;
  haystack: string;
}

const PROGRAMME: IndexedAppearance[] = (() => {
  const out: IndexedAppearance[] = [];
  let order = 0;

  for (const o of ONGOING) {
    out.push({
      order: order++,
      when: o.when,
      title: o.title,
      venue: o.venue,
      haystack: `${o.title} ${o.note ?? ""}`.toLowerCase(),
    });
  }

  for (const day of SCHEDULE) {
    for (const block of day.blocks) {
      for (const slot of block.slots) {
        out.push({
          order: order++,
          when: `${day.date} · ${slot.time}`,
          title: slot.title,
          venue: block.venue,
          haystack: `${slot.title} ${slot.performers ?? ""}`.toLowerCase(),
        });
      }
    }
  }

  return out;
})();

function matchers(p: Participant): string[] {
  return [p.name, ...(p.aliases ?? [])].map((s) => s.toLowerCase());
}

/** Every programme entry this participant appears in, in programme order. */
export function participantAppearances(p: Participant): Appearance[] {
  const keys = matchers(p);
  return PROGRAMME.filter((entry) => keys.some((k) => entry.haystack.includes(k))).map(
    ({ when, title, venue }) => ({ when, title, venue }),
  );
}

/** Programme index of a participant's first appearance; Infinity if unscheduled. */
function firstAppearanceOrder(p: Participant): number {
  const keys = matchers(p);
  const hit = PROGRAMME.find((entry) => keys.some((k) => entry.haystack.includes(k)));
  return hit ? hit.order : Number.POSITIVE_INFINITY;
}

export type ParticipantSort = "alpha" | "chrono";

export const SORT_LABELS: Record<ParticipantSort, string> = {
  alpha: "A–Z",
  chrono: "By programme",
};

/**
 * Returns a new sorted array — never mutates PARTICIPANTS.
 * "chrono" falls back to alphabetical for anyone not (yet) in the programme,
 * and those sort to the end.
 */
export function sortParticipants(
  list: Participant[],
  mode: ParticipantSort,
): Participant[] {
  const byName = (a: Participant, b: Participant) =>
    a.sortName.localeCompare(b.sortName);

  if (mode === "alpha") return [...list].sort(byName);

  return [...list].sort((a, b) => {
    const oa = firstAppearanceOrder(a);
    const ob = firstAppearanceOrder(b);
    // Compared rather than subtracted so Infinity (unscheduled) behaves.
    if (oa !== ob) return oa < ob ? -1 : 1;
    return byName(a, b);
  });
}
