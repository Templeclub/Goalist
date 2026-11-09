import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { socialContext, statusOf } from '@/features/friends/route-helpers'
import { json, problem } from '@/lib/http'

/** Stop being friends: shared cards stop being visible both ways. */
export async function DELETE(_request: NextRequest, ctx: RouteContext<'/api/friends/[id]'>) {
  const { id } = await ctx.params
  if (!z.uuid().safeParse(id).success) return problem(404, 'not_found')
  const { supabase, userId } = await socialContext()
  if (!userId) return problem(401, 'unauthenticated')
  const [low, high] = userId < id ? [userId, id] : [id, userId]
  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('user_low', low)
    .eq('user_high', high)
  if (error) return problem(statusOf(error.code), 'remove_failed')
  return json({ ok: true })
}
