import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderWithIntl } from '@/test/render'
import { StepSelector } from './StepSelector'

const steps = [
  { value: 1, label: 'Facile', description: 'Facile : sans s’organiser.' },
  { value: 2, label: 'Exigeant', description: 'Exigeant : un peu de courage.' },
] as const

function Harness() {
  const [value, setValue] = useState<number | null>(null)
  return <StepSelector legend="Difficulté" steps={steps} value={value} onChange={setValue} />
}

describe('StepSelector', () => {
  it('shows the description of the chosen level and can be cleared', async () => {
    const user = userEvent.setup()
    renderWithIntl(<Harness />)
    expect(screen.queryByText('Exigeant : un peu de courage.')).not.toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: 'Exigeant' }))
    expect(screen.getByText('Exigeant : un peu de courage.')).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: 'Exigeant' }))
    expect(screen.getByRole('radio', { name: 'Exigeant' })).not.toBeChecked()
  })

  it('supports arrow-key navigation through native radios', async () => {
    const user = userEvent.setup()
    renderWithIntl(<Harness />)
    await user.click(screen.getByRole('radio', { name: 'Facile' }))
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('radio', { name: 'Exigeant' })).toBeChecked()
  })
})
