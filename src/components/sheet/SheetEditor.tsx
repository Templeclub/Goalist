'use client'

import { useTranslations } from 'next-intl'
import { useId, useMemo, useState, type ReactNode } from 'react'
import type { Sender } from '@/features/autosave/patch-queue'
import { HttpError } from '@/features/autosave/patch-queue'
import { useAutosave } from '@/features/autosave/use-autosave'
import type { GoalPatch, SmartPatch } from '@/features/goals/api-schema'
import { goalSender } from '@/features/goals/client-api'
import { computeCompleteness, type SheetSection } from '@/features/goals/completeness'
import { richDocToText, type RichDoc } from '@/features/goals/rich-text'
import { goalStatuses, valueKeys, type GoalStatus, type ValueKey } from '@/features/goals/schema'
import type { FlowSection } from '@/features/goals/sections'
import type { CategoryItem, GoalQualify } from '@/features/goals/queries'
import { LIMITS } from '@/config/app'
import { useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import { GoalCard } from '../goal/GoalCard'
import { AutoGrowTextarea } from '../ui/AutoGrowTextarea'
import { ChipGroup } from '../ui/ChipGroup'
import { CompletenessMeter } from '../ui/CompletenessMeter'
import { Field, inputClass } from '../ui/Field'
import type { SaveState } from '../ui/SaveIndicator'
import { CategoryPicker } from './CategoryPicker'
import { FlowShell, type SectionState } from './FlowShell'
import { PlanSection } from './PlanSection'
import { RichTextEditor } from './RichTextEditor'

export type SheetData = {
  id: string
  version: number
  title: string
  emoji: string | null
  status: GoalStatus
  descriptionDoc: RichDoc | null
  why: string | null
  firstStep: string | null
  valueKeys: ValueKey[]
  qualify: GoalQualify
  categoryItems: CategoryItem[]
  achievable: string | null
  statusNote: string | null
}

type ValuesPatch = { keys?: ValueKey[] }

const valuesSender =
  (goalId: string): Sender<ValuesPatch> =>
  async (patch, _base, _id, { keepalive }) => {
    const response = await fetch(`/api/goals/${goalId}/values`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keys: patch.keys ?? [] }),
      keepalive,
    })
    if (!response.ok) throw new HttpError(response.status)
    return response.json()
  }

const worst = (a: SaveState, b: SaveState): SaveState =>
  a === 'offline' || b === 'offline'
    ? 'offline'
    : a === 'saving' || b === 'saving'
      ? 'saving'
      : 'saved'

const textClass = cn(inputClass, 'min-h-28')

type SheetEditorProps = {
  data: SheetData
  section: FlowSection
  availableCategories?: CategoryItem[]
  /** Injected in stories and tests. */
  send?: Sender<GoalPatch>
  sendValues?: Sender<ValuesPatch>
  sendSmart?: Sender<SmartPatch>
  sendCategories?: Sender<{ ids?: string[] }>
}

/** The sheet, in four short sections, saved as you type (D-060). */
export function SheetEditor({
  data,
  section,
  availableCategories = [],
  send,
  sendValues,
  sendSmart,
  sendCategories,
}: SheetEditorProps) {
  const t = useTranslations('flow')
  const tGoal = useTranslations('goal')
  const router = useRouter()
  const id = useId()
  const [goal, setGoal] = useState(data)

  const autosave = useAutosave<GoalPatch>({
    send: send ?? goalSender(data.id),
    version: data.version,
    storageKey: `elan:pending:goal:${data.id}`,
  })
  const values = useAutosave<ValuesPatch>({
    send: sendValues ?? valuesSender(data.id),
    version: 1,
    storageKey: `elan:pending:values:${data.id}`,
  })

  const statusNote = useAutosave<{ note?: string | null }>({
    send: async (patch, _v, _id, { keepalive }) => {
      const response = await fetch(`/api/goals/${data.id}/status-note`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: patch.note ?? null, status: 'let_go' }),
        keepalive,
      })
      if (!response.ok) throw new HttpError(response.status)
      return response.json()
    },
    version: 1,
  })

  const set = <K extends keyof SheetData>(key: K, value: SheetData[K], patch?: GoalPatch) => {
    setGoal((g) => ({ ...g, [key]: value }))
    if (patch)
      for (const [field, v] of Object.entries(patch))
        autosave.set(field as keyof GoalPatch, v as never)
  }
  const text = (key: keyof SheetData, field: keyof GoalPatch) => (value: string) =>
    set(key, value as never, { [field]: value.trim() ? value : null } as GoalPatch)

  const completeness = useMemo(
    () =>
      computeCompleteness({
        description_text: richDocToText(goal.descriptionDoc),
        why: goal.why,
        first_step: goal.firstStep,
        ...goal.qualify,
        achievable: goal.achievable,
        valueCount: goal.valueKeys.length,
        categoryCount: goal.categoryItems.length,
      }),
    [goal],
  )

  const state = (missing: SheetSection): SectionState =>
    completeness.missing.includes(missing) ? 'empty' : 'done'
  const sectionStates: Record<FlowSection, SectionState> = {
    name: state('describe'),
    why: state('why'),
    smart: state('smart'),
    'first-steps': state('first_steps'),
  }

  const navigate = async (target: FlowSection | 'detail', options?: { snapshot?: boolean }) => {
    await Promise.all([autosave.flush(), values.flush()])
    // After the status itself, so the note lands on the right status change.
    await statusNote.flush()
    if (options?.snapshot) {
      void fetch(`/api/goals/${data.id}/revisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'section_exit' }),
      }).catch(() => {})
    }
    router.push(target === 'detail' ? `/goals/${data.id}` : `/goals/${data.id}/edit/${target}`)
    router.refresh()
  }

  const finish = async () => {
    await Promise.all([autosave.flush(), values.flush()])
    // After the status itself, so the note lands on the right status change.
    await statusNote.flush()
    await fetch(`/api/goals/${data.id}/revisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'review' }),
    }).catch(() => {})
    router.push(`/goals/${data.id}`)
    router.refresh()
  }

  const first = goal.categoryItems[0]
  const preview = (
    <>
      <GoalCard
        title={goal.title}
        emoji={goal.emoji}
        categories={first?.key ? [first.key] : []}
        status={goal.status}
        horizon={goal.qualify.horizon}
        preparation={goal.qualify.preparation}
        hue={first && !first.key ? first.hue : undefined}
      />
      <CompletenessMeter level={completeness.level} />
    </>
  )

  const question = (key: string, extra?: ReactNode) => (
    <div className="flex items-start justify-between gap-2">
      <h1 className="font-display text-xl font-bold tracking-[-0.005em]">{t(key as never)}</h1>
      {extra}
    </div>
  )

  return (
    <FlowShell
      goalId={data.id}
      title={`${goal.emoji ? `${goal.emoji} ` : ''}${goal.title}`}
      section={section}
      sectionStates={sectionStates}
      saveState={worst(autosave.state, values.state)}
      preview={preview}
      onNavigate={(target, options) => void navigate(target, options)}
      onFinish={() => void finish()}
    >
      {section === 'name' && (
        <>
          {question('name.question')}
          <Field
            id={`${id}-title`}
            label={t('name.title')}
            help={{
              explanation: t('name.titleHelp'),
              example: { before: t('name.titleBefore'), after: t('name.titleAfter') },
            }}
            message={goal.title.trim() ? undefined : t('name.titleHelp')}
          >
            <AutoGrowTextarea
              id={`${id}-title`}
              value={goal.title}
              maxLength={LIMITS.titleMaxLength}
              onChange={(e) => {
                const value = e.target.value.replace(/\n/g, ' ')
                // A wish always keeps a title: an empty one is never sent.
                set('title', value, value.trim() ? { title: value.trim() } : undefined)
              }}
              className={cn(inputClass, 'font-display text-xl')}
            />
          </Field>
          <Field id={`${id}-emoji`} label={t('name.emoji')} hint={t('name.emojiHint')} optional>
            <input
              id={`${id}-emoji`}
              value={goal.emoji ?? ''}
              maxLength={16}
              aria-describedby={`${id}-emoji-hint`}
              onChange={(e) =>
                set('emoji', e.target.value, { emoji: e.target.value.trim() || null })
              }
              className={cn(inputClass, 'w-24 text-center text-2xl')}
            />
          </Field>
          <CategoryPicker
            goalId={data.id}
            categories={availableCategories}
            selectedIds={goal.categoryItems.map((c) => c.id)}
            onChange={(items) => setGoal((g) => ({ ...g, categoryItems: items }))}
            send={sendCategories}
          />
          <Field
            id={`${id}-description`}
            label={t('name.description')}
            optional
            help={{
              explanation: t('name.descriptionHelp'),
              example: {
                before: t('name.descriptionBefore'),
                after: t('name.descriptionAfter'),
              },
            }}
          >
            <span id={`${id}-description-label`} hidden>
              {t('name.description')}
            </span>
            <RichTextEditor
              id={`${id}-description`}
              labelledBy={`${id}-description-label`}
              value={goal.descriptionDoc}
              onChange={(doc) => set('descriptionDoc', doc, { description_doc: doc })}
              placeholder={t('name.descriptionPlaceholder')}
            />
          </Field>
        </>
      )}

      {section === 'why' && (
        <>
          <Field
            id={`${id}-why`}
            label={t('why.question')}
            optional
            help={{
              explanation: t('why.whyHelp'),
              example: { before: t('why.whyBefore'), after: t('why.whyAfter') },
            }}
            className="[&>div>label]:font-display [&>div>label]:text-xl [&>div>label]:font-bold"
          >
            <AutoGrowTextarea
              id={`${id}-why`}
              value={goal.why ?? ''}
              maxLength={4000}
              placeholder={t('why.whyPlaceholder')}
              onChange={(e) => text('why', 'why')(e.target.value)}
              className={textClass}
            />
          </Field>
          <ChipGroup
            type="multiple"
            legend={t('why.values')}
            description={t('why.valuesHint')}
            options={valueKeys.map((key) => ({ value: key, label: tGoal(`values.${key}`) }))}
            value={goal.valueKeys}
            onChange={(keys) => {
              setGoal((g) => ({ ...g, valueKeys: keys }))
              values.set('keys', keys)
            }}
          />
        </>
      )}

      {section === 'smart' && (
        <PlanSection
          goalId={data.id}
          qualify={goal.qualify}
          achievable={goal.achievable}
          send={sendSmart}
          onAchievableChange={(achievable) => setGoal((g) => ({ ...g, achievable }))}
          onPatch={(patch) => {
            setGoal((g) => ({
              ...g,
              qualify: { ...g.qualify, ...(patch as Partial<GoalQualify>) },
            }))
            for (const [field, v] of Object.entries(patch))
              autosave.set(field as keyof GoalPatch, v as never)
          }}
        />
      )}

      {section === 'first-steps' && (
        <>
          {question('firstSteps.question')}
          <Field
            id={`${id}-first`}
            label={t('firstSteps.firstStep')}
            optional
            help={{
              explanation: t('firstSteps.firstStepHelp'),
              example: {
                before: t('firstSteps.firstStepBefore'),
                after: t('firstSteps.firstStepAfter'),
              },
            }}
          >
            <AutoGrowTextarea
              id={`${id}-first`}
              value={goal.firstStep ?? ''}
              maxLength={300}
              placeholder={t('firstSteps.firstStepPlaceholder')}
              onChange={(e) => text('firstStep', 'first_step')(e.target.value.replace(/\n/g, ' '))}
              className={cn(inputClass, 'border-accent bg-accent-soft/40 font-display text-lg')}
            />
          </Field>
          <ChipGroup
            type="single"
            legend={t('firstSteps.status')}
            options={goalStatuses.map((s) => ({ value: s, label: tGoal(`statuses.${s}`) }))}
            value={goal.status}
            onChange={(status) => {
              if (status) set('status', status, { status })
            }}
          />
          {goal.status === 'let_go' && (
            <Field id={`${id}-letgo`} label={t('firstSteps.letGoNote')}>
              <AutoGrowTextarea
                id={`${id}-letgo`}
                value={goal.statusNote ?? ''}
                maxLength={500}
                placeholder={t('firstSteps.letGoNotePlaceholder')}
                onChange={(e) => {
                  setGoal((g) => ({ ...g, statusNote: e.target.value }))
                  statusNote.set('note', e.target.value.trim() || null)
                }}
                className={textClass}
              />
            </Field>
          )}
        </>
      )}
    </FlowShell>
  )
}
