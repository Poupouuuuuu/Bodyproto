import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "server-only": path.resolve(__dirname, "./test/stubs/server-only.ts"),
      "@": path.resolve(__dirname, "./"),
    },
  },
  test: {
    environment: "node",
    environmentMatchGlobs: [
      ["components/**", "happy-dom"],
      ["app/**", "happy-dom"],
    ],
    globals: true,
  },
});
