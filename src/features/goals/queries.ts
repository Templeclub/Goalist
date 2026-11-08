import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { quickFilterExpression, type ListQuery } from './list-query'
import { categoryHue } from './palette'
import type { CategoryKey, CompletenessLevel, GoalStatus } from './schema'

const cardColumns =
  'id, title, tagline, emoji, hue, horizon, status, completeness_level, missing_sections, completion_dismissed_at, updated_at, created_at, version, goal_categories(position, categories(key, hue))' as const

export type GoalSummary = {
  id: string
  title: string
  tagline: string | null
  emoji: string | null
  status: GoalStatus
  completenessLevel: CompletenessLevel
  missingSections: string[]
  categories: CategoryKey[]
  /** Ribbon hue: the wish's own colour, else its first category's (system or personal). */
  ribbonHue: number | null
  horizon: string | null
  completionDismissed: boolean
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
  hue?: number | null
  horizon?: string | null
  completion_dismissed_at?: string | null
  goal_categories?: {
    position: number
    categories: { key: string | null; hue: number | null } | null
  }[]
}

function toSummary(row: Row): GoalSummary {
  const ordered = (row.goal_categories ?? []).toSorted((a, b) => a.position - b.position)
  const first = ordered[0]?.categories
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
    ribbonHue:
      row.hue ??
      (first ? (first.key ? (categoryHue[first.key as CategoryKey] ?? null) : first.hue) : null),
    completionDismissed: Boolean(row.completion_dismissed_at),
    horizon: row.horizon ?? null,
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
  qualify: GoalQualify
  categoryItems: CategoryItem[]
  tags: string[]
  smart: SmartAnswersRow
  statusNote: string | null
}

export type CategoryItem = {
  id: string
  key: CategoryKey | null
  label: string | null
  hue: number | null
}

export type GoalQualify = {
  difficulty: number | null
  preparation: string | null
  horizon: string | null
  target_date: string | null
  target_precision: string | null
  energy: string | null
  budget_level: string | null
  budget_min_cents: number | null
  budget_max_cents: number | null
  time_estimate: string | null
  mode: string | null
  seasons: string[]
  place: string | null
}

export type SmartAnswersRow = {
  specific: string | null
  measurable: string | null
  achievable: string | null
  obstacle: string | null
  if_then: string | null
  relevant: string | null
  time_bound: string | null
  assembled_sentence: string | null
  assembled_edited: boolean
}

const qualifyColumns =
  'difficulty, preparation, horizon, target_date, target_precision, energy, budget_level, budget_min_cents, budget_max_cents, time_estimate, mode, seasons, place'

const emptySmart: SmartAnswersRow = {
  specific: null,
  measurable: null,
  achievable: null,
  obstacle: null,
  if_then: null,
  relevant: null,
  time_bound: null,
  assembled_sentence: null,
  assembled_edited: false,
}

/** Everything the sheet and the detail page need, with signed image URLs. */
export async function getGoalSheet(id: string): Promise<GoalSheet | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('goals')
    .select(
      `${cardColumns}, hue, description_doc, imagined_outcome, where_with, why, benefits, first_step, notes, visibility, ${qualifyColumns}, goal_values(value_key, custom_label), goal_media(id, kind, url, title, alt_text, storage_path, position), goal_tags(tags(label)), smart_answers(*), goal_status_history(note, changed_at, id), cat_items:goal_categories(position, categories(id, key, label, hue))`,
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
    goal_tags: { tags: { label: string } | null }[]
    smart_answers: SmartAnswersRow | SmartAnswersRow[] | null
    goal_status_history: { note: string | null; changed_at: string; id: number }[]
    cat_items: { position: number; categories: CategoryItem | null }[]
  } & GoalQualify

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
    qualify: Object.fromEntries(
      qualifyColumns.split(', ').map((c) => [c, row[c as keyof GoalQualify]]),
    ) as GoalQualify,
    categoryItems: row.cat_items
      .toSorted((a, b) => a.position - b.position)
      .map((c) => c.categories)
      .filter((c): c is CategoryItem => Boolean(c)),
    tags: row.goal_tags.map((t) => t.tags?.label).filter((l): l is string => Boolean(l)),
    smart: (() => {
      const raw = Array.isArray(row.smart_answers) ? row.smart_answers[0] : row.smart_answers
      if (!raw) return emptySmart
      const picked = Object.fromEntries(
        Object.keys(emptySmart).map((k) => [
          k,
          (raw as Record<string, unknown>)[k] ?? emptySmart[k as keyof SmartAnswersRow],
        ]),
      )
      return picked as SmartAnswersRow
    })(),
    statusNote:
      row.goal_status_history.toSorted(
        (a, b) => b.changed_at.localeCompare(a.changed_at) || b.id - a.id,
      )[0]?.note ?? null,
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

/** System categories (minus hidden ones) followed by the person's own. */
export async function listCategories(): Promise<CategoryItem[]> {
  const supabase = await createClient()
  const [{ data: categories }, { data: hidden }] = await Promise.all([
    supabase
      .from('categories')
      .select('id, key, label, hue, owner_id, sort_order')
      .order('sort_order')
      .order('created_at'),
    supabase.from('hidden_categories').select('category_id'),
  ])
  const hiddenIds = new Set((hidden ?? []).map((h) => h.category_id))
  return (categories ?? [])
    .filter((c) => !hiddenIds.has(c.id))
    .toSorted((a, b) => Number(a.owner_id !== null) - Number(b.owner_id !== null))
    .map((c) => ({ id: c.id, key: c.key as CategoryKey | null, label: c.label, hue: c.hue }))
}

export async function listTagLabels(): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('tags').select('label').order('label').limit(200)
  return (data ?? []).map((t) => t.label)
}

/** Search, filters and sort from the URL (docs/screens/05 phase 4). RLS keeps it to the viewer's wishes. */
export async function searchGoals(query: ListQuery) {
  const supabase = await createClient()
  const select =
    query.category.length > 0
      ? `${cardColumns}, cat_filter:goal_categories!inner(category_id)`
      : cardColumns
  let request = supabase.from('goals').select(select).is('deleted_at', null)

  if (query.q) {
    // Full text (French, accent-insensitive) or a plain substring of the title.
    request = request.or(`search_vector.wfts(fr_unaccent).${query.q},title.ilike.*${query.q}*`)
  }
  for (const quick of query.quick) request = request.or(quickFilterExpression[quick])
  if (query.status.length) request = request.in('status', query.status)
  if (query.difficulty.length) request = request.in('difficulty', query.difficulty)
  if (query.preparation.length) request = request.in('preparation', query.preparation)
  if (query.horizon.length) request = request.in('horizon', query.horizon)
  if (query.energy.length) request = request.in('energy', query.energy)
  if (query.budget.length) request = request.in('budget_level', query.budget)
  if (query.category.length) request = request.in('cat_filter.category_id', query.category)

  switch (query.sort) {
    case 'created':
      request = request.order('created_at', { ascending: false })
      break
    case 'title':
      request = request.order('title', { ascending: true })
      break
    case 'target':
      request = request
        .order('target_date', { ascending: true, nullsFirst: false })
        .order('updated_at', { ascending: false })
      break
    case 'easiest':
      request = request
        .order('difficulty', { ascending: true, nullsFirst: false })
        .order('updated_at', { ascending: false })
      break
    default:
      request = request.order('updated_at', { ascending: false })
  }

  const { data, error } = await request.limit(500)
  if (error) throw error
  return (data as unknown as Row[]).map(toSummary)
}
