import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithIntl } from '@/test/render'
import { GoalCard } from './GoalCard'

describe('GoalCard', () => {
  it('names the category, the horizon and the status in words, not only with colour', () => {
    renderWithIntl(
      <GoalCard
        title="Dormir une nuit à la belle étoile"
        categories={['travel']}
        status="let_go"
        horizon="short"
      />,
    )
    expect(
      screen.getByRole('heading', { name: 'Dormir une nuit à la belle étoile' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Voyage & aventure')).toBeInTheDocument()
    expect(screen.getByText('Bientôt')).toBeInTheDocument()
    expect(screen.getByText('Lâché consciemment')).toBeInTheDocument()
  })

  it('shows the category emoji when the wish has none', () => {
    renderWithIntl(<GoalCard title="Une envie" categories={['home']} />)
    expect(screen.getByText('🏡')).toBeInTheDocument()
  })

  it('flags a heavy preparation for a wish still ahead', () => {
    renderWithIntl(<GoalCard title="Le GR20" horizon="long" preparation="heavy" />)
    expect(screen.getByText('À anticiper')).toBeInTheDocument()
  })

  it('keeps the "idea" status quiet and uses a neutral ribbon without category', () => {
    const { container } = renderWithIntl(<GoalCard title="Une envie" status="idea" />)
    expect(screen.queryByText('Idée')).not.toBeInTheDocument()
    expect(container.querySelector('article')).toHaveAttribute('data-tone', 'neutral')
  })
})
