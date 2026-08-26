import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { renderWithAxe } from "../../../test/test-utils"
import {
  Nest,
  NestChat,
  NestGroup,
  NestHead,
  NestLink,
  NestProvider,
  NestToggle,
} from "./nest"

// The toggle lives outside the Nest (e.g. on the Perch), wired through NestProvider.
function demoNest() {
  return (
    <NestProvider>
      <NestToggle />
      <Nest data-testid="nest">
        <NestHead label="Oriole" icon={<svg aria-hidden="true" />} />
        <NestGroup hideOnCollapse={false}>
          <NestLink icon={<svg aria-hidden="true" />} shortcut="⌘N">
            New chat
          </NestLink>
          <NestLink icon={<svg aria-hidden="true" />}>Home</NestLink>
          <NestLink icon={<svg aria-hidden="true" />} detail="3/10">
            Invite users
          </NestLink>
        </NestGroup>
        <NestGroup title="Chats" searchable>
          <NestChat>Supplier records</NestChat>
          <NestChat>Flavor page ticket</NestChat>
          <NestChat>Off-board a supplier</NestChat>
        </NestGroup>
      </Nest>
    </NestProvider>
  )
}

describe("Nest", () => {
  it("renders nav rows, details, and shortcuts without a container surface", () => {
    renderWithAxe(demoNest())
    expect(screen.getByRole("button", { name: "New chat" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Home" })).toBeInTheDocument()
    expect(screen.getByText("3/10")).toBeInTheDocument()
    expect(screen.getByText("⌘N")).toBeInTheDocument()
    const nest = screen.getByTestId("nest")
    expect(nest.className).not.toMatch(/bg-/)
  })

  it("collapses to an icon strip and expands back", async () => {
    renderWithAxe(demoNest())
    await userEvent.click(
      screen.getByRole("button", { name: "Collapse sidebar" }),
    )
    const nest = screen.getByTestId("nest")
    expect(nest).toHaveAttribute("data-collapsed")
    expect(nest).toHaveClass("w-14")
    // row copy stays mounted — the width clip sweeps over it, shadcn-style
    expect(screen.getByText("⌘N")).toBeInTheDocument()
    // rows are full-width clips that auto-shrink around their mandatory icon
    expect(screen.getByRole("button", { name: "Home" })).toHaveClass(
      "w-full",
      "min-w-0",
      "overflow-hidden",
    )
    // shortcut hints and detail stats carry the collapse fade
    expect(screen.getByText("⌘N")).toHaveClass(
      "group-data-collapsed/nest:opacity-0",
    )
    expect(screen.getByText("3/10")).toHaveClass(
      "group-data-collapsed/nest:opacity-0",
    )
    // the titled group is faded and inert: invisible, unfocusable, gone from a11y
    expect(screen.getByText("Chats").closest("[inert]")).not.toBeNull()
    // the icon-row group opted out of hiding, so it survives the collapse
    expect(screen.getByText("Home").closest("[inert]")).toBeNull()
    await userEvent.click(
      screen.getByRole("button", { name: "Expand sidebar" }),
    )
    expect(nest).not.toHaveAttribute("data-collapsed")
    expect(screen.getByText("Chats").closest("[inert]")).toBeNull()
  })

  it("shows the app branding in the head and fades it out collapsed", async () => {
    renderWithAxe(demoNest())
    expect(screen.getByText("Oriole")).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Oriole" }),
    ).not.toBeInTheDocument()
    await userEvent.click(
      screen.getByRole("button", { name: "Collapse sidebar" }),
    )
    const brand = screen.getByText("Oriole").closest("[aria-hidden]")
    expect(brand).toHaveClass("opacity-0")
  })

  it("renders previous chats as text-only rows that retire on collapse", async () => {
    renderWithAxe(demoNest())
    const chat = screen.getByRole("button", { name: "Supplier records" })
    expect(chat.querySelector("svg")).toBeNull()
    // no icon to shrink around — the row fades with the collapse instead
    expect(chat).toHaveClass("group-data-collapsed/nest:opacity-0")
    await userEvent.click(
      screen.getByRole("button", { name: "Collapse sidebar" }),
    )
    // and leaves the tab order while the nest is collapsed
    expect(chat).toHaveAttribute("disabled")
  })

  it("folds and unfolds a titled group like an accordion", async () => {
    renderWithAxe(demoNest())
    const header = screen.getByRole("button", { name: "Chats" })
    expect(header).toHaveAttribute("aria-expanded", "true")
    await userEvent.click(header)
    expect(header).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByText("Supplier records")).not.toBeInTheDocument()
    await userEvent.click(header)
    expect(screen.getByText("Supplier records")).toBeInTheDocument()
  })

  it("filters group links through search", async () => {
    renderWithAxe(demoNest())
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
      <Nest>
        <NestGroup>
          <NestLink
            icon={<svg aria-hidden="true" />}
            onPress={onPress}
            className="h-10"
          >
            Home
          </NestLink>
        </NestGroup>
      </Nest>,
    )
    const row = screen.getByRole("button", { name: "Home" })
    await userEvent.click(row)
    expect(onPress).toHaveBeenCalledTimes(1)
    expect(row).toHaveClass("h-10")
    expect(row).not.toHaveClass("h-8")
  })

  it("has no axe violations", async () => {
    const { expectNoViolations } = renderWithAxe(demoNest())
    await expectNoViolations()
  })
})
