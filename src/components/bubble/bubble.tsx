import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"

import { cn } from "../../lib/utils.js"

const bubbleVariants = cva(
  [
    "relative w-fit max-w-[75%] rounded-2xl px-3.5 py-2.5",
    "text-sm leading-relaxed break-words",
  ],
  {
    variants: {
      from: {
        user: "self-end",
        system: "self-start",
      },
      color: {
        nectarine: "bg-nectarine-300/90 text-driftwood-950",
        driftwood: "bg-driftwood-100/90 text-driftwood-950",
        plum: "bg-plum-300/90 text-plum-950",
      },
      tail: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      { from: "user", tail: true, className: "rounded-br-sm" },
      { from: "system", tail: true, className: "rounded-bl-sm" },
    ],
    defaultVariants: {
      from: "system",
      tail: true,
    },
  },
)

interface BubbleProps
  extends Omit<ComponentProps<"div">, "color">,
    VariantProps<typeof bubbleVariants> {}

/**
 * Bubble — an instant-messaging chat bubble. `from="user"` (what the logged
 * in user said) fills with nectarine and hangs right; `from="system"` (the
 * reply) fills with light driftwood and hangs left. `color` overrides the
 * fill on either side — `plum` for the accent.
 *
 * The tightened bottom corner points at the speaker; hide it with
 * `tail={false}` on consecutive messages from the same side. Alignment uses
 * `self-end`/`self-start`, so stack bubbles in a `flex flex-col` thread.
 */
function Bubble({
  className,
  from = "system",
  color,
  tail = true,
  ...props
}: BubbleProps) {
  const resolvedColor = color ?? (from === "user" ? "nectarine" : "driftwood")

  return (
    <div
      className={cn(
        bubbleVariants({ from, color: resolvedColor, tail }),
        className,
      )}
      {...props}
    />
  )
}

export { Bubble, type BubbleProps, bubbleVariants }
