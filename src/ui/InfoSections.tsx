import { IslandField } from "@/ui/islands/IslandField";

/**
 * Scrollable content over the fixed 3D hero. A full-viewport spacer shows the
 * cable scene first, then the schedule/venue "islands" float up over it — the
 * background stays transparent so the cables remain visible behind them.
 *
 * The trailing spacer is scroll runway with nothing in it: the islands finish
 * and slide out of the top, and that empty stretch is where CameraPan descends
 * to the floor guitar. Without it the reveal would have to happen while the
 * last island was still on screen.
 */
export function InfoSections() {
  return (
    <div style={{ position: "relative", zIndex: 2, pointerEvents: "none" }}>
      <div className="ags-hero-spacer" />
      <IslandField />
      <div className="ags-reveal-spacer" />
    </div>
  );
}
