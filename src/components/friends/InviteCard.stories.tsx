import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { InviteCard } from './InviteCard'

const api = async () =>
  ({
    ok: true,
    version: 5,
    id: 'x',
    code: 'alice-invite-code-0001',
    createdAt: new Date().toISOString(),
  }) as never

const meta = {
  title: 'Amis/InviteCard',
  component: InviteCard,
  parameters: { layout: 'padded' },
  args: { appName: 'Élan', api },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InviteCard>

export default meta
type Story = StoryObj<typeof meta>

export const Lien: Story = {}
