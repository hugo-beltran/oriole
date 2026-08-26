import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createRef } from "react"
import { describe, expect, it, vi } from "vitest"
import { renderWithAxe } from "../../../test/test-utils"
import { Beak, type BeakItem, type BeakModel } from "./beak"

const sources: BeakItem[] = [
  { id: "panel", label: "Loyalty panel", description: "Household data" },
  { id: "web", label: "Web search", description: "Real-time info" },
]

const commands: BeakItem[] = [
  { id: "compare", label: "compare", description: "Side by side" },
  { id: "summarize", label: "summarize", description: "Digest the thread" },
]

const models: BeakModel[] = [
  { id: "oriole-2", label: "Oriole 2", tag: "Flagship" },
  { id: "finch-mini", label: "Finch Mini", tag: "Fast" },
]

describe("Beak", () => {
  it("renders a prompt input and disables send while empty", () => {
    renderWithAxe(<Beak />)
    expect(screen.getByRole("textbox", { name: "Prompt" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled()
  })

  it("sends the trimmed draft and clears it", async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    renderWithAxe(<Beak onSend={onSend} />)
    const input = screen.getByRole("textbox", { name: "Prompt" })
    await user.type(input, "  hello there  ")
    await user.click(screen.getByRole("button", { name: "Send" }))
    expect(onSend).toHaveBeenCalledWith("hello there")
    expect(input).toHaveValue("")
  })

  it("sends on Enter but not on Shift+Enter", async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    renderWithAxe(<Beak onSend={onSend} />)
    const input = screen.getByRole("textbox", { name: "Prompt" })
    await user.type(input, "line one")
    await user.keyboard("{Shift>}{Enter}{/Shift}")
    expect(onSend).not.toHaveBeenCalled()
    await user.keyboard("{Enter}")
    expect(onSend).toHaveBeenCalledWith("line one")
  })

  it("opens the sources menu on @ and inserts the picked source", async () => {
    const user = userEvent.setup()
    renderWithAxe(<Beak sources={sources} />)
    const input = screen.getByRole("textbox", { name: "Prompt" })
    await user.type(input, "@")
    expect(screen.getByRole("listbox", { name: "Sources" })).toBeInTheDocument()
    await user.click(screen.getByRole("option", { name: /Web search/ }))
    expect(input).toHaveValue("@Web search ")
  })

  it("runs a source's onSelect instead of inserting it", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    renderWithAxe(
      <Beak
        sources={[{ id: "attach", label: "Add files", onSelect }, ...sources]}
      />,
    )
    const input = screen.getByRole("textbox", { name: "Prompt" })
    await user.type(input, "@")
    await user.click(screen.getByRole("option", { name: /Add files/ }))
    expect(onSelect).toHaveBeenCalledOnce()
    expect(input).toHaveValue("")
  })

  it("filters the command menu on / and picks with Enter", async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    renderWithAxe(<Beak commands={commands} onSend={onSend} />)
    const input = screen.getByRole("textbox", { name: "Prompt" })
    await user.type(input, "/su")
    const menu = screen.getByRole("listbox", { name: "Commands" })
    expect(menu).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: /compare/ })).toBeNull()
    await user.keyboard("{Enter}")
    expect(input).toHaveValue("/summarize ")
    expect(onSend).not.toHaveBeenCalled()
  })

  it("dismisses an open menu with Escape", async () => {
    const user = userEvent.setup()
    renderWithAxe(<Beak sources={sources} />)
    await user.type(screen.getByRole("textbox", { name: "Prompt" }), "@")
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("listbox", { name: "Sources" })).toBeNull()
  })

  it("opens the sources menu from the + button", async () => {
    const user = userEvent.setup()
    renderWithAxe(<Beak sources={sources} />)
    await user.click(
      screen.getByRole("button", { name: "Add attachments and sources" }),
    )
    expect(screen.getByRole("listbox", { name: "Sources" })).toBeInTheDocument()
  })

  it("hides the + button, model picker, and mic without their props", () => {
    renderWithAxe(<Beak />)
    expect(
      screen.queryByRole("button", { name: "Add attachments and sources" }),
    ).toBeNull()
    expect(screen.queryByRole("button", { name: "Choose model" })).toBeNull()
    expect(screen.queryByRole("button", { name: "Start dictation" })).toBeNull()
  })

  it("shows the current model and reports a change", async () => {
    const user = userEvent.setup()
    const onModelChange = vi.fn()
    renderWithAxe(<Beak models={models} onModelChange={onModelChange} />)
    const trigger = screen.getByRole("button", { name: "Choose model" })
    expect(trigger).toHaveTextContent("Oriole 2")
    await user.click(trigger)
    await user.click(screen.getByRole("option", { name: /Finch Mini/ }))
    expect(onModelChange).toHaveBeenCalledWith("finch-mini")
    expect(trigger).toHaveTextContent("Finch Mini")
  })

  it("renders attachment chips and reports removals", async () => {
    const user = userEvent.setup()
    const onAttachmentRemove = vi.fn()
    renderWithAxe(
      <Beak
        attachments={["brief.pdf", "export.csv"]}
        onAttachmentRemove={onAttachmentRemove}
      />,
    )
    expect(screen.getByText("brief.pdf")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Remove export.csv" }))
    expect(onAttachmentRemove).toHaveBeenCalledWith(1)
  })

  it("lets attachments alone enable send", () => {
    renderWithAxe(<Beak attachments={["brief.pdf"]} />)
    expect(screen.getByRole("button", { name: "Send" })).toBeEnabled()
  })

  it("appends the dictated transcript to the draft", async () => {
    const user = userEvent.setup()
    const onDictate = vi.fn().mockResolvedValue("from the mic")
    renderWithAxe(<Beak onDictate={onDictate} />)
    await user.click(screen.getByRole("button", { name: "Start dictation" }))
    expect(onDictate).toHaveBeenCalledOnce()
    expect(await screen.findByDisplayValue("from the mic")).toBeInTheDocument()
  })

  it("rounds fully in the pill variant", () => {
    const { container } = renderWithAxe(<Beak variant="pill" />)
    expect(container.querySelector(".rounded-full")).not.toBeNull()
  })

  it("disables the input and send when isDisabled", () => {
    renderWithAxe(<Beak isDisabled />)
    expect(screen.getByRole("textbox", { name: "Prompt" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled()
  })

  it("forwards its ref and merges a consumer className", () => {
    const ref = createRef<HTMLDivElement>()
    renderWithAxe(<Beak ref={ref} className="max-w-2xl" />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current).toHaveClass("max-w-2xl")
  })

  it("has no axe violations, including with menus open", async () => {
    const user = userEvent.setup()
    const { expectNoViolations } = renderWithAxe(
      <Beak
        sources={sources}
        commands={commands}
        models={models}
        attachments={["brief.pdf"]}
        onDictate={() => Promise.resolve("hi")}
      />,
    )
    await user.type(screen.getByRole("textbox", { name: "Prompt" }), "@")
    await expectNoViolations()
  })
})
