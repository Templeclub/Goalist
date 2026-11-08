import type { NextRequest } from 'next/server'
import { CreateGoalBody } from '@/features/goals/api-schema'
import { json, problem, readBody } from '@/lib/http'
import { createClient } from '@/lib/supabase/server'

/**
 * Keep a wish (express capture). Idempotent on the client-generated id, so a
 * replayed request (offline queue, double tap) never creates a duplicate.
 */
export async function POST(request: NextRequest) {
  const body = await readBody(request, CreateGoalBody)
  if (!body) return problem(400, 'invalid_body')

  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims?.sub
  if (!userId) return problem(401, 'unauthenticated')

  const { error } = await supabase
    .from('goals')
    .insert({ id: body.id, owner_id: userId, title: body.title, capture_mode: 'express' })

  if (error && error.code !== '23505') {
    // 42501: RLS refused (e.g. the 50-wish limit of anonymous sessions).
    return problem(
      error.code === '42501' ? 403 : 500,
      error.code === '42501' ? 'forbidden' : 'insert_failed',
    )
  }

  const { data: goal } = await supabase
    .from('goals')
    .select('id, version')
    .eq('id', body.id)
    .maybeSingle()
  if (!goal) return problem(409, 'id_taken')

  // First wish ever: celebrate once, and record the declarations shown at capture.
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_goal_celebrated_at, age_confirmed_at, privacy_accepted_at')
    .eq('id', userId)
    .maybeSingle()

  const now = new Date().toISOString()
  const isFirst = profile ? profile.first_goal_celebrated_at === null : false
  const profileUpdate: {
    first_goal_celebrated_at?: string
    age_confirmed_at?: string
    privacy_accepted_at?: string
  } = {}
  if (isFirst) profileUpdate.first_goal_celebrated_at = now
  if (body.acceptTerms && profile) {
    if (!profile.age_confirmed_at) profileUpdate.age_confirmed_at = now
    if (!profile.privacy_accepted_at) profileUpdate.privacy_accepted_at = now
  }
  if (Object.keys(profileUpdate).length > 0) {
    await supabase.from('profiles').update(profileUpdate).eq('id', userId)
  }

  return json({ id: goal.id, version: goal.version, isFirst }, error ? 200 : 201)
}
