# Oriole

A branded component demo site: thin wrappers over
[react-aria-components](https://react-spectrum.adobe.com/react-aria/), styled with
co-located CSS Modules over the `--or-*` design tokens, shown off in a chat-app
showcase deployed to GitHub Pages.

- **Extensible** — every component accepts `className`, `ref`, and `children`.
- **Composable** — compound subcomponents (`<Nest><NestHead/></Nest>`); render props
  never cross the public API.
- **No business logic** — components stay adaptable across projects.
- **Accessibility first** — every component ships with axe assertions in its tests, and
  interaction semantics come from React Aria.

The components live in `src/`, the showcase in `showcase/`; the showcase imports them
through the `@mycodemedia/oriole` alias defined in `tsconfig.json` and
`showcase/vite.config.ts`. Vite bundles both, with Lightning CSS as the entire CSS
pipeline — there is no Tailwind.

## Branding

All components are styled exclusively through design tokens. Re-brand by redefining the
`--or-*` custom properties — globally, per theme, or per subtree — with no rebuild:

```css
:root {
  --or-primary: oklch(0.55 0.24 145); /* your brand color */
  --or-radius: 0.25rem;
}
```

Dark mode values are provided under a `.dark` class scope; override them the same way.
See [`src/styles/theme.css`](src/styles/theme.css) for the full token list.

## For agents and other projects

The site doubles as a machine-readable reference so another project (or the agent working
in it) can port a component instead of installing a package:

- `llms.txt` at the site root indexes everything, following the
  [llms.txt](https://llmstxt.org) convention; `llms-full.txt` is the same content in one
  file.
- `docs/<component>.md` carries each component's docblock, props, usage, and module CSS;
  `docs/tokens.md` the two stylesheets; `docs/porting.md` the recipe (also in this repo at
  [`docs/porting.md`](docs/porting.md)).
- `source/` holds verbatim copies of every component and stylesheet.

`scripts/llms.ts` generates all of it from the sources into `showcase/public/` before
`dev` and `build`, so it can never drift from the code. Set `ORIOLE_SITE_URL` if the site
moves.

For Claude Code, [`skills/oriole-components/SKILL.md`](skills/oriole-components/SKILL.md)
is a ready-made skill that points an agent at the reference and walks it through a port.
Install it by copying the folder to `~/.claude/skills/` (or a project's
`.claude/skills/`).

## Development

```sh
bun install
bun run dev          # showcase dev server (Vite + TanStack Router)
bun run test         # vitest — behavior + axe accessibility tests
bun run lint         # biome (includes a11y rules)
bun run typecheck
bun run build        # production build of the showcase → showcase/dist
bun run llms         # regenerate the machine-readable reference (runs inside dev/build)
bun run preview      # serve that build locally
```

> Always `bun run test`, never `bun test` — Bun's native runner has no jsdom
> environment and will fail on these tests.

## Component conventions

- One folder per component under `src/components/<name>/` with the component, a
  colocated `*.test.tsx`, and an `index.ts`; re-export from `src/index.ts`.
- Subcomponents are flat named exports (`SelectTrigger`, not `Select.Trigger`).
- Interaction states are styled via React Aria **data attributes**
  (`[data-hovered]`, `[data-pressed]`, `[data-focus-visible]`, `[data-disabled]`) —
  never className render props.
- Styling follows the [Styling](#styling) section: a co-located `<name>.module.css` in
  `@layer components`, variants declared with `cva` over the module's classes, consumer
  `className` appended last with `clsx`.
- Only token-backed values (`var(--or-primary)`, `var(--or-radius)`) — no hardcoded
  colors or radii.
- Every component's tests include at least one `expectNoViolations()` axe assertion per
  meaningful state (and for overlays: open *and* closed).
- Add a showcase route in `showcase/src/routes/components/` and a sidebar entry in
  `__root.tsx`.

## Styling

Everything is plain CSS, compiled by Vite with Lightning CSS. No utility framework.

- **`src/styles/global.css`** is the one stylesheet an app imports. It declares the
  cascade layers (`base`, then `components`), imports the tokens, and carries a compact
  reset in `@layer base` (border-box, zeroed margins, inherited typography on form
  controls, block-level replaced elements).
- **`src/styles/theme.css`** is tokens only: the five `--or-*` color ramps, the semantic
  aliases (`--or-primary`, `--or-border`, …), radius, and the display face. Re-brand by
  redefining them; nothing else needs to change.
- **Browser targets.** Colors ship as written in oklch. Two settings in
  `showcase/vite.config.ts` keep it that way: `css.lightningcss.targets` is browserslist
  "defaults" minus the two targets without oklch (Chrome 109 and Opera Mini), and
  `build.cssTarget` names the same floor for the minify pass, which otherwise inherits the
  JS target and lowers oklch to `lab()` with hex fallbacks.
- **Components** own their rules in a co-located `src/components/<name>/<name>.module.css`
  wrapped in `@layer components` — layout, `var(--or-*)` tokens, `@property`
  declarations, keyframes. Variants are declared with `cva` over the module's classes and
  the consumer's `className` is appended last with `clsx`. Because component rules are
  layered and an app's own classes are not, a consumer class wins on cascade order without
  any merging. Each module also opens with `@layer base, components;` so the order holds
  whichever stylesheet the browser parses first.
- **The showcase** styles its layout the same way: a `*.module.css` beside each route or
  shell file under `showcase/src`. Its own classes are unlayered, which is how the
  "Custom className" examples override component defaults.
- **Types.** [`vite-css-modules`](https://github.com/privatenumber/vite-css-modules)
  owns the CSS Modules pipeline in `showcase/vite.config.ts` and writes a
  `<name>.module.css.d.ts` beside every module with its exact class names, so
  `styles.foo` is a `string` and a typo fails typecheck. They carry inline declaration
  maps, so Cmd-click on `styles.foo` lands on the CSS rule. The files are git-ignored,
  not committed: the dev server and build keep them fresh, `bun run types:css` (part of
  `bun run typecheck`) regenerates them from the CLI, and a `prepare` script runs it after
  `bun install` so a fresh clone typechecks in the editor right away.
- **Tests** import the module and assert on `styles.foo`; Vitest returns the un-hashed
  class names.
- `cn` in `src/lib/utils.ts` is a plain `clsx` wrapper and does no merging.
