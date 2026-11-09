import { describe, expect, it } from 'vitest'
import { computeCompleteness } from './completeness'

describe('computeCompleteness', () => {
  it('a title alone is a sketch, with every section left to fill', () => {
    expect(computeCompleteness({})).toEqual({
      level: 'sketch',
      missing: ['describe', 'why', 'smart', 'first_steps'],
    })
  })

  it('ignores whitespace-only answers', () => {
    expect(computeCompleteness({ why: '   ', description_text: '\n' }).level).toBe('sketch')
  })

  it('a category and a horizon make the sheet "on track"', () => {
    const result = computeCompleteness({ categoryCount: 1, horizon: 'short' })
    expect(result.level).toBe('on_track')
    expect(result.missing).toEqual(['why', 'first_steps'])
  })

  it('needs "why" among three sections to be "well filled"', () => {
    const withoutWhy = { categoryCount: 1, preparation: 'light', first_step: 'y' }
    expect(computeCompleteness(withoutWhy).level).toBe('on_track')
    expect(computeCompleteness({ ...withoutWhy, valueCount: 1 }).level).toBe('well_filled')
  })

  it('"what it takes" alone fills the planning section', () => {
    expect(computeCompleteness({ achievable: 'Des baskets' }).missing).not.toContain('smart')
  })
})
