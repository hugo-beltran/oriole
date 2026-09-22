import { cva, type VariantProps } from "class-variance-authority"
import { Children, type ComponentProps } from "react"
import Markdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import styles from "./bubble.module.css"

const bubbleVariants = cva(styles.bubble, {
  variants: {
    from: {
      user: styles.user,
      system: styles.system,
    },
    color: {
      fern: styles.fern,
      driftwood: styles.driftwood,
      plum: styles.plum,
    },
    tail: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    { from: "user", tail: true, className: styles.tailUser },
    { from: "system", tail: true, className: styles.tailSystem },
  ],
  defaultVariants: {
    from: "system",
    tail: true,
  },
})

/* Element styling lives in bubble.module.css under `.markdown`; these
 * overrides only add behavior (external links, a scroll wrapper for tables). */
const markdownComponents: Components = {
  a: (props) => <a target="_blank" rel="noreferrer" {...props} />,
  table: (props) => (
    <div className={styles.tableScroll}>
      <table {...props} />
    </div>
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
 * in user said) fills with the `fern` voice — a berry gradient under fern
 * text — and hangs right; `from="system"` (the reply) sits on translucent
 * driftwood with a plum hairline and hangs left. `color` overrides the fill
 * on either side — `plum` for the accent.
 *
 * `markdown` renders string children as Markdown — meant for the system
 * side, where model replies arrive formatted.
 *
 * The tightened bottom corner points at the speaker; hide it with
 * `tail={false}` on consecutive messages from the same side. Alignment uses
 * `align-self`, so stack bubbles in a column flex thread.
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
  const resolvedColor = color ?? (from === "user" ? "fern" : "driftwood")

  const content = markdown
    ? Children.map(children, (child) =>
        typeof child === "string" ? (
          <div className={styles.markdown}>
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
      className={bubbleVariants({
        from,
        color: resolvedColor,
        tail,
        className,
      })}
      {...props}
    >
      {content}
    </div>
  )
}

export { Bubble, type BubbleProps, bubbleVariants }
