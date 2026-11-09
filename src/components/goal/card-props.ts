import type { GoalSummary } from '@/features/goals/queries'
import type { GoalCardData } from './GoalCard'

/** Everything a card shows, taken from a wish summary. */
export function cardProps(
  goal: GoalSummary,
  acquiredNumber?: number,
): GoalCardData & { title: string } {
  return {
    title: goal.title,
    emoji: goal.emoji,
    categories: goal.categories,
    customCategory: goal.customCategory,
    status: goal.status,
    horizon: goal.horizon,
    preparation: goal.preparation,
    budgetLevel: goal.budgetLevel,
    firstStep: goal.firstStep,
    completenessLevel: goal.completenessLevel,
    acquired:
      goal.status === 'done' && acquiredNumber
        ? { number: acquiredNumber, at: goal.statusChangedAt }
        : null,
    hue: goal.ribbonHue,
  }
}
