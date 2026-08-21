import { useNav } from "@/ui/nav";
import { Panel } from "@/ui/Panel";
import { SchedulePanel } from "@/ui/SchedulePanel";
import { VenuePanel } from "@/ui/VenuePanel";
import { ParticipantsPanel } from "@/ui/ParticipantsPanel";
import { AboutPanel } from "@/ui/AboutPanel";
import { PrivacyPanel } from "@/ui/PrivacyPanel";
import { UPDATED } from "@/config/privacy";
import { FESTIVAL } from "@/config/festival";
import { SECTION_TITLES } from "@/config/nav";

/**
 * Reads the active section from nav and renders the matching panel inside the
 * shared Panel shell. The four menu routes plus the footer's privacy route.
 */
export function SectionOverlay() {
  const { section, close } = useNav();
  if (!section) return null;

  // The programme panels are dated by the festival; the notice is dated by its
  // own last revision, which is the date that actually matters on it.
  const subtitle = section === "privacy" ? `Last updated ${UPDATED}` : FESTIVAL.dates;

  return (
    <Panel title={SECTION_TITLES[section]} subtitle={subtitle} onClose={close}>
      {section === "schedule" && <SchedulePanel />}
      {section === "venue" && <VenuePanel />}
      {section === "participants" && <ParticipantsPanel />}
      {section === "about" && <AboutPanel />}
      {section === "privacy" && <PrivacyPanel />}
    </Panel>
  );
}
