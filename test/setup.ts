import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { toHaveNoViolations } from "jest-axe"
import { afterEach, expect } from "vitest"

expect.extend(toHaveNoViolations)

// RTL's automatic cleanup needs a global afterEach; we run without globals.
afterEach(cleanup)

// jsdom lacks these APIs; react-aria-components requires all three for
// overlays, selects, and responsive behavior.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver ??=
  ResizeObserverStub as unknown as typeof ResizeObserver

window.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
})) as typeof window.matchMedia

Element.prototype.scrollIntoView ??= () => {}
