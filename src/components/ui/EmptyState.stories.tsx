import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { EmptyState } from './EmptyState'
import { NotebookIllustration } from './NotebookIllustration'

const meta = {
  title: 'Composants/EmptyState',
  component: EmptyState,
  args: {
    title: 'Ton carnet est prêt.',
    body: 'Une envie, même petite, suffit pour commencer.',
    illustration: <NotebookIllustration />,
    examples: [
      { label: 'Dormir une nuit à la belle étoile' },
      { label: 'Apprendre à faire son pain' },
      { label: 'Écrire à une vieille amie' },
    ],
    examplesLabel: (example: string) => `Essayer : ${example}`,
  },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const CarnetVide: Story = { name: 'Carnet vide' }
