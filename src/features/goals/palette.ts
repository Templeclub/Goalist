import type { CategoryKey, GoalStatus } from './schema'

/**
 * Category hues: 12 hues spaced 30° apart on the OKLCH wheel, identical
 * lightness and chroma (set per theme in tokens.css). `null` = neutral.
 */
export const categoryHue: Record<CategoryKey, number | null> = {
  family: 0,
  social: 30,
  travel: 60,
  practical: 90,
  finance: 120,
  sport_health: 150,
  wellbeing: 180,
  home: 210,
  learning: 240,
  work: 270,
  volunteering: 300,
  creative: 330,
  other: null,
}

/** Hues available for custom categories (same 12 steps). */
export const customHues = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330] as const

/** Calm status tones: never red, never bright orange. `accent` uses the brand accent. */
export const statusTone: Record<GoalStatus, number | 'accent'> = {
  idea: 70,
  confirmed: 'accent',
  preparing: 80,
  in_progress: 240,
  done: 150,
  paused: 290,
  let_go: 70,
}
