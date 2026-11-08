import { describe, expect, it } from 'vitest'
import { computeCompleteness } from './completeness'

describe('computeCompleteness', () => {
  it('a title alone is a sketch, with every section left to fill', () => {
    expect(computeCompleteness({})).toEqual({
      level: 'sketch',
      missing: ['describe', 'why', 'smart', 'qualify', 'first_steps'],
    })
  })

  it('ignores whitespace-only answers', () => {
    expect(computeCompleteness({ why: '   ', description_text: '\n' }).level).toBe('sketch')
  })

  it('two sections make the sheet "on track"', () => {
    const result = computeCompleteness({ description_text: 'Un plateau du Vercors', difficulty: 3 })
    expect(result.level).toBe('on_track')
    expect(result.missing).toEqual(['why', 'smart', 'first_steps'])
  })

  it('needs "why" among four sections to be "well filled"', () => {
    const withoutWhy = {
      description_text: 'x',
      difficulty: 2,
      first_step: 'y',
      smartFilledCount: 3,
    }
    expect(computeCompleteness(withoutWhy).level).toBe('on_track')
    expect(computeCompleteness({ ...withoutWhy, valueCount: 1 }).level).toBe('well_filled')
  })
})
