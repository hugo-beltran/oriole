import { cva, type VariantProps } from "class-variance-authority"
import type { PropsWithChildren } from "react"
import { BackgroundNoise } from "./background-noise.js"
import styles from "./canvas.module.css"

const canvasVariants = cva(styles.canvas, {
  variants: {
    animated: {
      true: styles.animated,
      false: "",
    },
  },
  defaultVariants: {
    animated: false,
  },
})

type CanvasProps = PropsWithChildren<
  VariantProps<typeof canvasVariants> & { className?: string }
>

/**
 * Canvas — the full-height branded backdrop: the driftwood ground, the fern
 * "undergrowth" gradient mesh, and the grain overlay. `animated` drifts the
 * mesh; reduced-motion users get the static mesh. Put one Perch on it.
 */
function Canvas({ children, animated, className }: CanvasProps) {
  return (
    <div className={canvasVariants({ animated, className })}>
      <BackgroundNoise />
      {children}
    </div>
  )
}

export { Canvas, type CanvasProps }
