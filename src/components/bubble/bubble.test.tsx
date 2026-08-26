import { screen } from "@testing-library/react"
import { createRef } from "react"
import { describe, expect, it } from "vitest"
import { renderWithAxe } from "../../../test/test-utils"
import { Bubble } from "./bubble"

describe("Bubble", () => {
  it("renders its children", () => {
    renderWithAxe(<Bubble>Hello there</Bubble>)
    expect(screen.getByText("Hello there")).toBeInTheDocument()
  })

  it("defaults to the system side, aligned left on light driftwood", () => {
    renderWithAxe(<Bubble data-testid="bubble">Reply</Bubble>)
    const bubble = screen.getByTestId("bubble")
    expect(bubble).toHaveClass("self-start")
    expect(bubble).toHaveClass("bg-driftwood-100/90")
  })

  it("renders the user side aligned right on nectarine", () => {
    renderWithAxe(
      <Bubble data-testid="bubble" from="user">
        Question
      </Bubble>,
    )
    const bubble = screen.getByTestId("bubble")
    expect(bubble).toHaveClass("self-end")
    expect(bubble).toHaveClass("bg-nectarine-300/90")
  })

  it("overrides the fill with the plum color on either side", () => {
    renderWithAxe(
      <Bubble data-testid="bubble" from="user" color="plum">
        Question
      </Bubble>,
    )
    const bubble = screen.getByTestId("bubble")
    expect(bubble).toHaveClass("self-end")
    expect(bubble).toHaveClass("bg-plum-300/90")
    expect(bubble).not.toHaveClass("bg-nectarine-300/90")
  })

  it("tightens the bottom corner nearest the speaker as the tail", () => {
    renderWithAxe(
      <>
        <Bubble data-testid="user" from="user">
          Question
        </Bubble>
        <Bubble data-testid="system" from="system">
          Answer
        </Bubble>
      </>,
    )
    expect(screen.getByTestId("user")).toHaveClass("rounded-br-sm")
    expect(screen.getByTestId("system")).toHaveClass("rounded-bl-sm")
  })

  it("keeps the corner full-radius with tail={false}", () => {
    renderWithAxe(
      <Bubble data-testid="bubble" from="user" tail={false}>
        Follow-up
      </Bubble>,
    )
    expect(screen.getByTestId("bubble")).not.toHaveClass("rounded-br-sm")
  })

  it("merges a consumer className and resolves conflicts in its favor", () => {
    renderWithAxe(
      <Bubble data-testid="bubble" className="max-w-full font-medium">
        Wide
      </Bubble>,
    )
    const bubble = screen.getByTestId("bubble")
    expect(bubble).toHaveClass("font-medium")
    expect(bubble).toHaveClass("max-w-full")
    expect(bubble).not.toHaveClass("max-w-[75%]")
  })

  it("forwards its ref to the underlying DOM element", () => {
    const ref = createRef<HTMLDivElement>()
    renderWithAxe(<Bubble ref={ref}>Hello</Bubble>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it("has no axe violations on any side or color", async () => {
    const { expectNoViolations } = renderWithAxe(
      <div className="flex flex-col gap-2">
        <Bubble from="user">Question</Bubble>
        <Bubble from="system">Answer</Bubble>
        <Bubble from="user" color="plum">
          Accent
        </Bubble>
      </div>,
    )
    await expectNoViolations()
  })
})
