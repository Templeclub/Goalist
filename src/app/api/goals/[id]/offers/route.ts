import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { OfferBody } from '@/features/friends/schema'
import { socialContext, statusOf } from '@/features/friends/route-helpers'
import { json, problem, readBody } from '@/lib/http'

/** « Je peux aider »: an offer only the card's owner sees. */
export async function POST(request: NextRequest, ctx: RouteContext<'/api/goals/[id]/offers'>) {
  const { id } = await ctx.params
  const body = await readBody(request, OfferBody)
  if (!body || !z.uuid().safeParse(id).success) return problem(422, 'invalid_body')
  const { supabase, userId } = await socialContext()
  if (!userId) return problem(401, 'unauthenticated')
  const { data, error } = await supabase
    .from('contribution_offers')
    .insert({ goal_id: id, author_id: userId, message: body.message || null })
    .select('id')
    .single()
  if (error) return problem(statusOf(error.code), 'offer_failed')
  return json({ id: data.id }, 201)
}
