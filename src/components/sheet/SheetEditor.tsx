'use client'

import { useTranslations } from 'next-intl'
import { useId, useMemo, useState, type ReactNode } from 'react'
import type { Sender } from '@/features/autosave/patch-queue'
import { HttpError } from '@/features/autosave/patch-queue'
import { useAutosave } from '@/features/autosave/use-autosave'
import type { GoalPatch } from '@/features/goals/api-schema'
import { goalSender } from '@/features/goals/client-api'
import { computeCompleteness } from '@/features/goals/completeness'
import { richDocToText, type RichDoc } from '@/features/goals/rich-text'
import { goalStatuses, valueKeys, type GoalStatus, type ValueKey } from '@/features/goals/schema'
import type { FlowSection } from '@/features/goals/sections'
import type { customHues } from '@/features/goals/palette'
import { LIMITS } from '@/config/app'
import { useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import { GoalCard } from '../goal/GoalCard'
import { AutoGrowTextarea } from '../ui/AutoGrowTextarea'
import { ChipGroup } from '../ui/ChipGroup'
import { CompletenessMeter } from '../ui/CompletenessMeter'
import { Field, inputClass } from '../ui/Field'
import type { SaveState } from '../ui/SaveIndicator'
import { FlowShell, type SectionState } from './FlowShell'
import { HuePicker } from './HuePicker'
import { MediaEditor, type MediaItem } from './MediaEditor'
import { RichTextEditor } from './RichTextEditor'

type Hue = (typeof customHues)[number]

export type SheetData = {
  id: string
  version: number
  title: string
  tagline: string | null
  emoji: string | null
  hue: Hue | null
  categories: string[]
  status: GoalStatus
  descriptionDoc: RichDoc | null
  imaginedOutcome: string | null
  whereWith: string | null
  why: string | null
  benefits: string | null
  firstStep: string | null
  notes: string | null
  valueKeys: ValueKey[]
  customValues: string[]
  media: MediaItem[]
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
  canUploadImages: boolean
  /** Injected in stories and tests. */
  send?: Sender<GoalPatch>
  sendValues?: Sender<ValuesPatch>
}

/** The full sheet, section by section, saved as you type. */
export function SheetEditor({
  data,
  section,
  canUploadImages,
  send,
  sendValues,
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
        imagined_outcome: goal.imaginedOutcome,
        where_with: goal.whereWith,
        why: goal.why,
        benefits: goal.benefits,
        first_step: goal.firstStep,
        notes: goal.notes,
        valueCount: goal.valueKeys.length + goal.customValues.length,
        categoryCount: goal.categories.length,
      }),
    [goal],
  )

  const sectionStates: Record<FlowSection, SectionState> = {
    name: goal.tagline || goal.emoji ? 'done' : 'empty',
    describe: completeness.missing.includes('describe') ? 'empty' : 'done',
    why: completeness.missing.includes('why') ? 'empty' : 'done',
    'first-steps': completeness.missing.includes('first_steps') ? 'empty' : 'done',
    review: 'empty',
  }

  const navigate = async (target: FlowSection | 'detail', options?: { snapshot?: boolean }) => {
    await Promise.all([autosave.flush(), values.flush()])
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
    await fetch(`/api/goals/${data.id}/revisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'review' }),
    }).catch(() => {})
    router.push(`/goals/${data.id}`)
    router.refresh()
  }

  const preview = (
    <>
      <GoalCard
        title={goal.title}
        tagline={goal.tagline}
        emoji={goal.emoji}
        categories={goal.categories as never}
        status={goal.status}
        hue={goal.hue}
      />
      <CompletenessMeter level={completeness.level} />
    </>
  )

  const question = (key: string, extra?: ReactNode) => (
    <div className="flex items-start justify-between gap-2">
      <h1 className="font-display text-xl font-medium tracking-[-0.005em]">{t(key as never)}</h1>
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
          <Field
            id={`${id}-tagline`}
            label={t('name.tagline')}
            optional
            help={{
              explanation: t('name.taglineHelp'),
              example: { before: t('name.taglineBefore'), after: t('name.taglineAfter') },
            }}
          >
            <AutoGrowTextarea
              id={`${id}-tagline`}
              value={goal.tagline ?? ''}
              maxLength={LIMITS.taglineMaxLength}
              placeholder={t('name.taglinePlaceholder')}
              onChange={(e) => {
                const value = e.target.value.replace(/\n/g, ' ')
                set('tagline', value, { tagline: value.trim() || null })
              }}
              className={cn(inputClass, 'font-display italic')}
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
          <HuePicker
            legend={t('name.hue')}
            value={goal.hue}
            onChange={(hue) => set('hue', hue, { hue })}
          />
        </>
      )}

      {section === 'describe' && (
        <>
          {question('describe.question')}
          <Field
            id={`${id}-description`}
            label={t('describe.description')}
            optional
            help={{
              explanation: t('describe.descriptionHelp'),
              example: {
                before: t('describe.descriptionBefore'),
                after: t('describe.descriptionAfter'),
              },
            }}
          >
            <span id={`${id}-description-label`} hidden>
              {t('describe.description')}
            </span>
            <RichTextEditor
              id={`${id}-description`}
              labelledBy={`${id}-description-label`}
              value={goal.descriptionDoc}
              onChange={(doc) => set('descriptionDoc', doc, { description_doc: doc })}
              placeholder={t('describe.descriptionPlaceholder')}
              prompts={[
                t('describe.promptList.draws'),
                t('describe.promptList.after'),
                t('describe.promptList.with'),
              ]}
            />
          </Field>
          <Field
            id={`${id}-outcome`}
            label={t('describe.outcome')}
            optional
            help={{
              explanation: t('describe.outcomeHelp'),
              example: { before: t('describe.outcomeBefore'), after: t('describe.outcomeAfter') },
            }}
          >
            <AutoGrowTextarea
              id={`${id}-outcome`}
              value={goal.imaginedOutcome ?? ''}
              maxLength={4000}
              placeholder={t('describe.outcomePlaceholder')}
              onChange={(e) => text('imaginedOutcome', 'imagined_outcome')(e.target.value)}
              className={textClass}
            />
          </Field>
          <Field id={`${id}-where`} label={t('describe.whereWith')} optional>
            <AutoGrowTextarea
              id={`${id}-where`}
              value={goal.whereWith ?? ''}
              maxLength={1000}
              placeholder={t('describe.whereWithPlaceholder')}
              onChange={(e) => text('whereWith', 'where_with')(e.target.value)}
              className={inputClass}
            />
          </Field>
          <MediaEditor goalId={data.id} initial={goal.media} canUploadImages={canUploadImages} />
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
            className="[&>div>label]:font-display [&>div>label]:text-xl [&>div>label]:font-medium"
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
            legend={t('why.benefits')}
            description={t('why.benefitsHint')}
            options={valueKeys.map((key) => ({ value: key, label: tGoal(`values.${key}`) }))}
            value={goal.valueKeys}
            onChange={(keys) => {
              setGoal((g) => ({ ...g, valueKeys: keys }))
              values.set('keys', keys)
            }}
          />
          <Field id={`${id}-benefits`} label={t('why.benefitsMore')}>
            <AutoGrowTextarea
              id={`${id}-benefits`}
              value={goal.benefits ?? ''}
              maxLength={4000}
              placeholder={t('why.benefitsPlaceholder')}
              onChange={(e) => text('benefits', 'benefits')(e.target.value)}
              className={inputClass}
            />
          </Field>
        </>
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
          <Field id={`${id}-notes`} label={t('firstSteps.notes')} optional>
            <AutoGrowTextarea
              id={`${id}-notes`}
              value={goal.notes ?? ''}
              maxLength={10000}
              placeholder={t('firstSteps.notesPlaceholder')}
              onChange={(e) => text('notes', 'notes')(e.target.value)}
              className={textClass}
            />
          </Field>
        </>
      )}

      {section === 'review' && (
        <>
          {question('review.question')}
          <div className="lg:hidden">{preview}</div>
          <ChipGroup
            type="single"
            legend={t('review.status')}
            options={goalStatuses.map((s) => ({ value: s, label: tGoal(`statuses.${s}`) }))}
            value={goal.status}
            onChange={(status) => {
              if (status) set('status', status, { status })
            }}
          />
          <ChipGroup
            type="single"
            legend={t('review.visibility')}
            description={t('review.visibilityHint')}
            options={[
              { value: 'private', label: tGoal('visibility.private') },
              {
                value: 'circle',
                label: tGoal('visibility.circle'),
                disabled: true,
                note: t('review.soon'),
              },
              {
                value: 'community',
                label: tGoal('visibility.community'),
                disabled: true,
                note: t('review.soon'),
              },
            ]}
            value="private"
            onChange={() => {}}
          />
          {completeness.missing.some((m) => ['describe', 'why', 'first_steps'].includes(m)) && (
            <div className="grid gap-2 rounded-card border-[1.5px] border-dashed border-line-strong p-4">
              <p className="label-caps">{t('review.toComplete')}</p>
              <div className="flex flex-wrap gap-2">
                {(['describe', 'why', 'first-steps'] as const)
                  .filter((s) => sectionStates[s] === 'empty')
                  .map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void navigate(s)}
                      className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-dashed border-line-strong bg-card px-4 text-[0.9375rem] text-ink-2 hover:border-ink-3"
                    >
                      {`+ ${t(`sections.${s}`)}`}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </FlowShell>
  )
}
