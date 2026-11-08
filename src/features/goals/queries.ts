import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { CategoryKey, CompletenessLevel, GoalStatus } from './schema'

const cardColumns =
  'id, title, tagline, emoji, status, completeness_level, missing_sections, updated_at, created_at, version, goal_categories(position, categories(key))' as const

export type GoalSummary = {
  id: string
  title: string
  tagline: string | null
  emoji: string | null
  status: GoalStatus
  completenessLevel: CompletenessLevel
  missingSections: string[]
  categories: CategoryKey[]
  createdAt: string
  updatedAt: string
  version: number
}

type Row = {
  id: string
  title: string
  tagline: string | null
  emoji: string | null
  status: string
  completeness_level: string
  missing_sections: string[]
  updated_at: string
  created_at: string
  version: number
  goal_categories?: { position: number; categories: { key: string | null } | null }[]
}

function toSummary(row: Row): GoalSummary {
  return {
    id: row.id,
    title: row.title,
    tagline: row.tagline,
    emoji: row.emoji,
    status: row.status as GoalStatus,
    completenessLevel: row.completeness_level as CompletenessLevel,
    missingSections: row.missing_sections,
    categories: (row.goal_categories ?? [])
      .toSorted((a, b) => a.position - b.position)
      .map((gc) => gc.categories?.key)
      .filter((k): k is CategoryKey => Boolean(k)),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    version: row.version,
  }
}

/** Most recently touched wishes (RLS: the viewer's own only). */
export async function listGoals({ limit }: { limit?: number } = {}) {
  const supabase = await createClient()
  let query = supabase
    .from('goals')
    .select(cardColumns)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
  if (limit) query = query.limit(limit)
  const { data, error } = await query
  if (error) throw error
  return (data as unknown as Row[]).map(toSummary)
}

export async function countGoals() {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('goals')
    .select('id', { count: 'exact', head: true })
    .is('deleted_at', null)
  if (error) throw error
  return count ?? 0
}

/** Wishes that are still a sketch and not dismissed from "Fiches à compléter". */
export async function listGoalsToComplete({ limit = 3 }: { limit?: number } = {}) {
  const supabase = await createClient()
  const { data, error, count } = await supabase
    .from('goals')
    .select(cardColumns, { count: 'exact' })
    .is('deleted_at', null)
    .eq('completeness_level', 'sketch')
    .is('completion_dismissed_at', null)
    .order('updated_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return { goals: (data as unknown as Row[]).map(toSummary), total: count ?? 0 }
}

export async function getGoal(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('goals')
    .select(cardColumns)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle()
  if (error) throw error
  return data ? toSummary(data as unknown as Row) : null
}

export async function getProfile() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('display_name, onboarding_completed_at, first_goal_celebrated_at')
    .maybeSingle()
  return data
}

export type GoalMedia = {
  id: string
  kind: 'image' | 'link'
  url: string | null
  title: string | null
  altText: string | null
  /** Short-lived signed URL for private images. */
  src: string | null
}

export type GoalSheet = GoalSummary & {
  hue: number | null
  descriptionDoc: unknown
  imaginedOutcome: string | null
  whereWith: string | null
  why: string | null
  benefits: string | null
  firstStep: string | null
  notes: string | null
  visibility: 'private' | 'circle' | 'community'
  valueKeys: string[]
  customValues: string[]
  media: GoalMedia[]
}

/** Everything the sheet and the detail page need, with signed image URLs. */
export async function getGoalSheet(id: string): Promise<GoalSheet | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('goals')
    .select(
      `${cardColumns}, hue, description_doc, imagined_outcome, where_with, why, benefits, first_step, notes, visibility, goal_values(value_key, custom_label), goal_media(id, kind, url, title, alt_text, storage_path, position)`,
    )
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle()
  if (error) throw error
  if (!data) return null

  const row = data as unknown as Row & {
    hue: number | null
    description_doc: unknown
    imagined_outcome: string | null
    where_with: string | null
    why: string | null
    benefits: string | null
    first_step: string | null
    notes: string | null
    visibility: GoalSheet['visibility']
    goal_values: { value_key: string | null; custom_label: string | null }[]
    goal_media: {
      id: string
      kind: 'image' | 'link'
      url: string | null
      title: string | null
      alt_text: string | null
      storage_path: string | null
      position: number
    }[]
  }

  const media = row.goal_media.toSorted((a, b) => a.position - b.position)
  const paths = media.map((m) => m.storage_path).filter((p): p is string => Boolean(p))
  const signed = new Map<string, string>()
  if (paths.length > 0) {
    const { data: urls } = await supabase.storage.from('goal-media').createSignedUrls(paths, 3600)
    for (const u of urls ?? []) if (u.path && u.signedUrl) signed.set(u.path, u.signedUrl)
  }

  return {
    ...toSummary(row),
    hue: row.hue,
    descriptionDoc: row.description_doc,
    imaginedOutcome: row.imagined_outcome,
    whereWith: row.where_with,
    why: row.why,
    benefits: row.benefits,
    firstStep: row.first_step,
    notes: row.notes,
    visibility: row.visibility,
    valueKeys: row.goal_values.map((v) => v.value_key).filter((k): k is string => Boolean(k)),
    customValues: row.goal_values.map((v) => v.custom_label).filter((k): k is string => Boolean(k)),
    media: media.map((m) => ({
      id: m.id,
      kind: m.kind,
      url: m.url,
      title: m.title,
      altText: m.alt_text,
      src: m.storage_path ? (signed.get(m.storage_path) ?? null) : null,
    })),
  }
}

export async function listRevisions(goalId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('goal_revisions')
    .select('id, reason, created_at, snapshot')
    .eq('goal_id', goalId)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data.map((r) => {
    const goal = (r.snapshot as { goal?: { title?: string; tagline?: string | null } } | null)?.goal
    return {
      id: r.id,
      reason: r.reason,
      createdAt: r.created_at,
      title: goal?.title ?? '',
      tagline: goal?.tagline ?? null,
    }
  })
}
