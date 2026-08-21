import type { SectionId } from "@/config/sections";

export interface NavItem {
  id: SectionId;
  label: string;
}

/**
 * Every section's heading — the single source for every way in. The pick menu
 * fans out the menu ones, the top nav bar lists them, and the section overlay
 * takes its heading from here, so a rename lands everywhere at once.
 */
export const SECTION_TITLES: Record<SectionId, string> = {
  schedule: "Schedule",
  participants: "Participants",
  venue: "Venue",
  about: "About",
  privacy: "Privacy & personal data",
};

/**
 * The sections that appear in the MENUS, in display order.
 *
 * Privacy is deliberately not among them: it's a section you can open, reached
 * from the footer where a privacy notice belongs, rather than a fifth spoke
 * competing with the programme. The fan's geometry is also built for four.
 */
export const MENU_SECTIONS: SectionId[] = ["schedule", "participants", "venue", "about"];

export const NAV_ITEMS: NavItem[] = MENU_SECTIONS.map((id) => ({
  id,
  label: SECTION_TITLES[id],
}));
