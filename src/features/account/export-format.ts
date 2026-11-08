import { RichDoc, richDocToMarkdown } from '@/features/goals/rich-text'

/** One wish as exported (plain data, no internal ids besides the wish's own). */
export type ExportGoal = {
  id: string
  title: string
  tagline: string | null
  emoji: string | null
  status: string
  created_at: string
  updated_at: string
  description_doc: unknown
  imagined_outcome: string | null
  where_with: string | null
  why: string | null
  benefits: string | null
  first_step: string | null
  notes: string | null
  values: string[]
  categories: string[]
  tags: string[]
  smart_sentence: string | null
  qualify: Record<string, unknown>
  links: { url: string; title: string | null }[]
  images: string[]
}

export type ExportLabels = {
  status: string
  description: string
  imagined: string
  whereWith: string
  why: string
  values: string
  firstStep: string
  notes: string
  smart: string
  categories: string
  tags: string
  links: string
  images: string
  kept: string
}

/** File-system friendly slug: "Dormir à la belle étoile" → "dormir-a-la-belle-etoile". */
export function slugify(title: string) {
  return (
    title
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'envie'
  )
}

/** A readable Markdown page per wish (Markdown export, docs/plan.md §3.5). */
export function goalToMarkdown(goal: ExportGoal, labels: ExportLabels): string {
  const lines: string[] = [`# ${goal.emoji ? `${goal.emoji} ` : ''}${goal.title}`]
  if (goal.tagline) lines.push('', `*${goal.tagline}*`)
  lines.push(
    '',
    `- ${labels.status} : ${goal.status}`,
    `- ${labels.kept} : ${goal.created_at.slice(0, 10)}`,
  )
  if (goal.categories.length) lines.push(`- ${labels.categories} : ${goal.categories.join(', ')}`)
  if (goal.tags.length) lines.push(`- ${labels.tags} : ${goal.tags.map((t) => `#${t}`).join(' ')}`)
  const section = (title: string, body: string | null | undefined) => {
    if (body && body.trim()) lines.push('', `## ${title}`, '', body.trim())
  }
  const doc = RichDoc.safeParse(goal.description_doc)
  section(labels.description, doc.success ? richDocToMarkdown(doc.data) : null)
  section(labels.imagined, goal.imagined_outcome)
  section(labels.whereWith, goal.where_with)
  section(labels.why, [goal.why, goal.benefits].filter(Boolean).join('\n\n'))
  if (goal.values.length) section(labels.values, goal.values.map((v) => `- ${v}`).join('\n'))
  section(labels.smart, goal.smart_sentence)
  section(labels.firstStep, goal.first_step)
  section(labels.notes, goal.notes)
  if (goal.links.length)
    section(labels.links, goal.links.map((l) => `- [${l.title ?? l.url}](${l.url})`).join('\n'))
  if (goal.images.length) section(labels.images, goal.images.map((p) => `![](../${p})`).join('\n'))
  return `${lines.join('\n')}\n`
}
