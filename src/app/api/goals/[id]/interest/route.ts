import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { socialContext, statusOf } from '@/features/friends/route-helpers'
import { json, problem } from '@/lib/http'

/** « Moi aussi » on a friend's shared card. */
export async function POST(_request: NextRequest, ctx: RouteContext<'/api/goals/[id]/interest'>) {
  const { id } = await ctx.params
  if (!z.uuid().safeParse(id).success) return problem(404, 'not_found')
  const { supabase, userId } = await socialContext()
  if (!userId) return problem(401, 'unauthenticated')
  const { error } = await supabase.from('interest_signals').insert({ goal_id: id, user_id: userId })
  if (error && error.code !== '23505') return problem(statusOf(error.code), 'interest_failed')
  return json({ ok: true }, 201)
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<'/api/goals/[id]/interest'>) {
  const { id } = await ctx.params
  if (!z.uuid().safeParse(id).success) return problem(404, 'not_found')
  const { supabase, userId } = await socialContext()
  if (!userId) return problem(401, 'unauthenticated')
  const { error } = await supabase
    .from('interest_signals')
    .delete()
    .eq('goal_id', id)
    .eq('user_id', userId)
  if (error) return problem(statusOf(error.code), 'interest_failed')
  return json({ ok: true })
}
