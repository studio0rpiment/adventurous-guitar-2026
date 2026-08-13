import { useNav } from "@/ui/nav";
import { Panel } from "@/ui/Panel";
import { SchedulePanel } from "@/ui/SchedulePanel";
import { VenuePanel } from "@/ui/VenuePanel";
import { FESTIVAL } from "@/config/festival";
import type { SectionId } from "@/config/sections";

const TITLES: Record<SectionId, string> = {
  schedule: "Schedule",
  venue: "Venue",
  participants: "Participants",
  about: "About",
};

/**
 * Reads the active section from nav and renders the matching panel inside the
 * shared Panel shell. Schedule and Venue are wired; Participants/About are
 * placeholders for now.
 */
export function SectionOverlay() {
  const { section, close } = useNav();
  if (!section) return null;

  return (
    <Panel title={TITLES[section]} subtitle={FESTIVAL.dates} onClose={close}>
      {section === "schedule" && <SchedulePanel />}
      {section === "venue" && <VenuePanel />}
      {(section === "participants" || section === "about") && (
        <p style={{ fontSize: "0.85rem", color: "var(--ags-muted)" }}>
          Coming soon.
        </p>
      )}
    </Panel>
  );
}
