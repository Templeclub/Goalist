import { act, fireEvent, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithIntl } from '@/test/render'
import { GoalNameEditor } from './GoalNameEditor'

beforeEach(() => {
  vi.useFakeTimers()
  localStorage.clear()
})
afterEach(() => vi.useRealTimers())

const props = {
  goalId: '0192f3a4-7b1c-7d2e-8f3a-123456789abc',
  version: 1,
  title: 'Courir',
  tagline: null,
  emoji: null,
}

describe('GoalNameEditor', () => {
  it('autosaves the title after a short pause', async () => {
    const send = vi.fn().mockResolvedValue({ version: 2 })
    renderWithIntl(<GoalNameEditor {...props} send={send} />)
    fireEvent.change(screen.getByRole('textbox', { name: 'Titre de l’envie' }), {
      target: { value: 'Courir 5 km' },
    })
    await act(() => vi.advanceTimersByTimeAsync(700))
    expect(send).toHaveBeenCalledWith({ title: 'Courir 5 km' }, 1, expect.any(String), {})
  })

  it('never sends an empty title and says why', async () => {
    const send = vi.fn().mockResolvedValue({ version: 2 })
    renderWithIntl(<GoalNameEditor {...props} send={send} />)
    fireEvent.change(screen.getByRole('textbox', { name: 'Titre de l’envie' }), {
      target: { value: '  ' },
    })
    await act(() => vi.advanceTimersByTimeAsync(1000))
    expect(send).not.toHaveBeenCalled()
    expect(screen.getByText(/garde toujours un titre/)).toBeInTheDocument()
  })

  it('clears the tagline with null', async () => {
    const send = vi.fn().mockResolvedValue({ version: 2 })
    renderWithIntl(<GoalNameEditor {...props} tagline="Sous les étoiles" send={send} />)
    fireEvent.change(screen.getByRole('textbox', { name: 'Accroche' }), { target: { value: '' } })
    await act(() => vi.advanceTimersByTimeAsync(700))
    expect(send.mock.calls[0]?.[0]).toEqual({ tagline: null })
  })
})
