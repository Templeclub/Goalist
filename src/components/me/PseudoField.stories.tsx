import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { PseudoField } from './PseudoField'

const meta = {
  title: 'Écrans/Moi, pseudo',
  component: PseudoField,
  args: {
    initial: 'Camille',
    send: async () => {
      await new Promise((r) => setTimeout(r, 600))
      return { version: Date.now() }
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PseudoField>

export default meta
type Story = StoryObj<typeof meta>

export const Pseudo: Story = {}
