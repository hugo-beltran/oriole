import { Home01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  cn,
  Nest,
  NestChat,
  NestGroup,
  NestHead,
  NestLink,
  NestProvider,
  NestToggle,
  Perch,
} from "@mycodemedia/oriole"
import { Outlet, useLocation, useNavigate } from "@tanstack/react-router"
import OrioleMark from "../assets/oriole-wordmark.svg?react"

type DocsPage = { label: string; to: string }

const foundations: DocsPage[] = [{ label: "Colors", to: "/foundations/colors" }]

const components: DocsPage[] = [
  { label: "Beak", to: "/components/beak" },
  { label: "Bubble", to: "/components/bubble" },
  { label: "Button", to: "/components/button" },
  { label: "Nest", to: "/components/nest" },
  { label: "Select", to: "/components/select" },
]

/**
 * DocsShell — the layout for the docs routes: a Nest for hopping between
 * foundations and components, and the Perch as the single floating surface
 * the pages render on. Mirrors the chat demo's shell so the showcase eats
 * its own cooking on both screens.
 */
export function DocsShell() {
  const navigate = useNavigate()
  const pathname = useLocation({ select: (location) => location.pathname })

  const row = (page: DocsPage) => (
    <NestChat
      key={page.to}
      className={cn(pathname === page.to && "bg-card/80 text-foreground")}
      onPress={() => navigate({ to: page.to })}
    >
      {page.label}
    </NestChat>
  )

  return (
    <NestProvider>
      <div className="flex h-[calc(100vh-8rem)] items-start gap-2">
        <Nest className="h-full">
          <NestHead>
            <OrioleMark aria-hidden />
          </NestHead>
          <NestGroup hideOnCollapse={false}>
            <NestLink
              icon={<HugeiconsIcon icon={Home01Icon} size={18} />}
              onPress={() => navigate({ to: "/" })}
            >
              Chat demo
            </NestLink>
          </NestGroup>
          {/* flex-none: only the components list should absorb leftover height */}
          <NestGroup title="Foundations" className="flex-none">
            {foundations.map(row)}
          </NestGroup>
          <NestGroup title="Components" searchable>
            {components.map(row)}
          </NestGroup>
        </Nest>

        <Perch className="relative flex h-full min-w-0 flex-1">
          <NestToggle className="absolute left-2 top-2 z-10" />
          <div className="min-w-0 flex-1 overflow-y-auto py-8 ps-12 pe-8 scrollbar-track-transparent scrollbar-thumb-driftwood-300/50">
            <Outlet />
          </div>
        </Perch>
      </div>
    </NestProvider>
  )
}
