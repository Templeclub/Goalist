import type { CategoryKey } from './schema'

/*
 * Emoji and category guessed from the title with a hand-written keyword list (D-059).
 * Deterministic and local: no AI, no network. Always editable afterwards.
 * Keywords are accent-free, lower-case word prefixes ("voyag" matches "voyager", "voyages").
 */

type Rule = { words: readonly string[]; category?: CategoryKey; emoji?: string }

const rules: readonly Rule[] = [
  // Specific activities first: they give the most telling emoji.
  {
    words: [
      'courir',
      'course',
      'running',
      'marathon',
      'semi-marathon',
      'trail',
      'jogging',
      '5 km',
      '10 km',
    ],
    category: 'sport_health',
    emoji: '🏃',
  },
  { words: ['velo', 'cyclis', 'vtt'], category: 'sport_health', emoji: '🚴' },
  { words: ['nag', 'piscine', 'natation'], category: 'sport_health', emoji: '🏊' },
  { words: ['rando', 'randonn', 'trek', 'gr20', 'gr '], category: 'sport_health', emoji: '🥾' },
  { words: ['escalade', 'grimp', 'bloc'], category: 'sport_health', emoji: '🧗' },
  { words: ['ski', 'snowboard'], category: 'sport_health', emoji: '⛷️' },
  { words: ['surf'], category: 'sport_health', emoji: '🏄' },
  { words: ['yoga', 'pilates', 'etirement'], category: 'wellbeing', emoji: '🧘' },
  { words: ['meditation', 'mediter', 'respir'], category: 'wellbeing', emoji: '🧘' },
  {
    words: ['bivouac', 'camping', 'tente', 'nuit dehors', 'belle etoile', 'etoile'],
    category: 'travel',
    emoji: '🏕️',
  },
  { words: ['avion', 'vol '], category: 'travel', emoji: '✈️' },
  { words: ['dorm', 'sommeil'], category: 'wellbeing', emoji: '😴' },
  { words: ['plage', 'mer ', 'ocean', 'ile'], category: 'travel', emoji: '🏖️' },
  {
    words: ['montagne', 'sommet', 'alpes', 'pyrenees', 'vercors'],
    category: 'travel',
    emoji: '🏔️',
  },
  { words: ['japon', 'tokyo', 'kyoto'], category: 'travel', emoji: '🗾' },
  { words: ['road trip', 'roadtrip', 'van ', 'camping-car'], category: 'travel', emoji: '🚐' },
  {
    words: [
      'guitare',
      'piano',
      'violon',
      'batterie',
      'ukulele',
      'chanter',
      'chant ',
      'chorale',
      'musique',
      'instrument',
    ],
    category: 'creative',
    emoji: '🎸',
  },
  {
    words: ['peindre', 'peinture', 'aquarelle', 'dessin', 'dessiner', 'illustr'],
    category: 'creative',
    emoji: '🎨',
  },
  { words: ['photo'], category: 'creative', emoji: '📷' },
  {
    words: ['ecrire', 'roman', 'nouvelle', 'poeme', 'poesie', 'blog'],
    category: 'creative',
    emoji: '✍️',
  },
  {
    words: [
      'poterie',
      'ceramique',
      'tricot',
      'couture',
      'coudre',
      'crochet',
      'bricol',
      'menuiserie',
    ],
    category: 'creative',
    emoji: '🧶',
  },
  {
    words: ['cuisine', 'cuisiner', 'recette', 'patisserie', 'pain', 'gateau'],
    category: 'creative',
    emoji: '🍳',
  },
  { words: ['jardin', 'potager', 'plante', 'compost'], category: 'home', emoji: '🌱' },
  { words: ['lire', 'lecture', 'livre', 'bibliotheque'], category: 'learning', emoji: '📚' },
  {
    words: [
      'anglais',
      'espagnol',
      'italien',
      'allemand',
      'japonais',
      'chinois',
      'portugais',
      'langue',
    ],
    category: 'learning',
    emoji: '🗣️',
  },
  { words: ['permis'], category: 'practical', emoji: '🚗' },
  { words: ['demenag'], category: 'home', emoji: '📦' },
  {
    words: [
      'epargn',
      'economis',
      'budget',
      'argent',
      'investi',
      'dette',
      'credit',
      'impot',
      'banque',
    ],
    category: 'finance',
    emoji: '💶',
  },
  {
    words: ['benevol', 'associati', 'don ', 'donner du sang', 'aider'],
    category: 'volunteering',
    emoji: '🤝',
  },
  {
    words: [
      'enfant',
      'fils',
      'fille',
      'bebe',
      'parents',
      'famille',
      'mamie',
      'papy',
      'grand-mere',
      'grand-pere',
      'frere',
      'soeur',
      'cousin',
    ],
    category: 'family',
    emoji: '👨‍👩‍👧',
  },
  {
    words: ['ami', 'copain', 'copine', 'soiree', 'fete', 'diner', 'rencontr'],
    category: 'social',
    emoji: '🥂',
  },
  // Broader themes.
  {
    words: [
      'sport',
      'muscu',
      'salle',
      'forme',
      'abdos',
      'pompes',
      'marcher',
      'marche',
      'pas par jour',
      'sante',
      'medecin',
      'dentiste',
      'maigrir',
      'poids',
    ],
    category: 'sport_health',
    emoji: '💪',
  },
  {
    words: [
      'voyag',
      'partir',
      'visiter',
      'decouvrir',
      'pays',
      'tour du monde',
      'week-end a',
      'vacances',
      'sejour',
      'europe',
      'asie',
      'afrique',
      'amerique',
      'islande',
      'norvege',
      'ecosse',
      'italie',
      'espagne',
      'portugal',
      'grece',
      'maroc',
      'canada',
      'australie',
    ],
    category: 'travel',
    emoji: '🧳',
  },
  {
    words: [
      'maison',
      'appart',
      'chambre',
      'salon',
      'cuisine a',
      'renov',
      'travaux',
      'peindre le',
      'ranger',
      'rangement',
      'trier',
      'desencombr',
      'deco',
    ],
    category: 'home',
    emoji: '🏡',
  },
  {
    words: [
      'apprendre',
      'formation',
      'cours',
      'diplome',
      'certific',
      'etudier',
      'comprendre',
      'coder',
      'programm',
    ],
    category: 'learning',
    emoji: '🎓',
  },
  {
    words: [
      'travail',
      'boulot',
      'job',
      'carriere',
      'entreprise',
      'freelance',
      'promotion',
      'reconversion',
      'client',
      'projet pro',
      'cv',
    ],
    category: 'work',
    emoji: '💼',
  },
  {
    words: [
      'papiers',
      'administratif',
      'assurance',
      'mutuelle',
      'voiture',
      'reparer',
      'organiser',
      'agenda',
    ],
    category: 'practical',
    emoji: '🗂️',
  },
  {
    words: [
      'zen',
      'detente',
      'deconnect',
      'ralentir',
      'prendre soin',
      'bien-etre',
      'massage',
      'spa',
      'serein',
    ],
    category: 'wellbeing',
    emoji: '🌿',
  },
  {
    words: ['creer', 'fabriquer', 'film', 'video', 'podcast', 'danse', 'theatre'],
    category: 'creative',
    emoji: '✨',
  },
]

/** Emoji shown when only the category is known. */
export const categoryEmoji: Record<CategoryKey, string> = {
  family: '👨‍👩‍👧',
  social: '🥂',
  travel: '🧳',
  practical: '🗂️',
  finance: '💶',
  sport_health: '💪',
  wellbeing: '🌿',
  home: '🏡',
  learning: '📚',
  work: '💼',
  volunteering: '🤝',
  creative: '🎨',
  other: '✨',
}

export const DEFAULT_EMOJI = '✨'

const normalise = (text: string) =>
  ` ${text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[’']/g, ' ')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()} `

/** True when `word` starts a word of `text` (both normalised). */
const startsWord = (text: string, word: string) => text.includes(` ${word}`)

export function classifyTitle(title: string): { category: CategoryKey | null; emoji: string } {
  const text = normalise(title)
  const rule = rules.find((r) => r.words.some((w) => startsWord(text, w)))
  if (!rule) return { category: null, emoji: DEFAULT_EMOJI }
  return {
    category: rule.category ?? null,
    emoji: rule.emoji ?? (rule.category ? categoryEmoji[rule.category] : DEFAULT_EMOJI),
  }
}
