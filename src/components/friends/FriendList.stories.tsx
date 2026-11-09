import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { FriendList } from './FriendList'

const api = async () =>
  ({
    ok: true,
    version: 5,
    id: 'x',
    code: 'alice-invite-code-0001',
    createdAt: new Date().toISOString(),
  }) as never

const meta = {
  title: 'Amis/FriendList',
  component: FriendList,
  parameters: { layout: 'padded' },
  args: {
    api,
    friends: [
      { id: 'f1', name: 'Alice', since: '2026-11-01T10:00:00Z', sharedCount: 3 },
      { id: 'f2', name: null, since: '2026-10-12T10:00:00Z', sharedCount: 0 },
    ],
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FriendList>

export default meta
type Story = StoryObj<typeof meta>

export const Liste: Story = {}
export const Vide: Story = { args: { friends: [] } }
