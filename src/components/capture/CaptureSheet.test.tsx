import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithIntl } from '@/test/render'
import { CaptureSheet } from './CaptureSheet'

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

function Harness({ onKeep }: { onKeep: () => void }) {
  const [value, setValue] = useState('')
  return (
    <CaptureSheet
      open
      onOpenChange={() => {}}
      value={value}
      onValueChange={setValue}
      onKeep={onKeep}
      showConsent
    />
  )
}

describe('CaptureSheet', () => {
  it('keeps nothing while the field is empty, then keeps on Enter', async () => {
    const user = userEvent.setup()
    const onKeep = vi.fn()
    renderWithIntl(<Harness onKeep={onKeep} />)
    const keep = screen.getByRole('button', { name: 'Garder' })
    expect(keep).toBeDisabled()
    const field = screen.getByRole('textbox', { name: 'Ton envie' })
    await user.type(field, 'Apprendre le violoncelle{Enter}')
    expect(onKeep).toHaveBeenCalledTimes(1)
    expect(field).toHaveValue('Apprendre le violoncelle')
  })

  it('offers examples to tap while the field is empty', async () => {
    const user = userEvent.setup()
    renderWithIntl(<Harness onKeep={() => {}} />)
    await user.click(screen.getByRole('button', { name: /Dormir une nuit/ }))
    expect(screen.getByRole('textbox', { name: 'Ton envie' })).toHaveValue(
      'Dormir une nuit à la belle étoile',
    )
    expect(
      screen.queryByRole('button', { name: /Apprendre à faire son pain/ }),
    ).not.toBeInTheDocument()
  })

  it('shows the 15+ / privacy sentence with the very first wish', () => {
    renderWithIntl(<Harness onKeep={() => {}} />)
    expect(screen.getByText(/15 ans ou plus/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'politique de confidentialité' })).toHaveAttribute(
      'href',
      '/privacy',
    )
  })
})
