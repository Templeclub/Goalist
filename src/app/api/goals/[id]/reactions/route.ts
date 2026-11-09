import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { ReactionBody, reactionKinds } from '@/features/friends/schema'
import { socialContext, statusOf } from '@/features/friends/route-helpers'
import { json, problem, readBody } from '@/lib/http'

/** Encourage a friend's shared card (bravo, courage, ça m'inspire). */
export async function POST(request: NextRequest, ctx: RouteContext<'/api/goals/[id]/reactions'>) {
  const { id } = await ctx.params
  const body = await readBody(request, ReactionBody)
  if (!body || !z.uuid().safeParse(id).success) return problem(422, 'invalid_body')
  const { supabase, userId } = await socialContext()
  if (!userId) return problem(401, 'unauthenticated')
  const { error } = await supabase
    .from('reactions')
    .insert({ goal_id: id, author_id: userId, kind: body.kind })
  // Already there: the encouragement stands.
  if (error && error.code !== '23505') return problem(statusOf(error.code), 'react_failed')
  return json({ ok: true }, 201)
}

/** Take an encouragement back (`?kind=`). */
export async function DELETE(request: NextRequest, ctx: RouteContext<'/api/goals/[id]/reactions'>) {
  const { id } = await ctx.params
  const kind = z.enum(reactionKinds).safeParse(request.nextUrl.searchParams.get('kind'))
  if (!kind.success || !z.uuid().safeParse(id).success) return problem(422, 'invalid_body')
  const { supabase, userId } = await socialContext()
  if (!userId) return problem(401, 'unauthenticated')
  const { error } = await supabase
    .from('reactions')
    .delete()
    .eq('goal_id', id)
    .eq('author_id', userId)
    .eq('kind', kind.data)
  if (error) return problem(statusOf(error.code), 'react_failed')
  return json({ ok: true })
}
