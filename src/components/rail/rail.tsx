"use client";

import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  BirdIcon,
  Cancel01Icon,
  Search01Icon,
  SidebarLeftIcon,
  SidebarRightIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
} from "react";
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  type MenuItemProps as AriaMenuItemProps,
  MenuTrigger as AriaMenuTrigger,
  Popover as AriaPopover,
  type Key,
} from "react-aria-components";

import { cn } from "../../lib/utils.js";

const RailContext = createContext<{
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}>({ collapsed: false, setCollapsed: () => {} });

const RailBranchContext = createContext<{ query: string }>({ query: "" });

const chromeButton = [
  "flex shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors",
  "outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring",
  "data-[hovered]:bg-card/70 data-[hovered]:text-foreground data-[pressed]:bg-card",
];

interface RailProps extends ComponentProps<"aside"> {
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

/**
 * Rail — the strip of navigation beside the Perch (a rail is a bird, too).
 * The container has no surface of its own; over the Canvas gradient it reads
 * as a column of birds, not a panel. Collapsible to an icon-only strip.
 */
function Rail({
  className,
  defaultCollapsed = false,
  collapsed: collapsedProp,
  onCollapsedChange,
  children,
  ...props
}: RailProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const collapsed = collapsedProp ?? internalCollapsed;
  const setCollapsed = (next: boolean) => {
    if (collapsedProp === undefined) setInternalCollapsed(next);
    onCollapsedChange?.(next);
  };
  return (
    <RailContext.Provider value={{ collapsed, setCollapsed }}>
      <aside
        data-collapsed={collapsed || undefined}
        className={cn(
          "isolate flex shrink-0 flex-col overflow-hidden transition-[width] duration-300",
          collapsed ? "w-14" : "w-56",
          className,
        )}
        {...props}
      >
        {children}
      </aside>
    </RailContext.Provider>
  );
}

interface RailNestProps {
  /** Name of the nest (tenant / workspace) currently occupied. */
  label: string;
  /** Logo for the nest; defaults to a bird. */
  icon?: ReactNode;
  /** RailNestItem elements — the nests available to fly to. */
  children?: ReactNode;
  selectedId?: Key;
  onSelect?: (id: Key) => void;
  className?: string;
}

/**
 * RailNest — the tenant switcher. Every tenant is a nest; the menu lists the
 * nests the user can fly to. Renders the Rail's header row, including the
 * collapse toggle.
 */
function RailNest({
  label,
  icon,
  children,
  selectedId,
  onSelect,
  className,
}: RailNestProps) {
  const { collapsed, setCollapsed } = useContext(RailContext);
  return (
    <div
      className={cn(
        "mb-2 flex shrink-0 gap-1 px-2 pt-2",
        collapsed ? "flex-col items-center" : "items-center",
        className,
      )}
    >
      <AriaMenuTrigger>
        <AriaButton
          aria-label={collapsed ? label : undefined}
          className={cn(
            "flex h-9 items-center rounded-xl text-sm font-medium text-foreground",
            "border border-driftwood-50/50 bg-card/60 shadow-sm ring-1 ring-driftwood-800/10 backdrop-blur-xl",
            "outline-none data-focus-visible:ring-2 data-focus-visible:ring-ring",
            "data-hovered:bg-card/80 data-pressed:bg-card",
            collapsed ? "w-9 justify-center" : "min-w-0 flex-1 gap-1.5 px-2",
          )}
        >
          {collapsed ? null : (
            <>
              <span className="min-w-0 flex-1 truncate text-left">{label}</span>
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                size={14}
                className="shrink-0 text-muted-foreground"
              />
            </>
          )}
        </AriaButton>
        <AriaPopover
          className={cn(
            "min-w-(--trigger-width) overflow-auto rounded-xl border border-driftwood-50/50 bg-popover/80 p-1 text-popover-foreground shadow-xl ring-1 ring-driftwood-800/10 backdrop-blur-xl",
            "data-[entering]:animate-in data-[entering]:fade-in-0 data-[exiting]:animate-out data-[exiting]:fade-out-0",
          )}
        >
          <AriaMenu
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={selectedId != null ? [selectedId] : []}
            onSelectionChange={(keys) => {
              if (keys === "all") return;
              const id = [...keys][0];
              if (id != null) onSelect?.(id);
            }}
            className="outline-none"
          >
            {children}
          </AriaMenu>
        </AriaPopover>
      </AriaMenuTrigger>
      <AriaButton
        aria-label={collapsed ? "Expand rail" : "Collapse rail"}
        onPress={() => setCollapsed(!collapsed)}
        className={cn(chromeButton, collapsed ? "size-9" : "size-8")}
      >
        <HugeiconsIcon
          icon={collapsed ? SidebarRightIcon : SidebarLeftIcon}
          size={16}
        />
      </AriaButton>
    </div>
  );
}

interface RailNestItemProps extends Omit<
  AriaMenuItemProps,
  "children" | "className"
> {
  className?: string;
  children?: ReactNode;
}

function RailNestItem({ className, children, ...props }: RailNestItemProps) {
  return (
    <AriaMenuItem
      className={cn(
        "flex cursor-default select-none items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-none",
        "data-[focused]:bg-accent data-[focused]:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      textValue={typeof children === "string" ? children : props.textValue}
      {...props}
    >
      {({ isSelected }) => (
        <>
          <span className="min-w-0 flex-1 truncate">{children}</span>
          {isSelected ? (
            <HugeiconsIcon icon={Tick02Icon} size={14} className="shrink-0" />
          ) : null}
        </>
      )}
    </AriaMenuItem>
  );
}

/**
 * RailFlock — a group of RailItems that share one gliding hover highlight:
 * the flock moves together instead of each row lighting up on its own.
 */
function RailFlock({ className, children, ...props }: ComponentProps<"div">) {
  const listRef = useRef<HTMLDivElement>(null);
  const [glide, setGlide] = useState<{ top: number; height: number } | null>(
    null,
  );
  const [gliding, setGliding] = useState(false);

  function handleMouseOver(event: MouseEvent<HTMLDivElement>) {
    const row = (event.target as HTMLElement).closest("[data-rail-row]");
    if (!(row instanceof HTMLElement) || !listRef.current?.contains(row))
      return;
    const rowRect = row.getBoundingClientRect();
    const listRect = listRef.current.getBoundingClientRect();
    setGlide({ top: rowRect.top - listRect.top, height: rowRect.height });
    setGliding(true);
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: mouse-only decorative highlight; rows keep their own focus states
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: mouse-only decorative highlight; rows keep their own focus states
    <div
      ref={listRef}
      onMouseOver={handleMouseOver}
      onMouseLeave={() => setGliding(false)}
      className={cn("relative flex flex-col gap-px", className)}
      {...props}
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
            ? { transform: `translateY(${glide.top}px)`, height: glide.height }
            : { height: 0 }
        }
      />
      {children}
    </div>
  );
}

interface RailItemProps extends AriaButtonProps {
  className?: string;
  /** The row's label. */
  children?: ReactNode;
  icon?: ReactNode;
  /** Right-aligned detail, e.g. a count like "3/10". */
  detail?: ReactNode;
  /** Right-aligned keyboard hint, e.g. "⌘N". */
  shortcut?: string;
  /** Plain-text label used for search filtering and the collapsed state. */
  textValue?: string;
  ref?: Ref<HTMLButtonElement>;
}

function RailItem({
  className,
  children,
  icon,
  detail,
  shortcut,
  textValue,
  ...props
}: RailItemProps) {
  const { collapsed } = useContext(RailContext);
  const { query } = useContext(RailBranchContext);
  const label = textValue ?? (typeof children === "string" ? children : "");
  if (query && !label.toLowerCase().includes(query.toLowerCase())) return null;
  return (
    <AriaButton
      data-rail-row
      aria-label={label || undefined}
      className={cn(
        "relative z-10 mx-2 flex h-8 shrink-0 items-center rounded-lg text-sm text-foreground/80 transition-colors",
        "outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring",
        "data-[hovered]:text-foreground data-[pressed]:bg-card/80",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        collapsed ? "justify-center" : "px-2",
        className,
      )}
      {...props}
    >
      {icon ? (
        <span className="flex size-5 shrink-0 items-center justify-center text-muted-foreground">
          {icon}
        </span>
      ) : null}
      {collapsed ? null : (
        <>
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-left",
              icon && "ml-1.5",
            )}
          >
            {children}
          </span>
          {detail != null ? (
            <span className="ml-2 shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
              {detail}
            </span>
          ) : null}
          {shortcut ? (
            <kbd className="ml-2 shrink-0 rounded border border-driftwood-50/50 bg-card/60 px-1 font-sans text-[10px] text-muted-foreground">
              {shortcut}
            </kbd>
          ) : null}
        </>
      )}
    </AriaButton>
  );
}

interface RailBranchProps {
  /** Section title, e.g. "Chats". */
  title: string;
  /** Show a search control that live-filters the branch's items. */
  searchable?: boolean;
  defaultOpen?: boolean;
  className?: string;
  children?: ReactNode;
}

/**
 * RailBranch — a collapsible section of the Rail; its items perch on the
 * branch. Optionally searchable: the search control filters items by their
 * label.
 */
function RailBranch({
  title,
  searchable = false,
  defaultOpen = true,
  className,
  children,
}: RailBranchProps) {
  const { collapsed } = useContext(RailContext);
  const [open, setOpen] = useState(defaultOpen);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (searching) inputRef.current?.focus();
  }, [searching]);

  function closeSearch() {
    setSearching(false);
    setQuery("");
  }

  if (collapsed) return null;
  return (
    <div className={cn("mt-3 flex min-h-0 flex-1 flex-col", className)}>
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
                if (event.key === "Escape") closeSearch();
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
                  setSearching(true);
                  setOpen(true);
                }}
                className={cn(chromeButton, "absolute right-0 top-0 size-8")}
              >
                <HugeiconsIcon icon={Search01Icon} size={14} />
              </AriaButton>
            ) : null}
          </>
        )}
      </div>
      {open ? (
        <div id={panelId} className="min-h-0 flex-1 overflow-y-auto">
          <RailBranchContext.Provider value={{ query }}>
            <RailFlock>{children}</RailFlock>
          </RailBranchContext.Provider>
        </div>
      ) : null}
    </div>
  );
}

export {
  Rail,
  RailBranch,
  type RailBranchProps,
  RailFlock,
  RailItem,
  type RailItemProps,
  RailNest,
  RailNestItem,
  type RailNestItemProps,
  type RailNestProps,
  type RailProps,
};
