import {
  BatteryMedium,
  CalendarDays,
  Clock,
  Hammer,
  MapPin,
  Mountain,
  Sun,
  Telescope,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import type { getFormatter, getTranslations } from 'next-intl/server'
import type { GoalQualify } from '@/features/goals/queries'

type T = Awaited<ReturnType<typeof getTranslations<'goal'>>>
type Format = Awaited<ReturnType<typeof getFormatter>>

export type FactRow = { key: string; label: string; value: string; Icon: LucideIcon; dots?: number }

const seasonOf = (month: number) =>
  month <= 1 || month === 11 ? 'winter' : month <= 4 ? 'spring' : month <= 7 ? 'summer' : 'autumn'

/** The "Repères" grid of the notebook page: only what was filled in. */
export function factRows(q: GoalQualify, t: T, format: Format): FactRow[] {
  const rows: FactRow[] = []
  const tr = t as unknown as (key: string, values?: Record<string, string | number>) => string
  if (q.difficulty)
    rows.push({
      key: 'difficulty',
      label: t('difficulty.label'),
      value: tr(`difficulty.${q.difficulty}`),
      Icon: Mountain,
      dots: q.difficulty,
    })
  if (q.preparation)
    rows.push({
      key: 'preparation',
      label: t('preparation.label'),
      value: tr(`preparation.${q.preparation}`),
      Icon: Hammer,
    })
  if (q.horizon)
    rows.push({
      key: 'horizon',
      label: t('horizon.label'),
      value: tr(`horizon.${q.horizon}`),
      Icon: Telescope,
    })
  if (q.target_date) {
    const date = new Date(`${q.target_date}T12:00:00Z`)
    const value =
      q.target_precision === 'year'
        ? String(date.getUTCFullYear())
        : q.target_precision === 'month'
          ? format.dateTime(date, { month: 'long', year: 'numeric' })
          : q.target_precision === 'season'
            ? `${tr(`seasonOfDate.${seasonOf(date.getUTCMonth())}`)} ${date.getUTCFullYear()}`
            : format.dateTime(date, { day: 'numeric', month: 'long', year: 'numeric' })
    rows.push({ key: 'date', label: tr('targetDate'), value, Icon: CalendarDays })
  }
  if (q.energy)
    rows.push({
      key: 'energy',
      label: t('energy.label'),
      value: tr(`energy.${q.energy}`),
      Icon: BatteryMedium,
    })
  if (q.budget_level) {
    const range =
      q.budget_min_cents !== null && q.budget_max_cents !== null
        ? ` · ${tr('budget.range', { min: q.budget_min_cents / 100, max: q.budget_max_cents / 100 })}`
        : ''
    rows.push({
      key: 'budget',
      label: t('budget.label'),
      value: `${tr(`budget.${q.budget_level}`)}${range}`,
      Icon: Wallet,
    })
  }
  if (q.time_estimate)
    rows.push({
      key: 'time',
      label: t('time.label'),
      value: tr(`time.${q.time_estimate}`),
      Icon: Clock,
    })
  if (q.mode)
    rows.push({ key: 'mode', label: t('mode.label'), value: tr(`mode.${q.mode}`), Icon: Users })
  if (q.seasons.length > 0)
    rows.push({
      key: 'seasons',
      label: t('season.label'),
      value: q.seasons.map((s) => tr(`season.${s}`)).join(', '),
      Icon: Sun,
    })
  if (q.place) rows.push({ key: 'place', label: tr('place.label'), value: q.place, Icon: MapPin })
  return rows
}
