import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { CreateMediaBody } from '@/features/goals/api-schema'
import { json, problem, readBody } from '@/lib/http'
import { createClient } from '@/lib/supabase/server'

/** Adds an inspiration image (already uploaded to the private bucket) or link. */
export async function POST(request: NextRequest, ctx: RouteContext<'/api/goals/[id]/media'>) {
  const { id } = await ctx.params
  if (!z.uuid().safeParse(id).success) return problem(404, 'not_found')
  const body = await readBody(request, CreateMediaBody)
  if (!body) return problem(422, 'invalid_media')

  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims?.sub
  if (!userId) return problem(401, 'unauthenticated')

  if (body.kind === 'image' && !body.storagePath.startsWith(`${userId}/${id}/`)) {
    return problem(403, 'forbidden')
  }

  const { count } = await supabase
    .from('goal_media')
    .select('id', { count: 'exact', head: true })
    .eq('goal_id', id)
  const row = {
    goal_id: id,
    kind: body.kind,
    position: count ?? 0,
    storage_path: body.kind === 'image' ? body.storagePath : null,
    alt_text: body.kind === 'image' ? (body.altText ?? null) : null,
    url: body.kind === 'link' ? body.url : null,
    title: body.kind === 'link' ? (body.title ?? null) : null,
  }

  const { data, error } = await supabase.from('goal_media').insert(row).select('id').single()
  if (error) return problem(error.code === '42501' ? 403 : 500, 'insert_failed')
  return json({ id: data.id }, 201)
}
