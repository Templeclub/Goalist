import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { GoalCard, GoalCardSkeleton } from './GoalCard'

const meta = {
  title: 'Envies/GoalCard (carte à collectionner)',
  component: GoalCard,
  parameters: { layout: 'padded' },
  args: {
    title: 'Dormir à la belle étoile',
    emoji: '🏕️',
    categories: ['travel'],
    status: 'confirmed',
    horizon: 'short',
    preparation: 'medium',
    budgetLevel: 'low',
    firstStep: 'Repérer un bivouac autorisé',
    completenessLevel: 'on_track',
  },
  decorators: [
    (Story) => (
      <div className="max-w-xs p-3">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GoalCard>

export default meta
type Story = StoryObj<typeof meta>

export const AConvertir: Story = { name: 'À convertir' }
export const Compacte: Story = { args: { size: 'compact', href: '/goals/1' } }
export const Hero: Story = { args: { size: 'hero', headingLevel: 'h1' } }
export const Esquisse: Story = {
  args: { completenessLevel: 'sketch', href: '/goals/1', horizon: null, firstStep: null },
}
export const Legendaire: Story = {
  name: 'Légendaire, à anticiper',
  args: {
    title: 'Apprendre le violoncelle',
    emoji: '🎸',
    categories: ['creative'],
    preparation: 'very_heavy',
    budgetLevel: 'medium',
    horizon: 'long',
  },
}
export const Acquise: Story = {
  args: {
    title: 'Courir 5 km d’affilée',
    emoji: '🏃',
    categories: ['sport_health'],
    status: 'done',
    acquired: { number: 7, at: '2026-08-03T10:00:00Z' },
  },
}
export const Rangee: Story = { name: 'Rangée', args: { status: 'let_go' } }
export const CategoriePerso: Story = {
  name: 'Série personnelle',
  args: { categories: [], customCategory: { label: 'Astronomie', hue: 240 }, emoji: '🔭' },
}

/** The deck grid: two cards per row on a phone, more on a wider screen. */
export const Grille: Story = {
  name: 'Grille (deck)',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="w-[min(100vw,80rem)] p-4">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="grid w-full grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      <GoalCard
        size="compact"
        href="/goals/1"
        title="Dormir à la belle étoile"
        emoji="🏕️"
        categories={['travel']}
        horizon="short"
        preparation="medium"
        budgetLevel="low"
        firstStep="Repérer un bivouac"
        completenessLevel="on_track"
      />
      <GoalCard
        size="compact"
        href="/goals/2"
        title="Le tour du Mont-Blanc"
        emoji="🥾"
        categories={['sport_health']}
        horizon="medium"
        preparation="heavy"
        budgetLevel="medium"
        completenessLevel="well_filled"
      />
      <GoalCard
        size="compact"
        href="/goals/3"
        title="Écrire à une vieille amie"
        emoji="✍️"
        categories={['creative']}
        completenessLevel="sketch"
      />
      <GoalCard
        size="compact"
        href="/goals/4"
        title="Repeindre la chambre"
        emoji="🏡"
        categories={['home']}
        status="in_progress"
        horizon="short"
        firstStep="Choisir la couleur"
        completenessLevel="on_track"
      />
      <GoalCard
        size="compact"
        href="/goals/5"
        title="Courir 5 km d’affilée"
        emoji="🏃"
        categories={['sport_health']}
        status="done"
        acquired={{ number: 7, at: '2026-08-03T10:00:00Z' }}
      />
      <GoalCardSkeleton />
    </div>
  ),
}
