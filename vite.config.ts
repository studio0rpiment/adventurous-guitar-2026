import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { buildScheduleIcs, ICS_FILE } from "./src/config/calendar";

/**
 * Serves / emits the programme as /<ICS_FILE> (see src/config/calendar.ts).
 * Dev builds it per request through Vite's module graph, so a schedule edit
 * shows up on the next click without a restart; the production build emits it
 * once as a static asset. Unparseable slots are reported, never silently lost.
 */
function scheduleIcs(): Plugin {
  const report = (skipped: string[], warn: (msg: string) => void) =>
    skipped.forEach((s) => warn(`[schedule-ics] left out, couldn't read its time: ${s}`));

  return {
    name: "schedule-ics",
    configureServer(server) {
      server.middlewares.use(`/${ICS_FILE}`, async (_req, res, next) => {
        try {
          const mod = (await server.ssrLoadModule("/src/config/calendar.ts")) as {
            buildScheduleIcs: typeof buildScheduleIcs;
          };
          const { text, skipped } = mod.buildScheduleIcs();
          report(skipped, (m) => server.config.logger.warn(m));
          res.setHeader("Content-Type", "text/calendar; charset=utf-8");
          res.end(text);
        } catch (err) {
          next(err);
        }
      });
    },
    generateBundle() {
      const { text, skipped } = buildScheduleIcs();
      report(skipped, (m) => this.warn(m));
      this.emitFile({ type: "asset", fileName: ICS_FILE, source: text });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), scheduleIcs()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
