import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { json, problem } from '@/lib/http'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<'/api/goals/[id]/media/[mediaId]'>,
) {
  const { id, mediaId } = await ctx.params
  if (!z.uuid().safeParse(id).success || !z.uuid().safeParse(mediaId).success)
    return problem(404, 'not_found')

  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims?.claims?.sub) return problem(401, 'unauthenticated')

  const { data } = await supabase
    .from('goal_media')
    .delete()
    .eq('id', mediaId)
    .eq('goal_id', id)
    .select('storage_path')
    .maybeSingle()
  if (!data) return problem(404, 'not_found')
  // Storage RLS lets the owner remove their own file.
  if (data.storage_path) await supabase.storage.from('goal-media').remove([data.storage_path])
  return json({ ok: true })
}
