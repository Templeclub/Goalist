/** Sections of the sheet (docs/screens/03-full-sheet-flow.md, D-060). */
export const flowSections = ['name', 'why', 'smart', 'first-steps'] as const
export type FlowSection = (typeof flowSections)[number]

export function isFlowSection(value: string): value is FlowSection {
  return (flowSections as readonly string[]).includes(value)
}

/** Sections of the former seven-step flow, kept so old links still land somewhere sensible. */
export const legacySections: Record<string, FlowSection> = {
  describe: 'name',
  qualify: 'smart',
  review: 'first-steps',
}

export function nextSection(section: FlowSection): FlowSection | null {
  const i = flowSections.indexOf(section)
  return flowSections[i + 1] ?? null
}

/** Maps completeness sections to the flow screen that fills them. */
export const sectionForMissing: Record<string, FlowSection | undefined> = {
  describe: 'name',
  why: 'why',
  smart: 'smart',
  first_steps: 'first-steps',
}

/** "Compléter la fiche" opens the first section still to fill. */
export function firstSectionToComplete(missing: readonly string[]): FlowSection {
  for (const m of ['describe', 'why', 'smart', 'first_steps']) {
    if (missing.includes(m)) return sectionForMissing[m]!
  }
  return 'name'
}
