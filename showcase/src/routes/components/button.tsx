import { Button } from "@mycodemedia/oriole"
import { createFileRoute } from "@tanstack/react-router"
import { Example, Page } from "../../lib/example"

export const Route = createFileRoute("/components/button")({
  component: ButtonPage,
})

function ButtonPage() {
  return (
    <Page
      title="Button"
      description="Wraps react-aria-components Button. Interaction states are styled through data attributes; consumer classNames win conflicts."
    >
      <Example
        title="Variants"
        code={`<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>`}
      >
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
      </Example>

      <Example
        title="Sizes"
        code={`<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>`}
      >
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </Example>

      <Example title="Disabled" code={`<Button isDisabled>Disabled</Button>`}>
        <Button isDisabled>Disabled</Button>
        <Button variant="outline" isDisabled>
          Disabled outline
        </Button>
      </Example>

      <Example
        title="Custom className"
        code={`<Button className="rounded-full px-8">Pill</Button>`}
      >
        <Button className="rounded-full px-8">Pill</Button>
      </Example>
    </Page>
  )
}
