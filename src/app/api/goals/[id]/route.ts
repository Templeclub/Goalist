import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { PatchGoalBody } from '@/features/goals/api-schema'
import { computeCompleteness } from '@/features/goals/completeness'
import { json, problem, readBody } from '@/lib/http'
import { createClient } from '@/lib/supabase/server'

const Id = z.uuid()

/**
 * Field-level autosave (D-005). Last write wins per field; the response says
 * whether the record had moved on since `baseVersion`.
 */
export async function PATCH(request: NextRequest, ctx: RouteContext<'/api/goals/[id]'>) {
  const { id } = await ctx.params
  if (!Id.safeParse(id).success) return problem(404, 'not_found')

  const body = await readBody(request, PatchGoalBody)
  if (!body) return problem(422, 'invalid_patch')

  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims?.claims?.sub) return problem(401, 'unauthenticated')

  const { data: current } = await supabase
    .from('goals')
    .select(
      'version, description_text, imagined_outcome, where_with, why, benefits, first_step, notes, difficulty, preparation, horizon, energy, budget_level, time_estimate, mode, seasons, place, goal_values(count), goal_categories(count)',
    )
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle()
  if (!current) return problem(404, 'not_found')

  const counts = current as unknown as {
    goal_values: { count: number }[]
    goal_categories: { count: number }[]
  }
  const { level, missing } = computeCompleteness({
    ...current,
    ...body.patch,
    valueCount: counts.goal_values[0]?.count ?? 0,
    categoryCount: counts.goal_categories[0]?.count ?? 0,
  })

  const { data: updated, error } = await supabase
    .from('goals')
    .update({ ...body.patch, completeness_level: level, missing_sections: missing })
    .eq('id', id)
    .select('version')
    .maybeSingle()

  if (error) return problem(error.code === '23514' ? 422 : 500, 'update_failed')
  if (!updated) return problem(404, 'not_found')

  return json({
    version: updated.version,
    completenessLevel: level,
    missingSections: missing,
    conflict: current.version !== body.baseVersion,
  })
}
