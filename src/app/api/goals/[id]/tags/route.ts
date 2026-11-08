import type { NextRequest } from 'next/server'
import { PutTagsBody } from '@/features/goals/api-schema'
import { goalContext, refreshSearchExtra } from '@/features/goals/route-helpers'
import { json, problem, readBody } from '@/lib/http'

/** Replaces the goal's tags; unknown labels become new personal tags. */
export async function PUT(request: NextRequest, ctx: RouteContext<'/api/goals/[id]/tags'>) {
  const { id } = await ctx.params
  const context = await goalContext(id)
  if (!context) return problem(404, 'not_found')
  if (!context.userId) return problem(401, 'unauthenticated')
  const body = await readBody(request, PutTagsBody)
  if (!body) return problem(422, 'invalid_body')
  const { supabase, userId } = context

  const labels = [...new Map(body.labels.map((l) => [l.toLowerCase(), l])).values()]
  let tagIds: string[] = []
  if (labels.length > 0) {
    const { data, error } = await supabase
      .from('tags')
      .upsert(
        labels.map((label) => ({ owner_id: userId, label })),
        { onConflict: 'owner_id,label_normalized', ignoreDuplicates: false },
      )
      .select('id')
    if (error) return problem(error.code === '42501' ? 403 : 500, 'update_failed')
    tagIds = data.map((t) => t.id)
  }
  const { error: deleteError } = await supabase.from('goal_tags').delete().eq('goal_id', id)
  if (deleteError) return problem(500, 'update_failed')
  if (tagIds.length > 0) {
    const { error } = await supabase
      .from('goal_tags')
      .insert(tagIds.map((tag_id) => ({ goal_id: id, tag_id })))
    if (error) return problem(error.code === '42501' ? 403 : 500, 'update_failed')
  }
  const { data: updated } = await supabase
    .from('goals')
    .update({ search_extra: await refreshSearchExtra(supabase, id) })
    .eq('id', id)
    .select('version')
    .maybeSingle()
  return json({ version: updated?.version ?? 0 })
}
