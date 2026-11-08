/** Sections of the full sheet (docs/screens/03-full-sheet-flow.md). */
export const flowSections = [
  'name',
  'describe',
  'why',
  'smart',
  'qualify',
  'first-steps',
  'review',
] as const
export type FlowSection = (typeof flowSections)[number]

export function isFlowSection(value: string): value is FlowSection {
  return (flowSections as readonly string[]).includes(value)
}

export function nextSection(section: FlowSection): FlowSection | null {
  const i = flowSections.indexOf(section)
  return flowSections[i + 1] ?? null
}

/** Maps completeness sections to the flow screen that fills them. */
export const sectionForMissing: Record<string, FlowSection | undefined> = {
  describe: 'describe',
  why: 'why',
  smart: 'smart',
  qualify: 'qualify',
  first_steps: 'first-steps',
}

/** "Compléter la fiche" opens the first section still to fill. */
export function firstSectionToComplete(
  missing: readonly string[],
  hasTagline: boolean,
): FlowSection {
  if (!hasTagline) return 'name'
  for (const m of ['describe', 'why', 'smart', 'qualify', 'first_steps']) {
    if (missing.includes(m)) return sectionForMissing[m]!
  }
  return 'review'
}
