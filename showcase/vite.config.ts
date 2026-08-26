import { resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import svgr from "vite-plugin-svgr"

export default defineConfig({
  root: import.meta.dirname,
  // Project pages are served at https://<org>.github.io/oriole/
  base: process.env.CI ? "/oriole/" : "/",
  plugins: [
    tanstackRouter({
      target: "react",
      routesDirectory: resolve(import.meta.dirname, "src/routes"),
      generatedRouteTree: resolve(import.meta.dirname, "src/routeTree.gen.ts"),
    }),
    react(),
    tailwindcss(),
    svgr(),
  ],
  resolve: {
    alias: {
      // Order matters: the subpath alias must precede the bare package alias.
      "@mycodemedia/oriole/theme.css": resolve(
        import.meta.dirname,
        "../src/styles/theme.css",
      ),
      "@mycodemedia/oriole": resolve(import.meta.dirname, "../src/index.ts"),
    },
  },
})
