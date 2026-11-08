import { z } from 'zod'
import { LIMITS } from '@/config/app'
import { RichDoc } from './rich-text'
import {
  BudgetLevel,
  Difficulty,
  Energy,
  GoalStatus,
  GoalTitle,
  Horizon,
  Mode,
  Preparation,
  Season,
  TargetPrecision,
  TimeEstimate,
  ValueKey,
} from './schema'

/** Fields the autosave may patch. Extended section by section (phases 2 and 3). */
export const GoalPatch = z
  .object({
    title: GoalTitle,
    tagline: z.string().trim().max(LIMITS.taglineMaxLength).nullable(),
    emoji: z.string().trim().max(16).nullable(),
    hue: z
      .union([
        z.literal(0),
        z.literal(30),
        z.literal(60),
        z.literal(90),
        z.literal(120),
        z.literal(150),
        z.literal(180),
        z.literal(210),
        z.literal(240),
        z.literal(270),
        z.literal(300),
        z.literal(330),
      ])
      .nullable(),
    description_doc: RichDoc.nullable(),
    imagined_outcome: z.string().max(4000).nullable(),
    where_with: z.string().max(1000).nullable(),
    why: z.string().max(4000).nullable(),
    benefits: z.string().max(4000).nullable(),
    first_step: z.string().max(300).nullable(),
    notes: z.string().max(10000).nullable(),
    status: GoalStatus,
    difficulty: Difficulty.nullable(),
    preparation: Preparation.nullable(),
    horizon: Horizon.nullable(),
    target_date: z.iso.date().nullable(),
    target_precision: TargetPrecision.nullable(),
    energy: Energy.nullable(),
    budget_level: BudgetLevel.nullable(),
    budget_min_cents: z.int().min(0).max(100_000_000).nullable(),
    budget_max_cents: z.int().min(0).max(100_000_000).nullable(),
    time_estimate: TimeEstimate.nullable(),
    mode: Mode.nullable(),
    seasons: z.array(Season).max(7),
    place: z.string().trim().max(200).nullable(),
    // Sharing is closed until the community phase (D-013).
    visibility: z.literal('private'),
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

export const PutValuesBody = z.object({
  keys: z.array(ValueKey).max(10),
  custom: z.array(z.string().trim().min(1).max(40)).max(5).optional(),
})

export const RevisionReason = z.enum(['section_exit', 'review'])
export const CreateRevisionBody = z.object({ reason: RevisionReason })

export const CreateMediaBody = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('image'),
    storagePath: z.string().max(300),
    altText: z.string().trim().max(300).nullable().optional(),
  }),
  z.object({
    kind: z.literal('link'),
    url: z.url({ protocol: /^https?$/ }).max(2000),
    title: z.string().trim().max(200).nullable().optional(),
  }),
])

const SmartText = (max: number) => z.string().max(max).nullable()
export const SmartPatch = z
  .object({
    specific: SmartText(1000),
    measurable: SmartText(1000),
    achievable: SmartText(1000),
    obstacle: SmartText(500),
    if_then: SmartText(500),
    relevant: SmartText(1000),
    time_bound: SmartText(500),
    assembled_sentence: SmartText(1500),
    assembled_edited: z.boolean(),
  })
  .partial()
  .strict()
  .refine((p) => Object.keys(p).length > 0, { message: 'empty patch' })
export type SmartPatch = z.infer<typeof SmartPatch>

export const PutCategoriesBody = z.object({ ids: z.array(z.uuid()).max(20) })
export const PutTagsBody = z.object({ labels: z.array(z.string().trim().min(1).max(40)).max(20) })
export const CreateCategoryBody = z.object({
  label: z.string().trim().min(1).max(40),
  hue: z.union([
    z.literal(0),
    z.literal(30),
    z.literal(60),
    z.literal(90),
    z.literal(120),
    z.literal(150),
    z.literal(180),
    z.literal(210),
    z.literal(240),
    z.literal(270),
    z.literal(300),
    z.literal(330),
  ]),
})
/** The note belongs to the change *to* this status; 409 until that change is saved. */
export const StatusNoteBody = z.object({
  note: z.string().trim().max(500).nullable(),
  status: GoalStatus,
})
