import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithIntl } from '@/test/render'
import { GoalCard } from './GoalCard'

describe('GoalCard', () => {
  it('names the category and the status in words, not only with colour', () => {
    renderWithIntl(
      <GoalCard
        title="Dormir une nuit à la belle étoile"
        categories={['travel']}
        status="let_go"
      />,
    )
    expect(
      screen.getByRole('heading', { name: 'Dormir une nuit à la belle étoile' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Voyage & aventure')).toBeInTheDocument()
    expect(screen.getByText('Lâché consciemment')).toBeInTheDocument()
  })

  it('uses a neutral ribbon when there is no category', () => {
    const { container } = renderWithIntl(<GoalCard title="Une envie" />)
    expect(container.querySelector('article')).toHaveAttribute('data-tone', 'neutral')
  })
})
