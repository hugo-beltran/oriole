import type { PropsWithChildren } from "react";
import { BackgroundNoise } from "./background-noise";
import { cva, type VariantProps } from "class-variance-authority";

const canvasVariants = cva(
  "flex min-h-screen bg-canvas text-foreground relative",
  {
    variants: {
      hue: {
        cool: "bg-driftwood-100 bg-undergrowth",
        warm: "bg-driftwood-100 bg-washed-paper",
      },
    },
    defaultVariants: {
      hue: "cool",
    },
  },
);

type CanvasProps = PropsWithChildren<VariantProps<typeof canvasVariants>>;

export function Canvas({ children, hue }: CanvasProps) {
  return (
    <div className={canvasVariants({ hue })}>
      <BackgroundNoise />
      {children}
    </div>
  );
}
