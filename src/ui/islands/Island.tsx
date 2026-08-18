import { layoutCurved, CurvedText, type CurvedField } from "@/ui/curved/curvedText";

const W = 480;
const PAD_X = W * 0.1;
const ORANGE = "#e8964a";
const WHITE = "#f4f1ea";
const MUTED = "rgba(244, 241, 234, 0.62)";

/** The island's own proportions. The opened event card uses the same grammar
 *  at its own scale — see ui/event/CurvedTitle. */
const LAYOUT = { width: W, padX: PAD_X, startY: 46, endPad: 40, bend: 7 };

/**
 * A floating black island with the text warped across it (each line follows a
 * gentle curved SVG path). Long fields wrap onto more lines at the same size,
 * and the island grows to fit. `id` must be unique (used for the path refs).
 *
 * The type layout now lives in ui/curved/curvedText, shared with the opened
 * card so the two treatments can't drift. What stays local here is the oblong
 * behind the text.
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
  const fields: CurvedField[] = [];
  if (top) fields.push({ text: top, size: 24, color: ORANGE, sp: 2, gapAfter: 10 });
  fields.push({ text: title, size: 50, color: WHITE, sp: 0, gapAfter: 8 });
  if (sub) fields.push({ text: sub, size: 24, color: ORANGE, sp: 1, gapAfter: 8 });
  if (note) fields.push({ text: note, size: 17, color: MUTED, sp: 0.5, gapAfter: 0 });

  const { lines, height } = layoutCurved(fields, LAYOUT);
  const r = Math.min(78, height * 0.42);

  return (
    <svg
      viewBox={`0 0 ${W} ${height}`}
      width="100%"
      style={{ display: "block", overflow: "visible" }}
    >
      <rect x={0} y={0} width={W} height={height} rx={r} ry={r} fill="#08080b" />
      <CurvedText id={id} lines={lines} width={W} padX={PAD_X} />
    </svg>
  );
}
