import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { PutValuesBody } from '@/features/goals/api-schema'
import { completenessColumns, readCompletenessInput } from '@/features/goals/completeness-server'
import { json, problem, readBody } from '@/lib/http'
import { createClient } from '@/lib/supabase/server'

/** Replaces the values ticked in "Le pourquoi" (idempotent). */
export async function PUT(request: NextRequest, ctx: RouteContext<'/api/goals/[id]/values'>) {
  const { id } = await ctx.params
  if (!z.uuid().safeParse(id).success) return problem(404, 'not_found')
  const body = await readBody(request, PutValuesBody)
  if (!body) return problem(422, 'invalid_values')

  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims?.claims?.sub) return problem(401, 'unauthenticated')

  const current = await readCompletenessInput(supabase, id)
  if (!current) return problem(404, 'not_found')

  const { error: deleteError } = await supabase.from('goal_values').delete().eq('goal_id', id)
  if (deleteError) return problem(500, 'update_failed')

  const rows = [
    ...new Set(body.keys).values().map((value_key) => ({ goal_id: id, value_key })),
    ...[...new Set((body.custom ?? []).map((c) => c.trim()))].map((custom_label) => ({
      goal_id: id,
      custom_label,
    })),
  ]
  if (rows.length > 0) {
    const { error } = await supabase.from('goal_values').insert(rows)
    if (error) return problem(error.code === '42501' ? 403 : 500, 'update_failed')
  }

  const completeness = completenessColumns({ ...current.input, valueCount: rows.length })
  const { data: updated } = await supabase
    .from('goals')
    .update(completeness)
    .eq('id', id)
    .select('version')
    .maybeSingle()

  return json({
    version: updated?.version ?? current.version,
    completenessLevel: completeness.completeness_level,
  })
}
