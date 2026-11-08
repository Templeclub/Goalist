import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { computeCompleteness, type CompletenessInput } from './completeness'

const columns =
  'version, description_text, imagined_outcome, where_with, why, benefits, first_step, notes, difficulty, preparation, horizon, energy, budget_level, time_estimate, mode, seasons, place, goal_values(count), goal_categories(count)'

type Counted = { goal_values: { count: number }[]; goal_categories: { count: number }[] }

/** Reads what completeness depends on (RLS applies). Null when the goal is not visible. */
export async function readCompletenessInput(supabase: SupabaseClient<Database>, goalId: string) {
  const { data } = await supabase
    .from('goals')
    .select(columns)
    .eq('id', goalId)
    .is('deleted_at', null)
    .maybeSingle()
  if (!data) return null
  const counted = data as unknown as Counted & CompletenessInput & { version: number }
  return {
    version: counted.version,
    input: {
      ...counted,
      valueCount: counted.goal_values[0]?.count ?? 0,
      categoryCount: counted.goal_categories[0]?.count ?? 0,
    } as CompletenessInput,
  }
}

export function completenessColumns(input: CompletenessInput) {
  const { level, missing } = computeCompleteness(input)
  return { completeness_level: level, missing_sections: missing }
}
