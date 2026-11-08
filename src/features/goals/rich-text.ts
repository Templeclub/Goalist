import { z } from 'zod'

/*
 * Restricted ProseMirror schema for descriptions (D-008): paragraphs, level-3
 * headings, bullet/ordered lists, bold, italic and http(s)/mailto links.
 * Anything else is refused by the server, so no arbitrary HTML is ever stored.
 */

const SafeHref = z
  .string()
  .max(2000)
  .refine((href) => /^(https?:\/\/|mailto:)/i.test(href), 'unsafe link')

const Mark = z.discriminatedUnion('type', [
  z.object({ type: z.literal('bold') }).strict(),
  z.object({ type: z.literal('italic') }).strict(),
  z
    .object({
      type: z.literal('link'),
      attrs: z.object({ href: SafeHref }).passthrough(),
    })
    .strict(),
])

const Text = z
  .object({
    type: z.literal('text'),
    text: z.string().min(1).max(20000),
    marks: z.array(Mark).max(3).optional(),
  })
  .strict()

const HardBreak = z.object({ type: z.literal('hardBreak') }).strict()
const Inline = z.union([Text, HardBreak])

const Paragraph = z
  .object({ type: z.literal('paragraph'), content: z.array(Inline).max(500).optional() })
  .strict()

const Heading = z
  .object({
    type: z.literal('heading'),
    attrs: z.object({ level: z.literal(3) }).passthrough(),
    content: z.array(Inline).max(100).optional(),
  })
  .strict()

type ListNode = { type: 'bulletList' | 'orderedList'; attrs?: unknown; content: ListItemNode[] }
type ListItemNode = { type: 'listItem'; content: (z.infer<typeof Paragraph> | ListNode)[] }

const List: z.ZodType<ListNode> = z.lazy(() =>
  z
    .object({
      type: z.enum(['bulletList', 'orderedList']),
      attrs: z.unknown().optional(),
      content: z.array(ListItem).min(1).max(200),
    })
    .strict(),
)

const ListItem: z.ZodType<ListItemNode> = z.lazy(() =>
  z
    .object({
      type: z.literal('listItem'),
      content: z
        .array(z.union([Paragraph, List]))
        .min(1)
        .max(20),
    })
    .strict(),
)

const Block = z.union([Paragraph, Heading, List])

export const RichDoc = z
  .object({ type: z.literal('doc'), content: z.array(Block).max(500) })
  .strict()
  .refine((doc) => JSON.stringify(doc).length <= 60_000, 'document too large')

export type RichDoc = z.infer<typeof RichDoc>

type AnyNode = { type: string; text?: string; content?: AnyNode[] }

/** Plain text of a document, one block per line (search and completeness). */
export function richDocToText(doc: RichDoc | null | undefined): string {
  if (!doc) return ''
  const lines: string[] = []
  const inline = (nodes: AnyNode[] = []) =>
    nodes
      .map((n) => (n.type === 'text' ? (n.text ?? '') : n.type === 'hardBreak' ? ' ' : ''))
      .join('')
  const walk = (nodes: AnyNode[] = []) => {
    for (const node of nodes) {
      if (node.type === 'paragraph' || node.type === 'heading') lines.push(inline(node.content))
      else walk(node.content)
    }
  }
  walk((doc as AnyNode).content)
  return lines
    .map((l) => l.trim())
    .filter(Boolean)
    .join('\n')
}

/** Markdown of a document, for the export (phase 5) and quick previews. */
export function richDocToMarkdown(doc: RichDoc | null | undefined): string {
  if (!doc) return ''
  const inline = (nodes: AnyNode[] = []) =>
    nodes
      .map((n) => {
        if (n.type === 'hardBreak') return '  \n'
        let text = n.text ?? ''
        const marks = (n as { marks?: { type: string; attrs?: { href?: string } }[] }).marks ?? []
        if (marks.some((m) => m.type === 'bold')) text = `**${text}**`
        if (marks.some((m) => m.type === 'italic')) text = `*${text}*`
        const link = marks.find((m) => m.type === 'link')
        if (link?.attrs?.href) text = `[${text}](${link.attrs.href})`
        return text
      })
      .join('')
  const block = (node: AnyNode, depth = 0): string => {
    if (node.type === 'paragraph') return inline(node.content)
    if (node.type === 'heading') return `### ${inline(node.content)}`
    if (node.type === 'bulletList' || node.type === 'orderedList') {
      return (node.content ?? [])
        .map((item, i) => {
          const bullet = node.type === 'bulletList' ? '-' : `${i + 1}.`
          const [first, ...rest] = item.content ?? []
          const head = first ? block(first, depth + 1) : ''
          const tail = rest.map((child) => block(child, depth + 1)).join('\n')
          return `${'  '.repeat(depth)}${bullet} ${head}${tail ? `\n${tail}` : ''}`
        })
        .join('\n')
    }
    return ''
  }
  return ((doc as AnyNode).content ?? []).map((n) => block(n)).join('\n\n')
}
