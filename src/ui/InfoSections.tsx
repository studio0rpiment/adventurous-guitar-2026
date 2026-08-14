import { IslandField } from "@/ui/islands/IslandField";

/**
 * Scrollable content over the fixed 3D hero. A full-viewport spacer shows the
 * cable scene first, then the schedule/venue "islands" float up over it — the
 * background stays transparent so the cables remain visible behind them.
 */
export function InfoSections() {
  return (
    <div style={{ position: "relative", zIndex: 2 }}>
      <div className="ags-hero-spacer" />
      <IslandField />
    </div>
  );
}
