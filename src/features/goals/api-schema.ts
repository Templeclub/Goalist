import { z } from 'zod'
import { LIMITS } from '@/config/app'
import { GoalTitle } from './schema'

/** Fields the autosave may patch. Extended section by section (phases 2 and 3). */
export const GoalPatch = z
  .object({
    title: GoalTitle,
    tagline: z.string().trim().max(LIMITS.taglineMaxLength).nullable(),
    emoji: z.string().trim().max(16).nullable(),
  })
  .partial()
  .strict()
  .refine((patch) => Object.keys(patch).length > 0, { message: 'empty patch' })

export type GoalPatch = z.infer<typeof GoalPatch>

export const PatchGoalBody = z.object({
  patch: GoalPatch,
  baseVersion: z.int().min(1),
  clientMutationId: z.uuid(),
})

export const CreateGoalBody = z.object({
  id: z.uuid(),
  title: GoalTitle,
  /** Sent with the very first wish of a session that saw the consent sentence. */
  acceptTerms: z.literal(true).optional(),
})

export const PatchProfileBody = z
  .object({
    displayName: z.string().trim().max(40).nullable(),
    onboardingCompleted: z.literal(true),
  })
  .partial()
  .strict()

/** Normalises what was typed in the express capture: trims and collapses spaces. */
export function normaliseTitle(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, LIMITS.titleMaxLength)
}
