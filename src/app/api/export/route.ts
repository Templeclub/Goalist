import { strToU8, zipSync, type Zippable } from 'fflate'
import { getTranslations } from 'next-intl/server'
import { NextResponse } from 'next/server'
import { APP_NAME } from '@/config/app'
import {
  goalToMarkdown,
  slugify,
  type ExportGoal,
  type ExportLabels,
} from '@/features/account/export-format'
import { problem } from '@/lib/http'
import { createClient } from '@/lib/supabase/server'

const goalColumns = `*, goal_values(value_key, custom_label), goal_tags(tags(label)),
  goal_categories(position, categories(key, label)), smart_answers(*),
  goal_status_history(from_status, to_status, note, changed_at), goal_revisions(count),
  goal_media(kind, url, title, alt_text, storage_path, position)`

type Row = Record<string, unknown> & {
  id: string
  title: string
  status: string
  created_at: string
  updated_at: string
  goal_values: { value_key: string | null; custom_label: string | null }[]
  goal_tags: { tags: { label: string } | null }[]
  goal_categories: {
    position: number
    categories: { key: string | null; label: string | null } | null
  }[]
  smart_answers: Record<string, unknown> | Record<string, unknown>[] | null
  goal_media: {
    kind: string
    url: string | null
    title: string | null
    alt_text: string | null
    storage_path: string | null
    position: number
  }[]
}

/**
 * Everything the person wrote, as a ZIP: elan-export.json (complete),
 * envies/*.md (readable) and images/ (originals). Read through RLS only.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims?.sub
  if (!userId) return problem(401, 'unauthenticated')
  if (claims?.claims?.is_anonymous === true) return problem(403, 'account_required')

  const [{ data: profile }, { data: goals, error }, { data: categories }, tMe, tGoal, now] =
    await Promise.all([
      supabase.from('profiles').select('display_name, locale, theme, created_at').maybeSingle(),
      supabase.from('goals').select(goalColumns).order('created_at'),
      supabase.from('categories').select('label, hue').not('owner_id', 'is', null),
      getTranslations('me.export'),
      getTranslations('goal'),
      Promise.resolve(new Date()),
    ])
  if (error) return problem(500, 'export_failed')

  const labels = Object.fromEntries(
    [
      'status',
      'description',
      'imagined',
      'whereWith',
      'why',
      'values',
      'firstStep',
      'notes',
      'smart',
      'categories',
      'tags',
      'links',
      'images',
      'kept',
    ].map((k) => [k, tMe(k as 'status')]),
  ) as ExportLabels
  const tr = tGoal as unknown as (key: string) => string

  const files: Zippable = {}
  const usedNames = new Set<string>()
  for (const row of (goals ?? []) as unknown as Row[]) {
    const images: string[] = []
    for (const media of row.goal_media.filter((m) => m.kind === 'image' && m.storage_path)) {
      const { data: blob } = await supabase.storage.from('goal-media').download(media.storage_path!)
      if (!blob) continue
      const path = `images/${row.id}/${media.storage_path!.split('/').pop()}`
      files[path] = new Uint8Array(await blob.arrayBuffer())
      images.push(path)
    }
    const smart = Array.isArray(row.smart_answers) ? row.smart_answers[0] : row.smart_answers
    const goal: ExportGoal = {
      id: row.id,
      title: row.title,
      tagline: (row.tagline as string | null) ?? null,
      emoji: (row.emoji as string | null) ?? null,
      status: tr(`statuses.${row.status}`),
      created_at: row.created_at,
      updated_at: row.updated_at,
      description_doc: row.description_doc,
      imagined_outcome: (row.imagined_outcome as string | null) ?? null,
      where_with: (row.where_with as string | null) ?? null,
      why: (row.why as string | null) ?? null,
      benefits: (row.benefits as string | null) ?? null,
      first_step: (row.first_step as string | null) ?? null,
      notes: (row.notes as string | null) ?? null,
      values: row.goal_values.map((v) =>
        v.value_key ? tr(`values.${v.value_key}`) : (v.custom_label ?? ''),
      ),
      categories: row.goal_categories
        .toSorted((a, b) => a.position - b.position)
        .map((c) =>
          c.categories?.key ? tr(`categories.${c.categories.key}`) : (c.categories?.label ?? ''),
        ),
      tags: row.goal_tags.map((t) => t.tags?.label ?? '').filter(Boolean),
      smart_sentence: (smart?.assembled_sentence as string | null) ?? null,
      qualify: {},
      links: row.goal_media
        .filter((m) => m.kind === 'link' && m.url)
        .map((m) => ({ url: m.url!, title: m.title })),
      images,
    }
    let name = slugify(row.title)
    while (usedNames.has(name)) name = `${name}-${row.id.slice(-4)}`
    usedNames.add(name)
    files[`envies/${name}.md`] = strToU8(goalToMarkdown(goal, labels))
  }

  const exportedAt = now.toISOString()
  files['elan-export.json'] = strToU8(
    JSON.stringify(
      {
        app: APP_NAME,
        exported_at: exportedAt,
        profile,
        personal_categories: categories ?? [],
        goals: goals ?? [],
      },
      null,
      2,
    ),
  )
  files['LISEZ-MOI.txt'] = strToU8(
    `${tMe('readme', { appName: APP_NAME, date: exportedAt.slice(0, 10) })}\n`,
  )

  const zip = zipSync(files, { level: 6 })
  return new NextResponse(zip as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="elan-export-${exportedAt.slice(0, 10)}.zip"`,
      'Cache-Control': 'no-store',
    },
  })
}
