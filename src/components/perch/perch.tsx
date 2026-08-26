import type { ComponentProps } from "react"

import { cn } from "../../lib/utils.js"

/**
 * Perch — the singular floating surface. Sits above the Canvas the way an
 * oriole sits above the forest floor: one per view, glassy, elevated over
 * the atmosphere gradient. One per view, not for in-flow content.
 */
function Perch({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "isolate rounded-2xl border border-driftwood-50/50 bg-card/60",
        "text-card-foreground shadow-xl ring-1 ring-driftwood-800/10 backdrop-blur-xl",
        className,
      )}
      {...props}
    />
  )
}

export { Perch }
