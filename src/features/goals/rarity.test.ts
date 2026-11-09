import { describe, expect, it } from 'vitest'
import { gemCount, rarityOf, rarityPoints } from './rarity'

describe('rarity', () => {
  it('is common for a title alone', () => {
    expect(rarityOf({})).toBe('common')
    expect(gemCount(rarityOf({}))).toBe(1)
  })

  it('adds preparation, budget and horizon', () => {
    expect(rarityPoints({ preparation: 'heavy', budget_level: 'medium', horizon: 'medium' })).toBe(
      6,
    )
  })

  it.each([
    [{ preparation: 'light', budget_level: 'none', horizon: 'short' }, 'common'],
    [{ preparation: 'medium', horizon: 'short' }, 'uncommon'],
    [{ preparation: 'medium', budget_level: 'low', horizon: 'medium' }, 'rare'],
    [{ preparation: 'heavy', budget_level: 'medium', horizon: 'medium' }, 'epic'],
    [{ preparation: 'very_heavy', budget_level: 'medium', horizon: 'long' }, 'legendary'],
    [{ preparation: 'very_heavy', budget_level: 'high', horizon: 'long' }, 'legendary'],
  ] as const)('%o → %s', (input, rarity) => {
    expect(rarityOf(input)).toBe(rarity)
  })
})
