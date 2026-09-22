import { Home01Icon, SourceCodeIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
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
import styles from "./docs-shell.module.css"

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
      className={pathname === page.to ? styles.active : undefined}
      onPress={() => navigate({ to: page.to })}
    >
      {page.label}
    </NestChat>
  )

  return (
    <NestProvider>
      <div className={styles.shell}>
        <Nest className={styles.nest}>
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
          <NestGroup title="Foundations" className={styles.flexNone}>
            {foundations.map(row)}
          </NestGroup>
          <NestGroup title="Components" searchable>
            {components.map(row)}
          </NestGroup>
          {/* the machine-readable reference: point an agent here */}
          <NestGroup title="Reference" className={styles.flexNone}>
            <NestLink
              icon={<HugeiconsIcon icon={SourceCodeIcon} size={18} />}
              onPress={() =>
                window.open(`${import.meta.env.BASE_URL}llms.txt`, "_blank")
              }
            >
              For agents · llms.txt
            </NestLink>
          </NestGroup>
        </Nest>

        <Perch className={styles.perch}>
          <NestToggle className={styles.toggle} />
          <div className={styles.content}>
            <Outlet />
          </div>
        </Perch>
      </div>
    </NestProvider>
  )
}
