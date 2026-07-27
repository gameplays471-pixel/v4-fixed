import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "public", "upload", "skills"],
    coverage: {
      provider: "v8",
      include: [
        "src/components/views/active-workout/utils.ts",
        "src/lib/validation.ts",
        "src/components/views/active-workout/hooks/session-summary.ts",
      ],
    },
  },
});
