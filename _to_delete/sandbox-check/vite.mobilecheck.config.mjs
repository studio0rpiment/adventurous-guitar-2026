import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// Throwaway config for a sandbox screenshot run: identical to vite.config.ts
// but with the dep cache outside the repo (the sandbox can't unlink files).
export default defineConfig({
  cacheDir: "/tmp/ags-vite-cache",
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
});
