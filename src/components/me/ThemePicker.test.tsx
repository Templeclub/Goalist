import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithIntl } from '@/test/render'
import { ThemePicker } from './ThemePicker'

beforeEach(() => {
  localStorage.clear()
  delete document.documentElement.dataset.theme
  delete document.documentElement.dataset.motion
})

describe('ThemePicker', () => {
  it('applies the chosen theme at once and saves it on the account', () => {
    const save = vi.fn().mockResolvedValue({})
    renderWithIntl(<ThemePicker save={save} />)
    expect(screen.getByRole('radio', { name: 'Automatique' })).toBeChecked()
    fireEvent.click(screen.getByRole('radio', { name: 'Sombre' }))
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem('elan:theme')).toBe('dark')
    expect(save).toHaveBeenCalledWith('dark')
    fireEvent.click(screen.getByRole('radio', { name: 'Automatique' }))
    expect(document.documentElement.dataset.theme).toBeUndefined()
  })

  it('uses the account theme on a device that has none', () => {
    renderWithIntl(<ThemePicker accountTheme="light" save={vi.fn()} />)
    expect(screen.getByRole('radio', { name: 'Clair' })).toBeChecked()
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('turns card animations off on this device', () => {
    renderWithIntl(<ThemePicker save={vi.fn()} />)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Animations des cartes' }))
    expect(document.documentElement.dataset.motion).toBe('reduced')
    expect(localStorage.getItem('elan:motion')).toBe('reduced')
  })
})
