/** A plain viewport-space box. */
export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * An island's box as if it weren't tilted.
 *
 * `getBoundingClientRect()` on a rotated element returns the AXIS-ALIGNED box
 * around it, which is bigger than the element and sits higher — for a 3° tilt
 * on a wide island that's ~9px of width and ~8px of top. Handing that to the
 * turn made the card start fractionally too large and too high, so the front
 * face didn't quite land on the island it grew from.
 *
 * `offsetWidth/Height` are layout values, untouched by transforms, and a
 * rotation about the default centre origin leaves the centre where it is — so
 * the true box is the layout size centred on the measured one.
 */
export function untiltedBox(el: HTMLElement): Box {
  const r = el.getBoundingClientRect();
  const width = el.offsetWidth || r.width;
  const height = el.offsetHeight || r.height;
  return {
    left: r.left + r.width / 2 - width / 2,
    top: r.top + r.height / 2 - height / 2,
    width,
    height,
  };
}
