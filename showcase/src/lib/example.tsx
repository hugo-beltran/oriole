import type { ReactNode } from "react"
import styles from "./example.module.css"

export function Page(props: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <article className={styles.page}>
      <h1 className={styles.title}>{props.title}</h1>
      <p className={styles.description}>{props.description}</p>
      <div className={styles.examples}>{props.children}</div>
    </article>
  )
}

export function Example(props: {
  title: string
  code?: string
  children: ReactNode
}) {
  return (
    <section>
      <h2 className={styles.heading}>{props.title}</h2>
      <div className={styles.preview}>{props.children}</div>
      {props.code ? (
        <pre className={styles.code}>
          <code>{props.code}</code>
        </pre>
      ) : null}
    </section>
  )
}
