"use client"

import { cva, type VariantProps } from "class-variance-authority"
import type { ReactNode, Ref } from "react"
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components"
import styles from "./button.module.css"

const buttonVariants = cva(styles.button, {
  variants: {
    variant: {
      default: styles.default,
      secondary: styles.secondary,
      outline: styles.outline,
      ghost: styles.ghost,
      destructive: styles.destructive,
    },
    size: {
      sm: styles.sm,
      md: styles.md,
      lg: styles.lg,
      icon: styles.icon,
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
})

interface ButtonProps
  extends AriaButtonProps,
    VariantProps<typeof buttonVariants> {
  className?: string
  children?: ReactNode
  ref?: Ref<HTMLButtonElement>
}

/**
 * Button — the pressable. Five fills (`default` on the primary plum,
 * `secondary`, `outline`, `ghost`, `destructive`) and four sizes including a
 * square `icon`. Interaction states come from React Aria's data attributes.
 */
function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <AriaButton
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  )
}

export { Button, type ButtonProps, buttonVariants }
