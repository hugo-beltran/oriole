"use client"

import {
  ArrowRight01Icon,
  Cancel01Icon,
  Search01Icon,
  SidebarLeftIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { clsx } from "clsx"
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
import styles from "./nest.module.css"

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

/* Collapse motion and the shared row/chrome rules live in nest.module.css. */
const nestFade = (hidden: boolean) => clsx(styles.fade, hidden && styles.faded)

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
        className={clsx(styles.nest, className)}
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
      className={clsx(
        styles.head,
        icon != null || label != null ? styles.headIconic : styles.headCustom,
        className,
      )}
      {...props}
    >
      {icon != null ? <span className={styles.headIcon}>{icon}</span> : null}
      {label != null ? (
        <span
          aria-hidden={collapsed || undefined}
          className={clsx(styles.headLabel, nestFade(collapsed))}
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
      className={clsx(styles.chromeButton, styles.toggle, className)}
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
      className={clsx(title && styles.groupTitled, nestFade(hidden), className)}
    >
      {title ? (
        <div className={styles.groupBar}>
          {searching ? (
            <div className={styles.search}>
              <HugeiconsIcon
                icon={Search01Icon}
                size={14}
                className={styles.searchIcon}
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
                className={styles.searchInput}
              />
              <AriaButton
                aria-label="Close search"
                onPress={closeSearch}
                className={styles.chromeButton}
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
                className={styles.groupToggle}
              >
                {title}
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={12}
                  className={clsx(styles.chevron, open && styles.chevronOpen)}
                />
              </AriaButton>
              {searchable ? (
                <AriaButton
                  aria-label={`Search ${title.toLowerCase()}`}
                  onPress={() => {
                    setSearching(true)
                    setOpen(true)
                  }}
                  className={clsx(styles.chromeButton, styles.searchOpen)}
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
          className={clsx(title && styles.panelScroll)}
        >
          {/* biome-ignore lint/a11y/noStaticElementInteractions: mouse-only decorative highlight; rows keep their own focus states */}
          {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: mouse-only decorative highlight; rows keep their own focus states */}
          {/* biome-ignore lint/a11y/useKeyWithMouseEvents: mouse-only decorative highlight; rows keep their own focus states */}
          <div
            ref={listRef}
            onMouseOver={handleMouseOver}
            onMouseLeave={() => setGliding(false)}
            className={styles.list}
          >
            <span
              aria-hidden="true"
              className={clsx(styles.glide, gliding && styles.gliding)}
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
      className={clsx(styles.row, className)}
      {...props}
    >
      <span className={styles.rowIcon}>{icon}</span>
      <span className={styles.rowLabel}>{children}</span>
      {detail != null ? (
        <span className={clsx(styles.rowDetail, styles.collapseFade)}>
          {detail}
        </span>
      ) : null}
      {shortcut ? (
        <kbd className={clsx(styles.rowShortcut, styles.collapseFade)}>
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
      className={clsx(styles.row, styles.collapseFade, className)}
      {...props}
    >
      <span className={styles.chatLabel}>{children}</span>
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
