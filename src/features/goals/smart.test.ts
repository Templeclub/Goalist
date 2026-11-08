import { describe, expect, it } from 'vitest'
import { frMessages } from '@/i18n/messages'
import { assembleSmartSentence, smartFilledCount } from './smart'

const templates = frMessages.flow.smart.templates

describe('SMART sentence (templates, no AI)', () => {
  it('assembles every answer into readable French', () => {
    expect(
      assembleSmartSentence(
        {
          specific: 'Courir 5 km d’affilée dans mon quartier.',
          time_bound: 'D’ici fin juin',
          measurable: 'Je cours 5 km sans m’arrêter',
          if_then: 'Si il pleut, alors je cours sur le tapis de la salle',
          relevant: 'Je veux retrouver le plaisir de bouger avec mes enfants',
        },
        templates,
      ),
    ).toBe(
      'D’ici fin juin, courir 5 km d’affilée dans mon quartier. Je saurai que c’est réussi quand je cours 5 km sans m’arrêter. Si il pleut, alors je cours sur le tapis de la salle. Parce que je veux retrouver le plaisir de bouger avec mes enfants.',
    )
  })

  it('keeps proper nouns and skips empty answers', () => {
    expect(
      assembleSmartSentence(
        { specific: 'Léa et moi, une nuit dehors', time_bound: '  ' },
        templates,
      ),
    ).toBe('Léa et moi, une nuit dehors.')
    expect(assembleSmartSentence({}, templates)).toBe('')
  })

  it('counts criteria, A being any of its three answers', () => {
    expect(smartFilledCount({ specific: 'x', obstacle: 'pluie', time_bound: ' ' })).toBe(2)
  })
})
