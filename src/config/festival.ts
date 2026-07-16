/**
 * Central festival metadata. Keep static, presentational facts here so
 * components read from one source instead of hard-coding strings.
 */
export const FESTIVAL = {
  name: "Adventurous Guitar Summit",
  shortName: "AGS",
  year: 2026,
  tagline: "Six strings, no map.",
} as const;

export type Festival = typeof FESTIVAL;
