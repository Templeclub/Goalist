import { describe, expect, it } from 'vitest'
import { RichDoc, richDocToMarkdown, richDocToText } from './rich-text'

const doc = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Un plateau du ' },
        { type: 'text', text: 'Vercors', marks: [{ type: 'bold' }] },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: 'Ce qui me donne envie' }],
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'le silence' }] }],
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'carte',
          marks: [{ type: 'link', attrs: { href: 'https://ign.fr', target: '_blank' } }],
        },
      ],
    },
  ],
}

describe('rich text', () => {
  it('accepts the restricted schema', () => {
    expect(RichDoc.safeParse(doc).success).toBe(true)
  })

  it('refuses unknown nodes, other heading levels and unsafe links', () => {
    expect(
      RichDoc.safeParse({ type: 'doc', content: [{ type: 'image', attrs: { src: 'x' } }] }).success,
    ).toBe(false)
    expect(
      RichDoc.safeParse({ type: 'doc', content: [{ type: 'heading', attrs: { level: 1 } }] })
        .success,
    ).toBe(false)
    const js = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'x',
              marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }],
            },
          ],
        },
      ],
    }
    expect(RichDoc.safeParse(js).success).toBe(false)
  })

  it('derives plain text for search', () => {
    expect(richDocToText(RichDoc.parse(doc))).toBe(
      'Un plateau du Vercors\nCe qui me donne envie\nle silence\ncarte',
    )
  })

  it('derives Markdown for the export', () => {
    expect(richDocToMarkdown(RichDoc.parse(doc))).toBe(
      'Un plateau du **Vercors**\n\n### Ce qui me donne envie\n\n- le silence\n\n[carte](https://ign.fr)',
    )
  })
})
