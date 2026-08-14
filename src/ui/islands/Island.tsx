const W = 480;
const PAD_X = W * 0.1;
const CONTENT_W = W - 2 * PAD_X;
const ORANGE = "#e8964a";
const WHITE = "#f4f1ea";
const MUTED = "rgba(244, 241, 234, 0.62)";

type Field = { text: string; size: number; color: string; sp: number; gapAfter: number };

// Wrap a field onto multiple lines at a fixed size (no shrinking) so every word
// stays on the island.
function wrap(text: string, size: number): string[] {
  const maxChars = Math.max(6, Math.floor(CONTENT_W / (size * 0.58)));
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

/**
 * A floating black island with the text warped across it (each line follows a
 * gentle curved SVG path). Long fields wrap onto more lines at the same size,
 * and the island grows to fit. `id` must be unique (used for the path refs).
 */
export function Island({
  top,
  title,
  sub,
  note,
  id,
}: {
  top?: string;
  title: string;
  sub?: string;
  note?: string;
  id: string;
}) {
  const fields: Field[] = [];
  if (top) fields.push({ text: top, size: 24, color: ORANGE, sp: 2, gapAfter: 10 });
  fields.push({ text: title, size: 50, color: WHITE, sp: 0, gapAfter: 8 });
  if (sub) fields.push({ text: sub, size: 24, color: ORANGE, sp: 1, gapAfter: 8 });
  if (note) fields.push({ text: note, size: 17, color: MUTED, sp: 0.5, gapAfter: 0 });

  type L = { text: string; size: number; color: string; sp: number; y: number; bend: number };
  const lines: L[] = [];
  let y = 46;
  let bi = 0;
  for (const f of fields) {
    for (const wl of wrap(f.text, f.size)) {
      y += f.size;
      lines.push({ text: wl, size: f.size, color: f.color, sp: f.sp, y, bend: bi % 2 === 0 ? 7 : -7 });
      y += f.size * 0.26;
      bi++;
    }
    y += f.gapAfter;
  }
  const H = Math.round(y + 40);
  const r = Math.min(78, H * 0.42);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", overflow: "visible" }}>
      <defs>
        {lines.map((l, i) => (
          <path
            key={i}
            id={`${id}-a${i}`}
            d={`M ${PAD_X},${l.y} Q ${W / 2},${l.y + l.bend} ${W - PAD_X},${l.y}`}
            fill="none"
          />
        ))}
      </defs>
      <rect x={0} y={0} width={W} height={H} rx={r} ry={r} fill="#08080b" />
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
    </svg>
  );
}
