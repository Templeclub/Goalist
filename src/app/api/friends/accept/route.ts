import type { NextRequest } from 'next/server'
import { AcceptInviteBody } from '@/features/friends/schema'
import { socialContext, statusOf } from '@/features/friends/route-helpers'
import { json, problem, readBody } from '@/lib/http'

/** Accept a friend's invite link: the friendship is mutual and immediate. */
export async function POST(request: NextRequest) {
  const body = await readBody(request, AcceptInviteBody)
  if (!body) return problem(422, 'invalid_body')
  const { supabase, userId, anonymous } = await socialContext()
  if (!userId) return problem(401, 'unauthenticated')
  if (anonymous) return problem(403, 'account_required')
  const { data, error } = await supabase.rpc('accept_friend_invite', { invite_code: body.code })
  if (error) {
    if (error.code === '22023') return problem(409, 'own_invite')
    return problem(
      statusOf(error.code),
      error.code === 'P0002' ? 'invite_not_found' : 'accept_failed',
    )
  }
  return json({ friendId: data })
}
