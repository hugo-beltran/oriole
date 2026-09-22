import { clsx } from "clsx"
import type { ComponentProps } from "react"
import styles from "./perch.module.css"

/**
 * Perch — the singular floating surface. Sits above the Canvas the way an
 * oriole sits above the forest floor: one per view, glassy, elevated over
 * the atmosphere gradient. One per view, not for in-flow content.
 */
function Perch({ className, ...props }: ComponentProps<"div">) {
  return <div className={clsx(styles.perch, className)} {...props} />
}

export { Perch }
