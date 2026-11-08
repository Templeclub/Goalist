import { describe, expect, it } from 'vitest'
import { goalToMarkdown, slugify, type ExportGoal, type ExportLabels } from './export-format'

const labels: ExportLabels = {
  status: 'Statut',
  description: 'Description',
  imagined: 'Ce que j’imagine',
  whereWith: 'Où, avec qui',
  why: 'Pourquoi',
  values: 'Ce que ça m’apporterait',
  firstStep: 'Première petite étape',
  notes: 'Notes',
  smart: 'En clair',
  categories: 'Catégories',
  tags: 'Tags',
  links: 'Liens',
  images: 'Images',
  kept: 'Gardée le',
}

const goal: ExportGoal = {
  id: 'g1',
  title: 'Dormir une nuit à la belle étoile',
  tagline: 'Sans tente',
  emoji: '🌌',
  status: 'Envie confirmée',
  created_at: '2026-10-12T08:00:00Z',
  updated_at: '2026-11-08T08:00:00Z',
  description_doc: {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Le Vercors en août.' }] }],
  },
  imagined_outcome: null,
  where_with: 'Avec Léa',
  why: 'Ça me manque',
  benefits: null,
  first_step: 'Chercher un bivouac',
  notes: null,
  values: ['Liberté'],
  categories: ['Voyage & aventure'],
  tags: ['été'],
  smart_sentence: null,
  qualify: {},
  links: [{ url: 'https://ign.fr', title: 'Carte' }],
  images: ['images/g1/a.webp'],
}

describe('export', () => {
  it('slugifies titles for file names', () => {
    expect(slugify('Dormir une nuit à la belle étoile !')).toBe('dormir-une-nuit-a-la-belle-etoile')
    expect(slugify('🌌')).toBe('envie')
  })

  it('writes a readable Markdown page, skipping empty sections', () => {
    const md = goalToMarkdown(goal, labels)
    expect(md).toContain('# 🌌 Dormir une nuit à la belle étoile')
    expect(md).toContain('## Description\n\nLe Vercors en août.')
    expect(md).toContain('- Tags : #été')
    expect(md).toContain('- [Carte](https://ign.fr)')
    expect(md).toContain('![](../images/g1/a.webp)')
    expect(md).not.toContain('## Notes')
  })
})
