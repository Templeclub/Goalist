import { describe, expect, it } from 'vitest'
import { classifyTitle, DEFAULT_EMOJI } from './auto-classify'

describe('classifyTitle', () => {
  it.each([
    ['Courir 5 km d’affilée dans mon quartier', 'sport_health', '🏃'],
    ['Dormir à la belle étoile', 'travel', '🏕️'],
    ['Apprendre la guitare', 'creative', '🎸'],
    ['Voyager au Japon', 'travel', '🗾'],
    ['Partir en Islande', 'travel', '🧳'],
    ['Lire 20 livres cette année', 'learning', '📚'],
    ['Repeindre la chambre', 'home', '🏡'],
    ['Épargner pour un apport', 'finance', '💶'],
    ['Faire du bénévolat aux Restos', 'volunteering', '🤝'],
    ['Emmener les enfants au zoo', 'family', '👨‍👩‍👧'],
  ])('« %s » → %s %s', (title, category, emoji) => {
    expect(classifyTitle(title)).toEqual({ category, emoji })
  })

  it('ignores accents and case', () => {
    expect(classifyTitle('MÉDITER chaque matin').category).toBe('wellbeing')
  })

  it('matches whole word starts only', () => {
    expect(classifyTitle('Visiter le chantier').category).toBe('travel')
    expect(classifyTitle('Une glace à la vanille').category).toBeNull()
  })

  it('falls back to a neutral emoji and no category', () => {
    expect(classifyTitle('Quelque chose de nouveau')).toEqual({
      category: null,
      emoji: DEFAULT_EMOJI,
    })
  })
})
