import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { OwnCardSocial } from './OwnCardSocial'

const api = async () =>
  ({
    ok: true,
    version: 5,
    id: 'x',
    code: 'alice-invite-code-0001',
    createdAt: new Date().toISOString(),
  }) as never

const meta = {
  title: 'Amis/OwnCardSocial',
  component: OwnCardSocial,
  parameters: { layout: 'padded' },
  args: {
    api,
    goalId: 'g1',
    userId: 'me',
    social: {
      reactions: { bravo: 2, courage: 0, inspire: 1 },
      mine: [],
      comments: [
        {
          id: 'c1',
          body: 'Trop bien !',
          at: '2026-11-08T18:00:00Z',
          authorId: 'f1',
          authorName: 'Alice',
        },
      ],
      interestCount: 1,
      interestedNames: ['Alice'],
      meToo: false,
      offers: [
        {
          id: 'o1',
          message: 'Je te prête ma tente',
          status: 'open',
          at: '2026-11-09T10:00:00Z',
          authorId: 'f1',
          authorName: 'Alice',
        },
      ],
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OwnCardSocial>

export default meta
type Story = StoryObj<typeof meta>

export const CoteAmis: Story = { name: 'Côté amis' }
export const Rien: Story = {
  name: 'Rien encore',
  args: {
    social: {
      reactions: { bravo: 0, courage: 0, inspire: 0 },
      mine: [],
      comments: [],
      interestCount: 0,
      interestedNames: [],
      meToo: false,
      offers: [],
    },
  },
}
