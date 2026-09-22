import { resolve } from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@mycodemedia/oriole": resolve(import.meta.dirname, "src/index.ts"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // Process only the co-located CSS Modules, with their real class names,
    // so tests can assert on `styles.foo` as "foo".
    css: {
      include: [/\.module\.css$/],
      modules: { classNameStrategy: "non-scoped" },
    },
  },
})
