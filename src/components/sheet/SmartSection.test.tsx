import { act, fireEvent, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithIntl } from '@/test/render'
import { emptySmartAnswers } from './fixtures'
import { SmartSection } from './SmartSection'

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  localStorage.clear()
})
afterEach(() => vi.useRealTimers())

const goalId = '0192f3a4-7b1c-7d2e-8f3a-123456789abc'

describe('SmartSection', () => {
  it('saves each answer with the sentence assembled from it', async () => {
    const send = vi.fn().mockResolvedValue({ version: 2 })
    renderWithIntl(<SmartSection goalId={goalId} initial={emptySmartAnswers} send={send} />)
    fireEvent.change(screen.getByLabelText(/^Que veux-tu accomplir précisément/), {
      target: { value: 'Courir 5 km d’affilée' },
    })
    await act(() => vi.advanceTimersByTimeAsync(800))
    expect(send.mock.calls[0]?.[0]).toEqual({
      specific: 'Courir 5 km d’affilée',
      assembled_sentence: 'Courir 5 km d’affilée.',
    })
  })

  it('walks the five questions, then shows the sentence and the clarity cue', () => {
    renderWithIntl(
      <SmartSection
        goalId={goalId}
        initial={{ ...emptySmartAnswers, specific: 'x', relevant: 'y' }}
        send={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Suivant' }))
    fireEvent.click(screen.getByRole('button', { name: 'Suivant' }))
    expect(screen.getByLabelText(/^Si cet obstacle arrive/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Suivant' }))
    fireEvent.click(screen.getByRole('button', { name: 'Suivant' }))
    fireEvent.click(screen.getByRole('button', { name: 'Voir ma phrase' }))
    expect(
      screen.getByText(/2 critères sur 5 renseignés\. C’est un repère, pas une note\./),
    ).toBeInTheDocument()
  })

  it('never overwrites a sentence the person edited, until asked', async () => {
    const send = vi.fn().mockResolvedValue({ version: 2 })
    renderWithIntl(
      <SmartSection
        goalId={goalId}
        initial={{
          ...emptySmartAnswers,
          specific: 'Courir',
          assembled_sentence: 'Ma phrase à moi.',
          assembled_edited: true,
        }}
        send={send}
      />,
    )
    fireEvent.change(screen.getByLabelText(/^Que veux-tu accomplir précisément/), {
      target: { value: 'Courir 10 km' },
    })
    await act(() => vi.advanceTimersByTimeAsync(800))
    expect(send.mock.calls[0]?.[0]).toEqual({ specific: 'Courir 10 km' })
    for (let i = 0; i < 5; i++)
      fireEvent.click(screen.getAllByRole('button', { name: /Suivant|Voir ma phrase/ })[0]!)
    fireEvent.click(screen.getByRole('button', { name: 'Réassembler à partir de mes réponses' }))
    expect(screen.getByRole('textbox', { name: 'Ta phrase' })).toHaveValue('Courir 10 km.')
  })
})
