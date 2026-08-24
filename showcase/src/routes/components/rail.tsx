import {
  Add01Icon,
  Home01Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Rail,
  RailBranch,
  RailFlock,
  RailItem,
  RailNest,
  RailNestItem,
} from "@mycodemedia/oriole"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { Example, Page } from "../../lib/example"

export const Route = createFileRoute("/components/rail")({
  component: RailPage,
})

const chats = [
  "Supplier records",
  "Urgent to-dos this morning",
  "Flavor page ticket",
  "Workload summary",
  "Off-board a supplier",
  "Batch restock function",
  "Propose flavor edits",
]

function DemoRail(props: { defaultCollapsed?: boolean }) {
  const [nest, setNest] = useState<string>("creamery")
  return (
    <Rail className="h-[420px]" defaultCollapsed={props.defaultCollapsed}>
      <RailNest
        label={nest === "creamery" ? "Creamery Ops" : "Gelato Lab"}
        selectedId={nest}
        onSelect={(id) => setNest(String(id))}
      >
        <RailNestItem id="creamery">Creamery Ops</RailNestItem>
        <RailNestItem id="gelato">Gelato Lab</RailNestItem>
        <RailNestItem id="sorbet">Sorbet Studio</RailNestItem>
      </RailNest>
      <RailFlock>
        <RailItem
          icon={<HugeiconsIcon icon={Add01Icon} size={16} />}
          shortcut="⌘N"
        >
          New chat
        </RailItem>
        <RailItem icon={<HugeiconsIcon icon={Home01Icon} size={16} />}>
          Home
        </RailItem>
        <RailItem
          icon={<HugeiconsIcon icon={UserAdd01Icon} size={16} />}
          detail="3/10"
        >
          Invite users
        </RailItem>
      </RailFlock>
      <RailBranch title="Chats" searchable>
        {chats.map((chat) => (
          <RailItem key={chat}>{chat}</RailItem>
        ))}
      </RailBranch>
    </Rail>
  )
}

function RailPage() {
  return (
    <Page
      title="Rail"
      description="The strip of navigation beside the Perch — a rail is a bird, too. Surface-less over the Canvas: a nest switcher for tenants, a flock of rows with a gliding hover highlight, and searchable branches."
    >
      <Example
        title="Default"
        code={`<Rail>
  <RailNest label="Creamery Ops" selectedId={nest} onSelect={setNest}>
    <RailNestItem id="creamery">Creamery Ops</RailNestItem>
    <RailNestItem id="gelato">Gelato Lab</RailNestItem>
  </RailNest>
  <RailFlock>
    <RailItem icon={<HugeiconsIcon icon={Add01Icon} size={16} />} shortcut="⌘N">
      New chat
    </RailItem>
    <RailItem icon={<HugeiconsIcon icon={Home01Icon} size={16} />}>Home</RailItem>
    <RailItem icon={<HugeiconsIcon icon={UserAdd01Icon} size={16} />} detail="3/10">
      Invite users
    </RailItem>
  </RailFlock>
  <RailBranch title="Chats" searchable>
    <RailItem>Supplier records</RailItem>
    …
  </RailBranch>
</Rail>`}
      >
        <DemoRail />
      </Example>

      <Example title="Collapsed" code={`<Rail defaultCollapsed>…</Rail>`}>
        <DemoRail defaultCollapsed />
      </Example>
    </Page>
  )
}
