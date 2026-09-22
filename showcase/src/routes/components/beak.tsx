import {
  Attachment01Icon,
  ChartLineData01Icon,
  GlobalSearchIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Beak, type BeakItem } from "@mycodemedia/oriole"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { Example, Page } from "../../lib/example"
import styles from "./beak.module.css"

export const Route = createFileRoute("/components/beak")({
  component: BeakPage,
})

const sources: BeakItem[] = [
  {
    id: "loyalty",
    label: "Loyalty panel",
    description: "Household purchase data",
    icon: <HugeiconsIcon icon={ChartLineData01Icon} size={15} />,
  },
  {
    id: "web",
    label: "Web search",
    description: "Real-time news and info",
    icon: <HugeiconsIcon icon={GlobalSearchIcon} size={15} />,
  },
]

const commands: BeakItem[] = [
  { id: "compare", label: "compare", description: "Two segments side by side" },
  { id: "summarize", label: "summarize", description: "Digest the thread" },
]

const models = [
  { id: "oriole-2", label: "Oriole 2", tag: "Flagship" },
  { id: "finch-mini", label: "Finch Mini", tag: "Fast" },
]

function BeakPage() {
  const [attachments, setAttachments] = useState(["channel-brief.pdf"])

  return (
    <Page
      title="Beak"
      description="The prompt bar — where the chirps come from. An auto-growing composer with @ source and / command menus, a model picker, dictation, attachment chips, and Enter-to-send. Everything beyond onSend is optional."
    >
      <Example
        title="Full composer"
        code={`<Beak
  sources={sources}     // + button and the @ menu
  commands={commands}   // the / menu
  models={models}
  attachments={attachments}
  onAttachmentRemove={(i) => remove(i)}
  onDictate={() => transcribe()}
  onSend={(text) => reply(text)}
/>`}
      >
        <div className={styles.demo}>
          <Beak
            sources={[
              {
                id: "attach",
                label: "Add photos & files",
                description: "Upload from your computer",
                icon: <HugeiconsIcon icon={Attachment01Icon} size={15} />,
                onSelect: () =>
                  setAttachments((current) => [...current, "shelf-photo.png"]),
              },
              ...sources,
            ]}
            commands={commands}
            models={models}
            attachments={attachments}
            onAttachmentRemove={(index) =>
              setAttachments((current) => current.filter((_, i) => i !== index))
            }
            onDictate={() =>
              new Promise((resolve) =>
                setTimeout(() => resolve("Try typing @ or /"), 1500),
              )
            }
          />
        </div>
      </Example>

      <Example
        title="Pill"
        code={`<Beak variant="pill" models={models} onSend={send} />`}
      >
        <div className={styles.demo}>
          <Beak variant="pill" models={models} />
        </div>
      </Example>

      <Example
        title="Bare"
        code={`<Beak placeholder="Reply…" onSend={send} />`}
      >
        <div className={styles.demo}>
          <Beak placeholder="Reply…" />
        </div>
      </Example>
    </Page>
  )
}
