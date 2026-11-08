import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithIntl } from '@/test/render'
import { ONBOARDED_KEY, OnboardingFlow } from './OnboardingFlow'

describe('OnboardingFlow', () => {
  it('walks through three screens and remembers it was seen', async () => {
    const user = userEvent.setup()
    const onDone = vi.fn()
    renderWithIntl(<OnboardingFlow onDone={onDone} />)
    expect(screen.getByRole('heading', { name: 'Un carnet pour tes envies' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Continuer' }))
    await user.click(screen.getByRole('button', { name: 'Continuer' }))
    expect(screen.getByRole('heading', { name: 'Rien ne presse' })).toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'Écrire ma première envie' }))
    expect(onDone).toHaveBeenCalled()
    expect(localStorage.getItem(ONBOARDED_KEY)).toBe('1')
  })

  it('can be skipped at any time', async () => {
    const user = userEvent.setup()
    const onDone = vi.fn()
    renderWithIntl(<OnboardingFlow onDone={onDone} />)
    await user.click(screen.getByRole('button', { name: 'Passer' }))
    expect(onDone).toHaveBeenCalled()
  })
})
