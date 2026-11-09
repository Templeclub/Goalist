import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { FriendCardInteractions } from './FriendCardInteractions'

const api = async () =>
  ({
    ok: true,
    version: 5,
    id: 'x',
    code: 'alice-invite-code-0001',
    createdAt: new Date().toISOString(),
  }) as never

const meta = {
  title: 'Amis/FriendCardInteractions',
  component: FriendCardInteractions,
  parameters: { layout: 'padded' },
  args: {
    api,
    goalId: 'g1',
    title: 'Dormir à la belle étoile',
    copy: async () => 'g2',
    social: {
      reactions: { bravo: 2, courage: 1, inspire: 0 },
      mine: ['courage'],
      meToo: false,
      offers: [],
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FriendCardInteractions>

export default meta
type Story = StoryObj<typeof meta>

export const CarteDUnAmi: Story = { name: 'Carte d’un ami' }
