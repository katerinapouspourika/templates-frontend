import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Aspire injects the API address (API_HTTPS / API_HTTP) and the port (PORT) when it runs this app.
const apiTarget = process.env.API_HTTPS ?? process.env.API_HTTP;
const port = process.env.PORT ? Number(process.env.PORT) : undefined;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  css: {
    // Write kebab-case class names in CSS, use them as camelCase in TSX: .main-title -> styles.mainTitle
    modules: { localsConvention: "camelCaseOnly" },
  },
  server: {
    port,
    strictPort: port !== undefined,
    // Forward /api to the backend in development, mirroring Aspire's YARP proxy in production.
    proxy: apiTarget
      ? { "/api": { target: apiTarget, changeOrigin: true, secure: false } }
      : undefined,
  },
  build: {
    sourcemap: true,
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/**/*.d.ts",
        "src/test/**",
        "src/main.tsx",
      ],
    },
  },
});
