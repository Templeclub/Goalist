import type { NextRequest } from 'next/server'
import { StatusNoteBody } from '@/features/goals/api-schema'
import { goalContext } from '@/features/goals/route-helpers'
import { json, problem, readBody } from '@/lib/http'

/** The optional word left with the latest status change (e.g. when letting go). */
export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<'/api/goals/[id]/status-note'>,
) {
  const { id } = await ctx.params
  const context = await goalContext(id)
  if (!context) return problem(404, 'not_found')
  if (!context.userId) return problem(401, 'unauthenticated')
  const body = await readBody(request, StatusNoteBody)
  if (!body) return problem(422, 'invalid_body')

  const { data: latest } = await context.supabase
    .from('goal_status_history')
    .select('id')
    .eq('goal_id', id)
    .order('changed_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!latest) return problem(404, 'not_found')
  const { error } = await context.supabase
    .from('goal_status_history')
    .update({ note: body.note || null })
    .eq('id', latest.id)
  if (error) return problem(500, 'update_failed')
  return json({ version: Date.now() })
}
