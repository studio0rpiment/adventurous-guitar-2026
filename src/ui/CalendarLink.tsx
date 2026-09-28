import { ICS_FILE } from "@/config/calendar";

/**
 * "Add to calendar" for the whole programme — the .ics built from EVENTS (see
 * config/calendar.ts). A plain link, not a download: served as text/calendar,
 * iOS opens it straight into Calendar's "Add All" sheet, and desktop browsers
 * save it for Apple Calendar / Outlook to open. Google Calendar takes it via
 * Settings → Import.
 */
export function CalendarLink() {
  return (
    <div className="ags-cal">
      <a className="ags-link" href={`/${ICS_FILE}`}>
        Add the schedule to your calendar
      </a>
      <span className="ags-cal__hint">.ics · Apple, Outlook, Google (import)</span>
    </div>
  );
}
