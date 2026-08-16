import { useNav } from "@/ui/nav";
import { Panel } from "@/ui/Panel";
import { SchedulePanel } from "@/ui/SchedulePanel";
import { VenuePanel } from "@/ui/VenuePanel";
import { ParticipantsPanel } from "@/ui/ParticipantsPanel";
import { AboutPanel } from "@/ui/AboutPanel";
import { FESTIVAL } from "@/config/festival";
import { SECTION_TITLES } from "@/config/nav";

/**
 * Reads the active section from nav and renders the matching panel inside the
 * shared Panel shell. All four routes are wired.
 */
export function SectionOverlay() {
  const { section, close } = useNav();
  if (!section) return null;

  return (
    <Panel title={SECTION_TITLES[section]} subtitle={FESTIVAL.dates} onClose={close}>
      {section === "schedule" && <SchedulePanel />}
      {section === "venue" && <VenuePanel />}
      {section === "participants" && <ParticipantsPanel />}
      {section === "about" && <AboutPanel />}
    </Panel>
  );
}
