import type { ReactNode } from 'react'
import type { RichDoc } from '@/features/goals/rich-text'

type Node = {
  type: string
  text?: string
  attrs?: { href?: string; level?: number }
  marks?: { type: string; attrs?: { href?: string } }[]
  content?: Node[]
}

function inline(nodes: Node[] = []): ReactNode[] {
  return nodes.map((node, i) => {
    if (node.type === 'hardBreak') return <br key={i} />
    let out: ReactNode = node.text ?? ''
    for (const mark of node.marks ?? []) {
      if (mark.type === 'bold') out = <strong>{out}</strong>
      if (mark.type === 'italic') out = <em>{out}</em>
      if (mark.type === 'link' && mark.attrs?.href)
        out = (
          <a
            href={mark.attrs.href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-accent-strong underline underline-offset-2"
          >
            {out}
          </a>
        )
    }
    return <span key={i}>{out}</span>
  })
}

function block(node: Node, key: number): ReactNode {
  switch (node.type) {
    case 'paragraph':
      return <p key={key}>{inline(node.content)}</p>
    case 'heading':
      return (
        <h3 key={key} className="font-display text-lg font-medium">
          {inline(node.content)}
        </h3>
      )
    case 'bulletList':
    case 'orderedList': {
      const Tag = node.type === 'bulletList' ? 'ul' : 'ol'
      return (
        <Tag
          key={key}
          className={node.type === 'bulletList' ? 'list-disc pl-6' : 'list-decimal pl-6'}
        >
          {(node.content ?? []).map((item, i) => (
            <li key={i}>{(item.content ?? []).map((child, j) => block(child, j))}</li>
          ))}
        </Tag>
      )
    }
    default:
      return null
  }
}

/** Read-only rendering of a validated description (no HTML injection). */
export function RichTextView({ doc }: { doc: RichDoc }) {
  return (
    <div className="grid max-w-[65ch] gap-3 text-md leading-relaxed">
      {((doc as Node).content ?? []).map(block)}
    </div>
  )
}
