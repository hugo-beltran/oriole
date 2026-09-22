/**
 * Emit the machine-readable reference for the showcase site: one markdown
 * page per component, the tokens and stylesheet page, the porting guide, an
 * `llms.txt` index (llmstxt.org), an `llms-full.txt` concatenation, and
 * verbatim copies of the sources under `source/`. Written into Vite's public
 * dir so `dev` serves them and `build` copies them into dist.
 */
import {
  copyFile,
  mkdir,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises"
import { dirname, join } from "node:path"

const root = new URL("..", import.meta.url).pathname
const componentsDir = join(root, "src/components")
const routesDir = join(root, "showcase/src/routes/components")
const out = join(root, "showcase/public")
const siteUrl = (
  process.env.ORIOLE_SITE_URL ?? "https://hugo-beltran.github.io/oriole/"
).replace(/\/?$/, "/")
const repoUrl = "https://github.com/hugo-beltran/oriole"

const read = (path: string) => readFile(path, "utf8")
const write = async (rel: string, text: string) => {
  const target = join(out, rel)
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, text)
}
const copy = async (from: string, rel: string) => {
  const target = join(out, rel)
  await mkdir(dirname(target), { recursive: true })
  await copyFile(from, target)
}
const fence = (lang: string, code: string) =>
  `\`\`\`${lang}\n${code.trimEnd()}\n\`\`\``
const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Every doc comment that precedes a `function` or `const`, with its target name. */
function docblocks(source: string) {
  const blocks: { name: string; text: string }[] = []
  // Tempered so a block can never span past its own closing `*/`.
  const pattern =
    /\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\n(?:export )?(?:function|const) (\w+)/g
  for (const match of source.matchAll(pattern)) {
    const text = (match[1] ?? "")
      .split("\n")
      .map((line) => line.replace(/^\s*\* ?/, "").trim())
      .join("\n")
      .trim()
    blocks.push({ name: match[2] ?? "", text })
  }
  return blocks
}

/** First sentence of a paragraph, for index lines. */
function firstSentence(text: string) {
  const paragraph = text.split(/\n\n/)[0]?.replace(/\n/g, " ") ?? ""
  return /^.*?[.!?](?=\s|$)/.exec(paragraph)?.[0] ?? paragraph
}

/** Names in the trailing `export { … }` statement, split into values and types. */
function exportsOf(source: string) {
  const match = /export \{([\s\S]*?)\}\s*$/.exec(source.trim())
  const names = (match?.[1] ?? "")
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean)
  return {
    values: names.filter((n) => !n.startsWith("type ")),
    types: names
      .filter((n) => n.startsWith("type "))
      .map((n) => n.replace(/^type /, "")),
  }
}

/** The declaration of an interface or type alias, verbatim. */
function declarationOf(source: string, name: string) {
  const start = source.search(
    new RegExp(`^(?:export )?(?:interface|type) ${name}\\b`, "m"),
  )
  if (start === -1) return null
  const rest = source.slice(start)
  const brace = rest.indexOf("{")
  const semicolonAlias = /^type \w+[^{=]*=\s*[^{]+$/m.test(
    rest.split("\n")[0] ?? "",
  )
  if (semicolonAlias || brace === -1)
    return rest.split("\n\n")[0]?.trim() ?? null
  let depth = 0
  for (let i = brace; i < rest.length; i++) {
    if (rest[i] === "{") depth++
    if (rest[i] === "}") depth--
    if (depth === 0) return rest.slice(0, i + 1).trim()
  }
  return null
}

/** `<Example title="…" code={`…`}>` pairs from a showcase route. */
async function examplesOf(name: string) {
  const file = join(routesDir, `${name}.tsx`)
  const source = await read(file).catch(() => null)
  if (!source) return []
  const examples: { title: string; code: string }[] = []
  const pattern = /<Example\s+title="([^"]+)"[\s\S]*?code=\{`([\s\S]*?)`\}/g
  for (const match of source.matchAll(pattern)) {
    examples.push({ title: match[1] ?? "", code: match[2] ?? "" })
  }
  return examples
}

async function componentPage(name: string) {
  const dir = join(componentsDir, name)
  const files = (await readdir(dir))
    .filter((f) => !f.endsWith(".d.ts") && !f.includes(".test."))
    .sort()
  const main = await read(join(dir, `${name}.tsx`))
  const css = await read(join(dir, `${name}.module.css`))
  const { values, types } = exportsOf(main)
  // Only exported names (and the variants const that documents a component)
  const blocks = docblocks(main).filter(
    (b) => values.includes(b.name) || b.name === `${name}Variants`,
  )
  const own = blocks.find((b) => b.name.toLowerCase() === name)
  const summary = own
    ? firstSentence(own.text)
    : `The ${titleCase(name)} component.`
  const examples = await examplesOf(name)

  const parts: string[] = [
    `# ${titleCase(name)}`,
    "",
    own ? own.text : summary,
    "",
    `Source: ${files.map((f) => `[\`${f}\`](${siteUrl}source/components/${name}/${f})`).join(", ")}`,
    "",
    `Exports: ${values.map((v) => `\`${v}\``).join(", ")}`,
  ]
  for (const block of blocks) {
    if (block === own) continue
    parts.push("", `## ${block.name}`, "", block.text)
  }
  const declarations = types
    .map((t) => declarationOf(main, t))
    .filter((d): d is string => Boolean(d))
  if (declarations.length) {
    parts.push("", "## Props", "", fence("ts", declarations.join("\n\n")))
  }
  if (examples.length) {
    parts.push("", "## Usage")
    for (const example of examples) {
      parts.push("", `### ${example.title}`, "", fence("tsx", example.code))
    }
  }
  parts.push(
    "",
    "## Styles",
    "",
    `\`${name}.module.css\`, verbatim. Rules sit in \`@layer components\` and read \`--or-*\` tokens; see the porting guide for the layer and token setup.`,
    "",
    fence("css", css),
    "",
  )

  for (const file of files)
    await copy(join(dir, file), `source/components/${name}/${file}`)
  const markdown = parts.join("\n")
  await write(`docs/${name}.md`, markdown)
  return { name, summary, markdown }
}

async function tokensPage() {
  const theme = await read(join(root, "src/styles/theme.css"))
  const global = await read(join(root, "src/styles/global.css"))
  await copy(join(root, "src/styles/theme.css"), "source/styles/theme.css")
  await copy(join(root, "src/styles/global.css"), "source/styles/global.css")
  const markdown = [
    "# Tokens and global stylesheet",
    "",
    "Two files carry everything that is not a component. `theme.css` is tokens only: the",
    "five oklch color ramps, the semantic aliases, `--or-radius`, and the display face.",
    "`global.css` declares the cascade layers (`base`, then `components`), imports the",
    "tokens, and holds a compact reset in `@layer base`. Import `global.css` once; the",
    "components import their own modules.",
    "",
    `Source: [\`theme.css\`](${siteUrl}source/styles/theme.css), [\`global.css\`](${siteUrl}source/styles/global.css)`,
    "",
    "## theme.css",
    "",
    fence("css", theme),
    "",
    "## global.css",
    "",
    fence("css", global),
    "",
  ].join("\n")
  await write("docs/tokens.md", markdown)
  return markdown
}

async function main() {
  await rm(out, { recursive: true, force: true })
  const names = (await readdir(componentsDir, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()

  const porting = await read(join(root, "docs/porting.md"))
  await write("docs/porting.md", porting)
  const tokens = await tokensPage()
  const pages = []
  for (const name of names) pages.push(await componentPage(name))

  const index = [
    "# Oriole",
    "",
    "> Branded React components over react-aria-components, styled with co-located CSS",
    "> Modules over `--or-*` design tokens. This site is a reference to port from, not a",
    "> package to install: every page below links to the verbatim source.",
    "",
    "## Start here",
    "",
    `- [Porting guide](${siteUrl}docs/porting.md): tokens, cascade layers, and how to copy a component into another project`,
    `- [Tokens and global stylesheet](${siteUrl}docs/tokens.md): theme.css and global.css with commentary`,
    "",
    "## Components",
    "",
    ...pages.map(
      (p) =>
        `- [${titleCase(p.name)}](${siteUrl}docs/${p.name}.md): ${p.summary}`,
    ),
    "",
    "## Source",
    "",
    `- [theme.css](${siteUrl}source/styles/theme.css)`,
    `- [global.css](${siteUrl}source/styles/global.css)`,
    ...names.map(
      (n) =>
        `- [${n}/](${siteUrl}source/components/${n}/${n}.tsx): component, module, index`,
    ),
    "",
    "## Optional",
    "",
    `- [Repository](${repoUrl}): tests, showcase, and history`,
    `- [Showcase](${siteUrl}): the human-facing site these pages describe`,
    "",
  ].join("\n")
  await write("llms.txt", index)
  await write(
    "llms-full.txt",
    [index, porting, tokens, ...pages.map((p) => p.markdown)].join(
      "\n\n---\n\n",
    ),
  )
  console.log(`llms: ${pages.length} components → ${out}`)
}

await main()
