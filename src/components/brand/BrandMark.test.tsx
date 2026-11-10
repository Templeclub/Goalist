import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BrandMark } from './BrandMark'

describe('BrandMark', () => {
  it('is named when it stands alone', () => {
    render(<BrandMark label="Boosteur" />)
    expect(screen.getByRole('img', { name: 'Boosteur' })).toHaveAttribute('src', '/icons/mark.svg')
  })

  it('is hidden from screen readers next to the written name', () => {
    const { container } = render(<BrandMark />)
    expect(screen.queryByRole('img')).toBeNull()
    expect(container.querySelector('img')).toHaveAttribute('aria-hidden', 'true')
  })
})
