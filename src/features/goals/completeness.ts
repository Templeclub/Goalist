import type { CompletenessLevel } from './schema'

/** Sections of the full sheet that can be "à compléter" (docs/screens/03-full-sheet-flow.md). */
export const sheetSections = ['describe', 'why', 'smart', 'qualify', 'first_steps'] as const
export type SheetSection = (typeof sheetSections)[number]

export type CompletenessInput = {
  description_text?: string | null
  imagined_outcome?: string | null
  where_with?: string | null
  why?: string | null
  benefits?: string | null
  first_step?: string | null
  notes?: string | null
  difficulty?: number | null
  preparation?: string | null
  horizon?: string | null
  energy?: string | null
  budget_level?: string | null
  time_estimate?: string | null
  mode?: string | null
  seasons?: readonly string[] | null
  place?: string | null
  valueCount?: number
  categoryCount?: number
  smartFilledCount?: number
}

const filled = (v: string | null | undefined) => typeof v === 'string' && v.trim().length > 0

function sectionFilled(section: SheetSection, g: CompletenessInput): boolean {
  switch (section) {
    case 'describe':
      return filled(g.description_text) || filled(g.imagined_outcome) || filled(g.where_with)
    case 'why':
      return filled(g.why) || filled(g.benefits) || (g.valueCount ?? 0) > 0
    case 'smart':
      return (g.smartFilledCount ?? 0) >= 3
    case 'qualify':
      return (
        g.difficulty != null ||
        [g.preparation, g.horizon, g.energy, g.budget_level, g.time_estimate, g.mode].some(
          (v) => v != null,
        ) ||
        (g.seasons?.length ?? 0) > 0 ||
        filled(g.place) ||
        (g.categoryCount ?? 0) > 0
      )
    case 'first_steps':
      return filled(g.first_step) || filled(g.notes)
  }
}

/**
 * Qualitative completeness (D-021). A guide, never an obligation:
 * - sketch: fewer than 2 sections
 * - on_track: at least 2 sections
 * - well_filled: at least 4 sections, including "why"
 */
export function computeCompleteness(goal: CompletenessInput): {
  level: CompletenessLevel
  missing: SheetSection[]
} {
  const done = sheetSections.filter((s) => sectionFilled(s, goal))
  const missing = sheetSections.filter((s) => !done.includes(s))
  const level: CompletenessLevel =
    done.length >= 4 && done.includes('why')
      ? 'well_filled'
      : done.length >= 2
        ? 'on_track'
        : 'sketch'
  return { level, missing }
}
