import { SchedulePanel } from "@/ui/SchedulePanel";
import { VenuePanel } from "@/ui/VenuePanel";

/**
 * Scrollable content over the fixed 3D hero: a full-viewport spacer (so the
 * scene shows first), then Schedule + Venue in two columns (stacked on mobile)
 * that rise into view as you scroll up.
 */
export function InfoSections() {
  return (
    <div style={{ position: "relative", zIndex: 2 }}>
      <div className="ags-hero-spacer" />
      <section
        style={{
          minHeight: "100svh",
          background: "var(--ags-bg)",
          borderTop: "1px solid rgba(244, 241, 234, 0.14)",
          padding: "clamp(2.5rem, 6vw, 5rem) clamp(1.25rem, 5vw, 4rem)",
        }}
      >
        <div className="ags-info-grid">
          <div>
            <h2 className="ags-info-h">Schedule</h2>
            <SchedulePanel />
          </div>
          <div>
            <h2 className="ags-info-h">Venue</h2>
            <VenuePanel />
          </div>
        </div>
      </section>
    </div>
  );
}
