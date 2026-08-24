import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { Page } from "../../lib/example"

export const Route = createFileRoute("/foundations/colors")({
  component: ColorsPage,
})

// Literal class names so Tailwind's scanner picks them up. Values are read
// from the live stylesheet so this page can never drift from theme.css.
const steps = [
  { step: "50", swatch: "bg-nectarine-50" },
  { step: "100", swatch: "bg-nectarine-100" },
  { step: "200", swatch: "bg-nectarine-200" },
  { step: "300", swatch: "bg-nectarine-300" },
  { step: "400", swatch: "bg-nectarine-400", brand: true },
  { step: "500", swatch: "bg-nectarine-500" },
  { step: "600", swatch: "bg-nectarine-600" },
  { step: "700", swatch: "bg-nectarine-700" },
  { step: "800", swatch: "bg-nectarine-800" },
  { step: "900", swatch: "bg-nectarine-900" },
  { step: "950", swatch: "bg-nectarine-950" },
]

function readTokenValues() {
  const style = getComputedStyle(document.documentElement)
  return Object.fromEntries(
    steps.map((s) => [
      s.step,
      style.getPropertyValue(`--or-nectarine-${s.step}`).trim(),
    ]),
  )
}

function ColorsPage() {
  const [values] = useState(readTokenValues)

  return (
    <Page
      title="Colors"
      description="The nectarine brand ramp. The brand color sits at 400; primary maps to nectarine-400 and the light-mode focus ring to nectarine-600. Override any --or-nectarine-* variable to re-brand."
    >
      <section aria-label="Nectarine color ramp">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {steps.map((color) => (
            <li key={color.step}>
              <div
                className={`h-20 rounded-lg border border-border ${color.swatch}`}
              />
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-sm font-medium">
                  nectarine-{color.step}
                </span>
                {color.brand ? (
                  <span className="rounded-full bg-nectarine-100 px-2 py-0.5 text-xs font-medium text-nectarine-950">
                    brand
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                {values[color.step]}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Usage">
        <h2 className="text-lg font-semibold">Usage</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Components should keep using semantic tokens (
          <code className="font-mono text-xs">bg-primary</code>,{" "}
          <code className="font-mono text-xs">ring-ring</code>) — the ramp is
          for consumers who need explicit shades, e.g.{" "}
          <code className="font-mono text-xs">bg-nectarine-100</code> for a
          tinted surface or{" "}
          <code className="font-mono text-xs">text-nectarine-700</code> for
          accessible accent text on light backgrounds.
        </p>
      </section>
    </Page>
  )
}
