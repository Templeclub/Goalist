import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ThemePicker } from './ThemePicker'

const meta = {
  title: 'Moi/ThemePicker',
  component: ThemePicker,
  parameters: { layout: 'padded' },
  args: { save: async () => ({}) },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ThemePicker>

export default meta
type Story = StoryObj<typeof meta>

export const Apparence: Story = {}
