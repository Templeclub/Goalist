import { describe, expect, it } from 'vitest'
import { firstSectionToComplete, isFlowSection, nextSection } from './sections'

describe('flow sections', () => {
  it('walks the phase 2 sections in order', () => {
    expect(nextSection('name')).toBe('describe')
    expect(nextSection('first-steps')).toBe('review')
    expect(nextSection('review')).toBeNull()
    expect(isFlowSection('smart')).toBe(false)
  })

  it('reopens the sheet at the first section still to fill', () => {
    expect(firstSectionToComplete(['describe', 'why'], false)).toBe('name')
    expect(firstSectionToComplete(['why', 'smart', 'qualify'], true)).toBe('why')
    expect(firstSectionToComplete(['smart', 'qualify'], true)).toBe('review')
  })
})
