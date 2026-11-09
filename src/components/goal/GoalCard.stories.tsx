import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { GoalCard, GoalCardSkeleton } from './GoalCard'

const meta = {
  title: 'Envies/GoalCard',
  component: GoalCard,
  parameters: { layout: 'padded' },
  args: {
    title: 'Dormir une nuit à la belle étoile',
    emoji: '🏕️',
    categories: ['travel'],
    status: 'confirmed',
    horizon: 'medium',
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
export const AAnticiper: Story = {
  name: 'À anticiper',
  args: { horizon: 'long', preparation: 'heavy', status: 'idea' },
}
export const CategoriePerso: Story = {
  name: 'Catégorie personnelle',
  args: { categories: [], customCategory: { label: 'Astronomie', hue: 240 }, emoji: '🔭' },
}
export const Esquisse: Story = {
  name: 'Esquisse (titre seul)',
  args: { emoji: null, categories: [], status: 'idea', horizon: null },
}
export const JusteGardee: Story = { name: 'Juste gardée', args: { justKept: true } }

/** The list grid: two cards per row on a phone, more on a wider screen. */
export const Grille: Story = {
  name: 'Grille (liste)',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="w-[min(100vw,80rem)] p-4">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="grid w-full grid-cols-2 gap-2.5 sm:gap-3.5 md:grid-cols-3 lg:grid-cols-4">
      <GoalCard
        size="compact"
        title="Dormir une nuit à la belle étoile"
        emoji="🏕️"
        categories={['travel']}
        status="confirmed"
        horizon="short"
      />
      <GoalCard
        size="compact"
        title="Apprendre le violoncelle"
        emoji="🎸"
        categories={['creative']}
        status="idea"
        horizon="long"
        preparation="very_heavy"
      />
      <GoalCard
        size="compact"
        title="Organiser un repas de quartier avec toute la rue et les voisins d’en face"
        emoji="🥂"
        categories={['social']}
        status="preparing"
        horizon="medium"
      />
      <GoalCard
        size="compact"
        title="Courir 5 km d’affilée"
        emoji="🏃"
        categories={['sport_health']}
        status="done"
      />
      <GoalCard size="compact" title="Une idée en vrac" />
      <GoalCardSkeleton />
    </div>
  ),
}
