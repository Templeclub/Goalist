import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AcceptInvite } from './AcceptInvite'

const api = async () =>
  ({
    ok: true,
    version: 5,
    id: 'x',
    code: 'alice-invite-code-0001',
    createdAt: new Date().toISOString(),
  }) as never

const meta = {
  title: 'Amis/AcceptInvite',
  component: AcceptInvite,
  parameters: { layout: 'padded' },
  args: { code: 'alice-invite-code-0001', api },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AcceptInvite>

export default meta
type Story = StoryObj<typeof meta>

export const Accepter: Story = {}
