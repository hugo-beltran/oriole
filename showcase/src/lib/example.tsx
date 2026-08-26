import type { ReactNode } from "react"

export function Page(props: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <article className="max-w-3xl">
      <h1 className="font-display text-3xl font-bold">{props.title}</h1>
      <p className="mt-2 text-muted-foreground">{props.description}</p>
      <div className="mt-10 space-y-12">{props.children}</div>
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
      <h2 className="text-lg font-semibold">{props.title}</h2>
      <div className="mt-3 flex flex-wrap items-center gap-4 rounded-lg border border-border p-6">
        {props.children}
      </div>
      {props.code ? (
        <pre className="mt-3 overflow-x-auto rounded-lg bg-muted p-4 text-xs">
          <code>{props.code}</code>
        </pre>
      ) : null}
    </section>
  )
}
