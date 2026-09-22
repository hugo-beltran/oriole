import { createFileRoute } from "@tanstack/react-router"
import { clsx } from "clsx"
import { type CSSProperties, useState } from "react"
import { Page } from "../../lib/example"
import styles from "./colors.module.css"

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
}

const ramps: Ramp[] = [
  {
    name: "nectarine",
    note: "The brand ramp, seeded from vivid orange references.",
    marked: { step: "400", tag: "brand" },
  },
  {
    name: "fern",
    note: "Tuned from Juniper's needle ramp: a fuller green, tints fresh, shades sweeping toward teal.",
  },
  {
    name: "driftwood",
    note: "The muted neutral for borders, muted text, and quiet surfaces; warmth accumulates toward the dark end.",
  },
  {
    name: "plum",
    note: "The accent, dialed back into fern's register so the purple reads structural rather than emphatic.",
    marked: { step: "600", tag: "primary" },
  },
  {
    name: "berry",
    note: "The cold formal blue, seeded from juniper berries: frost tints, even hue sweep into berry violet, AAA-strength dark end.",
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
      {/* one block so the ramps sit close together despite Page's section spacing */}
      <div className={styles.ramps}>
        {ramps.map((ramp) => (
          <section key={ramp.name} aria-label={`${ramp.name} color ramp`}>
            <div className={styles.rampHead}>
              <h2 className={styles.rampName}>{ramp.name}</h2>
              {ramp.marked ? (
                <span className={styles.tag}>
                  {ramp.marked.step} · {ramp.marked.tag}
                </span>
              ) : null}
              <p className={styles.note}>{ramp.note}</p>
            </div>
            <ul className={styles.grid}>
              {STEPS.map((step) => (
                <li key={step} className={styles.step}>
                  <div
                    title={`${ramp.name}-${step} · ${values[ramp.name]?.[step] ?? ""}`}
                    style={
                      {
                        "--swatch": `var(--or-${ramp.name}-${step})`,
                      } as CSSProperties
                    }
                    className={clsx(
                      styles.swatch,
                      ramp.marked?.step === step && styles.swatchMarked,
                    )}
                  />
                  <p
                    className={clsx(
                      styles.label,
                      ramp.marked?.step === step && styles.labelMarked,
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
        <h2 className={styles.usageHeading}>Usage</h2>
        <p className={styles.usage}>
          Components should keep using semantic tokens (
          <code className={styles.code}>var(--or-primary)</code>,{" "}
          <code className={styles.code}>var(--or-ring)</code>) — the ramps are
          for stylesheets that need explicit shades, e.g.{" "}
          <code className={styles.code}>var(--or-fern-100)</code> for a tinted
          surface or{" "}
          <code className={styles.code}>var(--or-nectarine-700)</code> for
          accessible accent text on light backgrounds.
        </p>
      </section>
    </Page>
  )
}
