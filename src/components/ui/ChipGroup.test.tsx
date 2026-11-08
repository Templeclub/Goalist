import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderWithIntl } from '@/test/render'
import { ChipGroup } from './ChipGroup'

const options = [
  { value: 'none', label: 'Aucun' },
  { value: 'low', label: 'Faible' },
  { value: 'high', label: 'Élevé' },
] as const
type V = (typeof options)[number]['value']

function Single({ initial }: { initial: V | null }) {
  const [value, setValue] = useState<V | null>(initial)
  return (
    <ChipGroup type="single" legend="Budget" options={options} value={value} onChange={setValue} />
  )
}

function Multiple() {
  const [value, setValue] = useState<V[]>([])
  return (
    <ChipGroup
      type="multiple"
      legend="Valeurs"
      options={options}
      value={value}
      onChange={setValue}
    />
  )
}

describe('ChipGroup', () => {
  it('exposes a labelled group of native radios', () => {
    renderWithIntl(<Single initial={null} />)
    expect(screen.getByRole('group', { name: 'Budget' })).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(3)
  })

  it('selects, then clears the selection when the chosen chip is tapped again', async () => {
    const user = userEvent.setup()
    renderWithIntl(<Single initial={null} />)
    const low = screen.getByRole('radio', { name: 'Faible' })
    await user.click(low)
    expect(low).toBeChecked()
    await user.click(low)
    expect(low).not.toBeChecked()
  })

  it('switches between options with a single choice', async () => {
    const user = userEvent.setup()
    renderWithIntl(<Single initial="low" />)
    await user.click(screen.getByRole('radio', { name: 'Élevé' }))
    expect(screen.getByRole('radio', { name: 'Élevé' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Faible' })).not.toBeChecked()
  })

  it('toggles several options independently', async () => {
    const user = userEvent.setup()
    renderWithIntl(<Multiple />)
    await user.click(screen.getByRole('checkbox', { name: 'Aucun' }))
    await user.click(screen.getByRole('checkbox', { name: 'Élevé' }))
    expect(screen.getByRole('checkbox', { name: 'Aucun' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Élevé' })).toBeChecked()
    await user.click(screen.getByRole('checkbox', { name: 'Aucun' }))
    expect(screen.getByRole('checkbox', { name: 'Aucun' })).not.toBeChecked()
  })
})
