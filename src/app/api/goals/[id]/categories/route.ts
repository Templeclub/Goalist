import type { NextRequest } from 'next/server'
import { PutCategoriesBody } from '@/features/goals/api-schema'
import {
  goalContext,
  refreshCompleteness,
  refreshSearchExtra,
} from '@/features/goals/route-helpers'
import { json, problem, readBody } from '@/lib/http'

/** Replaces the goal's categories, in order (the first gives the ribbon its hue). */
export async function PUT(request: NextRequest, ctx: RouteContext<'/api/goals/[id]/categories'>) {
  const { id } = await ctx.params
  const context = await goalContext(id)
  if (!context) return problem(404, 'not_found')
  if (!context.userId) return problem(401, 'unauthenticated')
  const body = await readBody(request, PutCategoriesBody)
  if (!body) return problem(422, 'invalid_body')
  const { supabase } = context

  const { error: deleteError } = await supabase.from('goal_categories').delete().eq('goal_id', id)
  if (deleteError) return problem(500, 'update_failed')
  const ids = [...new Set(body.ids)]
  if (ids.length > 0) {
    const { error } = await supabase
      .from('goal_categories')
      .insert(ids.map((category_id, position) => ({ goal_id: id, category_id, position })))
    // RLS refuses someone else's goal or category.
    if (error) return problem(error.code === '42501' ? 403 : 500, 'update_failed')
  }
  const updated = await refreshCompleteness(supabase, id, {
    search_extra: await refreshSearchExtra(supabase, id),
  })
  return json({ version: updated?.version ?? 0 })
}
