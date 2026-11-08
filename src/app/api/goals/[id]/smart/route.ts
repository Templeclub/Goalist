import type { NextRequest } from 'next/server'
import { SmartPatch } from '@/features/goals/api-schema'
import { goalContext, refreshCompleteness } from '@/features/goals/route-helpers'
import { json, problem, readBody } from '@/lib/http'

/** SMART answers autosave (1:1 with the goal, upserted). */
export async function PATCH(request: NextRequest, ctx: RouteContext<'/api/goals/[id]/smart'>) {
  const { id } = await ctx.params
  const context = await goalContext(id)
  if (!context) return problem(404, 'not_found')
  if (!context.userId) return problem(401, 'unauthenticated')
  const body = await readBody(request, SmartPatch)
  if (!body) return problem(422, 'invalid_patch')

  const { error } = await context.supabase
    .from('smart_answers')
    .upsert({ goal_id: id, ...body }, { onConflict: 'goal_id' })
  if (error) return problem(error.code === '42501' ? 404 : 500, 'update_failed')
  const updated = await refreshCompleteness(context.supabase, id)
  return json({ version: updated?.version ?? 0, completenessLevel: updated?.completeness_level })
}
