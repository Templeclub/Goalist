import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithIntl } from '@/test/render'
import { GoalCard } from './GoalCard'

describe('GoalCard', () => {
  it('shows title, level, series, rarity and stats in words, not only with colour', () => {
    renderWithIntl(
      <GoalCard
        title="Le tour du Mont-Blanc"
        categories={['sport_health']}
        preparation="heavy"
        budgetLevel="medium"
        horizon="medium"
        status="confirmed"
      />,
    )
    expect(screen.getByRole('heading', { name: 'Le tour du Mont-Blanc' })).toBeInTheDocument()
    expect(screen.getByText('Niv. 6')).toBeInTheDocument()
    expect(screen.getByText('Sport & santé · Épique')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Rareté : Épique' })).toBeInTheDocument()
    expect(screen.getByText('Importante, des semaines')).toBeInTheDocument()
    expect(screen.getByText('Cette année')).toBeInTheDocument()
    expect(screen.getByText('À anticiper')).toBeInTheDocument()
  })

  it('shows where the card stands on its path', () => {
    renderWithIntl(<GoalCard title="Repeindre" categories={['home']} status="in_progress" />)
    expect(screen.getByText('En cours')).toBeInTheDocument()
    expect(screen.getByText('🏡')).toBeInTheDocument()
  })

  it('keeps a sketch hidden until it is revealed', () => {
    const { container } = renderWithIntl(
      <GoalCard
        title="Une envie"
        categories={['travel']}
        completenessLevel="sketch"
        href="/goals/1"
      />,
    )
    expect(container.querySelector('article')).toHaveAttribute('data-state', 'sketch')
    expect(screen.getByText('Voyage & aventure · Esquisse')).toBeInTheDocument()
    expect(screen.getByText('Révéler la carte →')).toBeInTheDocument()
    expect(screen.queryByText(/^Niv\./)).not.toBeInTheDocument()
  })

  it('numbers an acquired card, dates it and makes it holographic', () => {
    const { container } = renderWithIntl(
      <GoalCard
        title="Courir 5 km"
        categories={['sport_health']}
        status="done"
        acquired={{ number: 7, at: '2026-08-03T10:00:00Z' }}
      />,
    )
    const card = container.querySelector('article')
    expect(card).toHaveAttribute('data-state', 'acquired')
    expect(card).toHaveClass('holo')
    expect(screen.getByText('★ n° 007')).toBeInTheDocument()
  })

  it('puts a let-go card away without hiding it', () => {
    renderWithIntl(<GoalCard title="Le violoncelle" categories={['creative']} status="let_go" />)
    expect(screen.getByText('Créatif · Rangée')).toBeInTheDocument()
  })
})
