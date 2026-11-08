import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithIntl } from '@/test/render'
import { CompletenessMeter } from './CompletenessMeter'
import { SaveIndicator } from './SaveIndicator'

describe('CompletenessMeter', () => {
  it('always shows a qualitative label, never a percentage', () => {
    const { container } = renderWithIntl(<CompletenessMeter level="on_track" />)
    expect(screen.getByText('Fiche en bonne voie')).toBeInTheDocument()
    expect(container.textContent).not.toMatch(/%/)
  })
})

describe('SaveIndicator', () => {
  it('announces the state politely', () => {
    renderWithIntl(<SaveIndicator state="offline" />)
    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toHaveTextContent('Hors ligne, gardé sur cet appareil')
  })
})
