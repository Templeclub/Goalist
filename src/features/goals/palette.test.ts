import { describe, expect, it } from 'vitest'
import { categoryIcon, statusIcon } from '@/components/goal/icons'
import { toneProps } from '@/components/goal/tone'
import { categoryHue, statusTone } from './palette'
import { categoryKeys, goalStatuses } from './schema'

describe('palette', () => {
  it('gives every category a distinct hue (except "other"), an icon and a label key', () => {
    const hues = categoryKeys.map((k) => categoryHue[k]).filter((h) => h !== null)
    expect(new Set(hues).size).toBe(12)
    for (const key of categoryKeys) expect(categoryIcon[key]).toBeDefined()
  })

  it('never uses a red hue for a status', () => {
    for (const status of goalStatuses) {
      expect(statusIcon[status]).toBeDefined()
      const tone = statusTone[status]
      if (typeof tone === 'number') expect(tone < 20 || tone > 345).toBe(false)
    }
  })

  it('builds tone attributes', () => {
    expect(toneProps(null)).toEqual({ 'data-tone': 'neutral' })
    expect(toneProps(60)).toEqual({ 'data-tone': 'hue', style: { '--h': 60 } })
    expect(toneProps('accent')).toEqual({ 'data-tone': 'accent' })
  })
})
