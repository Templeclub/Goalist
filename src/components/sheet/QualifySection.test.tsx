import { act, fireEvent, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithIntl } from '@/test/render'
import { emptyQualify } from './fixtures'
import { QualifySection } from './QualifySection'

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  localStorage.clear()
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, json: async () => ({ version: 2 }) }),
  )
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

const props = {
  goalId: '0192f3a4-7b1c-7d2e-8f3a-123456789abc',
  qualify: emptyQualify,
  categories: [
    { id: 'c1', key: 'travel' as const, label: null, hue: 60 },
    { id: 'c2', key: null, label: 'Astronomie', hue: 240 },
  ],
  selectedCategoryIds: [],
  tags: [],
  tagSuggestions: ['bivouac'],
  onCategoriesChange: vi.fn(),
}

describe('QualifySection', () => {
  it('patches each criterion, and can clear it again', () => {
    const onPatch = vi.fn()
    renderWithIntl(<QualifySection {...props} onPatch={onPatch} />)
    fireEvent.click(screen.getByRole('radio', { name: 'Exigeant' }))
    fireEvent.click(screen.getByRole('radio', { name: 'Exigeant' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Été' }))
    expect(onPatch.mock.calls.map((c) => c[0])).toEqual([
      { difficulty: 3 },
      { difficulty: null },
      { seasons: ['summer'] },
    ])
  })

  it('offers system and personal categories, and saves the selection in order', async () => {
    renderWithIntl(<QualifySection {...props} onPatch={vi.fn()} />)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Astronomie' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Voyage & aventure' }))
    await act(() => vi.advanceTimersByTimeAsync(800))
    const call = vi.mocked(fetch).mock.calls.find(([url]) => String(url).endsWith('/categories'))
    expect(JSON.parse(String(call?.[1]?.body))).toEqual({ ids: ['c2', 'c1'] })
  })

  it('adds tags with Enter, without duplicates', async () => {
    renderWithIntl(<QualifySection {...props} onPatch={vi.fn()} />)
    const input = screen.getByLabelText(/^Tags/)
    fireEvent.change(input, { target: { value: 'été' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    fireEvent.change(input, { target: { value: 'Été' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.getAllByRole('button', { name: /Retirer le tag/ })).toHaveLength(1)
    await act(() => vi.advanceTimersByTimeAsync(800))
    const call = vi.mocked(fetch).mock.calls.find(([url]) => String(url).endsWith('/tags'))
    expect(JSON.parse(String(call?.[1]?.body))).toEqual({ labels: ['été'] })
  })
})
