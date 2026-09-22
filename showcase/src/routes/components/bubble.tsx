import { Bubble } from "@mycodemedia/oriole"
import { createFileRoute } from "@tanstack/react-router"
import { clsx } from "clsx"
import { Example, Page } from "../../lib/example"
import styles from "./bubble.module.css"

export const Route = createFileRoute("/components/bubble")({
  component: BubblePage,
})

function BubblePage() {
  return (
    <Page
      title="Bubble"
      description="Instant-messaging chat bubble. from='user' hangs right on a berry gradient, from='system' hangs left on translucent driftwood; the tightened bottom corner points at the speaker. Stack them in a flex column."
    >
      <Example
        title="Conversation"
        code={`<div className={styles.thread}>
  <Bubble from="user">Hey — is the new brand ramp live yet?</Bubble>
  <Bubble from="system">
    It is! Nectarine shipped this morning, seeded from the vivid orange
    references.
  </Bubble>
  <Bubble from="user">Perfect, rolling it out to the app now.</Bubble>
</div>`}
      >
        <div className={styles.thread}>
          <Bubble from="user">Hey — is the new brand ramp live yet?</Bubble>
          <Bubble from="system">
            It is! Nectarine shipped this morning, seeded from the vivid orange
            references.
          </Bubble>
          <Bubble from="user">Perfect, rolling it out to the app now.</Bubble>
        </div>
      </Example>

      <Example
        title="Plum"
        code={`<Bubble from="user" color="plum">The accent, for a second voice.</Bubble>
<Bubble from="system" color="plum">Works on either side.</Bubble>`}
      >
        <div className={styles.thread}>
          <Bubble from="user" color="plum">
            The accent, for a second voice.
          </Bubble>
          <Bubble from="system" color="plum">
            Works on either side.
          </Bubble>
        </div>
      </Example>

      <Example
        title="Markdown"
        code={`<Bubble from="system" markdown>
  {"Two segments stand out:\\n\\n- **55+ households** — 12% of spend\\n- **18–24 students** — \`2.3×\` single-serve index"}
</Bubble>`}
      >
        <div className={styles.thread}>
          <Bubble from="user">Which segments are we missing?</Bubble>
          <Bubble from="system" markdown>
            {
              "Two segments stand out:\n\n- **55+ households** — 12% of spend\n- **18–24 students** — `2.3×` single-serve index\n\nSee the [loyalty panel](https://example.com) for the splits."
            }
          </Bubble>
        </div>
      </Example>

      <Example
        title="Grouped messages"
        code={`<div className={clsx(styles.thread, styles.threadTight)}>
  <Bubble from="system" tail={false}>Three quick things.</Bubble>
  <Bubble from="system" tail={false}>Tests are green.</Bubble>
  <Bubble from="system">And the showcase deployed.</Bubble>
</div>`}
      >
        <div className={clsx(styles.thread, styles.threadTight)}>
          <Bubble from="system" tail={false}>
            Three quick things.
          </Bubble>
          <Bubble from="system" tail={false}>
            Tests are green.
          </Bubble>
          <Bubble from="system">And the showcase deployed.</Bubble>
        </div>
      </Example>

      <Example
        title="Custom className"
        code={`/* .wide { max-width: 100%; border-radius: 6px } */
<Bubble from="user" className={styles.wide}>Full-width, squared off.</Bubble>`}
      >
        <div className={styles.thread}>
          <Bubble from="user" className={styles.wide}>
            Full-width, squared off.
          </Bubble>
        </div>
      </Example>
    </Page>
  )
}
