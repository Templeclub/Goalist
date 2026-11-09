import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CardActions } from './CardActions'

const meta = {
  title: 'Envies/CardActions (suivi)',
  component: CardActions,
  parameters: { layout: 'padded' },
  args: { goalId: '0192f3a4-7b1c-7d2e-8f3a-123456789abc', version: 3, status: 'preparing' },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
  beforeEach: () => {
    const original = globalThis.fetch
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ version: 4 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    return () => {
      globalThis.fetch = original
    }
  },
} satisfies Meta<typeof CardActions>

export default meta
type Story = StoryObj<typeof meta>

export const Idee: Story = { name: 'Idée', args: { status: 'idea' } }
export const EnPreparation: Story = { name: 'En préparation' }
export const EnCours: Story = { name: 'En cours (convertir)', args: { status: 'in_progress' } }
export const EnPause: Story = { name: 'En pause', args: { status: 'paused' } }
export const Acquise: Story = { args: { status: 'done' } }
export const Rangee: Story = { name: 'Rangée', args: { status: 'let_go' } }
