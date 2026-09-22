import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { renderWithAxe } from "../../../test/test-utils"
import { Canvas } from "./canvas"
import styles from "./canvas.module.css"

describe("Canvas", () => {
  it("renders children over the grain overlay", async () => {
    const { expectNoViolations } = renderWithAxe(
      <Canvas data-testid="canvas">
        <p>On the forest floor</p>
      </Canvas>,
    )
    expect(screen.getByText("On the forest floor")).toBeInTheDocument()
    const canvas = screen.getByText("On the forest floor").parentElement
    expect(canvas).toHaveClass(styles.canvas)
    expect(canvas).not.toHaveClass(styles.animated)
    expect(canvas?.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
    await expectNoViolations()
  })

  it("drifts the mesh when animated and appends consumer className", () => {
    renderWithAxe(
      <Canvas animated className="consumer">
        <p>x</p>
      </Canvas>,
    )
    const canvas = screen.getByText("x").parentElement
    expect(canvas).toHaveClass(styles.canvas, styles.animated, "consumer")
  })
})
