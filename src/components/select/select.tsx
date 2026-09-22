"use client"

import { clsx } from "clsx"
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
import styles from "./select.module.css"

interface SelectProps<T extends object>
  extends Omit<AriaSelectProps<T>, "children" | "className"> {
  className?: string
  children?: ReactNode
  ref?: Ref<HTMLDivElement>
}

/**
 * Select — a compound picker over react-aria's Select. Compose it from
 * `SelectTrigger` (with `SelectValue` inside) and `SelectContent` holding
 * `SelectItem`s; the popover and listbox are fused so no render props cross
 * the API. Pair it with a react-aria `Label`.
 */
function Select<T extends object>({ className, ...props }: SelectProps<T>) {
  return <AriaSelect className={clsx(styles.select, className)} {...props} />
}

interface SelectTriggerProps {
  className?: string
  children?: ReactNode
  ref?: Ref<HTMLButtonElement>
}

function SelectTrigger({ className, children, ...props }: SelectTriggerProps) {
  return (
    <AriaButton className={clsx(styles.trigger, className)} {...props}>
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
    <AriaPopover className={clsx(styles.content, className)}>
      <AriaListBox className={styles.list}>{children}</AriaListBox>
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
      className={clsx(styles.item, className)}
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
      className={styles.chevron}
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
      className={styles.check}
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
