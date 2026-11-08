import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { CreateRevisionBody } from '@/features/goals/api-schema'
import { saveRevision } from '@/features/goals/snapshot'
import { json, problem, readBody } from '@/lib/http'
import { createClient } from '@/lib/supabase/server'

/** Section exit or review: the server snapshots the current state itself. */
export async function POST(request: NextRequest, ctx: RouteContext<'/api/goals/[id]/revisions'>) {
  const { id } = await ctx.params
  if (!z.uuid().safeParse(id).success) return problem(404, 'not_found')
  const body = await readBody(request, CreateRevisionBody)
  if (!body) return problem(422, 'invalid_body')

  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims?.claims?.sub) return problem(401, 'unauthenticated')

  // Several section exits in a row only need one snapshot every two minutes.
  const { data: last } = await supabase
    .from('goal_revisions')
    .select('created_at')
    .eq('goal_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (
    body.reason === 'section_exit' &&
    last &&
    Date.now() - Date.parse(last.created_at) < 120_000
  ) {
    return json({ id: null, skipped: true })
  }

  try {
    const revisionId = await saveRevision(supabase, id, body.reason)
    return revisionId ? json({ id: revisionId }, 201) : problem(404, 'not_found')
  } catch {
    return problem(500, 'revision_failed')
  }
}
