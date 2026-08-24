"use client"

import { cva, type VariantProps } from "class-variance-authority"
import type { ReactNode, Ref } from "react"
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components"

import { cn } from "../../lib/utils.js"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors",
    "outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-background",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground data-[hovered]:bg-primary/90 data-[pressed]:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground data-[hovered]:bg-secondary/80 data-[pressed]:bg-secondary/70",
        outline:
          "border border-input bg-background data-[hovered]:bg-accent data-[hovered]:text-accent-foreground data-[pressed]:bg-accent/80",
        ghost:
          "data-[hovered]:bg-accent data-[hovered]:text-accent-foreground data-[pressed]:bg-accent/80",
        destructive:
          "bg-destructive text-destructive-foreground data-[hovered]:bg-destructive/90 data-[pressed]:bg-destructive/80",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4",
        lg: "h-10 px-6",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
)

interface ButtonProps
  extends AriaButtonProps,
    VariantProps<typeof buttonVariants> {
  className?: string
  children?: ReactNode
  ref?: Ref<HTMLButtonElement>
}

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <AriaButton
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button, type ButtonProps, buttonVariants }
