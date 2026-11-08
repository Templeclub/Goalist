import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { Chip } from './Chip'
import { ChipGroup } from './ChipGroup'

const meta = {
  title: 'Composants/Chip',
  component: Chip,
  args: { children: 'Liberté' },
} satisfies Meta<typeof Chip>

export default meta
type Story = StoryObj<typeof meta>

export const Bascule: Story = {
  render: function Render() {
    const [pressed, setPressed] = useState(true)
    return (
      <Chip pressed={pressed} onClick={() => setPressed(!pressed)}>
        Liberté
      </Chip>
    )
  },
}

export const Ajout: Story = { args: { variant: 'add', children: 'Autre…' } }

const values = [
  { value: 'freedom', label: 'Liberté' },
  { value: 'relaxing', label: 'Me détendre' },
  { value: 'sharing', label: 'Partager' },
  { value: 'wonder', label: 'M’émerveiller' },
  { value: 'learning', label: 'Apprendre' },
  { value: 'surpassing', label: 'Me dépasser' },
] as const

type ValueKey = (typeof values)[number]['value']

export const GroupeMultiple: Story = {
  name: 'Groupe, choix multiple',
  render: function Render() {
    const [value, setValue] = useState<ValueKey[]>(['freedom', 'relaxing'])
    return (
      <ChipGroup
        type="multiple"
        legend="Qu’est-ce que ça t’apporterait ?"
        description="Coche ce qui te parle, autant que tu veux."
        options={values}
        value={value}
        onChange={setValue}
      />
    )
  },
}

export const GroupeUnique: Story = {
  name: 'Groupe, choix unique (désélectionnable)',
  render: function Render() {
    const [value, setValue] = useState<'none' | 'low' | 'medium' | 'high' | null>('low')
    return (
      <ChipGroup
        type="single"
        legend="Budget"
        options={[
          { value: 'none', label: 'Aucun' },
          { value: 'low', label: 'Faible' },
          { value: 'medium', label: 'Moyen' },
          { value: 'high', label: 'Élevé' },
        ]}
        value={value}
        onChange={setValue}
      />
    )
  },
}

export const AvecOptionsBientot: Story = {
  name: 'Visibilité (options à venir)',
  render: function Render() {
    const [value, setValue] = useState<'private' | 'circle' | 'community' | null>('private')
    return (
      <ChipGroup
        type="single"
        legend="Visibilité"
        options={[
          { value: 'private', label: 'Privé' },
          { value: 'circle', label: 'Cercle d’amis', disabled: true, note: 'Bientôt' },
          { value: 'community', label: 'Communauté', disabled: true, note: 'Bientôt' },
        ]}
        value={value}
        onChange={setValue}
      />
    )
  },
}
