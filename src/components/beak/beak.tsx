"use client"

import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowUp02Icon,
  Cancel01Icon,
  File01Icon,
  Mic01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  type ReactNode,
  type Ref,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"

import { cn } from "../../lib/utils.js"

interface BeakItem {
  id: string
  label: string
  description?: string
  icon?: ReactNode
  /** Run instead of inserting the label into the draft (e.g. open a file picker). */
  onSelect?: () => void
}

interface BeakModel {
  id: string
  label: string
  /** Short note shown beside the name in the menu (e.g. "Flagship"). */
  tag?: string
}

interface BeakProps {
  className?: string
  placeholder?: string
  /** `pill` rounds the composer fully; `rounded` (default) keeps card corners. */
  variant?: "rounded" | "pill"
  /** Items behind the + button and the `@` menu. */
  sources?: BeakItem[]
  /** Items behind the `/` menu; labels are stored without the slash. */
  commands?: BeakItem[]
  /** Model roster for the picker; the picker hides without it. */
  models?: BeakModel[]
  defaultModelId?: string
  modelId?: string
  onModelChange?: (id: string) => void
  /** Attached file names, rendered as removable chips above the input. */
  attachments?: string[]
  onAttachmentRemove?: (index: number) => void
  /** Resolves to a transcript appended to the draft; the mic hides without it. */
  onDictate?: () => Promise<string>
  /** The draft is cleared on send; attachments are the caller's to clear. */
  onSend?: (text: string) => void
  isDisabled?: boolean
  ref?: Ref<HTMLDivElement>
}

/** The last `@word` or `/word` being typed at the end of the draft, if any. */
function parseToken(
  draft: string,
): { kind: "at" | "slash"; query: string; start: number } | null {
  const match = /(^|\s)([@/])([\w-]*)$/.exec(draft)
  if (!match) return null
  const [, lead = "", sigil, word = ""] = match
  return {
    kind: sigil === "@" ? "at" : "slash",
    query: word.toLowerCase(),
    start: match.index + lead.length,
  }
}

const GLIDE =
  "top 220ms cubic-bezier(0.23,1,0.32,1), height 220ms cubic-bezier(0.23,1,0.32,1), opacity 150ms ease"

const POP_IN = {
  animation: "or-pop-in 180ms cubic-bezier(0.23,1,0.32,1) both",
} as const

const iconButton = cn(
  "flex size-7 shrink-0 items-center justify-center text-muted-foreground",
  "transition-[background-color,color,transform] duration-150",
  "outline-none focus-visible:ring-2 focus-visible:ring-ring",
  "hover:bg-accent hover:text-foreground active:scale-[0.94]",
)

const menuSurface = cn(
  "rounded-[10px] border border-border bg-popover p-1 text-popover-foreground shadow-md",
)

/**
 * Beak — the prompt bar: where the chirps come from. A compact composer with
 * an auto-growing input that widens onto its own row as the draft wraps,
 * plus menus that grow out of the bar itself: `@` (or the + button) for
 * `sources`, `/` for `commands`, and a model picker fed by `models` — all
 * navigable from the keyboard (↑↓, Enter/Tab, Esc). `onDictate` adds a mic
 * that resolves a transcript into the draft; `attachments` render as
 * removable chips. Menus highlight with a single gliding pill, matching the
 * Nest's.
 *
 * Enter sends (Shift+Enter breaks the line) and hands the trimmed draft to
 * `onSend`. Every part beyond `onSend` is optional — with none of them the
 * Beak is a bare input-and-send bar.
 */
function Beak({
  className,
  placeholder = "Write a message…",
  variant = "rounded",
  sources,
  commands,
  models,
  defaultModelId,
  modelId,
  onModelChange,
  attachments = [],
  onAttachmentRemove,
  onDictate,
  onSend,
  isDisabled = false,
  ref,
}: BeakProps) {
  const pill = variant === "pill"
  const [draft, setDraft] = useState("")
  const [dismissed, setDismissed] = useState(false)
  const [plusOpen, setPlusOpen] = useState(false)
  const [modelOpen, setModelOpen] = useState(false)
  const [localModelId, setLocalModelId] = useState(
    defaultModelId ?? models?.[0]?.id,
  )
  const [active, setActive] = useState(0)
  const [engaged, setEngaged] = useState(false)
  const [listening, setListening] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [rowBox, setRowBox] = useState<{ top: number; height: number } | null>(
    null,
  )
  const [modelBox, setModelBox] = useState<{
    top: number
    height: number
  } | null>(null)
  const [modelHovered, setModelHovered] = useState<number | null>(null)
  const [modelMenu, setModelMenu] = useState({ left: 0, bottom: 0 })

  const anchorRef = useRef<HTMLDivElement>(null)
  const controlsRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)
  const modelRef = useRef<HTMLButtonElement>(null)
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([])
  const modelRowRefs = useRef<(HTMLButtonElement | null)[]>([])

  const currentModelId = modelId ?? localModelId
  const model =
    models?.find((candidate) => candidate.id === currentModelId) ?? models?.[0]

  const token = dismissed ? null : parseToken(draft)
  const menu: "at" | "slash" | null = plusOpen ? "at" : (token?.kind ?? null)
  const query = plusOpen ? "" : (token?.query ?? "")

  const rows: BeakItem[] =
    menu === "at"
      ? (sources ?? []).filter((source) =>
          source.label.toLowerCase().includes(query),
        )
      : menu === "slash"
        ? (commands ?? []).filter((command) =>
            command.label.toLowerCase().startsWith(query),
          )
        : []
  const menuOpen = menu !== null && (menu === "at" ? !!sources : !!commands)

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset on menu context change
  useEffect(() => {
    setActive(0)
    setEngaged(false)
  }, [menu, query])

  /* A single highlight glides to the active row instead of each row
   * toggling its own background — the same gliding pill as the Nest. */
  // biome-ignore lint/correctness/useExhaustiveDependencies: track menu context, not just refs
  useLayoutEffect(() => {
    const target = rowRefs.current[active]
    if (target)
      setRowBox({ top: target.offsetTop, height: target.offsetHeight })
  }, [menu, query, active, rows.length])

  /* Same glide in the model menu — floats to the hovered row, falling back
   * to the currently-selected model. */
  const modelIndex = models?.findIndex((m) => m.id === model?.id) ?? 0
  useLayoutEffect(() => {
    if (!modelOpen) return
    const target = modelRowRefs.current[modelHovered ?? modelIndex]
    if (target)
      setModelBox({ top: target.offsetTop, height: target.offsetHeight })
  }, [modelOpen, modelHovered, modelIndex])

  /* The model menu is a sibling of the clipped composer, so align it to the
   * trigger by measurement instead of pinning it to the far-right edge. */
  useLayoutEffect(() => {
    if (!modelOpen || !anchorRef.current || !modelRef.current) return
    const anchorRect = anchorRef.current.getBoundingClientRect()
    const triggerRect = modelRef.current.getBoundingClientRect()
    setModelMenu({
      left: Math.max(
        0,
        Math.min(triggerRect.left - anchorRect.left, anchorRect.width - 176),
      ),
      bottom: anchorRect.bottom - triggerRect.top + 8,
    })
  }, [modelOpen])

  useEffect(() => {
    if (!modelOpen) setModelHovered(null)
  }, [modelOpen])

  /* Move wrapped text onto its own row, then grow to a compact maximum. */
  useLayoutEffect(() => {
    const input = inputRef.current
    const controls = controlsRef.current
    const measure = measureRef.current
    if (!input || !controls || !measure) return

    /* Fixed controls: + and send are 28px; mic and the model trigger only
     * when present. gap-x-1 puts 4px between each of the inline items. */
    const modelWidth = modelRef.current?.offsetWidth ?? 0
    const slots = 2 + (onDictate ? 1 : 0) + (model ? 1 : 0)
    const fixedWidth = 28 * (slots - (model ? 1 : 0)) + modelWidth
    const inlineInputWidth = controls.clientWidth - fixedWidth - 4 * slots
    /* A cramped composer (many controls, little width) skips the inline
     * arrangement entirely rather than squeezing the input to a sliver. */
    const needsFullWidth =
      draft.includes("\n") ||
      inlineInputWidth < 96 ||
      measure.offsetWidth + 8 > inlineInputWidth
    if (needsFullWidth !== expanded) setExpanded(needsFullWidth)

    const minHeight = 28
    const maxHeight = 100
    input.style.height = "0px"
    const contentHeight = input.scrollHeight
    input.style.height = `${Math.min(Math.max(contentHeight, minHeight), maxHeight)}px`
    input.style.overflowY = contentHeight > maxHeight ? "auto" : "hidden"
  }, [draft, expanded, model, onDictate])

  /* Clicking anywhere outside the composer closes the open menus. */
  useEffect(() => {
    if (!modelOpen && !plusOpen) return
    const close = (event: PointerEvent) => {
      if (!(event.target as Element).closest("[data-beak]")) {
        setModelOpen(false)
        setPlusOpen(false)
      }
    }
    document.addEventListener("pointerdown", close)
    return () => document.removeEventListener("pointerdown", close)
  }, [modelOpen, plusOpen])

  const closeMenus = () => {
    setPlusOpen(false)
    setModelOpen(false)
  }

  const pick = (item: BeakItem) => {
    if (item.onSelect) {
      item.onSelect()
      if (token) setDraft(draft.slice(0, token.start))
    } else {
      const kept = token ? draft.slice(0, token.start) : draft
      setDraft(`${kept}${menu === "slash" ? "/" : "@"}${item.label} `)
    }
    setPlusOpen(false)
    setDismissed(false)
    inputRef.current?.focus()
  }

  const selectModel = (next: BeakModel) => {
    setLocalModelId(next.id)
    onModelChange?.(next.id)
    setModelOpen(false)
    inputRef.current?.focus()
  }

  const dictate = async () => {
    if (!onDictate || listening) return
    setListening(true)
    try {
      const transcript = await onDictate()
      if (transcript)
        setDraft((current) =>
          current ? `${current.trimEnd()} ${transcript}` : transcript,
        )
    } finally {
      setListening(false)
      inputRef.current?.focus()
    }
  }

  const canSend =
    !isDisabled && (draft.trim().length > 0 || attachments.length > 0)
  const send = () => {
    if (!canSend) return
    onSend?.(draft.trim())
    setDraft("")
    closeMenus()
  }

  return (
    <div ref={ref} data-beak className={cn("w-full", className)}>
      {/* the composer is the anchor — menus grow up from its top edge */}
      <div ref={anchorRef} className="relative">
        {/* ── @ / slash menu ─────────────────────────────── */}
        {menuOpen && (
          <div
            className={cn(
              "absolute inset-x-0 bottom-full z-10 mb-2",
              menuSurface,
            )}
            style={{ ...POP_IN, transformOrigin: "bottom center" }}
          >
            {rows.length > 0 ? (
              <div
                role="listbox"
                aria-label={menu === "at" ? "Sources" : "Commands"}
                onMouseLeave={() => setEngaged(false)}
                className="relative"
              >
                {/* single gliding highlight — appears once a row is engaged */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 rounded-md bg-driftwood-100/80"
                  style={{
                    top: rowBox?.top ?? 0,
                    height: rowBox?.height ?? 0,
                    opacity: rowBox && engaged ? 1 : 0,
                    transition: GLIDE,
                  }}
                />
                {rows.map((row, index) => (
                  <button
                    key={row.id}
                    type="button"
                    role="option"
                    aria-selected={index === active}
                    ref={(element) => {
                      rowRefs.current[index] = element
                    }}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => {
                      setActive(index)
                      setEngaged(true)
                    }}
                    onClick={() => pick(row)}
                    className="relative z-10 flex h-9 w-full items-center gap-2.5 rounded-md px-2 text-left outline-none"
                  >
                    {row.icon && (
                      <span className="flex size-5.5 shrink-0 items-center justify-center text-foreground/70">
                        {row.icon}
                      </span>
                    )}
                    <span className="shrink-0 text-[12.5px] font-medium text-foreground">
                      {menu === "slash" ? `/${row.label}` : row.label}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                      {row.description}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex h-9 items-center px-2 text-xs text-muted-foreground">
                No matches for “{query}”
              </div>
            )}
            <div className="mt-1 border-t border-border px-2 pt-1.5 pb-1 text-[11px] text-muted-foreground">
              {menu === "at"
                ? "Type to search sources & files"
                : "Type to search commands"}
            </div>
          </div>
        )}

        {/* ── model menu ─────────────────────────────────── */}
        {modelOpen && models && (
          <div
            className={cn("absolute z-10 w-44", menuSurface)}
            style={{
              left: modelMenu.left,
              bottom: modelMenu.bottom,
              ...POP_IN,
              transformOrigin: "bottom left",
            }}
          >
            <div
              role="listbox"
              aria-label="Models"
              onMouseLeave={() => setModelHovered(null)}
              className="relative"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 rounded-md bg-driftwood-100/80"
                style={{
                  top: modelBox?.top ?? 0,
                  height: modelBox?.height ?? 0,
                  opacity: modelBox && modelHovered !== null ? 1 : 0,
                  transition: GLIDE,
                }}
              />
              {models.map((candidate, index) => (
                <button
                  key={candidate.id}
                  type="button"
                  role="option"
                  aria-selected={candidate.id === model?.id}
                  ref={(element) => {
                    modelRowRefs.current[index] = element
                  }}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setModelHovered(index)}
                  onClick={() => selectModel(candidate)}
                  className="relative z-10 flex h-7.5 w-full items-center gap-2 rounded-md px-2 text-left outline-none"
                >
                  <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-foreground">
                    {candidate.label}
                  </span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {candidate.tag}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-foreground",
                      candidate.id !== model?.id && "invisible",
                    )}
                  >
                    <HugeiconsIcon
                      icon={Tick02Icon}
                      size={13}
                      strokeWidth={2.5}
                    />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── composer ───────────────────────────────────── */}
        <div
          className={cn(
            "relative isolate flex flex-col gap-1.5 overflow-hidden border border-input bg-background p-1.5 shadow-xs",
            "transition-[border-color,border-radius] duration-150 focus-within:border-driftwood-400",
            pill
              ? attachments.length > 0 || expanded
                ? "rounded-3xl"
                : "rounded-full"
              : "rounded-[14px]",
            isDisabled && "pointer-events-none opacity-50",
          )}
        >
          {/* mirrors the draft so wrapping can be detected before it happens */}
          <span
            ref={measureRef}
            aria-hidden
            className="pointer-events-none invisible absolute whitespace-pre text-[13px] leading-[18px]"
          >
            {draft}
          </span>

          {attachments.length > 0 && (
            <div
              className={cn(
                "flex flex-wrap gap-1.5 pt-0.5",
                pill ? "px-1" : "px-0.5",
              )}
            >
              {attachments.map((file, index) => (
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: attachments are positional — removal is by index and names may repeat
                  key={`${file}-${index}`}
                  className={cn(
                    "flex h-6.5 items-center gap-1.5 bg-muted py-1 pr-1 pl-1.5 text-[11.5px] text-foreground/70 shadow-xs",
                    pill ? "rounded-full" : "rounded-md",
                  )}
                  style={POP_IN}
                >
                  <HugeiconsIcon icon={File01Icon} size={12} />
                  <span className="max-w-36 truncate">{file}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${file}`}
                    onClick={() => onAttachmentRemove?.(index)}
                    className={cn(
                      "-my-1 flex size-6 items-center justify-center text-muted-foreground outline-none transition-colors duration-100",
                      "hover:bg-border/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                      pill ? "rounded-full" : "rounded-sm",
                    )}
                  >
                    <HugeiconsIcon
                      icon={Cancel01Icon}
                      size={10}
                      strokeWidth={2.5}
                    />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div
            ref={controlsRef}
            className="flex flex-wrap items-end gap-x-1 gap-y-1.5"
          >
            {(sources?.length ?? 0) > 0 && (
              <button
                type="button"
                aria-label="Add attachments and sources"
                aria-expanded={plusOpen}
                onClick={() => {
                  setModelOpen(false)
                  setPlusOpen((current) => !current)
                  inputRef.current?.focus()
                }}
                className={cn(
                  "order-1",
                  iconButton,
                  pill ? "rounded-full" : "rounded-lg",
                  plusOpen && "bg-accent text-foreground",
                )}
              >
                <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={2} />
              </button>
            )}

            <textarea
              ref={inputRef}
              rows={1}
              value={draft}
              disabled={isDisabled}
              onChange={(event) => {
                setDraft(event.target.value)
                setDismissed(false)
                setPlusOpen(false)
              }}
              onKeyDown={(event) => {
                if (menuOpen && rows.length > 0) {
                  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                    event.preventDefault()
                    setEngaged(true)
                    setActive(
                      (current) =>
                        (current +
                          (event.key === "ArrowDown" ? 1 : rows.length - 1)) %
                        rows.length,
                    )
                    return
                  }
                  const activeRow = rows[active]
                  if (
                    activeRow &&
                    ((event.key === "Enter" && !event.shiftKey) ||
                      event.key === "Tab")
                  ) {
                    event.preventDefault()
                    pick(activeRow)
                    return
                  }
                }
                if (event.key === "Escape") {
                  setDismissed(true)
                  closeMenus()
                  return
                }
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault()
                  send()
                }
              }}
              placeholder={listening ? "Listening…" : placeholder}
              aria-label="Prompt"
              className={cn(
                "order-2 min-h-7 w-auto min-w-0 grow basis-0 resize-none bg-transparent px-1 py-[5px]",
                "text-[13px] leading-[18px] text-foreground outline-none [overflow-wrap:anywhere] placeholder:text-muted-foreground",
                expanded && "order-first basis-full",
              )}
            />

            {/* model picker */}
            {model && (
              <button
                ref={modelRef}
                type="button"
                aria-expanded={modelOpen}
                aria-label="Choose model"
                onClick={() => {
                  setPlusOpen(false)
                  setModelOpen((current) => !current)
                }}
                className={cn(
                  "order-3 flex h-7 shrink-0 items-center gap-1 px-1.5 text-xs font-medium text-foreground/70",
                  "outline-none transition-colors duration-150 hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                  pill ? "rounded-full" : "rounded-lg",
                )}
              >
                {model.label}
                <span className="text-muted-foreground">
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    size={11}
                    strokeWidth={2.4}
                  />
                </span>
              </button>
            )}

            {/* dictation */}
            {onDictate && (
              <button
                type="button"
                aria-label={listening ? "Stop dictation" : "Start dictation"}
                aria-pressed={listening}
                onClick={dictate}
                className={cn(
                  "order-4",
                  iconButton,
                  pill ? "rounded-full" : "rounded-lg",
                  expanded && "ml-auto",
                  listening &&
                    "bg-fern-100 text-fern-800 hover:bg-fern-100 hover:text-fern-800",
                )}
              >
                {listening ? (
                  <span className="flex h-3.5 items-center gap-[2.5px]">
                    {[0, 1, 2].map((bar) => (
                      <span
                        key={bar}
                        className="h-full w-[2.5px] rounded-full bg-current"
                        style={{
                          animation: `or-eq-bounce 900ms ease-in-out ${bar * 150}ms infinite`,
                        }}
                      />
                    ))}
                  </span>
                ) : (
                  <HugeiconsIcon icon={Mic01Icon} size={15} strokeWidth={2} />
                )}
              </button>
            )}

            {/* send — tactile square (round in the pill variant) */}
            <button
              type="button"
              aria-label="Send"
              disabled={!canSend}
              onClick={send}
              className={cn(
                "order-5 flex size-7 shrink-0 items-center justify-center",
                "outline-none transition-[background-color,color,transform] duration-200",
                "enabled:active:scale-[0.94] focus-visible:ring-2 focus-visible:ring-ring",
                pill ? "rounded-full" : "rounded-lg",
                expanded && !onDictate && "ml-auto",
                canSend
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <HugeiconsIcon icon={ArrowUp02Icon} size={16} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export { Beak, type BeakItem, type BeakModel, type BeakProps }
