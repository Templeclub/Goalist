import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import type { Database } from '@/lib/supabase/database.types'
import { createClient } from '@/lib/supabase/server'
import { completenessColumns, readCompletenessInput } from './completeness-server'

/** Session + goal id check shared by the goal sub-resources. */
export async function goalContext(id: string) {
  if (!z.uuid().safeParse(id).success) return null
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub
  if (!userId) return { supabase, userId: null }
  return { supabase, userId }
}

/** Recomputes completeness after a sub-resource changed; returns the new version. */
export async function refreshCompleteness(
  supabase: SupabaseClient<Database>,
  goalId: string,
  extra: Record<string, unknown> = {},
) {
  const current = await readCompletenessInput(supabase, goalId)
  if (!current) return null
  const { data } = await supabase
    .from('goals')
    .update({ ...completenessColumns(current.input), ...extra })
    .eq('id', goalId)
    .select('version, completeness_level')
    .maybeSingle()
  return data
}

/** Tags and category names are searchable with the wish (D-010). */
export async function refreshSearchExtra(supabase: SupabaseClient<Database>, goalId: string) {
  const { data } = await supabase
    .from('goals')
    .select('goal_tags(tags(label)), goal_categories(categories(key, label))')
    .eq('id', goalId)
    .maybeSingle()
  if (!data) return ''
  const row = data as unknown as {
    goal_tags: { tags: { label: string } | null }[]
    goal_categories: { categories: { key: string | null; label: string | null } | null }[]
  }
  return [
    ...row.goal_tags.map((t) => t.tags?.label),
    ...row.goal_categories.map((c) => c.categories?.label ?? c.categories?.key?.replace('_', ' ')),
  ]
    .filter(Boolean)
    .join(' ')
}
