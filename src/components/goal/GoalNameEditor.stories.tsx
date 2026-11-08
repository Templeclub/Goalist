import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { GoalNameEditor } from './GoalNameEditor'

let version = 3
const meta = {
  title: 'Écrans/Détail, nommer en place',
  component: GoalNameEditor,
  parameters: { layout: 'padded' },
  args: {
    goalId: '0192f3a4-7b1c-7d2e-8f3a-123456789abc',
    version,
    title: 'Dormir une nuit à la belle étoile',
    tagline: 'Voir la Voie lactée de mes propres yeux, sans tente.',
    emoji: '🌌',
    send: async () => {
      await new Promise((r) => setTimeout(r, 700))
      return { version: ++version }
    },
  },
  decorators: [
    (Story) => (
      <div className="paper-dots max-w-2xl p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GoalNameEditor>

export default meta
type Story = StoryObj<typeof meta>

export const Remplie: Story = {}
export const Esquisse: Story = { args: { tagline: null, emoji: null } }
export const HorsLigne: Story = {
  name: 'Hors ligne',
  args: {
    send: async () => {
      throw new TypeError('offline')
    },
  },
}
