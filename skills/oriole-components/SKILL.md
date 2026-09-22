---
name: oriole-components
description: Port an Oriole component (Beak prompt bar, Bubble chat bubble, Button, Canvas backdrop, Nest sidebar, Perch surface, Select) or the Oriole look — the --or-* oklch tokens, cascade-layered CSS Modules over react-aria-components — into another project by reading the live reference at the Oriole site. Use when a project wants "the Oriole <component>", the Oriole/MCIQ chat look, the fern/driftwood/nectarine/plum/berry palette, or asks to match the Oriole design system, port a component from Oriole, or theme components against its tokens.
---

# Oriole components

Oriole is a **reference, not a package**. Nothing is installed from it; a component
is ported by copying two files (a `.tsx` and its `.module.css`) and giving them the
`--or-*` tokens to read. The authoritative source is the live site, regenerated from
the code on every deploy, so always read from it rather than from memory.

## Where the reference lives

| What | URL |
| --- | --- |
| Index | `https://hugo-beltran.github.io/oriole/llms.txt` |
| Everything in one fetch | `https://hugo-beltran.github.io/oriole/llms-full.txt` |
| One component | `https://hugo-beltran.github.io/oriole/docs/<name>.md` (`beak`, `bubble`, `button`, `canvas`, `nest`, `perch`, `select`) |
| Tokens and reset | `https://hugo-beltran.github.io/oriole/docs/tokens.md` |
| Porting recipe | `https://hugo-beltran.github.io/oriole/docs/porting.md` |
| Verbatim source | `https://hugo-beltran.github.io/oriole/source/components/<name>/<file>` and `.../source/styles/{theme,global}.css` |

Fallbacks, in order: a sibling checkout at `../oriole` (read `src/components/<name>/`
and `src/styles/` directly), then the repository `https://github.com/hugo-beltran/oriole`.

## Workflow

1. **Fetch `llms.txt`** and pick the component pages the task needs. Fetch
   `docs/tokens.md` and `docs/porting.md` the first time Oriole enters a project.
2. **Check what the host already has.** Look for `--or-*` tokens, an `@layer base,
   components` declaration, `react-aria-components`, `class-variance-authority`, and
   `clsx` in the target project. Reuse them; do not duplicate the token file.
3. **Bring the tokens** if absent (see below), then **copy the component's two files**
   verbatim from `source/`, adjusting only import paths. Keep the module's opening
   `@layer base, components;` line and its `@layer components { … }` wrapper.
4. **Install the peer dependencies** the component imports and the host lacks:
   `react-aria-components`, `class-variance-authority`, `clsx`; `react-markdown` and
   `remark-gfm` for Bubble; `@hugeicons/react` and `@hugeicons/core-free-icons` for Beak
   and Nest; `@fontsource/libre-baskerville` for the display face.
5. **Verify in the browser**, not by reading: the component's computed values should
   match the ones in its docs page's CSS. Check hover, pressed, focus-visible and
   disabled states through React Aria's data attributes.
6. **Report what was copied, from which URL, and any deliberate deviation.** Never
   silently restyle a ported component; if the host needs a different look, override
   from outside with a className.

## Tokens

`theme.css` is tokens only, all oklch: five ramps at steps 50–950 —
`nectarine` (brand orange), `fern` (green), `driftwood` (warm neutral), `plum`
(accent purple, the primary), `berry` (cold formal blue) — plus semantic aliases
(`--or-background`, `--or-foreground`, `--or-card`, `--or-popover`, `--or-primary`,
`--or-secondary`, `--or-muted`, `--or-accent`, `--or-destructive`, `--or-border`,
`--or-input`, `--or-ring`, each with a `-foreground` where relevant), `--or-radius`
(0.5rem) and `--or-font-display` (Libre Baskerville).

- Whole app on Oriole: paste `theme.css` as is (`:root` scope).
- One screen inside a legacy app: rename `:root` to a class and put it on the screen
  root. MCIQ's admin UI does this with `theme.module.css` → `.theme`. The components
  only ever read `var(--or-*)`, so both scopes work.
- Re-branding is redefining `--or-*` properties. Do not edit values inside a module.

## Cascade layers — the one rule that breaks silently

Component rules live in `@layer components`. A consumer's **unlayered** class beats
them by cascade order, which is how `className` overrides work without utility
merging. Two consequences for the host:

- Its CSS reset must live in a layer (`@layer base` or any other). An unlayered
  `button { background: none }` would override every component's fill.
- `global.css` in the reference is the canonical setup: `@layer base, components;`,
  the tokens import, and a compact preflight-style reset in `@layer base`. Hosts on
  Tailwind v4 already have layers with these names and need only the tokens.

## Component cheat sheet

| Component | Role | Notes |
| --- | --- | --- |
| **Canvas** | Full-height branded backdrop: driftwood ground, fern "undergrowth" gradient mesh, film grain. `animated` drifts the mesh; reduced motion gets it static. | Carries `@property` declarations and keyframes in its module. One per page. |
| **Perch** | The single glassy surface floating on the Canvas. | Plain div; consumer className for layout. |
| **Nest** | Collapsible sidebar: `NestProvider`, `Nest`, `NestHead`, `NestToggle`, `NestGroup` (accordion, searchable), `NestLink` (icon row), `NestChat` (text row). | Collapse state is `data-collapsed` on the aside; rows keep geometry, copy is clipped. |
| **Beak** | Prompt bar: auto-growing textarea, `@` sources and `/` commands menus, model picker, dictation, attachment chips. `variant="pill"`. | Largest component; menus are keyboard-navigable. |
| **Bubble** | Chat bubble. `from="user"` (berry gradient, right) / `"system"` (translucent driftwood, left); `color="plum"`; `tail`; `markdown` renders GFM. | Markdown styling lives under the module's `.markdown`. |
| **Button** | react-aria Button with `variant` (default, secondary, outline, ghost, destructive) and `size` (sm, md, lg, icon). | Exports `buttonVariants` (cva). |
| **Select** | `Select`, `SelectTrigger` + `SelectValue`, `SelectContent` + `SelectItem`; pair with a react-aria `Label`. | Popover and listbox fused; no render props. |

## Conventions the ported code should keep

- Interaction states via React Aria data attributes (`[data-hovered]`,
  `[data-pressed]`, `[data-focus-visible]`, `[data-disabled]`), never className
  render props.
- Variants with `cva` over module classes; `className` appended last with `clsx`.
- Every value token-backed: `var(--or-*)`, `calc(var(--or-radius) - …)`. No literal
  colors in a module except the reset-style black tints inside Bubble's Markdown.
- Tests, if ported, assert on `styles.foo` and include an axe check.

## Don't

- Don't install `@mycodemedia/oriole`; it is not published.
- Don't reconstruct a component from memory or from this file. Fetch the page.
- Don't put component rules outside `@layer components`, and don't drop the layer
  statement "because it looks redundant".
- Don't rename `--or-*` tokens in the copied module; alias them in the host's theme
  instead if the host has its own token names.
