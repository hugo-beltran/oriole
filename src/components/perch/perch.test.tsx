import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { renderWithAxe } from "../../../test/test-utils"
import { Perch } from "./perch"
import styles from "./perch.module.css"

describe("Perch", () => {
  it("renders children above the canvas surface", () => {
    renderWithAxe(
      <Perch data-testid="perch">
        <p>Floating content</p>
      </Perch>,
    )
    expect(screen.getByText("Floating content")).toBeInTheDocument()
    expect(screen.getByTestId("perch")).toHaveClass(styles.perch)
  })

  it("appends consumer className after its own", () => {
    renderWithAxe(
      <Perch data-testid="perch" className="consumer">
        x
      </Perch>,
    )
    expect(screen.getByTestId("perch")).toHaveClass(styles.perch, "consumer")
  })
})
