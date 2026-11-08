import type { NextRequest } from 'next/server'
import { CreateCategoryBody } from '@/features/goals/api-schema'
import { json, problem, readBody } from '@/lib/http'
import { createClient } from '@/lib/supabase/server'

/** Creates a personal category (label + one of the 12 hues). */
export async function POST(request: NextRequest) {
  const body = await readBody(request, CreateCategoryBody)
  if (!body) return problem(422, 'invalid_body')
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims?.sub
  if (!userId) return problem(401, 'unauthenticated')

  const { data, error } = await supabase
    .from('categories')
    .insert({ owner_id: userId, label: body.label, hue: body.hue, icon: 'shapes' })
    .select('id, label, hue')
    .single()
  if (error)
    return problem(
      error.code === '23505' ? 409 : error.code === '42501' ? 403 : 500,
      error.code === '23505' ? 'exists' : 'insert_failed',
    )
  return json(data, 201)
}
