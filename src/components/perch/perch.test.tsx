import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { renderWithAxe } from "../../../test/test-utils"
import { Perch } from "./perch"

describe("Perch", () => {
  it("renders children above the canvas surface", () => {
    renderWithAxe(
      <Perch data-testid="perch">
        <p>Floating content</p>
      </Perch>,
    )
    expect(screen.getByText("Floating content")).toBeInTheDocument()
    expect(screen.getByTestId("perch")).toHaveClass("backdrop-blur-xl")
  })

  it("merges consumer className and resolves conflicts", () => {
    renderWithAxe(
      <Perch data-testid="perch" className="rounded-none">
        x
      </Perch>,
    )
    const perch = screen.getByTestId("perch")
    expect(perch).toHaveClass("rounded-none")
    expect(perch).not.toHaveClass("rounded-2xl")
  })
})
