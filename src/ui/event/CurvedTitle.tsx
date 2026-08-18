import { layoutCurved, CurvedText } from "@/ui/curved/curvedText";

/** Wider viewBox than an island's 480, because the opened card is a wider
 *  object: it keeps the title near its island size on a phone and stops it
 *  ballooning on a desktop. The SVG scales to the container either way. */
const W = 700;
const PAD_X = W * 0.05;

/**
 * The event title on the island's curved baselines, at card scale.
 *
 * This is the whole of the "it's still an island" argument in the opened card:
 * the title keeps the warp, and everything below it — the abstract, the bios,
 * the links — is straight and readable. Body copy on curved paths is the one
 * thing this treatment can't do.
 */
export function CurvedTitle({ id, text }: { id: string; text: string }) {
  const { lines, height } = layoutCurved(
    [{ text, size: 46, color: "var(--ags-fg)", sp: 0, gapAfter: 0 }],
    { width: W, padX: PAD_X, startY: 4, endPad: 8, bend: 6 },
  );

  return (
    <svg
      viewBox={`0 0 ${W} ${height}`}
      width="100%"
      role="img"
      aria-label={text}
      style={{ display: "block", overflow: "visible" }}
    >
      <CurvedText id={id} lines={lines} width={W} padX={PAD_X} />
    </svg>
  );
}
