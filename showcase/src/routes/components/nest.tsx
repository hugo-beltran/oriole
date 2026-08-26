import {
  Add01Icon,
  BirdIcon,
  Home01Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Nest,
  NestChat,
  NestGroup,
  NestHead,
  NestLink,
} from "@mycodemedia/oriole"
import { createFileRoute } from "@tanstack/react-router"
import { Example, Page } from "../../lib/example"

export const Route = createFileRoute("/components/nest")({
  component: NestPage,
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

function DemoNest(props: { defaultCollapsed?: boolean }) {
  return (
    <Nest className="h-[420px]" defaultCollapsed={props.defaultCollapsed}>
      <NestHead
        label="Creamery Ops"
        icon={<HugeiconsIcon icon={BirdIcon} size={16} />}
      />
      <NestGroup hideOnCollapse={false}>
        <NestLink
          icon={<HugeiconsIcon icon={Add01Icon} size={16} />}
          shortcut="⌘N"
        >
          New chat
        </NestLink>
        <NestLink icon={<HugeiconsIcon icon={Home01Icon} size={16} />}>
          Home
        </NestLink>
        <NestLink
          icon={<HugeiconsIcon icon={UserAdd01Icon} size={16} />}
          detail="3/10"
        >
          Invite users
        </NestLink>
      </NestGroup>
      <NestGroup title="Chats" searchable>
        {chats.map((chat) => (
          <NestChat key={chat}>{chat}</NestChat>
        ))}
      </NestGroup>
    </Nest>
  )
}

function NestPage() {
  return (
    <Page
      title="Nest"
      description="The strip of navigation beside the Perch — where the oriole keeps its things. Surface-less over the Canvas: a branded head, groups of rows with a gliding hover highlight, and searchable accordion groups."
    >
      <Example
        title="Default"
        code={`<Nest>
  <NestHead label="Creamery Ops" icon={<HugeiconsIcon icon={BirdIcon} size={16} />} />
  <NestGroup hideOnCollapse={false}>
    <NestLink icon={<HugeiconsIcon icon={Add01Icon} size={16} />} shortcut="⌘N">
      New chat
    </NestLink>
    <NestLink icon={<HugeiconsIcon icon={Home01Icon} size={16} />}>Home</NestLink>
    <NestLink icon={<HugeiconsIcon icon={UserAdd01Icon} size={16} />} detail="3/10">
      Invite users
    </NestLink>
  </NestGroup>
  <NestGroup title="Chats" searchable>
    <NestChat>Supplier records</NestChat>
    <NestChat>Flavor page ticket</NestChat>
    …
  </NestGroup>
</Nest>`}
      >
        <DemoNest />
      </Example>

      <Example title="Collapsed" code={`<Nest defaultCollapsed>…</Nest>`}>
        <DemoNest defaultCollapsed />
      </Example>
    </Page>
  )
}
