import type { GoalStatus } from './schema'

/*
 * The path of a card (D-063): Idée → Confirmée → En préparation → En cours → Acquise.
 * "En pause" and "Rangée" step aside from it, and can always come back.
 */

export const pathSteps = ['idea', 'confirmed', 'preparing', 'in_progress', 'done'] as const
export type PathStep = (typeof pathSteps)[number]

/** Index on the path, or null when the card stepped aside (paused, let go). */
export function stepIndex(status: GoalStatus): number | null {
  const i = (pathSteps as readonly string[]).indexOf(status)
  return i === -1 ? null : i
}

/** The step the main button leads to, or null at the end of the path. */
export function nextStep(status: GoalStatus): PathStep | null {
  const i = stepIndex(status)
  if (status === 'paused') return 'in_progress'
  if (i === null) return null
  return pathSteps[i + 1] ?? null
}
