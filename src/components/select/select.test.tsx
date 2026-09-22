import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Label } from "react-aria-components"
import { describe, expect, it, vi } from "vitest"
import { expectNoViolations, renderWithAxe } from "../../../test/test-utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select"
import styles from "./select.module.css"

function DemoSelect(props: {
  onSelectionChange?: (key: React.Key | null) => void
}) {
  return (
    <Select onSelectionChange={props.onSelectionChange}>
      <Label>Fruit</Label>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem id="apple">Apple</SelectItem>
        <SelectItem id="banana">Banana</SelectItem>
        <SelectItem id="cherry" isDisabled>
          Cherry
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

describe("Select", () => {
  it("opens the listbox and shows items", async () => {
    renderWithAxe(<DemoSelect />)
    await userEvent.click(screen.getByRole("button", { name: /fruit/i }))
    expect(screen.getByRole("listbox")).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Apple" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Banana" })).toBeInTheDocument()
  })

  it("selects an option and reflects it in the trigger", async () => {
    const onSelectionChange = vi.fn()
    renderWithAxe(<DemoSelect onSelectionChange={onSelectionChange} />)
    await userEvent.click(screen.getByRole("button", { name: /fruit/i }))
    await userEvent.click(screen.getByRole("option", { name: "Banana" }))
    expect(onSelectionChange).toHaveBeenCalledWith("banana")
    expect(screen.getByRole("button", { name: /banana/i })).toBeInTheDocument()
  })

  it("does not select disabled items", async () => {
    const onSelectionChange = vi.fn()
    renderWithAxe(<DemoSelect onSelectionChange={onSelectionChange} />)
    await userEvent.click(screen.getByRole("button", { name: /fruit/i }))
    await userEvent.click(screen.getByRole("option", { name: "Cherry" }))
    expect(onSelectionChange).not.toHaveBeenCalled()
  })

  it("supports keyboard navigation", async () => {
    renderWithAxe(<DemoSelect />)
    const trigger = screen.getByRole("button", { name: /fruit/i })
    trigger.focus()
    await userEvent.keyboard("{Enter}{ArrowDown}{Enter}")
    expect(screen.getByRole("button", { name: /banana/i })).toBeInTheDocument()
  })

  it("appends consumer className on the trigger", async () => {
    renderWithAxe(
      <Select>
        <Label>Fruit</Label>
        <SelectTrigger className="consumer">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem id="apple">Apple</SelectItem>
        </SelectContent>
      </Select>,
    )
    const trigger = screen.getByRole("button", { name: /fruit/i })
    expect(trigger).toHaveClass(styles.trigger, "consumer")
  })

  it("has no axe violations closed", async () => {
    const { expectNoViolations } = renderWithAxe(<DemoSelect />)
    await expectNoViolations()
  })

  it("has no axe violations open", async () => {
    renderWithAxe(<DemoSelect />)
    await userEvent.click(screen.getByRole("button", { name: /fruit/i }))
    screen.getByRole("listbox")
    await expectNoViolations(document.body)
  })
})
