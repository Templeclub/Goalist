import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { GoalCardSkeleton } from '../goal/GoalCard'
import { Button } from './Button'
import { CompletenessMeter } from './CompletenessMeter'
import { SaveIndicator } from './SaveIndicator'
import { useToast } from './Toast'

const meta = {
  title: 'Composants/Retours',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Sauvegarde: Story = {
  name: 'Indicateur de sauvegarde',
  render: () => (
    <div className="grid gap-3">
      <SaveIndicator state="saved" />
      <SaveIndicator state="saving" />
      <SaveIndicator state="offline" />
    </div>
  ),
}

export const Completude: Story = {
  name: 'Complétude douce',
  render: () => (
    <div className="grid gap-3">
      <CompletenessMeter level="sketch" />
      <CompletenessMeter level="on_track" />
      <CompletenessMeter level="well_filled" />
    </div>
  ),
}

export const Squelette: Story = {
  name: 'Squelette de carte',
  render: () => (
    <div className="grid max-w-sm gap-3">
      <GoalCardSkeleton />
      <GoalCardSkeleton />
    </div>
  ),
}

export const Toast: Story = {
  name: 'Toast après « Garder »',
  render: function Render() {
    const toast = useToast()
    return (
      <Button
        onClick={() =>
          toast.show({
            message: 'Ta première envie est écrite. C’est souvent le pas le plus difficile.',
            detail: 'Compléter la fiche maintenant ?',
            actions: [
              { label: 'Plus tard', onClick: () => {} },
              { label: 'Oui', onClick: () => {}, primary: true },
            ],
          })
        }
      >
        Garder
      </Button>
    )
  },
}
