import { z } from 'zod'
import { LIMITS } from '@/config/app'

/*
 * Source of truth for goal enumerations on the TypeScript side.
 * Must stay in sync with the CHECK constraints in supabase/migrations (D-009).
 */

export const goalStatuses = [
  'idea',
  'confirmed',
  'preparing',
  'in_progress',
  'done',
  'paused',
  'let_go',
] as const
export const visibilities = ['private', 'circle', 'community'] as const
export const preparations = ['none', 'light', 'medium', 'heavy', 'very_heavy'] as const
export const horizons = ['short', 'medium', 'long', 'someday'] as const
export const energies = ['low', 'medium', 'high'] as const
export const budgetLevels = ['none', 'low', 'medium', 'high'] as const
export const timeEstimates = ['minutes', 'day', 'weekend', 'several_days', 'spread'] as const
export const modes = ['solo', 'together', 'open'] as const
export const seasons = [
  'spring',
  'summer',
  'autumn',
  'winter',
  'weekend',
  'holidays',
  'when_free',
] as const
export const targetPrecisions = ['day', 'month', 'season', 'year'] as const
export const completenessLevels = ['sketch', 'on_track', 'well_filled'] as const
export const difficulties = [1, 2, 3, 4, 5] as const

export const categoryKeys = [
  'family',
  'social',
  'travel',
  'practical',
  'finance',
  'sport_health',
  'wellbeing',
  'home',
  'learning',
  'work',
  'volunteering',
  'creative',
  'other',
] as const

export const valueKeys = [
  'freedom',
  'learning',
  'sharing',
  'surpassing',
  'relaxing',
  'passing_on',
  'wonder',
  'health',
  'connection',
  'creating',
] as const

export const GoalStatus = z.enum(goalStatuses)
export const Visibility = z.enum(visibilities)
export const Preparation = z.enum(preparations)
export const Horizon = z.enum(horizons)
export const Energy = z.enum(energies)
export const BudgetLevel = z.enum(budgetLevels)
export const TimeEstimate = z.enum(timeEstimates)
export const Mode = z.enum(modes)
export const Season = z.enum(seasons)
export const TargetPrecision = z.enum(targetPrecisions)
export const CompletenessLevel = z.enum(completenessLevels)
export const CategoryKey = z.enum(categoryKeys)
export const ValueKey = z.enum(valueKeys)
export const Difficulty = z.int().min(1).max(5)

export const GoalTitle = z.string().trim().min(1).max(LIMITS.titleMaxLength)

export type GoalStatus = z.infer<typeof GoalStatus>
export type Visibility = z.infer<typeof Visibility>
export type Preparation = z.infer<typeof Preparation>
export type Horizon = z.infer<typeof Horizon>
export type Energy = z.infer<typeof Energy>
export type BudgetLevel = z.infer<typeof BudgetLevel>
export type TimeEstimate = z.infer<typeof TimeEstimate>
export type Mode = z.infer<typeof Mode>
export type Season = z.infer<typeof Season>
export type CompletenessLevel = z.infer<typeof CompletenessLevel>
export type CategoryKey = z.infer<typeof CategoryKey>
export type ValueKey = z.infer<typeof ValueKey>
export type Difficulty = (typeof difficulties)[number]
