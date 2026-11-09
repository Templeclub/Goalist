import { describe, expect, it } from 'vitest'
import { byPriority, needsEarlyStart } from './priority'

describe('needsEarlyStart', () => {
  it('flags heavy preparation for a wish still ahead', () => {
    expect(needsEarlyStart({ horizon: 'long', preparation: 'heavy' })).toBe(true)
    expect(needsEarlyStart({ horizon: null, preparation: 'very_heavy' })).toBe(true)
  })

  it('stays quiet for light preparation, "un jour" and settled wishes', () => {
    expect(needsEarlyStart({ horizon: 'short', preparation: 'light' })).toBe(false)
    expect(needsEarlyStart({ horizon: 'someday', preparation: 'heavy' })).toBe(false)
    expect(needsEarlyStart({ horizon: 'long', preparation: 'heavy', status: 'done' })).toBe(false)
  })
})

describe('byPriority', () => {
  it('orders by horizon, then heaviest preparation, settled wishes last', () => {
    const goals = [
      { id: 'done', horizon: 'short', preparation: 'none', status: 'done' },
      { id: 'undated', horizon: null, preparation: null, status: 'idea' },
      { id: 'long', horizon: 'long', preparation: 'light', status: 'idea' },
      { id: 'short-light', horizon: 'short', preparation: 'light', status: 'idea' },
      { id: 'short-heavy', horizon: 'short', preparation: 'heavy', status: 'idea' },
    ]
    expect(byPriority(goals).map((g) => g.id)).toEqual([
      'short-heavy',
      'short-light',
      'long',
      'undated',
      'done',
    ])
  })

  it('keeps the incoming order for ties', () => {
    const goals = [
      { id: 'a', horizon: 'medium' },
      { id: 'b', horizon: 'medium' },
    ]
    expect(byPriority(goals).map((g) => g.id)).toEqual(['a', 'b'])
  })
})
