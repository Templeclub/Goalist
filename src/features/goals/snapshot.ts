import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import type { Database, Json } from '@/lib/supabase/database.types'

/** Fields kept in a revision snapshot and restorable (D-007). */
export const snapshotFields = [
  'title',
  'tagline',
  'emoji',
  'hue',
  'description_doc',
  'description_text',
  'imagined_outcome',
  'where_with',
  'why',
  'benefits',
  'first_step',
  'notes',
  'status',
] as const

const Snapshot = z.object({
  goal: z.record(z.string(), z.unknown()),
  values: z.array(
    z.object({ value_key: z.string().nullable(), custom_label: z.string().nullable() }),
  ),
})

export type Snapshot = z.infer<typeof Snapshot>

export async function takeSnapshot(
  supabase: SupabaseClient<Database>,
  goalId: string,
): Promise<Snapshot | null> {
  const { data } = await supabase
    .from('goals')
    .select(`${snapshotFields.join(', ')}, goal_values(value_key, custom_label)`)
    .eq('id', goalId)
    .is('deleted_at', null)
    .maybeSingle()
  if (!data) return null
  const { goal_values, ...goal } = data as unknown as Record<string, unknown> & {
    goal_values: Snapshot['values']
  }
  return { goal, values: goal_values }
}

export async function saveRevision(
  supabase: SupabaseClient<Database>,
  goalId: string,
  reason: 'section_exit' | 'review' | 'interval' | 'restore',
) {
  const snapshot = await takeSnapshot(supabase, goalId)
  if (!snapshot) return null
  const { data, error } = await supabase
    .from('goal_revisions')
    .insert({ goal_id: goalId, reason, snapshot: snapshot as unknown as Json })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export function parseSnapshot(value: unknown) {
  const parsed = Snapshot.safeParse(value)
  if (!parsed.success) return null
  const goal = Object.fromEntries(
    Object.entries(parsed.data.goal).filter(([k]) =>
      (snapshotFields as readonly string[]).includes(k),
    ),
  )
  return { goal, values: parsed.data.values }
}
