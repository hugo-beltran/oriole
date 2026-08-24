# Oriole

Organization component library: thin, branded wrappers over
[react-aria-components](https://react-spectrum.adobe.com/react-aria/), styled with
Tailwind CSS v4.

- **Extensible** — every component accepts `className`, `ref`, and `children`.
- **Composable** — compound subcomponents (`<Card><CardHeader/></Card>`); render props
  never cross the public API.
- **No business logic** — components stay adaptable across projects.
- **Accessibility first** — every component ships with axe assertions in its tests, and
  interaction semantics come from React Aria.

## Installation

```sh
bun add @mycodemedia/oriole react-aria-components
```

Peer dependencies: `react ^19`, `react-dom ^19`, `react-aria-components ^1.20`, and
(optionally, but in practice) `tailwindcss ^4`.

## Wiring styles

Add these three lines to your app's main CSS file:

```css
@import "tailwindcss";
@import "@mycodemedia/oriole/theme.css";
@source "../node_modules/@mycodemedia/oriole/dist";
```

> **The `@source` line is mandatory.** Tailwind v4 does not scan `node_modules` by
> default — without it your build generates none of the library's utility classes and
> components render unstyled. Adjust the relative path to point from your CSS file to
> the package's `dist` directory.

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

## Usage

```tsx
import { Button, Card, CardContent, CardHeader, CardTitle } from "@mycodemedia/oriole"

<Card>
  <CardHeader>
    <CardTitle>Team plan</CardTitle>
  </CardHeader>
  <CardContent>
    <Button variant="outline" onPress={upgrade}>Upgrade</Button>
  </CardContent>
</Card>
```

Browse all components, variants, and states in the
[showcase](https://mycodemedia.github.io/oriole/) (deployed from `main`).

## Development

```sh
bun install
bun run dev          # showcase dev server (Vite + TanStack Router)
bun run test         # vitest — behavior + axe accessibility tests
bun run lint         # biome (includes a11y rules)
bun run typecheck
bun run build        # library build (tsc → dist/)
```

> Always `bun run test`, never `bun test` — Bun's native runner has no jsdom
> environment and will fail on these tests.

## Component conventions

- One folder per component under `src/components/<name>/` with the component, a
  colocated `*.test.tsx`, and an `index.ts`; re-export from `src/index.ts`.
- Subcomponents are flat named exports (`SelectTrigger`, not `Select.Trigger`).
- Interaction states are styled via React Aria **data attributes**
  (`data-[hovered]:`, `data-[pressed]:`, `data-[focus-visible]:`,
  `data-[disabled]:`) — never className render props.
- Style with [tailwind-variants](https://www.tailwind-variants.org/); use `slots` for
  compound components. Consumer `className` must win conflicts (tv handles the merge).
- Only token-backed utilities (`bg-primary`, `text-muted-foreground`, `rounded-lg`) —
  no hardcoded colors or radii.
- Every component's tests include at least one `expectNoViolations()` axe assertion per
  meaningful state (and for overlays: open *and* closed).
- Add a showcase route in `showcase/src/routes/components/` and a sidebar entry in
  `__root.tsx`.
