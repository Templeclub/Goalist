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
  tagline: 'Voir la Voie lactée de mes propres yeux, sans tente.',
  emoji: '🌌',
  hue: null,
  categories: ['travel'],
  status: 'confirmed',
  descriptionDoc: {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Un plateau du Vercors en août, la chaleur qui retombe.' }],
      },
      {
        type: 'heading',
        attrs: { level: 3 },
        content: [{ type: 'text', text: 'Qu’est-ce qui me donne envie là-dedans ?' }],
      },
      { type: 'paragraph', content: [{ type: 'text', text: 'Le silence, surtout.' }] },
    ],
  },
  imaginedOutcome: null,
  whereWith: 'Plateau d’Ambel, avec Léa.',
  why: 'Parce que je ne me souviens plus de la dernière fois où j’ai vu la Voie lactée.',
  benefits: null,
  firstStep: null,
  notes: null,
  valueKeys: ['freedom', 'relaxing'],
  customValues: [],
  media: [
    {
      id: 'm1',
      kind: 'link',
      url: 'https://www.ign.fr',
      title: 'Carte du plateau',
      altText: null,
      src: null,
    },
  ],
  ...emptySheetExtras,
  categoryItems: [{ id: 'c-travel', key: 'travel', label: null, hue: 60 }],
  qualify: { ...emptySheetExtras.qualify, difficulty: 3, energy: 'medium', seasons: ['summer'] },
  smart: {
    ...emptySheetExtras.smart,
    specific: 'Passer une nuit dehors sans tente sur le plateau d’Ambel',
  },
}

const meta = {
  title: 'Écrans/Fiche complète',
  component: SheetEditor,
  parameters: {
    layout: 'fullscreen',
    nextjs: { navigation: { pathname: `/goals/${data.id}/edit/name` } },
  },
  args: { data, section: 'name', canUploadImages: true, send, sendValues: send },
} satisfies Meta<typeof SheetEditor>

export default meta
type Story = StoryObj<typeof meta>

export const Nommer: Story = {}
export const Decrire: Story = { name: 'Décrire', args: { section: 'describe' } }
export const LePourquoi: Story = { name: 'Le pourquoi', args: { section: 'why' } }
export const Preciser: Story = { name: 'Préciser (SMART)', args: { section: 'smart' } }
export const Qualifier: Story = {
  args: {
    section: 'qualify',
    availableCategories: [
      { id: 'c-travel', key: 'travel', label: null, hue: 60 },
      { id: 'c-sport', key: 'sport_health', label: null, hue: 150 },
      { id: 'c-own', key: null, label: 'Astronomie', hue: 240 },
    ],
    tagSuggestions: ['bivouac', 'été', 'Léa'],
  },
}
export const PremieresPistes: Story = { name: 'Premières pistes', args: { section: 'first-steps' } }
export const Relire: Story = { name: 'Relire & garder', args: { section: 'review' } }
export const SansCompte: Story = {
  name: 'Décrire, sans compte',
  args: { section: 'describe', canUploadImages: false },
}
