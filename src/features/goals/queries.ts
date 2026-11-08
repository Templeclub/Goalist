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
