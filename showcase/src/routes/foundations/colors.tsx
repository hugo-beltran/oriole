import { cn } from "@mycodemedia/oriole"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { Page } from "../../lib/example"

export const Route = createFileRoute("/foundations/colors")({
  component: ColorsPage,
})

const STEPS = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
] as const

type Ramp = {
  name: string
  note: string
  /** Step carrying a semantic role, flagged under its swatch. */
  marked?: { step: string; tag: string }
  /** Literal class per step so Tailwind's scanner picks them up. */
  swatches: Record<string, string>
}

const ramps: Ramp[] = [
  {
    name: "nectarine",
    note: "The brand ramp, seeded from vivid orange references.",
    marked: { step: "400", tag: "brand" },
    swatches: {
      "50": "bg-nectarine-50",
      "100": "bg-nectarine-100",
      "200": "bg-nectarine-200",
      "300": "bg-nectarine-300",
      "400": "bg-nectarine-400",
      "500": "bg-nectarine-500",
      "600": "bg-nectarine-600",
      "700": "bg-nectarine-700",
      "800": "bg-nectarine-800",
      "900": "bg-nectarine-900",
      "950": "bg-nectarine-950",
    },
  },
  {
    name: "fern",
    note: "Nectarine's mirror: fresh green tints, shades sweeping green → teal → petrol.",
    swatches: {
      "50": "bg-fern-50",
      "100": "bg-fern-100",
      "200": "bg-fern-200",
      "300": "bg-fern-300",
      "400": "bg-fern-400",
      "500": "bg-fern-500",
      "600": "bg-fern-600",
      "700": "bg-fern-700",
      "800": "bg-fern-800",
      "900": "bg-fern-900",
      "950": "bg-fern-950",
    },
  },
  {
    name: "driftwood",
    note: "The muted neutral for borders, muted text, and quiet surfaces; warmth accumulates toward the dark end.",
    swatches: {
      "50": "bg-driftwood-50",
      "100": "bg-driftwood-100",
      "200": "bg-driftwood-200",
      "300": "bg-driftwood-300",
      "400": "bg-driftwood-400",
      "500": "bg-driftwood-500",
      "600": "bg-driftwood-600",
      "700": "bg-driftwood-700",
      "800": "bg-driftwood-800",
      "900": "bg-driftwood-900",
      "950": "bg-driftwood-950",
    },
  },
  {
    name: "plum",
    note: "The accent, dialed back into fern's register so the purple reads structural rather than emphatic.",
    marked: { step: "600", tag: "primary" },
    swatches: {
      "50": "bg-plum-50",
      "100": "bg-plum-100",
      "200": "bg-plum-200",
      "300": "bg-plum-300",
      "400": "bg-plum-400",
      "500": "bg-plum-500",
      "600": "bg-plum-600",
      "700": "bg-plum-700",
      "800": "bg-plum-800",
      "900": "bg-plum-900",
      "950": "bg-plum-950",
    },
  },
  {
    name: "berry",
    note: "The cold formal blue, seeded from juniper berries: frost tints, even hue sweep into berry violet, AAA-strength dark end.",
    swatches: {
      "50": "bg-berry-50",
      "100": "bg-berry-100",
      "200": "bg-berry-200",
      "300": "bg-berry-300",
      "400": "bg-berry-400",
      "500": "bg-berry-500",
      "600": "bg-berry-600",
      "700": "bg-berry-700",
      "800": "bg-berry-800",
      "900": "bg-berry-900",
      "950": "bg-berry-950",
    },
  },
]

// Values are read from the live stylesheet so this page can never drift
// from theme.css.
function readTokenValues() {
  const style = getComputedStyle(document.documentElement)
  return Object.fromEntries(
    ramps.map((ramp) => [
      ramp.name,
      Object.fromEntries(
        STEPS.map((step) => [
          step,
          style.getPropertyValue(`--or-${ramp.name}-${step}`).trim(),
        ]),
      ),
    ]),
  )
}

function ColorsPage() {
  const [values] = useState(readTokenValues)

  return (
    <Page
      title="Colors"
      description="The five Oriole ramps — nectarine (brand), fern, driftwood (neutral), plum (accent), and berry (cold formal blue). Hover a swatch for its oklch value. Override any --or-* variable to re-brand."
    >
      {/* one block so the ramps sit close together despite Page's space-y-12 */}
      <div className="space-y-5">
        {ramps.map((ramp) => (
          <section key={ramp.name} aria-label={`${ramp.name} color ramp`}>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <h2 className="text-sm font-semibold">{ramp.name}</h2>
              {ramp.marked ? (
                <span className="self-center rounded-full bg-muted px-1.5 py-px text-[10px] font-medium tabular-nums text-foreground/70">
                  {ramp.marked.step} · {ramp.marked.tag}
                </span>
              ) : null}
              <p className="text-xs text-muted-foreground">{ramp.note}</p>
            </div>
            <ul className="mt-2 grid grid-cols-11 gap-1">
              {STEPS.map((step) => (
                <li key={step} className="min-w-0">
                  <div
                    title={`${ramp.name}-${step} · ${values[ramp.name]?.[step] ?? ""}`}
                    className={cn(
                      "h-9 rounded-md border border-border",
                      ramp.swatches[step],
                      ramp.marked?.step === step &&
                        "ring-2 ring-ring ring-offset-1 ring-offset-background",
                    )}
                  />
                  <p
                    className={cn(
                      "mt-1 text-center text-[10px] tabular-nums text-muted-foreground",
                      ramp.marked?.step === step &&
                        "font-medium text-foreground",
                    )}
                  >
                    {step}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section aria-label="Usage">
        <h2 className="text-lg font-semibold">Usage</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Components should keep using semantic tokens (
          <code className="font-mono text-xs">bg-primary</code>,{" "}
          <code className="font-mono text-xs">ring-ring</code>) — the ramps are
          for consumers who need explicit shades, e.g.{" "}
          <code className="font-mono text-xs">bg-fern-100</code> for a tinted
          surface or{" "}
          <code className="font-mono text-xs">text-nectarine-700</code> for
          accessible accent text on light backgrounds.
        </p>
      </section>
    </Page>
  )
}
