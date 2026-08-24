import { createRouter, RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { routeTree } from "./routeTree.gen"
import "./styles.css"

// Keep the router's basepath coupled to Vite's `base` so GitHub Pages
// deep links can't drift out of sync.
const router = createRouter({ routeTree, basepath: import.meta.env.BASE_URL })

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById("root")
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}
