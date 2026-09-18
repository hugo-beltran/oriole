import { cva, type VariantProps } from "class-variance-authority"
import { Children, type ComponentProps } from "react"
import Markdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"

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

/* Markdown blocks restyled for the bubble's scale, on the current text
 * color so they read on any fill. Tints use black/white mixes rather than
 * palette tokens for the same reason. */
const markdownComponents: Components = {
  p: (props) => <p className="my-0" {...props} />,
  a: (props) => (
    <a
      className="font-medium underline underline-offset-2"
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  ul: (props) => (
    <ul
      className="my-0 list-disc space-y-0.5 ps-4 [&_li.task-list-item]:list-none [&_li.task-list-item>input]:me-1.5 [&_li.task-list-item]:-ms-4"
      {...props}
    />
  ),
  ol: (props) => (
    <ol className="my-0 list-decimal space-y-0.5 ps-4" {...props} />
  ),
  h1: (props) => <h1 className="text-base font-semibold" {...props} />,
  h2: (props) => <h2 className="text-sm font-semibold" {...props} />,
  h3: (props) => <h3 className="text-sm font-semibold" {...props} />,
  h4: (props) => <h4 className="text-sm font-semibold" {...props} />,
  code: (props) => (
    <code
      className="rounded bg-black/8 px-1 py-0.5 font-mono text-[0.85em]"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="overflow-x-auto rounded-md bg-black/8 p-2 [&>code]:bg-transparent [&>code]:p-0"
      {...props}
    />
  ),
  blockquote: (props) => (
    <blockquote className="border-s-2 border-current/30 ps-2" {...props} />
  ),
  hr: () => <hr className="border-current/20" />,
  table: (props) => (
    <div className="overflow-x-auto">
      <table className="border-collapse text-xs" {...props} />
    </div>
  ),
  th: (props) => (
    <th
      className="border border-current/20 px-2 py-1 text-left font-semibold"
      {...props}
    />
  ),
  td: (props) => (
    <td className="border border-current/20 px-2 py-1" {...props} />
  ),
}

interface BubbleProps
  extends Omit<ComponentProps<"div">, "color">,
    VariantProps<typeof bubbleVariants> {
  /** Render string children as Markdown (GFM: tables, strikethrough, task
   * lists). Non-string children pass through unchanged, so citations or
   * chips can trail a rendered reply. */
  markdown?: boolean
}

/**
 * Bubble — an instant-messaging chat bubble. `from="user"` (what the logged
 * in user said) fills with nectarine and hangs right; `from="system"` (the
 * reply) fills with light driftwood and hangs left. `color` overrides the
 * fill on either side — `plum` for the accent.
 *
 * `markdown` renders string children as Markdown — meant for the system
 * side, where model replies arrive formatted.
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
  markdown = false,
  children,
  ...props
}: BubbleProps) {
  const resolvedColor = color ?? (from === "user" ? "nectarine" : "driftwood")

  const content = markdown
    ? Children.map(children, (child) =>
        typeof child === "string" ? (
          <div className="space-y-2">
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {child}
            </Markdown>
          </div>
        ) : (
          child
        ),
      )
    : children

  return (
    <div
      className={cn(
        bubbleVariants({ from, color: resolvedColor, tail }),
        className,
      )}
      {...props}
    >
      {content}
    </div>
  )
}

export { Bubble, type BubbleProps, bubbleVariants }
