import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { OfferStatusBody } from '@/features/friends/schema'
import { socialContext, statusOf } from '@/features/friends/route-helpers'
import { json, problem, readBody } from '@/lib/http'

/** The owner accepts or declines an offer; its author can withdraw it (RLS decides). */
export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<'/api/goals/[id]/offers/[offerId]'>,
) {
  const { id, offerId } = await ctx.params
  const body = await readBody(request, OfferStatusBody)
  if (!body || !z.uuid().safeParse(id).success || !z.uuid().safeParse(offerId).success)
    return problem(422, 'invalid_body')
  const { supabase, userId } = await socialContext()
  if (!userId) return problem(401, 'unauthenticated')
  const { data, error } = await supabase
    .from('contribution_offers')
    .update({ status: body.status })
    .eq('id', offerId)
    .eq('goal_id', id)
    .select('id')
    .maybeSingle()
  if (error) return problem(statusOf(error.code), 'offer_failed')
  if (!data) return problem(404, 'not_found')
  return json({ ok: true })
}
