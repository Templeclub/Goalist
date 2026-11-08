import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { json, problem, readBody } from '@/lib/http'
import { createClient } from '@/lib/supabase/server'
// The single allowed use of the admin module from a route (D-002, CLAUDE.md rule 6).
// eslint-disable-next-line no-restricted-imports
import { deleteAccount } from '@/server/admin/delete-account'

const Body = z.object({ confirm: z.literal('supprimer') })

/** Self-service account deletion (RGPD). Requires typing the confirmation word. */
export async function DELETE(request: NextRequest) {
  const body = await readBody(request, Body)
  if (!body) return problem(422, 'confirmation_required')
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub
  if (!userId) return problem(401, 'unauthenticated')
  try {
    await deleteAccount(userId)
  } catch {
    return problem(500, 'delete_failed')
  }
  await supabase.auth.signOut()
  return json({ ok: true })
}
