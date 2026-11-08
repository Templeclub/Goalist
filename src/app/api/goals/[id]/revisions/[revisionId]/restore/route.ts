import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { completenessColumns, readCompletenessInput } from '@/features/goals/completeness-server'
import { parseSnapshot, saveRevision } from '@/features/goals/snapshot'
import { json, problem } from '@/lib/http'
import { createClient } from '@/lib/supabase/server'

/** Restores a snapshot. The current state is snapshotted first: nothing is ever lost. */
export async function POST(
  _request: NextRequest,
  ctx: RouteContext<'/api/goals/[id]/revisions/[revisionId]/restore'>,
) {
  const { id, revisionId } = await ctx.params
  if (!z.uuid().safeParse(id).success || !/^\d+$/.test(revisionId)) return problem(404, 'not_found')

  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims?.claims?.sub) return problem(401, 'unauthenticated')

  const { data: revision } = await supabase
    .from('goal_revisions')
    .select('snapshot')
    .eq('id', Number(revisionId))
    .eq('goal_id', id)
    .maybeSingle()
  const snapshot = revision ? parseSnapshot(revision.snapshot) : null
  if (!snapshot) return problem(404, 'not_found')

  try {
    await saveRevision(supabase, id, 'restore')
  } catch {
    return problem(500, 'restore_failed')
  }

  await supabase.from('goal_values').delete().eq('goal_id', id)
  const values = snapshot.values
    .filter((v) => v.value_key || v.custom_label)
    .map((v) => ({ goal_id: id, value_key: v.value_key, custom_label: v.custom_label }))
  if (values.length > 0) await supabase.from('goal_values').insert(values)

  const current = await readCompletenessInput(supabase, id)
  if (!current) return problem(404, 'not_found')
  const completeness = completenessColumns({
    ...current.input,
    ...snapshot.goal,
    valueCount: values.length,
  })
  const { data: updated, error } = await supabase
    .from('goals')
    .update({ ...snapshot.goal, ...completeness })
    .eq('id', id)
    .select('version')
    .maybeSingle()
  if (error || !updated) return problem(500, 'restore_failed')
  return json({ version: updated.version })
}
