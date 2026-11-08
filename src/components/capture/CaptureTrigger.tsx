'use client'

import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCapture } from './CaptureProvider'

/** The big "J'aimerais…" field-button on the home screen. */
export function CaptureTrigger() {
  const t = useTranslations('home.capture')
  const { open } = useCapture()
  return (
    <button
      type="button"
      onClick={() => open()}
      aria-keyshortcuts="N"
      className="flex min-h-17 w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-line-strong bg-card py-0 pr-3 pl-5 text-left shadow-card transition-[border-color] hover:border-ink-3"
    >
      <span className="font-display text-[1.375rem] text-ink-3 italic">{t('cta')}</span>
      <span
        aria-hidden="true"
        className="grid size-11 place-items-center rounded-full bg-accent text-ink-on-accent"
      >
        <Plus className="size-5 stroke-2" />
      </span>
    </button>
  )
}

/** Example wishes in empty states: open the capture prefilled. */
export function CaptureExamples() {
  const t = useTranslations('home.empty.examples')
  const tState = useTranslations('common.emptyState')
  const { open } = useCapture()
  const examples = [t('stars'), t('bread'), t('letter')]
  return (
    <div className="flex flex-wrap justify-center gap-2 pt-2">
      {examples.map((example) => (
        <button
          key={example}
          type="button"
          onClick={() => open(example)}
          aria-label={tState('tryExample', { example })}
          className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border border-dashed border-line-strong bg-card px-4 text-[0.9375rem] text-ink-2 hover:border-ink-3"
        >
          {`+ ${example}`}
        </button>
      ))}
    </div>
  )
}
