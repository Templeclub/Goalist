import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { BatteryFull, BatteryLow, BatteryMedium } from 'lucide-react'
import { useState } from 'react'
import { IconRadioGroup } from './IconRadioGroup'
import { StepSelector } from './StepSelector'

const meta = {
  title: 'Composants/Échelles',
  component: StepSelector,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof StepSelector>

export default meta
type Story = StoryObj<typeof meta>

const steps = [
  {
    value: 1,
    label: 'Facile',
    description: 'Facile : ça peut se faire sans vraiment s’organiser.',
  },
  {
    value: 2,
    label: 'À ma portée',
    description: 'À ma portée : un peu d’organisation, rien d’intimidant.',
  },
  {
    value: 3,
    label: 'Exigeant',
    description: 'Exigeant : ça demande de l’organisation et un peu de courage.',
  },
  {
    value: 4,
    label: 'Ambitieux',
    description: 'Ambitieux : il faudra de la constance, sur la durée.',
  },
  {
    value: 5,
    label: 'Défi majeur',
    description: 'Défi majeur : un vrai cap à franchir, et c’est très bien comme ça.',
  },
] as const

export const Difficulte: Story = {
  name: 'Curseur à étapes (difficulté)',
  args: { legend: 'Difficulté', steps, value: 3, onChange: () => {} },
  render: function Render() {
    const [value, setValue] = useState<number | null>(3)
    return (
      <div className="max-w-sm">
        <StepSelector legend="Difficulté" steps={steps} value={value} onChange={setValue} />
      </div>
    )
  },
}

export const Energie: Story = {
  name: 'Cartes à icône (énergie)',
  args: { legend: 'Difficulté', steps, value: null, onChange: () => {} },
  render: function Render() {
    const [value, setValue] = useState<'low' | 'medium' | 'high' | null>('medium')
    return (
      <div className="max-w-sm">
        <IconRadioGroup
          legend="Énergie requise"
          value={value}
          onChange={setValue}
          options={[
            { value: 'low', label: 'Faible', icon: <BatteryLow /> },
            { value: 'medium', label: 'Moyenne', icon: <BatteryMedium /> },
            { value: 'high', label: 'Forte', icon: <BatteryFull /> },
          ]}
        />
      </div>
    )
  },
}
