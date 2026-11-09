import { connection } from 'next/server'
import { newInviteCode } from '@/features/friends/schema'
import { socialContext, statusOf } from '@/features/friends/route-helpers'
import { json, problem } from '@/lib/http'

/** My personal invite link, or null before the first one (a GET never creates anything). */
export async function GET() {
  await connection()
  const { supabase, userId, anonymous } = await socialContext()
  if (!userId) return problem(401, 'unauthenticated')
  if (anonymous) return problem(403, 'account_required')
  const { data } = await supabase.from('friend_invites').select('code').maybeSingle()
  return json({ code: data?.code ?? null })
}

/** Create the link, or renew it: the previous one stops working. */
export async function POST() {
  const { supabase, userId, anonymous } = await socialContext()
  if (!userId) return problem(401, 'unauthenticated')
  if (anonymous) return problem(403, 'account_required')
  const code = newInviteCode()
  const { error } = await supabase
    .from('friend_invites')
    .upsert({ owner_id: userId, code, created_at: new Date().toISOString() })
  if (error) return problem(statusOf(error.code), 'invite_failed')
  return json({ code })
}
