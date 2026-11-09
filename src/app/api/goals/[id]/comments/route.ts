import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { CommentBody } from '@/features/friends/schema'
import { socialContext, statusOf } from '@/features/friends/route-helpers'
import { json, problem, readBody } from '@/lib/http'

/** Leave a short message on a friend's shared card. */
export async function POST(request: NextRequest, ctx: RouteContext<'/api/goals/[id]/comments'>) {
  const { id } = await ctx.params
  const body = await readBody(request, CommentBody)
  if (!body || !z.uuid().safeParse(id).success) return problem(422, 'invalid_body')
  const { supabase, userId } = await socialContext()
  if (!userId) return problem(401, 'unauthenticated')
  const { data, error } = await supabase
    .from('comments')
    .insert({ goal_id: id, author_id: userId, body: body.body })
    .select('id, created_at')
    .single()
  if (error) return problem(statusOf(error.code), 'comment_failed')
  return json({ id: data.id, createdAt: data.created_at }, 201)
}
