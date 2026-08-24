"use client"

import type { ReactNode, Ref } from "react"
import {
  Button as AriaButton,
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  type ListBoxItemProps as AriaListBoxItemProps,
  Popover as AriaPopover,
  Select as AriaSelect,
  type SelectProps as AriaSelectProps,
  SelectValue as AriaSelectValue,
  type SelectValueProps as AriaSelectValueProps,
} from "react-aria-components"
import { cn } from "../../lib/utils.js"

const slots = {
  root: "group flex flex-col gap-1.5",
  trigger: [
    "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm",
    "outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-background",
    "data-[hovered]:bg-accent/50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
    "[&>[data-placeholder]]:text-muted-foreground",
  ],
  content: [
    "min-w-(--trigger-width) overflow-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md",
    "data-[entering]:animate-in data-[entering]:fade-in-0 data-[exiting]:animate-out data-[exiting]:fade-out-0",
  ],
  item: [
    "flex cursor-default select-none items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
    "data-[focused]:bg-accent data-[focused]:text-accent-foreground",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  ],
}

interface SelectProps<T extends object>
  extends Omit<AriaSelectProps<T>, "children" | "className"> {
  className?: string
  children?: ReactNode
  ref?: Ref<HTMLDivElement>
}

function Select<T extends object>({ className, ...props }: SelectProps<T>) {
  return <AriaSelect className={cn(slots.root, className)} {...props} />
}

interface SelectTriggerProps {
  className?: string
  children?: ReactNode
  ref?: Ref<HTMLButtonElement>
}

function SelectTrigger({ className, children, ...props }: SelectTriggerProps) {
  return (
    <AriaButton className={cn(slots.trigger, className)} {...props}>
      {children}
      <ChevronDownIcon />
    </AriaButton>
  )
}

interface SelectValueProps<T extends object>
  extends Omit<AriaSelectValueProps<T>, "className"> {
  className?: string
}

function SelectValue<T extends object>(props: SelectValueProps<T>) {
  return <AriaSelectValue {...props} />
}

interface SelectContentProps {
  className?: string
  children?: ReactNode
}

function SelectContent({ className, children }: SelectContentProps) {
  return (
    <AriaPopover className={cn(slots.content, className)}>
      <AriaListBox className="outline-none">{children}</AriaListBox>
    </AriaPopover>
  )
}

interface SelectItemProps
  extends Omit<AriaListBoxItemProps, "children" | "className"> {
  className?: string
  children?: ReactNode
  ref?: Ref<HTMLDivElement>
}

function SelectItem({ className, children, ...props }: SelectItemProps) {
  return (
    <AriaListBoxItem
      className={cn(slots.item, className)}
      textValue={typeof children === "string" ? children : props.textValue}
      {...props}
    >
      {({ isSelected }) => (
        <>
          {children}
          {isSelected ? <CheckIcon /> : null}
        </>
      )}
    </AriaListBoxItem>
  )
}

function ChevronDownIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 opacity-50"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m4 6 4 4 4-4" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 8.5 3.5 3.5L13 5" />
    </svg>
  )
}

export {
  Select,
  SelectContent,
  type SelectContentProps,
  SelectItem,
  type SelectItemProps,
  type SelectProps,
  SelectTrigger,
  type SelectTriggerProps,
  SelectValue,
  type SelectValueProps,
}
