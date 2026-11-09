import { describe, expect, it } from 'vitest'
import { categoryKeys, goalStatuses, valueKeys } from '@/features/goals/schema'
import { frMessages, loadMessages } from './messages'

function keys(obj: unknown, prefix = ''): string[] {
  if (!obj || typeof obj !== 'object') return [prefix]
  return Object.entries(obj).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k))
}

const forbidden = [
  /abandonn/i,
  /en retard/i,
  /échou/i,
  /incomplet/i,
  /erreur ?!/i,
  /félicitations/i,
]

describe('messages', () => {
  it('has a French label for every category, status and value', () => {
    for (const k of categoryKeys) expect(frMessages.goal.categories[k]).toBeTruthy()
    for (const s of goalStatuses) expect(frMessages.goal.statuses[s]).toBeTruthy()
    for (const v of valueKeys) expect(frMessages.goal.values[v]).toBeTruthy()
  })

  it('only contains English keys that exist in French', async () => {
    const fr = new Set(keys(frMessages))
    const en = await loadMessages('en')
    for (const key of keys(en)) expect(fr.has(key)).toBe(true)
  })

  it('falls back to French for missing English messages', async () => {
    const en = await loadMessages('en')
    expect(en.common.actions.keep).toBe('Keep')
    expect(en.goal.statuses.idea).toBe(frMessages.goal.statuses.idea)
  })

  it('avoids the guilt-inducing vocabulary listed in docs/principles.md', () => {
    const text = JSON.stringify(frMessages)
    for (const pattern of forbidden) expect(text).not.toMatch(pattern)
  })
})
