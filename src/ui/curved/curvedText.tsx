/**
 * Text on gently curved baselines — the site's one piece of type grammar.
 *
 * Extracted from Island.tsx when the opened event card needed the same
 * treatment for its title: the layout maths (wrap at a fixed size, stack the
 * lines, alternate the bend) and the SVG rendering are the shared part, and
 * the black oblong behind them is not. Two copies of "how far does a line
 * bend" is how the card and the island would have quietly stopped matching.
 *
 * Everything here is in VIEWBOX UNITS. Callers set the viewBox width and let
 * the SVG scale to its container, so the type scales with the object it's on
 * rather than needing a breakpoint.
 */

export interface CurvedField {
  text: string;
  /** Cap height in viewBox units. */
  size: number;
  color: string;
  /** Letter-spacing, viewBox units. */
  sp: number;
  /** Space below this field before the next one starts. */
  gapAfter: number;
}

export interface CurvedLine {
  text: string;
  size: number;
  color: string;
  sp: number;
  y: number;
  bend: number;
}

export interface CurvedOptions {
  /** viewBox width. */
  width: number;
  /** Horizontal inset for the text paths. */
  padX: number;
  /** Where the first baseline sits. */
  startY: number;
  /** Space kept below the last line. */
  endPad: number;
  /** How far the middle of a line dips; alternates sign line to line. */
  bend: number;
}

/** Wrap onto multiple lines at a FIXED size — nothing shrinks to fit, so
 *  every line stays the size it was designed at and the box grows instead. */
export function wrapToWidth(
  text: string,
  size: number,
  contentW: number,
  fullW: number = contentW,
): string[] {
  const fits = (w: number) => Math.max(6, Math.floor(w / (size * 0.58)));
  const maxChars = fits(contentW);
  // A hard segment is allowed the whole object, padding included — the author
  // asked for that line, and a line that merely eats into the inset still sits
  // on the island. Only one that would run off the edge gets re-broken.
  const hardMax = fits(fullW);

  // A newline in the copy is a HARD break — the one place an editor can say
  // where a line should turn. Character-count wrapping can't know that "Final
  // Concert @ Dan Electro's Guitar Bar" wants to break after the @ and again
  // after the venue's first half; nothing but a person's eye can. Each hard
  // segment is still soft-wrapped below if it's too long on its own, so a break
  // hint can never push a line off the island.
  const segments = text.split("\n");
  const hard = segments.length > 1;

  return segments
    .flatMap((segment) => softWrap(segment.trim(), hard ? hardMax : maxChars))
    .filter(Boolean);
}

function softWrap(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const out: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (t.length > maxChars && cur) {
      out.push(cur);
      cur = w;
    } else {
      cur = t;
    }
  }
  if (cur) out.push(cur);
  return out;
}

/** Stack the fields into baselines, and report how tall the result is. */
export function layoutCurved(
  fields: CurvedField[],
  o: CurvedOptions,
): { lines: CurvedLine[]; height: number } {
  const contentW = o.width - 2 * o.padX;
  const lines: CurvedLine[] = [];
  let y = o.startY;
  let i = 0;

  for (const f of fields) {
    for (const text of wrapToWidth(f.text, f.size, contentW, o.width)) {
      y += f.size;
      lines.push({
        text,
        size: f.size,
        color: f.color,
        sp: f.sp,
        y,
        bend: i % 2 === 0 ? o.bend : -o.bend,
      });
      y += f.size * 0.26;
      i++;
    }
    y += f.gapAfter;
  }

  return { lines, height: Math.round(y + o.endPad) };
}

/**
 * The lines themselves. Must be rendered inside an `<svg>` — the caller owns
 * the viewBox (and whatever sits behind the text). `id` must be unique on the
 * page: it namespaces the path refs each line is drawn along.
 */
export function CurvedText({
  id,
  lines,
  width,
  padX,
}: {
  id: string;
  lines: CurvedLine[];
  width: number;
  padX: number;
}) {
  return (
    <>
      <defs>
        {lines.map((l, i) => (
          <path
            key={i}
            id={`${id}-a${i}`}
            d={`M ${padX},${l.y} Q ${width / 2},${l.y + l.bend} ${width - padX},${l.y}`}
            fill="none"
          />
        ))}
      </defs>
      {lines.map((l, i) => (
        <text
          key={i}
          fill={l.color}
          fontSize={l.size}
          letterSpacing={l.sp}
          style={{ fontFamily: "var(--font-body)" }}
        >
          <textPath href={`#${id}-a${i}`} startOffset="50%" textAnchor="middle">
            {l.text.toUpperCase()}
          </textPath>
        </text>
      ))}
    </>
  );
}
