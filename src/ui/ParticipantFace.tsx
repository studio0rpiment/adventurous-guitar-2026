import { useState, type CSSProperties } from "react";

/** Two-word initials, the fallback mark for anyone without a photo. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/**
 * A participant's portrait, or their initials.
 *
 * Extracted because two call sites drew it — the roster card and the line-up
 * chip — and because the initials state isn't really a fallback here: most of
 * the roster has no photo yet, so it's the common case and has to look
 * deliberate.
 *
 * It also survives a photo that 404s. Images are landing one at a time as
 * Chapman sends them, and a filename in participants.ts can easily arrive
 * before the file does; a broken-image icon in the middle of a bio looks like
 * the site is broken, initials look like a choice.
 */
export function ParticipantFace({
  name,
  image,
  size,
  textSize = "0.68rem",
}: {
  name: string;
  image?: string;
  /** Any CSS length — the mark is square. */
  size: string;
  textSize?: string;
}) {
  const [broken, setBroken] = useState(false);
  const box: CSSProperties = { width: size, height: size };

  if (image && !broken) {
    return (
      <img
        className="ags-face"
        src={image}
        alt=""
        style={box}
        onError={() => setBroken(true)}
      />
    );
  }

  return (
    <span className="ags-face ags-face--initials" style={{ ...box, fontSize: textSize }} aria-hidden>
      {initials(name)}
    </span>
  );
}
