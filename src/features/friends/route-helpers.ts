import 'server-only'
import { createClient } from '@/lib/supabase/server'

/** The signed-in person behind a social request; RLS does the rest (D-064). */
export async function socialContext() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub ?? null
  const anonymous = data?.claims?.is_anonymous === true
  return { supabase, userId, anonymous }
}

/** Postgres error → HTTP status: RLS refusal 403, unique 409, check 422, else 500. */
export function statusOf(code: string | undefined) {
  if (code === '42501') return 403
  if (code === '23505') return 409
  if (code === '23514' || code === '22P02') return 422
  if (code === 'P0002') return 404
  return 500
}
