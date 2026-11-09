/*
 * Card rarity (D-062): what it takes to turn a wish into an acquired card.
 * Preparation, budget and horizon add up to 0–9 points, shown as 1 to 5 gems.
 * Unknown values count for nothing: a sketch is common until it says more.
 */

export const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'] as const
export type Rarity = (typeof rarities)[number]

const preparationPoints: Record<string, number> = {
  none: 0,
  light: 1,
  medium: 2,
  heavy: 3,
  very_heavy: 4,
}
const budgetPoints: Record<string, number> = { none: 0, low: 1, medium: 2, high: 3 }
const horizonPoints: Record<string, number> = { short: 0, medium: 1, someday: 1, long: 2 }

type RarityInput = {
  preparation?: string | null
  budget_level?: string | null
  horizon?: string | null
}

export function rarityPoints({ preparation, budget_level, horizon }: RarityInput): number {
  return (
    (preparation ? (preparationPoints[preparation] ?? 0) : 0) +
    (budget_level ? (budgetPoints[budget_level] ?? 0) : 0) +
    (horizon ? (horizonPoints[horizon] ?? 0) : 0)
  )
}

/** 0–1 common, 2–3 uncommon, 4–5 rare, 6–7 epic, 8–9 legendary. */
export function rarityOf(input: RarityInput): Rarity {
  return rarities[Math.min(4, Math.floor(rarityPoints(input) / 2))]!
}

/** Number of gems shown on the card, 1 to 5. */
export const gemCount = (rarity: Rarity) => rarities.indexOf(rarity) + 1
