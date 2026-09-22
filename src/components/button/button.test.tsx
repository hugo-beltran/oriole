import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createRef } from "react"
import { describe, expect, it, vi } from "vitest"
import { renderWithAxe } from "../../../test/test-utils"
import { Button } from "./button"
import styles from "./button.module.css"

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

  it("applies the default variant and size, then the consumer className", () => {
    renderWithAxe(<Button className="consumer">Save</Button>)
    expect(screen.getByRole("button")).toHaveClass(
      styles.button,
      styles.default,
      styles.md,
      "consumer",
    )
  })

  it("switches variant and size classes", () => {
    renderWithAxe(
      <Button variant="outline" size="sm">
        Save
      </Button>,
    )
    const button = screen.getByRole("button")
    expect(button).toHaveClass(styles.outline, styles.sm)
    expect(button).not.toHaveClass(styles.default, styles.md)
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
