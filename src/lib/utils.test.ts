import { describe, expect, it } from "vitest"
import { expectNoViolations } from "../../test/test-utils"
import { cn } from "./utils"

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b")
  })

  it("resolves tailwind conflicts in favor of the last class", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4")
  })

  it("ignores falsy values", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b")
  })
})

describe("axe wiring", () => {
  it("passes on a trivially accessible fragment", async () => {
    const div = document.createElement("div")
    div.innerHTML = "<main><h1>Hello</h1></main>"
    document.body.appendChild(div)
    await expectNoViolations(div)
    div.remove()
  })
})
