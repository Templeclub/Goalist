import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ShareToggle } from './ShareToggle'

const api = async () =>
  ({
    ok: true,
    version: 5,
    id: 'x',
    code: 'alice-invite-code-0001',
    createdAt: new Date().toISOString(),
  }) as never

const meta = {
  title: 'Amis/ShareToggle',
  component: ShareToggle,
  parameters: { layout: 'padded' },
  args: { api, goalId: 'g1', version: 3, visibility: 'private' },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ShareToggle>

export default meta
type Story = StoryObj<typeof meta>

export const Privee: Story = { name: 'Moi seul' }
export const Amis: Story = { name: 'Mes amis', args: { visibility: 'circle' } }
