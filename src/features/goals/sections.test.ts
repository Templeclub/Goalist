import { describe, expect, it } from 'vitest'
import { firstSectionToComplete, isFlowSection, legacySections, nextSection } from './sections'

describe('flow sections', () => {
  it('walks the four sections in order', () => {
    expect(nextSection('name')).toBe('why')
    expect(nextSection('why')).toBe('smart')
    expect(nextSection('smart')).toBe('first-steps')
    expect(nextSection('first-steps')).toBeNull()
    expect(isFlowSection('smart')).toBe(true)
    expect(isFlowSection('qualify')).toBe(false)
  })

  it('sends links to the former sections somewhere sensible', () => {
    expect(legacySections.describe).toBe('name')
    expect(legacySections.qualify).toBe('smart')
    expect(legacySections.review).toBe('first-steps')
  })

  it('reopens the sheet at the first section still to fill', () => {
    expect(firstSectionToComplete(['describe', 'why'])).toBe('name')
    expect(firstSectionToComplete(['why', 'smart'])).toBe('why')
    expect(firstSectionToComplete(['first_steps'])).toBe('first-steps')
    expect(firstSectionToComplete([])).toBe('name')
  })
})
