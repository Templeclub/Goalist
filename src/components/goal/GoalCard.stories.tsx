import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { GoalCard, GoalCardSkeleton } from './GoalCard'

const meta = {
  title: 'Envies/GoalCard',
  component: GoalCard,
  parameters: { layout: 'padded' },
  args: {
    title: 'Dormir une nuit à la belle étoile',
    tagline: 'Voir la Voie lactée de mes propres yeux, sans tente.',
    emoji: '🌌',
    categories: ['travel'],
    status: 'confirmed',
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GoalCard>

export default meta
type Story = StoryObj<typeof meta>

export const Large: Story = {}
export const AvecLien: Story = { name: 'Cliquable', args: { href: '/goals/123' } }
export const Compacte: Story = { args: { size: 'compact' } }
export const Esquisse: Story = {
  name: 'Esquisse (titre seul)',
  args: { tagline: null, emoji: null, categories: [], status: 'idea' },
}
export const JusteGardee: Story = { name: 'Juste gardée', args: { justKept: true } }

export const Carnet: Story = {
  name: 'Plusieurs envies',
  render: () => (
    <div className="grid gap-3.5">
      <GoalCard
        title="Dormir une nuit à la belle étoile"
        tagline="Voir la Voie lactée de mes propres yeux, sans tente."
        emoji="🌌"
        categories={['travel']}
        status="confirmed"
      />
      <GoalCard
        title="Apprendre le violoncelle"
        tagline="Jouer un morceau entier pour les 80 ans de ma grand-mère."
        emoji="🎻"
        categories={['creative']}
        status="idea"
      />
      <GoalCard
        title="Organiser un repas de quartier"
        tagline="Que la rue se connaisse un peu mieux."
        emoji="🍲"
        categories={['social']}
        status="preparing"
      />
      <GoalCard
        title="Courir 5 km d’affilée"
        emoji="🏃"
        categories={['sport_health']}
        status="done"
      />
      <GoalCardSkeleton />
    </div>
  ),
}
