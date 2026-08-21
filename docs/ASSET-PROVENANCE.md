# Asset provenance — what to record, and what we have

Every third-party asset that ships in `public/` needs a row in the ledger below.
Fill it in **at download time** — provenance is nearly impossible to reconstruct
months later, which is exactly the hole we're in with the jack plug.

---

## The checklist — capture these eight things when you download

Takes a minute. Paste it straight into the ledger.

| # | Field | Why it matters |
|---|---|---|
| 1 | **Source URL** | The specific model page, not the site. It's the only reliable way back to the terms. |
| 2 | **Creator name / username** | Required by CC BY and most attribution licences. Usernames get changed — record it now. |
| 3 | **Exact title** | Also required by CC BY, and it's how you find the model again if the URL rots. |
| 4 | **Licence, named exactly** | "CC BY 4.0" and "CC BY-NC 4.0" differ by one letter and one is unusable for anything commercial. Copy the string, don't paraphrase. |
| 5 | **Licence URL** | CC BY requires linking it. For marketplaces, link the licence page as it read that day. |
| 6 | **Any usage restriction printed on the page** | "Editorial use only", "no redistribution", "not for use in games" — the sharp edges live here, and they're usually one line of small print. |
| 7 | **Date downloaded** | Terms change. What matters is the licence you accepted, and the date is your evidence. |
| 8 | **What you changed** | CC BY requires you to indicate modifications. Recompression counts. |

**Also save a copy of the licence page itself** (print-to-PDF into
`/assets-source/licences/`). A marketplace can revise its terms; a screenshot
of what you agreed to cannot be revised out from under you.

### Two questions worth asking before you download

- **Does it depict a real brand?** Fender, Neutrik, Boss, Marshall. Branded
  models are the ones that carry "editorial use only", because the seller has
  no right to license someone else's trade dress.
- **Will the file itself be downloadable by the public?** Anything in
  `public/` on a website is. Stock-3D licences frequently allow you to show
  renders of a model but not to distribute the model file. This is the single
  most common way a web project breaks a 3D licence — and it doesn't apply to
  print or video work, so it's easy to carry the wrong habit over.

---

## Ledger

### `fender_jaguar-web.glb` — ✅ clear, credited

| | |
|---|---|
| Title | Fender Jaguar |
| Creator | jb (`johnny.buxton`) |
| Source | https://sketchfab.com/3d-models/fender-jaguar-4cc5d375d24a4891be7529ced86d2fc9 |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Restrictions | None beyond attribution |
| Modified | Yes — Draco geometry + WebP textures, 43.3 MB → 2.2 MB, no decimation |
| Status | Credited in the site colophon, with "modified" noted as CC BY requires |

### `guitarCableJack.glb` — ⚠️ **needs a decision before launch**

| | |
|---|---|
| Title | Audio connectors |
| Creator | `evilvoland` |
| Source | https://www.turbosquid.com/3d-models/jack-connectors-model-1424706 |
| Price | Free |
| Licence | TurboSquid Standard License |
| Restrictions | **"Editorial Uses Only."** The page states the depicted IP, including brands, is not affiliated with or endorsed by the rights holders and must be used under editorial use restrictions. |
| Status | Shipping on every cable end. Not credited — attribution isn't what this licence wants. |

**Why this one is not like the Jaguar.** TurboSquid doesn't ask for a credit, so
no colophon line fixes it. Two things to check against the full licence text:

1. **Editorial-only excludes commercial use.** The festival sells tickets. A
   university arts festival has a decent editorial character, but "we're an arts
   event" isn't a settled answer, and it isn't one to guess at.
2. **The `.glb` is publicly downloadable.** Anything under `public/` can be
   fetched directly. Stock-3D licences commonly permit depicting a model but not
   distributing the model file, and a `.glb` served to the browser is the file.

**The cheap way out:** model the plug procedurally, the way `Socket.tsx` already
builds the silver jack sockets from primitives (those came from a manufacturer's
drawing — no licence attached, and no file to distribute). A ¼" plug is a
cylinder, a sleeve, a tip and a collar. That removes the question entirely
rather than answering it, and it drops a network request.

### `DlyNarrowPedal-web.glb`, `FootSwitch-web.glb` — 🗑️ unused, still shipping

Nothing in `src/` loads either one — they're left over from the plug-scene
prototype. They are still deployed to `public/models/` and downloadable.
Provenance unrecorded. **Move them out of `public/` regardless of licence**:
there is no upside to distributing an asset the site doesn't use.

### Procedural — nothing to record

The cables (Verlet rope + generated `TubeGeometry`), the sockets
(`three/socket/Socket.tsx`, from a manufacturer's drawing) and the islands are
all generated in code. No third-party rights, nothing to attribute.

---

## Fonts

Format 1452, Monstera and Rotor VF are self-hosted in `public/fonts/`. Webfont
licences are their own category — most forbid serving the font file to third
parties without a webfont licence. Worth confirming each is licensed for web
embedding, and recording those the same way.

---

_Not legal advice. Where a licence question is genuinely open — the TurboSquid
one is — the answer is to read the full licence and, if it's still unclear, ask
the marketplace or a lawyer, not to reason it out from the product page._
