import { render } from "@testing-library/react"
import { axe } from "jest-axe"
import type { ReactElement } from "react"
import { expect } from "vitest"

export async function expectNoViolations(container: Element) {
  expect(await axe(container)).toHaveNoViolations()
}

export function renderWithAxe(ui: ReactElement) {
  const result = render(ui)
  return {
    ...result,
    expectNoViolations: () => expectNoViolations(result.container),
  }
}
