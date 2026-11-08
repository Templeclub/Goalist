import { beforeEach, describe, expect, it, vi } from 'vitest'
import { addPendingCapture, readPendingCaptures, replayPendingCaptures } from './pending-captures'

beforeEach(() => localStorage.clear())

describe('pending captures (offline)', () => {
  it('keeps captures across reloads and de-duplicates by id', () => {
    addPendingCapture({ id: 'a', title: 'Un' })
    addPendingCapture({ id: 'a', title: 'Un (retapé)' })
    addPendingCapture({ id: 'b', title: 'Deux' })
    expect(readPendingCaptures().map((c) => c.title)).toEqual(['Un (retapé)', 'Deux'])
  })

  it('replays in order and stops at the first failure, keeping the rest', async () => {
    addPendingCapture({ id: 'a', title: 'Un' })
    addPendingCapture({ id: 'b', title: 'Deux' })
    addPendingCapture({ id: 'c', title: 'Trois' })
    const send = vi.fn().mockResolvedValueOnce({}).mockRejectedValueOnce(new TypeError('offline'))
    expect(await replayPendingCaptures(send)).toBe(1)
    expect(readPendingCaptures().map((c) => c.id)).toEqual(['b', 'c'])
    expect(await replayPendingCaptures(vi.fn().mockResolvedValue({}))).toBe(2)
    expect(readPendingCaptures()).toEqual([])
  })
})
