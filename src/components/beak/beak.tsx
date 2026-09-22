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
import { clsx } from "clsx"
import {
  type ReactNode,
  type Ref,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import styles from "./beak.module.css"

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
  /* Bumped whenever the controls row resizes, so the inline/expanded
   * measurement reruns — layout isn't settled on first mount, and the
   * container can resize later (window, collapsing sidebars). */
  const [resizeTick, setResizeTick] = useState(0)
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
  // biome-ignore lint/correctness/useExhaustiveDependencies: resizeTick isn't read — it re-triggers the measurement when the row resizes
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
  }, [draft, expanded, model, onDictate, resizeTick])

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(() => setResizeTick((t) => t + 1))
    observer.observe(controls)
    return () => observer.disconnect()
  }, [])

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
    <div
      ref={ref}
      data-beak
      className={clsx(styles.beak, pill && styles.pill, className)}
    >
      {/* the composer is the anchor — menus grow up from its top edge */}
      <div ref={anchorRef} className={styles.anchor}>
        {/* ── @ / slash menu ─────────────────────────────── */}
        {menuOpen && (
          <div
            className={clsx(styles.tokenMenu, styles.menuSurface, styles.popIn)}
            style={{ transformOrigin: "bottom center" }}
          >
            {rows.length > 0 ? (
              <div
                role="listbox"
                aria-label={menu === "at" ? "Sources" : "Commands"}
                onMouseLeave={() => setEngaged(false)}
                className={styles.list}
              >
                {/* single gliding highlight — appears once a row is engaged */}
                <span
                  aria-hidden
                  className={styles.glide}
                  style={{
                    top: rowBox?.top ?? 0,
                    height: rowBox?.height ?? 0,
                    opacity: rowBox && engaged ? 1 : 0,
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
                    className={styles.row}
                  >
                    {row.icon && (
                      <span className={styles.rowIcon}>{row.icon}</span>
                    )}
                    <span className={styles.rowLabel}>
                      {menu === "slash" ? `/${row.label}` : row.label}
                    </span>
                    <span className={styles.rowDescription}>
                      {row.description}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className={styles.empty}>No matches for “{query}”</div>
            )}
            <div className={styles.hint}>
              {menu === "at"
                ? "Type to search sources & files"
                : "Type to search commands"}
            </div>
          </div>
        )}

        {/* ── model menu ─────────────────────────────────── */}
        {modelOpen && models && (
          <div
            className={clsx(styles.modelMenu, styles.menuSurface, styles.popIn)}
            style={{
              left: modelMenu.left,
              bottom: modelMenu.bottom,
              transformOrigin: "bottom left",
            }}
          >
            <div
              role="listbox"
              aria-label="Models"
              onMouseLeave={() => setModelHovered(null)}
              className={styles.list}
            >
              <span
                aria-hidden
                className={styles.glide}
                style={{
                  top: modelBox?.top ?? 0,
                  height: modelBox?.height ?? 0,
                  opacity: modelBox && modelHovered !== null ? 1 : 0,
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
                  className={styles.modelRow}
                >
                  <span className={styles.modelLabel}>{candidate.label}</span>
                  <span className={styles.modelTag}>{candidate.tag}</span>
                  <span
                    className={clsx(
                      styles.modelCheck,
                      candidate.id !== model?.id && styles.hidden,
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
          className={clsx(
            styles.composer,
            (attachments.length > 0 || expanded) && styles.grown,
            isDisabled && styles.disabled,
          )}
        >
          {/* mirrors the draft so wrapping can be detected before it happens */}
          <span ref={measureRef} aria-hidden className={styles.measure}>
            {draft}
          </span>

          {attachments.length > 0 && (
            <div className={styles.attachments}>
              {attachments.map((file, index) => (
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: attachments are positional — removal is by index and names may repeat
                  key={`${file}-${index}`}
                  className={clsx(styles.chip, styles.popIn)}
                >
                  <HugeiconsIcon icon={File01Icon} size={12} />
                  <span className={styles.chipName}>{file}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${file}`}
                    onClick={() => onAttachmentRemove?.(index)}
                    className={styles.chipRemove}
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

          <div ref={controlsRef} className={styles.controls}>
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
                className={clsx(
                  styles.iconButton,
                  styles.plus,
                  plusOpen && styles.engaged,
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
              className={clsx(styles.input, expanded && styles.inputExpanded)}
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
                className={styles.modelTrigger}
              >
                {model.label}
                <span className={styles.modelCaret}>
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
                className={clsx(
                  styles.iconButton,
                  styles.mic,
                  expanded && styles.pushRight,
                  listening && styles.listening,
                )}
              >
                {listening ? (
                  <span className={styles.eq}>
                    {[0, 1, 2].map((bar) => (
                      <span
                        key={bar}
                        className={styles.eqBar}
                        style={{ animationDelay: `${bar * 150}ms` }}
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
              className={clsx(
                styles.send,
                expanded && !onDictate && styles.pushRight,
                canSend ? styles.sendReady : styles.sendIdle,
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
