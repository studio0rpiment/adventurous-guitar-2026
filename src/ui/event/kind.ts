import type { SlotKind } from "@/config/sections";

/**
 * The kind dot's colour, in one place.
 *
 * Three call sites now read this (SlotRow, EventDetail, the island header), and
 * a fourth is likely — a copy in each is how "talks are blue" quietly becomes
 * two different blues.
 */
export const KIND_COLOR: Record<SlotKind, string> = {
  performance: "var(--ags-accent)",
  talk: "#7fb0ff",
  social: "var(--ags-muted)",
};

export function kindColor(kind?: SlotKind): string {
  return KIND_COLOR[kind ?? "performance"];
}
