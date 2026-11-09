import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { socialContext, statusOf } from '@/features/friends/route-helpers'
import { json, problem } from '@/lib/http'

/** Remove a message: its author, or the card's owner (RLS decides). */
export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<'/api/goals/[id]/comments/[commentId]'>,
) {
  const { id, commentId } = await ctx.params
  if (!z.uuid().safeParse(id).success || !z.uuid().safeParse(commentId).success)
    return problem(404, 'not_found')
  const { supabase, userId } = await socialContext()
  if (!userId) return problem(401, 'unauthenticated')
  const { error } = await supabase.from('comments').delete().eq('id', commentId).eq('goal_id', id)
  if (error) return problem(statusOf(error.code), 'delete_failed')
  return json({ ok: true })
}
