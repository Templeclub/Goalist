import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { PatchGoalBody } from '@/features/goals/api-schema'
import { completenessColumns, readCompletenessInput } from '@/features/goals/completeness-server'
import { richDocToText } from '@/features/goals/rich-text'
import { json, problem, readBody } from '@/lib/http'
import type { Json } from '@/lib/supabase/database.types'
import { createClient } from '@/lib/supabase/server'

const Id = z.uuid()

/**
 * Field-level autosave (D-005). Last write wins per field; the response says
 * whether the record had moved on since `baseVersion`.
 */
export async function PATCH(request: NextRequest, ctx: RouteContext<'/api/goals/[id]'>) {
  const { id } = await ctx.params
  if (!Id.safeParse(id).success) return problem(404, 'not_found')

  const body = await readBody(request, PatchGoalBody)
  if (!body) return problem(422, 'invalid_patch')

  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims?.claims?.sub) return problem(401, 'unauthenticated')

  const current = await readCompletenessInput(supabase, id)
  if (!current) return problem(404, 'not_found')

  const { description_doc, ...rest } = body.patch
  const update: Record<string, unknown> = { ...rest }
  if (description_doc !== undefined) {
    update.description_doc = description_doc as unknown as Json
    // Derived plain text feeds search and completeness (D-008).
    update.description_text = richDocToText(description_doc) || null
  }
  const completeness = completenessColumns({ ...current.input, ...update })

  const { data: updated, error } = await supabase
    .from('goals')
    .update({ ...update, ...completeness })
    .eq('id', id)
    .select('version')
    .maybeSingle()

  if (error)
    return problem(
      error.code === '23514' ? 422 : error.code === '42501' ? 403 : 500,
      'update_failed',
    )
  if (!updated) return problem(404, 'not_found')

  return json({
    version: updated.version,
    completenessLevel: completeness.completeness_level,
    missingSections: completeness.missing_sections,
    conflict: current.version !== body.baseVersion,
  })
}
