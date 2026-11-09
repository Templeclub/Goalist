import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CommentThread } from './CommentThread'

const api = async () =>
  ({
    ok: true,
    version: 5,
    id: 'x',
    code: 'alice-invite-code-0001',
    createdAt: new Date().toISOString(),
  }) as never

const meta = {
  title: 'Amis/CommentThread',
  component: CommentThread,
  parameters: { layout: 'padded' },
  args: {
    api,
    goalId: 'g1',
    userId: 'me',
    initial: [
      {
        id: 'c1',
        body: 'Prends un bon duvet !',
        at: '2026-11-08T18:00:00Z',
        authorId: 'f1',
        authorName: 'Alice',
      },
      {
        id: 'c2',
        body: 'Merci, bonne idée.',
        at: '2026-11-09T09:00:00Z',
        authorId: 'me',
        authorName: null,
      },
    ],
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CommentThread>

export default meta
type Story = StoryObj<typeof meta>

export const Messages: Story = {}
export const ProprietaireLectureSeule: Story = {
  name: 'Propriétaire (modération)',
  args: { canModerate: true, canWrite: false },
}
