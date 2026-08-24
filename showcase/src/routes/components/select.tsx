import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@mycodemedia/oriole"
import { createFileRoute } from "@tanstack/react-router"
import { Label } from "react-aria-components"
import { Example, Page } from "../../lib/example"

export const Route = createFileRoute("/components/select")({
  component: SelectPage,
})

function SelectPage() {
  return (
    <Page
      title="Select"
      description="A compound component over react-aria-components Select. Popover and ListBox are fused into SelectContent; no render props cross the API."
    >
      <Example
        title="Basic"
        code={`<Select>
  <Label>Fruit</Label>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem id="apple">Apple</SelectItem>
    <SelectItem id="banana">Banana</SelectItem>
    <SelectItem id="cherry">Cherry</SelectItem>
  </SelectContent>
</Select>`}
      >
        <Select className="w-56">
          <Label className="text-sm font-medium">Fruit</Label>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem id="apple">Apple</SelectItem>
            <SelectItem id="banana">Banana</SelectItem>
            <SelectItem id="cherry">Cherry</SelectItem>
          </SelectContent>
        </Select>
      </Example>

      <Example
        title="Disabled items"
        code={`<SelectItem id="grape" isDisabled>Grape (out of season)</SelectItem>`}
      >
        <Select className="w-56">
          <Label className="text-sm font-medium">Fruit</Label>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem id="apple">Apple</SelectItem>
            <SelectItem id="grape" isDisabled>
              Grape (out of season)
            </SelectItem>
          </SelectContent>
        </Select>
      </Example>

      <Example title="Disabled select" code={`<Select isDisabled>…</Select>`}>
        <Select className="w-56" isDisabled>
          <Label className="text-sm font-medium">Fruit</Label>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem id="apple">Apple</SelectItem>
          </SelectContent>
        </Select>
      </Example>
    </Page>
  )
}
