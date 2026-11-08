import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpError, PatchQueue } from './patch-queue'

type P = { title?: string; tagline?: string | null }

beforeEach(() => {
  vi.useFakeTimers()
  localStorage.clear()
})
afterEach(() => vi.useRealTimers())

describe('PatchQueue', () => {
  it('debounces and merges changes into one patch', async () => {
    const send = vi.fn().mockResolvedValue({ version: 2 })
    const q = new PatchQueue<P>({ send, version: 1 })
    q.set('title', 'Dor')
    q.set('title', 'Dormir')
    q.set('tagline', 'Sous les étoiles')
    await vi.advanceTimersByTimeAsync(700)
    expect(send).toHaveBeenCalledTimes(1)
    expect(send.mock.calls[0]?.[0]).toEqual({ title: 'Dormir', tagline: 'Sous les étoiles' })
    expect(send.mock.calls[0]?.[1]).toBe(1)
    q.dispose()
  })

  it('shows "saving" only after 400 ms, then "saved"', async () => {
    const states: string[] = []
    let resolve!: (v: { version: number }) => void
    const send = vi.fn(() => new Promise<{ version: number }>((r) => (resolve = r)))
    const q = new PatchQueue<P>({ send, version: 1, onState: (s) => states.push(s) })
    q.set('title', 'A')
    await vi.advanceTimersByTimeAsync(300)
    expect(states).toEqual([])
    await vi.advanceTimersByTimeAsync(500)
    expect(states).toEqual(['saving'])
    resolve({ version: 2 })
    await vi.advanceTimersByTimeAsync(0)
    expect(states).toEqual(['saving', 'saved'])
    q.dispose()
  })

  it('goes offline on a network error, keeps the change and retries', async () => {
    const states: string[] = []
    const send = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValueOnce({ version: 2 })
    const q = new PatchQueue<P>({
      send,
      version: 1,
      onState: (s) => states.push(s),
      storageKey: 'k',
    })
    q.set('title', 'Garder')
    await vi.advanceTimersByTimeAsync(700)
    expect(states.at(-1)).toBe('offline')
    expect(JSON.parse(localStorage.getItem('k')!).patch).toEqual({ title: 'Garder' })
    await vi.advanceTimersByTimeAsync(2000)
    expect(send).toHaveBeenCalledTimes(2)
    expect(states.at(-1)).toBe('saved')
    expect(localStorage.getItem('k')).toBeNull()
    q.dispose()
  })

  it('a newer edit made while offline wins over the failed one', async () => {
    const send = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('offline'))
      .mockResolvedValue({ version: 2 })
    const q = new PatchQueue<P>({ send, version: 1 })
    q.set('title', 'Ancien')
    await vi.advanceTimersByTimeAsync(700)
    q.set('title', 'Nouveau')
    await vi.advanceTimersByTimeAsync(2000)
    expect(send.mock.calls.at(-1)?.[0]).toEqual({ title: 'Nouveau' })
    q.dispose()
  })

  it('restores unsent changes after a reload', async () => {
    localStorage.setItem('k', JSON.stringify({ patch: { title: 'Pas perdu' }, baseVersion: 3 }))
    const send = vi.fn().mockResolvedValue({ version: 4 })
    const q = new PatchQueue<P>({ send, version: 3, storageKey: 'k' })
    await vi.advanceTimersByTimeAsync(0)
    expect(send).toHaveBeenCalledWith({ title: 'Pas perdu' }, 3, expect.any(String), {})
    q.dispose()
  })

  it('drops a patch refused for good instead of looping', async () => {
    const onRejected = vi.fn()
    const send = vi.fn().mockRejectedValue(new HttpError(422))
    const q = new PatchQueue<P>({ send, version: 1, onRejected })
    q.set('title', 'x')
    await vi.advanceTimersByTimeAsync(10_000)
    expect(send).toHaveBeenCalledTimes(1)
    expect(onRejected).toHaveBeenCalledWith({ title: 'x' })
    q.dispose()
  })

  it('uses the version returned by the server as the next base', async () => {
    const send = vi.fn().mockResolvedValueOnce({ version: 5 }).mockResolvedValueOnce({ version: 6 })
    const q = new PatchQueue<P>({ send, version: 4 })
    q.set('title', 'A')
    await vi.advanceTimersByTimeAsync(700)
    q.set('title', 'B')
    await vi.advanceTimersByTimeAsync(700)
    expect(send.mock.calls[1]?.[1]).toBe(5)
    q.dispose()
  })
})
