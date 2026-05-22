import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}", "app/**/*.{test,spec}.{ts,tsx}"],
    setupFiles: ["./src/test/setup.ts"],
    testTimeout: 15000,
    css: true
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname
    }
  }
});
