import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.ts"],
    exclude: ["node_modules", "tests/e2e/**"],
    css: false,
    env: { SKIP_ENV_VALIDATION: "true" },
    coverage: {
      provider: "v8",
      include: ["src/lib/**", "src/components/**"],
    },
  },
});
