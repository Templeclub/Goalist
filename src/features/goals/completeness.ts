import type { CompletenessLevel } from './schema'

/**
 * Sections of the sheet that can be "à compléter" (docs/screens/03-full-sheet-flow.md, D-060):
 * - describe: a category or a description (the "L'envie" screen)
 * - why: a reason or what it would bring
 * - smart: what it takes and when (preparation, budget, horizon, season)
 * - first_steps: the first small step
 */
export const sheetSections = ['describe', 'why', 'smart', 'first_steps'] as const
export type SheetSection = (typeof sheetSections)[number]

export type CompletenessInput = {
  description_text?: string | null
  why?: string | null
  first_step?: string | null
  preparation?: string | null
  horizon?: string | null
  budget_level?: string | null
  seasons?: readonly string[] | null
  achievable?: string | null
  valueCount?: number
  categoryCount?: number
}

const filled = (v: string | null | undefined) => typeof v === 'string' && v.trim().length > 0

function sectionFilled(section: SheetSection, g: CompletenessInput): boolean {
  switch (section) {
    case 'describe':
      return (g.categoryCount ?? 0) > 0 || filled(g.description_text)
    case 'why':
      return filled(g.why) || (g.valueCount ?? 0) > 0
    case 'smart':
      return (
        filled(g.achievable) ||
        [g.preparation, g.horizon, g.budget_level].some((v) => v != null) ||
        (g.seasons?.length ?? 0) > 0
      )
    case 'first_steps':
      return filled(g.first_step)
  }
}

/**
 * Qualitative completeness (D-021, D-060). A guide, never an obligation:
 * - sketch: fewer than 2 sections
 * - on_track: at least 2 sections
 * - well_filled: at least 3 sections, including "why"
 */
export function computeCompleteness(goal: CompletenessInput): {
  level: CompletenessLevel
  missing: SheetSection[]
} {
  const done = sheetSections.filter((s) => sectionFilled(s, goal))
  const missing = sheetSections.filter((s) => !done.includes(s))
  const level: CompletenessLevel =
    done.length >= 3 && done.includes('why')
      ? 'well_filled'
      : done.length >= 2
        ? 'on_track'
        : 'sketch'
  return { level, missing }
}
