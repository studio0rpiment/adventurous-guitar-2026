/**
 * Privacy notice and personal-data statement.
 *
 * Written to GDPR shape (Articles 13–14: who the controller is, what is
 * processed, why, on what lawful basis, who else sees it, how long it's kept,
 * and what rights the person has) even though the audience is American. Two
 * reasons that's the right call rather than gold-plating: the festival's
 * participants and its audience include people in the EU and UK, and the GDPR
 * template is simply the most complete one — a notice that satisfies it
 * satisfies the US state laws too.
 *
 * Content only, like sections.ts and participants.ts — the panel renders it.
 *
 * ⚠ This is a careful draft, not legal advice. Have someone qualified read it,
 * and check whether Rice/REMLABS require their own notice to govern or be
 * linked alongside it, since the festival is presented under their name.
 */

/** Controller — the entity legally answerable for this site's processing. */
export const CONTROLLER = {
  name: "Studio Orpiment",
  url: "https://orpiment.studio",
  /** Live and monitored — confirmed 2026-08-21. Rights requests arrive here,
   *  so it has to stay that way for as long as the notice is published. */
  email: "privacy@orpiment.studio",
} as const;

/** Shown as the panel's subtitle. Bump it whenever the text below changes. */
export const UPDATED = "August 2026";

export interface PrivacySection {
  heading: string;
  /** Paragraphs, in order. */
  paras?: string[];
  /** A bulleted list rendered after the paragraphs. */
  list?: string[];
  /** A closing paragraph after the list. */
  after?: string[];
}

/* ── Part one: the website ─────────────────────────────────────────────── */

export const WEBSITE: PrivacySection[] = [
  {
    heading: "The short version",
    paras: [
      "This site sets no cookies, runs no analytics, and loads nothing from third parties. There is no tracking here of any kind, and nothing you do on this page is recorded by us or shared with anyone.",
      "The only personal data that arises from your visit is what any web server unavoidably records in order to send you a page — principally your IP address. That is described below.",
    ],
  },
  {
    heading: "Who is responsible",
    paras: [
      `This website is operated by ${CONTROLLER.name}, which is the data controller for the processing described here. You can reach us at ${CONTROLLER.email}.`,
      "The festival itself is presented by REMLABS at Rice University. Anything you send to the festival's organisers directly, or any personal data you give Rice or a ticketing partner, is handled under their own policies rather than this one.",
    ],
  },
  {
    heading: "What the site does not do",
    list: [
      "No cookies, no local storage, and no other identifiers are set in your browser.",
      "No analytics, measurement, advertising or session-recording tools are present.",
      "Fonts, images, 3D models and code are all served from this site's own domain — nothing is fetched from Google Fonts, a CDN or a social network when the page loads, so no third party learns you were here.",
      "There are no forms, sign-ups, or accounts, so there is nothing for you to submit.",
      "Nothing is sold, rented, or shared for marketing. There is no profiling and no automated decision-making.",
    ],
  },
  {
    heading: "What is unavoidably processed",
    paras: [
      "The site is hosted by Vercel. Like any host, Vercel's servers log the requests they serve in order to deliver the site and to defend it against abuse. Those logs can include:",
    ],
    list: [
      "your IP address",
      "the page or file you requested, and whether it was served successfully",
      "your browser's user-agent string and preferred language",
      "the date and time of the request",
    ],
    after: [
      "We use this for one purpose only: keeping the site up and secure. We do not use it to build a picture of you, and we do not combine it with anything else. Our lawful basis is our legitimate interest in operating a website that works and is not attacked (GDPR Article 6(1)(f)).",
      "Vercel acts as our processor and holds these logs under its own retention schedule; we do not keep a separate copy. Vercel is a US company and the site is served from a global network, so this data is processed in the United States and elsewhere.",
    ],
  },
  {
    heading: "Links to other places",
    paras: [
      "This site links out to ticketing, maps, venue sites, streaming services and the artists' own pages. Those links are ordinary links — nothing is embedded, and nothing loads from those services until you choose to follow one.",
      "Once you do, you are on their site and their privacy policy applies, not ours. We have no visibility of what happens there.",
    ],
  },
  {
    heading: "If you write to us",
    paras: [
      "If you email us, we hold that message and your address for as long as it takes to deal with what you wrote about, and a reasonable period afterwards for our records. We do not add you to any list.",
    ],
  },
];

/* ── Part two: personal data of the people in the programme ────────────── */

export const PEOPLE: PrivacySection[] = [
  {
    heading: "Why this section exists",
    paras: [
      "The substantial personal data on this site is not the audience's — it is the participants'. This site publishes named, identifiable people: musicians, speakers, builders and organisers. Under the GDPR that is processing personal data, and the people described are entitled to know what is held and to have a say in it.",
    ],
  },
  {
    heading: "What is published about participants",
    list: [
      "name, and the name of any group or ensemble they perform with",
      "role or professional affiliation",
      "a biography",
      "a photograph, where one has been supplied",
      "links they have chosen to share — their own site, recordings, social profiles",
      "the festival events they appear in, and where and when those take place",
    ],
    after: [
      "No contact details, no personal addresses, and no special-category data (health, beliefs, and so on) are published. Nothing about anyone under 18 is published.",
    ],
  },
  {
    heading: "Where it comes from, and on what basis",
    paras: [
      "Biographies, photographs and links are supplied by the participants themselves, or by the festival's organisers with the participant's agreement. A small number of biographies were drafted from a person's own public professional page while we wait for their approval; those are replaced with the participant's own text as it arrives.",
      "The lawful basis is legitimate interests (GDPR Article 6(1)(f)): publicising a public music festival and telling its audience who is performing. Appearing at a public event is inherently public, and a programme that names its performers is what an audience expects — so we consider this a use participants would reasonably anticipate, and one that does not override their rights. Where a photograph or biography was given to us specifically for this purpose, that is also consent, and it can be withdrawn at any time.",
    ],
  },
  {
    heading: "How long it stays up",
    paras: [
      "Programme information remains published while the site is live, including after the festival, because it is a record of what happened. If a participant asks us to remove or amend their entry, we will do so — see below — regardless of whether the festival has already taken place.",
    ],
  },
  {
    heading: "Your rights",
    paras: [
      "If you are described on this site, or if you visited it, you have the right to:",
    ],
    list: [
      "ask what we hold about you, and get a copy",
      "have anything inaccurate corrected",
      "ask us to delete it",
      "ask us to restrict how we use it, or object to our use of it",
      "receive data you gave us in a portable form",
      "withdraw consent, where consent is what we relied on",
    ],
    after: [
      `To exercise any of these, email ${CONTROLLER.email}. We will respond within one month. There is no charge, and you do not need to give a reason to object to a legitimate-interests use — for a participant, "please take my photo down" is enough on its own.`,
      "If you are in the EU or the UK and think we have handled your data badly, you may complain to your national data protection authority. We would rather you told us first, but that right does not depend on it.",
    ],
  },
  {
    heading: "Changes",
    paras: [
      `This notice was last updated in ${UPDATED}. If it changes materially before the festival, the updated date here changes with it.`,
    ],
  },
];
