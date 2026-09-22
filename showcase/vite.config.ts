import { resolve } from "node:path"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import browserslist from "browserslist"
import { browserslistToTargets } from "lightningcss"
import { defineConfig } from "vite"
import { patchCssModules } from "vite-css-modules"
import svgr from "vite-plugin-svgr"

export default defineConfig({
  root: import.meta.dirname,
  // Project pages are served at https://<org>.github.io/oriole/
  base: process.env.CI ? "/oriole/" : "/",
  plugins: [
    // Owns the CSS Modules pipeline and writes a `.module.css.d.ts` beside
    // each module (with inline declaration maps, so Cmd-click on a class
    // lands in the CSS). The `types:css` script runs the same generator
    // from the CLI before typecheck.
    patchCssModules({ generateSourceTypes: true, declarationMap: true }),
    tanstackRouter({
      target: "react",
      routesDirectory: resolve(import.meta.dirname, "src/routes"),
      generatedRouteTree: resolve(import.meta.dirname, "src/routeTree.gen.ts"),
      // Co-located route styles and their generated typings are not routes.
      routeFileIgnorePattern: "\\.module\\.css",
    }),
    react(),
    svgr(),
  ],
  // Lightning CSS is the whole CSS pipeline: the co-located CSS Modules,
  // nesting, @layer and the modern color functions (oklch, color-mix) are
  // lowered for the browserslist targets, and the bundle is minified.
  css: {
    transformer: "lightningcss",
    lightningcss: {
      // "defaults" minus the two targets without oklch (Chrome 109, the last
      // build for Windows 7/8, and Opera Mini); with those gone Lightning CSS
      // emits the oklch tokens as written instead of lowering them to lab()
      // with a hex fallback, so dev and build resolve colors identically.
      targets: browserslistToTargets(
        browserslist("defaults, not chrome < 111, not op_mini all"),
      ),
    },
  },
  build: {
    cssMinify: "lightningcss",
    target: "es2022",
    // The minify pass derives its Lightning CSS targets from cssTarget, not
    // from css.lightningcss.targets; without this it would inherit "es2022"
    // and lower oklch to lab() with hex fallbacks.
    cssTarget: ["chrome111", "edge111", "firefox113", "safari15.4"],
  },
  resolve: {
    alias: {
      "@mycodemedia/oriole": resolve(import.meta.dirname, "../src/index.ts"),
    },
  },
})
