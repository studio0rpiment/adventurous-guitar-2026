/**
 * Central festival metadata. Keep static, presentational facts here so
 * components read from one source instead of hard-coding strings.
 */
export const FESTIVAL = {
  name: "Adventurous Electric Guitar Festival",
  shortName: "AEG",
  year: 2026,
  dates: "October 8–9, 2026",
} as const;

export type Festival = typeof FESTIVAL;
