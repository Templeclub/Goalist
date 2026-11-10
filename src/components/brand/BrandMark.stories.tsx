import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { BrandMark } from './BrandMark'

const meta = {
  title: 'Composants/BrandMark',
  component: BrandMark,
  args: { size: 96, label: 'Boosteur' },
} satisfies Meta<typeof BrandMark>

export default meta
type Story = StoryObj<typeof meta>

export const Grand: Story = {}

export const AvecLeNom: Story = {
  name: 'Avec le nom',
  args: { size: 40, label: '' },
  render: (args) => (
    <span className="flex items-center gap-2.5">
      <BrandMark {...args} />
      <span className="font-display text-2xl font-extrabold">Boosteur</span>
    </span>
  ),
}
