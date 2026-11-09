'use client'

import { useTranslations } from 'next-intl'
import { useId, useState } from 'react'
import type { Sender } from '@/features/autosave/patch-queue'
import { HttpError } from '@/features/autosave/patch-queue'
import { useAutosave } from '@/features/autosave/use-autosave'
import type { GoalPatch, SmartPatch } from '@/features/goals/api-schema'
import type { GoalQualify } from '@/features/goals/queries'
import {
  budgetLevels,
  horizons,
  preparations,
  type BudgetLevel,
  type Horizon,
  type Preparation,
  type Season,
} from '@/features/goals/schema'
import { cn } from '@/lib/cn'
import { AutoGrowTextarea } from '../ui/AutoGrowTextarea'
import { ChipGroup } from '../ui/ChipGroup'
import { Field, inputClass } from '../ui/Field'
import { StepSelector } from '../ui/StepSelector'

/** The four seasons offered here; other contexts stored earlier are kept untouched. */
export const yearSeasons = ['spring', 'summer', 'autumn', 'winter'] as const satisfies Season[]

export const smartSender =
  (goalId: string): Sender<SmartPatch> =>
  async (patch, _v, _id, { keepalive }) => {
    const response = await fetch(`/api/goals/${goalId}/smart`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
      keepalive,
    })
    if (!response.ok) throw new HttpError(response.status)
    return response.json()
  }

type PlanSectionProps = {
  goalId: string
  qualify: GoalQualify
  achievable: string | null
  /** Goal fields go through the sheet's main autosave queue. */
  onPatch: (patch: GoalPatch) => void
  onAchievableChange: (value: string) => void
  /** Injected in stories and tests. */
  send?: Sender<SmartPatch>
}

/**
 * Section 3 — "Préciser": what it takes (SMART A, preparation, budget) and when
 * (SMART T: horizon and season). S is the title, R the why (D-060).
 */
export function PlanSection({
  goalId,
  qualify: initial,
  achievable: initialAchievable,
  onPatch,
  onAchievableChange,
  send,
}: PlanSectionProps) {
  const t = useTranslations('flow.plan')
  const tGoal = useTranslations('goal')
  const id = useId()
  const [q, setQ] = useState(initial)
  const [achievable, setAchievable] = useState(initialAchievable ?? '')
  const smart = useAutosave<SmartPatch>({
    send: send ?? smartSender(goalId),
    version: 1,
    storageKey: `elan:pending:smart:${goalId}`,
  })

  const set = <K extends keyof GoalQualify>(key: K, value: GoalQualify[K]) => {
    setQ((current) => ({ ...current, [key]: value }))
    onPatch({ [key]: value } as GoalPatch)
  }

  const otherSeasons = q.seasons.filter((s) => !(yearSeasons as readonly string[]).includes(s))

  return (
    <div className="grid gap-8">
      <div className="grid gap-2">
        <h1 className="font-display text-xl font-bold">{t('question')}</h1>
        <p className="text-[0.9375rem] text-ink-2">{t('intro')}</p>
      </div>

      <section aria-labelledby={`${id}-what`} className="grid gap-5">
        <h2 id={`${id}-what`} className="label-caps">
          {t('whatTitle')}
        </h2>
        <Field
          id={`${id}-achievable`}
          label={t('achievable')}
          optional
          help={{
            explanation: t('achievableHelp'),
            example: { before: t('achievableBefore'), after: t('achievableAfter') },
          }}
        >
          <AutoGrowTextarea
            id={`${id}-achievable`}
            value={achievable}
            maxLength={1000}
            placeholder={t('achievablePlaceholder')}
            onChange={(e) => {
              setAchievable(e.target.value)
              onAchievableChange(e.target.value)
              smart.set('achievable', e.target.value.trim() ? e.target.value : null)
            }}
            className={cn(inputClass, 'min-h-24')}
          />
        </Field>
        <StepSelector
          legend={tGoal('preparation.label')}
          steps={preparations.map((p) => ({
            value: p,
            label: tGoal(`preparation.${p}`).split(',')[0]!,
            description: tGoal(`preparation.${p}`),
          }))}
          value={q.preparation as Preparation | null}
          onChange={(v) => set('preparation', v)}
        />
        <ChipGroup
          type="single"
          legend={tGoal('budget.label')}
          options={budgetLevels.map((b) => ({ value: b, label: tGoal(`budget.${b}`) }))}
          value={q.budget_level as BudgetLevel | null}
          onChange={(v) => set('budget_level', v)}
        />
      </section>

      <section aria-labelledby={`${id}-when`} className="grid gap-5">
        <h2 id={`${id}-when`} className="label-caps">
          {t('whenTitle')}
        </h2>
        <ChipGroup
          type="single"
          legend={tGoal('horizon.label')}
          description={t('horizonHint')}
          options={horizons.map((h) => ({ value: h, label: tGoal(`horizon.${h}`) }))}
          value={q.horizon as Horizon | null}
          onChange={(v) => set('horizon', v)}
        />
        <ChipGroup
          type="multiple"
          legend={t('season')}
          description={t('seasonHint')}
          options={yearSeasons.map((s) => ({ value: s, label: tGoal(`season.${s}`) }))}
          value={q.seasons.filter((s): s is (typeof yearSeasons)[number] =>
            (yearSeasons as readonly string[]).includes(s),
          )}
          onChange={(v) => set('seasons', [...v, ...otherSeasons])}
        />
      </section>
    </div>
  )
}
