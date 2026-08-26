"use client"

import {
  ArrowRight01Icon,
  Cancel01Icon,
  Search01Icon,
  SidebarLeftIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  type ComponentProps,
  createContext,
  type MouseEvent,
  type ReactNode,
  type Ref,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react"
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components"

import { cn } from "../../lib/utils.js"

interface NestContextValue {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

const NestContext = createContext<NestContextValue | null>(null)

function useNest() {
  const context = useContext(NestContext)
  if (!context) {
    throw new Error("useNest must be used within a Nest or NestProvider")
  }
  return context
}

const NestGroupContext = createContext<{ query: string }>({ query: "" })

const chromeButton = [
  "flex shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors",
  "outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring",
  "data-[hovered]:bg-card/70 data-[hovered]:text-foreground data-[pressed]:bg-card",
]

/*
 * Collapse motion follows shadcn's sidebar: one unified 200ms ease-linear
 * clock. The aside's width clips a fixed-width inner column, so row copy is
 * swept under the clip edge rather than animated separately; only the brand,
 * the toggles, and groups cross-fade — all on the same clock. Nothing
 * unmounts and rows keep constant geometry, so icons never shift.
 */
const nestFade = (hidden: boolean) =>
  cn("transition-opacity duration-200 ease-linear", hidden && "opacity-0")

const nestSlide = cn(
  "transition-[width] duration-280 ease-cubic-bezier(0.34,1.4,0.64,1)",
)

/* Row trimmings (shortcut hints, detail stats) that fade out when the nest
 * collapses — CSS-only via the group flag, so rows never re-render. */
const nestCollapseFade = cn(
  "transition-opacity duration-200 ease-linear",
  "group-data-collapsed/nest:opacity-0",
)

/* Shared chrome for NestLink and NestChat rows. */
const nestRow = cn(
  "relative z-10 flex h-8 w-full min-w-0 shrink-0 items-center overflow-hidden rounded-lg px-2 text-sm text-foreground/80 transition-colors",
  "outline-none data-focus-visible:ring-2 data-focus-visible:ring-ring",
  "data-hovered:text-foreground data-pressed:bg-card/80",
  "data-disabled:pointer-events-none data-disabled:opacity-50",
)

interface NestProviderProps {
  defaultCollapsed?: boolean
  children?: ReactNode
}

/**
 * NestProvider — lifts the Nest's collapsed state so controls outside the
 * Nest (e.g. a NestToggle perched on the Perch) can drive it. Optional:
 * a Nest without a surrounding provider owns its own state.
 */
function NestProvider({
  defaultCollapsed = false,
  children,
}: NestProviderProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  return (
    <NestContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </NestContext.Provider>
  )
}

interface NestProps extends ComponentProps<"aside"> {
  /** Initial collapsed state. Ignored under a NestProvider — set it there instead. */
  defaultCollapsed?: boolean
}

/** Navigation strip. Collapsible to an icon-only view. */
function Nest({
  className,
  children,
  defaultCollapsed = false,
  ...props
}: NestProps) {
  const outer = useContext(NestContext)
  const [localCollapsed, setLocalCollapsed] = useState(defaultCollapsed)
  const value = outer ?? {
    collapsed: localCollapsed,
    setCollapsed: setLocalCollapsed,
  }

  return (
    <NestContext.Provider value={value}>
      <aside
        data-collapsed={value.collapsed || undefined}
        className={cn(
          "group/nest flex flex-col",
          value.collapsed ? "w-14" : "w-50",
          nestSlide,
          className,
        )}
        {...props}
      >
        {children}
      </aside>
    </NestContext.Provider>
  )
}

interface NestHeadProps extends ComponentProps<"div"> {
  /** Brand mark; like row icons, it is all that remains when the nest collapses. */
  icon?: ReactNode
  /** Brand name; cross-fades out when the nest collapses. */
  label?: ReactNode
}

/**
 * NestHead — the brand row. Give it an icon + label for an icon-first head
 * aligned with the rows below, or pass children (e.g. a full wordmark) for
 * centered custom branding that clips on collapse.
 */
function NestHead({
  className,
  icon,
  label,
  children,
  ...props
}: NestHeadProps) {
  const { collapsed } = useNest()
  return (
    <div
      className={cn(
        "relative flex w-full min-w-0 shrink-0 items-center overflow-hidden py-2",
        icon != null || label != null
          ? "px-4"
          : "justify-around gap-1 px-1 [&_svg]:max-w-24 [&_svg]:min-w-12",
        className,
      )}
      {...props}
    >
      {icon != null ? (
        <span className="flex size-6 shrink-0 items-center justify-center">
          {icon}
        </span>
      ) : null}
      {label != null ? (
        <span
          aria-hidden={collapsed || undefined}
          className={cn(
            "ml-1.5 min-w-0 flex-1 truncate font-display text-sm",
            nestFade(collapsed),
          )}
        >
          {label}
        </span>
      ) : null}
      {children}
    </div>
  )
}

interface NestToggleProps extends AriaButtonProps {
  className?: string
}

/**
 * NestToggle — collapses/expands the Nest. Place it anywhere under the same
 * NestProvider (or inside the Nest itself), e.g. on the Perch's top-left corner.
 */
function NestToggle({ className, ...props }: NestToggleProps) {
  const { collapsed, setCollapsed } = useNest()

  return (
    <AriaButton
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      onPress={() => setCollapsed(!collapsed)}
      className={cn(chromeButton, "size-8 text-fern-800", className)}
      {...props}
    >
      <HugeiconsIcon icon={SidebarLeftIcon} size={20} />
    </AriaButton>
  )
}

interface NestGroupProps {
  /** Section title. With a title the group folds like an accordion. */
  title?: string
  /** Show a search control that live-filters the group's links. Needs a title. */
  searchable?: boolean
  defaultOpen?: boolean
  /** Fade the group out when the nest collapses. On by default; switch off for icon rows that should survive the collapse. */
  hideOnCollapse?: boolean
  className?: string
  children?: ReactNode
}

/**
 * NestGroup — a group of NestLinks whose rows share one gliding hover
 * highlight. Given a title it folds like an accordion and can be searchable:
 * the search control filters links by their label. By default the group
 * hides when the nest collapses.
 */
function NestGroup({
  title,
  searchable = false,
  defaultOpen = true,
  hideOnCollapse = true,
  className,
  children,
}: NestGroupProps) {
  const { collapsed } = useNest()
  const [open, setOpen] = useState(defaultOpen)
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const panelId = useId()

  // The rows share one gliding hover highlight: the flock moves together
  // instead of each row lighting up on its own.
  const listRef = useRef<HTMLDivElement>(null)
  const [glide, setGlide] = useState<{ top: number; height: number } | null>(
    null,
  )
  const [gliding, setGliding] = useState(false)

  function handleMouseOver(event: MouseEvent<HTMLDivElement>) {
    const row = (event.target as HTMLElement).closest("[data-nest-row]")
    if (!(row instanceof HTMLElement) || !listRef.current?.contains(row)) return
    const rowRect = row.getBoundingClientRect()
    const listRect = listRef.current.getBoundingClientRect()
    setGlide({ top: rowRect.top - listRect.top, height: rowRect.height })
    setGliding(true)
  }

  const hidden = hideOnCollapse && collapsed

  useEffect(() => {
    if (searching) inputRef.current?.focus()
  }, [searching])

  useEffect(() => {
    if (collapsed) {
      setSearching(false)
      setQuery("")
    }
  }, [collapsed])

  function closeSearch() {
    setSearching(false)
    setQuery("")
  }

  return (
    <div
      inert={hidden || undefined}
      className={cn(
        title && "mt-3 flex min-h-0 flex-1 flex-col",
        nestFade(hidden),
        className,
      )}
    >
      {title ? (
        <div className="relative mx-2 mb-1 h-8 shrink-0">
          {searching ? (
            <div className="absolute inset-0 flex items-center rounded-lg border border-driftwood-50/50 bg-card/60 backdrop-blur-xl">
              <HugeiconsIcon
                icon={Search01Icon}
                size={14}
                className="ml-2 shrink-0 text-muted-foreground"
              />
              <input
                ref={inputRef}
                aria-label={`Search ${title.toLowerCase()}`}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") closeSearch()
                }}
                placeholder={`Search ${title.toLowerCase()}`}
                className="ml-1.5 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <AriaButton
                aria-label="Close search"
                onPress={closeSearch}
                className={cn(chromeButton, "size-8")}
              >
                <HugeiconsIcon icon={Cancel01Icon} size={14} />
              </AriaButton>
            </div>
          ) : (
            <>
              <AriaButton
                aria-expanded={open}
                aria-controls={open ? panelId : undefined}
                onPress={() => setOpen(!open)}
                className={cn(
                  "absolute inset-y-0 left-0 flex items-center gap-1 rounded-lg px-2 text-xs font-medium text-muted-foreground",
                  "outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring",
                  "data-[hovered]:text-foreground",
                )}
              >
                {title}
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={12}
                  className={cn(
                    "transition-transform duration-200",
                    open && "rotate-90",
                  )}
                />
              </AriaButton>
              {searchable ? (
                <AriaButton
                  aria-label={`Search ${title.toLowerCase()}`}
                  onPress={() => {
                    setSearching(true)
                    setOpen(true)
                  }}
                  className={cn(chromeButton, "absolute right-0 top-0 size-8")}
                >
                  <HugeiconsIcon icon={Search01Icon} size={14} />
                </AriaButton>
              ) : null}
            </>
          )}
        </div>
      ) : null}
      {open ? (
        <div
          id={title ? panelId : undefined}
          className={cn(title && "min-h-0 flex-1 overflow-y-auto")}
        >
          {/* biome-ignore lint/a11y/noStaticElementInteractions: mouse-only decorative highlight; rows keep their own focus states */}
          {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: mouse-only decorative highlight; rows keep their own focus states */}
          {/* biome-ignore lint/a11y/useKeyWithMouseEvents: mouse-only decorative highlight; rows keep their own focus states */}
          <div
            ref={listRef}
            onMouseOver={handleMouseOver}
            onMouseLeave={() => setGliding(false)}
            className="relative flex flex-col gap-px px-2"
          >
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-x-2 z-0 rounded-lg bg-card/70",
                "transition-[transform,height,opacity] duration-200",
                gliding ? "opacity-100" : "opacity-0",
              )}
              style={
                glide
                  ? {
                      transform: `translateY(${glide.top}px)`,
                      height: glide.height,
                    }
                  : { height: 0 }
              }
            />
            <NestGroupContext.Provider value={{ query }}>
              {children}
            </NestGroupContext.Provider>
          </div>
        </div>
      ) : null}
    </div>
  )
}

interface NestLinkProps extends AriaButtonProps {
  className?: string
  /** The row's label. */
  children?: ReactNode
  /** Mandatory — the icon is all that remains of the row when the nest collapses. */
  icon: ReactNode
  /** Right-aligned detail, e.g. a count like "3/10". */
  detail?: ReactNode
  /** Right-aligned keyboard hint, e.g. "⌘N". */
  shortcut?: string
  /** Plain-text label used for search filtering and the collapsed state. */
  textValue?: string
  ref?: Ref<HTMLButtonElement>
}

/**
 * NestLink — an icon-first row. Full-width with a hidden overflow, so when
 * the nest collapses the row auto-shrinks around its icon; label, detail,
 * and shortcut are swept under the clip. Text-only rows (e.g. previous
 * chats) are a different animal — they vanish entirely on collapse — and
 * have their own component: NestChat.
 */
function NestLink({
  className,
  children,
  icon,
  detail,
  shortcut,
  textValue,
  ...props
}: NestLinkProps) {
  const { query } = useContext(NestGroupContext)
  const label = textValue ?? (typeof children === "string" ? children : "")
  if (query && !label.toLowerCase().includes(query.toLowerCase())) return null
  return (
    <AriaButton
      data-nest-row
      aria-label={label || undefined}
      className={cn(nestRow, className)}
      {...props}
    >
      <span className="flex size-6 shrink-0 items-center justify-center text-muted-foreground">
        {icon}
      </span>
      <span className="ml-1.5 min-w-0 flex-1 truncate text-left">
        {children}
      </span>
      {detail != null ? (
        <span
          className={cn(
            "ml-2 shrink-0 text-xs font-medium tabular-nums text-muted-foreground",
            nestCollapseFade,
          )}
        >
          {detail}
        </span>
      ) : null}
      {shortcut ? (
        <kbd
          className={cn(
            "ml-2 shrink-0 rounded border border-driftwood-50/50 bg-card/60 px-1 font-sans text-[10px] text-muted-foreground",
            nestCollapseFade,
          )}
        >
          {shortcut}
        </kbd>
      ) : null}
    </AriaButton>
  )
}

interface NestChatProps extends AriaButtonProps {
  className?: string
  /** The chat's title. */
  children?: ReactNode
  /** Plain-text label used for search filtering when children isn't a string. */
  textValue?: string
  ref?: Ref<HTMLButtonElement>
}

/**
 * NestChat — a text-only row for previous chats. Shares the group's gliding
 * highlight and search filter, but carries no icon: with nothing to shrink
 * around it fades out on collapse and leaves the tab order, though its home
 * is a titled group, which hides wholesale anyway.
 */
function NestChat({
  className,
  children,
  textValue,
  isDisabled,
  ...props
}: NestChatProps) {
  const { collapsed } = useNest()
  const { query } = useContext(NestGroupContext)
  const label = textValue ?? (typeof children === "string" ? children : "")
  if (query && !label.toLowerCase().includes(query.toLowerCase())) return null
  return (
    <AriaButton
      data-nest-row
      aria-label={label || undefined}
      isDisabled={collapsed || isDisabled}
      className={cn(nestRow, nestCollapseFade, className)}
      {...props}
    >
      <span className="min-w-0 flex-1 truncate text-left">{children}</span>
    </AriaButton>
  )
}

export {
  Nest,
  NestChat,
  type NestChatProps,
  NestGroup,
  type NestGroupProps,
  NestHead,
  type NestHeadProps,
  NestLink,
  type NestLinkProps,
  type NestProps,
  NestProvider,
  type NestProviderProps,
  NestToggle,
  type NestToggleProps,
}
