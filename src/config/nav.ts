import type { SectionId } from "@/config/sections";

export interface NavItem {
  id: SectionId;
  label: string;
}

/**
 * The four sections, in display order — the single source for every way into
 * them. The pick menu fans these out, the top nav bar lists them, and the
 * section overlay takes its heading from the same labels, so a rename here
 * lands everywhere at once.
 */
export const NAV_ITEMS: NavItem[] = [
  { id: "schedule", label: "Schedule" },
  { id: "participants", label: "Participants" },
  { id: "venue", label: "Venue" },
  { id: "about", label: "About" },
];

/** Section id -> panel heading, derived so it can't fall out of step. */
export const SECTION_TITLES = Object.fromEntries(
  NAV_ITEMS.map((i) => [i.id, i.label]),
) as Record<SectionId, string>;
