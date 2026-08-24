import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { renderWithAxe } from "../../../test/test-utils"
import {
  Rail,
  RailBranch,
  RailFlock,
  RailItem,
  RailNest,
  RailNestItem,
} from "./rail"

function demoRail(props?: { onSelect?: (id: unknown) => void }) {
  return (
    <Rail data-testid="rail">
      <RailNest
        label="Creamery Ops"
        selectedId="creamery"
        onSelect={props?.onSelect}
      >
        <RailNestItem id="creamery">Creamery Ops</RailNestItem>
        <RailNestItem id="gelato">Gelato Lab</RailNestItem>
      </RailNest>
      <RailFlock>
        <RailItem shortcut="⌘N">New chat</RailItem>
        <RailItem>Home</RailItem>
        <RailItem detail="3/10">Invite users</RailItem>
      </RailFlock>
      <RailBranch title="Chats" searchable>
        <RailItem>Supplier records</RailItem>
        <RailItem>Flavor page ticket</RailItem>
        <RailItem>Off-board a supplier</RailItem>
      </RailBranch>
    </Rail>
  )
}

describe("Rail", () => {
  it("renders nav rows, details, and shortcuts without a container surface", () => {
    renderWithAxe(demoRail())
    expect(screen.getByRole("button", { name: "New chat" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Home" })).toBeInTheDocument()
    expect(screen.getByText("3/10")).toBeInTheDocument()
    expect(screen.getByText("⌘N")).toBeInTheDocument()
    const rail = screen.getByTestId("rail")
    expect(rail.className).not.toMatch(/bg-/)
  })

  it("collapses to an icon strip and expands back", async () => {
    renderWithAxe(demoRail())
    await userEvent.click(screen.getByRole("button", { name: "Collapse rail" }))
    const rail = screen.getByTestId("rail")
    expect(rail).toHaveAttribute("data-collapsed")
    expect(rail).toHaveClass("w-14")
    expect(screen.queryByText("⌘N")).not.toBeInTheDocument()
    expect(screen.queryByText("Chats")).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Expand rail" }))
    expect(rail).not.toHaveAttribute("data-collapsed")
    expect(screen.getByText("Chats")).toBeInTheDocument()
  })

  it("switches nests through the tenant menu", async () => {
    const onSelect = vi.fn()
    renderWithAxe(demoRail({ onSelect }))
    await userEvent.click(screen.getByRole("button", { name: /Creamery Ops/ }))
    const menu = await screen.findByRole("menu")
    expect(within(menu).getByText("Gelato Lab")).toBeInTheDocument()
    await userEvent.click(within(menu).getByText("Gelato Lab"))
    expect(onSelect).toHaveBeenCalledWith("gelato")
  })

  it("folds and unfolds a branch like an accordion", async () => {
    renderWithAxe(demoRail())
    const header = screen.getByRole("button", { name: "Chats" })
    expect(header).toHaveAttribute("aria-expanded", "true")
    await userEvent.click(header)
    expect(header).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByText("Supplier records")).not.toBeInTheDocument()
    await userEvent.click(header)
    expect(screen.getByText("Supplier records")).toBeInTheDocument()
  })

  it("filters branch items through search", async () => {
    renderWithAxe(demoRail())
    await userEvent.click(screen.getByRole("button", { name: "Search chats" }))
    const input = screen.getByPlaceholderText("Search chats")
    await userEvent.type(input, "sup")
    expect(screen.getByText("Supplier records")).toBeInTheDocument()
    expect(screen.getByText("Off-board a supplier")).toBeInTheDocument()
    expect(screen.queryByText("Flavor page ticket")).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Close search" }))
    expect(screen.getByText("Flavor page ticket")).toBeInTheDocument()
  })

  it("fires onPress on a row and merges consumer classNames", async () => {
    const onPress = vi.fn()
    renderWithAxe(
      <Rail>
        <RailFlock>
          <RailItem onPress={onPress} className="h-10">
            Home
          </RailItem>
        </RailFlock>
      </Rail>,
    )
    const row = screen.getByRole("button", { name: "Home" })
    await userEvent.click(row)
    expect(onPress).toHaveBeenCalledTimes(1)
    expect(row).toHaveClass("h-10")
    expect(row).not.toHaveClass("h-8")
  })

  it("has no axe violations", async () => {
    const { expectNoViolations } = renderWithAxe(demoRail())
    await expectNoViolations()
  })
})
