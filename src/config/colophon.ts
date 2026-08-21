/**
 * Colophon — how the site was made, and who is answerable for it.
 *
 * A colophon is the web's own idiom for this, and it's where three separate
 * obligations happen to converge: crediting the typefaces, attributing the 3D
 * models (see MODELS below — this one is a licence condition, not a courtesy),
 * and disclosing the use of an AI assistant.
 *
 * Rendered at the end of the PRIVACY panel, not About: About is about the
 * festival, and the website's account of itself belongs with the notice that
 * answers the other questions about the website.
 *
 * The AI wording follows the convention that academic publishing has settled
 * on, since there's no agreed one for websites: name the tool, say what it was
 * used for, and state plainly that responsibility and authorship stay human.
 * An AI assistant is not credited as an author, because it isn't one.
 */

export interface Credit {
  label: string;
  value: string;
  url?: string;
}

/**
 * Attribution for a third-party 3D model.
 *
 * CC BY 4.0 asks for four things — the creator, the title, a link to the
 * material and a link to the licence — plus an indication if you changed it.
 * That last one is easy to forget and applies here: the models were
 * recompressed for the web, which is a modification. `modified` prints it.
 */
export interface ModelCredit {
  title: string;
  author: string;
  url: string;
  license: string;
  licenseUrl: string;
  /** True when the file shipped here isn't the file as downloaded. */
  modified?: boolean;
}

const CC_BY_4 = {
  license: "CC BY 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
};

export const MODELS: ModelCredit[] = [
  {
    title: "Fender Jaguar",
    author: "jb (johnny.buxton)",
    url: "https://sketchfab.com/3d-models/fender-jaguar-4cc5d375d24a4891be7529ced86d2fc9",
    // Draco-compressed geometry and WebP textures, 43.3 MB → 2.2 MB. No
    // decimation — the mesh is the artist's, just packed smaller.
    modified: true,
    ...CC_BY_4,
  },
  // NOT LISTED HERE ON PURPOSE — /models/guitarCableJack.glb.
  //
  // It's "Audio connectors" by evilvoland on TurboSquid, and that licence
  // doesn't want a credit; it wants a decision. The page marks it EDITORIAL USE
  // ONLY (it depicts real connector brands the seller doesn't represent), and
  // the festival sells tickets. Separately, a .glb under public/ is downloadable
  // by anyone, and stock-3D licences routinely allow depicting a model but not
  // distributing the file. Adding a colophon line would look like diligence
  // while fixing nothing.
  //
  // See docs/ASSET-PROVENANCE.md for the full record and the cheap way out:
  // build the plug from primitives the way Socket.tsx already builds the
  // sockets, and the question disappears.
];

export const COLOPHON = {
  heading: "Colophon",

  intro: [
    "This site was designed and built by Studio Orpiment. The cable scene, the floating programme and the guitar at the end are drawn live in the browser with React Three Fiber and three.js — there is no video and no pre-rendered imagery.",
  ],

  /**
   * The AI disclosure. Deliberately specific about the division of labour,
   * because a vague "made with AI" tells a reader nothing and a silent omission
   * isn't right either.
   */
  ai: [
    "The design, the concept and the technical direction are Kevin Patton's, as are the decisions behind them. The site was built working alongside Claude, an AI assistant made by Anthropic, which was used for implementation, debugging and technical suggestions throughout.",
    "The assistant is a tool, not an author. Every choice about how this site looks and behaves was made by a person, and responsibility for everything published here is human.",
  ],

  credits: [
    { label: "Design & build", value: "Studio Orpiment", url: "https://orpiment.studio" },
    { label: "Typefaces", value: "Format 1452, Monstera, Rotor VF" },
    { label: "Built with", value: "React Three Fiber · three.js · Vite" },
    { label: "AI assistance", value: "Claude (Anthropic)", url: "https://www.anthropic.com" },
  ] as Credit[],
} as const;
