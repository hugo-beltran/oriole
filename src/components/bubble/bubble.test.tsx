import { screen } from "@testing-library/react"
import { createRef } from "react"
import { describe, expect, it } from "vitest"
import { renderWithAxe } from "../../../test/test-utils"
import { Bubble } from "./bubble"
import styles from "./bubble.module.css"

describe("Bubble", () => {
  it("renders its children", () => {
    renderWithAxe(<Bubble>Hello there</Bubble>)
    expect(screen.getByText("Hello there")).toBeInTheDocument()
  })

  it("defaults to the system side, aligned left on driftwood", () => {
    renderWithAxe(<Bubble data-testid="bubble">Reply</Bubble>)
    const bubble = screen.getByTestId("bubble")
    expect(bubble).toHaveClass(styles.bubble, styles.system, styles.driftwood)
  })

  it("renders the user side aligned right in the fern voice", () => {
    renderWithAxe(
      <Bubble data-testid="bubble" from="user">
        Question
      </Bubble>,
    )
    const bubble = screen.getByTestId("bubble")
    expect(bubble).toHaveClass(styles.user, styles.fern)
  })

  it("overrides the fill with the plum color on either side", () => {
    renderWithAxe(
      <Bubble data-testid="bubble" from="user" color="plum">
        Question
      </Bubble>,
    )
    const bubble = screen.getByTestId("bubble")
    expect(bubble).toHaveClass(styles.user, styles.plum)
    expect(bubble).not.toHaveClass(styles.fern)
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
    expect(screen.getByTestId("user")).toHaveClass(styles.tailUser)
    expect(screen.getByTestId("user")).not.toHaveClass(styles.tailSystem)
    expect(screen.getByTestId("system")).toHaveClass(styles.tailSystem)
    expect(screen.getByTestId("system")).not.toHaveClass(styles.tailUser)
  })

  it("keeps the corner full-radius with tail={false}", () => {
    renderWithAxe(
      <Bubble data-testid="bubble" from="user" tail={false}>
        Follow-up
      </Bubble>,
    )
    expect(screen.getByTestId("bubble")).not.toHaveClass(styles.tailUser)
  })

  it("renders string children as Markdown when enabled", () => {
    renderWithAxe(
      <Bubble markdown>
        {"Two groups stand out:\n\n- **55+** households\n- `18–24` students"}
      </Bubble>,
    )
    expect(screen.getByRole("list")).toBeInTheDocument()
    const strong = screen.getByText("55+")
    expect(strong.tagName).toBe("STRONG")
    expect(screen.getByText("18–24").tagName).toBe("CODE")
    expect(screen.getByRole("list").parentElement).toHaveClass(styles.markdown)
  })

  it("treats markup as plain text without the markdown flag", () => {
    renderWithAxe(<Bubble>{"- **55+** households"}</Bubble>)
    expect(screen.queryByRole("list")).toBeNull()
    expect(screen.getByText("- **55+** households")).toBeInTheDocument()
  })

  it("passes non-string children through untouched alongside Markdown", () => {
    renderWithAxe(
      <Bubble markdown>
        {"A **formatted** reply"}
        <span data-testid="chip">chip</span>
      </Bubble>,
    )
    expect(screen.getByText("formatted").tagName).toBe("STRONG")
    expect(screen.getByTestId("chip")).toBeInTheDocument()
  })

  it("appends a consumer className after its own", () => {
    renderWithAxe(
      <Bubble data-testid="bubble" className="consumer">
        Wide
      </Bubble>,
    )
    expect(screen.getByTestId("bubble")).toHaveClass(styles.bubble, "consumer")
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
