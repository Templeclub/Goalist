import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SignInForm } from './SignInForm'

const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 600))

const meta = {
  title: 'Écrans/Connexion',
  component: SignInForm,
  parameters: { layout: 'padded' },
  args: {
    converting: false,
    onMagicLink: wait,
    onGoogle: wait,
    onPassword: async () => {
      await wait()
      return 'check-email' as const
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-md rounded-card border border-card-border bg-card p-6 shadow-card">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SignInForm>

export default meta
type Story = StoryObj<typeof meta>

export const LienMagique: Story = { name: 'Lien magique (par défaut)' }
export const Conversion: Story = { name: 'Session anonyme à garder', args: { converting: true } }
export const LienExpire: Story = { name: 'Lien expiré', args: { initialError: 'callback' } }
export const IdentifiantsRefuses: Story = {
  name: 'Identifiants refusés',
  args: {
    onPassword: async () => {
      throw new Error('credentials')
    },
  },
}
