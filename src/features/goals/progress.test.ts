import { describe, expect, it } from 'vitest'
import { nextStep, stepIndex } from './progress'
import { levelOf, statShare } from './rarity'

describe('card path', () => {
  it('walks from idea to acquired', () => {
    expect(nextStep('idea')).toBe('confirmed')
    expect(nextStep('confirmed')).toBe('preparing')
    expect(nextStep('preparing')).toBe('in_progress')
    expect(nextStep('in_progress')).toBe('done')
    expect(nextStep('done')).toBeNull()
  })

  it('resumes a paused card where the work happens', () => {
    expect(stepIndex('paused')).toBeNull()
    expect(nextStep('paused')).toBe('in_progress')
  })

  it('leaves a put-away card off the path', () => {
    expect(stepIndex('let_go')).toBeNull()
    expect(nextStep('let_go')).toBeNull()
  })
})

describe('card level and stats', () => {
  it('is the effort points, at least 1', () => {
    expect(levelOf({})).toBe(1)
    expect(levelOf({ preparation: 'heavy', budget_level: 'medium', horizon: 'medium' })).toBe(6)
  })

  it('fills stat bars by step', () => {
    expect(statShare('preparation', 'none')).toBe(0.2)
    expect(statShare('preparation', 'very_heavy')).toBe(1)
    expect(statShare('budget', 'none')).toBe(0.25)
    expect(statShare('budget', null)).toBe(0)
  })
})
