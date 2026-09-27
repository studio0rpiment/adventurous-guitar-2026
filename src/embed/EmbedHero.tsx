import { useEffect } from "react";
import { CanvasStage } from "@/three/CanvasStage";

/** pointer messages a host page may send: position as a fraction of the frame */
type HostPointer = { type: "aegf:pointer"; kind: "move" | "down" | "up" | "leave"; x: number; y: number };

const isHostPointer = (d: unknown): d is HostPointer =>
  typeof d === "object" && d !== null && (d as HostPointer).type === "aegf:pointer";

const EVENT: Record<HostPointer["kind"], string> = {
  move: "pointermove",
  down: "pointerdown",
  up: "pointerup",
  leave: "pointermove",
};

/**
 * The hero scene on its own, for embedding in other sites (?embed=hero):
 * the cables, sockets, and 3D title, with no navigation, sections, audio,
 * or footer, on a page that does not scroll.
 *
 * A host page can keep its own scrolling by laying the frame under
 * `pointer-events: none` and relaying the pointer instead: it posts
 * { type: "aegf:pointer", kind, x, y } (x, y as fractions of the frame) and
 * this page replays each message as a pointer event on the canvas, so hover
 * sway (and dragging a plug) behave as if the pointer were here.
 */
export function EmbedHero() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("is-embed");

    const onMessage = (e: MessageEvent) => {
      if (!isHostPointer(e.data)) return;
      const canvas = document.querySelector("canvas");
      if (!canvas) return;
      const { kind } = e.data;
      // "leave" parks the pointer outside the frame, so hovers end
      const x = kind === "leave" ? -1000 : e.data.x * window.innerWidth;
      const y = kind === "leave" ? -1000 : e.data.y * window.innerHeight;
      canvas.dispatchEvent(
        new PointerEvent(EVENT[kind], {
          clientX: x,
          clientY: y,
          bubbles: true,
          cancelable: true,
          pointerId: 1,
          pointerType: "mouse",
          isPrimary: true,
          button: 0,
          buttons: kind === "down" ? 1 : 0,
        }),
      );
    };
    window.addEventListener("message", onMessage);
    return () => {
      root.classList.remove("is-embed");
      window.removeEventListener("message", onMessage);
    };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <CanvasStage />
    </div>
  );
}
