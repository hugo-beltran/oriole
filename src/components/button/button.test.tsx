import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createRef } from "react"
import { describe, expect, it, vi } from "vitest"
import { renderWithAxe } from "../../../test/test-utils"
import { Button } from "./button"

describe("Button", () => {
  it("renders its children", async () => {
    renderWithAxe(<Button>Save</Button>)
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument()
  })

  it("fires onPress when clicked", async () => {
    const onPress = vi.fn()
    renderWithAxe(<Button onPress={onPress}>Save</Button>)
    await userEvent.click(screen.getByRole("button"))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it("does not fire onPress when disabled", async () => {
    const onPress = vi.fn()
    renderWithAxe(
      <Button onPress={onPress} isDisabled>
        Save
      </Button>,
    )
    await userEvent.click(screen.getByRole("button"))
    expect(onPress).not.toHaveBeenCalled()
    expect(screen.getByRole("button")).toBeDisabled()
  })

  it("merges a consumer className and resolves conflicts in its favor", () => {
    renderWithAxe(<Button className="h-12 tracking-wide">Save</Button>)
    const button = screen.getByRole("button")
    expect(button).toHaveClass("tracking-wide")
    expect(button).toHaveClass("h-12")
    expect(button).not.toHaveClass("h-9")
  })

  it("forwards its ref to the underlying DOM element", () => {
    const ref = createRef<HTMLButtonElement>()
    renderWithAxe(<Button ref={ref}>Save</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it("has no axe violations in default state", async () => {
    const { expectNoViolations } = renderWithAxe(<Button>Save</Button>)
    await expectNoViolations()
  })

  it("has no axe violations when disabled", async () => {
    const { expectNoViolations } = renderWithAxe(
      <Button isDisabled>Save</Button>,
    )
    await expectNoViolations()
  })
})
