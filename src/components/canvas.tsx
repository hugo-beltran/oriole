import { cva, type VariantProps } from "class-variance-authority"
import type { PropsWithChildren } from "react"
import { BackgroundNoise } from "./background-noise"

const canvasVariants = cva(
  "flex min-h-screen bg-driftwood-100 bg-lava-lamp text-foreground relative",
  {
    variants: {
      animated: {
        true: "animate-mesh-drift motion-reduce:animate-none",
        false: "",
      },
    },
    defaultVariants: {
      animated: false,
    },
  },
)

type CanvasProps = PropsWithChildren<VariantProps<typeof canvasVariants>>

export function Canvas({ children, animated }: CanvasProps) {
  return (
    <div className={canvasVariants({ animated })}>
      <BackgroundNoise />
      {children}
    </div>
  )
}
