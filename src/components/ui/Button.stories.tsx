import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Plus, Undo2 } from 'lucide-react'
import { Button } from './Button'
import { IconButton } from './IconButton'

const meta = {
  title: 'Composants/Button',
  component: Button,
  args: { children: 'Garder' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'inline-radio', options: ['md', 'sm'] },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primaire: Story = {}
export const Secondaire: Story = { args: { variant: 'secondary', children: 'Compléter' } }
export const Discret: Story = { args: { variant: 'ghost', children: 'Passer pour l’instant' } }
export const Destructif: Story = {
  args: { variant: 'danger', children: 'Supprimer mon compte' },
  parameters: { docs: { description: { story: 'Le seul rouge du produit.' } } },
}
export const PleineLargeur: Story = { args: { block: true }, parameters: { layout: 'padded' } }
export const Desactive: Story = { args: { disabled: true } }

export const Ensemble: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Garder</Button>
      <Button variant="secondary">Compléter</Button>
      <Button variant="ghost">Passer pour l’instant</Button>
      <Button size="sm">Oui</Button>
      <IconButton label="Annuler" icon={<Undo2 />} />
      <IconButton label="Nouvelle envie" icon={<Plus />} tone="accent" />
    </div>
  ),
}
