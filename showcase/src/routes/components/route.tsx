import { createFileRoute } from "@tanstack/react-router"
import { DocsShell } from "../../lib/docs-shell"

export const Route = createFileRoute("/components")({
  component: DocsShell,
})
