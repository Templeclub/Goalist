import type { NextRequest } from 'next/server'
import { PatchProfileBody } from '@/features/goals/api-schema'
import { json, problem, readBody } from '@/lib/http'
import { createClient } from '@/lib/supabase/server'

/** Profile autosave (pseudo, theme) and onboarding milestone. */
export async function PATCH(request: NextRequest) {
  const body = await readBody(request, PatchProfileBody)
  if (!body) return problem(422, 'invalid_patch')

  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims?.sub
  if (!userId) return problem(401, 'unauthenticated')

  const update: {
    display_name?: string | null
    onboarding_completed_at?: string
    theme?: 'system' | 'light' | 'dark'
  } = {}
  if (body.displayName !== undefined) update.display_name = body.displayName || null
  if (body.onboardingCompleted) update.onboarding_completed_at = new Date().toISOString()
  if (body.theme) update.theme = body.theme

  const { data, error } = await supabase
    .from('profiles')
    .update(update)
    .eq('id', userId)
    .select('updated_at')
    .maybeSingle()
  if (error) return problem(error.code === '23514' ? 422 : 500, 'update_failed')
  if (!data) return problem(404, 'not_found')

  // Profiles have no version column: the client only needs a monotonic counter.
  return json({ version: Date.parse(data.updated_at) })
}
