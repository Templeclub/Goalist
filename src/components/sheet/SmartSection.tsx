'use client'

import { Copy } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useId, useState } from 'react'
import type { Sender } from '@/features/autosave/patch-queue'
import { HttpError } from '@/features/autosave/patch-queue'
import { useAutosave } from '@/features/autosave/use-autosave'
import type { SmartPatch } from '@/features/goals/api-schema'
import { assembleSmartSentence, smartFilledCount } from '@/features/goals/smart'
import type { SmartAnswersRow } from '@/features/goals/queries'
import { frMessages } from '@/i18n/messages'
import { cn } from '@/lib/cn'
import { AutoGrowTextarea } from '../ui/AutoGrowTextarea'
import { Button } from '../ui/Button'
import { Field, inputClass } from '../ui/Field'
import type { SaveState } from '../ui/SaveIndicator'

const steps = ['specific', 'measurable', 'achievable', 'relevant', 'time_bound'] as const
type Step = (typeof steps)[number]

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

type SmartSectionProps = {
  goalId: string
  initial: SmartAnswersRow
  onSaveState?: (state: SaveState) => void
  send?: Sender<SmartPatch>
}

/** Section 4 — guided SMART, five short questions, one at a time (docs/screens/04). */
export function SmartSection({ goalId, initial, send }: SmartSectionProps) {
  const t = useTranslations('flow.smart')
  const id = useId()
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState(initial)
  const autosave = useAutosave<SmartPatch>({
    send: send ?? smartSender(goalId),
    version: 1,
    storageKey: `elan:pending:smart:${goalId}`,
  })
  const [copied, setCopied] = useState(false)
  // The template strings are part of the catalogue; the client only has French for now.
  const templates = frMessages.flow.smart.templates

  const update = (field: keyof SmartAnswersRow, value: string) => {
    const next = { ...answers, [field]: value }
    const patch: SmartPatch = { [field]: value.trim() ? value : null }
    if (!next.assembled_edited) {
      next.assembled_sentence = assembleSmartSentence(next, templates) || null
      patch.assembled_sentence = next.assembled_sentence
    }
    setAnswers(next)
    for (const [k, v] of Object.entries(patch)) autosave.set(k as keyof SmartPatch, v as never)
  }

  const count = smartFilledCount(answers)
  const done = index === steps.length
  const step: Step | undefined = steps[index]

  const textField = (
    field: keyof SmartAnswersRow,
    label: string,
    placeholder: string,
    help?: { explanation: string; example: { before: string; after: string } },
  ) => (
    <Field id={`${id}-${field}`} label={label} optional help={help}>
      <AutoGrowTextarea
        id={`${id}-${field}`}
        value={(answers[field] as string | null) ?? ''}
        maxLength={
          field === 'obstacle' || field === 'if_then' || field === 'time_bound' ? 500 : 1000
        }
        placeholder={placeholder}
        onChange={(e) => update(field, e.target.value)}
        className={cn(inputClass, 'min-h-24')}
      />
    </Field>
  )

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="font-display text-xl font-medium">{t('question')}</h1>
        <p className="text-[0.9375rem] text-ink-2">{t('intro')}</p>
      </div>
      <ol
        aria-label={done ? t('sentence') : t('step', { current: index + 1 })}
        className="flex gap-1.5"
      >
        {steps.map((s, i) => (
          <li key={s}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-current={i === index ? 'step' : undefined}
              className={cn(
                'grid min-h-11 min-w-11 cursor-pointer place-items-center rounded-full border text-sm font-bold',
                i === index
                  ? 'border-accent bg-accent text-ink-on-accent'
                  : (answers[s] ?? '').trim()
                    ? 'border-accent text-accent-strong'
                    : 'border-line-strong text-ink-3',
              )}
            >
              <span aria-hidden="true">{t(`letters.${s}`).charAt(0)}</span>
              <span className="sr-only">{t(`letters.${s}`)}</span>
            </button>
          </li>
        ))}
      </ol>

      {step && (
        <div key={step} className="grid animate-rise gap-5">
          <p className="label-caps">{t(`letters.${step}`)}</p>
          {textField(step, t(`questions.${step}`), t(`placeholders.${step}`), {
            explanation: t(`help.${step}`),
            example: { before: t(`before.${step}`), after: t(`after.${step}`) },
          })}
          {step === 'achievable' && (
            <>
              {textField('obstacle', t('obstacle'), t('obstaclePlaceholder'))}
              {textField('if_then', t('ifThen'), t('ifThenPlaceholder'))}
            </>
          )}
        </div>
      )}

      {done && (
        <div className="grid animate-rise gap-3">
          <Field id={`${id}-sentence`} label={t('sentence')} hint={t('sentenceHint')}>
            <AutoGrowTextarea
              id={`${id}-sentence`}
              value={answers.assembled_sentence ?? ''}
              maxLength={1500}
              aria-describedby={`${id}-sentence-hint`}
              onChange={(e) => {
                setAnswers({
                  ...answers,
                  assembled_sentence: e.target.value,
                  assembled_edited: true,
                })
                autosave.set('assembled_sentence', e.target.value.trim() ? e.target.value : null)
                autosave.set('assembled_edited', true)
              }}
              className={cn(inputClass, 'font-display text-lg')}
            />
          </Field>
          <p className="text-[0.9375rem] text-ink-2" aria-live="polite">
            {t('clarity', { count })}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                void navigator.clipboard
                  ?.writeText(answers.assembled_sentence ?? '')
                  .then(() => setCopied(true))
                  .catch(() => {})
              }}
            >
              <Copy aria-hidden="true" className="size-4" />
              {copied ? t('copied') : t('copy')}
            </Button>
            {answers.assembled_edited && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const sentence = assembleSmartSentence(answers, templates) || null
                  setAnswers({ ...answers, assembled_sentence: sentence, assembled_edited: false })
                  autosave.set('assembled_sentence', sentence)
                  autosave.set('assembled_edited', false)
                }}
              >
                {t('reassemble')}
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={index === 0}
          onClick={() => setIndex(index - 1)}
        >
          {t('previous')}
        </Button>
        {!done && (
          <Button variant="secondary" size="sm" onClick={() => setIndex(index + 1)}>
            {index === steps.length - 1 ? t('toSentence') : t('next')}
          </Button>
        )}
      </div>
    </div>
  )
}
