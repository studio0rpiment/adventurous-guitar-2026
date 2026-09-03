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

import { EVENTS, type FestivalEvent } from "@/config/events";

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

/** A player inside a group entry (Aurum Son's band, Kelly's trio, …). Kept
 *  nested rather than promoted to top-level participants so the roster stays
 *  Chapman's billing, while individual bios still have somewhere to live. */
export interface EnsembleMember {
  name: string;
  role?: string;
  bio?: string;
}

export interface Participant {
  id: string;
  name: string;
  /** Sort key for A–Z (surname first). Kept explicit — band names aren't people. */
  sortName: string;
  role?: string;
  /** Absent until the bio arrives. */
  bio?: string;
  /** Absent until a photo arrives. Web-ready square crops live in
   *  /public/img/bioPics/; originals go in /assets-source/bioPics/ so the
   *  multi-megabyte camera files don't ship in the build. */
  image?: string;
  links?: ParticipantLink[];
  /** Players within a group entry. */
  members?: EnsembleMember[];
  /** Extra strings to match against schedule performer lists. */
  aliases?: string[];
}

export const PARTICIPANTS: Participant[] = [
  {
    id: "broess",
    name: "Erik Broess",
    sortName: "Broess, Erik",
    role: "Keynote · Shepherd School of Music",
    bio: "Erik Broess (he/him) is a scholar of popular music, specializing in rock, metal, and jazz from the perspectives of music technology studies and sound studies. He earned his Ph.D. in Music History from the University of Pennsylvania, where his thesis, “Unobtainable: Electric Guitar Gear & The Mythology of Tone,” explored the cultural significance of tone for electric guitarists. Currently, he is engaged in a wide-ranging book project that situates analog electric guitar gear within the global electronics industry since the 1950s. This ambitious project explores the underlying ideologies that shape guitarists’ discourse on sound, examining various instruments, building materials, and manufacturing practices that contribute to the elusive concept of “good tone.”\n\nHis scholarly contributions include research on Fender’s “Tweed” era (1948-1960), published in the Journal of the Society for American Music, and a chapter on guitar pedals and tone in the forthcoming Cambridge Companion to the Electric Guitar. In 2021, he earned the “Lise Waxer Student Paper Prize” from the Society for Ethnomusicology’s Popular Music Section and was recognized as a runner-up for the “Wong Tolbert Prize” by the Society for Ethnomusicology’s Section on the Status of Women.\n\nBeyond his research achievements, Dr. Broess is a highly regarded educator, having received numerous teaching honors, including Tufts University’s “Marshall Hochhauser Prize” and the University of Pennsylvania’s “Dean’s Award for Distinguished Teaching by a Graduate Student.” He served as an inaugural fellow for “Equitable and Inclusive Teaching” at the University of Pennsylvania, during which he developed seminars aimed at fostering equity and inclusion in higher education. He brings to the Shepherd School of Music courses on popular music, world music, and music technology.",
  },
  {
    id: "chen",
    name: "Wenshi Chen",
    sortName: "Chen, Wenshi",
    role: "Musicologist · Shepherd School of Music, Rice University",
    // Bio + headshot arrived Aug 31 (via Chapman, Sep 1) as attachments — not yet transcribed / cropped.
  },
  {
    id: "doublemono",
    name: "DOUBLEMONO",
    sortName: "DOUBLEMONO",
    role: "Fiona Xue Ju — live electronics · Drew Farrar — electric guitar",
    image: "/img/bioPics/doublemono.webp",
    // Sent by Fiona Xue Ju to Chapman, Aug 19 — verbatim.
    bio: "DOUBLEMONO is an experimental electronic music duo by Fiona Xue Ju on live electronics and Drew Farrar on electric guitar. The duo explores digital and analog electronics, improvisation, and interactive systems interrogating relationships between sound, gesture, technology, and perception.\n\nFiona is a composer, media artist, improviser, and performer whose interdisciplinary practice combines electronic music, performance, visual arts, and immersive technologies. She studied at Oberlin Conservatory and CNSMD Lyon and is currently a Ph.D. candidate in Experimental Music and Digital Media at Louisiana State University. Drew is a composer, guitarist, improviser, and educator whose work explores physical movement, spectral techniques, agency, and otherness. His current interests include computer-assisted composition, digital signal processing, and guitar effects pedals.\n\nDOUBLEMONO has presented work at Electric LaTex and the International Computer Music Conference (ICMC).",
    links: [{ label: "xjcomposer.com", url: "https://www.xjcomposer.com/" }],
    members: [
      { name: "Fiona Xue Ju", role: "Live electronics" },
      { name: "Drew Farrar", role: "Electric guitar" },
    ],
    aliases: ["Double Mono", "Fiona Xue Ju", "Drew Farrar"],
  },
  {
    id: "doyle",
    name: "Kelly Doyle",
    sortName: "Doyle, Kelly",
    role: "Guitar",
    bio: "Kelly Doyle is a boundary-pushing Houston guitarist known for seamlessly blending jazz, country, rock, and avant-garde influences into a singular sound. Primarily self-taught, Doyle has developed a highly personal approach to the electric guitar, drawing as readily from improvisation and experimental music as from the deep traditions of Texas guitar playing.",
    image: "/img/bioPics/kelly-doyle.webp",
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
    bio: "Sandy Ewen is an experimental guitar player known for solo and collaborative improvisation. Ewen generates sounds with physical implements and extended techniques. Other than a pan pedal, she does not process the guitar's signal with effects. The resulting sounds are nuanced, focused on textures and timbres, with a clear but unusual connection to the physicality of the guitar, its strings, pickups and body. Ewen has spent over 20 years expanding her craft and musical vocabulary through both solo and collaborative projects.\n\nIn 2026, Ewen embarked on a 49-date US tour which included numerous solo performances as well as trios with Damon Smith and Weasel Walter, and duos with Arrington de Dionyso, Fred Frith, Mike Meanstreetz and Henry Kaiser. In July, the Sandy Ewen / Aaron Russell duo performed in New York and Massachusetts in support of a new cassette release. Several Canadian performances in August included duos with Phillip Greenlief. In the past few years, she has performed with the Roscoe Mitchell Quartet, in trio with Roscoe Mitchell and Thomas Buckner, in trio with Tim Dahl and Brian Chase, and in various small groups with Ravi Coltrane. Ewen performed at Sant'Anna Arresi Jazz Festival (Sardinia, Italy), Moers Festival (Germany), Wels Festival (Austria), and Jazz em Agosto (Portugal). Ewen has an extensive discography. It includes projects with Keith Rowe, Jaap Blonk, Roscoe Mitchell, Lisa Cameron, Damon Smith, Weasel Walter, Henry Kaiser and many others, as well as numerous solo releases.\n\nSandy Ewen grew up in Canada, however her last two years of high school were in Texas, where she was an active member of David Dove's Nameless Sound. While attending the University of Texas at Austin, she was a member of rock band Weird Weeds, and began a duo with Tom Carter called Spiderwebs. After graduating, Ewen moved back to Houston where she worked with many of the city's finest improvisers, including Ryan Edwards, Jason Jackson, Damon Smith, Rebecca Novak, Danny Kamins and Robert Pearson. Her women's large ensemble performed at the Menil, Diverse Works, and at NMASS in Austin. Architects of Cinema, her trio with Chris Nelson and Y.E. Torres, created and presented numerous multimedia performances incorporating video, sound, dance and fire performance. Ewen moved to Brooklyn, New York in 2017.\n\nEwen creates experimental videos, many of which are soundtracked with her music. Some of the videos are digital animations created in architectural software, while others feature natural elements, often collaged together. Ewen also uses slide projectors and analogue photographic processes to create, presenting a solo exhibition of these works in Brooklyn in 2025.",
  },
  {
    id: "aurum-son",
    name: "Aurum Son",
    sortName: "Aurum Son",
    role: "Sonia Flores — bass, voice, composition",
    image: "/img/bioPics/aurum-son.webp",
    bio: "Aurum Son is the moniker for the original music projects led by Houston bassist, vocalist, and composer, Sonia Flores. A graduate from Texas Southern University,  she received her Bachelors in Fine Arts with a concentration in Jazz Studies.\n\nAs a solo artist, much of Flores' work includes impromptu song composition, story telling, costume design and tonal/atonal melodies. Recurring themes as a composer are inspired by the spirit journey,  the vastness of the universe, quantum theories, motherhood,  brown/latinx experiences, the life and death cycle but above all else, universal love.\n\nWhether in full ensemble or solo act, Sonia Flores is the driving force behind Aurum Son. Aurum Son is a delicate balance of free jazz, avant-garde improvisation and composed song. Pulling from folk music from around the globe and avant garde sensibilities, it all comes together in a fantastical aural journey, defying categorization.\n\nIn full ensemble, Flores is joined by brilliantly talented Houston musicians, Jesse Ward on guitar, and both Gregory Jr. Brown and Yul Dorn on drums",
    links: [
      { label: "“The Western Lands”", url: "https://youtu.be/EEoR8BFEy8E" },
      { label: "Bandcamp", url: "https://aurumson.bandcamp.com/" },
      { label: "Instagram", url: "https://instagram.com/aurum.son" },
    ],
    members: [
      {
        name: "Jesse Ward",
        role: "Guitar",
        bio: "Jesse Ward is a versatile multi instrumentalist and composer who brings together jazz,  world, and improvised music with a focus on deep listening and genuine expression. Drawing inspiration from a wide range of musical traditions and spontaneous collaboration, Ward aims to make music that feels magical, unpredictable and alive—creating spaces where musicians and listeners can meet in the moment and share in something unrepeatable and real. Ward is a graduate of Houston’s High School for the Performing and Visual Arts and The New England Conservatory.",
      },
      {
        name: "Greg Jr. Brown",
        role: "Drums",
        bio: "Greg Jr Brown is a local Houston musician raised in Humble, TX. This dynamic player started his musical journey singing and dancing as a child, learning jazz, ballet, hiphop while also showcasing his talents as a Micheal Jackson impersonator. Outside of dance, Greg was active in both symphonic and marching bands including the City Wide Drum-line, playing tenor drum and quads. A talented all brass player, Greg earned top medals in solo and ensemble in Texas (UIL)and Oregon (PIL). During his time in Oregon, he was invited to be in one of Portland’s top symphonic bands, AMP, which led to the Portland Symphony. Always knowing he wanted to play drums, he finally picked up a set of sticks, which shifted the trajectory of his musical career as a highly sought out drummer. He formed his own band with his school peers by the age of 15. They played in corner stores, supermarkets and anywhere opportunities led them. Back in Houston, Greg has made it a priority to play in Church. He is active in many services including Second Baptist Katy, Fellowship of the Woodlands, and Dominion International Center just to name a few. Due to his background and versatility in many genres such as rock, reggae, gospel, avant garde, americana, country, blues, etc. he has amassed a long resume of musical collaborators. The list includes John Del Toro Richardson, Mark May, Sonnie Boy Terry, Snafu, Annika Chambers, Aurum Son, Ruckus, Oliver Penn, Kristine Alicia, Galaxy Band, JAM Band, GMD Band, Rapture, Rick Lee & The Nightowls, and so many more. Greg has also broadened his skills as a member and musical director of a Grammy award winning band. Currently, he is the house drummer at the Big Easy Social Club. Whether in a touring act or a recording sound booth, Greg has proven to be extremely passionate about music and it shines through in his playing.",
      },
      { name: "Yul Dorn", role: "Drums" },
    ],
    aliases: ["Sonia Flores"],
  },
  {
    id: "helton",
    name: "Thomas Helton",
    sortName: "Helton, Thomas",
    role: "Bass",
    // Trimmed for the card — the full CV-length version is in Chapman's bios doc.
    bio: "Houston bassist and composer Thomas Helton is a multifaceted improviser and skilled interpreter of contemporary bass repertoire. Equally adept at playing jazz, classical, experimental and avant-garde music, Helton continues to push and redefine the possibilities of his instrument by embracing extended performance techniques and new compositional forms.\n\nHelton has studied with several bass masters, including Eric Late, Dennis Whittaker, Mark Helias, Rufus Reid, Lynn Seaton and William Parker, and performed with such celebrated musicians as Tim Hagans, Milt Jackson, Daniel Carter, Monty Alexander, Frank Gratkowski, Ernie Watts, William Parker, Weasel Walter, Robert Boston, Damon Smith and Steve Swell. Helton has composed music for solo bass as well as small and large ensembles, including several pieces for choreographer Michele Brangwen and the experimental dance company Group Acorde.\n\nIn 2004, Helton was awarded an artist residency from DiverseWorks Art Space for the commission and premiere of Pride, a work for ten-piece ensemble and projected video created in collaboration with artist Maria del Carmen Montoya. Helton’s tango suite for MBDE, Desesperados (2005) is featured on Houston Public Radio’s CD The Best of the Front Row, and his composition Black Rain (2005), for saxophone, guitar, string bass, percussion and dancers, was selected for performance at FotoFest 2006: the Eleventh International Biennial of Photography and Photo-related Art. In 2007, Helton received a Houston Arts Alliance Individual Artist Fellowship Grant for the commission and premiere of a new work for his fifteen-piece Torture Chamber Ensemble. In 2010, he was awarded a three month TAKT Artist Residency in Berlin, and performed at many of the city’s avant-garde venues with local musicians Simon Rose, Matthias Müeller, Klaus Kürvers, Chris Heenan and Clayton Thomas. Later that year, Helton toured the U.S., performing solo and as a collaborator at the Norcal Noisefest, University of Southern California and University of North Texas. In 2011, a DVD collaboration with videographer Jonathan Jindra, which features Helton performing his original composition I in various industrial settings, screened at the International Society of Improvised Music Conference.\n\nHelton is a founding member of The Core Trio, which includes Houston saxophonist Seth Paynter and New York-based drummer Joe Hertenstein. In 2014, The Core Trio released their critically acclaimed vinyl album/CD/download The Core Trio , featuring Matthew Shipp, a completely improvised performance with legendary pianist Matthew Shipp.  in 2015 that same ensemble with Shipp released a second “live” record. That same year, Helton commissioned and premiered a composition by Shipp for the Houston Composers Salon. He performed in Mieczysław Weinberg’s opera The Passenger at New York’s Park Avenue Armory with the Houston Grand Opera.\n\nHis recent projects include leading and  tubaist with his traditional Dixieland jazz band Boomtown Brass Band, playing electric bass in the original  heavy metal band Echo Temple, collaborations as the duo pH with New York-based electronic composer Kevin Patton, performances of “improvised opera” with opera singer singer Misha Penton and pianist Hsin-Jung Tsai. A new music ensemble, Relative Dissonance.  Thomas is the primary bass luthier at Quantum Bass Center in Houston. He is also a founding member of Swing Rendezvous, a “gypsy” jazz band.   2016 saw the  premiere of his composition A Siren’s Dream for eight double basses. He is also the artistic director of the non-profit organization Houston Composers Salon, which presents seasonal concerts of contemporary music by living composers.\n\nIn 2016, Helton toured the east coast as a soloist and performed on programs with bassist Michael Formanek, steel guitarist Susan Alcorn and saxophonist Tony Malaby. He also traveled to Taiwan to perform and lecture in several music venues and schools. In the Summer of 2016 he helped form the non-profit modern dance ensemble Group Acorde with dancers Roberta Cortes, Lindsey McGill and long time collaborator Seth Paynter.  In October of  2016 Helton began Odd Gravity, a collaboration with New York musicians Jaimie Branch and percussionist Michael Evans.\n\nIn 2017 he performed with Steve Swell in a commission from the Houston Composers Salon. That summer also included performances with the Michele Brangwen Dance Ensemble featuring Tim Hagans in New York as well as Houston. Thomas was a featured performer at the International Society of Bassist in Ithaca, NY. Later that year we was accepted to the Atlantic Center for Art Residency in Florida to study with bassist/composer Michael Bisio. While there he began the development of a new music notation system based on his unique style of improvisation. While on tour in 2017, Mr. Helton shared the stage in a 11 member bass ensemble at John Zorns venue, The Stone. Other bassist included Rufus Reid, Trevor Dunn, Mark Helias,  and Mark Dresser.\n\nHelton has released three CDs of original compositions and improvisations, Doublebass (2003), Experimentations in Minimalism (2004) and Saga (2006), all of which received positive reviews in both U.S. and European press.",
  },
  {
    id: "lurie",
    name: "Asher Lurie",
    sortName: "Lurie, Asher",
    role: "Student composer",
    bio: "Asher Lurie (b. 2003) is a composer, percussionist, and guitarist from Dallas, Texas. He is the winner of the Tribeca New Music Young Composer Competition and the Composers Concordance Composition Competition, and a finalist in The American Prize, musicON Composition Competition, Brevard Music Center Composition Competition, and The Sound Ensemble.\n\nLurie has collaborated with artists at the highSCORE Festival, soundSCAPE Composition and Performance Exchange, Cortona Sessions, Brevard Music Festival, Atlantic Music Festival, and UGA New Music Festival. Ensembles he has worked with include Sandbox Percussion, Unheard-of//Ensemble, arx duo, Trio Kanon, KHAOS Wind Quintet, Silver Bow Sound, Latitude 49, and Pathos Trio. As the winner of the inaugural Stamps Composition Competition, he was commissioned by the Stamps Foundation to write Make a Statement, premiered by the combined Stamps woodwind quintet, brass quintet, string quartet, jazz quintet, and genre-bending trio Time for Three.\n\nLurie began his musical journey through lessons in electric guitar and bass with Mick Cervino (bassist for Ritchie Blackmore, K.K. Downing, and Yngwie Malmsteen) where he studied rock and metal music through a neoclassical lens. Inspired by this education and his Jewish heritage, Lurie’s music regularly explores aggression, explosiveness, and relentlessness with lush, dreamy touches emerging from the background.\n\nA graduate of the University of Miami's Frost School of Music, Lurie studied Music Theory and Composition with Donald Scott Stinson and with resident composers Matthias Pintscher, Chen Yi, and Marcos Balter. He is currently pursuing his Master’s in Composition at the Shepherd School of Music at Rice University, where he studies with Pierre Jalbert.",
  },
  {
    id: "ma",
    name: "Aisling Ma",
    sortName: "Ma, Aisling",
    role: "Composer / guitarist · Rice University",
    // Sent by Aisling to Chapman, Aug 24 — verbatim.
    bio: "Haoyang Aisling Ma (b.2005) is a Chinese composer/guitarist studying at Rice University.\n\nAs a composer, her works have been performed by ensembles and soloist such as Ensemble Modern, Divertimento Ensemble, Mivos Quartet, Kinetic Ensemble, members of Boston Philharmonic Orchestra and China Philharmonic Orchestra. She has been selected as a composition fellow in major festivals, such as Barcelona Modern (2025), International Workshop for Young Composers (2024), Valencia International Performing Arts Summer Festival (2024), St. Petersburg International Festival (2026). As a guitarist, she has maintained an active performance schedule throughout her academic career, making appearances in diverse collegiate and institutional settings.",
    aliases: ["Haoyang Aisling Ma"],
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
    role: "Musician and designer",
    bio: "Kevin Sinclair Patton, PhD, is a creative technologist and academic who builds interactive systems that connect people — a strategic problem solver and inventor creating bespoke technological solutions that serve artistic vision. He is also a practicing musician and audio engineer whose studio and electroacoustic work informs his approach to responsive, interactive systems. He is an Assistant Professor of Interaction Design at the Corcoran School of the Arts and Design at the George Washington University. He holds a Ph.D. and M.A. from Brown University and was an Invited Researcher at the Sorbonne, University of Paris IV.\n\nHis collaborative projects span immersive web experiences, augmented reality, and interactive installations for cultural institutions. Recent work includes DECIDE(S) (decides.app), a collaborative music production web app; Wayside (wayside.at), a browser-based AR system built for artist Andrew Kastner; Guest Editor of Volume 30 of Ideas Sónicas, a bilingual peer-reviewed journal examining automation and expression in creative practice; and Louise et Ondarel, a virtuosic guitar-and-voice duo performing multilingual art songs of solidarity, love, and dreams in Arabic, Russian, French, and English. As an educator, Kevin sees a direct continuity between his public-facing work and his teaching, where student projects regularly evolve into public installations and cultural engagements.",
    image: "/img/bioPics/kevin-patton.webp",
    links: [
      { label: "kevinpatton.site", url: "https://kevinpatton.site" },
      { label: "DECIDE(S)", url: "https://decides.app" },
      { label: "Wayside", url: "https://wayside.at" },
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
    image: "/img/bioPics/chapman-welch.webp",
    bio: "Chapman Welch is a guitarist, composer, educator, and music-technology specialist at Rice University's Shepherd School of Music, where he serves as Electroacoustic Specialist for the Rice Electroacoustic Music Labs (REMLABS). His work spans experimental and electronic music, improvisation, American guitar traditions, and the creative use of technology in performance and composition. Welch is a founding member of the Adventurous Electric Guitar Festival with composer and guitarist Christopher Trapani, an initiative devoted to contemporary and experimental approaches to the electric guitar through performances, workshops, artist presentations, and educational programs. As a guitarist, Welch toured extensively with his band Law of Nature and recorded with legendary Allman Brothers producer Johnny Sandlin. He won the 2019 Texas Flatpicking Championship and has twice been a finalist at the National Flat Pick Guitar Championship in Winfield, Kansas.",
    links: [{ label: "chapmanwelch.com", url: "http://chapmanwelch.com/" }],
  },
  {
    id: "williams",
    name: "Brad Allen Williams",
    sortName: "Williams, Brad Allen",
    role: "Guitar",
    bio: "Although known for his surrealistic guitar stylism, Brad Allen Williams describes himself as a “professional listener.” Improvisation is a core musical value that animates collaborations and solo projects alike—it informs the openness, curiosity, presence, and relentless thirst for context that are his hallmarks (whether or not an instrument is in his hands, and whether or not the music centers the extemporaneous in any literal fashion). In his work with artists like Brittany Howard, Bilal, Nate Smith and others, Williams grounds outwardly-bold aesthetic choices in encyclopedic knowledge. On his solo albums œconomy and light rivers, he casts himself in productive opposition to his instrument, which he describes as “overleveraged in the last 100 years of popular music.” The mission is at once modest and extremely ambitious: he aspires to reimagine the guitar’s role and function on an atomic level, all while keeping service of music at the center.\n\n—WILL SCHUBE",
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

/* ── Derived: who appears where ────────────────────────────────────────────
   Both directions of the participant ↔ programme relationship, matched by
   name + `aliases` against each event's haystack (see config/events.ts). The
   flat programme list itself used to be rebuilt here; it now comes from
   EVENTS, so there is one traversal of SCHEDULE/ONGOING in the codebase. */

export interface Appearance {
  /** e.g. "Fri, Oct 9 · 2 PM" or "Oct 8–9, 10 AM–5 PM" */
  when: string;
  title: string;
  venue: string;
}

function matchers(p: Participant): string[] {
  return [p.name, ...(p.aliases ?? [])].map((s) => s.toLowerCase());
}

/** Where in an event's haystack this participant is first named, or Infinity. */
function nameIndex(p: Participant, event: FestivalEvent): number {
  let at = Number.POSITIVE_INFINITY;
  for (const key of matchers(p)) {
    const i = event.haystack.indexOf(key);
    if (i >= 0) at = Math.min(at, i);
  }
  return at;
}

/** Every programme entry this participant appears in, in programme order. */
export function participantAppearances(p: Participant): Appearance[] {
  return EVENTS.filter((e) => nameIndex(p, e) < Number.POSITIVE_INFINITY).map(
    ({ when, title, venueName }) => ({ when, title, venue: venueName }),
  );
}

/**
 * The other direction: everyone in the roster who appears in this event.
 *
 * Ordered by where each name falls in the event's own performer list, so a
 * confirmed set order ("Brad Allen Williams · Kelly Doyle · Aurum Son") comes
 * back as billed rather than alphabetically.
 */
export function eventParticipants(event: FestivalEvent): Participant[] {
  return PARTICIPANTS.map((p) => ({ p, at: nameIndex(p, event) }))
    .filter((h) => h.at < Number.POSITIVE_INFINITY)
    .sort((a, b) => a.at - b.at)
    .map((h) => h.p);
}

/** Programme index of a participant's first appearance; Infinity if unscheduled. */
function firstAppearanceOrder(p: Participant): number {
  const hit = EVENTS.find((e) => nameIndex(p, e) < Number.POSITIVE_INFINITY);
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
