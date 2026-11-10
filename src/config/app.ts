/** Product name (D-065): change it here only. */
export const APP_NAME = 'Boosteur'

export const APP_DESCRIPTION_KEY = 'meta.description'

/** Limits shared by the client and the server. */
export const LIMITS = {
  titleMaxLength: 120,
  taglineMaxLength: 160,
  anonymousMaxGoals: 50,
  imageMaxBytes: 5 * 1024 * 1024,
  imageMaxDimension: 2000,
  revisionsKeptPerGoal: 50,
  trashRetentionDays: 30,
} as const
