# Porting an Oriole component into another project

Oriole is a reference, not a package. Each component is a small React file over
[react-aria-components](https://react-spectrum.adobe.com/react-aria/) plus a co-located
CSS Module that reads the `--or-*` design tokens. Porting one means copying those two
files and giving them tokens to read. This is the recipe the MCIQ admin UI followed.

## 1. Bring the tokens

Copy `source/styles/theme.css`. It is tokens only: five oklch color ramps
(`nectarine`, `fern`, `driftwood`, `plum`, `berry`, steps 50–950), semantic aliases
(`--or-primary`, `--or-border`, `--or-ring`, …), `--or-radius`, and the display face.

- **Whole app on Oriole:** keep the `:root` scope as is.
- **One screen on Oriole inside a legacy app:** rename `:root` to a class (MCIQ used
  `.theme` in a `theme.module.css`) and put that class on the screen's root element. The
  component modules only ever read `var(--or-*)`, so they work under either scope.
- **Re-branding:** redefine any `--or-*` property. Nothing else changes.

The display face is Libre Baskerville via `@fontsource/libre-baskerville`; add the
dependency or swap `--or-font-display`.

## 2. Bring the cascade layers and a reset

Component rules live in `@layer components`. That is what lets a consumer's own class win
by cascade order without any utility merging. Two things must hold in the host app:

- A `base` layer exists below `components`, and any CSS reset lives in it (or in any
  layer). An **unlayered** reset such as `button { background: none }` would beat the
  components.
- Each module opens with `@layer base, components;` so the order holds whichever file the
  browser parses first. Keep that line.

`source/styles/global.css` is the reference: the layer statement, the tokens import, and a
compact preflight-style reset in `@layer base`. If the host already has Tailwind, its
`base` and `components` layers are the same names and the modules slot straight in.

## 3. Copy the component

Take `source/components/<name>/<name>.tsx` and `<name>.module.css` (and any sibling files
the folder lists). Then:

- Replace `import styles from "./x.module.css"` if your bundler names modules differently;
  Vite, webpack, Rspack, Parcel and Lightning CSS all handle `*.module.css` natively.
- Variants are declared with [`class-variance-authority`](https://cva.style) over the
  module's classes, and `className` is appended last with `clsx`. Both are tiny
  dependencies; MCIQ kept cva to match Oriole's component shape.
- Interaction states are React Aria data attributes (`[data-hovered]`,
  `[data-pressed]`, `[data-focus-visible]`, `[data-disabled]`), never render props.
- If the host is plain JavaScript, drop the types; the components carry no other
  TypeScript-only constructs.

## 4. Overriding a component from the outside

Pass `className`. Because the host's class is unlayered and the component's rules are in
`@layer components`, the host wins regardless of specificity or source order. The
showcase's "Custom className" examples do exactly this.

## Where things are

| Path | Contents |
| --- | --- |
| `llms.txt` | Index of everything below |
| `llms-full.txt` | Every document concatenated, for a single fetch |
| `docs/<component>.md` | Docblock, props, usage, and the module CSS for one component |
| `docs/tokens.md` | `theme.css` and `global.css` with commentary |
| `source/` | Verbatim copies of the component and stylesheet sources |
