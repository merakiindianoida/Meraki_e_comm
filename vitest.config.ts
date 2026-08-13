import { defineConfig } from "vitest/config";
import path from "path";

// Mirrors tsconfig.json's "@/*" path alias so lib/ tests can import via the
// same "@/lib/..." specifiers the app itself uses, without pulling in a
// bundler-specific config just for this.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
