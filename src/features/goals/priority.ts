/*
 * Helping to choose what to do next (D-061). No score shown, no ranking of the
 * person: only an order for the list and a calm "À anticiper" badge.
 */

const horizonRank: Record<string, number> = { short: 0, medium: 1, long: 2, someday: 3 }
const preparationRank: Record<string, number> = {
  very_heavy: 0,
  heavy: 1,
  medium: 2,
  light: 3,
  none: 4,
}
const settled = new Set(['done', 'let_go'])
const heavy = new Set(['heavy', 'very_heavy'])

type Prioritised = {
  horizon?: string | null
  preparation?: string | null
  status?: string | null
}

/** Weeks or months of preparation, for a wish still ahead: better start early. */
export function needsEarlyStart({ horizon, preparation, status }: Prioritised): boolean {
  return Boolean(
    preparation && heavy.has(preparation) && horizon !== 'someday' && !settled.has(status ?? ''),
  )
}

/**
 * "À l'horizon" order: wishes still ahead first; among them the nearest horizon,
 * then the heaviest preparation; undated ones after; done and let go last.
 * Stable for ties, so the incoming order (most recently touched) breaks them.
 */
export function byPriority<T extends Prioritised>(goals: readonly T[]): T[] {
  const key = (g: T) => [
    settled.has(g.status ?? '') ? 1 : 0,
    g.horizon ? (horizonRank[g.horizon] ?? 4) : 4,
    g.preparation ? (preparationRank[g.preparation] ?? 5) : 5,
  ]
  return goals.toSorted((a, b) => {
    const [ka, kb] = [key(a), key(b)]
    for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i]) return ka[i]! - kb[i]!
    return 0
  })
}
