import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Field, inputClass } from './Field'

const meta = {
  title: 'Composants/Field',
  component: Field,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

const why = {
  explanation:
    'Pas besoin d’une grande raison. Une sensation, un souvenir ou une intuition suffisent.',
  example: {
    before: '« Parce que c’est bien. »',
    after:
      '« Parce que je ne me souviens plus de la dernière fois où j’ai vu la Voie lactée, et que ça me manque. »',
  },
}

export const AvecAide: Story = {
  name: 'Avec aide et exemple',
  args: {
    id: 'why',
    label: 'Pourquoi c’est important pour toi ?',
    optional: true,
    help: why,
    children: null,
  },
  render: (args) => (
    <div className="max-w-md">
      <Field {...args}>
        <textarea id="why" rows={4} className={inputClass} placeholder="Parce que…" />
      </Field>
    </div>
  ),
}

export const AvecIndication: Story = {
  name: 'Avec indication',
  args: {
    id: 'first-step',
    label: 'Quelle serait la toute première petite étape ?',
    hint: 'Quelque chose qui prend moins de 15 minutes.',
    optional: true,
    children: null,
  },
  render: (args) => (
    <div className="max-w-md">
      <Field {...args}>
        <input
          id="first-step"
          aria-describedby="first-step-hint"
          className={inputClass}
          placeholder="Chercher les zones de bivouac autorisées"
        />
      </Field>
    </div>
  ),
}

export const MessageDoux: Story = {
  name: 'Message doux',
  args: {
    id: 'link',
    label: 'Lien d’inspiration',
    message: 'Ce lien ne semble pas complet. Il commence souvent par https://',
    children: null,
  },
  render: (args) => (
    <div className="max-w-md">
      <Field {...args}>
        <input
          id="link"
          aria-describedby="link-hint"
          className={inputClass}
          defaultValue="vercors-bivouac.fr"
        />
      </Field>
    </div>
  ),
}
