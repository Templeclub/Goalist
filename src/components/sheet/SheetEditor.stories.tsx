import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { emptySheetExtras } from './fixtures'
import { SheetEditor, type SheetData } from './SheetEditor'

let version = 3
const send = async () => {
  await new Promise((r) => setTimeout(r, 500))
  return { version: ++version }
}

const data: SheetData = {
  id: '0192f3a4-7b1c-7d2e-8f3a-123456789abc',
  version,
  title: 'Dormir une nuit à la belle étoile',
  emoji: '🏕️',
  status: 'confirmed',
  descriptionDoc: {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Un plateau du Vercors en août, la chaleur qui retombe.' }],
      },
    ],
  },
  why: 'Parce que je ne me souviens plus de la dernière fois où j’ai vu la Voie lactée.',
  firstStep: null,
  valueKeys: ['freedom', 'relaxing'],
  ...emptySheetExtras,
  categoryItems: [{ id: 'c-travel', key: 'travel', label: null, hue: 60 }],
  qualify: {
    ...emptySheetExtras.qualify,
    preparation: 'medium',
    horizon: 'medium',
    seasons: ['summer'],
  },
  achievable: 'Un duvet chaud et une carte des zones de bivouac autorisées.',
}

const meta = {
  title: 'Écrans/Fiche complète',
  component: SheetEditor,
  parameters: {
    layout: 'fullscreen',
    nextjs: { navigation: { pathname: `/goals/${data.id}/edit/name` } },
  },
  args: {
    data,
    section: 'name',
    send,
    sendValues: send,
    sendSmart: send,
    sendCategories: send,
    availableCategories: [
      { id: 'c-travel', key: 'travel', label: null, hue: 60 },
      { id: 'c-sport', key: 'sport_health', label: null, hue: 150 },
      { id: 'c-own', key: null, label: 'Astronomie', hue: 240 },
    ],
  },
} satisfies Meta<typeof SheetEditor>

export default meta
type Story = StoryObj<typeof meta>

export const LEnvie: Story = { name: 'L’envie' }
export const LePourquoi: Story = { name: 'Le pourquoi', args: { section: 'why' } }
export const Preciser: Story = { name: 'Préciser', args: { section: 'smart' } }
export const PremierPas: Story = { name: 'Premier pas', args: { section: 'first-steps' } }
