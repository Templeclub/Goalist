import type { GoalQualify, SmartAnswersRow } from '@/features/goals/queries'

/** Empty qualification and SMART answers, for stories and tests. */
export const emptyQualify: GoalQualify = {
  difficulty: null,
  preparation: null,
  horizon: null,
  target_date: null,
  target_precision: null,
  energy: null,
  budget_level: null,
  budget_min_cents: null,
  budget_max_cents: null,
  time_estimate: null,
  mode: null,
  seasons: [],
  place: null,
}

export const emptySmartAnswers: SmartAnswersRow = {
  specific: null,
  measurable: null,
  achievable: null,
  obstacle: null,
  if_then: null,
  relevant: null,
  time_bound: null,
  assembled_sentence: null,
  assembled_edited: false,
}

export const emptySheetExtras = {
  qualify: emptyQualify,
  categoryItems: [],
  tags: [],
  smart: emptySmartAnswers,
  statusNote: null,
}
