import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { OnboardingFlow } from './OnboardingFlow'

const meta = {
  title: 'Écrans/Onboarding',
  component: OnboardingFlow,
  parameters: { layout: 'fullscreen', viewport: { defaultViewport: 'mobile' } },
  args: { onDone: () => {} },
  decorators: [
    (Story) => (
      <div className="paper-dots">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OnboardingFlow>

export default meta
type Story = StoryObj<typeof meta>

export const TroisEcrans: Story = { name: 'Trois écrans' }
